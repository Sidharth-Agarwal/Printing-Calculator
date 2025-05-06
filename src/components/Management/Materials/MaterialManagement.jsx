import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddMaterialForm from "./AddMaterialForm";
import DisplayMaterialTable from "./DisplayMaterialTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const MaterialManagement = () => {
  const { userRole } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });

  // Check if user is admin
  const isAdmin = userRole === "admin";

  // Material statistics
  const [materialStats, setMaterialStats] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    materialCategories: 0,
    averagePrice: 0
  });

  useEffect(() => {
    const materialsCollection = collection(db, "materials");
    const unsubscribe = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setMaterials(materialsData);
      
      // Calculate statistics
      const uniqueCategories = new Set(materialsData.map(material => material.category)).size;
      
      const activeCount = materialsData.filter(material => material.isActive !== false).length;
      
      const avgPrice = materialsData.length > 0
        ? materialsData.reduce((sum, material) => sum + (parseFloat(material.price) || 0), 0) / materialsData.length
        : 0;
      
      setMaterialStats({
        totalMaterials: materialsData.length,
        activeMaterials: activeCount,
        materialCategories: uniqueCategories,
        averagePrice: avgPrice
      });
      
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addMaterial = async (materialData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const materialsCollection = collection(db, "materials");
      await addDoc(materialsCollection, { 
        ...materialData, 
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Material added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding material. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMaterial = async (id, updatedData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const materialDoc = doc(db, "materials", id);
      await updateDoc(materialDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Material updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error("Error updating material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating material. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedMaterial(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (material) => {
    if (!isAdmin) return;
    
    setSelectedMaterial({...material}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedMaterial(null);
  };

  const confirmDelete = (id) => {
    if (!isAdmin) return;
    
    setDeleteConfirmation({
      isOpen: true,
      itemId: id
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      message: "",
      title: "",
      status: "success"
    });
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    
    try {
      await deleteDoc(doc(db, "materials", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Material deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting material. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  // Redirect non-authorized users
  if (!isAdmin && userRole !== "staff") {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access material management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
        <p className="text-gray-600 mt-1">
          Manage raw materials, supplies, and inventory for production
        </p>
      </div>
      
      {/* Material Statistics */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Materials</h2>
          <p className="text-2xl font-bold text-gray-800">{materialStats.totalMaterials}</p>
          <p className="text-xs text-gray-500 mt-1">
            {materialStats.activeMaterials} materials currently available
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Categories</h2>
          <p className="text-2xl font-bold text-blue-600">{materialStats.materialCategories}</p>
          <p className="text-xs text-gray-500 mt-1">
            Different material types in inventory
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Average Price</h2>
          <p className="text-2xl font-bold text-red-600">₹{Math.round(materialStats.averagePrice)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Average price per unit material
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Availability</h2>
          <p className="text-2xl font-bold text-green-600">
            {((materialStats.activeMaterials / materialStats.totalMaterials) * 100 || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Percentage of materials currently available
          </p>
        </div>
      </div> */}

      {/* Action buttons - only visible to admins */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Material
          </button>
        </div>
      )}

      {/* Table component - visible to all users */}
      <div className="overflow-hidden">
        <DisplayMaterialTable
          materials={materials}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing material */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedMaterial ? "Edit Material" : "Add New Material"}
            size="lg"
          >
            <AddMaterialForm
              onSubmit={addMaterial}
              selectedMaterial={selectedMaterial}
              onUpdate={updateMaterial}
              setSelectedMaterial={setSelectedMaterial}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>

          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="material"
          />
          
          <ConfirmationModal
            isOpen={notification.isOpen}
            onClose={closeNotification}
            message={notification.message}
            title={notification.title}
            status={notification.status}
          />
        </>
      )}
    </div>
  );
};

export default MaterialManagement;