export type SupportedLanguage = 'ar' | 'en' | 'fr';

export type TextDirection = 'rtl' | 'ltr';

export interface LanguageOption {
  code: SupportedLanguage;
  labelKey: string;
}
