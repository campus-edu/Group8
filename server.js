const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// FIX: Serve static files from the CURRENT folder (root), not 'public'
app.use(express.static(__dirname));

// --- In-Memory Database ---
let users = [];

// --- Routes ---

// 1. Serve the Frontend
app.get('/', (req, res) => {
    // FIX: Look for index.html in the CURRENT folder
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API: Get all current data
app.get('/api/data', (req, res) => {
    res.json(users);
});

// 3. API: Submit a preference
app.post('/api/submit', (req, res) => {
    const newUser = req.body;
    
    if (!newUser.name || newUser.choices.length !== 3) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // Update existing user or add new
    const existingIndex = users.findIndex(u => u.name === newUser.name);
    if (existingIndex >= 0) {
        users[existingIndex] = newUser; 
    } else {
        users.push(newUser);
    }

    res.json({ success: true, users });
});

// 4. API: Reset all data
app.post('/api/reset', (req, res) => {
    users = []; 
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
