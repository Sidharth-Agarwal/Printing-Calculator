import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs, getDoc } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";

const DieManagement = () => {
  const { userRole } = useAuth();
  const [dies, setDies] = useState([]);
  const [selectedDie, setSelectedDie] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Check if user has access (admin or staff)
  const hasAccess = userRole === "admin" || userRole === "staff";
  const isAdmin = userRole === "admin";

  // Die statistics
  const [dieStats, setDieStats] = useState({
    totalDies: 0,
    standardDies: 0,
    customDies: 0,
    temporaryDies: 0,
    availableDies: 0
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
      
      // Calculate die statistics
      const stats = {
        totalDies: diesData.length,
        standardDies: diesData.filter(die => die.dieType === "Standard").length,
        customDies: diesData.filter(die => die.dieType === "Custom").length,
        temporaryDies: diesData.filter(die => die.isTemporary === true).length,
        availableDies: diesData.filter(die => die.isAvailable !== false).length
      };
      
      setDieStats(stats);
      setIsLoading(false);
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
    if (!hasAccess) return;
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
        isTemporary: dieData.isTemporary || false, // Ensure isTemporary is set
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
    if (!hasAccess) return;
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
        isTemporary: dieData.isTemporary || false, // Ensure isTemporary is set
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
    if (!hasAccess) return;
    
    setSelectedDie(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (die) => {
    if (!hasAccess) return;
    
    const { price, ...dieData } = die; // Remove price field if it exists
    setSelectedDie({...dieData}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedDie(null);
  };

  const confirmDelete = (id) => {
    if (!isAdmin) return; // Only admin can delete
    
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

  // Handle notification from export/import operations
  const handleExportImportSuccess = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Success",
      status: "success"
    });
  };

  const handleExportImportError = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Error",
      status: "error"
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

  // Redirect non-authorized users
  if (!hasAccess) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access die management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Die Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Die Management</h1>
        <p className="text-gray-600 mt-1">
          Manage dies, custom shapes, and templates for your printing processes
        </p>
      </div>

      {/* Action buttons with Export/Import options */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {/* Only show import/export to admins */}
          {isAdmin && (
            <DBExportImport 
              db={db}
              collectionName="dies"
              onSuccess={handleExportImportSuccess}
              onError={handleExportImportError}
              dateFields={['timestamp', 'createdAt', 'updatedAt']}
            />
          )}
        </div>
        
        <div>
          {hasAccess && (
            <button 
              onClick={handleAddClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Die
            </button>
          )}
        </div>
      </div>

      {/* Table component - visible to all users with access */}
      <div className="overflow-hidden">
        <DisplayDieTable
          dies={dies}
          onEditDie={hasAccess ? handleEditClick : null}
          onDeleteDie={isAdmin ? confirmDelete : null}
        />
      </div>

      {/* Modals - only rendered for users with access */}
      {hasAccess && (
        <>
          {/* Modal for adding/editing die */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedDie ? "Edit Die" : "Add New Die"}
            size="lg"
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
          </Modal>

          {/* Delete confirmation modal - only for admins */}
          {isAdmin && (
            <DeleteConfirmationModal
              isOpen={deleteConfirmation.isOpen}
              onClose={closeDeleteModal}
              onConfirm={handleDeleteConfirm}
              itemName="die"
            />
          )}
          
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