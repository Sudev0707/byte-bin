
// import { clerkClient } from '@clerk/clerk-sdk-node';
// const { clerkClient } = require('@clerk/backend');
const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const getAllUsers = async (req, res) => {
  try {
    // Debug: make sure secret key is available
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({
        message: 'Clerk secret key is missing. Set CLERK_SECRET_KEY in your env variables.',
      });
    }

    // Fetch users from Clerk
    const users = await clerkClient.users.getUserList({ limit: 10 });

    // users is an array, return it directly
    res.status(200).json({
      success: true,
      users,
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

        const users = await clerkClient.users.getUserList({
            limit: 100,
        });

        const filteredUsers = users.data.filter((user) => {
            const firstName = user.firstName || "";
            const lastName = user.lastName || "";
            const username = user.username || "";

            const fullName = `${firstName} ${lastName}`.toLowerCase();

            return (
                fullName.includes(query.toLowerCase()) ||
                username.toLowerCase().includes(query.toLowerCase())
            );
        });

        res.json(filteredUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to search users" });
    }
};





// const getAllUsers = async (req, res) => {
//     try {
//         console.log("🔑 CLERK_SECRET_KEY:", !!process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING');
//         console.log("📊 Clerk client initialized:", !!clerkClient);
        
//         const usersResponse = await clerkClient.users.getUserList({ limit: 20 });
//         console.log("👥 USERS fetched:", {
//             totalCount: usersResponse.totalCount,
//             dataLength: usersResponse.data.length,
//             firstUserId: usersResponse.data[0]?.id || 'none',
//             sampleData: usersResponse.data.slice(0, 2)
//         });

//         res.json({
//             success: true,
//             users: usersResponse.data,
//             count: usersResponse.totalCount || 0
//         });
//     } catch (error) {
//         console.error("❌ FULL ERROR fetching users:", {
//             message: error.message,
//             code: error.code,
//             status: error.statusCode,
//             stack: error.stack?.split('\n').slice(0,3)
//         });
//         res.status(500).json({ 
//             success: false,
//             message: "Failed to fetch users",
//             error: error.message 
//         });
//     }
// };

const User = require('../models/User');

// Get or create user profile - syncs Clerk + MongoDB
const getOrCreateUserProfile = async (userId) => {
  try {
    // Fetch Clerk user data
    const clerkUser = await clerkClient.users.getUser(userId);
    
    // Prepare data for MongoDB
    const userData = {
      clerkId: userId,
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || 'Anonymous',
      username: clerkUser.username || '',
      imageUrl: clerkUser.imageUrl,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      lastLogin: new Date()
    };

    // Only set email when Clerk actually provides one.
    // Setting email to '' can cause duplicate checks to incorrectly trigger.
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (email) {
      userData.email = email;
    }

// Check for email duplicate
    if (userData.email) {
      console.log(`🔍 Checking email "${userData.email}" for user ${userId}`);
      const existingByEmail = await User.findOne({ email: userData.email });
      if (existingByEmail) {
        console.log(`📧 Existing user found: ${existingByEmail.clerkId}`);
        if (existingByEmail.clerkId !== userId) {
          console.error(
            `🚫 Duplicate email blocked: ${userData.email}`
          );
          throw new Error(
            'Email already registered with another account. Please use the same login method or contact support.'
          );
        } else {
          console.log('✅ Same user email, allowing update');
        }
      } else {
        console.log('✅ No existing email, can create');
      }
    }

    // Upsert MongoDB user (create if not exists, update profile)
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { ...userData, $setOnInsert: { problemsSolved: 0 } },
      { upsert: true, new: true }
    );
    
    console.log(`💾 User upserted: ${user.clerkId}, email: ${user.email || 'none'}, new doc: ${user._id}`);

    // Enhance with full profile
    return {
      id: user.clerkId,
      ...userData,
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
