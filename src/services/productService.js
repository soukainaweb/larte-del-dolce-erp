// src/services/productService.js
import api from "./api";

// ==========================================
// Product API Service
// ==========================================

/**
 * Fetch all products with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, status, category, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getProducts = (params = {}) => {
  return api.get("/products", { params });
};

/**
 * Fetch a single product by ID
 * @param {number|string} id - Product ID
 * @returns {Promise} - Axios response
 */
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

/**
 * Create a new product
 * @param {Object} data - Product form data
 * @param {string} data.name - Product name
 * @param {string} data.sku - Product SKU (unique)
 * @param {string} data.category - Product category
 * @param {number} data.price - Product price
 * @param {number} data.stock - Stock quantity
 * @param {string} data.status - Status (active, inactive, out_of_stock, low_stock)
 * @param {string} data.description - Product description
 * @param {string|File} data.image - Base64 string or File object for upload
 * @returns {Promise} - Axios response
 */
export const createProduct = (data) => {
  // If image is a File object, use FormData
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/products", data);
};

/**
 * Update an existing product
 * @param {number|string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise} - Axios response
 */
export const updateProduct = (id, data) => {
  // Handle file upload with FormData if image is a File
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image instanceof File) {
        formData.append('image', data.image);
      } else {
        formData.append(key, data[key]);
      }
    });
    // Use POST with _method override for Laravel
    formData.append("_method", "PUT");
    return api.post(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.put(`/products/${id}`, data);
};

/**
 * Delete a product (soft delete)
 * @param {number|string} id - Product ID
 * @returns {Promise} - Axios response
 */
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

/**
 * Force delete a product (permanent)
 * @param {number|string} id - Product ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteProduct = (id) => {
  return api.delete(`/products/${id}/force`);
};

/**
 * Restore a soft-deleted product
 * @param {number|string} id - Product ID
 * @returns {Promise} - Axios response
 */
export const restoreProduct = (id) => {
  return api.post(`/products/${id}/restore`);
};

/**
 * Update product stock level
 * @param {number|string} id - Product ID
 * @param {Object} data - Stock update data
 * @param {number} data.quantity - New stock quantity
 * @param {string} data.reason - Reason for stock adjustment
 * @returns {Promise} - Axios response
 */
export const updateProductStock = (id, data) => {
  return api.patch(`/products/${id}/stock`, data);
};

/**
 * Update product status
 * @param {number|string} id - Product ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (active, inactive, out_of_stock, low_stock)
 * @returns {Promise} - Axios response
 */
export const updateProductStatus = (id, data) => {
  return api.patch(`/products/${id}/status`, data);
};

/**
 * Fetch product statistics / KPIs
 * @param {Object} params - Optional filters (status, category)
 * @returns {Promise} - Axios response
 */
export const getProductStatistics = (params = {}) => {
  return api.get("/products/statistics", { params });
};

/**
 * Export products to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportProducts = (params = {}) => {
  return api.get("/products/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Upload product image
 * @param {number|string} id - Product ID
 * @param {File} file - Image file to upload
 * @returns {Promise} - Axios response
 */
export const uploadProductImage = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post(`/products/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

/**
 * Fetch all available product categories (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getProductCategories = () => {
  return api.get("/products/categories");
};

/**
 * Fetch all available product statuses (for dropdowns)
 * @returns {Promise} - Axios response
 */
export const getProductStatuses = () => {
  return api.get("/products/statuses");
};