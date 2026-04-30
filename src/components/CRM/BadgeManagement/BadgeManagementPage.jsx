import React, { useState, useEffect } from "react";
import { useCRM } from "../../../context/CRMContext";
import BadgeForm from "./BadgeForm";
import BadgeList from "./BadgeList";
import CRMActionButton from "../../Shared/CRMActionButton";
import Modal from "../../Shared/Modal";
import { createBadge, updateBadge, deleteBadge, updateBadgePriorities } from "../../../services";
import { useAuth } from "../../Login/AuthContext";

const BadgeManagementPage = () => {
  const { qualificationBadges, isLoadingBadges, refreshBadges } = useCRM();
  const { can } = useAuth();

  const [selectedBadge,      setSelectedBadge]      = useState(null);
  const [isFormOpen,         setIsFormOpen]         = useState(false);
  const [isSubmitting,       setIsSubmitting]       = useState(false);
  const [notification,       setNotification]       = useState({ show: false, message: "", type: "success" });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, badge: null });

  // ── Permission gate — admin only ──────────────────────────────────────────
  if (!can("manageBadges")) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">Only administrators can manage qualification badges.</p>
        </div>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(p => ({ ...p, show: false })), 3000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddNew  = () => { setSelectedBadge(null); setIsFormOpen(true); };
  const handleEdit    = (badge) => { setSelectedBadge(badge); setIsFormOpen(true); };
  const handleCancel  = () => { setIsFormOpen(false); setSelectedBadge(null); };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedBadge) {
        if (!selectedBadge.id) throw new Error("Badge ID is missing for update");
        await updateBadge(selectedBadge.id, formData);
        showNotification(`Badge "${formData.name}" updated successfully`);
      } else {
        await createBadge(formData);
        showNotification(`Badge "${formData.name}" created successfully`);
      }
      refreshBadges?.();
      setIsFormOpen(false);
      setSelectedBadge(null);
    } catch (err) {
      showNotification(`Error: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (badge) => {
    if (!badge) return;
    setDeleteConfirmation({ isOpen: true, badge });
  };

  const handleConfirmDelete = async () => {
    const badge = deleteConfirmation.badge;
    if (!badge) return;
    const badgeId = badge.id || badge._id || badge.key;
    if (!badgeId) { showNotification("Error: Badge ID is missing", "error"); return; }
    try {
      await deleteBadge(badgeId);
      showNotification(`Badge "${badge.name}" deleted successfully`);
      refreshBadges?.();
      setDeleteConfirmation({ isOpen: false, badge: null });
    } catch (err) {
      showNotification(`Error: ${err.message}`, "error");
    }
  };

  const handleReorder = async (badgeIds) => {
    try {
      await updateBadgePriorities(badgeIds);
      showNotification("Badge order updated successfully");
      refreshBadges?.();
    } catch (err) {
      showNotification(`Error: ${err.message}`, "error");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Qualification Badge Management</h1>
        <p className="text-gray-600 mt-1">Create and manage badges to categorize leads by potential value or interest level</p>
      </div>

      {notification.show && (
        <div className={`mb-4 p-3 rounded ${notification.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <CRMActionButton type="primary" onClick={handleAddNew}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>
          Create New Badge
        </CRMActionButton>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <BadgeList badges={qualificationBadges} onEdit={handleEdit} onDelete={handleDeleteClick}
            loading={isLoadingBadges} isDraggable={false} onReorder={handleReorder} />
        </div>
      </div>

      <BadgeForm badge={selectedBadge} onSubmit={handleSubmit} onCancel={handleCancel}
        isSubmitting={isSubmitting} isOpen={isFormOpen} />

      <Modal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({ isOpen: false, badge: null })}
        title="Delete Badge" size="sm">
        <div className="p-2">
          <p className="mb-4">
            Are you sure you want to delete <span className="font-medium">"{deleteConfirmation.badge?.name}"</span>?
          </p>
          <p className="text-sm text-gray-600 mb-6">This action cannot be undone. This badge will be removed from all leads.</p>
          <div className="flex justify-end space-x-2">
            <CRMActionButton type="secondary" onClick={() => setDeleteConfirmation({ isOpen: false, badge: null })}>Cancel</CRMActionButton>
            <CRMActionButton type="danger" onClick={handleConfirmDelete}>Delete Badge</CRMActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BadgeManagementPage;