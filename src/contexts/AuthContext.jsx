// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser as getUserService, logout as logoutService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger l'utilisateur si le token existe
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    
                    // Vérifier si le token est toujours valide
                    const userData = await getUserService();

const currentUser = userData.user || userData;

setUser({
    ...currentUser,

    fullName: currentUser.name ||
      `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),

    firstName: currentUser.name?.split(' ')[0] || '',
    lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
    role: currentUser.role || {},
    status: currentUser.status || 'Online',
    avatar: currentUser.avatar || ''
});
                } catch (err) {
                    console.error('Token invalide:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Fonction de login
   const login = async (userData, token) => {

    const formattedUser = {
    ...userData,

    fullName: userData.name || 
      `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),


        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',

        role: userData.role || {
            name: '',
            display_name: ''
        },

        status: userData.status || 'Online',
        avatar: userData.avatar || ''
    };


    setUser(formattedUser);
    setToken(token);

    localStorage.setItem(
        'token',
        token
    );

    localStorage.setItem(
        'user',
        JSON.stringify(formattedUser)
    );

    setError(null);
};

    // Fonction de logout
    const logout = async () => {
        try {
            await logoutService();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    // Mettre à jour l'utilisateur
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;