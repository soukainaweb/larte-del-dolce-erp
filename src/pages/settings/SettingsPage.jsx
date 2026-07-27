// src/pages/settings/SettingsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  RefreshCw,
  Save,
  RotateCcw,
  Search,
  Filter,
  Building,
  Package,
  ShoppingBag,
  Factory,
  FileText,
  Bell,
  Shield,
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  History,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Lock,
  Unlock,
  Key,
  Server,
  Users,
  Truck,
  DollarSign,
  BarChart3,
  PieChart,
  LogOut,
  LogIn,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Copy,
  Share2,
  Star,
  Award,
  Crown,
  Gem,
  Diamond,
  Heart,
  Play,
  Square,
  Zap,
  TrendingUp,
  BarChart,
  LineChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
// TOAST COMPONENT
// ==========================================
const Toast = ({ message, type = 'success', onClose }) => {
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
      className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
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
// CONFIRM DIALOG
// ==========================================
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirmer', cancelText = 'Annuler', isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
          <h3 className="text-lg font-bold text-[#2B2B2B]">{title}</h3>
        </div>
        <p className="text-sm text-[#6D6D6D] mb-6">{description}</p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4] rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MODAL COMPONENT
// ==========================================
const Modal = ({ isOpen, onClose, onSave, title, description, children, isLoading = false, saveText = 'Sauvegarder' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]">{title}</h3>
            {description && <p className="text-sm text-[#6D6D6D]">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#EAE6DF] px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4] rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {saveText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// TEST MODAL
// ==========================================
const TestModal = ({ isOpen, onClose, onTest, title, description, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6 border-b border-[#EAE6DF] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]">{title}</h3>
            {description && <p className="text-sm text-[#6D6D6D]">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#B8863B]/10 flex items-center justify-center">
                <Zap size={32} className="text-[#B8863B]" />
              </div>
              <p className="text-center text-[#6D6D6D]">
                Le test va simuler une production avec les paramètres actuels.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6D6D6D]">
                <span>⏱️ Durée estimée: 2-5 secondes</span>
                <span>📊 Données: 50 produits</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#EAE6DF] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onTest}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            <Play size={16} />
            Lancer le test
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// INVOICE PREVIEW MODAL
// ==========================================
const InvoicePreviewModal = ({ isOpen, onClose, data, invoiceConfig, onExportPDF }) => {
  if (!isOpen || !data) return null;

  const totalItems = data.items.reduce((sum, item) => sum + item.total, 0);
  const vatTotal = data.items.reduce((sum, item) => sum + (item.total * (item.vat / 100)), 0);
  const grandTotal = totalItems + vatTotal;
  const currency = data.currency || 'SAR';
  const currencySymbol = currency === 'SAR' ? 'ر.س' : currency;

  const showToast = (message, type) => {
    const event = new CustomEvent('showToast', { detail: { message, type } });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]">Aperçu PDF de la facture</h3>
            <p className="text-sm text-[#6D6D6D]">Facture {data.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          {/* Entête facture */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#EAE6DF]">
            <div>
              <h2 className="text-xl font-bold text-[#B8863B]" style={{ fontFamily: FONT_HEADING }}>
                {data.companyName}
              </h2>
              <p className="text-xs text-[#6D6D6D]">{data.companyAddress}</p>
              <p className="text-xs text-[#6D6D6D]">Tél: {data.companyPhone}</p>
              <p className="text-xs text-[#6D6D6D]">Email: {data.companyEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#2B2B2B]">FACTURE</p>
              <p className="text-xs text-[#6D6D6D]">N° {data.id}</p>
              <p className="text-xs text-[#6D6D6D]">Date: {data.date}</p>
              <p className="text-xs text-[#6D6D6D]">Échéance: {data.dueDate}</p>
            </div>
          </div>

          {/* Client */}
          <div className="mb-6 p-4 bg-[#F8F7F4] rounded-xl">
            <p className="text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</p>
            <p className="text-sm font-semibold text-[#2B2B2B]">{data.client}</p>
            <p className="text-xs text-[#6D6D6D]">{data.clientAddress}</p>
            <p className="text-xs text-[#6D6D6D]">Tél: {data.clientPhone}</p>
            <p className="text-xs text-[#6D6D6D]">Email: {data.clientEmail}</p>
          </div>

          {/* Tableau des produits */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#EAE6DF]">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Produit</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Qté</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Prix</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">TVA</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="px-3 py-2 text-[#2B2B2B]">{item.name}</td>
                    <td className="px-3 py-2 text-center text-[#2B2B2B]">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-[#2B2B2B]">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center text-[#2B2B2B]">{item.vat}%</td>
                    <td className="px-3 py-2 text-right font-semibold text-[#2B2B2B]">{item.total.toFixed(2)} {currencySymbol}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#EAE6DF]">
                  <td colSpan="4" className="px-3 py-2 text-right font-semibold text-[#2B2B2B]">Sous-total</td>
                  <td className="px-3 py-2 text-right font-semibold text-[#2B2B2B]">{totalItems.toFixed(2)} {currencySymbol}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="px-3 py-2 text-right text-[#6D6D6D]">TVA ({invoiceConfig.vat}%)</td>
                  <td className="px-3 py-2 text-right text-[#6D6D6D]">{vatTotal.toFixed(2)} {currencySymbol}</td>
                </tr>
                <tr className="border-t-2 border-[#B8863B] bg-[#FDFBF7]">
                  <td colSpan="4" className="px-3 py-3 text-right font-bold text-[#2B2B2B] text-lg">Total TTC</td>
                  <td className="px-3 py-3 text-right font-bold text-[#B8863B] text-lg">{grandTotal.toFixed(2)} {currencySymbol}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conditions de paiement */}
          <div className="p-4 bg-[#F8F7F4] rounded-xl text-xs text-[#6D6D6D]">
            <p className="font-semibold text-[#2B2B2B]">Conditions de paiement</p>
            <p>Paiement à {data.paymentTerms} jours</p>
            <p className="mt-1">© {new Date().getFullYear()} {data.companyName} - Tous droits réservés</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#EAE6DF] px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={() => {
              if (onExportPDF) {
                onExportPDF(data);
              }
            }}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Exporter en PDF
          </button>
          <button
            onClick={() => {
              window.print();
              showToast('🖨️ Impression en cours...', 'info');
            }}
            className="px-4 py-2 text-sm text-[#6D6D6D] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6D6D6D] border border-[#EAE6DF] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN SETTINGS PAGE
// ==========================================
const SettingsPage = () => {
  const { user } = useAuth();

  // ===== STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', description: '', onConfirm: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // ===== MODAL STATE =====
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    type: 'company',
    data: {},
    onSave: null
  });

  // ===== TEST MODAL STATE =====
  const [testModalConfig, setTestModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    type: '',
    onTest: null
  });

  // ===== COMPANY STATE =====
  const [company, setCompany] = useState({
    name: "L'arte del dolce",
    logo: null,
    address: '123, Rue des Pâtissiers',
    city: 'Casablanca',
    country: 'Maroc',
    postalCode: '20000',
    phone: '+212 5 22 12 34 56',
    email: 'contact@lartedeldolce.ma',
    website: 'www.lartedeldolce.ma',
    ice: '001234567000012',
    if: '12345678',
    rc: '98765432',
    patent: '98765432',
    description: 'Pâtisserie haut de gamme proposant des créations uniques et raffinées.',
    taxId: '12345678'
  });

  // ===== PRODUCTION STATE =====
  const [production, setProduction] = useState({
    startTime: '08:00',
    endTime: '18:00',
    capacity: 500,
    minStock: 50,
    avgTime: 45,
    workingDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  });

  // ===== ORDERS STATE =====
  const [ordersConfig, setOrdersConfig] = useState({
    prefix: 'CMD',
    autoNumber: true,
    nextNumber: 1001,
    validation: 'manual',
    urgentDelay: 24,
    allowDeletion: true,
    requireConfirmation: true
  });

  // ===== INVOICE STATE - DEVISE CORRIGÉE EN SAR =====
  const [invoiceConfig, setInvoiceConfig] = useState({
    vat: 20,
    currency: 'SAR',
    paymentTerms: '30',
    pdfFormat: 'standard',
    numbering: 'auto',
    prefix: 'FAC'
  });

  // ===== NOTIFICATIONS STATE =====
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    sms: false,
    channels: {
      orders: true,
      production: true,
      payments: true,
      reports: true,
      stock: true,
      invoices: true,
      deliveries: true,
      system: true
    }
  });

  // ===== SECURITY STATE =====
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxAttempts: 5,
    blockDuration: 30,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordHistory: 5
  });

  // ===== BACKUP STATE =====
  const [backup] = useState({
    lastBackup: '18/07/2025 à 02:30',
    nextBackup: '19/07/2025 à 02:30',
    frequency: 'daily',
    destination: 'Local',
    size: '258.4 MB',
    history: [
      { date: '18/07/2025 02:30', size: '258.4 MB', type: 'Complète', status: 'success' },
      { date: '17/07/2025 02:30', size: '256.1 MB', type: 'Complète', status: 'success' },
      { date: '16/07/2025 02:30', size: '252.8 MB', type: 'Complète', status: 'success' }
    ]
  });

  // ===== ACTIVITY LOG STATE =====
  const [activityLog] = useState([
    { id: 1, user: 'Mohamed Amine', action: 'Modification des paramètres', module: 'Sécurité', date: '19/07/2026 14:30', ip: '192.168.1.1', browser: 'Chrome 120', status: 'success' },
    { id: 2, user: 'Sara El Idrissi', action: 'Export des données', module: 'Export', date: '19/07/2026 13:15', ip: '192.168.1.2', browser: 'Firefox 115', status: 'success' },
    { id: 3, user: 'Ahmed Benjelloun', action: 'Sauvegarde manuelle', module: 'Sauvegarde', date: '19/07/2026 12:00', ip: '192.168.1.3', browser: 'Safari 17', status: 'success' },
    { id: 4, user: 'Mohamed Amine', action: 'Tentative de connexion échouée', module: 'Sécurité', date: '19/07/2026 11:45', ip: '192.168.1.4', browser: 'Chrome 120', status: 'error' }
  ]);

  // ===== TABS =====
  const tabs = [
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'production', label: 'Production', icon: Factory },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'invoices', label: 'Facturation', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'backup', label: 'Sauvegardes', icon: Database },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'history', label: 'Journal', icon: History }
  ];

  // ===== TOAST =====
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // Écouter les événements toast personnalisés
  useEffect(() => {
    const handleToast = (event) => {
      showToast(event.detail.message, event.detail.type);
    };
    window.addEventListener('showToast', handleToast);
    return () => window.removeEventListener('showToast', handleToast);
  }, []);

  // ===== CONFIRM DIALOG =====
  const showConfirm = (title, description, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog({ isOpen: false, title: '', description: '', onConfirm: null });
  };

  // ===== MODAL FUNCTIONS =====
  const openModal = (type, data = {}, title, description, onSave) => {
    setModalConfig({
      isOpen: true,
      type,
      data,
      title: title || 'Modifier',
      description: description || 'Mettez à jour les informations',
      onSave: onSave || (() => {})
    });
  };

  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      title: '',
      description: '',
      type: 'company',
      data: {},
      onSave: null
    });
  };

  // ===== TEST MODAL FUNCTIONS =====
  const openTestModal = (type, title, description, onTest) => {
    setTestModalConfig({
      isOpen: true,
      type,
      title: title || 'Test de simulation',
      description: description || 'Vérifiez les paramètres avant de lancer le test',
      onTest: onTest || (() => {})
    });
  };

  const closeTestModal = () => {
    setTestModalConfig({
      isOpen: false,
      title: '',
      description: '',
      type: '',
      onTest: null
    });
  };

  // ===== HANDLERS =====
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('🔄 Données actualisées avec succès', 'success');
    }, 800);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('✅ Tous les paramètres ont été sauvegardés avec succès', 'success');
    }, 1200);
  };

  const handleResetAll = () => {
    showConfirm(
      'Restaurer les paramètres',
      'Êtes-vous sûr de vouloir restaurer tous les paramètres par défaut ? Cette action est irréversible.',
      () => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          hideConfirm();
          showToast('🔄 Paramètres restaurés avec succès', 'success');
        }, 800);
      }
    );
  };

  // ===== EXPORT HANDLERS =====
  const handleExport = async (type) => {
    try {
      const exportData = [
        { id: 1, name: 'Paramètre 1', value: 'Valeur 1' },
        { id: 2, name: 'Paramètre 2', value: 'Valeur 2' },
        { id: 3, name: 'Paramètre 3', value: 'Valeur 3' }
      ];

      const columns = [
        { label: 'ID', accessor: 'id' },
        { label: 'Nom', accessor: 'name' },
        { label: 'Valeur', accessor: 'value' }
      ];

      const filename = `parametres_${new Date().toISOString().split('T')[0]}`;

      switch (type) {
        case 'pdf':
          await exportPDF({
            title: 'Export des paramètres',
            data: exportData,
            columns: columns,
            filename: `${filename}.pdf`,
            userName: user?.firstName || 'Utilisateur'
          });
          showToast('✅ PDF exporté avec succès', 'success');
          break;
        case 'excel':
          await exportExcel({
            title: 'Export des paramètres',
            data: exportData,
            columns: columns,
            filename: `${filename}.xlsx`,
            userName: user?.firstName || 'Utilisateur'
          });
          showToast('✅ Excel exporté avec succès', 'success');
          break;
        case 'csv':
          await exportCSV({
            title: 'Export des paramètres',
            data: exportData,
            columns: columns,
            filename: `${filename}.csv`,
            userName: user?.firstName || 'Utilisateur'
          });
          showToast('✅ CSV exporté avec succès', 'success');
          break;
        case 'print':
          await printData({
            title: 'Export des paramètres',
            data: exportData,
            columns: columns,
            userName: user?.firstName || 'Utilisateur'
          });
          showToast('🖨️ Impression lancée', 'success');
          break;
        default:
          showToast(`📄 Export ${type} en cours...`, 'info');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast(`❌ Erreur lors de l'export ${type}`, 'error');
    }
  };

  // ===== COMPANY HANDLERS =====
  const handleEditCompany = () => {
    openModal(
      'company',
      company,
      'Modifier les informations de l\'entreprise',
      'Mettez à jour les informations de votre entreprise',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setCompany(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Informations mises à jour avec succès', 'success');
        }, 800);
      }
    );
  };

  const handleExportCompany = (format) => {
    const data = [company];
    const columns = [
      { label: 'Nom', accessor: 'name' },
      { label: 'Site web', accessor: 'website' },
      { label: 'Adresse', accessor: 'address' },
      { label: 'Ville', accessor: 'city' },
      { label: 'Pays', accessor: 'country' },
      { label: 'Téléphone', accessor: 'phone' },
      { label: 'Email', accessor: 'email' },
      { label: 'ICE', accessor: 'ice' }
    ];
    
    const filename = `entreprise_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'PDF':
        exportPDF({ title: 'Informations entreprise', data, columns, filename: `${filename}.pdf`, userName: user?.firstName });
        showToast('✅ PDF exporté avec succès', 'success');
        break;
      case 'Excel':
        exportExcel({ title: 'Informations entreprise', data, columns, filename: `${filename}.xlsx`, userName: user?.firstName });
        showToast('✅ Excel exporté avec succès', 'success');
        break;
      case 'JSON':
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ JSON exporté avec succès', 'success');
        break;
      default:
        showToast(`📄 Export ${format} en cours...`, 'info');
    }
  };

  const handlePrintCompany = () => {
    window.print();
    showToast('🖨️ Impression en cours...', 'info');
  };

  // ===== PRODUCTION HANDLERS =====
  const handleEditProduction = () => {
    openModal(
      'production',
      production,
      'Modifier les paramètres de production',
      'Configurez les paramètres de production',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setProduction(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Paramètres de production mis à jour', 'success');
        }, 800);
      }
    );
  };

  const handleTestProduction = () => {
    openTestModal(
      'production',
      'Test de production',
      'Simulez la production avec les paramètres actuels',
      () => {
        setIsTesting(true);
        setTimeout(() => {
          setIsTesting(false);
          closeTestModal();
          showToast('🧪 Test de production terminé avec succès! Résultats: 500 unités en 4.5h', 'success');
        }, 3000);
      }
    );
  };

  // ===== ORDERS HANDLERS =====
  const handleEditOrders = () => {
    openModal(
      'orders',
      ordersConfig,
      'Modifier les paramètres des commandes',
      'Configurez les paramètres des commandes',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setOrdersConfig(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Paramètres des commandes mis à jour', 'success');
        }, 800);
      }
    );
  };

  // ===== INVOICE HANDLERS =====
  const handleEditInvoices = () => {
    openModal(
      'invoices',
      invoiceConfig,
      'Modifier les paramètres de facturation',
      'Configurez les paramètres de facturation',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setInvoiceConfig(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Paramètres de facturation mis à jour', 'success');
        }, 800);
      }
    );
  };

  const handlePreviewInvoice = () => {
    const invoiceData = {
      id: `FAC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      date: new Date().toLocaleDateString('fr-FR'),
      dueDate: new Date(Date.now() + parseInt(invoiceConfig.paymentTerms) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      client: 'Café Al Amir',
      clientAddress: '123, Rue Mohamed V, Casablanca',
      clientPhone: '+212 5 22 12 34 56',
      clientEmail: 'contact@cafealamir.com',
      items: [
        { name: 'Gâteau Chocolat', quantity: 3, unitPrice: 120, vat: invoiceConfig.vat || 20, total: 360 },
        { name: 'Tarte aux Fruits', quantity: 2, unitPrice: 85, vat: invoiceConfig.vat || 20, total: 170 },
        { name: 'Éclair Vanille', quantity: 5, unitPrice: 45, vat: invoiceConfig.vat || 20, total: 225 },
        { name: 'Croissant Beurre', quantity: 10, unitPrice: 15, vat: invoiceConfig.vat || 20, total: 150 }
      ],
      subtotal: 905,
      vatTotal: 181,
      total: 1086,
      paymentTerms: invoiceConfig.paymentTerms || '30',
      currency: invoiceConfig.currency || 'SAR',
      companyName: company.name || "L'arte del dolce",
      companyAddress: company.address || '123, Rue des Pâtissiers, Casablanca',
      companyPhone: company.phone || '+212 5 22 12 34 56',
      companyEmail: company.email || 'contact@lartedeldolce.ma'
    };
    setPreviewData(invoiceData);
    setIsPreviewModalOpen(true);
  };

  const handleExportInvoicePDF = (data) => {
    const exportData = [{
      id: data.id,
      client: data.client,
      total: data.total.toFixed(2),
      currency: data.currency || 'SAR',
      date: data.date
    }];
    const columns = [
      { label: 'N° Facture', accessor: 'id' },
      { label: 'Client', accessor: 'client' },
      { label: 'Total', accessor: 'total' },
      { label: 'Devise', accessor: 'currency' },
      { label: 'Date', accessor: 'date' }
    ];
    exportPDF({
      title: 'Facture',
      data: exportData,
      columns: columns,
      filename: `facture_${data.id}.pdf`,
      userName: user?.firstName || 'Utilisateur'
    });
    showToast('📄 Facture exportée en PDF avec succès', 'success');
  };

  // ===== NOTIFICATIONS HANDLERS =====
  const handleEditNotifications = () => {
    openModal(
      'notifications',
      notifications,
      'Modifier les paramètres de notification',
      'Configurez les canaux et préférences de notification',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setNotifications(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Préférences de notifications sauvegardées', 'success');
        }, 800);
      }
    );
  };

  // ===== SECURITY HANDLERS =====
  const handleEditSecurity = () => {
    openModal(
      'security',
      security,
      'Modifier les paramètres de sécurité',
      'Configurez les paramètres de sécurité du système',
      (data) => {
        setIsSaving(true);
        setTimeout(() => {
          setSecurity(prev => ({ ...prev, ...data }));
          setIsSaving(false);
          closeModal();
          showToast('✅ Paramètres de sécurité mis à jour', 'success');
        }, 800);
      }
    );
  };

  // ==========================================
  // MODAL RENDER FUNCTIONS
  // ==========================================

  const renderModalContent = () => {
    const { type, data } = modalConfig;

    switch (type) {
      case 'company':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Nom de l'entreprise</label>
              <input
                type="text"
                defaultValue={data.name}
                id="company-name"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Site web</label>
              <input
                type="text"
                defaultValue={data.website}
                id="company-website"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Adresse</label>
              <input
                type="text"
                defaultValue={data.address}
                id="company-address"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Ville</label>
              <input
                type="text"
                defaultValue={data.city}
                id="company-city"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Pays</label>
              <input
                type="text"
                defaultValue={data.country}
                id="company-country"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Téléphone</label>
              <input
                type="text"
                defaultValue={data.phone}
                id="company-phone"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                defaultValue={data.email}
                id="company-email"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">ICE</label>
              <input
                type="text"
                defaultValue={data.ice}
                id="company-ice"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">IF</label>
              <input
                type="text"
                defaultValue={data.if}
                id="company-if"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">RC</label>
              <input
                type="text"
                defaultValue={data.rc}
                id="company-rc"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                defaultValue={data.description}
                id="company-description"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] resize-none"
              />
            </div>
          </div>
        );

      case 'production':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Heure début</label>
              <input
                type="time"
                defaultValue={data.startTime}
                id="production-startTime"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Heure fin</label>
              <input
                type="time"
                defaultValue={data.endTime}
                id="production-endTime"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Capacité (unités/jour)</label>
              <input
                type="number"
                defaultValue={data.capacity}
                id="production-capacity"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Temps moyen (min)</label>
              <input
                type="number"
                defaultValue={data.avgTime}
                id="production-avgTime"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Stock minimum</label>
              <input
                type="number"
                defaultValue={data.minStock}
                id="production-minStock"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Jours ouvrables</label>
              <input
                type="text"
                defaultValue={data.workingDays.join(', ')}
                id="production-workingDays"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                placeholder="Lundi, Mardi, Mercredi..."
              />
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Préfixe</label>
              <input
                type="text"
                defaultValue={data.prefix}
                id="orders-prefix"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Numérotation automatique</label>
              <select
                defaultValue={data.autoNumber ? 'true' : 'false'}
                id="orders-autoNumber"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              >
                <option value="true">Activée</option>
                <option value="false">Désactivée</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Délai urgent (heures)</label>
              <input
                type="number"
                defaultValue={data.urgentDelay}
                id="orders-urgentDelay"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Validation</label>
              <select
                defaultValue={data.validation}
                id="orders-validation"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              >
                <option value="manual">Manuelle</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
          </div>
        );

      case 'invoices':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">TVA (%)</label>
              <input
                type="number"
                defaultValue={data.vat}
                id="invoices-vat"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Devise</label>
              <select
                defaultValue={data.currency}
                id="invoices-currency"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              >
                <option value="SAR">SAR (ر.س)</option>
                <option value="MAD">MAD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Délai paiement (jours)</label>
              <input
                type="number"
                defaultValue={data.paymentTerms}
                id="invoices-paymentTerms"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Préfixe facture</label>
              <input
                type="text"
                defaultValue={data.prefix}
                id="invoices-prefix"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                <span className="text-sm font-medium text-[#2B2B2B]">📧 Email</span>
                <select
                  defaultValue={data.email ? 'true' : 'false'}
                  id="notifications-email"
                  className="px-3 py-1 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                >
                  <option value="true">Activé</option>
                  <option value="false">Désactivé</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                <span className="text-sm font-medium text-[#2B2B2B]">📱 Push</span>
                <select
                  defaultValue={data.push ? 'true' : 'false'}
                  id="notifications-push"
                  className="px-3 py-1 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                >
                  <option value="true">Activé</option>
                  <option value="false">Désactivé</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                <span className="text-sm font-medium text-[#2B2B2B]">🖥️ Desktop</span>
                <select
                  defaultValue={data.desktop ? 'true' : 'false'}
                  id="notifications-desktop"
                  className="px-3 py-1 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                >
                  <option value="true">Activé</option>
                  <option value="false">Désactivé</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                <span className="text-sm font-medium text-[#2B2B2B]">📱 SMS</span>
                <select
                  defaultValue={data.sms ? 'true' : 'false'}
                  id="notifications-sms"
                  className="px-3 py-1 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                >
                  <option value="true">Activé</option>
                  <option value="false">Désactivé</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Double Authentification</label>
                <select
                  defaultValue={data.twoFactorAuth ? 'true' : 'false'}
                  id="security-twoFactorAuth"
                  className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                >
                  <option value="true">Activée</option>
                  <option value="false">Désactivée</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Expiration session (min)</label>
                <input
                  type="number"
                  defaultValue={data.sessionTimeout}
                  id="security-sessionTimeout"
                  className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Tentatives max</label>
                <input
                  type="number"
                  defaultValue={data.maxAttempts}
                  id="security-maxAttempts"
                  className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Historique mots de passe</label>
                <input
                  type="number"
                  defaultValue={data.passwordHistory}
                  id="security-passwordHistory"
                  className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Longueur minimale mot de passe</label>
              <input
                type="number"
                defaultValue={data.passwordMinLength}
                id="security-passwordMinLength"
                className="w-full px-3 py-2 text-sm border border-[#EAE6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-[#6D6D6D]">
            <p>Aucun formulaire disponible pour cette section</p>
          </div>
        );
    }
  };

  const handleModalSave = () => {
    const { type, onSave } = modalConfig;
    
    const formData = {};
    const formElements = document.querySelectorAll('#modal-form input, #modal-form select, #modal-form textarea');
    formElements.forEach(el => {
      if (el.id) {
        const key = el.id.replace(`${type}-`, '');
        formData[key] = el.value;
      }
    });

    if (type === 'production') {
      formData.capacity = parseInt(formData.capacity) || 0;
      formData.avgTime = parseInt(formData.avgTime) || 0;
      formData.minStock = parseInt(formData.minStock) || 0;
      formData.workingDays = formData.workingDays ? formData.workingDays.split(',').map(s => s.trim()) : [];
    }
    if (type === 'orders') {
      formData.autoNumber = formData.autoNumber === 'true';
      formData.urgentDelay = parseInt(formData.urgentDelay) || 0;
    }
    if (type === 'invoices') {
      formData.vat = parseInt(formData.vat) || 0;
      formData.paymentTerms = parseInt(formData.paymentTerms) || 0;
    }
    if (type === 'notifications') {
      formData.email = formData.email === 'true';
      formData.push = formData.push === 'true';
      formData.desktop = formData.desktop === 'true';
      formData.sms = formData.sms === 'true';
    }
    if (type === 'security') {
      formData.twoFactorAuth = formData.twoFactorAuth === 'true';
      formData.sessionTimeout = parseInt(formData.sessionTimeout) || 30;
      formData.maxAttempts = parseInt(formData.maxAttempts) || 5;
      formData.passwordHistory = parseInt(formData.passwordHistory) || 5;
      formData.passwordMinLength = parseInt(formData.passwordMinLength) || 8;
    }

    if (onSave) {
      onSave(formData);
    }
  };

  // ==========================================
  // NOTIFICATION HANDLERS
  // ==========================================
  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [key]: !prev.channels[key]
      }
    }));
  };

  const toggleNotificationType = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAllNotifications = (state) => {
    const newChannels = {};
    Object.keys(notifications.channels).forEach(key => {
      newChannels[key] = state;
    });
    setNotifications(prev => ({
      ...prev,
      channels: newChannels
    }));
  };

  const handleTestNotification = () => {
    showToast('🔔 Notification test envoyée avec succès', 'success');
  };

  const handleSaveNotifications = () => {
    showToast('✅ Préférences de notifications sauvegardées', 'success');
  };

  const handleToggle2FA = () => {
    setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }));
    showToast(security.twoFactorAuth ? '🔐 2FA désactivée' : '🔐 2FA activée avec succès', 'success');
  };

  const handleDisconnectAll = () => {
    showConfirm(
      'Déconnecter tous les utilisateurs',
      'Cette action déconnectera tous les utilisateurs actifs du système. Êtes-vous sûr ?',
      () => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          hideConfirm();
          showToast('🔒 Tous les utilisateurs ont été déconnectés', 'success');
        }, 800);
      }
    );
  };

  const handleViewConnections = () => {
    showToast('👁️ Affichage des connexions actives', 'info');
  };

  const handleCreateBackup = () => {
    showToast('⏳ Création de la sauvegarde en cours...', 'info');
    setTimeout(() => {
      showToast('✅ Sauvegarde créée avec succès - 258.4 MB', 'success');
    }, 2000);
  };

  const handleDownloadBackup = () => {
    showToast('📥 Téléchargement de la sauvegarde en cours...', 'info');
    setTimeout(() => {
      showToast('✅ Sauvegarde téléchargée avec succès', 'success');
    }, 1500);
  };

  const handleRestoreBackup = () => {
    showConfirm(
      'Restaurer la sauvegarde',
      'Cette action restaurera toutes les données à partir de la sauvegarde sélectionnée. Êtes-vous sûr ?',
      () => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          hideConfirm();
          showToast('✅ Sauvegarde restaurée avec succès', 'success');
        }, 2000);
      }
    );
  };

  const handleDeleteBackup = () => {
    showConfirm(
      'Supprimer la sauvegarde',
      'Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.',
      () => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          hideConfirm();
          showToast('🗑️ Sauvegarde supprimée avec succès', 'success');
        }, 800);
      }
    );
  };

  const handleViewActivity = (activity) => {
    showToast(`👁️ Consultation de l'activité #${activity.id}`, 'info');
  };

  const handleCopyActivity = (activity) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`ID: ${activity.id}\nUtilisateur: ${activity.user}\nAction: ${activity.action}\nDate: ${activity.date}`);
      showToast('📋 Informations copiées dans le presse-papier', 'success');
    } else {
      showToast('📋 Informations prêtes à être copiées', 'info');
    }
  };

  const handleExportActivity = () => {
    showToast('📄 Export du journal des activités en cours...', 'info');
    setTimeout(() => {
      showToast('✅ Journal des activités exporté avec succès', 'success');
    }, 1000);
  };

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  // ===== TAB: COMPANY =====
  const renderCompany = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
            <Building size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2B2B]">Informations de l'entreprise</h3>
            <p className="text-xs text-[#6D6D6D]">Gérez les informations de votre entreprise</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEditCompany}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
            Modifier          </button>
          <button
            onClick={() => handleExportCompany('PDF')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <Download size={14} />
            PDF
          </button>
          <button
            onClick={() => handleExportCompany('Excel')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
          <button
            onClick={() => handleExportCompany('JSON')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <FileJson size={14} />
            JSON
          </button>
          <button
            onClick={handlePrintCompany}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <Printer size={14} />
            Imprimer
          </button>
        </div>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] text-2xl font-bold flex-shrink-0">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Building size={32} />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Nom</p>
              <p className="text-sm font-semibold text-[#2B2B2B]">{company.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Site web</p>
              <p className="text-sm text-[#2B2B2B]">{company.website}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Adresse</p>
              <p className="text-sm text-[#2B2B2B]">{company.address}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Ville</p>
              <p className="text-sm text-[#2B2B2B]">{company.city}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Pays</p>
              <p className="text-sm text-[#2B2B2B]">{company.country}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Téléphone</p>
              <p className="text-sm text-[#2B2B2B]">{company.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Email</p>
              <p className="text-sm text-[#2B2B2B]">{company.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">ICE</p>
              <p className="text-sm text-[#2B2B2B]">{company.ice}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">IF</p>
              <p className="text-sm text-[#2B2B2B]">{company.if}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">RC</p>
              <p className="text-sm text-[#2B2B2B]">{company.rc}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Description</p>
              <p className="text-sm text-[#2B2B2B]">{company.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: PRODUCTION =====
  const renderProduction = () => (
    <div className="space-y-4">
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
              <Factory size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2B2B]">Paramètres de production</h3>
              <p className="text-xs text-[#6D6D6D]">Configurez les paramètres de production</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEditProduction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
              Modifier
            </button>
            <button
              onClick={handleTestProduction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              <Play size={14} />
              Tester
            </button>
            <button
              onClick={() => {
                setProduction({
                  startTime: '08:00',
                  endTime: '18:00',
                  capacity: 500,
                  minStock: 50,
                  avgTime: 45,
                  workingDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
                });
                showToast('🔄 Paramètres de production réinitialisés', 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          </div>
        </div>
        <div className="border-t border-[#EAE6DF] pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Début</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{production.startTime}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Fin</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{production.endTime}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Capacité</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{production.capacity} unités/jour</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Temps moyen</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{production.avgTime} min</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Stock minimum</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{production.minStock} unités</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center col-span-2">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Jours ouvrables</p>
              <p className="text-sm font-semibold text-[#2B2B2B]">{production.workingDays.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: ORDERS =====
  const renderOrders = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2B2B]">Paramètres des commandes</h3>
            <p className="text-xs text-[#6D6D6D]">Configurez les paramètres des commandes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEditOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
            Modifier
          </button>
          <button
            onClick={() => showToast('📋 Historique des modifications des commandes', 'info')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <History size={14} />
            Historique
          </button>
          <button
            onClick={() => {
              setOrdersConfig({
                prefix: 'CMD',
                autoNumber: true,
                nextNumber: 1001,
                validation: 'manual',
                urgentDelay: 24,
                allowDeletion: true,
                requireConfirmation: true
              });
              showToast('🔄 Paramètres des commandes réinitialisés', 'success');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Réinitialiser
          </button>
        </div>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Préfixe</p>
              <p className="text-sm font-bold text-[#2B2B2B]">{ordersConfig.prefix}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Numéro auto</p>
              <p className="text-sm font-bold text-[#2B2B2B]">{ordersConfig.autoNumber ? '✅' : '❌'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Validation</p>
              <p className="text-sm font-bold text-[#2B2B2B]">{ordersConfig.validation}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Urgence (h)</p>
              <p className="text-sm font-bold text-[#2B2B2B]">{ordersConfig.urgentDelay}h</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl md:col-span-2">
            <div>
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Options</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-[#2B2B2B]">Suppression: {ordersConfig.allowDeletion ? '✅' : '❌'}</span>
                <span className="text-xs text-[#2B2B2B]">Confirmation: {ordersConfig.requireConfirmation ? '✅' : '❌'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Prochain numéro</p>
              <p className="text-sm font-bold text-[#2B2B2B]">{ordersConfig.nextNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: INVOICES =====
  const renderInvoices = () => (
    <>
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2B2B]">Paramètres de facturation</h3>
              <p className="text-xs text-[#6D6D6D]">Configurez les paramètres de facturation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEditInvoices}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
              Modifier
            </button>
            <button
              onClick={handlePreviewInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              <Eye size={14} />
              Prévisualiser
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              <Download size={14} />
              Exporter
            </button>
          </div>
        </div>
        <div className="border-t border-[#EAE6DF] pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">TVA</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{invoiceConfig.vat}%</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Devise</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{invoiceConfig.currency}</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Paiement</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{invoiceConfig.paymentTerms} jours</p>
            </div>
            <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Numérotation</p>
              <p className="text-lg font-bold text-[#2B2B2B]">{invoiceConfig.numbering}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        data={previewData}
        invoiceConfig={invoiceConfig}
        onExportPDF={handleExportInvoicePDF}
      />
    </>
  );

  // ===== TAB: NOTIFICATIONS =====
  const renderNotifications = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2B2B]">Paramètres de notification</h3>
            <p className="text-xs text-[#6D6D6D]">Configurez les canaux et préférences de notification</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEditNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
            Modifier
          </button>
          <button
            onClick={() => toggleAllNotifications(true)}
            className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            Tout activer
          </button>
          <button
            onClick={() => toggleAllNotifications(false)}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            Tout désactiver
          </button>
          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
          >
            Tester
          </button>
          <button
            onClick={handleSaveNotifications}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#B8863B] rounded-lg hover:bg-[#A07532] transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <span className="text-sm font-medium text-[#2B2B2B]">📧 Email</span>
            <button
              onClick={() => toggleNotificationType('email')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${notifications.email ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {notifications.email ? 'Activé' : 'Désactivé'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <span className="text-sm font-medium text-[#2B2B2B]">📱 Push</span>
            <button
              onClick={() => toggleNotificationType('push')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${notifications.push ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {notifications.push ? 'Activé' : 'Désactivé'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <span className="text-sm font-medium text-[#2B2B2B]">🖥️ Desktop</span>
            <button
              onClick={() => toggleNotificationType('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${notifications.desktop ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {notifications.desktop ? 'Activé' : 'Désactivé'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
            <span className="text-sm font-medium text-[#2B2B2B]">📱 SMS</span>
            <button
              onClick={() => toggleNotificationType('sms')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${notifications.sms ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {notifications.sms ? 'Activé' : 'Désactivé'}
            </button>
          </div>
        </div>
        <div className="border-t border-[#EAE6DF] pt-4">
          <p className="text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider mb-3">Canaux de notification</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(notifications.channels).map((key) => {
              const labels = {
                orders: 'Commandes',
                production: 'Production',
                payments: 'Paiements',
                reports: 'Rapports',
                stock: 'Stock',
                invoices: 'Factures',
                deliveries: 'Livraisons',
                system: 'Système'
              };
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                  <span className="text-sm font-medium text-[#2B2B2B]">{labels[key] || key}</span>
                  <button
                    onClick={() => toggleNotification(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${notifications.channels[key] ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {notifications.channels[key] ? 'Activé' : 'Désactivé'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: SECURITY =====
  const renderSecurity = () => (
    <div className="space-y-4">
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2B2B]">Sécurité du système</h3>
              <p className="text-xs text-[#6D6D6D]">Configurez les paramètres de sécurité</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEditSecurity}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B8863B] hover:bg-[#B8863B]/10 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
              Modifier
            </button>
            <button
              onClick={handleViewConnections}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
            >
              <Eye size={14} />
              Voir connexions
            </button>
            <button
              onClick={handleDisconnectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Déconnecter tout
            </button>
          </div>
        </div>
        <div className="border-t border-[#EAE6DF] pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
              <div>
                <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Double Authentification</p>
                <p className="text-sm font-bold text-[#2B2B2B]">{security.twoFactorAuth ? '✅ Activée' : '❌ Désactivée'}</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${security.twoFactorAuth ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {security.twoFactorAuth ? 'Désactiver' : 'Activer'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
              <div>
                <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Expiration session</p>
                <p className="text-sm font-bold text-[#2B2B2B]">{security.sessionTimeout} min</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
              <div>
                <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Tentatives max</p>
                <p className="text-sm font-bold text-[#2B2B2B]">{security.maxAttempts} tentatives</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
              <div>
                <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Historique mots de passe</p>
                <p className="text-sm font-bold text-[#2B2B2B]">{security.passwordHistory} derniers</p>
              </div>
            </div>
            <div className="md:col-span-2 p-3 bg-[#F8F7F4] rounded-xl">
              <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Complexité du mot de passe</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-[#2B2B2B]">Min: {security.passwordMinLength} caractères</span>
                <span className="text-xs text-[#2B2B2B]">{security.requireUppercase ? '✅ Majuscule' : '❌ Majuscule'}</span>
                <span className="text-xs text-[#2B2B2B]">{security.requireNumbers ? '✅ Chiffres' : '❌ Chiffres'}</span>
                <span className="text-xs text-[#2B2B2B]">{security.requireSpecialChars ? '✅ Spéciaux' : '❌ Spéciaux'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: BACKUP =====
  const renderBackup = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2B2B]">Sauvegardes</h3>
            <p className="text-xs text-[#6D6D6D]">Gérez les sauvegardes du système</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B8863B] rounded-lg hover:bg-[#A07532] transition-colors"
          >
            <Plus size={14} />
            Créer
          </button>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <Download size={14} />
            Télécharger
          </button>
          <button
            onClick={handleRestoreBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Restaurer
          </button>
          <button
            onClick={handleDeleteBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Dernière sauvegarde</p>
            <p className="text-sm font-bold text-[#2B2B2B]">{backup.lastBackup}</p>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Prochaine</p>
            <p className="text-sm font-bold text-[#2B2B2B]">{backup.nextBackup}</p>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Fréquence</p>
            <p className="text-sm font-bold text-[#2B2B2B]">{backup.frequency}</p>
          </div>
          <div className="bg-[#F8F7F4] rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Taille</p>
            <p className="text-sm font-bold text-[#2B2B2B]">{backup.size}</p>
          </div>
        </div>
        <div className="border-t border-[#EAE6DF] pt-4">
          <p className="text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider mb-3">Historique des sauvegardes</p>
          <div className="space-y-2">
            {backup.history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-sm font-medium text-[#2B2B2B]">{item.date}</span>
                  <span className="text-xs text-[#6D6D6D]">{item.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6D6D6D]">{item.size}</span>
                  <span className={`text-xs font-medium ${item.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.status === 'success' ? '✅ Réussie' : '❌ Échouée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: EXPORT =====
  const renderExport = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
          <Download size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#2B2B2B]">Export des données</h3>
          <p className="text-xs text-[#6D6D6D]">Exportez les données du système dans différents formats</p>
        </div>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => handleExport('pdf')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F8F7F4] rounded-xl hover:bg-[#EDEAE4] transition-colors"
          >
            <FileText size={28} className="text-rose-500" />
            <span className="text-xs font-medium text-[#2B2B2B]">PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F8F7F4] rounded-xl hover:bg-[#EDEAE4] transition-colors"
          >
            <FileSpreadsheet size={28} className="text-emerald-600" />
            <span className="text-xs font-medium text-[#2B2B2B]">Excel</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F8F7F4] rounded-xl hover:bg-[#EDEAE4] transition-colors"
          >
            <FileSpreadsheet size={28} className="text-blue-500" />
            <span className="text-xs font-medium text-[#2B2B2B]">CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F8F7F4] rounded-xl hover:bg-[#EDEAE4] transition-colors"
          >
            <FileJson size={28} className="text-amber-500" />
            <span className="text-xs font-medium text-[#2B2B2B]">JSON</span>
          </button>
          <button
            onClick={() => handleExport('print')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F8F7F4] rounded-xl hover:bg-[#EDEAE4] transition-colors"
          >
            <Printer size={28} className="text-purple-500" />
            <span className="text-xs font-medium text-[#2B2B2B]">Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ===== TAB: HISTORY =====
  const renderHistory = () => (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2B2B]">Journal des modifications</h3>
            <p className="text-xs text-[#6D6D6D]">Historique des actions et modifications du système</p>
          </div>
        </div>
        <button
          onClick={handleExportActivity}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D6D6D] hover:bg-[#F8F7F4] rounded-lg transition-colors"
        >
          <Download size={14} />
          Exporter
        </button>
      </div>
      <div className="border-t border-[#EAE6DF] pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAE6DF]">
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Utilisateur</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Action</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Module</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {activityLog.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-3 py-2 text-[#2B2B2B]">{item.user}</td>
                  <td className="px-3 py-2 text-[#2B2B2B]">{item.action}</td>
                  <td className="px-3 py-2 text-[#6D6D6D]">{item.module}</td>
                  <td className="px-3 py-2 text-[#6D6D6D]">{item.date}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {item.status === 'success' ? '✅ Succès' : '❌ Erreur'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewActivity(item)}
                        className="p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                      >
                        <Eye size={14} className="text-[#6D6D6D]" />
                      </button>
                      <button
                        onClick={() => handleCopyActivity(item)}
                        className="p-1 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                      >
                        <Copy size={14} className="text-[#6D6D6D]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ===== FILTER SEARCH =====
  const getFilteredTabs = () => {
    const tabLabels = {
      company: 'entreprise company informations',
      production: 'production manufacture fabrication',
      orders: 'commandes orders',
      invoices: 'facturation invoices factures',
      notifications: 'notifications alertes',
      security: 'sécurité securite',
      backup: 'sauvegardes backup',
      export: 'export exporter',
      history: 'journal historique history'
    };

    if (!searchTerm) return tabs;

    const term = searchTerm.toLowerCase();
    return tabs.filter(tab => {
      const label = tabLabels[tab.id] || tab.label;
      return label.toLowerCase().includes(term) || tab.label.toLowerCase().includes(term);
    });
  };

  const filteredTabs = getFilteredTabs();

  // ===== RENDER ACTIVE TAB =====
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'company': return renderCompany();
      case 'production': return renderProduction();
      case 'orders': return renderOrders();
      case 'invoices': return renderInvoices();
      case 'notifications': return renderNotifications();
      case 'security': return renderSecurity();
      case 'backup': return renderBackup();
      case 'export': return renderExport();
      case 'history': return renderHistory();
      default: return renderCompany();
    }
  };

  // ===== MAIN =====
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Toast */}
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
        isLoading={isSaving}
      />

      {/* Test Modal */}
      <TestModal
        isOpen={testModalConfig.isOpen}
        onClose={closeTestModal}
        onTest={testModalConfig.onTest}
        title={testModalConfig.title}
        description={testModalConfig.description}
        isLoading={isTesting}
      />

      {/* Main Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        title={modalConfig.title}
        description={modalConfig.description}
        isLoading={isSaving}
      >
        <div id="modal-form">
          {renderModalContent()}
        </div>
      </Modal>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B8863B]/10 text-[#B8863B]">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: FONT_HEADING }}>
                Paramètres
              </h1>
              <p className="text-sm text-[#6D6D6D]">Configurez entièrement votre plateforme L'arte ERP</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#F8F7F4] transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B8863B] text-white font-medium hover:bg-[#A07532] transition-all disabled:opacity-50"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            <Save size={18} />
            Sauvegarder tout
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE6DF] bg-white text-[#6D6D6D] font-medium hover:bg-[#F8F7F4] transition-all"
          >
            <RotateCcw size={18} />
            Restaurer
          </button>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex flex-wrap gap-1 border-b border-[#EAE6DF] mb-6 overflow-x-auto">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg whitespace-nowrap ${
                isActive
                  ? 'bg-[#B8863B] text-white'
                  : 'text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
          <input
            type="text"
            placeholder="Rechercher un paramètre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#EAE6DF] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-[#6D6D6D]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-[#EAE6DF] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B]"
          >
            <option value="all">Tous</option>
            <option value="entreprise">Entreprise</option>
            <option value="commandes">Commandes</option>
            <option value="production">Production</option>
            <option value="factures">Factures</option>
            <option value="notifications">Notifications</option>
          </select>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>

      
    </div>
  );
};

export default SettingsPage;