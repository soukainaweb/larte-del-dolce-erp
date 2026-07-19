// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';

// Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ChangePassword from '../pages/auth/ChangePassword';
import DashboardHome from '../pages/dashboardHome/DashboardHome';
import MyProfile from '../pages/myprofile/MyProfilePage';
import CustomersPage from '../pages/customers/CustomersPage';
import UsersPage from '../pages/users/UsersPage';
import ProductsPage from '../pages/products/ProductsPage';
import ProductionPage from '../pages/production/ProductionPage';
import OrdersPage from '../pages/orders/OrdersPage';
import CategoriesPage from '../pages/categories/CategoriesPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import WarehousePage from '../pages/warehouse/WarehousePage';
import SuppliersPage from '../pages/suppliers/SuppliersPage';
import DeliveriesPage from '../pages/deliveries/DeliveriesPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import ExpensesPage from '../pages/expenses/ExpensesPage';
import FinancePage from '../pages/finance/FinancePage';
import ReportsPage from '../pages/reports/ReportsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import RolesPermissionsPage from '../pages/RolesPermissions/RolesPermissionsPage';

// ⭐ NOUVEAU : Importer la page Journal d'activité
import ActivityLogPage from '../pages/activitylog/ActivityLogPage';

// Composant de fallback
import ModuleFallback from '../components/ModuleFallback';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App Routes
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Protected Routes - DashboardLayout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Pages principales */}
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="warehouse" element={<WarehousePage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} /> 
        <Route path="invoices" element={<InvoicesPage />} /> 
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} /> 
        <Route path="finance" element={<FinancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="roles" element={<RolesPermissionsPage />} />
        <Route path="roles/*" element={<RolesPermissionsPage />} />

        {/* ⭐ NOUVEAU : Route pour Journal d'activité */}
        <Route path="activity-logs" element={<ActivityLogPage />} />
        <Route path="activity-logs/*" element={<ActivityLogPage />} />

        {/* Routes de détail - Fallback */}
        <Route path="orders/:id" element={<ModuleFallback module="order" />} />
        <Route path="customers/:id" element={<ModuleFallback module="customer" />} />
        <Route path="products/:id" element={<ModuleFallback module="product" />} />
        <Route path="production/:id" element={<ModuleFallback module="production" />} />
        <Route path="deliveries/:id" element={<ModuleFallback module="delivery" />} />
        <Route path="invoices/:id" element={<ModuleFallback module="invoice" />} />
        <Route path="payments/:id" element={<ModuleFallback module="payment" />} />
        <Route path="users/:id" element={<ModuleFallback module="user" />} />

        {/* Routes manquantes - Fallback */}
        <Route path="classifications" element={<ModuleFallback module="classification" />} />
        <Route path="classifications/:id" element={<ModuleFallback module="classification" />} />
        <Route path="employees" element={<ModuleFallback module="employees" />} />
        <Route path="settings" element={<ModuleFallback module="settings" />} />
        <Route path="calendar" element={<ModuleFallback module="calendar" />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />
      <Route path="*" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />
    </Routes>
  );
};

export default AppRoutes;