import React from "react";
import OrderAndPaper from "./components/Billing_form/Section1";
import LPSection from "./components/Billing_form/Section2LP";
import FSSection from "./components/Billing_form/Section2FS";
import EMBSection from "./components/Billing_form/Section3EMB";
import PaperManagement from "./components/Paper_management/paper";
import DieManagement from "./components/Die_management/die";
import AddBillFlow from "./components/Billing_form/BillFlow";
function App() {
  return (
    <div>
      <h1>Welcome to the Application</h1>
        <AddBillFlow/>
    </div>
  );
}

export default App;