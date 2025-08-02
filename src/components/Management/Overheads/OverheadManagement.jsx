import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddOverheadForm from "./AddOverheadForm";
import DisplayOverheadTable from "./DisplayOverheadTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport"; // Import the export/import component

const OverheadManagement = () => {
  const { userRole } = useAuth();
  const [overheads, setOverheads] = useState([]);
  const [selectedOverhead, setSelectedOverhead] = useState(null);
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
  const canView = userRole === "accountant" || userRole === "staff";

  // Overhead statistics
  const [overheadStats, setOverheadStats] = useState({
    totalOverheads: 0,
    activeOverheads: 0,
    fixedOverheads: 0,
    variableOverheads: 0,
    averageRate: 0
  });

  useEffect(() => {
    const overheadsCollection = collection(db, "overheads");
    const unsubscribe = onSnapshot(overheadsCollection, (snapshot) => {
      const overheadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setOverheads(overheadsData);
      
      // Calculate overhead statistics
      const stats = {
        totalOverheads: overheadsData.length,
        activeOverheads: overheadsData.filter(oh => oh.active !== false).length,
        fixedOverheads: overheadsData.filter(oh => oh.type === "Fixed").length,
        variableOverheads: overheadsData.filter(oh => oh.type === "Variable").length,
        averageRate: overheadsData.length > 0 
          ? overheadsData.reduce((sum, oh) => sum + (parseFloat(oh.rate) || 0), 0) / overheadsData.length 
          : 0
      };
      
      setOverheadStats(stats);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addOverhead = async (overheadData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const overheadsCollection = collection(db, "overheads");
      await addDoc(overheadsCollection, { 
        ...overheadData, 
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Overhead added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOverhead = async (id, updatedData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const overheadDoc = doc(db, "overheads", id);
      await updateDoc(overheadDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Overhead updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedOverhead(null);
    } catch (error) {
      console.error("Error updating overhead:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedOverhead(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (overhead) => {
    if (!isAdmin) return;
    
    setSelectedOverhead({...overhead}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedOverhead(null);
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

  // Handle notification from export/import operations
  const handleExportImportSuccess = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Success",
      status: "success"
    });
  };

  const handleExportImportError = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Error",
      status: "error"
    });
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    
    try {
      await deleteDoc(doc(db, "overheads", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Overhead deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting overhead:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting overhead. Please try again.",
        title: "Error",
        status: "error"
      });
    }
  };

  // Redirect non-authorized users
  if (!isAdmin && !canView) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access overhead management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Overhead Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h1 className="text-2xl font-bold text-gray-900">Standard Parameters</h1>
        <p className="text-gray-600 mt-1">
          Manage overhead costs and rates for your business operations
        </p>
      </div>
      
      {/* Action buttons with Export/Import options */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {/* Only show import/export to admins */}
          {isAdmin && (
            <DBExportImport 
              db={db}
              collectionName="overheads"
              onSuccess={handleExportImportSuccess}
              onError={handleExportImportError}
              dateFields={['timestamp', 'createdAt', 'updatedAt']}
            />
          )}
        </div>
        
        <div>
          {isAdmin && (
            <button 
              onClick={handleAddClick}
              className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Overhead
            </button>
          )}
        </div>
      </div>

      {/* Table component - visible to all users */}
      <div className="overflow-hidden">
        <DisplayOverheadTable
          overheads={overheads}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing overhead */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedOverhead ? "Edit Overhead" : "Add New Overhead"}
            size="lg"
          >
            <AddOverheadForm
              onSubmit={addOverhead}
              selectedOverhead={selectedOverhead}
              onUpdate={updateOverhead}
              setSelectedOverhead={setSelectedOverhead}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>

          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="overhead"
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

export default OverheadManagement;