const express = require("express");
const router = express.Router();
const Problem = require("../models/AddProblems");
const { requireAuth } = require("@clerk/express");

router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    // Check ownership
    if (problem.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Unauthorized to delete this problem" });
    }
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
