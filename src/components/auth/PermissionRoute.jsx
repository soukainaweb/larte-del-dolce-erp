import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

/**
 * Redirects to dashboard when the user lacks a required permission.
 */
const PermissionRoute = ({ permission, children, fallback = '/dashboard' }) => {
  const { permissions, isAuthenticated, roleKey, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role ?? roleKey;
  if (permission && !hasPermission(permission, permissions, role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default PermissionRoute;
