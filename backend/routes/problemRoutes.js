

const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");
const { requireAuth } = require("@clerk/express");


// add problem ======================
router.post("/add", requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { title, description, topic, language, difficulty, notes, references, code, solutions, clerkId } = req.body;

        const newProblem = new Problem({ userId, title, description, topic, language, difficulty, notes, references, code, solutions, clerkId });
        await newProblem.save();
        res.status(201).json({ message: "Problem saved successfully", data: newProblem })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Get all problems for a user ======================
router.get("/", requireAuth(), async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const clerkId = req.auth.userId;
    const problems = await Problem.find({ clerkId }).sort({ createdAt: -1 });

    if (!problems || problems.length === 0) {
      return res.status(200).json([]); // or 404 if you prefer
    }

    const problemsWithId = problems.map((doc) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
    }));

    res.status(200).json(problemsWithId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get problem by ID (public or protected)
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

// Delete problem by ID (protected)
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

// Update problem by ID (protected)
router.put("/:id", requireAuth(), async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        // Check ownership
        if (problem.clerkId !== req.auth.userId) {
            return res.status(403).json({ error: "Unauthorized to update this problem" });
        }
        const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Problem updated successfully", data: updatedProblem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;