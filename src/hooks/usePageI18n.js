import { useTranslation } from 'react-i18next';

/**
 * Hook for page-level i18n labels (title, subtitle, search)
 * @param {string} namespace - e.g. 'orders', 'customers'
 */
export const usePageI18n = (namespace) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return {
    t,
    i18n,
    isRTL,
    title: t(`${namespace}.title`),
    subtitle: t(`${namespace}.subtitle`),
    searchPlaceholder: t(`${namespace}.search`),
    statusLabel: (key) => t(`${namespace}.status.${key}`, key),
  };
};

export default usePageI18n;
