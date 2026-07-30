// src/pages/MyProfile/MyProfilePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ Ajout
import {
  User, Mail, Phone, Calendar, MapPin, Globe, Clock,
  Building, Briefcase, Shield, Lock, Key, Eye, EyeOff,
  CheckCircle, XCircle, AlertCircle, Info, Upload, Trash2,
  Edit2, Save, X, Plus, Download, LogOut, Smartphone, Monitor,
  Laptop, Activity, Bell, BellOff, BellRing, MessageSquare,
  ShieldCheck, Camera, FileText as FileTextIcon, Users, Package,
  ClipboardList, CreditCard, DollarSign, BarChart3, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  updatePreferences,
  getActivityLog,
  getSessions,
  revokeSession,
  revokeAllSessions,
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  getPermissions,
  getUserStats,
  updateTwoFactorAuth,
} from '../../services/userService';
import {
  unwrapData,
  toArray,
  normalizeProfilePermissions,
  formatUserStatus,
} from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';

// ==========================================
// COMPOSANT: TOAST
// ==========================================
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
  const { t, tc } = usePageI18n('profile');
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
// COMPOSANT: ACTIVITY ITEM
// ==========================================
const ActivityItem = ({ activity }) => {
  const typeConfig = {
    login: { icon: LogOut, color: 'bg-blue-50 text-blue-600' },
    update: { icon: Edit2, color: 'bg-amber-50 text-amber-600' },
    password: { icon: Lock, color: 'bg-rose-50 text-rose-600' },
    photo: { icon: Image, color: 'bg-purple-50 text-purple-600' },
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
  const { t, tc } = usePageI18n('profile');
  return (
    <div className={`bg-white border rounded-xl p-3 md:p-4 ${session.current ? 'border-[#B8863B] bg-[#FDFBF7]' : 'border-[#ECE8E1]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-xl bg-[#F8F7F4]">
            {session.device?.includes('Windows') && <Monitor size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device?.includes('Mac') && <Laptop size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device?.includes('iPhone') && <Smartphone size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
            {session.device?.includes('Android') && <Smartphone size={16} className="md:w-[18px] md:h-[18px] text-[#6D6D6D]" />}
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-[#3D2F24]">{session.device || 'Appareil inconnu'}</p>
            <p className="text-[10px] md:text-xs text-[#6D6D6D]">{session.browser || '—'} • {session.os || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {session.current && (
            <span className="text-[9px] md:text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 md:px-2 py-0.5 rounded-full">
              Actuelle
            </span>
          )}
          {!session.current && (
            <button
              onClick={() => onDisconnect(session.id)}
              className="p-1 md:p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
              title="Déconnecter"
            >
              <LogOut size={12} className="md:w-[14px] md:h-[14px] text-rose-500" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] md:text-xs text-[#6D6D6D]">
        <span>IP: {session.ip || '—'}</span>
        <span>Ville: {session.city || '—'}</span>
        <span className="col-span-2 truncate">Dernière: {session.lastActivity || session.created_at || '—'}</span>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: CHANGE PASSWORD MODAL
// ==========================================
const ChangePasswordModal = ({ isOpen, onClose, onChangePassword, isLoading }) => {
  const { t, tc } = usePageI18n('profile');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    newPassword_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
  const { t, tc } = usePageI18n('profile');
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
    else if (formData.newPassword.length < 8) newErrors.newPassword = t('profile.validation.minPassword');
    if (formData.newPassword !== formData.newPassword_confirmation) {
      newErrors.newPassword_confirmation = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onChangePassword(formData);
  };

  const strengthLabels = ['Très faible', t('orders.priority.low'), 'Moyen', 'Fort', 'Très fort'];
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
              name="newPassword_confirmation"
              value={formData.newPassword_confirmation}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.newPassword_confirmation ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.newPassword_confirmation && <p className="text-xs text-rose-500 mt-1">{errors.newPassword_confirmation}</p>}
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
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Changement...' : 'Changer le mot de passe'}
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
  const navigate = useNavigate();
  const { title, subtitle, t, tc, actions, commonStatus } = usePageI18n('profile');

  // États
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Données du profil
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    language: t('common.languages.ar'),
    timezone: 'GMT +01:00'
  });

  const [professionalData, setProfessionalData] = useState({
    employeeId: '',
    department: '',
    position: '',
    manager: '',
    hiringDate: '',
    company: '',
    office: '',
    role: '',
    status: tc('online'),
    lastLogin: ''
  });

  const [preferences, setPreferences] = useState({
    language: t('common.languages.ar'),
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

  const [avatar, setAvatar] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [permissionsData, setPermissionsData] = useState([]);
  const [stats, setStats] = useState({
    orders: 0,
    clients: 0,
    products: 0,
    lastLogin: '',
    avgTime: '0h',
    validatedOrders: 0,
    notifications: 0,
    documents: 0
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Gestion d'erreur Axios
  const handleApiError = (error, defaultMessage = t('common.error')) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 422) {
        // Erreur de validation
        const errors = data.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || t('errors.invalidData');
        showToast(firstError, 'error');
        return firstError;
      } else if (status === 401) {
        showToast('Session expirée. Veuillez vous reconnecter.', 'error');
        return t('errors.unauthorized');
      } else if (status === 403) {
        showToast('Vous n\'avez pas les permissions nécessaires.', 'error');
        return t('errors.forbidden');
      } else if (status === 404) {
        showToast('Ressource non trouvée.', 'error');
        return t('errors.notFound');
      } else if (status === 500) {
        showToast(t('errors.serverError'), 'error');
        return t('errors.serverError');
      }
      
      showToast(data.message || defaultMessage, 'error');
      return data.message || defaultMessage;
    } else if (error.request) {
      showToast('Impossible de contacter le serveur.', 'error');
      return t('errors.networkError');
    } else {
      showToast(defaultMessage, 'error');
      return defaultMessage;
    }
  };

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await getProfile();
      const profilePayload = unwrapData(profileRes) || {};
      const userData = profilePayload.user || profilePayload || user || {};
      
      setProfileData({
        firstName: userData.first_name || userData.firstName || user?.firstName || '',
        lastName: userData.last_name || userData.lastName || user?.lastName || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || user?.phone || '',
        birthDate: userData.birth_date || userData.birthDate || '',
        gender: userData.gender || '',
        nationality: userData.nationality || '',
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postal_code || userData.postalCode || '',
        country: userData.country || '',
        language: userData.language || t('common.languages.ar'),
        timezone: userData.timezone || 'GMT +01:00'
      });

      setProfessionalData({
        employeeId: userData.employee_id || userData.employeeId || '—',
        department: userData.department || '—',
        position: userData.position || user?.role?.display_name || '—',
        manager: userData.manager || '—',
        hiringDate: userData.hiring_date || userData.hiringDate || '—',
        company: userData.company || "L'arte del dolce",
        office: userData.office || '—',
        role: userData.role?.display_name || userData.role?.name || userData.role || '—',
        status: userData.status || user?.status || 'offline',
        lastLogin: userData.last_login_at 
          ? new Date(userData.last_login_at).toLocaleString(DATE_LOCALE) 
          : '—'
      });

      setAvatar(userData.avatar || user?.avatar || null);
      setTwoFactorEnabled(Boolean(userData.two_factor_enabled));

      // Préférences
      if (userData.preferences) {
        setPreferences(prev => ({
          ...prev,
          ...userData.preferences,
          notifications: {
            ...prev.notifications,
            ...(userData.preferences.notifications || {})
          }
        }));
      }

      // Activités
      try {
        const activityRes = await getActivityLog({ per_page: 8 });
        setActivityLog(toArray(activityRes));
      } catch (e) {
        console.warn('Could not load activities:', e);
        setActivityLog([]);
      }

      // Sessions
      try {
        const sessionsRes = await getSessions();
        setSessions(toArray(sessionsRes));
      } catch (e) {
        console.warn('Could not load sessions:', e);
        setSessions([]);
      }

      // Documents
      try {
        const docsRes = await getDocuments();
        setDocuments(toArray(docsRes));
      } catch (e) {
        console.warn('Could not load documents:', e);
        setDocuments([]);
      }

      // Permissions
      try {
        const permsRes = await getPermissions();
        setPermissionsData(normalizeProfilePermissions(permsRes));
      } catch (e) {
        console.warn('Could not load permissions:', e);
        setPermissionsData([]);
      }

      // Statistiques
      try {
        const statsRes = await getUserStats();
        const statsData = unwrapData(statsRes) || {};
        setStats({
          orders: statsData.orders ?? statsData.activity_count ?? 0,
          clients: statsData.clients ?? 0,
          products: statsData.products ?? 0,
          lastLogin: statsData.last_login || statsData.last_login_at || '',
          avgTime: statsData.avg_time || statsData.avgTime || '0h',
          validatedOrders: statsData.validated_orders || statsData.validatedOrders || 0,
          notifications: statsData.notifications ?? statsData.session_count ?? 0,
          documents: statsData.documents ?? 0
        });
      } catch (e) {
        console.warn('Could not load stats:', e);
      }

    } catch (error) {
      handleApiError(error, 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // ==========================================
  // HANDLERS
  // ==========================================

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        birth_date: profileData.birthDate,
        gender: profileData.gender,
        nationality: profileData.nationality,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode,
        country: profileData.country,
        language: profileData.language,
        timezone: profileData.timezone
      };
      
      const profileRes = await updateProfile(data);
      const updatedPayload = unwrapData(profileRes) || {};
      const updatedUser = updatedPayload.user || updatedPayload;
      if (updatedUser && typeof updatedUser === 'object') {
        updateUser(updatedUser);
      }
      
      // Enregistrer les préférences
      await updatePreferences({
        language: preferences.language,
        theme: preferences.theme,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
        notifications: preferences.notifications,
        animations: preferences.animations,
        compactMode: preferences.compactMode
      });

      setIsEditing(false);
      showToast('✅ Profil mis à jour avec succès', 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors de l\'enregistrement du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfileData();
    setIsEditing(false);
    showToast('🔁 Modifications annulées', 'info');
  };

  const handleAvatarUpload = async (file, dataUrl) => {
    setIsUploading(true);
    try {
      await uploadAvatar(file);
      setAvatar(dataUrl);
      showToast('📸 Photo de profil mise à jour', 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
      setAvatar(null);
      showToast('🗑️ Photo de profil supprimée', 'info');
    } catch (error) {
      handleApiError(error, 'Erreur lors de la suppression de la photo');
    }
  };

  const handleChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data);
      setIsPasswordModalOpen(false);
      showToast('🔑 Mot de passe changé avec succès', 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDisconnectSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      const sessionsRes = await getSessions();
      setSessions(toArray(sessionsRes));
      showToast('🔒 Session déconnectée avec succès', 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors de la déconnexion de la session');
    }
  };

  // ✅ Fonction avec confirmation
  const handleDisconnectAllSessions = () => {
    if (window.confirm('Êtes-vous sûr de vouloir déconnecter toutes vos sessions actives ?')) {
      setIsLoadingSessions(true);
      revokeAllSessions()
        .then(async () => {
          const sessionsRes = await getSessions();
          setSessions(toArray(sessionsRes));
          showToast('🔒 Toutes les sessions ont été déconnectées', 'success');
        })
        .catch((error) => {
          handleApiError(error, 'Erreur lors de la déconnexion des sessions');
        })
        .finally(() => {
          setIsLoadingSessions(false);
        });
    }
  };

  // ✅ Fonction pour voir toutes les activités
  const handleViewAllActivities = () => {
    navigate('/dashboard/activity-logs');
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(docId);
      const docsRes = await getDocuments();
      setDocuments(toArray(docsRes));
      showToast('🗑️ Document supprimé avec succès', 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors de la suppression du document');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`📥 "${doc.name}" téléchargé avec succès`, 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors du téléchargement');
    }
  };

  const handleAddDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,.doc,.docx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await uploadDocument(file, file.name, file.type);
          const docsRes = await getDocuments();
          setDocuments(toArray(docsRes));
          showToast('📄 Document ajouté avec succès', 'success');
        } catch (error) {
          handleApiError(error, 'Erreur lors de l\'ajout du document');
        }
      }
    };
    input.click();
  };

  const handleToggle2FA = async () => {
    try {
      await updateTwoFactorAuth({ enabled: !twoFactorEnabled, method: 'app' });
      setTwoFactorEnabled(!twoFactorEnabled);
      showToast(`🔐 2FA ${!twoFactorEnabled ? 'activé' : 'désactivé'} avec succès`, 'success');
    } catch (error) {
      handleApiError(error, 'Erreur lors du changement de 2FA');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      window.location.href = '/login';
    }
  };

  // ==========================================
  // EXPORT CONFIGURATION
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

  const profileSummary = [
    { label: 'Nom complet', value: `${profileData.firstName} ${profileData.lastName}` },
    { label: 'Email', value: profileData.email },
    { label: tc('phone'), value: profileData.phone },
    { label: 'Fonction', value: professionalData.position || '—' },
    { label: tc('department'), value: professionalData.department || '—' },
    { label: t('orders.kpi.total'), value: stats.orders },
    { label: 'Clients', value: stats.clients },
    { label: 'Produits', value: stats.products },
    { label: 'Documents', value: stats.documents }
  ];

  const handleExportSuccess = () => {
    showToast(tc('exportSuccess', { type: 'PDF', count: 0 }), 'success');
  };

  const handleExportError = () => {
    showToast('Erreur lors de l\'export', 'error');
  };

  const activeSessionsCount = (Array.isArray(sessions) ? sessions : []).filter(
    (s) => s?.status === 'active' || s?.current
  ).length;

  const userStatus = formatUserStatus(professionalData.status);
  const statusToneClasses = {
    positive: 'text-emerald-600',
    warning: 'text-amber-600',
    negative: 'text-rose-600',
    neutral: 'text-[#6D6D6D]',
  };
  const statusDotClasses = {
    positive: 'bg-emerald-500',
    warning: 'bg-amber-500',
    negative: 'bg-rose-500',
    neutral: 'bg-gray-400',
  };
  const safeActivityLog = Array.isArray(activityLog) ? activityLog : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safePermissionsData = Array.isArray(permissionsData) ? permissionsData : [];

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F4] p-3 md:p-6 flex items-center justify-center" style={{ fontFamily: FONT_BODY }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#B8863B] border-t-transparent mb-3" />
          <p className="text-sm text-[#6D6D6D]">Chargement du profil...</p>
        </div>
      </div>
    );
  }

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
          <ExportButtons
            data={safeActivityLog}
            columns={activityColumns}
            title="Activités récentes"
            subtitle={`${safeActivityLog.length} activités - ${profileData.firstName} ${profileData.lastName}`}
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
              <span className="sm:hidden">{tc('edit')}</span>
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
                disabled={isSaving}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 text-xs md:text-sm"
              >
                <Save size={16} className="md:w-[18px] md:h-[18px]" />
                {isSaving ? tc('saving') : tc('save')}
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
            <p className="text-xs md:text-sm text-[#B8863B] font-medium">{professionalData.position || '—'}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-2 text-xs md:text-sm text-[#6D6D6D]">
              <span className="flex items-center gap-1">
                <Briefcase size={12} className="md:w-[14px] md:h-[14px]" />
                {professionalData.department || '—'}
              </span>
              <span className="flex items-center gap-1">
                <User size={12} className="md:w-[14px] md:h-[14px]" />
                {professionalData.employeeId || '—'}
              </span>
              <span className={`flex items-center gap-1 ${statusToneClasses[userStatus.tone]}`}>
                <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full inline-block ${statusDotClasses[userStatus.tone]}`} />
                {userStatus.label}
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
          {/* ... mêmes champs ... */}
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
              <option value="">{tc('selectOption')}</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          {/* ... suite des champs ... */}
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
              value={professionalData.employeeId || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Département</label>
            <input
              type="text"
              value={professionalData.department || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Fonction</label>
            <input
              type="text"
              value={professionalData.position || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Manager</label>
            <input
              type="text"
              value={professionalData.manager || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Date d'embauche</label>
            <input
              type="text"
              value={professionalData.hiringDate || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Entreprise</label>
            <input
              type="text"
              value={professionalData.company || "L'arte del dolce"}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Bureau</label>
            <input
              type="text"
              value={professionalData.office || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Rôle</label>
            <input
              type="text"
              value={professionalData.role || '—'}
              disabled
              className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border-transparent rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-[#6D6D6D] mb-0.5 md:mb-1 uppercase tracking-wide">Dernière connexion</label>
            <input
              type="text"
              value={professionalData.lastLogin || '—'}
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
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">{twoFactorEnabled ? tc('active') : tc('inactive')}</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
              >
                {twoFactorEnabled ? tc('deactivate') : tc('activate')}
              </button>
            </div>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-amber-50 text-amber-600">
                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-[#3D2F24]">Sessions actives</p>
                <p className="text-[10px] md:text-xs text-[#6D6D6D]">{activeSessionsCount} appareils</p>
              </div>
              <button
                onClick={handleDisconnectAllSessions}
                disabled={isLoadingSessions}
                className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingSessions ? '...' : t('profile.sessions.disconnectAll')}
              </button>
            </div>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-rose-50 text-rose-600">
                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
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
          {/* ✅ Voir tout - Navigation réelle */}
          <button 
            onClick={handleViewAllActivities}
            className="text-[10px] md:text-xs font-medium text-[#B8863B] hover:text-[#A07532] transition-colors"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-1 max-h-48 md:max-h-64 overflow-y-auto">
          {safeActivityLog.length === 0 ? (
            <div className="text-center py-4 text-[#6D6D6D] text-sm">
              Aucune activité récente
            </div>
          ) : (
            safeActivityLog.slice(0, 8).map((activity) => (
              <ActivityItem key={activity.id || activity.created_at} activity={activity} />
            ))
          )}
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
            disabled={isLoadingSessions}
            className="text-[10px] md:text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoadingSessions ? 'Déconnexion...' : 'Déconnecter tout'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {safeSessions.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-[#6D6D6D] text-sm">
              Aucune session active
            </div>
          ) : (
            safeSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDisconnect={handleDisconnectSession}
              />
            ))
          )}
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
          {safeDocuments.length === 0 ? (
            <div className="col-span-4 text-center py-4 text-[#6D6D6D] text-sm">
              Aucun document
            </div>
          ) : (
            safeDocuments.map((doc) => (
              <div key={doc.id} className="bg-[#F8F7F4] rounded-xl p-3 md:p-4 text-center hover:shadow-md transition-all">
                <div className="flex justify-center mb-1 md:mb-2">
                  <FileTextIcon size={24} className="md:w-8 md:h-8 text-[#6D6D6D]" />
                </div>
                <p className="text-[10px] md:text-xs font-medium text-[#3D2F24] truncate">{doc.name}</p>
                <p className="text-[9px] md:text-[10px] text-[#6D6D6D]">{doc.size}</p>
                <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2">
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
                    title={actions.delete}
                  >
                    <Trash2 size={12} className="md:w-[14px] md:h-[14px] text-rose-500" />
                  </button>
                </div>
              </div>
            ))
          )}
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
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('create')}</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('edit')}</th>
                <th className="px-2 md:px-4 py-2 text-center text-[9px] md:text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('delete')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {safePermissionsData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-[#6D6D6D]">Aucune permission</td>
                </tr>
              ) : (
                safePermissionsData.map((perm, idx) => (
                  <tr key={perm.module || idx} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="px-2 md:px-4 py-2 text-[10px] md:text-sm font-medium text-[#3D2F24]">{perm?.module ?? '—'}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 10: Statistiques personnelles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3 mb-4 md:mb-6">
        <StatCard icon={ClipboardList} title="Commandes" value={stats.orders} color="blue" />
        <StatCard icon={Users} title="Clients" value={stats.clients} color="green" />
        <StatCard icon={Package} title="Produits" value={stats.products} color="purple" />
        <StatCard icon={LogOut} title="Dernière connexion" value={stats.lastLogin?.split(' ')[1] || '08:30'} color="amber" subtitle={stats.lastLogin?.split(' ')[0] || '—'} />
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
          isLoading={isChangingPassword}
        />
      </AnimatePresence>

     
    </div>
  );
};

export default MyProfilePage;