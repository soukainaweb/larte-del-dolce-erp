import { ensureArray } from './apiHelpers';

/**
 * Decide the next availableRoles state after a successful roles API response.
 * Keeps previously loaded roles when the API returns an empty list.
 */
export const resolveAvailableRolesUpdate = (previousRoles, fetchedRoles) => {
  const nextRoles = ensureArray(fetchedRoles);
  if (nextRoles.length > 0) {
    return nextRoles;
  }

  return ensureArray(previousRoles);
};

/**
 * Returns true when a failed fetch should preserve the existing dropdown options.
 */
export const shouldPreserveRolesOnFetchError = (previousRoles) => {
  return ensureArray(previousRoles).length > 0;
};
