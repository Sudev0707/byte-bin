
const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').limit(10);
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.username,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        problemsSolved: user.problemsSolved || 0
      }))
    });
  } catch (error) {
    console.error('ERROR fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await User.find({})
      .select('-password')
      .or([
        { username: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ])
      .limit(20);

    const filteredUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.username,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
      problemsSolved: user.problemsSolved || 0
    }));

    res.json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to search users" });
  }
};


// Get or update user profile from MongoDB (for custom auth)
const getOrCreateUserProfile = async (userId) => {
  try {
    let user = await User.findById(userId).select('-password');

    if (!user) {
      // Create basic user if not exists (shouldn't happen post-login)
      user = new User({
        _id: userId,
        username: `User_${userId.toString().slice(-6)}`,
        problemsSolved: 0
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

      return {
      id: user._id.toString(),
      name: user.username,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
      problemsSolved: user.problemsSolved || 0,
      submissions: user.submissions || [],
      stats: user.stats || { topics: { easy: 0, medium: 0, hard: 0 }, streaks: { current: 0, max: 0 } }
    };
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    throw error;
  }
};

module.exports = { searchUsers, getAllUsers, getOrCreateUserProfile };
