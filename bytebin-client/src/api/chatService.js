import { axiosInstance } from "./axios";

export const chatService = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await axiosInstance.get('/chat/conversations');
    return response.data;
  },
  
  // Get or create conversation with another user
  getOrCreateConversation: async (userId) => {
    const response = await axiosInstance.get(`/chat/conversation/${userId}`);
    return response.data;
  },
  
  // Get message history
  getMessages: async (roomId, limit = 50, before = null) => {
    const params = { limit };
    if (before) params.before = before;
    const response = await axiosInstance.get(`/chat/messages/${roomId}`, { params });
    return response.data;
  },

  // Send message via HTTP API (for offline/fallback)
  sendMessage: async (roomId, content) => {
    const response = await axiosInstance.post(`/chat/messages/${roomId}`, { content });
    return response.data;
  }
};

