const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");

router.delete("/:id", async (req, res) => {

    try {
        const deleteProblem = await Problem.findByIdAndDelete(req.params.id);
        if (!deleteProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports  = router;