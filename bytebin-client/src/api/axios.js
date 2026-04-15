
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});



// Add token to requests if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bytebin_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // logout user
      localStorage.removeItem("bytebin_token");
      localStorage.removeItem("bytebin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// VITE_API_URL=http://localhost:5000/api
// auth services
export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("bytebin_token", response.data.token);
      localStorage.setItem('bytebin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },


  // verify email
  verifyEmail: async (verificationData) => {
    const response = await axiosInstance.post("/auth/verify-otp", verificationData);
    // console.log(verificationData)
    if (response.data.token) {
      localStorage.setItem("bytebin_token", response.data.token);
      localStorage.setItem('bytebin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  resendVerificationCode: async (data) => {
    const response = await axiosInstance.post("/auth/resend-otp", data);
    return response.data;
  },


  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("bytebin_token", response.data.token);
      localStorage.setItem('bytebin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // google OAuth
  googleLogin: () => {
    // Store current URL to redirect back after OAuth
    localStorage.setItem('oauth_redirect_url', window.location.href);
    // Redirect to Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  // GitHub OAuth
  githubLogin: () => {
    // Store current URL to redirect back after OAuth
    localStorage.setItem('oauth_redirect_url', window.location.href);
    // Redirect to GitHub OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  },

  // handle OAuth callback - should be called on the page that handles the OAuth redirect
  handleOAuthCallback: async (code, provider) => {
    try {
      const response = await axiosInstance.post(`/auth/${provider}/callback`, { code });
      if (response.data.token) {
        localStorage.setItem("bytebin_token", response.data.token);
        localStorage.setItem('bytebin_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  },



  // Get current user profile (refresh from backend)
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("bytebin_token");
    return !!token;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Don't throw - client clears session anyway
    } finally {
      localStorage.removeItem("bytebin_token");
      localStorage.removeItem("bytebin_user");
      window.location.href = "/login";
    }
  },

};

export const logout = authService.logout;
export { axiosInstance };


