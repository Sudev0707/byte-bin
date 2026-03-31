

const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");
const { requireAuth } = require("@clerk/express");


// add problem ======================
router.post("/add", requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId; 
        const { title, description, topic, language, difficulty, notes, references, code, solutions, clerkId } = req.body;
        
        const newProblem = new Problem({ userId, title, description, topic, language, difficulty, notes, references, code, solutions, clerkId });
        await newProblem.save();
        res.status(201).json({ message: "Problem saved successfully", data: newProblem })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;