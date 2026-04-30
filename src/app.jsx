import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import BillingForm from "./components/Billing/BillingForm";
import PaperManagement from "./components/Management/Papers/PaperManagement";
import MaterialManagement from "./components/Management/Materials/MaterialManagement";
import DieManagement from "./components/Management/Dies/DieManagement";
import StandardRateManagement from "./components/Management/StandardRates/StandardRateManagement";
import GstHsnManagement from "./components/Management/GstHsn/GstHsnManagement";
import OverheadManagement from "./components/Management/Overheads/OverheadManagement";
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
import { CRMProvider } from "./context/CRMContext";

// CRM
import LeadRegistrationPage from "./components/CRM/LeadRegistration/LeadRegistrationPage";
import LeadManagementPage from "./components/CRM/LeadManagement/LeadManagementPage";
import BadgeManagementPage from "./components/CRM/BadgeManagement/BadgeManagementPage";
import PublicLeadForm from "./components/CRM/LeadRegistration/PublicLeadForm";
import ClientsPage from "./components/CRM/Clients/ClientsPage"; // Phase 2
import TasksPage    from "./components/CRM/Tasks/TasksPage";    // Phase 3
import CRMDashboard from "./components/CRM/Dashboard/CRMDashboard"; // Phase 4

import "./styles/tailwind.css";

const NO_HEADER_PAGES = ["/", "/setup-admin", "/unauthorized", "/user-created-success", "/request-kit"];

function AppContent() {
  const location = useLocation();
  const needsPadding = !NO_HEADER_PAGES.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`container mx-auto p-6 flex-grow ${needsPadding ? "pt-20" : ""}`}>
        <Routes>
          {/* Public */}
          <Route path="/request-kit" element={<PublicLeadForm />} />
          <Route path="/" element={<Login />} />
          <Route path="/setup-admin" element={<AdminUser />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/user-created-success" element={<UserCreatedSuccess />} />

          {/* Auth */}
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/user-management"  element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

          {/* Core app */}
          <Route path="/transactions" element={<ProtectedRoute><TransactionsDashboard /></ProtectedRoute>} />
          <Route path="/orders"       element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/invoices"     element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/clients"      element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
          <Route path="/vendors"      element={<ProtectedRoute><VendorManagement /></ProtectedRoute>} />
          <Route path="/estimates"    element={<ProtectedRoute><EstimatesPage /></ProtectedRoute>} />
          <Route path="/escrow"       element={<ProtectedRoute><EscrowDashboard /></ProtectedRoute>} />
          <Route path="/b2b-dashboard" element={<ProtectedRoute><B2BClientDashboard /></ProtectedRoute>} />
          <Route path="/new-bill"     element={<ProtectedRoute><BillingForm /></ProtectedRoute>} />

          {/* CRM — Phase 1 */}
          <Route path="/crm/lead-registration" element={<ProtectedRoute><LeadRegistrationPage /></ProtectedRoute>} />
          <Route path="/crm/lead-management"   element={<ProtectedRoute><LeadManagementPage /></ProtectedRoute>} />
          <Route path="/crm/badges"            element={<ProtectedRoute><BadgeManagementPage /></ProtectedRoute>} />

          {/* CRM — Phase 2 */}
          <Route path="/crm/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />

          {/* CRM — Phase 3 */}
          <Route path="/crm/tasks"     element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />

          {/* CRM — Phase 4 */}
          <Route path="/crm/dashboard" element={<ProtectedRoute><CRMDashboard /></ProtectedRoute>} />

          {/* Material stock */}
          <Route path="/material-stock/paper-db"         element={<ProtectedRoute><PaperManagement /></ProtectedRoute>} />
          <Route path="/material-stock/material-db"      element={<ProtectedRoute><MaterialManagement /></ProtectedRoute>} />
          <Route path="/material-stock/dies-db"          element={<ProtectedRoute><DieManagement /></ProtectedRoute>} />
          <Route path="/material-stock/standard-rates-db" element={<ProtectedRoute><StandardRateManagement /></ProtectedRoute>} />
          <Route path="/material-stock/gst-hsn-db"       element={<ProtectedRoute><GstHsnManagement /></ProtectedRoute>} />
          <Route path="/material-stock/overheads"        element={<ProtectedRoute><OverheadManagement /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <AppContent />
      </CRMProvider>
    </AuthProvider>
  );
}

export default App;