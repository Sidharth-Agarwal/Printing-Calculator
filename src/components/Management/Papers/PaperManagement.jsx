import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null); // Track the paper being edited

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
      alert("Paper added successfully!");
    } catch (error) {
      console.error("Error adding paper:", error);
    }
  };

  // Update paper in Firestore
  const updatePaper = async (id, updatedData) => {
    try {
      const paperDoc = doc(db, "papers", id);
      await updateDoc(paperDoc, updatedData);
      alert("Paper updated successfully!");
      setEditingPaper(null); // Clear the editing state
    } catch (error) {
      console.error("Error updating paper:", error);
    }
  };

  // Delete paper from Firestore
  const deletePaper = async (id) => {
    try {
      await deleteDoc(doc(db, "papers", id));
      alert("Paper deleted successfully!");
    } catch (error) {
      console.error("Error deleting paper:", error);
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
        onDeletePaper={deletePaper}
      />
    </div>
  );
};

export default PaperManagement;
