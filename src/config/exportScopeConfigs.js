import { SCOPE_MODE, ENTITY_SCOPE_TYPE, LARGE_EXPORT_THRESHOLD } from '../components/export/exportScopeTypes';
import { fetchAllPaginated } from '../utils/fetchAllPaginated';
import { safeArray, unwrapPaginated } from '../utils/apiHelpers';
import { getInvoices } from '../services/invoiceService';
import { getCustomers } from '../services/customerService';
import orderService from '../services/orderService';
import { getProducts } from '../services/productService';
import { getPayments } from '../services/paymentService';
import deliveryService from '../services/deliveryService';
import { getExpenses } from '../services/expenseService';
import { getSuppliers } from '../services/supplierService';
import { getUsers } from '../services/userServicePage';
import { getCategories } from '../services/categoryService';
import { fetchNotificationPage } from '../services/notificationService';
import { getRecentTransactions } from '../services/financeService';
import { getActivityLogs } from '../services/activityLogService';
import { getWarehouses } from '../services/warehouseService';
import { getInventory } from '../services/inventoryService';
import { getProductions } from '../services/productionService';
import { getRoles } from '../services/roleService';
import { getReportsExportConfig } from './reportExportConfigs';

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && v !== 'all'));

/** @typedef {import('../components/export/exportScopeTypes').SCOPE_MODE} ScopeMode */

/**
 * @typedef {Object} ExportScopeConfig
 * @property {string} pageId
 * @property {string} entityKind - i18n key suffix under exportScope.entity.*
 * @property {string} recordKind - i18n key suffix under exportScope.record.*
 * @property {string} entityScopeType - filter | row
 * @property {string[]} modes - enabled scope modes
 * @property {boolean} [exportEnabled] - when false, export is disabled for this page/tab
 * @property {number} [largeExportThreshold]
 * @property {(query: string) => Promise<Array<{id, label, raw}>>} [searchEntities]
 * @property {(args: object) => Promise<number>} countRecords
 * @property {(args: object) => Promise<Array>} resolveDataset
 */

function mapInvoiceFilters(filters = {}) {
  return stripUndefined({
    search: filters.search,
    payment_status: filters.paymentStatus,
    status: filters.status,
  });
}

function mapOrderFilters(filters = {}) {
  return stripUndefined({
    search: filters.search,
    status: filters.status,
  });
}

function mapNotificationFilters(pageContext, scopeMode) {
  const filters = pageContext?.filters ?? {};
  const base = stripUndefined({
    search: filters.search ?? pageContext?.search,
    status: filters.status !== 'all' ? filters.status : undefined,
    module: filters.module && filters.module !== 'Tous' ? filters.module : undefined,
    priority: filters.priority !== 'all' ? filters.priority : undefined,
    period: filters.period !== 'all' ? filters.period : undefined,
  });
  if (scopeMode === SCOPE_MODE.ALL) {
    return stripUndefined({
      module: base.module,
      priority: base.priority,
      period: base.period,
    });
  }
  return base;
}

function mapFinanceFilters(pageContext) {
  return stripUndefined({
    period: pageContext?.filters?.dateRange,
  });
}

function mapInventoryFilters(pageContext, scopeMode, selectedEntity) {
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity) {
    const categoryName = selectedEntity.raw?.name || selectedEntity.label;
    return stripUndefined({ category: categoryName });
  }
  if (scopeMode === SCOPE_MODE.ALL) {
    return {};
  }
  return stripUndefined({
    search: pageContext?.filters?.search,
    category: pageContext?.filters?.category !== 'all' ? pageContext?.filters?.category : undefined,
    status: pageContext?.filters?.status !== 'all' ? pageContext?.filters?.status : undefined,
  });
}

function mapDeliveryFilters(pageContext, scopeMode, selectedEntity) {
  const base = stripUndefined({
    status: pageContext?.filters?.status !== 'all' ? pageContext?.filters?.status : undefined,
    search: pageContext?.filters?.search,
  });
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    return { ...base, customer_id: selectedEntity.id };
  }
  return base;
}

function mapPaymentFilters(pageContext, scopeMode, selectedEntity) {
  const base = stripUndefined({
    status: pageContext?.filters?.status !== 'all' ? pageContext?.filters?.status : undefined,
    method: pageContext?.filters?.method !== 'all' ? pageContext?.filters?.method : undefined,
    search: pageContext?.filters?.search,
  });
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    return { ...base, customer_id: selectedEntity.id };
  }
  return base;
}

async function searchCustomers(query = '') {
  const response = await getCustomers({ search: query || undefined, per_page: 20, page: 1 });
  return safeArray(response).map((c) => ({
    id: c.id,
    label: c.name || c.email || `#${c.id}`,
    raw: c,
  }));
}

async function countInvoices({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapInvoiceFilters(pageContext?.filters);
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    const { meta } = unwrapPaginated(await getInvoices({ customer_id: selectedEntity.id, per_page: 1, page: 1, ...filters }));
    return meta?.total ?? 0;
  }
  if (scopeMode === SCOPE_MODE.FILTERS) {
    const { meta } = unwrapPaginated(await getInvoices({ per_page: 1, page: 1, ...filters }));
    return meta?.total ?? 0;
  }
  const { meta } = unwrapPaginated(await getInvoices({ per_page: 1, page: 1 }));
  return meta?.total ?? pageContext?.totalCount ?? 0;
}

async function resolveInvoices({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapInvoiceFilters(pageContext?.filters);
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    const { items } = await fetchAllPaginated((params) => getInvoices(params), {
      customer_id: selectedEntity.id,
      ...filters,
    });
    return items;
  }
  if (scopeMode === SCOPE_MODE.FILTERS) {
    const { items } = await fetchAllPaginated((params) => getInvoices(params), filters);
    return items;
  }
  const { items } = await fetchAllPaginated((params) => getInvoices(params), {});
  return items;
}

async function countOrders({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapOrderFilters(pageContext?.filters);
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    const result = await orderService.getOrders({ customer_id: selectedEntity.id, per_page: 1, page: 1, ...filters });
    return result.meta?.total ?? result.data?.length ?? 0;
  }
  if (scopeMode === SCOPE_MODE.FILTERS) {
    const result = await orderService.getOrders({ per_page: 1, page: 1, ...filters });
    return result.meta?.total ?? 0;
  }
  const result = await orderService.getOrders({ per_page: 1, page: 1 });
  return result.meta?.total ?? pageContext?.totalCount ?? 0;
}

async function resolveOrders({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapOrderFilters(pageContext?.filters);
  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    const { items } = await fetchAllPaginated(
      (params) => orderService.getOrders(params).then((r) => ({ data: r.data, ...r })),
      { customer_id: selectedEntity.id, ...filters }
    );
    return items;
  }
  if (scopeMode === SCOPE_MODE.FILTERS) {
    const { items } = await fetchAllPaginated(
      (params) => orderService.getOrders(params).then((r) => ({ data: r.data, ...r })),
      filters
    );
    return items;
  }
  const { items } = await fetchAllPaginated(
    (params) => orderService.getOrders(params).then((r) => ({ data: r.data, ...r })),
    {}
  );
  return items;
}

function createRowListConfig({
  pageId,
  entityKind,
  recordKind,
  searchFn,
  fetchAllFn,
  getFilterParams,
}) {
  return {
    pageId,
    entityKind,
    recordKind,
    entityScopeType: ENTITY_SCOPE_TYPE.ROW,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: searchFn,
    countRecords: async ({ scopeMode, selectedEntity, pageContext }) => {
      if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity) return 1;
      if (scopeMode === SCOPE_MODE.FILTERS) {
        const filters = getFilterParams?.(pageContext) ?? {};
        const response = await fetchAllFn({ ...filters, per_page: 1, page: 1 });
        const { meta } = unwrapPaginated(response);
        return meta?.total ?? safeArray(response).length;
      }
      const response = await fetchAllFn({ per_page: 1, page: 1 });
      const { meta } = unwrapPaginated(response);
      return meta?.total ?? pageContext?.totalCount ?? 0;
    },
    resolveDataset: async ({ scopeMode, selectedEntity, pageContext }) => {
      if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.raw) {
        return [selectedEntity.raw];
      }
      const filters = scopeMode === SCOPE_MODE.FILTERS ? (getFilterParams?.(pageContext) ?? {}) : {};
      const { items } = await fetchAllPaginated(fetchAllFn, filters);
      return items;
    },
  };
}

/** @type {Record<string, ExportScopeConfig>} */
export const EXPORT_SCOPE_CONFIGS = {
  invoices: {
    pageId: 'invoices',
    entityKind: 'customer',
    recordKind: 'invoice',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: searchCustomers,
    countRecords: countInvoices,
    resolveDataset: resolveInvoices,
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || (ctx?.filters?.paymentStatus && ctx.filters.paymentStatus !== 'all') || (ctx?.filters?.status && ctx.filters.status !== 'all')),
  },
  orders: {
    pageId: 'orders',
    entityKind: 'customer',
    recordKind: 'order',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: searchCustomers,
    countRecords: countOrders,
    resolveDataset: resolveOrders,
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || (ctx?.filters?.status && ctx.filters.status !== 'all')),
  },
  customers: createRowListConfig({
    pageId: 'customers',
    entityKind: 'customer',
    recordKind: 'customer',
    searchFn: searchCustomers,
    fetchAllFn: (params) => getCustomers(params),
    getFilterParams: (ctx) =>
      stripUndefined({
        search: ctx?.filters?.search,
        type: ctx?.filters?.type,
        status: ctx?.filters?.status,
      }),
  }),
  products: {
    pageId: 'products',
    entityKind: 'category',
    recordKind: 'product',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: async (query) => {
      const response = await getCategories({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((c) => ({
        id: c.id,
        label: c.name || `#${c.id}`,
        raw: c,
      }));
    },
    countRecords: async ({ scopeMode, selectedEntity, pageContext }) => {
      const filters = stripUndefined({
        search: pageContext?.filters?.search,
        status: pageContext?.filters?.status,
        category_id: scopeMode === SCOPE_MODE.ENTITY ? selectedEntity?.id : pageContext?.filters?.category,
      });
      if (scopeMode === SCOPE_MODE.ALL) {
        const { meta } = unwrapPaginated(await getProducts({ per_page: 1, page: 1 }));
        return meta?.total ?? 0;
      }
      const { meta } = unwrapPaginated(await getProducts({ per_page: 1, page: 1, ...filters }));
      return meta?.total ?? 0;
    },
    resolveDataset: async ({ scopeMode, selectedEntity, pageContext }) => {
      if (scopeMode === SCOPE_MODE.ALL) {
        const { items } = await fetchAllPaginated((params) => getProducts(params), {});
        return items;
      }
      const filters = stripUndefined({
        search: pageContext?.filters?.search,
        status: pageContext?.filters?.status,
        category_id: scopeMode === SCOPE_MODE.ENTITY ? selectedEntity?.id : pageContext?.filters?.category,
      });
      const { items } = await fetchAllPaginated((params) => getProducts(params), filters);
      return items;
    },
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || (ctx?.filters?.status && ctx.filters.status !== 'all') || ctx?.filters?.category),
  },
  deliveries: {
    pageId: 'deliveries',
    entityKind: 'customer',
    recordKind: 'delivery',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: searchCustomers,
    countRecords: async ({ scopeMode, selectedEntity, pageContext }) => {
      const filters = mapDeliveryFilters(pageContext, scopeMode, selectedEntity);
      const fetchPage = async (params) => {
        const body = await deliveryService.getDeliveries(params);
        return { data: body };
      };
      const { meta } = unwrapPaginated(await fetchPage({ ...filters, per_page: 1, page: 1 }));
      return meta?.total ?? 0;
    },
    resolveDataset: resolveDeliveries,
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || (ctx?.filters?.status && ctx.filters.status !== 'all')),
  },
  payments: {
    pageId: 'payments',
    entityKind: 'customer',
    recordKind: 'payment',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: searchCustomers,
    countRecords: async ({ scopeMode, selectedEntity, pageContext }) => {
      const filters = mapPaymentFilters(pageContext, scopeMode, selectedEntity);
      const { meta } = unwrapPaginated(await getPayments({ ...filters, per_page: 1, page: 1 }));
      return meta?.total ?? 0;
    },
    resolveDataset: resolvePayments,
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || (ctx?.filters?.status && ctx.filters.status !== 'all') || (ctx?.filters?.method && ctx.filters.method !== 'all')),
  },
  expenses: {
    pageId: 'expenses',
    entityKind: 'category',
    recordKind: 'expense',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    countRecords: async ({ scopeMode, pageContext }) => {
      const filters = scopeMode === SCOPE_MODE.FILTERS
        ? stripUndefined({ search: pageContext?.filters?.search, category: pageContext?.filters?.category, status: pageContext?.filters?.status })
        : {};
      const { meta } = unwrapPaginated(await getExpenses({ per_page: 1, page: 1, ...filters }));
      return meta?.total ?? 0;
    },
    resolveDataset: async ({ scopeMode, pageContext }) => {
      const filters = scopeMode === SCOPE_MODE.FILTERS
        ? stripUndefined({ search: pageContext?.filters?.search, category: pageContext?.filters?.category, status: pageContext?.filters?.status })
        : {};
      const { items } = await fetchAllPaginated((params) => getExpenses(params), filters);
      return items;
    },
    hasActiveFilters: (ctx) =>
      Boolean(ctx?.filters?.search || ctx?.filters?.category || (ctx?.filters?.status && ctx.filters.status !== 'all')),
  },
  suppliers: createRowListConfig({
    pageId: 'suppliers',
    entityKind: 'supplier',
    recordKind: 'supplier',
    searchFn: async (query) => {
      const response = await getSuppliers({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((s) => ({ id: s.id, label: s.name || `#${s.id}`, raw: s }));
    },
    fetchAllFn: (params) => getSuppliers(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, status: ctx?.filters?.status }),
  }),
  users: createRowListConfig({
    pageId: 'users',
    entityKind: 'user',
    recordKind: 'user',
    searchFn: async (query) => {
      const response = await getUsers({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((u) => ({
        id: u.id,
        label: `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim() || u.email,
        raw: u,
      }));
    },
    fetchAllFn: (params) => getUsers(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, role: ctx?.filters?.role, status: ctx?.filters?.status }),
  }),
  categories: createRowListConfig({
    pageId: 'categories',
    entityKind: 'category',
    recordKind: 'category',
    searchFn: async (query) => {
      const response = await getCategories({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((c) => ({ id: c.id, label: c.name, raw: c }));
    },
    fetchAllFn: (params) => getCategories(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, status: ctx?.filters?.status }),
  }),
  notifications: {
    pageId: 'notifications',
    entityKind: 'module',
    recordKind: 'notification',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    countRecords: async ({ scopeMode, pageContext }) => {
      const filters = mapNotificationFilters(pageContext, scopeMode);
      const { meta } = await fetchNotificationPage({ ...filters, per_page: 1, page: 1 });
      return meta?.total ?? 0;
    },
    resolveDataset: async ({ scopeMode, pageContext }) => {
      const filters = mapNotificationFilters(pageContext, scopeMode);
      const { items } = await fetchAllPaginated(
        (params) =>
          fetchNotificationPage(params).then(({ items: pageItems, meta }) => ({
            data: { data: pageItems, ...meta },
          })),
        filters
      );
      return items;
    },
    hasActiveFilters: (ctx) => Boolean(ctx?.hasActiveFilters),
  },
  finance: {
    pageId: 'finance',
    entityKind: 'period',
    recordKind: 'transaction',
    modes: [SCOPE_MODE.FILTERS],
    countRecords: async ({ pageContext }) => {
      const filters = mapFinanceFilters(pageContext);
      const { meta } = unwrapPaginated(await getRecentTransactions({ ...filters, per_page: 1, page: 1 }));
      return meta?.total ?? 0;
    },
    resolveDataset: async ({ pageContext }) => {
      const filters = mapFinanceFilters(pageContext);
      const { items } = await fetchAllPaginated((params) => getRecentTransactions(params), filters);
      return safeArray({ data: items });
    },
    hasActiveFilters: () => true,
  },
  analytics: {
    pageId: 'analytics',
    entityKind: 'period',
    recordKind: 'indicator',
    modes: [SCOPE_MODE.FILTERS],
    countRecords: async ({ pageContext }) => pageContext?.data?.length ?? 0,
    resolveDataset: async ({ scopeMode, pageContext }) => {
      if (scopeMode !== SCOPE_MODE.FILTERS) {
        throw new Error('Export scope is required');
      }
      return pageContext?.data ?? [];
    },
    hasActiveFilters: () => true,
  },
  activityLog: {
    pageId: 'activityLog',
    entityKind: 'user',
    recordKind: 'activity',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: async (query) => {
      const response = await getUsers({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((u) => ({
        id: u.id,
        label: `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim() || u.email,
        raw: u,
      }));
    },
    countRecords: async (args) => (await resolveActivityLogs(args)).length,
    resolveDataset: resolveActivityLogs,
    hasActiveFilters: (ctx) =>
      Boolean(
        ctx?.filters?.search ||
        (ctx?.filters?.user && ctx.filters.user !== 'all') ||
        (ctx?.filters?.module && ctx.filters.module !== 'all') ||
        (ctx?.filters?.action && ctx.filters.action !== 'all') ||
        (ctx?.filters?.level && ctx.filters.level !== 'all') ||
        ctx?.filters?.date
      ),
  },
  myProfile: {
    pageId: 'myProfile',
    entityKind: 'self',
    recordKind: 'activity',
    modes: [SCOPE_MODE.ALL],
    countRecords: async ({ pageContext }) => pageContext?.data?.length ?? 0,
    resolveDataset: async ({ scopeMode, pageContext }) => {
      if (scopeMode !== SCOPE_MODE.ALL) {
        throw new Error('Export scope is required');
      }
      return pageContext?.data ?? [];
    },
  },
  warehouse: createRowListConfig({
    pageId: 'warehouse',
    entityKind: 'warehouse',
    recordKind: 'warehouse',
    searchFn: async (query) => {
      const response = await getWarehouses({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((w) => ({ id: w.id, label: w.name || `#${w.id}`, raw: w }));
    },
    fetchAllFn: (params) => getWarehouses(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, status: ctx?.filters?.status, type: ctx?.filters?.type }),
  }),
  inventory: {
    pageId: 'inventory',
    entityKind: 'category',
    recordKind: 'inventoryItem',
    entityScopeType: ENTITY_SCOPE_TYPE.FILTER,
    modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
    largeExportThreshold: LARGE_EXPORT_THRESHOLD,
    searchEntities: async (query) => {
      const response = await getCategories({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((c) => ({ id: c.id, label: c.name, raw: c }));
    },
    countRecords: async ({ scopeMode, selectedEntity, pageContext }) => {
      const filters = mapInventoryFilters(pageContext, scopeMode, selectedEntity);
      const { meta } = unwrapPaginated(await getInventory({ per_page: 1, page: 1, ...filters }));
      return meta?.total ?? 0;
    },
    resolveDataset: async ({ scopeMode, selectedEntity, pageContext }) => {
      const filters = mapInventoryFilters(pageContext, scopeMode, selectedEntity);
      const { items } = await fetchAllPaginated((params) => getInventory(params), filters);
      return items;
    },
    hasActiveFilters: (ctx) =>
      Boolean(
        ctx?.filters?.search ||
        (ctx?.filters?.category && ctx.filters.category !== 'all') ||
        (ctx?.filters?.status && ctx.filters.status !== 'all')
      ),
  },
  production: createRowListConfig({
    pageId: 'production',
    entityKind: 'production',
    recordKind: 'production',
    searchFn: async (query) => {
      const response = await getProductions({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((p) => ({
        id: p.id,
        label: p.productionNumber || p.orderNumber || `#${p.id}`,
        raw: p,
      }));
    },
    fetchAllFn: (params) => getProductions(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, status: ctx?.filters?.status, priority: ctx?.filters?.priority }),
  }),
  rolesPermissions: createRowListConfig({
    pageId: 'rolesPermissions',
    entityKind: 'role',
    recordKind: 'role',
    searchFn: async (query) => {
      const response = await getRoles({ search: query || undefined, per_page: 20, page: 1 });
      return safeArray(response).map((r) => ({ id: r.id, label: r.name || `#${r.id}`, raw: r }));
    },
    fetchAllFn: (params) => getRoles(params),
    getFilterParams: (ctx) => stripUndefined({ search: ctx?.filters?.search, status: ctx?.filters?.status }),
  }),
};

async function resolveDeliveries({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapDeliveryFilters(pageContext, scopeMode, selectedEntity);

  const fetchPage = async (params) => {
    const body = await deliveryService.getDeliveries(params);
    return { data: body };
  };

  const { items } = await fetchAllPaginated(fetchPage, filters);
  return items;
}

async function resolvePayments({ scopeMode, selectedEntity, pageContext }) {
  const filters = mapPaymentFilters(pageContext, scopeMode, selectedEntity);
  const { items } = await fetchAllPaginated((params) => getPayments(params), filters);
  return items;
}

async function resolveActivityLogs({ scopeMode, selectedEntity, pageContext }) {
  const baseFilters = stripUndefined({
    search: pageContext?.filters?.search,
    module: pageContext?.filters?.module,
    action: pageContext?.filters?.action,
    level: pageContext?.filters?.level,
    date: pageContext?.filters?.date,
  });

  if (scopeMode === SCOPE_MODE.ENTITY && selectedEntity?.id) {
    const { items } = await fetchAllPaginated((params) => getActivityLogs(params), {
      ...baseFilters,
      user: selectedEntity.id,
    });
    return items;
  }

  if (scopeMode === SCOPE_MODE.FILTERS) {
    const { items } = await fetchAllPaginated((params) => getActivityLogs(params), {
      ...baseFilters,
      user: pageContext?.filters?.user !== 'all' ? pageContext?.filters?.user : undefined,
    });
    return items;
  }

  const { items } = await fetchAllPaginated((params) => getActivityLogs(params), {});
  return items;
}

export function getExportScopeConfig(pageId, pageContext) {
  if (pageId === 'reports') {
    return getReportsExportConfig(pageContext?.activeTab, pageContext);
  }
  return EXPORT_SCOPE_CONFIGS[pageId] ?? null;
}

export { searchCustomers };

export default EXPORT_SCOPE_CONFIGS;
