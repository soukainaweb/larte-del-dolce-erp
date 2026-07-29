import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users as UsersIcon, Eye, Edit2, Trash2 } from 'lucide-react';
import { getRoleDisplayName } from '../../utils/roleMapping';
import { formatAppDate } from '../../utils/dateFormat';
import { getUserInitials } from '../../utils/userMapper';
import type { UserRow, UserTableProps } from '../types/user';
import type { SupportedLanguage } from '../types/i18n';

const FONT_NUMBER = "'Inter', sans-serif";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();
  const statusConfig: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
    suspended: 'bg-amber-50 text-amber-700 border-amber-200',
    locked: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const label = t(`users.status.${status}`, { defaultValue: status });
  const className = statusConfig[status] ?? statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  );
};

interface RoleBadgeProps {
  role: UserRow['role'];
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const roleLabel = getRoleDisplayName(role);
  const roleColors: Record<string, string> = {
    Administrator: 'bg-[#B8863B]/10 text-[#B8863B] border-[#B8863B]/30',
    Accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    'Sales Representative': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Production Manager': 'bg-purple-50 text-purple-700 border-purple-200',
    'Factory Employee': 'bg-amber-50 text-amber-700 border-amber-200',
    'Warehouse Manager': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Delivery Driver': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Finance Manager': 'bg-rose-50 text-rose-700 border-rose-200',
    Manager: 'bg-slate-50 text-slate-700 border-slate-200',
    Viewer: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const color = roleColors[roleLabel] ?? roleColors.Viewer;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {roleLabel}
    </span>
  );
};

interface UserTableRowProps {
  user: UserRow;
  index: number;
  locale: SupportedLanguage;
  isRTL: boolean;
  onView: (user: UserRow) => void;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  index,
  locale,
  isRTL,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const actionsAlign = isRTL ? 'justify-start' : 'justify-end';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className={`px-4 py-3 ${textAlign}`}>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] font-bold text-sm shrink-0">
            {getUserInitials(user)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3D2F24] truncate">{user.fullName}</p>
            <p className="text-[11px] text-[#6D6D6D] truncate">
              {user.firstName} · {user.lastName}
            </p>
          </div>
        </div>
      </td>
      <td className={`px-4 py-3 text-sm text-[#6D6D6D] ${textAlign}`}>{user.email || '—'}</td>
      <td className={`px-4 py-3 ${textAlign}`}>
        <RoleBadge role={user.role} />
      </td>
      <td className={`px-4 py-3 ${textAlign}`}>
        <StatusBadge status={user.status} />
      </td>
      <td className={`px-4 py-3 text-sm text-[#6D6D6D] ${textAlign}`} style={{ fontFamily: FONT_NUMBER }}>
        {formatAppDate(user.createdAt, locale)}
      </td>
      <td className={`px-4 py-3 ${isRTL ? 'text-left' : 'text-right'}`}>
        <div className={`flex items-center gap-1 ${actionsAlign}`}>
          <button
            type="button"
            onClick={() => onView(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={t('common.view')}
            aria-label={t('common.view')}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={t('common.edit')}
            aria-label={t('common.edit')}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title={t('common.delete')}
            aria-label={t('common.delete')}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const UsersTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  isRTL,
  locale,
  onView,
  onEdit,
  onDelete,
  onAddUser,
}) => {
  const { t } = useTranslation();
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const headerCell = `px-4 py-3 ${textAlign} text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider`;

  return (
    <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
              <th className={headerCell}>{t('users.table.user')}</th>
              <th className={headerCell}>{t('users.table.email')}</th>
              <th className={headerCell}>{t('users.table.role')}</th>
              <th className={headerCell}>{t('users.table.status')}</th>
              <th className={headerCell}>{t('users.table.registeredAt')}</th>
              <th className={`${headerCell} ${isRTL ? 'text-left' : 'text-right'}`}>{t('users.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#6D6D6D]">{t('users.loadingUsers')}</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <UsersIcon size={40} className="text-[#ECE8E1]" />
                    <p className="text-sm text-[#6D6D6D]">{t('users.noUsers')}</p>
                    <button
                      type="button"
                      onClick={onAddUser}
                      className="text-sm text-[#B8863B] font-medium hover:underline"
                    >
                      {t('users.addUser')}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  index={index}
                  locale={locale}
                  isRTL={isRTL}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
export { StatusBadge, RoleBadge };
