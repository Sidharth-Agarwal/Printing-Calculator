import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BillingForm from "./components/Billing_form/BillingForm";
import PaperManagement from "./components/Paper_management/PaperManagement";
import MaterialManagement from "./components/Material_management/MaterialManagement";
import DieManagement from "./components/Die_management/DieManagement";
import StandardRateManagement from "./components/Standard_rates_management/StandardRateManagement";
import Header from "./components/Header";
import Login from "./components/Login/login";
import EstimatesPage from "./components/Estimates/EstimatePage";
import OrderPage from "./components/Orders/OrderPage";
import "./styles/tailwind.css";

function App() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/new-bill" element={<BillingForm />} />
          <Route path="/material-stock/paper-db" element={<PaperManagement />} />
          <Route path="/material-stock/material-db" element={<MaterialManagement />} />
          <Route path="/material-stock/dies-db" element={<DieManagement />} />
          <Route path="/material-stock/standard-rates-db" element={<StandardRateManagement />} />
          <Route path="/material-stock/estimates-db" element={<EstimatesPage />} />
          <Route path="/orders" element={<OrderPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
