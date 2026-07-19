// src/pages/MyProfile/MyProfilePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Clock,
  Building,
  Briefcase,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Upload,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
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
  Fingerprint,
  Scan,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Database,
  HardDrive,
  Cpu,
  Network,
  Cloud,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Camera,
  Image,
  FileImage,
  FileText,
  File,
  Folder,
  FolderOpen,
  FolderTree,
  Home,
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
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
  LogOut as LogOutIcon,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Crop,
  Maximize2,
  Minimize2,
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
  Monitor as MonitorIcon,
  Tablet,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Server as ServerIcon,
  Database as DatabaseIcon,
  Cloud as CloudIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Battery as BatteryIcon,
  BatteryCharging as BatteryChargingIcon,
  BatteryFull as BatteryFullIcon,
  BatteryMedium as BatteryMediumIcon,
  BatteryLow as BatteryLowIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  FileImage as FileImageIcon,
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
  LogOut as LogOutIcon2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
// DONNÉES STATIQUES (en dehors du composant)
// ==========================================

// Activités récentes - STATIQUE
const recentActivities = [
  { id: 1, type: 'login', action: 'Connexion', module: 'Authentification', date: '17/07/2026', time: '08:30', ip: '197.74.12.45', device: 'Windows PC', browser: 'Chrome' },
  { id: 2, type: 'update', action: 'Profil mis à jour', module: 'Mon Profil', date: '17/07/2026', time: '07:45', ip: '197.74.12.45', device: 'Windows PC', browser: 'Chrome' },
  { id: 3, type: 'password', action: 'Mot de passe changé', module: 'Sécurité', date: '16/07/2026', time: '14:20', ip: '41.105.19.33', device: 'MacBook Pro', browser: 'Safari' },
  { id: 4, type: 'photo', action: 'Photo modifiée', module: 'Mon Profil', date: '16/07/2026', time: '13:10', ip: '41.105.19.33', device: 'MacBook Pro', browser: 'Safari' },
  { id: 5, type: 'order', action: 'Commande créée', module: 'Commandes', date: '15/07/2026', time: '16:45', ip: '105.156.7.21', device: 'iPhone 14', browser: 'Safari' },
  { id: 6, type: 'invoice', action: 'Facture générée', module: 'Factures', date: '15/07/2026', time: '15:30', ip: '105.156.7.21', device: 'iPhone 14', browser: 'Safari' },
  { id: 7, type: 'report', action: 'Rapport téléchargé', module: 'Rapports', date: '14/07/2026', time: '11:20', ip: '197.74.12.45', device: 'Windows PC', browser: 'Chrome' },
  { id: 8, type: 'notification', action: 'Notification consultée', module: 'Notifications', date: '14/07/2026', time: '09:15', ip: '197.74.12.45', device: 'Windows PC', browser: 'Chrome' }
];

// Données initiales des sessions
const initialActiveSessions = [
  { id: 1, device: 'Windows PC', browser: 'Chrome', os: 'Windows 11', ip: '197.74.12.45', city: 'Casablanca', lastActivity: '17/07/2026 08:30', status: 'active', current: true },
  { id: 2, device: 'MacBook Pro', browser: 'Safari', os: 'macOS 14', ip: '41.105.19.33', city: 'Rabat', lastActivity: '16/07/2026 14:20', status: 'active', current: false },
  { id: 3, device: 'iPhone 14', browser: 'Safari', os: 'iOS 17', ip: '105.156.7.21', city: 'Casablanca', lastActivity: '15/07/2026 16:45', status: 'active', current: false },
  { id: 4, device: 'Android', browser: 'Chrome', os: 'Android 14', ip: '197.74.12.45', city: 'Casablanca', lastActivity: '14/07/2026 09:15', status: 'inactive', current: false }
];

// Données initiales des documents
const initialDocuments = [
  { id: 1, name: 'Photo de profil', type: 'image', size: '2.4 MB', date: '17/07/2026', icon: ImageIcon },
  { id: 2, name: 'CV', type: 'pdf', size: '1.2 MB', date: '15/07/2026', icon: FileTextIcon },
  { id: 3, name: 'Contrat de travail', type: 'pdf', size: '3.5 MB', date: '10/07/2026', icon: FileTextIcon },
  { id: 4, name: 'Carte d\'identité', type: 'image', size: '1.1 MB', date: '05/07/2026', icon: FileImageIcon }
];

// Permissions - STATIQUE
const permissions = [
  { module: 'Dashboard', view: true, create: true, edit: true, delete: true },
  { module: 'Commandes', view: true, create: true, edit: true, delete: true },
  { module: 'Produits', view: true, create: true, edit: true, delete: false },
  { module: 'Clients', view: true, create: true, edit: true, delete: false },
  { module: 'Factures', view: true, create: true, edit: true, delete: false },
  { module: 'Rapports', view: true, create: true, edit: true, delete: false },
  { module: 'Analytics', view: true, create: false, edit: false, delete: false },
  { module: 'Production', view: true, create: false, edit: false, delete: false },
  { module: 'Paramètres', view: false, create: false, edit: false, delete: false }
];

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
    warning: <AlertCircle size={18} />,
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
// COMPOSANT: AVATAR UPLOAD
// ==========================================
const AvatarUpload = ({ avatar, onUpload, onRemove, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(avatar);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onUpload(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 ${
          isDragging ? 'border-[#B8863B] border-dashed' : 'border-[#ECE8E1]'
        } overflow-hidden cursor-pointer hover:shadow-lg transition-all group`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#F8F7F4] flex items-center justify-center">
            <User size={32} className="md:w-12 md:h-12 text-[#6D6D6D]" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={20} className="md:w-6 md:h-6 text-white" />
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-[#B8863B] hover:text-[#A07532] transition-colors"
        >
          Changer la photo
        </button>
        {preview && (
          <>
            <span className="text-xs text-[#6D6D6D]">•</span>
            <button
              onClick={() => {
                setPreview(null);
                onRemove();
              }}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              Supprimer
            </button>
          </>
        )}
      </div>
      <p className="text-[10px] text-[#6D6D6D] mt-1">PNG, JPG, JPEG, WEBP • Max 5 MB</p>
    </div>
  );
};

// ==========================================
// COMPOSANT: STAT CARD
// ==========================================
const StatCard = ({ icon: Icon, title, value, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    gold: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-3 md:p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`p-1.5 md:p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={16} className="md:w-[18px] md:h-[18px]" />
        </div>
        <div>
          <p className="text-lg md:text-2xl font-bold text-[#3D2F24]">{value}</p>
          <p className="text-[10px] md:text-xs text-[#6D6D6D]">{title}</p>
          {subtitle && <p className="text-[8px] md:text-[10px] text-[#6D6D6D] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: ACTIVITY TIMELINE
// ==========================================
const ActivityItem = ({ activity }) => {
  const typeConfig = {
    login: { icon: LogOutIcon, color: 'bg-blue-50 text-blue-600' },
    update: { icon: Edit2, color: 'bg-amber-50 text-amber-600' },
    password: { icon: Lock, color: 'bg-rose-50 text-rose-600' },
    photo: { icon: ImageIcon, color: 'bg-purple-50 text-purple-600' },
    order: { icon: ClipboardList, color: 'bg-green-50 text-green-600' },
    invoice: { icon: FileTextIcon, color: 'bg-indigo-50 text-indigo-600' },
    report: { icon: Download, color: 'bg-cyan-50 text-cyan-600' },
    notification: { icon: Bell, color: 'bg-slate-50 text-slate-600' }
  };

  const config = typeConfig[activity.type] || typeConfig.update;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2 md:gap-3 py-2 border-b border-[#F8F7F4] last:border-0">
      <div className={`p-1 md:p-1.5 rounded-lg ${config.color}`}>
        <Icon size={12} className="md:w-[14px] md:h-[14px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-0.5 md:gap-1">
          <p className="text-[11px] md:text-xs font-medium text-[#3D2F24]">{activity.action}</p>
          <span className="text-[9px] md:text-[10px] text-[#6D6D6D]">{activity.date} {activity.time}</span>
        </div>
        <p className="text-[9px] md:text-[10px] text-[#6D6D6D]">{activity.module}</p>
        <div className="flex flex-wrap items-center gap-1 md:gap-2 text-[8px] md:text-[9px] text-[#6D6D6D] mt-0.5">
          <span>{activity.ip}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{activity.device}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{activity.browser}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: SESSION CARD
// ==========================================
const SessionCard = ({ session, onDisconnect }) => {
  return (
    <div className={`bg-white border rounded-xl p-3 md:p-4 ${session.current ? 'border-[#B8863B] bg-[#FDFBF7]' : 'border-[#ECE8E1]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-xl bg-[#F8F7F4]">
            {session.device.includes('Windows') && <Monitor size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device.includes('Mac') && <Laptop size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device.includes('iPhone') && <Smartphone size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device.includes('Android') && <Smartphone size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-[#3D2F24]">{session.device}</p>
            <p className="text-[10px] md:text-xs text-[#6D6D6D]">{session.browser} • {session.os}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {session.current && (
            <span className="text-[9px] md:text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 md:px-2 py-0.5 rounded-full">
              Actuelle
            </span>
          )}
          <button
            onClick={() => onDisconnect(session.id)}
            className="p-1 md:p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="Déconnecter"
          >
            <LogOut size={12} className="md:w-[14px] md:h-[14px] text-rose-500" />
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] md:text-xs text-[#6D6D6D]">
        <span>IP: {session.ip}</span>
        <span>Ville: {session.city}</span>
        <span className="col-span-2 truncate">Dernière: {session.lastActivity}</span>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: CHANGE PASSWORD MODAL
// ==========================================
const ChangePasswordModal = ({ isOpen, onClose, onChangePassword }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    setPasswordStrength(score);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Mot de passe actuel requis';
    if (!formData.newPassword) newErrors.newPassword = 'Nouveau mot de passe requis';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Minimum 8 caractères';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onChangePassword(formData);
  };

  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-base md:text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Changer le mot de passe
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={18} className="md:w-5 md:h-5 text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-4">
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-1 md:mb-1.5 uppercase tracking-wide">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all pr-10 ${
                  errors.currentPassword ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} className="text-[#6D6D6D]" /> : <Eye size={16} className="text-[#6D6D6D]" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-rose-500 mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-1 md:mb-1.5 uppercase tracking-wide">
              Nouveau mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.newPassword ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F8F7F4] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColors[passwordStrength]} rounded-full transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#6D6D6D]">
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              </div>
            )}
            {errors.newPassword && <p className="text-xs text-rose-500 mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-1 md:mb-1.5 uppercase tracking-wide">
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.confirmPassword ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all"
            >
              Changer le mot de passe
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE - MON PROFIL
// ==========================================
const MyProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  // ⭐ TOUS LES HOOKS SONT À L'INTÉRIEUR DU COMPOSANT
  // États
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [isExporting, setIsExporting] = useState(false);
  
  // ⭐ HOOKS POUR LES DONNÉES DYNAMIQUES (corrigé)
  const [localActiveSessions, setLocalActiveSessions] = useState(initialActiveSessions);
  const [localDocuments, setLocalDocuments] = useState(initialDocuments);

  // Form data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Mohamed',
    lastName: user?.lastName || 'Amine',
    email: user?.email || 'mohamed.amine@larte.com',
    phone: user?.phone || '+212 612 345 678',
    birthDate: user?.birthDate || '01/01/2000',
    gender: user?.gender || 'Homme',
    nationality: user?.nationality || 'Marocaine',
    address: user?.address || '123, Rue Mohamed V',
    city: user?.city || 'Casablanca',
    postalCode: user?.postalCode || '20000',
    country: user?.country || 'Maroc',
    language: user?.language || 'Français',
    timezone: user?.timezone || 'GMT +01:00'
  });

  const [professionalData, setProfessionalData] = useState({
    employeeId: user?.employeeId || 'EMP001',
    department: user?.department || 'Administration',
    position: user?.position || 'Administrator',
    manager: user?.manager || 'Admin',
    hiringDate: user?.hiringDate || '01/01/2025',
    company: user?.company || "L'arte del dolce",
    office: user?.office || 'Casablanca',
    role: user?.role || 'Administrator',
    status: user?.status || 'En ligne',
    lastLogin: '17/07/2026 08:30'
  });

  const [preferences, setPreferences] = useState({
    language: 'Français',
    theme: 'Clair',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: CURRENCY,
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    animations: true,
    compactMode: false
  });

  const [avatar, setAvatar] = useState(user?.avatar || null);

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setPreferences(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setPreferences(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      updateUser({
        ...profileData,
        ...professionalData,
        avatar
      });
      setIsLoading(false);
      setIsEditing(false);
      showToast('✅ Profil mis à jour avec succès', 'success');
    }, 800);
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || 'Mohamed',
      lastName: user?.lastName || 'Amine',
      email: user?.email || 'mohamed.amine@larte.com',
      phone: user?.phone || '+212 612 345 678',
      birthDate: user?.birthDate || '01/01/2000',
      gender: user?.gender || 'Homme',
      nationality: user?.nationality || 'Marocaine',
      address: user?.address || '123, Rue Mohamed V',
      city: user?.city || 'Casablanca',
      postalCode: user?.postalCode || '20000',
      country: user?.country || 'Maroc',
      language: user?.language || 'Français',
      timezone: user?.timezone || 'GMT +01:00'
    });
    setProfessionalData({
      employeeId: user?.employeeId || 'EMP001',
      department: user?.department || 'Administration',
      position: user?.position || 'Administrator',
      manager: user?.manager || 'Admin',
      hiringDate: user?.hiringDate || '01/01/2025',
      company: user?.company || "L'arte del dolce",
      office: user?.office || 'Casablanca',
      role: user?.role || 'Administrator',
      status: user?.status || 'En ligne',
      lastLogin: '17/07/2026 08:30'
    });
    setAvatar(user?.avatar || null);
    setIsEditing(false);
    showToast('🔁 Modifications annulées', 'info');
  };

  const handleAvatarUpload = (file, dataUrl) => {
    setIsUploading(true);
    setTimeout(() => {
      setAvatar(dataUrl);
      setIsUploading(false);
      showToast('📸 Photo de profil mise à jour', 'success');
    }, 800);
  };

  const handleAvatarRemove = () => {
    setAvatar(null);
    showToast('🗑️ Photo de profil supprimée', 'info');
  };

  const handleChangePassword = (data) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPasswordModalOpen(false);
      showToast('🔑 Mot de passe changé avec succès', 'success');
    }, 800);
  };

  const handleDisconnectSession = (sessionId) => {
    setLocalActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('🔒 Session déconnectée avec succès', 'success');
  };

  const handleDisconnectAllSessions = () => {
    setLocalActiveSessions(prev => prev.filter(s => s.current));
    showToast('🔒 Toutes les sessions ont été déconnectées', 'success');
  };

  const handleDeleteDocument = (docId) => {
    setLocalDocuments(prev => prev.filter(d => d.id !== docId));
    showToast('🗑️ Document supprimé avec succès', 'success');
  };

  const handleDownloadDocument = (doc) => {
    showToast(`📥 Téléchargement de "${doc.name}" en cours...`, 'info');
    setTimeout(() => {
      showToast(`✅ "${doc.name}" téléchargé avec succès`, 'success');
    }, 1000);
  };

  const handleViewDocument = (doc) => {
    showToast(`👁️ Visualisation de "${doc.name}"`, 'info');
  };

  const handleAddDocument = () => {
    const newDoc = {
      id: localDocuments.length + 1,
      name: `Document ${localDocuments.length + 1}`,
      type: 'pdf',
      size: '0.5 MB',
      date: new Date().toLocaleDateString('fr-FR'),
      icon: FileTextIcon
    };
    setLocalDocuments(prev => [...prev, newDoc]);
    showToast('📄 Document ajouté avec succès', 'success');
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      window.location.href = '/login';
    }
  };

  // ==========================================
  // EXPORT CONFIGURATION - Activités
  // ==========================================
  const activityColumns = [
    { label: 'Action', accessor: 'action', width: 20 },
    { label: 'Module', accessor: 'module', width: 20 },
    { label: 'Date', accessor: 'date', width: 12 },
    { label: 'Heure', accessor: 'time', width: 10 },
    { label: 'IP', accessor: 'ip', width: 15 },
    { label: 'Appareil', accessor: 'device', width: 15 },
    { label: 'Navigateur', accessor: 'browser', width: 15 }
  ];

  const activityRowFormatter = (item) => ({
    action: item.action,
    module: item.module,
    date: item.date,
    time: item.time,
    ip: item.ip,
    device: item.device,
    browser: item.browser
  });

  // ==========================================
  // EXPORT CONFIGURATION - Sessions
  // ==========================================
  const sessionColumns = [
    { label: 'Appareil', accessor: 'device', width: 20 },
    { label: 'Navigateur', accessor: 'browser', width: 15 },
    { label: 'OS', accessor: 'os', width: 15 },
    { label: 'IP', accessor: 'ip', width: 15 },
    { label: 'Ville', accessor: 'city', width: 12 },
    { label: 'Dernière activité', accessor: 'lastActivity', width: 18 },
    { label: 'Statut', accessor: 'status', width: 10 }
  ];

  const sessionRowFormatter = (item) => ({
    device: item.device,
    browser: item.browser,
    os: item.os,
    ip: item.ip,
    city: item.city,
    lastActivity: item.lastActivity,
    status: item.current ? 'Active (Courante)' : item.status === 'active' ? 'Active' : 'Inactive'
  });

  // ==========================================
  // EXPORT CONFIGURATION - Documents
  // ==========================================
  const documentColumns = [
    { label: 'Nom', accessor: 'name', width: 30 },
    { label: 'Type', accessor: 'type', width: 15 },
    { label: 'Taille', accessor: 'size', width: 15 },
    { label: 'Date', accessor: 'date', width: 15 }
  ];

  const documentRowFormatter = (item) => ({
    name: item.name,
    type: item.type,
    size: item.size,
    date: item.date
  });

  // ==========================================
  // EXPORT CONFIGURATION - Permissions
  // ==========================================
  const permissionColumns = [
    { label: 'Module', accessor: 'module', width: 30 },
    { label: 'Voir', accessor: 'view', width: 15 },
    { label: 'Créer', accessor: 'create', width: 15 },
    { label: 'Modifier', accessor: 'edit', width: 15 },
    { label: 'Supprimer', accessor: 'delete', width: 15 }
  ];

  const permissionRowFormatter = (item) => ({
    module: item.module,
    view: item.view ? '✓' : '✗',
    create: item.create ? '✓' : '✗',
    edit: item.edit ? '✓' : '✗',
    delete: item.delete ? '✓' : '✗'
  });

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ExportButtons
  };

  // Statistiques
  const stats = {
    orders: 56,
    clients: 24,
    products: 118,
    lastLogin: '17/07/2026 08:30',
    avgTime: '12h 45m',
    validatedOrders: 32,
    notifications: 8,
    documents: localDocuments.length
  };

  const activeSessionsCount = localActiveSessions.filter(s => s.status === 'active').length;

  // ==========================================
  // SUMMARY POUR EXPORT
  // ==========================================
  const profileSummary = [
    { label: 'Nom complet', value: `${profileData.firstName} ${profileData.lastName}` },
    { label: 'Email', value: profileData.email },
    { label: 'Téléphone', value: profileData.phone },
    { label: 'Fonction', value: professionalData.position },
    { label: 'Département', value: professionalData.department },
    { label: 'Total commandes', value: stats.orders },
    { label: 'Clients', value: stats.clients },
    { label: 'Produits', value: stats.products },
    { label: 'Documents', value: stats.documents }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-3 md:p-6" style={{ fontFamily: FONT_BODY }}>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Mon Profil
          </h1>
          <p className="text-xs md:text-sm text-[#6D6D6D]">
            Consultez et gérez vos informations personnelles et professionnelles
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={recentActivities}
            columns={activityColumns}
            title="Activités récentes"
            subtitle={`${recentActivities.length} activités - ${profileData.firstName} ${profileData.lastName}`}
            filename={`activites_${new Date().toISOString().split('T')[0]}`}
            summary={profileSummary}
            rowFormatter={activityRowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all text-xs md:text-sm"
            >
              <Edit2 size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Modifier le profil</span>
              <span className="sm:hidden">Modifier</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 text-xs md:text-sm"
              >
                <Save size={16} className="md:w-[18px] md:h-[18px]" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section 1: Profil Card */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <AvatarUpload
            avatar={avatar}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
            isUploading={isUploading}
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-xs md:text-sm text-[#B8863B] font-medium">{professionalData.position}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-2 text-xs md:text-sm text-[#6D6D6D]">
              <span className="flex items-center gap-1">
                <Briefcase size={12} className="md:w-[14px] md:h-[14px]" />
                {professionalData.department}
              </span>
              <span className="flex items-center gap-1">
                <User size={12} className="md:w-[14px] md:h-[14px]" />
                {professionalData.employeeId}
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 inline-block" />
                {professionalData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Informations personnelles */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <h3 className="text-sm md:text-base font-bold text-[#3D2F24] mb-3 md:mb-4" style={{ fontFamily: FONT_HEADING }}>
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Prénom</label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Nom</label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Téléphone</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Date de naissance</label>
            <input
              type="text"
              name="birthDate"
              value={profileData.birthDate}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Genre</label>
            <select
              name="gender"
              value={profileData.gender}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            >
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Nationalité</label>
            <input
              type="text"
              name="nationality"
              value={profileData.nationality}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Adresse</label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Ville</label>
            <input
              type="text"
              name="city"
              value={profileData.city}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Code Postal</label>
            <input
              type="text"
              name="postalCode"
              value={profileData.postalCode}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Pays</label>
            <input
              type="text"
              name="country"
              value={profileData.country}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Langue</label>
            <select
              name="language"
              value={profileData.language}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            >
              <option value="Français">Français</option>
              <option value="English">English</option>
              <option value="العربية">العربية</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Fuseau horaire</label>
            <input
              type="text"
              name="timezone"
              value={profileData.timezone}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                isEditing ? 'border-[#ECE8E1]' : 'bg-[#F8F7F4] border-transparent'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Informations professionnelles */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <h3 className="text-sm md:text-base font-bold text-[#3D2F24] mb-3 md:mb-4" style={{ fontFamily: FONT_HEADING }}>
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Matricule</label>
            <input
              type="text"
              value={professionalData.employeeId}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Département</label>
            <input
              type="text"
              value={professionalData.department}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Fonction</label>
            <input
              type="text"
              value={professionalData.position}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Manager</label>
            <input
              type="text"
              value={professionalData.manager}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Date d'embauche</label>
            <input
              type="text"
              value={professionalData.hiringDate}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Entreprise</label>
            <input
              type="text"
              value={professionalData.company}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Bureau</label>
            <input
              type="text"
              value={professionalData.office}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Rôle</label>
            <input
              type="text"
              value={professionalData.role}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Dernière connexion</label>
            <input
              type="text"
              value={professionalData.lastLogin}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Sécurité */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <h3 className="text-sm md:text-base font-bold text-[#3D2F24] mb-3 md:mb-4" style={{ fontFamily: FONT_HEADING }}>
          Sécurité du compte
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-blue-50 text-blue-600">
                <Lock size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-[#3D2F24]">Mot de passe</p>
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">••••••••</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
              >
                Changer
              </button>
            </div>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-purple-50 text-purple-600">
                <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-[#3D2F24]">Authentification à deux facteurs</p>
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">Désactivé</p>
              </div>
              <button
                onClick={() => showToast('🔐 2FA activé avec succès', 'success')}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
              >
                Activer
              </button>
            </div>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-amber-50 text-amber-600">
                <LogOutIcon size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-[#3D2F24]">Sessions actives</p>
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">{activeSessionsCount} appareils</p>
              </div>
              <button
                onClick={handleDisconnectAllSessions}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Tout déconnecter
              </button>
            </div>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-rose-50 text-rose-600">
                <LogOutIcon size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-[#3D2F24]">Déconnexion</p>
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">Quitter votre session</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Préférences */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <h3 className="text-sm md:text-base font-bold text-[#3D2F24] mb-3 md:mb-4" style={{ fontFamily: FONT_HEADING }}>
          Préférences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Langue</label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="Français">Français</option>
              <option value="English">English</option>
              <option value="العربية">العربية</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Thème</label>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="Clair">Clair</option>
              <option value="Sombre">Sombre</option>
              <option value="Système">Système</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Devise</label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="SAR">SAR</option>
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Format date</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Format heure</label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="24h">24h</option>
              <option value="12h">12h</option>
            </select>
          </div>
          <div className="space-y-1 md:space-y-2">
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Notifications</label>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <label className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-[#6D6D6D]">
                <input
                  type="checkbox"
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications.email', e.target.checked)}
                  className="rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]"
                />
                Email
              </label>
              <label className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-[#6D6D6D]">
                <input
                  type="checkbox"
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications.push', e.target.checked)}
                  className="rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]"
                />
                Push
              </label>
              <label className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-[#6D6D6D]">
                <input
                  type="checkbox"
                  checked={preferences.notifications.sms}
                  onChange={(e) => handlePreferenceChange('notifications.sms', e.target.checked)}
                  className="rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]"
                />
                SMS
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <label className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-[#6D6D6D]">
              <input
                type="checkbox"
                checked={preferences.animations}
                onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                className="rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]"
              />
              Animations
            </label>
            <label className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-[#6D6D6D]">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
                className="rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]"
              />
              Mode compact
            </label>
          </div>
        </div>
      </div>

      {/* Section 6: Activité récente */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-sm md:text-base font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Activité récente
          </h3>
          <button 
            onClick={() => showToast('📋 Toutes les activités affichées', 'info')}
            className="text-[10px] md:text-xs font-medium text-[#B8863B] hover:text-[#A07532] transition-colors"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-1 max-h-48 md:max-h-64 overflow-y-auto">
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Section 7: Sessions actives */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-sm md:text-base font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Sessions actives
          </h3>
          <button
            onClick={handleDisconnectAllSessions}
            className="text-[10px] md:text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            Déconnecter tout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {localActiveSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDisconnect={handleDisconnectSession}
            />
          ))}
        </div>
      </div>

      {/* Section 8: Documents personnels */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-sm md:text-base font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Documents personnels
          </h3>
          <button
            onClick={handleAddDocument}
            className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-[#B8863B] hover:text-[#A07532] transition-colors"
          >
            <Plus size={12} className="md:w-[14px] md:h-[14px]" />
            Ajouter
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {localDocuments.map((doc) => {
            const Icon = doc.icon;
            return (
              <div key={doc.id} className="bg-[#F8F7F4] rounded-xl p-3 md:p-4 text-center hover:shadow-md transition-all">
                <div className="flex justify-center mb-1 md:mb-2">
                  <Icon size={24} className="md:w-8 md:h-8 text-[#6D6D6D]" />
                </div>
                <p className="text-[10px] md:text-xs font-medium text-[#3D2F24] truncate">{doc.name}</p>
                <p className="text-[9px] md:text-[10px] text-[#6D6D6D]">{doc.size}</p>
                <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2">
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye size={12} className="md:w-[14px] md:h-[14px] text-[#6D6D6D]" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download size={12} className="md:w-[14px] md:h-[14px] text-[#6D6D6D]" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={12} className="md:w-[14px] md:h-[14px] text-rose-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 9: Permissions */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
        <h3 className="text-sm md:text-base font-bold text-[#3D2F24] mb-3 md:mb-4" style={{ fontFamily: FONT_HEADING }}>
          Aperçu des permissions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
              <tr>
                <th className="px-2 md:px-4 py-2 text-left text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Module</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Voir</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Créer</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Modifier</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Supprimer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {permissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-2 md:px-4 py-2 text-[10px] md:text-sm font-medium text-[#3D2F24]">{perm.module}</td>
                  <td className="px-2 md:px-4 py-2 text-center">
                    {perm.view ? <CheckCircle size={12} className="md:w-4 md:h-4 text-emerald-500 mx-auto" /> : <XCircle size={12} className="md:w-4 md:h-4 text-rose-500 mx-auto" />}
                  </td>
                  <td className="px-2 md:px-4 py-2 text-center">
                    {perm.create ? <CheckCircle size={12} className="md:w-4 md:h-4 text-emerald-500 mx-auto" /> : <XCircle size={12} className="md:w-4 md:h-4 text-rose-500 mx-auto" />}
                  </td>
                  <td className="px-2 md:px-4 py-2 text-center">
                    {perm.edit ? <CheckCircle size={12} className="md:w-4 md:h-4 text-emerald-500 mx-auto" /> : <XCircle size={12} className="md:w-4 md:h-4 text-rose-500 mx-auto" />}
                  </td>
                  <td className="px-2 md:px-4 py-2 text-center">
                    {perm.delete ? <CheckCircle size={12} className="md:w-4 md:h-4 text-emerald-500 mx-auto" /> : <XCircle size={12} className="md:w-4 md:h-4 text-rose-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 10: Statistiques personnelles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3 mb-4 md:mb-6">
        <StatCard icon={ClipboardList} title="Commandes" value={stats.orders} color="blue" />
        <StatCard icon={Users} title="Clients" value={stats.clients} color="green" />
        <StatCard icon={Package} title="Produits" value={stats.products} color="purple" />
        <StatCard icon={LogOutIcon} title="Dernière connexion" value="08:30" color="amber" subtitle="17/07/2026" />
        <StatCard icon={Clock} title="Temps moyen" value={stats.avgTime} color="indigo" />
        <StatCard icon={CheckCircle} title="Validées" value={stats.validatedOrders} color="emerald" />
        <StatCard icon={Bell} title="Notifications" value={stats.notifications} color="rose" />
        <StatCard icon={Upload} title="Documents" value={stats.documents} color="cyan" />
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onChangePassword={handleChangePassword}
        />
      </AnimatePresence>

      {/* Footer */}
      <div className="text-center py-3 md:py-4">
        <p className="text-[10px] md:text-xs text-[#6D6D6D]">
          © 2026 L'arte del dolce ERP. Tous droits réservés.
          <br className="sm:hidden" />
          Version 2.1.0
        </p>
      </div>
    </div>
  );
};

export default MyProfilePage;