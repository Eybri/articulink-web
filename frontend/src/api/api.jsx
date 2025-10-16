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

export default api;