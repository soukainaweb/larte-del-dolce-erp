// src/pages/RolesPermissions/RolesPermissionsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  CheckCircle,
  Info,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';

// Components
import RoleCard from './components/RoleCard';
import ViewRoleModal from './components/ViewRoleModal';
import EditRoleModal from './components/EditRoleModal';
import PermissionsModal from './components/PermissionsModal';
import RoleUsersModal from './components/RoleUsersModal';
import DuplicateRoleModal from './components/DuplicateRoleModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// MOCK DATA
// ==========================================

const initialRoles = [
  {
    id: 1,
    name: 'Administrateur',
    description: 'Accès complet à toutes les fonctions du système',
    color: '#C8A45D',
    icon: 'Crown',
    users: 1,
    permissions: 48,
    status: 'active',
    createdAt: '01/01/2025',
    updatedAt: '17/07/2026',
    createdBy: 'Système'
  },
  {
    id: 2,
    name: 'Comptable',
    description: 'Gère la comptabilité, les factures et les paiements',
    color: '#3B82F6',
    icon: 'DollarSign',
    users: 3,
    permissions: 32,
    status: 'active',
    createdAt: '01/01/2025',
    updatedAt: '16/07/2026',
    createdBy: 'Administrateur'
  },
  {
    id: 3,
    name: 'Responsable Production',
    description: 'Gère la production, le stock et les produits',
    color: '#F59E0B',
    icon: 'Factory',
    users: 4,
    permissions: 28,
    status: 'active',
    createdAt: '15/02/2025',
    updatedAt: '15/07/2026',
    createdBy: 'Administrateur'
  },
  {
    id: 4,
    name: 'Commercial',
    description: 'Gère les clients, les commandes et les devis',
    color: '#22C55E',
    icon: 'Users',
    users: 6,
    permissions: 24,
    status: 'active',
    createdAt: '01/03/2025',
    updatedAt: '14/07/2026',
    createdBy: 'Administrateur'
  },
  {
    id: 5,
    name: 'Livreur',
    description: 'Gère uniquement les livraisons',
    color: '#8B5CF6',
    icon: 'Truck',
    users: 3,
    permissions: 12,
    status: 'active',
    createdAt: '01/04/2025',
    updatedAt: '13/07/2026',
    createdBy: 'Administrateur'
  },
  {
    id: 6,
    name: 'Manager',
    description: 'Accès aux rapports et validation des opérations',
    color: '#EC4899',
    icon: 'Briefcase',
    users: 2,
    permissions: 36,
    status: 'active',
    createdAt: '01/05/2025',
    updatedAt: '12/07/2026',
    createdBy: 'Administrateur'
  },
  {
    id: 7,
    name: 'Invité',
    description: 'Accès en lecture seule limité',
    color: '#6B7280',
    icon: 'User',
    users: 0,
    permissions: 8,
    status: 'inactive',
    createdAt: '01/06/2025',
    updatedAt: '11/07/2026',
    createdBy: 'Administrateur'
  }
];

const initialUsers = [
  { id: 1, name: 'Mohamed Amine', email: 'amine@lartedolce.com', department: 'Administration', position: 'Administrateur', roleId: 1, status: 'active', lastLogin: '17/07/2026 08:45', assignedDate: '01/01/2025', avatar: null },
  { id: 2, name: 'Sara El Amrani', email: 'sara@lartedolce.com', department: 'Comptabilité', position: 'Responsable', roleId: 2, status: 'active', lastLogin: '17/07/2026 07:32', assignedDate: '15/01/2025', avatar: null },
  { id: 3, name: 'Youssef Benali', email: 'youssef@lartedolce.com', department: 'Production', position: 'Responsable', roleId: 3, status: 'active', lastLogin: '17/07/2026 16:20', assignedDate: '01/03/2025', avatar: null },
  { id: 4, name: 'Hanan Saidi', email: 'hanan@lartedolce.com', department: 'Commercial', position: 'Commercial', roleId: 4, status: 'active', lastLogin: '17/07/2026 14:11', assignedDate: '15/03/2025', avatar: null },
  { id: 5, name: 'Karim Lahlou', email: 'karim@lartedolce.com', department: 'Production', position: 'Responsable', roleId: 3, status: 'active', lastLogin: '16/07/2026 09:30', assignedDate: '01/04/2025', avatar: null },
  { id: 6, name: 'Nadia Fassi', email: 'nadia@lartedolce.com', department: 'Commercial', position: 'Commercial', roleId: 4, status: 'inactive', lastLogin: '16/07/2026 10:15', assignedDate: '15/04/2025', avatar: null }
];

// ==========================================
// TOAST COMPONENT
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

// ==========================================
// STATS CARD
// ==========================================
const StatCard = ({ icon: Icon, title, value, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    gold: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#EAE6DF] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#2B2B2B]">{value}</p>
          <p className="text-xs text-[#7A7A7A]">{title}</p>
          {subtitle && <p className="text-[10px] text-[#7A7A7A] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// SKELETON LOADER
// ==========================================
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#F8F7F4] to-[#EDEAE4] rounded-lg ${className}`} />
);

// ==========================================
// PAGE PRINCIPALE
// ==========================================
const RolesPermissionsPage = () => {
  const { user } = useAuth();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState(initialRoles);
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [isExporting, setIsExporting] = useState(false);

  // Selected role and modals
  const [selectedRole, setSelectedRole] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Permissions state for the selected role
  const [rolePermissions, setRolePermissions] = useState({});

  // Toast helpers
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Filter and paginate roles
  const filteredRoles = useMemo(() => {
    let filtered = roles;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [roles, searchTerm, statusFilter]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  // Stats
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const totalPermissions = roles.reduce((sum, r) => sum + r.permissions, 0);
    const totalUsers = roles.reduce((sum, r) => sum + r.users, 0);
    const activePermissions = roles.filter(r => r.status === 'active').length;
    const pendingRequests = 3;

    return {
      totalRoles,
      totalPermissions,
      totalUsers,
      activePermissions,
      pendingRequests
    };
  }, [roles]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom', accessor: 'name', width: 20 },
    { label: 'Description', accessor: 'description', width: 25 },
    { label: 'Utilisateurs', accessor: 'users', width: 12 },
    { label: 'Permissions', accessor: 'permissions', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Créé par', accessor: 'createdBy', width: 15 },
    { label: 'Dernière mise à jour', accessor: 'updatedAt', width: 15 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    description: item.description,
    users: item.users,
    permissions: item.permissions,
    status: item.status === 'active' ? 'Actif' : 'Inactif',
    createdBy: item.createdBy,
    updatedAt: item.updatedAt
  });

  const summary = [
    { label: 'Total des rôles', value: stats.totalRoles },
    { label: 'Permissions disponibles', value: stats.totalPermissions },
    { label: 'Utilisateurs affectés', value: stats.totalUsers },
    { label: 'Permissions actives', value: stats.activePermissions },
    { label: 'Demandes d\'accès en attente', value: stats.pendingRequests }
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
  // HANDLERS - ACTIONS PRINCIPALES
  // ==========================================

  // View Role
  const handleViewRole = (role) => {
    setSelectedRole(role);
    setIsViewModalOpen(true);
  };

  // Edit Role
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (formData) => {
    setIsSaving(true);
    setTimeout(() => {
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id ? { ...r, ...formData, updatedAt: new Date().toLocaleDateString('fr-FR') } : r
      ));
      setIsEditModalOpen(false);
      setSelectedRole(null);
      setIsSaving(false);
      showToast('✅ Rôle modifié avec succès', 'success');
    }, 800);
  };

  // Create Role
  const handleCreateRole = (formData) => {
    setIsSaving(true);
    setTimeout(() => {
      const newRole = {
        id: roles.length + 1,
        ...formData,
        users: 0,
        permissions: 0,
        createdAt: new Date().toLocaleDateString('fr-FR'),
        updatedAt: new Date().toLocaleDateString('fr-FR'),
        createdBy: user?.firstName || 'Administrateur'
      };
      setRoles(prev => [newRole, ...prev]);
      setIsCreateModalOpen(false);
      setIsSaving(false);
      showToast('✅ Rôle créé avec succès', 'success');
    }, 800);
  };

  // Duplicate Role
  const handleDuplicateRole = (formData) => {
    setIsSaving(true);
    setTimeout(() => {
      const newRole = {
        ...selectedRole,
        id: roles.length + 1,
        name: formData.name,
        users: formData.copyUsers ? selectedRole.users : 0,
        permissions: formData.copyPermissions ? selectedRole.permissions : 0,
        createdAt: new Date().toLocaleDateString('fr-FR'),
        updatedAt: new Date().toLocaleDateString('fr-FR'),
        createdBy: user?.firstName || 'Administrateur'
      };
      setRoles(prev => [newRole, ...prev]);
      setIsDuplicateModalOpen(false);
      setSelectedRole(null);
      setIsSaving(false);
      showToast('📋 Rôle dupliqué avec succès', 'success');
    }, 800);
  };

  // Delete Role
  const handleDeleteRole = () => {
    setIsSaving(true);
    setTimeout(() => {
      setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      setIsSaving(false);
      showToast('🗑️ Rôle supprimé avec succès', 'success');
    }, 800);
  };

  // Users Management
  const handleUsersRole = (role) => {
    setSelectedRole(role);
    setIsUsersModalOpen(true);
  };

  const handleAddUserToRole = (user) => {
    const newUser = {
      ...user,
      id: users.length + 1,
      roleId: selectedRole.id,
      assignedDate: new Date().toLocaleDateString('fr-FR'),
      status: 'active'
    };
    setUsers(prev => [...prev, newUser]);
    setRoles(prev => prev.map(r =>
      r.id === selectedRole.id ? { ...r, users: r.users + 1 } : r
    ));
    showToast('✅ Utilisateur ajouté au rôle', 'success');
  };

  const handleRemoveUserFromRole = (user) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setRoles(prev => prev.map(r =>
      r.id === selectedRole.id ? { ...r, users: Math.max(0, r.users - 1) } : r
    ));
    showToast('👤 Utilisateur retiré du rôle', 'info');
  };

  const handleEditUser = (user) => {
    showToast('✏️ Modifier l\'utilisateur', 'info');
  };

  // Permissions Management
  const handlePermissionsRole = (role) => {
    setSelectedRole(role);
    // Générer des permissions pour le rôle
    const perms = {};
    const modules = ['dashboard', 'orders', 'customers', 'products', 'production', 'inventory'];
    const permTypes = ['view', 'create', 'edit', 'delete', 'export', 'validate', 'approve'];
    modules.forEach(module => {
      perms[module] = {};
      permTypes.forEach(perm => {
        perms[module][perm] = role.id === 1;
      });
    });
    setRolePermissions(perms);
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = (permissions) => {
    setIsSaving(true);
    setTimeout(() => {
      const count = Object.values(permissions).reduce((sum, module) => {
        return sum + Object.values(module).filter(v => v === true).length;
      }, 0);
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id ? { ...r, permissions: count, updatedAt: new Date().toLocaleDateString('fr-FR') } : r
      ));
      setIsPermissionsModalOpen(false);
      setSelectedRole(null);
      setIsSaving(false);
      showToast('✅ Permissions mises à jour avec succès', 'success');
    }, 800);
  };

  // General actions
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('🔄 Données actualisées', 'success');
    }, 800);
  };

  const handleHistory = () => {
    showToast('📋 Historique des modifications', 'info');
  };

  const handleSettings = () => {
    showToast('⚙️ Paramètres des rôles', 'info');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Reset selected role when modals close
  const resetSelectedRole = () => {
    setSelectedRole(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
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

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: FONT_HEADING }}>
            Rôles & Permissions
          </h1>
          <p className="text-sm text-[#7A7A7A]">
            Gérez les rôles, les permissions et les accès des utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredRoles}
            columns={columns}
            title="Liste des rôles et permissions"
            subtitle={`${filteredRoles.length} rôles - ${stats.totalPermissions} permissions totales`}
            filename={`roles_permissions_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Nouveau rôle
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#7A7A7A]" />
          </button>
          <button
            onClick={handleHistory}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Historique"
          >
            <History size={18} className="text-[#7A7A7A]" />
          </button>
          <button
            onClick={handleSettings}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Paramètres"
          >
            <Settings size={18} className="text-[#7A7A7A]" />
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={Users}
          title="Total des rôles"
          value={stats.totalRoles}
          color="blue"
          subtitle={`${roles.filter(r => r.status === 'active').length} actifs`}
        />
        <StatCard
          icon={Shield}
          title="Permissions disponibles"
          value={stats.totalPermissions}
          color="purple"
        />
        <StatCard
          icon={Users}
          title="Utilisateurs affectés"
          value={stats.totalUsers}
          color="green"
        />
        <StatCard
          icon={Shield}
          title="Permissions actives"
          value={stats.activePermissions}
          color="gold"
        />
        <StatCard
          icon={AlertCircle}
          title="Demandes d'accès"
          value={stats.pendingRequests}
          color="amber"
          subtitle="En attente"
        />
      </div>

      {/* ===== FILTRES ===== */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" size={18} />
            <input
              type="text"
              placeholder="Rechercher un rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* ===== ROLE CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonLoader key={idx} className="h-56 w-full" />
          ))
        ) : paginatedRoles.length === 0 ? (
          <div className="col-span-full bg-white border border-[#EAE6DF] rounded-2xl p-12 text-center">
            <Shield size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#2B2B2B]">Aucun rôle trouvé</h3>
            <p className="text-sm text-[#7A7A7A]">Aucun rôle ne correspond à vos critères</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-sm text-[#C8A45D] font-medium hover:underline"
            >
              Créer un rôle
            </button>
          </div>
        ) : (
          paginatedRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onView={handleViewRole}
              onEdit={handleEditRole}
              onDuplicate={(r) => {
                setSelectedRole(r);
                setIsDuplicateModalOpen(true);
              }}
              onUsers={handleUsersRole}
              onPermissions={handlePermissionsRole}
              onDelete={(r) => {
                setSelectedRole(r);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      {filteredRoles.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-sm text-[#7A7A7A]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, filteredRoles.length)} sur {filteredRoles.length} rôles
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-[#7A7A7A]" />
            </button>
            <span className="text-sm font-medium text-[#2B2B2B]">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-[#7A7A7A]" />
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-[#EAE6DF] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {/* View Modal */}
        {isViewModalOpen && (
          <ViewRoleModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              resetSelectedRole();
            }}
            role={selectedRole}
            onEdit={handleEditRole}
            onUsers={handleUsersRole}
            onPermissions={handlePermissionsRole}
          />
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditRoleModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              resetSelectedRole();
            }}
            onSave={handleSaveEdit}
            role={selectedRole}
            isLoading={isSaving}
          />
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <EditRoleModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateRole}
            role={null}
            isLoading={isSaving}
          />
        )}

        {/* Permissions Modal */}
        {isPermissionsModalOpen && (
          <PermissionsModal
            isOpen={isPermissionsModalOpen}
            onClose={() => {
              setIsPermissionsModalOpen(false);
              resetSelectedRole();
            }}
            role={selectedRole}
            permissions={rolePermissions}
            onSave={handleSavePermissions}
            isLoading={isSaving}
          />
        )}

        {/* Users Modal */}
        {isUsersModalOpen && (
          <RoleUsersModal
            isOpen={isUsersModalOpen}
            onClose={() => {
              setIsUsersModalOpen(false);
              resetSelectedRole();
            }}
            role={selectedRole}
            users={users.filter(u => u.roleId === selectedRole?.id)}
            onAddUser={handleAddUserToRole}
            onEditUser={handleEditUser}
            onRemoveUser={handleRemoveUserFromRole}
          />
        )}

        {/* Duplicate Modal */}
        {isDuplicateModalOpen && (
          <DuplicateRoleModal
            isOpen={isDuplicateModalOpen}
            onClose={() => {
              setIsDuplicateModalOpen(false);
              resetSelectedRole();
            }}
            role={selectedRole}
            onDuplicate={handleDuplicateRole}
            isLoading={isSaving}
          />
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              resetSelectedRole();
            }}
            onConfirm={handleDeleteRole}
            role={selectedRole}
            isLoading={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolesPermissionsPage;