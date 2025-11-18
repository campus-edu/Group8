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
// Connect to the database using the Environment Variable provided by Render
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    console.error("Please set the MONGO_URI environment variable in Render.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("Connected to MongoDB Atlas"))
        .catch(err => console.error("MongoDB connection error:", err));
}

// --- Define Database Schema ---
const userSchema = new mongoose.Schema({
    name: String,
    choices: [String],
    timestamp: Date
});

const User = mongoose.model('User', userSchema);

// --- Routes ---

// 1. Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API: Get Data (Fetch all users from DB)
app.get('/api/data', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all documents
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 3. API: Submit Preference (Save/Update to DB)
app.post('/api/submit', async (req, res) => {
    const { name, choices, id } = req.body;
    
    // Validation
    if (!name || !choices || choices.length < 1) {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        // Find user by name and update, or create if doesn't exist (upsert)
        // We use 'findOneAndUpdate' to handle both cases cleanly
        const updatedUser = await User.findOneAndUpdate(
            { name: name }, // Search criteria
            { 
                name: name, 
                choices: choices,
                timestamp: new Date() // Update time
            },
            { upsert: true, new: true } // Options: Create if missing, return new doc
        );

        // Return all users so frontend can update immediately
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
