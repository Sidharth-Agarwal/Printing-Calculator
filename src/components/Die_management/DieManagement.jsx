import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AddDieForm from "./AddDieForm";
import DisplayDieTable from "./DisplayDieTable";

const DieManagement = () => {
  const [dies, setDies] = useState([]);
  const [editingDie, setEditingDie] = useState(null);

  useEffect(() => {
    const diesCollection = collection(db, "dies");
    const unsubscribe = onSnapshot(diesCollection, (snapshot) => {
      const diesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDies(diesData);
    });

    return () => unsubscribe();
  }, []);

  const addDie = async (newDie) => {
    try {
      let imageUrl = "";
      if (newDie.image) {
        const imageRef = ref(storage, `dieImages/${newDie.image.name}`);
        const snapshot = await uploadBytes(imageRef, newDie.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const diesCollection = collection(db, "dies");
      await addDoc(diesCollection, { ...newDie, imageUrl, timestamp: new Date() });
      alert("Die added successfully!");
    } catch (error) {
      console.error("Error adding die:", error);
      alert("Error adding die.");
    }
  };

  const updateDie = async (id, updatedData) => {
    try {
      let imageUrl = updatedData.imageUrl;

      if (updatedData.image) {
        const imageRef = ref(storage, `dieImages/${updatedData.image.name}`);
        const snapshot = await uploadBytes(imageRef, updatedData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const dieDoc = doc(db, "dies", id);
      await updateDoc(dieDoc, { ...updatedData, imageUrl });
      alert("Die updated successfully!");
      setEditingDie(null);
    } catch (error) {
      console.error("Error updating die:", error);
    }
  };

  const deleteDie = async (id) => {
    try {
      await deleteDoc(doc(db, "dies", id));
      alert("Die deleted successfully!");
    } catch (error) {
      console.error("Error deleting die:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Die Management</h1>
      <AddDieForm
        onAddDie={addDie}
        onUpdateDie={updateDie}
        editingDie={editingDie}
        setEditingDie={setEditingDie}
      />
      <DisplayDieTable
        dies={dies}
        onEditDie={setEditingDie}
        onDeleteDie={deleteDie}
      />
    </div>
  );
};

export default DieManagement;
