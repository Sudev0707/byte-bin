
import { clerkClient } from '@clerk/clerk-sdk-node';




export const searchUsers = async (req, res) => {
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await clerkClient.users.getUserList({
            limit: 20, 
        });

        res.json(users.data); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};