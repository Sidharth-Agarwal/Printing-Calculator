import React from "react";
import AddDieForm from "./addDie";
import DieTable from "./displayDie";

const DieManagement = () => {
  return (
    <div>
      <h1> Die Management Section </h1>
      <AddDieForm />
      <DieTable />
    </div>
  );
};

export default DieManagement;