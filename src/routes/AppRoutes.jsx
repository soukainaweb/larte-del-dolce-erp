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
import DashboardHome from '../pages/DashboardHome/DashboardHome';
import MyProfile from '../pages/MyProfile/MyProfilePage';
import CustomersPage from '../pages/Customers/CustomersPage';
import UsersPage from '../pages/Users/UsersPage';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductionPage from '../pages/production/ProductionPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import CategoriesPage from '../pages/Categories/CategoriesPage';
import InventoryPage from '../pages/Inventory/InventoryPage';
import WarehousePage from '../pages/Warehouse/WarehousePage';
import SuppliersPage from '../pages/Suppliers/SuppliersPage';
import DeliveriesPage from '../pages/Deliveries/DeliveriesPage';
import InvoicesPage from '../pages/Invoices/InvoicesPage';
import PaymentsPage from '../pages/Payments/PaymentsPage';
import ExpensesPage from '../pages/Expenses/ExpensesPage';
import FinancePage from '../pages/Finance/FinancePage';
import ReportsPage from '../pages/Reports/ReportsPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import RolesPermissionsPage from '../pages/RolesPermissions/RolesPermissionsPage';

// ⭐ NOUVEAU : Importer la page Journal d'activité
import ActivityLogPage from '../pages/ActivityLog/ActivityLogPage';

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