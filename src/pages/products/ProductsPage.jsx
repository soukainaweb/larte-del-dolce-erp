// src/pages/Products/ProductsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Tag,
  DollarSign,
  Box,
  Grid,
  List,
  Filter,
  Image as ImageIcon,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import ExportButtons from '../../components/ExportButtons';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  updateProductStatus,
  getProductStatistics,
  exportProducts,
  getProductCategories,
  getProductStatuses,
  uploadProductImage
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { unwrapPaginated, ensureArray, getApiErrorMessage } from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// CURRENCY
// ==========================================
const CURRENCY = 'SAR';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const statusConfig = {
    active: { label: t('common.active'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: t('common.inactive'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
    out_of_stock: { label: t('common.statuses.outOfStock'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
    low_stock: { label: t('common.statuses.lowStock'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// PRODUCT CARD (Mobile)
// ==========================================
const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-[#6D6D6D]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{product.name}</p>
            <p className="text-xs text-[#6D6D6D]">{product.category}</p>
          </div>
        </div>
        <StatusBadge status={product.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          {product.price.toLocaleString()} {CURRENCY}
        </div>
        <div className="flex items-center gap-1">
          <Box size={12} />
          {product.stock} {t('common.units')}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(product.createdAt).toLocaleDateString(DATE_LOCALE)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(product)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(product)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(product)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PRODUCT TABLE ROW (Desktop)
// ==========================================
const ProductTableRow = ({ product, onEdit, onDelete, onView, index }) => {
  const { t } = useTranslation();
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
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-[#6D6D6D]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{product.name}</p>
            <p className="text-xs text-[#6D6D6D]">{product.category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{product.sku || '—'}</td>
      <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">
        {product.price.toLocaleString()} {CURRENCY}
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{product.stock}</td>
      <td className="px-4 py-3">
        <StatusBadge status={product.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(product.createdAt).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(product)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={t('common.view')}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={t('common.edit')}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title={t('common.delete')}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// PRODUCT MODAL
// ==========================================
const ProductModal = ({ isOpen, onClose, onSave, product, isLoading }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    stock: '',
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories({ per_page: 100, status: 'active' });
        const { items } = unwrapPaginated(response);
        setCategories(ensureArray(items));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category_id: product.category_id ?? product.category?.id ?? '',
        price: product.price || '',
        stock: product.stock ?? product.stock_quantity ?? '',
        status: product.status || 'active',
        description: product.description || '',
      });
      setImagePreview(product.image || null);
      setImageFile(null);
      setSelectedFileName('');
    } else {
      setFormData({
        name: '',
        sku: '',
        category_id: '',
        price: '',
        stock: '',
        status: 'active',
        description: '',
      });
      setImagePreview(null);
      setImageFile(null);
      setSelectedFileName('');
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setSelectedFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = t('products.validation.nameRequired');
    if (!formData.category_id) newErrors.category_id = t('products.validation.categoryRequired');
    if (!formData.price) newErrors.price = t('products.validation.priceRequired');
    else if (isNaN(formData.price)) newErrors.price = t('common.mustBeNumber');
    if (!formData.stock) newErrors.stock = t('products.validation.stockRequired');
    else if (isNaN(formData.stock)) newErrors.stock = t('common.mustBeNumber');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      category_id: Number(formData.category_id),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      image: imageFile || undefined,
    });
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
            {product ? t('products.modals.editTitle') : t('products.modals.addTitle')}
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
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.name')} *</label>
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
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.sku')}</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.category')} *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                disabled={categoriesLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.category_id ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              >
                <option value="">{categoriesLoading ? t('common.table.loadingItems', { entity: t('nav.categories') }) : t('common.selectCategory')}</option>
                {ensureArray(categories).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar || cat.nameAr || cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-rose-500 mt-1">{errors.category_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.price')} ({CURRENCY}) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.price ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.stock')} *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.stock ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.stock && <p className="text-xs text-rose-500 mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
              <option value="out_of_stock">{t('common.statuses.outOfStock')}</option>
              <option value="low_stock">{t('common.statuses.lowStock')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">{t('common.image')}</label>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#3D2F24] border border-[#ECE8E1] rounded-lg bg-[#F8F7F4] hover:bg-[#ECE8E1] transition-colors text-right"
              >
                {t('products.form.chooseImage', 'اختر صورة المنتج')}
              </button>
              {selectedFileName && (
                <p className="text-xs text-[#6D6D6D]">{selectedFileName}</p>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-[#ECE8E1]">
                <img src={imagePreview} alt={t('common.preview')} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? t('common.saving') : product ? t('common.update') : t('common.add')}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, product, isLoading }) => {
  const { t } = useTranslation();
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
          {t('products.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {t('products.modals.deleteMessage', { name: product?.name })}{' '}
          {t('common.irreversibleAction')}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// PRODUCT DETAILS MODAL
// ==========================================
const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  const { t } = useTranslation();
  if (!isOpen || !product) return null;

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
            {t('products.modals.detailsTitle')}
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
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-[#6D6D6D]" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#3D2F24]">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={product.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{t('common.price')}</p>
              <p className="text-lg font-bold text-[#3D2F24]">{product.price.toLocaleString()} {CURRENCY}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6D6D6D]">{t('common.stock')}</p>
              <p className="text-lg font-bold text-[#3D2F24]">{product.stock} {t('common.units')}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {product.sku && (
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{t('common.sku')}: {product.sku}</span>
              </div>
            )}
            {product.category && (
              <div className="flex items-center gap-2">
                <Grid size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{t('common.category')}: {product.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{t('common.createdOn', { date: new Date(product.createdAt).toLocaleDateString(DATE_LOCALE) })}</span>
            </div>
            {product.description && (
              <div className="mt-2 p-3 bg-[#F8F7F4] rounded-lg">
                <p className="text-xs text-[#6D6D6D] mb-1">{t('common.description')}</p>
                <p className="text-sm text-[#3D2F24]">{product.description}</p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN PRODUCTS PAGE
// ==========================================
const ProductsPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t } = usePageI18n('products');
  const { showToast } = useToast();

  // State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load products
  const fetchProducts = async () => {
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
      const response = await getProducts(params);
      const resData = response?.data;
      const data = Array.isArray(resData?.data)
        ? resData.data
        : (Array.isArray(resData) ? resData : []);
      setProducts(data);
      setTotalCount(resData?.meta?.total ?? data.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Fetch KPIs from statistics API
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStock: 0,
    totalValue: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await getProductStatistics();
      const data = response.data.data || {};
      setKpis({
        total: data.total || 0,
        active: data.active || 0,
        lowStock: data.low_stock || 0,
        outOfStock: data.out_of_stock || 0,
        totalStock: data.total_stock || 0,
        totalValue: data.total_value || 0
      });
    } catch (error) {
      console.error('Error fetching product statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter products (API already handles filters)
  const filteredProducts = useMemo(() => ensureArray(products), [products]);

  // Paginate
  const paginatedProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: t('products.table.name'), accessor: 'name', width: 20 },
    { label: t('products.table.sku'), accessor: 'sku', width: 12 },
    { label: t('products.table.category'), accessor: 'category', width: 15 },
    { label: t('products.table.price'), accessor: 'price', width: 12 },
    { label: t('products.table.stock'), accessor: 'stock', width: 10 },
    { label: t('products.table.status'), accessor: 'status', width: 12 },
    { label: t('products.table.addDate'), accessor: 'createdAt', width: 12 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    sku: item.sku || '—',
    category: item.category || '—',
    price: `${item.price.toLocaleString()} ${CURRENCY}`,
    stock: item.stock,
    status: item.status === 'active' ? t('common.active') :
            item.status === 'inactive' ? t('common.inactive') :
            item.status === 'out_of_stock' ? t('common.statuses.outOfStock') :
            item.status === 'low_stock' ? t('common.statuses.lowStock') : item.status,
    createdAt: new Date(item.createdAt).toLocaleDateString(DATE_LOCALE)
  });

  const summary = [
    { label: t('products.kpi.total'), value: kpis.total },
    { label: t('products.kpi.active'), value: kpis.active },
    { label: t('products.kpi.lowStock'), value: kpis.lowStock },
    { label: t('products.kpi.outOfStock'), value: kpis.outOfStock },
    { label: t('products.kpi.totalStock'), value: kpis.totalStock },
    { label: t('products.kpi.stockValue'), value: `${kpis.totalValue.toLocaleString()} ${CURRENCY}` }
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
  const handleCreateProduct = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createProduct(formData);
      const newProduct = response.data.data;
      setProducts(prev => [newProduct, ...ensureArray(prev)]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
      showToast(t('common.savedSuccessfully', 'تم الحفظ بنجاح'), 'success');
    } catch (error) {
      console.error('Error creating product:', error);
      showToast(getApiErrorMessage(error, t('products.errors.save')), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateProduct(selectedProduct.id, formData);
      const updatedProduct = response.data.data;
      setProducts(prev => ensureArray(prev).map(p =>
        p.id === selectedProduct.id ? updatedProduct : p
      ));
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      await fetchStatistics();
      showToast(t('common.savedSuccessfully', 'تم الحفظ بنجاح'), 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showToast(getApiErrorMessage(error, t('products.errors.save')), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    setIsSaving(true);
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(prev => ensureArray(prev).filter(p => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    fetchStatistics();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(ensureArray(products).map(p => p.status));
    return Array.from(statuses);
  }, [products]);

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
            data={filteredProducts}
            columns={columns}
            title={t('products.export.title')}
            subtitle={t('products.export.subtitle', { count: filteredProducts.length })}
            filename={`produits_${new Date().toISOString().split('T')[0]}`}
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
            {t('products.addProduct')}
          </button>
          <div className="flex items-center gap-1 border border-[#ECE8E1] rounded-xl bg-white p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title={t('common.tableView')}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#B8863B] text-white' : 'text-[#6D6D6D] hover:bg-[#F8F7F4]'}`}
              title={t('common.gridView')}
            >
              <Grid size={18} />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={t('common.refresh')}
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
              <option value="all">{t('common.allStatuses')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
              <option value="out_of_stock">{t('common.statuses.outOfStock')}</option>
              <option value="low_stock">{t('common.statuses.lowStock')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.product')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.sku', 'رمز المنتج (SKU)')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.price', 'السعر')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.stock', 'المخزون')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.dateAdded', 'تاريخ الإضافة')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.products') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('products.addProduct')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ensureArray(paginatedProducts).map((product, index) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      index={index}
                      onView={(p) => {
                        setSelectedProduct(p);
                        setIsDetailsModalOpen(true);
                      }}
                      onEdit={(p) => {
                        setSelectedProduct(p);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(p) => {
                        setSelectedProduct(p);
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

      {/* Products Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.products') })}</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <Package size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
            </div>
          ) : (
            ensureArray(paginatedProducts).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={(p) => {
                  setSelectedProduct(p);
                  setIsDetailsModalOpen(true);
                }}
                onEdit={(p) => {
                  setSelectedProduct(p);
                  setIsEditModalOpen(true);
                }}
                onDelete={(p) => {
                  setSelectedProduct(p);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.loadingModule', { module: t('nav.products') })}</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Package size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('products.empty')}</p>
          </div>
        ) : (
          ensureArray(paginatedProducts).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(p) => {
                setSelectedProduct(p);
                setIsDetailsModalOpen(true);
              }}
              onEdit={(p) => {
                setSelectedProduct(p);
                setIsEditModalOpen(true);
              }}
              onDelete={(p) => {
                setSelectedProduct(p);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} produits
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

      {/* Modals - RÉSOLU: chaque modal a une clé unique */}
      <AnimatePresence mode="wait">
        {isCreateModalOpen && (
          <ProductModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateProduct}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedProduct && (
          <ProductModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
            onSave={handleEditProduct}
            product={selectedProduct}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedProduct && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}
            onConfirm={handleDeleteProduct}
            product={selectedProduct}
            isLoading={isSaving}
          />
        )}

        {isDetailsModalOpen && selectedProduct && (
          <ProductDetailsModal
            key="details-modal"
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;