// src/services/dashboardService.js
import api from './api';
import { unwrapData, toArray, ensureArray } from '../utils/apiHelpers';

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeChartData = (chartData) => ({
  labels: ensureArray(chartData?.labels),
  revenue: ensureArray(chartData?.revenue),
  orders: ensureArray(chartData?.orders),
  production: ensureArray(chartData?.production),
  invoices: ensureArray(chartData?.invoices),
});

const normalizeKpiBlock = (kpi) => {
  if (!kpi || typeof kpi !== 'object') return kpi;

  return Object.fromEntries(
    Object.entries(kpi).map(([key, metric]) => {
      if (!metric || typeof metric !== 'object') return [key, metric];
      return [key, { ...metric, trend: ensureArray(metric.trend) }];
    }),
  );
};

const normalizeDashboardStats = (payload) => {
  const data = unwrapData(payload);
  if (!data || typeof data !== 'object') return data;

  return {
    ...data,
    kpi: normalizeKpiBlock(data.kpi),
    distribution: data.distribution && typeof data.distribution === 'object'
      ? data.distribution
      : {},
  };
};

export const normalizeTopProducts = (payload) => {
  const list = toArray(payload);
  if (!list.length) return [];

  const normalized = list.map((item, index) => {
    const units = toNumber(item.units ?? item.stock_quantity ?? item.quantity ?? item.sales);
    const unitPrice = toNumber(item.price ?? item.unit_price);
    const amount = toNumber(
      item.amount ?? item.revenue ?? item.total ?? item.total_sales ?? item.total_amount ?? units * unitPrice
    );

    return {
      id: item.id ?? index,
      name: item.name ?? item.product_name ?? 'Produit',
      units,
      amount,
      progress: toNumber(item.progress),
    };
  });

  const maxUnits = Math.max(...normalized.map((product) => product.units), 1);

  return normalized.map((product) => ({
    ...product,
    progress: product.progress > 0 ? product.progress : Math.round((product.units / maxUnits) * 100),
  }));
};

export const normalizeDashboardOrders = (payload) => {
  const list = toArray(payload);

  return list.map((order, index) => ({
    id: order.id ?? order.order_number ?? `#${index + 1}`,
    customer: order.customer ?? order.customer_name ?? order.customer?.name ?? '—',
    rep: order.rep ?? order.representative ?? order.assigned_to ?? '—',
    status: order.status ?? 'pending',
    statusColor: order.statusColor ?? order.status_color ?? 'info',
    amount: toNumber(order.amount ?? order.total_amount ?? order.total),
  }));
};

export const normalizeProductionItems = (payload) => {
  const list = toArray(payload);

  return list.map((item, index) => ({
    id: item.id ?? index,
    name: item.name ?? item.product_name ?? 'Production',
    progress: toNumber(item.progress),
    workshop: item.workshop ?? item.assigned_to ?? item.status ?? '—',
    img: item.img ?? item.image ?? '',
  }));
};

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
const DASHBOARD_REQUEST_TIMEOUT_MS = 30000;

const dashboardGet = (url, config = {}) =>
  api.get(url, { timeout: DASHBOARD_REQUEST_TIMEOUT_MS, ...config });

const dashboardService = {
  getDashboardStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const url = `/dashboard/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    return normalizeDashboardStats(response);
  },

  getDashboardAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.metric) queryParams.append('metric', params.metric);

    const url = `/dashboard/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    const data = unwrapData(response);

    return {
      ...data,
      chartData: normalizeChartData(data?.chartData),
    };
  },

  getRecentOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    if (params.status) queryParams.append('status', params.status);

    const url = `/dashboard/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    return normalizeDashboardOrders(response);
  },

  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.unread_only) queryParams.append('unread_only', params.unread_only);

    const url = `/dashboard/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    const data = unwrapData(response);
    return Array.isArray(data) ? data : data?.data || [];
  },

  getProductionStatus: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.workshop) queryParams.append('workshop', params.workshop);

    const url = `/dashboard/production${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    return normalizeProductionItems(response);
  },

  getTopProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.period) queryParams.append('period', params.period);
    if (params.category) queryParams.append('category', params.category);

    const url = `/dashboard/top-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await dashboardGet(url);
    return normalizeTopProducts(response);
  },
};

export default dashboardService;
