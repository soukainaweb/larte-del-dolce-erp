// src/pages/Users/UsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Download,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import { hasPermission } from '../../utils/permissions';
import { translateRoleLabel } from '../../utils/roleMapping';
// src/pages/Users/UsersPage.jsx
// CHANGER CETTE LIGNE :
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getUserStatistics,
  exportUsers,
  getUserRoles,
  getUserStatuses,
  sendPasswordReset,
  resendInvitation
} from '../../services/userServicePage';  // ← Changé de 'userServicePage' à 'userService'
import { unwrapData, normalizeUserList, normalizeUserRecord, extractFieldErrors, getApiErrorMessage, ensureArray } from '../../utils/apiHelpers';
import { dispatchAppToast } from '../../utils/toastBus';
import useEntityDeepLink from '../../hooks/useEntityDeepLink';

// ===> Supprimer 'userServicePage' et utiliser 'userService' à la place

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { commonStatus } = usePageI18n('users');

  const key = String(status ?? 'inactive').toLowerCase();
  const config = commonStatus[key] || { label: String(status ?? '—'), class: 'bg-gray-50 text-gray-600 border-gray-200' };

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// ROLE BADGE
// ==========================================
const RoleBadge = ({ role, roleSlug }) => {
  const label = translateRoleLabel(roleSlug || role);
  const roleColors = {
    المسؤول: 'bg-[#B8863B]/10 text-[#B8863B] border-[#B8863B]/30',
    المدير: 'bg-slate-50 text-slate-700 border-slate-200',
    المحاسب: 'bg-blue-50 text-blue-700 border-blue-200',
    المندوب: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Administrator: 'bg-[#B8863B]/10 text-[#B8863B] border-[#B8863B]/30',
    Accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    'Sales Representative': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Manager: 'bg-slate-50 text-slate-700 border-slate-200',
    Viewer: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const color = roleColors[label] || roleColors.Manager || roleColors.Viewer;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {label}
    </span>
  );
};

// ==========================================
// USER CARD (Mobile)
// ==========================================
const UserCardComponent = ({ user, onEdit, onDelete, onView }) => {
  const { actions } = usePageI18n('users');

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-[#6D6D6D]">{user.email}</p>
          </div>
        </div>
        <StatusBadge status={user.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <RoleBadge role={user.role} roleSlug={user.roleSlug} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString(DATE_LOCALE) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(user)} title={actions.view} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(user)} title={actions.edit} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(user)} title={actions.delete} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// USER TABLE ROW (Desktop)
// ==========================================
const UserTableRow = ({ user, onEdit, onDelete, onView, index }) => {
  const { actions } = usePageI18n('users');

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] font-bold text-sm">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{user.firstName} {user.lastName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{user.email}</td>
      <td className="px-4 py-3">
        <RoleBadge role={user.role} roleSlug={user.roleSlug} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(DATE_LOCALE) : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title={actions.delete}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// USER MODAL
// ==========================================
const UserModal = ({ isOpen, onClose, onSave, user, isLoading, availableRoles = [], fieldErrors = null, presetRoleId = null }) => {
  const { t, commonStatus, tc } = usePageI18n('users');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (fieldErrors) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  }, [fieldErrors]);

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        roleId: user.roleId ? String(user.roleId) : '',
        status: user.status || 'active'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roleId: availableRoles[0]?.id ? String(availableRoles[0].id) : '',
        status: 'active'
      });
    }
    setErrors({});
  }, [user, isOpen, availableRoles, presetRoleId]);

  useEffect(() => {
    if (!isOpen || user || !presetRoleId) return;
    setFormData((prev) => ({ ...prev, roleId: String(presetRoleId) }));
  }, [isOpen, user, presetRoleId]);

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
    if (!formData.firstName) newErrors.firstName = tc('required');
    if (!formData.lastName) newErrors.lastName = tc('required');
    if (!formData.email) newErrors.email = tc('required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = tc('emailInvalid');
    if (!formData.roleId) newErrors.roleId = tc('required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {user ? t('users.modals.editTitle') : t('users.modals.addTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('firstName')}</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.firstName ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('lastName')}</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.lastName ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.email ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('role')}</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.roleId ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="">{t('roles.usersManagement.selectRole', { defaultValue: tc('role') })}</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {translateRoleLabel(role)}
                </option>
              ))}
            </select>
            {errors.roleId && <p className="text-xs text-rose-500 mt-1">{errors.roleId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">{commonStatus.active.label}</option>
              <option value="inactive">{commonStatus.inactive.label}</option>
              <option value="suspended">{commonStatus.suspended.label}</option>
              <option value="locked">{commonStatus.locked.label}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? tc('saving') : user ? tc('update') : tc('add')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// DELETE MODAL
// ==========================================
const DeleteModal = ({ isOpen, onClose, onConfirm, user, isLoading }) => {
  const { t, tc } = usePageI18n('users');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-center w-14 h-14 mx-auto bg-rose-50 rounded-full mb-4">
          <Trash2 size={28} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-[#3D2F24] text-center" style={{ fontFamily: FONT_HEADING }}>
          {t('users.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {t('users.modals.deleteMessage', { name: `${user?.firstName} ${user?.lastName}` })}{' '}
          {tc('irreversibleAction')}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? tc('deleting') : tc('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// USER DETAILS MODAL
// ==========================================
const UserDetailsModal = ({ isOpen, onClose, user }) => {
  const { t, tc } = usePageI18n('users');

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('users.modals.detailsTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#ECE8E1]">
            <div className="w-16 h-16 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] text-2xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#3D2F24]">{user.firstName} {user.lastName}</p>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} roleSlug={user.roleSlug} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Briefcase size={18} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{user.role}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{tc('createdOn', { date: user.createdAt ? new Date(user.createdAt).toLocaleDateString(DATE_LOCALE) : '—' })}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            {tc('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN USERS PAGE
// ==========================================
const UsersPage = () => {
  const { user, permissions, roleKey } = useAuth();
  const canCreateUsers = hasPermission('users.create', permissions, user?.role ?? roleKey);
  const { title, subtitle, searchPlaceholder, t, commonStatus, actions, tc } = usePageI18n('users');
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const [createPresetRoleId, setCreatePresetRoleId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load users
  const fetchUsers = async (overridePage) => {
    setIsLoading(true);
    try {
      const page = overridePage ?? currentPage;
      const params = {
        page,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'createdAt',
        sort_order: 'desc'
      };
      const response = await getUsers(params);
      const { items, meta } = normalizeUserList(response);
      setUsers(items);
      setTotalCount(meta.total ?? meta.total_count ?? items.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  useEntityDeepLink({
    items: users,
    viewStateKey: 'viewUserId',
    editStateKey: 'editUserId',
    fetchById: getUserById,
    onView: (userRecord) => {
      setSelectedUser(normalizeUserRecord(userRecord));
      setIsDetailsModalOpen(true);
    },
    onEdit: (userRecord) => {
      setSelectedUser(normalizeUserRecord(userRecord));
      setIsEditModalOpen(true);
    },
  });

  // Fetch statistics
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    locked: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getUserStatistics();
      const data = unwrapData(response) || {};
      setKpis({
        total: data.total || 0,
        active: data.active || 0,
        inactive: data.inactive || 0,
        suspended: data.suspended || 0,
        locked: data.locked || 0
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
    getUserRoles()
      .then((response) => setAvailableRoles(ensureArray(unwrapData(response))))
      .catch(() => setAvailableRoles([]));
  }, []);

  // Filter users (client-side for demo, API already handles filters)
  const filteredUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  // Paginate
  const paginatedUsers = useMemo(() => filteredUsers, [filteredUsers]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: tc('fullName'), accessor: 'fullName', width: 20 },
    { label: t('users.table.email'), accessor: 'email', width: 20 },
    { label: tc('phone'), accessor: 'phone', width: 15 },
    { label: t('users.table.role'), accessor: 'role', width: 18 },
    { label: t('users.table.status'), accessor: 'status', width: 12 },
    { label: t('users.table.registrationDate'), accessor: 'createdAt', width: 15 }
  ];

  const formatStatus = (status) => {
    const key = String(status ?? 'inactive').toLowerCase();
    return commonStatus[key]?.label || status || '—';
  };

  const rowFormatter = (item) => ({
    fullName: `${item.firstName} ${item.lastName}`,
    email: item.email,
    phone: item.phone || '—',
    role: item.role,
    status: formatStatus(item.status),
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString(DATE_LOCALE) : '—'
  });

  const summary = [
    { label: t('users.kpi.total'), value: kpis.total },
    { label: t('users.kpi.active'), value: kpis.active },
    { label: t('users.kpi.inactive'), value: kpis.inactive },
    { label: commonStatus.suspended.label, value: kpis.suspended },
    { label: commonStatus.locked.label, value: kpis.locked }
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

  // Handlers
  const handleCreateUser = async (formData) => {
    setIsSaving(true);
    setFormErrors(null);
    try {
      const response = await createUser(formData);
      const generatedPassword = response.generatedPassword;
      const newUser = normalizeUserRecord(unwrapData(response));
      if (newUser) {
        setCurrentPage(1);
        await fetchUsers(1);
      }
      setIsCreateModalOpen(false);
      await fetchStatistics();
      if (generatedPassword) {
        dispatchAppToast(
          t('users.success.createdWithPassword', { password: generatedPassword }),
          'success'
        );
      } else {
        dispatchAppToast(t('users.success.created'), 'success');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        setFormErrors(fieldErrors);
      } else {
        dispatchAppToast(getApiErrorMessage(error, t('errors.saveFailed')), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async (formData) => {
    setIsSaving(true);
    setFormErrors(null);
    try {
      const response = await updateUser(selectedUser.id, formData);
      const updatedUser = normalizeUserRecord(unwrapData(response));
      if (updatedUser) {
        setUsers((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          return list.map((u) => (u.id === selectedUser.id ? updatedUser : u));
        });
      }
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await fetchStatistics();
      dispatchAppToast(t('users.success.updated', { defaultValue: 'تم تحديث المستخدم بنجاح' }), 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        setFormErrors(fieldErrors);
      } else {
        dispatchAppToast(getApiErrorMessage(error, t('errors.saveFailed')), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsSaving(true);
    try {
      await deleteUser(selectedUser.id);
      setUsers((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((u) => u.id !== selectedUser.id);
      });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStatistics();
  };

  useEffect(() => {
    if (location.state?.openCreate && canCreateUsers) {
      setFormErrors(null);
      setCreatePresetRoleId(location.state?.presetRoleId ?? null);
      setIsCreateModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, canCreateUsers, location.pathname, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const uniqueRoles = useMemo(() => availableRoles, [availableRoles]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {title}
          </h1>
          <p className="text-sm text-[#6D6D6D]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredUsers}
            columns={columns}
            title={t('users.export.title')}
            subtitle={t('users.export.subtitle', { count: filteredUsers.length })}
            filename={`utilisateurs_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          {canCreateUsers && (
          <button
            onClick={() => {
              setFormErrors(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <UserPlus size={18} />
            {t('users.addUser')}
          </button>
          )}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={actions.refresh}
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex flex-wrap gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{tc('allRoles')}</option>
              {uniqueRoles.map((role) => (
                <option key={role.id} value={role.id}>{translateRoleLabel(role)}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{tc('allStatuses')}</option>
              <option value="active">{commonStatus.active.label}</option>
              <option value="inactive">{commonStatus.inactive.label}</option>
              <option value="suspended">{commonStatus.suspended.label}</option>
              <option value="locked">{commonStatus.locked.label}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('users.table.user')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('users.table.email')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('users.table.role')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('users.table.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('users.table.registrationDate')}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#6D6D6D]">{t('common.table.loadingItems', { entity: t('nav.users') })}</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UsersIcon size={40} className="text-[#ECE8E1]" />
                      <p className="text-sm text-[#6D6D6D]">{t('common.table.noItemsFound')}</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-sm text-[#B8863B] font-medium hover:underline"
                      >
                        {t('users.addUser')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    index={index}
                    onView={(u) => {
                      setSelectedUser(u);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={(u) => {
                      setSelectedUser(u);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={(u) => {
                      setSelectedUser(u);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.table.loadingItems', { entity: t('nav.users') })}</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <UsersIcon size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('common.table.noItemsFound')}</p>
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <UserCardComponent
              key={user.id}
              user={user}
              onView={(u) => {
                setSelectedUser(u);
                setIsDetailsModalOpen(true);
              }}
              onEdit={(u) => {
                setSelectedUser(u);
                setIsEditModalOpen(true);
              }}
              onDelete={(u) => {
                setSelectedUser(u);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            {tc('showingRange', {
              from: ((currentPage - 1) * itemsPerPage) + 1,
              to: Math.min(currentPage * itemsPerPage, totalCount),
              total: totalCount
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-[#6D6D6D]" />
            </button>
            <span className="text-sm font-medium text-[#3D2F24]">
              {tc('pageOf', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-[#6D6D6D]" />
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-[#ECE8E1] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence mode="wait">
        {isCreateModalOpen && (
          <UserModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => {
              setFormErrors(null);
              setCreatePresetRoleId(null);
              setIsCreateModalOpen(false);
            }}
            onSave={handleCreateUser}
            isLoading={isSaving}
            availableRoles={availableRoles}
            fieldErrors={formErrors}
            presetRoleId={createPresetRoleId}
          />
        )}

        {isEditModalOpen && selectedUser && (
          <UserModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setFormErrors(null);
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleEditUser}
            user={selectedUser}
            isLoading={isSaving}
            availableRoles={availableRoles}
            fieldErrors={formErrors}
          />
        )}

        {isDeleteModalOpen && selectedUser && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteUser}
            user={selectedUser}
            isLoading={isSaving}
          />
        )}

        {isDetailsModalOpen && selectedUser && (
          <UserDetailsModal
            key="details-modal"
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersPage;