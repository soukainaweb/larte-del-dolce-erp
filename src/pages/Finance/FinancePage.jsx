// src/pages/Finance/FinancePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
// MOCK DATA
// ==========================================
const monthlyData = [
  { month: 'Jan', revenue: 85000, expenses: 62000, profit: 23000 },
  { month: 'Feb', revenue: 92000, expenses: 58000, profit: 34000 },
  { month: 'Mar', revenue: 105000, expenses: 72000, profit: 33000 },
  { month: 'Apr', revenue: 98000, expenses: 65000, profit: 33000 },
  { month: 'May', revenue: 112000, expenses: 78000, profit: 34000 },
  { month: 'Jun', revenue: 125000, expenses: 82000, profit: 43000 },
  { month: 'Jul', revenue: 118000, expenses: 79000, profit: 39000 },
  { month: 'Aug', revenue: 135000, expenses: 85000, profit: 50000 },
  { month: 'Sep', revenue: 142000, expenses: 88000, profit: 54000 },
  { month: 'Oct', revenue: 155000, expenses: 95000, profit: 60000 },
  { month: 'Nov', revenue: 148000, expenses: 92000, profit: 56000 },
  { month: 'Dec', revenue: 160000, expenses: 98000, profit: 62000 }
];

const expenseCategories = [
  { name: 'Matières premières', value: 35, color: '#B8863B' },
  { name: 'Salaires', value: 25, color: '#D4AF37' },
  { name: 'Emballages', value: 15, color: '#8B7355' },
  { name: 'Services publics', value: 10, color: '#C8A98E' },
  { name: 'Transport', value: 8, color: '#A68B6B' },
  { name: 'Marketing', value: 5, color: '#E8D5B7' },
  { name: 'Loyer', value: 2, color: '#6B5842' }
];

const recentTransactions = [
  { id: 'TR-0001', date: '12 Jul 2025', type: 'Payment', customer: 'Ahmed Ali', amount: 350, method: 'Mada', status: 'Paid' },
  { id: 'TR-0002', date: '12 Jul 2025', type: 'Expense', customer: 'ABC Supplier', amount: -980, method: 'Bank Transfer', status: 'Paid' },
  { id: 'TR-0003', date: '11 Jul 2025', type: 'Payment', customer: 'Sara Mohamed', amount: 450, method: 'Card', status: 'Paid' },
  { id: 'TR-0004', date: '11 Jul 2025', type: 'Expense', customer: 'Rent Payment', amount: -10000, method: 'Cash', status: 'Paid' },
  { id: 'TR-0005', date: '10 Jul 2025', type: 'Refund', customer: 'Omar Hassan', amount: -120, method: 'STC Pay', status: 'Done' }
];

const pendingCustomerPayments = [
  { invoice: 'INV-1025', customer: 'Ahmed Ali', dueDate: '15 Jul 2025', amount: 4500, status: 'Pending' },
  { invoice: 'INV-1023', customer: 'Sara Mohamed', dueDate: '16 Jul 2025', amount: 2800, status: 'Pending' },
  { invoice: 'INV-1022', customer: 'Omar Hassan', dueDate: '17 Jul 2025', amount: 3250, status: 'Overdue' },
  { invoice: 'INV-1021', customer: 'Khalid Ahmed', dueDate: '18 Jul 2025', amount: 1950, status: 'Pending' }
];

const pendingSupplierPayments = [
  { supplier: 'ABC Supplier', purchaseOrder: 'PO-001', dueDate: '15 Jul 2025', amount: 4500, status: 'Pending' },
  { supplier: 'Fresh Milk Co.', purchaseOrder: 'PO-002', dueDate: '16 Jul 2025', amount: 2800, status: 'Pending' },
  { supplier: 'Packaging Co.', purchaseOrder: 'PO-003', dueDate: '17 Jul 2025', amount: 3250, status: 'Overdue' },
  { supplier: 'Fruit Supplier', purchaseOrder: 'PO-004', dueDate: '18 Jul 2025', amount: 1950, status: 'Pending' }
];

const topCustomers = [
  { customer: 'Ahmed Ali', orders: 120, revenue: 245000, outstanding: 4500 },
  { customer: 'Sara Mohamed', orders: 98, revenue: 185000, outstanding: 2800 },
  { customer: 'Omar Hassan', orders: 76, revenue: 132000, outstanding: 3250 },
  { customer: 'Khalid Ahmed', orders: 68, revenue: 118000, outstanding: 1950 }
];

const topSuppliers = [
  { supplier: 'ABC Supplier', purchases: 85, amount: 245000, lastPurchase: '12 Jul 2024' },
  { supplier: 'Fresh Milk Co.', purchases: 74, amount: 185000, lastPurchase: '11 Jul 2024' },
  { supplier: 'Packaging Co.', purchases: 55, amount: 132000, lastPurchase: '10 Jul 2024' },
  { supplier: 'Fruit Supplier', purchases: 45, amount: 118000, lastPurchase: '09 Jul 2024' }
];

const notifications = [
  { id: 1, type: 'warning', title: 'Supplier payment to ABC Supplier is due tomorrow', time: '1 hour ago' },
  { id: 2, type: 'info', title: 'High expenses detected this month', time: '2 hours ago' },
  { id: 3, type: 'success', title: 'Revenue increased by 18% this month', time: '3 hours ago' },
  { id: 4, type: 'warning', title: 'Low stock items affecting profit', time: '4 hours ago' },
  { id: 5, type: 'success', title: 'Customer payment received from Ahmed Ali', time: '5 hours ago' }
];

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
        {isCurrency ? `${value.toLocaleString()} ${CURRENCY}` : value}
      </p>
      <p className="text-xs text-[#6D6D6D]">{title}</p>
      {subtitle && <p className="text-[10px] text-[#6D6D6D] mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// ==========================================
// FINANCIAL CHART
// ==========================================
const FinancialChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3D2F24]">Revenue vs Expenses</h3>
          <p className="text-xs text-[#6D6D6D]">12 derniers mois</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B8863B]" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            Expenses
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
              formatter={(value) => [`${value.toLocaleString()} ${CURRENCY}`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#B8863B"
              strokeWidth={2.5}
              dot={{ fill: '#B8863B', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#F43F5E"
              strokeWidth={2.5}
              dot={{ fill: '#F43F5E', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Expenses"
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
const ExpensePieChart = ({ data }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#3D2F24] mb-4">Répartition des dépenses</h3>
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
// TRANSACTION CARD (Mobile)
// ==========================================
const TransactionCard = ({ transaction }) => {
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
          {transaction.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-[#6D6D6D]">
        <span>Date: {transaction.date}</span>
        <span>Type: {transaction.type}</span>
      </div>
      <p className="text-sm font-medium text-[#3D2F24] mt-1">{transaction.customer}</p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECE8E1]">
        <span className="text-xs text-[#6D6D6D]">{transaction.method}</span>
        <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? '+' : ''}{transaction.amount.toLocaleString()} {CURRENCY}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// PENDING PAYMENT CARD
// ==========================================
const PendingPaymentCard = ({ payment, type }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#3D2F24]">{type === 'customer' ? payment.invoice : payment.purchaseOrder}</p>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
          payment.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {payment.status}
        </span>
      </div>
      <p className="text-sm text-[#3D2F24] mt-1">{type === 'customer' ? payment.customer : payment.supplier}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[#6D6D6D]">Échéance: {payment.dueDate}</span>
        <span className="text-sm font-bold text-[#3D2F24]">{payment.amount.toLocaleString()} {CURRENCY}</span>
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
const TopCustomerCard = ({ customer }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#3D2F24]">{customer.customer}</p>
        <span className="text-xs font-medium text-[#6D6D6D]">{customer.orders} orders</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span className="text-[#6D6D6D]">Revenue</span>
        <span className="font-medium text-[#3D2F24]">{customer.revenue.toLocaleString()} {CURRENCY}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6D6D6D]">Outstanding</span>
        <span className="font-medium text-amber-600">{customer.outstanding.toLocaleString()} {CURRENCY}</span>
      </div>
    </div>
  );
};

// ==========================================
// TOP SUPPLIER CARD (Mobile)
// ==========================================
const TopSupplierCard = ({ supplier }) => {
  return (
    <div className="bg-[#F8F7F4] rounded-lg p-3 border border-[#ECE8E1]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#3D2F24]">{supplier.supplier}</p>
        <span className="text-xs font-medium text-[#6D6D6D]">{supplier.purchases} purchases</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span className="text-[#6D6D6D]">Amount</span>
        <span className="font-medium text-[#3D2F24]">{supplier.amount.toLocaleString()} {CURRENCY}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6D6D6D]">Last Purchase</span>
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
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('year');
  const [viewMode, setViewMode] = useState('table');
  const [isExporting, setIsExporting] = useState(false);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const cashBalance = 510000;
    const outstandingPayments = 45000;
    const supplierPaymentsDue = 78000;
    const todayRevenue = 12450;
    const monthlyRevenue = 160000;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashBalance,
      outstandingPayments,
      supplierPaymentsDue,
      todayRevenue,
      monthlyRevenue
    };
  }, []);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'ID', accessor: 'id', width: 10 },
    { label: 'Date', accessor: 'date', width: 12 },
    { label: 'Type', accessor: 'type', width: 12 },
    { label: 'Client/Fournisseur', accessor: 'customer', width: 20 },
    { label: 'Montant', accessor: 'amount', width: 15 },
    { label: 'Méthode', accessor: 'method', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 }
  ];

  const rowFormatter = (item) => ({
    id: item.id,
    date: item.date,
    type: item.type,
    customer: item.customer,
    amount: `${item.amount.toLocaleString()} ${CURRENCY}`,
    method: item.method,
    status: item.status
  });

  const summary = [
    { label: 'Total Revenue', value: `${metrics.totalRevenue.toLocaleString()} ${CURRENCY}` },
    { label: 'Total Expenses', value: `${metrics.totalExpenses.toLocaleString()} ${CURRENCY}` },
    { label: 'Net Profit', value: `${metrics.netProfit.toLocaleString()} ${CURRENCY}` },
    { label: 'Cash Balance', value: `${metrics.cashBalance.toLocaleString()} ${CURRENCY}` },
    { label: 'Outstanding Payments', value: `${metrics.outstandingPayments.toLocaleString()} ${CURRENCY}` },
    { label: 'Supplier Payments Due', value: `${metrics.supplierPaymentsDue.toLocaleString()} ${CURRENCY}` },
    { label: "Today's Revenue", value: `${metrics.todayRevenue.toLocaleString()} ${CURRENCY}` },
    { label: 'Monthly Revenue', value: `${metrics.monthlyRevenue.toLocaleString()} ${CURRENCY}` }
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

  // ===== FIX: Handler functions =====
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Données actualisées');
    }, 500);
  };

  const handleViewAllTransactions = () => {
    alert('Redirection vers la page des transactions');
  };

  const handleViewAllPayments = () => {
    alert('Redirection vers la page des paiements');
  };

  const handleViewAllSuppliers = () => {
    alert('Redirection vers la page des fournisseurs');
  };

  const handleQuickAction = (action) => {
    alert(`Action: ${action} - Redirection vers la page correspondante`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-4 md:p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Finance Dashboard
          </h1>
          <p className="text-sm text-[#6D6D6D]">Vue globale de la santé financière</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          {/* Export Buttons */}
          <ExportButtons
            data={recentTransactions}
            columns={columns}
            title="Rapport financier"
            subtitle={`Période: ${dateRange} - ${new Date().toLocaleDateString('fr-FR')}`}
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
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KPICard icon={TrendingUp} title="Total Revenue" value={metrics.totalRevenue} change={12} color="green" isCurrency />
        <KPICard icon={Wallet} title="Total Expenses" value={metrics.totalExpenses} change={-3} color="rose" isCurrency />
        <KPICard icon={DollarSign} title="Net Profit" value={metrics.netProfit} change={18} color="gold" isCurrency />
        <KPICard icon={CreditCard} title="Cash Balance" value={metrics.cashBalance} color="teal" isCurrency />
        <KPICard icon={Clock} title="Outstanding Payments" value={metrics.outstandingPayments} change={5} color="amber" isCurrency />
        <KPICard icon={Building} title="Supplier Payments Due" value={metrics.supplierPaymentsDue} change={8} color="purple" isCurrency />
        <KPICard icon={Calendar} title="Today's Revenue" value={metrics.todayRevenue} change={15} color="blue" isCurrency />
        <KPICard icon={TrendingUp} title="Monthly Revenue" value={metrics.monthlyRevenue} change={22} color="emerald" isCurrency />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-white/80">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{metrics.totalRevenue.toLocaleString()} {CURRENCY}</p>
          <p className="text-xs text-white/70 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6D6D6D]">Total Expenses</p>
          <p className="text-2xl md:text-3xl font-bold text-[#3D2F24] mt-1">{metrics.totalExpenses.toLocaleString()} {CURRENCY}</p>
          <p className="text-xs text-rose-500 mt-2">↑ 3% from last month</p>
        </div>
        <div className="bg-white border border-[#ECE8E1] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6D6D6D]">Net Profit</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">{metrics.netProfit.toLocaleString()} {CURRENCY}</p>
          <p className="text-xs text-emerald-500 mt-2">↑ 18% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FinancialChart data={monthlyData} />
        <ExpensePieChart data={expenseCategories} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Create Invoice', action: 'create_invoice', icon: FileText, color: '#B8863B' },
          { label: 'Receive Payment', action: 'receive_payment', icon: CreditCard, color: '#22C55E' },
          { label: 'Add Expense', action: 'add_expense', icon: Wallet, color: '#EF4444' },
          { label: 'Purchase Order', action: 'purchase_order', icon: Package, color: '#3B82F6' },
          { label: 'Financial Reports', action: 'financial_reports', icon: BarChart3, color: '#8B5CF6' },
          { label: 'Accounting', action: 'accounting', icon: Settings, color: '#F59E0B' }
        ].map((action, idx) => (
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

      {/* Recent Transactions - Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-[#ECE8E1] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#3D2F24]">Recent Transactions</h3>
            <p className="text-xs text-[#6D6D6D]">Dernières transactions financières</p>
          </div>
          <button
            onClick={handleViewAllTransactions}
            className="text-xs font-medium text-[#B8863B] hover:underline"
          >
            View All
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Customer / Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr key={transaction.id} className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]">
                  <td className="px-4 py-3 text-sm font-medium text-[#3D2F24]">{transaction.id}</td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.date}</td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.type}</td>
                  <td className="px-4 py-3 text-sm text-[#3D2F24]">{transaction.customer}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} {CURRENCY}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6D6D6D]">{transaction.method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      transaction.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      transaction.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
                      <Eye size={16} className="text-[#6D6D6D]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {recentTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>

      {/* Pending Payments & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Customer Payments */}
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">Pending Customer Payments</h3>
            <p className="text-xs text-[#6D6D6D]">Paiements clients en attente</p>
          </div>
          <div className="p-4 space-y-3">
            {pendingCustomerPayments.map((payment, idx) => (
              <PendingPaymentCard key={idx} payment={payment} type="customer" />
            ))}
            <button
              onClick={handleViewAllPayments}
              className="w-full py-2 text-xs font-medium text-[#B8863B] border border-[#B8863B] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              View All Payments
            </button>
          </div>
        </div>

        {/* Pending Supplier Payments */}
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">Pending Supplier Payments</h3>
            <p className="text-xs text-[#6D6D6D]">Paiements fournisseurs en attente</p>
          </div>
          <div className="p-4 space-y-3">
            {pendingSupplierPayments.map((payment, idx) => (
              <PendingPaymentCard key={idx} payment={payment} type="supplier" />
            ))}
            <button
              onClick={handleViewAllSuppliers}
              className="w-full py-2 text-xs font-medium text-[#B8863B] border border-[#B8863B] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              View All Suppliers
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">Notifications</h3>
            <p className="text-xs text-[#6D6D6D]">Alertes financières</p>
          </div>
          <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Customers */}
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">Top Customers</h3>
            <p className="text-xs text-[#6D6D6D]">Clients avec le plus de revenus</p>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Revenue</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, idx) => (
                  <tr key={idx} className="border-b border-[#ECE8E1] last:border-0">
                    <td className="px-4 py-2 text-sm text-[#3D2F24]">{customer.customer}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{customer.orders}</td>
                    <td className="px-4 py-2 text-sm font-medium text-[#3D2F24]">{customer.revenue.toLocaleString()} {CURRENCY}</td>
                    <td className="px-4 py-2 text-sm font-medium text-amber-600">{customer.outstanding.toLocaleString()} {CURRENCY}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {topCustomers.map((customer, idx) => (
              <TopCustomerCard key={idx} customer={customer} />
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#ECE8E1]">
            <h3 className="text-sm font-bold text-[#3D2F24]">Top Suppliers</h3>
            <p className="text-xs text-[#6D6D6D]">Fournisseurs avec le plus d'achats</p>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Purchases</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#6D6D6D] uppercase tracking-wider">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.map((supplier, idx) => (
                  <tr key={idx} className="border-b border-[#ECE8E1] last:border-0">
                    <td className="px-4 py-2 text-sm text-[#3D2F24]">{supplier.supplier}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{supplier.purchases}</td>
                    <td className="px-4 py-2 text-sm font-medium text-[#3D2F24]">{supplier.amount.toLocaleString()} {CURRENCY}</td>
                    <td className="px-4 py-2 text-sm text-[#6D6D6D]">{supplier.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {topSuppliers.map((supplier, idx) => (
              <TopSupplierCard key={idx} supplier={supplier} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;