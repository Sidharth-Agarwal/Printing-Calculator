import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
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
      const tiersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        dbId: doc.id, // Store Firestore document ID separately
        ...doc.data(),
      }));
      setLoyaltyTiers(tiersData);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Check if tier ID is unique
  const isTierIdUnique = async (tierId, excludeDocId = null) => {
    try {
      const tiersCollection = collection(db, "loyaltyTiers");
      const q = query(tiersCollection, where("id", "==", tierId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return true;
      
      // If we're updating an existing tier, check if the only match is the current document
      if (excludeDocId) {
        return querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeDocId;
      }
      
      return false;
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
        message: "Error adding loyalty tier. Please try again.",
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
      // Check if updated tier ID is unique (excluding the current document)
      const isUnique = await isTierIdUnique(updatedData.id, dbId);
      
      if (!isUnique) {
        setNotification({
          isOpen: true,
          message: `Tier ID "${updatedData.id}" already exists. Please use a unique ID.`,
          title: "Error",
          status: "error"
        });
        return;
      }
      
      const tierRef = doc(db, "loyaltyTiers", dbId);
      await updateDoc(tierRef, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Loyalty tier updated successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error updating loyalty tier:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating loyalty tier. Please try again.",
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
        message: "Error deleting loyalty tier. Please try again.",
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
        onUpdate={updateLoyaltyTier}
        setSelectedTier={setSelectedTier}
      />
      
      <DisplayLoyaltyTierTable
        tiers={loyaltyTiers}
        onDelete={(id) => {
          const tier = loyaltyTiers.find(t => t.dbId === id);
          if (tier) {
            confirmDelete(tier.dbId);
          }
        }}
        onEdit={(tier) => setSelectedTier(tier)}
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