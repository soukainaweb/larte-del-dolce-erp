// src/components/layout/Header/Header.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, arSA } from 'date-fns/locale';

const LANGUAGES = [
  { code: 'en', dir: 'ltr' },
  { code: 'fr', dir: 'ltr' },
  { code: 'ar', dir: 'rtl' },
];

const THEMES = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
];

const dateLocales = { en: enUS, fr, ar: arSA };

const dropdownVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
};

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

const Header = React.memo(({
  isCollapsed = false,
  onToggleSidebar = () => {},
  onMenuClick = null,
  isMobile = false,
  isTablet = false,
  user = {},
  notifications = [],
  unreadNotificationCount = 0,
  onNotificationClick = () => {},
  onAllNotificationsView = () => {},
  onSearchSubmit = () => {},
  onLogoutClick = () => {},
  theme = 'light',
  onThemeChange = () => {},
  language = 'fr',
  onLanguageChange = () => {},
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const langRef = useRef(null);
  const themeRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const closeDropdowns = useCallback(() => setActiveDropdown(null), []);

  useClickOutside(langRef, () => activeDropdown === 'lang' && closeDropdowns());
  useClickOutside(themeRef, () => activeDropdown === 'theme' && closeDropdowns());
  useClickOutside(notifRef, () => activeDropdown === 'notifications' && closeDropdowns());
  useClickOutside(profileRef, () => activeDropdown === 'profile' && closeDropdowns());

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

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
      setMobileSearchOpen(false);
    }
  };

  const toggleDropdown = useCallback((type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  }, []);

  const userInitials = useMemo(() => {
    const first = user?.firstName?.charAt(0) || user?.name?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'LU';
  }, [user]);

  const handleMenuClick = useCallback(() => {
    if (isMobile || isTablet) {
      if (onMenuClick) onMenuClick();
    } else {
      onToggleSidebar();
    }
  }, [isMobile, isTablet, onMenuClick, onToggleSidebar]);

  const profileActions = [
    {
      label: t('header.myProfile'),
      icon: User,
      action: () => { closeDropdowns(); navigate('/dashboard/profile'); },
    },
    {
      label: t('header.settings'),
      icon: Settings,
      action: () => { closeDropdowns(); navigate('/dashboard/settings'); },
    },
    {
      label: t('header.activityLog'),
      icon: Activity,
      action: () => { closeDropdowns(); navigate('/dashboard/activity-logs'); },
    },
    {
      label: t('header.helpCenter'),
      icon: HelpCircle,
      action: () => { closeDropdowns(); navigate('/dashboard/settings'); },
    },
  ];

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: dateLocales[language] || fr,
      });
    } catch {
      return '';
    }
  };

  return (
    <header className="w-full h-[76px] bg-white border-b border-[#ECE5DB] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-xl min-w-0">
        <button
          type="button"
          onClick={handleMenuClick}
          className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 border border-transparent hover:border-[#ECE5DB] flex-shrink-0"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5 stroke-[1.75]" />
        </button>

        <div className={`hidden md:flex items-center w-full max-w-[440px] relative transition-all duration-200 border rounded-xl bg-[#F7F5F2] ${
          searchFocused ? 'border-[#B88A44] bg-white shadow-sm ring-4 ring-[#B88A44]/5' : 'border-[#ECE5DB] hover:border-[#D8B77A]'
        }`}>
          <div className={`pointer-events-none text-[#7A6855] ${isRTL ? 'pr-3.5' : 'pl-3.5'}`}>
            <Search className="w-[18px] h-[18px] stroke-[1.75]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={t('common.search')}
            className="w-full h-11 bg-transparent border-none text-sm font-medium text-[#273338] placeholder-[#7A6855] px-2.5 focus:outline-none focus:ring-0"
          />
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none bg-white border border-[#ECE5DB] rounded-md px-1.5 py-0.5 shadow-2xs ${isRTL ? 'left-3' : 'right-3'}`}>
            <span className="text-[10px] font-bold text-[#7A6855] tracking-tight">{t('header.searchShortcut')}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
          className="md:hidden p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all flex-shrink-0"
          aria-label="Toggle Mobile Search"
        >
          <Search className="w-5 h-5 stroke-[1.75]" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => toggleDropdown('lang')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all"
            aria-label="Change Language"
          >
            <Globe className="w-5 h-5 stroke-[1.75]" />
          </button>
          <AnimatePresence>
            {activeDropdown === 'lang' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute mt-2 w-44 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 ${isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      closeDropdowns();
                    }}
                    className={`w-full text-start text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-between ${
                      language === lang.code ? 'bg-[#F7F5F2] text-[#B88A44] font-bold' : 'text-[#273338] hover:bg-[#F7F5F2]'
                    }`}
                  >
                    <span>{t(`header.languages.${lang.code}`)}</span>
                    {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#B88A44]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative hidden sm:block" ref={themeRef}>
          <button
            type="button"
            onClick={() => toggleDropdown('theme')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all"
            aria-label="Switch Theme"
          >
            {theme === 'light' ? <Sun className="w-5 h-5 stroke-[1.75]" /> :
              theme === 'dark' ? <Moon className="w-5 h-5 stroke-[1.75]" /> :
              <Monitor className="w-5 h-5 stroke-[1.75]" />}
          </button>
          <AnimatePresence>
            {activeDropdown === 'theme' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute mt-2 w-44 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 ${isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                {THEMES.map((themeItem) => {
                  const IconComponent = themeItem.icon;
                  return (
                    <button
                      key={themeItem.id}
                      type="button"
                      onClick={() => { onThemeChange(themeItem.id); closeDropdowns(); }}
                      className={`w-full text-start text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                        theme === themeItem.id ? 'bg-[#F7F5F2] text-[#B88A44] font-bold' : 'text-[#273338] hover:bg-[#F7F5F2]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[1.75]" />
                      <span>{t(`header.themes.${themeItem.id}`)}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => toggleDropdown('notifications')}
            className="p-2.5 rounded-xl text-[#273338] hover:bg-[#F7F5F2] border border-transparent hover:border-[#ECE5DB] transition-all relative"
            aria-label={t('header.notifications')}
          >
            <Bell className="w-5 h-5 stroke-[1.75]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 bg-[#EF4444] rounded-full ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {activeDropdown === 'notifications' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1 z-50 overflow-hidden ${isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                <div className="px-4 py-3 border-b border-[#ECE5DB] flex justify-between items-center bg-[#F7F5F2]/50">
                  <span className="text-xs font-bold text-[#273338]">{t('header.notifications')}</span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">
                      {t('header.newNotifications', { count: unreadNotificationCount })}
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#F7F5F2]">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-[#7A6855] text-center">{t('header.noNotifications')}</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => { onNotificationClick(notif); closeDropdowns(); }}
                        onKeyDown={(e) => e.key === 'Enter' && onNotificationClick(notif)}
                        className="p-3.5 hover:bg-[#F7F5F2] cursor-pointer transition-colors flex items-start gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B88A44] mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#273338] truncate">
                            {notif.title || notif.subject || notif.message}
                          </p>
                          <p className="text-[11px] text-[#7A6855] truncate mt-0.5">
                            {notif.description || notif.body || notif.message || ''}
                          </p>
                          <p className="text-[10px] text-[#7A6855]/70 mt-1 font-medium">
                            {formatNotifTime(notif.created_at || notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { onAllNotificationsView(); closeDropdowns(); }}
                  className="w-full text-center py-2.5 bg-[#F7F5F2] hover:bg-[#ECE5DB] text-[11px] font-bold text-[#B88A44] tracking-wide uppercase transition-colors"
                >
                  {t('header.viewAllNotifications')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-[#ECE5DB] mx-0.5 hidden sm:block" />

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => toggleDropdown('profile')}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-[#F7F5F2] transition-colors group text-start border border-transparent hover:border-[#ECE5DB] focus:outline-none"
            aria-label="Profile Menu"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D8B77A]/20 border border-[#ECE5DB] overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName || user.name || ''} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#7A6855] tracking-tight">{userInitials}</span>
              )}
              <span className="absolute bottom-0 end-0 w-2 h-2 bg-[#22C55E] rounded-full ring-2 ring-white" />
            </div>
            <div className="hidden lg:flex flex-col min-w-0 pe-1">
              <span className="text-xs font-bold text-[#273338] leading-tight truncate group-hover:text-[#B88A44] transition-colors">
                {user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
              </span>
              <span className="text-[11px] font-medium text-[#7A6855] mt-0.5 leading-none truncate">
                {user.role?.display_name || user.role?.name || user.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#7A6855] hidden lg:block group-hover:text-[#273338] transition-colors stroke-[1.5]" />
          </button>
          <AnimatePresence>
            {activeDropdown === 'profile' && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute mt-2 w-64 bg-white border border-[#ECE5DB] rounded-2xl shadow-xl p-1.5 z-50 ${isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                <div className="px-3.5 py-3 border-b border-[#ECE5DB] bg-[#F7F5F2]/40 rounded-t-xl mb-1.5 lg:hidden">
                  <p className="text-sm font-bold text-[#273338]">
                    {user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                  </p>
                  <p className="text-[11px] text-[#7A6855] font-medium mt-0.5">
                    {user.role?.display_name || user.role?.name || user.role}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] text-[#22C55E] font-bold uppercase tracking-wider">{user.status || t('common.online')}</span>
                  </div>
                </div>
                {profileActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="w-full text-start text-xs font-semibold text-[#273338] px-3.5 py-2.5 rounded-xl hover:bg-[#F7F5F2] transition-colors flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4 text-[#7A6855] stroke-[1.75]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div className="h-px bg-[#ECE5DB] my-1.5" />
                <button
                  type="button"
                  onClick={() => { onLogoutClick(); closeDropdowns(); }}
                  className="w-full text-start text-xs font-bold text-[#EF4444] px-3.5 py-2.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                  <span>{t('header.logout')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-[76px] inset-x-0 bg-white border-b border-[#ECE5DB] p-3 shadow-md z-30"
          >
            <div className="flex items-center w-full bg-[#F7F5F2] border border-[#ECE5DB] rounded-xl px-3 focus-within:border-[#B88A44] transition-all">
              <Search className="w-4 h-4 text-[#7A6855] flex-shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder={t('common.searchInErp')}
                className="w-full h-10 bg-transparent border-none text-xs font-semibold text-[#273338] placeholder-[#7A6855] focus:outline-none focus:ring-0 px-2"
                autoFocus
              />
              {searchValue && (
                <button type="button" onClick={() => setSearchValue('')} className="text-[#7A6855] hover:text-[#273338] p-1">
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
