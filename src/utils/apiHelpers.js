import { normalizeRole, extractUserPermissions } from './roleMapping';
import i18n from '../i18n';
import { translateApiErrorMessage } from './apiErrorTranslator';
import {
  translateActivityAction,
  translateActivityModule,
} from './activityLogTranslator';

/**
 * Unwrap Laravel ApiResponse envelope from an axios response or plain body.
 * Handles: axios response, { success, data }, or raw payload.
 */
export const unwrapData = (payload) => {
  if (!payload) return null;

  // Axios response object
  if (payload.data !== undefined && (payload.status !== undefined || payload.headers !== undefined)) {
    return unwrapData(payload.data);
  }

  // Laravel envelope { success, message, data }
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data ?? null;
  }

  return payload;
};

/**
 * Unwrap paginated Laravel response.
 * Returns { items, meta } where meta contains pagination fields.
 */
export const unwrapPaginated = (payload) => {
  const data = unwrapData(payload);

  if (!data) {
    return { items: [], meta: {} };
  }

  // Laravel LengthAwarePaginator serialized inside data
  if (Array.isArray(data.data)) {
    const { data: items, ...meta } = data;
    return { items, meta };
  }

  if (Array.isArray(data)) {
    return { items: data, meta: {} };
  }

  return { items: [], meta: data };
};

/**
 * Extract user from auth API response body.
 */
export const extractUserFromResponse = (payload) => {
  const data = unwrapData(payload);
  if (!data) return null;
  return data.user || data;
};

/**
 * Extract token from login API response body.
 */
export const extractTokenFromResponse = (payload) => {
  const data = unwrapData(payload);
  if (!data) return null;
  return data.token || null;
};

/**
 * Normalize user object for AuthContext / UI consumption.
 */
export const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  const role = normalizeRole(rawUser.role);
  const permissions = extractUserPermissions(rawUser);

  const firstName = rawUser.first_name || rawUser.firstName || rawUser.name?.split(' ')[0] || '';
  const lastName = rawUser.last_name || rawUser.lastName || rawUser.name?.split(' ').slice(1).join(' ') || '';
  const fullName =
    rawUser.name ||
    rawUser.fullName ||
    `${firstName} ${lastName}`.trim() ||
    rawUser.email ||
    '';

  return {
    ...rawUser,
    firstName,
    lastName,
    fullName,
    role,
    permissions,
    status: rawUser.status || 'Online',
    avatar: rawUser.avatar || '',
  };
};

/**
 * Normalize a user record for list/table UI (camelCase + role label).
 */
export const normalizeUserRecord = (rawUser) => {
  if (!rawUser) return null;

  const base = normalizeUser(rawUser);
  const roleLabel =
    typeof rawUser.role === 'object' && rawUser.role
      ? rawUser.role.display_name || rawUser.role.name || base.role
      : base.role || rawUser.role || '—';

  return {
    ...rawUser,
    ...base,
    firstName: base.firstName,
    lastName: base.lastName,
    fullName: base.fullName,
    role: roleLabel,
    status: rawUser.status || base.status || 'offline',
    createdAt: rawUser.created_at || rawUser.createdAt || null,
    phone: rawUser.phone || base.phone || '',
  };
};

/**
 * Unwrap and normalize a paginated users API response.
 */
export const normalizeUserList = (payload) => {
  const { items, meta } = unwrapPaginated(payload);
  const list = Array.isArray(items) ? items : [];

  return {
    items: list.map(normalizeUserRecord).filter(Boolean),
    meta,
  };
};

/**
 * Normalize a customer record for list/table UI.
 */
export const normalizeCustomerRecord = (rawCustomer) => {
  if (!rawCustomer) return null;

  return {
    ...rawCustomer,
    name: rawCustomer.name || rawCustomer.company_name || '—',
    email: rawCustomer.email || '',
    phone: rawCustomer.phone || '',
    type: rawCustomer.type || rawCustomer.customer_type || 'individual',
    status: rawCustomer.status || 'inactive',
    city: rawCustomer.city || '',
    country: rawCustomer.country || '',
    address: rawCustomer.address || '',
    createdAt: rawCustomer.created_at || rawCustomer.createdAt || null,
  };
};

/**
 * Unwrap and normalize a paginated customers API response.
 */
export const normalizeCustomerList = (payload) => {
  const { items, meta } = unwrapPaginated(payload);
  const list = Array.isArray(items) ? items : [];

  return {
    items: list.map(normalizeCustomerRecord).filter(Boolean),
    meta,
  };
};

/**
 * Extract the first validation error message from a Laravel 422 payload.
 * Prefers Arabic messages when the API returns them.
 */
export const extractValidationMessage = (data) => {
  if (!data) return null;

  let message = null;

  if (data.message && typeof data.message === 'string') {
    message = data.message;
  } else if (data.errors && typeof data.errors === 'object') {
    const firstField = Object.keys(data.errors)[0];
    if (firstField && Array.isArray(data.errors[firstField])) {
      message = data.errors[firstField][0];
    } else {
      message = Object.values(data.errors).flat()[0] || null;
    }
  }

  return translateApiErrorMessage(message);
};

/**
 * Ensure value is always an array (safe default for API list states).
 */
export const ensureArray = (value) => (Array.isArray(value) ? value : []);

/**
 * Safely extract a list array from an API response body.
 * Handles Laravel envelopes and paginated payloads.
 */
export const safeArray = (payload) => {
  const data = payload?.data !== undefined && (payload?.status !== undefined || payload?.headers !== undefined)
    ? payload.data
    : payload;

  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
};

const ACTIVITY_DATE_LOCALE = 'ar-SA';

/**
 * Normalize a single activity log record for UI consumption.
 */
export const normalizeActivityLog = (log) => {
  if (!log || typeof log !== 'object') return null;

  const createdAt = log.created_at ? new Date(log.created_at) : null;
  const user = log.user || null;
  const userName = user
    ? (user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email)
    : null;

  const statusMap = {
    success: i18n.t('common.success'),
    failed: i18n.t('common.error'),
  };

  return {
    ...log,
    date: createdAt ? createdAt.toLocaleDateString(ACTIVITY_DATE_LOCALE) : '—',
    time: createdAt
      ? createdAt.toLocaleTimeString(ACTIVITY_DATE_LOCALE, { hour: '2-digit', minute: '2-digit' })
      : '—',
    ip: log.ip || log.ip_address || '—',
    actionLabel: translateActivityAction(log.action),
    moduleLabel: translateActivityModule(log.module),
    user: user
      ? {
          ...user,
          name: userName,
        }
      : null,
    status: statusMap[log.status] || log.status || '—',
  };
};

/**
 * Normalize a list of activity log records.
 */
export const normalizeActivityLogList = (items) => {
  return ensureArray(items).map(normalizeActivityLog).filter(Boolean);
};

/**
 * Parse a list API response into a safe array.
 */
export const parseListResponse = (payload, extraKeys = []) => {
  return ensureArray(toArray(payload, extraKeys));
};

/**
 * Build a user-facing error message from an axios/Laravel error.
 */
export const getApiErrorMessage = (error, fallback) => {
  const defaultFallback = fallback || i18n.t('errors.loadFailed');

  if (!error) return defaultFallback;

  if (error.validationMessage) {
    return translateApiErrorMessage(error.validationMessage);
  }

  if (error.serverMessage) {
    return translateApiErrorMessage(error.serverMessage);
  }

  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return i18n.t('errors.networkError');
    }
    if (error.request) {
      return i18n.t('errors.networkError');
    }
    return error.message || defaultFallback;
  }

  const { status, data } = error.response;

  if (status === 401) {
    return translateApiErrorMessage(data?.message) || i18n.t('errors.unauthorized');
  }

  if (status === 403) {
    return translateApiErrorMessage(data?.message) || i18n.t('errors.forbidden');
  }

  if (status === 404) {
    return translateApiErrorMessage(data?.message) || i18n.t('errors.notFound');
  }

  if (status === 422) {
    return extractValidationMessage(data) || translateApiErrorMessage(data?.message) || i18n.t('errors.invalidData');
  }

  if (status >= 500) {
    return translateApiErrorMessage(data?.message) || i18n.t('errors.serverConnectionError');
  }

  return translateApiErrorMessage(data?.message) || defaultFallback;
};

/**
 * Show API error via toast helper.
 */
export const showApiError = (showToast, error, fallback) => {
  if (showToast) {
    showToast(getApiErrorMessage(error, fallback), 'error');
  }
};

/**
 * Normalize any API payload into a plain array.
 * Handles Laravel envelopes, paginated payloads, and common list keys.
 */
export const toArray = (payload, extraKeys = []) => {
  const { items } = unwrapPaginated(payload);
  if (Array.isArray(items) && items.length > 0) {
    return items;
  }

  const data = unwrapData(payload);
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    const keys = [...extraKeys, 'data', 'items', 'permissions', 'sessions', 'documents', 'activities', 'activity'];
    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }

  return [];
};

const PERMISSION_ACTION_MAP = {
  view: 'view',
  create: 'create',
  update: 'edit',
  edit: 'edit',
  delete: 'delete',
};

/**
 * Normalize profile permissions API payload into table rows:
 * [{ module, view, create, edit, delete }, ...]
 */
export const normalizeProfilePermissions = (payload) => {
  const data = unwrapData(payload);
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((row) => ({
      module: row?.module ?? row?.name ?? '—',
      view: Boolean(row?.view ?? row?.read),
      create: Boolean(row?.create),
      edit: Boolean(row?.edit ?? row?.update),
      delete: Boolean(row?.delete),
    }));
  }

  if (typeof data !== 'object') {
    return [];
  }

  const permissionNames = new Set();

  if (data.permissions && typeof data.permissions === 'object' && !Array.isArray(data.permissions)) {
    Object.entries(data.permissions).forEach(([name, enabled]) => {
      if (enabled) permissionNames.add(name);
    });
  } else if (Array.isArray(data.permissions)) {
    data.permissions.forEach((entry) => {
      if (typeof entry === 'string') {
        permissionNames.add(entry);
      } else if (entry?.name) {
        permissionNames.add(entry.name);
      }
    });
  }

  if (Array.isArray(data.role?.permissions)) {
    data.role.permissions.forEach((entry) => {
      const name = typeof entry === 'string' ? entry : entry?.name;
      if (name) permissionNames.add(name);
    });
  }

  const modules = {};

  permissionNames.forEach((name) => {
    const [module, action] = String(name).split('.');
    if (!module || !action) return;

    if (!modules[module]) {
      modules[module] = { module, view: false, create: false, edit: false, delete: false };
    }

    const mappedAction = PERMISSION_ACTION_MAP[action.toLowerCase()];
    if (mappedAction) {
      modules[module][mappedAction] = true;
    }
  });

  return Object.values(modules).sort((a, b) => a.module.localeCompare(b.module));
};

const USER_STATUS_LABELS = {
  online: i18n.t('common.statuses.online'),
  offline: i18n.t('common.statuses.offline'),
  away: i18n.t('common.statuses.away'),
  active: i18n.t('common.active'),
  inactive: i18n.t('common.inactive'),
  suspended: i18n.t('common.statuses.suspended'),
  locked: i18n.t('common.statuses.locked'),
};

/**
 * Format a user status string for display with safe fallback.
 */
export const formatUserStatus = (status) => {
  if (status == null || status === '') {
    return { label: '—', tone: 'neutral' };
  }

  const key = String(status).trim().toLowerCase();
  const label = USER_STATUS_LABELS[key] || String(status);

  if (['online', 'active'].includes(key)) {
    return { label, tone: 'positive' };
  }

  if (key === 'away') {
    return { label, tone: 'warning' };
  }

  if (['offline', 'inactive', 'suspended', 'locked'].includes(key)) {
    return { label, tone: 'negative' };
  }

  return { label, tone: 'neutral' };
};
