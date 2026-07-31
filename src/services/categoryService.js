// src/services/categoryService.js
import api from "./api";

// ==========================================
// Category API Service
// ==========================================

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return !!value;
};

const normalizeParentId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return value;
};

/**
 * Map frontend category form data to Laravel-validated snake_case payload.
 */
export const buildCategoryPayload = (data = {}) => {
  const payload = {
    name: data.name,
    name_ar: data.nameAr ?? data.name_ar ?? null,
    code: data.code,
    description: data.description ?? null,
    icon: data.icon ?? null,
    color: data.color ?? null,
    status: data.status ?? 'active',
    visible: toBoolean(data.visible, true),
    featured: toBoolean(data.featured, false),
    display_order: Number(data.displayOrder ?? data.display_order ?? 0),
    parent_id: normalizeParentId(data.parentId ?? data.parentCategory ?? data.parent_id),
    show_on_pos: toBoolean(data.showOnPOS ?? data.show_on_pos, true),
    available_online: toBoolean(data.availableOnline ?? data.available_online, true),
  };

  if (data.image instanceof File) {
    payload.image = data.image;
  }

  return payload;
};

const appendCategoryFormData = (formData, payload) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'image') {
      if (value instanceof File) {
        formData.append('image', value);
      }
      return;
    }

    if (value === null || value === undefined) return;

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }

    formData.append(key, value);
  });
};

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
  const payload = buildCategoryPayload(data);

  if (payload.image instanceof File) {
    const formData = new FormData();
    appendCategoryFormData(formData, payload);
    return api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  return api.post("/categories", payload);
};

/**
 * Update an existing category
 * @param {number|string} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise} - Axios response
 */
export const updateCategory = (id, data) => {
  const payload = buildCategoryPayload(data);

  if (payload.image instanceof File) {
    const formData = new FormData();
    appendCategoryFormData(formData, payload);
    formData.append("_method", "PUT");
    return api.post(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  return api.put(`/categories/${id}`, payload);
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