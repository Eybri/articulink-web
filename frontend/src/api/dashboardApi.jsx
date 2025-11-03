// src/api/dashboardApi.js
import api from './api';

export const dashboardApi = {
  // Gender Demographics
  getGenderDemographics: async () => {
    const response = await api.get('/api/dashboard/gender-demographics');
    return response.data;
  },

  // User Growth Over Time
  getUserGrowth: async (timeframe = 'monthly') => {
    const response = await api.get(`/api/dashboard/user-growth?timeframe=${timeframe}`);
    return response.data;
  },

  // Age Distribution
  getAgeDistribution: async () => {
    const response = await api.get('/api/dashboard/age-distribution');
    return response.data;
  },
};