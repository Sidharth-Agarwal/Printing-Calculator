import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddMaterialForm from "./AddMaterialForm";
import DisplayMaterialTable from "./DisplayMaterialTable";

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
      alert("Material added successfully!");
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const updateMaterial = async (id, updatedData) => {
    try {
      const materialDoc = doc(db, "materials", id);
      await updateDoc(materialDoc, updatedData);
      alert("Material updated successfully!");
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const deleteMaterial = async (id) => {
    try {
      await deleteDoc(doc(db, "materials", id));
      alert("Material deleted successfully!");
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">MATERIAL MANAGEMENT</h1>
      <AddMaterialForm
        onSubmit={addMaterial}
        selectedMaterial={selectedMaterial}
        onUpdate={updateMaterial}
        setSelectedMaterial={setSelectedMaterial}
      />
      <DisplayMaterialTable
        materials={materials}
        onDelete={deleteMaterial}
        onEdit={(material) => setSelectedMaterial(material)}
      />
    </div>
  );
};

export default MaterialManagement;
