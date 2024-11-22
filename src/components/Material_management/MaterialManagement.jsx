import React, { useState, useEffect } from "react";
import AddMaterial from "./AddMaterial";
import MaterialsTable from "./MaterialsTable";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch materials from Firebase
  const fetchMaterials = async () => {
    const querySnapshot = await getDocs(collection(db, "materials"));
    const fetchedMaterials = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMaterials(fetchedMaterials);
  };

  // Add material to Firebase
  const addMaterial = async (materialData) => {
    await addDoc(collection(db, "materials"), materialData);
    fetchMaterials();
  };

  // Update material in Firebase
  const updateMaterial = async (id, updatedData) => {
    await updateDoc(doc(db, "materials", id), updatedData);
    fetchMaterials();
  };

  // Delete material from Firebase
  const deleteMaterial = async (id) => {
    await deleteDoc(doc(db, "materials", id));
    fetchMaterials();
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Material Management</h1>
      <AddMaterial
        onSubmit={addMaterial}
        selectedMaterial={selectedMaterial}
        onUpdate={updateMaterial}
        setSelectedMaterial={setSelectedMaterial}
      />
      <MaterialsTable
        materials={materials}
        onDelete={deleteMaterial}
        onEdit={(material) => setSelectedMaterial(material)}
      />
    </div>
  );
};

export default MaterialManagement;