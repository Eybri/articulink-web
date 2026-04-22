// src/api/dashboardApi.js
import api from './api';

export const dashboardApi = {
  // Gender Demographics
  getGenderDemographics: async () => {
    const response = await api.get('/api/admin/dashboard/gender-demographics');
    return response.data;
  },

  // User Growth Over Time
  getUserGrowth: async (timeframe = 'monthly') => {
    const response = await api.get(`/api/admin/dashboard/user-growth?timeframe=${timeframe}`);
    return response.data;
  },

  // Age Distribution
  getAgeDistribution: async () => {
    const response = await api.get('/api/admin/dashboard/age-distribution');
    return response.data;
  },

  // User Status
  getUserStatus: async () => {
    const response = await api.get('/api/admin/dashboard/user-status');
    return response.data;
  },

  // User Roles
  getUserRoles: async () => {
    const response = await api.get('/api/admin/dashboard/user-roles');
    return response.data;
  },

  // Privacy Acceptance
  getPrivacyAcceptance: async () => {
    const response = await api.get('/api/admin/dashboard/privacy-acceptance');
    return response.data;
  },

  // Chat Activity
  getChatActivity: async (timeframe = 'daily') => {
    const response = await api.get(`/api/admin/dashboard/chat-activity?timeframe=${timeframe}`);
    return response.data;
  },

  // Chat Roles
  getChatRoles: async () => {
    const response = await api.get('/api/admin/dashboard/chat-roles');
    return response.data;
  },

  // Audio Growth
  getAudioGrowth: async (timeframe = 'daily') => {
    const response = await api.get(`/api/admin/dashboard/audio-growth?timeframe=${timeframe}`);
    return response.data;
  },

  // Platform Engagement
  getPlatformEngagement: async (timeframe = 'daily') => {
    const response = await api.get(`/api/admin/dashboard/platform-engagement?timeframe=${timeframe}`);
    return response.data;
  }
};