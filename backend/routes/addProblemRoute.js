const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const authMiddleware = require("../middleware/auth.js");

// Add a new problem (only for authenticated users)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Destructure data from request body
    const {
      title,
      description,
      topic,
      language,
      difficulty,
      notes,
      references,
      code,
      solutions,
    } = req.body;

    // Validate required fields
    if (!title || !topic || !language || !difficulty) {
      return res
        .status(400)
        .json({ error: "Title, topic, language, and difficulty are required" });
    }

    // Create new problem for this user
    const newProblem = new Problem({
      clerkId: req.userId, // always assign from auth, never trust frontend
      title,
      description,
      topic,
      language,
      difficulty,
      notes,
      references: Array.isArray(references)
        ? references
        : typeof references === "string"
        ? references.split(",").map((r) => r.trim()).filter(Boolean)
        : [],
      code,
      solutions: Array.isArray(solutions)
        ? solutions.map((s) => ({
            title: s.title || "Solution",
            language: s.language || "JavaScript",
            code: s.code || "",
          }))
        : [],
    });

    await newProblem.save();

    // Return problem with readable id
    const problemWithId = {
      ...newProblem.toObject(),
      id: newProblem._id.toString(),
    };

    res
      .status(201)
      .json({ message: "Problem saved successfully", data: problemWithId });
  } catch (error) {
    console.error("Error saving problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;