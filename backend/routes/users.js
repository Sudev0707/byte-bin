const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const authMiddleware = require('../middleware/auth.js');
const { getAllUsers, searchUsers, getOrCreateUserProfile } = require('../controllers/userController.js');
// POST /api/users/search
// Body: { q: 'search term' }
router.post('/search', authMiddleware, async (req, res) => {
 
});


// GET /api/users/profile
router.get('/:id', authMiddleware, async (req, res) => {
 
});



// 
router.get('/search', searchUsers);
router.get("/", getAllUsers);

module.exports = router;

