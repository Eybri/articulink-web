import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Token management functions
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
};

export const logout = () => {
  removeToken();
  removeUser();
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

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
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        logout();
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        logout();
        window.location.href = '/login?error=admin_required';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/admin/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/api/admin/auth/me');
    return response.data;
  },
  updateProfile: async (profileData: any) => {
    const response = await api.put('/api/admin/auth/profile', profileData);
    return response.data;
  },
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/admin/auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteProfilePicture: async () => {
    const response = await api.delete('/api/admin/auth/profile/picture');
    return response.data;
  },
  changePassword: async (passwordData: any) => {
    const response = await api.put('/api/admin/auth/change-password', passwordData);
    return response.data;
  }
};

// User management API functions
export const userAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/api/admin/users/', { params });
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get('/api/admin/users/stats/count');
    return response.data;
  },
  getUser: async (userId: string) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },
  updateUserStatus: async (userId: string, status: string, deactivationReason: string | null = null) => {
    const response = await api.put(`/api/admin/users/${userId}/status`, null, {
      params: {
        status,
        ...(deactivationReason ? { deactivation_reason: deactivationReason } : {})
      }
    });
    return response.data;
  },
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, null, {
      params: { role }
    });
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
  deactivateUser: async (userId: string, deactivationData: any) => {
    const response = await api.put(`/api/admin/users/${userId}/deactivate`, deactivationData);
    return response.data;
  },
  activateUser: async (userId: string) => {
    const response = await api.put(`/api/admin/users/${userId}/activate`);
    return response.data;
  },
  triggerAutoReactivate: async () => {
    const response = await api.post('/api/admin/users/auto-reactivate');
    return response.data;
  },
  bulkUpdateUserStatus: async (userIds: string[], status: string, deactivationReason: string | null = null) => {
    const response = await api.put('/api/admin/users/bulk/status', null, {
      params: {
        status,
        user_ids: userIds,
        ...(deactivationReason ? { deactivation_reason: deactivationReason } : {})
      }
    });
    return response.data;
  },
  getGenderDemographics: async () => {
    const response = await api.get('/api/admin/dashboard/gender-demographics');
    return response.data;
  },
  getUserGrowth: async (timeframe = 'monthly') => {
    const response = await api.get('/api/admin/dashboard/user-growth', { params: { timeframe } });
    return response.data;
  },
  getAgeDistribution: async () => {
    const response = await api.get('/api/admin/dashboard/age-distribution');
    return response.data;
  }
};

// Dashboard API functions
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },
  getAnalytics: async (period = 'monthly') => {
    const response = await api.get('/api/admin/dashboard/analytics', { params: { period } });
    return response.data;
  },
  getRecentActivities: async (limit = 10) => {
    const response = await api.get('/api/admin/dashboard/activities', { params: { limit } });
    return response.data;
  },
  getSystemHealth: async () => {
    const response = await api.get('/api/admin/dashboard/health');
    return response.data;
  },
  getPlatformEngagement: async (timeframe = 'daily') => {
    const response = await api.get(`/api/admin/dashboard/platform-engagement?timeframe=${timeframe}`);
    return response.data;
  },
  getChatActivity: async (timeframe = 'daily') => {
    const response = await api.get(`/api/admin/dashboard/chat-activity?timeframe=${timeframe}`);
    return response.data;
  }
};

// Pronunciation API functions
export const pronunciationAPI = {
  getExercises: async (category = null) => {
    const response = await api.get('/api/pronunciation/exercises', { params: { category } });
    return response.data;
  },
  submitAttempt: async (exerciseId: string, audioData: any) => {
    const response = await api.post('/api/pronunciation/attempt', { exerciseId, audioData });
    return response.data;
  },
  getProgress: async () => {
    const response = await api.get('/api/pronunciation/progress');
    return response.data;
  },
  getAudioClips: async (params = {}) => {
    const response = await api.get('/api/pronunciation/audio-clips', { params });
    return response.data;
  },
  getAudioClipById: async (id: string) => {
    const response = await api.get(`/api/pronunciation/audio-clips/${id}`);
    return response.data;
  },
  updateAudioClip: async (id: string, data: any) => {
    const response = await api.put(`/api/pronunciation/audio-clips/${id}`, data);
    return response.data;
  },
  deleteAudioClip: async (id: string) => {
    const response = await api.delete(`/api/pronunciation/audio-clips/${id}`);
    return response.data;
  }
};

// Reports API functions
export const reportsAPI = {
  generateReport: async (reportType: string, startDate: string, endDate: string) => {
    const response = await api.post('/api/admin/reports/generate', { reportType, startDate, endDate });
    return response.data;
  },
  getReportHistory: async () => {
    const response = await api.get('/api/admin/reports/history');
    return response.data;
  },
  downloadReport: async (reportId: string) => {
    const response = await api.get(`/api/admin/reports/download/${reportId}`, { responseType: 'blob' });
    return response.data;
  }
};

export const apiUtils = {
  handleError: (error: any) => {
    if (error.response) {
      return {
        message: error.response.data.detail || 'An error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      return { message: 'Network error. Please check your connection.', status: 0 };
    } else {
      return { message: error.message || 'An unexpected error occurred', status: -1 };
    }
  },
  isAuthenticated: () => !!getToken(),
  validateEmail: (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
};

export default api;
