// src/services/authService.js
import { authApi } from '../api/auth.api';

export const authService = {
  getUser: async () => {
    const response = await authApi.me();
    return response.data;
  },
  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('token');
  },
  updatePreferences: async (data) => {
    const response = await authApi.updatePreferences(data);
    return response.data;
  },
};