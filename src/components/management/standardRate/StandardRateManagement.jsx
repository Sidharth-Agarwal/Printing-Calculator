import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { StandardRate } from "../../../models/StandardRate";
import AddRateForm from "./AddRateForm";
import RateTable from "./RateTable";
import RateGroups from "./RateGroups";
import CollapsibleSection from "../../shared/CollapsibleSection";
import Spinner from "../../shared/Spinner";
import Toast from "../../shared/Toast";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Real-time listener for rates
  useEffect(() => {
    const ratesCollection = collection(db, "standard_rates");
    const ratesQuery = query(ratesCollection, orderBy("group", "asc"), orderBy("type", "asc"));
    
    const unsubscribe = onSnapshot(ratesQuery, (snapshot) => {
      const ratesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setRates(ratesData);
      setFilteredRates(ratesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching rates:", error);
      setNotification({
        show: true,
        message: "Failed to load rates. Please try again.",
        type: "error"
      });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Filter rates based on active group and search term
  useEffect(() => {
    if (rates.length > 0) {
      let results = [...rates];
      
      // Filter by group
      if (activeGroup !== "all") {
        results = results.filter(rate => rate.group === activeGroup);
      }
      
      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(rate => 
          rate.group?.toLowerCase().includes(term) || 
          rate.type?.toLowerCase().includes(term) ||
          rate.concatenate?.toLowerCase().includes(term)
        );
      }
      
      setFilteredRates(results);
    }
  }, [activeGroup, searchTerm, rates]);

  // Add rate to Firestore
  const addRate = async (rateData) => {
    try {
      // Ensure concatenate is generated if not provided
      if (!rateData.concatenate && rateData.group && rateData.type) {
        rateData.concatenate = `${rateData.group} ${rateData.type}`.trim();
      }
      
      const newRate = new StandardRate({
        ...rateData,
        effective: new Date()
      });
      
      const ratesCollection = collection(db, "standard_rates");
      await addDoc(ratesCollection, newRate);
      
      setNotification({
        show: true,
        message: "Rate added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding rate:", error);
      setNotification({
        show: true,
        message: "Failed to add rate. Please try again.",
        type: "error"
      });
    }
  };

  // Update rate in Firestore
  const updateRate = async (id, updatedData) => {
    try {
      // Ensure concatenate is updated if group or type changed
      if (updatedData.group && updatedData.type) {
        updatedData.concatenate = `${updatedData.group} ${updatedData.type}`.trim();
      }
      
      const rateDoc = doc(db, "standard_rates", id);
      await updateDoc(rateDoc, updatedData);
      
      setSelectedRate(null);
      setNotification({
        show: true,
        message: "Rate updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating rate:", error);
      setNotification({
        show: true,
        message: "Failed to update rate. Please try again.",
        type: "error"
      });
    }
  };

  // Delete rate from Firestore
  const deleteRate = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this rate?")) {
        await deleteDoc(doc(db, "standard_rates", id));
        setNotification({
          show: true,
          message: "Rate deleted successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error deleting rate:", error);
      setNotification({
        show: true,
        message: "Failed to delete rate. Please try again.",
        type: "error"
      });
    }
  };

  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  // Get unique groups for group filtering
  const getGroups = () => {
    return [...new Set(rates.map(rate => rate.group))].filter(Boolean);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveGroup("all");
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">STANDARD RATE MANAGEMENT</h1>
      
      {/* Notification Toast */}
      {notification.show && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={clearNotification}
        />
      )}
      
      {/* Group Filter */}
      <CollapsibleSection title="Rate Groups" initiallyExpanded={true}>
        <RateGroups 
          groups={getGroups()}
          activeGroup={activeGroup}
          setActiveGroup={setActiveGroup}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onClearFilters={clearFilters}
        />
      </CollapsibleSection>
      
      {/* Add/Edit Rate Form */}
      <CollapsibleSection title={selectedRate ? "EDIT RATE" : "ADD NEW RATE"} initiallyExpanded={true}>
        <AddRateForm
          onSubmit={addRate}
          selectedRate={selectedRate}
          onUpdate={updateRate}
          setSelectedRate={setSelectedRate}
          existingGroups={getGroups()}
        />
      </CollapsibleSection>
      
      {/* Rate Table */}
      {loading ? (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading rates...</p>
        </div>
      ) : (
        <RateTable
          rates={filteredRates}
          onDelete={deleteRate}
          onEdit={(rate) => setSelectedRate(rate)}
          activeGroup={activeGroup}
        />
      )}
    </div>
  );
};

export default StandardRateManagement;