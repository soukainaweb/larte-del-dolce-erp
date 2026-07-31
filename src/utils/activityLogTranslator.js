import i18n from '../i18n';

const ACTION_KEYS = {
  created: 'activityLog.actions.created',
  create: 'activityLog.actions.created',
  updated: 'activityLog.actions.updated',
  update: 'activityLog.actions.updated',
  deleted: 'activityLog.actions.deleted',
  delete: 'activityLog.actions.deleted',
  login: 'activityLog.actions.login',
  logout: 'activityLog.actions.logout',
};

const MODULE_KEYS = {
  customer: 'activityLog.modules.customer',
  customers: 'activityLog.modules.customer',
  product: 'activityLog.modules.product',
  products: 'activityLog.modules.product',
  user: 'activityLog.modules.user',
  users: 'activityLog.modules.user',
  auth: 'activityLog.modules.auth',
  order: 'activityLog.modules.order',
  orders: 'activityLog.modules.order',
  inventory: 'activityLog.modules.inventory',
};

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

export const translateActivityAction = (action) => {
  const key = normalizeKey(action);
  if (!key) return '—';

  const i18nKey = ACTION_KEYS[key];
  if (i18nKey) return i18n.t(i18nKey);

  return i18n.t(`activityLog.actions.${key}`, { defaultValue: action });
};

export const translateActivityModule = (module) => {
  const key = normalizeKey(module);
  if (!key) return '—';

  const i18nKey = MODULE_KEYS[key];
  if (i18nKey) return i18n.t(i18nKey);

  return i18n.t(`activityLog.modules.${key}`, { defaultValue: module });
};

export const formatActivitySummary = (action, module) => {
  return `${translateActivityAction(action)} • ${translateActivityModule(module)}`;
};
