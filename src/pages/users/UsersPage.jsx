// src/pages/Users/UsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
import ExportButtons from '../../components/ExportButtons';
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

// ===> Supprimer 'userServicePage' et utiliser 'userService' à la place

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Actif', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Inactif', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    suspended: { label: 'Suspendu', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    locked: { label: 'Verrouillé', class: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// ROLE BADGE
// ==========================================
const RoleBadge = ({ role }) => {
  const roleColors = {
    Administrator: 'bg-[#B8863B]/10 text-[#B8863B] border-[#B8863B]/30',
    Accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    'Sales Representative': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Production Manager': 'bg-purple-50 text-purple-700 border-purple-200',
    'Factory Employee': 'bg-amber-50 text-amber-700 border-amber-200',
    'Warehouse Manager': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Delivery Driver': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Finance Manager': 'bg-rose-50 text-rose-700 border-rose-200',
    Manager: 'bg-slate-50 text-slate-700 border-slate-200',
    Viewer: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const color = roleColors[role] || roleColors.Viewer;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {role}
    </span>
  );
};

// ==========================================
// USER CARD (Mobile)
// ==========================================
const UserCardComponent = ({ user, onEdit, onDelete, onView }) => {
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
        <RoleBadge role={user.role} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(user)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(user)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(user)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
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
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="Supprimer"
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
const UserModal = ({ isOpen, onClose, onSave, user, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Viewer',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Viewer',
        status: user.status || 'active'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Viewer',
        status: 'active'
      });
    }
  }, [user]);

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
    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.role) newErrors.role = 'Le rôle est requis';

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
            {user ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Prénom</label>
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Nom</label>
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Email</label>
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.role ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="Administrator">Administrateur</option>
              <option value="Accountant">Comptable</option>
              <option value="Sales Representative">Mandoub</option>
              <option value="Production Manager">Responsable Production</option>
              <option value="Factory Employee">Employé Usine</option>
              <option value="Warehouse Manager">Responsable Entrepôt</option>
              <option value="Delivery Driver">Livreur</option>
              <option value="Finance Manager">Responsable Finance</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
            {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
              <option value="locked">Verrouillé</option>
            </select>
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
              {isLoading ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Ajouter'}
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
          Supprimer l'utilisateur ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          Vous êtes sur le point de supprimer l'utilisateur{' '}
          <span className="font-semibold text-[#3D2F24]">
            {user?.firstName} {user?.lastName}
          </span>.
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
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
            Détails de l'utilisateur
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
                <RoleBadge role={user.role} />
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
              <span className="text-[#3D2F24]">Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            Fermer
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
  const { user } = useAuth();

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'createdAt',
        sort_order: 'desc'
      };
      const response = await getUsers(params);
      const data = response.data.data || [];
      setUsers(data);
      setTotalCount(response.data.meta?.total || data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

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
      const data = response.data.data || {};
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
  }, []);

  // Filter users (client-side for demo, API already handles filters)
  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  // Paginate
  const paginatedUsers = useMemo(() => {
    return filteredUsers;
  }, [filteredUsers]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom complet', accessor: 'fullName', width: 20 },
    { label: 'Email', accessor: 'email', width: 20 },
    { label: 'Téléphone', accessor: 'phone', width: 15 },
    { label: 'Rôle', accessor: 'role', width: 18 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Date d\'inscription', accessor: 'createdAt', width: 15 }
  ];

  const rowFormatter = (item) => ({
    fullName: `${item.firstName} ${item.lastName}`,
    email: item.email,
    phone: item.phone || '—',
    role: item.role,
    status: item.status === 'active' ? 'Actif' :
            item.status === 'inactive' ? 'Inactif' :
            item.status === 'suspended' ? 'Suspendu' : 'Verrouillé',
    createdAt: new Date(item.createdAt).toLocaleDateString('fr-FR')
  });

  const summary = [
    { label: 'Total utilisateurs', value: kpis.total },
    { label: 'Actifs', value: kpis.active },
    { label: 'Inactifs', value: kpis.inactive },
    { label: 'Suspendus', value: kpis.suspended },
    { label: 'Verrouillés', value: kpis.locked }
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
    try {
      const response = await createUser(formData);
      const newUser = response.data.data;
      setUsers(prev => [newUser, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateUser(selectedUser.id, formData);
      const updatedUser = response.data.data;
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? updatedUser : u
      ));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsSaving(true);
    try {
      await deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
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
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role));
    return Array.from(roles);
  }, [users]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Utilisateurs
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredUsers}
            columns={columns}
            title="Liste des utilisateurs"
            subtitle={`${filteredUsers.length} utilisateurs`}
            filename={`utilisateurs_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <UserPlus size={18} />
            Ajouter un utilisateur
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
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
              placeholder="Rechercher un utilisateur..."
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
              <option value="all">Tous les rôles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
              <option value="locked">Verrouillé</option>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date d'inscription</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#6D6D6D]">Chargement des utilisateurs...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UsersIcon size={40} className="text-[#ECE8E1]" />
                      <p className="text-sm text-[#6D6D6D]">Aucun utilisateur trouvé</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-sm text-[#B8863B] font-medium hover:underline"
                      >
                        Ajouter un utilisateur
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
            <p className="text-sm text-[#6D6D6D]">Chargement des utilisateurs...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <UsersIcon size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucun utilisateur trouvé</p>
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
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} utilisateurs
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
              Page {currentPage} sur {totalPages}
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
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateUser}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedUser && (
          <UserModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleEditUser}
            user={selectedUser}
            isLoading={isSaving}
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