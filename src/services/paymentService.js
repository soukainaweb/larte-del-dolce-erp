// src/services/paymentService.js
import api from "./api";

// ==========================================
// Payment API Service
// ==========================================

/**
 * Fetch all payments with optional filters, sorting, and pagination
 * @param {Object} params - Query parameters (page, per_page, search, status, method, date_from, date_to, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getPayments = (params = {}) => {
  return api.get("/payments", { params });
};

/**
 * Fetch a single payment by ID
 * @param {number|string} id - Payment ID
 * @returns {Promise} - Axios response
 */
export const getPaymentById = (id) => {
  return api.get(`/payments/${id}`);
};

/**
 * Fetch a payment by payment ID (PAY-XXXXXX)
 * @param {string} paymentId - Payment reference ID
 * @returns {Promise} - Axios response
 */
export const getPaymentByReference = (paymentId) => {
  return api.get(`/payments/reference/${paymentId}`);
};

/**
 * Create a new payment
 * @param {Object} data - Payment form data
 * @param {string} data.customer - Customer name
 * @param {string} data.invoiceNumber - Invoice reference number
 * @param {string} data.date - Payment date (YYYY-MM-DD)
 * @param {string} data.method - Payment method (cash, card, mada, stc_pay, apple_pay, bank_transfer, online)
 * @param {number} data.amountReceived - Amount received
 * @param {string} data.reference - Transaction reference ID
 * @param {string} data.notes - Additional notes
 * @param {number} data.amount - Total payment amount (calculated)
 * @param {number} data.remainingAmount - Remaining balance (calculated)
 * @param {string} data.status - Payment status (paid, pending, partial, overdue)
 * @param {string} data.collectedBy - Employee who collected the payment
 * @returns {Promise} - Axios response
 */
export const createPayment = (data) => {
  return api.post("/payments", data);
};

/**
 * Update an existing payment
 * @param {number|string} id - Payment ID
 * @param {Object} data - Updated payment data
 * @returns {Promise} - Axios response
 */
export const updatePayment = (id, data) => {
  return api.put(`/payments/${id}`, data);
};

/**
 * Delete a payment (soft delete)
 * @param {number|string} id - Payment ID
 * @returns {Promise} - Axios response
 */
export const deletePayment = (id) => {
  return api.delete(`/payments/${id}`);
};

/**
 * Force delete a payment (permanent)
 * @param {number|string} id - Payment ID
 * @returns {Promise} - Axios response
 */
export const forceDeletePayment = (id) => {
  return api.delete(`/payments/${id}/force`);
};

/**
 * Restore a soft-deleted payment
 * @param {number|string} id - Payment ID
 * @returns {Promise} - Axios response
 */
export const restorePayment = (id) => {
  return api.post(`/payments/${id}/restore`);
};

/**
 * Update payment status
 * @param {number|string} id - Payment ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (paid, pending, partial, overdue)
 * @returns {Promise} - Axios response
 */
export const updatePaymentStatus = (id, data) => {
  return api.patch(`/payments/${id}/status`, data);
};

/**
 * Fetch payment statistics / KPIs
 * @param {Object} params - Optional filters (date_from, date_to, status, method)
 * @returns {Promise} - Axios response
 */
export const getPaymentStatistics = (params = {}) => {
  return api.get("/payments/statistics", { params });
};

/**
 * Export payments to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportPayments = (params = {}) => {
  return api.get("/payments/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Fetch invoice details for payment processing
 * @param {string} invoiceNumber - Invoice number to lookup
 * @returns {Promise} - Axios response
 */
export const getInvoiceDetails = (invoiceNumber) => {
  return api.get(`/payments/invoice/${invoiceNumber}`);
};

/**
 * Fetch all available payment methods
 * @returns {Promise} - Axios response
 */
export const getPaymentMethods = () => {
  return api.get("/payments/methods");
};

/**
 * Fetch all available payment statuses
 * @returns {Promise} - Axios response
 */
export const getPaymentStatuses = () => {
  return api.get("/payments/statuses");
};

/**
 * Send payment receipt email to customer
 * @param {number|string} id - Payment ID
 * @param {Object} data - Receipt data
 * @param {boolean} data.sendCopy - Send a copy to the logged-in user
 * @returns {Promise} - Axios response
 */
export const sendPaymentReceipt = (id, data = {}) => {
  return api.post(`/payments/${id}/receipt`, data);
};

/**
 * Print payment receipt
 * @param {number|string} id - Payment ID
 * @param {string} format - Print format (html, pdf)
 * @returns {Promise} - Axios response (blob)
 */
export const printPaymentReceipt = (id, format = "html") => {
  return api.get(`/payments/${id}/print`, {
    params: { format },
    responseType: "blob"
  });
};