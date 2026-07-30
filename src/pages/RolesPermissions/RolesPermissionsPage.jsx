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
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  duplicateRole,
  getRolePermissions,
  updateRolePermissions,
  getRoleUsers,
  addUserToRole,
  removeUserFromRole,
  getRoleStatistics,
  exportRoles,
  getRoleStatuses,
  getPermissionModules
} from '../../services/roleService';

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
  const { title, subtitle, searchPlaceholder, t, tc } = usePageI18n('roles');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [isExporting, setIsExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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
  const [permissionModules, setPermissionModules] = useState([]);

  // Toast helpers
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      const response = await getRoles(params);
      const data = response.data.data || [];
      setRoles(data);
      setTotalCount(response.data.meta?.total || data.length);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast(t('errors.loadFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchUsersForRole = async (roleId) => {
    try {
      const response = await getRoleUsers(roleId);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching role users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getRoleStatistics();
      const data = response.data.data || {};
      setStats(data);
    } catch (error) {
      console.error('Error fetching role statistics:', error);
    }
  };

  const fetchPermissionModules = async () => {
    try {
      const response = await getPermissionModules();
      setPermissionModules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching permission modules:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPermissionModules();
  }, []);

  // Stats
  const [stats, setStats] = useState({
    totalRoles: 0,
    totalPermissions: 0,
    totalUsers: 0,
    activePermissions: 0,
    pendingRequests: 0
  });

  // Filter and paginate roles
  const filteredRoles = useMemo(() => {
    return roles;
  }, [roles]);

  const paginatedRoles = useMemo(() => {
    return filteredRoles;
  }, [filteredRoles]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = useMemo(() => [
    { label: t('roles.table.name'), accessor: 'name', width: 20 },
    { label: t('roles.table.description'), accessor: 'description', width: 25 },
    { label: t('roles.table.users'), accessor: 'users', width: 12 },
    { label: t('roles.table.permissions'), accessor: 'permissions', width: 12 },
    { label: t('roles.table.status'), accessor: 'status', width: 12 },
    { label: tc('createdBy'), accessor: 'createdBy', width: 15 },
    { label: tc('table.columns.updatedAt'), accessor: 'updatedAt', width: 15 }
  ], [t, tc]);

  const rowFormatter = useCallback((item) => ({
    name: item.name,
    description: item.description,
    users: item.users,
    permissions: item.permissions,
    status: item.status === 'active' ? tc('active') : tc('inactive'),
    createdBy: item.createdBy,
    updatedAt: item.updatedAt
  }), [tc]);

  const summary = useMemo(() => [
    { label: t('roles.kpi.totalRoles'), value: stats.totalRoles },
    { label: t('roles.kpi.permissions'), value: stats.totalPermissions },
    { label: t('roles.kpi.totalUsers'), value: stats.totalUsers },
    { label: t('roles.kpi.permissions'), value: stats.activePermissions },
    { label: tc('pending'), value: stats.pendingRequests }
  ], [t, tc, stats]);

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

  const handleSaveEdit = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateRole(selectedRole.id, formData);
      const updatedRole = response.data.data;
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id ? updatedRole : r
      ));
      setIsEditModalOpen(false);
      setSelectedRole(null);
      await fetchStats();
      showToast(t('success.updated'), 'success');
    } catch (error) {
      console.error('Error updating role:', error);
      showToast(t('errors.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Create Role
  const handleCreateRole = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createRole(formData);
      const newRole = response.data.data;
      setRoles(prev => [newRole, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStats();
      showToast(t('success.created'), 'success');
    } catch (error) {
      console.error('Error creating role:', error);
      showToast(t('errors.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicate Role
  const handleDuplicateRole = async (formData) => {
    setIsSaving(true);
    try {
      const response = await duplicateRole(selectedRole.id, formData);
      const newRole = response.data.data;
      setRoles(prev => [newRole, ...prev]);
      setIsDuplicateModalOpen(false);
      setSelectedRole(null);
      await fetchStats();
      showToast(t('success.created'), 'success');
    } catch (error) {
      console.error('Error duplicating role:', error);
      showToast(t('errors.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Role
  const handleDeleteRole = async () => {
    setIsSaving(true);
    try {
      await deleteRole(selectedRole.id);
      setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      await fetchStats();
      showToast(t('success.deleted'), 'success');
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast(t('errors.deleteFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Users Management
  const handleUsersRole = async (role) => {
    setSelectedRole(role);
    await fetchUsersForRole(role.id);
    setIsUsersModalOpen(true);
  };

  const handleAddUserToRole = async (user) => {
    try {
      await addUserToRole(selectedRole.id, { userId: user.id });
      await fetchUsersForRole(selectedRole.id);
      await fetchRoles();
      await fetchStats();
      showToast(t('roles.usersManagement.userAdded'), 'success');
    } catch (error) {
      console.error('Error adding user to role:', error);
      showToast(t('errors.saveFailed'), 'error');
    }
  };

  const handleRemoveUserFromRole = async (user) => {
    try {
      await removeUserFromRole(selectedRole.id, user.id);
      await fetchUsersForRole(selectedRole.id);
      await fetchRoles();
      await fetchStats();
      showToast(t('roles.usersManagement.userRemoved'), 'info');
    } catch (error) {
      console.error('Error removing user from role:', error);
      showToast(t('errors.deleteFailed'), 'error');
    }
  };

  const handleEditUser = (user) => {
    showToast(t('roles.usersManagement.editUser'), 'info');
  };

  // Permissions Management
  const handlePermissionsRole = async (role) => {
    setSelectedRole(role);
    try {
      const response = await getRolePermissions(role.id);
      setRolePermissions(response.data.data || {});
      setIsPermissionsModalOpen(true);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      showToast(t('errors.loadFailed'), 'error');
    }
  };

  const handleSavePermissions = async (permissions) => {
    setIsSaving(true);
    try {
      const response = await updateRolePermissions(selectedRole.id, { permissions });
      const updatedRole = response.data.data;
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id ? updatedRole : r
      ));
      setIsPermissionsModalOpen(false);
      setSelectedRole(null);
      await fetchStats();
      showToast(t('success.updated'), 'success');
    } catch (error) {
      console.error('Error updating permissions:', error);
      showToast(t('errors.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // General actions
  const handleRefresh = async () => {
    await fetchRoles();
    await fetchStats();
    showToast(tc('dataRefreshed'), 'success');
  };

  const handleHistory = () => {
    showToast(t('activityLog.title'), 'info');
  };

  const handleSettings = () => {
    showToast(t('settings.title'), 'info');
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
            {title}
          </h1>
          <p className="text-sm text-[#7A7A7A]">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredRoles}
            columns={columns}
            title={t('roles.title')}
            subtitle={t('roles.usersManagement.userCount', { count: filteredRoles.length })}
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
            {t('roles.addRole')}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={tc('refresh')}
          >
            <RefreshCw size={18} className="text-[#7A7A7A]" />
          </button>
          <button
            onClick={handleHistory}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={t('activityLog.title')}
          >
            <History size={18} className="text-[#7A7A7A]" />
          </button>
          <button
            onClick={handleSettings}
            className="p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={t('settings.title')}
          >
            <Settings size={18} className="text-[#7A7A7A]" />
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={Users}
          title={t('roles.kpi.totalRoles')}
          value={stats.totalRoles}
          color="blue"
          subtitle={`${roles.filter(r => r.status === 'active').length} ${tc('active')}`}
        />
        <StatCard
          icon={Shield}
          title={t('roles.kpi.permissions')}
          value={stats.totalPermissions}
          color="purple"
        />
        <StatCard
          icon={Users}
          title={t('roles.kpi.totalUsers')}
          value={stats.totalUsers}
          color="green"
        />
        <StatCard
          icon={Shield}
          title={t('roles.kpi.permissions')}
          value={stats.activePermissions}
          color="gold"
        />
        <StatCard
          icon={AlertCircle}
          title={tc('pending')}
          value={stats.pendingRequests}
          color="amber"
          subtitle={tc('pending')}
        />
      </div>

      {/* ===== FILTRES ===== */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
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
              <option value="all">{tc('all')}</option>
              <option value="active">{tc('active')}</option>
              <option value="inactive">{tc('inactive')}</option>
            </select>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('resetFilters')}
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
            <h3 className="text-lg font-bold text-[#2B2B2B]">{tc('noResultsFound')}</h3>
            <p className="text-sm text-[#7A7A7A]">{tc('table.noItemsFound')}</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-sm text-[#C8A45D] font-medium hover:underline"
            >
              {t('roles.addRole')}
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
            {tc('showing')} {((currentPage - 1) * itemsPerPage) + 1} {tc('of')}{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} {tc('of')} {totalCount}
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
              {tc('showing')} {currentPage} {tc('of')} {totalPages}
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
            modules={permissionModules}
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
            users={users}
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