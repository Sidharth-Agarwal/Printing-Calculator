import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddStandardRateForm from "./AddStandardRateForm";
import DisplayStandardRateTable from "./DisplayStandardRateTable";
import { addStandardRate, updateStandardRate, deleteStandardRate } from "../../../services/firebase/standardRates";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const ratesCollection = collection(db, "standard_rates");
        const unsubscribe = onSnapshot(
          ratesCollection, 
          (snapshot) => {
            const ratesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRates(ratesData);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error in standard rates snapshot listener:", err);
            setError("Failed to load standard rates. Please refresh the page.");
            setIsLoading(false);
          }
        );
        
        return () => unsubscribe(); // Cleanup listener
      } catch (err) {
        console.error("Error setting up standard rates listener:", err);
        setError("Failed to connect to database. Please try again later.");
        setIsLoading(false);
      }
    };
    
    loadRates();
  }, []);

  const handleAddRate = async (rateData) => {
    try {
      await addStandardRate(rateData);
      alert("Rate added successfully!");
    } catch (error) {
      console.error("Error adding rate:", error);
      alert("Error adding rate. Please try again.");
    }
  };

  const handleUpdateRate = async (id, updatedData) => {
    try {
      await updateStandardRate(id, updatedData);
      alert("Rate updated successfully!");
    } catch (error) {
      console.error("Error updating rate:", error);
      alert("Error updating rate. Please try again.");
    }
  };

  const handleDeleteRate = async (id) => {
    try {
      await deleteStandardRate(id);
      alert("Rate deleted successfully!");
    } catch (error) {
      console.error("Error deleting rate:", error);
      alert("Error deleting rate. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">STANDARD RATE MANAGEMENT</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <AddStandardRateForm
        onSubmit={handleAddRate}
        selectedRate={selectedRate}
        onUpdate={handleUpdateRate}
        setSelectedRate={setSelectedRate}
      />
      
      {isLoading ? (
        <div className="text-center py-4">Loading standard rates...</div>
      ) : (
        <DisplayStandardRateTable
          rates={rates}
          onDelete={handleDeleteRate}
          onEdit={setSelectedRate}
        />
      )}
    </div>
  );
};

export default StandardRateManagement;