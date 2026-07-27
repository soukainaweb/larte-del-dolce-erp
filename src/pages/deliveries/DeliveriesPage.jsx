// src/pages/Deliveries/DeliveriesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
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
  MapPin,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  FileText,
  Grid,
  List,
  MoreHorizontal,
  Star,
  Users,
  UserCheck,
  UserX,
  Car,
  Bike,
  Truck as TruckIcon,
  CreditCard,
  Wallet,
  Printer,
  Clock as ClockIcon,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  CheckSquare,
  XCircle,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';

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
    pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    assigned: { label: 'Assignée', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    preparing: { label: 'Préparation', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    out_for_delivery: { label: 'En livraison', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    delivered: { label: 'Livrée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulée', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    failed: { label: 'Échouée', class: 'bg-red-50 text-red-700 border-red-200' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
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
// VEHICLE BADGE
// ==========================================
const VehicleBadge = ({ vehicle }) => {
  const vehicleConfig = {
    moto: { label: 'Moto', icon: Bike, class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    car: { label: 'Voiture', icon: Car, class: 'bg-blue-50 text-blue-700 border-blue-200' },
    van: { label: 'Camion', icon: TruckIcon, class: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  const config = vehicleConfig[vehicle] || vehicleConfig.car;
  const Icon = config.icon;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      <Icon size={10} className="inline mr-1" />
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
// DELIVERY CARD (Mobile)
// ==========================================
const DeliveryCard = ({ delivery, onView, onEdit, onDelete, onStatusChange }) => {
  // Valeur par défaut pour éviter les erreurs
  const totalAmount = delivery?.totalAmount || 0;
  const deliveryDate = delivery?.deliveryDate ? new Date(delivery.deliveryDate) : new Date();
  const createdAt = delivery?.createdAt ? new Date(delivery.createdAt) : new Date();

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#3D2F24]">{delivery?.deliveryId || '—'}</p>
          <p className="text-xs text-[#6D6D6D]">Commande: {delivery?.orderNumber || '—'}</p>
        </div>
        <StatusBadge status={delivery?.status} />
      </div>
      <div className="flex items-center gap-2">
        <User size={14} className="text-[#6D6D6D]" />
        <p className="text-sm font-medium text-[#3D2F24]">{delivery?.customer || '—'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PaymentBadge status={delivery?.paymentStatus} />
        <VehicleBadge vehicle={delivery?.vehicle} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {deliveryDate.toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {delivery?.deliveryTime || '—'}
        </div>
        <div className="flex items-center gap-1">
          <User size={12} />
          {delivery?.deliveryPerson || 'Non assigné'}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {totalAmount.toLocaleString()} {CURRENCY_SYMBOL}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {delivery?.isUrgent && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">Urgent</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(delivery)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(delivery)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(delivery)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DELIVERY TABLE ROW (Desktop)
// ==========================================
const DeliveryTableRow = ({ delivery, onView, onEdit, onDelete, onStatusChange, index }) => {
  // Valeur par défaut pour éviter les erreurs
  const totalAmount = delivery?.totalAmount || 0;
  const deliveryDate = delivery?.deliveryDate ? new Date(delivery.deliveryDate) : new Date();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#3D2F24]">{delivery?.deliveryId || '—'}</p>
        <p className="text-xs text-[#6D6D6D]">{delivery?.orderNumber || '—'}</p>
      </td>
      <td className="px-4 py-3 text-sm text-[#3D2F24]">{delivery?.customer || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{delivery?.deliveryPerson || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {deliveryDate.toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{delivery?.deliveryTime || '—'}</td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {totalAmount.toLocaleString()} {CURRENCY_SYMBOL}
      </td>
      <td className="px-4 py-3">
        <PaymentBadge status={delivery?.paymentStatus} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={delivery?.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(delivery)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(delivery)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(delivery)}
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
// DELIVERY MODAL (Add/Edit) - CORRIGÉ
// ==========================================
const DeliveryModal = ({ isOpen, onClose, onSave, delivery, isLoading }) => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customer: '',
    address: '',
    phone: '',
    deliveryPerson: '',
    vehicle: 'car',
    deliveryDate: '',
    deliveryTime: '',
    notes: '',
    status: 'pending',
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    deliveryFees: 0,
    isUrgent: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (delivery) {
      // CORRECTION: Vérifier si deliveryDate est une chaîne ou un objet Date
      let deliveryDateStr = '';
      if (delivery.deliveryDate) {
        if (typeof delivery.deliveryDate === 'string') {
          deliveryDateStr = delivery.deliveryDate.split('T')[0];
        } else if (delivery.deliveryDate instanceof Date) {
          deliveryDateStr = delivery.deliveryDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        orderNumber: delivery.orderNumber || '',
        customer: delivery.customer || '',
        address: delivery.address || '',
        phone: delivery.phone || '',
        deliveryPerson: delivery.deliveryPerson || '',
        vehicle: delivery.vehicle || 'car',
        deliveryDate: deliveryDateStr,
        deliveryTime: delivery.deliveryTime || '',
        notes: delivery.notes || '',
        status: delivery.status || 'pending',
        paymentMethod: delivery.paymentMethod || 'cash',
        paymentStatus: delivery.paymentStatus || 'unpaid',
        deliveryFees: delivery.deliveryFees || 0,
        isUrgent: delivery.isUrgent || false
      });
    } else {
      setFormData({
        orderNumber: '',
        customer: '',
        address: '',
        phone: '',
        deliveryPerson: '',
        vehicle: 'car',
        deliveryDate: '',
        deliveryTime: '',
        notes: '',
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'unpaid',
        deliveryFees: 0,
        isUrgent: false
      });
    }
  }, [delivery]);

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
    if (!formData.orderNumber) newErrors.orderNumber = 'Le numéro de commande est requis';
    if (!formData.customer) newErrors.customer = 'Le client est requis';
    if (!formData.address) newErrors.address = 'L\'adresse est requise';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  const deliveryPersons = ['Ahmed Benjelloun', 'Sara El Idrissi', 'Mohamed Amine', 'Karim Lahlou'];

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
            {delivery ? 'Modifier la livraison' : 'Ajouter une livraison'}
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">N° Commande *</label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.orderNumber ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.orderNumber && <p className="text-xs text-rose-500 mt-1">{errors.orderNumber}</p>}
            </div>
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Adresse *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.address ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Livreur</label>
              <select
                name="deliveryPerson"
                value={formData.deliveryPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="">Sélectionner</option>
                {deliveryPersons.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Véhicule</label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="moto">Moto</option>
                <option value="car">Voiture</option>
                <option value="van">Camion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date de livraison</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Heure de livraison</label>
              <input
                type="time"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="pending">En attente</option>
                <option value="assigned">Assignée</option>
                <option value="preparing">Préparation</option>
                <option value="out_for_delivery">En livraison</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Mode de paiement</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="online">En ligne</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut paiement</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="paid">Payée</option>
                <option value="partial">Partielle</option>
                <option value="unpaid">Non payée</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Frais de livraison ({CURRENCY_SYMBOL})</label>
              <input
                type="number"
                name="deliveryFees"
                value={formData.deliveryFees}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">Livraison urgente</span>
            </label>
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
              {isLoading ? 'Enregistrement...' : delivery ? 'Mettre à jour' : 'Ajouter'}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, delivery, isLoading }) => {
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
          Supprimer la livraison ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {delivery?.status === 'delivered' ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ Attention :</span><br />
              Cette livraison est déjà terminée. Vous ne pouvez pas la supprimer.
            </>
          ) : delivery?.status === 'out_for_delivery' ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ Attention :</span><br />
              Cette livraison est en cours. Vous ne pouvez pas la supprimer.
            </>
          ) : (
            <>
              Vous êtes sur le point de supprimer la livraison{' '}
              <span className="font-semibold text-[#3D2F24]">
                {delivery?.deliveryId}
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
            disabled={isLoading || delivery?.status === 'delivered' || delivery?.status === 'out_for_delivery'}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              delivery?.status === 'delivered' || delivery?.status === 'out_for_delivery'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {delivery?.status === 'delivered' || delivery?.status === 'out_for_delivery'
              ? 'Impossible'
              : isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW DELIVERY MODAL
// ==========================================
const ViewDeliveryModal = ({ isOpen, onClose, delivery }) => {
  if (!isOpen || !delivery) return null;

  const totalAmount = delivery?.totalAmount || 0;
  const deliveryFees = delivery?.deliveryFees || 0;
  const deliveryDate = delivery?.deliveryDate ? new Date(delivery.deliveryDate) : new Date();
  const createdAt = delivery?.createdAt ? new Date(delivery.createdAt) : new Date();

  const timeline = [
    { status: 'Order Created', date: createdAt, completed: true },
    { status: 'Preparing', date: createdAt, completed: true },
    { status: 'Ready', date: createdAt, completed: delivery.status !== 'pending' },
    { status: 'Assigned', date: createdAt, completed: delivery.status !== 'pending' && delivery.status !== 'preparing' },
    { status: 'Out for Delivery', date: createdAt, completed: delivery.status === 'out_for_delivery' || delivery.status === 'delivered' },
    { status: 'Delivered', date: createdAt, completed: delivery.status === 'delivered' }
  ];

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
            Détails de la livraison
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
              <p className="text-xl font-bold text-[#3D2F24]">{delivery.deliveryId}</p>
              <p className="text-sm text-[#6D6D6D]">Commande: {delivery.orderNumber}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={delivery.status} />
              <div className="mt-1">
                <PaymentBadge status={delivery.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Client</p>
              <p className="font-medium text-[#3D2F24]">{delivery.customer}</p>
              <p className="text-xs text-[#6D6D6D]">{delivery.phone}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Livreur</p>
              <p className="font-medium text-[#3D2F24]">{delivery.deliveryPerson || 'Non assigné'}</p>
              <VehicleBadge vehicle={delivery.vehicle} />
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-lg p-3">
            <p className="text-xs text-[#6D6D6D]">Adresse de livraison</p>
            <p className="text-sm text-[#3D2F24]">{delivery.address}</p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Date</p>
              <p className="text-sm font-medium text-[#3D2F24]">
                {deliveryDate.toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Heure</p>
              <p className="text-sm font-medium text-[#3D2F24]">{delivery.deliveryTime}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Total</p>
              <p className="text-sm font-bold text-[#3D2F24]">{totalAmount.toLocaleString()} {CURRENCY_SYMBOL}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Frais</p>
              <p className="text-sm font-medium text-[#3D2F24]">{deliveryFees.toLocaleString()} {CURRENCY_SYMBOL}</p>
            </div>
          </div>

          {delivery.notes && (
            <div className="p-3 bg-[#F8F7F4] rounded-lg">
              <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
              <p className="text-sm text-[#3D2F24]">{delivery.notes}</p>
            </div>
          )}

          <div className="bg-[#F8F7F4] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#3D2F24] mb-3">Timeline de livraison</h4>
            <div className="space-y-2">
              {timeline.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    t.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {t.completed ? <CheckCircle size={14} /> : <ClockIcon size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${t.completed ? 'text-[#3D2F24]' : 'text-[#6D6D6D]'}`}>
                      {t.status}
                    </p>
                  </div>
                  {t.completed && (
                    <span className="text-xs text-[#6D6D6D]">
                      {new Date(t.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
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
// MAIN DELIVERIES PAGE
// ==========================================
const DeliveriesPage = () => {
  const { user } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockDeliveries = [
          {
            id: 1,
            deliveryId: 'DEL-0001',
            orderNumber: 'ORD-1052',
            customer: 'Café Al Amir',
            phone: '+212 5 22 12 34 56',
            address: '12 Rue Al Amir, Quartier Maarif, Casablanca',
            deliveryPerson: 'Ahmed Benjelloun',
            vehicle: 'car',
            deliveryDate: new Date('2025-07-15'),
            deliveryTime: '14:30',
            notes: 'Livraison urgente, contacter le client avant départ',
            status: 'out_for_delivery',
            paymentMethod: 'cash',
            paymentStatus: 'unpaid',
            deliveryFees: 25,
            totalAmount: 12450,
            isUrgent: true,
            createdAt: new Date('2025-07-14')
          },
          {
            id: 2,
            deliveryId: 'DEL-0002',
            orderNumber: 'ORD-1048',
            customer: 'Pâtisserie Nour',
            phone: '+212 5 37 65 43 21',
            address: '45 Avenue Hassan II, Rabat',
            deliveryPerson: 'Sara El Idrissi',
            vehicle: 'van',
            deliveryDate: new Date('2025-07-15'),
            deliveryTime: '10:00',
            notes: '',
            status: 'delivered',
            paymentMethod: 'card',
            paymentStatus: 'paid',
            deliveryFees: 40,
            totalAmount: 8750,
            isUrgent: false,
            createdAt: new Date('2025-07-13')
          },
          {
            id: 3,
            deliveryId: 'DEL-0003',
            orderNumber: 'ORD-1045',
            customer: 'Restaurant La Table',
            phone: '+212 5 29 98 76 54',
            address: '8 Rue de la Plage, Agadir',
            deliveryPerson: '',
            vehicle: 'car',
            deliveryDate: new Date('2025-07-16'),
            deliveryTime: '12:00',
            notes: 'Client demande livraison avant 12h',
            status: 'pending',
            paymentMethod: 'online',
            paymentStatus: 'partial',
            deliveryFees: 35,
            totalAmount: 15200,
            isUrgent: false,
            createdAt: new Date('2025-07-14')
          },
          {
            id: 4,
            deliveryId: 'DEL-0004',
            orderNumber: 'ORD-1042',
            customer: 'Snack City',
            phone: '+212 6 12 34 56 78',
            address: '23 Rue de la Liberté, Casablanca',
            deliveryPerson: 'Karim Lahlou',
            vehicle: 'moto',
            deliveryDate: new Date('2025-07-14'),
            deliveryTime: '18:00',
            notes: '',
            status: 'cancelled',
            paymentMethod: 'cash',
            paymentStatus: 'unpaid',
            deliveryFees: 15,
            totalAmount: 4350,
            isUrgent: false,
            createdAt: new Date('2025-07-13')
          }
        ];
        setDeliveries(mockDeliveries);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const inProgress = deliveries.filter(d => d.status === 'out_for_delivery' || d.status === 'preparing').length;
    const cancelled = deliveries.filter(d => d.status === 'cancelled').length;
    const today = deliveries.filter(d => {
      const today = new Date();
      const deliveryDate = new Date(d.deliveryDate);
      return deliveryDate.getDate() === today.getDate() &&
             deliveryDate.getMonth() === today.getMonth() &&
             deliveryDate.getFullYear() === today.getFullYear();
    }).length;

    return { total, delivered, pending, inProgress, cancelled, today };
  }, [deliveries]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    let filtered = deliveries;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.deliveryId.toLowerCase().includes(term) ||
        d.orderNumber.toLowerCase().includes(term) ||
        d.customer.toLowerCase().includes(term) ||
        d.phone.includes(term) ||
        (d.deliveryPerson && d.deliveryPerson.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    return filtered;
  }, [deliveries, searchTerm, statusFilter]);

  // Paginate
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeliveries.slice(start, start + itemsPerPage);
  }, [filteredDeliveries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'ID Livraison', accessor: 'deliveryId', width: 12 },
    { label: 'N° Commande', accessor: 'orderNumber', width: 12 },
    { label: 'Client', accessor: 'customer', width: 15 },
    { label: 'Livreur', accessor: 'deliveryPerson', width: 15 },
    { label: 'Date', accessor: 'deliveryDate', width: 12 },
    { label: 'Heure', accessor: 'deliveryTime', width: 10 },
    { label: 'Montant', accessor: 'totalAmount', width: 10 },
    { label: 'Statut paiement', accessor: 'paymentStatus', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 }
  ];

  const rowFormatter = (item) => ({
    deliveryId: item.deliveryId || '—',
    orderNumber: item.orderNumber || '—',
    customer: item.customer || '—',
    deliveryPerson: item.deliveryPerson || 'Non assigné',
    deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('fr-FR') : '—',
    deliveryTime: item.deliveryTime || '—',
    totalAmount: `${(item.totalAmount || 0).toLocaleString()} ${CURRENCY_SYMBOL}`,
    paymentStatus: item.paymentStatus === 'paid' ? 'Payée' : item.paymentStatus === 'partial' ? 'Partielle' : 'Non payée',
    status: item.status === 'pending' ? 'En attente' :
            item.status === 'assigned' ? 'Assignée' :
            item.status === 'preparing' ? 'Préparation' :
            item.status === 'out_for_delivery' ? 'En livraison' :
            item.status === 'delivered' ? 'Livrée' :
            item.status === 'cancelled' ? 'Annulée' :
            item.status === 'failed' ? 'Échouée' : item.status || '—'
  });

  const summary = [
    { label: 'Total livraisons', value: kpis.total },
    { label: 'Livrées', value: kpis.delivered },
    { label: 'En attente', value: kpis.pending },
    { label: 'En cours', value: kpis.inProgress },
    { label: 'Annulées', value: kpis.cancelled },
    { label: "Aujourd'hui", value: kpis.today }
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
  const handleAddDelivery = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    // Re-fetch data by toggling loading state
    setIsLoading(true);
    setTimeout(() => {
      // Simulate data refresh
      setIsLoading(false);
      alert('Données actualisées');
    }, 500);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    alert('Filtres réinitialisés');
  };

  const handleCreateDelivery = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newDelivery = {
        id: deliveries.length + 1,
        deliveryId: `DEL-${String(deliveries.length + 1).padStart(4, '0')}`,
        ...formData,
        totalAmount: 0,
        createdAt: new Date()
      };
      setDeliveries(prev => [newDelivery, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating delivery:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDelivery = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeliveries(prev => prev.map(d =>
        d.id === selectedDelivery.id ? { ...d, ...formData } : d
      ));
      setIsEditModalOpen(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error updating delivery:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDelivery = async () => {
    if (selectedDelivery.status === 'delivered' || selectedDelivery.status === 'out_for_delivery') return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeliveries(prev => prev.filter(d => d.id !== selectedDelivery.id));
      setIsDeleteModalOpen(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error deleting delivery:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(deliveries.map(d => d.status));
    return Array.from(statuses);
  }, [deliveries]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Livraisons
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez toutes vos livraisons</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredDeliveries}
            columns={columns}
            title="Liste des livraisons"
            subtitle={`${filteredDeliveries.length} livraisons`}
            filename={`livraisons_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={handleAddDelivery}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Ajouter une livraison
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
        <KPICard icon={Truck} title="Total livraisons" value={kpis.total} color="blue" />
        <KPICard icon={CheckCircle} title="Livrées" value={kpis.delivered} color="emerald" />
        <KPICard icon={Clock} title="En attente" value={kpis.pending} color="amber" />
        <KPICard icon={TrendingUp} title="En cours" value={kpis.inProgress} color="indigo" />
        <KPICard icon={XCircle} title="Annulées" value={kpis.cancelled} color="rose" />
        <KPICard icon={Calendar} title="Aujourd'hui" value={kpis.today} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher une livraison..."
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
                  {status === 'pending' ? 'En attente' :
                   status === 'assigned' ? 'Assignée' :
                   status === 'preparing' ? 'Préparation' :
                   status === 'out_for_delivery' ? 'En livraison' :
                   status === 'delivered' ? 'Livrée' :
                   status === 'cancelled' ? 'Annulée' :
                   status === 'failed' ? 'Échouée' : status}
                </option>
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

      {/* Deliveries Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Livraison</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Livreur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Heure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">Chargement des livraisons...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Truck size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">Aucune livraison trouvée</p>
                        <button
                          onClick={handleAddDelivery}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          Ajouter une livraison
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDeliveries.map((delivery, index) => (
                    <DeliveryTableRow
                      key={delivery.id}
                      delivery={delivery}
                      index={index}
                      onView={(d) => {
                        setSelectedDelivery(d);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(d) => {
                        setSelectedDelivery(d);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(d) => {
                        setSelectedDelivery(d);
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

      {/* Deliveries Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">Chargement des livraisons...</p>
            </div>
          ) : paginatedDeliveries.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Truck size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">Aucune livraison trouvée</p>
            </div>
          ) : (
            paginatedDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onView={(d) => {
                  setSelectedDelivery(d);
                  setIsViewModalOpen(true);
                }}
                onEdit={(d) => {
                  setSelectedDelivery(d);
                  setIsEditModalOpen(true);
                }}
                onDelete={(d) => {
                  setSelectedDelivery(d);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Deliveries Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">Chargement des livraisons...</p>
          </div>
        ) : paginatedDeliveries.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Truck size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucune livraison trouvée</p>
          </div>
        ) : (
          paginatedDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onView={(d) => {
                setSelectedDelivery(d);
                setIsViewModalOpen(true);
              }}
              onEdit={(d) => {
                setSelectedDelivery(d);
                setIsEditModalOpen(true);
              }}
              onDelete={(d) => {
                setSelectedDelivery(d);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredDeliveries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} sur {filteredDeliveries.length} livraisons
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
          <DeliveryModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateDelivery}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedDelivery && (
          <DeliveryModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDelivery(null);
            }}
            onSave={handleEditDelivery}
            delivery={selectedDelivery}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedDelivery && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedDelivery(null);
            }}
            onConfirm={handleDeleteDelivery}
            delivery={selectedDelivery}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedDelivery && (
          <ViewDeliveryModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedDelivery(null);
            }}
            delivery={selectedDelivery}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveriesPage;