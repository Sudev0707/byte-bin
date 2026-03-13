

const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");

// 
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });

    const problemsWithId = problems.map((doc) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
    }));

    res.status(200).json(problemsWithId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    const problemWithId = {
      ...problem.toObject(),
      id: problem._id.toString(),
    };
    res.status(200).json(problemWithId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
