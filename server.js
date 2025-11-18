const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); 

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// --- IMPORTANT: Serve static files from the ROOT folder ---
app.use(express.static(__dirname));

// --- File-Based Database Logic ---
let users = [];

// Load data from file on startup
if (fs.existsSync(DATA_FILE)) {
    try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        users = JSON.parse(fileData);
        console.log("Loaded data from disk.");
    } catch (err) {
        console.error("Error reading data file:", err);
        users = [];
    }
}

// Helper: Save to disk
function saveToDisk() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// --- Routes ---

// 1. Serve the Frontend (from root)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API: Get Data
app.get('/api/data', (req, res) => {
    res.json(users);
});

// 3. API: Submit Preference
app.post('/api/submit', (req, res) => {
    const newUser = req.body;
    
    // UPDATED VALIDATION: Allow 1-3 choices (dynamically adapts to availability)
    if (!newUser.name || !newUser.choices || newUser.choices.length < 1) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const existingIndex = users.findIndex(u => u.name === newUser.name);
    if (existingIndex >= 0) {
        users[existingIndex] = newUser; 
    } else {
        users.push(newUser);
    }

    // Save immediately so data persists
    saveToDisk();

    res.json({ success: true, users });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
