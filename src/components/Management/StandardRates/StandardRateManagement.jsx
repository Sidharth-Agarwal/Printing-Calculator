import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddStandardRateForm from "./AddStandardRateForm";
import DisplayStandardRateTable from "./DisplayStandardRateTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const StandardRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
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

  // Get the user role from auth context
  const { userRole } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = userRole === "admin";

  // Labour rate statistics
  const [rateStats, setRateStats] = useState({
    totalRates: 0,
    fixedRates: 0,
    percentageRates: 0,
    averageFixedRate: 0,
    averagePercentage: 0
  });

  useEffect(() => {
    const ratesCollection = collection(db, "standard_rates");
    const unsubscribe = onSnapshot(ratesCollection, (snapshot) => {
      const ratesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setRates(ratesData);
      
      // Calculate statistics
      const fixedRates = ratesData.filter(rate => rate.finalRate && rate.finalRate > 0);
      const percentageRates = ratesData.filter(rate => rate.percentage && rate.percentage > 0);
      
      const avgFixedRate = fixedRates.length > 0 
        ? fixedRates.reduce((sum, rate) => sum + (parseFloat(rate.finalRate) || 0), 0) / fixedRates.length 
        : 0;
        
      const avgPercentage = percentageRates.length > 0 
        ? percentageRates.reduce((sum, rate) => sum + (parseFloat(rate.percentage) || 0), 0) / percentageRates.length 
        : 0;
      
      setRateStats({
        totalRates: ratesData.length,
        fixedRates: fixedRates.length,
        percentageRates: percentageRates.length,
        averageFixedRate: avgFixedRate,
        averagePercentage: avgPercentage
      });
      
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const addRate = async (rateData) => {
    // Return early if user is not admin
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!rateData.finalRate && !rateData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }

      const ratesCollection = collection(db, "standard_rates");
      await addDoc(ratesCollection, {
        ...rateData,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Rate added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to add rate. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRate = async (id, updatedData) => {
    // Return early if user is not admin
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      // Validate that at least one of finalRate or percentage is provided
      if (!updatedData.finalRate && !updatedData.percentage) {
        setNotification({
          isOpen: true,
          message: "Please enter either a Final Rate or a Percentage",
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }

      const rateDoc = doc(db, "standard_rates", id);
      await updateDoc(rateDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Rate updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error("Error updating rate:", error);
      
      setNotification({
        isOpen: true,
        message: "Failed to update rate. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedRate(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (rate) => {
    if (!isAdmin) return;
    
    setSelectedRate({...rate}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedRate(null);
  };

  const confirmDelete = (id) => {
    // Return early if user is not admin
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
    // Return early if user is not admin
    if (!isAdmin) return;

    try {
      await deleteDoc(doc(db, "standard_rates", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Rate deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting rate:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Failed to delete rate. Please try again.",
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
          <p className="mt-2 text-red-600">You don't have permission to access labour management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Labour Management</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Labour Management</h1>
        <p className="text-gray-600 mt-1">
          Manage standard labour rates and pricing for various production processes
        </p>
      </div>
      
      {/* Rate Statistics */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Rates</h2>
          <p className="text-2xl font-bold text-gray-800">{rateStats.totalRates}</p>
          <p className="text-xs text-gray-500 mt-1">
            All production process rates
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Fixed Rates</h2>
          <p className="text-2xl font-bold text-blue-600">{rateStats.fixedRates}</p>
          <p className="text-xs text-gray-500 mt-1">
            Average: ₹{rateStats.averageFixedRate.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Percentage Rates</h2>
          <p className="text-2xl font-bold text-red-600">{rateStats.percentageRates}</p>
          <p className="text-xs text-gray-500 mt-1">
            Average: {rateStats.averagePercentage.toFixed(2)}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Rate Distribution</h2>
          <div className="flex items-center mt-2">
            <div className="flex-grow relative h-2 bg-gray-200 rounded-full">
              {rateStats.totalRates > 0 && (
                <>
                  <div 
                    className="absolute left-0 h-2 bg-blue-500 rounded-l-full" 
                    style={{ width: `${(rateStats.fixedRates / rateStats.totalRates) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute right-0 h-2 bg-red-500 rounded-r-full" 
                    style={{ width: `${(rateStats.percentageRates / rateStats.totalRates) * 100}%` }}
                  ></div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{((rateStats.fixedRates / rateStats.totalRates) * 100 || 0).toFixed(0)}% Fixed</span>
            <span>{((rateStats.percentageRates / rateStats.totalRates) * 100 || 0).toFixed(0)}% Percentage</span>
          </div>
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
            Add New Rate
          </button>
        </div>
      )}

      {/* Table component - visible to all users */}
      <div className="overflow-hidden">
        <DisplayStandardRateTable
          rates={rates}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>
      
      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing rate */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedRate ? "Edit Standard Rate" : "Add New Standard Rate"}
            size="lg"
          >
            <AddStandardRateForm
              onSubmit={addRate}
              selectedRate={selectedRate}
              onUpdate={updateRate}
              setSelectedRate={setSelectedRate}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>
          
          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="rate"
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

export default StandardRateManagement;