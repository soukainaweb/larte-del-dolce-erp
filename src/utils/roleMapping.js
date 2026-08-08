/**
 * Centralized mapping between Laravel backend role slugs and frontend role keys / display names.
 *
 * Backend (RoleSeeder): admin, manager, accountant, sales, viewer, delivery
 * Frontend sidebar (ROLES): admin, manager, accountant, sales_rep, viewer, delivery_driver, ...
 */
import i18n from '../i18n';

/** i18n keys for Arabic/localized role labels (slug → translation key) */
export const ROLE_LABEL_KEYS = Object.freeze({
  admin: 'roles.labels.admin',
  manager: 'roles.labels.manager',
  accountant: 'roles.labels.accountant',
  sales: 'roles.labels.sales',
  sales_rep: 'roles.labels.sales',
  viewer: 'roles.labels.viewer',
  delivery: 'roles.labels.delivery',
  delivery_driver: 'roles.labels.delivery',
  production_manager: 'roles.labels.productionManager',
  factory_employee: 'roles.labels.factoryEmployee',
  warehouse_manager: 'roles.labels.warehouseManager',
  finance_manager: 'roles.labels.financeManager',
});

/** Backend slug → frontend sidebar role key */
export const BACKEND_TO_FRONTEND_ROLE = Object.freeze({
  admin: 'admin',
  manager: 'manager',
  accountant: 'accountant',
  sales: 'sales_rep',
  sales_rep: 'sales_rep',
  viewer: 'viewer',
  delivery: 'delivery_driver',
  delivery_driver: 'delivery_driver',
  production_manager: 'production_manager',
  factory_employee: 'factory_employee',
  warehouse_manager: 'warehouse_manager',
  finance_manager: 'finance_manager',
});

/** Backend slug → human-readable display name (matches RoleSeeder display_name) */
export const ROLE_DISPLAY_NAMES = Object.freeze({
  admin: 'Administrator',
  manager: 'Manager',
  accountant: 'Accountant',
  sales: 'Sales Representative',
  sales_rep: 'Sales Representative',
  viewer: 'Viewer',
  delivery: 'Delivery Driver',
  delivery_driver: 'Delivery Driver',
  production_manager: 'Production Manager',
  factory_employee: 'Factory Employee',
  warehouse_manager: 'Warehouse Manager',
  finance_manager: 'Finance Manager',
});

/** Frontend display name → backend slug (for forms/filters) */
export const DISPLAY_TO_BACKEND_ROLE = Object.freeze({
  Administrator: 'admin',
  Manager: 'manager',
  Accountant: 'accountant',
  'Sales Representative': 'sales',
  Viewer: 'viewer',
  'Delivery Driver': 'delivery',
  'Production Manager': 'production_manager',
  'Factory Employee': 'factory_employee',
  'Warehouse Manager': 'warehouse_manager',
  'Finance Manager': 'finance_manager',
});

/**
 * Resolve backend role slug from a role object or string.
 * @param {string|{ name?: string, display_name?: string }|null|undefined} role
 * @returns {string}
 */
export const getBackendRoleSlug = (role) => {
  if (!role) return '';
  if (typeof role === 'string') {
    return DISPLAY_TO_BACKEND_ROLE[role] || role.toLowerCase().replace(/\s+/g, '_');
  }
  return role.name || DISPLAY_TO_BACKEND_ROLE[role.display_name] || '';
};

/**
 * Map backend role slug to frontend sidebar role key.
 * @param {string|{ name?: string, display_name?: string }|null|undefined} role
 * @returns {string}
 */
export const mapRoleToFrontendKey = (role) => {
  const slug = getBackendRoleSlug(role);
  return BACKEND_TO_FRONTEND_ROLE[slug] || slug || 'viewer';
};

export const isSalesRepRole = (roleOrUser) => {
  if (!roleOrUser) return false;
  if (roleOrUser.role) {
    return mapRoleToFrontendKey(roleOrUser.role) === 'sales_rep';
  }
  return mapRoleToFrontendKey(roleOrUser) === 'sales_rep';
};

/**
 * Get display label for a role (prefers backend display_name when present).
 * @param {string|{ name?: string, display_name?: string }|null|undefined} role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  if (!role) return 'Utilisateur';
  if (typeof role === 'string') {
    return ROLE_DISPLAY_NAMES[role] || ROLE_DISPLAY_NAMES[DISPLAY_TO_BACKEND_ROLE[role]] || role;
  }
  if (role.display_name) return role.display_name;
  const slug = role.name || '';
  return ROLE_DISPLAY_NAMES[slug] || slug || 'Utilisateur';
};

/**
 * User-facing role label with i18n (Arabic UI shows المندوب, المدير, etc.).
 * Keeps backend slugs/IDs internal — only used for display.
 */
export const translateRoleLabel = (role) => {
  const slug = getBackendRoleSlug(role);
  const key = ROLE_LABEL_KEYS[slug];
  if (key) {
    return i18n.t(key, { defaultValue: getRoleDisplayName(role) });
  }
  return getRoleDisplayName(role);
};

/**
 * Normalize role object for storage in AuthContext / localStorage.
 * @param {object|null|undefined} role
 * @returns {{ name: string, display_name: string, frontendKey: string }}
 */
export const normalizeRole = (role) => {
  const slug = getBackendRoleSlug(role);
  const frontendKey = mapRoleToFrontendKey(role);
  const display_name = getRoleDisplayName(role);

  return {
    ...(typeof role === 'object' && role !== null ? role : {}),
    name: slug || frontendKey,
    display_name,
    frontendKey,
  };
};

/**
 * Normalize any permissions payload into a flat array of permission name strings.
 * Handles arrays, backend permission objects, and object maps from roles UI.
 *
 * @param {unknown} input
 * @returns {string[]}
 */
export const normalizePermissionNames = (input) => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((entry) => (typeof entry === 'string' ? entry : entry?.name))
      .filter(Boolean);
  }

  if (typeof input === 'object') {
    const names = [];

    Object.entries(input).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) names.push(key);
        return;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([action, enabled]) => {
          if (enabled) names.push(`${key}.${action}`);
        });
        return;
      }

      if (typeof value === 'string') {
        names.push(value);
      } else if (value?.name) {
        names.push(value.name);
      }
    });

    return names.filter(Boolean);
  }

  return [];
};

/**
 * Extract permission names from a user object returned by the API.
 * @param {object|null|undefined} user
 * @returns {string[]}
 */
export const extractUserPermissions = (user) => {
  if (!user) return [];

  const fromUser = normalizePermissionNames(user.permissions);
  if (fromUser.length > 0) return fromUser;

  return normalizePermissionNames(user.role?.permissions);
};
