// src/services/roleService.js
import api from "./api";

// ==========================================
// Role & Permission API Service
// ==========================================

/**
 * Fetch all roles with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getRoles = (params = {}) => {
  return api.get("/roles", { params });
};

/**
 * Fetch a single role by ID
 * @param {number|string} id - Role ID
 * @returns {Promise} - Axios response
 */
export const getRoleById = (id) => {
  return api.get(`/roles/${id}`);
};

/**
 * Create a new role
 * @param {Object} data - Role form data
 * @param {string} data.name - Role name (unique, slug)
 * @param {string} data.display_name - Display name
 * @param {string} data.description - Role description
 * @param {string} data.status - Status (active, inactive)
 * @param {boolean} data.is_system - Is system role (cannot be deleted)
 * @param {Array} data.permissions - Array of permission IDs
 * @returns {Promise} - Axios response
 */
export const createRole = (data) => {
  return api.post("/roles", data);
};

/**
 * Update an existing role
 * @param {number|string} id - Role ID
 * @param {Object} data - Updated role data
 * @returns {Promise} - Axios response
 */
export const updateRole = (id, data) => {
  return api.put(`/roles/${id}`, data);
};

/**
 * Delete a role
 * @param {number|string} id - Role ID
 * @returns {Promise} - Axios response
 */
export const deleteRole = (id) => {
  return api.delete(`/roles/${id}`);
};

/**
 * Duplicate a role with a new name
 * @param {number|string} id - Role ID to duplicate
 * @param {Object} data - Duplication data
 * @param {string} data.name - New role name
 * @param {string} data.display_name - New display name
 * @returns {Promise} - Axios response
 */
export const duplicateRole = (id, data) => {
  return api.post(`/roles/${id}/duplicate`, data);
};

/**
 * Toggle role status
 * @param {number|string} id - Role ID
 * @param {Object} data - Status data
 * @param {string} data.status - New status (active, inactive)
 * @returns {Promise} - Axios response
 */
export const toggleRoleStatus = (id, data) => {
  return api.patch(`/roles/${id}/status`, data);
};

/**
 * Get permissions for a specific role
 * @param {number|string} id - Role ID
 * @returns {Promise} - Axios response
 */
export const getRolePermissions = (id) => {
  return api.get(`/roles/${id}/permissions`);
};

/**
 * Update permissions for a specific role
 * @param {number|string} id - Role ID
 * @param {Object} data - Permissions data
 * @param {Array} data.permissions - Array of permission IDs
 * @returns {Promise} - Axios response
 */
export const updateRolePermissions = (id, data) => {
  return api.patch(`/roles/${id}/permissions`, data);
};

/**
 * Get users assigned to a role
 * @param {number|string} id - Role ID
 * @param {Object} params - Pagination params
 * @returns {Promise} - Axios response
 */
export const getRoleUsers = (id, params = {}) => {
  return api.get(`/roles/${id}/users`, { params });
};

/**
 * Add a user to a role
 * @param {number|string} roleId - Role ID
 * @param {Object} data - User data
 * @param {number|string} data.userId - User ID
 * @returns {Promise} - Axios response
 */
export const addUserToRole = (roleId, data) => {
  return api.post(`/roles/${roleId}/users`, data);
};

/**
 * Remove a user from a role
 * @param {number|string} roleId - Role ID
 * @param {number|string} userId - User ID
 * @returns {Promise} - Axios response
 */
export const removeUserFromRole = (roleId, userId) => {
  return api.delete(`/roles/${roleId}/users/${userId}`);
};

/**
 * Fetch role statistics / KPIs
 * @param {Object} params - Optional filters
 * @returns {Promise} - Axios response
 */
export const getRoleStatistics = (params = {}) => {
  return api.get("/roles/statistics", { params });
};

/**
 * Export roles to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportRoles = (params = {}) => {
  return api.get("/roles/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get all available role statuses
 * @returns {Promise} - Axios response
 */
export const getRoleStatuses = () => {
  return api.get("/roles/statuses");
};

/**
 * Get all available permission modules
 * @returns {Promise} - Axios response
 */
export const getPermissionModules = () => {
  return api.get("/permissions/modules");
};

/**
 * Get all permissions
 * @param {Object} params - Query parameters (module, status, search)
 * @returns {Promise} - Axios response
 */
export const getPermissions = (params = {}) => {
  return api.get("/permissions", { params });
};

/**
 * Fetch a single permission by ID
 * @param {number|string} id - Permission ID
 * @returns {Promise} - Axios response
 */
export const getPermissionById = (id) => {
  return api.get(`/permissions/${id}`);
};

/**
 * Create a new permission
 * @param {Object} data - Permission form data
 * @param {string} data.name - Permission name (unique, slug)
 * @param {string} data.display_name - Display name
 * @param {string} data.description - Permission description
 * @param {string} data.module - Module name (users, products, orders, etc.)
 * @param {string} data.status - Status (active, inactive)
 * @param {string} data.guard_name - Guard name (default: web)
 * @returns {Promise} - Axios response
 */
export const createPermission = (data) => {
  return api.post("/permissions", data);
};

/**
 * Update an existing permission
 * @param {number|string} id - Permission ID
 * @param {Object} data - Updated permission data
 * @returns {Promise} - Axios response
 */
export const updatePermission = (id, data) => {
  return api.put(`/permissions/${id}`, data);
};

/**
 * Delete a permission
 * @param {number|string} id - Permission ID
 * @returns {Promise} - Axios response
 */
export const deletePermission = (id) => {
  return api.delete(`/permissions/${id}`);
};

/**
 * Toggle permission status
 * @param {number|string} id - Permission ID
 * @param {Object} data - Status data
 * @param {string} data.status - New status (active, inactive)
 * @returns {Promise} - Axios response
 */
export const togglePermissionStatus = (id, data) => {
  return api.patch(`/permissions/${id}/status`, data);
};

/**
 * Get all available permission statuses
 * @returns {Promise} - Axios response
 */
export const getPermissionStatuses = () => {
  return api.get("/permissions/statuses");
};

/**
 * Get all permissions grouped by module
 * @returns {Promise} - Axios response
 */
export const getPermissionsGroupedByModule = () => {
  return api.get("/permissions/grouped");
};

/**
 * Export permissions to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportPermissions = (params = {}) => {
  return api.get("/permissions/export", {
    params,
    responseType: "blob"
  });
};