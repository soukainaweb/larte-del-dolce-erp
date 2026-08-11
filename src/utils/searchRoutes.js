/**
 * Global search routes map for Header search
 */
export const SEARCH_ROUTES = [
  { keywords: ['dashboard', 'tableau', 'لوحة'], route: '/dashboard', labelKey: 'nav.dashboard' },
  { keywords: ['users', 'utilisateurs', 'مستخدم'], route: '/dashboard/users', labelKey: 'nav.users' },
  { keywords: ['customers', 'clients', 'عملاء'], route: '/dashboard/customers', labelKey: 'nav.customers' },
  { keywords: ['categories', 'catégories', 'فئات'], route: '/dashboard/categories', labelKey: 'nav.categories' },
  { keywords: ['products', 'produits', 'منتجات'], route: '/dashboard/products', labelKey: 'nav.products' },
  { keywords: ['orders', 'commandes', 'طلبات'], route: '/dashboard/orders', labelKey: 'nav.orders' },
  { keywords: ['meetings', 'réunions', 'اجتماع'], route: '/dashboard/meetings', labelKey: 'nav.meetings' },
  { keywords: ['samples', 'échantillons', 'عينات'], route: '/dashboard/samples', labelKey: 'nav.samples' },
  { keywords: ['waste', 'returns', 'déchets', 'retours', 'هدر', 'مرتجع'], route: '/dashboard/waste-returns', labelKey: 'nav.wasteReturns' },
  { keywords: ['purchases', 'achats', 'مشتريات'], route: '/dashboard/purchases', labelKey: 'nav.purchases' },
  { keywords: ['production', 'إنتاج'], route: '/dashboard/production', labelKey: 'nav.production' },
  { keywords: ['inventory', 'inventaire', 'مخزون'], route: '/dashboard/inventory', labelKey: 'nav.inventory' },
  { keywords: ['warehouse', 'entrepôt', 'مستودع'], route: '/dashboard/warehouse', labelKey: 'nav.warehouse' },
  { keywords: ['suppliers', 'fournisseurs', 'مورد'], route: '/dashboard/suppliers', labelKey: 'nav.suppliers' },
  { keywords: ['deliveries', 'livraisons', 'توصيل'], route: '/dashboard/deliveries', labelKey: 'nav.deliveries' },
  { keywords: ['invoices', 'factures', 'فواتير'], route: '/dashboard/invoices', labelKey: 'nav.invoices' },
  { keywords: ['payments', 'paiements', 'مدفوعات'], route: '/dashboard/payments', labelKey: 'nav.payments' },
  { keywords: ['expenses', 'dépenses', 'مصروف'], route: '/dashboard/expenses', labelKey: 'nav.expenses' },
  { keywords: ['finance', 'مالية'], route: '/dashboard/finance', labelKey: 'nav.finance' },
  { keywords: ['reports', 'rapports', 'تقارير'], route: '/dashboard/reports', labelKey: 'nav.reports' },
  { keywords: ['analytics', 'تحليل'], route: '/dashboard/analytics', labelKey: 'nav.analytics' },
  { keywords: ['notifications', 'إشعار'], route: '/dashboard/notifications', labelKey: 'nav.notifications' },
  { keywords: ['roles', 'permissions', 'rôles', 'أدوار'], route: '/dashboard/roles', labelKey: 'nav.roles' },
  { keywords: ['activity', 'journal', 'سجل'], route: '/dashboard/activity-logs', labelKey: 'nav.activityLogs' },
  { keywords: ['settings', 'paramètres', 'إعدادات'], route: '/dashboard/settings', labelKey: 'nav.settings' },
  { keywords: ['profile', 'profil', 'ملف'], route: '/dashboard/profile', labelKey: 'nav.profile' },
];

export const findSearchRoute = (term) => {
  if (!term || term.trim().length < 2) return null;
  const q = term.toLowerCase().trim();
  return SEARCH_ROUTES.find((item) =>
    item.keywords.some((kw) => kw.includes(q) || q.includes(kw))
  );
};

/**
 * Resolve active sidebar item from pathname
 */
export const getActiveMenuId = (pathname) => {
  const pathMap = {
    '/dashboard': 'dashboard',
    '/dashboard/users': 'users',
    '/dashboard/customers': 'customers',
    '/dashboard/categories': 'categories',
    '/dashboard/products': 'products',
    '/dashboard/orders': 'orders',
    '/dashboard/meetings': 'meetings',
    '/dashboard/samples': 'samples',
    '/dashboard/waste-returns': 'wasteReturns',
    '/dashboard/purchases': 'purchases',
    '/dashboard/production': 'production',
    '/dashboard/inventory': 'inventory',
    '/dashboard/warehouse': 'warehouse',
    '/dashboard/suppliers': 'suppliers',
    '/dashboard/deliveries': 'deliveries',
    '/dashboard/invoices': 'invoices',
    '/dashboard/payments': 'payments',
    '/dashboard/expenses': 'expenses',
    '/dashboard/finance': 'finance',
    '/dashboard/reports': 'reports',
    '/dashboard/analytics': 'analytics',
    '/dashboard/notifications': 'notifications',
    '/dashboard/roles': 'roles',
    '/dashboard/activity-logs': 'activity',
    '/dashboard/settings': 'settings',
    '/dashboard/profile': 'profile',
    '/dashboard/help': 'help',
    '/dashboard/documentation': 'documentation',
  };

  if (pathMap[pathname]) return pathMap[pathname];

  const segment = pathname.replace('/dashboard/', '').split('/')[0];
  const segmentMap = {
    'activity-logs': 'activity',
    roles: 'roles',
  };
  return segmentMap[segment] || segment || 'dashboard';
};

export default { SEARCH_ROUTES, findSearchRoute, getActiveMenuId };
