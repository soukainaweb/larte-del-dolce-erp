// src/services/userServicePage.js
import api from "./api";
import {
  buildUserPayload,
  ensureArray,
  unwrapData,
} from "../utils/apiHelpers";

// ==========================================
// User Management API Service
// ==========================================

let cachedUserRoles = null;

const loadRoleCatalog = async () => {
  if (cachedUserRoles) {
    return cachedUserRoles;
  }

  const response = await getUserRoles();
  cachedUserRoles = ensureArray(unwrapData(response));
  return cachedUserRoles;
};

/**
 * Fetch all users with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, role, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getUsers = (params = {}) => {
  return api.get("/users", { params });
};

/**
 * Fetch a single user by ID
 * @param {number|string} id - User ID
 * @returns {Promise} - Axios response
 */
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

/**
 * Create a new user
 * @param {Object} data - User form data (camelCase UI fields supported)
 * @returns {Promise} - Axios response
 */
export const createUser = async (data) => {
  const roles = await loadRoleCatalog();
  const payload = buildUserPayload(data, roles);
  const response = await api.post("/users", payload);
  const body = unwrapData(response.data);
  response.temporaryPassword = body?.temporary_password ?? null;
  return response;
};

/**
 * Update an existing user
 * @param {number|string} id - User ID
 * @param {Object} data - Updated user data
 * @returns {Promise} - Axios response
 */
export const updateUser = async (id, data) => {
  const roles = await loadRoleCatalog();
  return api.put(`/users/${id}`, buildUserPayload(data, roles));
};

/**
 * Delete a user (soft delete)
 * @param {number|string} id - User ID
 * @returns {Promise} - Axios response
 */
export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

/**
 * Admin/Manager reset user password — generates new temporary password.
 */
export const resetUserPassword = async (id) => {
  const response = await api.post(`/users/${id}/reset-password`);
  const body = unwrapData(response.data);
  response.temporaryPassword = body?.temporary_password ?? null;
  return response;
};

/**
 * Force delete a user (permanent)
 * @param {number|string} id - User ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteUser = (id) => {
  return api.delete(`/users/${id}/force`);
};

/**
 * Restore a soft-deleted user
 * @param {number|string} id - User ID
 * @returns {Promise} - Axios response
 */
export const restoreUser = (id) => {
  return api.post(`/users/${id}/restore`);
};

/**
 * Update user status
 * @param {number|string} id - User ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (active, inactive, suspended, locked)
 * @returns {Promise} - Axios response
 */
export const updateUserStatus = (id, data) => {
  return api.patch(`/users/${id}/status`, data);
};

/**
 * Update user role
 * @param {number|string} id - User ID
 * @param {Object} data - Role update data
 * @param {number|string} data.role_id - New role ID
 * @returns {Promise} - Axios response
 */
export const updateUserRole = (id, data) => {
  return api.patch(`/users/${id}/role`, {
    role_id: data.role_id ?? data.roleId ?? data.role,
  });
};

/**
 * Fetch user statistics / KPIs
 * @param {Object} params - Optional filters (status, role)
 * @returns {Promise} - Axios response
 */
export const getUserStatistics = (params = {}) => {
  return api.get("/users/statistics", { params });
};

/**
 * Export users to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportUsers = (params = {}) => {
  return api.get("/users/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get all available user roles
 * @returns {Promise} - Axios response
 */
export const getUserRoles = () => {
  return api.get("/users/roles");
};

/**
 * Get all available user statuses
 * @returns {Promise} - Axios response
 */
export const getUserStatuses = () => {
  return api.get("/users/statuses");
};

/**
 * Send password reset email to user
 * @param {Object} data - Password reset data
 * @param {string} data.email - User email
 * @returns {Promise} - Axios response
 */
export const sendPasswordReset = (data) => {
  return api.post("/users/password-reset", data);
};

/**
 * Resend user invitation email
 * @param {number|string} id - User ID
 * @returns {Promise} - Axios response
 */
export const resendInvitation = (id) => {
  return api.post(`/users/${id}/resend-invitation`);
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  forceDeleteUser,
  restoreUser,
  updateUserStatus,
  updateUserRole,
  getUserStatistics,
  exportUsers,
  getUserRoles,
  getUserStatuses,
  sendPasswordReset,
  resendInvitation
};
