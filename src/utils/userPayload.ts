import { DISPLAY_TO_BACKEND_ROLE } from './roleMapping';

export interface UserFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  password?: string;
}

export interface ApiRoleOption {
  id: number;
  name: string;
  display_name?: string;
}

/** Raw keys stored in MySQL `users.status` */
export const DB_USER_STATUSES = ['active', 'inactive', 'suspended', 'locked'] as const;
export type DbUserStatus = (typeof DB_USER_STATUSES)[number];

/**
 * Maps UI labels (any locale), legacy keys, or raw DB keys → canonical DB status.
 * NEVER pass translated labels (e.g. "نشط") to the API.
 */
const STATUS_LABEL_TO_KEY: Record<string, DbUserStatus> = {
  // Raw DB keys
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  locked: 'locked',
  // Legacy presence keys (old schema)
  online: 'active',
  offline: 'inactive',
  away: 'inactive',
  // English
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
  Locked: 'locked',
  // French
  Actif: 'active',
  actif: 'active',
  Inactif: 'inactive',
  inactif: 'inactive',
  Suspendu: 'suspended',
  suspendu: 'suspended',
  Verrouillé: 'locked',
  Verrouille: 'locked',
  verrouillé: 'locked',
  verrouille: 'locked',
  // Arabic
  'نشط': 'active',
  'غير نشط': 'inactive',
  'موقوف': 'suspended',
  'مقفل': 'locked',
};

export function mapStatus(status?: string): DbUserStatus {
  if (!status?.trim()) {
    return 'active';
  }

  const trimmed = status.trim();
  const lower = trimmed.toLowerCase();

  if ((DB_USER_STATUSES as readonly string[]).includes(lower)) {
    return lower as DbUserStatus;
  }

  const fromLabel = STATUS_LABEL_TO_KEY[trimmed] ?? STATUS_LABEL_TO_KEY[lower];
  if (fromLabel) {
    return fromLabel;
  }

  return 'active';
}

/** Normalize API / form value for controlled select (value= DB key) */
export const normalizeStatusForForm = mapStatus;

export function generateDefaultPassword(): string {
  return `Larte${Date.now().toString(36).slice(-6)}!1`;
}

export function resolveRoleId(roleLabel: string, roles: ApiRoleOption[]): number | null {
  if (!roleLabel || !roles.length) return null;

  const slug = DISPLAY_TO_BACKEND_ROLE[roleLabel]
    ?? roleLabel.toLowerCase().replace(/\s+/g, '_');

  const match = roles.find(
    (role) =>
      role.id != null &&
      (role.name === slug ||
        role.display_name === roleLabel ||
        role.name === roleLabel),
  );

  return match?.id ?? null;
}

export function mapUserFormToApiPayload(
  form: UserFormInput,
  roles: ApiRoleOption[],
): Record<string, string | number | null> {
  const roleId = resolveRoleId(form.role, roles);
  if (!roleId) {
    throw new Error('INVALID_ROLE');
  }

  return {
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
    role_id: roleId,
    status: mapStatus(form.status),
    password: form.password?.trim() || generateDefaultPassword(),
  };
}

export function mapUserFormToUpdatePayload(
  form: UserFormInput,
  roles: ApiRoleOption[],
): Record<string, string | number | null> {
  const roleId = resolveRoleId(form.role, roles);
  if (!roleId) {
    throw new Error('INVALID_ROLE');
  }

  return {
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
    role_id: roleId,
    status: mapStatus(form.status),
  };
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
  const errors = axiosError.response?.data?.errors;
  if (!errors || typeof errors !== 'object') return {};

  const mapped: Record<string, string> = {};
  Object.entries(errors).forEach(([key, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    if (key === 'first_name') mapped.firstName = message;
    else if (key === 'last_name') mapped.lastName = message;
    else if (key === 'role_id') mapped.role = message;
    else mapped[key] = message;
  });
  return mapped;
}
