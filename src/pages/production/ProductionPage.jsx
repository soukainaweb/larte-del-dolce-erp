// src/pages/Production/ProductionPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory,
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
  Play,
  Pause,
  Square,
  User,
  Building,
  FileText,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import {
  getProductions,
  createProduction,
  updateProduction,
  deleteProduction,
  updateProductionStatus,
  updateProductionProgress,
  getProductionStatistics,
  exportProductions,
  getProductionStatuses,
  getProductionPriorities
} from '../../services/productionService';

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
    pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    in_progress: { label: 'En production', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    paused: { label: 'Suspendue', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    completed: { label: 'Terminée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulée', class: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const config = statusConfig[status] || statusConfig.pending;

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
// PROGRESS BAR
// ==========================================
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-[#F8F7F4] rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

// ==========================================
// PRODUCTION CARD (Mobile)
// ==========================================
const ProductionCard = ({ production, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B]">
            <Factory size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{production.name}</p>
            <p className="text-xs text-[#6D6D6D]">Commande #{production.orderId}</p>
          </div>
        </div>
        <StatusBadge status={production.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={production.priority} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#6D6D6D]">
          <span>Progression</span>
          <span className="font-semibold text-[#3D2F24]">{production.progress}%</span>
        </div>
        <ProgressBar progress={production.progress} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {production.startDate ? new Date(production.startDate).toLocaleDateString('fr-FR') : 'Non commencée'}
        </div>
        <div className="flex items-center gap-1">
          <User size={12} />
          {production.assignedTo || 'Non assigné'}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(production.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(production)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(production)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(production)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PRODUCTION TABLE ROW (Desktop)
// ==========================================
const ProductionTableRow = ({ production, onEdit, onDelete, onView, index }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] flex-shrink-0">
            <Factory size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{production.name}</p>
            <p className="text-xs text-[#6D6D6D]">Commande #{production.orderId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={production.status} />
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={production.priority} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-[#6D6D6D]">
            <span>{production.progress}%</span>
          </div>
          <ProgressBar progress={production.progress} />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {production.assignedTo || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {production.startDate ? new Date(production.startDate).toLocaleDateString('fr-FR') : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {production.endDate ? new Date(production.endDate).toLocaleDateString('fr-FR') : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(production)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(production)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(production)}
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
// PRODUCTION MODAL
// ==========================================
const ProductionModal = ({ isOpen, onClose, onSave, production, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    orderId: '',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    assignedTo: '',
    startDate: '',
    endDate: '',
    notes: '',
    product: '',
    quantity: 1
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (production) {
      setFormData({
        name: production.name || '',
        orderId: production.orderId || '',
        status: production.status || 'pending',
        priority: production.priority || 'medium',
        progress: production.progress || 0,
        assignedTo: production.assignedTo || '',
        startDate: production.startDate ? production.startDate.split('T')[0] : '',
        endDate: production.endDate ? production.endDate.split('T')[0] : '',
        notes: production.notes || '',
        product: production.product || '',
        quantity: production.quantity || 1
      });
    } else {
      setFormData({
        name: '',
        orderId: '',
        status: 'pending',
        priority: 'medium',
        progress: 0,
        assignedTo: '',
        startDate: '',
        endDate: '',
        notes: '',
        product: '',
        quantity: 1
      });
    }
  }, [production]);

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
    if (!formData.orderId) newErrors.orderId = 'Le numéro de commande est requis';

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
            {production ? 'Modifier la production' : 'Ajouter une production'}
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">N° Commande *</label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.orderId ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.orderId && <p className="text-xs text-rose-500 mt-1">{errors.orderId}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Produit</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Quantité</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Assigné à</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
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
                <option value="in_progress">En production</option>
                <option value="paused">Suspendue</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Date fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Progression</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="flex-1 h-2 bg-[#F8F7F4] rounded-full appearance-none cursor-pointer accent-[#B8863B]"
              />
              <span className="text-sm font-bold text-[#3D2F24] min-w-[40px]">{formData.progress}%</span>
            </div>
          </div>

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
              {isLoading ? 'Enregistrement...' : production ? 'Mettre à jour' : 'Ajouter'}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, production, isLoading }) => {
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
          Supprimer la production ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          Vous êtes sur le point de supprimer la production{' '}
          <span className="font-semibold text-[#3D2F24]">
            {production?.name}
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
// PRODUCTION DETAILS MODAL
// ==========================================
const ProductionDetailsModal = ({ isOpen, onClose, production }) => {
  if (!isOpen || !production) return null;

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
            Détails de la production
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
            <div className="w-14 h-14 rounded-xl bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B]">
              <Factory size={28} />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#3D2F24]">{production.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={production.status} />
                <PriorityBadge priority={production.priority} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Progression</p>
              <p className="text-lg font-bold text-[#3D2F24]">{production.progress}%</p>
              <ProgressBar progress={production.progress} />
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3">
              <p className="text-xs text-[#6D6D6D]">Quantité</p>
              <p className="text-lg font-bold text-[#3D2F24]">{production.quantity || '—'}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">Commande #{production.orderId}</span>
            </div>
            {production.product && (
              <div className="flex items-center gap-2">
                <Package size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Produit: {production.product}</span>
              </div>
            )}
            {production.assignedTo && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Assigné à: {production.assignedTo}</span>
              </div>
            )}
            {production.startDate && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Début: {new Date(production.startDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {production.endDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Fin: {new Date(production.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {production.notes && (
              <div className="mt-2 p-3 bg-[#F8F7F4] rounded-lg">
                <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
                <p className="text-sm text-[#3D2F24]">{production.notes}</p>
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
// MAIN PRODUCTION PAGE
// ==========================================
const ProductionPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t } = usePageI18n('production');

  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load productions
  const fetchProductions = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'createdAt',
        sort_order: 'desc'
      };
      const response = await getProductions(params);
      setProductions(response.data.data || []);
      setTotalCount(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching productions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Calculate KPIs from API statistics
  const [kpis, setKpis] = useState({
    total: 0,
    inProgress: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    avgProgress: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getProductionStatistics();
      const stats = response.data.data || {};
      setKpis({
        total: stats.total || 0,
        inProgress: stats.in_progress || 0,
        pending: stats.pending || 0,
        completed: stats.completed || 0,
        cancelled: stats.cancelled || 0,
        avgProgress: stats.avg_progress || 0
      });
    } catch (error) {
      console.error('Error fetching production statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter productions (client-side for demo, API already handles filters)
  const filteredProductions = useMemo(() => {
    return productions;
  }, [productions]);

  // Paginate
  const paginatedProductions = useMemo(() => {
    return filteredProductions;
  }, [filteredProductions]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage) || 1;
  }, [totalCount, itemsPerPage]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom', accessor: 'name', width: 25 },
    { label: 'N° Commande', accessor: 'orderId', width: 12 },
    { label: 'Produit', accessor: 'product', width: 18 },
    { label: 'Quantité', accessor: 'quantity', width: 10 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Priorité', accessor: 'priority', width: 10 },
    { label: 'Progression', accessor: 'progress', width: 10 },
    { label: 'Assigné à', accessor: 'assignedTo', width: 15 },
    { label: 'Date début', accessor: 'startDate', width: 12 },
    { label: 'Date fin', accessor: 'endDate', width: 12 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    orderId: item.orderId,
    product: item.product || '—',
    quantity: item.quantity || 0,
    status: item.status === 'pending' ? 'En attente' :
            item.status === 'in_progress' ? 'En production' :
            item.status === 'paused' ? 'Suspendue' :
            item.status === 'completed' ? 'Terminée' :
            item.status === 'cancelled' ? 'Annulée' : item.status,
    priority: item.priority === 'high' ? 'Haute' :
              item.priority === 'medium' ? 'Moyenne' : 'Basse',
    progress: `${item.progress}%`,
    assignedTo: item.assignedTo || '—',
    startDate: item.startDate ? new Date(item.startDate).toLocaleDateString('fr-FR') : '—',
    endDate: item.endDate ? new Date(item.endDate).toLocaleDateString('fr-FR') : '—'
  });

  const summary = useMemo(() => {
    return [
      { label: 'Total productions', value: kpis.total },
      { label: 'En production', value: kpis.inProgress },
      { label: 'En attente', value: kpis.pending },
      { label: 'Terminées', value: kpis.completed },
      { label: 'Annulées', value: kpis.cancelled },
      { label: 'Progression moyenne', value: `${kpis.avgProgress}%` }
    ];
  }, [kpis]);

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
  const handleCreateProduction = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createProduction(formData);
      const newProduction = response.data.data;
      setProductions(prev => [newProduction, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating production:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduction = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateProduction(selectedProduction.id, formData);
      const updatedProduction = response.data.data;
      setProductions(prev => prev.map(p =>
        p.id === selectedProduction.id ? updatedProduction : p
      ));
      setIsEditModalOpen(false);
      setSelectedProduction(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating production:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduction = async () => {
    setIsSaving(true);
    try {
      await deleteProduction(selectedProduction.id);
      setProductions(prev => prev.filter(p => p.id !== selectedProduction.id));
      setIsDeleteModalOpen(false);
      setSelectedProduction(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting production:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchProductions();
    fetchStatistics();
  };

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(productions.map(p => p.status));
    return Array.from(statuses);
  }, [productions]);

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
            data={filteredProductions}
            columns={columns}
            title="Liste des productions"
            subtitle={`${filteredProductions.length} productions - Progression moyenne: ${kpis.avgProgress}%`}
            filename={`production_${new Date().toISOString().split('T')[0]}`}
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
            Nouvelle production
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
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
                  {status === 'pending' ? 'En attente' :
                   status === 'in_progress' ? 'En production' :
                   status === 'paused' ? 'Suspendue' :
                   status === 'completed' ? 'Terminée' :
                   status === 'cancelled' ? 'Annulée' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Productions Table - Desktop */}
      <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Production</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Priorité</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Progression</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Assigné à</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Début</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Fin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#6D6D6D]">Chargement des productions...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProductions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Factory size={40} className="text-[#ECE8E1]" />
                      <p className="text-sm text-[#6D6D6D]">Aucune production trouvée</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-sm text-[#B8863B] font-medium hover:underline"
                      >
                        Démarrer une production
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProductions.map((production, index) => (
                  <ProductionTableRow
                    key={production.id}
                    production={production}
                    index={index}
                    onView={(p) => {
                      setSelectedProduction(p);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={(p) => {
                      setSelectedProduction(p);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={(p) => {
                      setSelectedProduction(p);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productions Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">Chargement des productions...</p>
          </div>
        ) : paginatedProductions.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Factory size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucune production trouvée</p>
          </div>
        ) : (
          paginatedProductions.map((production) => (
            <ProductionCard
              key={production.id}
              production={production}
              onView={(p) => {
                setSelectedProduction(p);
                setIsDetailsModalOpen(true);
              }}
              onEdit={(p) => {
                setSelectedProduction(p);
                setIsEditModalOpen(true);
              }}
              onDelete={(p) => {
                setSelectedProduction(p);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredProductions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} productions
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
          <ProductionModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateProduction}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedProduction && (
          <ProductionModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduction(null);
            }}
            onSave={handleEditProduction}
            production={selectedProduction}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedProduction && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduction(null);
            }}
            onConfirm={handleDeleteProduction}
            production={selectedProduction}
            isLoading={isSaving}
          />
        )}

        {isDetailsModalOpen && selectedProduction && (
          <ProductionDetailsModal
            key="details-modal"
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedProduction(null);
            }}
            production={selectedProduction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionPage;