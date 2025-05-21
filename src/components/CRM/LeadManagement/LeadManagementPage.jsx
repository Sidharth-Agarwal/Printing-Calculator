import React, { useState, useEffect } from "react";
import LeadPool from "./LeadPool";
import LeadDetailsModal from "../LeadRegistration/LeadDetailsModal";
import LeadRegistrationForm from "../LeadRegistration/LeadRegistrationForm";
import LeadDiscussionModal from "./LeadDiscussionModal";
import LeadConversionModal from "./LeadConversionModal";
import Modal from "../../Shared/Modal";
import { useCRM } from "../../../context/CRMContext";
import DisplayLeadsTable from "../LeadRegistration/DisplayLeadsTable"; // Import DisplayLeadsTable for List View
import { LEAD_PIPELINE_FIELDS } from "../../../constants/leadFields"; // Import the pipeline fields
import { 
  updateLead, 
  deleteLead, 
  getLeadById, 
  createDiscussion 
} from "../../../services";
import { useAuth } from "../../Login/AuthContext";

/**
 * Main page component for lead management (lead pool)
 */
const LeadManagementPage = () => {
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
  
  // View mode state
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"
  
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
  
  // Handle viewing a lead
  const handleView = (lead) => {
    setViewingLead(lead);
  };
  
  // Handle editing a lead
  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsFormModalOpen(true);
    
    if (viewingLead && viewingLead.id === lead.id) {
      setViewingLead(null);
    }
  };
  
  // Handle adding a discussion to a lead
  const handleAddDiscussion = (lead) => {
    setDiscussionLead(lead);
  };
  
  // Handle converting a lead to a client
  const handleConvert = (lead) => {
    setConvertingLead(lead);
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
  
  // Handle form submission for editing
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // Update existing lead
      await updateLead(selectedLead.id, formData);
      showNotification(`Lead "${formData.name}" updated successfully`);
      
      // Refresh view if this lead is being viewed
      if (viewingLead && viewingLead.id === selectedLead.id) {
        const updatedLead = await getLeadById(selectedLead.id);
        setViewingLead(updatedLead);
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
  
  // Handle Add New Lead click
  const handleAddNew = () => {
    window.location.href = "/crm/lead-registration";
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
  
  // Calculate lead statistics
  const leadStats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === "newLead").length,
    contacted: leads.filter(lead => lead.status === "contacted").length,
    qualified: leads.filter(lead => lead.status === "qualified").length,
    negotiation: leads.filter(lead => lead.status === "negotiation").length,
    converted: leads.filter(lead => lead.status === "converted").length,
    lost: leads.filter(lead => lead.status === "lost").length
  };
  
  // Calculate conversion rate
  const conversionRate = leads.length > 0 
    ? Math.round((leadStats.converted / leads.length) * 100)
    : 0;
  
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
        <p className="text-gray-600 mt-1">
          Manage your leads through the sales pipeline
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Total Leads</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{leadStats.total}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">New</span>
          <span className="text-2xl font-bold text-blue-600 mt-1">{leadStats.new}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Contacted</span>
          <span className="text-2xl font-bold text-purple-600 mt-1">{leadStats.contacted}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Qualified</span>
          <span className="text-2xl font-bold text-green-600 mt-1">{leadStats.qualified}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Negotiation</span>
          <span className="text-2xl font-bold text-yellow-500 mt-1">{leadStats.negotiation}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Converted</span>
          <span className="text-2xl font-bold text-green-600 mt-1">{leadStats.converted}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Conversion Rate</span>
          <span className="text-2xl font-bold text-purple-600 mt-1">{conversionRate}%</span>
        </div>
      </div>
      
      {/* View Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === "kanban"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban View
          </button>
          
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === "list"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>
        </div>
      </div>
      
      {/* Main Content - Conditionally render based on viewMode */}
      {viewMode === "kanban" ? (
        <LeadPool
          leads={leads}
          onView={handleView}
          onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion}
          onConvert={handleConvert}
          onDelete={handleDelete}
          loading={isLoadingLeads}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DisplayLeadsTable
            leads={leads}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddDiscussion={handleAddDiscussion}
            loading={isLoadingLeads}
            fields={LEAD_PIPELINE_FIELDS} // Use the pipeline fields for list view
          />
        </div>
      )}
      
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
      
      {/* Edit Lead Modal */}
      {isFormModalOpen && selectedLead && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedLead(null);
          }}
          title="Edit Lead"
          size="xl"
        >
          <LeadRegistrationForm
            lead={selectedLead}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setIsFormModalOpen(false);
              setSelectedLead(null);
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>
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

export default LeadManagementPage;