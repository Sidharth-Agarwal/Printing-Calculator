import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Paper } from "../../../models/Paper";
import AddPaperForm from "./AddPaperForm";
import PaperTable from "./PaperTable";
import PaperSearch from "./PaperSearch";
import CollapsibleSection from "../../shared/CollapsibleSection";
import Spinner from "../../shared/Spinner";
import Button from "../../shared/Button";
import Toast from "../../shared/Toast";

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    term: "",
    filters: {
      company: "",
      gsm: "",
      paperType: ""
    }
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Real-time listener for papers
  useEffect(() => {
    const papersCollection = collection(db, "papers");
    const papersQuery = query(papersCollection, orderBy("updatedAt", "desc"));
    
    const unsubscribe = onSnapshot(papersQuery, (snapshot) => {
      const papersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setPapers(papersData);
      setFilteredPapers(papersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching papers:", error);
      setNotification({
        show: true,
        message: "Failed to load papers. Please try again.",
        type: "error"
      });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Filter papers based on search parameters
  useEffect(() => {
    if (papers.length > 0) {
      let results = [...papers];
      
      // Apply text search
      if (searchParams.term) {
        const term = searchParams.term.toLowerCase();
        results = results.filter(paper => 
          paper.paperName?.toLowerCase().includes(term) || 
          paper.company?.toLowerCase().includes(term)
        );
      }
      
      // Apply filters
      if (searchParams.filters.company) {
        results = results.filter(paper => 
          paper.company === searchParams.filters.company
        );
      }
      
      if (searchParams.filters.gsm) {
        results = results.filter(paper => 
          paper.gsm === parseInt(searchParams.filters.gsm)
        );
      }
      
      if (searchParams.filters.paperType) {
        results = results.filter(paper => 
          paper.paperType === searchParams.filters.paperType
        );
      }
      
      setFilteredPapers(results);
    }
  }, [searchParams, papers]);

  // Add paper to Firestore
  const addPaper = async (newPaperData) => {
    try {
      const newPaper = new Paper({
        ...newPaperData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const papersCollection = collection(db, "papers");
      await addDoc(papersCollection, newPaper);
      
      setNotification({
        show: true,
        message: "Paper added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding paper:", error);
      setNotification({
        show: true,
        message: "Failed to add paper. Please try again.",
        type: "error"
      });
    }
  };

  // Update paper in Firestore
  const updatePaper = async (id, updatedData) => {
    try {
      const paperDoc = doc(db, "papers", id);
      
      // Prepare updated paper with updated timestamp
      const updatedPaper = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      await updateDoc(paperDoc, updatedPaper);
      
      setEditingPaper(null); // Clear the editing state
      setNotification({
        show: true,
        message: "Paper updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating paper:", error);
      setNotification({
        show: true,
        message: "Failed to update paper. Please try again.",
        type: "error"
      });
    }
  };

  // Delete paper from Firestore
  const deletePaper = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this paper?")) {
        await deleteDoc(doc(db, "papers", id));
        setNotification({
          show: true,
          message: "Paper deleted successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error deleting paper:", error);
      setNotification({
        show: true,
        message: "Failed to delete paper. Please try again.",
        type: "error"
      });
    }
  };

  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  // Get unique companies and paper types for filters
  const getFilterOptions = () => {
    const companies = [...new Set(papers.map(paper => paper.company))].filter(Boolean);
    const paperTypes = [...new Set(papers.map(paper => paper.paperType))].filter(Boolean);
    const gsmValues = [...new Set(papers.map(paper => paper.gsm))].filter(Boolean).sort((a, b) => a - b);
    
    return { companies, paperTypes, gsmValues };
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">PAPER MANAGEMENT</h1>
      
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
        <PaperSearch 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          filterOptions={filterOptions}
        />
      </CollapsibleSection>
      
      {/* Add/Edit Paper Form */}
      <CollapsibleSection title={editingPaper ? "EDIT PAPER" : "ADD NEW PAPER"} initiallyExpanded={true}>
        <AddPaperForm
          onAddPaper={addPaper}
          onUpdatePaper={updatePaper}
          editingPaper={editingPaper}
          setEditingPaper={setEditingPaper}
        />
      </CollapsibleSection>
      
      {/* Paper Table */}
      {loading ? (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading papers...</p>
        </div>
      ) : (
        <PaperTable
          papers={filteredPapers}
          onEditPaper={setEditingPaper}
          onDeletePaper={deletePaper}
        />
      )}
    </div>
  );
};

export default PaperManagement;