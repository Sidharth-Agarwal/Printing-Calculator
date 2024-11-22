import React from "react";
import AddDieForm from "./addDie";
import DieTable from "./displayDie";

const DieManagement = () => {
  return (
    <div>
      <AddDieForm />
      <DieTable />
    </div>
  );
};

export default DieManagement;