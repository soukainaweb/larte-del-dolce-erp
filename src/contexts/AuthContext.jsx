// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser as getUserService, logout as logoutService } from '../services/authService';
import { extractUserFromResponse, normalizeUser } from '../utils/apiHelpers';
import { mapRoleToFrontendKey } from '../utils/roleMapping';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);

            // Optimistic restore from localStorage
            if (storedUser) {
                try {
                    setUser(normalizeUser(JSON.parse(storedUser)));
                } catch {
                    localStorage.removeItem('user');
                }
            }

            try {
                const response = await getUserService();
                const currentUser = extractUserFromResponse(response);
                if (currentUser) {
                    const formatted = normalizeUser(currentUser);
                    setUser(formatted);
                    localStorage.setItem('user', JSON.stringify(formatted));
                }
            } catch (err) {
                console.error('Token invalide:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (userData, authToken) => {
        const formattedUser = normalizeUser(userData);

        setUser(formattedUser);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(formattedUser));
        setError(null);
    };

    const logout = async () => {
        try {
            await logoutService();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const updateUser = (userData) => {
        const formatted = normalizeUser(userData);
        setUser(formatted);
        localStorage.setItem('user', JSON.stringify(formatted));
    };

    const value = {
        user,
        token,
        loading,
        isLoading: loading,
        error,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
        /** Frontend sidebar role key (e.g. sales_rep) */
        roleKey: user ? mapRoleToFrontendKey(user.role) : null,
        permissions: user?.permissions || [],
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
