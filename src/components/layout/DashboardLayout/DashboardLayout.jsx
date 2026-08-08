// src/components/layout/DashboardLayout/DashboardLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { getNotifications, getUnreadCount, markNotificationAsRead } from '../../../services/notificationService';
import { findSearchRoute, getActiveMenuId } from '../../../utils/searchRoutes';
import { getNotificationRoute } from '../../../utils/notificationRoutes';
import { getRoleDisplayName } from '../../../utils/roleMapping';
import { resolveRoleKey, resolvePermissionList } from '../../../utils/permissions';

import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, user, logout, roleKey, permissions } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.MOBILE);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= BREAKPOINTS.MOBILE &&
    window.innerWidth < BREAKPOINTS.TABLET
  );
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications({ per_page: 5, status: 'unread' }),
        getUnreadCount(),
      ]);
      const list = listRes.data?.data?.data || listRes.data?.data || listRes.data || [];
      setNotifications(Array.isArray(list) ? list : []);
      const count = countRes.data?.data?.count ?? countRes.data?.count ?? countRes.data?.data ?? 0;
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const mobile = width < BREAKPOINTS.MOBILE;
    const tablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;

    setIsMobile(mobile);
    setIsTablet(tablet);

    if (!mobile && isMobileOpen) {
      setIsMobileOpen(false);
    }

    if (tablet && !isCollapsed) {
      setIsCollapsed(true);
    }

    if (!mobile && !tablet && isCollapsed && width >= BREAKPOINTS.TABLET) {
      setIsCollapsed(false);
    }
  }, [isMobileOpen, isCollapsed]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleNavigate = useCallback((item) => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
    if (item?.route) {
      navigate(item.route);
    }
  }, [isMobile, navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleNotificationClick = useCallback(async (notification) => {
    try {
      if (notification?.id && !notification.read_at && !notification.is_read) {
        await markNotificationAsRead(notification.id);
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      const route = getNotificationRoute(notification);
      navigate(route);
      fetchNotifications();
    } catch {
      navigate('/dashboard/notifications');
    }
  }, [navigate, fetchNotifications]);

  const handleAllNotificationsView = useCallback(() => {
    navigate('/dashboard/notifications');
  }, [navigate]);

  const handleSearchSubmit = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    const match = findSearchRoute(searchTerm);
    if (match) {
      navigate(match.route);
    } else {
      showToast(t('search.noResults', { term: searchTerm }), 'info');
    }
  }, [navigate, showToast, t]);

  const handleHelp = useCallback(() => {
    navigate('/dashboard/settings');
  }, [navigate]);

  const handleDocumentation = useCallback(() => {
    navigate('/dashboard/settings');
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#B88A44]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#B88A44]">L</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="mt-4 text-sm text-[#7A6855]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activeItemId = getActiveMenuId(location.pathname);
  const sidebarRole = resolveRoleKey(user?.role) || roleKey || user?.role;

  useEffect(() => {
    if (!import.meta.env.DEV || !user) return;
    console.group('[DashboardLayout] auth debug');
    console.log('user', user);
    console.log('roleKey (AuthContext)', roleKey);
    console.log('sidebarRole (resolved)', sidebarRole);
    console.log('permissions', resolvePermissionList(permissions));
    console.log('permissions count', resolvePermissionList(permissions).length);
    console.groupEnd();
  }, [user, roleKey, sidebarRole, permissions]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex" dir="rtl">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
        currentUser={{
          ...user,
          role: sidebarRole,
        }}
        permissions={permissions}
        onNavigate={handleNavigate}
        activeItemId={activeItemId}
        onLogout={handleLogout}
        onHelp={handleHelp}
        onDocumentation={handleDocumentation}
        language="ar"
        appName={t('common.appName')}
        appSuffix={t('common.erp')}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0 relative">
        <div className="relative z-[60] flex-shrink-0 overflow-visible">
          <Header
          onMenuClick={toggleSidebar}
          onToggleSidebar={handleToggleCollapse}
          isMobile={isMobile}
          isTablet={isTablet}
          isCollapsed={isCollapsed}
          user={{
            ...user,
            role: user?.role ? { ...user.role, display_name: getRoleDisplayName(user.role) } : user?.role,
          }}
          permissions={permissions}
          notifications={notifications}
          unreadNotificationCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onAllNotificationsView={handleAllNotificationsView}
          onSearchSubmit={handleSearchSubmit}
          onLogoutClick={handleLogout}
        />
        </div>

        <Breadcrumb />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-[#ECE7DF] px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm text-[#7A6855] text-center md:text-start">
              {t('common.copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#7A6855]">
              <span>{t('common.version')} 1.0.0</span>
              <span className="w-px h-4 bg-[#ECE7DF]" />
              <span>{t('common.online')}</span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
