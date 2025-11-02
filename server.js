
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import { constants as fs_constants } from 'fs';
import { CHALLENGE_TOPICS_LIST } from './js/state.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Simple async mutex to prevent race conditions on file writes
class Mutex {
  constructor() {
    this._queue = [];
    this._locked = false;
  }
  acquire() {
    return new Promise(resolve => {
      this._queue.push(resolve);
      this._tryAcquire();
    });
  }
  _tryAcquire() {
    if (!this._locked && this._queue.length > 0) {
      this._locked = true;
      this._queue.shift()();
    }
  }
  release() {
    this._locked = false;
    this._tryAcquire();
  }
}
const fileLock = new Mutex();


// --- User Data Persistence ---
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
let users = [];

async function readUsers() {
    try {
        await fs.access(USERS_FILE, fs_constants.F_OK);
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        if (data) {
            try {
                users = JSON.parse(data);
            } catch(parseError) {
                console.error(`CRITICAL: Corrupted users.json file. Could not parse. ${parseError}. The file will not be overwritten.`);
                users = []; // Operate with no users in memory, but don't delete the corrupted file.
            }
        } else {
            users = [];
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            try {
                await fs.mkdir(DATA_DIR, { recursive: true });
                await fs.writeFile(USERS_FILE, '[]', 'utf-8');
                users = [];
            } catch (writeError) {
                console.error('Error creating data directory or users file:', writeError);
                users = [];
            }
        } else {
            console.error('Error reading users file:', error);
            users = [];
        }
    }
}

async function writeUsers() {
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing to users file:', error);
    }
}

// Initialize users from file
readUsers();

// Serve static files first. This will serve index.html for the root, and other .html files.
app.use(express.static(path.join(__dirname)));
// Use express.json middleware for parsing JSON bodies
app.use(express.json());


// --- API Routes for Authentication ---

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    await fileLock.acquire();
    try {
        await readUsers(); // Read the latest user data inside the lock
        if (users.find(u => u.username === username)) {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            id: `user-${Date.now()}`,
            username,
            password: hashedPassword
        };
        users.push(newUser);
        await writeUsers();
        res.status(201).json({ message: 'User registered successfully.' });
    } finally {
        fileLock.release();
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login successful.', user: userWithoutPassword });
});


// --- API Routes for AI Quiz Generation ---

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: 'An array of quiz question objects.',
            items: {
                type: Type.OBJECT,
                properties: {
                    q: { type: Type.STRING, description: 'The question text.' },
                    options: { type: Type.ARRAY, description: 'An array of 4 strings representing the possible answers.', items: { type: Type.STRING } },
                    answer: { type: Type.STRING, description: 'The correct answer, which must exactly match one of the items in the options array.' },
                    explanation: { type: Type.STRING, description: 'A brief, one-sentence explanation for why the correct answer is correct.' }
                },
                required: ['q', 'options', 'answer', 'explanation']
            }
        }
    },
    required: ['questions']
};


app.post('/api/generate-quiz', async (req, res) => {
    if (!process.env.API_KEY) {
        return res.status(503).json({ message: 'AI service is not configured on the server. Missing or invalid API_KEY.' });
    }

    const { topic, level, answeredQuestions } = req.body;
    const questionsPerQuiz = 10;
    const totalLevels = 30;

    if (!topic || !level) {
        return res.status(400).json({ message: 'Topic and level are required.' });
    }
    
    let ai;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("🔴 Failed to initialize Gemini AI:", e.message);
        return res.status(503).json({ message: 'AI service could not be initialized. The API key might be invalid.' });
    }

    let difficulty;
    if (level <= 10) difficulty = 'Easy';
    else if (level <= 20) difficulty = 'Intermediate';
    else difficulty = 'Expert';

    let prompt = `Generate a quiz with ${questionsPerQuiz} multiple-choice questions on the topic of '${topic}'. The difficulty should be '${difficulty}', appropriate for level ${level} out of ${totalLevels}. A higher level means a harder quiz. Each question must have exactly 4 options. One of the options must be the correct answer. For each question, also provide a brief, one-sentence explanation for why the answer is correct. Provide the response as a JSON object adhering to the provided schema.`;

    if (answeredQuestions && answeredQuestions.length > 0) {
        const questionsToAvoid = answeredQuestions.join('; ');
        prompt += ` CRITICAL: Avoid generating questions that are identical or very similar to the following, as the user has already answered them: "${questionsToAvoid}". Generate completely new and distinct questions.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("AI returned invalid or empty quiz data.");
        }

        res.status(200).json(quizData);

    } catch (error) {
        console.error('Error generating quiz with Gemini:', error);
        res.status(500).json({ message: `Failed to generate quiz. The AI might be busy. Details: ${error.message}` });
    }
});

app.post('/api/generate-time-challenge', async (req, res) => {
    if (!process.env.API_KEY) {
        return res.status(503).json({ message: 'AI service is not configured on the server. Missing or invalid API_KEY.' });
    }

    const questionsPerQuiz = 10;
    const shuffledTopics = CHALLENGE_TOPICS_LIST.sort(() => 0.5 - Math.random());
    const selectedTopics = shuffledTopics.slice(0, 5).join(', ');

    let ai;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("🔴 Failed to initialize Gemini AI:", e.message);
        return res.status(503).json({ message: 'AI service could not be initialized. The API key might be invalid.' });
    }

    const prompt = `Generate a quiz with exactly ${questionsPerQuiz} multiple-choice questions. The questions should be a mix of general knowledge from the following topics: ${selectedTopics}. The difficulty should be mixed, from easy to medium. Each question must have exactly 4 options. One of the options must be the correct answer. For each question, also provide a brief, one-sentence explanation for why the answer is correct. Provide the response as a JSON object adhering to the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== questionsPerQuiz) {
            throw new Error(`AI returned an invalid number of questions. Expected ${questionsPerQuiz}, got ${quizData.questions?.length || 0}.`);
        }

        res.status(200).json(quizData);

    } catch (error) {
        console.error('Error generating time challenge quiz with Gemini:', error);
        res.status(500).json({ message: `Failed to generate quiz. The AI might be busy. Details: ${error.message}` });
    }
});

app.post('/api/generate-hint', async (req, res) => {
    if (!process.env.API_KEY) {
        return res.status(503).json({ message: 'AI service is not configured.' });
    }
    const { question, options } = req.body;
    if (!question || !options) {
        return res.status(400).json({ message: 'Question and options are required.' });
    }

    let ai;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        return res.status(503).json({ message: 'AI service could not be initialized.' });
    }
    
    const prompt = `Provide a subtle, one-sentence hint for the following multiple-choice question. The hint should guide the user toward the correct answer without giving it away directly. Do not mention the correct answer in the hint. Question: "${question}" Options: ${options.join(', ')}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const hint = response.text.trim();
        res.status(200).json({ hint });
    } catch (error) {
        console.error('Error generating hint with Gemini:', error);
        res.status(500).json({ message: 'Failed to generate a hint.' });
    }
});

app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
