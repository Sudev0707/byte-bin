const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP')
const authMiddleware = require('../middleware/auth');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
// Generate temporary token for storing registration data
const generateTempToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30m' });
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

    const existingUser = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Delete any existing OTPs for this email ==================
    await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });
    
    const otp = generateOTP();
    // 
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp: otp,
      userData: {  // ← This is required for verification
        username: username,
        email: email.toLowerCase(),
        password: password  // Will be hashed during user creation
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await otpRecord.save();

    // Send OTP to  email user provided
    await sendOTPEmail(email, otp);

    // Store user data in temporary token (not in database yet)
    // const tempToken = generateTempToken({
    //   username,
    //   email: email.toLowerCase(),
    //   password 
    // });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address',
      email: email.toLowerCase()
      // tempToken,
      
    });


    // ===============================
    // const user = new User({
    //   username,
    //   email,
    //   password,
    //   confirmPassword
    // })
    // await user.save();

    // const token = generateToken(user._id);
    // res.status(201).json({
    //   success: true,
    //   message: 'User registered successfully',
    //   token,
    //   user: {
    //     id: user._id.toString(),
    //     username: user.username,
    //     email: user.email,
    //   }
    // });


  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error, Please try again later' });
  }
});

// verify-otp 
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('verify-otp: ',email, otp);
    

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email, OTP, and verification token are required' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otp,
      purpose: 'registration',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (!otpRecord.userData) {
      console.error('OTP Record missing userData:', otpRecord);
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Invalid OTP record. Please register again.' });
    }

    // Check verification attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Too many failed attempts. Please register again.' });
    }

    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Create the user account from stored data
    const { username, email: userEmail, password } = otpRecord.userData;
     const user = new User({
      username,
      email: userEmail,
      password,
      isVerified: true
    });

    // Decode temporary user data
    // let userData;
    // try {
    //   userData = jwt.verify(tempToken, process.env.JWT_SECRET);
    // } catch (err) {
    //   await OTP.deleteOne({ _id: otpRecord._id });
    //   return res.status(400).json({ error: 'Session expired. Please register again.' });
    // }



    // Create the user account (now verified)
    // const user = new User({
    //   username: userData.username,
    //   email: userData.email,
    //   password: userData.password,
    //   isVerified: true 
    // });

    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate auth token
    const token = generateToken(user._id);

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Email verified and account created successfully',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ============ RESEND OTP ============
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists (to prevent abuse)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const existingOTP = await OTP.findOne({ email: email.toLowerCase() });
    
    if (!existingOTP) {
      return res.status(400).json({ error: 'No registration found. Please register again.' });
    }
    // Delete old OTPs
    await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });

    // Generate new OTP
    const otp = generateOTP();
    const otpRecord = new OTP({
      email: email.toLowerCase(),  // email as a key
      otp: otp,
      purpose: 'registration',
      userData: existingOTP.userData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await otpRecord.save();

    // Send new OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ============ LOGIN (Updated to check verification) ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
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
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


// Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, username } = req.body;

//     if (!password || !email) {
//       return res.status(400).json({ error: 'Email and password required' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = generateToken(user._id);
//     user.lastLogin = new Date();
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id.toString(),
//         username: user.username,
//         email: user.email,
//       }
//     })

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Server error, Please try again later' });
//   }
// });

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
router.get('/me', authMiddleware, async (req, res) => {
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
