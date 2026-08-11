import { describe, expect, it } from 'vitest';
import {
  resolveAvailableRolesUpdate,
  shouldPreserveRolesOnFetchError,
} from './userRolesCatalog';

describe('userRolesCatalog', () => {
  const seededRoles = [
    { id: 1, name: 'admin', display_name: 'Administrator' },
    { id: 4, name: 'sales', display_name: 'Sales Representative' },
  ];

  it('keeps previously loaded roles when a refetch returns an empty list', () => {
    expect(resolveAvailableRolesUpdate(seededRoles, [])).toEqual(seededRoles);
  });

  it('replaces roles when a refetch returns a non-empty list', () => {
    const nextRoles = [{ id: 2, name: 'manager', display_name: 'Manager' }];

    expect(resolveAvailableRolesUpdate(seededRoles, nextRoles)).toEqual(nextRoles);
  });

  it('does not treat a failed fetch as an empty role catalog when roles were loaded', () => {
    expect(shouldPreserveRolesOnFetchError(seededRoles)).toBe(true);
    expect(resolveAvailableRolesUpdate(seededRoles, null)).toEqual(seededRoles);
  });

  it('allows an empty catalog only when nothing was loaded yet', () => {
    expect(resolveAvailableRolesUpdate([], [])).toEqual([]);
    expect(shouldPreserveRolesOnFetchError([])).toBe(false);
  });
});
