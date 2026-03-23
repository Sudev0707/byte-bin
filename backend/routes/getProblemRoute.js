const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const authMiddleware = require("../middleware/auth.js");

// GET all problems for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch only this user's problems
    const problems = await Problem.find({ clerkId: userId }).sort({ createdAt: -1 });

    // Format response
    const formattedProblems = problems.map((doc) => {
      const obj = doc.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        dateAdded: obj.createdAt.toISOString().split("T")[0],
      };
    });

    res.status(200).json(formattedProblems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET a single problem by ID for logged-in user
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Fetch problem only if it belongs to this user
    const problem = await Problem.findOne({ _id: id, clerkId: userId });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const problemWithId = {
      ...problem.toObject(),
      id: problem._id.toString(),
      dateAdded: problem.createdAt.toISOString().split("T")[0],
    };

    res.status(200).json(problemWithId);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;