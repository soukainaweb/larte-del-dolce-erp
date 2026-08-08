// src/pages/Reports/ReportsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  FileText,
  Truck,
  Factory,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Printer,
  FileSpreadsheet,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  MoreHorizontal,
  Plus,
  Settings,
  Grid,
  List,
  Search,
  X,
  FileText as FileIcon,
  Share2,
  BarChart,
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Truck as TruckIcon,
  Factory as FactoryIcon,
  Layers,
  UsersRound,
  ShoppingCart,
  Receipt,
  Timer,
  Award,
  Building,
  Globe,
  Star,
  Zap,
  Activity,
  Bell,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  ChevronDown as ChevronDownIcon,
  Home,
  RefreshCcw,
  FileDown,
  FileSpreadsheet as ExcelIcon,
  Eye as ViewIcon,
  Trash2,
  Edit,
  MoreVertical,
  Check,
  AlertTriangle,
  Info,
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingBag as ShoppingBagIcon,
  Users as UsersIcon,
  CreditCard as CreditCardIcon,
  Package as PackageIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Award as AwardIcon,
  Zap as ZapIcon,
  Activity as ActivityIcon,
  Bell as BellIcon,
  Filter as FilterIcon2,
  PauseCircle,
  Play,
  MapPin,
  Phone,
  Mail,
  Building2,
  UserCheck,
  UserX,
  UserPlus,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { usePageI18n } from '../../hooks/usePageI18n';
import ExportButtons from '../../components/ExportButtons';
import { useExport } from '../../hooks/useExport';
import {
  getSalesOverview,
  getOrdersReport,
  getProductionReport,
  getProductsReport,
  getCustomersReport,
  getInvoicesReport,
  getDeliveriesReport,
  getSalesRepsReport,
  getYearlyComparison,
  getOrderStatusDistribution,
  getRecentActivities,
  getAlerts,
  generateReport,
  getGeneratedReports,
  downloadReport,
  deleteGeneratedReport,
  exportReportData
} from '../../services/reportService';
import { safeArray, ensureArray } from '../../utils/apiHelpers';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR';

// ==========================================
// FORMATAGE DES POURCENTAGES
// ==========================================
const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0.00%';
  return `${Number(value).toFixed(2)}%`;
};

// ==========================================
// COMPOSANT: CONFIRM DIALOG
// ==========================================
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText, cancelText }) => {
  const { tc } = usePageI18n('reports');
  const resolvedConfirm = confirmText ?? tc('confirm');
  const resolvedCancel = cancelText ?? tc('cancel');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-50 rounded-full">
            <AlertTriangle size={24} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-[#3D2F24]">{title}</h3>
        </div>
        <p className="text-sm text-[#6D6D6D] mb-6">{description}</p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#3D2F24] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            {resolvedCancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            {resolvedConfirm}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT: TOAST
// ==========================================
const Toast = ({ message, type = 'success', onClose }) => {
  const { t, tc } = usePageI18n('reports');
  const typeConfig = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-toast flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: PRODUCTION DETAIL MODAL
// ==========================================
const ProductionDetailModal = ({ isOpen, onClose, order }) => {
  const { t, tc } = usePageI18n('reports');
  if (!isOpen || !order) return null;

  const productionDetails = {
    progress: 45,
    quantity: 100,
    produced: 45,
    remaining: 55,
    assignedTo: order.salesRep || 'Ahmed Benjelloun',
    startDate: order.date || '08/05/2025',
    status: order.status || 'in_production',
    notes: 'Suspendue pour maintenance',
    productName: order.productName || 'Éclair Vanille',
    orderId: order.id || 'CMD-1256'
  };

  const statusColors = {
    'in_production': 'bg-blue-50 text-blue-700 border-blue-200',
    'Suspendue': 'bg-amber-50 text-amber-700 border-amber-200',
    'Terminée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'pending': 'bg-gray-50 text-gray-600 border-gray-200',
    'ready': 'bg-teal-50 text-teal-700 border-teal-200',
    'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'validated': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const statusIcons = {
    'in_production': <Loader2 size={16} className="text-blue-500 animate-spin" />,
    'Suspendue': <PauseCircle size={16} className="text-amber-500" />,
    'Terminée': <CheckCircle size={16} className="text-emerald-500" />,
    'pending': <Clock size={16} className="text-gray-500" />,
    'ready': <CheckCircle size={16} className="text-teal-500" />,
    'delivered': <CheckCircle size={16} className="text-emerald-500" />,
    'validated': <CheckCircle size={16} className="text-purple-500" />
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative p-6 pb-20 bg-gradient-to-r from-[#B8863B]/10 to-[#B8863B]/5 border-b border-[#ECE8E1]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B8863B]/10 rounded-xl">
                  <FactoryIcon size={24} className="text-[#B8863B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#3D2F24]">{t('reports.modals.productionDetails')}</h2>
                  <p className="text-sm text-[#6D6D6D]">{productionDetails.productName} - {t('reports.modals.orderLabel')} {productionDetails.orderId}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
              <X size={20} className="text-[#6D6D6D]" />
            </button>
          </div>

          <div className="absolute -bottom-4 left-6 right-6 flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white ${statusColors[productionDetails.status] || statusColors[t('common.pending')]}`}>
              {statusIcons[productionDetails.status] || statusIcons[t('common.pending')]}
              <span className="text-sm font-semibold">{productionDetails.status}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white border-[#ECE8E1]">
              <span className="text-sm font-semibold text-[#3D2F24]">{productionDetails.progress}%</span>
              <span className="text-xs text-[#6D6D6D]">{t('reports.modals.progress')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white border-[#ECE8E1]">
              <Package size={16} className="text-[#B8863B]" />
              <span className="text-sm font-semibold text-[#3D2F24]">{productionDetails.quantity}</span>
              <span className="text-xs text-[#6D6D6D]">{t('reports.modals.quantity')}</span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-8">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-[#3D2F24]">{t('reports.modals.progress')}</span>
              <span className="font-bold text-[#B8863B]">{productionDetails.progress}%</span>
            </div>
            <div className="h-3 bg-[#F8F7F4] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${productionDetails.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#B8863B] to-[#D4A84B] rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#6D6D6D] mt-1.5">
              <span>{productionDetails.produced} {t('orders.table.products')}</span>
              <span>Objectif: {productionDetails.quantity}</span>
              <span>Restant: {productionDetails.remaining}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Commande</p>
              <p className="font-semibold text-[#3D2F24]">{productionDetails.orderId}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{t('common.product')}</p>
              <p className="font-semibold text-[#3D2F24]">{productionDetails.productName}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Assigné à</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <User size={14} className="text-[#6D6D6D]" />
                {productionDetails.assignedTo}
              </p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Date de début</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <Calendar size={14} className="text-[#6D6D6D]" />
                {productionDetails.startDate}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#3D2F24] mb-2 flex items-center gap-2">
              <FileText size={16} className="text-[#6D6D6D]" />
              Notes
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">{productionDetails.notes}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('common.productionResumed'), type: 'success' } }));
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Reprendre la production
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#ECE8E1] text-[#6D6D6D] rounded-xl hover:bg-[#F8F7F4] transition-colors text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT: DELIVERY DETAIL MODAL
// ==========================================
const DeliveryDetailModal = ({ isOpen, onClose, delivery }) => {
  const { t, tc } = usePageI18n('reports');
  if (!isOpen || !delivery) return null;

  const statusColors = {
    'Effectuée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Retard': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusIcons = {
    'Effectuée': <CheckCircle size={18} className="text-emerald-500" />,
    'pending': <Clock size={18} className="text-amber-500" />,
    'Retard': <XCircle size={18} className="text-rose-500" />
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative p-6 bg-gradient-to-r from-[#B8863B]/10 to-[#B8863B]/5 border-b border-[#ECE8E1]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B8863B]/10 rounded-xl">
                  <TruckIcon size={24} className="text-[#B8863B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#3D2F24]">Consultation de la livraison</h2>
                  <p className="text-sm text-[#6D6D6D]">{delivery.id}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
              <X size={20} className="text-[#6D6D6D]" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusColors[delivery.status] || statusColors[t('common.pending')]} mb-6`}>
            {statusIcons[delivery.status] || statusIcons[t('common.pending')]}
            <span className="text-sm font-semibold">{delivery.status}</span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('customer')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <User size={14} className="text-[#6D6D6D]" />
                {delivery.client}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Adresse</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <MapPin size={14} className="text-[#6D6D6D]" />
                {delivery.address}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('date')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <Calendar size={14} className="text-[#6D6D6D]" />
                {delivery.date}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Téléphone</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <Phone size={14} className="text-[#6D6D6D]" />
                {delivery.phone || '+212 5XX-XXXX'}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('notes')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <FileText size={14} className="text-[#6D6D6D]" />
                {delivery.notes || tc('noNotes')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('common.deliveryExported', { id: delivery.id }), type: 'success' } }));
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {t('reports.export.deliveryTitle')}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#ECE8E1] text-[#6D6D6D] rounded-xl hover:bg-[#F8F7F4] transition-colors text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#ECE8E1] text-center">
          <p className="text-xs text-[#6D6D6D]">© 2026 L'arte ERP - All Rights Reserved</p>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT: INVOICE DETAIL MODAL
// ==========================================
const InvoiceDetailModal = ({ isOpen, onClose, invoice }) => {
  const { t, tc } = usePageI18n('reports');
  if (!isOpen || !invoice) return null;

  const statusColors = {
    'paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Impayée': 'bg-rose-50 text-rose-700 border-rose-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const statusIcons = {
    'paid': <CheckCircle size={18} className="text-emerald-500" />,
    'Impayée': <XCircle size={18} className="text-rose-500" />,
    'pending': <Clock size={18} className="text-amber-500" />
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative p-6 bg-gradient-to-r from-[#B8863B]/10 to-[#B8863B]/5 border-b border-[#ECE8E1]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B8863B]/10 rounded-xl">
                  <FileText size={24} className="text-[#B8863B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#3D2F24]">Consultation de la facture</h2>
                  <p className="text-sm text-[#6D6D6D]">{invoice.id}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
              <X size={20} className="text-[#6D6D6D]" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusColors[invoice.status] || statusColors[t('common.pending')]} mb-6`}>
            {statusIcons[invoice.status] || statusIcons[t('common.pending')]}
            <span className="text-sm font-semibold">{invoice.status}</span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('customer')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <User size={14} className="text-[#6D6D6D]" />
                {invoice.client}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('date')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <Calendar size={14} className="text-[#6D6D6D]" />
                {invoice.date}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">{tc('amount')}</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <DollarSign size={14} className="text-[#6D6D6D]" />
                {invoice.amount.toLocaleString()} {CURRENCY}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('common.invoiceExported', { id: invoice.id }), type: 'success' } }));
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {t('reports.export.invoiceTitle')}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#ECE8E1] text-[#6D6D6D] rounded-xl hover:bg-[#F8F7F4] transition-colors text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT: SKELETON LOADING
// ==========================================
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#F8F7F4] to-[#EDEAE4] rounded-lg ${className}`} />
);

// ==========================================
// COMPOSANT: KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, change, color, isCurrency, subtitle, miniData, miniColor }) => {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    gold: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };

  const displayChange = change !== undefined ? Math.abs(change) : 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl border ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={18} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {displayChange.toFixed(2)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className={`text-2xl font-bold text-[#3D2F24] ${isCurrency ? '' : ''}`}>
          {isCurrency ? `${value.toLocaleString()} ${CURRENCY}` : typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-[#6D6D6D]">{title}</p>
        {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-0.5">{subtitle}</p>}
      </div>
      {miniData && miniData.length > 0 && (
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={miniColor || '#B8863B'}
                fill={miniColor || '#B8863B'}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: ORDER CARD
// ==========================================
const OrderCard = ({ order, onView, onDelete, onExport }) => {
  const { t, tc, actions } = usePageI18n('reports');
  const statusColors = {
    'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in_production': 'bg-blue-50 text-blue-700 border-blue-200',
    'validated': 'bg-purple-50 text-purple-700 border-purple-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'ready': 'bg-teal-50 text-teal-700 border-teal-200',
    'cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#3D2F24]">{order.id}</p>
          <p className="text-xs text-[#6D6D6D]">{order.client}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors[t('common.pending')]}`}>
          {order.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">{t('orders.table.rep')}</p>
          <p className="font-medium text-[#3D2F24]">{order.salesRep}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">{tc('date')}</p>
          <p className="font-medium text-[#3D2F24]">{order.date}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">{tc('amount')}</p>
          <p className="font-medium text-[#3D2F24]">{order.amount.toLocaleString()} {CURRENCY}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">Production</p>
          <p className="font-medium text-[#3D2F24]">{order.production}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#ECE8E1] flex items-center gap-1 justify-end">
        <button
          onClick={() => onView && onView(order)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={actions.view}
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(order)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={tc('export')}
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(order)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title={actions.delete}
        >
          <Trash2 size={15} className="text-rose-500" />
        </button>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: INVOICE CARD
// ==========================================
const InvoiceCard = ({ invoice, onView, onDelete, onExport }) => {
  const { t, tc, actions } = usePageI18n('reports');
  const statusColors = {
    'paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Impayée': 'bg-rose-50 text-rose-700 border-rose-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#3D2F24]">{invoice.id}</p>
          <p className="text-xs text-[#6D6D6D]">{invoice.client}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[invoice.status] || statusColors[t('common.pending')]}`}>
          {invoice.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">{tc('date')}</p>
          <p className="font-medium text-[#3D2F24]">{invoice.date}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">{tc('amount')}</p>
          <p className="font-medium text-[#3D2F24]">{invoice.amount.toLocaleString()} {CURRENCY}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#ECE8E1] flex items-center gap-1 justify-end">
        <button
          onClick={() => onView && onView(invoice)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={actions.view}
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(invoice)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={tc('export')}
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(invoice)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title={actions.delete}
        >
          <Trash2 size={15} className="text-rose-500" />
        </button>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: DELIVERY CARD
// ==========================================
const DeliveryCard = ({ delivery, onView, onDelete, onExport }) => {
  const { t, tc, actions } = usePageI18n('reports');
  const statusColors = {
    'Effectuée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Retard': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#3D2F24]">{delivery.id}</p>
          <p className="text-xs text-[#6D6D6D]">{delivery.client}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[delivery.status] || statusColors[t('common.pending')]}`}>
          {delivery.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">Adresse</p>
          <p className="font-medium text-[#3D2F24] truncate">{delivery.address}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">{tc('date')}</p>
          <p className="font-medium text-[#3D2F24]">{delivery.date}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#ECE8E1] flex items-center gap-1 justify-end">
        <button
          onClick={() => onView && onView(delivery)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={actions.view}
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(delivery)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title={tc('export')}
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(delivery)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title={actions.delete}
        >
          <Trash2 size={15} className="text-rose-500" />
        </button>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: REPORT CARD
// ==========================================
const ReportCard = ({ report, onView, onDownload, onPrint, onShare, onDelete }) => {
  const { t, tc, actions } = usePageI18n('reports');
  const typeColors = {
    [t('reports.types.sales')]: 'bg-blue-50 text-blue-700 border-blue-200',
    [t('reports.types.orders')]: 'bg-purple-50 text-purple-700 border-purple-200',
    [t('reports.types.production')]: 'bg-amber-50 text-amber-700 border-amber-200',
    [t('reports.types.financial')]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [t('reports.types.customers')]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    [t('reports.types.products')]: 'bg-rose-50 text-rose-700 border-rose-200',
    Ventes: 'bg-blue-50 text-blue-700 border-blue-200',
    Commandes: 'bg-purple-50 text-purple-700 border-purple-200',
    Production: 'bg-amber-50 text-amber-700 border-amber-200',
    Financier: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Clients: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Produits: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusColors = {
    [t('reports.status.generated')]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [t('reports.status.inProgress')]: 'bg-amber-50 text-amber-700 border-amber-200',
    [t('reports.status.error')]: 'bg-red-50 text-red-700 border-red-200',
    'Généré': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En cours': 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-gray-50 text-gray-600 border-gray-200',
    Erreur: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
      className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileIcon size={16} className="text-[#B8863B]" />
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${typeColors[report.type] || typeColors.Ventes}`}>
              {report.type}
            </span>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[report.status] || statusColors[t('common.pending')]}`}>
              {report.status}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-[#3D2F24] mt-2 truncate">{report.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#6D6D6D] flex-wrap">
            <span>{t('reports.filters.period')}: {report.period}</span>
            <span>•</span>
            <span>{t('reports.table.generatedBy')}: {report.createdBy}</span>
            <span>•</span>
            <span>{report.date}</span>
            <span>•</span>
            <span>{report.size}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
          <button
            onClick={() => onView && onView(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={actions.view}
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDownload && onDownload(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={tc('download')}
          >
            <Download size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onPrint && onPrint(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={tc('print')}
          >
            <Printer size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onShare && onShare(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title={tc('share')}
          >
            <Share2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete && onDelete(report)}
            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
            title={actions.delete}
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: ACTIVITY ITEM
// ==========================================
const ActivityItem = ({ activity }) => {
  const typeColors = {
    export: 'bg-blue-50 text-blue-600',
    generate: 'bg-emerald-50 text-emerald-600',
    share: 'bg-purple-50 text-purple-600',
    print: 'bg-amber-50 text-amber-600'
  };

  const typeIcons = {
    export: <Download size={14} />,
    generate: <FileIcon size={14} />,
    share: <Share2 size={14} />,
    print: <Printer size={14} />
  };

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F7F4] transition-colors">
      <div className={`p-1.5 rounded-lg ${typeColors[activity.type] || typeColors.generate}`}>
        {typeIcons[activity.type] || typeIcons.generate}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#3D2F24]">
          <span className="font-semibold">{activity.user}</span> {activity.action}
        </p>
        <p className="text-[10px] text-[#6D6D6D]">{activity.time}</p>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: ALERT ITEM
// ==========================================
const AlertItem = ({ alert, onDismiss }) => {
  const typeConfig = {
    warning: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    danger: { icon: XCircle, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    info: { icon: Info, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    success: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' }
  };

  const config = typeConfig[alert.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-lg border ${config.color}`}
    >
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#3D2F24]">{alert.title}</p>
        <p className="text-[10px] text-[#6D6D6D] mt-0.5">{alert.description}</p>
        <p className="text-[9px] text-[#6D6D6D] mt-1">{alert.time}</p>
      </div>
      {onDismiss && (
        <button onClick={() => onDismiss(alert.id)} className="p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors flex-shrink-0">
          <X size={14} className="text-[#6D6D6D]" />
        </button>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT: TOP LIST CARD
// ==========================================
const TopListCard = ({ title, items, valueLabel, icon: Icon, valueKey, nameKey }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-[#B8863B]" />
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 10).map((item, index) => {
          const growth = item.growth || 0;
          const isPositive = growth > 0;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-[#B8863B] text-white' : 'bg-[#F8F7F4] text-[#6D6D6D]'}`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3D2F24] truncate">{item[nameKey || 'name']}</p>
                <p className="text-xs text-[#6D6D6D]">{valueLabel}: {item[valueKey || 'value']}</p>
              </div>
              {growth !== undefined && (
                <div className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? '+' : ''}{formatPercentage(growth)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: ADVANCED FILTERS
// ==========================================
const AdvancedFilters = ({ isOpen, onClose, filters, setFilters, onReset, onApply }) => {
  const { t, tc } = usePageI18n('reports');
  const [localFilters, setLocalFilters] = useState(filters);

  const filterGroups = [
    {
      title: t('reports.filters.period'),
      fields: [
        { key: 'period', type: 'select', options: [tc('today'), tc('thisWeek'), tc('thisMonth'), tc('thisYear'), tc('customPeriod')] }
      ]
    },
    {
      title: t('reports.filters.client'),
      fields: [
        { key: 'client', type: 'text', placeholder: tc('searchCustomer') }
      ]
    },
    {
      title: t('reports.filters.salesRep'),
      fields: [
        { key: 'salesRep', type: 'select', options: ['Tous', 'Ahmed Benjelloun', 'Sara El Idrissi', 'Mohamed Amine', 'Karim Lahlou', 'Nadia Fassi'] }
      ]
    },
    {
      title: t('reports.filters.status'),
      fields: [
        { key: 'status', type: 'select', options: [tc('all'), t('common.pending'), t('orders.status.validated'), t('orders.status.in_production'), t('orders.status.ready'), t('orders.status.delivered'), t('common.cancelled')] }
      ]
    }
  ];

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters = {};
    Object.keys(localFilters).forEach(key => {
      resetFilters[key] = '';
    });
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onReset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white border border-[#ECE8E1] rounded-xl p-4 md:p-6 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#3D2F24] flex items-center gap-2">
              <FilterIcon2 size={18} className="text-[#B8863B]" />
              {t('common.advancedFilters')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-[#6D6D6D] hover:text-[#3D2F24] transition-colors border border-[#ECE8E1] rounded-lg"
              >
                {tc('resetFilters')}
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-xs bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors"
              >
                {tc('apply')}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              >
                <X size={18} className="text-[#6D6D6D]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterGroups.map((group, idx) => (
              <div key={idx}>
                <label className="text-xs font-medium text-[#6D6D6D] block mb-1">{group.title}</label>
                {group.fields.map((field, fIdx) => (
                  <div key={fIdx}>
                    {field.type === 'select' ? (
                      <select
                        value={localFilters[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white"
                      >
                        {field.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={localFilters[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// CHARTES
// ==========================================

const SalesChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3D2F24]">{t('reports.charts.salesEvolution')}</h3>
          <p className="text-xs text-[#6D6D6D]">{t('reports.charts.salesEvolutionSub')}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B8863B]" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            Orders
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              formatter={(value, name) => {
                if (name === t('reports.charts.legend.revenue')) return [`${value.toLocaleString()} ${CURRENCY}`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#B8863B" fillOpacity={0.8} name={t('reports.charts.legend.revenue')} radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={t('reports.charts.legend.orders')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const OrderStatusChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.orderDistribution')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              label={({ name, value }) => `${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {data.map((entry, index) => (
          <span key={index} className="flex items-center gap-1.5 text-[10px] text-[#6D6D6D]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name} ({entry.value}%)
          </span>
        ))}
      </div>
    </div>
  );
};

const TopProductsChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  const top10 = data.slice(0, 10);
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.topProducts')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6D6D6D' }} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} ${tc('units')}`, '']}
            />
            <Bar dataKey="sales" fill="#B8863B" radius={[0, 4, 4, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MonthlyRevenueChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.monthlyRevenue')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value.toLocaleString()} ${CURRENCY}`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#B8863B"
              fill="url(#revenueGradient)"
              name={t('reports.charts.legend.revenue')}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8863B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#B8863B" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ProductionChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.dailyProduction')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="produced" fill="#22C55E" name={t('reports.charts.legend.products')} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name={t('reports.charts.legend.target')} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DeliveryChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.deliveries')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="delivered" stackId="a" fill="#22C55E" name={t('reports.charts.legend.delivered')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="delayed" stackId="a" fill="#EF4444" name={t('reports.charts.legend.delayed')} radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SalesRepChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.salesRepPerformance')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6D6D6D' }} width={60} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value.toLocaleString()} ${CURRENCY}`, '']}
            />
            <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const YearlyComparisonChart = ({ data }) => {
  const { t, tc } = usePageI18n('reports');
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Comparaison Annuelle</h3>
      <div className="flex items-center gap-4 text-xs mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          2024
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#B8863B]" />
          2025
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value.toLocaleString()} ${CURRENCY}`, '']}
            />
            <Bar dataKey="year2024" fill="#3B82F6" name="2024" radius={[4, 4, 0, 0]} />
            <Bar dataKey="year2025" fill="#B8863B" name="2025" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================
const ReportsPage = () => {
  const { user } = useAuth();
  const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('reports');
  const location = useLocation();
  const navigate = useNavigate();
  const { exportPDF, exportExcel } = useExport({ userName: user?.firstName || tc('user') });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  
  // États pour les données dynamiques
  const [ordersData, setOrdersData] = useState([]);
  const [invoicesList, setInvoicesList] = useState([]);
  const [deliveriesList, setDeliveriesList] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
  
  // États pour les graphiques et KPIs
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topSalesReps, setTopSalesReps] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState([]);
  const [yearlyComparison, setYearlyComparison] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // États pour les modals
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', description: '', onConfirm: null });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // ==========================================
  // CHARGEMENT DES DONNÉES
  // ==========================================
  const loadOverviewData = async () => {
    try {
      const params = { period: dateRange };
      if (dateRange === 'custom') {
        // Vous pouvez ajouter des dates spécifiques ici
      }
      
      const salesRes = await getSalesOverview(params);
      setSalesData(safeArray(salesRes?.data));
      
      const statusRes = await getOrderStatusDistribution(params);
      setOrderStatusData(safeArray(statusRes?.data));
      
      const productsRes = await getProductsReport(params);
      setTopProducts(safeArray(productsRes?.data));
      
      const customersRes = await getCustomersReport(params);
      setTopCustomers(safeArray(customersRes?.data));
      
      const categoriesRes = await getProductsReport({ ...params, group_by: 'category' });
      setTopCategories(safeArray(categoriesRes?.data));
      
      const repsRes = await getSalesRepsReport(params);
      setTopSalesReps(safeArray(repsRes?.data));
      
      const productionRes = await getProductionReport(params);
      setProductionData(safeArray(productionRes?.data));
      
      const deliveryRes = await getDeliveriesReport(params);
      setDeliveryStats(safeArray(deliveryRes?.data));
      
      const yearlyRes = await getYearlyComparison(params);
      setYearlyComparison(safeArray(yearlyRes?.data));
      
      const activitiesRes = await getRecentActivities({ limit: 10 });
      setRecentActivities(safeArray(activitiesRes?.data));
      
      const alertsRes = await getAlerts({ limit: 10 });
      setAlerts(safeArray(alertsRes?.data));
      
    } catch (error) {
      console.error('Error loading overview data:', error);
      setSalesData([]);
    }
  };

  const loadOrdersData = async () => {
    try {
      const params = {
        page: 1,
        per_page: 100,
        search: searchTerm || undefined
      };
      const res = await getOrdersReport(params);
      setOrdersData(safeArray(res?.data));
    } catch (error) {
      console.error('Error loading orders data:', error);
      setOrdersData([]);
    }
  };

  const loadInvoicesData = async () => {
    try {
      const params = {
        page: 1,
        per_page: 100,
        search: searchTerm || undefined
      };
      const res = await getInvoicesReport(params);
      setInvoicesList(safeArray(res?.data));
    } catch (error) {
      console.error('Error loading invoices data:', error);
      setInvoicesList([]);
    }
  };

  const loadDeliveriesData = async () => {
    try {
      const params = {
        page: 1,
        per_page: 100,
        search: searchTerm || undefined
      };
      const res = await getDeliveriesReport(params);
      setDeliveriesList(safeArray(res?.data));
    } catch (error) {
      console.error('Error loading deliveries data:', error);
      setDeliveriesList([]);
    }
  };

  const loadReportsData = async () => {
    try {
      const res = await getGeneratedReports();
      setGeneratedReports(safeArray(res?.data));
    } catch (error) {
      console.error('Error loading reports data:', error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadOverviewData(),
          loadOrdersData(),
          loadInvoicesData(),
          loadDeliveriesData(),
          loadReportsData()
        ]);
      } catch (error) {
        console.error('Error loading reports page data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, [dateRange, searchTerm]);

  useEffect(() => {
    if (!location.state?.openReportsTab && !location.state?.openAddModal) return;
    setActiveTab('reports');
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.openReportsTab, location.state?.openAddModal, navigate, location.pathname]);

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================
  const kpis = useMemo(() => {
    const salesList = ensureArray(salesData);
    const customersList = ensureArray(topCustomers);
    const ordersList = ensureArray(ordersData);

    const totalRevenue = salesList.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalOrders = salesList.reduce((sum, d) => sum + (d.orders || 0), 0);
    const totalProducts = salesList.reduce((sum, d) => sum + (d.products || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    let monthlyGrowth = 0;
    if (salesList.length >= 2) {
      const last = salesList[salesList.length - 1];
      const prev = salesList[salesList.length - 2];
      monthlyGrowth = prev.revenue > 0 ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    }
    
    const totalInvoices = ensureArray(invoicesList).length;
    const totalDeliveries = ensureArray(deliveriesList).length;
    const inProduction = ordersList.filter(o => o.status === t('orders.status.in_production')).length;
    const pendingOrders = ordersList.filter(o => o.status === t('common.pending')).length;
    const totalCustomers = customersList.reduce((sum, c) => sum + (c.orders || 0), 0);

    const revenueTrend = salesList.map(d => ({ value: d.revenue || 0 }));
    const orderTrend = salesList.map(d => ({ value: d.orders || 0 }));
    const productTrend = salesList.map(d => ({ value: d.products || 0 }));

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      monthlyGrowth,
      totalCustomers,
      totalInvoices,
      totalDeliveries,
      inProduction,
      pendingOrders,
      revenueTrend,
      orderTrend,
      productTrend
    };
  }, [salesData, invoicesList, deliveriesList, ordersData, topCustomers]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const exportColumns = [
    { label: 'ID', accessor: 'id', width: 10 },
    { label: tc('customer'), accessor: 'client', width: 20 },
    { label: tc('salesRep'), accessor: 'salesRep', width: 18 },
    { label: tc('date'), accessor: 'date', width: 12 },
    { label: tc('amount'), accessor: 'amount', width: 15 },
    { label: tc('status'), accessor: 'status', width: 12 },
    { label: t('nav.production'), accessor: 'production', width: 14 },
    { label: t('common.delivery'), accessor: 'delivery', width: 14 }
  ];

  const exportRowFormatter = (item) => ({
    id: item.id,
    client: item.client,
    salesRep: item.salesRep,
    date: item.date,
    amount: `${item.amount.toLocaleString()} ${CURRENCY}`,
    status: item.status,
    production: item.production,
    delivery: item.delivery
  });

  const exportSummary = [
    { label: t('orders.kpi.total'), value: ordersData.length },
    { label: tc('totalAmount'), value: `${ordersData.reduce((sum, o) => sum + o.amount, 0).toLocaleString()} ${CURRENCY}` },
    { label: t('reports.export.statusDelivered'), value: ordersData.filter(o => o.status === t('orders.status.delivered')).length },
    { label: t('reports.export.statusInProduction'), value: ordersData.filter(o => o.status === t('orders.status.in_production')).length },
    { label: t('reports.export.statusPending'), value: ordersData.filter(o => o.status === t('common.pending')).length }
  ];

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    showToast(tc('exportSuccess', { type: t('common.pdf'), count: 0 }), 'success');
  };

  const handleExportError = () => {
    showToast(t('common.exportError'), 'error');
  };

  const exportSingleRow = async (item, exportTitle, filename) => {
    try {
      await exportPDF({
        title: exportTitle,
        subtitle: item.id,
        columns: exportColumns,
        data: [item],
        filename: `${filename}.pdf`,
        rowFormatter: exportRowFormatter,
      });
      showToast(t('common.exportSuccess', { type: t('common.pdf'), count: 1 }), 'success');
    } catch {
      showToast(t('common.exportError'), 'error');
    }
  };

  // ==========================================
  // HANDLERS - TOAST
  // ==========================================
  const showToast = useCallback((message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ isOpen: false, message: '', type: 'success' });
  }, []);

  // ==========================================
  // HANDLERS - CONFIRM DIALOG
  // ==========================================
  const showConfirm = useCallback((title, description, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmDialog({ isOpen: false, title: '', description: '', onConfirm: null });
  }, []);

  // ==========================================
  // HANDLERS - ACTIONS GÉNÉRALES
  // ==========================================
  const handleExportPDF = async () => {
    try {
      await exportPDF({
        title: t('reports.title'),
        columns: exportColumns,
        data: ordersData,
        filename: `reports_${new Date().toISOString().split('T')[0]}.pdf`,
        rowFormatter: exportRowFormatter,
        summary: exportSummary,
      });
      showToast(t('reports.export.pdfSuccess'), 'success');
    } catch {
      showToast(t('common.exportError'), 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportExcel({
        title: t('reports.title'),
        columns: exportColumns,
        data: ordersData,
        filename: `reports_${new Date().toISOString().split('T')[0]}.xlsx`,
        rowFormatter: exportRowFormatter,
        summary: exportSummary,
      });
      showToast(t('reports.export.excelSuccess'), 'success');
    } catch {
      showToast(t('common.exportError'), 'error');
    }
  };

  const handlePrint = () => {
    window.print();
    showToast(t('reports.export.printStarted'), 'info');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadOrdersData(),
        loadInvoicesData(),
        loadDeliveriesData(),
        loadReportsData()
      ]);
      showToast(t('reports.messages.refreshed'), 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast(t('reports.messages.refreshError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPageLink = async (label) => {
    try {
      const url = window.location.href;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(label || t('common.linkCopied'), 'success');
    } catch {
      showToast(t('common.copyFailed'), 'error');
    }
  };

  const handleShare = () => {
    copyPageLink(t('common.linkCopied'));
  };

  // ==========================================
  // HANDLERS - SUPPRESSION RÉELLE
  // ==========================================
  
  const handleDeleteOrder = (order) => {
    showConfirm(
      t('reports.confirm.deleteOrder'),
      t('reports.confirm.deleteOrderMessage', { id: order.id }),
      () => {
        setOrdersData(prev => prev.filter(item => item.id !== order.id));
        showToast(t('reports.messages.orderDeleted', { id: order.id }), 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteInvoice = (invoice) => {
    showConfirm(
      t('reports.confirm.deleteInvoice'),
      t('reports.confirm.deleteInvoiceMessage', { id: invoice.id }),
      () => {
        setInvoicesList(prev => prev.filter(item => item.id !== invoice.id));
        showToast(t('reports.messages.invoiceDeleted', { id: invoice.id }), 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteDelivery = (delivery) => {
    showConfirm(
      t('reports.confirm.deleteDelivery'),
      t('reports.confirm.deleteDeliveryMessage', { id: delivery.id }),
      () => {
        setDeliveriesList(prev => prev.filter(item => item.id !== delivery.id));
        showToast(t('reports.messages.deliveryDeleted', { id: delivery.id }), 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteReport = async (report) => {
    showConfirm(
      t('reports.confirm.deleteReport'),
      t('reports.confirm.deleteReportMessage', { name: report.name }),
      async () => {
        try {
          await deleteGeneratedReport(report.id);
          const res = await getGeneratedReports();
          setGeneratedReports(safeArray(res?.data));
          showToast(t('reports.messages.reportDeleted', { name: report.name }), 'success');
        } catch (error) {
          console.error('Error deleting report:', error);
          showToast(t('reports.messages.deleteError'), 'error');
        }
        hideConfirm();
      }
    );
  };

  // ==========================================
  // HANDLERS - ACTIONS "VOIR" AVEC MODALS
  // ==========================================
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsProductionModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setIsDeliveryModalOpen(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  // ==========================================
  // HANDLERS - ACTIONS "TÉLÉCHARGER"
  // ==========================================
  
  const handleExportOrder = (order) => {
    exportSingleRow(order, t('reports.export.orderTitle'), `order_${order.id}`);
  };

  const handleExportInvoice = (invoice) => {
    exportSingleRow(invoice, t('reports.export.invoiceTitle'), `invoice_${invoice.id}`);
  };

  const handleExportDelivery = (delivery) => {
    exportSingleRow(delivery, t('reports.export.deliveryTitle'), `delivery_${delivery.id}`);
  };

  const handleDownloadReport = async (report) => {
    try {
      const response = await downloadReport(report.id, 'pdf');
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(t('reports.export.reportDownloaded', { name: report.name }), 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      showToast(t('reports.export.downloadError'), 'error');
    }
  };

  // ==========================================
  // HANDLERS - AUTRES ACTIONS
  // ==========================================
  
  const handlePrintReport = (report) => {
    showToast(t('common.reportPrinting', { name: report.name }), 'info');
  };

  const handleShareReport = (report) => {
    copyPageLink(t('common.linkCopied'));
  };

  const handleDismissAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    showToast(t('common.alertDismissed'), 'info');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange('month');
    setFilters({});
    showToast(t('reports.messages.filtersReset'), 'success');
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    showToast(t('reports.messages.dateRangeChanged', { range: e.target.options[e.target.selectedIndex].text }), 'info');
  };

  // ==========================================
  // TABS
  // ==========================================
  const tabs = [
    { id: 'overview', label: t('reports.tabs.overview'), icon: LayoutDashboard },
    { id: 'orders', label: t('reports.tabs.orders'), icon: ClipboardList },
    { id: 'sales', label: t('reports.tabs.sales'), icon: TrendingUp },
    { id: 'production', label: t('reports.tabs.production'), icon: FactoryIcon },
    { id: 'products', label: t('reports.tabs.products'), icon: Package },
    { id: 'customers', label: t('reports.tabs.customers'), icon: Users },
    { id: 'invoices', label: t('reports.tabs.invoices'), icon: FileText },
    { id: 'deliveries', label: t('reports.tabs.deliveries'), icon: TruckIcon },
    { id: 'analytics', label: t('reports.tabs.analytics'), icon: BarChart3 },
    { id: 'reports', label: t('reports.tabs.reports'), icon: FileIcon }
  ];

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <KPICard 
          icon={DollarSign} 
          title={t('reports.kpi.revenue')} 
          value={kpis.totalRevenue} 
          change={kpis.monthlyGrowth} 
          color="gold" 
          isCurrency 
          miniData={kpis.revenueTrend}
          miniColor="#B8863B"
        />
        <KPICard 
          icon={ShoppingBag} 
          title={t('reports.kpi.totalOrders')} 
          value={kpis.totalOrders} 
          change={8.10} 
          color="blue"
          miniData={kpis.orderTrend}
          miniColor="#3B82F6"
        />
        <KPICard 
          icon={Package} 
          title={t('reports.kpi.products')} 
          value={kpis.totalProducts} 
          change={5.30} 
          color="purple"
          miniData={kpis.productTrend}
          miniColor="#8B5CF6"
        />
        <KPICard 
          icon={Users} 
          title={t('reports.kpi.customers')} 
          value={kpis.totalCustomers} 
          change={9.20} 
          color="green"
        />
        <KPICard 
          icon={TrendingUp} 
          title={t('reports.kpi.growth')} 
          value={formatPercentage(kpis.monthlyGrowth)} 
          change={kpis.monthlyGrowth} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={FileText} title={t('reports.kpi.invoices')} value={kpis.totalInvoices} change={4.70} color="teal" />
        <KPICard icon={TruckIcon} title={t('reports.kpi.deliveries')} value={kpis.totalDeliveries} change={6.80} color="cyan" />
        <KPICard icon={FactoryIcon} title={t('reports.kpi.inProduction')} value={kpis.inProduction} change={-2.40} color="amber" />
        <KPICard icon={Clock} title={t('common.pending')} value={kpis.pendingOrders} change={-5.90} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={salesData} />
        <OrderStatusChart data={orderStatusData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart data={salesData} />
        <TopProductsChart data={topProducts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <TopListCard 
          title={t('reports.top.clients')} 
          items={ensureArray(topCustomers).map(c => ({ ...c, value: c.revenue }))} 
          valueLabel={t('reports.charts.legend.revenue')} 
          icon={Users} 
          valueKey="revenue"
        />
        <TopListCard 
          title={t('reports.top.products')} 
          items={ensureArray(topProducts).map(c => ({ ...c, value: c.sales }))} 
          valueLabel={t('common.sales')} 
          icon={Package} 
          valueKey="sales"
        />
        <TopListCard 
          title={t('reports.top.categories')} 
          items={ensureArray(topCategories).map(c => ({ ...c, value: c.sales }))} 
          valueLabel={t('common.sales')} 
          icon={Layers} 
          valueKey="sales"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.sections.recentActivity')}</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ensureArray(recentActivities).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.sections.alerts')}</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ensureArray(alerts).map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderOrders = () => {
    const orders = ensureArray(ordersData);
    const paidCount = orders.filter(o => o.status === t('orders.status.delivered')).length;
    const pending = orders.filter(o => o.status === t('common.pending')).length;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={ShoppingBag} title={t('reports.kpi.totalOrders')} value={orders.length} change={8.10} color="blue" />
          <KPICard icon={Clock} title={t('common.pending')} value={pending} change={-5.90} color="amber" />
          <KPICard icon={CheckCircle} title={t('reports.kpi.completed')} value={paidCount} change={5.20} color="green" />
          <KPICard icon={DollarSign} title={t('reports.kpi.avgBasket')} value={kpis.avgOrderValue} change={3.80} color="gold" isCurrency />
        </div>
        {orders.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Package size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">{t('orders.empty')}</h3>
            <p className="text-sm text-[#6D6D6D]">{t('reports.allOrdersDeleted')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleViewOrder}
                onExport={handleExportOrder}
                onDelete={handleDeleteOrder}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSales = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={DollarSign} title={t('reports.kpi.revenue')} value={kpis.totalRevenue} change={kpis.monthlyGrowth} color="gold" isCurrency />
        <KPICard icon={TrendingUp} title={t('reports.kpi.growth')} value={formatPercentage(kpis.monthlyGrowth)} change={kpis.monthlyGrowth} color="indigo" />
        <KPICard icon={ShoppingBag} title="Commandes" value={kpis.totalOrders} change={8.10} color="blue" />
        <KPICard icon={Users} title={t('reports.kpi.customers')} value={kpis.totalCustomers} change={9.20} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={salesData} />
        <MonthlyRevenueChart data={salesData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProducts} />
        <SalesRepChart data={topSalesReps} />
      </div>
    </div>
  );

  const renderProduction = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={FactoryIcon} title={t('reports.kpi.inProduction')} value={kpis.inProduction} change={-2.40} color="amber" />
        <KPICard icon={CheckCircle} title={t('reports.kpi.completed')} value={orderStatusData.find(d => d.name === t('reports.kpi.completed') || d.name === 'Terminées')?.value || 0} change={5.20} color="green" />
        <KPICard icon={Timer} title={t('reports.kpi.avgTime')} value="4.5h" change={-3.10} color="blue" />
        <KPICard icon={Award} title={t('reports.kpi.yield')} value="94%" change={2.80} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductionChart data={productionData} />
        <OrderStatusChart data={orderStatusData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TopListCard title={t('reports.top.products')} items={topProducts.map(c => ({ ...c, value: c.sales }))} valueLabel="Produits" icon={Package} valueKey="sales" />
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.dailyProduction')}</h3>
          <div className="space-y-2">
            {ensureArray(productionData).map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#6D6D6D] w-8">{day.day}</span>
                <div className="flex-1 h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B8863B] rounded-full" style={{ width: `${(day.produced / day.target) * 100}%` }} />
                </div>
                <span className="text-xs text-[#6D6D6D]">{day.produced}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Alertes Production</h3>
          <div className="space-y-2">
            {ensureArray(alerts).filter(a => a.type === 'danger' || a.type === 'warning').slice(0, 3).map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    const products = ensureArray(topProducts);
    const categories = ensureArray(topCategories);

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Package} title="Total Produits" value={products.length} change={5.30} color="purple" />
          <KPICard icon={TrendingUp} title="Top Ventes" value={products[0]?.sales || 0} change={15.20} color="gold" />
          <KPICard icon={AlertCircle} title={t('reports.kpi.stockOut')} value="5" change={-10.40} color="rose" />
          <KPICard icon={CheckCircle} title={t('reports.kpi.available')} value="52" change={8.90} color="green" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopProductsChart data={products} />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition par Catégorie</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categories}
                    dataKey="sales"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={index} fill={['#B8863B', '#3B82F6', '#22C55E', '#8B5CF6', '#F59E0B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ECE8E1',
                      borderRadius: '8px'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#3D2F24]">{product.name}</p>
                  <p className="text-xs text-[#6D6D6D]">{product.category}</p>
                </div>
                <span className={`text-xs font-bold ${product.growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {product.growth > 0 ? '+' : ''}{formatPercentage(product.growth)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[#6D6D6D]">Ventes</p>
                  <p className="font-medium text-[#3D2F24]">{product.sales} unités</p>
                </div>
                <div>
                  <p className="text-[#6D6D6D]">Revenu</p>
                  <p className="font-medium text-[#3D2F24]">{product.revenue.toLocaleString()} {CURRENCY}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    const customers = ensureArray(topCustomers);

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Users} title="Total Clients" value={kpis.totalCustomers} change={9.20} color="green" />
          <KPICard icon={User} title={t('reports.kpi.newCustomers')} value="24" change={15.80} color="blue" />
          <KPICard icon={Award} title={t('reports.kpi.loyalty')} value="76%" change={5.60} color="purple" />
          <KPICard icon={Star} title="Top Client" value={customers[0]?.name || '-'} change={0} color="gold" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopListCard title={t('reports.top.clients')} items={customers.map(c => ({ ...c, value: c.revenue }))} valueLabel={t('reports.charts.legend.revenue')} icon={Users} valueKey="revenue" />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition par Ville</h3>
            <div className="space-y-3">
              {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'].map((city, idx) => {
                const count = customers.filter(c => c.city === city).length;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-[#6D6D6D] w-24">{city}</span>
                    <div className="flex-1 h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8863B] rounded-full" style={{ width: `${customers.length ? (count / customers.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-[#6D6D6D]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#3D2F24]">{customer.name}</p>
                  <p className="text-xs text-[#6D6D6D]">{customer.city}</p>
                </div>
                <span className={`text-xs font-bold ${customer.growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {customer.growth > 0 ? '+' : ''}{formatPercentage(customer.growth)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[#6D6D6D]">Commandes</p>
                  <p className="font-medium text-[#3D2F24]">{customer.orders}</p>
                </div>
                <div>
                  <p className="text-[#6D6D6D]">Revenu</p>
                  <p className="font-medium text-[#3D2F24]">{customer.revenue.toLocaleString()} {CURRENCY}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderInvoices = () => {
    const invoices = ensureArray(invoicesList);
    const paidCount = invoices.filter(i => i.status === t('common.paymentStatus.paid')).length;
    const unpaidCount = invoices.filter(i => i.status === 'Impayée').length;
    const pendingCount = invoices.filter(i => i.status === t('common.pending')).length;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={CreditCard} title="Total Factures" value={invoices.length} change={4.70} color="teal" />
          <KPICard icon={CheckCircle} title="Payées" value={paidCount} change={6.20} color="green" />
          <KPICard icon={XCircle} title="Impayées" value={unpaidCount} change={-3.80} color="rose" />
          <KPICard icon={Clock} title={t('common.pending')} value={pendingCount} change={2.40} color="amber" />
        </div>
        {invoices.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileText size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">{t('invoices.emptyShort')}</h3>
            <p className="text-sm text-[#6D6D6D]">Toutes les factures ont été supprimées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={handleViewInvoice}
                onExport={handleExportInvoice}
                onDelete={handleDeleteInvoice}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDeliveries = () => {
    const deliveries = ensureArray(deliveriesList);
    const deliveredCount = deliveries.filter(d => d.status === 'Effectuée').length;
    const pendingCount = deliveries.filter(d => d.status === t('common.pending')).length;
    const delayedCount = deliveries.filter(d => d.status === 'Retard').length;
    const deliveryTotal = deliveredCount + pendingCount + delayedCount || 1;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Truck} title="Total Livraisons" value={deliveries.length} change={6.80} color="cyan" />
          <KPICard icon={CheckCircle} title="Effectuées" value={deliveredCount} change={8.30} color="green" />
          <KPICard icon={Clock} title={t('common.pending')} value={pendingCount} change={-2.60} color="amber" />
          <KPICard icon={AlertCircle} title="Retard" value={delayedCount} change={-5.70} color="rose" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DeliveryChart data={deliveryStats} />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('reports.charts.deliveryStatus')}</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>Effectuées</span>
                  <span>{deliveredCount} ({Math.round((deliveredCount / deliveryTotal) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(deliveredCount / deliveryTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>{t('common.pending')}</span>
                  <span>{pendingCount} ({Math.round((pendingCount / deliveryTotal) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(pendingCount / deliveryTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>Retard</span>
                  <span>{delayedCount} ({Math.round((delayedCount / deliveryTotal) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(delayedCount / deliveryTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {deliveries.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Truck size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">{t('deliveries.emptyShort')}</h3>
            <p className="text-sm text-[#6D6D6D]">{t('reports.allDeliveriesDeleted')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onView={handleViewDelivery}
                onExport={handleExportDelivery}
                onDelete={handleDeleteDelivery}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <YearlyComparisonChart data={yearlyComparison} />
        <SalesChart data={salesData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart data={salesData} />
        <OrderStatusChart data={orderStatusData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart data={productionData} />
        <SalesRepChart data={topSalesReps} />
      </div>
    </div>
  );

  const renderGeneratedReports = () => {
    const reports = ensureArray(generatedReports);

    return (
      <div>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <Package size={16} className="text-[#6D6D6D]" />
            <span className="text-sm text-[#3D2F24]">{t('reports.reportsCount', { count: reports.length })}</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm text-[#3D2F24]">{t('reports.generatedCount', { count: reports.filter(r => r.status === t('reports.status.generated') || r.status === 'Généré').length })}</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm text-[#3D2F24]">{reports.filter(r => r.status === t('reports.status.inProgress') || r.status === 'En cours' || r.status === t('common.pending')).length} {t('reports.status.inProgress')}</span>
          </div>
        </div>
        {reports.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileIcon size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">{t('reports.empty')}</h3>
            <p className="text-sm text-[#6D6D6D]">{t('reports.allReportsDeleted')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleViewReport}
                onDownload={handleDownloadReport}
                onPrint={handlePrintReport}
                onShare={handleShareReport}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================

  if (isLoading && salesData.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <SkeletonLoader className="h-12 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonLoader key={idx} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader className="h-80 w-full" />
            <SkeletonLoader className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isOpen && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={tc('delete')}
      />

      {/* Production Detail Modal */}
      <ProductionDetailModal
        isOpen={isProductionModalOpen}
        onClose={() => {
          setIsProductionModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        isOpen={isDeliveryModalOpen}
        onClose={() => {
          setIsDeliveryModalOpen(false);
          setSelectedDelivery(null);
        }}
        delivery={selectedDelivery}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />

      {/* Report Detail Modal */}
      {isReportModalOpen && selectedReport && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
          >
            <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
                {t('common.details')}
              </h3>
              <button type="button" onClick={() => { setIsReportModalOpen(false); setSelectedReport(null); }} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg">
                <X size={20} className="text-[#6D6D6D]" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <p className="font-semibold text-[#3D2F24]">{selectedReport.name}</p>
              {selectedReport.type && <p className="text-[#6D6D6D]">{selectedReport.type}</p>}
              {selectedReport.date && <p className="text-[#6D6D6D]">{selectedReport.date}</p>}
              {selectedReport.description && <p className="text-[#3D2F24]">{selectedReport.description}</p>}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => handleDownloadReport(selectedReport)} className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg">
                {t('common.download')}
              </button>
              <button type="button" onClick={() => { setIsReportModalOpen(false); setSelectedReport(null); }} className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg">
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#6D6D6D] mb-1">
              <Home size={14} className="text-[#B8863B]" />
              <span className="text-[#B8863B]">/</span>
              <span>{tc('breadcrumbReports')}</span>
            </nav>
            <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {title}
            </h1>
            <p className="text-sm text-[#6D6D6D]">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="pl-9 pr-8 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white appearance-none"
              >
                <option value="today">{tc('today')}</option>
                <option value="week">{tc('thisWeek')}</option>
                <option value="month">{tc('thisMonth')}</option>
                <option value="year">{tc('thisYear')}</option>
                <option value="custom">{tc('custom')}</option>
              </select>
              <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent w-36 md:w-56"
              />
            </div>

            {/* Export Buttons */}
            <ExportButtons
              data={ordersData}
              columns={exportColumns}
              title="Rapport des commandes"
              subtitle={`${ordersData.length} commandes`}
              filename={`rapport_commandes_${new Date().toISOString().split('T')[0]}`}
              summary={exportSummary}
              rowFormatter={exportRowFormatter}
              userName={user?.firstName}
              onSuccess={handleExportSuccess}
              onError={handleExportError}
            />

            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              title={actions.refresh}
            >
              <RefreshCw size={18} className="text-[#6D6D6D]" />
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-lg transition-colors ${isFilterOpen ? 'bg-[#B8863B]/10 text-[#B8863B]' : 'hover:bg-[#F8F7F4] text-[#6D6D6D]'}`}
              title="Filtres"
            >
              <Filter size={18} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
              title={tc('share')}
            >
              <Share2 size={18} className="text-[#6D6D6D]" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== FILTRES AVANCÉS ===== */}
      <AdvancedFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onApply={() => setIsFilterOpen(false)}
      />

      {/* ===== TABS ===== */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center gap-1 border-b border-[#ECE8E1] min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#B8863B] text-[#B8863B]'
                    : 'border-transparent text-[#6D6D6D] hover:text-[#3D2F24] hover:border-[#D1CBC0]'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'production' && renderProduction()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'deliveries' && renderDeliveries()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'reports' && renderGeneratedReports()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;