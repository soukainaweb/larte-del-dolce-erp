// src/pages/Analytics/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// IMPORTS LUCDIE REACT
// ==========================================
import {
  LayoutDashboard,
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
  Download,
  RefreshCw,
  Eye,
  Filter,
  Printer,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUp,
  ArrowDown,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Search,
  X,
  FileText as FileIcon,
  Share2,
  BarChart as BarChartIcon,
  ClipboardList,
  CreditCard,
  Truck as TruckIcon,
  Factory as FactoryIcon,
  Layers,
  Timer,
  Award,
  Star,
  Activity,
  Bell,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  ChevronDown as ChevronDownIcon,
  Home,
  FileDown,
  FileSpreadsheet as ExcelIcon,
  Trash2,
  AlertTriangle,
  Info,
  Loader2,
  Target,
  Radar as RadarIcon,
  UserPlus,
  UserX,
  ArrowUpDown,
  Sun,
  Cloud,
  Globe,
  Building,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  Receipt,
  Zap,
  Thermometer,
  Gauge,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon2,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon2,
  LineChart as LineChartIcon3,
  Radar as RadarIcon2
} from 'lucide-react';

// ==========================================
// IMPORTS RECHARTS
// ==========================================
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

import { useAuth } from '../../contexts/AuthContext';

// ==========================================
// ⭐ NOUVEAU : IMPORT EXPORT BUTTONS
// ==========================================
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

const formatCurrency = (value) => {
  if (value === undefined || value === null) return `0 ${CURRENCY}`;
  return `${Number(value).toLocaleString()} ${CURRENCY}`;
};

// ==========================================
// MOCK DATA
// ==========================================

// Données de ventes mensuelles
const monthlySalesData = [
  { month: 'Jan', revenue: 85000, orders: 120, profit: 23000, target: 90000 },
  { month: 'Fév', revenue: 92000, orders: 135, profit: 28000, target: 95000 },
  { month: 'Mar', revenue: 105000, orders: 150, profit: 33000, target: 100000 },
  { month: 'Avr', revenue: 98000, orders: 142, profit: 29000, target: 105000 },
  { month: 'Mai', revenue: 112000, orders: 165, profit: 36000, target: 110000 },
  { month: 'Jun', revenue: 125000, orders: 180, profit: 43000, target: 115000 },
  { month: 'Jul', revenue: 118000, orders: 170, profit: 39000, target: 120000 },
  { month: 'Aoû', revenue: 135000, orders: 195, profit: 48000, target: 125000 },
  { month: 'Sep', revenue: 142000, orders: 205, profit: 51000, target: 130000 },
  { month: 'Oct', revenue: 155000, orders: 220, profit: 58000, target: 140000 },
  { month: 'Nov', revenue: 148000, orders: 210, profit: 54000, target: 145000 },
  { month: 'Déc', revenue: 160000, orders: 230, profit: 62000, target: 150000 }
];

// Données de répartition des commandes
const orderStatusDistribution = [
  { name: 'Terminées', value: 45, color: '#22C55E' },
  { name: 'En production', value: 28, color: '#3B82F6' },
  { name: 'En attente', value: 15, color: '#F59E0B' },
  { name: 'Annulées', value: 8, color: '#EF4444' },
  { name: 'Validées', value: 4, color: '#8B5CF6' }
];

// Top produits
const topProducts = [
  { id: 1, name: 'Gâteau Chocolat', sales: 320, revenue: 38400, growth: 15.2, category: 'Pâtisserie' },
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

// Top clients
const topClients = [
  { id: 1, name: 'Café Al Amir', orders: 120, revenue: 245000, growth: 18.5, city: 'Casablanca' },
  { id: 2, name: 'Pâtisserie Nour', orders: 98, revenue: 185000, growth: 14.2, city: 'Rabat' },
  { id: 3, name: 'Restaurant La Table', orders: 76, revenue: 132000, growth: 10.8, city: 'Marrakech' },
  { id: 4, name: 'Snack City', orders: 68, revenue: 118000, growth: 7.3, city: 'Tanger' },
  { id: 5, name: 'Boissons du Maroc', orders: 55, revenue: 98000, growth: 5.6, city: 'Casablanca' },
  { id: 6, name: 'Café Parisien', orders: 48, revenue: 87000, growth: 12.1, city: 'Rabat' },
  { id: 7, name: 'Boulangerie Moderne', orders: 42, revenue: 76000, growth: 8.9, city: 'Fès' },
  { id: 8, name: 'Traiteur Elite', orders: 38, revenue: 69000, growth: 6.4, city: 'Casablanca' },
  { id: 9, name: 'Pâtisserie Douceur', orders: 35, revenue: 62000, growth: 4.7, city: 'Marrakech' },
  { id: 10, name: 'Restaurant Gourmet', orders: 32, revenue: 58000, growth: 9.2, city: 'Tanger' }
];

// Top catégories
const topCategories = [
  { name: 'Pâtisserie', sales: 850, revenue: 102000, growth: 20.3 },
  { name: 'Boulangerie', sales: 620, revenue: 48000, growth: 15.7 },
  { name: 'Viennoiserie', sales: 450, revenue: 36000, growth: 12.4 },
  { name: 'Confiserie', sales: 320, revenue: 28000, growth: 8.9 },
  { name: 'Boissons', sales: 180, revenue: 15000, growth: 5.2 }
];

// Top commerciaux
const topSalesReps = [
  { name: 'Ahmed Benjelloun', orders: 145, revenue: 185000, growth: 15.6 },
  { name: 'Sara El Idrissi', orders: 132, revenue: 168000, growth: 12.3 },
  { name: 'Mohamed Amine', orders: 118, revenue: 142000, growth: 10.1 },
  { name: 'Karim Lahlou', orders: 105, revenue: 128000, growth: 8.8 },
  { name: 'Nadia Fassi', orders: 95, revenue: 115000, growth: 6.5 }
];

// Données de production
const productionDaily = [
  { day: 'Lun', produced: 120, target: 150, time: 4.2 },
  { day: 'Mar', produced: 135, target: 150, time: 4.5 },
  { day: 'Mer', produced: 142, target: 150, time: 4.8 },
  { day: 'Jeu', produced: 130, target: 150, time: 4.3 },
  { day: 'Ven', produced: 155, target: 150, time: 5.0 },
  { day: 'Sam', produced: 148, target: 150, time: 4.7 },
  { day: 'Dim', produced: 110, target: 150, time: 3.8 }
];

// Données de livraison
const deliveryStats = [
  { month: 'Jan', delivered: 105, delayed: 15, onTime: 90 },
  { month: 'Fév', delivered: 120, delayed: 15, onTime: 105 },
  { month: 'Mar', delivered: 138, delayed: 12, onTime: 126 },
  { month: 'Avr', delivered: 130, delayed: 12, onTime: 118 },
  { month: 'Mai', delivered: 150, delayed: 15, onTime: 135 },
  { month: 'Jun', delivered: 165, delayed: 15, onTime: 150 },
  { month: 'Jul', delivered: 155, delayed: 15, onTime: 140 },
  { month: 'Aoû', delivered: 180, delayed: 15, onTime: 165 },
  { month: 'Sep', delivered: 190, delayed: 15, onTime: 175 },
  { month: 'Oct', delivered: 205, delayed: 15, onTime: 190 },
  { month: 'Nov', delivered: 195, delayed: 15, onTime: 180 },
  { month: 'Déc', delivered: 215, delayed: 15, onTime: 200 }
];

// Données financières
const financialData = [
  { month: 'Jan', revenue: 85000, expenses: 45000, profit: 40000 },
  { month: 'Fév', revenue: 92000, expenses: 48000, profit: 44000 },
  { month: 'Mar', revenue: 105000, expenses: 52000, profit: 53000 },
  { month: 'Avr', revenue: 98000, expenses: 50000, profit: 48000 },
  { month: 'Mai', revenue: 112000, expenses: 55000, profit: 57000 },
  { month: 'Jun', revenue: 125000, expenses: 60000, profit: 65000 },
  { month: 'Jul', revenue: 118000, expenses: 58000, profit: 60000 },
  { month: 'Aoû', revenue: 135000, expenses: 65000, profit: 70000 },
  { month: 'Sep', revenue: 142000, expenses: 68000, profit: 74000 },
  { month: 'Oct', revenue: 155000, expenses: 72000, profit: 83000 },
  { month: 'Nov', revenue: 148000, expenses: 70000, profit: 78000 },
  { month: 'Déc', revenue: 160000, expenses: 75000, profit: 85000 }
];

// Données de comparaison annuelle
const yearlyComparison = [
  { month: 'Jan', year2024: 78000, year2025: 85000 },
  { month: 'Fév', year2024: 82000, year2025: 92000 },
  { month: 'Mar', year2024: 95000, year2025: 105000 },
  { month: 'Avr', year2024: 88000, year2025: 98000 },
  { month: 'Mai', year2024: 102000, year2025: 112000 },
  { month: 'Jun', year2024: 115000, year2025: 125000 },
  { month: 'Jul', year2024: 108000, year2025: 118000 },
  { month: 'Aoû', year2024: 125000, year2025: 135000 },
  { month: 'Sep', year2024: 132000, year2025: 142000 },
  { month: 'Oct', year2024: 145000, year2025: 155000 },
  { month: 'Nov', year2024: 138000, year2025: 148000 },
  { month: 'Déc', year2024: 150000, year2025: 160000 }
];

// Activités récentes
const recentActivities = [
  { id: 1, user: 'Ahmed Benjelloun', action: 'a créé une nouvelle commande', time: 'Il y a 2 min', type: 'order' },
  { id: 2, user: 'Sara El Idrissi', action: 'a validé une commande', time: 'Il y a 5 min', type: 'validate' },
  { id: 3, user: 'Mohamed Amine', action: 'a terminé la production', time: 'Il y a 10 min', type: 'production' },
  { id: 4, user: 'Karim Lahlou', action: 'a effectué une livraison', time: 'Il y a 15 min', type: 'delivery' },
  { id: 5, user: 'Nadia Fassi', action: 'a généré une facture', time: 'Il y a 20 min', type: 'invoice' },
  { id: 6, user: 'Admin', action: 'a reçu un paiement', time: 'Il y a 30 min', type: 'payment' }
];

// Alertes
const alerts = [
  { id: 1, type: 'warning', title: 'Produits en rupture de stock', description: '5 produits sont en dessous du stock minimum', time: 'Il y a 10 min' },
  { id: 2, type: 'danger', title: 'Factures impayées en retard', description: '3 factures sont en retard de paiement', time: 'Il y a 25 min' },
  { id: 3, type: 'warning', title: 'Commandes en retard de production', description: '2 commandes ont dépassé le délai de production', time: 'Il y a 45 min' },
  { id: 4, type: 'info', title: 'Livraisons en attente', description: '4 livraisons sont en attente d\'affectation', time: 'Il y a 1h' },
  { id: 5, type: 'danger', title: 'Production bloquée', description: 'La ligne de production n°2 est en panne', time: 'Il y a 2h' },
  { id: 6, type: 'warning', title: 'Stock critique', description: 'Farine : niveau critique (5% restant)', time: 'Il y a 3h' }
];

// Données de prévision
const forecastData = [
  { month: 'Jan', actual: 85000, forecast: 82000 },
  { month: 'Fév', actual: 92000, forecast: 88000 },
  { month: 'Mar', actual: 105000, forecast: 100000 },
  { month: 'Avr', actual: 98000, forecast: 95000 },
  { month: 'Mai', actual: 112000, forecast: 108000 },
  { month: 'Jun', actual: 125000, forecast: 120000 },
  { month: 'Jul', actual: 118000, forecast: 115000 },
  { month: 'Aoû', actual: 135000, forecast: 130000 },
  { month: 'Sep', actual: 142000, forecast: 138000 },
  { month: 'Oct', actual: 155000, forecast: 150000 },
  { month: 'Nov', actual: 148000, forecast: 145000 },
  { month: 'Déc', actual: 160000, forecast: 155000 }
];

// Données de vente par région
const salesByRegion = [
  { region: 'Casablanca', revenue: 420000, orders: 380, growth: 12.5 },
  { region: 'Rabat', revenue: 280000, orders: 250, growth: 10.2 },
  { region: 'Marrakech', revenue: 220000, orders: 200, growth: 8.7 },
  { region: 'Tanger', revenue: 180000, orders: 165, growth: 6.3 },
  { region: 'Fès', revenue: 150000, orders: 135, growth: 4.8 }
];

// Données radar
const radarData = [
  { subject: 'Ventes', A: 120, B: 110, fullMark: 150 },
  { subject: 'Production', A: 98, B: 130, fullMark: 150 },
  { subject: 'Livraison', A: 86, B: 130, fullMark: 150 },
  { subject: 'Qualité', A: 99, B: 100, fullMark: 150 },
  { subject: 'Satisfaction', A: 85, B: 90, fullMark: 150 },
  { subject: 'Performance', A: 65, B: 85, fullMark: 150 }
];

// Données de comparaison des KPI
const kpiComparisonData = [
  { indicator: 'Chiffre d\'affaires', current: 160000, previous: 150000, target: 155000, growth: 6.7 },
  { indicator: 'Commandes', current: 230, previous: 215, target: 220, growth: 7.0 },
  { indicator: 'Clients', current: 1356, previous: 1240, target: 1300, growth: 9.4 },
  { indicator: 'Produits vendus', current: 600, previous: 550, target: 580, growth: 9.1 },
  { indicator: 'Profit', current: 62000, previous: 54000, target: 58000, growth: 14.8 },
  { indicator: 'Livraisons', current: 215, previous: 195, target: 210, growth: 10.3 }
];

// ==========================================
// COMPOSANTS UI
// ==========================================

// Skeleton Loading
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#F8F7F4] to-[#EDEAE4] rounded-lg ${className}`} />
);

// Toast Notification
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
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, change, color, isCurrency, subtitle, miniData, miniColor, compareText }) => {
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
        {compareText && <p className="text-[10px] text-[#6D6D6D] mt-0.5">{compareText}</p>}
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
// COMPOSANT: FILTRES AVANCÉS
// ==========================================
const AdvancedFilters = ({ isOpen, onClose, filters, setFilters, onReset, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const quickPeriods = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'yesterday', label: 'Hier' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' },
    { id: 'custom', label: 'Personnalisé' }
  ];

  const filterGroups = [
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
      title: 'Produit',
      fields: [
        { key: 'product', type: 'text', placeholder: 'Rechercher un produit...' }
      ]
    },
    {
      title: 'Catégorie',
      fields: [
        { key: 'category', type: 'select', options: ['Toutes', 'Pâtisserie', 'Boulangerie', 'Viennoiserie', 'Confiserie', 'Boissons'] }
      ]
    },
    {
      title: 'Ville',
      fields: [
        { key: 'city', type: 'select', options: ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'] }
      ]
    },
    {
      title: 'Statut',
      fields: [
        { key: 'status', type: 'select', options: ['Tous', 'En attente', 'Validée', 'En production', 'Prête', 'Livrée', 'Annulée'] }
      ]
    },
    {
      title: 'Paiement',
      fields: [
        { key: 'payment', type: 'select', options: ['Tous', 'Payé', 'Impayé', 'En attente'] }
      ]
    },
    {
      title: 'Production',
      fields: [
        { key: 'production', type: 'select', options: ['Toutes', 'Terminée', 'En cours', 'Non démarrée'] }
      ]
    }
  ];

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    setLocalFilters(prev => ({ ...prev, period: periodId }));
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
    setSelectedPeriod('month');
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
              <FilterIcon size={18} className="text-[#B8863B]" />
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

          {/* Périodes rapides */}
          <div className="mb-4 flex flex-wrap gap-2">
            {quickPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => handlePeriodChange(period.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-[#B8863B] text-white'
                    : 'bg-[#F8F7F4] text-[#6D6D6D] hover:bg-[#EDEAE4]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Filtres */}
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
// COMPOSANT: COMPARAISON CARD
// ==========================================
const ComparisonCard = ({ title, current, previous, change, icon: Icon, color }) => {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    gold: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#3D2F24]">{title}</p>
          <div className="flex items-center gap-4 mt-1">
            <div>
              <p className="text-xs text-[#6D6D6D]">Actuel</p>
              <p className="text-sm font-bold text-[#3D2F24]">{current}</p>
            </div>
            <div>
              <p className="text-xs text-[#6D6D6D]">Précédent</p>
              <p className="text-sm font-bold text-[#6D6D6D]">{previous}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(change).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CHARTES
// ==========================================

// Line Chart
const CustomLineChart = ({ data, lines, xKey, title, subtitle, height = 300 }) => {
  const colors = ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'];

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6D6D6D]">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              formatter={(value) => typeof value === 'number' ? `${value.toLocaleString()} ${CURRENCY}` : value}
            />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || colors[index % colors.length]}
                strokeWidth={2.5}
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={line.label || line.key}
                strokeDasharray={line.strokeDasharray || '0'}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Area Chart
const CustomAreaChart = ({ data, areas, xKey, title, subtitle, height = 300 }) => {
  const colors = ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'];

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6D6D6D]">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              formatter={(value) => typeof value === 'number' ? `${value.toLocaleString()} ${CURRENCY}` : value}
            />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={area.key}
                stroke={area.color || colors[index % colors.length]}
                fill={area.color || colors[index % colors.length]}
                fillOpacity={0.15}
                name={area.label || area.key}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Bar Chart
const CustomBarChart = ({ data, bars, xKey, title, subtitle, horizontal = false, height = 300 }) => {
  const colors = ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'];

  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6D6D6D]">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            {horizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
                <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11, fill: '#6D6D6D' }} width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6D6D6D' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              formatter={(value) => typeof value === 'number' ? `${value.toLocaleString()} ${CURRENCY}` : value}
            />
            <Legend />
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.key}
                fill={bar.color || colors[index % colors.length]}
                name={bar.label || bar.key}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Pie Chart
const CustomPieChart = ({ data, title, subtitle, height = 300, innerRadius = 60, outerRadius = 80 }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6D6D6D]">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={({ name, value }) => `${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'][index % 6]} />
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
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || ['#B8863B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'][index % 6] }} />
            {entry.name} ({entry.value}%)
          </span>
        ))}
      </div>
    </div>
  );
};

// Radar Chart
const CustomRadarChart = ({ data, title, subtitle, height = 300 }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6D6D6D]">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#ECE8E1" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 10, fill: '#6D6D6D' }} />
            <Radar name="2024" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Radar name="2025" dataKey="B" stroke="#B8863B" fill="#B8863B" fillOpacity={0.3} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT: ACTIVITY ITEM
// ==========================================
const ActivityItem = ({ activity }) => {
  const typeConfig = {
    order: { icon: <ShoppingBag size={14} />, color: 'bg-blue-50 text-blue-600' },
    validate: { icon: <CheckCircle size={14} />, color: 'bg-emerald-50 text-emerald-600' },
    production: { icon: <FactoryIcon size={14} />, color: 'bg-amber-50 text-amber-600' },
    delivery: { icon: <TruckIcon size={14} />, color: 'bg-cyan-50 text-cyan-600' },
    invoice: { icon: <FileText size={14} />, color: 'bg-purple-50 text-purple-600' },
    payment: { icon: <DollarSign size={14} />, color: 'bg-green-50 text-green-600' }
  };

  const config = typeConfig[activity.type] || typeConfig.order;

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F7F4] transition-colors">
      <div className={`p-1.5 rounded-lg ${config.color}`}>
        {config.icon}
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
// COMPOSANT: TOP LIST
// ==========================================
const TopListCard = ({ title, items, valueLabel, icon: Icon, valueKey, nameKey, limit = 10 }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-[#B8863B]" />
        <h3 className="text-sm font-bold text-[#3D2F24]">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, limit).map((item, index) => {
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
// PAGE PRINCIPALE - ANALYTICS
// ==========================================
const AnalyticsPage = () => {
  const { user: currentUser } = useAuth();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ isOpen: false, message: '', type: 'success' });
  };

  // ==========================================
  // HANDLERS - EXPORT
  // ==========================================

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

  const handleDismissAlert = (alertId) => {
    showToast(`🔔 Alerte ${alertId} marquée comme lue`, 'info');
  };

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================
  const kpis = useMemo(() => {
    const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = financialData.reduce((sum, d) => sum + d.profit, 0);
    const totalOrders = monthlySalesData.reduce((sum, d) => sum + d.orders, 0);
    const completedOrders = orderStatusDistribution.find(d => d.name === 'Terminées')?.value || 0;
    const pendingOrders = orderStatusDistribution.find(d => d.name === 'En attente')?.value || 0;
    const totalCustomers = 1356;
    const newCustomers = 124;
    const totalProductsSold = monthlySalesData.reduce((sum, d) => sum + d.products, 0);
    const paidInvoices = 680;
    const unpaidInvoices = 83;
    const totalDeliveries = deliveryStats.reduce((sum, d) => sum + d.delivered, 0);
    const totalProduction = productionDaily.reduce((sum, d) => sum + d.produced, 0);

    const lastMonth = financialData[financialData.length - 1];
    const prevMonth = financialData[financialData.length - 2];
    const monthlyGrowth = prevMonth.revenue > 0 
      ? ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 
      : 0;

    const revenueTrend = financialData.map(d => ({ value: d.revenue }));
    const orderTrend = monthlySalesData.map(d => ({ value: d.orders }));
    const profitTrend = financialData.map(d => ({ value: d.profit }));

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalCustomers,
      newCustomers,
      totalProductsSold,
      paidInvoices,
      unpaidInvoices,
      totalDeliveries,
      totalProduction,
      monthlyGrowth,
      revenueTrend,
      orderTrend,
      profitTrend,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }, []);

  // ==========================================
  // ⭐ COLONNES POUR L'EXPORT
  // ==========================================
  const exportColumns = [
    { label: 'Indicateur', accessor: 'indicator', width: 30 },
    { label: 'Valeur actuelle', accessor: 'current', width: 25 },
    { label: 'Valeur précédente', accessor: 'previous', width: 25 },
    { label: 'Évolution', accessor: 'growth', width: 20 },
    { label: 'Objectif', accessor: 'target', width: 25 },
    { label: 'Performance', accessor: 'performance', width: 20 }
  ];

  // ==========================================
  // ⭐ FORMATTEUR POUR L'EXPORT
  // ==========================================
  const rowFormatter = (item) => ({
    indicator: item.indicator,
    current: typeof item.current === 'number' ? item.current.toLocaleString() : item.current,
    previous: typeof item.previous === 'number' ? item.previous.toLocaleString() : item.previous,
    growth: `${item.growth > 0 ? '+' : ''}${item.growth.toFixed(1)}%`,
    target: typeof item.target === 'number' ? item.target.toLocaleString() : item.target,
    performance: `${((item.current / item.target) * 100).toFixed(0)}%`
  });

  // ==========================================
  // ⭐ RÉSUMÉ POUR L'EXPORT
  // ==========================================
  const exportSummary = {
    'Total Revenus': formatCurrency(kpis.totalRevenue),
    'Total Profit': formatCurrency(kpis.totalProfit),
    'Total Commandes': kpis.totalOrders,
    'Clients Actifs': kpis.totalCustomers,
    'Produits Vendus': kpis.totalProductsSold,
    'Factures Payées': kpis.paidInvoices,
    'Livraisons': kpis.totalDeliveries,
    'Croissance': formatPercentage(kpis.monthlyGrowth)
  };

  // ==========================================
  // HANDLER SUCCÈS EXPORT
  // ==========================================
  const handleExportSuccess = (result) => {
    showToast(`✅ ${result.filename} exporté avec succès (${result.rowCount || kpiComparisonData.length} lignes)`, 'success');
  };

  // ==========================================
  // HANDLER ERREUR EXPORT
  // ==========================================
  const handleExportError = (error) => {
    showToast(`❌ Erreur lors de l'export : ${error.message || 'Erreur inconnue'}`, 'error');
  };

  // ==========================================
  // TABS
  // ==========================================
  const tabs = [
    { id: 'overview', label: 'Vue Générale', icon: LayoutDashboard },
    { id: 'sales', label: 'Ventes', icon: TrendingUp },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
    { id: 'production', label: 'Production', icon: FactoryIcon },
    { id: 'financial', label: 'Finances', icon: DollarSign },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'deliveries', label: 'Livraisons', icon: TruckIcon },
    { id: 'comparisons', label: 'Comparaisons', icon: ArrowUpDown },
    { id: 'forecast', label: 'Prévisions', icon: Target }
  ];

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KPICard 
          icon={DollarSign} 
          title="Chiffre d'affaires" 
          value={kpis.totalRevenue} 
          change={kpis.monthlyGrowth} 
          color="gold" 
          isCurrency 
          miniData={kpis.revenueTrend}
          miniColor="#B8863B"
          compareText="VS mois précédent"
        />
        <KPICard 
          icon={TrendingUp} 
          title="Profit" 
          value={kpis.totalProfit} 
          change={12.8} 
          color="green" 
          isCurrency 
          miniData={kpis.profitTrend}
          miniColor="#22C55E"
          compareText="VS mois précédent"
        />
        <KPICard 
          icon={ShoppingBag} 
          title="Commandes" 
          value={kpis.totalOrders} 
          change={7.2} 
          color="blue"
          miniData={kpis.orderTrend}
          miniColor="#3B82F6"
          compareText="VS mois précédent"
        />
        <KPICard 
          icon={CheckCircle} 
          title="Commandes terminées" 
          value={kpis.completedOrders} 
          change={5.1} 
          color="emerald"
          compareText="VS mois précédent"
        />
        <KPICard 
          icon={Clock} 
          title="Commandes en attente" 
          value={kpis.pendingOrders} 
          change={-3.8} 
          color="amber"
          compareText="VS mois précédent"
        />
        <KPICard 
          icon={Users} 
          title="Clients actifs" 
          value={kpis.totalCustomers} 
          change={9.4} 
          color="purple"
          compareText="VS mois précédent"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KPICard icon={UserPlus} title="Nouveaux clients" value={kpis.newCustomers} change={15.2} color="blue" />
        <KPICard icon={Package} title="Produits vendus" value={kpis.totalProductsSold} change={8.7} color="purple" />
        <KPICard icon={CreditCard} title="Factures payées" value={kpis.paidInvoices} change={6.3} color="green" />
        <KPICard icon={XCircle} title="Factures impayées" value={kpis.unpaidInvoices} change={-4.2} color="rose" />
        <KPICard icon={TruckIcon} title="Livraisons réalisées" value={kpis.totalDeliveries} change={10.1} color="cyan" />
        <KPICard icon={FactoryIcon} title="Production réalisée" value={kpis.totalProduction} change={12.5} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomAreaChart
          data={financialData}
          areas={[
            { key: 'revenue', label: 'Revenus', color: '#B8863B' },
            { key: 'profit', label: 'Profit', color: '#22C55E' }
          ]}
          xKey="month"
          title="Évolution des Revenus & Profit"
          subtitle="Comparaison mensuelle des revenus et profits"
        />
        <CustomPieChart
          data={orderStatusDistribution}
          title="Répartition des Commandes"
          subtitle="Distribution par statut"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomBarChart
          data={salesByRegion}
          bars={[{ key: 'revenue', label: 'Revenus', color: '#B8863B' }]}
          xKey="region"
          title="Ventes par Région"
          subtitle="Répartition géographique des revenus"
        />
        <CustomRadarChart
          data={radarData}
          title="Performance Globale"
          subtitle="Comparaison 2024 vs 2025"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <TopListCard 
          title="Top Produits" 
          items={topProducts.map(c => ({ ...c, value: c.sales }))} 
          valueLabel="Ventes" 
          icon={Package} 
          valueKey="sales"
          limit={5}
        />
        <TopListCard 
          title="Top Clients" 
          items={topClients.map(c => ({ ...c, value: c.revenue }))} 
          valueLabel="Revenu" 
          icon={Users} 
          valueKey="revenue"
          limit={5}
        />
        <TopListCard 
          title="Top Catégories" 
          items={topCategories.map(c => ({ ...c, value: c.sales }))} 
          valueLabel="Ventes" 
          icon={Layers} 
          valueKey="sales"
          limit={5}
        />
        <TopListCard 
          title="Top Commerciaux" 
          items={topSalesReps.map(c => ({ ...c, value: c.revenue }))} 
          valueLabel="Revenu" 
          icon={User} 
          valueKey="revenue"
          limit={5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Activité Récente</h3>
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

  const renderSales = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={DollarSign} title="Chiffre d'affaires" value={kpis.totalRevenue} change={kpis.monthlyGrowth} color="gold" isCurrency />
        <KPICard icon={TrendingUp} title="Croissance" value={formatPercentage(kpis.monthlyGrowth)} change={kpis.monthlyGrowth} color="indigo" />
        <KPICard icon={ShoppingBag} title="Commandes" value={kpis.totalOrders} change={7.2} color="blue" />
        <KPICard icon={Users} title="Clients" value={kpis.totalCustomers} change={9.4} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomLineChart
          data={monthlySalesData}
          lines={[
            { key: 'revenue', label: 'Revenus', color: '#B8863B' },
            { key: 'profit', label: 'Profit', color: '#22C55E' },
            { key: 'target', label: 'Objectif', color: '#EF4444' }
          ]}
          xKey="month"
          title="Évolution des Ventes"
          subtitle="Revenus, Profit et Objectifs"
        />
        <CustomBarChart
          data={topSalesReps}
          bars={[{ key: 'revenue', label: 'Revenus', color: '#8B5CF6' }]}
          xKey="name"
          title="Performance des Commerciaux"
          subtitle="Revenus par commercial"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart
          data={salesByRegion}
          bars={[{ key: 'revenue', label: 'Revenus', color: '#B8863B' }]}
          xKey="region"
          title="Ventes par Région"
          subtitle="Répartition géographique"
        />
        <CustomBarChart
          data={topCategories}
          bars={[{ key: 'sales', label: 'Ventes', color: '#3B82F6' }]}
          xKey="name"
          title="Ventes par Catégorie"
          subtitle="Performance des catégories"
        />
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={ShoppingBag} title="Commandes créées" value={kpis.totalOrders} change={7.2} color="blue" />
        <KPICard icon={CheckCircle} title="Commandes validées" value={kpis.completedOrders} change={5.1} color="green" />
        <KPICard icon={XCircle} title="Commandes annulées" value={8} change={-2.3} color="rose" />
        <KPICard icon={Clock} title="Temps moyen" value="2.4h" change={-1.8} color="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomLineChart
          data={monthlySalesData}
          lines={[
            { key: 'orders', label: 'Commandes', color: '#3B82F6' }
          ]}
          xKey="month"
          title="Évolution des Commandes"
          subtitle="Nombre de commandes par mois"
        />
        <CustomPieChart
          data={orderStatusDistribution}
          title="Répartition des Commandes"
          subtitle="Distribution par statut"
        />
      </div>
    </div>
  );

  const renderProduction = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={FactoryIcon} title="Production quotidienne" value={productionDaily.reduce((s, d) => s + d.produced, 0)} change={12.5} color="amber" />
        <KPICard icon={CheckCircle} title="Produits terminés" value={kpis.totalProduction} change={10.2} color="green" />
        <KPICard icon={Timer} title="Temps moyen" value="4.5h" change={-3.1} color="blue" />
        <KPICard icon={Award} title="Rendement" value="94%" change={2.8} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart
          data={productionDaily}
          bars={[
            { key: 'produced', label: 'Produits', color: '#22C55E' },
            { key: 'target', label: 'Objectif', color: '#EF4444' }
          ]}
          xKey="day"
          title="Production Journalière"
          subtitle="Production vs Objectif"
        />
        <CustomLineChart
          data={productionDaily}
          lines={[
            { key: 'produced', label: 'Produits', color: '#22C55E' },
            { key: 'target', label: 'Objectif', color: '#EF4444' }
          ]}
          xKey="day"
          title="Tendance de Production"
          subtitle="Évolution quotidienne"
        />
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={DollarSign} title="Revenus" value={kpis.totalRevenue} change={kpis.monthlyGrowth} color="gold" isCurrency />
        <KPICard icon={CreditCard} title="Dépenses" value={financialData.reduce((s, d) => s + d.expenses, 0)} change={5.3} color="rose" isCurrency />
        <KPICard icon={TrendingUp} title="Profit net" value={kpis.totalProfit} change={12.8} color="green" isCurrency />
        <KPICard icon={CheckCircle} title="Paiements reçus" value={kpis.paidInvoices} change={6.3} color="emerald" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomAreaChart
          data={financialData}
          areas={[
            { key: 'revenue', label: 'Revenus', color: '#B8863B' },
            { key: 'expenses', label: 'Dépenses', color: '#EF4444' },
            { key: 'profit', label: 'Profit', color: '#22C55E' }
          ]}
          xKey="month"
          title="Analyse Financière"
          subtitle="Revenus, Dépenses et Profit"
        />
        <CustomBarChart
          data={financialData.slice(-6)}
          bars={[
            { key: 'revenue', label: 'Revenus', color: '#B8863B' },
            { key: 'profit', label: 'Profit', color: '#22C55E' }
          ]}
          xKey="month"
          title="Performance Financière (6 mois)"
          subtitle="Derniers mois"
        />
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={Users} title="Clients actifs" value={kpis.totalCustomers} change={9.4} color="green" />
        <KPICard icon={UserPlus} title="Nouveaux clients" value={kpis.newCustomers} change={15.2} color="blue" />
        <KPICard icon={UserX} title="Clients inactifs" value={124} change={-2.1} color="rose" />
        <KPICard icon={Award} title="Clients fidèles" value={345} change={12.8} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomLineChart
          data={monthlySalesData}
          lines={[
            { key: 'orders', label: 'Clients actifs', color: '#3B82F6' }
          ]}
          xKey="month"
          title="Croissance des Clients"
          subtitle="Évolution du nombre de clients"
        />
        <CustomPieChart
          data={[
            { name: 'Actifs', value: 65, color: '#22C55E' },
            { name: 'Inactifs', value: 20, color: '#EF4444' },
            { name: 'Nouveaux', value: 15, color: '#3B82F6' }
          ]}
          title="Répartition des Clients"
          subtitle="Distribution par statut"
        />
      </div>
      <div className="mt-6">
        <TopListCard 
          title="Top 10 Clients" 
          items={topClients.map(c => ({ ...c, value: c.revenue }))} 
          valueLabel="Revenu" 
          icon={Users} 
          valueKey="revenue"
          limit={10}
        />
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={Package} title="Produits vendus" value={kpis.totalProductsSold} change={8.7} color="purple" />
        <KPICard icon={TrendingUp} title="Top produit" value={topProducts[0]?.name || '-'} change={0} color="gold" />
        <KPICard icon={AlertCircle} title="En rupture" value="5" change={-10.4} color="rose" />
        <KPICard icon={CheckCircle} title="Disponibles" value="52" change={8.9} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart
          data={topProducts.slice(0, 5)}
          bars={[{ key: 'sales', label: 'Ventes', color: '#B8863B' }]}
          xKey="name"
          title="Top Produits"
          subtitle="Les plus vendus"
        />
        <CustomPieChart
          data={topCategories}
          title="Produits par Catégorie"
          subtitle="Distribution par catégorie"
        />
      </div>
      <div className="mt-6">
        <TopListCard 
          title="Top 10 Produits" 
          items={topProducts.map(c => ({ ...c, value: c.sales }))} 
          valueLabel="Ventes" 
          icon={Package} 
          valueKey="sales"
          limit={10}
        />
      </div>
    </div>
  );

  const renderDeliveries = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={TruckIcon} title="Livraisons terminées" value={kpis.totalDeliveries} change={10.1} color="green" />
        <KPICard icon={Clock} title="En retard" value={15} change={-2.4} color="rose" />
        <KPICard icon={Timer} title="Temps moyen" value="2.5h" change={-5.3} color="blue" />
        <KPICard icon={CheckCircle} title="Taux de réussite" value="94.2%" change={2.8} color="emerald" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart
          data={deliveryStats.slice(0, 6)}
          bars={[
            { key: 'delivered', label: 'Livrées', color: '#22C55E' },
            { key: 'delayed', label: 'Retardées', color: '#EF4444' }
          ]}
          xKey="month"
          title="Livraisons Mensuelles"
          subtitle="Livrées vs Retardées"
        />
        <CustomPieChart
          data={[
            { name: 'À temps', value: 75, color: '#22C55E' },
            { name: 'Retard', value: 15, color: '#EF4444' },
            { name: 'En attente', value: 10, color: '#F59E0B' }
          ]}
          title="Répartition des Livraisons"
          subtitle="Statut des livraisons"
        />
      </div>
    </div>
  );

  const renderComparisons = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ComparisonCard
          title="Aujourd'hui vs Hier"
          current="18 500 SAR"
          previous="16 200 SAR"
          change={14.2}
          icon={Sun}
          color="gold"
        />
        <ComparisonCard
          title="Cette semaine vs Semaine précédente"
          current="125 000 SAR"
          previous="112 000 SAR"
          change={11.6}
          icon={Calendar}
          color="blue"
        />
        <ComparisonCard
          title="Ce mois vs Mois précédent"
          current={formatCurrency(kpis.totalRevenue)}
          previous={formatCurrency(kpis.totalRevenue * 0.92)}
          change={kpis.monthlyGrowth}
          icon={TrendingUp}
          color="green"
        />
        <ComparisonCard
          title="Cette année vs Année précédente"
          current="1 475 000 SAR"
          previous="1 280 000 SAR"
          change={15.2}
          icon={Award}
          color="purple"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart
          data={yearlyComparison}
          bars={[
            { key: 'year2024', label: '2024', color: '#3B82F6' },
            { key: 'year2025', label: '2025', color: '#B8863B' }
          ]}
          xKey="month"
          title="Comparaison Annuelle"
          subtitle="2024 vs 2025"
        />
        <CustomLineChart
          data={yearlyComparison}
          lines={[
            { key: 'year2024', label: '2024', color: '#3B82F6' },
            { key: 'year2025', label: '2025', color: '#B8863B' }
          ]}
          xKey="month"
          title="Tendance Annuelle"
          subtitle="Évolution comparée"
        />
      </div>
    </div>
  );

  const renderForecast = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard icon={Target} title="CA Prévisionnel" value="175 000 SAR" change={8.5} color="gold" isCurrency />
        <KPICard icon={TrendingUp} title="Ventes Prévisionnelles" value="245" change={6.2} color="blue" />
        <KPICard icon={FactoryIcon} title="Production Prévisionnelle" value="650" change={10.1} color="green" />
        <KPICard icon={ShoppingBag} title="Commandes Prévisionnelles" value="220" change={4.8} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomLineChart
          data={forecastData}
          lines={[
            { key: 'actual', label: 'Réel', color: '#B8863B' },
            { key: 'forecast', label: 'Prévision', color: '#3B82F6' }
          ]}
          xKey="month"
          title="Prévision vs Réel"
          subtitle="Comparaison mensuelle"
        />
        <CustomAreaChart
          data={forecastData.slice(6)}
          areas={[
            { key: 'actual', label: 'Réel', color: '#B8863B' },
            { key: 'forecast', label: 'Prévision', color: '#3B82F6' }
          ]}
          xKey="month"
          title="Projection 6 mois"
          subtitle="Tendance prévisionnelle"
        />
      </div>
    </div>
  );

  const renderKpiTable = () => {
    return (
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#3D2F24]">Tableau d'Analyse des KPI</h3>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
              <Search size={16} className="text-[#6D6D6D]" />
            </button>
            <button className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
              <Download size={16} className="text-[#6D6D6D]" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Indicateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Valeur actuelle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Valeur précédente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Évolution</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Objectif</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {kpiComparisonData.map((item, index) => {
                const performance = (item.current / item.target) * 100;
                const isPositive = item.growth > 0;
                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F8F7F4] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#3D2F24] font-medium">{item.indicator}</td>
                    <td className="px-4 py-3 text-[#3D2F24]">{typeof item.current === 'number' ? item.current.toLocaleString() : item.current}</td>
                    <td className="px-4 py-3 text-[#6D6D6D]">{typeof item.previous === 'number' ? item.previous.toLocaleString() : item.previous}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {Math.abs(item.growth).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3D2F24]">{typeof item.target === 'number' ? item.target.toLocaleString() : item.target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#F8F7F4] rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className={`h-full rounded-full ${performance >= 100 ? 'bg-emerald-500' : performance >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(performance, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#6D6D6D]">{performance.toFixed(0)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
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

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#6D6D6D] mb-1">
              <Home size={14} className="text-[#B8863B]" />
              <span className="text-[#B8863B]">/</span>
              <span>Analytics</span>
            </nav>
            <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              Analytics
            </h1>
            <p className="text-sm text-[#6D6D6D]">
              Analyse complète des performances de l'entreprise
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date et Heure */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-[#ECE8E1] rounded-lg">
              <span className="text-xs text-[#6D6D6D]">
                {currentTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="w-px h-4 bg-[#ECE8E1]" />
              <span className="text-xs font-medium text-[#3D2F24]">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Sélecteur de période */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="pl-9 pr-8 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent bg-white appearance-none"
              >
                <option value="today">Aujourd'hui</option>
                <option value="yesterday">Hier</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
                <option value="custom">Personnalisé</option>
              </select>
              <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:border-transparent w-36 md:w-48"
              />
            </div>

            {/* Boutons d'action */}
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

            {/* ⭐ NOUVEAU : ExportButtons */}
            <ExportButtons
              data={kpiComparisonData}
              columns={exportColumns}
              title="Tableau d'Analyse des KPI"
              subtitle="Analyse complète des indicateurs de performance"
              filename="analyse_kpi"
              summary={exportSummary}
              rowFormatter={rowFormatter}
              userName={currentUser?.firstName || 'Utilisateur'}
              onSuccess={handleExportSuccess}
              onError={handleExportError}
              variant="default"
              showPDF={true}
              showExcel={true}
              showCSV={true}
              showPrint={true}
            />

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
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'production' && renderProduction()}
          {activeTab === 'financial' && renderFinancial()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'deliveries' && renderDeliveries()}
          {activeTab === 'comparisons' && renderComparisons()}
          {activeTab === 'forecast' && renderForecast()}
        </motion.div>
      </AnimatePresence>

      {/* Tableau d'analyse */}
      <div className="mt-6">
        {renderKpiTable()}
      </div>
    </div>
  );
};

export default AnalyticsPage;