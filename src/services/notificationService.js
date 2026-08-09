// src/services/notificationService.js
import api from "./api";
import {
  fetchNotificationPage as fetchNotificationPageHelper,
  unwrapNotificationStatistics,
  unwrapPaginated,
  normalizeNotificationRecord,
} from "../utils/apiHelpers";

// Re-export shared notification parsers for a single import surface.
export {
  unwrapNotificationStatistics,
  unwrapPaginated,
  normalizeNotificationRecord,
};

/**
 * Fetch a paginated notification list with normalized items and meta.
 */
export const fetchNotificationPage = async (params = {}) => {
  const response = await getNotifications(params);
  const { items, meta } = unwrapPaginated(response);

  return {
    items: items.map(normalizeNotificationRecord).filter(Boolean),
    meta,
  };
};

// ==========================================
// Notification API Service
// ==========================================

/**
 * Fetch all notifications with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, module, priority, status, period, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getNotifications = (params = {}) => {
  return api.get("/notifications", { params });
};

/**
 * Fetch a single notification by ID
 * @param {number|string} id - Notification ID
 * @returns {Promise} - Axios response
 */
export const getNotificationById = (id) => {
  return api.get(`/notifications/${id}`);
};

/**
 * Mark a notification as read
 * @param {number|string} id - Notification ID
 * @returns {Promise} - Axios response
 */
export const markNotificationAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

/**
 * Mark multiple notifications as read
 * @param {Object} data - Data containing IDs to mark as read
 * @param {Array} data.ids - Array of notification IDs
 * @returns {Promise} - Axios response
 */
export const markMultipleAsRead = (data) => {
  return api.patch("/notifications/mark-read", data);
};

/**
 * Mark all notifications as read for the current user
 * @returns {Promise} - Axios response
 */
export const markAllAsRead = () => {
  return api.patch("/notifications/mark-all-read");
};

/**
 * Delete a notification
 * @param {number|string} id - Notification ID
 * @returns {Promise} - Axios response
 */
export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

/**
 * Delete multiple notifications
 * @param {Object} data - Data containing IDs to delete
 * @param {Array} data.ids - Array of notification IDs
 * @returns {Promise} - Axios response
 */
export const deleteMultipleNotifications = (data) => {
  return api.delete("/notifications/batch", { data });
};

/**
 * Delete all read notifications for the current user
 * @returns {Promise} - Axios response
 */
export const deleteAllReadNotifications = () => {
  return api.delete("/notifications/read");
};

/**
 * Fetch notification statistics / KPIs
 * @param {Object} params - Optional filters (period)
 * @returns {Promise} - Axios response
 */
export const getNotificationStatistics = (params = {}) => {
  return api.get("/notifications/statistics", { params });
};

/**
 * Export notifications to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportNotifications = (params = {}) => {
  return api.get("/notifications/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get all available notification modules
 * @returns {Promise} - Axios response
 */
export const getNotificationModules = () => {
  return api.get("/notifications/modules");
};

/**
 * Get all available notification priorities
 * @returns {Promise} - Axios response
 */
export const getNotificationPriorities = () => {
  return api.get("/notifications/priorities");
};

/**
 * Get unread notifications count for the current user
 * @returns {Promise} - Axios response
 */
export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

/**
 * Create a new notification (admin/system use)
 * @param {Object} data - Notification data
 * @param {string} data.title - Notification title
 * @param {string} data.description - Notification description
 * @param {string} data.module - Module name (Commandes, Clients, etc.)
 * @param {string} data.priority - Priority (low, medium, high, critical)
 * @param {string} data.entityId - Related entity reference ID
 * @param {string} data.type - Notification type (order, production, etc.)
 * @param {number} data.userId - Target user ID (optional, null for all admins)
 * @returns {Promise} - Axios response
 */
export const createNotification = (data) => {
  return api.post("/notifications", data);
};

// ==========================================
// EXPORT PAR DÉFAUT - AJOUTÉ !!!
// ==========================================
export default {
  getNotifications,
  fetchNotificationPage,
  getNotificationById,
  markNotificationAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllReadNotifications,  // ✅ Maintenant exporté
  getNotificationStatistics,
  exportNotifications,
  getNotificationModules,
  getNotificationPriorities,
  getUnreadCount,
  createNotification
};