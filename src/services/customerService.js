// src/services/customerService.js
import api from "./api";

// ==========================================
// Customer API Service
// ==========================================

/**
 * Fetch all customers with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, type, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getCustomers = (params = {}) => {
  return api.get("/customers", { params });
};

/**
 * Fetch a single customer by ID
 * @param {number|string} id - Customer ID
 * @returns {Promise} - Axios response
 */
export const getCustomerById = (id) => {
  return api.get(`/customers/${id}`);
};

/**
 * Create a new customer
 * @param {Object} data - Customer form data
 * @param {string} data.name - Customer name
 * @param {string} data.email - Email address
 * @param {string} data.phone - Phone number
 * @param {string} data.address - Street address
 * @param {string} data.city - City
 * @param {string} data.country - Country
 * @param {string} data.type - Type (individual, enterprise)
 * @param {string} data.status - Status (active, inactive, suspended)
 * @param {string} data.taxId - Tax ID / VAT number
 * @param {string} data.website - Website URL
 * @param {string} data.notes - Additional notes
 * @returns {Promise} - Axios response
 */
export const createCustomer = (data) => {
  return api.post("/customers", data);
};

/**
 * Update an existing customer
 * @param {number|string} id - Customer ID
 * @param {Object} data - Updated customer data
 * @returns {Promise} - Axios response
 */
export const updateCustomer = (id, data) => {
  return api.put(`/customers/${id}`, data);
};

/**
 * Delete a customer (soft delete)
 * @param {number|string} id - Customer ID
 * @returns {Promise} - Axios response
 */
export const deleteCustomer = (id) => {
  return api.delete(`/customers/${id}`);
};

/**
 * Force delete a customer (permanent)
 * @param {number|string} id - Customer ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteCustomer = (id) => {
  return api.delete(`/customers/${id}/force`);
};

/**
 * Restore a soft-deleted customer
 * @param {number|string} id - Customer ID
 * @returns {Promise} - Axios response
 */
export const restoreCustomer = (id) => {
  return api.post(`/customers/${id}/restore`);
};

/**
 * Update customer status
 * @param {number|string} id - Customer ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (active, inactive, suspended)
 * @returns {Promise} - Axios response
 */
export const updateCustomerStatus = (id, data) => {
  return api.patch(`/customers/${id}/status`, data);
};

/**
 * Fetch customer statistics / KPIs
 * @param {Object} params - Optional filters (type, status)
 * @returns {Promise} - Axios response
 */
export const getCustomerStatistics = (params = {}) => {
  return api.get("/customers/statistics", { params });
};

/**
 * Export customers to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportCustomers = (params = {}) => {
  return api.get("/customers/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Get all available customer types (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getCustomerTypes = () => {
  return api.get("/customers/types");
};

/**
 * Get all available customer statuses (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getCustomerStatuses = () => {
  return api.get("/customers/statuses");
};

/**
 * Get customer order history
 * @param {number|string} id - Customer ID
 * @param {Object} params - Query parameters (page, per_page, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getCustomerOrders = (id, params = {}) => {
  return api.get(`/customers/${id}/orders`, { params });
};