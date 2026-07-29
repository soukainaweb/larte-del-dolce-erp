import i18n from './index';
import type { SupportedLanguage, TextDirection } from '../types/i18n';

export const STORAGE_KEY = 'larte_erp_language';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ar', 'en', 'fr'];

export function getTextDirection(language?: string): TextDirection {
  return (language ?? i18n.language) === 'ar' ? 'rtl' : 'ltr';
}

export function isRTL(language?: string): boolean {
  return getTextDirection(language) === 'rtl';
}

export function applyDocumentLanguage(language: SupportedLanguage): void {
  const dir = getTextDirection(language);
  document.documentElement.lang = language;
  document.documentElement.dir = dir;
  document.body.dir = dir;
}

export function getCurrentLanguage(): SupportedLanguage {
  const base = i18n.language?.split('-')[0];
  if (base === 'ar' || base === 'en' || base === 'fr') {
    return base;
  }
  return 'fr';
}

export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  localStorage.setItem(STORAGE_KEY, language);
  applyDocumentLanguage(language);
}
