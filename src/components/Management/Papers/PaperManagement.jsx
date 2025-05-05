import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null);
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

  // Real-time listener for papers
  useEffect(() => {
    const papersCollection = collection(db, "papers");
    const unsubscribe = onSnapshot(papersCollection, (snapshot) => {
      const papersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(papersData);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Add paper to Firestore
  const addPaper = async (newPaper) => {
    setIsSubmitting(true);
    try {
      const papersCollection = collection(db, "papers");
      await addDoc(papersCollection, { ...newPaper, timestamp: new Date() });
      
      setNotification({
        isOpen: true,
        message: "Paper added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding paper. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update paper in Firestore
  const updatePaper = async (id, updatedData) => {
    setIsSubmitting(true);
    try {
      const paperDoc = doc(db, "papers", id);
      await updateDoc(paperDoc, updatedData);
      
      setNotification({
        isOpen: true,
        message: "Paper updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setEditingPaper(null); // Clear the editing state
    } catch (error) {
      console.error("Error updating paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating paper. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setEditingPaper(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (paper) => {
    setEditingPaper({...paper}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingPaper(null);
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
      await deleteDoc(doc(db, "papers", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Paper deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting paper:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting paper. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="rounded bg-gray-900 py-4">
        <h1 className="text-2xl text-white font-bold pl-4">Paper Management</h1>
      </div>

      {/* Main content */}
      <div>
        {/* Action buttons */}
        <div className="flex justify-end my-4 pr-4">
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Paper
          </button>
        </div>

        {/* Table component */}
        <div className="px-4">
          <DisplayPaperTable
            papers={papers}
            onEditPaper={handleEditClick}
            onDeletePaper={confirmDelete}
          />
        </div>
      </div>

      {/* Modal for adding/editing paper - now with lg size */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingPaper ? "Edit Paper" : "Add New Paper"}
        size="lg" // Using the larger size for the form
      >
        <AddPaperForm
          onSubmit={editingPaper ? 
            (data) => updatePaper(editingPaper.id, data) : 
            addPaper
          }
          initialData={editingPaper}
          isSubmitting={isSubmitting}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Confirmation modals */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName="paper"
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

export default PaperManagement;