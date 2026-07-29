import { normalizeRole, extractUserPermissions } from './roleMapping';

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
 * Build a user-facing error message from an axios/Laravel error.
 */
export const getApiErrorMessage = (error, fallback = 'Une erreur est survenue') => {
  if (!error) return fallback;

  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'La requête a expiré. Vérifiez votre connexion.';
    }
    if (error.request) {
      return 'Impossible de joindre le serveur. Vérifiez que l\'API Laravel est démarrée.';
    }
    return error.message || fallback;
  }

  const { status, data } = error.response;

  if (status === 401) {
    return data?.message || 'Session expirée. Veuillez vous reconnecter.';
  }

  if (status === 403) {
    return data?.message || 'Accès refusé.';
  }

  if (status === 404) {
    return data?.message || 'Ressource introuvable.';
  }

  if (status === 422 && data?.errors) {
    const errors = data.errors;
    const firstField = Object.keys(errors)[0];
    if (firstField && Array.isArray(errors[firstField])) {
      return errors[firstField][0];
    }
    if (typeof errors === 'object') {
      const first = Object.values(errors).flat()[0];
      if (first) return first;
    }
  }

  if (status >= 500) {
    return data?.message || 'Erreur serveur. Réessayez plus tard.';
  }

  return data?.message || fallback;
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
  online: 'En ligne',
  offline: 'Hors ligne',
  away: 'Absent',
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
  locked: 'Verrouillé',
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
