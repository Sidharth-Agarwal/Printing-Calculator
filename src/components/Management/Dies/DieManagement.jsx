import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const DieManagement = () => {
  const { userRole } = useAuth();
  const [dies, setDies] = useState([]);
  const [selectedDie, setSelectedDie] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
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

  // Check if user is admin
  const isAdmin = userRole === "admin";

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
    if (!isAdmin) return;
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
      await addDoc(diesCollection, { 
        ...dieData, 
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Die added successfully!",
        title: "Success",
        status: "success"
      });
      
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      console.error("Error adding die:", error);
      
      setNotification({
        isOpen: true,
        message: error.message || "Error adding die. Please try again.",
        title: "Error",
        status: "error"
      });
      
      throw error; // Re-throw the error so the form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDie = async (id, updatedData) => {
    if (!isAdmin) return;
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
      
      await updateDoc(dieRef, {
        ...dieData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Die updated successfully!",
        title: "Success",
        status: "success"
      });
      
      setIsFormModalOpen(false);
      setSelectedDie(null);
      return true;
    } catch (error) {
      console.error("Error updating die:", error);
      
      setNotification({
        isOpen: true,
        message: error.message || "Error updating die. Please try again.",
        title: "Error",
        status: "error"
      });
      
      throw error; // Re-throw the error so the form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedDie(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (die) => {
    if (!isAdmin) return;
    
    const { price, ...dieData } = die; // Remove price field if it exists
    setSelectedDie({...dieData}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedDie(null);
  };

  const confirmDelete = (id) => {
    if (!isAdmin) return;
    
    setDeleteConfirmation({
      isOpen: false,
      itemId: id
    });
    setTimeout(() => {
      setDeleteConfirmation({
        isOpen: true,
        itemId: id
      });
    }, 0);
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
    if (!isAdmin) return;
    
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

  // Custom modal component with reduced padding
  const CompactModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" />

        {/* Modal container */}
        <div className="flex min-h-full items-center justify-center text-center p-2">
          {/* Modal content */}
          <div className="w-full max-w-3xl transform overflow-visible bg-white text-left shadow-xl transition-all rounded-lg">
            {/* Header - using the dark navy blue color */}
            <div className="bg-gray-900 px-4 py-2 flex justify-between items-center rounded-t-lg">
              <h3 className="text-md font-medium text-white">{title}</h3>
              <button
                type="button"
                className="text-white hover:text-gray-300 focus:outline-none transition-colors"
                onClick={onClose}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="rounded bg-gray-900 py-4 mb-4">
        <h1 className="text-2xl text-white font-bold pl-4">Die Management</h1>
      </div>

      {/* Main content */}
      <div className="px-4">
        {/* Action buttons - only visible to admins */}
        {isAdmin && (
          <div className="flex justify-end my-4">
            <button 
              onClick={handleAddClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Die
            </button>
          </div>
        )}

        {/* Table component - visible to all users */}
        <DisplayDieTable
          dies={dies}
          onEditDie={isAdmin ? handleEditClick : null}
          onDeleteDie={isAdmin ? confirmDelete : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Using the custom compact modal for the form */}
          <CompactModal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedDie ? "Edit Die" : "Add New Die"}
          >
            <AddDieForm
              onAddDie={addDie}
              onUpdateDie={updateDie}
              editingDie={selectedDie}
              setEditingDie={setSelectedDie}
              storage={storage}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </CompactModal>

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
        </>
      )}
    </div>
  );
};

export default DieManagement;