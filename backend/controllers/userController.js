
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

module.exports = { searchUsers, getAllUsers };