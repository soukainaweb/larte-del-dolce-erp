import type { SupportedLanguage } from '../types/i18n';

const LOCALE_TAGS: Record<SupportedLanguage, string> = {
  ar: 'ar-MA',
  en: 'en-US',
  fr: 'fr-MA',
};

const FALLBACK = '—';

export function formatAppCurrency(
  value: number | string | null | undefined,
  locale: SupportedLanguage = 'fr',
  currency = 'MAD',
): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (num == null || Number.isNaN(num)) return FALLBACK;

  try {
    return new Intl.NumberFormat(LOCALE_TAGS[locale] ?? LOCALE_TAGS.fr, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${num.toLocaleString()} ${currency}`;
  }
}

export function formatAppNumber(
  value: number | string | null | undefined,
  locale: SupportedLanguage = 'fr',
): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (num == null || Number.isNaN(num)) return FALLBACK;

  try {
    return new Intl.NumberFormat(LOCALE_TAGS[locale] ?? LOCALE_TAGS.fr).format(num);
  } catch {
    return String(num);
  }
}
