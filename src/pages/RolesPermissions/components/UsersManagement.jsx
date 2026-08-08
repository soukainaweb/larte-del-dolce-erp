// src/pages/RolesPermissions/components/UsersManagement.jsx
// NOTE: User account creation is handled exclusively on /dashboard/users.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Shield,
  Key,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Edit2,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  MoreVertical,
  UserPlus,
  UserCheck,
  UserMinus,
  Settings,
  Award,
  BadgeCheck,
  ShieldCheck,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Save,
  RotateCcw
} from 'lucide-react';
import { getRoles } from '../../../services/roleService';
import { usePageI18n } from '../../../hooks/usePageI18n';
import { normalizeRoleList, ensureArray } from '../../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// COLOR SYSTEM
// ==========================================
const COLORS = {
  primary: '#C8A45D',
  primaryDark: '#B08A4A',
  primaryLight: '#F5EDE0',
  background: '#F8F7F4',
  white: '#FFFFFF',
  text: '#2B2B2B',
  textSecondary: '#7A7A7A',
  border: '#EAE6DF',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  shadow: '0 4px 20px rgba(0,0,0,0.06)',
  shadowHover: '0 8px 30px rgba(0,0,0,0.10)'
};

// ==========================================
// TOAST NOTIFICATION
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
      className={`fixed top-4 right-4 z-toast flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
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
// USER CARD
// ==========================================
const UserCard = ({ user, onView, onEdit, onRemove, role }) => {
  const { t, tc, commonStatus } = usePageI18n('roles');

  const statusColors = {
    active: commonStatus.active.class,
    inactive: commonStatus.inactive.class
  };

  const statusLabels = {
    active: commonStatus.active.label,
    inactive: commonStatus.inactive.label
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: COLORS.shadowHover }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Header avec avatar et statut */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C8A45D] to-[#B08A4A] flex items-center justify-center text-white text-xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
              user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2B2B2B]">{user.name}</h4>
            <p className="text-xs text-[#7A7A7A]">{user.email}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[user.status] || statusColors.inactive}`}>
          {statusLabels[user.status] || commonStatus.inactive.label}
        </span>
      </div>

      {/* Informations */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#F8F7F4] rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[#7A7A7A]">
            <Briefcase size={12} />
            <span>{t('roles.usersManagement.department')}</span>
          </div>
          <p className="font-medium text-[#2B2B2B] mt-0.5">{user.department}</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[#7A7A7A]">
            <Building size={12} />
            <span>{t('roles.usersManagement.position')}</span>
          </div>
          <p className="font-medium text-[#2B2B2B] mt-0.5">{user.position}</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[#7A7A7A]">
            <Shield size={12} />
            <span>{t('roles.usersManagement.role')}</span>
          </div>
          <p className="font-medium text-[#2B2B2B] mt-0.5">{user.role || role?.name || '—'}</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[#7A7A7A]">
            <Clock size={12} />
            <span>{t('roles.usersManagement.lastLogin')}</span>
          </div>
          <p className="font-medium text-[#2B2B2B] mt-0.5">{user.lastLogin}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-end gap-1.5">
        <button
          onClick={() => onView(user)}
          className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
          title={t('roles.usersManagement.viewProfile')}
        >
          <Eye size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
        </button>
        <button
          onClick={() => onEdit(user)}
          className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
          title={tc('edit')}
        >
          <Edit2 size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
        </button>
        <button
          onClick={() => onRemove(user)}
          className="p-2 rounded-xl hover:bg-rose-50 transition-colors group"
          title={t('roles.usersManagement.removeFromRole')}
        >
          <UserX size={16} className="text-[#7A7A7A] group-hover:text-rose-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  );
};

// ==========================================
// VIEW USER DRAWER
// ==========================================
const ViewUserDrawer = ({ isOpen, onClose, user, role }) => {
  const { t, tc, commonStatus } = usePageI18n('roles');

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-modal flex">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="flex-1 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: FONT_HEADING }}>
            {t('roles.usersManagement.userDetails')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors"
          >
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar et nom */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C8A45D] to-[#B08A4A] flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#2B2B2B]">{user.name}</h4>
              <p className="text-sm text-[#7A7A7A]">{user.email}</p>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Briefcase size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.department')}</p>
                <p className="font-medium text-[#2B2B2B]">{user.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Building size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.position')}</p>
                <p className="font-medium text-[#2B2B2B]">{user.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Shield size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.role')}</p>
                <p className="font-medium text-[#2B2B2B]">{user.role || role?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Calendar size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.assignedDate')}</p>
                <p className="font-medium text-[#2B2B2B]">{user.assignedDate || '17/07/2026'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Clock size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.lastLogin')}</p>
                <p className="font-medium text-[#2B2B2B]">{user.lastLogin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <BadgeCheck size={16} className="text-[#7A7A7A]" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A7A]">{t('roles.usersManagement.status')}</p>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  user.status === 'active' ? commonStatus.active.class : commonStatus.inactive.class
                }`}>
                  {user.status === 'active' ? commonStatus.active.label : commonStatus.inactive.label}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-[#2B2B2B] mb-2">{t('roles.usersManagement.permissions')}</h5>
              <div className="bg-[#F8F7F4] rounded-xl p-3">
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((perm, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-white px-2.5 py-1 rounded-full border border-[#EAE6DF]">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-xl hover:shadow-lg transition-all"
          >
            {tc('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// EDIT USER MODAL
// ==========================================
const EditUserModal = ({ isOpen, onClose, onSave, user, role, roles, isLoading }) => {
  const { t, tc } = usePageI18n('roles');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    department: '',
    position: '',
    status: 'active',
    assignedDate: '',
    permissions: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        roleId: user.roleId || role?.id || '',
        department: user.department || '',
        position: user.position || '',
        status: user.status || 'active',
        assignedDate: user.assignedDate || new Date().toLocaleDateString('ar-SA'),
        permissions: user.permissions || [],
        notes: user.notes || ''
      });
    }
  }, [user, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = t('roles.usersManagement.nameRequired');
    if (!formData.email) newErrors.email = t('roles.usersManagement.emailRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: FONT_HEADING }}>
            {t('roles.usersManagement.editUser')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{tc('name')} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all ${
                errors.name ? 'border-rose-500' : 'border-[#EAE6DF]'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{tc('email')} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all ${
                errors.email ? 'border-rose-500' : 'border-[#EAE6DF]'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.department')}</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.position')}</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.role')}</label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.status')}</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
              >
                <option value="active">{tc('active')}</option>
                <option value="inactive">{tc('inactive')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.assignedDate')}</label>
            <input
              type="text"
              name="assignedDate"
              value={formData.assignedDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#EAE6DF]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? t('roles.usersManagement.saving') : tc('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// ADD USER MODAL
// ==========================================
const AddUserModal = ({ isOpen, onClose, onAdd, roles, isLoading }) => {
  const { t, tc } = usePageI18n('roles');
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
    assignedDate: '',
    status: 'active',
    permissions: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [availableUsers] = useState([
    { id: 8, name: 'Fatima El Haddad', email: 'fatima@lartedolce.com', department: 'Marketing' },
    { id: 9, name: 'Omar Rachidi', email: 'omar@lartedolce.com', department: 'RH' },
    { id: 10, name: 'Layla Tazi', email: 'layla@lartedolce.com', department: 'Logistique' }
  ]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: '',
        roleId: roles[0]?.id || '',
        assignedDate: new Date().toLocaleDateString('ar-SA'),
        status: 'active',
        permissions: [],
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.userId) newErrors.userId = t('roles.usersManagement.userRequired');
    if (!formData.roleId) newErrors.roleId = t('roles.usersManagement.roleRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const selectedUser = availableUsers.find(u => u.id === parseInt(formData.userId));
    onAdd({
      ...formData,
      name: selectedUser?.name,
      email: selectedUser?.email,
      department: selectedUser?.department
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: FONT_HEADING }}>
            {t('roles.usersManagement.addUser')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('nav.users')} *</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all ${
                errors.userId ? 'border-rose-500' : 'border-[#EAE6DF]'
              }`}
            >
              <option value="">{t('roles.usersManagement.selectUser')}</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} - {u.email}</option>
              ))}
            </select>
            {errors.userId && <p className="text-xs text-rose-500 mt-1">{errors.userId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.role')} *</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all ${
                errors.roleId ? 'border-rose-500' : 'border-[#EAE6DF]'
              }`}
            >
              <option value="">{t('roles.usersManagement.selectRole')}</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-xs text-rose-500 mt-1">{errors.roleId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.assignedDate')}</label>
            <input
              type="text"
              name="assignedDate"
              value={formData.assignedDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            >
              <option value="active">{tc('active')}</option>
              <option value="inactive">{tc('inactive')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.usersManagement.notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#EAE6DF]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? t('roles.usersManagement.adding') : tc('add')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// CONFIRM DELETE MODAL
// ==========================================
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmText, isLoading }) => {
  const { t, tc } = usePageI18n('roles');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-center w-14 h-14 mx-auto bg-rose-50 rounded-full mb-4">
          <UserX size={28} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-[#2B2B2B] text-center" style={{ fontFamily: FONT_HEADING }}>
          {title}
        </h3>
        <p className="text-sm text-[#7A7A7A] text-center mt-2">
          {description}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('roles.usersManagement.removing') : (confirmText || t('roles.usersManagement.removeFromRole'))}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL - USERS MANAGEMENT
// ==========================================
const UsersManagement = ({ role, users: initialUsers, onUpdate }) => {
  const { t, tc } = usePageI18n('roles');
  const navigate = useNavigate();
  const goToCreateUser = () => {
    navigate('/dashboard/users', {
      state: role?.id ? { openCreate: true, presetRoleId: role.id } : { openCreate: true },
    });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [localUsers, setLocalUsers] = useState(() => ensureArray(initialUsers));
  const [roles, setRoles] = useState([]);

  // Mettre à jour les utilisateurs locaux quand les props changent
  useEffect(() => {
    setLocalUsers(ensureArray(initialUsers));
  }, [initialUsers]);

  useEffect(() => {
    getRoles({ per_page: 100 })
      .then((res) => {
        const { items } = normalizeRoleList(res.data);
        setRoles(items);
      })
      .catch(() => setRoles([]));
  }, []);

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Filtrer et trier les utilisateurs
  const filteredUsers = useMemo(() => {
    let filtered = ensureArray(localUsers);

    // Filtrer par rôle si un rôle est sélectionné
    if (role && role.id) {
      filtered = filtered.filter(u => u.roleId === role.id);
    }

    // Filtre statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Filtre recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.department.toLowerCase().includes(term) ||
        (roles.find(r => r.id === u.roleId)?.name || '').toLowerCase().includes(term)
      );
    }

    // Tri
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.assignedDate || 0) - new Date(a.assignedDate || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.assignedDate || 0) - new Date(b.assignedDate || 0));
        break;
      case 'az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'lastLogin':
        filtered.sort((a, b) => b.lastLogin.localeCompare(a.lastLogin));
        break;
      default:
        break;
    }

    return filtered;
  }, [localUsers, searchTerm, statusFilter, sortBy, role]);

  // Handlers
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewDrawerOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleRemoveUser = (user) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const confirmRemoveUser = () => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedUsers = localUsers.filter(u => u.id !== selectedUser.id);
      setLocalUsers(updatedUsers);
      if (onUpdate) onUpdate(updatedUsers);
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
      setIsLoading(false);
      showToast(t('roles.usersManagement.userRemoved'), 'success');
    }, 800);
  };


  const handleSaveEdit = (formData) => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedUsers = localUsers.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...formData, roleId: parseInt(formData.roleId) }
          : u
      );
      setLocalUsers(updatedUsers);
      if (onUpdate) onUpdate(updatedUsers);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setIsLoading(false);
      showToast(t('roles.usersManagement.userUpdated'), 'success');
    }, 800);
  };

  return (
    <div className="space-y-6">
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

      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" size={18} />
          <input
            type="text"
            placeholder={t('roles.usersManagement.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
          >
            <option value="all">{tc('all')}</option>
            <option value="active">{t('roles.usersManagement.activeUsers')}</option>
            <option value="inactive">{t('roles.usersManagement.inactiveUsers')}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
          >
            <option value="newest">{t('roles.usersManagement.sortNewest')}</option>
            <option value="oldest">{t('roles.usersManagement.sortOldest')}</option>
            <option value="az">{t('roles.usersManagement.sortAz')}</option>
            <option value="lastLogin">{t('roles.usersManagement.sortLastLogin')}</option>
          </select>
          <button
            type="button"
            onClick={goToCreateUser}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] text-white font-medium hover:shadow-lg transition-all text-sm"
          >
            <Plus size={18} />
            {t('roles.usersManagement.goToUsersPage')}
          </button>
        </div>
      </div>

      {/* Nombre d'utilisateurs */}
      <div className="flex items-center gap-2">
        <Users size={16} className="text-[#C8A45D]" />
        <span className="text-sm text-[#7A7A7A]">
          {t('roles.usersManagement.userCount', { count: filteredUsers.length })}
        </span>
      </div>

      {/* Liste des utilisateurs en cartes */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#F8F7F4] flex items-center justify-center">
              <Users size={36} className="text-[#D1CBC0]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2B2B2B]">{t('roles.usersManagement.noUsers')}</h3>
              <p className="text-sm text-[#7A7A7A]">
                {searchTerm || statusFilter !== 'all'
                  ? t('roles.usersManagement.noUsersFilter')
                  : t('roles.usersManagement.noUsersRole')}
              </p>
            </div>
            <button
              type="button"
              onClick={goToCreateUser}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] text-white font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              {t('roles.usersManagement.goToUsersPage')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              role={roles.find(r => r.id === user.roleId)}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onRemove={handleRemoveUser}
            />
          ))}
        </div>
      )}

      {/* Modals et Drawers */}
      <AnimatePresence>
        {/* View Drawer */}
        {isViewDrawerOpen && (
          <ViewUserDrawer
            isOpen={isViewDrawerOpen}
            onClose={() => {
              setIsViewDrawerOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            role={roles.find(r => r.id === selectedUser?.roleId)}
          />
        )}

        {/* Edit Modal */}
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveEdit}
          user={selectedUser}
          role={roles.find(r => r.id === selectedUser?.roleId)}
          roles={roles}
          isLoading={isLoading}
        />

        {/* Add-user flow: /dashboard/users only — see goToCreateUser */}

        {/* Confirm Remove Modal */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmRemoveUser}
          title={t('roles.usersManagement.removeUser')}
          description={t('roles.usersManagement.removeUserConfirm', { name: selectedUser?.name })}
          confirmText={t('roles.usersManagement.removeFromRole')}
          isLoading={isLoading}
        />
      </AnimatePresence>
    </div>
  );
};

export default UsersManagement;