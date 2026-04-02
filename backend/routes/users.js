const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Problem = require('../models/Problems');

// All routes in this file are protected
router.use(authMiddleware);


// search for users by username or email
router.get("/search", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { query, limit = 10 } = req.query;
        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchTerm = query.trim();
        let users = await User.find(
            {
                $text: { $search: searchTerm },
                _id: { $ne: currentUserId } // Exclude current user
            },
            { score: { $meta: "textScore" }, username: 1, email: 1, avatar: 1 } // Include avatar in results
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(parseInt(limit))
            .select("-password -sharedProblems -receivedProblems -dateJoined -createdAt -updatedAt"); // Exclude sensitive fields

        if (users.length < 5) {
            const regexUsers = await User.find({
                _id: { $ne: currentUserId },
                $or: [
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            })
                .limit(parseInt(limit))
                .select("username email avatar createdAt"); // Include avatar in results
            // users = users.concat(regexUsers);
            // merge and duplicates
            const mergeMap = new Map();
            [...users, ...regexUsers].forEach(user => {
                if (!mergeMap.has(user._id.toString())) {
                    mergeMap.set(user._id.toString(), user);
                }
            });
            users = Array.from(mergeMap.values());
        }
        res.json({ success: true, count: users.length, searchTerm, users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

// Share a problem with another user
router.post("/share/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const { problemId, permission = 'read' } = req.body;

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" });
        }

        // Check if problem exists and belongs to current user
        const problem = await Problem.findOne({ _id: problemId, userId: currentUserId });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found or you do not have permission to share it" });
        }

        // Check if recipient user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        // check if already shared
        const alreadyShared = targetUser.receivedProblems.some(p => p.problemId.toString() === problemId && p.sharedBy.toString() === currentUserId);
        if (alreadyShared) {
            return res.status(400).json({ message: "Problem already shared with this user" });
        }

        // Add to currentUsers sender's sharedProblems
        await User.findByIdAndUpdate(currentUserId, {
            $push: { sharedProblems: { problemId, sharedWith: userId, permission, sharedAt: new Date().toISOString().split('T')[0] } }
        });

        // Add to target user's receivedProblems
        await User.findByIdAndUpdate(userId, {
            $push: { receivedProblems: { problemId, sharedBy: currentUserId, permission, sharedAt: new Date().toISOString().split('T')[0] } }
        });

        res.json({ success: true, message: `Problem shared successfully with ${targetUser.username}`, sharedWith: { id: targetUser._id, username: targetUser.username } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


// Get problems I shared with others
router.get("/shared/by-me", async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const user = await User.findById(currentUserId)
            .populate('sharedProblems.problemId')
            .populate('sharedProblems.sharedWith', 'username email');

        const sharedProblems = user.sharedProblems
            .filter(p => p.problemId)
            .map(p => ({
                id: p.problemId._id,
                title: p.problemId.title,
                topic: p.problemId.topic,
                difficulty: p.problemId.difficulty,
                sharedWith: {
                    id: p.sharedWith._id,
                    username: p.sharedWith.username
                },
                sharedAt: p.sharedAt,
                permission: p.permission
            }));

        res.json({
            success: true,
            count: sharedProblems.length,
            problems: sharedProblems
        });

    } catch (error) {
        console.error("Get shared by me error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Mark a shared problem as read



// Mark a shared problem as unread


// Get problems shared with current user


module.exports = router;

