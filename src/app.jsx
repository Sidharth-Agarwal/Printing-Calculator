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
import ProductionDashboard from "./components/Orders/ProductionDashboard";
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
            
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <TransactionsDashboard />
                </ProtectedRoute>
              } 
            />
            
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
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
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
            
            {/* Staff role routes */}
            <Route 
              path="/new-bill" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <BillingForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Production role routes */}
            <Route 
              path="/material-stock/paper-db" 
              element={
                <ProtectedRoute requiredRole="production">
                  <PaperManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/material-db" 
              element={
                <ProtectedRoute requiredRole="production">
                  <MaterialManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/dies-db" 
              element={
                <ProtectedRoute requiredRole="production">
                  <DieManagement />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/production-assignments" 
              element={
                <ProtectedRoute requiredRole="production">
                  <ProductionDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin role routes */}
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/standard-rates-db" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <StandardRateManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/overheads" 
              element={
                <ProtectedRoute requiredRole="admin">
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