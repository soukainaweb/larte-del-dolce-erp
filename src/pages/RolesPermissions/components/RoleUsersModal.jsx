// src/pages/RolesPermissions/components/RoleUsersModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Plus,
  Search,
  Eye,
  Edit2,
  UserX,
  Mail,
  Briefcase,
  Building,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePageI18n } from '../../../hooks/usePageI18n';
import { ensureArray } from '../../../utils/apiHelpers';

const RoleUsersModal = ({ isOpen, onClose, role, users, onAddUser, onEditUser, onRemoveUser }) => {
  const { t, tc, commonStatus } = usePageI18n('roles');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !role) return null;

  const safeUsers = ensureArray(users);
  const filteredUsers = safeUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    active: commonStatus.active.class,
    inactive: commonStatus.inactive.class
  };

  const statusLabels = {
    active: commonStatus.active.label,
    inactive: commonStatus.inactive.label
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t('roles.table.users')} - {role.name}
            </h3>
            <p className="text-sm text-[#7A7A7A]">
              {t('roles.usersManagement.userCount', { count: users.length })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <div className="p-6">
          {/* Search & Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/dashboard/users', {
                  state: { openCreate: true, presetRoleId: role.id },
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] text-white font-medium hover:shadow-lg transition-all text-sm"
            >
              <Plus size={18} />
              {t('roles.usersManagement.goToUsersPage')}
            </button>
          </div>

          {/* User Cards */}
          {filteredUsers.length === 0 ? (
            <div className="bg-[#F8F7F4] rounded-xl p-8 text-center">
              <User size={32} className="text-[#D1CBC0] mx-auto mb-3" />
              <p className="text-sm text-[#7A7A7A]">{t('roles.usersManagement.noUsersFilter')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#EAE6DF] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C8A45D]/20 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <User size={18} className="text-[#C8A45D]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2B2B2B]">{user.name}</p>
                        <p className="text-xs text-[#7A7A7A]">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[user.status] || statusColors.inactive}`}>
                      {statusLabels[user.status] || commonStatus.inactive.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F8F7F4] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[#7A7A7A]">
                        <Briefcase size={12} />
                        <span>{t('roles.usersManagement.department')}</span>
                      </div>
                      <p className="font-medium text-[#2B2B2B]">{user.department}</p>
                    </div>
                    <div className="bg-[#F8F7F4] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[#7A7A7A]">
                        <Building size={12} />
                        <span>{t('roles.usersManagement.position')}</span>
                      </div>
                      <p className="font-medium text-[#2B2B2B]">{user.position}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EAE6DF] flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                      title={tc('edit')}
                    >
                      <Edit2 size={14} className="text-[#7A7A7A]" />
                    </button>
                    <button
                      onClick={() => onRemoveUser(user)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                      title={t('roles.usersManagement.removeFromRole')}
                    >
                      <UserX size={14} className="text-rose-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RoleUsersModal;