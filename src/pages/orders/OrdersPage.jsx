// src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';
import orderService from '../../services/orderService';
import { exportPDF } from '../../services/export/pdfExport';
import { exportExcel } from '../../services/export/excelExport';
import { exportCSV } from '../../services/export/csvExport';
import { printData } from '../../services/export/printService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// CONSTANTES - DEVISE
// ==========================================
const CURRENCY = 'SAR';
const CURRENCY_SYMBOL = 'ر.س';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Brouillon', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    validated: { label: 'Validée', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_production: { label: 'En production', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    ready: { label: 'Prête', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    in_delivery: { label: 'En livraison', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    delivered: { label: 'Livrée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulée', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    rejected: { label: 'Refusée', class: 'bg-red-50 text-red-700 border-red-200' },
    archived: { label: 'Archivée', class: 'bg-gray-50 text-gray-500 border-gray-200' }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PRIORITY BADGE
// ==========================================
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: { label: 'Haute', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    medium: { label: 'Moyenne', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Basse', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================
const PaymentBadge = ({ status }) => {
  const config = {
    paid: { label: 'Payée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    partial: { label: 'Partielle', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    unpaid: { label: 'Non payée', class: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const c = config[status] || config.unpaid;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${c.class}`}>
      {c.label}
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
const OrderCard = ({ order, onView, onEdit, onDelete }) => {
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
          {order.products?.length || 0} produits
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
          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {order.status === 'delivered' && <CheckCircle size={14} className="text-emerald-500" />}
          {order.status === 'pending' && <Clock size={14} className="text-amber-500" />}
          {order.status === 'cancelled' && <XCircle size={14} className="text-rose-500" />}
          <span className="text-xs text-[#6D6D6D]">
            {order.status === 'draft' ? 'Brouillon' :
             order.status === 'pending' ? 'En attente' :
             order.status === 'validated' ? 'Validée' :
             order.status === 'in_production' ? 'En production' :
             order.status === 'ready' ? 'Prête' :
             order.status === 'in_delivery' ? 'En livraison' :
             order.status === 'delivered' ? 'Livrée' :
             order.status === 'cancelled' ? 'Annulée' :
             order.status === 'rejected' ? 'Refusée' :
             order.status === 'archived' ? 'Archivée' : order.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(order)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(order)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(order)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ORDER TABLE ROW (Desktop)
// ==========================================
const OrderTableRow = ({ order, onView, onEdit, onDelete, index }) => {
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
        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
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
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(order)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(order)}
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
// ORDER MODAL (Create/Edit)
// ==========================================
const OrderModal = ({ isOpen, onClose, onSave, order, isLoading }) => {
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
    return formData.products.reduce((sum, p) => sum + (p.total || 0), 0);
  };

  const calculateSubtotal = () => {
    return formData.products.reduce((sum, p) => sum + (p.quantity * p.price || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.customer) newErrors.customer = 'Le client est requis';
    if (!formData.rep) newErrors.rep = 'Le commercial est requis';
    if (formData.products.length === 0) newErrors.products = 'Au moins un produit est requis';
    if (formData.products.some(p => !p.name)) newErrors.products = 'Tous les produits doivent avoir un nom';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ ...formData, total: calculateTotal() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {order ? 'Modifier la commande' : 'Nouvelle commande'}
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
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Informations client</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Client *</label>
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
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Commercial *</label>
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
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Informations générales</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Priorité</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date livraison</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Heure livraison</label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Méthode paiement</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="credit">Crédit</option>
                </select>
              </div>
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                      <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">Prix ({CURRENCY_SYMBOL})</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
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
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Résumé</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Sous-total</span>
                <span className="font-medium text-[#3D2F24]">{calculateSubtotal().toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">Remise totale</span>
                <span className="font-medium text-[#3D2F24]">
                  {(calculateSubtotal() - calculateTotal()).toFixed(2)} {CURRENCY_SYMBOL}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8E1]">
                <span className="font-bold text-[#3D2F24]">Total TTC</span>
                <span className="font-bold text-[#3D2F24] text-lg">{calculateTotal().toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Notes</label>
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
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : order ? 'Mettre à jour' : 'Créer la commande'}
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
          Supprimer la commande ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          Vous êtes sur le point de supprimer la commande{' '}
          <span className="font-semibold text-[#3D2F24]">
            {order?.orderNumber}
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
// ORDER DETAILS MODAL
// ==========================================
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Détails de la commande
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E1]">
            <div>
              <p className="text-xl font-bold text-[#3D2F24]">{order.orderNumber}</p>
              <p className="text-sm text-[#6D6D6D]">{order.customer}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={order.status} />
              <div className="mt-1">
                <PriorityBadge priority={order.priority} />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Commercial</p>
              <p className="font-medium text-[#3D2F24]">{order.rep}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Date de création</p>
              <p className="font-medium text-[#3D2F24]">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Paiement</p>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Total</p>
              <p className="text-lg font-bold text-[#3D2F24]">{order.total.toLocaleString()} {CURRENCY_SYMBOL}</p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-[#F8F7F4] rounded-lg p-4">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">Produits</h4>
            <div className="space-y-2">
              {order.products && order.products.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#ECE8E1]">
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">{p.name}</p>
                    <p className="text-xs text-[#6D6D6D]">Quantité: {p.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#3D2F24]">{p.total?.toFixed(2)} {CURRENCY_SYMBOL}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-[#F8F7F4] rounded-lg p-4">
              <h4 className="text-sm font-bold text-[#3D2F24] mb-2">Notes</h4>
              <p className="text-sm text-[#6D6D6D]">{order.notes}</p>
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
// MAIN ORDERS PAGE
// ==========================================
const OrdersPage = () => {
  const { user } = useAuth();

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
      // Fallback: utiliser des données mock en cas d'erreur
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, searchTerm, statusFilter]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==========================================
  // CALCULATE KPIS
  // ==========================================
  const kpis = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const validated = orders.filter(o => o.status === 'validated').length;
    const inProduction = orders.filter(o => o.status === 'in_production').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

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
    { label: 'N° Commande', accessor: 'orderNumber', width: 12 },
    { label: 'Client', accessor: 'customer', width: 18 },
    { label: 'Commercial', accessor: 'rep', width: 15 },
    { label: 'Date', accessor: 'createdAt', width: 12 },
    { label: 'Produits', accessor: 'productCount', width: 10 },
    { label: 'Montant', accessor: 'total', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Priorité', accessor: 'priority', width: 10 },
    { label: 'Paiement', accessor: 'paymentStatus', width: 12 }
  ];

  const rowFormatter = (item) => ({
    orderNumber: item.orderNumber || '—',
    customer: item.customer || '—',
    rep: item.rep || '—',
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—',
    productCount: item.products?.length || 0,
    total: `${(item.total || 0).toLocaleString()} ${CURRENCY_SYMBOL}`,
    status: item.status === 'draft' ? 'Brouillon' :
            item.status === 'pending' ? 'En attente' :
            item.status === 'validated' ? 'Validée' :
            item.status === 'in_production' ? 'En production' :
            item.status === 'ready' ? 'Prête' :
            item.status === 'in_delivery' ? 'En livraison' :
            item.status === 'delivered' ? 'Livrée' :
            item.status === 'cancelled' ? 'Annulée' :
            item.status === 'rejected' ? 'Refusée' :
            item.status === 'archived' ? 'Archivée' : item.status || '—',
    priority: item.priority === 'high' ? 'Haute' :
              item.priority === 'medium' ? 'Moyenne' : 'Basse',
    paymentStatus: item.paymentStatus === 'paid' ? 'Payée' :
                   item.paymentStatus === 'partial' ? 'Partielle' : 'Non payée'
  });

  const summary = [
    { label: 'Total commandes', value: kpis.total },
    { label: 'En attente', value: kpis.pending },
    { label: 'En production', value: kpis.inProduction },
    { label: 'Livrées', value: kpis.delivered },
    { label: 'Annulées', value: kpis.cancelled },
    { label: 'CA', value: `${kpis.revenue.toLocaleString()} ${CURRENCY_SYMBOL}` }
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
            title: 'Liste des commandes',
            data: exportData,
            columns: columns,
            filename: `${filename}.pdf`,
            userName: user?.firstName || 'Utilisateur',
            summary: summary.reduce((acc, item) => {
              acc[item.label] = item.value;
              return acc;
            }, {})
          });
          break;
        case 'excel':
          await exportExcel({
            title: 'Liste des commandes',
            data: exportData,
            columns: columns,
            filename: `${filename}.xlsx`,
            userName: user?.firstName || 'Utilisateur'
          });
          break;
        case 'csv':
          await exportCSV({
            title: 'Liste des commandes',
            data: exportData,
            columns: columns,
            filename: `${filename}.csv`,
            userName: user?.firstName || 'Utilisateur'
          });
          break;
        case 'print':
          await printData({
            title: 'Liste des commandes',
            data: exportData,
            columns: columns,
            userName: user?.firstName || 'Utilisateur'
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
  const handleCreateOrder = async (formData) => {
    setIsSaving(true);
    try {
      const response = await orderService.createOrder(formData);
      setOrders(prev => [response.data, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSaving(false);
    }
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
            Commandes
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez le cycle complet des commandes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredOrders}
            columns={columns}
            title="Liste des commandes"
            subtitle={`${filteredOrders.length} commandes - CA: ${kpis.revenue.toLocaleString()} ${CURRENCY_SYMBOL}`}
            filename={`commandes_${new Date().toISOString().split('T')[0]}`}
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
            Nouvelle commande
          </button>
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KPICard icon={ShoppingBag} title="Total commandes" value={kpis.total} color="blue" />
        <KPICard icon={Clock} title="En attente" value={kpis.pending} color="amber" />
        <KPICard icon={CheckCircle} title="Validées" value={kpis.validated} color="indigo" />
        <KPICard icon={Factory} title="En production" value={kpis.inProduction} color="purple" />
        <KPICard icon={Package} title="Prêtes" value={kpis.ready} color="teal" />
        <KPICard icon={Truck} title="Livrées" value={kpis.delivered} color="emerald" />
        <KPICard icon={XCircle} title="Annulées" value={kpis.cancelled} color="rose" />
        <KPICard icon={DollarSign} title={`CA (${CURRENCY_SYMBOL})`} value={kpis.revenue.toLocaleString()} color="gold" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
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
                  {status === 'draft' ? 'Brouillon' :
                   status === 'pending' ? 'En attente' :
                   status === 'validated' ? 'Validée' :
                   status === 'in_production' ? 'En production' :
                   status === 'ready' ? 'Prête' :
                   status === 'in_delivery' ? 'En livraison' :
                   status === 'delivered' ? 'Livrée' :
                   status === 'cancelled' ? 'Annulée' :
                   status === 'rejected' ? 'Refusée' :
                   status === 'archived' ? 'Archivée' : status}
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
            <p className="text-sm text-[#6D6D6D]">Chargement des commandes...</p>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Commercial</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Produits</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Priorité</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag size={40} className="text-[#ECE8E1]" />
                          <p className="text-sm text-[#6D6D6D]">Aucune commande trouvée</p>
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
                        onView={(o) => {
                          setSelectedOrder(o);
                          setIsDetailsModalOpen(true);
                        }}
                        onEdit={(o) => {
                          setSelectedOrder(o);
                          setIsEditModalOpen(true);
                        }}
                        onDelete={(o) => {
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
                <p className="text-sm text-[#6D6D6D]">Aucune commande trouvée</p>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={(o) => {
                    setSelectedOrder(o);
                    setIsDetailsModalOpen(true);
                  }}
                  onEdit={(o) => {
                    setSelectedOrder(o);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={(o) => {
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
          <OrderModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateOrder}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedOrder && (
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

        {isDeleteModalOpen && selectedOrder && (
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;