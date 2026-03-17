

const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");

// add problem ======================
router.post("/add", async (req, res) => {
    try {
        const { title, description, topic, language, difficulty, notes, references, code, solutions } = req.body;
        const newProblem = new Problem({ title, description, topic, language, difficulty, notes, references, code, solutions });
        await newProblem.save();
        // 
        const problemWithId = {
            ...newProblem.toObject(),
            id: newProblem._id.toString(),
        };

        res.status(201).json({ message: "Problem saved successfully", data: problemWithId })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;