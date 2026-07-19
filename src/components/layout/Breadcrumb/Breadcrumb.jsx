import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';

// =============================================
// BREADCRUMB CONFIGURATION
// =============================================

const routeMap = {
  '/dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  '/dashboard/orders': { label: 'Orders', icon: null },
  '/dashboard/orders/:id': { label: 'Order Details', icon: null },
  '/dashboard/products': { label: 'Products', icon: null },
  '/dashboard/customers': { label: 'Customers', icon: null },
  '/dashboard/invoices': { label: 'Invoices', icon: null },
  '/dashboard/deliveries': { label: 'Deliveries', icon: null },
  '/dashboard/production': { label: 'Production', icon: null },
  '/dashboard/reports': { label: 'Reports', icon: null },
  '/dashboard/statistics': { label: 'Statistics', icon: null },
  '/dashboard/users': { label: 'Users', icon: null },
  '/dashboard/roles': { label: 'Roles & Permissions', icon: null },
  '/dashboard/settings': { label: 'Settings', icon: null },
  '/dashboard/profile': { label: 'Profile', icon: null },
  '/dashboard/notifications': { label: 'Notifications', icon: null },
};

// =============================================
// HELPER FUNCTIONS
// =============================================

const getBreadcrumbItems = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];
  let currentPath = '';

  // Always start with Dashboard
  items.push({
    path: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    isActive: false,
  });

  // Build path segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Skip dashboard as it's already added
    if (segment === 'dashboard') continue;

    // Find matching route
    let matchedRoute = null;
    let matchedLabel = null;
    let matchedIcon = null;

    // Check exact match first
    if (routeMap[currentPath]) {
      matchedLabel = routeMap[currentPath].label;
      matchedIcon = routeMap[currentPath].icon;
    } else {
      // Check pattern match (e.g., /dashboard/orders/:id)
      for (const [route, config] of Object.entries(routeMap)) {
        const routeSegments = route.split('/').filter(Boolean);
        const pathSegments = currentPath.split('/').filter(Boolean);
        
        if (routeSegments.length === pathSegments.length) {
          let matches = true;
          for (let j = 0; j < routeSegments.length; j++) {
            if (routeSegments[j].startsWith(':')) continue;
            if (routeSegments[j] !== pathSegments[j]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            matchedLabel = config.label;
            matchedIcon = config.icon;
            break;
          }
        }
      }
    }

    // If no match found, use segment as label
    if (!matchedLabel) {
      matchedLabel = segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    items.push({
      path: currentPath,
      label: matchedLabel,
      icon: matchedIcon,
      isActive: i === segments.length - 1,
    });
  }

  return items;
};

// =============================================
// MAIN COMPONENT
// =============================================

const Breadcrumb = React.memo(() => {
  const location = useLocation();
  const pathname = location.pathname;

  const breadcrumbItems = useMemo(() => {
    return getBreadcrumbItems(pathname);
  }, [pathname]);

  // Don't render if only dashboard
  if (breadcrumbItems.length <= 1) {
    return (
      <div className="h-14 bg-white border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2 text-sm">
          <Home size={16} className="text-primary" />
          <span className="font-medium text-dark-text">Dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 bg-white border-b border-border flex items-center px-4 md:px-6 overflow-x-auto">
      <nav className="flex items-center gap-1.5 text-sm min-w-max" aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="flex-shrink-0 text-secondary-text/60"
                />
              )}

              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {isLast ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium whitespace-nowrap">
                    {Icon && <Icon size={14} className="text-primary" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-secondary-text hover:text-dark-text hover:bg-hover transition-all duration-200 whitespace-nowrap"
                  >
                    {Icon && <Icon size={14} className="text-secondary-text group-hover:text-dark-text" />}
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