import React from "react";
import { Route, Routes } from "react-router-dom";
import BillingForm from "./components/Billing/BillingForm"
import PaperManagement from "./components/Management/Papers/PaperManagement"
import MaterialManagement from "./components/Management/Materials/MaterialManagement"
import DieManagement from "./components/Management/Dies/DieManagement"
import StandardRateManagement from "./components/Management/StandardRates/StandardRateManagement"
import OverheadManagement from "./components/Management/Overheads/OverheadManagement"
import ClientManagement from "./components/Clients/ClientManagement";
import Header from "./components/Header";
import Login from "./components/Login/login";
import ChangePassword from "./components/Login/ChangePassword";
import AdminUser from "./components/Login/AdminUser";
import UserManagement from "./components/Login/UserManagement";
import UserCreatedSuccess from "./components/Login/UserCreatedSuccess";
import EstimatesPage from "./components/Estimates/EstimatesPage";
import OrdersPage from "./components/Orders/OrderPage";
import InvoicesPage from "./components/Invoices/InvoicePage";
import TransactionsDashboard from "./components/Transactions/TransactionsDashboard";
import Unauthorized from "./components/Login/Unauthorized";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import { AuthProvider } from "./components/Login/AuthContext";
import B2BClientDashboard from "./components/Clients/B2BClientDashboard";
import "./styles/tailwind.css";

function App() {
  return (
    <AuthProvider>
      <div>
        <Header />
        <main className="container mx-auto p-6">
          <Routes>
            {/* Public routes - these don't require authentication */}
            <Route path="/" element={<Login />} />
            <Route path="/setup-admin" element={<AdminUser />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/user-created-success" element={<UserCreatedSuccess />} />
            
            {/* Protected routes - accessible to all authenticated users */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin-only routes */}
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransactionsDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes accessible by multiple roles */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <InvoicesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ClientManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/estimates-db" 
              element={
                <ProtectedRoute>
                  <EstimatesPage />
                </ProtectedRoute>
              } 
            />

            {/* B2B Dashboard - for B2B clients */}
            <Route 
              path="/b2b-dashboard" 
              element={
                <ProtectedRoute requiredRole="b2b">
                  <B2BClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Staff and Admin routes */}
            <Route 
              path="/new-bill" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <BillingForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Material Management routes - accessible to Staff and Admin */}
            <Route 
              path="/material-stock/paper-db" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <PaperManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/material-db" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <MaterialManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/dies-db" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <DieManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* IMPORTANT: These two routes were previously set to admin-only */}
            {/* Now setting them to staff which will still allow admin access */}
            {/* due to how ProtectedRoute component works */}
            <Route 
              path="/material-stock/standard-rates-db" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <StandardRateManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/overheads" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <OverheadManagement />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
 
export default App;