// src/pages/RolesPermissions/components/ViewRoleModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Shield,
  Calendar,
  Clock,
  Crown,
  User,
  Briefcase,
  Eye,
  Edit2,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  DollarSign, // ⭐ AJOUTÉ
  Factory,    // ⭐ AJOUTÉ
  Truck,      // ⭐ AJOUTÉ
  FileText,   // ⭐ AJOUTÉ
  CreditCard, // ⭐ AJOUTÉ
  BarChart3,  // ⭐ AJOUTÉ
  PieChart,   // ⭐ AJOUTÉ
  Bell,       // ⭐ AJOUTÉ
  Settings,   // ⭐ AJOUTÉ
  LayoutDashboard,
  ClipboardList,
  Package
} from 'lucide-react';
import { getRoleUsers } from '../../../services/roleService';

const ViewRoleModal = ({ isOpen, onClose, role, onEdit, onUsers, onPermissions }) => {
  const [activeTab, setActiveTab] = useState('informations');
  const [roleUsers, setRoleUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !role?.id) return;

    let cancelled = false;
    setUsersLoading(true);

    getRoleUsers(role.id)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
        setRoleUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRoleUsers([]);
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, role?.id]);

  if (!isOpen || !role) return null;

  const tabs = [
    { id: 'informations', label: 'Informations' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'history', label: 'Historique' }
  ];

  const getIconByName = (iconName) => {
    const icons = {
      Crown: Crown,
      DollarSign: DollarSign,
      Factory: Factory,
      Users: Users,
      Truck: Truck,
      Briefcase: Briefcase,
      User: User,
      Shield: Shield
    };
    const Icon = icons[iconName] || Shield;
    return <Icon size={24} style={{ color: role.color }} />;
  };

  // Role history comes from activity logs when available
  const history = role?.history ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] border flex items-center justify-center" style={{ borderColor: role.color + '40' }}>
              {getIconByName(role.icon)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {role.name}
              </h3>
              <p className="text-sm text-[#7A7A7A]">{role.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-[#EAE6DF] flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#C8A45D] text-[#C8A45D]'
                  : 'border-transparent text-[#7A7A7A] hover:text-[#2B2B2B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'informations' && (
              <motion.div
                key="informations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F7F4] rounded-xl p-4">
                    <p className="text-xs text-[#7A7A7A]">Nom</p>
                    <p className="font-medium text-[#2B2B2B]">{role.name}</p>
                  </div>
                  <div className="bg-[#F8F7F4] rounded-xl p-4">
                    <p className="text-xs text-[#7A7A7A]">Statut</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      role.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {role.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="bg-[#F8F7F4] rounded-xl p-4">
                    <p className="text-xs text-[#7A7A7A]">Date de création</p>
                    <p className="font-medium text-[#2B2B2B]">{role.createdAt}</p>
                  </div>
                  <div className="bg-[#F8F7F4] rounded-xl p-4">
                    <p className="text-xs text-[#7A7A7A]">Dernière modification</p>
                    <p className="font-medium text-[#2B2B2B]">{role.updatedAt}</p>
                  </div>
                </div>
                <div className="bg-[#F8F7F4] rounded-xl p-4">
                  <p className="text-xs text-[#7A7A7A]">Description</p>
                  <p className="font-medium text-[#2B2B2B]">{role.description || 'Aucune description'}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'permissions' && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {['Dashboard', 'Commandes', 'Clients', 'Produits', 'Production', 'Inventaire'].map((module) => (
                    <div key={module} className="bg-[#F8F7F4] rounded-xl p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2B2B2B]">{module}</span>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#7A7A7A] text-center">
                  {role.permissions} permissions disponibles
                </p>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {usersLoading ? (
                  <p className="text-sm text-[#7A7A7A] text-center py-4">...</p>
                ) : roleUsers.length === 0 ? (
                  <p className="text-sm text-[#7A7A7A] text-center py-4">Aucun utilisateur associé</p>
                ) : (
                  roleUsers.map((user) => (
                    <div key={user.id} className="bg-[#F8F7F4] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C8A45D]/20 flex items-center justify-center">
                          <User size={14} className="text-[#C8A45D]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2B2B2B]">{user.name}</p>
                          <p className="text-xs text-[#7A7A7A]">{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-[#F8F7F4] last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#C8A45D] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#2B2B2B]">
                        <span className="font-semibold">{item.user}</span> {item.action}
                      </p>
                      <p className="text-xs text-[#7A7A7A]">{item.date} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#EAE6DF] flex gap-3">
          <button
            onClick={() => { onClose(); onEdit(role); }}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Edit2 size={16} />
            Modifier
          </button>
          <button
            onClick={() => { onClose(); onUsers(role); }}
            className="flex-1 py-2.5 text-sm font-medium text-[#2B2B2B] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Utilisateurs
          </button>
          <button
            onClick={() => { onClose(); onPermissions(role); }}
            className="flex-1 py-2.5 text-sm font-medium text-[#2B2B2B] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            Permissions
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewRoleModal;