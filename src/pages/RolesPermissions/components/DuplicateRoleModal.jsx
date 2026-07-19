// src/pages/RolesPermissions/components/DuplicateRoleModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Square,
  Users,
  Shield
} from 'lucide-react';

const DuplicateRoleModal = ({ isOpen, onClose, role, onDuplicate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    copyPermissions: true,
    copyUsers: false
  });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (role) {
      setFormData(prev => ({
        ...prev,
        name: `${role.name} (Copie)`
      }));
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      setErrors({ name: 'Le nom est requis' });
      return;
    }
    onDuplicate(formData);
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Dupliquer le rôle
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">
              Nouveau nom *
            </label>
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#2B2B2B] cursor-pointer">
              <input
                type="checkbox"
                name="copyPermissions"
                checked={formData.copyPermissions}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#EAE6DF] text-[#C8A45D] focus:ring-[#C8A45D]/30"
              />
              <Shield size={16} className="text-[#7A7A7A]" />
              Copier les permissions
            </label>
            <label className="flex items-center gap-2 text-sm text-[#2B2B2B] cursor-pointer">
              <input
                type="checkbox"
                name="copyUsers"
                checked={formData.copyUsers}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#EAE6DF] text-[#C8A45D] focus:ring-[#C8A45D]/30"
              />
              <Users size={16} className="text-[#7A7A7A]" />
              Copier les utilisateurs
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#EAE6DF]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              {isLoading ? 'Duplication...' : 'Dupliquer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DuplicateRoleModal;