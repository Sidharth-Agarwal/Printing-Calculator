import React, { useState, useEffect } from "react";
import { useCRM } from "../../../context/CRMContext";
import BadgeForm from "./BadgeForm";
import BadgeList from "./BadgeList";
import CRMActionButton from "../../Shared/CRMActionButton";
import Modal from "../../Shared/Modal";
import {
  createBadge,
  updateBadge,
  deleteBadge,
  updateBadgePriorities
} from "../../../services";
import { useAuth } from "../../Login/AuthContext";

/**
 * Page component for managing qualification badges
 */
const BadgeManagementPage = () => {
  const { qualificationBadges, isLoadingBadges, refreshBadges } = useCRM();
  const { currentUser, userRole } = useAuth();
  
  // State for badge CRUD operations
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: "", 
    type: "success" 
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    badge: null
  });
  
  // Check if user has permission to manage badges
  const hasPermission = userRole === "admin" || userRole === "staff";
  
  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Handle opening the form for creating a new badge
  const handleAddNew = () => {
    setSelectedBadge(null);
    setIsFormOpen(true);
  };
  
  // Handle opening the form for editing a badge
  const handleEdit = (badge) => {
    setSelectedBadge(badge);
    setIsFormOpen(true);
  };
  
  // Handle closing the form
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSelectedBadge(null);
  };
  
  // Handle form submission
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    
    try {
      if (selectedBadge) {
        // Update existing badge
        await updateBadge(selectedBadge.id, formData);
        showNotification(`Badge "${formData.name}" updated successfully`);
      } else {
        // Create new badge
        await createBadge(formData);
        showNotification(`Badge "${formData.name}" created successfully`);
      }
      
      // Refresh badges after update
      if (refreshBadges) {
        refreshBadges();
      }
      
      // Close form
      setIsFormOpen(false);
      setSelectedBadge(null);
    } catch (error) {
      console.error("Error saving badge:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (badge) => {
    setDeleteConfirmation({
      isOpen: true,
      badge
    });
  };
  
  // Close delete confirmation modal
  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      badge: null
    });
  };
  
  // Handle confirming badge deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.badge) return;
    
    try {
      await deleteBadge(deleteConfirmation.badge.id);
      showNotification(`Badge "${deleteConfirmation.badge.name}" deleted successfully`);
      
      // Refresh badges after deletion
      if (refreshBadges) {
        refreshBadges();
      }
      
      // Close confirmation modal
      handleCloseDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting badge:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // Handle badge reordering
  const handleReorder = async (badgeIds) => {
    try {
      await updateBadgePriorities(badgeIds);
      showNotification("Badge order updated successfully");
      
      // Refresh badges after reordering
      if (refreshBadges) {
        refreshBadges();
      }
    } catch (error) {
      console.error("Error reordering badges:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // If user doesn't have permission, show unauthorized message
  if (!hasPermission) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to manage qualification badges.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Qualification Badge Management</h1>
        <p className="text-gray-600 mt-1">
          Create and manage badges to categorize your leads by potential value or interest level
        </p>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded ${
          notification.type === "success" 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Action Button */}
      <div className="flex justify-end mb-4">
        <CRMActionButton 
          type="primary" 
          onClick={handleAddNew}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Create New Badge
        </CRMActionButton>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <BadgeList
            badges={qualificationBadges}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={isLoadingBadges}
            isDraggable={false}
            onReorder={handleReorder}
          />
        </div>
      </div>
      
      {/* Badge Form Modal */}
      <BadgeForm
        badge={selectedBadge}
        onSubmit={handleSubmitForm}
        onCancel={handleCancelForm}
        isSubmitting={isSubmitting}
        isOpen={isFormOpen}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCloseDeleteConfirmation}
        title="Delete Badge"
        size="sm"
      >
        <div className="p-2">
          <p className="mb-4">
            Are you sure you want to delete the badge 
            <span className="font-medium"> "{deleteConfirmation.badge?.name}"</span>?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            This action cannot be undone. This badge will be removed from all leads.
          </p>
          <div className="flex justify-end space-x-2">
            <CRMActionButton
              type="secondary"
              onClick={handleCloseDeleteConfirmation}
            >
              Cancel
            </CRMActionButton>
            <CRMActionButton
              type="danger"
              onClick={handleConfirmDelete}
            >
              Delete Badge
            </CRMActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BadgeManagementPage;