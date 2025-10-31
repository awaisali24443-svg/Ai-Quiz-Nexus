import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Since we are using ES modules, __dirname is not available directly. This is the workaround.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// In-memory user store for demonstration purposes.
// In a real application, you would use a persistent database like PostgreSQL, MongoDB, etc.
const users = [
    { name: 'Awais', email: 'test@example.com', password: 'password123' }
];

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// --- API Routes for Authentication ---

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
        return res.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required.' });
    }

    if (users.find(user => user.email === email)) {
        return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    
    // IMPORTANT: In a real-world application, ALWAYS hash passwords before saving them.
    const newUser = { name, email, password };
    users.push(newUser);

    console.log('User registered. Current users:', users);
    
    // Return the new user object (excluding the password)
    res.status(201).json({ name: newUser.name, email: newUser.email });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    
    // IMPORTANT: In a real-world application, use a secure method to compare hashed passwords.
    if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    
    // Return user data (excluding the password)
    res.status(200).json({ name: user.name, email: user.email });
});


// A catch-all route to serve the index.html for any request that doesn't match a static file.
// This is essential for single-page applications with client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
