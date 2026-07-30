// src/pages/Categories/CategoriesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderTree,
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
  Package,
  AlertCircle,
  CheckCircle,
  Filter,
  Lock,
  Unlock,
  Folder,
  Grid,
  List,
  Tag,
  Palette,
  Archive,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  MoreHorizontal,
  Globe,
  Hash,
  FileText,
  ToggleLeft,
  ToggleRight,
  Star,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import { unwrapPaginated, unwrapData } from '../../utils/apiHelpers';
import ExportButtons from '../../components/ExportButtons';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStatistics,
  exportCategories,
  getCategoryTree,
  getParentCategories,
  getCategoryStatuses
} from '../../services/categoryService';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const { commonStatus } = usePageI18n('categories');

  const statusConfig = {
    ...commonStatus,
    archived: { label: commonStatus.archived?.label || status, class: 'bg-gray-50 text-gray-500 border-gray-200' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// VISIBILITY BADGE
// ==========================================
const VisibilityBadge = ({ visible }) => {
  const { tc } = usePageI18n('categories');

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
      visible ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}>
      {visible ? tc('visible') : tc('hidden')}
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
// CATEGORY CARD (Mobile)
// ==========================================
const CategoryCard = ({ category, onView, onEdit, onDelete, onToggleStatus }) => {
  const { actions, t, tc } = usePageI18n('categories');

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold overflow-hidden"
            style={{ backgroundColor: category.color || '#B8863B' }}
          >
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : category.icon ? (
              <span>{category.icon}</span>
            ) : (
              <Folder size={22} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{category.name}</p>
            <p className="text-xs text-[#6D6D6D]">{category.code}</p>
          </div>
        </div>
        <StatusBadge status={category.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <VisibilityBadge visible={category.visible} />
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#F8F7F4] text-[#6D6D6D] border-[#ECE8E1]">
          <Package size={10} className="inline mr-1" />
          {category.productCount || 0} {t('categories.table.products')}
        </span>
        {category.featured && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
            <Star size={10} className="inline mr-1" />
            {tc('featured')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(category.createdAt).toLocaleDateString(DATE_LOCALE)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#6D6D6D]">{t('categories.labels.order')}: {category.displayOrder || 0}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="flex items-center gap-1">
          {category.parent && (
            <span className="text-[10px] text-[#6D6D6D]">{t('categories.labels.parent')}: {category.parent}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(category)} title={actions.view} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(category)} title={actions.edit} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onToggleStatus(category)} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
            {category.status === 'active' ? <Lock size={16} className="text-amber-500" /> : <Unlock size={16} className="text-emerald-500" />}
          </button>
          <button onClick={() => onDelete(category)} title={actions.delete} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CATEGORY TABLE ROW (Desktop)
// ==========================================
const CategoryTableRow = ({ category, onView, onEdit, onDelete, onToggleStatus, index }) => {
  const { actions, tc } = usePageI18n('categories');
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0"
            style={{ backgroundColor: category.color || '#B8863B' }}
          >
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : category.icon ? (
              <span className="text-xl">{category.icon}</span>
            ) : (
              <Folder size={18} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{category.name}</p>
            <p className="text-xs text-[#6D6D6D]">{category.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{category.nameAr || '—'}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{category.productCount || 0}</td>
      <td className="px-4 py-3">
        <StatusBadge status={category.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{category.displayOrder || 0}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(category.updatedAt || category.createdAt).toLocaleDateString(DATE_LOCALE)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(category)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.edit}
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onToggleStatus(category)}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
            title={category.status === 'active' ? tc('deactivate') : tc('activate')}
          >
            {category.status === 'active' ? <Lock size={16} className="text-amber-500" /> : <Unlock size={16} className="text-emerald-500" />}
          </button>
          <button
            onClick={() => onDelete(category)}
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
// CATEGORY MODAL (Add/Edit)
// ==========================================
const CategoryModal = ({ isOpen, onClose, onSave, category, isLoading }) => {
  const { t, commonStatus, tc } = usePageI18n('categories');

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    code: '',
    description: '',
    icon: '',
    color: '#B8863B',
    status: 'active',
    visible: true,
    displayOrder: 0,
    parentCategory: '',
    showOnPOS: true,
    availableOnline: true,
    featured: false,
    image: null,
    imagePreview: null
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);

  useEffect(() => {
    // Fetch parent categories for dropdown
    const fetchParentCategories = async () => {
      try {
        const response = await getParentCategories({ status: 'active' });
        setParentCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching parent categories:', error);
      }
    };
    fetchParentCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        nameAr: category.nameAr || '',
        code: category.code || '',
        description: category.description || '',
        icon: category.icon || '',
        color: category.color || '#B8863B',
        status: category.status || 'active',
        visible: category.visible !== undefined ? category.visible : true,
        displayOrder: category.displayOrder || 0,
        parentCategory: category.parentId || '',
        showOnPOS: category.showOnPOS !== undefined ? category.showOnPOS : true,
        availableOnline: category.availableOnline !== undefined ? category.availableOnline : true,
        featured: category.featured || false,
        image: category.image || null,
        imagePreview: category.image || null
      });
    } else {
      setFormData({
        name: '',
        nameAr: '',
        code: `CAT-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        description: '',
        icon: '',
        color: '#B8863B',
        status: 'active',
        visible: true,
        displayOrder: 0,
        parentCategory: '',
        showOnPOS: true,
        availableOnline: true,
        featured: false,
        image: null,
        imagePreview: null
      });
    }
  }, [category]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = tc('required');
    if (!formData.code) newErrors.code = tc('required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for API
    const submitData = {
      ...formData,
      image: imageFile || formData.image,
      parentId: formData.parentCategory || null
    };
    // Remove imagePreview before sending
    delete submitData.imagePreview;

    onSave(submitData);
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
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {category ? t('categories.modals.editTitle') : t('categories.modals.addTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-xl border-2 border-dashed border-[#ECE8E1] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#B8863B] transition-colors relative group"
              onClick={() => document.getElementById('category-image').click()}
            >
              {formData.imagePreview ? (
                <img src={formData.imagePreview} alt={tc('preview')} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon size={24} className="text-[#6D6D6D] mx-auto" />
                  <span className="text-[10px] text-[#6D6D6D] block mt-1">{tc('image')}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
              </div>
              <input
                id="category-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#3D2F24]">{t('categories.form.categoryImage')}</p>
              <p className="text-xs text-[#6D6D6D]">{t('categories.form.uploadHint')}</p>
              <p className="text-[10px] text-[#6D6D6D] mt-1">{t('categories.form.formats')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.nameEn')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.name ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
                placeholder={t('common.placeholders.categoryName')}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.nameAr')}
              </label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                placeholder="اسم الفئة"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {tc('code')} *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.code ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
                placeholder="CAT-001"
              />
              {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.icon')}
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="ex: 🍰, 📦, 🥖"
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.color')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-[#ECE8E1] cursor-pointer"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.parentCategory')}
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="">{tc('none')}</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
              {tc('description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
              placeholder={t('common.placeholders.categoryDescription')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {tc('status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="active">{commonStatus.active.label}</option>
                <option value="inactive">{commonStatus.inactive.label}</option>
                <option value="archived">{commonStatus.archived.label}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">
                {t('categories.form.displayOrder')}
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="visible"
                checked={formData.visible}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">{tc('visible')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="showOnPOS"
                checked={formData.showOnPOS}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">{t('categories.form.showOnPOS')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="availableOnline"
                checked={formData.availableOnline}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">{t('categories.form.availableOnline')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#ECE8E1] text-[#B8863B] focus:ring-[#B8863B]/30 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#3D2F24]">
                <Star size={14} className="inline mr-1 text-amber-500" />
                {tc('featured')}
              </span>
            </label>
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
              {isLoading ? tc('saving') : category ? tc('update') : tc('add')}
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
const DeleteModal = ({ isOpen, onClose, onConfirm, category, isLoading }) => {
  const { t, tc } = usePageI18n('categories');

  if (!isOpen) return null;

  const hasProducts = category?.productCount > 0;

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
          {t('categories.modals.deleteTitle')}
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          {hasProducts ? (
            <>
              <span className="text-rose-500 font-semibold">⚠️ {t('categories.modals.warning')}</span><br />
              {t('categories.modals.deleteBlocked', { count: category.productCount })}
            </>
          ) : (
            <>
              {t('categories.modals.deleteMessage', { name: category?.name })}{' '}
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
            disabled={isLoading || hasProducts}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              hasProducts ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {hasProducts ? tc('impossible') : isLoading ? tc('deleting') : tc('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// VIEW CATEGORY MODAL
// ==========================================
const ViewCategoryModal = ({ isOpen, onClose, category }) => {
  const { t, tc } = usePageI18n('categories');

  if (!isOpen || !category) return null;

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
            {t('categories.modals.detailsTitle')}
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
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl overflow-hidden"
              style={{ backgroundColor: category.color || '#B8863B' }}
            >
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              ) : category.icon ? (
                <span className="text-white">{category.icon}</span>
              ) : (
                <Folder size={28} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#3D2F24]">{category.name}</p>
              <p className="text-sm text-[#6D6D6D]">{category.code}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={category.status} />
                <VisibilityBadge visible={category.visible} />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {category.nameAr && (
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{t('categories.labels.arabic')}: {category.nameAr}</span>
              </div>
            )}
            {category.description && (
              <div className="p-3 bg-[#F8F7F4] rounded-lg">
                <p className="text-xs text-[#6D6D6D] mb-1">{tc('description')}</p>
                <p className="text-[#3D2F24]">{category.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8F7F4] rounded-lg p-3">
                <p className="text-xs text-[#6D6D6D]">{t('categories.table.products')}</p>
                <p className="text-lg font-bold text-[#3D2F24]">{category.productCount || 0}</p>
              </div>
              <div className="bg-[#F8F7F4] rounded-lg p-3">
                <p className="text-xs text-[#6D6D6D]">{t('categories.form.displayOrder')}</p>
                <p className="text-lg font-bold text-[#3D2F24]">{category.displayOrder || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{tc('createdOn', { date: new Date(category.createdAt).toLocaleDateString(DATE_LOCALE) })}</span>
            </div>
            {category.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{tc('updatedOn', { date: new Date(category.updatedAt).toLocaleDateString(DATE_LOCALE) })}</span>
              </div>
            )}
            {category.parent && (
              <div className="flex items-center gap-2">
                <FolderTree size={16} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{t('categories.labels.parent')}: {category.parent}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {category.featured && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  <Star size={12} className="inline mr-1" />
                  {tc('featured')}
                </span>
              )}
              {category.showOnPOS && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  <ShoppingBag size={12} className="inline mr-1" />
                  POS
                </span>
              )}
              {category.availableOnline && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                  <Globe size={12} className="inline mr-1" />
                  {t('categories.form.online')}
                </span>
              )}
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
// MAIN CATEGORIES PAGE
// ==========================================
const CategoriesPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t, commonStatus, actions, tc } = usePageI18n('categories');

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: 'displayOrder',
        sort_order: 'asc'
      };
      const response = await getCategories(params);
      const { items, meta } = unwrapPaginated(response);
      setCategories(items);
      setTotalCount(meta.total ?? meta.total_count ?? items.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Calculate KPIs from API statistics
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0,
    mostUsed: null
  });

  const fetchStatistics = async () => {
    try {
      const response = await getCategoryStatistics();
      const stats = unwrapData(response) || {};
      setKpis({
        total: stats.total || 0,
        active: stats.active || 0,
        inactive: stats.inactive || 0,
        totalProducts: stats.totalProducts || 0,
        mostUsed: stats.mostUsed || null
      });
    } catch (error) {
      console.error('Error fetching category statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter categories (client-side for demo, but API already handles filters)
  const filteredCategories = useMemo(() => {
    // Since API already filters, we just return categories
    // But we keep the filter logic for compatibility
    let filtered = Array.isArray(categories) ? categories : [];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.nameAr && c.nameAr.includes(term))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    return filtered;
  }, [categories, searchTerm, statusFilter]);

  // Paginate (API already paginates, but we keep for consistency)
  const paginatedCategories = useMemo(() => {
    return Array.isArray(filteredCategories) ? filteredCategories : [];
  }, [filteredCategories]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage) || 1;
  }, [totalCount, itemsPerPage]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const formatStatus = (status) => {
    const key = String(status ?? 'inactive').toLowerCase();
    return commonStatus[key]?.label || status || '—';
  };

  const columns = [
    { label: t('categories.table.category'), accessor: 'name', width: 25 },
    { label: t('categories.table.nameAr'), accessor: 'nameAr', width: 15 },
    { label: tc('code'), accessor: 'code', width: 12 },
    { label: t('categories.table.products'), accessor: 'productCount', width: 10 },
    { label: t('categories.table.status'), accessor: 'status', width: 12 },
    { label: t('categories.table.order'), accessor: 'displayOrder', width: 8 },
    { label: t('categories.table.visible'), accessor: 'visible', width: 8 },
    { label: t('categories.table.updatedAt'), accessor: 'updatedAt', width: 10 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    nameAr: item.nameAr || '—',
    code: item.code,
    productCount: item.productCount || 0,
    status: formatStatus(item.status),
    displayOrder: item.displayOrder || 0,
    visible: item.visible ? tc('yes') : tc('no'),
    updatedAt: new Date(item.updatedAt || item.createdAt).toLocaleDateString(DATE_LOCALE)
  });

  const summary = [
    { label: t('categories.kpi.total'), value: kpis.total },
    { label: t('categories.kpi.active'), value: kpis.active },
    { label: commonStatus.inactive.label, value: kpis.inactive },
    { label: t('categories.kpi.products'), value: kpis.totalProducts }
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
  const handleCreateCategory = async (formData) => {
    setIsSaving(true);
    try {
      const response = await createCategory(formData);
      const newCategory = response.data.data;
      setCategories(prev => [newCategory, ...prev]);
      setIsCreateModalOpen(false);
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateCategory(selectedCategory.id, formData);
      const updatedCategory = response.data.data;
      setCategories(prev => prev.map(c =>
        c.id === selectedCategory.id ? updatedCategory : c
      ));
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedCategory.productCount > 0) {
      // Ne peut pas supprimer une catégorie avec des produits
      return;
    }
    setIsSaving(true);
    try {
      await deleteCategory(selectedCategory.id);
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await toggleCategoryStatus(category.id, { status: newStatus });
      const updatedCategory = response.data.data;
      setCategories(prev => prev.map(c =>
        c.id === category.id ? updatedCategory : c
      ));
      await fetchStatistics();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const handleRefresh = () => {
    fetchCategories();
    fetchStatistics();
  };

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
            data={filteredCategories}
            columns={columns}
            title={t('categories.export.title')}
            subtitle={t('categories.export.subtitle', { count: filteredCategories.length })}
            filename={`categories_${new Date().toISOString().split('T')[0]}`}
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
            {t('categories.addCategory')}
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
        <KPICard icon={FolderTree} title={t('categories.kpi.total')} value={kpis.total} color="blue" />
        <KPICard icon={CheckCircle} title={t('categories.kpi.active')} value={kpis.active} color="emerald" />
        <KPICard icon={Archive} title={commonStatus.inactive.label} value={kpis.inactive} color="rose" />
        <KPICard icon={Package} title={t('categories.kpi.products')} value={kpis.totalProducts} color="purple" />
        <KPICard icon={Tag} title={t('categories.kpiExtra.mostUsed')} value={kpis.mostUsed?.name || '—'} color="gold" />
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
              <option value="all">{tc('allStatuses')}</option>
              <option value="active">{commonStatus.active.label}</option>
              <option value="inactive">{commonStatus.inactive.label}</option>
              <option value="archived">{commonStatus.archived.label}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table - Desktop */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.category')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.nameAr')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.products')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.order')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('categories.table.updatedAt')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.table.loadingItems', { entity: t('nav.categories') })}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FolderTree size={40} className="text-[#ECE8E1]" />
                        <p className="text-sm text-[#6D6D6D]">{t('common.table.noItemsFound')}</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-sm text-[#B8863B] font-medium hover:underline"
                        >
                          {t('categories.addCategory')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category, index) => (
                    <CategoryTableRow
                      key={category.id}
                      category={category}
                      index={index}
                      onView={(c) => {
                        setSelectedCategory(c);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={(c) => {
                        setSelectedCategory(c);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(c) => {
                        setSelectedCategory(c);
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

      {/* Categories Grid - Desktop */}
      {viewMode === 'grid' && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6D6D6D]">{t('common.table.loadingItems', { entity: t('nav.categories') })}</p>
            </div>
          ) : paginatedCategories.length === 0 ? (
            <div className="col-span-full bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
              <FolderTree size={40} className="text-[#ECE8E1] mx-auto mb-3" />
              <p className="text-sm text-[#6D6D6D]">{t('common.table.noItemsFound')}</p>
            </div>
          ) : (
            paginatedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onView={(c) => {
                  setSelectedCategory(c);
                  setIsViewModalOpen(true);
                }}
                onEdit={(c) => {
                  setSelectedCategory(c);
                  setIsEditModalOpen(true);
                }}
                onDelete={(c) => {
                  setSelectedCategory(c);
                  setIsDeleteModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      )}

      {/* Categories Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">{t('common.table.loadingItems', { entity: t('nav.categories') })}</p>
          </div>
        ) : paginatedCategories.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FolderTree size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">{t('common.table.noItemsFound')}</p>
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onView={(c) => {
                setSelectedCategory(c);
                setIsViewModalOpen(true);
              }}
              onEdit={(c) => {
                setSelectedCategory(c);
                setIsEditModalOpen(true);
              }}
              onDelete={(c) => {
                setSelectedCategory(c);
                setIsDeleteModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            {tc('showingRange', {
              from: ((currentPage - 1) * itemsPerPage) + 1,
              to: Math.min(currentPage * itemsPerPage, totalCount),
              total: totalCount
            })}
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
              {tc('pageOf', { current: currentPage, total: totalPages })}
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
          <CategoryModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateCategory}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedCategory && (
          <CategoryModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
            onSave={handleEditCategory}
            category={selectedCategory}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedCategory && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedCategory(null);
            }}
            onConfirm={handleDeleteCategory}
            category={selectedCategory}
            isLoading={isSaving}
          />
        )}

        {isViewModalOpen && selectedCategory && (
          <ViewCategoryModal
            key="view-modal"
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;