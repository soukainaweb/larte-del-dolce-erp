// src/services/categoryService.js
import api from "./api";

// ==========================================
// Category API Service
// ==========================================

/**
 * Fetch all categories with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, status, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getCategories = (params = {}) => {
  return api.get("/categories", { params });
};

/**
 * Fetch a single category by ID
 * @param {number|string} id - Category ID
 * @returns {Promise} - Axios response
 */
export const getCategoryById = (id) => {
  return api.get(`/categories/${id}`);
};

/**
 * Fetch a single category by slug
 * @param {string} slug - Category slug
 * @returns {Promise} - Axios response
 */
export const getCategoryBySlug = (slug) => {
  return api.get(`/categories/slug/${slug}`);
};

/**
 * Create a new category
 * @param {Object} data - Category form data
 * @param {string} data.name - Category name (English)
 * @param {string} data.nameAr - Category name (Arabic)
 * @param {string} data.code - Category code (unique)
 * @param {string} data.description - Category description
 * @param {string} data.icon - Icon emoji or text
 * @param {string} data.color - Color hex code
 * @param {string} data.status - Status (active, inactive, archived)
 * @param {boolean} data.visible - Visibility flag
 * @param {number} data.displayOrder - Display order
 * @param {number|null} data.parentCategory - Parent category ID (nullable)
 * @param {boolean} data.showOnPOS - Show on POS system
 * @param {boolean} data.availableOnline - Available for online orders
 * @param {boolean} data.featured - Featured category flag
 * @param {File|string} data.image - Image file or base64 string
 * @returns {Promise} - Axios response
 */
export const createCategory = (data) => {
  // Handle file upload with FormData
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image instanceof File) {
        formData.append('image', data.image);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/categories", data);
};

/**
 * Update an existing category
 * @param {number|string} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise} - Axios response
 */
export const updateCategory = (id, data) => {
  // Handle file upload with FormData
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
    return api.post(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.put(`/categories/${id}`, data);
};

/**
 * Delete a category (soft delete)
 * @param {number|string} id - Category ID
 * @returns {Promise} - Axios response
 */
export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

/**
 * Force delete a category (permanent)
 * @param {number|string} id - Category ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteCategory = (id) => {
  return api.delete(`/categories/${id}/force`);
};

/**
 * Restore a soft-deleted category
 * @param {number|string} id - Category ID
 * @returns {Promise} - Axios response
 */
export const restoreCategory = (id) => {
  return api.post(`/categories/${id}/restore`);
};

/**
 * Toggle category status (active/inactive)
 * @param {number|string} id - Category ID
 * @param {Object} data - Status data
 * @param {string} data.status - New status (active, inactive, archived)
 * @returns {Promise} - Axios response
 */
export const toggleCategoryStatus = (id, data) => {
  return api.patch(`/categories/${id}/status`, data);
};

/**
 * Toggle category visibility
 * @param {number|string} id - Category ID
 * @param {Object} data - Visibility data
 * @param {boolean} data.visible - New visibility state
 * @returns {Promise} - Axios response
 */
export const toggleCategoryVisibility = (id, data) => {
  return api.patch(`/categories/${id}/visibility`, data);
};

/**
 * Update category display order
 * @param {number|string} id - Category ID
 * @param {Object} data - Order data
 * @param {number} data.displayOrder - New display order
 * @returns {Promise} - Axios response
 */
export const updateCategoryOrder = (id, data) => {
  return api.patch(`/categories/${id}/order`, data);
};

/**
 * Fetch category statistics / KPIs
 * @param {Object} params - Optional filters (status)
 * @returns {Promise} - Axios response
 */
export const getCategoryStatistics = (params = {}) => {
  return api.get("/categories/statistics", { params });
};

/**
 * Export categories to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportCategories = (params = {}) => {
  return api.get("/categories/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Upload category image
 * @param {number|string} id - Category ID
 * @param {File} file - Image file to upload
 * @returns {Promise} - Axios response
 */
export const uploadCategoryImage = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post(`/categories/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

/**
 * Get category hierarchy/tree structure
 * @param {Object} params - Optional filters (status, visible)
 * @returns {Promise} - Axios response
 */
export const getCategoryTree = (params = {}) => {
  return api.get("/categories/tree", { params });
};

/**
 * Get all parent categories (for dropdowns)
 * @param {Object} params - Optional filters (status)
 * @returns {Promise} - Axios response
 */
export const getParentCategories = (params = {}) => {
  return api.get("/categories/parents", { params });
};

/**
 * Get all available category statuses
 * @returns {Promise} - Axios response
 */
export const getCategoryStatuses = () => {
  return api.get("/categories/statuses");
};

// ==========================================
// EXPORT PAR DÉFAUT - AJOUTÉ !!!
// ==========================================
export default {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,        // ✅ Maintenant exporté
  updateCategory,        // ✅ Maintenant exporté
  deleteCategory,
  forceDeleteCategory,
  restoreCategory,
  toggleCategoryStatus,
  toggleCategoryVisibility,
  updateCategoryOrder,
  getCategoryStatistics,
  exportCategories,
  uploadCategoryImage,
  getCategoryTree,
  getParentCategories,
  getCategoryStatuses
};