// src/pages/Payments/PaymentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
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
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Building,
  MapPin,
  MoreHorizontal,
  Tag,
  Percent,
  Truck,
  CheckSquare,
  XCircle,
  Users,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard as CardIcon,
  Landmark,
  Apple,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
  getPaymentStatistics,
  exportPayments,
  getInvoiceDetails,
  getPaymentMethods,
  getPaymentStatuses,
  sendPaymentReceipt,
  printPaymentReceipt
} from '../../services/paymentService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR (ر.س)';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'card', label: 'Carte bancaire', icon: CardIcon },
  { value: 'mada', label: 'Mada', icon: CreditCard },
  { value: 'stc_pay', label: 'STC Pay', icon: Smartphone },
  { value: 'apple_pay', label: 'Apple Pay', icon: Apple },
  { value: 'bank_transfer', label: 'Virement bancaire', icon: Landmark },
  { value: 'online', label: 'Paiement en ligne', icon: Sparkles }
];

const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Payé', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pending', label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'partial', label: 'Partiel', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'overdue', label: 'En retard', class: 'bg-rose-50 text-rose-700 border-rose-200' }
];

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const config = PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
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
  const config = PAYMENT_METHODS.find(m => m.value === method);
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
// PAYMENT CARD (Mobile)
// ==========================================
const PaymentCard = ({ payment, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#3D2F24]">{payment.paymentId}</p>
          <p className="text-xs text-[#6D6D6D]">Facture: {payment.invoiceNumber}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>
      <div className="flex items-center gap-2">
        <User size={14} className="text-[#6D6D6D]" />
        <p className="text-sm font-medium text-[#3D2F24]">{payment.customer}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PaymentMethodBadge method={payment.method} />
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#F8F7F4] text-[#6D6D6D] border-[#ECE8E1]">
          {payment.collectedBy || '—'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(payment.date).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {payment.amount.toLocaleString()} {CURRENCY}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          Reste: {payment.remainingAmount.toLocaleString()} {CURRENCY}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {payment.reference && (
            <span className="text-[10px] text-[#6D6D6D]">Ref: {payment.reference}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(payment)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(payment)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(payment)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAYMENT TABLE ROW (Desktop)
// ==========================================
const PaymentTableRow = ({ payment, onView, onEdit, onDelete, index }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#3D2F24]">{payment.paymentId}</p>
        <p className="text-xs text-[#6D6D6D]">{payment.invoiceNumber}</p>
      </td>
      <td className="px-4 py-3 text-sm text-[#3D2F24]">{payment.customer}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(payment.date).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3">
        <PaymentMethodBadge method={payment.method} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {payment.amount.toLocaleString()} {CURRENCY}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {payment.remainingAmount.toLocaleString()} {CURRENCY}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={payment.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{payment.collectedBy || '—'}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(payment)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(payment)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(payment)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// PAYMENT MODAL (Add/Edit)
// ==========================================
const PaymentModal = ({ isOpen, onClose, onSave, payment, isLoading }) => {
  const [formData, setFormData] = useState({
    customer: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    amountReceived: 0,
    reference: '',
    notes: ''
  });

  const [invoiceData, setInvoiceData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payment) {
      setFormData({
        customer: payment.customer || '',
        invoiceNumber: payment.invoiceNumber || '',
        date: payment.date ? payment.date.split('T')[0] : new Date().toISOString().split('T')[0],
        method: payment.method || 'cash',
        amountReceived: payment.amount || 0,
        reference: payment.reference || '',
        notes: payment.notes || ''
      });
    }
  }, [payment]);

  // Load invoice data when invoice number changes
  useEffect(() => {
    if (formData.invoiceNumber) {
      const fetchInvoice = async () => {
        try {
          const response = await getInvoiceDetails(formData.invoiceNumber);
          setInvoiceData(response.data.data);
          setFormData(prev => ({
            ...prev,
            customer: response.data.data.customer
          }));
        } catch (error) {
          console.error('Error fetching invoice details:', error);
          setInvoiceData(null);
        }
      };
      fetchInvoice();
    } else {
      setInvoiceData(null);
    }
  }, [formData.invoiceNumber]);

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
    if (!formData.customer) newErrors.customer = 'Le client est requis';
    if (!formData.invoiceNumber) newErrors.invoiceNumber = 'La facture est requise';
    if (formData.amountReceived <= 0) newErrors.amountReceived = 'Le montant est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const remaining = (invoiceData?.remainingAmount || 0) - formData.amountReceived;
    const status = remaining <= 0 ? 'paid' : remaining < (invoiceData?.totalAmount || 0) ? 'partial' : 'pending';

    onSave({
      ...formData,
      amount: formData.amountReceived,
      remainingAmount: remaining > 0 ? remaining : 0,
      status
    });
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
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
                {payment ? 'Modifier le paiement' : 'Nouveau paiement'}
              </h3>
              <p className="text-xs text-[#6D6D6D]">Enregistrer un paiement client</p>
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
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Client *</label>
              <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
                errors.customer ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
                <User size={14} className="text-[#6D6D6D]" />
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  placeholder="Nom du client"
                />
              </div>
              {errors.customer && <p className="text-[10px] text-rose-500 mt-1">{errors.customer}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Facture *</label>
              <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
                errors.invoiceNumber ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
                <FileText size={14} className="text-[#6D6D6D]" />
                <select
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  <option value="">Sélectionner une facture</option>
                  {/* Options will be loaded from API in a real implementation */}
                  <option value="INV-0125">INV-0125</option>
                  <option value="INV-0124">INV-0124</option>
                  <option value="INV-0123">INV-0123</option>
                  <option value="INV-0122">INV-0122</option>
                </select>
              </div>
              {errors.invoiceNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.invoiceNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Date de paiement</label>
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
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Méthode de paiement</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <CreditCard size={14} className="text-[#6D6D6D]" />
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          {invoiceData && (
            <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
              <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Résumé de la facture</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-2 text-center border border-[#ECE8E1]">
                  <p className="text-[9px] text-[#6D6D6D] font-semibold uppercase tracking-wider">Total facture</p>
                  <p className="text-sm font-bold text-[#3D2F24]">{invoiceData.totalAmount.toLocaleString()} {CURRENCY}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-[#ECE8E1]">
                  <p className="text-[9px] text-[#6D6D6D] font-semibold uppercase tracking-wider">Déjà payé</p>
                  <p className="text-sm font-bold text-emerald-600">{invoiceData.paidAmount.toLocaleString()} {CURRENCY}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-[#ECE8E1]">
                  <p className="text-[9px] text-[#6D6D6D] font-semibold uppercase tracking-wider">Reste à payer</p>
                  <p className="text-sm font-bold text-amber-600">{invoiceData.remainingAmount.toLocaleString()} {CURRENCY}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-[#ECE8E1]">
                  <p className="text-[9px] text-[#6D6D6D] font-semibold uppercase tracking-wider">Montant saisi</p>
                  <p className="text-sm font-bold text-[#B8863B]">{formData.amountReceived.toLocaleString()} {CURRENCY}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Montant reçu *</label>
              <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg ${
                errors.amountReceived ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}>
                <DollarSign size={14} className="text-[#6D6D6D]" />
                <input
                  type="number"
                  name="amountReceived"
                  value={formData.amountReceived}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <span className="text-[10px] text-[#6D6D6D] font-medium">{CURRENCY}</span>
              </div>
              {errors.amountReceived && <p className="text-[10px] text-rose-500 mt-1">{errors.amountReceived}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Référence</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ECE8E1] rounded-lg">
                <Tag size={14} className="text-[#6D6D6D]" />
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#3D2F24]"
                  placeholder="ID de transaction..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1 uppercase tracking-wide">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder="Informations supplémentaires..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  {payment ? 'Mettre à jour' : 'Enregistrer le paiement'}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, payment, isLoading }) => {
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
          Supprimer le paiement ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          Vous êtes sur le point de supprimer le paiement{' '}
          <span className="font-semibold text-[#3D2F24]">
            {payment?.paymentId}
          </span>.
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW PAYMENT MODAL
// ==========================================
const ViewPaymentModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

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
            Détails du paiement
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
              <p className="text-xl font-bold text-[#3D2F24]">{payment.paymentId}</p>
              <p className="text-sm text-[#6D6D6D]">Facture: {payment.invoiceNumber}</p>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Client</p>
              <p className="font-medium text-[#3D2F24]">{payment.customer}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Méthode</p>
              <PaymentMethodBadge method={payment.method} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Date</p>
              <p className="text-sm font-medium text-[#3D2F24]">
                {new Date(payment.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Montant</p>
              <p className="text-sm font-bold text-[#3D2F24]">{payment.amount.toLocaleString()} {CURRENCY}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Reste</p>
              <p className="text-sm font-bold text-amber-600">{payment.remainingAmount.toLocaleString()} {CURRENCY}</p>
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-lg p-3">
            <p className="text-xs text-[#6D6D6D]">Employé</p>
            <p className="text-sm text-[#3D2F24]">{payment.collectedBy || '—'}</p>
          </div>

          {payment.reference && (
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Référence</p>
              <p className="text-sm text-[#3D2F24]">{payment.reference}</p>
            </div>
          )}

          {payment.notes && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
              <p className="text-sm text-[#3D2F24]">{payment.notes}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN PAYMENTS PAGE
// ==========================================
const PaymentsPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t } = usePageI18n('payments');

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load payments
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'date',
        sort_order: 'desc'
      };
      const response = await getPayments(params);
      const data = response.data.data || [];
      setPayments(data);
      setTotalCount(response.data.meta?.total || data.length);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    total: 0,
    today: 0,
    pending: 0,
    partiallyPaid: 0,
    overdue: 0,
    monthRevenue: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getPaymentStatistics();
      const data = response.data.data || {};
      setKpis({
        total: data.total || 0,
        today: data.today || 0,
        pending: data.pending || 0,
        partiallyPaid: data.partially_paid || 0,
        overdue: data.overdue || 0,
        monthRevenue: data.month_revenue || 0
      });
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter payments (API already handles filters)
  const filteredPayments = useMemo(() => {
    return payments;
  }, [payments]);

  // Paginate
  const paginatedPayments = useMemo(() => {
    return filteredPayments;
  }, [filteredPayments]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'N° Paiement', accessor: 'paymentId', width: 12 },
    { label: 'N° Facture', accessor: 'invoiceNumber', width: 12 },
    { label: 'Client', accessor: 'customer', width: 18 },
    { label: 'Date', accessor: 'date', width: 12 },
    { label: 'Méthode', accessor: 'method', width: 12 },
    { label: 'Montant', accessor: 'amount', width: 12 },
    { label: 'Reste', accessor: 'remainingAmount', width: 12 },
    { label: 'Statut', accessor: 'status', width: 10 },
    { label: 'Employé', accessor: 'collectedBy', width: 14 }
  ];

  const rowFormatter = (item) => ({
    paymentId: item.paymentId,
    invoiceNumber: item.invoiceNumber,
    customer: item.customer,
    date: new Date(item.date).toLocaleDateString('fr-FR'),
    method: PAYMENT_METHODS.find(m => m.value === item.method)?.label || '—',
    amount: `${item.amount.toLocaleString()} ${CURRENCY}`,
    remainingAmount: `${item.remainingAmount.toLocaleString()} ${CURRENCY}`,
    status: item.status === 'paid' ? 'Payé' :
            item.status === 'pending' ? 'En attente' :
            item.status === 'partial' ? 'Partiel' : 'En retard',
    collectedBy: item.collectedBy || '—'
  });

  const summary = [
    { label: 'Total des paiements', value: `${kpis.total.toLocaleString()} ${CURRENCY}` },
    { label: "Reçu aujourd'hui", value: `${kpis.today.toLocaleString()} ${CURRENCY}` },
    { label: 'En attente', value: `${kpis.pending.toLocaleString()} ${CURRENCY}` },
    { label: 'Partiellement payées', value: kpis.partiallyPaid },
    { label: 'En retard', value: `${kpis.overdue.toLocaleString()} ${CURRENCY}` },
    { label: 'Revenu du mois', value: `${kpis.monthRevenue.toLocaleString()} ${CURRENCY}` }
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

  const handleCreatePayment = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createPayment(formData);
      const newPayment = response.data.data;
      setPayments(prev => [newPayment, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPayment = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updatePayment(selectedPayment.id, formData);
      const updatedPayment = response.data.data;
      setPayments(prev => prev.map(p =>
        p.id === selectedPayment.id ? updatedPayment : p
      ));
      setIsEditModalOpen(false);
      setSelectedPayment(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    setIsSaving(true);
    try {
      await deletePayment(selectedPayment.id);
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      setIsDeleteModalOpen(false);
      setSelectedPayment(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting payment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
    fetchStatistics();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(payments.map(p => p.status));
    return Array.from(statuses);
  }, [payments]);

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
            data={filteredPayments}
            columns={columns}
            title="Liste des paiements"
            subtitle={`${filteredPayments.length} paiements - Total: ${kpis.total.toLocaleString()} ${CURRENCY}`}
            filename={`paiements_${new Date().toISOString().split('T')[0]}`}
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
            Nouveau paiement
          </button>
          <div className="flex items-center gap-1 border border-[#ECE8E1] rounded-xl bg-white p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title="Vue tableau"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title="Vue grille"
            >
              <Grid size={18} />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <KPICard icon={CreditCard} title="Total des paiements" value={kpis.total} color="blue" isCurrency />
        <KPICard icon={Calendar} title="Reçu aujourd'hui" value={kpis.today} color="emerald" isCurrency />
        <KPICard icon={Clock} title="En attente" value={kpis.pending} color="amber" isCurrency />
        <KPICard icon={AlertCircle} title="Partiellement payées" value={kpis.partiallyPaid} color="gold" />
        <KPICard icon={AlertCircle} title="En retard" value={kpis.overdue} color="rose" isCurrency />
        <KPICard icon={TrendingUp} title="Revenu du mois" value={kpis.monthRevenue} color="purple" isCurrency />
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
              <option value="all">Tous les statuts</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'paid' ? 'Payé' :
                   status === 'pending' ? 'En attente' :
                   status === 'partial' ? 'Partiel' :
                   status === 'overdue' ? 'En retard' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Reste</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Employé</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">Chargement des paiements...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">Aucun paiement trouvé</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          Enregistrer un paiement
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((payment, index) => (
                    <PaymentTableRow
                      key={payment.id}
                      payment={payment}
                      index={index}
                      onView={(p) => {
                        setSelectedPayment(p);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(p) => {
                        setSelectedPayment(p);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(p) => {
                        setSelectedPayment(p);
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

      {/* Payments Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">Chargement des paiements...</p>
            </div>
          ) : paginatedPayments.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <CreditCard size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">Aucun paiement trouvé</p>
            </div>
          ) : (
            paginatedPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onView={(p) => {
                  setSelectedPayment(p);
                  setIsViewModalOpen(true);
                }}
                onEdit={(p) => {
                  setSelectedPayment(p);
                  setIsEditModalOpen(true);
                }}
                onDelete={(p) => {
                  setSelectedPayment(p);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Payments Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">Chargement des paiements...</p>
          </div>
        ) : paginatedPayments.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <CreditCard size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucun paiement trouvé</p>
          </div>
        ) : (
          paginatedPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onView={(p) => {
                setSelectedPayment(p);
                setIsViewModalOpen(true);
              }}
              onEdit={(p) => {
                setSelectedPayment(p);
                setIsEditModalOpen(true);
              }}
              onDelete={(p) => {
                setSelectedPayment(p);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} paiements
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
          <PaymentModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreatePayment}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedPayment && (
          <PaymentModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPayment(null);
            }}
            onSave={handleEditPayment}
            payment={selectedPayment}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedPayment && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedPayment(null);
            }}
            onConfirm={handleDeletePayment}
            payment={selectedPayment}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedPayment && (
          <ViewPaymentModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentsPage;