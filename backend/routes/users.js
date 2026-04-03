const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Problem = require('../models/Problems');

// All routes in this file are protected
router.use(authMiddleware);


// search for users by username or email  (/api/users)
router.get("/search-users", async (req, res) => {
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


// Get user by ID
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password -sharedProblems -receivedProblems");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put("/profile", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { username, bio, website, location } = req.body;

        const user = await User.findByIdAndUpdate(
            currentUserId,
            { username, bio, website, location },
            { new: true }
        ).select("-password");

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update avatar
router.put("/avatar", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            currentUserId,
            { avatar },
            { new: true }
        ).select("-password");

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Follow a user
router.post("/follow/:userId", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;

        if (currentUserId === userId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = await User.findById(currentUserId);

        if (currentUser.following.includes(userId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $push: { following: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $push: { followers: currentUserId }
        });

        res.json({ success: true, message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unfollow a user
router.delete("/follow/:userId", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $pull: { followers: currentUserId }
        });

        res.json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get followers
router.get("/:userId/followers", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate('followers', 'username email avatar')
            .select('followers');

        res.json({ success: true, followers: user.followers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get following
router.get("/:userId/following", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate('following', 'username email avatar')
            .select('following');

        res.json({ success: true, following: user.following });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get problems shared with me
router.get("/shared/with-me", async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const user = await User.findById(currentUserId)
            .populate('receivedProblems.problemId')
            .populate('receivedProblems.sharedBy', 'username email avatar');

        const receivedProblems = user.receivedProblems
            .filter(p => p.problemId)
            .map(p => ({
                id: p.problemId._id,
                title: p.problemId.title,
                topic: p.problemId.topic,
                difficulty: p.problemId.difficulty,
                sharedBy: {
                    id: p.sharedBy._id,
                    username: p.sharedBy.username,
                    email: p.sharedBy.email
                },
                sharedAt: p.sharedAt,
                permission: p.permission,
                isRead: p.isRead || false
            }));

        res.json({
            success: true,
            count: receivedProblems.length,
            problems: receivedProblems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark shared problem as read
router.put("/shared/mark-read", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { problemId, sharedBy } = req.body;

        await User.findOneAndUpdate(
            {
                _id: currentUserId,
                "receivedProblems.problemId": problemId,
                "receivedProblems.sharedBy": sharedBy
            },
            {
                $set: { "receivedProblems.$.isRead": true }
            }
        );

        res.json({ success: true, message: "Problem marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's following status
router.get("/following/status/:userId", async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        
        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following?.includes(userId) || false;
        
        res.json({ success: true, isFollowing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile with stats
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        
        const user = await User.findById(userId)
            .select("-password -sharedProblems -receivedProblems");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if current user follows this user
        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following?.includes(userId) || false;
        
        // Get problems solved count
        const problemsSolved = await Problem.countDocuments({ 
            userId: userId 
        });
        
        // Followers and following counts
        const followersCount = user.followers ? user.followers.length : 0;
        const followingCount = user.following ? user.following.length : 0;
        
        // Shared count
        const sharedCount = user.sharedProblems ? user.sharedProblems.length : 0;
        
        // Recent problems (top 5)
        const recentProblems = await Problem.find({ userId: userId })
            .select("title topic difficulty createdAt")
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                problemsSolved,
                isFollowing,
                followersCount,
                followingCount,
                sharedCount,
                recentProblems
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

