
const MONGO_URI = 'mongodb+srv://anshul:anshul@cluster0.fjmrsjw.mongodb.net/?appName=Cluster0';

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Candidate = require('./models/Candidate');
const path=require("path");
const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'build')));

// Database Connection
mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/comedy-club')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Connection Error:', err));

// --- ROUTES ---

const initialCandidates = [
    { name: "Anshul Negi", roll: "101", votes: 0 },
    { name: "Tanishq Jhamar", roll: "102", votes: 0 },
    { name: "Vrishank", roll: "103", votes: 0 },
   
];

// --- ROUTES ---

// 1. SEED ROUTE (Resets the Database)
// Usage: Visit http://localhost:5000/api/seed in your browser
app.get('/api/seed', async (req, res) => {
  try {
    await Candidate.deleteMany({}); // Deletes all existing data
    await Candidate.insertMany(initialCandidates); // Inserts fresh data
    res.json({ message: '✅ Database seeded successfully with initial candidates!' });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding database', error: err.message });
  }
});

// 1. GET ALL CANDIDATES
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. VOTE FOR A CANDIDATE
app.post('/api/vote', async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ message: 'Candidate ID is required' });
  }

  try {
    // Find candidate by ID and increment votes by 1
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true } // Return the updated document
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ 
      message: 'Vote successful!', 
      candidate: updatedCandidate 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during voting' });
  }
});

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
