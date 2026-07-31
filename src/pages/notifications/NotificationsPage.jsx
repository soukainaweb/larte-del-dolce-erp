// src/pages/Notifications/NotificationsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ==========================================
// IMPORTS LUCDIE REACT
// ==========================================
import {
  Bell,
  BellOff,
  BellRing,
  BellDot,
  BellElectric,
  BellPlus,
  BellMinus,
  Check,
  CheckCircle,
  CheckSquare,
  Square,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  Timer,
  AlarmClock,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  User,
  Users,
  UserPlus,
  UserX,
  UserCheck,
  UserMinus,
  UserCog,
  UserRound,
  Package,
  ShoppingBag,
  Truck,
  Factory,
  FileText,
  CreditCard,
  DollarSign,
  Settings,
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Home,
  Mail,
  Phone,
  MessageSquare,
  Circle,
  CircleCheck,
  CircleDot,
  CircleDashed,
  CircleSlash,
  CircleOff,
  CircleX,
  CircleAlert,
  CircleEllipsis,
  CircleMinus,
  CirclePlus,
  CirclePower,
  CircleUser,
  CircleDollarSign,
  CircleHelp,
  CirclePlay,
  CircleStop,
  CirclePause,
  CircleCheckBig,
  CircleGauge,
  Sparkles,
  Zap,
  Flame,
  Star,
  Award,
  Crown,
  Gem,
  Diamond,
  Heart,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Camera,
  Mic,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  Cloud,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  HeartPulse,
  Brain,
  Cpu,
  HardDrive,
  Network,
  Globe,
  MapPin,
  Compass,
  Navigation,
  Anchor,
  Ship,
  Plane,
  Car,
  Bus,
  Train,
  Bike,
  Layers,
  Tag,
  BellIcon
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import { 
  getNotificationRoute, 
  getModuleLabel, 
  getModuleIcon,
  hasDetailRoute 
} from '../../utils/notificationRoutes';
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllReadNotifications,
  getNotificationStatistics,
  exportNotifications,
  getNotificationModules,
  getNotificationPriorities,
  getUnreadCount
} from '../../services/notificationService';
import { safeArray, ensureArray, getApiErrorMessage } from '../../utils/apiHelpers';

// ==========================================
// CONSTANTES
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';

// ==========================================
// COMPOSANTS UI
// ==========================================

const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#F8F7F4] to-[#EDEAE4] rounded-lg ${className}`} />
);

const Toast = ({ message, type = 'success', onClose }) => {
  const typeConfig = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

// ==========================================
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, color, subtitle, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    gold: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      onClick={onClick}
      className="bg-white border border-[#ECE8E1] rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`p-2 md:p-2.5 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={16} className="md:w-5 md:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg md:text-2xl font-bold text-[#3D2F24]">{value}</p>
          <p className="text-[10px] md:text-xs text-[#6D6D6D] truncate">{title}</p>
          {subtitle && <p className="text-[8px] md:text-[10px] text-[#6D6D6D] mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// NOTIFICATION ITEM
// ==========================================
const NotificationItem = ({ 
  notification, 
  onView, 
  onToggleRead, 
  onDelete,
  isSelected,
  onSelect 
}) => {
  const { t, tc, actions } = usePageI18n('notifications');
  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-800 text-white border-red-900'
  };

  const priorityLabels = {
    low: t('orders.priority.low'),
    medium: t('orders.priority.medium'),
    high: t('orders.priority.high'),
    critical: t('notifications.kpi.critical')
  };

  const Icon = notification.icon;
  const moduleLabel = getModuleLabel(notification);
  const route = getNotificationRoute(notification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all ${
        !notification.isRead ? 'border-l-4 border-l-[#B8863B] bg-[#FDFBF7]' : 'border-[#ECE8E1]'
      } ${isSelected ? 'ring-2 ring-[#B8863B]' : ''}`}
    >
      <div className="flex items-start gap-2 md:gap-4">
        <button
          onClick={() => onSelect && onSelect(notification.id)}
          className="mt-1 flex-shrink-0 hidden sm:block"
        >
          {isSelected ? (
            <CheckSquare size={18} className="md:w-5 md:h-5 text-[#B8863B]" />
          ) : (
            <Square size={18} className="md:w-5 md:h-5 text-[#6D6D6D]" />
          )}
        </button>

        <div className="flex-shrink-0">
          <div className="p-1.5 md:p-2 rounded-xl" style={{ backgroundColor: notification.color + '20', color: notification.color }}>
            <Icon size={16} className="md:w-5 md:h-5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <p className="text-xs md:text-sm font-semibold text-[#3D2F24] truncate">{notification.title}</p>
                <span className={`text-[8px] md:text-[10px] font-semibold px-1.5 md:px-2 py-0.5 rounded-full border ${priorityColors[notification.priority] || priorityColors.low}`}>
                  {priorityLabels[notification.priority] || t('orders.priority.low')}
                </span>
                <span className="text-[8px] md:text-[10px] text-[#6D6D6D] bg-[#F8F7F4] px-1.5 md:px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {moduleLabel}
                </span>
                {!notification.isRead && (
                  <span className="text-[8px] md:text-[10px] font-semibold text-[#B8863B] bg-[#B8863B]/10 px-1.5 md:px-2 py-0.5 rounded-full">
                    Non lue
                  </span>
                )}
                {notification.entityId && (
                  <span className="text-[8px] md:text-[10px] text-[#6D6D6D] bg-[#F8F7F4] px-1.5 md:px-2 py-0.5 rounded-full">
                    #{notification.entityId}
                  </span>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-[#6D6D6D] mt-0.5 line-clamp-2">{notification.description}</p>
              <div className="flex items-center gap-2 md:gap-3 mt-1 text-[9px] md:text-xs text-[#6D6D6D] flex-wrap">
                <span className="flex items-center gap-0.5 md:gap-1">
                  <User size={10} className="md:w-3 md:h-3" />
                  <span className="truncate max-w-[60px] md:max-w-none">{notification.createdBy}</span>
                </span>
                <span className="flex items-center gap-0.5 md:gap-1">
                  <Calendar size={10} className="md:w-3 md:h-3" />
                  <span className="hidden sm:inline">{notification.createdAt}</span>
                  <span className="sm:hidden">{notification.createdAt?.split('/')[0]}/{notification.createdAt?.split('/')[1]}</span>
                </span>
                <span className="flex items-center gap-0.5 md:gap-1">
                  <Clock size={10} className="md:w-3 md:h-3" />
                  {notification.time}
                </span>
                {notification.client && (
                  <span className="flex items-center gap-0.5 md:gap-1 hidden lg:flex">
                    <Users size={10} className="md:w-3 md:h-3" />
                    <span className="truncate max-w-[60px]">{notification.client}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0 self-end md:self-start mt-1 md:mt-0">
              <button
                onClick={() => onView && onView(notification)}
                className="p-1 md:p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors group"
                title="Voir les détails"
              >
                <Eye size={14} className="md:w-4 md:h-4 text-[#6D6D6D] group-hover:text-[#B8863B] transition-colors" />
              </button>
              <button
                onClick={() => onToggleRead && onToggleRead(notification)}
                className="p-1 md:p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                title={notification.isRead ? 'Marquer comme non lue' : 'Marquer comme lue'}
              >
                {notification.isRead ? (
                  <BellOff size={14} className="md:w-4 md:h-4 text-[#6D6D6D]" />
                ) : (
                  <BellRing size={14} className="md:w-4 md:h-4 text-[#B8863B]" />
                )}
              </button>
              <button
                onClick={() => onDelete && onDelete(notification)}
                className="p-1 md:p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                title={actions.delete}
              >
                <Trash2 size={14} className="md:w-4 md:h-4 text-rose-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// NOTIFICATION DETAIL MODAL - AVEC NAVIGATION CORRIGÉE
// ==========================================
const NotificationDetailModal = ({ isOpen, onClose, notification, onMarkRead }) => {
  const { t, tc } = usePageI18n('notifications');
  const navigate = useNavigate();

  if (!isOpen || !notification) return null;

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-800 text-white'
  };

  const Icon = notification.icon;
  const route = getNotificationRoute(notification);
  const moduleLabel = getModuleLabel(notification);

  const handleNavigate = () => {
    onClose();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative p-4 md:p-6 bg-gradient-to-r from-[#B8863B]/10 to-[#B8863B]/5 border-b border-[#ECE8E1]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-[#B8863B]/10 rounded-xl">
                  <Icon size={20} className="md:w-6 md:h-6 text-[#B8863B]" />
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-bold text-[#3D2F24]">{t('notifications.modals.detailsTitle')}</h2>
                  <p className="text-xs md:text-sm text-[#6D6D6D]">{notification.title}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
              <X size={18} className="md:w-5 md:h-5 text-[#6D6D6D]" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
            <span className={`text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-full ${priorityColors[notification.priority] || priorityColors.low}`}>
              {notification.priorityLabel || t('orders.priority.low')}
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-[#6D6D6D] bg-[#F8F7F4] px-2 md:px-3 py-1 md:py-1.5 rounded-full">
              {moduleLabel}
            </span>
            {!notification.isRead && (
              <span className="text-[10px] md:text-xs font-semibold text-[#B8863B] bg-[#B8863B]/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                Non lue
              </span>
            )}
            {notification.entityId && (
              <span className="text-[10px] md:text-xs font-semibold text-[#6D6D6D] bg-[#F8F7F4] px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                #{notification.entityId}
              </span>
            )}
          </div>

          <div className="mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-semibold text-[#3D2F24] mb-1.5 md:mb-2">Description</h3>
            <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
              <p className="text-xs md:text-sm text-[#3D2F24]">{notification.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
              <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">Utilisateur</p>
              <p className="text-xs md:text-sm font-semibold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
                <User size={12} className="md:w-3.5 md:h-3.5 text-[#6D6D6D]" />
                {notification.createdBy}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
              <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">Module</p>
              <p className="text-xs md:text-sm font-semibold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
                <LayoutDashboard size={12} className="md:w-3.5 md:h-3.5 text-[#6D6D6D]" />
                {moduleLabel}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
              <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">{tc('date')}</p>
              <p className="text-xs md:text-sm font-semibold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
                <Calendar size={12} className="md:w-3.5 md:h-3.5 text-[#6D6D6D]" />
                {notification.createdAt}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
              <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">Heure</p>
              <p className="text-xs md:text-sm font-semibold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
                <Clock size={12} className="md:w-3.5 md:h-3.5 text-[#6D6D6D]" />
                {notification.time}
              </p>
            </div>
            {notification.entityId && (
              <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4 sm:col-span-2">
                <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">Référence</p>
                <p className="text-xs md:text-sm font-semibold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
                  <span className="text-[#B8863B]">#</span>
                  {notification.entityId}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={handleNavigate}
              className="w-full sm:flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 md:gap-2"
            >
              <Eye size={14} className="md:w-4 md:h-4" />
              Voir le détail
            </button>
            {!notification.isRead && (
              <button
                onClick={() => {
                  onMarkRead && onMarkRead(notification);
                }}
                className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 border border-[#ECE8E1] text-[#6D6D6D] rounded-xl hover:bg-[#F8F7F4] transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 md:gap-2"
              >
                <CheckCircle size={14} className="md:w-4 md:h-4" />
                Marquer comme lue
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 border border-[#ECE8E1] text-[#6D6D6D] rounded-xl hover:bg-[#F8F7F4] transition-colors text-xs md:text-sm font-medium"
            >
              {tc('close')}
            </button>
          </div>

          <div className="mt-3 md:mt-4 text-center">
            <p className="text-[9px] md:text-xs text-[#6D6D6D]">
              <span className="font-medium">Destination :</span> {route}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// FILTRES
// ==========================================
const NotificationFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  onReset, 
  onApply 
}) => {
  const { t, tc } = usePageI18n('notifications');
  const [localFilters, setLocalFilters] = useState(filters);

  const modules = [
    'Tous', 'Commandes', 'Clients', 'Produits', 'Production',
    'Livraisons', 'Factures', 'Paiements', 'Stock', 'Utilisateurs', 
    'Système', 'Analytics', 'Rapports', 'Catégories', 'Classifications'
  ];

  const priorities = [
    { id: 'all', label: 'Toutes' },
    { id: 'low', label: t('orders.priority.low') },
    { id: 'medium', label: t('orders.priority.medium') },
    { id: 'high', label: t('orders.priority.high') },
    { id: 'critical', label: t('notifications.kpi.critical') }
  ];

  const statuses = [
    { id: 'all', label: 'Tous' },
    { id: 'read', label: 'Lues' },
    { id: 'unread', label: 'Non lues' }
  ];

  const periods = [
    { id: 'today', label: tc('today') },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'year', label: 'Cette année' }
  ];

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters = {
      period: 'all',
      module: 'Tous',
      priority: 'all',
      status: 'all',
      search: ''
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onReset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white border border-[#ECE8E1] rounded-xl p-3 md:p-6 shadow-lg mb-4 md:mb-6"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-bold text-[#3D2F24] flex items-center gap-1.5 md:gap-2">
              <Filter size={16} className="md:w-[18px] md:h-[18px] text-[#B8863B]" />
              Filtres
            </h3>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleReset}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-[#6D6D6D] hover:text-[#3D2F24] transition-colors border border-[#ECE8E1] rounded-lg"
              >
                {tc('resetFilters')}
              </button>
              <button
                onClick={handleApply}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors"
              >
                Appliquer
              </button>
              <button
                onClick={onClose}
                className="p-1 md:p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              >
                <X size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
            <div>
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">Période</label>
              <select
                value={localFilters.period || 'all'}
                onChange={(e) => handleChange('period', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">Module</label>
              <select
                value={localFilters.module || 'Tous'}
                onChange={(e) => handleChange('module', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white"
              >
                {modules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">{tc('priority')}</label>
              <select
                value={localFilters.priority || 'all'}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white"
              >
                {priorities.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">{tc('status')}</label>
              <select
                value={localFilters.status || 'all'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white"
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// PAGE PRINCIPALE - NOTIFICATIONS
// ==========================================
const NotificationsPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('notifications');
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    period: 'all',
    module: 'Tous',
    priority: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [isExporting, setIsExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Load notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: pageSize,
        search: searchTerm || undefined,
        module: filters.module !== 'Tous' ? filters.module : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        period: filters.period !== 'all' ? filters.period : undefined,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      const response = await getNotifications(params);
      const res = response?.data;
      const list = safeArray(res);
      setNotifications(list);
      setTotalCount(res?.meta?.total ?? list.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast(getApiErrorMessage(error, t('errors.loadFailed')), 'error');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, pageSize, searchTerm, filters]);

  // Fetch statistics
  const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0, today: 0 });

  const fetchStatistics = async () => {
    try {
      const response = await getNotificationStatistics({
        period: filters.period !== 'all' ? filters.period : undefined
      });
      const data = response.data.data || {};
      setStats({
        total: data.total || 0,
        unread: data.unread || 0,
        critical: data.critical || 0,
        today: data.today || 0
      });
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [filters.period]);

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Titre', accessor: 'title', width: 25 },
    { label: 'Description', accessor: 'description', width: 30 },
    { label: 'Module', accessor: 'module', width: 15 },
    { label: 'Priorité', accessor: 'priority', width: 10 },
    { label: 'Créé par', accessor: 'createdBy', width: 15 },
    { label: 'Date', accessor: 'createdAt', width: 12 },
    { label: 'Heure', accessor: 'time', width: 10 },
    { label: 'Statut', accessor: 'status', width: 10 }
  ];

  const rowFormatter = (item) => ({
    title: item.title,
    description: item.description,
    module: item.module,
    priority: item.priority === 'critical' ? t('notifications.kpi.critical') :
             item.priority === 'high' ? t('orders.priority.high') :
             item.priority === 'medium' ? t('orders.priority.medium') : t('orders.priority.low'),
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    time: item.time,
    status: item.isRead ? 'Lue' : 'Non lue'
  });

  const summary = [
    { label: 'Total notifications', value: stats.total },
    { label: 'Non lues', value: stats.unread },
    { label: 'Critiques', value: stats.critical },
    { label: tc('today'), value: stats.today }
  ];

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    showToast(tc('exportSuccess', { type: 'PDF', count: 0 }), 'success');
  };

  const handleExportError = () => {
    showToast('Erreur lors de l\'export', 'error');
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  const handleToggleRead = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, isRead: !n.isRead }
            : n
        )
      );
      await fetchStatistics();
      showToast(
        notification.isRead 
          ? '📬 Notification marquée comme non lue'
          : '✅ Notification marquée comme lue',
        'success'
      );
    } catch (error) {
      console.error('Error toggling read status:', error);
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  const handleDelete = async (notification) => {
    if (window.confirm(t('notifications.modals.deleteConfirm', { title: notification.title }))) {
      try {
        await deleteNotification(notification.id);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setSelectedIds(prev => prev.filter(id => id !== notification.id));
        await fetchStatistics();
        showToast('🗑️ Notification supprimée avec succès', 'success');
      } catch (error) {
        console.error('Error deleting notification:', error);
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      await fetchStatistics();
      showToast('✅ Toutes les notifications ont été marquées comme lues', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Erreur lors du marquage', 'error');
    }
  };

  const handleDeleteRead = async () => {
    if (window.confirm(t('notifications.modals.deleteReadConfirm'))) {
      try {
        await deleteAllReadNotifications();
        setNotifications(prev => prev.filter(n => !n.isRead));
        await fetchStatistics();
        showToast('🗑️ Notifications lues supprimées avec succès', 'success');
      } catch (error) {
        console.error('Error deleting read notifications:', error);
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(t('notifications.modals.deleteSelectedConfirm', { count: selectedIds.length }))) {
      try {
        await deleteMultipleNotifications({ ids: selectedIds });
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        setSelectedIds([]);
        await fetchStatistics();
        showToast(`🗑️ ${selectedIds.length} notification(s) supprimée(s) avec succès`, 'success');
      } catch (error) {
        console.error('Error deleting selected notifications:', error);
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = ensureArray(notifications).map(n => n.id);
    if (selectedIds.length === currentIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIds);
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, isRead: true }
            : n
        )
      );
      fetchStatistics();
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, isRead: true }
            : n
        )
      );
      await fetchStatistics();
      showToast('✅ Notification marquée comme lue', 'success');
    } catch (error) {
      console.error('Error marking as read:', error);
      showToast('Erreur lors du marquage', 'error');
    }
  };

  const handleRefresh = async () => {
    await fetchNotifications();
    await fetchStatistics();
    showToast('🔄 Notifications actualisées avec succès', 'success');
  };

  const handleResetFilters = async () => {
    setSearchTerm('');
    setFilters({
      period: 'all',
      module: 'Tous',
      priority: 'all',
      status: 'all'
    });
    setCurrentPage(1);
    await fetchNotifications();
    await fetchStatistics();
    showToast('🔄 Filtres réinitialisés avec succès', 'success');
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading && notifications.length === 0) {
    return (
      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        <div className="space-y-4 md:space-y-6">
          <SkeletonLoader className="h-10 md:h-12 w-32 md:w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonLoader key={idx} className="h-20 md:h-24 w-full" />
            ))}
          </div>
          <div className="space-y-2 md:space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonLoader key={idx} className="h-24 md:h-28 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isOpen && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onMarkRead={handleMarkAsRead}
      />

      {/* ===== HEADER ===== */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#6D6D6D] mb-0.5 md:mb-1">
              <Home size={12} className="md:w-3.5 md:h-3.5 text-[#B8863B]" />
              <span className="text-[#B8863B]">/</span>
              <span>Notifications</span>
            </nav>
            <div className="flex items-center gap-2 md:gap-3">
              <h1 className="text-lg md:text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
                {title}
              </h1>
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-[9px] md:text-xs bg-[#B8863B]/10 text-[#B8863B] px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium">
                  {stats.total} total
                </span>
                {stats.unread > 0 && (
                  <span className="text-[9px] md:text-xs bg-red-500 text-white px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium animate-pulse">
                    {stats.unread} non lues
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {/* Export Buttons */}
            <ExportButtons
              data={notifications}
              columns={columns}
              title="{t('notifications.export.title')}"
              subtitle={`${notifications.length} notifications`}
              filename={`notifications_${new Date().toISOString().split('T')[0]}`}
              summary={summary}
              rowFormatter={rowFormatter}
              userName={user?.firstName}
              onSuccess={handleExportSuccess}
              onError={handleExportError}
            />

            <div className="relative flex-1 md:flex-none min-w-[120px] md:min-w-[200px]">
              <Search size={14} className="md:w-4 md:h-4 absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 md:pl-9 pr-2 md:pr-3 py-1.5 md:py-2 text-xs md:text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={12} className="md:w-3.5 md:h-3.5 text-[#6D6D6D] hover:text-[#3D2F24]" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5 md:gap-1">
              <button
                onClick={handleRefresh}
                className="p-1.5 md:p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                title={actions.refresh}
              >
                <RefreshCw size={15} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              </button>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${isFilterOpen ? 'bg-[#B8863B]/10 text-[#B8863B]' : 'hover:bg-[#F8F7F4] text-[#6D6D6D]'}`}
                title="Filtres"
              >
                <Filter size={15} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="p-1.5 md:p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors hidden sm:block"
                title="Tout marquer comme lu"
              >
                <Check size={15} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              </button>
              <button
                onClick={handleDeleteRead}
                className="p-1.5 md:p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors hidden lg:block"
                title={t('notifications.actions.deleteRead')}
              >
                <Trash2 size={15} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        <KPICard
          icon={Bell}
          title="Total"
          value={stats.total}
          color="blue"
          subtitle="Toutes"
        />
        <KPICard
          icon={BellRing}
          title="Non lues"
          value={stats.unread}
          color="amber"
          subtitle="À lire"
        />
        <KPICard
          icon={AlertCircle}
          title="Critiques"
          value={stats.critical}
          color="red"
          subtitle="Urgentes"
        />
        <KPICard
          icon={Bell}
          title={tc('today')}
          value={stats.today}
          color="green"
          subtitle={t('notifications.kpi.new')}
        />
      </div>

      {/* ===== FILTRES ===== */}
      <NotificationFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onApply={() => setIsFilterOpen(false)}
      />

      {/* ===== LISTE DES NOTIFICATIONS ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden">
        <div className="p-2 md:p-4 border-b border-[#ECE8E1] flex items-center justify-between bg-[#F8F7F4]">
          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={handleSelectAll}
              className="p-0.5 md:p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              {selectedIds.length === notifications.length && notifications.length > 0 ? (
                <CheckSquare size={14} className="md:w-[18px] md:h-[18px] text-[#B8863B]" />
              ) : (
                <Square size={14} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              )}
            </button>
            <span className="text-[10px] md:text-xs text-[#6D6D6D]">
              {totalCount} notif(s)
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-[10px] md:text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                {t('notifications.actions.deleteSelected', { count: selectedIds.length })}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs text-[#6D6D6D]">
            <span className="hidden sm:inline">Affichage de </span>
            <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)}</span>
            <span className="hidden sm:inline">sur {totalCount}</span>
          </div>
        </div>

        <div className="divide-y divide-[#ECE8E1]">
          {notifications.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <BellOff size={36} className="md:w-12 md:h-12 text-[#D1CBC0] mx-auto mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-bold text-[#3D2F24]">{t('notifications.noNotifications')}</h3>
              <p className="text-xs md:text-sm text-[#6D6D6D]">
                {searchTerm || filters.module !== 'Tous' || filters.priority !== 'all' 
                  ? t('notifications.emptyFiltered')
                  : t('notifications.allRead')}
              </p>
            </div>
          ) : (
            ensureArray(notifications).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onView={handleViewDetails}
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
                isSelected={selectedIds.includes(notification.id)}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-2 md:p-4 border-t border-[#ECE8E1] flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 md:p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
            </button>
            <div className="flex items-center gap-0.5 md:gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
              {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => {
                const page = idx + 1;
                const isActive = currentPage === page;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-lg text-[10px] md:text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#B8863B] text-white'
                        : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 10 && (
                <>
                  <span className="text-[9px] md:text-xs text-[#6D6D6D]">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-lg text-[10px] md:text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 md:p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;