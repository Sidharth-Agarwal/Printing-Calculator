import React from "react";
import BillingForm from "./components/Billing_form/BillingForm";
import './styles/tailwind.css'
import FSDetails from "./components/Billing_form/FSDetails";
import DieManagement from "./components/Die_management/die";
import MaterialManagement from "./components/Material_management/MaterialManagement";

function App() {
  return (
    <div>
      {/* <h1>Welcome to the Application</h1> */}
        <MaterialManagement/>
    </div>
  );
}

export default App;