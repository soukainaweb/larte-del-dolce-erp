import { useTranslation } from 'react-i18next';
import { getActionLabels, getCommonStatusConfig, getStatusLabel } from '../utils/i18nLabels';

/**
 * Hook for page-level i18n labels (title, subtitle, search, common CRUD labels).
 * @param {string} namespace - e.g. 'orders', 'customers'
 */
export const usePageI18n = (namespace) => {
  const { t, i18n } = useTranslation();

  return {
    t,
    i18n,
    isRTL: true,
    title: t(`${namespace}.title`),
    subtitle: t(`${namespace}.subtitle`),
    searchPlaceholder: t(`${namespace}.search`, t('common.search')),
    statusLabel: (key) => t(`${namespace}.status.${key}`, getStatusLabel(t, key)),
    commonStatus: getCommonStatusConfig(t),
    actions: getActionLabels(t),
    tc: (key) => t(`common.${key}`),
  };
};

export default usePageI18n;
