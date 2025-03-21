import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";
import { addDie, updateDie, deleteDie, fetchDies } from "../../../services/firebase/dies";

const DieManagement = () => {
  const [dies, setDies] = useState([]);
  const [editingDie, setEditingDie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDies = async () => {
      setIsLoading(true);
      try {
        // Setup real-time listener for dies collection
        const unsubscribe = onSnapshot(
          collection(db, "dies"), 
          (snapshot) => {
            const diesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setDies(diesData);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error in die snapshot listener:", err);
            setError("Failed to load dies. Please refresh the page.");
            setIsLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up die listener:", err);
        setError("Failed to connect to database. Please try again later.");
        setIsLoading(false);
      }
    };

    loadDies();
  }, []);

  const handleAddDie = async (dieData) => {
    try {
      await addDie(dieData, null); // Using the service function
      // No need to update state as the snapshot listener will do it
    } catch (error) {
      console.error("Error adding die:", error);
      alert("Error adding die.");
    }
  };

  const handleUpdateDie = async (id, updatedData) => {
    try {
      await updateDie(id, updatedData, null); // Using the service function
      setEditingDie(null);
    } catch (error) {
      console.error("Error updating die:", error);
      alert("Error updating die.");
    }
  };

  const handleDeleteDie = async (id) => {
    try {
      await deleteDie(id); // Using the service function
    } catch (error) {
      console.error("Error deleting die:", error);
      alert("Error deleting die.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">DIE MANAGEMENT</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <AddDieForm
        onAddDie={handleAddDie}
        onUpdateDie={handleUpdateDie}
        editingDie={editingDie}
        setEditingDie={setEditingDie}
        storage={storage}
      />
      
      {isLoading ? (
        <div className="text-center py-4">Loading dies...</div>
      ) : (
        <DisplayDieTable
          dies={dies}
          onEditDie={setEditingDie}
          onDeleteDie={handleDeleteDie}
        />
      )}
    </div>
  );
};

export default DieManagement;