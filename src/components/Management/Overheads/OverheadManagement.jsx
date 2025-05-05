import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddOverheadForm from "./AddOverheadForm";
import DisplayOverheadTable from "./DisplayOverheadTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const OverheadManagement = () => {
  const { userRole } = useAuth();
  const [overheads, setOverheads] = useState([]);
  const [selectedOverhead, setSelectedOverhead] = useState(null);
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
    const overheadsCollection = collection(db, "overheads");
    const unsubscribe = onSnapshot(overheadsCollection, (snapshot) => {
      const overheadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOverheads(overheadsData);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addOverhead = async (overheadData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const overheadsCollection = collection(db, "overheads");
      await addDoc(overheadsCollection, { 
        ...overheadData, 
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Overhead added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOverhead = async (id, updatedData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const overheadDoc = doc(db, "overheads", id);
      await updateDoc(overheadDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Overhead updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedOverhead(null);
    } catch (error) {
      console.error("Error updating overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedOverhead(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (overhead) => {
    if (!isAdmin) return;
    
    setSelectedOverhead({...overhead}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedOverhead(null);
  };

  const confirmDelete = (id) => {
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
    if (!isAdmin) return;
    
    try {
      await deleteDoc(doc(db, "overheads", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Overhead deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting overhead:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="bg-gray-900 rounded py-4 mb-4">
        <h1 className="text-2xl text-white font-bold pl-4">Overhead Management</h1>
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
              Add New Overhead
            </button>
          </div>
        )}

        {/* Table component - visible to all users */}
        <DisplayOverheadTable
          overheads={overheads}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing overhead */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedOverhead ? "Edit Overhead" : "Add New Overhead"}
            size="lg"
          >
            <AddOverheadForm
              onSubmit={addOverhead}
              selectedOverhead={selectedOverhead}
              onUpdate={updateOverhead}
              setSelectedOverhead={setSelectedOverhead}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>

          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="overhead"
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

export default OverheadManagement;