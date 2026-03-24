const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const authMiddleware = require("../middleware/auth.js");

// Add a new problem (only for authenticated users)
router.post("/add", async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
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
      code,
      references,
      solutions,
    } = req.body;

    // Validate required fields
    if (!title || !topic || !language || !difficulty) {
      return res
        .status(400)
        .json({ error: "Title, topic, language, and difficulty are required" });
    }

    //  Normalize references
    const formattedReferences =
      typeof references === "string"
        ? references.split(",").map(r => r.trim()).filter(Boolean)
        : Array.isArray(references)
          ? references
          : [];

    //  Normalize solutions
    const formattedSolutions = Array.isArray(solutions)
      ? solutions.map((s, i) => ({
        title: s?.title || `Solution ${i + 1}`,
        language: s?.language || "JavaScript",
        code: s?.code || "",
      }))
      : [];

    const newProblem = await Problem.create({
      clerkId: userId,
      title,
      description,
      topic,
      language,
      difficulty,
      notes,
      code,
      references: formattedReferences,
      solutions: formattedSolutions,
    });
    console.log("Saved Problem:", newProblem);

    await newProblem.save();

    const problemWithId = newProblem.toObject();

    problemWithId.id = problemWithId._id.toString();
    delete problemWithId._id;
    delete problemWithId.__v;

    res
      .status(201)
      .json({ message: "Problem saved successfully", data: problemWithId });
  } catch (error) {
    console.error("Error saving problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;