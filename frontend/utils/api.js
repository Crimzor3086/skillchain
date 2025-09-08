import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillchain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('skillchain_token');
      localStorage.removeItem('skillchain_user');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      toast.error('Session expired. Please connect your wallet again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Auth
  getAuthChallenge: (walletAddress) => 
    api.get(`/auth/challenge?walletAddress=${walletAddress}`),
  
  authenticateWallet: (data) => 
    api.post('/auth/wallet', data),
  
  verifyToken: () => 
    api.get('/auth/verify'),
  
  logout: () => 
    api.post('/auth/logout'),

  // Quests
  getQuests: (params = {}) => 
    api.get('/quests', { params }),
  
  getQuest: (id) => 
    api.get(`/quests/${id}`),
  
  completeQuest: (id, data) => 
    api.post(`/quests/${id}/complete`, data),
  
  getUserQuestProgress: () => 
    api.get('/quests/progress'),

  // Users
  getUserProfile: (id) => 
    api.get(`/users/${id}`),
  
  updateUserProfile: (id, data) => 
    api.put(`/users/${id}`, data),
  
  getUserCredentials: (id) => 
    api.get(`/users/${id}/credentials`),
  
  getLeaderboard: (params = {}) => 
    api.get('/users/leaderboard', { params }),

  // Credentials
  getCredentials: (params = {}) => 
    api.get('/credentials', { params }),
  
  getCredential: (id) => 
    api.get(`/credentials/${id}`),
  
  verifyCredential: (tokenMint) => 
    api.get(`/credentials/verify/${tokenMint}`),
  
  getCredentialMetadata: (tokenMint) => 
    api.get(`/credentials/metadata/${tokenMint}`),
};

// Helper function to handle API calls with loading states
export const withLoading = async (apiCall, loadingSetter) => {
  try {
    loadingSetter?.(true);
    const result = await apiCall();
    return result;
  } catch (error) {
    throw error;
  } finally {
    loadingSetter?.(false);
  }
};

// Helper function for file uploads
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export { api };
export default api;