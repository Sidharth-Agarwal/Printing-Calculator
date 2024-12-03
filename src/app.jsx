import React from "react";
import { Routes, Route } from "react-router-dom";
import BillingForm from "./components/Billing_form/BillingForm";
import PaperManagement from "./components/Paper_management/PaperManagement";
import MaterialManagement from "./components/Material_management/MaterialManagement";
import DieManagement from "./components/Die_management/DieManagement";
import StandardRatesDB from "./components/Standard_rates/StandardRates";
import Header from "./components/Header";
import Transactions from "./components/Transactions/Transactions";
import Login from "./components/Login/login";
import EstimatesPage from "./components/Estimates/Estimate";
import OrderAndPaper from "./components/Billing_form/OrderAndPaper";
import './styles/tailwind.css';

function App() {
  return (
    <div>
      <Header />
      <main className="container mx-auto mt-6">
        <Routes>
          <Route path="/" element={<OrderAndPaper />} />
          <Route path="/new-bill" element={<BillingForm />} />
          <Route path="/material-stock/paper-db" element={<PaperManagement />} />
          <Route path="/material-stock/material-db" element={<MaterialManagement />} />
          <Route path="/material-stock/dies-db" element={<DieManagement />} />
          <Route path="/material-stock/estimates-db" element={<EstimatesPage />} />
          <Route path="/material-stock/standard-rates-db" element={<StandardRatesDB />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
