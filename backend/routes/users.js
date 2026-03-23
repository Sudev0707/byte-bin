const express = require('express');
const { clerkClient } = require('@clerk/backend');
const router = express.Router();
const authMiddleware = require('../middleware/auth.js');
const { getAllUsers, searchUsers } = require('../controllers/userController.js');
// POST /api/users/search
// Body: { q: 'search term' }
router.post('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.body;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" required' });
    }

    // Fetch users from Clerk with query
    const users = await clerkClient.users.getUserList({
      query: q,
      limit: 20,
      orderBy: '-created_at'
    });

    // Map to frontend format (add mock problemsSolved)
    const userList = users.data.map(user => ({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Anonymous',
      username: user.username || '',
      imageUrl: user.imageUrl,
      problemsSolved: user.publicMetadata.problemsSolved || 42 // mock, enhance later
    }));

    res.json({ users: userList, count: users.data.length });
  } catch (error) {
    console.error('Users search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET /api/users/:id - get single user by Clerk ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Fetch single user from Clerk
    const user = await clerkClient.users.getUser(id);

    // Map to frontend format
    const userData = {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Anonymous',
      username: user.username || '',
      imageUrl: user.imageUrl,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      problemsSolved: user.publicMetadata.problemsSolved || 42, // mock
      createdAt: user.createdAt,
      // Add more Clerk fields as needed
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.code === 'resource_not_found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 
router.get('/search', searchUsers);
router.get("/users", getAllUsers);

module.exports = router;

