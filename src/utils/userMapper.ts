import type { ApiUser, UserRow } from '../types/user';
import { mapStatus } from './userPayload';

export function getUserFirstName(user: Partial<ApiUser> | null | undefined): string {
  if (!user) return '';
  return (user.first_name ?? user.firstName ?? user.name?.split(' ')[0] ?? '').trim();
}

export function getUserLastName(user: Partial<ApiUser> | null | undefined): string {
  if (!user) return '';
  const fromFields = user.last_name ?? user.lastName;
  if (fromFields) return String(fromFields).trim();
  const parts = user.name?.split(' ') ?? [];
  return parts.length > 1 ? parts.slice(1).join(' ').trim() : '';
}

export function getUserFullName(user: Partial<ApiUser> | UserRow | null | undefined): string {
  if (!user) return '—';
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  const full = `${firstName} ${lastName}`.trim();
  return full || user.email || '—';
}

export function getUserInitials(user: Partial<ApiUser> | UserRow | null | undefined): string {
  const first = getUserFirstName(user)?.[0] ?? '';
  const last = getUserLastName(user)?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

export function normalizeUserFromApi(raw: ApiUser): UserRow {
  const firstName = getUserFirstName(raw);
  const lastName = getUserLastName(raw);

  return {
    id: raw.id,
    firstName,
    lastName,
    fullName: getUserFullName(raw),
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    status: mapStatus(raw.status ?? 'inactive'),
    role: raw.role ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    avatar: raw.avatar,
  };
}

export function normalizeUsersFromApi(items: ApiUser[] | null | undefined): UserRow[] {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeUserFromApi);
}
