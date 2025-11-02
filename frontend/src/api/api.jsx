// src/api/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration and admin access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Admin access required
      logout();
      window.location.href = '/login?error=admin_required';
    }
    return Promise.reject(error);
  }
);

// Token management functions
export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};

export const logout = () => {
  removeToken();
  removeUser();
};

// User management functions
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Auth API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/api/auth/profile/picture');
    return response.data;
  }
};

// User management API functions
export const userAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/api/users/', { params });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/api/users/stats/count');
    return response.data;
  },

  // Get single user
  getUser: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // Update user status (legacy - for backward compatibility)
  updateUserStatus: async (userId, status, deactivationReason = null) => {
    const response = await api.put(`/api/users/${userId}/status`, null, {
      params: { 
        status,
        ...(deactivationReason && { deactivation_reason: deactivationReason })
      }
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/users/${userId}/role`, null, {
      params: { role }
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },

  // NEW: Deactivate user with type and duration
  deactivateUser: async (userId, deactivationData) => {
    const response = await api.put(`/api/users/${userId}/deactivate`, deactivationData);
    return response.data;
  },

  // NEW: Activate user (clear all deactivation fields)
  activateUser: async (userId) => {
    const response = await api.put(`/api/users/${userId}/activate`);
    return response.data;
  },

  // NEW: Trigger auto-reactivation manually
  triggerAutoReactivate: async () => {
    const response = await api.post('/api/users/auto-reactivate');
    return response.data;
  },

  // Bulk update user statuses
  bulkUpdateUserStatus: async (userIds, status, deactivationReason = null) => {
    const response = await api.put('/api/users/bulk/status', null, {
      params: { 
        status, 
        user_ids: userIds,
        ...(deactivationReason && { deactivation_reason: deactivationReason })
      }
    });
    return response.data;
  }
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (period = 'monthly') => {
    const response = await api.get('/api/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await api.get('/api/dashboard/activities', {
      params: { limit }
    });
    return response.data;
  }
};

// Pronunciation API functions
export const pronunciationAPI = {
  // Get pronunciation exercises
  getExercises: async (category = null) => {
    const response = await api.get('/api/pronunciation/exercises', {
      params: { category }
    });
    return response.data;
  },

  // Submit pronunciation attempt
  submitAttempt: async (exerciseId, audioData) => {
    const response = await api.post('/api/pronunciation/attempt', {
      exerciseId,
      audioData
    });
    return response.data;
  },

  // Get user progress
  getProgress: async () => {
    const response = await api.get('/api/pronunciation/progress');
    return response.data;
  }
};

// Reports API functions
export const reportsAPI = {
  // Generate report
  generateReport: async (reportType, startDate, endDate) => {
    const response = await api.post('/api/reports/generate', {
      reportType,
      startDate,
      endDate
    });
    return response.data;
  },

  // Get report history
  getReportHistory: async () => {
    const response = await api.get('/api/reports/history');
    return response.data;
  },

  // Download report
  downloadReport: async (reportId) => {
    const response = await api.get(`/api/reports/download/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Settings API functions
export const settingsAPI = {
  // Get application settings
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },

  // Update application settings
  updateSettings: async (settings) => {
    const response = await api.put('/api/settings', settings);
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await api.get('/api/settings/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/api/settings/preferences', preferences);
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.detail || 'An error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getToken();
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format date for API
  formatDateForAPI: (date) => {
    return date.toISOString().split('T')[0];
  }
};

export default api;