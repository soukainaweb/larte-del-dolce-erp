// src/pages/Finance/FinancePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  FileText,
  Users,
  Package,
  Truck,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Printer,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Settings,
  Grid,
  List,
  Search,
  X,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
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
  Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';
import {
  getFinanceMetrics,
  getRevenueExpensesData,
  getExpenseCategories,
  getRecentTransactions,
  getPendingCustomerPayments,
  getPendingSupplierPayments,
  getTopCustomers,
  getTopSuppliers,
  getFinanceNotifications,
  getFinanceSummary,
  exportFinanceData,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../../services/financeService';
import { safeArray, ensureArray, getApiErrorMessage } from '../../utils/apiHelpers';

const normalizeFinanceMetrics = (raw = {}) => ({
  totalRevenue: raw.totalRevenue ?? raw.total_revenue ?? 0,
  totalExpenses: raw.totalExpenses ?? raw.total_expenses ?? 0,
  netProfit: raw.netProfit ?? raw.net_profit ?? 0,
  cashBalance: raw.cashBalance ?? raw.cash_balance ?? 0,
  outstandingPayments: raw.outstandingPayments ?? raw.outstanding_payments ?? raw.pending_invoices ?? 0,
  supplierPaymentsDue: raw.supplierPaymentsDue ?? raw.supplier_payments_due ?? 0,
  todayRevenue: raw.todayRevenue ?? raw.today_revenue ?? 0,
  monthlyRevenue: raw.monthlyRevenue ?? raw.monthly_revenue ?? 0,
});

const unwrapFinancePayload = (axiosResponse) => axiosResponse?.data?.data ?? axiosResponse?.data ?? null;

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// CONSTANTS
// ==========================================
const CURRENCY = 'SAR';
const LOCALE = 'ar-SA';

const formatNumber = (value) => Number(value ?? 0).toLocaleString(LOCALE);

const getFinanceStatusLabel = (status, t) => {
  const statusMap = {
    Paid: t('common.statuses.paid'),
    Pending: t('common.pending'),
    Overdue: t('common.statuses.overdue'),
  };
  return statusMap[status] || status;
};

// ==========================================
// KPI CARD
// ==========================================
const KPICard = ({ icon: Icon, title, value, change, subtitle, color, isCurrency }) => {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
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
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#3D2F24] mt-2">
        {isCurrency ? `${formatNumber(value)} ${CURRENCY}` : formatNumber(value)}
      </p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
      {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// ==========================================
// FINANCIAL CHART
// ==========================================
const FinancialChart = ({ data, t }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.revenueVsExpenses')}</h3>
          <p className="text-xs text-[#6D6D6D]">{t('finance.last12Months')}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B8863B]" />
            {t('finance.revenue')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            {t('finance.expenses')}
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E1" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6D6D6D' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ECE8E1',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              formatter={(value) => [`${formatNumber(value)} ${CURRENCY}`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#B8863B"
              strokeWidth={2.5}
              dot={{ fill: '#B8863B', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={t('finance.revenue')}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#F43F5E"
              strokeWidth={2.5}
              dot={{ fill: '#F43F5E', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={t('finance.expenses')}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// EXPENSE PIE CHART
// ==========================================
const ExpensePieChart = ({ data, t }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">{t('finance.expenseBreakdown')}</h3>
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

// ==========================================
// TRANSACTION DETAILS MODAL
// ==========================================
const TransactionDetailsModal = ({ isOpen, onClose, transaction, t }) => {
  if (!isOpen || !transaction) return null;

  const isPositive = transaction.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('common.details')}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('finance.table.id')}</span><span className="font-medium text-[#3D2F24]">{transaction.id}</span></div>
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('common.date')}</span><span className="text-[#3D2F24]">{transaction.date}</span></div>
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('finance.table.type')}</span><span className="text-[#3D2F24]">{transaction.type}</span></div>
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('finance.table.customerSupplier')}</span><span className="text-[#3D2F24]">{transaction.customer}</span></div>
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('finance.table.method')}</span><span className="text-[#3D2F24]">{transaction.method}</span></div>
          <div className="flex justify-between"><span className="text-[#6D6D6D]">{t('finance.table.status')}</span><span className="text-[#3D2F24]">{getFinanceStatusLabel(transaction.status, t)}</span></div>
          <div className="flex justify-between pt-2 border-t border-[#ECE8E1]">
            <span className="text-[#6D6D6D]">{t('finance.table.amount')}</span>
            <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? '+' : ''}{formatNumber(transaction.amount)} {CURRENCY}
            </span>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button type="button" onClick={onClose} className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg">
            {t('common.close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// TRANSACTION CARD (Mobile)
// ==========================================
const TransactionCard = ({ transaction, t, onView }) => {
  const isPositive = transaction.amount > 0;

  return (
    <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#3D2F24]">{transaction.id}</p>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          transaction.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          transaction.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-gray-50 text-gray-600 border-gray-200'
        }`}>
          {getFinanceStatusLabel(transaction.status, t)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-[#6D6D6D]">
        <span>{t('common.date')}: {transaction.date}</span>
        <span>{t('finance.table.type')}: {transaction.type}</span>
      </div>
      <p className="text-sm font-medium text-[#3D2F24] mt-1">{transaction.customer}</p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECE8E1]">
        <span className="text-xs text-[#6D6D6D]">{transaction.method}</span>
        <div className="flex items-center gap-2">
          {onView && (
            <button type="button" onClick={() => onView(transaction)} className="p-1 hover:bg-white rounded-lg" title={t('common.view')}>
              <Eye size={14} className="text-[#6D6D6D]" />
            </button>
          )}
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{formatNumber(transaction.amount)} {CURRENCY}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PENDING PAYMENT CARD
// ==========================================
const PendingPaymentCard = ({ payment, type, t }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#3D2F24]">{type === 'customer' ? payment.invoice : payment.purchaseOrder}</p>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
          payment.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {getFinanceStatusLabel(payment.status, t)}
        </span>
      </div>
      <p className="text-sm text-[#3D2F24] mt-1">{type === 'customer' ? payment.customer : payment.supplier}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[#6D6D6D]">{t('finance.dueDateLabel', { date: payment.dueDate })}</span>
        <span className="text-sm font-bold text-[#3D2F24]">{formatNumber(payment.amount)} {CURRENCY}</span>
      </div>
    </div>
  );
};

// ==========================================
// NOTIFICATION ITEM
// ==========================================
const NotificationItem = ({ notification }) => {
  const iconMap = {
    warning: AlertCircle,
    success: CheckCircle,
    info: Clock
  };
  const Icon = iconMap[notification.type] || Clock;
  const colorMap = {
    warning: 'text-amber-500 bg-amber-50 border-amber-200',
    success: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    info: 'text-blue-500 bg-blue-50 border-blue-200'
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[notification.type]}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-medium text-[#3D2F24]">{notification.title}</p>
        <p className="text-[10px] text-[#6D6D6D]">{notification.time}</p>
      </div>
    </div>
  );
};

// ==========================================
// TOP CUSTOMER CARD (Mobile)
// ==========================================
const TopCustomerCard = ({ customer, t }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#3D2F24]">{customer.customer}</p>
        <span className="text-xs font-medium text-[#6D6D6D]">{t('finance.ordersCount', { count: customer.orders })}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span className="text-[#6D6D6D]">{t('finance.revenue')}</span>
        <span className="font-medium text-[#3D2F24]">{formatNumber(customer.revenue)} {CURRENCY}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6D6D6D]">{t('finance.outstanding')}</span>
        <span className="font-medium text-amber-600">{formatNumber(customer.outstanding)} {CURRENCY}</span>
      </div>
    </div>
  );
};

// ==========================================
// TOP SUPPLIER CARD (Mobile)
// ==========================================
const TopSupplierCard = ({ supplier, t }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#3D2F24]">{supplier.supplier}</p>
        <span className="text-xs font-medium text-[#6D6D6D]">{t('finance.purchasesCount', { count: supplier.purchases })}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span className="text-[#6D6D6D]">{t('common.amount')}</span>
        <span className="font-medium text-[#3D2F24]">{formatNumber(supplier.amount)} {CURRENCY}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6D6D6D]">{t('finance.lastPurchase')}</span>
        <span className="font-medium text-[#6D6D6D]">{supplier.lastPurchase}</span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN FINANCE PAGE
// ==========================================
const FinancePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('year');
  const [viewMode, setViewMode] = useState('table');
  const [isExporting, setIsExporting] = useState(false);

  // State for API data
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashBalance: 0,
    outstandingPayments: 0,
    supplierPaymentsDue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Load all finance data
  const loadFinanceData = async () => {
    setIsLoading(true);
    let firstError = null;

    try {
      const params = { period: dateRange };

      const [
        metricsRes,
        revenueRes,
        expenseRes,
        transRes,
        custPayRes,
        suppPayRes,
        topCustRes,
        topSuppRes,
        notifRes,
      ] = await Promise.allSettled([
        getFinanceMetrics(params),
        getRevenueExpensesData(params),
        getExpenseCategories(params),
        getRecentTransactions({ ...params, per_page: 10 }),
        getPendingCustomerPayments(params),
        getPendingSupplierPayments(params),
        getTopCustomers({ ...params, limit: 4 }),
        getTopSuppliers({ ...params, limit: 4 }),
        getFinanceNotifications({ ...params, limit: 5 }),
      ]);

      const resolveResponse = (result, fallback) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        if (!firstError) {
          firstError = result.reason;
        }
        console.error('Finance section failed:', result.reason);
        return null;
      };

      const metricsPayload = unwrapFinancePayload(resolveResponse(metricsRes));
      if (metricsPayload) {
        setMetrics(normalizeFinanceMetrics(metricsPayload));
      }

      setMonthlyData(safeArray(resolveResponse(revenueRes)?.data));
      setExpenseCategories(safeArray(resolveResponse(expenseRes)?.data));
      setTransactions(safeArray(resolveResponse(transRes)?.data));
      setCustomerPayments(safeArray(resolveResponse(custPayRes)?.data));
      setSupplierPayments(safeArray(resolveResponse(suppPayRes)?.data));
      setTopCustomers(safeArray(resolveResponse(topCustRes)?.data));
      setTopSuppliers(safeArray(resolveResponse(topSuppRes)?.data));
      setNotifications(safeArray(resolveResponse(notifRes)?.data));

      if (firstError) {
        showToast(getApiErrorMessage(firstError, t('finance.errors.load', t('errors.loadFailed'))), 'error');
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      showToast(getApiErrorMessage(error, t('finance.errors.load', t('errors.loadFailed'))), 'error');
      setMonthlyData([]);
      setExpenseCategories([]);
      setTransactions([]);
      setCustomerPayments([]);
      setSupplierPayments([]);
      setTopCustomers([]);
      setTopSuppliers([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, [dateRange]);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const dateRangeLabels = useMemo(() => ({
    today: t('common.periods.today'),
    week: t('common.periods.week'),
    month: t('common.periods.month'),
    quarter: t('common.periods.quarter'),
    year: t('common.periods.year'),
  }), [t]);

  const columns = useMemo(() => [
    { label: t('finance.table.id'), accessor: 'id', width: 10 },
    { label: t('finance.table.date'), accessor: 'date', width: 12 },
    { label: t('finance.table.type'), accessor: 'type', width: 12 },
    { label: t('finance.table.customerSupplier'), accessor: 'customer', width: 20 },
    { label: t('finance.table.amount'), accessor: 'amount', width: 15 },
    { label: t('finance.table.method'), accessor: 'method', width: 12 },
    { label: t('finance.table.status'), accessor: 'status', width: 12 }
  ], [t]);

  const rowFormatter = (item) => ({
    id: item.id,
    date: item.date,
    type: item.type,
    customer: item.customer,
    amount: `${formatNumber(item.amount)} ${CURRENCY}`,
    method: item.method,
    status: getFinanceStatusLabel(item.status, t)
  });

  const summary = useMemo(() => [
    { label: t('finance.kpi.totalRevenue'), value: `${formatNumber(metrics.totalRevenue)} ${CURRENCY}` },
    { label: t('finance.kpi.totalExpenses'), value: `${formatNumber(metrics.totalExpenses)} ${CURRENCY}` },
    { label: t('finance.kpi.netProfit'), value: `${formatNumber(metrics.netProfit)} ${CURRENCY}` },
    { label: t('finance.kpi.cashBalance'), value: `${formatNumber(metrics.cashBalance)} ${CURRENCY}` },
    { label: t('finance.kpi.outstandingPayments'), value: `${formatNumber(metrics.outstandingPayments)} ${CURRENCY}` },
    { label: t('finance.kpi.supplierPaymentsDue'), value: `${formatNumber(metrics.supplierPaymentsDue)} ${CURRENCY}` },
    { label: t('finance.kpi.todayRevenue'), value: `${formatNumber(metrics.todayRevenue)} ${CURRENCY}` },
    { label: t('finance.kpi.monthlyRevenue'), value: `${formatNumber(metrics.monthlyRevenue)} ${CURRENCY}` }
  ], [metrics, t]);

  const quickActions = useMemo(() => [
    { label: t('finance.quickActions.createInvoice'), action: 'create_invoice', icon: FileText, color: '#B8863B' },
    { label: t('finance.quickActions.receivePayment'), action: 'receive_payment', icon: CreditCard, color: '#22C55E' },
    { label: t('finance.quickActions.addExpense'), action: 'add_expense', icon: Wallet, color: '#EF4444' },
    { label: t('finance.quickActions.purchaseOrder'), action: 'purchase_order', icon: Package, color: '#3B82F6' },
    { label: t('finance.quickActions.financialReports'), action: 'financial_reports', icon: BarChart3, color: '#8B5CF6' },
    { label: t('finance.quickActions.accounting'), action: 'accounting', icon: Settings, color: '#F59E0B' }
  ], [t]);

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ExportButtons
  };

  const handleRefresh = async () => {
    await loadFinanceData();
    showToast(t('common.dataRefreshed'), 'success');
  };

  const handleViewAllTransactions = () => {
    navigate('/dashboard/payments');
  };

  const handleViewAllPayments = () => {
    navigate('/dashboard/payments');
  };

  const handleViewAllSuppliers = () => {
    navigate('/dashboard/suppliers');
  };

  const handleQuickAction = (action) => {
    const routes = {
      create_invoice: '/dashboard/invoices',
      receive_payment: '/dashboard/payments',
      add_expense: '/dashboard/expenses',
      purchase_order: '/dashboard/orders',
      financial_reports: '/dashboard/reports',
      accounting: '/dashboard/settings',
    };
    navigate(routes[action] || '/dashboard/finance');
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-4 md:p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('finance.title')}
          </h1>
          <p className="text-sm text-[#6D6D6D]">{t('finance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
          >
            <option value="today">{t('common.periods.today')}</option>
            <option value="week">{t('common.periods.week')}</option>
            <option value="month">{t('common.periods.month')}</option>
            <option value="quarter">{t('common.periods.quarter')}</option>
            <option value="year">{t('common.periods.year')}</option>
          </select>
          <ExportButtons
            data={transactions}
            columns={columns}
            title={t('finance.financialReport')}
            subtitle={t('finance.periodLabel', {
              period: dateRangeLabels[dateRange] || dateRange,
              date: new Date().toLocaleDateString(LOCALE),
            })}
            filename={`finance_report_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title={t('common.refresh')}
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KPICard icon={TrendingUp} title={t('finance.kpi.totalRevenue')} value={metrics.totalRevenue} change={12} color="green" isCurrency />
        <KPICard icon={Wallet} title={t('finance.kpi.totalExpenses')} value={metrics.totalExpenses} change={-3} color="rose" isCurrency />
        <KPICard icon={DollarSign} title={t('finance.kpi.netProfit')} value={metrics.netProfit} change={18} color="gold" isCurrency />
        <KPICard icon={CreditCard} title={t('finance.kpi.cashBalance')} value={metrics.cashBalance} color="teal" isCurrency />
        <KPICard icon={Clock} title={t('finance.kpi.outstandingPayments')} value={metrics.outstandingPayments} change={5} color="amber" isCurrency />
        <KPICard icon={Building} title={t('finance.kpi.supplierPaymentsDue')} value={metrics.supplierPaymentsDue} change={8} color="purple" isCurrency />
        <KPICard icon={Calendar} title={t('finance.kpi.todayRevenue')} value={metrics.todayRevenue} change={15} color="blue" isCurrency />
        <KPICard icon={TrendingUp} title={t('finance.kpi.monthlyRevenue')} value={metrics.monthlyRevenue} change={22} color="emerald" isCurrency />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-white/80">{t('finance.kpi.totalRevenue')}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{formatNumber(metrics.totalRevenue)} {CURRENCY}</p>
          <p className="text-xs text-white/70 mt-2">{t('finance.fromLastMonth', { percent: 12 })}</p>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6D6D6D]">{t('finance.kpi.totalExpenses')}</p>
          <p className="text-2xl md:text-3xl font-bold text-[#3D2F24] mt-1">{formatNumber(metrics.totalExpenses)} {CURRENCY}</p>
          <p className="text-xs text-rose-500 mt-2">{t('finance.fromLastMonth', { percent: 3 })}</p>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6D6D6D]">{t('finance.kpi.netProfit')}</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">{formatNumber(metrics.netProfit)} {CURRENCY}</p>
          <p className="text-xs text-emerald-500 mt-2">{t('finance.fromLastMonth', { percent: 18 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FinancialChart data={monthlyData} t={t} />
        <ExpensePieChart data={expenseCategories} t={t} />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {quickActions.map((action, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => handleQuickAction(action.action)}
            className="bg-white border border-[#ECE8E1] rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
              <action.icon size={20} style={{ color: action.color }} />
            </div>
            <p className="text-[10px] font-medium text-[#3D2F24] mt-2">{action.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-[#ECE8E1] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.recentTransactions')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.recentTransactionsSubtitle')}</p>
          </div>
          <button
            onClick={handleViewAllTransactions}
            className="text-xs font-medium text-[#B8863B] hover:underline"
          >
            {t('finance.viewAll')}
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.id')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.type')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.customerSupplier')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.method')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.table.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {ensureArray(transactions).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]">
                  <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">{transaction.id}</td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.date}</td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.type}</td>
                  <td className="px-4 py-3 text-sm text-[#3D2F24]">{transaction.customer}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatNumber(transaction.amount)} {CURRENCY}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      transaction.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      transaction.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {getFinanceStatusLabel(transaction.status, t)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => handleViewTransaction(transaction)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors" title={t('common.view')}>
                      <Eye size={16} className="text-[#6D6D6D]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-3">
          {ensureArray(transactions).map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} t={t} onView={handleViewTransaction} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.pendingCustomerPayments')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.pendingCustomerPaymentsSubtitle')}</p>
          </div>
          <div className="p-4 space-y-3">
            {ensureArray(customerPayments).map((payment, idx) => (
              <PendingPaymentCard key={idx} payment={payment} type="customer" t={t} />
            ))}
            <button
              onClick={handleViewAllPayments}
              className="w-full py-2 text-xs font-medium text-[#B8863B] border border-[#B8863B] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {t('finance.viewPayments')}
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.pendingSupplierPayments')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.pendingSupplierPaymentsSubtitle')}</p>
          </div>
          <div className="p-4 space-y-3">
            {ensureArray(supplierPayments).map((payment, idx) => (
              <PendingPaymentCard key={idx} payment={payment} type="supplier" t={t} />
            ))}
            <button
              onClick={handleViewAllSuppliers}
              className="w-full py-2 text-xs font-medium text-[#B8863B] border border-[#B8863B] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              {t('finance.viewSuppliers')}
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('notifications.title')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.financeNotificationsSubtitle')}</p>
          </div>
          <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
            {ensureArray(notifications).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.topCustomers')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.topCustomersSubtitle')}</p>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.customerLabel')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('customers.table.orders')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.revenue')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.outstanding')}</th>
                </tr>
              </thead>
              <tbody>
                {ensureArray(topCustomers).map((customer, idx) => (
                  <tr key={idx} className="border-b border-[#ECE8E1] last:border-0">
                    <td className="px-4 py-2 text-sm text-[#3D2F24]">{customer.customer}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{customer.orders}</td>
                    <td className="px-4 py-2 text-sm font-medium text-[#3D2F24]">{formatNumber(customer.revenue)} {CURRENCY}</td>
                    <td className="px-4 py-2 text-sm font-medium text-amber-600">{formatNumber(customer.outstanding)} {CURRENCY}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden p-4 space-y-3">
            {ensureArray(topCustomers).map((customer, idx) => (
              <TopCustomerCard key={idx} customer={customer} t={t} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">{t('finance.topSuppliers')}</h3>
            <p className="text-xs text-[#6D6D6D]">{t('finance.topSuppliersSubtitle')}</p>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.supplier')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.purchases')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('common.amount')}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">{t('finance.lastPurchase')}</th>
                </tr>
              </thead>
              <tbody>
                {ensureArray(topSuppliers).map((supplier, idx) => (
                  <tr key={idx} className="border-b border-[#ECE8E1] last:border-0">
                    <td className="px-4 py-2 text-sm text-[#3D2F24]">{supplier.supplier}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{supplier.purchases}</td>
                    <td className="px-4 py-2 text-sm font-medium text-[#3D2F24]">{formatNumber(supplier.amount)} {CURRENCY}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{supplier.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden p-4 space-y-3">
            {ensureArray(topSuppliers).map((supplier, idx) => (
              <TopSupplierCard key={idx} supplier={supplier} t={t} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isTransactionModalOpen && selectedTransaction && (
          <TransactionDetailsModal
            isOpen={isTransactionModalOpen}
            transaction={selectedTransaction}
            t={t}
            onClose={() => {
              setIsTransactionModalOpen(false);
              setSelectedTransaction(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancePage;