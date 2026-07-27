// src/services/reportService.js
import api from "./api";

// ==========================================
// Reports API Service
// ==========================================

/**
 * Fetch sales overview data (KPIs and charts)
 * @param {Object} params - Query parameters (period, start_date, end_date)
 * @returns {Promise} - Axios response
 */
export const getSalesOverview = (params = {}) => {
  return api.get("/reports/sales-overview", { params });
};

/**
 * Fetch order statistics and list
 * @param {Object} params - Query parameters (page, per_page, status, client, salesRep, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getOrdersReport = (params = {}) => {
  return api.get("/reports/orders", { params });
};

/**
 * Fetch production statistics
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getProductionReport = (params = {}) => {
  return api.get("/reports/production", { params });
};

/**
 * Fetch product performance data
 * @param {Object} params - Query parameters (period, category, sort_by)
 * @returns {Promise} - Axios response
 */
export const getProductsReport = (params = {}) => {
  return api.get("/reports/products", { params });
};

/**
 * Fetch customer analytics
 * @param {Object} params - Query parameters (period, city)
 * @returns {Promise} - Axios response
 */
export const getCustomersReport = (params = {}) => {
  return api.get("/reports/customers", { params });
};

/**
 * Fetch invoice statistics
 * @param {Object} params - Query parameters (period, status, client)
 * @returns {Promise} - Axios response
 */
export const getInvoicesReport = (params = {}) => {
  return api.get("/reports/invoices", { params });
};

/**
 * Fetch delivery statistics
 * @param {Object} params - Query parameters (period, status, city)
 * @returns {Promise} - Axios response
 */
export const getDeliveriesReport = (params = {}) => {
  return api.get("/reports/deliveries", { params });
};

/**
 * Fetch sales representatives performance
 * @param {Object} params - Query parameters (period)
 * @returns {Promise} - Axios response
 */
export const getSalesRepsReport = (params = {}) => {
  return api.get("/reports/sales-reps", { params });
};

/**
 * Fetch yearly comparison data
 * @param {Object} params - Query parameters (years, period)
 * @returns {Promise} - Axios response
 */
export const getYearlyComparison = (params = {}) => {
  return api.get("/reports/yearly-comparison", { params });
};

/**
 * Fetch order status distribution (Pie chart data)
 * @param {Object} params - Query parameters (period)
 * @returns {Promise} - Axios response
 */
export const getOrderStatusDistribution = (params = {}) => {
  return api.get("/reports/order-status", { params });
};

/**
 * Fetch recent activities for dashboard
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} - Axios response
 */
export const getRecentActivities = (params = {}) => {
  return api.get("/reports/activities", { params });
};

/**
 * Fetch alerts / notifications
 * @param {Object} params - Query parameters (type, limit)
 * @returns {Promise} - Axios response
 */
export const getAlerts = (params = {}) => {
  return api.get("/reports/alerts", { params });
};

/**
 * Generate a new report
 * @param {Object} data - Report generation data
 * @param {string} data.name - Report name
 * @param {string} data.type - Report type (Ventes, Commandes, Production, Financier, Clients, Produits)
 * @param {string} data.period - Period (Mensuel, Hebdomadaire, Trimestriel, Annuel)
 * @param {string} data.parameters - Optional parameters for the report
 * @returns {Promise} - Axios response
 */
export const generateReport = (data) => {
  return api.post("/reports/generate", data);
};

/**
 * Fetch all generated reports
 * @param {Object} params - Query parameters (page, per_page, type, status, created_by)
 * @returns {Promise} - Axios response
 */
export const getGeneratedReports = (params = {}) => {
  return api.get("/reports/list", { params });
};

/**
 * Fetch a single generated report by ID
 * @param {number|string} id - Report ID
 * @returns {Promise} - Axios response
 */
export const getGeneratedReportById = (id) => {
  return api.get(`/reports/list/${id}`);
};

/**
 * Download a generated report file
 * @param {number|string} id - Report ID
 * @param {string} format - Download format (pdf, excel, csv)
 * @returns {Promise} - Axios response (blob)
 */
export const downloadReport = (id, format = "pdf") => {
  return api.get(`/reports/list/${id}/download`, {
    params: { format },
    responseType: "blob"
  });
};

/**
 * Delete a generated report
 * @param {number|string} id - Report ID
 * @returns {Promise} - Axios response
 */
export const deleteGeneratedReport = (id) => {
  return api.delete(`/reports/list/${id}`);
};

/**
 * Export any report data to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, type, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportReportData = (params = {}) => {
  return api.get("/reports/export", {
    params,
    responseType: "blob"
  });
};