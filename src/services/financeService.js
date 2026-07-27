// src/services/financeService.js
import api from "./api";

// ==========================================
// Finance API Service
// ==========================================

/**
 * Fetch finance dashboard metrics (KPIs)
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getFinanceMetrics = (params = {}) => {
  return api.get("/finance/metrics", { params });
};

/**
 * Fetch revenue vs expenses chart data
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getRevenueExpensesData = (params = {}) => {
  return api.get("/finance/revenue-expenses", { params });
};

/**
 * Fetch expense category distribution (Pie chart data)
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getExpenseCategories = (params = {}) => {
  return api.get("/finance/expense-categories", { params });
};

/**
 * Fetch recent transactions
 * @param {Object} params - Query parameters (page, per_page, type, status, date_from, date_to, sort_by, sort_order)
 * @returns {Promise} - Axios response
 */
export const getRecentTransactions = (params = {}) => {
  return api.get("/finance/transactions", { params });
};

/**
 * Fetch pending customer payments
 * @param {Object} params - Query parameters (page, per_page, status, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getPendingCustomerPayments = (params = {}) => {
  return api.get("/finance/payments/customers", { params });
};

/**
 * Fetch pending supplier payments
 * @param {Object} params - Query parameters (page, per_page, status, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getPendingSupplierPayments = (params = {}) => {
  return api.get("/finance/payments/suppliers", { params });
};

/**
 * Fetch top customers by revenue
 * @param {Object} params - Query parameters (limit, period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getTopCustomers = (params = {}) => {
  return api.get("/finance/customers/top", { params });
};

/**
 * Fetch top suppliers by purchase amount
 * @param {Object} params - Query parameters (limit, period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getTopSuppliers = (params = {}) => {
  return api.get("/finance/suppliers/top", { params });
};

/**
 * Fetch financial notifications / alerts
 * @param {Object} params - Query parameters (type, limit)
 * @returns {Promise} - Axios response
 */
export const getFinanceNotifications = (params = {}) => {
  return api.get("/finance/notifications", { params });
};

/**
 * Fetch summary stats for quick financial overview
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getFinanceSummary = (params = {}) => {
  return api.get("/finance/summary", { params });
};

/**
 * Export financial data to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, type, period, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportFinanceData = (params = {}) => {
  return api.get("/finance/export", {
    params,
    responseType: "blob"
  });
};

/**
 * Create a new transaction (income or expense)
 * @param {Object} data - Transaction data
 * @param {string} data.type - Type (Payment, Expense, Refund)
 * @param {number} data.amount - Amount
 * @param {string} data.customer - Customer or supplier name
 * @param {string} data.method - Payment method (Mada, Card, Bank Transfer, Cash, STC Pay)
 * @param {string} data.date - Transaction date
 * @param {string} data.notes - Additional notes
 * @returns {Promise} - Axios response
 */
export const createTransaction = (data) => {
  return api.post("/finance/transactions", data);
};

/**
 * Update an existing transaction
 * @param {number|string} id - Transaction ID
 * @param {Object} data - Updated transaction data
 * @returns {Promise} - Axios response
 */
export const updateTransaction = (id, data) => {
  return api.put(`/finance/transactions/${id}`, data);
};

/**
 * Delete a transaction
 * @param {number|string} id - Transaction ID
 * @returns {Promise} - Axios response
 */
export const deleteTransaction = (id) => {
  return api.delete(`/finance/transactions/${id}`);
};

/**
 * Get all financial settings (fiscal year, tax rates, etc.)
 * @returns {Promise} - Axios response
 */
export const getFinanceSettings = () => {
  return api.get("/finance/settings");
};

/**
 * Update financial settings
 * @param {Object} data - Settings data
 * @returns {Promise} - Axios response
 */
export const updateFinanceSettings = (data) => {
  return api.put("/finance/settings", data);
};