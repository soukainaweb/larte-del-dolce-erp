// src/services/activityLogService.js
import api from "./api";

// ==========================================
// Activity Log API Service
// ==========================================

/**
 * Fetch activity logs with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, date_filter, user, module, action, level, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getActivityLogs = (params = {}) => {
  return api.get("/activity-logs", { params });
};

/**
 * Fetch a single activity log entry by ID
 * @param {number|string} id - Activity log ID
 * @returns {Promise} - Axios response
 */
export const getActivityLogById = (id) => {
  return api.get(`/activity-logs/${id}`);
};

/**
 * Fetch activity log statistics / KPIs
 * @param {Object} params - Optional filters (date_filter, user, module, level)
 * @returns {Promise} - Axios response
 */
export const getActivityLogStatistics = (params = {}) => {
  return api.get("/activity-logs/statistics", { params });
};

/**
 * Fetch chart data for activity logs
 * @param {Object} params - Query parameters (type, date_filter, period, limit)
 * @param {string} params.type - Chart type (daily, by_user, by_module, by_action, by_level)
 * @param {string} params.date_filter - Date filter (today, yesterday, week, month, all)
 * @param {number} params.limit - Number of items to return
 * @returns {Promise} - Axios response
 */
export const getActivityChartData = (params = {}) => {
  return api.get("/activity-logs/chart-data", { params });
};

/**
 * Fetch recent activity timeline
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} - Axios response
 */
export const getRecentActivities = (params = {}) => {
  return api.get("/activity-logs/recent", { params });
};

/**
 * Fetch critical activities
 * @param {Object} params - Query parameters (limit, date_filter)
 * @returns {Promise} - Axios response
 */
export const getCriticalActivities = (params = {}) => {
  return api.get("/activity-logs/critical", { params });
};

/**
 * Fetch recent user logins
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} - Axios response
 */
export const getRecentLogins = (params = {}) => {
  return api.get("/activity-logs/logins", { params });
};

/**
 * Export activity logs to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns, date_range)
 * @returns {Promise} - Axios response (blob)
 */
export const exportActivityLogs = (params = {}) => {
  return api.get("/activity-logs/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get unique users for filter dropdowns
 * @param {Object} params - Optional filters (active_only)
 * @returns {Promise} - Axios response
 */
export const getActivityUsers = (params = {}) => {
  return api.get("/activity-logs/users", { params });
};

/**
 * Get unique modules for filter dropdowns
 * @returns {Promise} - Axios response
 */
export const getActivityModules = () => {
  return api.get("/activity-logs/modules");
};

/**
 * Get unique actions for filter dropdowns
 * @returns {Promise} - Axios response
 */
export const getActivityActions = () => {
  return api.get("/activity-logs/actions");
};

/**
 * Get unique levels for filter dropdowns
 * @returns {Promise} - Axios response
 */
export const getActivityLevels = () => {
  return api.get("/activity-logs/levels");
};

/**
 * Delete an activity log entry (admin only)
 * @param {number|string} id - Activity log ID
 * @returns {Promise} - Axios response
 */
export const deleteActivityLog = (id) => {
  return api.delete(`/activity-logs/${id}`);
};

/**
 * Bulk delete activity logs (admin only)
 * @param {Object} data - Bulk delete data
 * @param {Array} data.ids - Array of activity log IDs to delete
 * @param {string} data.date_range - Date range for bulk deletion (optional)
 * @returns {Promise} - Axios response
 */
export const bulkDeleteActivityLogs = (data) => {
  return api.delete("/activity-logs/bulk", { data });
};