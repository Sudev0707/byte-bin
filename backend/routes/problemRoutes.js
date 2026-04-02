

const express = require("express")
const router = express.Router();
const bcrypt = require('bcryptjs');
const Problem = require("../models/Problems");
const authMiddleware = require("../middleware/auth");

// All routes in this file are protected
router.use(authMiddleware);


// add problem ======================
router.post("/add", async (req, res) => {
    try {
        // get user ID from auth middleware
        const userId = req.user.id;

        const { title, description, topic, language, difficulty, notes, references, code, solutions } = req.body;

        if (!title || !topic || !language || !difficulty) {
            return res.status(400).json({ error: "Title, topic, language, and difficulty are required" });
        }

        // Check for duplicate title for the same user
        const existingProblem = await Problem.findOne({ userId, title });
        if (existingProblem) {
            return res.status(400).json({ error: "A problem with this title already exists for the user" });
        }

        const newProblem = new Problem({ userId, title, description, topic, language, difficulty, notes, references, code, solutions });
        await newProblem.save();
        res.status(201).json({ message: "Problem saved successfully", data: newProblem })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Get all problems for a user ======================
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const problems = await Problem.find({ userId }).sort({ createdAt: -1 });

        // Map problems to include 'id' field for frontend compatibility
        const problemsWithId = problems.map((doc) => ({
            ...doc.toObject(),
            id: doc._id.toString(),
        }));
        res.status(200).json(problemsWithId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get problem by ID (public or protected) single problem
router.get("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }


        const problemWithId = {
            ...problem.toObject(),
            id: problem._id.toString(),
        };
        res.status(200).json(problemWithId);  // response: { id, userId, title, description, topic, language, difficulty, notes, code, solutions, references, dateAdded }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete problem by ID (protected)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tokenUserId = req.user.id;
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const problemUserId = problem.userId.toString();
        const tokenUserIdStr = tokenUserId.toString();
        // Check ownership
        if (problemUserId !== tokenUserIdStr) {
            return res.status(403).json({ error: "Unauthorized to delete this problem", debug: { problemUserId, tokenUserId: tokenUserIdStr, match: false } });
        }


        await Problem.findByIdAndDelete(id);
        res.json({ success: true, message: "Problem deleted successfully", deletedId: id });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: "Invalid problem ID format" });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update problem by ID (protected)
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tokenUserId = req.user.id;
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const problemUserId = problem.userId.toString();
        const tokenUserIdStr = tokenUserId.toString();
        // Check ownership
        if (problemUserId !== tokenUserIdStr) {
            return res.status(403).json({ error: "Unauthorized to update this problem", problemUserId: problemUserId, tokenUserId: tokenUserIdStr });
        }
        const updatedProblem = await Problem.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ message: "Problem updated successfully", data: updatedProblem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// search problems by topic (protected)
router.get("/search/topic/:topic", async (req, res) => {
    try {
        const userId = req.user.id;
        const { topic } = req.params;

        const problems = await Problem.find({
            userId,
            topic: { $regex: topic, $options: 'i' }
        }).sort({ createdAt: -1 });

        const problemsWithId = problems.map((doc) => ({
            ...doc.toObject(),
            id: doc._id.toString(),
        }));

        res.json({
            success: true,
            count: problems.length,
            searchTerm: topic,
            problems: problemsWithId
        });

    } catch (error) {
        console.error("Search by topic error:", error);
        res.status(500).json({ error: error.message });
    }
});


// search problems (protected) by title, topic, language, difficulty
router.get("/search", async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, topic, language, difficulty } = req.query;
        const query = { userId };

        if (title) {
            query.title = { $regex: title, $options: "i" }; // case-insensitive search
        }
        if (topic) {
            query.topic = { $regex: topic, $options: "i" };
        }
        if (language) {
            query.language = { $regex: language, $options: "i" };
        }
        if (difficulty) {
            query.difficulty = difficulty; // exact match for difficulty
        }

        const problems = await Problem.find(query).sort({ createdAt: -1 });
        const problemsWithId = problems.map((doc) => ({
            ...doc.toObject(),
            id: doc._id.toString(),
        }));
        res.status(200).json(problemsWithId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// router.post("/add", ...)     // POST /add
// router.get("/", ...)         // GET /
// router.get("/:id", ...)      // GET /:id
// router.put("/:id", ...)      // PUT /:id
// router.delete("/:id", ...)   // DELETE /:id


module.exports = router;