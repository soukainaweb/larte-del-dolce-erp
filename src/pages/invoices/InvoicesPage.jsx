// src/pages/Invoices/InvoicesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
import ExportButtons from '../../components/ExportButtons';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================
const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    paid: { label: 'Payée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    unpaid: { label: 'Non payée', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    partial: { label: 'Partielle', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    overdue: { label: 'En retard', class: 'bg-red-50 text-red-700 border-red-200' }
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
  const statusConfig = {
    draft: { label: 'Brouillon', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    sent: { label: 'Envoyée', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    paid: { label: 'Payée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulée', class: 'bg-rose-50 text-rose-700 border-rose-200' }
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
  const methodConfig = {
    cash: { label: 'Espèces', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    card: { label: 'Carte', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    transfer: { label: 'Virement', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    online: { label: 'En ligne', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
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
          {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {invoice.totalAmount.toLocaleString()} DH
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle size={12} />
          {invoice.paidAmount.toLocaleString()} DH
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
        {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {invoice.totalAmount.toLocaleString()} DH
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {invoice.paidAmount.toLocaleString()} DH
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
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(invoice)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(invoice)}
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
// INVOICE MODAL (Add/Edit)
// ==========================================
const InvoiceModal = ({ isOpen, onClose, onSave, invoice, isLoading }) => {
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
    if (!formData.customer) newErrors.customer = 'Le client est requis';
    if (!formData.orderNumber) newErrors.orderNumber = 'La commande est requise';
    if (formData.products.some(p => !p.name)) newErrors.products = 'Tous les produits doivent avoir un nom';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ ...formData, ...totals });
  };

  if (!isOpen) return null;

  const customers = ['Café Al Amir', 'Pâtisserie Nour', 'Restaurant La Table', 'Snack City'];
  const orders = ['ORD-1052', 'ORD-1048', 'ORD-1045', 'ORD-1042'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
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
                <option value="">Sélectionner</option>
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
                <option value="">Sélectionner</option>
                {orders.map(o => (
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
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="transfer">Virement</option>
                <option value="online">En ligne</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut</label>
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
              <h4 className="text-sm font-bold text-[#3D2F24]">Produits</h4>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B8863B] rounded-lg hover:bg-[#A67937] transition-colors"
              >
                <Plus size={14} />
                Ajouter produit
              </button>
            </div>
            <div className="space-y-3">
              {formData.products.map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-[#ECE8E1]">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Produit</label>
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
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Remise (%)</label>
                      <input
                        type="number"
                        value={product.discount}
                        onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Total</label>
                        <p className="text-sm font-bold text-[#3D2F24]">
                          {(product.total || 0).toFixed(2)} DH
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
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Résumé</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Sous-total</span>
                <span className="font-medium text-[#3D2F24]">{totals.subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Remise totale</span>
                <span className="font-medium text-[#3D2F24]">{totals.totalDiscount.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">TVA</span>
                <span className="font-medium text-[#3D2F24]">{totals.totalVat.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Livraison</span>
                <span className="font-medium text-[#3D2F24]">{totals.delivery.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8E1]">
                <span className="font-bold text-[#3D2F24]">Total TTC</span>
                <span className="font-bold text-[#3D2F24] text-lg">{totals.total.toFixed(2)} DH</span>
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Notes</label>
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
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : invoice ? 'Mettre à jour' : 'Créer'}
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
  if (!isOpen) return null;

  const isPaid = invoice?.paymentStatus === 'paid';

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
          Supprimer la facture ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {isPaid ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ Attention :</span><br />
              Cette facture est déjà payée. Vous ne pouvez pas la supprimer.
            </>
          ) : (
            <>
              Vous êtes sur le point de supprimer la facture{' '}
              <span className="font-semibold text-[#3D2F24]">
                {invoice?.invoiceNumber}
              </span>.
              Cette action est irréversible.
            </>
          )}
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
            disabled={isLoading || isPaid}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              isPaid ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {isPaid ? 'Impossible' : isLoading ? 'Suppression...' : 'Supprimer'}
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
  if (!isOpen || !invoice) return null;

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Détails de la facture
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
              <p className="text-xs text-[#6D6D6D]">Client</p>
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
                {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Échéance</p>
              <p className="text-sm font-medium text-[#3D2F24]">
                {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Total</p>
              <p className="text-sm font-bold text-[#3D2F24]">{invoice.totalAmount.toLocaleString()} DH</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Payé</p>
              <p className="text-sm font-bold text-[#3D2F24]">{invoice.paidAmount.toLocaleString()} DH</p>
            </div>
          </div>

          {remainingAmount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <Clock size={14} className="inline mr-1" />
                Montant restant: {remainingAmount.toLocaleString()} DH
              </p>
            </div>
          )}

          <div className="bg-[#F8F7F4] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#3D2F24] mb-3">Produits</h4>
            <div className="space-y-2">
              {invoice.products && invoice.products.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#ECE8E1]">
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">{p.name}</p>
                    <p className="text-xs text-[#6D6D6D]">Qté: {p.quantity} × {p.price} DH</p>
                  </div>
                  <p className="text-sm font-bold text-[#3D2F24]">{p.total?.toFixed(2)} DH</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#ECE8E1] space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Sous-total</span>
                <span className="text-[#3D2F24]">{invoice.subtotal?.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">TVA</span>
                <span className="text-[#3D2F24]">{invoice.totalVat?.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Livraison</span>
                <span className="text-[#3D2F24]">{invoice.deliveryFees?.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#ECE8E1] font-bold">
                <span className="text-[#3D2F24]">Total TTC</span>
                <span className="text-[#3D2F24]">{invoice.totalAmount.toFixed(2)} DH</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
              <p className="text-sm text-[#3D2F24]">{invoice.notes}</p>
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
// MAIN INVOICES PAGE
// ==========================================
const InvoicesPage = () => {
  const { user } = useAuth();

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

  // Load invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockInvoices = [
          {
            id: 1,
            invoiceNumber: 'INV-0125',
            orderNumber: 'ORD-1052',
            customer: 'Café Al Amir',
            invoiceDate: new Date('2025-07-10'),
            dueDate: new Date('2025-08-09'),
            paymentMethod: 'cash',
            paymentStatus: 'unpaid',
            status: 'sent',
            notes: 'Facture pour commande urgente',
            products: [
              { name: 'Gâteau Chocolat', quantity: 3, price: 120, vat: 20, discount: 0, total: 432 },
              { name: 'Tarte aux Fruits', quantity: 2, price: 85, vat: 20, discount: 0, total: 204 }
            ],
            subtotal: 530,
            totalVat: 106,
            deliveryFees: 25,
            totalAmount: 661,
            paidAmount: 0,
            isOverdue: false,
            createdAt: new Date('2025-07-10')
          },
          {
            id: 2,
            invoiceNumber: 'INV-0124',
            orderNumber: 'ORD-1048',
            customer: 'Pâtisserie Nour',
            invoiceDate: new Date('2025-07-08'),
            dueDate: new Date('2025-08-07'),
            paymentMethod: 'card',
            paymentStatus: 'paid',
            status: 'paid',
            notes: '',
            products: [
              { name: 'Croissant Beurre', quantity: 5, price: 15, vat: 20, discount: 0, total: 90 },
              { name: 'Pain au Chocolat', quantity: 3, price: 18, vat: 20, discount: 0, total: 64.8 }
            ],
            subtotal: 129,
            totalVat: 25.8,
            deliveryFees: 15,
            totalAmount: 169.8,
            paidAmount: 169.8,
            isOverdue: false,
            createdAt: new Date('2025-07-08')
          },
          {
            id: 3,
            invoiceNumber: 'INV-0123',
            orderNumber: 'ORD-1045',
            customer: 'Restaurant La Table',
            invoiceDate: new Date('2025-07-05'),
            dueDate: new Date('2025-08-04'),
            paymentMethod: 'transfer',
            paymentStatus: 'partial',
            status: 'sent',
            notes: 'Paiement partiel reçu',
            products: [
              { name: 'Éclair Vanille', quantity: 4, price: 45, vat: 20, discount: 0, total: 216 },
              { name: 'Macaron Coffret', quantity: 2, price: 85, vat: 20, discount: 0, total: 204 }
            ],
            subtotal: 350,
            totalVat: 70,
            deliveryFees: 0,
            totalAmount: 420,
            paidAmount: 200,
            isOverdue: false,
            createdAt: new Date('2025-07-05')
          },
          {
            id: 4,
            invoiceNumber: 'INV-0122',
            orderNumber: 'ORD-1042',
            customer: 'Snack City',
            invoiceDate: new Date('2025-06-20'),
            dueDate: new Date('2025-07-20'),
            paymentMethod: 'cash',
            paymentStatus: 'overdue',
            status: 'sent',
            notes: 'Facture en retard',
            products: [
              { name: 'Sandwich Mix', quantity: 10, price: 25, vat: 20, discount: 0, total: 300 }
            ],
            subtotal: 250,
            totalVat: 50,
            deliveryFees: 20,
            totalAmount: 320,
            paidAmount: 0,
            isOverdue: true,
            createdAt: new Date('2025-06-20')
          }
        ];
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(i => i.paymentStatus === 'paid').length;
    const unpaid = invoices.filter(i => i.paymentStatus === 'unpaid').length;
    const overdue = invoices.filter(i => i.isOverdue).length;
    const today = invoices.filter(i => {
      const today = new Date();
      const invoiceDate = new Date(i.invoiceDate);
      return invoiceDate.getDate() === today.getDate() &&
             invoiceDate.getMonth() === today.getMonth() &&
             invoiceDate.getFullYear() === today.getFullYear();
    }).length;
    const revenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return { total, paid, unpaid, overdue, today, revenue };
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.invoiceNumber.toLowerCase().includes(term) ||
        i.orderNumber.toLowerCase().includes(term) ||
        i.customer.toLowerCase().includes(term)
      );
    }

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(i => i.paymentStatus === paymentStatusFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    return filtered;
  }, [invoices, searchTerm, paymentStatusFilter, statusFilter]);

  // Paginate
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'N° Facture', accessor: 'invoiceNumber', width: 12 },
    { label: 'N° Commande', accessor: 'orderNumber', width: 12 },
    { label: 'Client', accessor: 'customer', width: 15 },
    { label: 'Date', accessor: 'invoiceDate', width: 12 },
    { label: 'Échéance', accessor: 'dueDate', width: 12 },
    { label: 'Total', accessor: 'totalAmount', width: 12 },
    { label: 'Payé', accessor: 'paidAmount', width: 12 },
    { label: 'Méthode', accessor: 'paymentMethod', width: 10 },
    { label: 'Statut paiement', accessor: 'paymentStatus', width: 12 },
    { label: 'Statut', accessor: 'status', width: 10 }
  ];

  const rowFormatter = (item) => ({
    invoiceNumber: item.invoiceNumber,
    orderNumber: item.orderNumber,
    customer: item.customer,
    invoiceDate: new Date(item.invoiceDate).toLocaleDateString('fr-FR'),
    dueDate: new Date(item.dueDate).toLocaleDateString('fr-FR'),
    totalAmount: `${item.totalAmount.toLocaleString()} DH`,
    paidAmount: `${item.paidAmount.toLocaleString()} DH`,
    paymentMethod: item.paymentMethod === 'cash' ? 'Espèces' :
                   item.paymentMethod === 'card' ? 'Carte' :
                   item.paymentMethod === 'transfer' ? 'Virement' : 'En ligne',
    paymentStatus: item.paymentStatus === 'paid' ? 'Payée' :
                   item.paymentStatus === 'unpaid' ? 'Non payée' :
                   item.paymentStatus === 'partial' ? 'Partielle' : 'En retard',
    status: item.status === 'draft' ? 'Brouillon' :
            item.status === 'sent' ? 'Envoyée' :
            item.status === 'paid' ? 'Payée' : 'Annulée'
  });

  const summary = [
    { label: 'Total factures', value: kpis.total },
    { label: 'Payées', value: kpis.paid },
    { label: 'Non payées', value: kpis.unpaid },
    { label: 'En retard', value: kpis.overdue },
    { label: "Aujourd'hui", value: kpis.today },
    { label: 'Revenu total', value: `${kpis.revenue.toLocaleString()} DH` }
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

  const handleCreateInvoice = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newInvoice = {
        id: invoices.length + 1,
        ...formData,
        createdAt: new Date()
      };
      setInvoices(prev => [newInvoice, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInvoice = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setInvoices(prev => prev.map(i =>
        i.id === selectedInvoice.id ? { ...i, ...formData } : i
      ));
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (selectedInvoice.paymentStatus === 'paid') return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setInvoices(prev => prev.filter(i => i.id !== selectedInvoice.id));
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter, statusFilter]);

  const uniquePaymentStatuses = useMemo(() => {
    const statuses = new Set(invoices.map(i => i.paymentStatus));
    return Array.from(statuses);
  }, [invoices]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Factures
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez toutes vos factures</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredInvoices}
            columns={columns}
            title="Liste des factures"
            subtitle={`${filteredInvoices.length} factures - Total: ${kpis.revenue.toLocaleString()} DH`}
            filename={`factures_${new Date().toISOString().split('T')[0]}`}
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
            Nouvelle facture
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
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
            onClick={() => window.location.reload()}
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
        <KPICard icon={Calendar} title="Aujourd'hui" value={kpis.today} color="purple" />
        <KPICard icon={DollarSign} title="Revenu total" value={`${kpis.revenue.toLocaleString()} DH`} color="gold" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher une facture..."
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
              <option value="all">Tous les paiements</option>
              {uniquePaymentStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'paid' ? 'Payé' :
                   status === 'unpaid' ? 'Non payé' :
                   status === 'partial' ? 'Partiel' :
                   status === 'overdue' ? 'En retard' : status}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les statuts</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Échéance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Payé</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">Chargement des factures...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">Aucune facture trouvée</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          Créer une facture
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice, index) => (
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
              <p className="text-sm text-[#6D6D6D]">Chargement des factures...</p>
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <FileText size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">Aucune facture trouvée</p>
            </div>
          ) : (
            paginatedInvoices.map((invoice) => (
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
            <p className="text-sm text-[#6D6D6D]">Chargement des factures...</p>
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileText size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucune facture trouvée</p>
          </div>
        ) : (
          paginatedInvoices.map((invoice) => (
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
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} sur {filteredInvoices.length} factures
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