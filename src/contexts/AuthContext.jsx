// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser as getUserService, logout as logoutService } from '../services/authService';
import { extractUserFromResponse, normalizeUser } from '../utils/apiHelpers';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  persistAuth,
  AUTH_USER_KEY,
} from '../utils/authStorage';
import { mapRoleToFrontendKey, normalizePermissionNames } from '../utils/roleMapping';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      const cachedUser = getStoredUser();
      if (cachedUser) {
        setUser(normalizeUser(cachedUser));
      }

      try {
        const response = await getUserService();
        const currentUser = extractUserFromResponse(response);

        if (currentUser) {
          const formatted = normalizeUser(currentUser);
          setUser(formatted);
          persistAuth(storedToken, formatted);
        } else {
          clearSession();
        }
      } catch (err) {
        console.error('Session bootstrap failed:', err);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, [clearSession]);

  const login = useCallback((userData, authToken) => {
    const formattedUser = normalizeUser(userData);

    setUser(formattedUser);
    setToken(authToken);
    persistAuth(authToken, formattedUser);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await logoutService();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((userData) => {
    const formatted = normalizeUser(userData);
    setUser(formatted);
    if (token) {
      persistAuth(token, formatted);
    } else {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(formatted));
    }
  }, [token]);

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
    roleKey: user ? mapRoleToFrontendKey(user.role) : null,
    permissions: normalizePermissionNames(user?.permissions ?? user?.role?.permissions),
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
