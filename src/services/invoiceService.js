// src/services/invoiceService.js
import api from "./api";

// ==========================================
// Invoice API Service
// ==========================================

/**
 * Fetch all invoices with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, payment_status, status, date_from, date_to, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getInvoices = (params = {}) => {
  return api.get("/invoices", { params });
};

/**
 * Fetch a single invoice by ID
 * @param {number|string} id - Invoice ID
 * @returns {Promise} - Axios response
 */
export const getInvoiceById = (id) => {
  return api.get(`/invoices/${id}`);
};

/**
 * Fetch a single invoice by invoice number (INV-XXXXX)
 * @param {string} invoiceNumber - Invoice reference number
 * @returns {Promise} - Axios response
 */
export const getInvoiceByNumber = (invoiceNumber) => {
  return api.get(`/invoices/number/${invoiceNumber}`);
};

/**
 * Create a new invoice
 * @param {Object} data - Invoice form data
 * @param {string} data.customer - Customer name
 * @param {string} data.orderNumber - Order reference number
 * @param {string} data.invoiceNumber - Invoice number (auto-generated if omitted)
 * @param {string} data.invoiceDate - Invoice date (YYYY-MM-DD)
 * @param {string} data.dueDate - Due date (YYYY-MM-DD)
 * @param {string} data.paymentMethod - Payment method (cash, card, transfer, online)
 * @param {string} data.paymentStatus - Payment status (paid, unpaid, partial, overdue)
 * @param {string} data.status - Invoice status (draft, sent, paid, cancelled)
 * @param {string} data.notes - Additional notes
 * @param {Array} data.products - List of products
 * @param {number} data.deliveryFees - Delivery fees
 * @param {number} data.paidAmount - Amount already paid
 * @param {number} data.subtotal - Subtotal (calculated)
 * @param {number} data.totalVat - Total VAT (calculated)
 * @param {number} data.totalAmount - Total amount (calculated)
 * @param {boolean} data.isOverdue - Whether invoice is overdue
 * @returns {Promise} - Axios response
 */
export const createInvoice = (data) => {
  return api.post("/invoices", data);
};

/**
 * Update an existing invoice
 * @param {number|string} id - Invoice ID
 * @param {Object} data - Updated invoice data
 * @returns {Promise} - Axios response
 */
export const updateInvoice = (id, data) => {
  return api.put(`/invoices/${id}`, data);
};

/**
 * Delete an invoice (soft delete)
 * @param {number|string} id - Invoice ID
 * @returns {Promise} - Axios response
 */
export const deleteInvoice = (id) => {
  return api.delete(`/invoices/${id}`);
};

/**
 * Force delete an invoice (permanent)
 * @param {number|string} id - Invoice ID
 * @returns {Promise} - Axios response
 */
export const forceDeleteInvoice = (id) => {
  return api.delete(`/invoices/${id}/force`);
};

/**
 * Restore a soft-deleted invoice
 * @param {number|string} id - Invoice ID
 * @returns {Promise} - Axios response
 */
export const restoreInvoice = (id) => {
  return api.post(`/invoices/${id}/restore`);
};

/**
 * Update invoice payment status
 * @param {number|string} id - Invoice ID
 * @param {Object} data - Payment status update data
 * @param {string} data.paymentStatus - New payment status (paid, unpaid, partial, overdue)
 * @param {number} data.paidAmount - New paid amount
 * @returns {Promise} - Axios response
 */
export const updateInvoicePaymentStatus = (id, data) => {
  return api.patch(`/invoices/${id}/payment-status`, data);
};

/**
 * Update invoice status
 * @param {number|string} id - Invoice ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (draft, sent, paid, cancelled)
 * @returns {Promise} - Axios response
 */
export const updateInvoiceStatus = (id, data) => {
  return api.patch(`/invoices/${id}/status`, data);
};

/**
 * Fetch invoice statistics / KPIs
 * @param {Object} params - Optional filters (date_from, date_to, payment_status, status)
 * @returns {Promise} - Axios response
 */
export const getInvoiceStatistics = (params = {}) => {
  return api.get("/invoices/statistics", { params });
};

/**
 * Export invoices to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportInvoices = (params = {}) => {
  return api.get("/invoices/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Send invoice via email
 * @param {number|string} id - Invoice ID
 * @param {Object} data - Email data
 * @param {string} data.email - Recipient email address
 * @param {string} data.message - Optional custom message
 * @param {boolean} data.sendCopy - Send a copy to the logged-in user
 * @returns {Promise} - Axios response
 */
export const sendInvoiceEmail = (id, data = {}) => {
  return api.post(`/invoices/${id}/send`, data);
};

/**
 * Print invoice
 * @param {number|string} id - Invoice ID
 * @param {string} format - Print format (html, pdf)
 * @returns {Promise} - Axios response (blob)
 */
export const printInvoice = (id, format = "html") => {
  return api.get(`/invoices/${id}/print`, {
    params: { format },
    responseType: "blob"
  });
};

/**
 * Get all available invoice statuses
 * @returns {Promise} - Axios response
 */
export const getInvoiceStatuses = () => {
  return api.get("/invoices/statuses");
};

/**
 * Get all available payment statuses
 * @returns {Promise} - Axios response
 */
export const getPaymentStatuses = () => {
  return api.get("/invoices/payment-statuses");
};

/**
 * Get all available payment methods
 * @returns {Promise} - Axios response
 */
export const getPaymentMethods = () => {
  return api.get("/invoices/payment-methods");
};