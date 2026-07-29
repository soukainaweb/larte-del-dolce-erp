import { format, isValid, parseISO } from 'date-fns';
import { ar, enUS, fr } from 'date-fns/locale';
import type { SupportedLanguage } from '../types/i18n';

const DATE_LOCALES = {
  ar,
  en: enUS,
  fr,
} as const;

const FALLBACK = '—';

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const isoCandidate = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const parsed = parseISO(isoCandidate);
  if (isValid(parsed)) return parsed;

  const fallback = new Date(raw);
  return isValid(fallback) ? fallback : null;
}

export function formatAppDate(
  value: string | Date | null | undefined,
  locale: SupportedLanguage = 'fr',
  pattern = 'dd/MM/yyyy',
): string {
  if (value == null || value === '') return FALLBACK;

  try {
    const date = toDate(value);
    if (!date) return FALLBACK;
    return format(date, pattern, { locale: DATE_LOCALES[locale] ?? fr });
  } catch {
    return FALLBACK;
  }
}

export function formatAppDateTime(
  value: string | Date | null | undefined,
  locale: SupportedLanguage = 'fr',
): string {
  return formatAppDate(value, locale, 'dd/MM/yyyy HH:mm');
}
