const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const authMiddleware = require("../middleware/auth.js");

// Update a problem by ID (only owner can update)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
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

    // Prepare updated data safely
    const updateData = {
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
    };

    // Update only if problem belongs to the logged-in user
    const updatedProblem = await Problem.findOneAndUpdate(
      { _id: id, clerkId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({ error: "Problem not found or you do not have permission" });
    }

    const problemWithId = {
      ...updatedProblem.toObject(),
      id: updatedProblem._id.toString(),
      dateUpdated: updatedProblem.updatedAt
        ? updatedProblem.updatedAt.toISOString().split("T")[0]
        : undefined,
    };

    res
      .status(200)
      .json({ message: "Problem updated successfully", data: problemWithId });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;