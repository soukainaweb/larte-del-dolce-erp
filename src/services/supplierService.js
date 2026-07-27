// src/services/supplierService.js
import api from "./api";

// ==========================================
// Supplier API Service
// ==========================================

/**
 * Fetch all suppliers with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, type, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getSuppliers = (params = {}) => {
  return api.get("/suppliers", { params });
};

/**
 * Fetch a single supplier by ID
 * @param {number|string} id - Supplier ID
 * @returns {Promise} - Axios response
 */
export const getSupplierById = (id) => {
  return api.get(`/suppliers/${id}`);
};

/**
 * Create a new supplier
 * @param {Object} data - Supplier form data
 * @param {string} data.name - Supplier name
 * @param {string} data.company - Company name
 * @param {string} data.type - Supplier type (raw, packaging, equipment, services, other)
 * @param {string} data.contactPerson - Contact person name
 * @param {string} data.phone - Phone number
 * @param {string} data.email - Email address
 * @param {string} data.address - Physical address
 * @param {string} data.taxId - Tax ID number
 * @param {string} data.paymentTerms - Payment terms (cash, credit, monthly)
 * @param {string} data.notes - Additional notes
 * @param {string} data.status - Status (active, inactive, pending)
 * @returns {Promise} - Axios response
 */
export const createSupplier = (data) => {
  return api.post("/suppliers", data);
};

/**
 * Update an existing supplier
 * @param {number|string} id - Supplier ID
 * @param {Object} data - Updated supplier data
 * @returns {Promise} - Axios response
 */
export const updateSupplier = (id, data) => {
  return api.put(`/suppliers/${id}`, data);
};

/**
 * Partially update supplier status
 * @param {number|string} id - Supplier ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (active, inactive, pending)
 * @returns {Promise} - Axios response
 */
export const updateSupplierStatus = (id, data) => {
  return api.patch(`/suppliers/${id}/status`, data);
};

/**
 * Delete a supplier (soft delete)
 * @param {number|string} id - Supplier ID
 * @returns {Promise} - Axios response
 */
export const deleteSupplier = (id) => {
  return api.delete(`/suppliers/${id}`);
};

/**
 * Force delete a supplier (permanent)
 * @param {number|string} id - Supplier ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteSupplier = (id) => {
  return api.delete(`/suppliers/${id}/force`);
};

/**
 * Restore a soft-deleted supplier
 * @param {number|string} id - Supplier ID
 * @returns {Promise} - Axios response
 */
export const restoreSupplier = (id) => {
  return api.post(`/suppliers/${id}/restore`);
};

/**
 * Fetch supplier statistics / KPIs
 * @param {Object} params - Optional filters (status, type)
 * @returns {Promise} - Axios response
 */
export const getSupplierStatistics = (params = {}) => {
  return api.get("/suppliers/statistics", { params });
};

/**
 * Export suppliers to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportSuppliers = (params = {}) => {
  return api.get("/suppliers/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Fetch all available supplier types (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getSupplierTypes = () => {
  return api.get("/suppliers/types");
};

/**
 * Fetch all available supplier statuses (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getSupplierStatuses = () => {
  return api.get("/suppliers/statuses");
};

/**
 * Fetch supplier purchase history
 * @param {number|string} id - Supplier ID
 * @param {Object} params - Query parameters (page, per_page, start_date, end_date)
 * @returns {Promise} - Axios response
 */
export const getSupplierPurchases = (id, params = {}) => {
  return api.get(`/suppliers/${id}/purchases`, { params });
};