import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";

const DieManagement = () => {
  const [dies, setDies] = useState([]);
  const [editingDie, setEditingDie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const diesCollection = collection(db, "dies");
    const unsubscribe = onSnapshot(diesCollection, (snapshot) => {
      const diesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Remove price field if it exists in the data
        const { price, ...restData } = data;
        return {
          id: doc.id,
          ...restData
        };
      });
      setDies(diesData);
    });

    return () => unsubscribe();
  }, []);

  // Check if die code already exists in the database
  const isDieCodeUnique = async (dieCode, excludeId = null) => {
    try {
      const diesCollection = collection(db, "dies");
      const q = query(diesCollection, where("dieCode", "==", dieCode));
      const querySnapshot = await getDocs(q);
      
      // If we're updating an existing die, exclude it from the uniqueness check
      if (excludeId) {
        return querySnapshot.docs.every(doc => doc.id !== excludeId);
      }
      
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking die code uniqueness:", error);
      return false;
    }
  };

  const addDie = async (newDie) => {
    if (!newDie.dieCode) {
      throw new Error("Die code is required.");
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if die code is unique
      const isUnique = await isDieCodeUnique(newDie.dieCode);
      
      if (!isUnique) {
        throw new Error(`Die code "${newDie.dieCode}" already exists. Please use a unique die code.`);
      }
      
      // Remove price field if it exists
      const { price, ...dieData } = newDie;
      
      const diesCollection = collection(db, "dies");
      await addDoc(diesCollection, { ...dieData, timestamp: new Date() });
      alert("Die added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding die:", error);
      throw error; // Re-throw the error so the form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDie = async (id, updatedData) => {
    if (!updatedData.dieCode) {
      throw new Error("Die code is required.");
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if the updated die code is unique (excluding current die)
      const isUnique = await isDieCodeUnique(updatedData.dieCode, id);
      
      if (!isUnique) {
        throw new Error(`Die code "${updatedData.dieCode}" already exists. Please use a unique die code.`);
      }
      
      // Remove price field if it exists
      const { price, ...dieData } = updatedData;
      
      const dieDoc = doc(db, "dies", id);
      await updateDoc(dieDoc, dieData);
      alert("Die updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating die:", error);
      throw error; // Re-throw the error so the form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDie = async (id) => {
    if (!confirm("Are you sure you want to delete this die?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "dies", id));
      alert("Die deleted successfully!");
    } catch (error) {
      console.error("Error deleting die:", error);
      alert("Error deleting die.");
    }
  };

  // If we have an editing die, make sure to remove the price field before passing it to the form
  const prepareEditingDie = () => {
    if (!editingDie) return null;
    
    const { price, ...dieData } = editingDie;
    return dieData;
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Die Management</h1>
      <AddDieForm
        onAddDie={addDie}
        onUpdateDie={updateDie}
        editingDie={prepareEditingDie()}
        setEditingDie={setEditingDie}
        storage={storage}
        isSubmitting={isSubmitting}
      />
      <DisplayDieTable
        dies={dies}
        onEditDie={setEditingDie}
        onDeleteDie={deleteDie}
      />
    </div>
  );
};

export default DieManagement;