const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

  // Generate JWT
  const generateToken = (userId)=>{
    return jwt.sign({id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }


  // Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
  
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new user (pre-save middleware will hash password)
    const user = new User({
      username,
      email,
      password,
      confirmPassword
    })

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      }
    });
    

  } catch (error) {
    console.error('Register error:', error);
    //handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: 'Server error, Please try again later' });
  }
});



// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!password || !email) {
      return res.status(400).json({ error: 'Email and password required' });
    }

  
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find user by username or email
    // const query = username ? { username } : { email };
    // const user = await User.findOne(query);

    // Check password
    // const isPasswordValid  = await bcrypt.compare(password, user.password);
    const isPasswordValid  = await user.comparePassword(password);
    if (!isPasswordValid ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user._id);

  
    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      }
    })

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error, Please try again later' });
  }
});

// Logout - invalidate session (JWT stateless, just client clear)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Optional: Add token blacklist here (Redis/memstore for production)
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me',authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Server error, Please try again later' });
  }
});


module.exports = router;
