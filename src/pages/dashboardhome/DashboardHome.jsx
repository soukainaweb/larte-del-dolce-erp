// src/pages/dashboardhome/DashboardHome.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  ShoppingBag,
  Settings,
  Truck,
  DollarSign,
  Users,
  FileText,
  PlusCircle,
  UserPlus,
  Package,
  FilePlus,
  Layers,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal,
  X,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import dashboardService from '../../services/dashboardService';
import orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/apiHelpers';


// ==========================================
// TYPOGRAPHY SYSTEM — L'arte ERP
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_NUMBER = "'Inter', sans-serif";


// ==========================================
// FALLBACK DATA (Utilisé uniquement si l'API échoue)
// ==========================================
const FALLBACK_DATA = {
  periods: {
    Today: {
      kpi: {
        orders: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        production: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        deliveries: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        revenue: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        customers: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        invoices: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        }
      },

      chartData: {
        labels: [],
        revenue: [],
        orders: [],
        production: [],
        invoices: []
      },

      distribution: {
        total: 0,
        enAttente: 0,
        enProduction: 0,
        pretes: 0,
        livrees: 0
      },

      recentOrders: [],
      liveProduction: [],
      topProducts: []
    },

    Week: {
      kpi: {
        orders: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        production: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        deliveries: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        revenue: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        customers: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        },
        invoices: {
          value: 0,
          growth: "0%",
          isPositive: true,
          trend: [0, 0, 0, 0, 0, 0]
        }
      },

      chartData: {
        labels: [],
        revenue: [],
        orders: [],
        production: [],
        invoices: []
      },

      distribution: {
        total: 0,
        enAttente: 0,
        enProduction: 0,
        pretes: 0,
        livrees: 0
      },

      recentOrders: [],
      liveProduction: [],
      topProducts: []
    }
  },

  notifications: []
};

// ==========================================
// Animated count-up number
// ==========================================
const AnimatedNumber = ({ value, isCurrency }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value == null) return undefined;
    const start = performance.now();
    const from = display;
    const to = value;
    const duration = 600;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [value]);

  if (value == null) {
    return <span style={{ fontFamily: FONT_NUMBER }} className="text-[#B9B4AC]">—</span>;
  }

  return (
    <span style={{ fontFamily: FONT_NUMBER, fontWeight: 600 }}>
      {isCurrency ? `SAR ${display.toLocaleString()}` : display.toLocaleString()}
    </span>
  );
};

// ==========================================
// CUSTOM MINI CHART
// ==========================================
const MicroChart = ({ data, isPositive }) => {
  if (!data || data.length === 0) return null;
  
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 36 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(width - 16, 60),
          height: 36
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    const { width } = containerRef.current.getBoundingClientRect();
    setDimensions({
      width: Math.max(width - 16, 60),
      height: 36
    });

    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x =
  data.length === 1
    ? width / 2
    : padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `${padding},${height} ${points} ${width - padding},${height}`;
  const strokeColor = isPositive ? '#22C55E' : '#EF4444';
  const fillColor = isPositive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)';

  return (
    <div ref={containerRef} className="w-full h-[36px]">
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <polygon points={fillPoints} fill={fillColor} />
          <polyline 
            points={points} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      )}
    </div>
  );
};

// ==========================================
// Activity Tooltip
// ==========================================
const ActivityTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div
      className="bg-white border border-[#ECE8E1] rounded-xl shadow-lg px-4 py-3 min-w-[170px]"
      style={{ fontFamily: FONT_BODY }}
    >
      <span className="text-[11px] font-bold text-[#202020] block mb-2">{label}</span>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span className="text-[#707070]">Chiffre d'affaires</span>
          <span className="font-semibold text-[#C6923B]">SAR {(row.revenue ?? 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#707070]">Commandes</span>
          <span className="font-semibold text-[#202020]">{row.orders ?? 0}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#707070]">Production</span>
          <span className="font-semibold text-[#202020]">{row.production ?? 0}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#707070]">Factures</span>
          <span className="font-semibold text-[#202020]">{row.invoices ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Analytics Chart
// ==========================================
const AnalyticsChart = ({ labels, series1, series2, series3, series4 }) => {
  const rows = labels.map((label, i) => ({
    label,
    revenue: series1?.[i] ?? 0,
    orders: series2?.[i] ?? 0,
    production: series3?.[i] ?? 0,
    invoices: series4?.[i] ?? 0,
  }));

  return (
    <div className="w-full h-[220px] pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6923B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C6923B" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#707070', fontFamily: FONT_BODY }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <RechartsTooltip content={<ActivityTooltip />} cursor={{ stroke: '#C6923B', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#C6923B"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#FFFFFF', stroke: '#C6923B', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==========================================
// Distribution Tooltip
// ==========================================
const DistributionTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-lg shadow-lg px-3 py-2" style={{ fontFamily: FONT_BODY }}>
      <span className="text-[11px] font-semibold" style={{ color: item.payload.color }}>{item.name}</span>
      <span className="block text-xs font-bold text-[#202020]">{item.value} commandes</span>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function DashboardHome({ isLoading: initialLoading = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
 const activeUser = {
  fullName:
    user?.name ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'Utilisateur',

  role:
    user?.role?.display_name ||
    user?.role?.name ||
    user?.role?.frontendKey ||
    'Utilisateur',

  status:
    user?.status || 'Offline',

  avatar:
    user?.avatar || ''
};
  
  // ===== STATE =====
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orderPendingDelete, setOrderPendingDelete] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Dashboard data states
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(FALLBACK_DATA);
  const [notifications, setNotifications] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [liveProduction, setLiveProduction] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // ===== FETCH DATA =====
  const fetchDashboardData = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer toutes les données en parallèle
      const [statsData, analyticsData, ordersData, notificationsData, productionData, topProductsData] = await Promise.all([
        dashboardService.getDashboardStats({ period }),
        dashboardService.getDashboardAnalytics({ period }),
        dashboardService.getRecentOrders({ limit: 5 }),
        dashboardService.getNotifications({ limit: 5 }),
        dashboardService.getProductionStatus({ limit: 4 }),
        dashboardService.getTopProducts({ limit: 5, period })
      ]);

      const data = {
        periods: {
          [period]: {
            kpi: statsData?.kpi || FALLBACK_DATA.periods[period]?.kpi,
            chartData: analyticsData?.chartData || FALLBACK_DATA.periods[period]?.chartData,
            distribution: statsData?.distribution || FALLBACK_DATA.periods[period]?.distribution,
            recentOrders: ordersData || [],
            liveProduction: productionData || [],
            topProducts: topProductsData || []
          }
        }
      };

      setDashboardData(data);
      setRecentOrders(ordersData || []);
      setLiveProduction(productionData || []);
      setTopProducts(topProductsData || []);
      setNotifications(notificationsData || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const message = getApiErrorMessage(err, 'Erreur lors du chargement des données');
      setError(message);
      showToast(message, 'error');
      // Utiliser les données de fallback
      setDashboardData(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchDashboardData(selectedPeriod);
  }, [fetchDashboardData, selectedPeriod]);

  // ===== CLOCK =====
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===== GET ACTIVE DATASET =====
  const getActiveDataset = () => {
    if (dashboardData.periods && dashboardData.periods[selectedPeriod]) {
      return dashboardData.periods[selectedPeriod];
    }
    return FALLBACK_DATA.periods[selectedPeriod] || FALLBACK_DATA.periods['Today'];
  };

  const activeDataset = getActiveDataset();
  const { kpi, chartData, distribution } = activeDataset;

  // Use real data or fallback
  const displayOrders = recentOrders.length > 0 ? recentOrders : activeDataset.recentOrders || [];
  const displayProduction = liveProduction.length > 0 ? liveProduction : activeDataset.liveProduction || [];
  const displayTopProducts = topProducts.length > 0 ? topProducts : activeDataset.topProducts || [];
  const displayNotifications = notifications.length > 0 ? notifications : FALLBACK_DATA.notifications;

  // ===== HANDLERS =====
  const handleQuickAction = (route, callback) => {
    if (callback) callback();
    navigate(route);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    fetchDashboardData(selectedPeriod);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    showToast(t('dashboard.exportExcelSoon'), 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmDeleteOrder = async () => {
    if (!orderPendingDelete?.id) {
      setOrderPendingDelete(null);
      return;
    }
    try {
      await orderService.deleteOrder(orderPendingDelete.id);
      showToast(t('dashboard.orderDeleted'), 'success');
      fetchDashboardData(selectedPeriod);
    } catch {
      showToast(t('errors.deleteFailed'), 'error');
    } finally {
      setOrderPendingDelete(null);
    }
  };

  // ===== DISTRIBUTION DATA =====
  const distributionData = distribution ? [
    { name: 'En attente', value: distribution.enAttente || 0, color: '#F59E0B' },
    { name: 'En production', value: distribution.enProduction || 0, color: '#F97316' },
    { name: 'Prêtes', value: distribution.pretes || 0, color: '#C6923B' },
    { name: 'Livrées', value: distribution.livrees || 0, color: '#22C55E' },
  ] : [];

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6 space-y-6" style={{ fontFamily: FONT_BODY }}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#C6923B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#707070]">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6 space-y-6" style={{ fontFamily: FONT_BODY }}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <p className="text-sm text-[#707070]">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#C6923B] rounded-lg hover:bg-[#B8863B] transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6 space-y-6" style={{ fontFamily: FONT_BODY }}>

      {/* ==========================================
          SYSTEM HEADER & DYNAMIC METRIC TIMER
          ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C6923B]">Système ERP L'arte</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#202020] mt-0.5" style={{ fontFamily: FONT_HEADING }}>
            Bienvenue, {activeUser.fullName || 'Utilisateur'}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-[#707070]">
            <span className="font-medium">
             {activeUser.role || '—'}
            </span>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${activeUser.status === 'Online' ? 'bg-[#22C55E]' : 'bg-[#B9B4AC]'}`} />
            <span className={`text-[12px] font-medium ${activeUser.status === 'Online' ? 'text-[#22C55E]' : 'text-[#B9B4AC]'}`}>
              {activeUser.status === 'Online' ? 'En ligne' : activeUser.status || 'Déconnecté'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#F8F7F4] border border-[#ECE8E1] p-3 rounded-xl min-w-[240px]">
          <div className="p-2 bg-white rounded-lg border border-[#ECE8E1] text-[#C6923B]">
            <Clock className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#707070] uppercase tracking-wide">
              {currentDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="text-lg font-bold tracking-tight text-[#202020]" style={{ fontFamily: FONT_NUMBER }}>
              {currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ==========================================
          BUSINESS TIMELINE CONTROLS
          ========================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-[#ECE8E1] rounded-[14px]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['Today', 'Week', 'Month', 'Quarter', 'Year'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-[#C6923B] text-white shadow-sm'
                  : 'text-[#707070] hover:text-[#202020] hover:bg-[#F8F7F4]'
              }`}
            >
              {period === 'Today' ? "Aujourd'hui" : period === 'Week' ? 'Cette semaine' : period === 'Month' ? 'Ce mois' : period === 'Quarter' ? 'Ce trimestre' : 'Cette année'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-[#707070] hover:text-[#202020] hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#707070] font-medium px-3">
            Scope actuel: <span className="text-[#C6923B] font-bold">{selectedPeriod}</span>
          </span>
        </div>
      </div>

      {/* ==========================================
          KPI GRID (6 CARDS)
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { key: 'orders', title: 'Commandes du jour', icon: ShoppingBag, color: 'bg-amber-500', isCurrency: false },
          { key: 'production', title: 'Commandes en attente', icon: Layers, color: 'bg-orange-500', isCurrency: false },
          { key: 'deliveries', title: 'Commandes terminées', icon: Truck, color: 'bg-emerald-500', isCurrency: false },
          { key: 'revenue', title: "Chiffre d'affaires", icon: DollarSign, color: 'bg-[#C6923B]', isCurrency: true },
          { key: 'customers', title: 'Clients actifs', icon: Users, color: 'bg-blue-500', isCurrency: false },
          { key: 'invoices', title: 'Factures en attente', icon: FileText, color: 'bg-rose-500', isCurrency: false }
        ].map((card, idx) => {
          const item = kpi?.[card.key];

          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="bg-white border border-[#ECE8E1] p-4 rounded-[18px] shadow-sm flex flex-col transition-shadow hover:shadow-md h-[155px]"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-[#F8F7F4] border border-[#ECE8E1] rounded-xl text-[#202020]">
                  <card.icon className="w-4 h-4 stroke-[1.75]" />
                </div>
                {item ? (
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${card.color}`} />
                    <span className={`text-[11px] font-bold ${item.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {item.growth}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-[#B9B4AC]">—</span>
                )}
              </div>

              <div className="mt-2 flex-1">
                <span className="text-[11px] font-medium text-[#707070] block truncate">{card.title}</span>
                <span className="text-xl tracking-tight text-[#202020] mt-0.5 block">
                  <AnimatedNumber value={item?.value} isCurrency={card.isCurrency} />
                </span>
              </div>

              <div className="mt-2 pt-1 border-t border-[#F8F7F4]">
                {item?.trend?.length ? (
                  <MicroChart data={item.trend} isPositive={item.isPositive} />
                ) : (
                  <span className="text-[10px] text-[#B9B4AC] italic">Aucune donnée</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==========================================
          ANALYTICS & DISTRIBUTION CHARTS
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm">
          <div className="flex justify-between items-center border-b border-[#ECE8E1] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Analyse d'activité</h3>
              <p className="text-xs text-[#707070]">Suivi financier et volume de production</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C6923B]" />
                <span>Chiffre d'affaires (SAR)</span>
              </div>
            </div>
          </div>
          <AnalyticsChart
            labels={chartData?.labels || []}
            series1={chartData?.revenue || []}
            series2={chartData?.orders || []}
            series3={chartData?.production || []}
            series4={chartData?.invoices || []}
          />
        </div>

        <div className="bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Répartition des commandes</h3>
            <p className="text-xs text-[#707070]">Statut opérationnel en temps réel</p>
          </div>

          <div className="relative flex justify-center items-center my-2 h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {distributionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip content={<DistributionTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-bold text-[#202020] block" style={{ fontFamily: FONT_NUMBER }}>{distribution?.total || 0}</span>
              <span className="text-[10px] font-semibold text-[#707070] uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#ECE8E1] pt-4">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#707070]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="font-bold" style={{ fontFamily: FONT_NUMBER }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          QUICK ACTIONS
          ========================================== */}
      <div className="bg-white border border-[#ECE8E1] p-4 rounded-[18px] shadow-sm">
        <span className="text-xs font-bold text-[#707070] uppercase tracking-wider block mb-3">Actions rapides</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Nouvelle commande", icon: PlusCircle, path: "/commandes/nouvelle" },
            { label: "Nouveau client", icon: UserPlus, path: "/clients/nouveau" },
            { label: "Nouvelle facture", icon: FilePlus, path: "/factures/nouvelle" },
            { label: "Lancer Production", icon: Layers, path: "/production/lancer" },
            { label: "Logistique / Entrepôt", icon: Package, path: "/entrepot" },
            { label: "Générer Rapport", icon: BarChart3, path: "/rapports/generer" }
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action.path)}
              className="flex flex-col items-center justify-center p-4 border border-[#ECE8E1] rounded-xl hover:border-[#C6923B] bg-[#F8F7F4] hover:bg-white transition-all group"
            >
              <action.icon className="w-5 h-5 text-[#707070] group-hover:text-[#C6923B] stroke-[1.5] transition-colors mb-2" />
              <span className="text-xs font-semibold text-[#202020] text-center line-clamp-1">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==========================================
          DATA-TABLE & NOTIFICATIONS
          ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Dernières commandes</h3>
                <p className="text-xs text-[#707070]">Flux transactionnel direct</p>
              </div>
              <button onClick={() => navigate('/orders')} className="text-xs font-bold text-[#C6923B] hover:underline">Voir tout</button>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#ECE8E1] text-[#707070] font-semibold bg-[#F8F7F4]">
                    <th className="p-3">N° Commande</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Représentant</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Montant</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E1]">
                  {displayOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F7F4]/50 transition-colors">
                      <td className="p-3 font-bold text-[#C6923B]" style={{ fontFamily: FONT_NUMBER }}>{order.id}</td>
                      <td className="p-3 font-medium">{order.customer}</td>
                      <td className="p-3 text-[#707070]">{order.rep}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.statusColor === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          order.statusColor === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          order.statusColor === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold" style={{ fontFamily: FONT_NUMBER }}>SAR {order.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:text-[#C6923B]" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1 hover:text-[#C6923B]" title="Modifier"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button
                            className="p-1 hover:text-[#EF4444]"
                            title="Supprimer"
                            onClick={() => setOrderPendingDelete(order)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {displayOrders.map((order, idx) => (
                <div key={idx} className="border border-[#ECE8E1] rounded-xl p-3 bg-[#F8F7F4]/40">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#C6923B] text-xs" style={{ fontFamily: FONT_NUMBER }}>{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.statusColor === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      order.statusColor === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      order.statusColor === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#202020] mt-1.5">{order.customer}</p>
                  <p className="text-[11px] text-[#707070]">{order.rep} · {order.date}</p>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#ECE8E1]">
                    <span className="font-bold text-sm" style={{ fontFamily: FONT_NUMBER }}>SAR {order.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      <button className="p-1 hover:text-[#C6923B]" title="Voir"><Eye className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-[#C6923B]" title="Modifier"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-[#EF4444]" title="Supprimer" onClick={() => setOrderPendingDelete(order)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Notifications récentes</h3>
                <p className="text-xs text-[#707070]">Journal système en direct</p>
              </div>
              <Bell className="w-4 h-4 text-[#707070]" />
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border flex gap-3 items-start transition-all cursor-pointer ${
                    notif.unread ? 'bg-[#F8F7F4] border-[#C6923B]/30 shadow-sm' : 'bg-white border-[#ECE8E1]'
                  }`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
                    {notif.type === 'danger' && <AlertTriangle className="w-4 h-4 text-[#EF4444]" />}
                    {notif.type === 'info' && <Clock className="w-4 h-4 text-[#3B82F6]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-[#202020] truncate">{notif.title}</h4>
                      <span className="text-[10px] text-[#707070] whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-[#707070] mt-0.5 line-clamp-1">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          LIVE PRODUCTION & TOP PRODUCTS
          ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Production aujourd'hui</h3>
            <p className="text-xs text-[#707070]">Suivi d'avancement des ateliers</p>
          </div>
          <div className="space-y-4">
            {displayProduction.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 border border-[#ECE8E1] rounded-xl hover:border-[#C6923B]/50 transition-colors">
                <img src={prod.img} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-[#ECE8E1]" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-[#202020] block truncate">{prod.name}</span>
                    <span className="text-xs font-bold text-[#C6923B]" style={{ fontFamily: FONT_NUMBER }}>{prod.progress}%</span>
                  </div>
                  <div className="w-full bg-[#F8F7F4] h-1.5 rounded-full overflow-hidden border border-[#ECE8E1]/40">
                    <motion.div
                      className="bg-[#C6923B] h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${prod.progress}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] text-[#707070] block mt-1">{prod.workshop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] p-6 rounded-[18px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING, fontSize: 17 }}>Top produits</h3>
            <p className="text-xs text-[#707070]">Performances des ventes</p>
          </div>
          <div className="space-y-3">
            {displayTopProducts.map((item, idx) => (
              <div
                key={idx}
                className="space-y-1 relative"
                onMouseEnter={() => setHoveredProduct(idx)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#202020]">{idx + 1}. {item.name}</span>
                  <span className="text-[#707070]" style={{ fontFamily: FONT_NUMBER }}>
                    {item.units} u. <span className="font-bold text-[#202020]">({item.amount.toLocaleString()} SAR)</span>
                  </span>
                </div>
                <div className="w-full bg-[#F8F7F4] h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-amber-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.05 }}
                  />
                </div>
                <AnimatePresence>
                  {hoveredProduct === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-9 left-0 z-10 bg-[#202020] text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
                    >
                      {item.progress}% du volume total · {item.units} unités
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          DELETE CONFIRMATION MODAL
          ========================================== */}
      <AnimatePresence>
        {orderPendingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setOrderPendingDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[18px] shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button onClick={() => setOrderPendingDelete(null)} className="text-[#707070] hover:text-[#202020]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-[#202020]" style={{ fontFamily: FONT_HEADING }}>
                Supprimer la commande ?
              </h3>
              <p className="text-sm text-[#707070] mt-1.5">
                Vous êtes sur le point de supprimer la commande{' '}
                <span className="font-semibold text-[#202020]">{orderPendingDelete.id}</span> de{' '}
                <span className="font-semibold text-[#202020]">{orderPendingDelete.customer}</span>. Cette action est irréversible.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setOrderPendingDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#ECE8E1] text-sm font-semibold text-[#202020] hover:bg-[#F8F7F4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}