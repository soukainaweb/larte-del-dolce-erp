// src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
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
  Clock,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  Truck,
  FileText,
  DollarSign,
  Filter,
  Printer,
  Play,
  Pause,
  Square,
  User,
  Building,
  Phone,
  MapPin,
  CreditCard,
  Wallet,
  TrendingUp,
  ShoppingCart,
  ClipboardList,
  Factory,
  CheckSquare,
  XCircle,
  UserCheck,
  UserX,
  MoreHorizontal,
  ArrowRightLeft,
  History,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import orderService, { normalizeOrder } from '../../services/orderService';
import { transferOrder, getOrderTransfers, getTransferSalesReps } from '../../services/orderTransferService';
import OrderFormModal from '../../components/orders/OrderFormModal';
import { isSalesRepRole } from '../../utils/roleMapping';
import { getApiErrorMessage } from '../../utils/apiHelpers';
import { hasPermission } from '../../utils/permissions';
import { useToast } from '../../contexts/ToastContext';
import { exportPDF } from '../../services/export/pdfExport';
import { exportExcel } from '../../services/export/excelExport';
import { exportCSV } from '../../services/export/csvExport';
import { printData } from '../../services/export/printService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// CONSTANTES - DEVISE
// ==========================================
const CURRENCY = 'SAR';
const CURRENCY_SYMBOL = 'ر.س';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { statusLabel } = usePageI18n('orders');
  const classes = {
    draft: 'bg-gray-50 text-gray-600 border-gray-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_accountant: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_manager: 'bg-orange-50 text-orange-700 border-orange-200',
    pending_responsible: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    pending_factory: 'bg-sky-50 text-sky-700 border-sky-200',
    validated: 'bg-blue-50 text-blue-700 border-blue-200',
    in_production: 'bg-purple-50 text-purple-700 border-purple-200',
    postponed: 'bg-orange-50 text-orange-700 border-orange-200',
    ready_for_pickup: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    archived: 'bg-gray-50 text-gray-500 border-gray-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    preparing: 'bg-purple-50 text-purple-700 border-purple-200',
    out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  const key = status || 'draft';
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${classes[key] || classes.draft}`}>
      {statusLabel(key)}
    </span>
  );
};

const APPROVAL_PENDING_STATUSES = ['pending', 'pending_manager', 'pending_accountant', 'pending_responsible'];

const formatApprovalDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleString(DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ApprovalTimeline = ({ progress = [], t }) => {
  if (!progress.length) return null;

  const stepIcon = (state) => {
    if (state === 'completed') return <CheckCircle size={16} className="text-emerald-500 shrink-0" />;
    if (state === 'rejected') return <XCircle size={16} className="text-rose-500 shrink-0" />;
    if (state === 'current') return <Clock size={16} className="text-amber-500 shrink-0" />;
    return <div className="w-4 h-4 rounded-full border-2 border-[#D9D4CB] shrink-0" />;
  };

  return (
    <div className="space-y-3">
      {progress.map((step) => {
        const stageLabel = t(`orders.approval.stages.${step.key}`, step.label || step.key);
        const stateLabel = t(`orders.approval.states.${step.state}`, step.state);
        const subtitle = step.state === 'rejected'
          ? stateLabel
          : step.state === 'completed'
            ? (step.key === 'representative'
              ? t('orders.approval.orderSubmitted')
              : step.key === 'approved'
                ? t('orders.approval.approvedReady')
                : stateLabel)
            : step.state === 'current'
              ? t('orders.approval.waitingForApproval')
              : stateLabel;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="pt-0.5">{stepIcon(step.state)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#3D2F24]">{stageLabel}</p>
                {step.acted_at && (
                  <span className="text-[10px] text-[#6D6D6D] whitespace-nowrap">
                    {formatApprovalDate(step.acted_at)}
                  </span>
                )}
              </div>
              <p className={`text-xs ${step.state === 'rejected' ? 'text-rose-600' : 'text-[#6D6D6D]'}`}>
                {step.actor?.name ? `${step.actor.name} — ${subtitle}` : subtitle}
              </p>
              {step.state === 'rejected' && step.reason && (
                <p className="text-xs text-rose-700 mt-1 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1">
                  {step.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RejectOrderModal = ({ isOpen, onClose, onConfirm, isLoading, t, tc }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError(t('orders.approval.rejectReasonRequired'));
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-modal-nested flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <h4 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
          {t('orders.approval.rejectTitle')}
        </h4>
        <label className="block text-xs font-semibold text-[#6D6D6D] mt-4 mb-1.5 uppercase tracking-wide">
          {t('orders.approval.rejectReason')} *
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          rows={4}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 resize-none ${
            error ? 'border-rose-500' : 'border-[#ECE8E1]'
          }`}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4]"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-50"
          >
            {isLoading ? tc('saving') : t('orders.approval.confirmReject')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// PRIORITY BADGE
// ==========================================
const PriorityBadge = ({ priority }) => {
  const { t } = usePageI18n('orders');
  const classes = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const key = priority || 'medium';
  const label = t(`orders.priority.${key}`);
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${classes[key] || classes.medium}`}>
      {label}
    </span>
  );
};

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================
const PaymentBadge = ({ status }) => {
  const { t } = usePageI18n('orders');
  const classes = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const key = status || 'unpaid';
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${classes[key] || classes.unpaid}`}>
      {t('common.paymentStatus.' + key)}
    </span>
  );
};

// ==========================================
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, color }) => {
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
      whileHover={{ y: -4 }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-[#3D2F24] mt-2">{value}</p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
    </motion.div>
  );
};

// ==========================================
// ORDER CARD (Mobile)
// ==========================================
const OrderCard = ({ order, onView, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('orders');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#3D2F24]">{order.orderNumber}</p>
          <p className="text-xs text-[#6D6D6D]">{order.customer}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={order.priority} />
        <PaymentBadge status={order.paymentStatus} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Package size={12} />
          {order.products?.length || 0} {t('orders.table.products')}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {order.total.toLocaleString()} {CURRENCY_SYMBOL}
        </div>
        <div className="flex items-center gap-1">
          <User size={12} />
          {order.rep}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(order.createdAt).toLocaleDateString(DATE_LOCALE)}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {order.status === 'delivered' && <CheckCircle size={14} className="text-emerald-500" />}
          {order.status === 'pending' && <Clock size={14} className="text-amber-500" />}
          {order.status === 'cancelled' && <XCircle size={14} className="text-rose-500" />}
          <span className="text-xs text-[#6D6D6D]">
            {order.status === 'draft' ? t('orders.status.draft') :
             order.status === 'pending' ? t('common.pending') :
             order.status === 'validated' ? t('orders.status.validated') :
             order.status === 'in_production' ? t('orders.status.in_production') :
             order.status === 'ready' ? t('orders.status.ready') :
             order.status === 'in_delivery' ? t('orders.status.in_delivery') :
             order.status === 'delivered' ? t('orders.status.delivered') :
             order.status === 'cancelled' ? t('common.cancelled') :
             order.status === 'rejected' ? t('orders.status.rejected') :
             order.status === 'archived' ? t('common.statuses.archived') : order.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(order)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          {canEdit && (
          <button onClick={() => onEdit(order)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          )}
          {canDelete && (
          <button onClick={() => onDelete(order)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ORDER TABLE ROW (Desktop)
// ==========================================
const OrderTableRow = ({ order, onView, onEdit, onDelete, index, canEdit = false, canDelete = false }) => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('orders');
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#3D2F24]">{order.orderNumber}</p>
      </td>
      <td className="px-4 py-3 text-sm text-[#3D2F24]">{order.customer}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{order.rep}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(order.createdAt).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{order.products?.length || 0}</td>
      <td className="px-4 py-3 text-sm font-bold text-[#3D2F24]">
        {order.total.toLocaleString()} {CURRENCY_SYMBOL}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={order.priority} />
      </td>
      <td className="px-4 py-3">
        <PaymentBadge status={order.paymentStatus} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(order)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          {canEdit && (
          <button
            onClick={() => onEdit(order)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          )}
          {canDelete && (
          <button
            onClick={() => onDelete(order)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title={actions.delete}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// ORDER MODAL (Create/Edit)
// ==========================================
const OrderModal = ({ isOpen, onClose, onSave, order, isLoading }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('orders');
  const [formData, setFormData] = useState({
    customer: '',
    rep: '',
    priority: 'medium',
    deliveryDate: '',
    deliveryTime: '',
    notes: '',
    products: [{ id: 1, name: '', quantity: 1, price: 0, discount: 0, total: 0 }],
    paymentMethod: 'cash',
    paymentStatus: 'unpaid'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer || '',
        rep: order.rep || '',
        priority: order.priority || 'medium',
        deliveryDate: order.deliveryDate || '',
        deliveryTime: order.deliveryTime || '',
        notes: order.notes || '',
        products: order.products || [{ id: 1, name: '', quantity: 1, price: 0, discount: 0, total: 0 }],
        paymentMethod: order.paymentMethod || 'cash',
        paymentStatus: order.paymentStatus || 'unpaid'
      });
    } else {
      setFormData({
        customer: '',
        rep: '',
        priority: 'medium',
        deliveryDate: '',
        deliveryTime: '',
        notes: '',
        products: [{ id: 1, name: '', quantity: 1, price: 0, discount: 0, total: 0 }],
        paymentMethod: 'cash',
        paymentStatus: 'unpaid'
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    if (field === 'quantity' || field === 'price' || field === 'discount') {
      const qty = parseFloat(newProducts[index].quantity) || 0;
      const price = parseFloat(newProducts[index].price) || 0;
      const discount = parseFloat(newProducts[index].discount) || 0;
      newProducts[index].total = qty * price * (1 - discount / 100);
    }
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
  const { t, tc } = usePageI18n('orders');
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { id: Date.now(), name: '', quantity: 1, price: 0, discount: 0, total: 0 }]
    }));
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
  const { t, tc } = usePageI18n('orders');
    return formData.products.reduce((sum, p) => sum + (p.total || 0), 0);
  };

  const calculateSubtotal = () => {
  const { t, tc } = usePageI18n('orders');
    return formData.products.reduce((sum, p) => sum + (p.quantity * p.price || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.customer) newErrors.customer = t('orders.validation.customerRequired');
    if (!formData.rep) newErrors.rep = t('orders.validation.repRequired');
    if (formData.products.length === 0) newErrors.products = t('orders.validation.productsRequired');
    if (formData.products.some(p => !p.name)) newErrors.products = t('orders.validation.productNameRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ ...formData, total: calculateTotal() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {order ? t('orders.modals.editTitle') : t('orders.addOrder')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Info */}
          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.sections.customerInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('orders.table.customer')} *</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                    errors.customer ? 'border-rose-500' : 'border-[#ECE8E1]'
                  }`}
                />
                {errors.customer && <p className="text-xs text-rose-500 mt-1">{errors.customer}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('orders.table.rep')} *</label>
                <input
                  type="text"
                  name="rep"
                  value={formData.rep}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                    errors.rep ? 'border-rose-500' : 'border-[#ECE8E1]'
                  }`}
                />
                {errors.rep && <p className="text-xs text-rose-500 mt-1">{errors.rep}</p>}
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.sections.generalInfo')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('priority')}</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                >
                  <option value="low">{t('orders.priority.low')}</option>
                  <option value="medium">{t('orders.priority.medium')}</option>
                  <option value="high">{t('orders.priority.high')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('orders.table.deliveryDate')}</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('orders.fields.deliveryTime')}</label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('orders.fields.paymentMethod')}</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                >
                  <option value="cash">{t('common.paymentMethods.cash')}</option>
                  <option value="card">{t('common.paymentMethods.card')}</option>
                  <option value="transfer">{t('common.paymentMethods.transfer')}</option>
                  <option value="credit">{t('orders.paymentMethods.credit', 'أجل')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#3D2F24]">{tc('product')}</h4>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B8863B] rounded-lg hover:bg-[#A67937] transition-colors"
              >
                <Plus size={14} />
                {t('orders.fields.addProduct')}
              </button>
            </div>
            <div className="space-y-3">
              {formData.products.map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-[#ECE8E1]">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('product')}</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{t('orders.fields.quantity')}</label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('price')} ({CURRENCY_SYMBOL})</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{t('orders.fields.discount')}</label>
                      <input
                        type="number"
                        value={product.discount}
                        onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('total')}</label>
                        <p className="text-sm font-bold text-[#3D2F24]">
                          {(product.total || 0).toFixed(2)} {CURRENCY_SYMBOL}
                        </p>
                      </div>
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.summary.title')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.subtotal')}</span>
                <span className="font-medium text-[#3D2F24]">{calculateSubtotal().toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.totalDiscount')}</span>
                <span className="font-medium text-[#3D2F24]">
                  {(calculateSubtotal() - calculateTotal()).toFixed(2)} {CURRENCY_SYMBOL}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8E1]">
                <span className="font-bold text-[#3D2F24]">{t('orders.summary.grandTotal')}</span>
                <span className="font-bold text-[#3D2F24] text-lg">{calculateTotal().toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
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
              {isLoading ? tc('saving') : order ? tc('update') : t('orders.addOrder')}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, order, isLoading }) => {
  const { t, tc } = usePageI18n('orders');
  if (!isOpen) return null;

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
          {t('orders.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {t('orders.modals.deleteMessage', { orderNumber: order?.orderNumber })}{' '}
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
// ORDER DETAILS MODAL
// ==========================================
const OrderDetailsModal = ({
  isOpen,
  onClose,
  order: initialOrder,
  onOrderUpdated,
  showToast,
}) => {
  const { t, tc, statusLabel } = usePageI18n('orders');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [availableReps, setAvailableReps] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

  const loadAvailableReps = useCallback(async () => {
    try {
      const reps = await orderService.getAvailableRepresentatives();
      setAvailableReps(Array.isArray(reps) ? reps : []);
    } catch {
      setAvailableReps([]);
    }
  }, []);

  const loadOrder = useCallback(async () => {
    if (!initialOrder?.id) return;
    setLoading(true);
    try {
      const response = await orderService.getOrderById(initialOrder.id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order details:', error);
      showToast?.(getApiErrorMessage(error, t('orders.errors.load')), 'error');
      setOrder(normalizeOrder(initialOrder));
    } finally {
      setLoading(false);
    }
  }, [initialOrder, showToast, t]);

  useEffect(() => {
    if (isOpen && initialOrder?.id) {
      loadOrder();
      loadAvailableReps();
    } else if (!isOpen) {
      setOrder(null);
      setShowRejectModal(false);
      setShowApproveConfirm(false);
      setSelectedRepId('');
      setPostponeReason('');
    }
  }, [isOpen, initialOrder?.id, loadOrder, loadAvailableReps]);

  const handleApprove = async () => {
    const orderId = order?.id ?? initialOrder?.id;
    if (!orderId) return;
    setActionLoading(true);
    try {
      const response = await orderService.approveOrder(orderId);
      setOrder(response.data);
      onOrderUpdated?.(response.data);
      setShowApproveConfirm(false);
      showToast?.(t('orders.approval.approvedSuccess'), 'success');
    } catch (error) {
      showToast?.(getApiErrorMessage(error, t('orders.approval.approveFailed', 'تعذر اعتماد الطلب')), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    const orderId = order?.id ?? initialOrder?.id;
    if (!orderId) return;
    setActionLoading(true);
    try {
      const response = await orderService.rejectOrder(orderId, reason);
      setOrder(response.data);
      onOrderUpdated?.(response.data);
      setShowRejectModal(false);
      showToast?.(t('orders.approval.rejectedSuccess'), 'success');
    } catch (error) {
      showToast?.(getApiErrorMessage(error, t('orders.approval.rejectFailed', 'تعذر رفض الطلب')), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const runFactoryAction = async (action, payload) => {
    if (!order?.id) return;
    setActionLoading(true);
    try {
      let response;
      if (action === 'accept') response = await orderService.factoryAccept(order.id);
      else if (action === 'postpone') response = await orderService.factoryPostpone(order.id, payload);
      else if (action === 'ready') response = await orderService.factoryMarkReady(order.id);
      else if (action === 'assign') response = await orderService.factoryAssignRepresentative(order.id, Number(payload));
      setOrder(response.data);
      onOrderUpdated?.(response.data);
      showToast?.(t('orders.factory.actionSuccess', 'Action completed'), 'success');
    } catch (error) {
      showToast?.(getApiErrorMessage(error, t('orders.errors.load')), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoProof = async (type, file) => {
    if (!order?.id || !file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setActionLoading(true);
      try {
        const response = type === 'pickup'
          ? await orderService.confirmPickup(order.id, reader.result)
          : await orderService.confirmDelivery(order.id, reader.result);
        setOrder(response.data);
        onOrderUpdated?.(response.data);
        showToast?.(t(`orders.proof.${type}Success`, 'Photo saved'), 'success');
      } catch (error) {
        showToast?.(getApiErrorMessage(error, t('orders.errors.load')), 'error');
      } finally {
        setActionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen || !initialOrder) return null;

  const displayOrder = order || normalizeOrder(initialOrder);
  const currentStep = displayOrder.approval_progress?.find((step) => step.state === 'current');

  return (
    <>
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {t('orders.modals.detailsTitle')}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              <X size={20} className="text-[#6D6D6D]" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {loading && !order ? (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E1]">
                  <div>
                    <p className="text-xl font-bold text-[#3D2F24]">{displayOrder.orderNumber}</p>
                    <p className="text-sm text-[#6D6D6D]">{displayOrder.customer}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={displayOrder.status} />
                    <div className="mt-1">
                      <PriorityBadge priority={displayOrder.priority} />
                    </div>
                  </div>
                </div>

                {(displayOrder.approval_progress?.length > 0 || displayOrder.rejection) && (
                  <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
                    <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.approval.timeline')}</h4>
                    <ApprovalTimeline progress={displayOrder.approval_progress || []} t={t} />
                    {currentStep && displayOrder.status !== 'rejected' && (
                      <p className="text-xs text-[#6D6D6D] mt-3 pt-3 border-t border-[#ECE8E1]">
                        {t('orders.approval.currentResponsible')}:{' '}
                        <span className="font-semibold text-[#3D2F24]">
                          {t(`orders.approval.stages.${currentStep.key}`, currentStep.label)}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {displayOrder.rejection && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-rose-700 mb-2">{statusLabel('rejected')}</h4>
                    <div className="space-y-1 text-sm text-rose-800">
                      {displayOrder.rejection.rejected_by && (
                        <p>{t('orders.approval.rejectedBy')}: {displayOrder.rejection.rejected_by}</p>
                      )}
                      {displayOrder.rejection.stage && (
                        <p>{t('orders.approval.rejectionStage')}: {displayOrder.rejection.stage}</p>
                      )}
                      {displayOrder.rejection.reason && (
                        <p>{t('orders.approval.rejectionReason')}: {displayOrder.rejection.reason}</p>
                      )}
                      {displayOrder.rejection.rejected_at && (
                        <p>{t('orders.approval.rejectionDate')}: {formatApprovalDate(displayOrder.rejection.rejected_at)}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#F8F7F4] rounded-lg p-3">
                    <p className="text-xs text-[#6D6D6D]">{t('orders.table.rep')}</p>
                    <p className="font-medium text-[#3D2F24]">{displayOrder.rep}</p>
                  </div>
                  <div className="bg-[#F8F7F4] rounded-lg p-3">
                    <p className="text-xs text-[#6D6D6D]">{tc('date')}</p>
                    <p className="font-medium text-[#3D2F24]">
                      {new Date(displayOrder.createdAt).toLocaleDateString(DATE_LOCALE)}
                    </p>
                  </div>
                  <div className="bg-[#F8F7F4] rounded-lg p-3">
                    <p className="text-xs text-[#6D6D6D]">{tc('status')}</p>
                    <PaymentBadge status={displayOrder.paymentStatus} />
                  </div>
                  <div className="bg-[#F8F7F4] rounded-lg p-3">
                    <p className="text-xs text-[#6D6D6D]">{tc('total')}</p>
                    <p className="text-lg font-bold text-[#3D2F24]">
                      {displayOrder.total.toLocaleString()} {CURRENCY_SYMBOL}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8F7F4] rounded-lg p-4">
                  <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{tc('product')}</h4>
                  <div className="space-y-2">
                    {displayOrder.products && displayOrder.products.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#ECE8E1]">
                        <div>
                          <p className="text-sm font-medium text-[#3D2F24]">{p.name}</p>
                          <p className="text-xs text-[#6D6D6D]">{t('orders.fields.quantity')}: {p.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-[#3D2F24]">{p.total?.toFixed(2)} {CURRENCY_SYMBOL}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {displayOrder.notes && (
                  <div className="bg-[#F8F7F4] rounded-lg p-4">
                    <h4 className="text-sm font-bold text-[#3D2F24] mb-2">{tc('notes')}</h4>
                    <p className="text-sm text-[#6D6D6D]">{displayOrder.notes}</p>
                  </div>
                )}

                {(displayOrder.can_approve || displayOrder.can_reject) && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {displayOrder.can_approve && (
                      <button
                        type="button"
                        onClick={() => setShowApproveConfirm(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <UserCheck size={16} />
                        {t('orders.approval.approve')}
                      </button>
                    )}
                    {displayOrder.can_reject && (
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-50"
                      >
                        <UserX size={16} />
                        {t('orders.approval.reject')}
                      </button>
                    )}
                  </div>
                )}

                {(displayOrder.can_factory_accept || displayOrder.can_factory_postpone || displayOrder.can_factory_ready || displayOrder.can_factory_assign_rep) && (
                  <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1] space-y-3">
                    <h4 className="text-sm font-bold text-[#3D2F24]">{t('orders.factory.title', 'Factory actions')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayOrder.can_factory_accept && (
                        <button type="button" disabled={actionLoading} onClick={() => runFactoryAction('accept')} className="px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg">
                          {t('orders.factory.accept', 'Accept')}
                        </button>
                      )}
                      {displayOrder.can_factory_ready && (
                        <button type="button" disabled={actionLoading} onClick={() => runFactoryAction('ready')} className="px-3 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg">
                          {t('orders.factory.ready', 'Ready for pickup')}
                        </button>
                      )}
                    </div>
                    {displayOrder.can_factory_postpone && (
                      <div className="flex gap-2">
                        <input value={postponeReason} onChange={(e) => setPostponeReason(e.target.value)} placeholder={t('orders.factory.postponeReason', 'Postpone reason')} className="flex-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
                        <button type="button" disabled={actionLoading || postponeReason.trim().length < 3} onClick={() => runFactoryAction('postpone', postponeReason.trim())} className="px-3 py-2 text-xs font-medium bg-orange-500 text-white rounded-lg">
                          {t('orders.factory.postpone', 'Postpone')}
                        </button>
                      </div>
                    )}
                    {displayOrder.can_factory_assign_rep && (
                      <div className="flex gap-2">
                        <select value={selectedRepId} onChange={(e) => setSelectedRepId(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
                          <option value="">{t('orders.factory.selectRep', 'Select representative')}</option>
                          {availableReps.map((rep) => (
                            <option key={rep.id} value={rep.id}>{rep.full_name || `${rep.first_name} ${rep.last_name}`}</option>
                          ))}
                        </select>
                        <button type="button" disabled={actionLoading || !selectedRepId} onClick={() => runFactoryAction('assign', selectedRepId)} className="px-3 py-2 text-xs font-medium bg-[#B8863B] text-white rounded-lg">
                          {t('orders.factory.assign', 'Assign')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(displayOrder.can_confirm_pickup || displayOrder.can_confirm_delivery) && (
                  <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1] space-y-3">
                    <h4 className="text-sm font-bold text-[#3D2F24]">{t('orders.proof.title', 'Delivery proof')}</h4>
                    {displayOrder.can_confirm_pickup && (
                      <label className="block text-sm">
                        <span className="text-[#6D6D6D]">{t('orders.proof.pickup', 'Pickup photo')}</span>
                        <input type="file" accept="image/*" capture="environment" className="mt-1 block w-full text-sm" onChange={(e) => handlePhotoProof('pickup', e.target.files?.[0])} />
                      </label>
                    )}
                    {displayOrder.can_confirm_delivery && (
                      <label className="block text-sm">
                        <span className="text-[#6D6D6D]">{t('orders.proof.delivery', 'Delivery photo')}</span>
                        <input type="file" accept="image/*" capture="environment" className="mt-1 block w-full text-sm" onChange={(e) => handlePhotoProof('delivery', e.target.files?.[0])} />
                      </label>
                    )}
                    {displayOrder.pickup_photo && (
                      <p className="text-xs text-emerald-700">{t('orders.proof.pickupDone', 'Pickup confirmed')}</p>
                    )}
                    {displayOrder.delivery_photo && (
                      <p className="text-xs text-emerald-700">{t('orders.proof.deliveryDone', 'Delivery confirmed')}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
                >
                  {tc('close')}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {showApproveConfirm && (
        <div className="fixed inset-0 z-modal-nested flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h4 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {t('orders.approval.approveConfirmTitle')}
            </h4>
            <p className="text-sm text-[#6D6D6D] mt-2">{t('orders.approval.approveConfirmMessage')}</p>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4]"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? tc('saving') : t('orders.approval.approve')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <RejectOrderModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isLoading={actionLoading}
        t={t}
        tc={tc}
      />
    </>
  );
};

// ==========================================
// ORDER TRANSFER MODAL
// ==========================================
const TransferOrderModal = ({ isOpen, onClose, orders, users, onSubmit, isLoading, t }) => {
  const [orderId, setOrderId] = useState('');
  const [toSalespersonId, setToSalespersonId] = useState('');
  const [notes, setNotes] = useState('');

  const salesRepresentatives = useMemo(
    () => (Array.isArray(users) ? users : []).filter(isSalesRepRole),
    [users]
  );

  const selectedOrder = orders.find((o) => String(o.id) === String(orderId));
  const currentRep = selectedOrder?.rep || selectedOrder?.user?.name || '—';

  useEffect(() => {
    if (!isOpen) {
      setOrderId('');
      setToSalespersonId('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>{t('orderTransfers.title')}</h3>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('orderTransfers.selectOrder')}</label>
          <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
            <option value="">{t('common.selectOption')}</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.orderNumber || o.order_number || `#${o.id}`} — {o.customer}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('orderTransfers.currentSalesperson')}</label>
          <input readOnly value={currentRep} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg bg-[#F8F7F4]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('orderTransfers.newSalesperson')}</label>
          <select value={toSalespersonId} onChange={(e) => setToSalespersonId(e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
            <option value="">{t('common.selectOption')}</option>
            {salesRepresentatives.map((u) => (
              <option key={u.id} value={u.id}>{u.first_name || u.firstName} {u.last_name || u.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('orderTransfers.notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">{t('common.cancel')}</button>
          <button type="button" disabled={!orderId || !toSalespersonId || isLoading}
            onClick={() => onSubmit(orderId, { to_salesperson_id: Number(toSalespersonId), notes })}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white disabled:opacity-50">
            {t('orderTransfers.submit')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TransferHistoryModal = ({ isOpen, onClose, transfers, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: FONT_HEADING }}>{t('orderTransfers.historyTitle')}</h3>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        {transfers.length === 0 ? (
          <p className="text-sm text-[#6D6D6D] text-center py-8">{t('orderTransfers.empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b">{['order', 'from', 'to', 'date', 'by'].map((c) => (
              <th key={c} className="px-3 py-2 text-left text-xs uppercase text-[#6D6D6D]">{t(`orderTransfers.columns.${c}`)}</th>
            ))}</tr></thead>
            <tbody>
              {transfers.map((tr) => (
                <tr key={tr.id} className="border-b border-[#ECE8E1]">
                  <td className="px-3 py-2">{tr.order?.order_number || tr.order?.orderNumber || tr.order_id}</td>
                  <td className="px-3 py-2">{tr.from_salesperson ? `${tr.from_salesperson.first_name || ''} ${tr.from_salesperson.last_name || ''}`.trim() : '—'}</td>
                  <td className="px-3 py-2">{tr.to_salesperson ? `${tr.to_salesperson.first_name || ''} ${tr.to_salesperson.last_name || ''}`.trim() : '—'}</td>
                  <td className="px-3 py-2">{tr.created_at ? new Date(tr.created_at).toLocaleString(DATE_LOCALE) : '—'}</td>
                  <td className="px-3 py-2">{tr.transferred_by_user ? `${tr.transferred_by_user.first_name || ''} ${tr.transferred_by_user.last_name || ''}`.trim() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN ORDERS PAGE
// ==========================================
const OrdersPage = () => {
  const { user, roleKey, permissions, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const isSalesRep = roleKey === 'sales_rep';
  const canUpdateOrder = !authLoading && hasPermission('orders.update', permissions, user?.role ?? roleKey);
  const canDeleteOrder = !authLoading && hasPermission('orders.delete', permissions, user?.role ?? roleKey);
  const canCreateOrder = !authLoading && hasPermission('orders.create', permissions, user?.role ?? roleKey);
  const { t: tGlobal } = useTranslation();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('orders');
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [salesUsers, setSalesUsers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);

  // ==========================================
  // FETCH ORDERS FROM API
  // ==========================================
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getOrders({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setOrders(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.meta?.total || 0,
        lastPage: response.meta?.last_page || 1
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast(getApiErrorMessage(error, t('orders.errors.load')), 'error');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, searchTerm, statusFilter, showToast]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    getTransferSalesReps().then((res) => {
      setSalesUsers(Array.isArray(res.data) ? res.data.filter(isSalesRepRole) : []);
    }).catch(() => {});
  }, []);

  const fetchTransferHistory = async () => {
    try {
      const res = await getOrderTransfers({ per_page: 50 });
      setTransfers(res.data || []);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
    }
  };

  const handleTransferOrder = async (orderId, payload) => {
    setIsTransferring(true);
    try {
      await transferOrder(orderId, payload);
      showToast(tGlobal('orderTransfers.success'), 'success');
      setIsTransferModalOpen(false);
      fetchOrders();
      fetchTransferHistory();
    } catch (error) {
      showToast(getApiErrorMessage(error, tGlobal('errors.saveFailed')), 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const openTransferHistory = () => {
    fetchTransferHistory();
    setIsHistoryModalOpen(true);
  };

  useEffect(() => {
    if (!location.state?.openAddModal) return;
    setIsCreateModalOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.openAddModal, navigate, location.pathname]);

  useEffect(() => {
    const viewOrderId = location.state?.viewOrderId;
    const editOrderId = location.state?.editOrderId;
    const targetId = viewOrderId || editOrderId;
    if (!targetId) return;

    const openOrderFromNavigation = async () => {
      let order = orders.find((o) => o.id === targetId || o.orderNumber === targetId);
      if (!order) {
        try {
          const response = await orderService.getOrderById(targetId);
          order = response.data;
        } catch (error) {
          console.error('Error loading order from navigation:', error);
        }
      }
      if (order) {
        setSelectedOrder(order);
        if (editOrderId) {
          setIsEditModalOpen(true);
        } else {
          setIsDetailsModalOpen(true);
        }
      }
      navigate(location.pathname, { replace: true, state: {} });
    };

    openOrderFromNavigation();
  }, [location.state?.viewOrderId, location.state?.editOrderId, orders]);

  // ==========================================
  // CALCULATE KPIS
  // ==========================================
  const kpis = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => APPROVAL_PENDING_STATUSES.includes(o.status)).length;
    const validated = orders.filter(o => o.status === 'validated').length;
    const inProduction = orders.filter(o => o.status === 'in_production').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders.reduce(
      (sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total ?? o.total_amount ?? 0) : 0),
      0,
    );

    return { total, pending, validated, inProduction, ready, delivered, cancelled, revenue };
  }, [orders]);

  // ==========================================
  // FILTER ORDERS (CLIENT SIDE FOR NOW)
  // ==========================================
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber?.toLowerCase().includes(term) ||
        o.customer?.toLowerCase().includes(term) ||
        o.rep?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  // ==========================================
  // PAGINATE ORDERS
  // ==========================================
  const paginatedOrders = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.perPage;
    return filteredOrders.slice(start, start + pagination.perPage);
  }, [filteredOrders, pagination.currentPage, pagination.perPage]);

  const totalPages = Math.ceil(filteredOrders.length / pagination.perPage);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: t('orders.table.orderNumber'), accessor: 'orderNumber', width: 12 },
    { label: t('orders.table.customer'), accessor: 'customer', width: 18 },
    { label: t('orders.table.rep'), accessor: 'rep', width: 15 },
    { label: t('common.date'), accessor: 'createdAt', width: 12 },
    { label: t('orders.table.products'), accessor: 'productCount', width: 10 },
    { label: t('orders.table.total'), accessor: 'total', width: 12 },
    { label: t('orders.table.status'), accessor: 'status', width: 12 },
    { label: t('orders.table.priority'), accessor: 'priority', width: 10 },
    { label: t('orders.table.paymentStatus'), accessor: 'paymentStatus', width: 12 }
  ];

  const rowFormatter = (item) => ({
    orderNumber: item.orderNumber || '—',
    customer: item.customer || '—',
    rep: item.rep || '—',
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString(DATE_LOCALE) : '—',
    productCount: item.products?.length || 0,
    total: `${(item.total || 0).toLocaleString()} ${CURRENCY_SYMBOL}`,
    status: item.status === 'draft' ? t('orders.status.draft') :
            item.status === 'pending' ? t('common.pending') :
            item.status === 'validated' ? t('orders.status.validated') :
            item.status === 'in_production' ? t('orders.status.in_production') :
            item.status === 'ready' ? t('orders.status.ready') :
            item.status === 'in_delivery' ? t('orders.status.in_delivery') :
            item.status === 'delivered' ? t('orders.status.delivered') :
            item.status === 'cancelled' ? t('common.cancelled') :
            item.status === 'rejected' ? t('orders.status.rejected') :
            item.status === 'archived' ? t('common.statuses.archived') : item.status || '—',
    priority: item.priority === 'high' ? t('orders.priority.high') :
              item.priority === 'medium' ? t('orders.priority.medium') : t('orders.priority.low'),
    paymentStatus: item.paymentStatus === 'paid' ? t('common.paymentStatus.paid') :
                   item.paymentStatus === 'partial' ? t('common.paymentStatus.partial') : t('common.paymentStatus.unpaid')
  });

  const summary = [
    { label: t('orders.kpi.total'), value: kpis.total },
    { label: t('common.pending'), value: kpis.pending },
    { label: t('orders.status.in_production'), value: kpis.inProduction },
    { label: t('orders.kpi.delivered'), value: kpis.delivered },
    { label: t('orders.kpi.cancelled'), value: kpis.cancelled },
    { label: t('orders.kpi.revenue'), value: `${kpis.revenue.toLocaleString()} ${CURRENCY_SYMBOL}` }
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

  const handleExport = async (type) => {
    try {
      const exportData = filteredOrders.map(rowFormatter);
      const filename = `commandes_${new Date().toISOString().split('T')[0]}`;

      switch (type) {
        case 'pdf':
          await exportPDF({
            title: t('orders.export.title'),
            data: exportData,
            columns: columns,
            filename: `${filename}.pdf`,
            userName: user?.firstName || t('users.table.user'),
            summary: summary.reduce((acc, item) => {
              acc[item.label] = item.value;
              return acc;
            }, {})
          });
          break;
        case 'excel':
          await exportExcel({
            title: t('orders.export.title'),
            data: exportData,
            columns: columns,
            filename: `${filename}.xlsx`,
            userName: user?.firstName || t('users.table.user')
          });
          break;
        case 'csv':
          await exportCSV({
            title: t('orders.export.title'),
            data: exportData,
            columns: columns,
            filename: `${filename}.csv`,
            userName: user?.firstName || t('users.table.user')
          });
          break;
        case 'print':
          await printData({
            title: t('orders.export.title'),
            data: exportData,
            columns: columns,
            userName: user?.firstName || t('users.table.user')
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // ==========================================
  // CRUD HANDLERS
  // ==========================================
  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    setSelectedOrder(updatedOrder);
  };

  const handleOrderCreated = () => {
    setIsCreateModalOpen(false);
    fetchOrders();
  };

  const handleEditOrder = async (formData) => {
    setIsSaving(true);
    try {
      const response = await orderService.updateOrder(selectedOrder.id, formData);
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? response.data : o
      ));
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    setIsSaving(true);
    try {
      await orderService.deleteOrder(selectedOrder.id);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // PAGINATION HANDLERS
  // ==========================================
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (e) => {
    setPagination(prev => ({
      ...prev,
      perPage: Number(e.target.value),
      currentPage: 1
    }));
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, statusFilter]);

  // ==========================================
  // UNIQUE STATUSES
  // ==========================================
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(orders.map(o => o.status));
    return Array.from(statuses);
  }, [orders]);

  // ==========================================
  // RENDER
  // ==========================================
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
            data={filteredOrders}
            columns={columns}
            title={t('orders.export.title')}
            subtitle={t('orders.export.subtitle', {
              count: filteredOrders.length,
              revenue: kpis.revenue.toLocaleString(),
              currency: CURRENCY_SYMBOL
            })}
            filename={`commandes_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          {!isSalesRep && (
          <>
          <button
            type="button"
            onClick={openTransferHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ECE8E1] bg-white text-[#3D2F24] hover:bg-[#F8F7F4]"
          >
            <History size={18} />
            {tGlobal('orderTransfers.historyTitle')}
          </button>
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B8863B] text-[#B8863B] bg-white hover:bg-[#F8F5EF]"
          >
            <ArrowRightLeft size={18} />
            {tGlobal('orderTransfers.title')}
          </button>
          </>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreateOrder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Plus size={18} />
            {t('orders.addOrder')}
          </button>
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={actions.refresh}
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KPICard icon={ShoppingBag} title={t('orders.kpi.total')} value={kpis.total} color="blue" />
        <KPICard icon={Clock} title={t('orders.kpi.pending')} value={kpis.pending} color="amber" />
        <KPICard icon={CheckCircle} title={t('orders.kpi.validated')} value={kpis.validated} color="indigo" />
        <KPICard icon={Factory} title={t('orders.kpi.inProduction')} value={kpis.inProduction} color="purple" />
        <KPICard icon={Package} title={t('orders.kpi.ready')} value={kpis.ready} color="teal" />
        <KPICard icon={Truck} title={t('orders.kpi.delivered')} value={kpis.delivered} color="emerald" />
        <KPICard icon={XCircle} title={t('orders.kpi.cancelled')} value={kpis.cancelled} color="rose" />
        <KPICard icon={DollarSign} title={`${t('orders.kpi.revenue')} (${CURRENCY_SYMBOL})`} value={kpis.revenue.toLocaleString()} color="gold" />
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allStatuses')}</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'draft' ? t('orders.status.draft') :
                   status === 'pending' ? t('common.pending') :
                   status === 'validated' ? t('orders.status.validated') :
                   status === 'in_production' ? t('orders.status.in_production') :
                   status === 'ready' ? t('orders.status.ready') :
                   status === 'in_delivery' ? t('orders.status.in_delivery') :
                   status === 'delivered' ? t('orders.status.delivered') :
                   status === 'cancelled' ? t('common.cancelled') :
                   status === 'rejected' ? t('orders.status.rejected') :
                   status === 'archived' ? t('common.statuses.archived') : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table - Desktop */}
      {isLoading ? (
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('orders.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">N° Commande</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('customer')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('orders.table.rep')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('product')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('amount')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('priority')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag size={40} className="text-[#ECE8E1]" />
                          <p className="text-sm text-[#6D6D6D]">{t('orders.empty')}</p>
                          <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-sm text-[#B8863B] font-medium hover:underline"
                          >
                            Créer une commande
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, index) => (
                      <OrderTableRow
                        key={order.id}
                        order={order}
                        index={index}
                        canEdit={canUpdateOrder}
                        canDelete={canDeleteOrder}
                        onView={(o) => {
                          setSelectedOrder(o);
                          setIsDetailsModalOpen(true);
                        }}
                        onEdit={(o) => {
                          if (!canUpdateOrder) return;
                          setSelectedOrder(o);
                          setIsEditModalOpen(true);
                        }}
                        onDelete={(o) => {
                          if (!canDeleteOrder) return;
                          setSelectedOrder(o);
                          setIsDeleteModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {paginatedOrders.length === 0 ? (
              <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
                <ShoppingBag size={40} className="text-[#ECE8E1] mx-auto mb-3" />
                <p className="text-sm text-[#6D6D6D]">{t('orders.empty')}</p>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canEdit={canUpdateOrder}
                  canDelete={canDeleteOrder}
                  onView={(o) => {
                    setSelectedOrder(o);
                    setIsDetailsModalOpen(true);
                  }}
                  onEdit={(o) => {
                    if (!canUpdateOrder) return;
                    setSelectedOrder(o);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={(o) => {
                    if (!canDeleteOrder) return;
                    setSelectedOrder(o);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((pagination.currentPage - 1) * pagination.perPage) + 1} à{' '}
            {Math.min(pagination.currentPage * pagination.perPage, filteredOrders.length)} sur {filteredOrders.length} commandes
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(pagination.currentPage - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-[#6D6D6D]" />
            </button>
            <span className="text-sm font-medium text-[#3D2F24]">
              Page {pagination.currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(pagination.currentPage + 1, totalPages))}
              disabled={pagination.currentPage === totalPages}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-[#6D6D6D]" />
            </button>
            <select
              value={pagination.perPage}
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
          <OrderFormModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSaved={handleOrderCreated}
            isLoading={isSaving}
            isSalesRep={isSalesRep}
            currentUserId={user?.id}
            showToast={showToast}
          />
        )}

        {isEditModalOpen && selectedOrder && canUpdateOrder && (
          <OrderModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedOrder(null);
            }}
            onSave={handleEditOrder}
            order={selectedOrder}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedOrder && canDeleteOrder && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedOrder(null);
            }}
            onConfirm={handleDeleteOrder}
            order={selectedOrder}
            isLoading={isSaving}
          />
        )}

        {isDetailsModalOpen && selectedOrder && (
          <OrderDetailsModal
            key="details-modal"
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onOrderUpdated={handleOrderUpdated}
            showToast={showToast}
          />
        )}

        {isTransferModalOpen && (
          <TransferOrderModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            orders={orders}
            users={salesUsers}
            onSubmit={handleTransferOrder}
            isLoading={isTransferring}
            t={tGlobal}
          />
        )}

        {isHistoryModalOpen && (
          <TransferHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            transfers={transfers}
            t={tGlobal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;