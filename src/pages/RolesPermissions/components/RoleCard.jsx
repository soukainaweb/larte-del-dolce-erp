// src/pages/RolesPermissions/components/RoleCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  DollarSign,
  Factory,
  Users,
  Truck,
  Briefcase,
  User,
  Shield,
  Eye,
  Edit2,
  Copy,
  UserPlus,
  ShieldCheck,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';

const RoleCard = ({
  role,
  onView,
  onEdit,
  onDuplicate,
  onUsers,
  onPermissions,
  onDelete
}) => {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const statusLabels = {
    active: 'Actif',
    inactive: 'Inactif'
  };

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
    return <Icon size={22} style={{ color: role.color }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl bg-[#F8F7F4] border flex items-center justify-center"
            style={{ borderColor: role.color + '40' }}
          >
            {getIconByName(role.icon)}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2B2B2B]">{role.name}</h3>
            <p className="text-xs text-[#7A7A7A] line-clamp-1">{role.description}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[role.status] || statusColors.inactive}`}>
          {statusLabels[role.status] || 'Inactif'}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="bg-[#F8F7F4] rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-[#2B2B2B]">{role.users}</p>
          <p className="text-[9px] text-[#7A7A7A]">Utilisateurs</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-[#2B2B2B]">{role.permissions}</p>
          <p className="text-[9px] text-[#7A7A7A]">Permissions</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] text-[#7A7A7A]">
            <Calendar size={10} />
            <span>Créé</span>
          </div>
          <p className="text-[10px] font-medium text-[#2B2B2B]">{role.createdAt}</p>
        </div>
        <div className="bg-[#F8F7F4] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] text-[#7A7A7A]">
            <Clock size={10} />
            <span>Modifié</span>
          </div>
          <p className="text-[10px] font-medium text-[#2B2B2B]">{role.updatedAt}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(role)}
            className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
            title="Voir"
          >
            <Eye size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
          </button>
          <button
            onClick={() => onEdit(role)}
            className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
          </button>
          <button
            onClick={() => onDuplicate(role)}
            className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
            title="Dupliquer"
          >
            <Copy size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUsers(role)}
            className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
            title="Utilisateurs"
          >
            <UserPlus size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
          </button>
          <button
            onClick={() => onPermissions(role)}
            className="p-2 rounded-xl hover:bg-[#F8F7F4] transition-colors group"
            title="Permissions"
          >
            <ShieldCheck size={16} className="text-[#7A7A7A] group-hover:text-[#C8A45D] transition-colors" />
          </button>
          <button
            onClick={() => onDelete(role)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors group"
            title="Supprimer"
          >
            <Trash2 size={16} className="text-[#7A7A7A] group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ⭐ AJOUTER L'EXPORT PAR DÉFAUT
export default RoleCard;