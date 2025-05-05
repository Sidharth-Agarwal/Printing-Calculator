import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddMaterialForm from "./AddMaterialForm";
import DisplayMaterialTable from "./DisplayMaterialTable";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
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
    const materialsCollection = collection(db, "materials");
    const unsubscribe = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(materialsData);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addMaterial = async (materialData) => {
    try {
      const materialsCollection = collection(db, "materials");
      await addDoc(materialsCollection, materialData);
      
      setNotification({
        isOpen: true,
        message: "Material added successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error adding material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding material. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  const updateMaterial = async (id, updatedData) => {
    try {
      const materialDoc = doc(db, "materials", id);
      await updateDoc(materialDoc, updatedData);
      
      setNotification({
        isOpen: true,
        message: "Material updated successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error updating material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating material. Please try again.",
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
      await deleteDoc(doc(db, "materials", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Material deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting material. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Material Management</h1>
      <AddMaterialForm
        onSubmit={addMaterial}
        selectedMaterial={selectedMaterial}
        onUpdate={updateMaterial}
        setSelectedMaterial={setSelectedMaterial}
      />
      <DisplayMaterialTable
        materials={materials}
        onDelete={confirmDelete}
        onEdit={(material) => setSelectedMaterial(material)}
      />
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName="material"
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

export default MaterialManagement;