

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

module.exports = router;