import React from "react";
import { Route, Routes } from "react-router-dom";
import BillingForm from "./components/Billing_form/BillingForm";
import PaperManagement from "./components/Paper_management/PaperManagement";
import MaterialManagement from "./components/Material_management/MaterialManagement";
import DieManagement from "./components/Die_management/DieManagement";
import Header from "./components/Header";
import AuthPage from "./components/Authentication/AuthPage";
import EstimatesPage from "./components/Estimates/EstimatePage";
import OrderPage from "./components/Orders/OrderPage";
import ProtectedRoute from "./utils/ProtectedRoute"; // Secure routes
import "./styles/tailwind.css";

function App() {
  return (
    <div>
      <Header />
      <main className="container mx-auto mt-6">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<AuthPage />} />

          {/* Protected Routes */}
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
            path="/material-stock/estimates-db"
            element={
              <ProtectedRoute>
                <EstimatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
