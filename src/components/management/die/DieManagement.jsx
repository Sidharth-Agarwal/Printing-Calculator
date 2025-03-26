import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import { Die } from "../../../models/Die";
import AddDieForm from "./AddDieForm";
import DieTable from "./DieTable";
import DieSearch from "./DieSearch";
import CollapsibleSection from "../../shared/CollapsibleSection";
import Spinner from "../../shared/Spinner";
import Toast from "../../shared/Toast";

const DieManagement = () => {
  const [dies, setDies] = useState([]);
  const [filteredDies, setFilteredDies] = useState([]);
  const [editingDie, setEditingDie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    term: "",
    filters: {
      jobType: "",
      type: ""
    }
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Real-time listener for dies
  useEffect(() => {
    const diesCollection = collection(db, "dies");
    const diesQuery = query(diesCollection, orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(diesQuery, (snapshot) => {
      const diesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setDies(diesData);
      setFilteredDies(diesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching dies:", error);
      setNotification({
        show: true,
        message: "Failed to load dies. Please try again.",
        type: "error"
      });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Filter dies based on search parameters
  useEffect(() => {
    if (dies.length > 0) {
      let results = [...dies];
      
      // Apply text search
      if (searchParams.term) {
        const term = searchParams.term.toLowerCase();
        results = results.filter(die => 
          die.dieCode?.toLowerCase().includes(term) || 
          die.type?.toLowerCase().includes(term)
        );
      }
      
      // Apply filters
      if (searchParams.filters.jobType) {
        results = results.filter(die => 
          die.jobType === searchParams.filters.jobType
        );
      }
      
      if (searchParams.filters.type) {
        results = results.filter(die => 
          die.type === searchParams.filters.type
        );
      }
      
      setFilteredDies(results);
    }
  }, [searchParams, dies]);

  // Add die to Firestore
  const addDie = async (newDieData) => {
    try {
      const newDie = new Die({
        ...newDieData,
        timestamp: new Date()
      });
      
      const diesCollection = collection(db, "dies");
      await addDoc(diesCollection, newDie);
      
      setNotification({
        show: true,
        message: "Die added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding die:", error);
      setNotification({
        show: true,
        message: "Failed to add die. Please try again.",
        type: "error"
      });
    }
  };

  // Update die in Firestore
  const updateDie = async (id, updatedData) => {
    try {
      const dieDoc = doc(db, "dies", id);
      await updateDoc(dieDoc, updatedData);
      
      setEditingDie(null); // Clear the editing state
      setNotification({
        show: true,
        message: "Die updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating die:", error);
      setNotification({
        show: true,
        message: "Failed to update die. Please try again.",
        type: "error"
      });
    }
  };

  // Delete die from Firestore
  const deleteDie = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this die?")) {
        await deleteDoc(doc(db, "dies", id));
        setNotification({
          show: true,
          message: "Die deleted successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error deleting die:", error);
      setNotification({
        show: true,
        message: "Failed to delete die. Please try again.",
        type: "error"
      });
    }
  };

  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  // Get unique job types and die types for filters
  const getFilterOptions = () => {
    const jobTypes = [...new Set(dies.map(die => die.jobType))].filter(Boolean);
    const dieTypes = [...new Set(dies.map(die => die.type))].filter(Boolean);
    
    return { jobTypes, dieTypes };
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">DIE MANAGEMENT</h1>
      
      {/* Notification Toast */}
      {notification.show && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={clearNotification}
        />
      )}
      
      {/* Search and Filters */}
      <CollapsibleSection title="Search & Filters" initiallyExpanded={false}>
        <DieSearch 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          filterOptions={filterOptions}
        />
      </CollapsibleSection>
      
      {/* Add/Edit Die Form */}
      <CollapsibleSection title={editingDie ? "EDIT DIE" : "ADD NEW DIE"} initiallyExpanded={true}>
        <AddDieForm
          onAddDie={addDie}
          onUpdateDie={updateDie}
          editingDie={editingDie}
          setEditingDie={setEditingDie}
          storage={storage}
        />
      </CollapsibleSection>
      
      {/* Die Table */}
      {loading ? (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading dies...</p>
        </div>
      ) : (
        <DieTable
          dies={filteredDies}
          onEditDie={setEditingDie}
          onDeleteDie={deleteDie}
        />
      )}
    </div>
  );
};

export default DieManagement;