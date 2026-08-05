/**
 * Frontend permission helpers — mirrors backend User::hasPermission admin bypass.
 */

export const FULL_ACCESS_ROLE = 'admin';

export const hasFullAccessRole = (roleKey) => {
  if (!roleKey) return false;
  const normalized =
    typeof roleKey === 'string'
      ? roleKey
      : roleKey?.frontendKey || roleKey?.name || '';
  return normalized === FULL_ACCESS_ROLE;
};

/**
 * @param {string|null|undefined} permission
 * @param {string[]} permissions
 * @param {string|null|undefined} roleKey
 */
export const hasPermission = (permission, permissions = [], roleKey = null) => {
  if (!permission) return true;
  if (hasFullAccessRole(roleKey)) return true;
  if (!Array.isArray(permissions) || permissions.length === 0) return true;
  return permissions.includes(permission);
};
