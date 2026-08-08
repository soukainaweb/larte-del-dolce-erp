// src/pages/RolesPermissions/components/EditRoleModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  RotateCcw,
  Shield,
  Crown,
  DollarSign,
  Factory,
  Users,
  Truck,
  Briefcase,
  User as UserIcon
} from 'lucide-react';
import { usePageI18n } from '../../../hooks/usePageI18n';

const EditRoleModal = ({ isOpen, onClose, onSave, role, isLoading }) => {
  const { t, tc } = usePageI18n('roles');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#C8A45D',
    icon: 'Shield',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        color: role.color || '#C8A45D',
        icon: role.icon || 'Shield',
        status: role.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#C8A45D',
        icon: 'Shield',
        status: 'active'
      });
    }
  }, [role]);

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
    if (!formData.name) newErrors.name = t('roles.usersManagement.nameRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  const handleReset = () => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        color: role.color || '#C8A45D',
        icon: role.icon || 'Shield',
        status: role.status || 'active'
      });
    }
    setErrors({});
  };

  if (!isOpen) return null;

  const iconOptions = [
    { value: 'Shield', icon: Shield },
    { value: 'Crown', icon: Crown },
    { value: 'DollarSign', icon: DollarSign },
    { value: 'Factory', icon: Factory },
    { value: 'Users', icon: Users },
    { value: 'Truck', icon: Truck },
    { value: 'Briefcase', icon: Briefcase },
    { value: 'User', icon: UserIcon }
  ];

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {role ? t('roles.modals.editTitle') : t('roles.modals.createTitle')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{tc('name')} *</label>
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

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{tc('description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.modals.color')}</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full h-10 px-2 py-1 border border-[#EAE6DF] rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{t('roles.modals.icon')}</label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
              >
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <option key={opt.value} value={opt.value}>
                      {opt.value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7A7A] mb-1.5 uppercase tracking-wide">{tc('status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A45D]/30 focus:border-[#C8A45D] transition-all"
            >
              <option value="active">{tc('active')}</option>
              <option value="inactive">{tc('inactive')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#EAE6DF]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-4 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} />
              {t('roles.modals.reset')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {isLoading ? tc('saving') : role ? tc('update') : tc('create')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditRoleModal;