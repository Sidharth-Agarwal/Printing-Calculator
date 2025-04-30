import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddLoyaltyTierForm from "./AddLoyaltyTierForm";
import DisplayLoyaltyTierTable from "./DisplayLoyaltyTierTable";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import ConfirmationModal from "../ConfirmationModal";
import { useAuth } from "../../Login/AuthContext";

const LoyaltyTierManagement = () => {
  const { userRole } = useAuth();
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Fetch loyalty tiers from Firestore
  useEffect(() => {
    if (!isAdmin) return;

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
    });

    return () => unsubscribe();
  }, [isAdmin]);

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
    if (!isAdmin) return;
    
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
    if (!isAdmin) return;
    
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

  // Show delete confirmation
  const confirmDelete = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id
    });
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

  // Delete loyalty tier
  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    
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
  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="text-red-600">You don't have permission to manage loyalty tiers.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">B2B Loyalty Program Management</h1>
      
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
      />
      
      <DisplayLoyaltyTierTable
        tiers={loyaltyTiers}
        onDelete={(id) => {
          // First try to find the tier by dbId
          let tier = loyaltyTiers.find(t => t.dbId === id);
          
          // If not found, try by the tier's logical id
          if (!tier) {
            tier = loyaltyTiers.find(t => t.id === id);
          }
          
          if (tier) {
            console.log("Deleting tier with document ID:", tier.dbId);
            confirmDelete(tier.dbId);
          } else {
            console.error("Could not find tier with ID:", id);
          }
        }}
        onEdit={(tier) => {
          console.log("Editing tier:", tier);
          if (tier && tier.dbId) {
            setSelectedTier(tier);
          } else {
            console.error("Tier is missing document ID (dbId):", tier);
            setNotification({
              isOpen: true,
              message: "Error: Cannot edit tier - missing document reference.",
              title: "Error",
              status: "error"
            });
          }
        }}
      />
      
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName="loyalty tier"
      />
      
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