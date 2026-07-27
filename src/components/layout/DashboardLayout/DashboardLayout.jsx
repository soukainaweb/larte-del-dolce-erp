// src/components/layout/DashboardLayout/DashboardLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// Import des composants
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

// =============================================
// BREAKPOINTS
// =============================================

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

// =============================================
// MAIN COMPONENT
// =============================================

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =============================================
  // STATE
  // =============================================

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.MOBILE);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= BREAKPOINTS.MOBILE && 
    window.innerWidth < BREAKPOINTS.TABLET
  );

  // =============================================
  // HANDLERS
  // =============================================

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const mobile = width < BREAKPOINTS.MOBILE;
    const tablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;

    setIsMobile(mobile);
    setIsTablet(tablet);

    // Fermer le sidebar mobile si on passe en desktop
    if (!mobile && isMobileOpen) {
      setIsMobileOpen(false);
    }

    // Sur tablette, réduire automatiquement
    if (tablet && !isCollapsed) {
      setIsCollapsed(true);
    }

    // Sur desktop, agrandir si réduit
    if (!mobile && !tablet && isCollapsed && window.innerWidth >= BREAKPOINTS.TABLET) {
      setIsCollapsed(false);
    }
  }, [isMobileOpen, isCollapsed]);

  // Toggle sidebar (mobile: drawer, desktop: collapse)
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  }, [isMobile]);

  // Fermer le sidebar mobile
  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Toggle collapse desktop
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Navigation handler - Sidebar onClick
  const handleNavigate = useCallback((item) => {
    // Fermer le sidebar mobile avant navigation
    if (isMobile) {
      setIsMobileOpen(false);
    }
    
    // Naviguer vers la route de l'item
    if (item?.route) {
      navigate(item.route);
    }
  }, [isMobile, navigate]);

  // =============================================
  // HEADER HANDLERS
  // =============================================

  // Gestion de la déconnexion
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Gestion des notifications
  const handleNotificationClick = useCallback((notificationId) => {
    // Rediriger vers la page des notifications avec l'ID
    navigate('/dashboard/notifications');
  }, [navigate]);

  const handleAllNotificationsView = useCallback(() => {
    navigate('/dashboard/notifications');
  }, [navigate]);

  // Gestion de la recherche
  const handleSearchSubmit = useCallback((searchTerm) => {
    if (searchTerm && searchTerm.trim().length > 0) {
      // Rediriger vers la page de recherche ou filtrer
      console.log('Recherche:', searchTerm);
    }
  }, []);

  // =============================================
  // EFFECTS
  // =============================================

  // Gestion du resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Gestion du scroll body quand mobile sidebar est ouvert
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

  // Fermer avec la touche ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  // ⭐ CORRECTION: Fermer le sidebar mobile lors d'un changement de route
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  // =============================================
  // LOADING STATE
  // =============================================

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
          <p className="mt-4 text-sm text-[#7A6855]">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  // =============================================
  // AUTHENTICATION CHECK
  // =============================================

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
        currentUser={{
        ...user,
        role: user?.role?.name
        }}
        onNavigate={handleNavigate}
        activeItemId={location.pathname.split('/').filter(Boolean).pop() || 'dashboard'}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
          isCollapsed={isCollapsed}
          user={user}
          unreadNotificationCount={5}
          onNotificationClick={handleNotificationClick}
          onAllNotificationsView={handleAllNotificationsView}
          onSearchSubmit={handleSearchSubmit}
          onLogoutClick={handleLogout}
        />

        {/* Outlet - Contenu des pages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#ECE7DF] px-6 py-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm text-[#7A6855]">
              © 2026 L'arte ERP - Tous droits réservés
            </p>
            <div className="flex items-center gap-4 text-xs text-[#7A6855]">
              <span>Version 1.0.0</span>
              <span className="w-px h-4 bg-[#ECE7DF]" />
              <span>En ligne</span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;