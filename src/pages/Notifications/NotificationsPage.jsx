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
import ExportButtons from '../../components/ExportButtons';
import { 
  getNotificationRoute, 
  getModuleLabel, 
  getModuleIcon,
  hasDetailRoute 
} from '../../utils/notificationRoutes';

// ==========================================
// CONSTANTES
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const CURRENCY = 'MAD';

// ==========================================
// MOCK DATA - NOTIFICATIONS
// ==========================================

const generateMockNotifications = () => {
  const types = [
    { type: 'order', icon: ShoppingBag, color: '#3B82F6', label: 'Commandes' },
    { type: 'production', icon: Factory, color: '#F59E0B', label: 'Production' },
    { type: 'delivery', icon: Truck, color: '#10B981', label: 'Livraisons' },
    { type: 'invoice', icon: FileText, color: '#8B5CF6', label: 'Factures' },
    { type: 'payment', icon: CreditCard, color: '#22C55E', label: 'Paiements' },
    { type: 'product', icon: Package, color: '#EF4444', label: 'Produits' },
    { type: 'customer', icon: User, color: '#06B6D4', label: 'Clients' },
    { type: 'user', icon: Users, color: '#F472B6', label: 'Utilisateurs' },
    { type: 'system', icon: Settings, color: '#6B7280', label: 'Système' },
    { type: 'analytics', icon: BarChart3, color: '#8B5CF6', label: 'Analytics' },
    { type: 'stock', icon: Package, color: '#F59E0B', label: 'Stock' },
    { type: 'report', icon: FileText, color: '#EF4444', label: 'Rapports' },
    { type: 'category', icon: Layers, color: '#22C55E', label: 'Catégories' },
    { type: 'classification', icon: Tag, color: '#8B5CF6', label: 'Classifications' }
  ];

  const priorities = [
    { level: 'low', label: 'Faible', color: '#3B82F6' },
    { level: 'medium', label: 'Moyenne', color: '#F59E0B' },
    { level: 'high', label: 'Haute', color: '#EF4444' },
    { level: 'critical', label: 'Critique', color: '#7F1D1D' }
  ];

  const users = ['Youssef A.', 'Sara B.', 'Mohamed C.', 'Karim D.', 'Nadia E.', 'Admin'];
  const clients = ['Café Al Amir', 'Pâtisserie Nour', 'Restaurant La Table', 'Snack City', 'Boissons du Maroc'];
  
  const entityIds = {
    order: ['CMD-1054', 'CMD-1055', 'CMD-1056', 'CMD-1057', 'CMD-1058'],
    customer: ['CLT-001', 'CLT-002', 'CLT-003', 'CLT-004', 'CLT-005'],
    client: ['CLT-001', 'CLT-002', 'CLT-003', 'CLT-004', 'CLT-005'],
    product: ['PRD-001', 'PRD-002', 'PRD-003', 'PRD-004', 'PRD-005'],
    category: ['CAT-001', 'CAT-002', 'CAT-003', 'CAT-004', 'CAT-005'],
    classification: ['CLS-001', 'CLS-002', 'CLS-003', 'CLS-004', 'CLS-005'],
    invoice: ['FAC-0456', 'FAC-0457', 'FAC-0458', 'FAC-0459', 'FAC-0460'],
    payment: ['PAY-001', 'PAY-002', 'PAY-003', 'PAY-004', 'PAY-005'],
    production: ['PRD-0034', 'PRD-0035', 'PRD-0036', 'PRD-0037', 'PRD-0038'],
    delivery: ['LIV-0087', 'LIV-0088', 'LIV-0089', 'LIV-0090', 'LIV-0091'],
    user: ['USR-001', 'USR-002', 'USR-003', 'USR-004', 'USR-005'],
    report: ['RPT-001', 'RPT-002', 'RPT-003', 'RPT-004', 'RPT-005']
  };

  const titles = {
    order: [
      'Nouvelle commande créée',
      'Commande validée',
      'Commande en production',
      'Commande terminée',
      'Commande livrée',
      'Commande annulée'
    ],
    production: [
      'Production lancée',
      'Production terminée',
      'Production en retard',
      'Production interrompue'
    ],
    delivery: [
      'Livraison créée',
      'Livraison en cours',
      'Livraison effectuée',
      'Livraison retardée'
    ],
    invoice: [
      'Nouvelle facture',
      'Facture payée',
      'Facture en attente',
      'Facture impayée'
    ],
    payment: [
      'Paiement reçu',
      'Paiement refusé',
      'Paiement confirmé'
    ],
    product: [
      'Nouveau produit ajouté',
      'Produit modifié',
      'Produit en rupture',
      'Stock faible'
    ],
    customer: [
      'Nouveau client',
      'Client modifié',
      'Client supprimé'
    ],
    user: [
      'Nouvel utilisateur',
      'Modification utilisateur',
      'Connexion réussie',
      'Échec de connexion'
    ],
    system: [
      'Sauvegarde effectuée',
      'Mise à jour disponible',
      'Maintenance programmée'
    ],
    analytics: [
      'Nouveau rapport disponible',
      'Analyse terminée'
    ],
    stock: [
      'Stock critique',
      'Réapprovisionnement nécessaire'
    ],
    report: [
      'Rapport généré',
      'Rapport exporté'
    ],
    category: [
      'Nouvelle catégorie créée',
      'Catégorie modifiée'
    ],
    classification: [
      'Nouvelle classification créée',
      'Classification modifiée'
    ]
  };

  const descriptions = {
    order: [
      'Une nouvelle commande a été créée par {user}.',
      'La commande a été validée par le comptable.',
      'La commande est entrée en production.',
      'La production de la commande est terminée.',
      'La commande a été livrée avec succès.',
      'La commande a été annulée.'
    ],
    production: [
      'La production de la commande a débuté.',
      'La production est terminée avec succès.',
      'La production accuse un retard de 2 heures.',
      'La production a été interrompue pour maintenance.'
    ],
    delivery: [
      'Une nouvelle livraison a été planifiée.',
      'La livraison est en cours de réalisation.',
      'La livraison a été effectuée avec succès.',
      'La livraison est en retard.'
    ],
    invoice: [
      'Une nouvelle facture a été générée.',
      'La facture a été payée par le client.',
      'La facture est en attente de paiement.',
      'La facture est impayée depuis 15 jours.'
    ],
    payment: [
      'Un paiement a été reçu de {client}.',
      'Le paiement a été refusé.',
      'Le paiement a été confirmé.'
    ],
    product: [
      'Un nouveau produit a été ajouté au catalogue.',
      'Un produit a été modifié.',
      'Un produit est en rupture de stock.',
      'Le stock d\'un produit est faible.'
    ],
    customer: [
      'Un nouveau client a été enregistré.',
      'Les informations d\'un client ont été modifiées.',
      'Un client a été supprimé.'
    ],
    user: [
      'Un nouvel utilisateur a été créé.',
      'Les informations d\'un utilisateur ont été modifiées.',
      'Un utilisateur s\'est connecté avec succès.',
      'Tentative de connexion échouée.'
    ],
    system: [
      'Une sauvegarde automatique a été effectuée.',
      'Une nouvelle mise à jour est disponible.',
      'Une maintenance est programmée.'
    ],
    analytics: [
      'Un nouveau rapport d\'analyse est disponible.',
      'L\'analyse des données est terminée.'
    ],
    stock: [
      'Le niveau de stock est critique pour certains produits.',
      'Un réapprovisionnement est nécessaire.'
    ],
    report: [
      'Le rapport a été généré avec succès.',
      'Le rapport a été exporté.'
    ],
    category: [
      'Une nouvelle catégorie a été créée.',
      'Une catégorie a été modifiée.'
    ],
    classification: [
      'Une nouvelle classification a été créée.',
      'Une classification a été modifiée.'
    ]
  };

  const notifications = [];
  const now = new Date();

  for (let i = 1; i <= 248; i++) {
    const typeObj = types[Math.floor(Math.random() * types.length)];
    const priorityObj = priorities[Math.floor(Math.random() * priorities.length)];
    const status = Math.random() > 0.4 ? 'read' : 'unread';
    const user = users[Math.floor(Math.random() * users.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    
    const titleList = titles[typeObj.type] || ['Notification'];
    const descList = descriptions[typeObj.type] || ['Notification système'];
    
    const title = titleList[Math.floor(Math.random() * titleList.length)];
    let description = descList[Math.floor(Math.random() * descList.length)];
    description = description.replace('{user}', user).replace('{client}', client);

    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const entityIdList = entityIds[typeObj.type] || [`${typeObj.type.toUpperCase()}-${String(i).padStart(4, '0')}`];
    const entityId = entityIdList[Math.floor(Math.random() * entityIdList.length)];

    notifications.push({
      id: i,
      type: typeObj.type,
      entityId: entityId,
      icon: typeObj.icon,
      color: typeObj.color,
      label: typeObj.label,
      title,
      description,
      createdBy: user,
      client: Math.random() > 0.5 ? client : null,
      priority: priorityObj.level,
      priorityLabel: priorityObj.label,
      priorityColor: priorityObj.color,
      status,
      createdAt: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: date.getTime(),
      module: typeObj.label,
      isRead: status === 'read',
      archived: false,
      route: undefined
    });
  }

  notifications.sort((a, b) => b.timestamp - a.timestamp);
  
  return notifications;
};

const getNotificationStats = (notifications) => {
  const total = notifications.length;
  const unread = notifications.filter(n => !n.isRead).length;
  const critical = notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length;
  const today = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  }).length;

  return { total, unread, critical, today };
};

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
  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-800 text-white border-red-900'
  };

  const priorityLabels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    critical: 'Critique'
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
                  {priorityLabels[notification.priority] || 'Faible'}
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
                title="Supprimer"
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

  // ⭐ FONCTION DE NAVIGATION CORRIGÉE
  const handleNavigate = () => {
    onClose();
    // Navigation intelligente vers la route calculée
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
                  <h2 className="text-base md:text-xl font-bold text-[#3D2F24]">Détails de la notification</h2>
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
              {notification.priorityLabel || 'Faible'}
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
              <p className="text-[9px] md:text-xs text-[#6D6D6D] mb-0.5 md:mb-1">Date</p>
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
              Fermer
            </button>
          </div>

          {/* ⭐ Affichage de la destination pour debug */}
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
  const [localFilters, setLocalFilters] = useState(filters);

  const modules = [
    'Tous', 'Commandes', 'Clients', 'Produits', 'Production',
    'Livraisons', 'Factures', 'Paiements', 'Stock', 'Utilisateurs', 
    'Système', 'Analytics', 'Rapports', 'Catégories', 'Classifications'
  ];

  const priorities = [
    { id: 'all', label: 'Toutes' },
    { id: 'low', label: 'Faible' },
    { id: 'medium', label: 'Moyenne' },
    { id: 'high', label: 'Haute' },
    { id: 'critical', label: 'Critique' }
  ];

  const statuses = [
    { id: 'all', label: 'Tous' },
    { id: 'read', label: 'Lues' },
    { id: 'unread', label: 'Non lues' }
  ];

  const periods = [
    { id: 'today', label: "Aujourd'hui" },
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
                Réinitialiser
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
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">Priorité</label>
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
              <label className="text-[9px] md:text-xs font-medium text-[#6D6D6D] block mb-0.5 md:mb-1">Statut</label>
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

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockData = generateMockNotifications();
      setNotifications(mockData);
      setIsLoading(false);
    }, 500);
  }, []);

  const stats = useMemo(() => getNotificationStats(notifications), [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term) ||
        n.createdBy.toLowerCase().includes(term) ||
        (n.client && n.client.toLowerCase().includes(term)) ||
        (n.entityId && n.entityId.toLowerCase().includes(term))
      );
    }

    if (filters.period && filters.period !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(n => {
        const notifDate = new Date(n.timestamp);
        switch (filters.period) {
          case 'today':
            return notifDate >= today;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);
            return notifDate >= weekStart;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return notifDate >= monthStart;
          case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return notifDate >= yearStart;
          default:
            return true;
        }
      });
    }

    if (filters.module && filters.module !== 'Tous') {
      filtered = filtered.filter(n => n.module === filters.module);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(n => 
        filters.status === 'read' ? n.isRead : !n.isRead
      );
    }

    return filtered;
  }, [notifications, searchTerm, filters]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);

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
    priority: item.priority === 'critical' ? 'Critique' :
             item.priority === 'high' ? 'Haute' :
             item.priority === 'medium' ? 'Moyenne' : 'Faible',
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    time: item.time,
    status: item.isRead ? 'Lue' : 'Non lue'
  });

  const summary = [
    { label: 'Total notifications', value: stats.total },
    { label: 'Non lues', value: stats.unread },
    { label: 'Critiques', value: stats.critical },
    { label: "Aujourd'hui", value: stats.today }
  ];

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ExportButtons
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

  const handleToggleRead = (notification) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id
          ? { ...n, isRead: !n.isRead }
          : n
      )
    );
    showToast(
      notification.isRead 
        ? '📬 Notification marquée comme non lue'
        : '✅ Notification marquée comme lue',
      'success'
    );
  };

  const handleDelete = (notification) => {
    if (window.confirm(`Supprimer la notification "${notification.title}" ?`)) {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setSelectedIds(prev => prev.filter(id => id !== notification.id));
      showToast('🗑️ Notification supprimée avec succès', 'success');
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    showToast('✅ Toutes les notifications ont été marquées comme lues', 'success');
  };

  const handleDeleteRead = () => {
    if (window.confirm('Supprimer toutes les notifications lues ?')) {
      setNotifications(prev => prev.filter(n => !n.isRead));
      showToast('🗑️ Notifications lues supprimées avec succès', 'success');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Supprimer ${selectedIds.length} notification(s) sélectionnée(s) ?`)) {
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      showToast(`🗑️ ${selectedIds.length} notification(s) supprimée(s) avec succès`, 'success');
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
    if (selectedIds.length === paginatedNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedNotifications.map(n => n.id));
    }
  };

  // ⭐ HANDLER CORRIGÉ - Navigation intelligente vers la route calculée
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    
    if (!notification.isRead) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, isRead: true }
            : n
        )
      );
    }
  };

  const handleMarkAsRead = (notification) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id
          ? { ...n, isRead: true }
          : n
      )
    );
    showToast('✅ Notification marquée comme lue', 'success');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockData = generateMockNotifications();
      setNotifications(mockData);
      setIsLoading(false);
      showToast('🔄 Notifications actualisées avec succès', 'success');
    }, 800);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      period: 'all',
      module: 'Tous',
      priority: 'all',
      status: 'all'
    });
    setCurrentPage(1);
    showToast('🔄 Filtres réinitialisés avec succès', 'success');
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
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
                Notifications
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
              data={filteredNotifications}
              columns={columns}
              title="Liste des notifications"
              subtitle={`${filteredNotifications.length} notifications`}
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
                placeholder="Rechercher..."
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
                title="Actualiser"
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
                title="Supprimer les notifications lues"
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
          title="Aujourd'hui"
          value={stats.today}
          color="green"
          subtitle="Nouvelles"
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
              {selectedIds.length === paginatedNotifications.length && paginatedNotifications.length > 0 ? (
                <CheckSquare size={14} className="md:w-[18px] md:h-[18px] text-[#B8863B]" />
              ) : (
                <Square size={14} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />
              )}
            </button>
            <span className="text-[10px] md:text-xs text-[#6D6D6D]">
              {filteredNotifications.length} notif(s)
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-[10px] md:text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                Supprimer ({selectedIds.length})
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs text-[#6D6D6D]">
            <span className="hidden sm:inline">Affichage de </span>
            <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredNotifications.length)}</span>
            <span className="hidden sm:inline">sur {filteredNotifications.length}</span>
          </div>
        </div>

        <div className="divide-y divide-[#ECE8E1]">
          {paginatedNotifications.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <BellOff size={36} className="md:w-12 md:h-12 text-[#D1CBC0] mx-auto mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-bold text-[#3D2F24]">Aucune notification</h3>
              <p className="text-xs md:text-sm text-[#6D6D6D]">
                {searchTerm || filters.module !== 'Tous' || filters.priority !== 'all' 
                  ? 'Aucune notification ne correspond à vos filtres'
                  : 'Vous êtes à jour ! Toutes vos notifications sont lues'}
              </p>
            </div>
          ) : (
            paginatedNotifications.map((notification) => (
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