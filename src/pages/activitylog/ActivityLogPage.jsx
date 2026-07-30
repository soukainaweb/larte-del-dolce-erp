// src/pages/activitylog/ActivityLogPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  X,
  Info,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Building,
  Briefcase,
  Shield,
  Lock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Upload,
  FileText,
  File,
  Folder,
  FolderOpen,
  FolderTree,
  Home,
  LayoutDashboard,
  ClipboardList,
  Package,
  Truck,
  Factory,
  FileText as FileTextIcon,
  CreditCard,
  DollarSign,
  BarChart3,
  PieChart,
  Settings,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  LogOut,
  Smartphone,
  Monitor,
  Server,
  Wifi,
  Globe as GlobeIcon,
  Languages,
  Sun,
  Moon,
  Laptop,
  Activity,
  Bell,
  BellOff,
  BellRing,
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  ShieldCheck as ShieldCheckIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Crown,
  Gem,
  Diamond,
  Sparkles,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Music,
  Radio,
  Tv,
  Tablet,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Server as ServerIcon,
  Database,
  Cloud,
  Wifi as WifiIcon,
  Bluetooth,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Camera,
  Image,
  FileImage,
  FileText as FileTextIcon2,
  File as FileIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderTree as FolderTreeIcon,
  Home as HomeIcon,
  LayoutDashboard as LayoutDashboardIcon,
  ClipboardList as ClipboardListIcon,
  Package as PackageIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  Factory as FactoryIcon,
  FileText as FileTextIcon3,
  CreditCard as CreditCardIcon,
  DollarSign as DollarSignIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  HelpCircle as HelpCircleIcon,
  BookOpen as BookOpenIcon,
  LifeBuoy as LifeBuoyIcon,
  LogOut as LogOutIcon,
  Check,
  Square,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  XCircle,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ExportButtons from '../../components/ExportButtons';
import {
  getActivityLogs,
  getActivityLogStatistics,
  getActivityChartData,
  getRecentLogins,
  getCriticalActivities,
  getRecentActivities,
  getActivityUsers,
  getActivityModules,
  getActivityActions,
  getActivityLevels,
  exportActivityLogs
} from '../../services/activityLogService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR';

// ==========================================
// COMPOSANTS UI
// ==========================================

// Toast Notification
const Toast = ({ message, type = 'success', onClose }) => {
  const typeConfig = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const icons = {
    success: <CheckCircleIcon size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangleIcon size={18} />,
    info: <InfoIcon size={18} />
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
      className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Skeleton Loading
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#F8F7F4] to-[#EDEAE4] rounded-lg ${className}`} />
);

// KPICard
const KPICard = ({ icon: Icon, title, value, color, subtitle, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    gold: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      onClick={onClick}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#3D2F24]">{value}</p>
          <p className="text-xs text-[#6D6D6D]">{title}</p>
          {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// ViewActivityModal
const ViewActivityModal = ({ isOpen, onClose, activity }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('activityLog');
  if (!isOpen || !activity) return null;

  const levelColors = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-rose-50 text-rose-700',
    critical: 'bg-red-800 text-white'
  };

  const levelLabels = {
    info: 'Information',
    success: 'Succès',
    warning: 'Avertissement',
    error: 'Erreur',
    critical: t('notifications.kpi.critical')
  };

  const showToast = (message, type = 'success') => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('activityLog');
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Détails de l'activité
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#ECE8E1]">
            <div className="w-12 h-12 rounded-full bg-[#B8863B]/20 flex items-center justify-center">
              {activity.user?.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={24} className="text-[#B8863B]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3D2F24]">{activity.user?.name || t('activityLog.unknownUser')}</p>
              <p className="text-xs text-[#6D6D6D]">{activity.user?.email || '—'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelColors[activity.level] || levelColors.info}`}>
                  {levelLabels[activity.level] || activity.level}
                </span>
                <span className="text-[10px] text-[#6D6D6D]">{activity.module}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">ID Activité</p>
              <p className="text-sm font-medium text-[#3D2F24]">#{activity.id}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Action</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.action}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">{tc('date')}</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.date}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Heure</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.time}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Adresse IP</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.ip || '—'}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Navigateur</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.browser || '—'}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Appareil</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.device || '—'}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">{tc('status')}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activity.status === 'Succès' ? 'bg-emerald-50 text-emerald-700' : 
                activity.status === 'Echec' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
              }`}>
                {activity.status || '—'}
              </span>
            </div>
          </div>

          {activity.description && (
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-[#3D2F24]">{activity.description}</p>
            </div>
          )}

          {activity.old_value && activity.new_value && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <p className="text-[10px] text-rose-600 uppercase tracking-wide">Ancienne valeur</p>
                <p className="text-sm font-medium text-rose-700">{activity.old_value}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Nouvelle valeur</p>
                <p className="text-sm font-medium text-emerald-700">{activity.new_value}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  showToast('✅ Activité exportée en PDF', 'success');
                }, 300);
              }}
              className="flex-1 min-w-[120px] py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Exporter PDF
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 min-w-[120px] py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Imprimer
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
                showToast('📋 Informations copiées', 'success');
              }}
              className="flex-1 min-w-[120px] py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copier
            </button>
            <button
              onClick={onClose}
              className="flex-1 min-w-[120px] py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================
const ActivityLogPage = () => {
  const { user: currentUser } = useAuth();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('activityLog');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [totalCount, setTotalCount] = useState(0);

  // Filter options
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [uniqueModules, setUniqueModules] = useState([]);
  const [uniqueActions, setUniqueActions] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    today: 0,
    users: 0,
    critical: 0,
    success: 0,
    duration: '2h 35m',
    security: '100%'
  });

  // Chart data
  const [activitiesByDay, setActivitiesByDay] = useState([]);
  const [activitiesByType, setActivitiesByType] = useState([]);
  const [activitiesByUser, setActivitiesByUser] = useState([]);
  const [activitiesByModule, setActivitiesByModule] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [criticalActivities, setCriticalActivities] = useState([]);
  const [timelineActivities, setTimelineActivities] = useState([]);

  // Toast
  const showToast = (message, type = 'success') => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('activityLog');
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('activityLog');
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Écouter les événements de toast personnalisés
  useEffect(() => {
    const handler = (e) => {
      showToast(e.detail.message, e.detail.type);
    };
    window.addEventListener('showToast', handler);
    return () => window.removeEventListener('showToast', handler);
  }, []);

  // ==========================================
  // CHARGEMENT DES DONNÉES
  // ==========================================

  // Charger les activités
  const fetchActivityLogs = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        date_filter: dateFilter !== 'all' ? dateFilter : undefined,
        user: userFilter !== 'all' ? userFilter : undefined,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      const response = await getActivityLogs(params);
      const data = response.data.data || [];
      setActivities(data);
      setTotalCount(response.data.meta?.total || data.length);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      showToast(t('activityLog.errors.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, itemsPerPage, searchTerm, dateFilter, userFilter, moduleFilter, actionFilter, levelFilter]);

  // Charger les statistiques
  const fetchStatistics = async () => {
    try {
      const params = {
        date_filter: dateFilter !== 'all' ? dateFilter : undefined,
        user: userFilter !== 'all' ? userFilter : undefined,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined
      };
      const response = await getActivityLogStatistics(params);
      const data = response.data.data || {};
      setStats({
        today: data.today || 0,
        users: data.active_users || 0,
        critical: data.critical || 0,
        success: data.success || 0,
        duration: data.avg_duration || '2h 35m',
        security: data.security || '100%'
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateFilter, userFilter, moduleFilter, levelFilter]);

  // Charger les options de filtre
  const fetchFilterOptions = async () => {
    try {
      const [usersRes, modulesRes, actionsRes, levelsRes] = await Promise.all([
        getActivityUsers(),
        getActivityModules(),
        getActivityActions(),
        getActivityLevels()
      ]);
      setUniqueUsers(usersRes.data.data || []);
      setUniqueModules(modulesRes.data.data || []);
      setUniqueActions(actionsRes.data.data || []);
      setUniqueLevels(levelsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Charger les données des graphiques
  const fetchChartData = async () => {
    try {
      const params = {
        date_filter: dateFilter !== 'all' ? dateFilter : undefined,
        limit: 30
      };
      
      const [dailyRes, typeRes, userRes, moduleRes] = await Promise.all([
        getActivityChartData({ ...params, type: 'daily' }),
        getActivityChartData({ ...params, type: 'by_action' }),
        getActivityChartData({ ...params, type: 'by_user', limit: 10 }),
        getActivityChartData({ ...params, type: 'by_module', limit: 10 })
      ]);

      setActivitiesByDay(dailyRes.data.data || []);
      setActivitiesByType(typeRes.data.data || []);
      setActivitiesByUser(userRes.data.data || []);
      setActivitiesByModule(moduleRes.data.data || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [dateFilter]);

  // Charger les dernières connexions
  const fetchRecentLogins = async () => {
    try {
      const response = await getRecentLogins({ limit: 5 });
      setRecentLogins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recent logins:', error);
    }
  };

  useEffect(() => {
    fetchRecentLogins();
  }, []);

  // Charger les activités critiques
  const fetchCriticalActivities = async () => {
    try {
      const params = {
        limit: 5,
        date_filter: dateFilter !== 'all' ? dateFilter : undefined
      };
      const response = await getCriticalActivities(params);
      setCriticalActivities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching critical activities:', error);
    }
  };

  useEffect(() => {
    fetchCriticalActivities();
  }, [dateFilter]);

  // Charger la timeline
  const fetchTimeline = async () => {
    try {
      const response = await getRecentActivities({ limit: 15 });
      setTimelineActivities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  // ==========================================
  // FILTRES ET PAGINATION
  // ==========================================

  const filteredActivities = useMemo(() => {
    return activities;
  }, [activities]);

  const paginatedActivities = useMemo(() => {
    return filteredActivities;
  }, [filteredActivities]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // CONFIGURATION EXPORT
  // ==========================================

  const exportColumns = [
    { label: 'Date', accessor: 'date', width: 20 },
    { label: 'Heure', accessor: 'time', width: 15 },
    { label: t('users.table.user'), accessor: 'userName', width: 25 },
    { label: 'Module', accessor: 'module', width: 25 },
    { label: 'Action', accessor: 'action', width: 25 },
    { label: 'Description', accessor: 'description', width: 50 },
    { label: 'Niveau', accessor: 'level', width: 20 },
    { label: 'IP', accessor: 'ip', width: 20 },
    { label: 'Navigateur', accessor: 'browser', width: 20 },
    { label: 'Statut', accessor: 'status', width: 15 }
  ];

  const rowFormatter = (activity) => ({
    date: activity.date,
    time: activity.time,
    userName: activity.user?.name || '—',
    module: activity.module,
    action: activity.action,
    description: activity.description,
    level: activity.levelLabel || activity.level,
    ip: activity.ip || '—',
    browser: activity.browser || '—',
    status: activity.status || '—'
  });

  const exportSummary = {
    'Total activités': filteredActivities.length,
    'today': stats.today,
    'activeUsers': stats.users,
    'critical': stats.critical,
    'Actions réussies': stats.success,
    'Sécurité': stats.security
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchActivityLogs(),
      fetchStatistics(),
      fetchChartData(),
      fetchRecentLogins(),
      fetchCriticalActivities(),
      fetchTimeline()
    ]);
    showToast('🔄 Données actualisées', 'success');
  };

  const handleCopy = (activity) => {
    const text = `${activity.user?.name || '—'} - ${activity.action} - ${activity.module} - ${activity.date} ${activity.time}`;
    navigator.clipboard.writeText(text);
    showToast('📋 Informations copiées', 'success');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setUserFilter('all');
    setModuleFilter('all');
    setActionFilter('all');
    setLevelFilter('all');
    setCurrentPage(1);
    showToast('🔄 Filtres réinitialisés', 'info');
  };

  const handleExportSuccess = (result) => {
    showToast(`✅ ${result.filename} exporté avec succès (${result.rowCount || filteredActivities.length} lignes)`, 'success');
  };

  const handleExportError = (error) => {
    showToast(`❌ Erreur lors de l'export : ${error.message || 'Erreur inconnue'}`, 'error');
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-4 md:p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Toast */}
      <AnimatePresence>
        {toast.isOpen && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        <ViewActivityModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
        />
      </AnimatePresence>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {title}
          </h1>
          <p className="text-sm text-[#6D6D6D]">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors disabled:opacity-50"
            title={actions.refresh}
          >
            <RefreshCw size={18} className={`text-[#6D6D6D] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <ExportButtons
            data={filteredActivities}
            columns={exportColumns}
            title="Journal d'activité"
            subtitle={`${filteredActivities.length} activités - ${stats.today} aujourd'hui`}
            filename={`journal_activite_${new Date().toISOString().split('T')[0]}`}
            summary={exportSummary}
            rowFormatter={rowFormatter}
            userName={currentUser?.firstName || t('users.table.user')}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KPICard
          icon={History}
          title="Activités aujourd'hui"
          value={stats.today}
          color="blue"
          subtitle="Dernières 24h"
        />
        <KPICard
          icon={Users}
          title="Utilisateurs actifs"
          value={stats.users}
          color="green"
          subtitle="Connectés"
        />
        <KPICard
          icon={AlertTriangle}
          title="Actions critiques"
          value={stats.critical}
          color="red"
          subtitle="À surveiller"
        />
        <KPICard
          icon={CheckCircle}
          title="Actions réussies"
          value={stats.success}
          color="green"
          subtitle="Succès"
        />
        <KPICard
          icon={Clock}
          title="Temps moyen"
          value={stats.duration}
          color="orange"
          subtitle="Par session"
        />
        <KPICard
          icon={ShieldCheck}
          title="Sécurité"
          value={stats.security}
          color="gold"
          subtitle="Score"
        />
      </div>

      {/* ===== SEARCH & FILTERS ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-[#F8F7F4] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="yesterday">Hier</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les utilisateurs</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Toutes les actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les niveaux</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'info' ? 'Information' :
                   level === 'success' ? 'Succès' :
                   level === 'warning' ? 'Avertissement' :
                   level === 'error' ? 'Erreur' :
                   level === 'critical' ? t('notifications.kpi.critical') : level}
                </option>
              ))}
            </select>

            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('date')}</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Heure</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Utilisateur</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Module</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Action</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Niveau</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">IP</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan="10" className="px-3 py-4">
                      <SkeletonLoader className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <History size={48} className="text-[#D1CBC0]" />
                      <h3 className="text-lg font-bold text-[#3D2F24]">Aucune activité</h3>
                      <p className="text-sm text-[#6D6D6D]">Aucune activité ne correspond à vos critères</p>
                      <button
                        onClick={handleResetFilters}
                        className="text-sm text-[#B8863B] font-medium hover:underline"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((activity, index) => {
                  const levelColors = {
                    info: 'bg-blue-50 text-blue-700 border-blue-200',
                    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    warning: 'bg-amber-50 text-amber-700 border-amber-200',
                    error: 'bg-rose-50 text-rose-700 border-rose-200',
                    critical: 'bg-red-800 text-white border-red-900'
                  };

                  const levelLabels = {
                    info: 'Information',
                    success: 'Succès',
                    warning: 'Avertissement',
                    error: 'Erreur',
                    critical: t('notifications.kpi.critical')
                  };

                  return (
                    <motion.tr
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-[#F8F7F4] transition-colors"
                    >
                      <td className="px-3 py-3 text-sm text-[#3D2F24] whitespace-nowrap">{activity.date}</td>
                      <td className="px-3 py-3 text-sm text-[#3D2F24] whitespace-nowrap">{activity.time}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#B8863B]/20 flex items-center justify-center flex-shrink-0">
                            {activity.user?.avatar ? (
                              <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <User size={14} className="text-[#B8863B]" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#3D2F24]">{activity.user?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-[#6D6D6D]">{activity.module}</td>
                      <td className="px-3 py-3 text-sm text-[#3D2F24]">{activity.action}</td>
                      <td className="px-3 py-3 text-sm text-[#6D6D6D] max-w-xs truncate">{activity.description}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${levelColors[activity.level] || levelColors.info}`}>
                          {levelLabels[activity.level] || activity.level}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-[#6D6D6D]">{activity.ip || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          activity.status === 'Succès' ? 'bg-emerald-50 text-emerald-700' : 
                          activity.status === 'Echec' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
                        }`}>
                          {activity.status || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewActivity(activity)}
                            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                            title={actions.view}
                          >
                            <Eye size={15} className="text-[#6D6D6D]" />
                          </button>
                          <button
                            onClick={() => handleCopy(activity)}
                            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                            title="Copier"
                          >
                            <Copy size={15} className="text-[#6D6D6D]" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {filteredActivities.length > 0 && (
          <div className="p-4 border-t border-[#ECE8E1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-[#6D6D6D]">
              <span>
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-[#ECE8E1] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-[#6D6D6D]" />
                <ChevronLeft size={16} className="text-[#6D6D6D] -ml-2" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-[#6D6D6D]" />
              </button>
              <span className="text-sm font-medium text-[#3D2F24]">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-[#6D6D6D]" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-[#6D6D6D]" />
                <ChevronRight size={16} className="text-[#6D6D6D] -ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== TIMELINE ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-[#3D2F24] mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#B8863B]" />
          Timeline d'activité
        </h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {timelineActivities.slice(0, 10).map((activity, idx) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  activity.level === 'critical' ? 'bg-red-800' : 
                  activity.level === 'error' ? 'bg-rose-500' : 
                  activity.level === 'warning' ? 'bg-amber-500' : 'bg-[#B8863B]'
                }`} />
                {idx < 9 && <div className="w-0.5 h-8 bg-[#ECE8E1]" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[#6D6D6D]">{activity.time}</span>
                  <span className="text-xs font-semibold text-[#3D2F24]">{activity.user?.name || '—'}</span>
                  <span className="text-xs text-[#6D6D6D]">{activity.action}</span>
                  <span className="text-xs text-[#B8863B]">{activity.module}</span>
                </div>
                <p className="text-xs text-[#6D6D6D] mt-0.5">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== GRAPHIQUES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Activités par jour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activitiesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6D6D6D' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6D6D6D' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECE8E1',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#B8863B" strokeWidth={2.5} dot={{ fill: '#B8863B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition des activités</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={activitiesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  label={({ name, value }) => `${value}`}
                  labelLine={false}
                >
                  {activitiesByType.map((entry, index) => (
                    <Cell key={index} fill={entry.color || '#B8863B'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECE8E1',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value}`, name]}
                />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Activités par utilisateur</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitiesByUser}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6D6D6D' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6D6D6D' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECE8E1',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#B8863B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Modules les plus utilisés</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitiesByModule} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6D6D6D' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6D6D6D' }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECE8E1',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== ACTIVITÉS CRITIQUES ===== */}
      {criticalActivities.length > 0 && (
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" />
            Activités critiques
            <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{criticalActivities.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-rose-50 border border-rose-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewActivity(activity)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-rose-700">{activity.user?.name || '—'}</p>
                    <p className="text-xs text-rose-600">{activity.date} {activity.time}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-white bg-rose-500 px-2 py-0.5 rounded-full">
                    {activity.levelLabel || activity.level}
                  </span>
                </div>
                <p className="text-sm text-[#3D2F24] mt-2 truncate">{activity.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewActivity(activity);
                  }}
                  className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
                >
                  <Eye size={12} />
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== DERNIÈRES CONNEXIONS ===== */}
      {recentLogins.length > 0 && (
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4 flex items-center gap-2">
            <LogOut size={18} className="text-[#B8863B]" />
            Dernières connexions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentLogins.map((login, idx) => (
              <div key={idx} className="bg-[#F8F7F4] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B8863B]/20 flex items-center justify-center">
                    <User size={14} className="text-[#B8863B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">{login.user || '—'}</p>
                    <p className="text-xs text-[#6D6D6D]">{login.time}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-[#6D6D6D]">
                  <span>IP: {login.ip || '—'}</span>
                  <span>{login.browser || '—'}</span>
                  <span className="col-span-2">{login.city || '—'}, {login.country || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;