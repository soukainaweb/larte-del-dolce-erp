// src/pages/Suppliers/SuppliersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
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
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  DollarSign,
  Package,
  ShoppingBag,
  Grid,
  List,
  Archive,
  Building2,
  CreditCard,
  Tag,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  deleteSupplier,
  getSupplierStatistics,
  exportSuppliers,
  getSupplierTypes,
  getSupplierStatuses,
  getSupplierPurchases
} from '../../services/supplierService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Actif', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Inactif', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// SUPPLIER TYPE BADGE
// ==========================================
const SupplierTypeBadge = ({ type }) => {
  const typeConfig = {
    raw: { label: 'Matières premières', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    packaging: { label: 'Emballages', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    equipment: { label: 'Équipements', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    services: { label: 'Services', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    other: { label: 'Autre', class: 'bg-gray-50 text-gray-700 border-gray-200' }
  };

  const config = typeConfig[type] || typeConfig.other;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PAYMENT TERMS BADGE
// ==========================================
const PaymentTermsBadge = ({ terms }) => {
  const termsConfig = {
    cash: { label: 'Comptant', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    credit: { label: 'Crédit', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    monthly: { label: 'Mensuel', class: 'bg-blue-50 text-blue-700 border-blue-200' }
  };

  const config = termsConfig[terms] || termsConfig.cash;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
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
      whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
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
// SUPPLIER CARD (Mobile)
// ==========================================
const SupplierCard = ({ supplier, onView, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center">
            <Building size={24} className="text-[#6D6D6D]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{supplier.name}</p>
            <p className="text-xs text-[#6D6D6D]">{supplier.supplierId}</p>
          </div>
        </div>
        <StatusBadge status={supplier.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <SupplierTypeBadge type={supplier.type} />
        <PaymentTermsBadge terms={supplier.paymentTerms} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Phone size={12} />
          {supplier.phone}
        </div>
        <div className="flex items-center gap-1">
          <Mail size={12} />
          {supplier.email}
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          {supplier.location || 'Non défini'}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {supplier.totalPurchases.toLocaleString()} DH
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(supplier.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(supplier)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(supplier)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onToggleStatus(supplier)} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
            {supplier.status === 'active' ? <Archive size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
          </button>
          <button onClick={() => onDelete(supplier)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUPPLIER TABLE ROW (Desktop)
// ==========================================
const SupplierTableRow = ({ supplier, onView, onEdit, onDelete, onToggleStatus, index }) => {
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
            <p className="text-sm font-medium text-[#3D2F24]">{supplier.name}</p>
            <p className="text-xs text-[#6D6D6D]">{supplier.supplierId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <SupplierTypeBadge type={supplier.type} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{supplier.contactPerson || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{supplier.phone}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{supplier.email}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {supplier.totalPurchases.toLocaleString()} DH
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={supplier.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(supplier)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onToggleStatus(supplier)}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
            title={supplier.status === 'active' ? 'Désactiver' : 'Activer'}
          >
            {supplier.status === 'active' ? <Archive size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
          </button>
          <button
            onClick={() => onDelete(supplier)}
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
// SUPPLIER MODAL
// ==========================================
const SupplierModal = ({ isOpen, onClose, onSave, supplier, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    type: 'raw',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    paymentTerms: 'cash',
    notes: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        company: supplier.company || '',
        type: supplier.type || 'raw',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || 'cash',
        notes: supplier.notes || '',
        status: supplier.status || 'active'
      });
    }
  }, [supplier]);

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
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

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
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {supplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Nom *</label>
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Entreprise</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="raw">Matières premières</option>
                <option value="packaging">Emballages</option>
                <option value="equipment">Équipements</option>
                <option value="services">Services</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Personne de contact</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.phone ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.email ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Adresse</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder="Adresse complète du fournisseur..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">N° Fiscal</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Conditions de paiement</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="cash">Comptant</option>
                <option value="credit">Crédit</option>
                <option value="monthly">Mensuel</option>
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
              placeholder="Informations supplémentaires..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
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
              {isLoading ? 'Enregistrement...' : supplier ? 'Mettre à jour' : 'Ajouter'}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, supplier, isLoading }) => {
  if (!isOpen) return null;

  const hasPurchases = supplier?.totalPurchases > 0;

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
          Supprimer le fournisseur ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {hasPurchases ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ Attention :</span><br />
              Ce fournisseur a des commandes associées ({supplier.totalPurchases.toLocaleString()} DH).
              Vous ne pouvez pas le supprimer.
            </>
          ) : (
            <>
              Vous êtes sur le point de supprimer le fournisseur{' '}
              <span className="font-semibold text-[#3D2F24]">
                {supplier?.name}
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
            disabled={isLoading || hasPurchases}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              hasPurchases ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {hasPurchases ? 'Impossible' : isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW SUPPLIER MODAL
// ==========================================
const ViewSupplierModal = ({ isOpen, onClose, supplier }) => {
  if (!isOpen || !supplier) return null;

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
            Détails du fournisseur
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
              <p className="text-xl font-semibold text-[#3D2F24]">{supplier.name}</p>
              <p className="text-sm text-[#6D6D6D]">{supplier.supplierId}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={supplier.status} />
                <SupplierTypeBadge type={supplier.type} />
                <PaymentTermsBadge terms={supplier.paymentTerms} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Total commandes</p>
              <p className="text-lg font-bold text-[#3D2F24]">{supplier.totalOrders || 0}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Montant total</p>
              <p className="text-lg font-bold text-[#3D2F24]">{supplier.totalPurchases.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">Entreprise: {supplier.company || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">Contact: {supplier.contactPerson || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{supplier.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{supplier.email}</span>
            </div>
            {supplier.address && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{supplier.address}</span>
              </div>
            )}
            {supplier.notes && (
              <div className="p-3 bg-[#F8F7F4] rounded-lg">
                <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
                <p className="text-sm text-[#3D2F24]">{supplier.notes}</p>
              </div>
            )}
          </div>

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
// MAIN SUPPLIERS PAGE
// ==========================================
const SuppliersPage = () => {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load suppliers
  const fetchSuppliers = async () => {
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
      const response = await getSuppliers(params);
      const data = response.data.data || [];
      setSuppliers(data);
      setTotalCount(response.data.meta?.total || data.length);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, itemsPerPage, searchTerm, typeFilter, statusFilter]);

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    raw: 0,
    packaging: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getSupplierStatistics();
      const stats = response.data.data || {};
      setKpis({
        total: stats.total || 0,
        active: stats.active || 0,
        raw: stats.raw || 0,
        packaging: stats.packaging || 0
      });
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter suppliers (API already handles filters)
  const filteredSuppliers = useMemo(() => {
    return suppliers;
  }, [suppliers]);

  // Paginate
  const paginatedSuppliers = useMemo(() => {
    return filteredSuppliers;
  }, [filteredSuppliers]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom', accessor: 'name', width: 18 },
    { label: 'ID', accessor: 'supplierId', width: 10 },
    { label: 'Entreprise', accessor: 'company', width: 18 },
    { label: 'Type', accessor: 'type', width: 14 },
    { label: 'Contact', accessor: 'contactPerson', width: 14 },
    { label: 'Téléphone', accessor: 'phone', width: 14 },
    { label: 'Email', accessor: 'email', width: 20 },
    { label: 'Total achats', accessor: 'totalPurchases', width: 14 },
    { label: 'Statut', accessor: 'status', width: 10 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    supplierId: item.supplierId,
    company: item.company || '—',
    type: item.type === 'raw' ? 'Matières premières' :
          item.type === 'packaging' ? 'Emballages' :
          item.type === 'equipment' ? 'Équipements' :
          item.type === 'services' ? 'Services' : 'Autre',
    contactPerson: item.contactPerson || '—',
    phone: item.phone,
    email: item.email,
    totalPurchases: `${item.totalPurchases.toLocaleString()} DH`,
    status: item.status === 'active' ? 'Actif' :
            item.status === 'inactive' ? 'Inactif' : 'En attente'
  });

  const summary = [
    { label: 'Total fournisseurs', value: kpis.total },
    { label: 'Fournisseurs actifs', value: kpis.active },
    { label: 'Matières premières', value: kpis.raw },
    { label: 'Emballages', value: kpis.packaging }
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

  // Handlers
  const handleCreateSupplier = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createSupplier(formData);
      const newSupplier = response.data.data;
      setSuppliers(prev => [newSupplier, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating supplier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSupplier = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateSupplier(selectedSupplier.id, formData);
      const updatedSupplier = response.data.data;
      setSuppliers(prev => prev.map(s =>
        s.id === selectedSupplier.id ? updatedSupplier : s
      ));
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating supplier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (selectedSupplier.totalPurchases > 0) return;
    setIsSaving(true);
    try {
      await deleteSupplier(selectedSupplier.id);
      setSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id));
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting supplier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (supplier) => {
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await updateSupplierStatus(supplier.id, { status: newStatus });
      const updatedSupplier = response.data.data;
      setSuppliers(prev => prev.map(s =>
        s.id === supplier.id ? updatedSupplier : s
      ));
      await fetchStatistics();
    } catch (error) {
      console.error('Error toggling supplier status:', error);
    }
  };

  const handleRefresh = () => {
    fetchSuppliers();
    fetchStatistics();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(suppliers.map(s => s.type));
    return Array.from(types);
  }, [suppliers]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Fournisseurs
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez vos fournisseurs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredSuppliers}
            columns={columns}
            title="Liste des fournisseurs"
            subtitle={`${filteredSuppliers.length} fournisseurs`}
            filename={`fournisseurs_${new Date().toISOString().split('T')[0]}`}
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
            Ajouter un fournisseur
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={Users} title="Total fournisseurs" value={kpis.total} color="blue" />
        <KPICard icon={CheckCircle} title="Fournisseurs actifs" value={kpis.active} color="emerald" />
        <KPICard icon={Package} title="Matières premières" value={kpis.raw} color="purple" />
        <KPICard icon={ShoppingBag} title="Emballages" value={kpis.packaging} color="teal" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
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
              <option value="all">Tous les types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'raw' ? 'Matières premières' :
                   type === 'packaging' ? 'Emballages' :
                   type === 'equipment' ? 'Équipements' :
                   type === 'services' ? 'Services' : 'Autre'}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Achats</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">Chargement des fournisseurs...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">Aucun fournisseur trouvé</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          Ajouter un fournisseur
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((supplier, index) => (
                    <SupplierTableRow
                      key={supplier.id}
                      supplier={supplier}
                      index={index}
                      onView={(s) => {
                        setSelectedSupplier(s);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(s) => {
                        setSelectedSupplier(s);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(s) => {
                        setSelectedSupplier(s);
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

      {/* Suppliers Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">Chargement des fournisseurs...</p>
            </div>
          ) : paginatedSuppliers.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Users size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">Aucun fournisseur trouvé</p>
            </div>
          ) : (
            paginatedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onView={(s) => {
                  setSelectedSupplier(s);
                  setIsViewModalOpen(true);
                }}
                onEdit={(s) => {
                  setSelectedSupplier(s);
                  setIsEditModalOpen(true);
                }}
                onDelete={(s) => {
                  setSelectedSupplier(s);
                  setIsDeleteModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      )}

      {/* Suppliers Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">Chargement des fournisseurs...</p>
          </div>
        ) : paginatedSuppliers.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Users size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucun fournisseur trouvé</p>
          </div>
        ) : (
          paginatedSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onView={(s) => {
                setSelectedSupplier(s);
                setIsViewModalOpen(true);
              }}
              onEdit={(s) => {
                setSelectedSupplier(s);
                setIsEditModalOpen(true);
              }}
              onDelete={(s) => {
                setSelectedSupplier(s);
                setIsDeleteModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredSuppliers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} fournisseurs
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
          <SupplierModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateSupplier}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedSupplier && (
          <SupplierModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSupplier(null);
            }}
            onSave={handleEditSupplier}
            supplier={selectedSupplier}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedSupplier && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedSupplier(null);
            }}
            onConfirm={handleDeleteSupplier}
            supplier={selectedSupplier}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedSupplier && (
          <ViewSupplierModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedSupplier(null);
            }}
            supplier={selectedSupplier}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersPage;