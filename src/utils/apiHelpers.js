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
