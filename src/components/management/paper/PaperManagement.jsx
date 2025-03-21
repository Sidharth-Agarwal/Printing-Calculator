import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";
import { addPaper, updatePaper, deletePaper } from "../../../services/firebase/papers";

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for papers
  useEffect(() => {
    const loadPapers = async () => {
      setIsLoading(true);
      try {
        const papersCollection = collection(db, "papers");
        const unsubscribe = onSnapshot(
          papersCollection, 
          (snapshot) => {
            const papersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPapers(papersData);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error in paper snapshot listener:", err);
            setError("Failed to load papers. Please refresh the page.");
            setIsLoading(false);
          }
        );
        
        return () => unsubscribe(); // Cleanup listener on unmount
      } catch (err) {
        console.error("Error setting up paper listener:", err);
        setError("Failed to connect to database. Please try again later.");
        setIsLoading(false);
      }
    };
    
    loadPapers();
  }, []);

  // Add paper to Firestore
  const handleAddPaper = async (newPaper) => {
    try {
      await addPaper({ ...newPaper, timestamp: new Date() });
      alert("Paper added successfully!");
    } catch (error) {
      console.error("Error adding paper:", error);
      alert("Error adding paper. Please try again.");
    }
  };

  // Update paper in Firestore
  const handleUpdatePaper = async (id, updatedData) => {
    try {
      await updatePaper(id, updatedData);
      alert("Paper updated successfully!");
      setEditingPaper(null); // Clear the editing state
    } catch (error) {
      console.error("Error updating paper:", error);
      alert("Error updating paper. Please try again.");
    }
  };

  // Delete paper from Firestore
  const handleDeletePaper = async (id) => {
    try {
      await deletePaper(id);
      alert("Paper deleted successfully!");
    } catch (error) {
      console.error("Error deleting paper:", error);
      alert("Error deleting paper. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">PAPER MANAGEMENT</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <AddPaperForm
        onAddPaper={handleAddPaper}
        onUpdatePaper={handleUpdatePaper}
        editingPaper={editingPaper}
        setEditingPaper={setEditingPaper}
      />
      
      {isLoading ? (
        <div className="text-center py-4">Loading papers...</div>
      ) : (
        <DisplayPaperTable
          papers={papers}
          onEditPaper={setEditingPaper}
          onDeletePaper={handleDeletePaper}
        />
      )}
    </div>
  );
};

export default PaperManagement;