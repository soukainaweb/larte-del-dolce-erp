// src/services/analyticsService.js
import api from "./api";

// ==========================================
// Analytics API Service
// ==========================================

/**
 * Fetch analytics dashboard metrics / KPIs
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getAnalyticsMetrics = (params = {}) => {
  return api.get("/analytics/metrics", { params });
};

/**
 * Fetch sales overview data (monthly revenue, orders, profit)
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getSalesOverview = (params = {}) => {
  return api.get("/analytics/sales/overview", { params });
};

/**
 * Fetch order statistics and distribution
 * @param {Object} params - Query parameters (period, status, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getOrderAnalytics = (params = {}) => {
  return api.get("/analytics/orders", { params });
};

/**
 * Fetch production analytics
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getProductionAnalytics = (params = {}) => {
  return api.get("/analytics/production", { params });
};

/**
 * Fetch financial analytics (revenue vs expenses vs profit)
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getFinancialAnalytics = (params = {}) => {
  return api.get("/analytics/financial", { params });
};

/**
 * Fetch customer analytics (growth, retention, top customers)
 * @param {Object} params - Query parameters (period, city, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getCustomerAnalytics = (params = {}) => {
  return api.get("/analytics/customers", { params });
};

/**
 * Fetch product performance analytics
 * @param {Object} params - Query parameters (period, category, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getProductAnalytics = (params = {}) => {
  return api.get("/analytics/products", { params });
};

/**
 * Fetch delivery analytics
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getDeliveryAnalytics = (params = {}) => {
  return api.get("/analytics/deliveries", { params });
};

/**
 * Fetch sales representatives performance
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getSalesRepsAnalytics = (params = {}) => {
  return api.get("/analytics/sales-reps", { params });
};

/**
 * Fetch sales by region analytics
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getSalesByRegion = (params = {}) => {
  return api.get("/analytics/regions", { params });
};

/**
 * Fetch yearly comparison data
 * @param {Object} params - Query parameters (years, period)
 * @returns {Promise} - Axios response
 */
export const getYearlyComparison = (params = {}) => {
  return api.get("/analytics/yearly-comparison", { params });
};

/**
 * Fetch forecast data
 * @param {Object} params - Query parameters (period, months_ahead)
 * @returns {Promise} - Axios response
 */
export const getForecastAnalytics = (params = {}) => {
  return api.get("/analytics/forecast", { params });
};

/**
 * Fetch KPI comparison data (current vs previous vs target)
 * @param {Object} params - Query parameters (period, date_from, date_to)
 * @returns {Promise} - Axios response
 */
export const getKpiComparison = (params = {}) => {
  return api.get("/analytics/kpi-comparison", { params });
};

/**
 * Fetch radar chart performance data
 * @param {Object} params - Query parameters (period, year)
 * @returns {Promise} - Axios response
 */
export const getRadarData = (params = {}) => {
  return api.get("/analytics/radar", { params });
};

/**
 * Fetch recent activities for dashboard
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} - Axios response
 */
export const getRecentActivities = (params = {}) => {
  return api.get("/analytics/activities", { params });
};

/**
 * Fetch alerts / notifications
 * @param {Object} params - Query parameters (type, limit)
 * @returns {Promise} - Axios response
 */
export const getAlerts = (params = {}) => {
  return api.get("/analytics/alerts", { params });
};

/**
 * Export analytics data to CSV/Excel/PDF
 * @param {Object} params - Export parameters (format, type, filters, columns)
 * @returns {Promise} - Axios response (blob)
 */
export const exportAnalytics = (params = {}) => {
  return api.get("/analytics/export", {
    params,
    responseType: "blob"
  });
};