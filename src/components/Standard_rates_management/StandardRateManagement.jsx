import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddStandardRateForm from "./AddStandardRateForm";
import DisplayStandardRateTable from "./DisplayStandardRateTable";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);

  useEffect(() => {
    const ratesCollection = collection(db, "standard_rates");
    const unsubscribe = onSnapshot(ratesCollection, (snapshot) => {
      const ratesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRates(ratesData);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addRate = async (rateData) => {
    try {
      const ratesCollection = collection(db, "standard_rates");
      await addDoc(ratesCollection, rateData);
      alert("Rate added successfully!");
    } catch (error) {
      console.error("Error adding rate:", error);
    }
  };

  const updateRate = async (id, updatedData) => {
    try {
      const rateDoc = doc(db, "standard_rates", id);
      await updateDoc(rateDoc, updatedData);
      alert("Rate updated successfully!");
    } catch (error) {
      console.error("Error updating rate:", error);
    }
  };

  const deleteRate = async (id) => {
    try {
      await deleteDoc(doc(db, "standard_rates", id));
      alert("Rate deleted successfully!");
    } catch (error) {
      console.error("Error deleting rate:", error);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Standard Rate Management</h1>
      <AddStandardRateForm
        onSubmit={addRate}
        selectedRate={selectedRate}
        onUpdate={updateRate}
        setSelectedRate={setSelectedRate}
      />
      <DisplayStandardRateTable
        rates={rates}
        onDelete={deleteRate}
        onEdit={(rate) => setSelectedRate(rate)}
      />
    </div>
  );
};

export default StandardRateManagement;
