import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import OrderForm from "./components/OrderForm"; // New Bill Component
import PaperManagement from "../Paper_management/PaperManagement";
import MaterialDB from "./components/MaterialDB"; // Existing Component
import DiesDB from "./components/DiesDB"; // Existing Component
import EstimatesDB from "./components/EstimatesDB"; // Dummy Component
import StandardRatesDB from "./components/StandardRatesDB"; // Dummy Component
import Transactions from "./components/Transactions"; // Placeholder Component

const App = () => {
  return (
    <Router>
      <Header />
      <main className="container mx-auto mt-6">
        <Routes>
          <Route path="/new-bill" element={<OrderForm />} />
          <Route path="/material-stock/paper-db" element={<PaperManagement />} />
          <Route path="/material-stock/material-db" element={<MaterialDB />} />
          <Route path="/material-stock/dies-db" element={<DiesDB />} />
          <Route path="/material-stock/estimates-db" element={<EstimatesDB />} />
          <Route path="/material-stock/standard-rates-db" element={<StandardRatesDB />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
