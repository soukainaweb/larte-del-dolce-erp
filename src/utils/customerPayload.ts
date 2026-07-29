export interface CustomerFormInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  type?: string;
  status?: string;
  taxId?: string;
  website?: string;
  notes?: string;
}

export function mapCustomerFormToApiPayload(form: CustomerFormInput) {
  return {
    name: form.name.trim(),
    phone: form.phone?.trim() || '',
    email: form.email?.trim() || null,
    address: form.address?.trim() || null,
    status: form.status || 'active',
  };
}

export function extractCustomerFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
  const errors = axiosError.response?.data?.errors;
  if (!errors || typeof errors !== 'object') return {};

  const mapped: Record<string, string> = {};
  Object.entries(errors).forEach(([key, messages]) => {
    mapped[key] = Array.isArray(messages) ? messages[0] : String(messages);
  });
  return mapped;
}

export function normalizeCustomerFromApi(raw: Record<string, unknown>) {
  if (!raw) return null;
  return {
    ...raw,
    createdAt: raw.created_at || raw.createdAt,
    status: raw.status || 'active',
    type: raw.type || 'individual',
  };
}

export function normalizeCustomersFromApi(items: Record<string, unknown>[] = []) {
  return items.map((item) => normalizeCustomerFromApi(item)).filter(Boolean);
}
