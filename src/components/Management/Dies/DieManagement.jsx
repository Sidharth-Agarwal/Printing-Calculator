import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import ConfirmationModal from "../ConfirmationModal";

const DieManagement = () => {
  const [dies, setDies] = useState([]);
  const [editingDie, setEditingDie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });

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
  const isDieCodeUnique = async (dieCode) => {
    try {
      const diesCollection = collection(db, "dies");
      const q = query(diesCollection, where("dieCode", "==", dieCode));
      const querySnapshot = await getDocs(q);
      
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
      
      setNotification({
        isOpen: true,
        message: "Die added successfully!",
        title: "Success",
        status: "success"
      });
      
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
      // First, get the current die data
      const dieRef = doc(db, "dies", id);
      const dieSnap = await getDoc(dieRef);
      
      // Only check for uniqueness if the die code has changed
      if (dieSnap.exists() && dieSnap.data().dieCode !== updatedData.dieCode) {
        // Check if the updated die code is unique
        const isUnique = await isDieCodeUnique(updatedData.dieCode);
        
        if (!isUnique) {
          throw new Error(`Die code "${updatedData.dieCode}" already exists. Please use a unique die code.`);
        }
      }
      
      // Remove price field if it exists
      const { price, ...dieData } = updatedData;
      
      await updateDoc(dieRef, dieData);
      
      setNotification({
        isOpen: true,
        message: "Die updated successfully!",
        title: "Success",
        status: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error updating die:", error);
      throw error; // Re-throw the error so the form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      message: "",
      title: "",
      status: "success"
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "dies", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Die deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting die:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting die. Please try again.",
        title: "Error",
        status: "error"
      });
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
        onDeleteDie={confirmDelete}
      />
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName="die"
      />
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
    </div>
  );
};

export default DieManagement;