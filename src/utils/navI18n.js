/**
 * Maps sidebar menu item ids to i18n nav keys
 */
export const NAV_I18N_KEYS = {
  dashboard: 'nav.dashboard',
  users: 'nav.users',
  customers: 'nav.customers',
  categories: 'nav.categories',
  products: 'nav.products',
  orders: 'nav.orders',
  production: 'nav.production',
  inventory: 'nav.inventory',
  warehouse: 'nav.warehouse',
  suppliers: 'nav.suppliers',
  deliveries: 'nav.deliveries',
  invoices: 'nav.invoices',
  payments: 'nav.payments',
  expenses: 'nav.expenses',
  finance: 'nav.finance',
  reports: 'nav.reports',
  analytics: 'nav.analytics',
  notifications: 'nav.notifications',
  roles: 'nav.roles',
  activity: 'nav.activityLogs',
  settings: 'nav.settings',
  profile: 'nav.profile',
};

export const getNavLabel = (t, id) => {
  const key = NAV_I18N_KEYS[id];
  return key ? t(key) : id;
};

export default NAV_I18N_KEYS;
