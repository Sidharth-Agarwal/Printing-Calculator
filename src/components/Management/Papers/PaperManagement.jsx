import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null); // Track the paper being edited
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
    try {
      const papersCollection = collection(db, "papers");
      await addDoc(papersCollection, { ...newPaper, timestamp: new Date() });
      
      setNotification({
        isOpen: true,
        message: "Paper added successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error adding paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding paper. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  // Update paper in Firestore
  const updatePaper = async (id, updatedData) => {
    try {
      const paperDoc = doc(db, "papers", id);
      await updateDoc(paperDoc, updatedData);
      setEditingPaper(null); // Clear the editing state
      
      setNotification({
        isOpen: true,
        message: "Paper updated successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error updating paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating paper. Please try again.",
        title: "Error",
        status: "error"
      });
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
    <div>
      <h1 className="text-xl font-bold mb-4">Paper Management</h1>
      <AddPaperForm
        onAddPaper={addPaper}
        onUpdatePaper={updatePaper}
        editingPaper={editingPaper} // Pass editing paper details
        setEditingPaper={setEditingPaper} // Allow clearing the edit state
      />
      <DisplayPaperTable
        papers={papers}
        onEditPaper={setEditingPaper} // Pass the selected paper to edit
        onDeletePaper={confirmDelete}
      />
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