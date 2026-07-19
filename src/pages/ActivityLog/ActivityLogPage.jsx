// src/pages/ActivityLog/ActivityLogPage.jsx
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

// ==========================================
// ⭐ NOUVEAU : Import du composant d'export
// ==========================================
import ExportButtons from '../../components/ExportButtons';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR';

// ==========================================
// MOCK DATA
// ==========================================

// Génération de données d'activité
const generateMockActivities = () => {
  const users = [
    { id: 1, name: 'Mohamed Amine', email: 'amine@lartedolce.com', role: 'Administrator', department: 'Administration', avatar: null },
    { id: 2, name: 'Sara El Amrani', email: 'sara@lartedolce.com', role: 'Comptable', department: 'Comptabilité', avatar: null },
    { id: 3, name: 'Youssef Benali', email: 'youssef@lartedolce.com', role: 'Responsable Production', department: 'Production', avatar: null },
    { id: 4, name: 'Hanan Saidi', email: 'hanan@lartedolce.com', role: 'Commercial', department: 'Commercial', avatar: null },
    { id: 5, name: 'Karim Lahlou', email: 'karim@lartedolce.com', role: 'Livreur', department: 'Livraison', avatar: null },
    { id: 6, name: 'Nadia Fassi', email: 'nadia@lartedolce.com', role: 'Manager', department: 'Gestion', avatar: null }
  ];

  const modules = [
    'Dashboard', 'Commandes', 'Clients', 'Produits', 'Production',
    'Inventaire', 'Livraisons', 'Factures', 'Paiements', 'Finance',
    'Rapports', 'Analytics', 'Notifications', 'Paramètres', 'Utilisateurs'
  ];

  const actions = [
    'Création', 'Modification', 'Suppression', 'Connexion', 'Déconnexion',
    'Validation', 'Production', 'Paiement', 'Export', 'Import', 'Consultation'
  ];

  const levels = ['info', 'success', 'warning', 'error', 'critical'];
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
    critical: 'Critique'
  };

  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const devices = ['Windows PC', 'MacBook Pro', 'iPhone 14', 'Android', 'iPad'];
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'];

  const activities = [];
  const now = new Date();

  for (let i = 1; i <= 245; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const module = modules[Math.floor(Math.random() * modules.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];

    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const descriptions = {
      'Création': `a créé un nouvel élément dans ${module}`,
      'Modification': `a modifié un élément dans ${module}`,
      'Suppression': `a supprimé un élément dans ${module}`,
      'Connexion': `s'est connecté au système`,
      'Déconnexion': `s'est déconnecté du système`,
      'Validation': `a validé une opération dans ${module}`,
      'Production': `a lancé une production dans ${module}`,
      'Paiement': `a effectué un paiement dans ${module}`,
      'Export': `a exporté des données de ${module}`,
      'Import': `a importé des données dans ${module}`,
      'Consultation': `a consulté des données dans ${module}`
    };

    const description = descriptions[action] || `a effectué une action dans ${module}`;

    // Générer une ancienne et nouvelle valeur pour les modifications
    let oldValue = null;
    let newValue = null;
    if (action === 'Modification') {
      oldValue = `Ancienne valeur ${Math.floor(Math.random() * 100)}`;
      newValue = `Nouvelle valeur ${Math.floor(Math.random() * 100)}`;
    }

    activities.push({
      id: i,
      user,
      module,
      action,
      description,
      level,
      levelLabel: levelLabels[level],
      levelColor: levelColors[level],
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: date.getTime(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      browser,
      device,
      city,
      country: 'Maroc',
      status: Math.random() > 0.2 ? 'Succès' : 'Échec',
      duration: `${Math.floor(Math.random() * 5)}s`,
      oldValue,
      newValue,
      comments: Math.random() > 0.7 ? 'Commentaire supplémentaire' : null
    });
  }

  activities.sort((a, b) => b.timestamp - a.timestamp);
  return activities;
};

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

// KPI Card
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

// View Activity Modal
const ViewActivityModal = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;

  const levelColors = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-rose-50 text-rose-700',
    critical: 'bg-red-800 text-white'
  };

  const showToast = (message, type = 'success') => {
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
          {/* En-tête */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#ECE8E1]">
            <div className="w-12 h-12 rounded-full bg-[#B8863B]/20 flex items-center justify-center">
              {activity.user.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={24} className="text-[#B8863B]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3D2F24]">{activity.user.name}</p>
              <p className="text-xs text-[#6D6D6D]">{activity.user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelColors[activity.level] || levelColors.info}`}>
                  {activity.levelLabel}
                </span>
                <span className="text-[10px] text-[#6D6D6D]">{activity.module}</span>
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
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
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Date</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.date}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Heure</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.time}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Adresse IP</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.ip}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Navigateur</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.browser}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Appareil</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.device}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Durée</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.duration}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Statut</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activity.status === 'Succès' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {activity.status}
              </span>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide">Ville</p>
              <p className="text-sm font-medium text-[#3D2F24]">{activity.city}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#F8F7F4] rounded-xl p-4">
            <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-[#3D2F24]">{activity.description}</p>
          </div>

          {/* Ancienne/Nouvelle valeur */}
          {activity.oldValue && activity.newValue && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <p className="text-[10px] text-rose-600 uppercase tracking-wide">Ancienne valeur</p>
                <p className="text-sm font-medium text-rose-700">{activity.oldValue}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Nouvelle valeur</p>
                <p className="text-sm font-medium text-emerald-700">{activity.newValue}</p>
              </div>
            </div>
          )}

          {/* Commentaires */}
          {activity.comments && (
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-[10px] text-[#6D6D6D] uppercase tracking-wide mb-1">Commentaires</p>
              <p className="text-sm text-[#3D2F24]">{activity.comments}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('showToast', { detail: { message: '✅ Activité exportée en PDF', type: 'success' } }));
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
                window.dispatchEvent(new CustomEvent('showToast', { detail: { message: '🖨️ Impression en cours', type: 'info' } }));
              }}
              className="flex-1 min-w-[120px] py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Imprimer
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
                window.dispatchEvent(new CustomEvent('showToast', { detail: { message: '📋 Informations copiées', type: 'success' } }));
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

// Export Modal
const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('pdf');
  const [period, setPeriod] = useState('today');

  if (!isOpen) return null;

  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'csv', label: 'CSV', icon: FileText },
    { id: 'json', label: 'JSON', icon: FileText },
    { id: 'xml', label: 'XML', icon: FileText }
  ];

  const periods = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'custom', label: 'Personnalisé' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Exporter les activités
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      format === f.id
                        ? 'border-[#B8863B] bg-[#B8863B]/10 text-[#B8863B]'
                        : 'border-[#ECE8E1] hover:border-[#B8863B]'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-1" />
                    <span className="text-xs font-medium">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Période</label>
            <div className="grid grid-cols-4 gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                    period === p.id
                      ? 'border-[#B8863B] bg-[#B8863B]/10 text-[#B8863B]'
                      : 'border-[#ECE8E1] hover:border-[#B8863B]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onExport(format, period);
                onClose();
              }}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Exporter
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
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

  // Charger les données
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setIsLoading(false);
    }, 800);
  }, []);

  // Obtenir les utilisateurs uniques pour le filtre
  const uniqueUsers = useMemo(() => {
    const users = new Set(activities.map(a => a.user.name));
    return Array.from(users);
  }, [activities]);

  // Obtenir les modules uniques pour le filtre
  const uniqueModules = useMemo(() => {
    const modules = new Set(activities.map(a => a.module));
    return Array.from(modules);
  }, [activities]);

  // Obtenir les actions uniques pour le filtre
  const uniqueActions = useMemo(() => {
    const actions = new Set(activities.map(a => a.action));
    return Array.from(actions);
  }, [activities]);

  // Obtenir les niveaux uniques pour le filtre
  const uniqueLevels = useMemo(() => {
    const levels = new Set(activities.map(a => a.levelLabel));
    return Array.from(levels);
  }, [activities]);

  // Filtrer les activités
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.user.name.toLowerCase().includes(term) ||
        a.module.toLowerCase().includes(term) ||
        a.action.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.ip.includes(term)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(a => {
        const date = new Date(a.timestamp);
        switch (dateFilter) {
          case 'today':
            return date >= today;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return date >= yesterday && date < today;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);
            return date >= weekStart;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return date >= monthStart;
          default:
            return true;
        }
      });
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(a => a.user.name === userFilter);
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(a => a.module === moduleFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(a => a.action === actionFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(a => a.levelLabel === levelFilter);
    }

    return filtered;
  }, [activities, searchTerm, dateFilter, userFilter, moduleFilter, actionFilter, levelFilter]);

  // Pagination
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(start, start + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  // Statistiques
  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayActivities = activities.filter(a => new Date(a.timestamp) >= todayStart);
    const activeUsers = new Set(activities.map(a => a.user.id)).size;
    const criticalActions = activities.filter(a => a.level === 'critical' || a.level === 'error').length;
    const successActions = activities.filter(a => a.status === 'Succès').length;
    const avgDuration = '2h 35m';

    return {
      today: todayActivities.length,
      users: activeUsers,
      critical: criticalActions,
      success: successActions,
      duration: avgDuration,
      security: '100%'
    };
  }, [activities]);

  // ==========================================
  // ⭐ COLONNES POUR L'EXPORT
  // ==========================================
  const exportColumns = [
    { label: 'Date', accessor: 'date', width: 20 },
    { label: 'Heure', accessor: 'time', width: 15 },
    { label: 'Utilisateur', accessor: 'userName', width: 25 },
    { label: 'Module', accessor: 'module', width: 25 },
    { label: 'Action', accessor: 'action', width: 25 },
    { label: 'Description', accessor: 'description', width: 50 },
    { label: 'Niveau', accessor: 'level', width: 20 },
    { label: 'IP', accessor: 'ip', width: 20 },
    { label: 'Navigateur', accessor: 'browser', width: 20 },
    { label: 'Statut', accessor: 'status', width: 15 }
  ];

  // ==========================================
  // ⭐ FORMATTEUR POUR L'EXPORT
  // ==========================================
  const rowFormatter = (activity) => ({
    date: activity.date,
    time: activity.time,
    userName: activity.user.name,
    module: activity.module,
    action: activity.action,
    description: activity.description,
    level: activity.levelLabel,
    ip: activity.ip,
    browser: activity.browser,
    status: activity.status
  });

  // ==========================================
  // ⭐ RÉSUMÉ POUR L'EXPORT
  // ==========================================
  const exportSummary = {
    'Total activités': filteredActivities.length,
    'Aujourd\'hui': stats.today,
    'Utilisateurs actifs': stats.users,
    'Actions critiques': stats.critical,
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

  const handleExport = (format, period) => {
    showToast(`📄 Export en ${format.toUpperCase()} pour la période "${period}" en cours...`, 'info');
    setTimeout(() => {
      showToast(`✅ Export ${format.toUpperCase()} terminé avec succès`, 'success');
    }, 1500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setIsLoading(false);
      showToast('🔄 Données actualisées', 'success');
    }, 800);
  };

  const handleExportPDF = () => {
    setIsExportModalOpen(true);
  };

  const handleExportExcel = () => {
    showToast('📊 Export Excel en cours...', 'info');
    setTimeout(() => showToast('✅ Excel exporté avec succès', 'success'), 1500);
  };

  const handlePrint = () => {
    window.print();
    showToast('🖨️ Impression en cours...', 'info');
  };

  const handleExportCSV = () => {
    showToast('📄 Export CSV en cours...', 'info');
    setTimeout(() => showToast('✅ CSV exporté avec succès', 'success'), 1500);
  };

  const handleCopy = (activity) => {
    navigator.clipboard.writeText(`${activity.user.name} - ${activity.action} - ${activity.module} - ${activity.date} ${activity.time}`);
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

  // ==========================================
  // HANDLER SUCCÈS EXPORT
  // ==========================================
  const handleExportSuccess = (result) => {
    showToast(`✅ ${result.filename} exporté avec succès (${result.rowCount || filteredActivities.length} lignes)`, 'success');
  };

  // ==========================================
  // HANDLER ERREUR EXPORT
  // ==========================================
  const handleExportError = (error) => {
    showToast(`❌ Erreur lors de l'export : ${error.message || 'Erreur inconnue'}`, 'error');
  };

  // Graphiques
  const activitiesByDay = useMemo(() => {
    const days = {};
    activities.slice(0, 30).forEach(a => {
      const date = a.date;
      days[date] = (days[date] || 0) + 1;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [activities]);

  const activitiesByType = useMemo(() => {
    const types = {};
    activities.forEach(a => {
      types[a.action] = (types[a.action] || 0) + 1;
    });
    const colors = ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'];
    return Object.entries(types).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [activities]);

  const activitiesByUser = useMemo(() => {
    const users = {};
    activities.forEach(a => {
      users[a.user.name] = (users[a.user.name] || 0) + 1;
    });
    return Object.entries(users).slice(0, 10).map(([name, count]) => ({ name, count }));
  }, [activities]);

  const activitiesByModule = useMemo(() => {
    const modules = {};
    activities.forEach(a => {
      modules[a.module] = (modules[a.module] || 0) + 1;
    });
    return Object.entries(modules).slice(0, 10).map(([name, count]) => ({ name, count }));
  }, [activities]);

  // Dernières connexions
  const recentLogins = useMemo(() => {
    return activities
      .filter(a => a.action === 'Connexion')
      .slice(0, 5)
      .map(a => ({
        user: a.user.name,
        time: `${a.date} ${a.time}`,
        ip: a.ip,
        browser: a.browser,
        city: a.city,
        country: a.country
      }));
  }, [activities]);

  // Activités critiques
  const criticalActivities = useMemo(() => {
    return activities
      .filter(a => a.level === 'critical' || a.level === 'error')
      .slice(0, 5);
  }, [activities]);

  // Timeline
  const timelineActivities = useMemo(() => {
    return activities.slice(0, 15);
  }, [activities]);

  // ==========================================
  // RENDER - TABLE
  // ==========================================

  const renderActivityRow = (activity, index) => {
    const levelColors = {
      info: 'border-l-4 border-l-blue-500',
      success: 'border-l-4 border-l-emerald-500',
      warning: 'border-l-4 border-l-amber-500',
      error: 'border-l-4 border-l-rose-500',
      critical: 'border-l-4 border-l-red-800'
    };

    return (
      <motion.tr
        key={activity.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className={`hover:bg-[#F8F7F4] transition-colors ${levelColors[activity.level] || levelColors.info}`}
      >
        <td className="px-3 py-3 text-sm text-[#3D2F24] whitespace-nowrap">{activity.date}</td>
        <td className="px-3 py-3 text-sm text-[#3D2F24] whitespace-nowrap">{activity.time}</td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B8863B]/20 flex items-center justify-center flex-shrink-0">
              {activity.user.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={14} className="text-[#B8863B]" />
              )}
            </div>
            <span className="text-sm font-medium text-[#3D2F24]">{activity.user.name}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-sm text-[#6D6D6D]">{activity.module}</td>
        <td className="px-3 py-3 text-sm text-[#3D2F24]">{activity.action}</td>
        <td className="px-3 py-3 text-sm text-[#6D6D6D] max-w-xs truncate">{activity.description}</td>
        <td className="px-3 py-3">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${activity.levelColor}`}>
            {activity.levelLabel}
          </span>
        </td>
        <td className="px-3 py-3 text-sm text-[#6D6D6D]">{activity.ip}</td>
        <td className="px-3 py-3 text-sm text-[#6D6D6D]">{activity.browser}</td>
        <td className="px-3 py-3">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            activity.status === 'Succès' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {activity.status}
          </span>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleViewActivity(activity)}
              className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              title="Voir"
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
            <button
              onClick={() => {
                showToast(`📥 Téléchargement de l'activité #${activity.id}`, 'info');
                setTimeout(() => showToast('✅ Téléchargement terminé', 'success'), 1500);
              }}
              className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download size={15} className="text-[#6D6D6D]" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  };

  // ==========================================
  // RENDER - MOBILE CARDS
  // ==========================================

  const renderMobileCard = (activity) => {
    const levelColors = {
      info: 'border-blue-500',
      success: 'border-emerald-500',
      warning: 'border-amber-500',
      error: 'border-rose-500',
      critical: 'border-red-800'
    };

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border-l-4 ${levelColors[activity.level] || levelColors.info} border-t border-r border-b border-[#ECE8E1] rounded-xl p-4 shadow-sm`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B8863B]/20 flex items-center justify-center flex-shrink-0">
              {activity.user.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={18} className="text-[#B8863B]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3D2F24]">{activity.user.name}</p>
              <p className="text-xs text-[#6D6D6D]">{activity.date} • {activity.time}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${activity.levelColor}`}>
            {activity.levelLabel}
          </span>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6D6D6D]">Module:</span>
            <span className="font-medium text-[#3D2F24]">{activity.module}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6D6D6D]">Action:</span>
            <span className="font-medium text-[#3D2F24]">{activity.action}</span>
          </div>
          <p className="text-sm text-[#6D6D6D]">{activity.description}</p>
          <div className="flex items-center gap-2 text-xs text-[#6D6D6D]">
            <span>IP: {activity.ip}</span>
            <span>•</span>
            <span>{activity.browser}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#ECE8E1] flex items-center justify-end gap-2">
          <button
            onClick={() => handleViewActivity(activity)}
            className="px-3 py-1.5 text-xs font-medium text-[#B8863B] border border-[#B8863B] rounded-lg hover:bg-[#B8863B]/10 transition-colors flex items-center gap-1"
          >
            <Eye size={14} />
            Détails
          </button>
          <button
            onClick={() => handleCopy(activity)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <Copy size={14} className="text-[#6D6D6D]" />
          </button>
        </div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER PRINCIPAL
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

      {/* Modals */}
      <AnimatePresence>
        <ViewActivityModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
        />
      </AnimatePresence>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Journal d'activité
          </h1>
          <p className="text-sm text-[#6D6D6D]">
            Suivi complet de toutes les actions effectuées dans le système L'arte
          </p>
        </div>

        {/* ==========================================
            ⭐ BOUTONS D'EXPORT INTÉGRÉS
            ========================================== */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>

          {/* ⭐ NOUVEAU : ExportButtons */}
          <ExportButtons
            data={filteredActivities}
            columns={exportColumns}
            title="Journal d'activité"
            subtitle="Suivi complet des actions du système"
            filename="journal_activite"
            summary={exportSummary}
            rowFormatter={rowFormatter}
            userName={currentUser?.firstName || 'Utilisateur'}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
            variant="default"
            showPDF={true}
            showExcel={true}
            showCSV={true}
            showPrint={true}
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
        />
        <KPICard
          icon={Users}
          title="Utilisateurs actifs"
          value={stats.users}
          color="green"
        />
        <KPICard
          icon={AlertTriangle}
          title="Actions critiques"
          value={stats.critical}
          color="red"
        />
        <KPICard
          icon={CheckCircle}
          title="Actions réussies"
          value={stats.success}
          color="green"
        />
        <KPICard
          icon={Clock}
          title="Temps moyen d'activité"
          value={stats.duration}
          color="orange"
        />
        <KPICard
          icon={ShieldCheck}
          title="Sécurité"
          value={stats.security}
          color="gold"
        />
      </div>

      {/* ===== SEARCH & FILTERS ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur, une commande, une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-[#F8F7F4] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          {/* Filtres */}
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
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 px-3 py-2 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm mb-6">
        {/* Table Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Heure</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Utilisateur</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Module</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Action</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Description</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Niveau</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">IP</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Navigateur</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Statut</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan="11" className="px-3 py-4">
                      <SkeletonLoader className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-3 py-12 text-center">
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
                paginatedActivities.map((activity, index) => renderActivityRow(activity, index))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonLoader key={idx} className="h-40 w-full" />
            ))
          ) : paginatedActivities.length === 0 ? (
            <div className="text-center py-8">
              <History size={40} className="text-[#D1CBC0] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">Aucune activité trouvée</p>
            </div>
          ) : (
            paginatedActivities.map(activity => renderMobileCard(activity))
          )}
        </div>

        {/* ===== PAGINATION ===== */}
        {filteredActivities.length > 0 && (
          <div className="p-4 border-t border-[#ECE8E1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-[#6D6D6D]">
              <span>
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredActivities.length)} sur {filteredActivities.length}
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
                <option value={250}>250</option>
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
                <div className={`w-3 h-3 rounded-full ${activity.level === 'critical' ? 'bg-red-800' : activity.level === 'error' ? 'bg-rose-500' : 'bg-[#B8863B]'}`} />
                {idx < 9 && <div className="w-0.5 h-8 bg-[#ECE8E1]" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#6D6D6D]">{activity.time}</span>
                  <span className="text-xs font-semibold text-[#3D2F24]">{activity.user.name}</span>
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
        {/* Activités par jour */}
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

        {/* Répartition des activités */}
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
                    <Cell key={index} fill={entry.color} />
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
        {/* Activités par utilisateur */}
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

        {/* Modules les plus utilisés */}
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
                    <p className="text-xs font-medium text-rose-700">{activity.user.name}</p>
                    <p className="text-xs text-rose-600">{activity.date} {activity.time}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-white bg-rose-500 px-2 py-0.5 rounded-full">
                    {activity.levelLabel}
                  </span>
                </div>
                <p className="text-sm text-[#3D2F24] mt-2">{activity.description}</p>
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
                    <p className="text-sm font-medium text-[#3D2F24]">{login.user}</p>
                    <p className="text-xs text-[#6D6D6D]">{login.time}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-[#6D6D6D]">
                  <span>IP: {login.ip}</span>
                  <span>{login.browser}</span>
                  <span className="col-span-2">{login.city}, {login.country}</span>
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