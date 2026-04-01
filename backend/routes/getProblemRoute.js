const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");

// Protected GET /
router.get("/", async (req, res) => {
  try {
    const userId = req.auth.userId; 
    const problems = await Problem.find({ userId }).sort({ createdAt: -1 });

 
    res.status(200).json({
      message: "Problems fetched successfully",
      data: problems,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Public or protected GET /:id (problem detail)
router.get("/:id", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const problem = await Problem.findOne({
      _id: id,
      userId: userId, 
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({
      message: "Problem fetched",
      data: problem,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;