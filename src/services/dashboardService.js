// src/services/dashboardService.js
import api from './api';
import { unwrapData } from '../utils/apiHelpers';

/**
 * Dashboard API service — routes verified against Laravel api.php:
 *   GET /dashboard/stats
 *   GET /dashboard/analytics
 *   GET /dashboard/orders
 *   GET /dashboard/notifications
 *   GET /dashboard/production
 *   GET /dashboard/top-products
 *
 * NOT available on backend (do not call):
 *   GET /dashboard/summary
 *   PATCH /dashboard/notifications/{id}/read
 *   PATCH /dashboard/notifications/read-all
 *   DELETE /dashboard/notifications/{id}
 * Use notificationService (/notifications/*) for mark-read operations.
 */
const dashboardService = {
  getDashboardStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const url = `/dashboard/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return unwrapData(response);
  },

  getDashboardAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.metric) queryParams.append('metric', params.metric);

    const url = `/dashboard/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return unwrapData(response);
  },

  getRecentOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    if (params.status) queryParams.append('status', params.status);

    const url = `/dashboard/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    const data = unwrapData(response);
    return Array.isArray(data) ? data : data?.data || [];
  },

  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.unread_only) queryParams.append('unread_only', params.unread_only);

    const url = `/dashboard/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    const data = unwrapData(response);
    return Array.isArray(data) ? data : data?.data || [];
  },

  getProductionStatus: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.workshop) queryParams.append('workshop', params.workshop);

    const url = `/dashboard/production${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    const data = unwrapData(response);
    return Array.isArray(data) ? data : data?.data || [];
  },

  getTopProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.period) queryParams.append('period', params.period);
    if (params.category) queryParams.append('category', params.category);

    const url = `/dashboard/top-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    const data = unwrapData(response);
    return Array.isArray(data) ? data : data?.data || [];
  },
};

export default dashboardService;
