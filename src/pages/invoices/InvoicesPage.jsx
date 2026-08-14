// src/pages/Invoices/InvoicesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
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
  Phone,
  Mail,
  DollarSign,
  Package,
  Grid,
  List,
  Archive,
  Printer,
  Send,
  CreditCard,
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Receipt,
  Building,
  MapPin,
  MoreHorizontal,
  Tag,
  Percent,
  Truck,
  CheckSquare,
  XCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ScopedExportButtons from '../../components/export/ScopedExportButtons';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoicePaymentStatus,
  updateInvoiceStatus,
  getInvoiceStatistics,
  sendInvoiceEmail,
  getInvoiceStatuses,
  getPaymentStatuses,
  getPaymentMethods
} from '../../services/invoiceService';
import { useToast } from '../../contexts/ToastContext';
import useEntityDeepLink from '../../hooks/useEntityDeepLink';
import { safeArray, ensureArray, getApiErrorMessage } from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================
const PaymentStatusBadge = ({ status }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  const statusConfig = {
    paid: { label: t('common.paymentStatus.paid'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    unpaid: { label: t('common.paymentStatus.unpaid'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
    partial: { label: t('common.paymentStatus.partial'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
    overdue: { label: t('common.statuses.overdue'), class: 'bg-red-50 text-red-700 border-red-200' }
  };

  const config = statusConfig[status] || statusConfig.unpaid;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// INVOICE STATUS BADGE
// ==========================================
const InvoiceStatusBadge = ({ status }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  const statusConfig = {
    draft: { label: t('orders.status.draft'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
    sent: { label: t('common.statuses.sent'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
    paid: { label: t('common.paymentStatus.paid'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: t('common.cancelled'), class: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PAYMENT METHOD BADGE
// ==========================================
const PaymentMethodBadge = ({ method }) => {
  const { t, tc } = usePageI18n('invoices');
  const methodConfig = {
    cash: { label: t('common.paymentMethods.cash'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    card: { label: t('common.paymentMethods.card'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
    transfer: { label: t('common.paymentMethods.transfer'), class: 'bg-purple-50 text-purple-700 border-purple-200' },
    online: { label: t('common.paymentMethods.online'), class: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  };

  const config = methodConfig[method] || methodConfig.cash;

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
      <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-[#3D2F24] mt-2">{value}</p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
      {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// ==========================================
// INVOICE CARD (Mobile)
// ==========================================
const InvoiceCard = ({ invoice, onView, onEdit, onDelete }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#3D2F24]">{invoice.invoiceNumber}</p>
          <p className="text-xs text-[#6D6D6D]">Commande: {invoice.orderNumber}</p>
        </div>
        <PaymentStatusBadge status={invoice.paymentStatus} />
      </div>
      <div className="flex items-center gap-2">
        <User size={14} className="text-[#6D6D6D]" />
        <p className="text-sm font-medium text-[#3D2F24]">{invoice.customer}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        <PaymentMethodBadge method={invoice.paymentMethod} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(invoice.invoiceDate).toLocaleDateString(DATE_LOCALE)}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {new Date(invoice.dueDate).toLocaleDateString(DATE_LOCALE)}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {invoice.totalAmount.toLocaleString()} ${CURRENCY}
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle size={12} />
          {invoice.paidAmount.toLocaleString()} ${CURRENCY}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {invoice.isOverdue && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">En retard</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(invoice)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(invoice)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(invoice)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INVOICE TABLE ROW (Desktop)
// ==========================================
const InvoiceTableRow = ({ invoice, onView, onEdit, onDelete, index }) => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('invoices');
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#3D2F24]">{invoice.invoiceNumber}</p>
        <p className="text-xs text-[#6D6D6D]">{invoice.orderNumber}</p>
      </td>
      <td className="px-4 py-3 text-sm text-[#3D2F24]">{invoice.customer}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(invoice.invoiceDate).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(invoice.dueDate).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {invoice.totalAmount.toLocaleString()} ${CURRENCY}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {invoice.paidAmount.toLocaleString()} ${CURRENCY}
      </td>
      <td className="px-4 py-3">
        <PaymentMethodBadge method={invoice.paymentMethod} />
      </td>
      <td className="px-4 py-3">
        <PaymentStatusBadge status={invoice.paymentStatus} />
      </td>
      <td className="px-4 py-3">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(invoice)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(invoice)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(invoice)}
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
// INVOICE MODAL (Add/Edit)
// ==========================================
const InvoiceModal = ({ isOpen, onClose, onSave, invoice, isLoading }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  const [formData, setFormData] = useState({
    customer: '',
    orderNumber: '',
    invoiceNumber: `INV-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    status: 'draft',
    notes: '',
    products: [{ id: 1, name: '', quantity: 1, price: 0, vat: 20, discount: 0, total: 0 }],
    deliveryFees: 0,
    paidAmount: 0
  });

  const [errors, setErrors] = useState({});
  const [availableOrders, setAvailableOrders] = useState([]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        customer: invoice.customer || '',
        orderNumber: invoice.orderNumber || '',
        invoiceNumber: invoice.invoiceNumber || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        paymentMethod: invoice.paymentMethod || 'cash',
        paymentStatus: invoice.paymentStatus || 'unpaid',
        status: invoice.status || 'draft',
        notes: invoice.notes || '',
        products: invoice.products || [{ id: 1, name: '', quantity: 1, price: 0, vat: 20, discount: 0, total: 0 }],
        deliveryFees: invoice.deliveryFees || 0,
        paidAmount: invoice.paidAmount || 0
      });
    }
  }, [invoice]);

  // Load available orders when the modal opens
  useEffect(() => {
    // In a real implementation, you would fetch from API
    // const response = await getAvailableOrders();
    setAvailableOrders(['ORD-1052', 'ORD-1048', 'ORD-1045', 'ORD-1042']);
  }, []);

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
    if (field === 'quantity' || field === 'price' || field === 'discount' || field === 'vat') {
      const qty = parseFloat(newProducts[index].quantity) || 0;
      const price = parseFloat(newProducts[index].price) || 0;
      const discount = parseFloat(newProducts[index].discount) || 0;
      const vat = parseFloat(newProducts[index].vat) || 0;
      const subTotal = qty * price;
      const discountAmount = subTotal * (discount / 100);
      const afterDiscount = subTotal - discountAmount;
      const vatAmount = afterDiscount * (vat / 100);
      newProducts[index].total = afterDiscount + vatAmount;
    }
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { id: Date.now(), name: '', quantity: 1, price: 0, vat: 20, discount: 0, total: 0 }]
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

  const calculateTotals = () => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
    const subtotal = formData.products.reduce((sum, p) => sum + (p.quantity * p.price || 0), 0);
    const totalDiscount = formData.products.reduce((sum, p) => {
      const sub = p.quantity * p.price || 0;
      return sum + (sub * (p.discount || 0) / 100);
    }, 0);
    const afterDiscount = subtotal - totalDiscount;
    const totalVat = formData.products.reduce((sum, p) => {
      const sub = p.quantity * p.price || 0;
      const disc = sub * (p.discount || 0) / 100;
      const afterDisc = sub - disc;
      return sum + (afterDisc * (p.vat || 0) / 100);
    }, 0);
    const delivery = parseFloat(formData.deliveryFees) || 0;
    const total = afterDiscount + totalVat + delivery;

    return { subtotal, totalDiscount, totalVat, delivery, total };
  };

  const totals = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.customer) newErrors.customer = t('orders.validation.customerRequired');
    if (!formData.orderNumber) newErrors.orderNumber = t('invoices.validation.orderRequired');
    if (formData.products.some(p => !p.name)) newErrors.products = t('orders.validation.productNameRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ ...formData, ...totals });
  };

  if (!isOpen) return null;

  const customers = ['Café Al Amir', 'Pâtisserie Nour', 'Restaurant La Table', 'Snack City'];

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {invoice ? t('invoices.modals.editTitle') : t('invoices.addInvoice')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Client *</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.customer ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              >
                <option value="">{tc('selectOption')}</option>
                {customers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.customer && <p className="text-xs text-rose-500 mt-1">{errors.customer}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Commande *</label>
              <select
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.orderNumber ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              >
                <option value="">{tc('selectOption')}</option>
                {availableOrders.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {errors.orderNumber && <p className="text-xs text-rose-500 mt-1">{errors.orderNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">N° Facture</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date facture</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date échéance</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Méthode de paiement</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="cash">{t('common.paymentMethods.cash')}</option>
                <option value="card">Carte bancaire</option>
                <option value="transfer">Virement</option>
                <option value="online">En ligne</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('status')}</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
              </select>
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
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{t('common.product')}</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Qté</label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Prix (DH)</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">TVA (%)</label>
                      <input
                        type="number"
                        value={product.vat}
                        onChange={(e) => handleProductChange(index, 'vat', parseFloat(e.target.value))}
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
                          {(product.total || 0).toFixed(2)} ${CURRENCY}
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
                <span className="font-medium text-[#3D2F24]">{totals.subtotal.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.totalDiscount')}</span>
                <span className="font-medium text-[#3D2F24]">{totals.totalDiscount.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">TVA</span>
                <span className="font-medium text-[#3D2F24]">{totals.totalVat.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Livraison</span>
                <span className="font-medium text-[#3D2F24]">{totals.delivery.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8E1]">
                <span className="font-bold text-[#3D2F24]">{t('orders.summary.grandTotal')}</span>
                <span className="font-bold text-[#3D2F24] text-lg">{totals.total.toFixed(2)} ${CURRENCY}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Montant payé</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut paiement</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="paid">Payée</option>
                <option value="unpaid">Non payée</option>
                <option value="partial">Partielle</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
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
              {isLoading ? tc('saving') : invoice ? tc('update') : tc('create')}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, invoice, isLoading }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  if (!isOpen) return null;

  const isPaid = invoice?.paymentStatus === 'paid';

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
          {t('invoices.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {isPaid ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ {tc('attention')}</span><br />
              {t('invoices.modals.deletePaidWarning')}
            </>
          ) : (
            <>
              {t('invoices.modals.deleteMessage', { number: invoice?.invoiceNumber })}{' '}
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
            disabled={isLoading || isPaid}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              isPaid ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {isPaid ? tc('impossible') : isLoading ? tc('deleting') : tc('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW INVOICE MODAL
// ==========================================
const ViewInvoiceModal = ({ isOpen, onClose, invoice }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('invoices');
  if (!isOpen || !invoice) return null;

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

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
            {t('invoices.modals.detailsTitle')}
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
              <p className="text-xl font-bold text-[#3D2F24]">{invoice.invoiceNumber}</p>
              <p className="text-sm text-[#6D6D6D]">Commande: {invoice.orderNumber}</p>
            </div>
            <div className="text-right">
              <InvoiceStatusBadge status={invoice.status} />
              <div className="mt-1">
                <PaymentStatusBadge status={invoice.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">{tc('customer')}</p>
              <p className="font-medium text-[#3D2F24]">{invoice.customer}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Méthode de paiement</p>
              <PaymentMethodBadge method={invoice.paymentMethod} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Date facture</p>
              <p className="text-sm font-medium text-[#3D2F24]">
                {new Date(invoice.invoiceDate).toLocaleDateString(DATE_LOCALE)}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Échéance</p>
              <p className="text-sm font-medium text-[#3D2F24]">
                {new Date(invoice.dueDate).toLocaleDateString(DATE_LOCALE)}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{tc('total')}</p>
              <p className="text-sm font-bold text-[#3D2F24]">{invoice.totalAmount.toLocaleString()} ${CURRENCY}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{t('common.statuses.paid')}</p>
              <p className="text-sm font-bold text-[#3D2F24]">{invoice.paidAmount.toLocaleString()} ${CURRENCY}</p>
            </div>
          </div>

          {remainingAmount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <Clock size={14} className="inline mr-1" />
                Montant restant: {remainingAmount.toLocaleString()} ${CURRENCY}
              </p>
            </div>
          )}

          <div className="bg-[#F8F7F4] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#3D2F24] mb-3">{tc('product')}</h4>
            <div className="space-y-2">
              {invoice.products && invoice.products.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#ECE8E1]">
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">{p.name}</p>
                    <p className="text-xs text-[#6D6D6D]">Qté: {p.quantity} × {p.price} ${CURRENCY}</p>
                  </div>
                  <p className="text-sm font-bold text-[#3D2F24]">{p.total?.toFixed(2)} ${CURRENCY}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#ECE8E1] space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.subtotal')}</span>
                <span className="text-[#3D2F24]">{invoice.subtotal?.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">TVA</span>
                <span className="text-[#3D2F24]">{invoice.totalVat?.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Livraison</span>
                <span className="text-[#3D2F24]">{invoice.deliveryFees?.toFixed(2)} ${CURRENCY}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#ECE8E1] font-bold">
                <span className="text-[#3D2F24]">{t('orders.summary.grandTotal')}</span>
                <span className="text-[#3D2F24]">{invoice.totalAmount.toFixed(2)} ${CURRENCY}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('notes')}</p>
              <p className="text-sm text-[#3D2F24]">{invoice.notes}</p>
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
// MAIN INVOICES PAGE
// ==========================================
const InvoicesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('invoices');
  const location = useLocation();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'invoiceDate',
        sort_order: 'desc'
      };
      const response = await getInvoices(params);
      const data = safeArray(response);
      setInvoices(data);
      setTotalCount(response.data?.meta?.total ?? data.length);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      setTotalCount(0);
      showToast(getApiErrorMessage(error, t('invoices.errors.load', t('errors.loadFailed'))), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage, searchTerm, paymentStatusFilter, statusFilter]);

  useEffect(() => {
    if (!location.state?.openAddModal) return;
    setIsCreateModalOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.openAddModal, navigate, location.pathname]);

  useEntityDeepLink({
    items: invoices,
    viewStateKey: 'viewInvoiceId',
    editStateKey: 'editInvoiceId',
    fetchById: getInvoiceById,
    onView: (invoice) => {
      setSelectedInvoice(invoice);
      setIsViewModalOpen(true);
    },
    onEdit: (invoice) => {
      setSelectedInvoice(invoice);
      setIsEditModalOpen(true);
    },
  });

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    today: 0,
    revenue: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getInvoiceStatistics();
      const data = response.data.data || {};
      setKpis({
        total: data.total || 0,
        paid: data.paid || 0,
        unpaid: data.unpaid || 0,
        overdue: data.overdue || 0,
        today: data.today || 0,
        revenue: data.revenue || 0
      });
    } catch (error) {
      console.error('Error fetching invoice statistics:', error);
      showToast(getApiErrorMessage(error, t('invoices.errors.load', t('errors.loadFailed'))), 'error');
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter invoices (API already handles filters)
  const filteredInvoices = useMemo(() => ensureArray(invoices), [invoices]);

  const invoiceExportContext = useMemo(
    () => ({
      filters: {
        search: searchTerm,
        paymentStatus: paymentStatusFilter,
        status: statusFilter,
      },
      totalCount,
    }),
    [searchTerm, paymentStatusFilter, statusFilter, totalCount]
  );

  // Paginate
  const paginatedInvoices = useMemo(() => ensureArray(filteredInvoices), [filteredInvoices]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: t('invoices.table.invoiceNumber'), accessor: 'invoiceNumber', width: 12 },
    { label: t('orders.table.orderNumber'), accessor: 'orderNumber', width: 12 },
    { label: t('orders.table.customer'), accessor: 'customer', width: 15 },
    { label: tc('date'), accessor: 'invoiceDate', width: 12 },
    { label: t('invoices.table.dueDate'), accessor: 'dueDate', width: 12 },
    { label: 'Total', accessor: 'totalAmount', width: 12 },
    { label: t('common.labels.paidAmount'), accessor: 'paidAmount', width: 12 },
    { label: 'Méthode', accessor: 'paymentMethod', width: 10 },
    { label: t('invoices.fields.paymentStatus'), accessor: 'paymentStatus', width: 12 },
    { label: 'Statut', accessor: 'status', width: 10 }
  ];

  const rowFormatter = (item) => ({
    invoiceNumber: item.invoiceNumber,
    orderNumber: item.orderNumber,
    customer: item.customer,
    invoiceDate: new Date(item.invoiceDate).toLocaleDateString(DATE_LOCALE),
    dueDate: new Date(item.dueDate).toLocaleDateString(DATE_LOCALE),
    totalAmount: `${item.totalAmount.toLocaleString()} ${CURRENCY}`,
    paidAmount: `${item.paidAmount.toLocaleString()} ${CURRENCY}`,
    paymentMethod: item.paymentMethod === 'cash' ? t('common.paymentMethods.cash') :
                   item.paymentMethod === 'card' ? t('common.paymentMethods.card') :
                   item.paymentMethod === 'transfer' ? t('common.paymentMethods.transfer') : t('common.paymentMethods.online'),
    paymentStatus: item.paymentStatus === 'paid' ? t('common.paymentStatus.paid') :
                   item.paymentStatus === 'unpaid' ? t('common.paymentStatus.unpaid') :
                   item.paymentStatus === 'partial' ? t('common.paymentStatus.partial') : t('common.statuses.overdue'),
    status: item.status === 'draft' ? t('orders.status.draft') :
            item.status === 'sent' ? t('common.statuses.sent') :
            item.status === 'paid' ? t('common.paymentStatus.paid') : t('common.cancelled')
  });

  const listSummary = useMemo(() => [
    { label: t('invoices.kpi.total'), value: kpis.total },
    { label: t('invoices.kpi.paid'), value: kpis.paid },
    { label: t('invoices.kpi.unpaid'), value: kpis.unpaid },
    { label: t('common.statuses.overdue'), value: kpis.overdue },
    { label: tc('today'), value: kpis.today },
    { label: t('finance.kpi.totalRevenue'), value: `${kpis.revenue.toLocaleString()} ${CURRENCY}` },
  ], [kpis, t, tc]);

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ScopedExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ScopedExportButtons
  };

  const handleCreateInvoice = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createInvoice(formData);
      const newInvoice = response.data.data;
      setInvoices(prev => [newInvoice, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast(getApiErrorMessage(error, t('invoices.errors.save', t('errors.saveFailed'))), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInvoice = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateInvoice(selectedInvoice.id, formData);
      const updatedInvoice = response.data.data;
      setInvoices(prev => prev.map(i =>
        i.id === selectedInvoice.id ? updatedInvoice : i
      ));
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating invoice:', error);
      showToast(getApiErrorMessage(error, t('invoices.errors.save', t('errors.saveFailed'))), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (selectedInvoice.paymentStatus === 'paid') return;
    setIsSaving(true);
    try {
      await deleteInvoice(selectedInvoice.id);
      setInvoices(prev => prev.filter(i => i.id !== selectedInvoice.id));
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showToast(getApiErrorMessage(error, t('invoices.errors.delete', t('errors.deleteFailed'))), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchInvoices();
    fetchStatistics();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter, statusFilter]);

  const uniquePaymentStatuses = useMemo(() => {
    const statuses = new Set(ensureArray(invoices).map(i => i.paymentStatus));
    return Array.from(statuses);
  }, [invoices]);

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
            pageId="invoices"
            pageContext={invoiceExportContext}
            columns={columns}
            title={t('invoices.export.title')}
            subtitle={`${filteredInvoices.length} factures - Total: ${kpis.revenue.toLocaleString()} ${CURRENCY}`}
            filename={`factures_${new Date().toISOString().split('T')[0]}`}
            summary={listSummary}
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
            {t('invoices.addInvoice')}
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
        <KPICard icon={FileText} title="Total factures" value={kpis.total} color="blue" />
        <KPICard icon={CheckCircle} title="Payées" value={kpis.paid} color="emerald" />
        <KPICard icon={XCircle} title="Non payées" value={kpis.unpaid} color="rose" />
        <KPICard icon={AlertCircle} title="En retard" value={kpis.overdue} color="red" />
        <KPICard icon={Calendar} title={tc('today')} value={kpis.today} color="purple" />
        <KPICard icon={DollarSign} title="Revenu total" value={`${kpis.revenue.toLocaleString()} ${CURRENCY}`} color="gold" />
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
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allPayments')}</option>
              {uniquePaymentStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'paid' ? t('common.labels.paidAmount') :
                   status === 'unpaid' ? t('common.paymentStatus.unpaid') :
                   status === 'partial' ? t('common.paymentStatus.partial') :
                   status === 'overdue' ? t('common.statuses.overdue') : status}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Facture</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('customer')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Échéance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('total')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.statuses.paid')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('method')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.invoices') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('invoices.empty')}</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('invoices.addInvoice')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ensureArray(paginatedInvoices).map((invoice, index) => (
                    <InvoiceTableRow
                      key={invoice.id}
                      invoice={invoice}
                      index={index}
                      onView={(i) => {
                        setSelectedInvoice(i);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(i) => {
                        setSelectedInvoice(i);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(i) => {
                        setSelectedInvoice(i);
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

      {/* Invoices Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.invoices') })}</p>
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <FileText size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('invoices.empty')}</p>
            </div>
          ) : (
            ensureArray(paginatedInvoices).map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={(i) => {
                  setSelectedInvoice(i);
                  setIsViewModalOpen(true);
                }}
                onEdit={(i) => {
                  setSelectedInvoice(i);
                  setIsEditModalOpen(true);
                }}
                onDelete={(i) => {
                  setSelectedInvoice(i);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Invoices Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.invoices') })}</p>
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileText size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('invoices.empty')}</p>
          </div>
        ) : (
          ensureArray(paginatedInvoices).map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={(i) => {
                setSelectedInvoice(i);
                setIsViewModalOpen(true);
              }}
              onEdit={(i) => {
                setSelectedInvoice(i);
                setIsEditModalOpen(true);
              }}
              onDelete={(i) => {
                setSelectedInvoice(i);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} factures
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
              Page {currentPage} sur {totalPages}
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
          <InvoiceModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateInvoice}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedInvoice && (
          <InvoiceModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedInvoice(null);
            }}
            onSave={handleEditInvoice}
            invoice={selectedInvoice}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedInvoice && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedInvoice(null);
            }}
            onConfirm={handleDeleteInvoice}
            invoice={selectedInvoice}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedInvoice && (
          <ViewInvoiceModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoicesPage;