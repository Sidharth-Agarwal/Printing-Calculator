import React, { useState, useEffect } from "react";
import LeadRegistrationForm from "./LeadRegistrationForm";
import DisplayLeadsTable from "./DisplayLeadsTable";
import LeadDetailsModal from "./LeadDetailsModal";
import LeadDiscussionModal from "../LeadManagement/LeadDiscussionModal";
import LeadConversionModal from "../LeadManagement/LeadConversionModal";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useCRM } from "../../../context/CRMContext";
import { LEAD_TABLE_FIELDS } from "../../../constants/leadFields"; // Import the registration table fields
import { 
  createLead, 
  updateLead, 
  deleteLead, 
  getLeadById, 
  createDiscussion 
} from "../../../services";
import { useAuth } from "../../Login/AuthContext";

/**
 * Main page component for lead registration
 */
const LeadRegistrationPage = () => {
  const { currentUser, userRole } = useAuth();
  const { leads, isLoadingLeads } = useCRM();
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [discussionLead, setDiscussionLead] = useState(null);
  const [convertingLead, setConvertingLead] = useState(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });
  
  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Check if user has permission to manage leads
  const hasPermission = userRole === "admin" || userRole === "staff";
  
  // Handle opening the form modal
  const handleAddNew = () => {
    setSelectedLead(null);
    setIsFormModalOpen(true);
  };
  
  // Handle editing a lead
  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsFormModalOpen(true);
    
    if (viewingLead && viewingLead.id === lead.id) {
      setViewingLead(null);
    }
  };
  
  // Handle viewing a lead
  const handleView = (lead) => {
    setViewingLead(lead);
  };
  
  // Handle adding a discussion to a lead
  const handleAddDiscussion = (lead) => {
    setDiscussionLead(lead);
  };
  
  // Handle converting a lead to a client
  const handleConvert = (lead) => {
    setConvertingLead(lead);
  };
  
  // Handle form submission
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    
    try {
      if (selectedLead) {
        // Update existing lead
        await updateLead(selectedLead.id, formData);
        showNotification(`Lead "${formData.name}" updated successfully`);
        
        // Refresh view if this lead is being viewed
        if (viewingLead && viewingLead.id === selectedLead.id) {
          const updatedLead = await getLeadById(selectedLead.id);
          setViewingLead(updatedLead);
        }
      } else {
        // Create new lead
        const newLead = await createLead(formData);
        showNotification(`Lead "${formData.name}" created successfully`);
      }
      
      // Close form modal
      setIsFormModalOpen(false);
      setSelectedLead(null);
    } catch (error) {
      console.error("Error saving lead:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle lead deletion
  const handleDelete = async (leadId) => {
    try {
      await deleteLead(leadId);
      showNotification("Lead deleted successfully");
      
      // Close modals if this lead was open
      if (viewingLead && viewingLead.id === leadId) {
        setViewingLead(null);
      }
      if (discussionLead && discussionLead.id === leadId) {
        setDiscussionLead(null);
      }
      if (convertingLead && convertingLead.id === leadId) {
        setConvertingLead(null);
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // Handle adding a discussion to a lead
  const handleSubmitDiscussion = async (leadId, discussionData) => {
    try {
      await createDiscussion(leadId, discussionData, currentUser.uid);
      showNotification("Discussion added successfully");
      
      // Refresh lead if viewing
      if (viewingLead && viewingLead.id === leadId) {
        const updatedLead = await getLeadById(leadId);
        setViewingLead(updatedLead);
      }
      
      // Close discussion modal
      setDiscussionLead(null);
    } catch (error) {
      console.error("Error adding discussion:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // Handle lead conversion
  const handleSubmitConversion = async (leadId, success) => {
    if (success) {
      showNotification("Lead converted to client successfully");
      
      // Refresh lead if viewing
      if (viewingLead && viewingLead.id === leadId) {
        const updatedLead = await getLeadById(leadId);
        setViewingLead(updatedLead);
      }
    }
    
    // Close conversion modal
    setConvertingLead(null);
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
          <p className="mt-2 text-red-600">You don't have permission to manage leads.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Registration</h1>
        <p className="text-gray-600 mt-1">
          Register and manage potential clients in your sales pipeline
        </p>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded ${
          notification.type === "success" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Lead Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Leads</h2>
          <p className="text-2xl font-bold text-gray-800">{leads.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">New Leads</h2>
          <p className="text-2xl font-bold text-blue-600">
            {leads.filter(lead => lead.status === "newLead").length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Qualified Leads</h2>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(lead => lead.status === "qualified" || lead.status === "negotiation").length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</h2>
          <p className="text-2xl font-bold text-purple-600">
            {leads.length > 0 
              ? `${Math.round((leads.filter(lead => lead.status === "converted").length / leads.length) * 100)}%` 
              : "0%"}
          </p>
        </div>
      </div>

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
          Add New Lead
        </CRMActionButton>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isFormModalOpen ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {selectedLead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <button
                onClick={() => {
                  setIsFormModalOpen(false);
                  setSelectedLead(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <LeadRegistrationForm
              lead={selectedLead}
              onSubmit={handleSubmitForm}
              onCancel={() => {
                setIsFormModalOpen(false);
                setSelectedLead(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <DisplayLeadsTable
            leads={leads}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddDiscussion={handleAddDiscussion}
            loading={isLoadingLeads}
            fields={LEAD_TABLE_FIELDS} // Use registration table fields
          />
        )}
      </div>
      
      {/* Lead Details Modal */}
      {viewingLead && (
        <LeadDetailsModal
          lead={viewingLead}
          onClose={() => setViewingLead(null)}
          onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion}
          onConvert={handleConvert}
        />
      )}
      
      {/* Lead Discussion Modal */}
      {discussionLead && (
        <LeadDiscussionModal
          lead={discussionLead}
          onClose={() => setDiscussionLead(null)}
          onSubmit={handleSubmitDiscussion}
        />
      )}
      
      {/* Lead Conversion Modal */}
      {convertingLead && (
        <LeadConversionModal
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onSubmit={handleSubmitConversion}
        />
      )}
    </div>
  );
};

export default LeadRegistrationPage;