const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- In-Memory Database ---
// Note: If the Render server "sleeps" (free tier) or restarts, this data resets.
// For a class project, this is usually fine.
let users = [];

// --- Routes ---

// 1. Serve the Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. API: Get all current data
app.get('/api/data', (req, res) => {
    res.json(users);
});

// 3. API: Submit a preference
app.post('/api/submit', (req, res) => {
    const newUser = req.body;
    
    // Simple Validation
    if (!newUser.name || newUser.choices.length !== 3) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // Check if updating existing user (by name)
    const existingIndex = users.findIndex(u => u.name === newUser.name);
    if (existingIndex >= 0) {
        users[existingIndex] = newUser; // Update
    } else {
        users.push(newUser); // Add new
    }

    res.json({ success: true, users });
});

// 4. API: Reset all data (Leader only)
app.post('/api/reset', (req, res) => {
    users = []; // Wipe memory
    res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
