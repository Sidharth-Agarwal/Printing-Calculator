import React from "react";
import { Route, Routes } from "react-router-dom";
import BillingForm from "./components/Billing/BillingForm"
import PaperManagement from "./components/Management/Papers/PaperManagement"
import MaterialManagement from "./components/Management/Materials/MaterialManagement"
import DieManagement from "./components/Management/Dies/DieManagement"
import StandardRateManagement from "./components/Management/StandardRates/StandardRateManagement"
import OverheadManagement from "./components/Management/Overheads/OverheadManagement"
import LoyaltyTierManagement from "./components/Management/LoyaltyTierManagement/LoyaltyTierManagement"
import LoyaltyDashboard from "./components/Loyalty/LoyaltyDashboard"; // NEW: Import LoyaltyDashboard
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
            
            {/* Protected routes - all authenticated users */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes with predefined access */}
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <TransactionsDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute>
                  <UserManagement />
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

            <Route 
              path="/b2b-dashboard" 
              element={
                <ProtectedRoute>
                  <B2BClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/new-bill" 
              element={
                <ProtectedRoute>
                  <BillingForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/paper-db" 
              element={
                <ProtectedRoute>
                  <PaperManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/material-db" 
              element={
                <ProtectedRoute>
                  <MaterialManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/dies-db" 
              element={
                <ProtectedRoute>
                  <DieManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/standard-rates-db" 
              element={
                <ProtectedRoute>
                  <StandardRateManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/material-stock/overheads" 
              element={
                <ProtectedRoute>
                  <OverheadManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Route for loyalty tier management */}
            <Route 
              path="/material-stock/loyalty-tiers" 
              element={
                <ProtectedRoute>
                  <LoyaltyTierManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Route for loyalty dashboard */}
            <Route 
              path="/loyalty-dashboard" 
              element={
                <ProtectedRoute>
                  <LoyaltyDashboard />
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