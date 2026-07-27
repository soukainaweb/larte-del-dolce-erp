// src/services/inventoryService.js
import api from "./api";

// ==========================================
// Inventory API Service
// ==========================================

/**
 * Fetch all inventory items with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, category, status, type, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getInventory = (params = {}) => {
  return api.get("/inventory", { params });
};

/**
 * Fetch a single inventory item by ID
 * @param {number|string} id - Inventory item ID
 * @returns {Promise} - Axios response
 */
export const getInventoryItemById = (id) => {
  return api.get(`/inventory/${id}`);
};

/**
 * Create a new inventory item (product)
 * @param {Object} data - Inventory form data
 * @param {string} data.name - Product name
 * @param {string} data.sku - Product SKU (unique)
 * @param {string} data.category - Product category
 * @param {string} data.type - Product type (finished, raw, packaging)
 * @param {number} data.currentStock - Current stock quantity
 * @param {number} data.minStock - Minimum stock level
 * @param {number} data.maxStock - Maximum stock level
 * @param {string} data.unit - Unit of measure (piece, box, kg, liter)
 * @param {string} data.status - Status (available, low_stock, out_of_stock, expired)
 * @param {number} data.stockValue - Total stock value
 * @param {string} data.batchNumber - Batch/Lot number
 * @param {string} data.expiryDate - Expiry date (YYYY-MM-DD)
 * @param {string|File} data.image - Product image
 * @returns {Promise} - Axios response
 */
export const createInventoryItem = (data) => {
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post("/inventory", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/inventory", data);
};

/**
 * Update an existing inventory item
 * @param {number|string} id - Inventory item ID
 * @param {Object} data - Updated inventory data
 * @returns {Promise} - Axios response
 */
export const updateInventoryItem = (id, data) => {
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image instanceof File) {
        formData.append('image', data.image);
      } else {
        formData.append(key, data[key]);
      }
    });
    formData.append("_method", "PUT");
    return api.post(`/inventory/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.put(`/inventory/${id}`, data);
};

/**
 * Delete an inventory item (soft delete)
 * @param {number|string} id - Inventory item ID
 * @returns {Promise} - Axios response
 */
export const deleteInventoryItem = (id) => {
  return api.delete(`/inventory/${id}`);
};

/**
 * Force delete an inventory item (permanent)
 * @param {number|string} id - Inventory item ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteInventoryItem = (id) => {
  return api.delete(`/inventory/${id}/force`);
};

/**
 * Restore a soft-deleted inventory item
 * @param {number|string} id - Inventory item ID
 * @returns {Promise} - Axios response
 */
export const restoreInventoryItem = (id) => {
  return api.post(`/inventory/${id}/restore`);
};

/**
 * Create a stock movement (add/remove/adjust)
 * @param {Object} data - Movement data
 * @param {number|string} data.productId - Product ID
 * @param {string} data.type - Movement type (in, out, adjustment)
 * @param {number} data.quantity - Quantity moved
 * @param {string} data.unit - Unit of measure
 * @param {string} data.reason - Reason (purchase, production, sale, damage, return, inventory_correction)
 * @param {string} data.notes - Additional notes
 * @returns {Promise} - Axios response
 */
export const createStockMovement = (data) => {
  return api.post("/inventory/movements", data);
};

/**
 * Fetch stock movements for a specific item
 * @param {number|string} id - Inventory item ID
 * @param {Object} params - Query parameters (page, per_page, type, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getStockMovements = (id, params = {}) => {
  return api.get(`/inventory/${id}/movements`, { params });
};

/**
 * Fetch inventory statistics / KPIs
 * @param {Object} params - Optional filters (category, type, status)
 * @returns {Promise} - Axios response
 */
export const getInventoryStatistics = (params = {}) => {
  return api.get("/inventory/statistics", { params });
};

/**
 * Export inventory to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportInventory = (params = {}) => {
  return api.get("/inventory/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Fetch all available categories
 * @returns {Promise} - Axios response
 */
export const getInventoryCategories = () => {
  return api.get("/inventory/categories");
};

/**
 * Fetch all available product types
 * @returns {Promise} - Axios response
 */
export const getInventoryTypes = () => {
  return api.get("/inventory/types");
};

/**
 * Fetch all available statuses
 * @returns {Promise} - Axios response
 */
export const getInventoryStatuses = () => {
  return api.get("/inventory/statuses");
};

/**
 * Update inventory item status
 * @param {number|string} id - Inventory item ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (available, low_stock, out_of_stock, expired)
 * @returns {Promise} - Axios response
 */
export const updateInventoryStatus = (id, data) => {
  return api.patch(`/inventory/${id}/status`, data);
};