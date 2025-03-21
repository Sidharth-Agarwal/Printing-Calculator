import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddMaterialForm from "./AddMaterialForm";
import DisplayMaterialTable from "./DisplayMaterialTable";
import { addMaterial, updateMaterial, deleteMaterial } from "../../../services/firebase/materials";

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const materialsCollection = collection(db, "materials");
        const unsubscribe = onSnapshot(
          materialsCollection, 
          (snapshot) => {
            const materialsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMaterials(materialsData);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error in materials snapshot listener:", err);
            setError("Failed to load materials. Please refresh the page.");
            setIsLoading(false);
          }
        );
        
        return () => unsubscribe(); // Cleanup listener
      } catch (err) {
        console.error("Error setting up materials listener:", err);
        setError("Failed to connect to database. Please try again later.");
        setIsLoading(false);
      }
    };
    
    loadMaterials();
  }, []);

  const handleAddMaterial = async (materialData) => {
    try {
      await addMaterial({
        ...materialData,
        timestamp: new Date()
      });
      alert("Material added successfully!");
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Error adding material. Please try again.");
    }
  };

  const handleUpdateMaterial = async (id, updatedData) => {
    try {
      await updateMaterial(id, updatedData);
      alert("Material updated successfully!");
      setSelectedMaterial(null);
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Error updating material. Please try again.");
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await deleteMaterial(id);
      alert("Material deleted successfully!");
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Error deleting material. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">MATERIAL MANAGEMENT</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <AddMaterialForm
        onSubmit={handleAddMaterial}
        selectedMaterial={selectedMaterial}
        onUpdate={handleUpdateMaterial}
        setSelectedMaterial={setSelectedMaterial}
      />
      
      {isLoading ? (
        <div className="text-center py-4">Loading materials...</div>
      ) : (
        <DisplayMaterialTable
          materials={materials}
          onEdit={setSelectedMaterial}
          onDelete={handleDeleteMaterial}
        />
      )}
    </div>
  );
};

export default MaterialManagement;