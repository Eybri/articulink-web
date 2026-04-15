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
};