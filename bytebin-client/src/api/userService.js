import { axiosInstance } from "./axios";

export const userService = {
    // Search users by username or email
    searchUsers: async (query, limit = 10) => {

        try {
            const response = await axiosInstance.get(`/users/search-users`, {
                params: { query, limit }
            });
            // console.log(response);
            return response.data;

        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    },

    // Get all users with pagination
    getAllUsers: async (page = 1, limit = 10) => {
        try {
            const response = await axiosInstance.get(`/users/all`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    // Get user by ID (public profile)
    getUserById: async (userId) => {
        try {
            const response = await axiosInstance.get(`/users/profile/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    // Get user profile (current user)
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get("/auth/me");
            return response.data;
        } catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (userData) => {
        try {
            const response = await axiosInstance.put("/users/profile", userData);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    // Update avatar
    updateAvatar: async (avatarUrl) => {
        try {
            const response = await axiosInstance.put("/users/avatar", { avatar: avatarUrl });
            return response.data;
        } catch (error) {
            console.error("Error updating avatar:", error);
            throw error;
        }
    },

    // Follow a user
    followUser: async (userId) => {
        try {
            const response = await axiosInstance.post(`/users/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    },

    // Unfollow a user
    unfollowUser: async (userId) => {
        try {
            const response = await axiosInstance.delete(`/users/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    },

    // Get user's followers
    getFollowers: async (userId) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}/followers`);
            return response.data;
        } catch (error) {
            console.error("Error fetching followers:", error);
            throw error;
        }
    },

    // Get users that a user is following
    getFollowing: async (userId) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}/following`);
            return response.data;
        } catch (error) {
            console.error("Error fetching following:", error);
            throw error;
        }
    },

    // Share a problem with another user
    shareProblem: async (userId, problemId, permission = 'read') => {
        try {
            const response = await axiosInstance.post(`/users/share/${userId}`, {
                problemId,
                permission
            });
            return response.data;
        } catch (error) {
            console.error("Error sharing problem:", error);
            throw error;
        }
    },

    // Get problems shared by me
    getSharedByMe: async () => {
        try {
            const response = await axiosInstance.get("/users/shared/by-me");
            return response.data;
        } catch (error) {
            console.error("Error fetching shared problems:", error);
            throw error;
        }
    },

    // Get problems shared with me
    getSharedWithMe: async () => {
        try {
            const response = await axiosInstance.get("/users/shared/with-me");
            return response.data;
        } catch (error) {
            console.error("Error fetching received problems:", error);
            throw error;
        }
    },

    // Mark a shared problem as read
    markAsRead: async (problemId, sharedBy) => {
        try {
            const response = await axiosInstance.put("/users/shared/mark-read", {
                problemId,
                sharedBy
            });
            return response.data;
        } catch (error) {
            console.error("Error marking problem as read:", error);
            throw error;
        }
    },

    // Delete a shared problem
    deleteSharedProblem: async (problemId, sharedWith) => {
        try {
            const response = await axiosInstance.delete(`/users/shared/${problemId}`, {
                data: { sharedWith }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting shared problem:", error);
            throw error;
        }
    }


};