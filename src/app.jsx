import React from "react";
import { Route, Routes } from "react-router-dom";
import BillingForm from "./components/Billing/BillingForm"
import PaperManagement from "./components/Management/Papers/PaperManagement"
import MaterialManagement from "./components/Management/Materials/MaterialManagement"
import DieManagement from "./components/Management/Dies/DieManagement"
import StandardRateManagement from "./components/Management/StandardRates/StandardRateManagement"
import GstHsnManagement from "./components/Management/GstHsn/GstHsnManagement"
import OverheadManagement from "./components/Management/Overheads/OverheadManagement"
import LoyaltyTierManagement from "./components/Management/LoyaltyTierManagement/LoyaltyTierManagement"
import LoyaltyDashboard from "./components/Loyalty/LoyaltyDashboard";
import ClientManagement from "./components/Clients/ClientManagement";
import VendorManagement from "./components/Vendors/VendorManagement";
import Header from "./components/Header";
import Login from "./components/Login/login";
import ChangePassword from "./components/Login/ChangePassword";
import AdminUser from "./components/Login/AdminUser";
import UserManagement from "./components/Login/UserManagement";
import UserCreatedSuccess from "./components/Login/UserCreatedSuccess";
import EstimatesPage from "./components/Estimates/EstimatesPage";
import OrdersPage from "./components/Orders/Progress/OrderPage";
import InvoicesPage from "./components/Orders/Invoices/InvoicePage";
import TransactionsDashboard from "./components/Transactions/TransactionsDashboard";
import Unauthorized from "./components/Login/Unauthorized";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import { AuthProvider } from "./components/Login/AuthContext";
import B2BClientDashboard from "./components/Clients/B2BClientDashboard";
import EscrowDashboard from "./components/Escrow/EscrowDashboard";

// Import CRM components
import { CRMProvider } from "./context/CRMContext";
import LeadRegistrationPage from "./components/CRM/LeadRegistration/LeadRegistrationPage";
import LeadManagementPage from "./components/CRM/LeadManagement/LeadManagementPage";
import BadgeManagementPage from "./components/CRM/BadgeManagement/BadgeManagementPage";
import PublicLeadForm from "./components/CRM/LeadRegistration/PublicLeadForm";

import "./styles/tailwind.css";

function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          {/* Increased padding-top to match the new header height */}
          <main className="container mx-auto p-6 pt-20 flex-grow">
            <Routes>
              <Route path="/request-kit" element={<PublicLeadForm />} />
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
                path="/vendors" 
                element={
                  <ProtectedRoute>
                    <VendorManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/estimates" 
                element={
                  <ProtectedRoute>
                    <EstimatesPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/escrow" 
                element={
                  <ProtectedRoute>
                    <EscrowDashboard />
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
              
              {/* CRM Routes */}
              <Route 
                path="/crm/lead-registration" 
                element={
                  <ProtectedRoute>
                    <LeadRegistrationPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/crm/lead-management" 
                element={
                  <ProtectedRoute>
                    <LeadManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/crm/badges" 
                element={
                  <ProtectedRoute>
                    <BadgeManagementPage />
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
              
              {/* NEW: Route for GST & HSN management */}
              <Route 
                path="/material-stock/gst-hsn-db" 
                element={
                  <ProtectedRoute>
                    <GstHsnManagement />
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
              
              {/* Route for loyalty dashboard */}
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
      </CRMProvider>
    </AuthProvider>
  );
}
 
export default App;