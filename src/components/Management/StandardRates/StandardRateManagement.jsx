import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddStandardRateForm from "./AddStandardRateForm";
import DisplayStandardRateTable from "./DisplayStandardRateTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
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

  // Get the user role from auth context
  const { userRole } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = userRole === "admin";

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
    // Return early if user is not admin
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!rateData.finalRate && !rateData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }

      const ratesCollection = collection(db, "standard_rates");
      await addDoc(ratesCollection, {
        ...rateData,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Rate added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to add rate. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRate = async (id, updatedData) => {
    // Return early if user is not admin
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!updatedData.finalRate && !updatedData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }

      const rateDoc = doc(db, "standard_rates", id);
      await updateDoc(rateDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Rate updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error("Error updating rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to update rate. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedRate(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (rate) => {
    if (!isAdmin) return;
    
    setSelectedRate({...rate}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedRate(null);
  };

  const confirmDelete = (id) => {
    // Return early if user is not admin
    if (!isAdmin) return;

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
    // Return early if user is not admin
    if (!isAdmin) return;

    try {
      await deleteDoc(doc(db, "standard_rates", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Rate deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting rate:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Failed to delete rate. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="rounded bg-gray-900 py-4 mb-4">
        <h1 className="text-2xl text-white font-bold pl-4">Labour Management</h1>
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
              Add New Rate
            </button>
          </div>
        )}
      
        {/* Display table for all users */}
        <DisplayStandardRateTable
          rates={rates}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>
      
      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing rate */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedRate ? "Edit Standard Rate" : "Add New Standard Rate"}
            size="lg"
          >
            <AddStandardRateForm
              onSubmit={addRate}
              selectedRate={selectedRate}
              onUpdate={updateRate}
              setSelectedRate={setSelectedRate}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>
          
          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="rate"
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

export default StandardRateManagement;