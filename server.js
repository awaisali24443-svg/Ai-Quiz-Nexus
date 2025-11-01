
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Serve static files first
app.use(express.static(path.join(__dirname)));
// Increased payload size limit to accommodate Base64 profile pictures
app.use(express.json({ limit: '5mb' }));


async function readUsers() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeUsers(users) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// --- Specific Page Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// --- API Routes ---

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one letter and one number.' });
    }

    const users = await readUsers();

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ message: 'This email is already registered. Please login instead.' });
    }
    
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ message: 'This username is already taken. Please choose another one.' });
    }
    
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        userId, 
        username, 
        email, 
        password: hashedPassword, 
        profilePicture: '' 
    };
    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ 
        userId: newUser.userId, 
        username: newUser.username, 
        email: newUser.email, 
        profilePicture: newUser.profilePicture 
    });
});

app.post('/api/check-username', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    const users = await readUsers();
    const isTaken = users.some(user => user.username.toLowerCase() === username.toLowerCase());
    res.status(200).json({ isAvailable: !isTaken });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. Please try again or sign up.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials. Please try again or sign up.' });
    }

    res.status(200).json({ 
        userId: user.userId, 
        username: user.username, 
        email: user.email, 
        profilePicture: user.profilePicture 
    });
});

app.post('/api/update-profile', async (req, res) => {
    const { email, newUsername, newProfilePicture } = req.body;

    if (!email || !newUsername) {
        return res.status(400).json({ message: 'Email and new username are required.' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const usernameExists = users.some((user, index) => 
        index !== userIndex && user.username.toLowerCase() === newUsername.toLowerCase()
    );
    if (usernameExists) {
        return res.status(409).json({ message: 'This username is already taken. Please choose another one.' });
    }
    
    users[userIndex].username = newUsername;
    // newProfilePicture can be an empty string if they remove it, or null/undefined if not changing.
    if (newProfilePicture !== undefined) { 
        users[userIndex].profilePicture = newProfilePicture;
    }

    await writeUsers(users);

    const updatedUser = users[userIndex];
    res.status(200).json({ 
        userId: updatedUser.userId,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture
    });
});

app.post('/api/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long and contain at least one letter and one number.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect old password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await writeUsers(users);

    res.status(200).json({ message: 'Password changed successfully.' });
});

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
                    answer: { type: Type.STRING, description: 'The correct answer, which must exactly match one of the items in the options array.' }
                },
                required: ['q', 'options', 'answer']
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

    let prompt = `Generate a quiz with ${questionsPerQuiz} multiple-choice questions on the topic of '${topic}'. The difficulty should be '${difficulty}', appropriate for level ${level} out of ${totalLevels}. A higher level means a harder quiz. Each question must have exactly 4 options. One of the options must be the correct answer. Provide the response as a JSON object adhering to the provided schema.`;

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
    const TOPICS = [ 'Programming', 'World Knowledge', 'Biology', 'Space', 'Technology & AI', 'History', 'Mathematics', 'Science', 'Islamic Knowledge' ];
    const shuffledTopics = TOPICS.sort(() => 0.5 - Math.random());
    const selectedTopics = shuffledTopics.slice(0, 5).join(', ');

    let ai;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("🔴 Failed to initialize Gemini AI:", e.message);
        return res.status(503).json({ message: 'AI service could not be initialized. The API key might be invalid.' });
    }

    const prompt = `Generate a quiz with exactly ${questionsPerQuiz} multiple-choice questions. The questions should be a mix of general knowledge from the following topics: ${selectedTopics}. The difficulty should be mixed, from easy to medium. Each question must have exactly 4 options. One of the options must be the correct answer. Provide the response as a JSON object adhering to the provided schema.`;

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

app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

// Wildcard for client-side routing (catch-all)
// This should come after all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
