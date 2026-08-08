// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';

// Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';
import DashboardHome from '../pages/dashboardhome/DashboardHome';
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
import MeetingsPage from '../pages/meetings/MeetingsPage';
import MeetingDetailsPage from '../pages/meetings/MeetingDetailsPage';
import MeetingRoomPage from '../pages/meetings/MeetingRoomPage';
import SamplesPage from '../pages/samples/SamplesPage';
import WasteReturnsPage from '../pages/wasteReturns/WasteReturnsPage';
import PurchasesPage from '../pages/purchases/PurchasesPage';
import FinancePage from '../pages/finance/FinancePage';
import ReportsPage from '../pages/reports/ReportsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import RolesPermissionsPage from '../pages/RolesPermissions/RolesPermissionsPage';

// ⭐ NOUVEAU : Importer la page Journal d'activité
import ActivityLogPage from '../pages/activitylog/ActivityLogPage';

// ⭐ NOUVEAU : Importer la page Paramètres
import SettingsPage from '../pages/settings/SettingsPage';

// Composant de fallback
import EntityDetailRedirect from '../components/EntityDetailRedirect';
import PermissionRoute from '../components/auth/PermissionRoute';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

const MustChangePasswordRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.mustChangePassword) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    if (user?.mustChangePassword) {
      return <Navigate to="/change-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

// App Routes
const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicAuthRoute>
          <Login />
        </PublicAuthRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={
        <MustChangePasswordRoute>
          <ChangePassword />
        </MustChangePasswordRoute>
      } />

      {/* Protected Routes - DashboardLayout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Pages principales */}
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="users" element={<PermissionRoute permission="users.view"><UsersPage /></PermissionRoute>} />
        <Route path="customers" element={<PermissionRoute permission="customers.view"><CustomersPage /></PermissionRoute>} />
        <Route path="products" element={<PermissionRoute permission="products.view"><ProductsPage /></PermissionRoute>} />
        <Route path="production" element={<PermissionRoute permission="productions.view"><ProductionPage /></PermissionRoute>} />
        <Route path="orders" element={<PermissionRoute permission="orders.view"><OrdersPage /></PermissionRoute>} />
        <Route path="categories" element={<PermissionRoute permission="categories.view"><CategoriesPage /></PermissionRoute>} />
        <Route path="inventory" element={<PermissionRoute permission="inventory.view"><InventoryPage /></PermissionRoute>} />
        <Route path="warehouse" element={<PermissionRoute permission="warehouses.view"><WarehousePage /></PermissionRoute>} />
        <Route path="suppliers" element={<PermissionRoute permission="suppliers.view"><SuppliersPage /></PermissionRoute>} />
        <Route path="deliveries" element={<PermissionRoute permission="deliveries.view"><DeliveriesPage /></PermissionRoute>} /> 
        <Route path="invoices" element={<PermissionRoute permission="finance.view"><InvoicesPage /></PermissionRoute>} /> 
        <Route path="payments" element={<PermissionRoute permission="payments.view"><PaymentsPage /></PermissionRoute>} />
        <Route path="expenses" element={<PermissionRoute permission="expenses.view"><ExpensesPage /></PermissionRoute>} /> 
        <Route path="meetings/:id/room" element={<PermissionRoute permission="meetings.view"><MeetingRoomPage /></PermissionRoute>} />
        <Route path="meetings/:id" element={<PermissionRoute permission="meetings.view"><MeetingDetailsPage /></PermissionRoute>} />
        <Route path="meetings" element={<PermissionRoute permission="meetings.view"><MeetingsPage /></PermissionRoute>} />
        <Route path="samples" element={<PermissionRoute permission="samples.view"><SamplesPage /></PermissionRoute>} />
        <Route path="waste-returns" element={<PermissionRoute permission="waste_returns.view"><WasteReturnsPage /></PermissionRoute>} />
        <Route path="purchases" element={<PermissionRoute permission="purchases.view"><PurchasesPage /></PermissionRoute>} />
        <Route path="finance" element={<PermissionRoute permission="finance.view"><FinancePage /></PermissionRoute>} />
        <Route path="reports" element={<PermissionRoute permission="reports.view"><ReportsPage /></PermissionRoute>} />
        <Route path="analytics" element={<PermissionRoute permission="reports.view"><AnalyticsPage /></PermissionRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="roles" element={<PermissionRoute permission="roles.view"><RolesPermissionsPage /></PermissionRoute>} />
        <Route path="roles/*" element={<PermissionRoute permission="roles.view"><RolesPermissionsPage /></PermissionRoute>} />

        {/* ⭐ NOUVEAU : Route pour Journal d'activité */}
        <Route path="activity-logs" element={<PermissionRoute permission="users.view"><ActivityLogPage /></PermissionRoute>} />
        <Route path="activity-logs/*" element={<PermissionRoute permission="users.view"><ActivityLogPage /></PermissionRoute>} />

        {/* ⭐ NOUVEAU : Route pour Paramètres */}
        <Route path="settings" element={<PermissionRoute permission="settings.view"><SettingsPage /></PermissionRoute>} />
        <Route path="settings/*" element={<PermissionRoute permission="settings.view"><SettingsPage /></PermissionRoute>} />

        {/* Entity detail deep-links → list page + modal */}
        <Route path="orders/:id" element={<EntityDetailRedirect module="order" />} />
        <Route path="customers/:id" element={<EntityDetailRedirect module="customer" />} />
        <Route path="products/:id" element={<EntityDetailRedirect module="product" />} />
        <Route path="production/:id" element={<EntityDetailRedirect module="production" />} />
        <Route path="deliveries/:id" element={<EntityDetailRedirect module="delivery" />} />
        <Route path="invoices/:id" element={<EntityDetailRedirect module="invoice" />} />
        <Route path="payments/:id" element={<EntityDetailRedirect module="payment" />} />
        <Route path="users/:id" element={<EntityDetailRedirect module="user" />} />

        {/* Legacy aliases → canonical modules */}
        <Route path="classifications" element={<Navigate to="/dashboard/categories" replace />} />
        <Route path="classifications/:id" element={<Navigate to="/dashboard/categories" replace />} />
        <Route path="employees" element={<Navigate to="/dashboard/users" replace />} />
        <Route path="employees/:id" element={<EntityDetailRedirect module="user" />} />
        <Route path="calendar" element={<Navigate to="/dashboard/meetings" replace />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};

export default AppRoutes;