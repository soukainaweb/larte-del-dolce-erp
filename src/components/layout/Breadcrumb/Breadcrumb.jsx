import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';

const ROUTE_KEY_MAP = {
  dashboard: 'breadcrumb.dashboard',
  orders: 'breadcrumb.orders',
  products: 'breadcrumb.products',
  customers: 'breadcrumb.customers',
  categories: 'breadcrumb.categories',
  invoices: 'breadcrumb.invoices',
  payments: 'breadcrumb.payments',
  expenses: 'breadcrumb.expenses',
  deliveries: 'breadcrumb.deliveries',
  production: 'breadcrumb.production',
  inventory: 'breadcrumb.inventory',
  warehouse: 'breadcrumb.warehouse',
  suppliers: 'breadcrumb.suppliers',
  reports: 'breadcrumb.reports',
  analytics: 'breadcrumb.analytics',
  users: 'breadcrumb.users',
  roles: 'breadcrumb.roles',
  settings: 'breadcrumb.settings',
  profile: 'breadcrumb.profile',
  notifications: 'breadcrumb.notifications',
  finance: 'breadcrumb.finance',
  'activity-logs': 'breadcrumb.activityLogs',
};

const getBreadcrumbItems = (pathname, t) => {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];

  items.push({
    path: '/dashboard',
    label: t('breadcrumb.dashboard'),
    icon: Home,
    isActive: false,
  });

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    if (segment === 'dashboard') continue;

    const key = ROUTE_KEY_MAP[segment];
    const label = key ? t(key) : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    items.push({
      path: currentPath,
      label,
      icon: segment === 'dashboard' ? LayoutDashboard : null,
      isActive: i === segments.length - 1,
    });
  }

  return items;
};

const Breadcrumb = React.memo(() => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const breadcrumbItems = useMemo(
    () => getBreadcrumbItems(location.pathname, t),
    [location.pathname, t, i18n.language]
  );

  if (breadcrumbItems.length <= 1) {
    return (
      <div className="h-14 bg-white border-b border-[#ECE7DF] flex items-center px-4 md:px-6">
        <div className="flex items-center gap-2 text-sm">
          <Home size={16} className="text-[#B8863B]" />
          <span className="font-medium text-[#2B2420]">{t('breadcrumb.dashboard')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 bg-white border-b border-[#ECE7DF] flex items-center px-4 md:px-6 overflow-x-auto">
      <nav className="flex items-center gap-1.5 text-sm min-w-max" aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className={`flex-shrink-0 text-[#8A7B68]/60 ${isRTL ? 'rotate-180' : ''}`}
                />
              )}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 5 : -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {isLast ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#B8863B]/10 text-[#B8863B] font-medium whitespace-nowrap">
                    {Icon && <Icon size={14} />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[#8A7B68] hover:text-[#2B2420] hover:bg-[#F8F5EF] transition-all duration-200 whitespace-nowrap"
                  >
                    {Icon && <Icon size={14} />}
                    {item.label}
                  </Link>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
