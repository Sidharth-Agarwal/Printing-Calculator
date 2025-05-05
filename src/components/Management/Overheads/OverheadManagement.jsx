import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddOverheadForm from "./AddOverheadForm";
import DisplayOverheadTable from "./DisplayOverheadTable";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";

const OverheadManagement = () => {
  const [overheads, setOverheads] = useState([]);
  const [selectedOverhead, setSelectedOverhead] = useState(null);
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
    try {
      const overheadsCollection = collection(db, "overheads");
      await addDoc(overheadsCollection, { ...overheadData, timestamp: new Date() });
      
      setNotification({
        isOpen: true,
        message: "Overhead added successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error adding overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  const updateOverhead = async (id, updatedData) => {
    try {
      const overheadDoc = doc(db, "overheads", id);
      await updateDoc(overheadDoc, updatedData);
      
      setNotification({
        isOpen: true,
        message: "Overhead updated successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error updating overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating overhead. Please try again.",
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
    <div>
      <h1 className="text-xl font-bold mb-4">Overhead Management</h1>
      <AddOverheadForm
        onSubmit={addOverhead}
        selectedOverhead={selectedOverhead}
        onUpdate={updateOverhead}
        setSelectedOverhead={setSelectedOverhead}
      />
      <DisplayOverheadTable
        overheads={overheads}
        onDelete={confirmDelete}
        onEdit={(overhead) => setSelectedOverhead(overhead)}
      />
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
    </div>
  );
};

export default OverheadManagement;