
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

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Define the root route before serving static files
// This ensures that visiting the base URL serves the login page
// instead of the default index.html from the static middleware.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname))); // Serve static files

// Helper function to read users from JSON file
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Helper function to write users to JSON file
async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}


// --- API Routes ---

// Register a new user
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

    if (users.find(user => user.email === email)) {
        return res.status(409).json({ message: 'This email is already registered. Please login instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPassword };
    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ username: newUser.username, email: newUser.email });
});


// Login a user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. Please try again or sign up.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials. Please try again or sign up.' });
    }

    res.status(200).json({ username: user.username, email: user.email });
});

// Generate Quiz with Gemini
app.post('/api/generate-quiz', async (req, res) => {
    const { topic, level } = req.body;
    const questionsPerQuiz = 10;
    const totalLevels = 30;

    if (!topic || !level) {
        return res.status(400).json({ message: 'Topic and level are required.' });
    }

    let difficulty;
    if (level <= 10) {
        difficulty = 'Easy';
    } else if (level <= 20) {
        difficulty = 'Intermediate';
    } else {
        difficulty = 'Expert';
    }

    const quizSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                description: 'An array of quiz question objects.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        q: {
                            type: Type.STRING,
                            description: 'The question text.'
                        },
                        options: {
                            type: Type.ARRAY,
                            description: 'An array of 4 strings representing the possible answers.',
                            items: { type: Type.STRING }
                        },
                        answer: {
                            type: Type.STRING,
                            description: 'The correct answer, which must exactly match one of the items in the options array.'
                        }
                    },
                    required: ['q', 'options', 'answer']
                }
            }
        },
        required: ['questions']
    };

    const prompt = `Generate a quiz with ${questionsPerQuiz} multiple-choice questions on the topic of '${topic}'. The difficulty should be '${difficulty}', appropriate for level ${level} out of ${totalLevels}. A higher level means a harder quiz. Each question must have exactly 4 options. One of the options must be the correct answer. Provide the response as a JSON object adhering to the provided schema.`;

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
        
        // Basic validation
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("AI returned invalid or empty quiz data.");
        }

        res.status(200).json(quizData);

    } catch (error) {
        console.error('Error generating quiz with Gemini:', error);
        res.status(500).json({ message: 'Failed to generate quiz. The AI might be busy, please try again later.' });
    }
});


// --- Serve HTML files ---

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Catch-all to redirect to login for the root or any other path
app.get('*', (req, res, next) => {
    // This allows static file requests (like css, js) to pass through
    if (path.extname(req.path).length > 0) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

async function startServer() {
    try {
        // Ensure the data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        app.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
