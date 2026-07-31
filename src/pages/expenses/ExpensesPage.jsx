// src/pages/Expenses/ExpensesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
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
  User,
  DollarSign,
  Package,
  Grid,
  List,
  Archive,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Apple,
  Sparkles,
  FileText,
  Building,
  MoreHorizontal,
  Tag,
  Percent,
  Truck,
  CheckSquare,
  XCircle,
  Users,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Clock,
  Upload,
  FolderTree,
  Box,
  Settings,
  Wrench,
  Zap,
  Megaphone,
  Handshake,
  Printer
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import { useTranslation } from 'react-i18next';
import ExportButtons from '../../components/ExportButtons';
import {
  getExpenses,
  getExpenseById,
  getExpenseByNumber,
  createExpense,
  updateExpense,
  deleteExpense,
  updateExpensePaymentStatus,
  getExpenseStatistics,
  exportExpenses,
} from '../../services/expenseService';
import { safeArray, ensureArray } from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR (ر.س)';

const buildExpenseCategoryOptions = (t) => [
  { value: 'raw_materials', label: t('suppliers.types.raw'), icon: Package, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'packaging', label: t('suppliers.types.packaging'), icon: Box, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'equipment', label: t('suppliers.types.equipment'), icon: Settings, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'maintenance', label: t('expenses.categories.maintenance'), icon: Wrench, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'utilities', label: t('expenses.categories.utilities'), icon: Zap, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'rent', label: t('expenses.categories.rent'), icon: Building, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'salaries', label: t('expenses.categories.salaries'), icon: Users, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'transportation', label: t('expenses.categories.transportation'), icon: Truck, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'marketing', label: t('expenses.categories.marketing'), icon: Megaphone, color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'office_supplies', label: t('expenses.categories.office_supplies'), icon: ClipboardList, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'services', label: t('suppliers.types.services'), icon: Handshake, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'taxes', label: t('expenses.categories.taxes'), icon: FileText, color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'other', label: t('suppliers.types.other'), icon: MoreHorizontal, color: 'bg-gray-50 text-gray-600 border-gray-200' }
];

const buildPaymentMethodOptions = (t) => [
  { value: 'cash', label: t('common.paymentMethods.cash'), icon: Banknote },
  { value: 'card', label: t('common.paymentMethods.card'), icon: CreditCard },
  { value: 'mada', label: t('common.paymentMethods.mada'), icon: CreditCard },
  { value: 'stc_pay', label: t('common.paymentMethods.stc_pay'), icon: Smartphone },
  { value: 'apple_pay', label: t('common.paymentMethods.apple_pay'), icon: Apple },
  { value: 'bank_transfer', label: t('common.paymentMethods.bank_transfer'), icon: Landmark },
  { value: 'cheque', label: t('common.paymentMethods.cheque'), icon: FileText }
];

const buildPaymentStatusOptions = (t) => [
  { value: 'paid', label: t('common.paymentStatus.paid'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pending', label: t('common.pending'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'partial', label: t('common.paymentStatus.partial'), class: 'bg-blue-50 text-blue-700 border-blue-200' }
];

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const paymentStatuses = buildPaymentStatusOptions(t);
  const config = paymentStatuses.find(s => s.value === status) || paymentStatuses[0];
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// CATEGORY BADGE
// ==========================================
const CategoryBadge = ({ category }) => {
  const { t } = useTranslation();
  const config = buildExpenseCategoryOptions(t).find(c => c.value === category);
  if (!config) return <span className="text-[10px] text-[#6D6D6D]">—</span>;
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PAYMENT METHOD BADGE
// ==========================================
const PaymentMethodBadge = ({ method }) => {
  const { t } = useTranslation();
  const config = buildPaymentMethodOptions(t).find(m => m.value === method);
  if (!config) return <span className="text-[10px] text-[#6D6D6D]">—</span>;
  const Icon = config.icon;
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#F8F7F4] text-[#3D2F24] border-[#ECE8E1]">
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// ==========================================
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, color, subtitle, isCurrency }) => {
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
      <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-[#3D2F24] mt-2">
        {isCurrency ? `${value.toLocaleString()} ${CURRENCY}` : value}
      </p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
      {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// ==========================================
// EXPENSE CARD (Mobile)
// ==========================================
const ExpenseCard = ({ expense, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#3D2F24]">{expense.expenseId}</p>
          <p className="text-xs text-[#6D6D6D]">{new Date(expense.date).toLocaleDateString(DATE_LOCALE)}</p>
        </div>
        <StatusBadge status={expense.paymentStatus} />
      </div>
      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={expense.category} />
        <PaymentMethodBadge method={expense.paymentMethod} />
      </div>
      <div>
        <p className="text-sm font-medium text-[#3D2F24]">{expense.description}</p>
        <p className="text-xs text-[#6D6D6D]">{expense.supplier || '—'}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[#3D2F24]">
          {expense.total.toLocaleString()} {CURRENCY}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(expense)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(expense)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(expense)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// EXPENSE TABLE ROW (Desktop)
// ==========================================
const ExpenseTableRow = ({ expense, onView, onEdit, onDelete, index }) => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('expenses');
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#3D2F24]">{expense.expenseId}</p>
        <p className="text-xs text-[#6D6D6D]">{new Date(expense.date).toLocaleDateString(DATE_LOCALE)}</p>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={expense.category} />
      </td>
      <td className="px-4 py-3 text-sm text-[#3D2F24]">{expense.description}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{expense.supplier || '—'}</td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {expense.amount.toLocaleString()} {CURRENCY}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{expense.vat}%</td>
      <td className="px-4 py-3 text-sm font-bold text-[#3D2F24]">
        {expense.total.toLocaleString()} {CURRENCY}
      </td>
      <td className="px-4 py-3">
        <PaymentMethodBadge method={expense.paymentMethod} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={expense.paymentStatus} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{expense.createdBy || '—'}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(expense)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(expense)}
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
// EXPENSE MODAL (Add/Edit)
// ==========================================
const ExpenseModal = ({ isOpen, onClose, onSave, expense, isLoading }) => {
  const { t, tc } = usePageI18n('expenses');
  const expenseCategories = buildExpenseCategoryOptions(t);
  const paymentMethods = buildPaymentMethodOptions(t);
  const paymentStatuses = buildPaymentStatusOptions(t);
  const [formData, setFormData] = useState({
    expenseNumber: `EXP-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    supplier: '',
    description: '',
    amount: 0,
    vat: 15,
    total: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    referenceNumber: '',
    notes: '',
    attachment: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        expenseNumber: expense.expenseId || `EXP-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense.category || 'other',
        supplier: expense.supplier || '',
        description: expense.description || '',
        amount: expense.amount || 0,
        vat: expense.vat || 15,
        total: expense.total || 0,
        paymentMethod: expense.paymentMethod || 'cash',
        paymentStatus: expense.paymentStatus || 'pending',
        referenceNumber: expense.referenceNumber || '',
        notes: expense.notes || '',
        attachment: expense.attachment || null
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => {
      const updated = { ...prev, [name]: numValue };
      if (name === 'amount' || name === 'vat') {
        const amount = name === 'amount' ? numValue : prev.amount;
        const vat = name === 'vat' ? numValue : prev.vat;
        const vatAmount = amount * (vat / 100);
        updated.total = amount + vatAmount;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachment: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.category) newErrors.category = t('expenses.validation.categoryRequired');
    if (!formData.description) newErrors.description = t('expenses.validation.descriptionRequired');
    if (formData.amount <= 0) newErrors.amount = t('expenses.validation.amountRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B8863B]/10 rounded-lg text-[#B8863B]">
              <Wallet size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
                {expense ? t('expenses.modals.editTitle') : t('expenses.modals.addTitle')}
              </h3>
              <p className="text-xs text-[#6D6D6D]">{t('expenses.modals.addSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.expenseNumber')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <FileText size={14} className="text-[#6D6D6D]" />
                <input
                  type="text"
                  name="expenseNumber"
                  value={formData.expenseNumber}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('date')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <Calendar size={14} className="text-[#6D6D6D]" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('category')} *</label>
              <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
                errors.category ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
                <FolderTree size={14} className="text-[#6D6D6D]" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  <option value="">{t('expenses.fields.selectCategory')}</option>
                  {expenseCategories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-[10px] text-rose-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.supplier')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <Building size={14} className="text-[#6D6D6D]" />
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  <option value="">{t('expenses.fields.selectSupplier')}</option>
                  <option value="Farine du Maroc">Farine du Maroc</option>
                  <option value="ABC Packaging">ABC Packaging</option>
                  <option value="Choco Deluxe">Choco Deluxe</option>
                  <option value="Equip Cafe">Equip Cafe</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('description')} *</label>
            <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
              errors.description ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
              <FileText size={14} className="text-[#6D6D6D]" />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                placeholder={tc('placeholders.expenseDescription')}
              />
            </div>
            {errors.description && <p className="text-[10px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('amount')} *</label>
              <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
                errors.amount ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
                <DollarSign size={14} className="text-[#6D6D6D]" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleNumberChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('vatPercent')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <Percent size={14} className="text-[#6D6D6D]" />
                <input
                  type="number"
                  name="vat"
                  value={formData.vat}
                  onChange={handleNumberChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.totalInclTax')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F8F7F4] border border-[#ECE8E1] rounded-lg">
                <DollarSign size={14} className="text-[#6D6D6D]" />
                <input
                  type="text"
                  value={`${formData.total.toFixed(2)} ${CURRENCY}`}
                  className="flex-1 text-sm bg-transparent text-[#3D2F24] font-bold"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('method')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <CreditCard size={14} className="text-[#6D6D6D]" />
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  {paymentMethods.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.paymentStatus')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <CheckCircle size={14} className="text-[#6D6D6D]" />
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  {paymentStatuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.referenceNumber')}</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
              <Tag size={14} className="text-[#6D6D6D]" />
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                placeholder={tc('placeholders.referenceNumber')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{t('expenses.fields.attachment')}</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg cursor-pointer hover:border-[#B8863B] transition-colors">
              <Upload size={14} className="text-[#6D6D6D]" />
              <input
                type="file"
                onChange={handleFileChange}
                className="flex-1 text-sm bg-transparent focus:outline-none text-[#6D6D6D]"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            {formData.attachment && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-[#F8F7F4] rounded-lg border border-[#ECE8E1]">
                <FileText size={14} className="text-emerald-500" />
                <span className="text-xs text-[#3D2F24]">{t('expenses.modals.attachedFile')}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">{tc('notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder={tc('placeholders.additionalInfo')}
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
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {tc('saving')}
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  {expense ? tc('update') : tc('save')}
                </>
              )}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, expense, isLoading }) => {
  const { t, tc } = usePageI18n('expenses');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
          {t('expenses.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {t('expenses.modals.deleteMessage', { id: expense?.expenseId })}{' '}
          {tc('irreversibleAction')}
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
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? tc('deleting') : tc('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW EXPENSE MODAL
// ==========================================
const ViewExpenseModal = ({ isOpen, onClose, expense }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('expenses');
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('expenses.modals.detailsTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E1]">
            <div>
              <p className="text-xl font-bold text-[#3D2F24]">{expense.expenseId}</p>
              <p className="text-sm text-[#6D6D6D]">{new Date(expense.date).toLocaleDateString(DATE_LOCALE)}</p>
            </div>
            <StatusBadge status={expense.paymentStatus} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">{tc('category')}</p>
              <CategoryBadge category={expense.category} />
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">{tc('method')}</p>
              <PaymentMethodBadge method={expense.paymentMethod} />
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-lg p-3">
            <p className="text-xs text-[#6D6D6D]">{tc('description')}</p>
            <p className="text-sm font-medium text-[#3D2F24]">{expense.description}</p>
          </div>

          {expense.supplier && (
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">{t('expenses.fields.supplier')}</p>
              <p className="text-sm text-[#3D2F24]">{expense.supplier}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{tc('amount')}</p>
              <p className="text-sm font-bold text-[#3D2F24]">{expense.amount.toLocaleString()} {CURRENCY}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{tc('vat')}</p>
              <p className="text-sm font-bold text-[#3D2F24]">{expense.vat}%</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{tc('total')}</p>
              <p className="text-sm font-bold text-[#3D2F24]">{expense.total.toLocaleString()} {CURRENCY}</p>
            </div>
          </div>

          {expense.referenceNumber && (
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">{t('expenses.fields.referenceNumber')}</p>
              <p className="text-sm text-[#3D2F24]">{expense.referenceNumber}</p>
            </div>
          )}

          {expense.notes && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('notes')}</p>
              <p className="text-sm text-[#3D2F24]">{expense.notes}</p>
            </div>
          )}

          {expense.attachment && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" />
              <span className="text-sm text-[#3D2F24]">{t('expenses.modals.attachmentAvailable')}</span>
            </div>
          )}

          <div className="bg-[#F8F7F4] rounded-lg p-3">
            <p className="text-xs text-[#6D6D6D]">{tc('createdBy')}</p>
            <p className="text-sm text-[#3D2F24]">{expense.createdBy || '—'}</p>
          </div>

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
// MAIN EXPENSES PAGE
// ==========================================
const ExpensesPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('expenses');
  const expenseCategoryOptions = useMemo(() => buildExpenseCategoryOptions(t), [t]);
  const paymentMethodOptions = useMemo(() => buildPaymentMethodOptions(t), [t]);
  const paymentStatusOptions = useMemo(() => buildPaymentStatusOptions(t), [t]);

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load expenses
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'date',
        sort_order: 'desc'
      };
      const response = await getExpenses(params);
      const res = response?.data;
      const list = safeArray(res);
      setExpenses(list);
      setTotalCount(res?.meta?.total ?? list.length);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter, statusFilter]);

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    total: 0,
    today: 0,
    month: 0,
    pending: 0,
    highestCategory: '—',
    count: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getExpenseStatistics();
      const data = response.data.data || {};
      setKpis({
        total: data.total || 0,
        today: data.today || 0,
        month: data.month || 0,
        pending: data.pending || 0,
        highestCategory: data.highestCategory || '—',
        count: data.count || 0
      });
    } catch (error) {
      console.error('Error fetching expense statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter expenses (API already handles filters)
  const filteredExpenses = useMemo(() => {
    return Array.isArray(expenses) ? expenses : [];
  }, [expenses]);

  // Paginate
  const paginatedExpenses = useMemo(() => {
    return ensureArray(filteredExpenses);
  }, [filteredExpenses]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'N° Dépense', accessor: 'expenseId', width: 10 },
    { label: 'Date', accessor: 'date', width: 10 },
    { label: 'Catégorie', accessor: 'category', width: 12 },
    { label: 'Description', accessor: 'description', width: 20 },
    { label: 'Fournisseur', accessor: 'supplier', width: 12 },
    { label: 'Montant', accessor: 'amount', width: 10 },
    { label: 'TVA %', accessor: 'vat', width: 8 },
    { label: t('common.totalInclTax'), accessor: 'total', width: 12 },
    { label: 'Méthode', accessor: 'paymentMethod', width: 10 },
    { label: t('invoices.fields.paymentStatus'), accessor: 'paymentStatus', width: 12 },
    { label: 'Créé par', accessor: 'createdBy', width: 12 }
  ];

  const rowFormatter = (item) => ({
    expenseId: item.expenseId,
    date: new Date(item.date).toLocaleDateString(DATE_LOCALE),
    category: expenseCategoryOptions.find(c => c.value === item.category)?.label || '—',
    description: item.description,
    supplier: item.supplier || '—',
    amount: `${item.amount.toLocaleString()} ${CURRENCY}`,
    vat: `${item.vat}%`,
    total: `${item.total.toLocaleString()} ${CURRENCY}`,
    paymentMethod: paymentMethodOptions.find(m => m.value === item.paymentMethod)?.label || '—',
    paymentStatus: paymentStatusOptions.find(s => s.value === item.paymentStatus)?.label || '—',
    createdBy: item.createdBy || '—'
  });

  const summary = [
    { label: 'Total dépenses', value: `${kpis.total.toLocaleString()} ${CURRENCY}` },
    { label: tc('today'), value: `${kpis.today.toLocaleString()} ${CURRENCY}` },
    { label: 'Ce mois', value: `${kpis.month.toLocaleString()} ${CURRENCY}` },
    { label: t('common.pending'), value: `${kpis.pending.toLocaleString()} ${CURRENCY}` },
    { label: 'Catégorie la plus élevée', value: kpis.highestCategory },
    { label: 'Nombre de dépenses', value: kpis.count }
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

  // ===== FIX: Handler functions =====
  const handleAddExpense = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchExpenses();
      await fetchStatistics();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCreateExpense = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createExpense(formData);
      const newExpense = response.data.data;
      setExpenses(prev => [newExpense, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditExpense = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateExpense(selectedExpense.id, formData);
      const updatedExpense = response.data.data;
      setExpenses(prev => prev.map(e =>
        e.id === selectedExpense.id ? updatedExpense : e
      ));
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    setIsSaving(true);
    try {
      await deleteExpense(selectedExpense.id);
      setExpenses(prev => prev.filter(e => e.id !== selectedExpense.id));
      setIsDeleteModalOpen(false);
      setSelectedExpense(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

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
          <ExportButtons
            data={filteredExpenses}
            columns={columns}
            title="{t('expenses.export.title')}"
            subtitle={`${filteredExpenses.length} dépenses - Total: ${kpis.total.toLocaleString()} ${CURRENCY}`}
            filename={`depenses_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={handleAddExpense}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            {t('expenses.addExpense')}
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <KPICard icon={Wallet} title="Total dépenses" value={kpis.total} color="blue" isCurrency />
        <KPICard icon={Calendar} title={tc('today')} value={kpis.today} color="emerald" isCurrency />
        <KPICard icon={TrendingUp} title="Ce mois" value={kpis.month} color="purple" isCurrency />
        <KPICard icon={Clock} title={t('common.pending')} value={kpis.pending} color="amber" isCurrency />
        <KPICard icon={FolderTree} title="Catégorie la plus élevée" value={kpis.highestCategory} color="gold" />
        <KPICard icon={FileText} title="Nombre de dépenses" value={kpis.count} color="indigo" />
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allCategories')}</option>
              {expenseCategoryOptions.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allStatuses')}</option>
              {paymentStatusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Dépense</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">TVA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('total')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('method')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Créé par</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.expenses') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('expenses.empty')}</p>
                        <button
                          onClick={handleAddExpense}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('expenses.addExpense')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ensureArray(paginatedExpenses).map((expense, index) => (
                    <ExpenseTableRow
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onView={(e) => {
                        setSelectedExpense(e);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(e) => {
                        setSelectedExpense(e);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(e) => {
                        setSelectedExpense(e);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.expenses') })}</p>
            </div>
          ) : paginatedExpenses.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Wallet size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('expenses.empty')}</p>
            </div>
          ) : (
            ensureArray(paginatedExpenses).map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onView={(e) => {
                  setSelectedExpense(e);
                  setIsViewModalOpen(true);
                }}
                onEdit={(e) => {
                  setSelectedExpense(e);
                  setIsEditModalOpen(true);
                }}
                onDelete={(e) => {
                  setSelectedExpense(e);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Expenses Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.expenses') })}</p>
          </div>
        ) : paginatedExpenses.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Wallet size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('expenses.empty')}</p>
          </div>
        ) : (
          ensureArray(paginatedExpenses).map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onView={(e) => {
                setSelectedExpense(e);
                setIsViewModalOpen(true);
              }}
              onEdit={(e) => {
                setSelectedExpense(e);
                setIsEditModalOpen(true);
              }}
              onDelete={(e) => {
                setSelectedExpense(e);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredExpenses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} dépenses
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-[#6D6D6D]" />
            </button>
            <span className="text-sm font-medium text-[#3D2F24]">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-[#6D6D6D]" />
            </button>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
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
          <ExpenseModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateExpense}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedExpense && (
          <ExpenseModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedExpense(null);
            }}
            onSave={handleEditExpense}
            expense={selectedExpense}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedExpense && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedExpense(null);
            }}
            onConfirm={handleDeleteExpense}
            expense={selectedExpense}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedExpense && (
          <ViewExpenseModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesPage;