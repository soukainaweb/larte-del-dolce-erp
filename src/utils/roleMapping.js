/**
 * Centralized mapping between Laravel backend role slugs and frontend role keys / display names.
 *
 * Backend (RoleSeeder): admin, manager, accountant, sales, viewer, delivery
 * Frontend sidebar (ROLES): admin, manager, accountant, sales_rep, viewer, delivery_driver, ...
 */

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
 * Extract permission names from a user object returned by the API.
 * @param {object|null|undefined} user
 * @returns {string[]}
 */
export const extractUserPermissions = (user) => {
  if (!user?.role?.permissions) return [];
  return user.role.permissions.map((p) => (typeof p === 'string' ? p : p.name)).filter(Boolean);
};
