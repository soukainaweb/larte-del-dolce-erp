/**
 * Frontend permission helpers — mirrors backend User::hasPermission admin bypass.
 */
import { getBackendRoleSlug, isSalesRepRole, mapRoleToFrontendKey, normalizePermissionNames } from './roleMapping';

export const FULL_ACCESS_ROLE = 'admin';

const ADMIN_BACKEND_SLUG = 'admin';

/**
 * Normalize any role representation to the frontend sidebar role key.
 * Handles slug ("admin"), display label ("Administrator"), and role objects.
 *
 * @param {string|{ name?: string, display_name?: string, frontendKey?: string }|null|undefined} role
 * @returns {string}
 */
export const resolveRoleKey = (role) => {
  if (!role) return '';
  if (typeof role === 'object') {
    if (role.frontendKey) return role.frontendKey;
    return mapRoleToFrontendKey(role);
  }
  return mapRoleToFrontendKey(role);
};

/**
 * True when the user is an administrator (any supported role shape).
 *
 * @param {string|object|null|undefined} role
 */
export const isAdminRole = (role) => getBackendRoleSlug(role) === ADMIN_BACKEND_SLUG;

/** @deprecated Use isAdminRole — kept for existing imports */
export const hasFullAccessRole = isAdminRole;

/**
 * @param {string|null|undefined} permission
 * @param {string[]} permissions
 * @param {string|object|null|undefined} roleKey
 */
export const hasPermission = (permission, permissions = [], roleKey = null) => {
  if (!permission) return true;
  if (isAdminRole(roleKey)) return true;

  const permissionList = normalizePermissionNames(permissions);
  if (permissionList.length === 0) return false;
  return permissionList.includes(permission);
};

/** Always returns a string[] regardless of backend / cache shape. */
export const resolvePermissionList = (permissions) => normalizePermissionNames(permissions);

/**
 * Whether the current user may transfer orders between sales representatives.
 * Mirrors backend OrderTransferPolicy + OrderTransferController (sales reps blocked).
 *
 * @param {{ authLoading?: boolean, user?: object|null, roleKey?: string|null, permissions?: string[] }} params
 */
export const canTransferOrders = ({ authLoading = false, user = null, roleKey = null, permissions = [] }) => {
  if (authLoading) return false;
  if (isSalesRepRole(user)) return false;
  const role = user?.role ?? roleKey;
  return hasPermission('orders.view', permissions, role)
    && hasPermission('orders.update', permissions, role);
};
