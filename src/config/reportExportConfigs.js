import { SCOPE_MODE, ENTITY_SCOPE_TYPE, LARGE_EXPORT_THRESHOLD } from '../components/export/exportScopeTypes';
import { fetchAllPaginated } from '../utils/fetchAllPaginated';
import { safeArray, unwrapPaginated } from '../utils/apiHelpers';
import { getCustomers } from '../services/customerService';
import {
  getOrdersReport,
  getInvoicesReport,
  getCustomersReport,
  getDeliveriesReport,
  getProductsReport,
  getProductionReport,
  getSalesOverview,
  getYearlyComparison,
  getGeneratedReports,
} from '../services/reportService';

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && v !== 'all'));

async function searchCustomers(query = '') {
  const response = await getCustomers({ search: query || undefined, per_page: 20, page: 1 });
  return safeArray(response).map((c) => ({
    id: c.id,
    label: c.name || c.email || `#${c.id}`,
    raw: c,
  }));
}

/**
 * Per-tab export metadata and resolver configuration for ReportsPage.
 * Tabs not listed here must NOT export (no fallback).
 */
export const REPORT_TAB_EXPORT = {
  overview: {
    exportEnabled: true,
    recordKind: 'overviewRow',
    titleKey: 'overview',
    filenamePrefix: 'report_overview',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getSalesOverview,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm }),
    columns: (t, tc) => [
      { label: tc('date'), accessor: 'date', width: 15 },
      { label: t('exportScope.reports.columns.revenue'), accessor: 'revenue', width: 15 },
      { label: t('exportScope.reports.columns.orders'), accessor: 'orders', width: 12 },
      { label: t('nav.products'), accessor: 'products', width: 12 },
    ],
    rowFormatter: (item) => ({
      date: item.date || item.label || item.period || '—',
      revenue: item.revenue ?? 0,
      orders: item.orders ?? 0,
      products: item.products ?? 0,
    }),
  },
  orders: {
    exportEnabled: true,
    recordKind: 'order',
    titleKey: 'orders',
    filenamePrefix: 'report_orders',
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: true,
    fetchFn: getOrdersReport,
    getBaseParams: (ctx) =>
      stripUndefined({
        period: ctx.dateRange,
        search: ctx.searchTerm,
        status: ctx.filters?.status,
        salesRep: ctx.filters?.salesRep,
        client: ctx.filters?.client,
      }),
    columns: (t, tc) => [
      { label: 'ID', accessor: 'id', width: 10 },
      { label: tc('customer'), accessor: 'client', width: 20 },
      { label: tc('salesRep'), accessor: 'salesRep', width: 18 },
      { label: tc('date'), accessor: 'date', width: 12 },
      { label: tc('amount'), accessor: 'amount', width: 15 },
      { label: tc('status'), accessor: 'status', width: 12 },
      { label: t('nav.production'), accessor: 'production', width: 14 },
      { label: t('common.delivery'), accessor: 'delivery', width: 14 },
    ],
    rowFormatter: (item) => ({
      id: item.id,
      client: item.client,
      salesRep: item.salesRep,
      date: item.date,
      amount: item.amount,
      status: item.status,
      production: item.production,
      delivery: item.delivery,
    }),
  },
  sales: {
    exportEnabled: true,
    recordKind: 'salesRow',
    titleKey: 'sales',
    filenamePrefix: 'report_sales',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getSalesOverview,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm }),
    columns: (t, tc) => [
      { label: tc('date'), accessor: 'date', width: 15 },
      { label: t('exportScope.reports.columns.revenue'), accessor: 'revenue', width: 15 },
      { label: t('exportScope.reports.columns.orders'), accessor: 'orders', width: 12 },
      { label: t('nav.products'), accessor: 'products', width: 12 },
    ],
    rowFormatter: (item) => ({
      date: item.date || item.label || item.period || '—',
      revenue: item.revenue ?? 0,
      orders: item.orders ?? 0,
      products: item.products ?? 0,
    }),
  },
  production: {
    exportEnabled: true,
    recordKind: 'production',
    titleKey: 'production',
    filenamePrefix: 'report_production',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getProductionReport,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm }),
    columns: (t, tc) => [
      { label: tc('date'), accessor: 'day', width: 12 },
      { label: t('exportScope.reports.columns.produced'), accessor: 'produced', width: 15 },
      { label: t('exportScope.reports.columns.target'), accessor: 'target', width: 12 },
    ],
    rowFormatter: (item) => ({
      day: item.day || item.date || '—',
      produced: item.produced ?? 0,
      target: item.target ?? 0,
    }),
  },
  products: {
    exportEnabled: true,
    recordKind: 'product',
    titleKey: 'products',
    filenamePrefix: 'report_products',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getProductsReport,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm, category: ctx.filters?.category }),
    columns: (t, tc) => [
      { label: t('nav.products'), accessor: 'name', width: 20 },
      { label: tc('category'), accessor: 'category', width: 15 },
      { label: t('exportScope.reports.columns.sales'), accessor: 'sales', width: 12 },
      { label: tc('amount'), accessor: 'revenue', width: 15 },
    ],
    rowFormatter: (item) => ({
      name: item.name || item.product || '—',
      category: item.category || '—',
      sales: item.sales ?? 0,
      revenue: item.revenue ?? 0,
    }),
  },
  customers: {
    exportEnabled: true,
    recordKind: 'customer',
    titleKey: 'customers',
    filenamePrefix: 'report_customers',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getCustomersReport,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm, city: ctx.filters?.city }),
    columns: (t, tc) => [
      { label: tc('customer'), accessor: 'name', width: 20 },
      { label: t('exportScope.reports.columns.orders'), accessor: 'orders', width: 12 },
      { label: t('exportScope.reports.columns.revenue'), accessor: 'revenue', width: 15 },
      { label: tc('city'), accessor: 'city', width: 12 },
    ],
    rowFormatter: (item) => ({
      name: item.name || item.client || '—',
      orders: item.orders ?? 0,
      revenue: item.revenue ?? 0,
      city: item.city || '—',
    }),
  },
  invoices: {
    exportEnabled: true,
    recordKind: 'invoice',
    titleKey: 'invoices',
    filenamePrefix: 'report_invoices',
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: true,
    fetchFn: getInvoicesReport,
    getBaseParams: (ctx) =>
      stripUndefined({
        period: ctx.dateRange,
        search: ctx.searchTerm,
        status: ctx.filters?.status,
        client: ctx.filters?.client,
      }),
    columns: (t, tc) => [
      { label: 'ID', accessor: 'id', width: 10 },
      { label: tc('customer'), accessor: 'client', width: 20 },
      { label: tc('date'), accessor: 'date', width: 12 },
      { label: tc('amount'), accessor: 'amount', width: 15 },
      { label: tc('status'), accessor: 'status', width: 12 },
    ],
    rowFormatter: (item) => ({
      id: item.id,
      client: item.client,
      date: item.date,
      amount: item.amount,
      status: item.status,
    }),
  },
  deliveries: {
    exportEnabled: true,
    recordKind: 'delivery',
    titleKey: 'deliveries',
    filenamePrefix: 'report_deliveries',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getDeliveriesReport,
    getBaseParams: (ctx) =>
      stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm, status: ctx.filters?.status, city: ctx.filters?.city }),
    columns: (t, tc) => [
      { label: 'ID', accessor: 'id', width: 10 },
      { label: tc('customer'), accessor: 'client', width: 20 },
      { label: tc('date'), accessor: 'date', width: 12 },
      { label: tc('status'), accessor: 'status', width: 12 },
      { label: tc('city'), accessor: 'city', width: 12 },
    ],
    rowFormatter: (item) => ({
      id: item.id,
      client: item.client,
      date: item.date,
      status: item.status,
      city: item.city || '—',
    }),
  },
  analytics: {
    exportEnabled: true,
    recordKind: 'analyticsRow',
    titleKey: 'analytics',
    filenamePrefix: 'report_analytics',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getYearlyComparison,
    getBaseParams: (ctx) => stripUndefined({ period: ctx.dateRange, search: ctx.searchTerm }),
    columns: (t, tc) => [
      { label: t('exportScope.reports.columns.year'), accessor: 'year', width: 12 },
      { label: t('exportScope.reports.columns.revenue'), accessor: 'revenue', width: 15 },
      { label: t('exportScope.reports.columns.orders'), accessor: 'orders', width: 12 },
      { label: t('exportScope.reports.columns.growth'), accessor: 'growth', width: 12 },
    ],
    rowFormatter: (item) => ({
      year: item.year || item.label || '—',
      revenue: item.revenue ?? 0,
      orders: item.orders ?? 0,
      growth: item.growth ?? 0,
    }),
  },
  reports: {
    exportEnabled: true,
    recordKind: 'generatedReport',
    titleKey: 'reports',
    filenamePrefix: 'report_generated',
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    supportsCustomerEntity: false,
    fetchFn: getGeneratedReports,
    getBaseParams: (ctx) =>
      stripUndefined({
        search: ctx.searchTerm,
        type: ctx.filters?.type,
        status: ctx.filters?.status,
      }),
    columns: (t, tc) => [
      { label: tc('name'), accessor: 'name', width: 25 },
      { label: t('exportScope.reports.columns.type'), accessor: 'type', width: 15 },
      { label: t('exportScope.reports.columns.period'), accessor: 'period', width: 15 },
      { label: tc('status'), accessor: 'status', width: 12 },
      { label: tc('date'), accessor: 'createdAt', width: 15 },
    ],
    rowFormatter: (item) => ({
      name: item.name || '—',
      type: item.type || '—',
      period: item.period || '—',
      status: item.status || '—',
      createdAt: item.createdAt || item.created_at || '—',
    }),
  },
};

function buildEntityParams(selectedEntity, tabDef) {
  if (!selectedEntity?.id) return {};
  if (!tabDef.supportsCustomerEntity) return {};
  return stripUndefined({
    customer_id: selectedEntity.id,
    client: selectedEntity.id,
  });
}

async function resolveReportTabDataset({ scopeMode, selectedEntity, tabDef, pageContext }) {
  const baseParams = tabDef.getBaseParams(pageContext) || {};

  if (scopeMode === SCOPE_MODE.ENTITY) {
    if (!tabDef.supportsCustomerEntity || !selectedEntity?.id) {
      throw new Error('Customer selection is required');
    }
    const entityParams = buildEntityParams(selectedEntity, tabDef);
    const { items } = await fetchAllPaginated((p) => tabDef.fetchFn(p), {
      ...baseParams,
      ...entityParams,
    });
    return safeArray({ data: items });
  }

  if (scopeMode === SCOPE_MODE.FILTERS) {
    const { items } = await fetchAllPaginated((p) => tabDef.fetchFn(p), baseParams);
    let data = safeArray({ data: items });
    if (pageContext.searchTerm) {
      const term = pageContext.searchTerm.toLowerCase();
      data = data.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
    }
    return data;
  }

  const { items } = await fetchAllPaginated((p) => tabDef.fetchFn(p), stripUndefined({ period: pageContext.dateRange }));
  return safeArray({ data: items });
}

export function getReportTabExportMeta(activeTab) {
  return REPORT_TAB_EXPORT[activeTab] ?? null;
}

export function isReportTabExportEnabled(activeTab) {
  return Boolean(REPORT_TAB_EXPORT[activeTab]?.exportEnabled);
}

/** Reports tab-specific export scope config — returns null when tab cannot export. */
export function getReportsExportConfig(activeTab, pageContext = {}) {
  const tabDef = REPORT_TAB_EXPORT[activeTab];
  if (!tabDef?.exportEnabled) {
    return null;
  }

  const hasActiveFilters = () =>
    Boolean(
      pageContext.searchTerm ||
      pageContext.filters?.client ||
      pageContext.filters?.salesRep ||
      pageContext.filters?.status ||
      pageContext.filters?.category ||
      pageContext.filters?.city ||
      pageContext.filters?.type ||
      (pageContext.dateRange && pageContext.dateRange !== 'all')
    );

  const modes = tabDef.supportsCustomerEntity
    ? tabDef.modes
    : tabDef.modes.filter((m) => m !== SCOPE_MODE.ENTITY);

  return {
    pageId: `reports-${activeTab}`,
    exportEnabled: true,
    entityKind: 'customer',
    recordKind: tabDef.recordKind,
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes,
    searchEntities: tabDef.supportsCustomerEntity ? searchCustomers : undefined,
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    hasActiveFilters,
    countRecords: async ({ scopeMode, selectedEntity }) => {
      const data = await resolveReportTabDataset({ scopeMode, selectedEntity, tabDef, pageContext });
      return data.length;
    },
    resolveDataset: async ({ scopeMode, selectedEntity }) =>
      resolveReportTabDataset({ scopeMode, selectedEntity, tabDef, pageContext }),
  };
}

export default REPORT_TAB_EXPORT;
