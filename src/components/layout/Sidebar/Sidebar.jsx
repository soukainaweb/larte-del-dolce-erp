// src/components/layout/Sidebar/Sidebar.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavLabel } from '../../../utils/navI18n';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  FileText,
  Truck,
  Factory,
  Warehouse,
  Boxes,
  ShoppingCart,
  CreditCard,
  Wallet,
  BadgeDollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Briefcase,
  UsersRound,
  ShieldCheck,
  Settings,
  Bell,
  UserCircle,
  LifeBuoy,
  BookOpen,
  History,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  Cookie,
  FolderTree,
  CalendarDays,
  FlaskConical,
  Recycle,
} from 'lucide-react';
import brandLogo from '../../../constants/brandAssets';
import { isAdminRole, resolveRoleKey, resolvePermissionList } from '../../../utils/permissions';
import { hasMenuBadge, resolveNotificationsMenuBadge } from '../../../utils/notificationBadge';

const REQUIRED_ADMIN_MENU_IDS = [
  'meetings',
  'samples',
  'wasteReturns',
  'purchases',
  'categories',
  'products',
];

// ==================================================
// DESIGN TOKENS — L'arte del dolce ERP Sidebar
// ==================================================
const COLORS = Object.freeze({
  background: '#FFFFFF',
  primary: '#B8863B',
  darkGold: '#9E6C30',
  hover: '#F8F5EF',
  border: '#ECE7DF',
  text: '#2B2420',
  textSecondary: '#8A7B68',
  badge: '#E8A33D',
  badgeText: '#7A4B12',
  danger: '#D0483C',
  online: '#3FB65F',
  cream: '#FBF8F2',
});

const TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 90;

// ==================================================
// ROLE SYSTEM
// ==================================================
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  SALES_REP: 'sales_rep',
  PRODUCTION_MANAGER: 'production_manager',
  FACTORY_EMPLOYEE: 'factory_employee',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  DELIVERY_DRIVER: 'delivery_driver',
  FINANCE_MANAGER: 'finance_manager',
  MANAGER: 'manager',
  VIEWER: 'viewer',
});

const FULL_ACCESS_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.MANAGER];

const isItemVisible = (item, role, permissions) => {
  if (item.visible === false) return false;

  if (isAdminRole(role)) return true;

  const permissionList = resolvePermissionList(permissions);

  if (item.permission) {
    if (permissionList.length > 0) {
      return permissionList.includes(item.permission);
    }
    const roleKey = resolveRoleKey(role);
    if (!item.roles || item.roles.length === 0) return false;
    if (FULL_ACCESS_ROLES.includes(roleKey)) return true;
    return item.roles.includes(roleKey);
  }

  return true;
};

// ==================================================
// DEFAULT MENU CONFIGURATION
// ==================================================
const ALL_CORE_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.MANAGER];

const DASHBOARD_ITEM = {
  id: 'dashboard',
  title: 'Dashboard',
  icon: LayoutDashboard,
  route: '/dashboard',
  roles: [],
  badge: null,
  children: null,
  permission: 'dashboard.view',
  visible: true,
};

const DEFAULT_MENU_CONFIG = [
  // ---------- GESTION ----------
  {
    id: 'users',
    title: 'Utilisateurs',
    icon: UsersRound,
    route: '/dashboard/users',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
    badge: null,
    children: null,
    permission: 'users.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'customers',
    title: 'Clients',
    icon: Users,
    route: '/dashboard/customers',
    roles: [...ALL_CORE_ROLES, ROLES.SALES_REP],
    badge: null,
    children: null,
    permission: 'customers.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'categories',
    title: 'Catégories',
    icon: FolderTree,
    route: '/dashboard/categories',
    roles: ALL_CORE_ROLES,
    badge: null,
    children: null,
    permission: 'categories.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'products',
    title: 'Produits',
    icon: Package,
    route: '/dashboard/products',
    roles: [...ALL_CORE_ROLES, ROLES.PRODUCTION_MANAGER, ROLES.WAREHOUSE_MANAGER],
    badge: null,
    children: null,
    permission: 'products.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'orders',
    title: 'Commandes',
    icon: ClipboardList,
    route: '/dashboard/orders',
    roles: [...ALL_CORE_ROLES, ROLES.SALES_REP],
    badge: null,
    children: null,
    permission: 'orders.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'meetings',
    title: 'Réunions',
    icon: CalendarDays,
    route: '/dashboard/meetings',
    roles: [...ALL_CORE_ROLES, ROLES.SALES_REP],
    badge: null,
    children: null,
    permission: 'meetings.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'samples',
    title: 'Échantillons',
    icon: FlaskConical,
    route: '/dashboard/samples',
    roles: [...ALL_CORE_ROLES, ROLES.SALES_REP],
    badge: null,
    children: null,
    permission: 'samples.view',
    visible: true,
    group: 'gestion',
  },
  {
    id: 'production',
    title: 'Production',
    icon: Factory,
    route: '/dashboard/production',
    roles: [...ALL_CORE_ROLES, ROLES.PRODUCTION_MANAGER, ROLES.FACTORY_EMPLOYEE],
    badge: null,
    children: null,
    permission: 'productions.view',
    visible: true,
    group: 'gestion',
  },

  // ---------- STOCK & PRODUCTION ----------
  {
    id: 'inventory',
    title: 'Inventaire',
    icon: Boxes,
    route: '/dashboard/inventory',
    roles: [...ALL_CORE_ROLES, ROLES.WAREHOUSE_MANAGER, ROLES.PRODUCTION_MANAGER],
    badge: null,
    children: null,
    permission: 'inventory.view',
    visible: true,
    group: 'stock',
  },
  {
    id: 'warehouse',
    title: 'Entrepôt',
    icon: Warehouse,
    route: '/dashboard/warehouse',
    roles: [...ALL_CORE_ROLES, ROLES.WAREHOUSE_MANAGER],
    badge: null,
    children: null,
    permission: 'warehouses.view',
    visible: true,
    group: 'stock',
  },
  {
    id: 'suppliers',
    title: 'Fournisseurs',
    icon: ShoppingCart,
    route: '/dashboard/suppliers',
    roles: [...ALL_CORE_ROLES, ROLES.WAREHOUSE_MANAGER],
    badge: null,
    children: null,
    permission: 'suppliers.view',
    visible: true,
    group: 'stock',
  },
  {
    id: 'purchases',
    title: 'Achats',
    icon: Briefcase,
    route: '/dashboard/purchases',
    roles: [...ALL_CORE_ROLES, ROLES.WAREHOUSE_MANAGER],
    badge: null,
    children: null,
    permission: 'purchases.view',
    visible: true,
    group: 'stock',
  },
  {
    id: 'wasteReturns',
    title: 'Déchets & Retours',
    icon: Recycle,
    route: '/dashboard/waste-returns',
    roles: [...ALL_CORE_ROLES, ROLES.WAREHOUSE_MANAGER, ROLES.PRODUCTION_MANAGER],
    badge: null,
    children: null,
    permission: 'waste_returns.view',
    visible: true,
    group: 'stock',
  },
  {
    id: 'deliveries',
    title: 'Livraisons',
    icon: Truck,
    route: '/dashboard/deliveries',
    roles: [...ALL_CORE_ROLES, ROLES.DELIVERY_DRIVER],
    badge: null,
    children: null,
    permission: 'deliveries.view',
    visible: true,
    group: 'stock',
  },

  // ---------- FINANCE ----------
  {
    id: 'invoices',
    title: 'Factures',
    icon: FileText,
    route: '/dashboard/invoices',
    roles: [...ALL_CORE_ROLES, ROLES.FINANCE_MANAGER],
    badge: null,
    children: null,
    permission: 'invoices.view',
    visible: true,
    group: 'finance',
  },
  {
    id: 'payments',
    title: 'Paiements',
    icon: BadgeDollarSign,
    route: '/dashboard/payments',
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FINANCE_MANAGER],
    badge: null,
    children: null,
    permission: 'payments.view',
    visible: true,
    group: 'finance',
  },
  {
    id: 'expenses',
    title: 'Dépenses',
    icon: Wallet,
    route: '/dashboard/expenses',
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FINANCE_MANAGER],
    badge: null,
    children: null,
    permission: 'expenses.view',
    visible: true,
    group: 'finance',
  },
  {
    id: 'finance',
    title: 'Finances',
    icon: CreditCard,
    route: '/dashboard/finance',
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FINANCE_MANAGER],
    badge: null,
    children: null,
    permission: 'finance.view',
    visible: true,
    group: 'finance',
  },

  // ---------- RAPPORTS ----------
  {
    id: 'reports',
    title: 'Rapports',
    icon: BarChart3,
    route: '/dashboard/reports',
    roles: ALL_CORE_ROLES,
    badge: null,
    children: null,
    permission: 'reports.view',
    visible: true,
    group: 'rapports',
  },
  
  {
    id: 'analytics',
    title: 'Analytics',
    icon: PieChart,
    route: '/dashboard/analytics',
    roles: ALL_CORE_ROLES,
    badge: null,
    children: null,
    permission: 'reports.view',
    visible: true,
    group: 'rapports',
  },

  // ---------- PARAMÈTRES ----------
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    route: '/dashboard/notifications',
    roles: [],
    badge: null,
    children: null,
    permission: 'notifications.view',
    visible: true,
    group: 'parametres',
  },
  {
    id: 'roles',
    title: 'Rôles & Permissions',
    icon: ShieldCheck,
    route: '/dashboard/roles',
    roles: [ROLES.ADMIN],
    badge: null,
    children: null,
    permission: 'roles.view',
    visible: true,
    group: 'parametres',
  },
  
  {
    id: 'activity',
    title: "Journal d'activité",
    icon: History,
    route: '/dashboard/activity-logs',
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    badge: null,
    children: null,
    permission: 'users.view',
    visible: true,
    group: 'parametres',
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: Settings,
    route: '/dashboard/settings',
    roles: [ROLES.ADMIN],
    badge: null,
    children: null,
    permission: 'settings.view',
    visible: true,
    group: 'parametres',
  },
  {
    id: 'profile',
    title: 'Mon Profil',
    icon: UserCircle,
    route: '/dashboard/profile',
    roles: [],
    badge: null,
    children: null,
    permission: null,
    visible: true,
    group: 'parametres',
  },
];

const GROUP_LABELS = [
  { id: 'gestion', labelKey: 'nav.groups.gestion' },
  { id: 'stock', labelKey: 'nav.groups.stock' },
  { id: 'finance', labelKey: 'nav.groups.finance' },
  { id: 'rapports', labelKey: 'nav.groups.rapports' },
  { id: 'parametres', labelKey: 'nav.groups.parametres' },
];
export { GROUP_LABELS };

// ==================================================
// HOOKS
// ==================================================
function useDismiss(ref, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, isOpen, onClose]);
}

// ==================================================
// LOGO MARK
// ==================================================
const DEFAULT_LOGO_SRC = brandLogo;

const LogoMark = memo(function LogoMark({ logo, size }) {
  const [failed, setFailed] = useState(false);
  const src = logo || DEFAULT_LOGO_SRC;

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_2px_10px_rgba(184,134,59,0.18)]"
      style={{ width: size, height: size, border: `1px solid ${COLORS.border}` }}
    >
      {!failed ? (
        <img
          src={src}
          alt="L'arte del dolce"
          className="object-contain"
          style={{ width: size * 0.7, height: size * 0.7 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Cookie
          strokeWidth={1.6}
          style={{ width: size * 0.52, height: size * 0.52, color: COLORS.primary }}
        />
      )}
    </span>
  );
});

// ==================================================
// SIDEBAR HEADER
// ==================================================
const SidebarHeader = memo(function SidebarHeader({
  logo,
  appName,
  appSuffix,
  isCollapsed,
  isMobile,
  onToggleCollapse,
  onCloseMobile,
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`relative flex shrink-0 items-center border-b px-4 py-4 ${
        isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
      }`}
      style={{ borderColor: COLORS.border, minHeight: 80 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <LogoMark logo={logo} size={isCollapsed && !isMobile ? 44 : 48} />
        {!isCollapsed || isMobile ? (
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className="truncate text-[17px] font-semibold"
              style={{ color: COLORS.text, fontFamily: '"Cormorant Garamond", "Playfair Display", serif' }}
            >
              {appName}
            </span>
            <span
              className="text-[11px] font-semibold tracking-[0.2em]"
              style={{ color: COLORS.primary }}
            >
              {(appSuffix || '').toUpperCase()}
            </span>
          </span>
        ) : null}
      </div>

      {isMobile ? (
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={t('nav.closeMenu')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
          style={{ color: COLORS.text }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <X size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors duration-200 lg:flex ${
            isCollapsed ? 'absolute -right-3.5 top-4 bg-white' : 'bg-white'
          }`}
          style={{ borderColor: COLORS.border, color: COLORS.text }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      )}
    </div>
  );
});

// ==================================================
// MENU ITEM
// ==================================================
const MenuItem = memo(function MenuItem({ item, isCollapsed, activeItemId, onNavigate }) {
  const Icon = item.icon || LayoutDashboard;
  const isActive = item.id === activeItemId;
  const showBadge = hasMenuBadge(item.badge);

  const handleClick = useCallback(() => {
    onNavigate(item);
  }, [item, onNavigate]);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      title={isCollapsed ? item.title : undefined}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium outline-none transition-colors duration-200 ${
        isCollapsed ? 'justify-center' : ''
      }`}
      style={{
        height: 44,
        background: isActive
          ? `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.darkGold} 100%)`
          : 'transparent',
        color: isActive ? '#FFFFFF' : COLORS.text,
        boxShadow: isActive ? '0 6px 14px -4px rgba(191, 139, 60, 0.45)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = COLORS.hover;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon
        size={18}
        strokeWidth={1.8}
        className="shrink-0"
        style={{ color: isActive ? '#FFFFFF' : COLORS.textSecondary }}
      />

      {!isCollapsed ? (
        <>
          <span className="flex-1 truncate text-start">{item.title}</span>
          {showBadge ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : COLORS.badge,
                color: isActive ? '#FFFFFF' : '#FFFFFF',
              }}
            >
              {item.badge}
            </span>
          ) : (
            <ChevronRight
              size={14}
              className="shrink-0"
              style={{ color: isActive ? '#FFFFFF' : '#C9BEAE', opacity: isActive ? 0 : 1 }}
            />
          )}
        </>
      ) : showBadge ? (
        <span
          className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
          style={{ backgroundColor: COLORS.badge }}
        >
          {item.badge}
        </span>
      ) : null}
    </motion.button>
  );
});

// ==================================================
// FOOTER LINKS
// ==================================================
const FooterLink = memo(function FooterLink({ icon: Icon, label, onClick, isCollapsed, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors duration-200 ${
        isCollapsed ? 'justify-center' : ''
      }`}
      style={{ color: danger ? COLORS.danger : COLORS.textSecondary }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <Icon size={17} strokeWidth={1.8} />
      {!isCollapsed ? label : null}
    </button>
  );
});

// ==================================================
// BRAND CARD
// ==================================================
const BrandCard = memo(function BrandCard({ appName, appSuffix, version, isCollapsed }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${isCollapsed ? 'justify-center' : ''}`}
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.cream }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: '#F0DEC0' }}
      >
        <Cookie size={16} strokeWidth={1.8} style={{ color: COLORS.darkGold }} />
      </span>
      {!isCollapsed ? (
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold" style={{ color: COLORS.text }}>
            {appName} {appSuffix}
          </span>
          <span className="block text-[11px]" style={{ color: COLORS.textSecondary }}>
            v{version}
          </span>
        </span>
      ) : null}
      {!isCollapsed ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: COLORS.online }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
});

// ==================================================
// SIDEBAR - COMPOSANT PRINCIPAL
// ==================================================
const Sidebar = ({
  logo,
  appName,
  appSuffix,
  version = '1.0.0',
  currentUser = {
    firstName: 'John',
    lastName: 'Doe',
    role: ROLES.ADMIN,
    avatarUrl: '',
    isOnline: true,
  },
  permissions = [],
  menuItems = DEFAULT_MENU_CONFIG,
  activeItemId = 'dashboard',
  onNavigate = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onCloseMobile = () => {},
  onHelp = () => {},
  onDocumentation = () => {},
  onLogout = () => {},
  language = 'ar',
  className = '',
  unreadNotificationCount = 0,
}) => {
  const { t } = useTranslation();
  const isRTL = true;

  const translatedDashboard = useMemo(() => ({
    ...DASHBOARD_ITEM,
    title: getNavLabel(t, 'dashboard'),
  }), [t, language]);

  const translatedMenuItems = useMemo(() =>
    menuItems.map((item) => ({
      ...item,
      title: getNavLabel(t, item.id),
      badge: item.id === 'notifications'
        ? resolveNotificationsMenuBadge(unreadNotificationCount)
        : item.badge,
    })),
  [menuItems, t, language, unreadNotificationCount]);

  const handleNavigate = useCallback(
    (item) => {
      onNavigate(item);
      onCloseMobile();
    },
    [onNavigate, onCloseMobile],
  );

  const resolvedRoleKey = useMemo(
    () => resolveRoleKey(currentUser?.role),
    [currentUser?.role],
  );

  const visibleMenuItems = useMemo(
    () => translatedMenuItems.filter((item) => isItemVisible(item, currentUser?.role, permissions)),
    [translatedMenuItems, currentUser?.role, permissions],
  );

  const dashboardVisible = isItemVisible(DASHBOARD_ITEM, currentUser?.role, permissions);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const permissionList = resolvePermissionList(permissions);
    const visibleIds = visibleMenuItems.map((item) => item.id);
    const missingRequired = REQUIRED_ADMIN_MENU_IDS.filter((id) => !visibleIds.includes(id));

    console.group('[Sidebar] access debug');
    console.log('currentUser', currentUser);
    console.log('raw role prop', currentUser?.role);
    console.log('resolvedRoleKey', resolvedRoleKey);
    console.log('isAdminRole', isAdminRole(currentUser?.role));
    console.log('permissions count', permissionList.length);
    console.log('permissions sample', permissionList.slice(0, 8));
    console.log('menuItems total', menuItems.length);
    console.log('visible menu ids', visibleIds);
    console.log('required admin items missing', missingRequired);
    REQUIRED_ADMIN_MENU_IDS.forEach((id) => {
      const item = menuItems.find((entry) => entry.id === id);
      if (!item) {
        console.warn(`[Sidebar] menu config missing item: ${id}`);
        return;
      }
      console.log(
        `[Sidebar] ${id}`,
        visibleIds.includes(id) ? 'VISIBLE' : 'HIDDEN',
        { permission: item.permission, roles: item.roles },
      );
    });
    console.groupEnd();
  }, [currentUser, resolvedRoleKey, permissions, visibleMenuItems, menuItems]);

  const renderNav = (isMobile) => (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
      <div className="flex flex-col gap-1">
        {dashboardVisible ? (
          <MenuItem
            item={translatedDashboard}
            isCollapsed={isCollapsed && !isMobile}
            activeItemId={activeItemId}
            onNavigate={handleNavigate}
          />
        ) : null}
        {visibleMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed && !isMobile}
            activeItemId={activeItemId}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-3 flex flex-col gap-0.5 border-t pt-3" style={{ borderColor: COLORS.border }}>
        <FooterLink
          icon={LifeBuoy}
          label={t('nav.helpCenter')}
          onClick={onHelp}
          isCollapsed={isCollapsed && !isMobile}
        />
        <FooterLink
          icon={BookOpen}
          label={t('nav.documentation')}
          onClick={onDocumentation}
          isCollapsed={isCollapsed && !isMobile}
        />
        <FooterLink
          icon={LogOut}
          label={t('nav.logout')}
          onClick={onLogout}
          isCollapsed={isCollapsed && !isMobile}
          danger
        />
      </div>
    </nav>
  );

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
            onClick={onCloseMobile}
            className="fixed inset-0 z-layout-sidebar-backdrop bg-black/30 lg:hidden"
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`sticky top-0 z-layout-sidebar hidden h-screen shrink-0 flex-col bg-white shadow-none transition-[width] duration-300 ease-out lg:flex ${
          isRTL ? 'border-l' : 'border-r'
        } ${className}`}
        style={{
          width: isCollapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
          borderColor: COLORS.border,
        }}
      >
        <SidebarHeader
          logo={logo}
          appName={appName}
          appSuffix={appSuffix}
          isCollapsed={isCollapsed}
          isMobile={false}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
        />
        {renderNav(false)}
        <div className="shrink-0 px-3 pb-3">
          <BrandCard appName={appName} appSuffix={appSuffix} version={version} isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`fixed inset-y-0 z-layout-sidebar-drawer flex w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          isMobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
        style={{ borderColor: COLORS.border }}
      >
        <SidebarHeader
          logo={logo}
          appName={appName}
          appSuffix={appSuffix}
          isCollapsed={false}
          isMobile
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
        />
        {renderNav(true)}
        <div className="shrink-0 px-3 pb-3">
          <BrandCard appName={appName} appSuffix={appSuffix} version={version} isCollapsed={false} />
        </div>
      </aside>
    </>
  );
};

export default memo(Sidebar);