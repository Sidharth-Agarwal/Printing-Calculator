import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddOverheadForm from "./AddOverheadForm";
import DisplayOverheadTable from "./DisplayOverheadTable";

const OverheadManagement = () => {
  const [overheads, setOverheads] = useState([]);
  const [selectedOverhead, setSelectedOverhead] = useState(null);

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
      alert("Overhead added successfully!");
    } catch (error) {
      console.error("Error adding overhead:", error);
    }
  };

  const updateOverhead = async (id, updatedData) => {
    try {
      const overheadDoc = doc(db, "overheads", id);
      await updateDoc(overheadDoc, updatedData);
      alert("Overhead updated successfully!");
    } catch (error) {
      console.error("Error updating overhead:", error);
    }
  };

  const deleteOverhead = async (id) => {
    try {
      await deleteDoc(doc(db, "overheads", id));
      alert("Overhead deleted successfully!");
    } catch (error) {
      console.error("Error deleting overhead:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">OVERHEAD MANAGEMENT</h1>
      <AddOverheadForm
        onSubmit={addOverhead}
        selectedOverhead={selectedOverhead}
        onUpdate={updateOverhead}
        setSelectedOverhead={setSelectedOverhead}
      />
      <DisplayOverheadTable
        overheads={overheads}
        onDelete={deleteOverhead}
        onEdit={(overhead) => setSelectedOverhead(overhead)}
      />
    </div>
  );
};

export default OverheadManagement;