// src/components/layout/Header/Header.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Globe, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  Activity, 
  HelpCircle, 
  LogOut,
  X,
  Info
} from 'lucide-react';

// ============================================================================
// CONSTANTS & ANIMATION CONFIGURATIONS
// ============================================================================
const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' }
];

const THEMES = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'system', label: 'Système', icon: Monitor }
];

const dropdownVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    y: 8, 
    scale: 0.97,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
  }
};

// Custom Hook to manage click tracking outside drop container contexts
function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

// ============================================================================
// MAIN COMPONENT DEFINITION
// ============================================================================
const Header = React.memo(({
  // Structural Interface Bindings (Sidebar Management Controls)
  isCollapsed = false,
  onToggleSidebar = () => {},
  onMenuClick = null,
  isMobile = false,
  isTablet = false,

  // User Authenticated State Payload Injection
  user = {
    firstName: "Mohamed",
    lastName: "mosab",
    role: "Comptable",
    status: "Online",
    avatar: ""
  },

  // Telemetry, System Signals, and Notifications Feed
  unreadNotificationCount = 5,
  onNotificationClick = () => {},
  onAllNotificationsView = () => {},

  // Shared Core Operational Actions & Global Execution Interceptors
  onSearchSubmit = () => {},
  onLogoutClick = () => {},
  
  // Implicit Context Architecture Mappings
  themeContext,
  languageContext,
  authContext
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Localized Dropdown State Machines
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // References pointing to relative structural bounding boxes
  const langRef = useRef(null);
  const themeRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Explicit Context extraction with validation gates
  const currentTheme = themeContext?.theme || 'light';
  const setTheme = themeContext?.setTheme || (() => {});
  const currentLang = languageContext?.language || 'fr';
  const setLanguage = languageContext?.setLanguage || (() => {});

  // Close all open contextual menus safely
  const closeDropdowns = useCallback(() => setActiveDropdown(null), []);

  useClickOutside(langRef, () => activeDropdown === 'lang' && closeDropdowns());
  useClickOutside(themeRef, () => activeDropdown === 'theme' && closeDropdowns());
  useClickOutside(notifRef, () => activeDropdown === 'notifications' && closeDropdowns());
  useClickOutside(profileRef, () => activeDropdown === 'profile' && closeDropdowns());

  // Interactive Global Key-Binding Listeners Interface (Ctrl + K)
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setMobileSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Structural Search Submission Interface
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearchSubmit) onSearchSubmit(e.target.value);
  };

  // State Selector Toggling Wrapper
  const toggleDropdown = useCallback((type) => {
    setActiveDropdown(prev => prev === type ? null : type);
  }, []);

  // Compute operational initials
  const userInitials = useMemo(() => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'LU';
  }, [user]);

  // ⭐ HANDLER FOR MENU BUTTON CLICK
  const handleMenuClick = useCallback(() => {
    if (isMobile || isTablet) {
      if (onMenuClick) {
        onMenuClick();
      }
    } else {
      onToggleSidebar();
    }
  }, [isMobile, isTablet, onMenuClick, onToggleSidebar]);

  // ⭐ PROFILE ACTIONS
  const profileActions = [
    {
      label: "Mon profil",
      icon: User,
      action: () => { closeDropdowns(); navigate("/dashboard/profile"); },
    },
    {
      label: "Paramètres",
      icon: Settings,
      action: () => { closeDropdowns(); navigate("/dashboard/settings"); },
    },
    {
      label: "Journal d'activité",
      icon: Activity,
      action: () => { closeDropdowns(); navigate("/dashboard/activity-logs"); },
    },
    {
      label: "Centre d'aide",
      icon: HelpCircle,
      action: () => { closeDropdowns(); navigate("/dashboard/help"); },
    },
  ];

  return (
    <header className="w-full h-[76px] bg-white border-b border-[#ECE5DB] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* ==========================================
          LEFT SECTION: WINDOW & COMMAND INPUT
          ========================================== */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-xl">
        {/* Dynamic Window Mode Trigger Button */}
        <button
          onClick={handleMenuClick}
          className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 border border-transparent hover:border-[#ECE5DB]"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* Global Search Input (Desktop / Tablet) */}
        <div className={`hidden md:flex items-center w-full max-w-[440px] relative transition-all duration-200 border rounded-xl bg-[#F7F5F2] ${
          searchFocused ? 'border-[#B88A44] bg-white shadow-sm ring-4 ring-[#B88A44]/5' : 'border-[#ECE5DB] hover:border-[#D8B77A]'
        }`}>
          <div className="pl-3.5 pointer-events-none text-[#7A6855]">
            <Search className="w-[18px] h-[18px] stroke-[1.75]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher..."
            className="w-full h-11 bg-transparent border-none text-sm font-medium text-[#273338] placeholder-[#7A6855] pl-2.5 pr-16 focus:outline-none focus:ring-0"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none bg-white border border-[#ECE5DB] rounded-md px-1.5 py-0.5 shadow-2xs">
            <span className="text-[10px] font-bold text-[#7A6855] tracking-tight">Ctrl K</span>
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(prev => !prev)}
          className="md:hidden p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all"
          aria-label="Toggle Mobile Search"
        >
          <Search className="w-5 h-5 stroke-[1.75]" />
        </button>
      </div>

      {/* ==========================================
          RIGHT SECTION: TOOLS
          ========================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        
        {/* LANGUAGE SELECTOR */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => toggleDropdown('lang')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all relative focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30"
            aria-label="Change Language"
          >
            <Globe className="w-5 h-5 stroke-[1.75]" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'lang' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-44 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 origin-top-right"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      document.documentElement.dir = lang.dir;
                      closeDropdowns();
                    }}
                    className={`w-full text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-between ${
                      currentLang === lang.code ? 'bg-[#F7F5F2] text-[#B88A44] font-bold' : 'text-[#273338] hover:bg-[#F7F5F2]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#B88A44]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* THEME SELECTOR */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => toggleDropdown('theme')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30"
            aria-label="Switch Theme"
          >
            {currentTheme === 'light' ? <Sun className="w-5 h-5 stroke-[1.75]" /> : 
             currentTheme === 'dark' ? <Moon className="w-5 h-5 stroke-[1.75]" /> : 
             <Monitor className="w-5 h-5 stroke-[1.75]" />}
          </button>

          <AnimatePresence>
            {activeDropdown === 'theme' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-44 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 origin-top-right"
              >
                {THEMES.map((themeItem) => {
                  const IconComponent = themeItem.icon;
                  return (
                    <button
                      key={themeItem.id}
                      onClick={() => { setTheme(themeItem.id); closeDropdowns(); }}
                      className={`w-full text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                        currentTheme === themeItem.id ? 'bg-[#F7F5F2] text-[#B88A44] font-bold' : 'text-[#273338] hover:bg-[#F7F5F2]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[1.75]" />
                      <span>{themeItem.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => toggleDropdown('notifications')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all relative focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[1.75]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {activeDropdown === 'notifications' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-80 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1 z-50 origin-top-right overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#ECE5DB] flex justify-between items-center bg-[#F7F5F2]/50">
                  <span className="text-xs font-bold text-[#273338]">Notifications</span>
                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">
                    {unreadNotificationCount} Nouvelles
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-[#F7F5F2]">
                  {Array.from({ length: Math.min(unreadNotificationCount, 5) }).map((_, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onNotificationClick(idx)}
                      className="p-3.5 hover:bg-[#F7F5F2] cursor-pointer transition-colors flex items-start gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B88A44] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#273338] truncate">Notification {idx + 1}</p>
                        <p className="text-[11px] text-[#7A6855] truncate mt-0.5">Description de la notification</p>
                        <p className="text-[10px] text-[#7A6855]/70 mt-1 font-medium">Il y a {idx + 2} min</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => { 
                    onAllNotificationsView(); 
                    closeDropdowns(); 
                  }}
                  className="w-full text-center py-2.5 bg-[#F7F5F2] hover:bg-[#ECE5DB] text-[11px] font-bold text-[#B88A44] tracking-wide uppercase transition-colors"
                >
                  Voir toutes les notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-[#ECE5DB] mx-0.5 hidden sm:block" />

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => toggleDropdown('profile')}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-[#F7F5F2] transition-colors group text-left border border-transparent hover:border-[#ECE5DB] focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30"
            aria-label="Profile Menu"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D8B77A]/20 border border-[#ECE5DB] overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#7A6855] tracking-tight">{userInitials}</span>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#22C55E] rounded-full ring-2 ring-white" />
            </div>

            <div className="hidden lg:flex flex-col min-w-0 pr-1">
              <span className="text-xs font-bold text-[#273338] leading-tight truncate group-hover:text-[#B88A44] transition-colors">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[11px] font-medium text-[#7A6855] mt-0.5 leading-none truncate">
                {user.role}
              </span>
            </div>
            
            <ChevronDown className="w-4 h-4 text-[#7A6855] hidden lg:block group-hover:text-[#273338] transition-colors stroke-[1.5]" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'profile' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-64 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 origin-top-right"
              >
                {/* User Info Card */}
                <div className="px-3.5 py-3 border-b border-[#ECE5DB] bg-[#F7F5F2]/40 rounded-t-xl mb-1.5 lg:hidden">
                  <p className="text-xs font-bold text-[#273338]">{user.firstName} {user.lastName}</p>
                  <p className="text-[11px] text-[#7A6855] font-medium mt-0.5">{user.role}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] text-[#22C55E] font-bold uppercase tracking-wider">{user.status}</span>
                  </div>
                </div>

                {profileActions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left text-xs font-semibold text-[#273338] px-3.5 py-2.5 rounded-xl hover:bg-[#F7F5F2] transition-colors flex items-center gap-3 focus:outline-none"
                    >
                      <Icon className="w-4 h-4 text-[#7A6855] stroke-[1.75]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <div className="h-px bg-[#ECE5DB] my-1.5" />
                
                <button
                  onClick={() => { 
                    if (onLogoutClick) onLogoutClick(); 
                    closeDropdowns(); 
                  }}
                  className="w-full text-left text-xs font-bold text-[#EF4444] px-3.5 py-2.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3 focus:outline-none"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                  <span>Déconnexion</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ==========================================
          MOBILE SEARCH OVERLAY
          ========================================== */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-[76px] left-0 right-0 bg-white border-b border-[#ECE5DB] p-3 shadow-md z-30"
          >
            <div className="flex items-center w-full bg-[#F7F5F2] border border-[#ECE5DB] rounded-xl px-3 focus-within:border-[#B88A44] transition-all">
              <Search className="w-4 h-4 text-[#7A6855] mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Rechercher dans l'ERP..."
                className="w-full h-10 bg-transparent border-none text-xs font-semibold text-[#273338] placeholder-[#7A6855] focus:outline-none focus:ring-0"
                autoFocus
              />
              {searchValue && (
                <button 
                  onClick={() => setSearchValue("")} 
                  className="text-[10px] font-bold text-[#7A6855] hover:text-[#273338] bg-white border border-[#ECE5DB] rounded-md px-1.5 py-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
});

Header.displayName = 'Header';

export default Header;