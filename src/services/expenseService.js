// src/services/expenseService.js
import api from "./api";

// ==========================================
// Expense API Service
// ==========================================

/**
 * Fetch all expenses with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, category, status, date_from, date_to, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getExpenses = (params = {}) => {
  return api.get("/expenses", { params });
};

/**
 * Fetch a single expense by ID
 * @param {number|string} id - Expense ID
 * @returns {Promise} - Axios response
 */
export const getExpenseById = (id) => {
  return api.get(`/expenses/${id}`);
};

/**
 * Fetch a single expense by expense number (EXP-XXXX)
 * @param {string} expenseNumber - Expense reference number
 * @returns {Promise} - Axios response
 */
export const getExpenseByNumber = (expenseNumber) => {
  return api.get(`/expenses/number/${expenseNumber}`);
};

/**
 * Create a new expense
 * @param {Object} data - Expense form data
 * @param {string} data.expenseNumber - Expense number (auto-generated if omitted)
 * @param {string} data.date - Expense date (YYYY-MM-DD)
 * @param {string} data.category - Expense category
 * @param {string} data.supplier - Supplier name
 * @param {string} data.description - Expense description
 * @param {number} data.amount - Base amount (before VAT)
 * @param {number} data.vat - VAT percentage
 * @param {number} data.total - Total amount (calculated)
 * @param {string} data.paymentMethod - Payment method
 * @param {string} data.paymentStatus - Payment status (paid, pending, partial)
 * @param {string} data.referenceNumber - Reference number (invoice/receipt)
 * @param {string} data.notes - Additional notes
 * @param {string|File} data.attachment - Attachment file or base64 string
 * @param {number} data.createdBy - User ID of creator
 * @returns {Promise} - Axios response
 */
export const createExpense = (data) => {
  if (data.attachment && data.attachment instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data.attachment instanceof File) {
        formData.append('attachment', data.attachment);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/expenses", data);
};

/**
 * Update an existing expense
 * @param {number|string} id - Expense ID
 * @param {Object} data - Updated expense data
 * @returns {Promise} - Axios response
 */
export const updateExpense = (id, data) => {
  if (data.attachment && data.attachment instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data.attachment instanceof File) {
        formData.append('attachment', data.attachment);
      } else {
        formData.append(key, data[key]);
      }
    });
    formData.append("_method", "PUT");
    return api.post(`/expenses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.put(`/expenses/${id}`, data);
};

/**
 * Delete an expense (soft delete)
 * @param {number|string} id - Expense ID
 * @returns {Promise} - Axios response
 */
export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

/**
 * Force delete an expense (permanent)
 * @param {number|string} id - Expense ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteExpense = (id) => {
  return api.delete(`/expenses/${id}/force`);
};

/**
 * Restore a soft-deleted expense
 * @param {number|string} id - Expense ID
 * @returns {Promise} - Axios response
 */
export const restoreExpense = (id) => {
  return api.post(`/expenses/${id}/restore`);
};

/**
 * Update expense payment status
 * @param {number|string} id - Expense ID
 * @param {Object} data - Payment status update data
 * @param {string} data.paymentStatus - New status (paid, pending, partial)
 * @param {number} data.amount - Amount paid (for partial updates)
 * @returns {Promise} - Axios response
 */
export const updateExpensePaymentStatus = (id, data) => {
  return api.patch(`/expenses/${id}/payment-status`, data);
};

/**
 * Fetch expense statistics / KPIs
 * @param {Object} params - Optional filters (date_from, date_to, category, status)
 * @returns {Promise} - Axios response
 */
export const getExpenseStatistics = (params = {}) => {
  return api.get("/expenses/statistics", { params });
};

/**
 * Export expenses to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportExpenses = (params = {}) => {
  return api.get("/expenses/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Fetch all available expense categories
 * @returns {Promise} - Axios response
 */
export const getExpenseCategories = () => {
  return api.get("/expenses/categories");
};

/**
 * Fetch all available payment methods
 * @returns {Promise} - Axios response
 */
export const getPaymentMethods = () => {
  return api.get("/expenses/payment-methods");
};

/**
 * Fetch all available payment statuses
 * @returns {Promise} - Axios response
 */
export const getPaymentStatuses = () => {
  return api.get("/expenses/payment-statuses");
};

/**
 * Download expense attachment
 * @param {number|string} id - Expense ID
 * @returns {Promise} - Axios response (blob)
 */
export const downloadExpenseAttachment = (id) => {
  return api.get(`/expenses/${id}/attachment`, {
    responseType: "blob"
  });
};

// ==========================================
// EXPORT PAR DÉFAUT - AJOUTÉ !!!
// ==========================================
export default {
  getExpenses,
  getExpenseById,
  getExpenseByNumber,
  createExpense,        // ✅ Maintenant exporté
  updateExpense,        // ✅ Maintenant exporté
  deleteExpense,
  forceDeleteExpense,
  restoreExpense,
  updateExpensePaymentStatus,
  getExpenseStatistics,
  exportExpenses,
  getExpenseCategories,
  getPaymentMethods,
  getPaymentStatuses,
  downloadExpenseAttachment
};