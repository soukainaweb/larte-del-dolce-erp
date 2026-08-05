import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Redirects to dashboard when the user lacks a required permission.
 */
const PermissionRoute = ({ permission, children, fallback = '/dashboard' }) => {
  const { permissions, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && Array.isArray(permissions) && permissions.length > 0 && !permissions.includes(permission)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default PermissionRoute;
