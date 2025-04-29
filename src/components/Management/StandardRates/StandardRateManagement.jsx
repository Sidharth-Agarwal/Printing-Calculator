import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddStandardRateForm from "./AddStandardRateForm";
import DisplayStandardRateTable from "./DisplayStandardRateTable";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import ConfirmationModal from "../ConfirmationModal";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
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
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!rateData.finalRate && !rateData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        return;
      }

      const ratesCollection = collection(db, "standard_rates");
      await addDoc(ratesCollection, {
        ...rateData,
        timestamp: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Rate added successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error adding rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to add rate. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  const updateRate = async (id, updatedData) => {
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!updatedData.finalRate && !updatedData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        return;
      }

      const rateDoc = doc(db, "standard_rates", id);
      await updateDoc(rateDoc, updatedData);
      
      setNotification({
        isOpen: true,
        message: "Rate updated successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error updating rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to update rate. Please try again.",
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
    <div>
      <h1 className="text-xl font-bold mb-4">Standard Rate Management</h1>
      <AddStandardRateForm
        onSubmit={addRate}
        selectedRate={selectedRate}
        onUpdate={updateRate}
        setSelectedRate={setSelectedRate}
      />
      <DisplayStandardRateTable
        rates={rates}
        onDelete={confirmDelete}
        onEdit={(rate) => setSelectedRate(rate)}
      />
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
    </div>
  );
};

export default StandardRateManagement;