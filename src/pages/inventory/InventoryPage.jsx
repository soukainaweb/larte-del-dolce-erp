// src/pages/Inventory/InventoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Layers,
  Grid,
  List,
  MoreHorizontal,
  Truck,
  ShoppingCart,
  Factory,
  FileText,
  Clock,
  Minus,
  Plus as PlusIcon,
  MinusCircle,
  ArrowUp,
  ArrowDown,
  Archive,
  Tag,
  Hash,
  Package2,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import { useToast } from '../../contexts/ToastContext';
import ExportButtons from '../../components/ExportButtons';
import {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createStockMovement,
  getStockMovements,
  getInventoryStatistics,
  exportInventory,
  getInventoryCategories,
  getInventoryTypes,
  getInventoryStatuses,
  updateInventoryStatus
} from '../../services/inventoryService';
import { ensureArray } from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('inventory');
  const statusConfig = {
    available: { label: t('inventory.status.available'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    low_stock: { label: t('inventory.status.low_stock'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
    out_of_stock: { label: t('inventory.status.out_of_stock'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
    expired: { label: t('inventory.status.expired'), class: 'bg-red-50 text-red-700 border-red-200' }
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PRODUCT TYPE BADGE
// ==========================================
const ProductTypeBadge = ({ type }) => {
  const { t, tc } = usePageI18n('inventory');
  const typeConfig = {
    finished: { label: t('inventory.types.finished'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
    raw: { label: t('inventory.types.raw'), class: 'bg-purple-50 text-purple-700 border-purple-200' },
    packaging: { label: t('inventory.types.packaging'), class: 'bg-teal-50 text-teal-700 border-teal-200' }
  };

  const config = typeConfig[type] || typeConfig.finished;

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
// INVENTORY CARD (Mobile)
// ==========================================
const InventoryCard = ({ item, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-[#6D6D6D]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{item.name}</p>
            <p className="text-xs text-[#6D6D6D]">{item.sku}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ProductTypeBadge type={item.type} />
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#F8F7F4] text-[#6D6D6D] border-[#ECE8E1]">
          {item.category}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Box size={12} />
          {item.currentStock} {item.unit}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {item.stockValue.toLocaleString()} ${CURRENCY}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(item.lastUpdated).toLocaleDateString(DATE_LOCALE)}
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle size={12} />
          Min: {item.minStock} {item.unit}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {item.expiryDate && (
            <span className="text-[10px] text-[#6D6D6D]">
              Exp: {new Date(item.expiryDate).toLocaleDateString(DATE_LOCALE)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(item)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(item)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INVENTORY TABLE ROW (Desktop)
// ==========================================
const InventoryTableRow = ({ item, onView, onEdit, onDelete, index }) => {
  const { t, tc, actions, statusLabel, commonStatus } = usePageI18n('inventory');
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center overflow-hidden flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-[#6D6D6D]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{item.name}</p>
            <p className="text-xs text-[#6D6D6D]">{item.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{item.category}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{item.currentStock}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{item.minStock}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{item.unit}</td>
      <td className="px-4 py-3">
        <ProductTypeBadge type={item.type} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(item.lastUpdated).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(item)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(item)}
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
// ADD STOCK MOVEMENT MODAL
// ==========================================
const StockMovementModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const { t, tc } = usePageI18n('inventory');
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in',
    quantity: 1,
    unit: 'piece',
    reason: 'purchase',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products for dropdown
    const fetchProducts = async () => {
      try {
        const response = await getInventory({ per_page: 100 });
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

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
    if (!formData.productId) newErrors.productId = 'Veuillez sélectionner un produit';
    if (formData.quantity < 1) newErrors.quantity = 'La quantité doit être supérieure à 0';

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
            {t('inventory.addMovement')} de stock
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Type de mouvement</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'in', label: 'Entrée', icon: ArrowUp },
                { value: 'out', label: 'Sortie', icon: ArrowDown },
                { value: 'adjustment', label: 'Ajustement', icon: MinusCircle }
              ].map((type) => {
                const Icon = type.icon;
                const isActive = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                      isActive
                        ? `border-[#B8863B] bg-amber-50 text-[#B8863B]`
                        : 'border-[#ECE8E1] text-[#6D6D6D] hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[10px] font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.product')}</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                errors.productId ? 'border-rose-500' : 'border-[#ECE8E1]'
              }`}
            >
              <option value="">Sélectionner un produit</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            {errors.productId && <p className="text-xs text-rose-500 mt-1">{errors.productId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Quantité</label>
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Unité</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="piece">Pièce</option>
                <option value="box">Boîte</option>
                <option value="kg">Kg</option>
                <option value="liter">Litre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Raison</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="purchase">Achat</option>
              <option value="production">Production</option>
              <option value="sale">Vente</option>
              <option value="damage">Perte / Dommage</option>
              <option value="return">Retour</option>
              <option value="inventory_correction">Correction inventaire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{tc('notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder={t('common.placeholders.additionalInfo')}
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
              {isLoading ? tc('saving') : tc('add')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW INVENTORY DETAILS MODAL
// ==========================================
const ViewInventoryModal = ({ isOpen, onClose, item }) => {
  const { t, tc, statusLabel, commonStatus } = usePageI18n('inventory');
  if (!isOpen || !item) return null;

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
            {t('inventory.modals.detailsTitle')}
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
            <div className="w-20 h-20 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-[#6D6D6D]" />
              )}
            </div>
            <div>
              <p className="text-xl font-semibold text-[#3D2F24]">{item.name}</p>
              <p className="text-sm text-[#6D6D6D]">{item.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={item.status} />
                <ProductTypeBadge type={item.type} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Stock actuel</p>
              <p className="text-xl font-bold text-[#3D2F24]">{item.currentStock} {item.unit}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Stock minimum</p>
              <p className="text-xl font-bold text-[#3D2F24]">{item.minStock} {item.unit}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Valeur du stock</p>
              <p className="text-xl font-bold text-[#3D2F24]">{item.stockValue.toLocaleString()} ${CURRENCY}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">Catégorie</p>
              <p className="text-sm font-medium text-[#3D2F24]">{item.category}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {item.expiryDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Date d'expiration: {new Date(item.expiryDate).toLocaleDateString(DATE_LOCALE)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">Dernière mise à jour: {new Date(item.lastUpdated).toLocaleString(DATE_LOCALE)}</span>
            </div>
            {item.batchNumber && (
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">Lot: {item.batchNumber}</span>
              </div>
            )}
          </div>

          <div className="bg-[#F8F7F4] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#3D2F24] mb-3">Historique des mouvements</h4>
            <div className="space-y-2">
              {item.movements?.map((movement, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b border-[#ECE8E1] pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {movement.type === 'in' ? (
                      <ArrowUp size={14} className="text-emerald-500" />
                    ) : movement.type === 'out' ? (
                      <ArrowDown size={14} className="text-rose-500" />
                    ) : (
                      <MinusCircle size={14} className="text-amber-500" />
                    )}
                    <span className="text-[#3D2F24]">
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[#6D6D6D]">
                    <span>{movement.reason}</span>
                    <span>{new Date(movement.date).toLocaleDateString(DATE_LOCALE)}</span>
                  </div>
                </div>
              ))}
            </div>
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
// DELETE MODAL
// ==========================================
const DeleteModal = ({ isOpen, onClose, onConfirm, item, isLoading }) => {
  const { t, tc } = usePageI18n('inventory');
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
          {t('inventory.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {t('inventory.modals.deleteMessage', { name: item?.name })}{' '}
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
// MAIN INVENTORY PAGE
// ==========================================
const InventoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('inventory');
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load inventory data
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sort_by: 'name',
        sort_order: 'asc'
      };
      const response = await getInventory(params);
      const res = response?.data;
      const list = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res) ? res : []);
      setInventory(list);
      setTotalCount(res?.meta?.total ?? list.length);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter, statusFilter, typeFilter]);

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getInventoryStatistics();
      const data = response.data.data || {};
      setKpis({
        totalProducts: data.total_products || 0,
        totalStock: data.total_stock || 0,
        lowStock: data.low_stock || 0,
        outOfStock: data.out_of_stock || 0,
        totalValue: data.total_value || 0
      });
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter inventory (API already handles filters)
  const filteredInventory = useMemo(() => {
    return Array.isArray(inventory) ? inventory : [];
  }, [inventory]);

  // Paginate
  const paginatedItems = useMemo(() => {
    return Array.isArray(filteredInventory) ? filteredInventory : [];
  }, [filteredInventory]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom', accessor: 'name', width: 20 },
    { label: 'SKU', accessor: 'sku', width: 12 },
    { label: 'Catégorie', accessor: 'category', width: 15 },
    { label: 'Stock', accessor: 'currentStock', width: 10 },
    { label: 'Min', accessor: 'minStock', width: 8 },
    { label: 'Unité', accessor: 'unit', width: 8 },
    { label: 'Type', accessor: 'type', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Valeur du stock', accessor: 'stockValue', width: 15 },
    { label: 'Mise à jour', accessor: 'lastUpdated', width: 12 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    sku: item.sku,
    category: item.category,
    currentStock: item.currentStock,
    minStock: item.minStock,
    unit: item.unit,
    type: item.type === 'finished' ? t('inventory.types.finished') : item.type === 'raw' ? t('inventory.types.raw') : t('inventory.types.packaging'),
    status: item.status === 'available' ? 'Disponible' : item.status === 'low_stock' ? 'Stock faible' : item.status === 'out_of_stock' ? 'Rupture' : 'Expiré',
    stockValue: `${item.stockValue.toLocaleString()} ${CURRENCY}`,
    lastUpdated: new Date(item.lastUpdated).toLocaleDateString(DATE_LOCALE)
  });

  const summary = [
    { label: t('inventory.kpi.totalItems'), value: kpis.totalProducts },
    { label: 'Stock total', value: kpis.totalStock },
    { label: 'Stock faible', value: kpis.lowStock },
    { label: 'Rupture', value: kpis.outOfStock },
    { label: 'Valeur du stock', value: `${kpis.totalValue.toLocaleString()} ${CURRENCY}` }
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

  const handleAddMovement = async (formData) => {
    setIsSaving(true);
    try {
      await createStockMovement(formData);
      setIsMovementModalOpen(false);
      await fetchInventory();
      await fetchStatistics();
    } catch (error) {
      console.error('Error adding movement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewItem = async (item) => {
    try {
      const response = await getInventoryItemById(item.id);
      setSelectedItem(response.data.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  const handleRefresh = () => {
    fetchInventory();
    fetchStatistics();
  };

  const handleEditItem = (item) => {
    handleViewItem(item);
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteInventoryItem(itemToDelete.id);
      await fetchInventory();
      await fetchStatistics();
      showToast(t('inventory.messages.deleted'), 'success');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast(t('inventory.messages.deleteError'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, typeFilter]);

  const categories = useMemo(() => {
    const cats = new Set(ensureArray(inventory).map(i => i.category));
    return Array.from(cats);
  }, [inventory]);

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
            data={filteredInventory}
            columns={columns}
            title={t('inventory.export.title')}
            subtitle={t('inventory.export.subtitle', { count: filteredInventory.length, value: `${kpis.totalValue.toLocaleString()} ${CURRENCY}` })}
            filename={`inventaire_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            {t('inventory.addMovement')}
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KPICard icon={Package} title={t('inventory.kpi.totalItems')} value={kpis.totalProducts} color="blue" />
        <KPICard icon={Box} title="Stock total" value={kpis.totalStock} color="indigo" />
        <KPICard icon={AlertTriangle} title="Stock faible" value={kpis.lowStock} color="amber" />
        <KPICard icon={AlertCircle} title="Rupture" value={kpis.outOfStock} color="rose" />
        <KPICard icon={DollarSign} title="Valeur du stock" value={`${kpis.totalValue.toLocaleString()} ${CURRENCY}`} color="gold" />
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="available">Disponible</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">{t('common.allTypes')}</option>
              <option value="finished">{t('inventory.types.finished')}</option>
              <option value="raw">{t('inventory.types.raw')}</option>
              <option value="packaging">{t('inventory.types.packaging')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.product')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Min</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Unité</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Mise à jour</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.inventory') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard/products')}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('inventory.addProduct')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ensureArray(paginatedItems).map((item, index) => (
                    <InventoryTableRow
                      key={item.id}
                      item={item}
                      index={index}
                      onView={handleViewItem}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.inventory') })}</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Package size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
            </div>
          ) : (
            ensureArray(paginatedItems).map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onView={handleViewItem}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </div>
      )}

      {/* Inventory Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.inventory') })}</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Package size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
          </div>
        ) : (
          paginatedItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredInventory.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} {t('orders.table.products')}
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
        {isMovementModalOpen && (
          <StockMovementModal
            key="movement-modal"
            isOpen={isMovementModalOpen}
            onClose={() => setIsMovementModalOpen(false)}
            onSave={handleAddMovement}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedItem && (
          <ViewInventoryModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedItem(null);
            }}
            item={selectedItem}
          />
        )}

        {isDeleteModalOpen && itemToDelete && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setItemToDelete(null);
            }}
            onConfirm={confirmDeleteItem}
            item={itemToDelete}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;