// src/pages/Reports/ReportsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import ExportButtons from '../../components/ExportButtons';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

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
// MOCK DATA
// ==========================================

const salesData = [
  { month: 'Jan', revenue: 85000, orders: 120, products: 340, profit: 23000, target: 90000 },
  { month: 'Feb', revenue: 92000, orders: 135, products: 380, profit: 28000, target: 95000 },
  { month: 'Mar', revenue: 105000, orders: 150, products: 420, profit: 33000, target: 100000 },
  { month: 'Apr', revenue: 98000, orders: 142, products: 400, profit: 29000, target: 105000 },
  { month: 'May', revenue: 112000, orders: 165, products: 450, profit: 36000, target: 110000 },
  { month: 'Jun', revenue: 125000, orders: 180, products: 490, profit: 43000, target: 115000 },
  { month: 'Jul', revenue: 118000, orders: 170, products: 470, profit: 39000, target: 120000 },
  { month: 'Aug', revenue: 135000, orders: 195, products: 520, profit: 48000, target: 125000 },
  { month: 'Sep', revenue: 142000, orders: 205, products: 550, profit: 51000, target: 130000 },
  { month: 'Oct', revenue: 155000, orders: 220, products: 580, profit: 58000, target: 140000 },
  { month: 'Nov', revenue: 148000, orders: 210, products: 560, profit: 54000, target: 145000 },
  { month: 'Dec', revenue: 160000, orders: 230, products: 600, profit: 62000, target: 150000 }
];

const orderStatusData = [
  { name: 'Terminées', value: 45, color: '#22C55E' },
  { name: 'En production', value: 28, color: '#3B82F6' },
  { name: 'En attente', value: 15, color: '#F59E0B' },
  { name: 'Annulées', value: 8, color: '#EF4444' },
  { name: 'Validées', value: 4, color: '#8B5CF6' }
];

const topProducts = [
  { id: 1, name: 'Gâteau Chocolat', sales: 320, revenue: 38400, growth: 15, category: 'Pâtisserie' },
  { id: 2, name: 'Tarte aux Fruits', sales: 280, revenue: 23800, growth: 12.5, category: 'Pâtisserie' },
  { id: 3, name: 'Éclair Vanille', sales: 240, revenue: 10800, growth: 8.3, category: 'Viennoiserie' },
  { id: 4, name: 'Croissant Beurre', sales: 210, revenue: 3150, growth: 5.7, category: 'Boulangerie' },
  { id: 5, name: 'Pain au Chocolat', sales: 180, revenue: 3240, growth: 3.2, category: 'Boulangerie' },
  { id: 6, name: 'Mille-Feuille', sales: 160, revenue: 19200, growth: 10.1, category: 'Pâtisserie' },
  { id: 7, name: 'Macaron', sales: 150, revenue: 12000, growth: 7.8, category: 'Confiserie' },
  { id: 8, name: 'Baguette', sales: 140, revenue: 980, growth: 2.4, category: 'Boulangerie' },
  { id: 9, name: 'Pain aux Raisins', sales: 130, revenue: 1950, growth: 4.6, category: 'Viennoiserie' },
  { id: 10, name: 'Tarte Tatin', sales: 120, revenue: 14400, growth: 6.9, category: 'Pâtisserie' }
];

const topCustomers = [
  { id: 1, name: 'Café Al Amir', orders: 120, revenue: 245000, growth: 18.5, city: 'Casablanca', phone: '+212 5XX-XXXX', email: 'contact@alamir.ma' },
  { id: 2, name: 'Pâtisserie Nour', orders: 98, revenue: 185000, growth: 14.2, city: 'Rabat', phone: '+212 5XX-XXXX', email: 'info@nour.ma' },
  { id: 3, name: 'Restaurant La Table', orders: 76, revenue: 132000, growth: 10.8, city: 'Marrakech', phone: '+212 5XX-XXXX', email: 'contact@latable.ma' },
  { id: 4, name: 'Snack City', orders: 68, revenue: 118000, growth: 7.3, city: 'Tanger', phone: '+212 5XX-XXXX', email: 'info@snackcity.ma' },
  { id: 5, name: 'Boissons du Maroc', orders: 55, revenue: 98000, growth: 5.6, city: 'Casablanca', phone: '+212 5XX-XXXX', email: 'contact@boissons.ma' }
];

const topCategories = [
  { name: 'Pâtisserie', sales: 850, revenue: 102000, growth: 20.3 },
  { name: 'Boulangerie', sales: 620, revenue: 48000, growth: 15.7 },
  { name: 'Viennoiserie', sales: 450, revenue: 36000, growth: 12.4 },
  { name: 'Confiserie', sales: 320, revenue: 28000, growth: 8.9 },
  { name: 'Boissons', sales: 180, revenue: 15000, growth: 5.2 }
];

const topSalesReps = [
  { name: 'Ahmed Benjelloun', orders: 145, revenue: 185000, growth: 15.6 },
  { name: 'Sara El Idrissi', orders: 132, revenue: 168000, growth: 12.3 },
  { name: 'Mohamed Amine', orders: 118, revenue: 142000, growth: 10.1 },
  { name: 'Karim Lahlou', orders: 105, revenue: 128000, growth: 8.8 },
  { name: 'Nadia Fassi', orders: 95, revenue: 115000, growth: 6.5 }
];

const recentActivities = [
  { id: 1, user: 'Ahmed Benjelloun', action: 'a exporté le rapport des ventes', time: 'Il y a 5 min', type: 'export' },
  { id: 2, user: 'Sara El Idrissi', action: 'a généré un rapport de production', time: 'Il y a 15 min', type: 'generate' },
  { id: 3, user: 'Mohamed Amine', action: 'a partagé le rapport financier', time: 'Il y a 30 min', type: 'share' },
  { id: 4, user: 'Karim Lahlou', action: 'a imprimé le rapport des commandes', time: 'Il y a 1h', type: 'print' },
  { id: 5, user: 'Nadia Fassi', action: 'a exporté le rapport des clients', time: 'Il y a 2h', type: 'export' }
];

const alerts = [
  { id: 1, type: 'warning', title: 'Produits en rupture de stock', description: '5 produits sont en dessous du stock minimum', time: 'Il y a 10 min' },
  { id: 2, type: 'danger', title: 'Factures impayées en retard', description: '3 factures sont en retard de paiement', time: 'Il y a 25 min' },
  { id: 3, type: 'warning', title: 'Commandes en retard de production', description: '2 commandes ont dépassé le délai de production', time: 'Il y a 45 min' },
  { id: 4, type: 'info', title: 'Livraisons en attente', description: '4 livraisons sont en attente d\'affectation', time: 'Il y a 1h' }
];

const productionData = [
  { day: 'Lun', produced: 120, target: 150, time: 4.2 },
  { day: 'Mar', produced: 135, target: 150, time: 4.5 },
  { day: 'Mer', produced: 142, target: 150, time: 4.8 },
  { day: 'Jeu', produced: 130, target: 150, time: 4.3 },
  { day: 'Ven', produced: 155, target: 150, time: 5.0 },
  { day: 'Sam', produced: 148, target: 150, time: 4.7 },
  { day: 'Dim', produced: 110, target: 150, time: 3.8 }
];

const deliveryStats = [
  { month: 'Jan', delivered: 105, delayed: 15 },
  { month: 'Fév', delivered: 120, delayed: 15 },
  { month: 'Mar', delivered: 138, delayed: 12 },
  { month: 'Avr', delivered: 130, delayed: 12 },
  { month: 'Mai', delivered: 150, delayed: 15 },
  { month: 'Jun', delivered: 165, delayed: 15 }
];

const yearlyComparison = [
  { month: 'Jan', year2024: 78000, year2025: 85000 },
  { month: 'Fév', year2024: 82000, year2025: 92000 },
  { month: 'Mar', year2024: 95000, year2025: 105000 },
  { month: 'Avr', year2024: 88000, year2025: 98000 },
  { month: 'Mai', year2024: 102000, year2025: 112000 },
  { month: 'Jun', year2024: 115000, year2025: 125000 }
];

// DONNÉES INITIALES AVEC ID UNIQUES
const initialOrdersData = [
  { id: 'CMD-001', client: 'Café Al Amir', salesRep: 'Ahmed Benjelloun', date: '15/07/2025', amount: 12500, status: 'Livrée', production: 'Terminée', delivery: 'Effectuée', productName: 'Gâteau Chocolat' },
  { id: 'CMD-002', client: 'Pâtisserie Nour', salesRep: 'Sara El Idrissi', date: '14/07/2025', amount: 8200, status: 'En production', production: 'En cours', delivery: 'En attente', productName: 'Éclair Vanille' },
  { id: 'CMD-003', client: 'Restaurant La Table', salesRep: 'Mohamed Amine', date: '14/07/2025', amount: 15400, status: 'Validée', production: 'Non démarrée', delivery: 'Non planifiée', productName: 'Tarte aux Fruits' },
  { id: 'CMD-004', client: 'Snack City', salesRep: 'Karim Lahlou', date: '13/07/2025', amount: 6300, status: 'En attente', production: 'Non démarrée', delivery: 'Non planifiée', productName: 'Croissant Beurre' },
  { id: 'CMD-005', client: 'Boissons du Maroc', salesRep: 'Nadia Fassi', date: '13/07/2025', amount: 9800, status: 'Prête', production: 'Terminée', delivery: 'En attente', productName: 'Mille-Feuille' }
];

const initialInvoicesList = [
  { id: 'FAC-001', client: 'Café Al Amir', date: '15/07/2025', amount: 12500, status: 'Payée' },
  { id: 'FAC-002', client: 'Pâtisserie Nour', date: '14/07/2025', amount: 8200, status: 'En attente' },
  { id: 'FAC-003', client: 'Restaurant La Table', date: '14/07/2025', amount: 15400, status: 'Impayée' },
  { id: 'FAC-004', client: 'Snack City', date: '13/07/2025', amount: 6300, status: 'Payée' },
  { id: 'FAC-005', client: 'Boissons du Maroc', date: '13/07/2025', amount: 9800, status: 'En attente' }
];

const initialDeliveriesList = [
  { id: 'LIV-001', client: 'Café Al Amir', address: '123, Rue Mohamed V, Casablanca', date: '15/07/2025', status: 'Effectuée', phone: '+212 5XX-XXXX', notes: 'Livrée avec succès' },
  { id: 'LIV-002', client: 'Pâtisserie Nour', address: '45, Avenue Hassan II, Rabat', date: '14/07/2025', status: 'En attente', phone: '+212 5XX-XXXX', notes: 'En attente de confirmation' },
  { id: 'LIV-003', client: 'Restaurant La Table', address: '78, Rue de la Liberté, Marrakech', date: '14/07/2025', status: 'Retard', phone: '+212 5XX-XXXX', notes: 'Retard dû à la circulation' },
  { id: 'LIV-004', client: 'Snack City', address: '12, Boulevard Moulay Youssef, Tanger', date: '13/07/2025', status: 'Effectuée', phone: '+212 5XX-XXXX', notes: 'Livrée avec succès' },
  { id: 'LIV-005', client: 'Boissons du Maroc', address: '34, Rue de Fès, Casablanca', date: '13/07/2025', status: 'En attente', phone: '+212 5XX-XXXX', notes: 'En attente de confirmation' }
];

const initialGeneratedReports = [
  { id: 1, name: 'Rapport des ventes - Juillet 2025', type: 'Ventes', period: 'Mensuel', createdBy: 'Admin', date: '15/07/2025', status: 'Généré', size: '2.4 MB' },
  { id: 2, name: 'Rapport des commandes - Juin 2025', type: 'Commandes', period: 'Mensuel', createdBy: 'Comptable', date: '12/07/2025', status: 'Généré', size: '1.8 MB' },
  { id: 3, name: 'Rapport de production - Semaine 28', type: 'Production', period: 'Hebdomadaire', createdBy: 'Manager', date: '10/07/2025', status: 'En cours', size: '0.5 MB' },
  { id: 4, name: 'Rapport financier - Trimestre 2', type: 'Financier', period: 'Trimestriel', createdBy: 'Admin', date: '08/07/2025', status: 'Généré', size: '3.2 MB' },
  { id: 5, name: 'Rapport des clients - Juin 2025', type: 'Clients', period: 'Mensuel', createdBy: 'Comptable', date: '05/07/2025', status: 'Généré', size: '1.2 MB' }
];

// ==========================================
// COMPOSANT: CONFIRM DIALOG
// ==========================================
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            {confirmText}
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
      className={`fixed top-4 right-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeConfig[type]}`}
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
  if (!isOpen || !order) return null;

  const productionDetails = {
    progress: 45,
    quantity: 100,
    produced: 45,
    remaining: 55,
    assignedTo: order.salesRep || 'Ahmed Benjelloun',
    startDate: order.date || '08/05/2025',
    status: order.status || 'En production',
    notes: 'Suspendue pour maintenance',
    productName: order.productName || 'Éclair Vanille',
    orderId: order.id || 'CMD-1256'
  };

  const statusColors = {
    'En production': 'bg-blue-50 text-blue-700 border-blue-200',
    'Suspendue': 'bg-amber-50 text-amber-700 border-amber-200',
    'Terminée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En attente': 'bg-gray-50 text-gray-600 border-gray-200',
    'Prête': 'bg-teal-50 text-teal-700 border-teal-200',
    'Livrée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Validée': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const statusIcons = {
    'En production': <Loader2 size={16} className="text-blue-500 animate-spin" />,
    'Suspendue': <PauseCircle size={16} className="text-amber-500" />,
    'Terminée': <CheckCircle size={16} className="text-emerald-500" />,
    'En attente': <Clock size={16} className="text-gray-500" />,
    'Prête': <CheckCircle size={16} className="text-teal-500" />,
    'Livrée': <CheckCircle size={16} className="text-emerald-500" />,
    'Validée': <CheckCircle size={16} className="text-purple-500" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                  <h2 className="text-xl font-bold text-[#3D2F24]">Détails de la production</h2>
                  <p className="text-sm text-[#6D6D6D]">{productionDetails.productName} - Commande {productionDetails.orderId}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
              <X size={20} className="text-[#6D6D6D]" />
            </button>
          </div>

          <div className="absolute -bottom-4 left-6 right-6 flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white ${statusColors[productionDetails.status] || statusColors['En attente']}`}>
              {statusIcons[productionDetails.status] || statusIcons['En attente']}
              <span className="text-sm font-semibold">{productionDetails.status}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white border-[#ECE8E1]">
              <span className="text-sm font-semibold text-[#3D2F24]">{productionDetails.progress}%</span>
              <span className="text-xs text-[#6D6D6D]">Progression</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm bg-white border-[#ECE8E1]">
              <Package size={16} className="text-[#B8863B]" />
              <span className="text-sm font-semibold text-[#3D2F24]">{productionDetails.quantity}</span>
              <span className="text-xs text-[#6D6D6D]">Quantité</span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-8">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-[#3D2F24]">Progression</span>
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
              <span>{productionDetails.produced} produits</span>
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
              <p className="text-xs text-[#6D6D6D] mb-1">Produit</p>
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
                const event = new CustomEvent('showToast', { detail: { message: '▶️ Production reprise avec succès', type: 'success' } });
                window.dispatchEvent(event);
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
  if (!isOpen || !delivery) return null;

  const statusColors = {
    'Effectuée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
    'Retard': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusIcons = {
    'Effectuée': <CheckCircle size={18} className="text-emerald-500" />,
    'En attente': <Clock size={18} className="text-amber-500" />,
    'Retard': <XCircle size={18} className="text-rose-500" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          {/* Statut */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusColors[delivery.status] || statusColors['En attente']} mb-6`}>
            {statusIcons[delivery.status] || statusIcons['En attente']}
            <span className="text-sm font-semibold">{delivery.status}</span>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Client</p>
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
              <p className="text-xs text-[#6D6D6D] mb-1">Date</p>
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
              <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <FileText size={14} className="text-[#6D6D6D]" />
                {delivery.notes || 'Aucune note'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-[#ECE8E1]">
            <button
              onClick={() => {
                onClose();
                const event = new CustomEvent('showToast', { detail: { message: `📄 Livraison ${delivery.id} exportée avec succès`, type: 'success' } });
                window.dispatchEvent(event);
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Télécharger le récépissé
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
  if (!isOpen || !invoice) return null;

  const statusColors = {
    'Payée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Impayée': 'bg-rose-50 text-rose-700 border-rose-200',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const statusIcons = {
    'Payée': <CheckCircle size={18} className="text-emerald-500" />,
    'Impayée': <XCircle size={18} className="text-rose-500" />,
    'En attente': <Clock size={18} className="text-amber-500" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusColors[invoice.status] || statusColors['En attente']} mb-6`}>
            {statusIcons[invoice.status] || statusIcons['En attente']}
            <span className="text-sm font-semibold">{invoice.status}</span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Client</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <User size={14} className="text-[#6D6D6D]" />
                {invoice.client}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Date</p>
              <p className="font-semibold text-[#3D2F24] flex items-center gap-2">
                <Calendar size={14} className="text-[#6D6D6D]" />
                {invoice.date}
              </p>
            </div>

            <div className="bg-[#F8F7F4] rounded-xl p-4">
              <p className="text-xs text-[#6D6D6D] mb-1">Montant</p>
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
                const event = new CustomEvent('showToast', { detail: { message: `📄 Facture ${invoice.id} exportée avec succès`, type: 'success' } });
                window.dispatchEvent(event);
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Télécharger la facture
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
  const statusColors = {
    'Livrée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En production': 'bg-blue-50 text-blue-700 border-blue-200',
    'Validée': 'bg-purple-50 text-purple-700 border-purple-200',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
    'Prête': 'bg-teal-50 text-teal-700 border-teal-200',
    'Annulée': 'bg-rose-50 text-rose-700 border-rose-200'
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
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors['En attente']}`}>
          {order.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">Commercial</p>
          <p className="font-medium text-[#3D2F24]">{order.salesRep}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">Date</p>
          <p className="font-medium text-[#3D2F24]">{order.date}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">Montant</p>
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
          title="Voir"
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(order)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title="Exporter"
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(order)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title="Supprimer"
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
  const statusColors = {
    'Payée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Impayée': 'bg-rose-50 text-rose-700 border-rose-200',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200'
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
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[invoice.status] || statusColors['En attente']}`}>
          {invoice.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">Date</p>
          <p className="font-medium text-[#3D2F24]">{invoice.date}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">Montant</p>
          <p className="font-medium text-[#3D2F24]">{invoice.amount.toLocaleString()} {CURRENCY}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#ECE8E1] flex items-center gap-1 justify-end">
        <button
          onClick={() => onView && onView(invoice)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title="Voir"
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(invoice)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title="Exporter"
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(invoice)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title="Supprimer"
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
  const statusColors = {
    'Effectuée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
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
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[delivery.status] || statusColors['En attente']}`}>
          {delivery.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
        <div>
          <p className="text-[#6D6D6D]">Adresse</p>
          <p className="font-medium text-[#3D2F24] truncate">{delivery.address}</p>
        </div>
        <div>
          <p className="text-[#6D6D6D]">Date</p>
          <p className="font-medium text-[#3D2F24]">{delivery.date}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#ECE8E1] flex items-center gap-1 justify-end">
        <button
          onClick={() => onView && onView(delivery)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title="Voir"
        >
          <Eye size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onExport && onExport(delivery)}
          className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          title="Exporter"
        >
          <Download size={15} className="text-[#6D6D6D]" />
        </button>
        <button
          onClick={() => onDelete && onDelete(delivery)}
          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
          title="Supprimer"
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
  const typeColors = {
    Ventes: 'bg-blue-50 text-blue-700 border-blue-200',
    Commandes: 'bg-purple-50 text-purple-700 border-purple-200',
    Production: 'bg-amber-50 text-amber-700 border-amber-200',
    Financier: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Clients: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Produits: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusColors = {
    'Généré': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En cours': 'bg-amber-50 text-amber-700 border-amber-200',
    'En attente': 'bg-gray-50 text-gray-600 border-gray-200',
    'Erreur': 'bg-red-50 text-red-700 border-red-200'
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
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[report.status] || statusColors['En attente']}`}>
              {report.status}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-[#3D2F24] mt-2 truncate">{report.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#6D6D6D] flex-wrap">
            <span>Période: {report.period}</span>
            <span>•</span>
            <span>Créé par: {report.createdBy}</span>
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
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDownload && onDownload(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Télécharger"
          >
            <Download size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onPrint && onPrint(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Imprimer"
          >
            <Printer size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onShare && onShare(report)}
            className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Partager"
          >
            <Share2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete && onDelete(report)}
            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
            title="Supprimer"
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
  const [localFilters, setLocalFilters] = useState(filters);

  const filterGroups = [
    {
      title: 'Période',
      fields: [
        { key: 'period', type: 'select', options: ['Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Cette année', 'Période personnalisée'] }
      ]
    },
    {
      title: 'Client',
      fields: [
        { key: 'client', type: 'text', placeholder: 'Rechercher un client...' }
      ]
    },
    {
      title: 'Commercial',
      fields: [
        { key: 'salesRep', type: 'select', options: ['Tous', 'Ahmed Benjelloun', 'Sara El Idrissi', 'Mohamed Amine', 'Karim Lahlou', 'Nadia Fassi'] }
      ]
    },
    {
      title: 'Statut',
      fields: [
        { key: 'status', type: 'select', options: ['Tous', 'En attente', 'Validée', 'En production', 'Prête', 'Livrée', 'Annulée'] }
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
              Filtres avancés
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-[#6D6D6D] hover:text-[#3D2F24] transition-colors border border-[#ECE8E1] rounded-lg"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-xs bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors"
              >
                Appliquer
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
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3D2F24]">Évolution des ventes</h3>
          <p className="text-xs text-[#6D6D6D]">Chiffre d'affaires et nombre de commandes</p>
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
                if (name === 'Revenue') return [`${value.toLocaleString()} ${CURRENCY}`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#B8863B" fillOpacity={0.8} name="Revenue" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Orders"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const OrderStatusChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition des commandes</h3>
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
  const top10 = data.slice(0, 10);
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Top Produits</h3>
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
              formatter={(value) => [`${value} unités`, '']}
            />
            <Bar dataKey="sales" fill="#B8863B" radius={[0, 4, 4, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MonthlyRevenueChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Chiffre d'affaires mensuel</h3>
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
              name="Revenue"
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
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Production Journalière</h3>
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
            <Bar yAxisId="left" dataKey="produced" fill="#22C55E" name="Produits" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Objectif" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DeliveryChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Livraisons</h3>
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
            <Bar dataKey="delivered" stackId="a" fill="#22C55E" name="Livrées" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delayed" stackId="a" fill="#EF4444" name="Retardées" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SalesRepChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Performance Commerciaux</h3>
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  
  // États pour les données dynamiques
  const [ordersData, setOrdersData] = useState(initialOrdersData);
  const [invoicesList, setInvoicesList] = useState(initialInvoicesList);
  const [deliveriesList, setDeliveriesList] = useState(initialDeliveriesList);
  const [generatedReports, setGeneratedReports] = useState(initialGeneratedReports);
  
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
  // FILTRAGE DES DONNÉES
  // ==========================================
  const getFilteredData = useCallback((period) => {
    switch (period) {
      case 'today':
        return salesData.slice(-1);
      case 'week':
        return salesData.slice(-7);
      case 'month':
        return salesData;
      case 'year':
        return salesData;
      default:
        return salesData;
    }
  }, []);

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================
  const kpis = useMemo(() => {
    const filteredData = getFilteredData(dateRange);
    const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = filteredData.reduce((sum, d) => sum + d.orders, 0);
    const totalProducts = filteredData.reduce((sum, d) => sum + d.products, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    let monthlyGrowth = 0;
    if (filteredData.length >= 2) {
      const last = filteredData[filteredData.length - 1];
      const prev = filteredData[filteredData.length - 2];
      monthlyGrowth = prev.revenue > 0 ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    }
    
    const totalInvoices = 763;
    const totalDeliveries = 842;
    const inProduction = orderStatusData.find(d => d.name === 'En production')?.value || 0;
    const pendingOrders = orderStatusData.find(d => d.name === 'En attente')?.value || 0;
    const totalCustomers = 1356;

    const revenueTrend = filteredData.map(d => ({ value: d.revenue }));
    const orderTrend = filteredData.map(d => ({ value: d.orders }));
    const productTrend = filteredData.map(d => ({ value: d.products }));

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
  }, [dateRange, getFilteredData]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const exportColumns = [
    { label: 'ID', accessor: 'id', width: 10 },
    { label: 'Client', accessor: 'client', width: 20 },
    { label: 'Commercial', accessor: 'salesRep', width: 18 },
    { label: 'Date', accessor: 'date', width: 12 },
    { label: 'Montant', accessor: 'amount', width: 15 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Production', accessor: 'production', width: 14 },
    { label: 'Livraison', accessor: 'delivery', width: 14 }
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
    { label: 'Total commandes', value: ordersData.length },
    { label: 'Montant total', value: `${ordersData.reduce((sum, o) => sum + o.amount, 0).toLocaleString()} ${CURRENCY}` },
    { label: 'Statut : Livrées', value: ordersData.filter(o => o.status === 'Livrée').length },
    { label: 'Statut : En production', value: ordersData.filter(o => o.status === 'En production').length },
    { label: 'Statut : En attente', value: ordersData.filter(o => o.status === 'En attente').length }
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

  // ==========================================
  // HANDLERS - TOAST
  // ==========================================
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // ==========================================
  // HANDLERS - CONFIRM DIALOG
  // ==========================================
  const showConfirm = (title, description, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog({ isOpen: false, title: '', description: '', onConfirm: null });
  };

  // ==========================================
  // HANDLERS - ACTIONS GÉNÉRALES
  // ==========================================
  const handleExportPDF = () => {
    showToast('📄 Rapport exporté en PDF avec succès', 'success');
  };

  const handleExportExcel = () => {
    showToast('📊 Rapport exporté en Excel avec succès', 'success');
  };

  const handlePrint = () => {
    window.print();
    showToast('🖨️ Impression en cours...', 'info');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('🔄 Données actualisées avec succès', 'success');
    }, 800);
  };

  const handleShare = () => {
    showToast('🔗 Lien de partage copié dans le presse-papier', 'success');
  };

  // ==========================================
  // HANDLERS - SUPPRESSION RÉELLE
  // ==========================================
  
  const handleDeleteOrder = (order) => {
    showConfirm(
      'Supprimer la commande',
      `Êtes-vous sûr de vouloir supprimer la commande ${order.id} ? Cette action est irréversible.`,
      () => {
        setOrdersData(prev => prev.filter(item => item.id !== order.id));
        showToast(`🗑️ Commande ${order.id} supprimée avec succès`, 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteInvoice = (invoice) => {
    showConfirm(
      'Supprimer la facture',
      `Êtes-vous sûr de vouloir supprimer la facture ${invoice.id} ? Cette action est irréversible.`,
      () => {
        setInvoicesList(prev => prev.filter(item => item.id !== invoice.id));
        showToast(`🗑️ Facture ${invoice.id} supprimée avec succès`, 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteDelivery = (delivery) => {
    showConfirm(
      'Supprimer la livraison',
      `Êtes-vous sûr de vouloir supprimer la livraison ${delivery.id} ? Cette action est irréversible.`,
      () => {
        setDeliveriesList(prev => prev.filter(item => item.id !== delivery.id));
        showToast(`🗑️ Livraison ${delivery.id} supprimée avec succès`, 'success');
        hideConfirm();
      }
    );
  };

  const handleDeleteReport = (report) => {
    showConfirm(
      'Supprimer le rapport',
      `Êtes-vous sûr de vouloir supprimer le rapport "${report.name}" ? Cette action est irréversible.`,
      () => {
        setGeneratedReports(prev => prev.filter(item => item.id !== report.id));
        showToast(`🗑️ Rapport "${report.name}" supprimé avec succès`, 'success');
        hideConfirm();
      }
    );
  };

  // ==========================================
  // HANDLERS - ACTIONS "VOIR" AVEC MODALS
  // ==========================================
  
  // Commande → Production Modal
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsProductionModalOpen(true);
  };

  // Facture → Invoice Detail Modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  // Livraison → Delivery Detail Modal
  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setIsDeliveryModalOpen(true);
  };

  // Rapport → View Report (avec toast pour l'instant)
  const handleViewReport = (report) => {
    setSelectedReport(report);
    showToast(`👁️ Consultation du rapport "${report.name}"`, 'info');
  };

  // ==========================================
  // HANDLERS - ACTIONS "TÉLÉCHARGER"
  // ==========================================
  
  const handleExportOrder = (order) => {
    showToast(`📄 Commande ${order.id} exportée avec succès`, 'success');
  };

  const handleExportInvoice = (invoice) => {
    showToast(`📄 Facture ${invoice.id} exportée avec succès`, 'success');
  };

  const handleExportDelivery = (delivery) => {
    showToast(`📄 Livraison ${delivery.id} exportée avec succès`, 'success');
  };

  const handleDownloadReport = (report) => {
    showToast(`📥 Téléchargement du rapport "${report.name}" en cours...`, 'info');
    setTimeout(() => {
      showToast(`📄 Rapport "${report.name}" téléchargé avec succès`, 'success');
    }, 1000);
  };

  // ==========================================
  // HANDLERS - AUTRES ACTIONS
  // ==========================================
  
  const handlePrintReport = (report) => {
    showToast(`🖨️ Impression du rapport "${report.name}"...`, 'info');
  };

  const handleShareReport = (report) => {
    showToast(`🔗 Rapport "${report.name}" partagé avec succès`, 'success');
  };

  const handleDismissAlert = (alertId) => {
    showToast(`🔔 Alerte ${alertId} marquée comme lue`, 'info');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange('month');
    setFilters({});
    showToast('🔄 Filtres réinitialisés avec succès', 'success');
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    showToast(`📅 Période changée : ${e.target.options[e.target.selectedIndex].text}`, 'info');
  };

  // ==========================================
  // TABS
  // ==========================================
  const tabs = [
    { id: 'overview', label: 'Vue Générale', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
    { id: 'sales', label: 'Ventes', icon: TrendingUp },
    { id: 'production', label: 'Production', icon: FactoryIcon },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'deliveries', label: 'Livraisons', icon: TruckIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Rapports', icon: FileIcon }
  ];

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <KPICard 
          icon={DollarSign} 
          title="Chiffre d'affaires" 
          value={kpis.totalRevenue} 
          change={kpis.monthlyGrowth} 
          color="gold" 
          isCurrency 
          miniData={kpis.revenueTrend}
          miniColor="#B8863B"
        />
        <KPICard 
          icon={ShoppingBag} 
          title="Total commandes" 
          value={kpis.totalOrders} 
          change={8.10} 
          color="blue"
          miniData={kpis.orderTrend}
          miniColor="#3B82F6"
        />
        <KPICard 
          icon={Package} 
          title="Produits" 
          value={kpis.totalProducts} 
          change={5.30} 
          color="purple"
          miniData={kpis.productTrend}
          miniColor="#8B5CF6"
        />
        <KPICard 
          icon={Users} 
          title="Clients" 
          value={kpis.totalCustomers} 
          change={9.20} 
          color="green"
        />
        <KPICard 
          icon={TrendingUp} 
          title="Croissance" 
          value={formatPercentage(kpis.monthlyGrowth)} 
          change={kpis.monthlyGrowth} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={FileText} title="Factures" value={kpis.totalInvoices} change={4.70} color="teal" />
        <KPICard icon={TruckIcon} title="Livraisons" value={kpis.totalDeliveries} change={6.80} color="cyan" />
        <KPICard icon={FactoryIcon} title="En production" value={kpis.inProduction} change={-2.40} color="amber" />
        <KPICard icon={Clock} title="En attente" value={kpis.pendingOrders} change={-5.90} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={getFilteredData(dateRange)} />
        <OrderStatusChart data={orderStatusData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart data={getFilteredData(dateRange)} />
        <TopProductsChart data={topProducts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <TopListCard 
          title="Top Clients" 
          items={topCustomers.map(c => ({ ...c, value: c.revenue }))} 
          valueLabel="Revenue" 
          icon={Users} 
          valueKey="revenue"
        />
        <TopListCard 
          title="Top Produits" 
          items={topProducts.map(c => ({ ...c, value: c.sales }))} 
          valueLabel="Ventes" 
          icon={Package} 
          valueKey="sales"
        />
        <TopListCard 
          title="Top Catégories" 
          items={topCategories.map(c => ({ ...c, value: c.sales }))} 
          valueLabel="Ventes" 
          icon={Layers} 
          valueKey="sales"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Activité récente</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Alertes</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderOrders = () => {
    const paidCount = ordersData.filter(o => o.status === 'Livrée').length;
    const pending = ordersData.filter(o => o.status === 'En attente').length;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={ShoppingBag} title="Total Commandes" value={ordersData.length} change={8.10} color="blue" />
          <KPICard icon={Clock} title="En attente" value={pending} change={-5.90} color="amber" />
          <KPICard icon={CheckCircle} title="Terminées" value={paidCount} change={5.20} color="green" />
          <KPICard icon={DollarSign} title="Panier Moyen" value={kpis.avgOrderValue} change={3.80} color="gold" isCurrency />
        </div>
        {ordersData.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Package size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">Aucune commande</h3>
            <p className="text-sm text-[#6D6D6D]">Toutes les commandes ont été supprimées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordersData.map((order) => (
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
        <KPICard icon={DollarSign} title="Chiffre d'affaires" value={kpis.totalRevenue} change={kpis.monthlyGrowth} color="gold" isCurrency />
        <KPICard icon={TrendingUp} title="Croissance" value={formatPercentage(kpis.monthlyGrowth)} change={kpis.monthlyGrowth} color="indigo" />
        <KPICard icon={ShoppingBag} title="Commandes" value={kpis.totalOrders} change={8.10} color="blue" />
        <KPICard icon={Users} title="Clients" value={kpis.totalCustomers} change={9.20} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={getFilteredData(dateRange)} />
        <MonthlyRevenueChart data={getFilteredData(dateRange)} />
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
        <KPICard icon={FactoryIcon} title="En production" value={kpis.inProduction} change={-2.40} color="amber" />
        <KPICard icon={CheckCircle} title="Terminées" value={orderStatusData.find(d => d.name === 'Terminées')?.value || 0} change={5.20} color="green" />
        <KPICard icon={Timer} title="Temps moyen" value="4.5h" change={-3.10} color="blue" />
        <KPICard icon={Award} title="Rendement" value="94%" change={2.80} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductionChart data={productionData} />
        <OrderStatusChart data={orderStatusData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TopListCard title="Top Produits" items={topProducts.map(c => ({ ...c, value: c.sales }))} valueLabel="Produits" icon={Package} valueKey="sales" />
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Production Journalière</h3>
          <div className="space-y-2">
            {productionData.map((day, idx) => (
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
            {alerts.filter(a => a.type === 'danger' || a.type === 'warning').slice(0, 3).map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Package} title="Total Produits" value={topProducts.length} change={5.30} color="purple" />
          <KPICard icon={TrendingUp} title="Top Ventes" value={topProducts[0]?.sales || 0} change={15.20} color="gold" />
          <KPICard icon={AlertCircle} title="Rupture de stock" value="5" change={-10.40} color="rose" />
          <KPICard icon={CheckCircle} title="Disponibles" value="52" change={8.90} color="green" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopProductsChart data={topProducts} />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition par Catégorie</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={topCategories}
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
                    {topCategories.map((entry, index) => (
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
          {topProducts.map((product, idx) => (
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
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Users} title="Total Clients" value={kpis.totalCustomers} change={9.20} color="green" />
          <KPICard icon={User} title="Nouveaux" value="24" change={15.80} color="blue" />
          <KPICard icon={Award} title="Fidélité" value="76%" change={5.60} color="purple" />
          <KPICard icon={Star} title="Top Client" value={topCustomers[0]?.name || '-'} change={0} color="gold" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopListCard title="Top Clients" items={topCustomers.map(c => ({ ...c, value: c.revenue }))} valueLabel="Revenue" icon={Users} valueKey="revenue" />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition par Ville</h3>
            <div className="space-y-3">
              {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'].map((city, idx) => {
                const count = topCustomers.filter(c => c.city === city).length;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-[#6D6D6D] w-24">{city}</span>
                    <div className="flex-1 h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8863B] rounded-full" style={{ width: `${(count / topCustomers.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-[#6D6D6D]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCustomers.map((customer, idx) => (
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
    const paidCount = invoicesList.filter(i => i.status === 'Payée').length;
    const unpaidCount = invoicesList.filter(i => i.status === 'Impayée').length;
    const pendingCount = invoicesList.filter(i => i.status === 'En attente').length;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={CreditCard} title="Total Factures" value={invoicesList.length} change={4.70} color="teal" />
          <KPICard icon={CheckCircle} title="Payées" value={paidCount} change={6.20} color="green" />
          <KPICard icon={XCircle} title="Impayées" value={unpaidCount} change={-3.80} color="rose" />
          <KPICard icon={Clock} title="En attente" value={pendingCount} change={2.40} color="amber" />
        </div>
        {invoicesList.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileText size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">Aucune facture</h3>
            <p className="text-sm text-[#6D6D6D]">Toutes les factures ont été supprimées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoicesList.map((invoice) => (
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
    const deliveredCount = deliveriesList.filter(d => d.status === 'Effectuée').length;
    const pendingCount = deliveriesList.filter(d => d.status === 'En attente').length;
    const delayedCount = deliveriesList.filter(d => d.status === 'Retard').length;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPICard icon={Truck} title="Total Livraisons" value={deliveriesList.length} change={6.80} color="cyan" />
          <KPICard icon={CheckCircle} title="Effectuées" value={deliveredCount} change={8.30} color="green" />
          <KPICard icon={Clock} title="En attente" value={pendingCount} change={-2.60} color="amber" />
          <KPICard icon={AlertCircle} title="Retard" value={delayedCount} change={-5.70} color="rose" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DeliveryChart data={deliveryStats} />
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Statut des Livraisons</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>Effectuées</span>
                  <span>{deliveredCount} ({Math.round((deliveredCount / (deliveredCount + pendingCount + delayedCount)) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(deliveredCount / (deliveredCount + pendingCount + delayedCount)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>En attente</span>
                  <span>{pendingCount} ({Math.round((pendingCount / (deliveredCount + pendingCount + delayedCount)) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(pendingCount / (deliveredCount + pendingCount + delayedCount)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6D6D6D] mb-1">
                  <span>Retard</span>
                  <span>{delayedCount} ({Math.round((delayedCount / (deliveredCount + pendingCount + delayedCount)) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[#F8F7F4] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(delayedCount / (deliveredCount + pendingCount + delayedCount)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {deliveriesList.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Truck size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">Aucune livraison</h3>
            <p className="text-sm text-[#6D6D6D]">Toutes les livraisons ont été supprimées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveriesList.map((delivery) => (
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
        <SalesChart data={getFilteredData(dateRange)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart data={getFilteredData(dateRange)} />
        <OrderStatusChart data={orderStatusData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart data={productionData} />
        <SalesRepChart data={topSalesReps} />
      </div>
    </div>
  );

  const renderGeneratedReports = () => {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <Package size={16} className="text-[#6D6D6D]" />
            <span className="text-sm text-[#3D2F24]">{generatedReports.length} Rapports</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm text-[#3D2F24]">{generatedReports.filter(r => r.status === 'Généré').length} Générés</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#ECE8E1] rounded-lg px-3 py-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm text-[#3D2F24]">{generatedReports.filter(r => r.status === 'En cours' || r.status === 'En attente').length} En cours</span>
          </div>
        </div>
        {generatedReports.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <FileIcon size={48} className="text-[#D1CBC0] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3D2F24]">Aucun rapport</h3>
            <p className="text-sm text-[#6D6D6D]">Tous les rapports ont été supprimés</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {generatedReports.map(report => (
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

  if (isLoading) {
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
        confirmText="Supprimer"
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

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#6D6D6D] mb-1">
              <Home size={14} className="text-[#B8863B]" />
              <span className="text-[#B8863B]">/</span>
              <span>Rapports & Statistiques</span>
            </nav>
            <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              Rapports & Statistiques
            </h1>
            <p className="text-sm text-[#6D6D6D]">Analyse complète des performances de l'entreprise</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="pl-9 pr-8 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white appearance-none"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
                <option value="custom">Personnalisé</option>
              </select>
              <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <input
                type="text"
                placeholder="Rechercher..."
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
              title="Actualiser"
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
              title="Partager"
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