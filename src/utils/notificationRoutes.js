// src/utils/notificationRoutes.js

/**
 * Mapping des types de notifications vers leurs routes
 * TOUTES LES ROUTES SONT PRÉFIXÉES PAR /dashboard
 */
export const ROUTE_MAPPING = {
  order: {
    detail: '/dashboard/orders/:id',
    list: '/dashboard/orders'
  },
  customer: {
    detail: '/dashboard/customers/:id',
    list: '/dashboard/customers'
  },
  client: {
    detail: '/dashboard/customers/:id',
    list: '/dashboard/customers'
  },
  product: {
    detail: '/dashboard/products/:id',
    list: '/dashboard/products'
  },
  category: {
    detail: '/dashboard/categories/:id',
    list: '/dashboard/categories'
  },
  classification: {
    detail: '/dashboard/categories/:id',
    list: '/dashboard/categories'
  },
  meeting: {
    detail: '/dashboard/meetings/:id',
    list: '/dashboard/meetings'
  },
  meetings: {
    detail: '/dashboard/meetings/:id',
    list: '/dashboard/meetings'
  },
  supplier: {
    detail: '/dashboard/suppliers/:id',
    list: '/dashboard/suppliers'
  },
  warehouse: {
    detail: '/dashboard/warehouse/:id',
    list: '/dashboard/warehouse'
  },
  expense: {
    detail: '/dashboard/expenses/:id',
    list: '/dashboard/expenses'
  },
  purchase: {
    detail: '/dashboard/purchases/:id',
    list: '/dashboard/purchases'
  },
  waste_return: {
    detail: '/dashboard/waste-returns/:id',
    list: '/dashboard/waste-returns'
  },
  role: {
    detail: '/dashboard/roles/:id',
    list: '/dashboard/roles'
  },
  permission: {
    detail: '/dashboard/roles',
    list: '/dashboard/roles'
  },
  sample: {
    detail: '/dashboard/samples',
    list: '/dashboard/samples'
  },
  invoice: {
    detail: '/dashboard/invoices/:id',
    list: '/dashboard/invoices'
  },
  payment: {
    detail: '/dashboard/payments/:id',
    list: '/dashboard/payments'
  },
  production: {
    detail: '/dashboard/production/:id',
    list: '/dashboard/production'
  },
  delivery: {
    detail: '/dashboard/deliveries/:id',
    list: '/dashboard/deliveries'
  },
  user: {
    detail: '/dashboard/users/:id',
    list: '/dashboard/users'
  },
  employee: {
    detail: '/dashboard/users/:id',
    list: '/dashboard/users'
  },
  report: {
    detail: '/dashboard/reports/:id',
    list: '/dashboard/reports'
  },
  analytics: {
    detail: '/dashboard/analytics',
    list: '/dashboard/analytics'
  },
  stock: {
    detail: '/dashboard/inventory',
    list: '/dashboard/inventory'
  },
  settings: {
    detail: '/dashboard/settings',
    list: '/dashboard/settings'
  },
  notification: {
    detail: '/dashboard/notifications',
    list: '/dashboard/notifications'
  },
  activity: {
    detail: '/dashboard/activity-logs',
    list: '/dashboard/activity-logs'
  },
  calendar: {
    detail: '/dashboard/meetings',
    list: '/dashboard/meetings'
  },
  system: {
    detail: '/dashboard/settings',
    list: '/dashboard/settings'
  }
};

/**
 * Génère la route complète pour une notification
 * @param {Object} notification - L'objet notification
 * @param {string} notification.type - Le type de notification
 * @param {string} notification.entityId - L'ID de l'entité concernée
 * @param {string} notification.route - Route personnalisée (optionnelle)
 * @returns {string} - La route complète
 */
export const getNotificationRoute = (notification) => {
  // Si une route personnalisée est définie, l'utiliser
  if (notification.route) {
    return notification.route;
  }

  const { type, entityId } = notification;
  const mapping = ROUTE_MAPPING[type];

  if (!mapping) {
    // Fallback: retourner au dashboard
    return '/dashboard';
  }

  // Si l'entité a un ID, utiliser la route détaillée
  if (entityId && mapping.detail) {
    return mapping.detail.replace(':id', entityId);
  }

  // Sinon, retourner la route de liste
  return mapping.list || '/dashboard';
};

/**
 * Vérifie si une notification a une route détaillée
 * @param {Object} notification - L'objet notification
 * @returns {boolean} - True si la notification a une route détaillée
 */
export const hasDetailRoute = (notification) => {
  const mapping = ROUTE_MAPPING[notification.type];
  return mapping && mapping.detail && notification.entityId;
};

/**
 * Génère une route de fallback pour une notification
 * @param {Object} notification - L'objet notification
 * @returns {string} - La route de fallback
 */
export const getFallbackRoute = (notification) => {
  const mapping = ROUTE_MAPPING[notification.type];
  return mapping?.list || '/dashboard';
};

/**
 * Récupère le label du module pour une notification
 * @param {Object} notification - L'objet notification
 * @returns {string} - Le label du module
 */
export const getModuleLabel = (notification) => {
  const labels = {
    order: 'Commandes',
    customer: 'Clients',
    client: 'Clients',
    product: 'Produits',
    category: 'Catégories',
    classification: 'Classifications',
    invoice: 'Factures',
    payment: 'Paiements',
    production: 'Production',
    delivery: 'Livraisons',
    user: 'Utilisateurs',
    employee: 'Employés',
    report: 'Rapports',
    analytics: 'Analytics',
    stock: 'Stock',
    settings: 'Paramètres',
    notification: 'Notifications',
    activity: "Journal d'activité",
    calendar: 'Calendrier',
    meeting: 'Réunions',
    meetings: 'Réunions',
    sample: 'Échantillons',
    supplier: 'Fournisseurs',
    warehouse: 'Entrepôts',
    expense: 'Dépenses',
    purchase: 'Achats',
    waste_return: 'Déchets & retours',
    role: 'Rôles',
    permission: 'Permissions',
    system: 'Système'
  };
  return labels[notification.type] || notification.type || 'Général';
};

/**
 * Récupère l'icône du module pour une notification
 * @param {Object} notification - L'objet notification
 * @returns {string} - Le nom de l'icône
 */
export const getModuleIcon = (notification) => {
  const icons = {
    order: 'ShoppingBag',
    customer: 'User',
    client: 'User',
    product: 'Package',
    category: 'Layers',
    classification: 'Tag',
    invoice: 'FileText',
    payment: 'CreditCard',
    production: 'Factory',
    delivery: 'Truck',
    user: 'Users',
    employee: 'UserRound',
    report: 'FileText',
    analytics: 'BarChart3',
    stock: 'Package',
    settings: 'Settings',
    notification: 'Bell',
    activity: 'Activity',
    calendar: 'Calendar',
    meeting: 'Calendar',
    meetings: 'Calendar',
    sample: 'FlaskConical',
    supplier: 'ShoppingCart',
    warehouse: 'Warehouse',
    expense: 'Wallet',
    purchase: 'Briefcase',
    waste_return: 'Recycle',
    role: 'ShieldCheck',
    permission: 'ShieldCheck',
    system: 'Settings'
  };
  return icons[notification.type] || 'Bell';
};

/**
 * Vérifie si une route détaillée existe pour un type
 * @param {string} type - Le type de notification
 * @returns {boolean} - True si la route détaillée existe
 */
export const hasDetailPage = (type) => {
  const mapping = ROUTE_MAPPING[type];
  return mapping && mapping.detail !== undefined;
};

/**
 * Récupère toutes les routes disponibles pour un type
 * @param {string} type - Le type de notification
 * @returns {Object} - Les routes disponible
 */
export const getRoutesByType = (type) => {
  return ROUTE_MAPPING[type] || null;
};