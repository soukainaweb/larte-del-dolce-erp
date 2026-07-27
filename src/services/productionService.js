// src/services/productionService.js
import api from "./api";

// ==========================================
// Production API Service
// ==========================================

/**
 * Fetch all productions with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, status, priority, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getProductions = (params = {}) => {
  return api.get("/productions", { params });
};

/**
 * Fetch a single production by ID
 * @param {number|string} id - Production ID
 * @returns {Promise} - Axios response
 */
export const getProductionById = (id) => {
  return api.get(`/productions/${id}`);
};

/**
 * Create a new production
 * @param {Object} data - Production form data
 * @param {string} data.name - Production name
 * @param {string} data.orderId - Order ID reference
 * @param {string} data.product - Product being produced
 * @param {number} data.quantity - Quantity to produce
 * @param {string} data.status - Status (pending, in_progress, paused, completed, cancelled)
 * @param {string} data.priority - Priority (low, medium, high)
 * @param {number} data.progress - Progress percentage (0-100)
 * @param {string} data.assignedTo - Person assigned to this production
 * @param {string} data.startDate - Start date (YYYY-MM-DD)
 * @param {string} data.endDate - End date (YYYY-MM-DD)
 * @param {string} data.notes - Additional notes
 * @returns {Promise} - Axios response
 */
export const createProduction = (data) => {
  return api.post("/productions", data);
};

/**
 * Update an existing production
 * @param {number|string} id - Production ID
 * @param {Object} data - Updated production data
 * @returns {Promise} - Axios response
 */
export const updateProduction = (id, data) => {
  return api.put(`/productions/${id}`, data);
};

/**
 * Update production status
 * @param {number|string} id - Production ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (pending, in_progress, paused, completed, cancelled)
 * @returns {Promise} - Axios response
 */
export const updateProductionStatus = (id, data) => {
  return api.patch(`/productions/${id}/status`, data);
};

/**
 * Update production progress
 * @param {number|string} id - Production ID
 * @param {Object} data - Progress update data
 * @param {number} data.progress - New progress percentage (0-100)
 * @returns {Promise} - Axios response
 */
export const updateProductionProgress = (id, data) => {
  return api.patch(`/productions/${id}/progress`, data);
};

/**
 * Delete a production
 * @param {number|string} id - Production ID
 * @returns {Promise} - Axios response
 */
export const deleteProduction = (id) => {
  return api.delete(`/productions/${id}`);
};

/**
 * Fetch production statistics / KPIs
 * @param {Object} params - Optional filters (status, date_range)
 * @returns {Promise} - Axios response
 */
export const getProductionStatistics = (params = {}) => {
  return api.get("/productions/statistics", { params });
};

/**
 * Export productions to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportProductions = (params = {}) => {
  return api.get("/productions/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get all available production statuses
 * @returns {Promise} - Axios response
 */
export const getProductionStatuses = () => {
  return api.get("/productions/statuses");
};

/**
 * Get all available production priorities
 * @returns {Promise} - Axios response
 */
export const getProductionPriorities = () => {
  return api.get("/productions/priorities");
};

/**
 * Assign production to a team member
 * @param {number|string} id - Production ID
 * @param {Object} data - Assignment data
 * @param {string} data.assignedTo - Team member name or ID
 * @returns {Promise} - Axios response
 */
export const assignProduction = (id, data) => {
  return api.patch(`/productions/${id}/assign`, data);
};

// ==========================================
// EXPORT PAR DÉFAUT - AJOUTÉ !!!
// ==========================================
export default {
  getProductions,
  getProductionById,
  createProduction,      // ✅ Maintenant exporté
  updateProduction,      // ✅ Maintenant exporté
  deleteProduction,      // ✅ Maintenant exporté
  updateProductionStatus,
  updateProductionProgress,
  getProductionStatistics,
  exportProductions,
  getProductionStatuses,
  getProductionPriorities,
  assignProduction
};