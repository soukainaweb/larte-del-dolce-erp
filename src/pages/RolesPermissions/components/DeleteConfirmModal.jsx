// src/pages/RolesPermissions/components/DeleteConfirmModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, role, isLoading }) => {
  const { t } = useTranslation();

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 rounded-full mb-4">
          <Trash2 size={32} className="text-rose-500" />
        </div>

        <h3 className="text-xl font-bold text-[#2B2B2B] text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {t('roles.modals.deleteTitle')}
        </h3>

        <p className="text-sm text-[#7A7A7A] text-center mt-2">
          {t('roles.modals.deleteMessage', { name: role.name })}
        </p>

        {role.users > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              {t('roles.modals.deleteUsersWarning', { count: role.users })}
            </p>
          </div>
        )}

        <p className="text-sm text-[#7A7A7A] text-center mt-2">
          {t('roles.modals.irreversible')}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmModal;
