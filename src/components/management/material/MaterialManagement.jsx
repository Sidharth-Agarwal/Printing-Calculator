import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Material } from "../../../models/Material";
import AddMaterialForm from "./AddMaterialForm";
import MaterialTable from "./MaterialTable";
import MaterialSearch from "./MaterialSearch";
import CollapsibleSection from "../../shared/CollapsibleSection";
import Spinner from "../../shared/Spinner";
import Toast from "../../shared/Toast";

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    term: "",
    filters: {
      materialType: "",
      supplier: ""
    }
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Real-time listener for materials
  useEffect(() => {
    const materialsCollection = collection(db, "materials");
    const materialsQuery = query(materialsCollection, orderBy("materialType", "asc"));
    
    const unsubscribe = onSnapshot(materialsQuery, (snapshot) => {
      const materialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setMaterials(materialsData);
      setFilteredMaterials(materialsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching materials:", error);
      setNotification({
        show: true,
        message: "Failed to load materials. Please try again.",
        type: "error"
      });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Filter materials based on search parameters
  useEffect(() => {
    if (materials.length > 0) {
      let results = [...materials];
      
      // Apply text search
      if (searchParams.term) {
        const term = searchParams.term.toLowerCase();
        results = results.filter(material => 
          material.materialName?.toLowerCase().includes(term) || 
          material.materialType?.toLowerCase().includes(term) ||
          material.supplier?.toLowerCase().includes(term)
        );
      }
      
      // Apply filters
      if (searchParams.filters.materialType) {
        results = results.filter(material => 
          material.materialType === searchParams.filters.materialType
        );
      }
      
      if (searchParams.filters.supplier) {
        results = results.filter(material => 
          material.supplier === searchParams.filters.supplier
        );
      }
      
      setFilteredMaterials(results);
    }
  }, [searchParams, materials]);

  // Add material to Firestore
  const addMaterial = async (materialData) => {
    try {
      const newMaterial = new Material({
        ...materialData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const materialsCollection = collection(db, "materials");
      await addDoc(materialsCollection, newMaterial);
      
      setNotification({
        show: true,
        message: "Material added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding material:", error);
      setNotification({
        show: true,
        message: "Failed to add material. Please try again.",
        type: "error"
      });
    }
  };

  // Update material in Firestore
  const updateMaterial = async (id, updatedData) => {
    try {
      const materialDoc = doc(db, "materials", id);
      
      // Add updated timestamp
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      await updateDoc(materialDoc, dataToUpdate);
      
      setSelectedMaterial(null); // Clear the editing state
      setNotification({
        show: true,
        message: "Material updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating material:", error);
      setNotification({
        show: true,
        message: "Failed to update material. Please try again.",
        type: "error"
      });
    }
  };

  // Delete material from Firestore
  const deleteMaterial = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this material?")) {
        await deleteDoc(doc(db, "materials", id));
        setNotification({
          show: true,
          message: "Material deleted successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      setNotification({
        show: true,
        message: "Failed to delete material. Please try again.",
        type: "error"
      });
    }
  };

  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  // Get unique material types and suppliers for filters
  const getFilterOptions = () => {
    const materialTypes = [...new Set(materials.map(material => material.materialType))].filter(Boolean);
    const suppliers = [...new Set(materials.map(material => material.supplier))].filter(Boolean);
    
    return { materialTypes, suppliers };
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">MATERIAL MANAGEMENT</h1>
      
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
        <MaterialSearch 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          filterOptions={filterOptions}
        />
      </CollapsibleSection>
      
      {/* Add/Edit Material Form */}
      <CollapsibleSection title={selectedMaterial ? "EDIT MATERIAL" : "ADD NEW MATERIAL"} initiallyExpanded={true}>
        <AddMaterialForm
          onSubmit={addMaterial}
          selectedMaterial={selectedMaterial}
          onUpdate={updateMaterial}
          setSelectedMaterial={setSelectedMaterial}
        />
      </CollapsibleSection>
      
      {/* Material Table */}
      {loading ? (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading materials...</p>
        </div>
      ) : (
        <MaterialTable
          materials={filteredMaterials}
          onDelete={deleteMaterial}
          onEdit={(material) => setSelectedMaterial(material)}
        />
      )}
    </div>
  );
};

export default MaterialManagement;