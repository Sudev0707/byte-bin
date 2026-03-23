const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const authMiddleware = require("../middleware/auth.js");

router.delete("/:id", authMiddleware, async (req, res) => {

    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const deleteProblem = await Problem.findOneAndDelete({
            _id: req.params.id,
            clerkId: req.userId
        });
        if (!deleteProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports  = router;