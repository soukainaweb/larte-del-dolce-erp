// src/services/authService.js
import api from './api';
import { unwrapData } from '../utils/apiHelpers';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const forgotPassword = async (emailOrPayload) => {
  const email = typeof emailOrPayload === 'string' ? emailOrPayload : emailOrPayload?.email;
  const response = await api.post('/password/email', { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/password/reset', data);
  return response.data;
};

export const getOAuthProviders = async () => {
  try {
    const response = await api.get('/auth/providers');
    return unwrapData(response) || { google: false, apple: false };
  } catch {
    return { google: false, apple: false };
  }
};

export const getOAuthRedirectUrl = (provider) => `${API_BASE}/auth/${provider}/redirect`;

export const initiateOAuth = (provider) => {
  window.location.href = getOAuthRedirectUrl(provider);
};

export const updateProfile = async (data) => {
  const response = await api.put('/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/profile/password', {
    current_password: data.current_password ?? data.currentPassword,
    password: data.password ?? data.newPassword,
    password_confirmation: data.password_confirmation ?? data.newPassword_confirmation ?? data.confirmPassword,
  });
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const authService = {
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  getOAuthProviders,
  getOAuthRedirectUrl,
  initiateOAuth,
  updateProfile,
  changePassword,
  uploadAvatar,
};

export default authService;
