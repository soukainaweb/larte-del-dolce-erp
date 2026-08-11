// src/services/productService.js
import api from "./api";

// ==========================================
// Product API Service
// ==========================================

const MAX_IMAGE_DIMENSION = 1600;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const compressImageFile = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    if (file.size <= MAX_IMAGE_BYTES) {
      resolve(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Image processing is unavailable in this browser."));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file."));
    };

    image.src = objectUrl;
  });

const isValidInlineImage = (value) =>
  typeof value === "string"
  && (value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://"));

/**
 * Map frontend product form data to Laravel-validated payload.
 */
export const buildProductPayload = (data = {}) => {
  const categoryId = data.category_id ?? data.categoryId ?? data.category;
  const price = Number(data.price ?? 0);
  const stockQty = Number(data.stock ?? data.stock_quantity ?? 0);

  const payload = {
    name: data.name,
    category_id:
      categoryId !== '' && categoryId != null && !Number.isNaN(Number(categoryId))
        ? Number(categoryId)
        : undefined,
    description: data.description ?? null,
    price,
    cost_price: Number(data.cost_price ?? data.costPrice ?? price ?? 0),
    stock_quantity: stockQty,
    status: data.status ?? 'active',
  };

  const sku = (data.sku ?? '').trim();
  if (sku) {
    payload.sku = sku;
  }

  if (data.image instanceof File) {
    payload.image = data.image;
  } else if (isValidInlineImage(data.image)) {
    payload.image = data.image;
  }

  return payload;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const normalizeProductPayload = async (data = {}) => {
  const payload = buildProductPayload(data);

  if (payload.image instanceof File) {
    const optimized = await compressImageFile(payload.image);
    payload.image = await readFileAsDataUrl(optimized);
  }

  return payload;
};

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
export const createProduct = async (data) => {
  const payload = await normalizeProductPayload(data);
  return api.post("/products", payload);
};

/**
 * Update an existing product
 * @param {number|string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise} - Axios response
 */
export const updateProduct = async (id, data) => {
  const payload = await normalizeProductPayload(data);
  return api.put(`/products/${id}`, payload);
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