const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("Connected to MongoDB Atlas"))
        .catch(err => console.error("MongoDB connection error:", err));
}

// --- Define Database Schema ---
const userSchema = new mongoose.Schema({
    name: String,
    choices: [String], // We still store as array [ "Role" ]
    timestamp: Date
});

const User = mongoose.model('User', userSchema);

// --- Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/data', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/api/submit', async (req, res) => {
    const { name, choices } = req.body;
    
    // Validation: Ensure at least 1 choice is present
    if (!name || !choices || choices.length < 1) {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { name: name },
            { 
                name: name, 
                choices: choices,
                timestamp: new Date()
            },
            { upsert: true, new: true }
        );

        const allUsers = await User.find();
        res.json({ success: true, users: allUsers });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
