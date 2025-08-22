import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddLoyaltyTierForm from "./AddLoyaltyTierForm";
import DisplayLoyaltyTierTable from "./DisplayLoyaltyTierTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";

const LoyaltyTierManagement = () => {
  const { userRole } = useAuth();
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
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

  // Check user permissions
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";
  const isAccountant = userRole === "accountant";
  const canView = isAdmin || isStaff || isAccountant;
  const canEdit = isAdmin || isStaff;
  const canAdd = isAdmin;
  const canDelete = isAdmin;

  // Loyalty tier statistics
  const [tierStats, setTierStats] = useState({
    totalTiers: 0,
    totalClients: 0,
    averageDiscount: 0,
    maxDiscount: 0
  });

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0";
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch loyalty tiers from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get count of B2B clients
        const clientsRef = collection(db, "clients");
        const b2bQuery = query(clientsRef, where("clientType", "==", "B2B"));
        const clientSnapshot = await getDocs(b2bQuery);
        const clientCount = clientSnapshot.size;
        
        // Fetch loyalty tiers
        const loyaltyTiersCollection = collection(db, "loyaltyTiers");
        const unsubscribe = onSnapshot(loyaltyTiersCollection, (snapshot) => {
          const tiersData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              dbId: doc.id // Store Firestore document ID
            };
          });
          
          setLoyaltyTiers(tiersData);
          
          // Calculate tier statistics
          const avgDiscount = tiersData.length > 0
            ? tiersData.reduce((sum, tier) => sum + (parseFloat(tier.discount) || 0), 0) / tiersData.length
            : 0;
            
          const maxDisc = tiersData.length > 0
            ? Math.max(...tiersData.map(tier => parseFloat(tier.discount) || 0))
            : 0;
          
          setTierStats({
            totalTiers: tiersData.length,
            totalClients: clientCount,
            averageDiscount: avgDiscount,
            maxDiscount: maxDisc
          });
          
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading loyalty tier data:", error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Check if tier ID is unique
  const isTierIdUnique = async (tierId) => {
    try {
      const tiersCollection = collection(db, "loyaltyTiers");
      const q = query(tiersCollection, where("id", "==", tierId));
      const querySnapshot = await getDocs(q);
      
      // If no matches found, the ID is unique
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking tier ID uniqueness:", error);
      return false;
    }
  };

  // Add new loyalty tier
  const addLoyaltyTier = async (tierData) => {
    if (!canAdd) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if tier ID is unique
      const isUnique = await isTierIdUnique(tierData.id);
      
      if (!isUnique) {
        setNotification({
          isOpen: true,
          message: `Tier ID "${tierData.id}" already exists. Please use a unique ID.`,
          title: "Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }
      
      const tiersCollection = collection(db, "loyaltyTiers");
      await addDoc(tiersCollection, {
        ...tierData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Loyalty tier added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding loyalty tier:", error);
      
      setNotification({
        isOpen: true,
        message: `Error adding loyalty tier: ${error.message}`,
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing loyalty tier
  const updateLoyaltyTier = async (dbId, updatedData) => {
    if (!canEdit) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating tier with dbId:", dbId);
      console.log("Updated data:", updatedData);
      
      // Make sure we're using a valid document ID
      if (!dbId) {
        console.error("No document ID provided for update operation");
        setNotification({
          isOpen: true,
          message: "Error: Missing document ID for update operation.",
          title: "Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }
      
      // First, get the current tier data
      const tierRef = doc(db, "loyaltyTiers", dbId);
      const tierSnap = await getDoc(tierRef);
      
      if (!tierSnap.exists()) {
        console.error(`Document with ID ${dbId} not found in Firestore`);
        setNotification({
          isOpen: true,
          message: "Error: Loyalty tier not found in database.",
          title: "Error",
          status: "error"
        });
        setIsSubmitting(false);
        return;
      }
      
      const currentData = tierSnap.data();
      console.log("Current data from Firestore:", currentData);
      
      // Only check for uniqueness if the tier ID has changed
      if (currentData.id !== updatedData.id) {
        const isUnique = await isTierIdUnique(updatedData.id);
        
        if (!isUnique) {
          setNotification({
            isOpen: true,
            message: `Tier ID "${updatedData.id}" already exists. Please use a unique ID.`,
            title: "Error",
            status: "error"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create a clean version of the update data without the dbId field
      // as dbId is not a field in the Firestore document
      const { dbId: _, ...cleanUpdateData } = updatedData;
      
      console.log("Sending update with clean data:", cleanUpdateData);
      
      await updateDoc(tierRef, {
        ...cleanUpdateData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Loyalty tier updated successfully!",
        title: "Success",
        status: "success"
      });
      
      // Clear selected tier after successful update
      setSelectedTier(null);
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error updating loyalty tier:", error);
      
      setNotification({
        isOpen: true,
        message: `Error updating loyalty tier: ${error.message}`,
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!canAdd) return;
    
    setSelectedTier(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (tier) => {
    if (!canEdit) return;
    
    console.log("Editing tier:", tier);
    if (tier && tier.dbId) {
      setSelectedTier(tier);
      setIsFormModalOpen(true);
    } else {
      console.error("Tier is missing document ID (dbId):", tier);
      setNotification({
        isOpen: true,
        message: "Error: Cannot edit tier - missing document reference.",
        title: "Error",
        status: "error"
      });
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedTier(null);
  };

  // Show delete confirmation
  const confirmDelete = (id) => {
    if (!canDelete) return;
    
    // First try to find the tier by dbId
    let tier = loyaltyTiers.find(t => t.dbId === id);
    
    // If not found, try by the tier's logical id
    if (!tier) {
      tier = loyaltyTiers.find(t => t.id === id);
    }
    
    if (tier) {
      console.log("Deleting tier with document ID:", tier.dbId);
      setDeleteConfirmation({
        isOpen: true,
        itemId: tier.dbId
      });
    } else {
      console.error("Could not find tier with ID:", id);
    }
  };

  // Close delete confirmation
  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null
    });
  };

  // Close notification
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

  // Delete loyalty tier
  const handleDeleteConfirm = async () => {
    if (!canDelete) return;
    
    try {
      await deleteDoc(doc(db, "loyaltyTiers", deleteConfirmation.itemId));
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Loyalty tier deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting loyalty tier:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: `Error deleting loyalty tier: ${error.message}`,
        title: "Error",
        status: "error"
      });
    }
  };

  // Unauthorized access
  if (!canView) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to manage loyalty tiers.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">B2B Loyalty Program Management</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">B2B Loyalty Program Management</h1>
        <p className="text-gray-600 mt-1">
          Manage loyalty tiers, discounts, and amount thresholds for B2B clients
        </p>
      </div>

      {/* Action buttons with Export/Import options */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {/* Only show import/export to admins */}
          {isAdmin && (
            <DBExportImport 
              db={db}
              collectionName="loyaltyTiers"
              onSuccess={handleExportImportSuccess}
              onError={handleExportImportError}
              dateFields={['createdAt', 'updatedAt']}
            />
          )}
        </div>
        
        <div>
          {canAdd && (
            <button 
              onClick={handleAddClick}
              className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Loyalty Tier
            </button>
          )}
        </div>
      </div>
    
      {/* Loyalty tier table */}
      <div className="overflow-hidden">
        <DisplayLoyaltyTierTable
          tiers={loyaltyTiers}
          onDelete={canDelete ? confirmDelete : null}
          onEdit={canEdit ? handleEditClick : null}
        />
      </div>
      
      {/* Modals - only rendered based on permissions */}
      {(canAdd || canEdit) && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleCloseModal}
          title={selectedTier ? "Edit Loyalty Tier" : "Add New Loyalty Tier"}
          size="lg"
        >
          <AddLoyaltyTierForm
            onSubmit={addLoyaltyTier}
            selectedTier={selectedTier}
            onUpdate={(id, data) => {
              // Ensure we're using the document ID (dbId) for the update operation
              const docId = selectedTier?.dbId || id;
              console.log("Updating tier with document ID:", docId);
              updateLoyaltyTier(docId, data);
            }}
            setSelectedTier={setSelectedTier}
            isSubmitting={isSubmitting}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
      
      {canDelete && (
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemName="loyalty tier"
        />
      )}
      
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
    </div>
  );
};

export default LoyaltyTierManagement;