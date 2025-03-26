import React from "react";
import PaperManagement from "./components/Management/Paper/PaperManagement";
import "./styles/tailwind.css";

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Famous LetterPress Management</h1>
      <PaperManagement />
    </div>
  );
}

export default App;