// src/pages/Warehouse/WarehousePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Box,
  Layers,
  Grid,
  List,
  MapPin,
  User,
  Package,
  DollarSign,
  Building,
  Archive,
  ArrowRightLeft,
  MoreHorizontal,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ScopedExportButtons from '../../components/export/ScopedExportButtons';
import { useToast } from '../../contexts/ToastContext';
import { safeArray, ensureArray, getApiErrorMessage } from '../../utils/apiHelpers';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
  transferProducts,
  exportWarehouses,
  getWarehouseTypes,
  getWarehouseStatuses
} from '../../services/warehouseService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';
const CURRENCY_SYMBOL = 'ر.س';

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return `0 ${CURRENCY_SYMBOL}`;
  return `${amount.toLocaleString(DATE_LOCALE)} ${CURRENCY_SYMBOL}`;
};

const getWarehouseProductCount = (warehouse) =>
  Number(warehouse?.productCount ?? warehouse?.product_count ?? warehouse?.items_count ?? 0) || 0;

const getWarehouseStockValue = (warehouse) =>
  Number(warehouse?.stockValue ?? warehouse?.stock_value ?? warehouse?.inventory_value ?? 0) || 0;

const isWarehouseActive = (warehouse) =>
  warehouse?.status === 'active' || warehouse?.is_active === true || warehouse?.isActive === true;

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('warehouse');
  const statusConfig = {
    active: { label: tc('active'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: tc('inactive'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
    maintenance: { label: t('warehouse.status.maintenance'), class: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// WAREHOUSE TYPE BADGE
// ==========================================
const WarehouseTypeBadge = ({ type }) => {
  const { t, tc } = usePageI18n('warehouse');
  const typeConfig = {
    raw: { label: t('suppliers.types.raw'), class: 'bg-purple-50 text-purple-700 border-purple-200' },
    finished: { label: t('warehouse.types.finished'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
    packaging: { label: t('suppliers.types.packaging'), class: 'bg-teal-50 text-teal-700 border-teal-200' },
    other: { label: t('suppliers.types.other'), class: 'bg-gray-50 text-gray-700 border-gray-200' }
  };

  const config = typeConfig[type] || typeConfig.other;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    gold: 'bg-amber-50 text-amber-600'
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={18} />
        </div>
        {subtitle && (
          <span className="text-[10px] font-medium text-[#6D6D6D]">{subtitle}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#3D2F24] mt-2">{value}</p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
    </motion.div>
  );
};

// ==========================================
// WAREHOUSE CARD (Mobile)
// ==========================================
const WarehouseCard = ({ warehouse, onView, onEdit, onDelete, onToggleStatus }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('warehouse');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center">
            <Building size={24} className="text-[#6D6D6D]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{warehouse.name}</p>
            <p className="text-xs text-[#6D6D6D]">{warehouse.code}</p>
          </div>
        </div>
        <StatusBadge status={warehouse.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <WarehouseTypeBadge type={warehouse.type} />
        {warehouse.isDefault && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
            <Star size={10} className="inline mr-1" />
            {t('warehouse.fields.primary')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          {warehouse.location || tc('notProvided')}
        </div>
        <div className="flex items-center gap-1">
          <Package size={12} />
          {warehouse.productCount} {t('orders.table.products')}
        </div>
        <div className="flex items-center gap-1">
          <User size={12} />
          {warehouse.manager || t('warehouse.fields.notAssigned')}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {formatCurrency(getWarehouseStockValue(warehouse))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(warehouse.createdAt).toLocaleDateString(DATE_LOCALE)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(warehouse)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(warehouse)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onToggleStatus(warehouse)} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
            {warehouse.status === 'active' ? <Archive size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
          </button>
          <button onClick={() => onDelete(warehouse)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// WAREHOUSE TABLE ROW (Desktop)
// ==========================================
const WarehouseTableRow = ({ warehouse, onView, onEdit, onDelete, onToggleStatus, index }) => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('warehouse');
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center">
            <Building size={18} className="text-[#6D6D6D]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{warehouse.name}</p>
            <p className="text-xs text-[#6D6D6D]">{warehouse.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <WarehouseTypeBadge type={warehouse.type} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{warehouse.location || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{warehouse.manager || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{getWarehouseProductCount(warehouse)}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {formatCurrency(getWarehouseStockValue(warehouse))}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={warehouse.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(warehouse)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(warehouse)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onToggleStatus(warehouse)}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
            title={warehouse.status === 'active' ? tc('deactivate') : tc('activate')}
          >
            {warehouse.status === 'active' ? <Archive size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
          </button>
          <button
            onClick={() => onDelete(warehouse)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title={actions.delete}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// WAREHOUSE MODAL
// ==========================================
const WarehouseModal = ({ isOpen, onClose, onSave, warehouse, isLoading }) => {
  const { t, tc } = usePageI18n('warehouse');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'finished',
    location: '',
    manager: '',
    description: '',
    status: 'active',
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        type: warehouse.type || 'finished',
        location: warehouse.location || '',
        manager: warehouse.manager || '',
        description: warehouse.description || '',
        status: warehouse.status || 'active',
        isDefault: warehouse.isDefault || false
      });
    } else {
      setFormData({
        name: '',
        code: `WH-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        type: 'finished',
        location: '',
        manager: '',
        description: '',
        status: 'active',
        isDefault: false
      });
    }
  }, [warehouse]);

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
    const newErrors = {};
    if (!formData.name) newErrors.name = t('warehouse.validation.nameRequired');
    if (!formData.code) newErrors.code = t('warehouse.validation.codeRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  const managers = ['Ahmed Benjelloun', 'Sara El Idrissi', 'Mohamed Amine'];

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {warehouse ? t('warehouse.modals.editTitle') : t('warehouse.addWarehouse')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('name')} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.name ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.fields.code')} *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.code ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('type')}</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="raw">{t('warehouse.types.raw')}</option>
                <option value="finished">{t('warehouse.types.finished')}</option>
                <option value="packaging">{t('warehouse.types.packaging')}</option>
                <option value="other">{t('suppliers.types.other')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.table.location')}</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              placeholder={t('warehouse.placeholders.location')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.fields.manager')}</label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="">{t('warehouse.placeholders.selectManager')}</option>
              {ensureArray(managers).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder={t('warehouse.placeholders.description')}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">
                <Star size={14} className="inline mr-1 text-amber-500" />
                {t('warehouse.fields.defaultWarehouse')}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
              <option value="maintenance">{t('warehouse.status.maintenance')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? tc('saving') : warehouse ? tc('update') : tc('add')}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, warehouse, isLoading }) => {
  const { t, tc } = usePageI18n('warehouse');
  if (!isOpen) return null;

  const hasProducts = getWarehouseProductCount(warehouse) > 0;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
          {t('warehouse.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {hasProducts ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ {tc('attention')}</span><br />
              {t('warehouse.modals.deleteWarning', { count: getWarehouseProductCount(warehouse) })}
            </>
          ) : (
            <>
              {t('warehouse.modals.deleteMessage', { name: warehouse?.name })}{' '}
              {tc('irreversibleAction')}
            </>
          )}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || hasProducts}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              hasProducts ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {hasProducts ? tc('impossible') : isLoading ? tc('deleting') : tc('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW WAREHOUSE MODAL
// ==========================================
const ViewWarehouseModal = ({ isOpen, onClose, warehouse }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('warehouse');
  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('warehouse.modals.detailsTitle')}
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
            <div className="w-16 h-16 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center">
              <Building size={32} className="text-[#6D6D6D]" />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#3D2F24]">{warehouse.name}</p>
              <p className="text-sm text-[#6D6D6D]">{warehouse.code}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={warehouse.status} />
                <WarehouseTypeBadge type={warehouse.type} />
                {warehouse.isDefault && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    <Star size={12} className="inline mr-1" />
                    {t('warehouse.fields.primary')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{tc('product')}</p>
              <p className="text-xl font-bold text-[#3D2F24]">{getWarehouseProductCount(warehouse)}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{t('warehouse.fields.stockValue')}</p>
              <p className="text-xl font-bold text-[#3D2F24]">{formatCurrency(getWarehouseStockValue(warehouse))}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{t('warehouse.fields.manager')}</p>
              <p className="text-sm font-medium text-[#3D2F24]">{warehouse.manager || t('warehouse.fields.notAssigned')}</p>
            </div>
          </div>

          {warehouse.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{warehouse.location}</span>
            </div>
          )}

          {warehouse.description && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('description')}</p>
              <p className="text-sm text-[#3D2F24]">{warehouse.description}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            {tc('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// TRANSFER MODAL
// ==========================================
const TransferModal = ({ isOpen, onClose, onTransfer, warehouses, isLoading }) => {
  const { t, tc } = usePageI18n('warehouse');
  const [formData, setFormData] = useState({
    fromWarehouse: '',
    toWarehouse: '',
    product: '',
    quantity: 1,
    reason: ''
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.fromWarehouse) newErrors.fromWarehouse = t('warehouse.validation.fromWarehouseRequired');
    if (!formData.toWarehouse) newErrors.toWarehouse = t('warehouse.validation.toWarehouseRequired');
    if (!formData.product) newErrors.product = t('warehouse.validation.productRequired');
    if (formData.quantity < 1) newErrors.quantity = t('warehouse.validation.quantityRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onTransfer(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('warehouse.transfer.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.transfer.fromWarehouse')}</label>
            <select
              name="fromWarehouse"
              value={formData.fromWarehouse}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.fromWarehouse ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="">{tc('selectOption')}</option>
              {ensureArray(warehouses).map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.fromWarehouse && <p className="text-xs text-rose-500 mt-1">{errors.fromWarehouse}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.transfer.toWarehouse')}</label>
            <select
              name="toWarehouse"
              value={formData.toWarehouse}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.toWarehouse ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="">{tc('selectOption')}</option>
              {ensureArray(warehouses).map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.toWarehouse && <p className="text-xs text-rose-500 mt-1">{errors.toWarehouse}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.product')}</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.product ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="">{tc('selectOption')}</option>
            </select>
            {errors.product && <p className="text-xs text-rose-500 mt-1">{errors.product}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('quantity')}</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.quantity ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('warehouse.transfer.reason')}</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder={t('warehouse.transfer.reasonPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? tc('saving') : t('warehouse.transfer.submit')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN WAREHOUSE PAGE
// ==========================================
const WarehousePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('warehouse');

  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [allWarehouses, setAllWarehouses] = useState([]);

  const fetchAllWarehousesForKpi = async () => {
    try {
      const response = await getWarehouses({ per_page: 500, page: 1 });
      setAllWarehouses(safeArray(response));
    } catch (error) {
      console.error('Error fetching warehouse KPI data:', error);
      setAllWarehouses([]);
    }
  };

  // Load warehouses
  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'createdAt',
        sort_order: 'desc'
      };
      const response = await getWarehouses(params);
      const data = safeArray(response);
      setWarehouses(data);
      setTotalCount(response.data?.meta?.total ?? data.length);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setWarehouses([]);
      setTotalCount(0);
      showToast(getApiErrorMessage(error, t('warehouse.errors.load', t('errors.loadFailed'))), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage, itemsPerPage, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    fetchAllWarehousesForKpi();
  }, []);

  const kpis = useMemo(() => {
    const list = ensureArray(allWarehouses);
    return {
      total: totalCount || list.length,
      active: list.filter(isWarehouseActive).length,
      totalProducts: list.reduce((sum, warehouse) => sum + getWarehouseProductCount(warehouse), 0),
      totalValue: list.reduce((sum, warehouse) => sum + getWarehouseStockValue(warehouse), 0),
    };
  }, [allWarehouses, totalCount]);

  // Filter warehouses (client-side for demo, API already handles filters)
  const filteredWarehouses = useMemo(() => ensureArray(warehouses), [warehouses]);

  // Paginate
  const paginatedWarehouses = useMemo(() => ensureArray(filteredWarehouses), [filteredWarehouses]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage) || 1;
  }, [totalCount, itemsPerPage]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: t('warehouse.table.name'), accessor: 'name', width: 18 },
    { label: t('warehouse.fields.code'), accessor: 'code', width: 10 },
    { label: tc('type'), accessor: 'type', width: 14 },
    { label: t('warehouse.table.location'), accessor: 'location', width: 18 },
    { label: t('warehouse.fields.manager'), accessor: 'manager', width: 14 },
    { label: t('warehouse.table.items'), accessor: 'productCount', width: 10 },
    { label: t('warehouse.fields.stockValue'), accessor: 'stockValue', width: 14 },
    { label: tc('status'), accessor: 'status', width: 12 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    code: item.code,
    type: item.type === 'raw' ? t('suppliers.types.raw') :
          item.type === 'finished' ? t('warehouse.types.finished') :
          item.type === 'packaging' ? t('suppliers.types.packaging') : t('suppliers.types.other'),
    location: item.location || '—',
    manager: item.manager || '—',
    productCount: getWarehouseProductCount(item),
    stockValue: formatCurrency(getWarehouseStockValue(item)),
    status: item.status === 'active' ? tc('active') :
            item.status === 'inactive' ? tc('inactive') : t('warehouse.status.maintenance')
  });

  const summary = [
    { label: t('warehouse.kpi.totalWarehouses'), value: kpis.total },
    { label: t('warehouse.kpi.active'), value: kpis.active },
    { label: t('warehouse.table.items'), value: kpis.totalProducts },
    { label: t('warehouse.fields.stockValue'), value: formatCurrency(kpis.totalValue) }
  ];

  const warehouseExportContext = useMemo(
    () => ({
      filters: {
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      },
    }),
    [searchTerm, statusFilter, typeFilter]
  );

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ScopedExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ScopedExportButtons
  };

  // Handlers
  const handleCreateWarehouse = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createWarehouse(formData);
      const newWarehouse = response.data.data;
      setWarehouses(prev => [newWarehouse, ...prev]);
      setIsCreateModalOpen(false);
      await fetchAllWarehousesForKpi();
    } catch (error) {
      console.error('Error creating warehouse:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditWarehouse = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateWarehouse(selectedWarehouse.id, formData);
      const updatedWarehouse = response.data.data;
      setWarehouses(prev => prev.map(w =>
        w.id === selectedWarehouse.id ? updatedWarehouse : w
      ));
      setIsEditModalOpen(false);
      setSelectedWarehouse(null);
      await fetchAllWarehousesForKpi();
    } catch (error) {
      console.error('Error updating warehouse:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (getWarehouseProductCount(selectedWarehouse) > 0) return;
    setIsSaving(true);
    try {
      await deleteWarehouse(selectedWarehouse.id);
      setWarehouses(prev => prev.filter(w => w.id !== selectedWarehouse.id));
      setIsDeleteModalOpen(false);
      setSelectedWarehouse(null);
      await fetchAllWarehousesForKpi();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (warehouse) => {
    const newStatus = warehouse.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await updateWarehouseStatus(warehouse.id, { status: newStatus });
      const updatedWarehouse = response.data.data;
      setWarehouses(prev => prev.map(w =>
        w.id === warehouse.id ? updatedWarehouse : w
      ));
      await fetchAllWarehousesForKpi();
    } catch (error) {
      console.error('Error toggling warehouse status:', error);
    }
  };

  const handleTransfer = async (formData) => {
    setIsSaving(true);
    try {
      await transferProducts(formData);
      setIsTransferModalOpen(false);
      await fetchAllWarehousesForKpi();
    } catch (error) {
      console.error('Error transferring:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchWarehouses();
    fetchAllWarehousesForKpi();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(ensureArray(warehouses).map(w => w.type));
    return Array.from(types);
  }, [warehouses]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {title}
          </h1>
          <p className="text-sm text-[#6D6D6D]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ScopedExportButtons
            pageId="warehouse"
            pageContext={warehouseExportContext}
            columns={columns}
            title={t('warehouse.export.title')}
            subtitle={t('warehouse.export.subtitle', { count: filteredWarehouses.length, value: formatCurrency(kpis.totalValue) })}
            filename={`warehouses_${new Date().toISOString().split('T')[0]}`}
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
            <Plus size={18} />
            {t('warehouse.addWarehouse')}
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ECE8E1] bg-white text-[#3D2F24] font-medium hover:bg-[#F8F7F4] transition-all"
          >
            <ArrowRightLeft size={18} />
            {t('warehouse.actions.transfer')}
          </button>
          <div className="flex items-center gap-1 border border-[#ECE8E1] rounded-xl bg-white p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title={tc('tableView')}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title={tc('gridView')}
            >
              <Grid size={18} />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={actions.refresh}
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={Building} title={t('warehouse.kpi.totalWarehouses')} value={isLoading ? '—' : kpis.total} color="blue" />
        <KPICard icon={CheckCircle} title={t('warehouse.kpi.active')} value={isLoading ? '—' : kpis.active} color="emerald" />
        <KPICard icon={Package} title={t('warehouse.table.items')} value={isLoading ? '—' : kpis.totalProducts} color="purple" />
        <KPICard icon={DollarSign} title={t('warehouse.fields.stockValue')} value={isLoading ? '—' : formatCurrency(kpis.totalValue)} color="gold" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-[#F8F7F4] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allTypes')}</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'raw' ? t('suppliers.types.raw') :
                   type === 'finished' ? t('warehouse.types.finished') :
                   type === 'packaging' ? t('suppliers.types.packaging') : t('suppliers.types.other')}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
              <option value="maintenance">{t('warehouse.status.maintenance')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warehouses Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('warehouse.table.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('type')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('warehouse.table.location')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('warehouse.fields.manager')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('product')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('warehouse.table.value')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.warehouse') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('warehouse.empty')}</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('warehouse.addWarehouse')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ensureArray(paginatedWarehouses).map((warehouse, index) => (
                    <WarehouseTableRow
                      key={warehouse.id}
                      warehouse={warehouse}
                      index={index}
                      onView={(w) => {
                        setSelectedWarehouse(w);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(w) => {
                        setSelectedWarehouse(w);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(w) => {
                        setSelectedWarehouse(w);
                        setIsDeleteModalOpen(true);
                      }}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouses Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.warehouse') })}</p>
            </div>
          ) : paginatedWarehouses.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Building size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('warehouse.empty')}</p>
            </div>
          ) : (
            ensureArray(paginatedWarehouses).map((warehouse) => (
              <WarehouseCard
                key={warehouse.id}
                warehouse={warehouse}
                onView={(w) => {
                  setSelectedWarehouse(w);
                  setIsViewModalOpen(true);
                }}
                onEdit={(w) => {
                  setSelectedWarehouse(w);
                  setIsEditModalOpen(true);
                }}
                onDelete={(w) => {
                  setSelectedWarehouse(w);
                  setIsDeleteModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      )}

      {/* Warehouses Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.warehouse') })}</p>
          </div>
        ) : paginatedWarehouses.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Building size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('warehouse.empty')}</p>
          </div>
        ) : (
          ensureArray(paginatedWarehouses).map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              onView={(w) => {
                setSelectedWarehouse(w);
                setIsViewModalOpen(true);
              }}
              onEdit={(w) => {
                setSelectedWarehouse(w);
                setIsEditModalOpen(true);
              }}
              onDelete={(w) => {
                setSelectedWarehouse(w);
                setIsDeleteModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredWarehouses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            {t('common.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('common.of')}{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} {t('common.of')} {totalCount}
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
              {t('warehouse.pagination.pageOf', { current: currentPage, total: totalPages })}
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
          <WarehouseModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateWarehouse}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedWarehouse && (
          <WarehouseModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedWarehouse(null);
            }}
            onSave={handleEditWarehouse}
            warehouse={selectedWarehouse}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedWarehouse && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedWarehouse(null);
            }}
            onConfirm={handleDeleteWarehouse}
            warehouse={selectedWarehouse}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedWarehouse && (
          <ViewWarehouseModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedWarehouse(null);
            }}
            warehouse={selectedWarehouse}
          />
        )}

        {isTransferModalOpen && (
          <TransferModal
            key="transfer-modal"
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            onTransfer={handleTransfer}
            warehouses={warehouses}
            isLoading={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehousePage;