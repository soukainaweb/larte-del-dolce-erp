// src/services/authService.js
import api from './api';

// ✅ Export named pour les fonctions
export const login = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/logout');
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};

export const getUser = async () => {
    try {
        const response = await api.get('/user');
        return response.data;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/password/email', { email });
        return response.data;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await api.post('/password/reset', data);
        return response.data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};

export const updateProfile = async (data) => {
    try {
        const response = await api.put('/user/profile', data);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

export const changePassword = async (data) => {
    try {
        const response = await api.put('/user/password', data);
        return response.data;
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
};

export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Upload avatar error:', error);
        throw error;
    }
};

// ✅ Export default pour la compatibilité
const authService = {
    login,
    logout,
    register,
    getUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    uploadAvatar,
};

export default authService;