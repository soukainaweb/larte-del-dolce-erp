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
    roleId: rawUser.role_id ?? rawUser.roleId ?? rawUser.role?.id ?? null,
    status: rawUser.status || base.status || 'offline',
    createdAt: rawUser.created_at || rawUser.createdAt || null,
    phone: rawUser.phone || base.phone || '',
  };
};

/**
 * Resolve a role selection value to a database role ID.
 */
export const resolveRoleId = (value, roles = []) => {
  if (value == null || value === '') return null;

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric > 0) {
    const byId = roles.find((role) => Number(role.id) === numeric);
    if (byId) return numeric;
  }

  const label = String(value).trim().toLowerCase();
  const match = ensureArray(roles).find((role) => {
    const displayName = String(role.display_name || '').trim().toLowerCase();
    const slug = String(role.name || '').trim().toLowerCase();
    return displayName === label || slug === label || String(role.id) === label;
  });

  return match?.id ?? null;
};

/**
 * Build a Laravel-compatible user create/update payload from UI form data.
 */
export const buildUserPayload = (formData, roles = []) => {
  const firstName = formData.first_name ?? formData.firstName ?? '';
  const lastName = formData.last_name ?? formData.lastName ?? '';
  const roleId = resolveRoleId(formData.role_id ?? formData.roleId ?? formData.role, roles);

  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: formData.email?.trim(),
    phone: formData.phone || null,
    status: formData.status || 'active',
  };

  if (roleId) {
    payload.role_id = roleId;
  }

  if (formData.password) {
    payload.password = formData.password;
  }

  return payload;
};

/**
 * Map Laravel 422 field errors to UI form field keys.
 */
export const extractFieldErrors = (error, fieldMap = {}) => {
  const defaultMap = {
    first_name: 'firstName',
    last_name: 'lastName',
    role_id: 'roleId',
    password: 'password',
    email: 'email',
    phone: 'phone',
    status: 'status',
  };
  const map = { ...defaultMap, ...fieldMap };
  const errors = error?.response?.data?.errors;

  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const result = {};
  Object.entries(errors).forEach(([field, messages]) => {
    const key = map[field] || field;
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (message) {
      result[key] = translateApiErrorMessage(message);
    }
  });

  return Object.keys(result).length ? result : null;
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

const ROLE_PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'validate', 'approve'];

/**
 * Normalize a role record for list/card UI (camelCase + display labels).
 */
export const normalizeRoleRecord = (rawRole) => {
  if (!rawRole) return null;

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('ar-SA');
  };

  return {
    ...rawRole,
    name: rawRole.display_name || rawRole.name || '—',
    slug: rawRole.name,
    users: rawRole.users ?? rawRole.users_count ?? 0,
    permissions: rawRole.permissions ?? rawRole.permissions_count ?? 0,
    createdAt: rawRole.created_at || rawRole.createdAt || formatDate(rawRole.created_at),
    updatedAt: rawRole.updated_at || rawRole.updatedAt || formatDate(rawRole.updated_at),
    createdBy: rawRole.created_by || rawRole.createdBy || '—',
    status: rawRole.status || 'inactive',
  };
};

/**
 * Unwrap and normalize a paginated roles API response.
 */
export const normalizeRoleList = (payload) => {
  const { items, meta } = unwrapPaginated(payload);
  const list = Array.isArray(items) ? items : [];

  return {
    items: list.map(normalizeRoleRecord).filter(Boolean),
    meta,
  };
};

/**
 * Normalize role statistics KPI payload from Laravel API.
 */
export const normalizeRoleStatistics = (payload) => {
  const data = unwrapData(payload) || {};

  return {
    totalRoles: data.totalRoles ?? data.total_roles ?? data.total ?? 0,
    totalPermissions: data.totalPermissions ?? data.total_permissions ?? 0,
    totalUsers: data.totalUsers ?? data.total_users ?? 0,
    activePermissions: data.activePermissions ?? data.active_permissions ?? 0,
    activeRoles: data.activeRoles ?? data.active ?? 0,
    pendingRequests: data.pendingRequests ?? data.pending_requests ?? 0,
  };
};

/**
 * Convert API permission records/names into the module map used by PermissionsModal.
 */
export const permissionsToModuleMap = (permissions) => {
  const map = {};

  ensureArray(permissions).forEach((entry) => {
    const name = typeof entry === 'string' ? entry : entry?.name;
    if (!name) return;

    const [module, action] = String(name).split('.');
    if (!module || !action) return;

    if (!map[module]) {
      map[module] = {};
      ROLE_PERMISSION_ACTIONS.forEach((actionId) => {
        map[module][actionId] = false;
      });
    }

    const mappedAction = PERMISSION_ACTION_MAP[action.toLowerCase()] || action.toLowerCase();
    if (ROLE_PERMISSION_ACTIONS.includes(mappedAction)) {
      map[module][mappedAction] = true;
    }
  });

  return map;
};

/**
 * Convert PermissionsModal module map back to permission IDs.
 */
export const moduleMapToPermissionIds = (moduleMap, allPermissions) => {
  const ids = [];
  const permissionList = ensureArray(allPermissions);
  const actionToApiName = {
    edit: 'update',
  };

  Object.entries(moduleMap || {}).forEach(([module, actions]) => {
    if (!actions || typeof actions !== 'object') return;

    Object.entries(actions).forEach(([action, enabled]) => {
      if (!enabled) return;

      const apiAction = actionToApiName[action] || action;
      const permissionName = `${module}.${apiAction}`;
      const match = permissionList.find((permission) => permission?.name === permissionName);
      if (match?.id != null) {
        ids.push(match.id);
      }
    });
  });

  return ids;
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
export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'object') return Object.values(value);
  return [];
};

/**
 * Safely call Array.reduce — returns initialValue when input is not an array.
 */
export const safeReduce = (value, reducer, initialValue) => {
  if (!Array.isArray(value)) return initialValue;
  return value.reduce(reducer, initialValue);
};

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

  if (error.configMissing) {
    return error.message || i18n.t('errors.apiNotConfigured');
  }

  if (error.endpointMessage) {
    return error.endpointMessage;
  }

  if (error.timeoutMessage) {
    return translateApiErrorMessage(error.timeoutMessage);
  }

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
    const message = translateApiErrorMessage(data?.message);
    const requestUrl = String(error.config?.url || '');
    const contentType = String(error.response?.headers?.['content-type'] || '');

    if (/^\/?(login|password\/)/.test(requestUrl)) {
      return message || i18n.t('errors.loginServiceUnavailable');
    }

    if (contentType.includes('text/html') || data?.message === 'Endpoint not found') {
      return message || i18n.t('errors.endpointNotFound');
    }

    return message || i18n.t('errors.notFound');
  }

  if (status === 405) {
    return translateApiErrorMessage(data?.message) || i18n.t('errors.methodNotAllowed');
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
