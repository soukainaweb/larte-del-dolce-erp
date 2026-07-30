import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';

const STORAGE_KEY = 'larte_erp_language';

const applyDocumentLanguage = () => {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  document.body.dir = 'rtl';
};

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  supportedLngs: ['ar'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

localStorage.setItem(STORAGE_KEY, 'ar');
applyDocumentLanguage();

i18n.on('languageChanged', () => {
  localStorage.setItem(STORAGE_KEY, 'ar');
  applyDocumentLanguage();
});

export default i18n;
