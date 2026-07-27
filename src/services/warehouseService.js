// src/services/warehouseService.js
import api from "./api";

// ==========================================
// Warehouse API Service
// ==========================================

/**
 * Fetch all warehouses with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, type, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getWarehouses = (params = {}) => {
  return api.get("/warehouses", { params });
};

/**
 * Fetch a single warehouse by ID
 * @param {number|string} id - Warehouse ID
 * @returns {Promise} - Axios response
 */
export const getWarehouseById = (id) => {
  return api.get(`/warehouses/${id}`);
};

/**
 * Create a new warehouse
 * @param {Object} data - Warehouse form data
 * @param {string} data.name - Warehouse name
 * @param {string} data.code - Warehouse code (unique)
 * @param {string} data.type - Warehouse type (raw, finished, packaging, other)
 * @param {string} data.location - Physical location
 * @param {string} data.manager - Responsible manager
 * @param {string} data.description - Warehouse description
 * @param {string} data.status - Status (active, inactive, maintenance)
 * @param {boolean} data.isDefault - Is this the default warehouse
 * @returns {Promise} - Axios response
 */
export const createWarehouse = (data) => {
  return api.post("/warehouses", data);
};

/**
 * Update an existing warehouse
 * @param {number|string} id - Warehouse ID
 * @param {Object} data - Updated warehouse data
 * @returns {Promise} - Axios response
 */
export const updateWarehouse = (id, data) => {
  return api.put(`/warehouses/${id}`, data);
};

/**
 * Partially update warehouse status
 * @param {number|string} id - Warehouse ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (active, inactive, maintenance)
 * @returns {Promise} - Axios response
 */
export const updateWarehouseStatus = (id, data) => {
  return api.patch(`/warehouses/${id}/status`, data);
};

/**
 * Delete a warehouse (soft delete)
 * @param {number|string} id - Warehouse ID
 * @returns {Promise} - Axios response
 */
export const deleteWarehouse = (id) => {
  return api.delete(`/warehouses/${id}`);
};

/**
 * Force delete a warehouse (permanent)
 * @param {number|string} id - Warehouse ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteWarehouse = (id) => {
  return api.delete(`/warehouses/${id}/force`);
};

/**
 * Restore a soft-deleted warehouse
 * @param {number|string} id - Warehouse ID
 * @returns {Promise} - Axios response
 */
export const restoreWarehouse = (id) => {
  return api.post(`/warehouses/${id}/restore`);
};

/**
 * Transfer products between warehouses
 * @param {Object} data - Transfer data
 * @param {number|string} data.fromWarehouse - Source warehouse ID
 * @param {number|string} data.toWarehouse - Destination warehouse ID
 * @param {number|string} data.product - Product ID
 * @param {number} data.quantity - Quantity to transfer
 * @param {string} data.reason - Reason for transfer
 * @returns {Promise} - Axios response
 */
export const transferProducts = (data) => {
  return api.post("/warehouses/transfer", data);
};

/**
 * Fetch warehouse statistics / KPIs
 * @param {Object} params - Optional filters (status, type)
 * @returns {Promise} - Axios response
 */
export const getWarehouseStatistics = (params = {}) => {
  return api.get("/warehouses/statistics", { params });
};

/**
 * Export warehouses to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportWarehouses = (params = {}) => {
  return api.get("/warehouses/export", { 
    params, 
    responseType: "blob" 
  });
};

/**
 * Fetch all available warehouse types (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getWarehouseTypes = () => {
  return api.get("/warehouses/types");
};

/**
 * Fetch all available warehouse statuses (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getWarehouseStatuses = () => {
  return api.get("/warehouses/statuses");
};