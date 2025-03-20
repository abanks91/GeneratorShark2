
// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({ origin: 'https://generatorshark.vercel.app', credentials: true }));
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    res.send('GeneratorShark Backend is Running!');
});

// Health check route
// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running', uptime: process.uptime() });
});

// Route for user signup (Placeholder, needs DB integration)
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    res.json({ message: 'User signed up successfully!' });
});

// Route for meme generation (Placeholder)
app.get('/api/meme', (req, res) => {
    res.json({ meme: 'Here is a generated meme URL' });
});

// Route for text generation (Placeholder)
// Route for AI-generated text (Allows both GET and POST)
app.get('/api/text', (req, res) => {
    res.json({ text: "AI-generated text response" });
});

app.post('/api/text', (req, res) => {
    res.json({ text: "AI-generated text response" });
});

// Route for video generation (Placeholder)
app.post('/api/video', (req, res) => {
    res.json({ video: 'AI-generated video URL' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// checking to confirm