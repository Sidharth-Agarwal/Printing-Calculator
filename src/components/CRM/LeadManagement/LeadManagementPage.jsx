import React, { useState } from "react";
import LeadPool from "./LeadPool";
import LeadDetailsModal from "../LeadRegistration/LeadDetailsModal";
import LeadRegistrationForm from "../LeadRegistration/LeadRegistrationForm";
import LeadDiscussionModal from "./LeadDiscussionModal";
import LeadConversionModal from "./LeadConversionModal";
import Modal from "../../Shared/Modal";
import { useCRM } from "../../../context/CRMContext";
import DisplayLeadsTable from "../LeadRegistration/DisplayLeadsTable";
import { LEAD_PIPELINE_FIELDS } from "../../../constants/leadFields";
import { getKanbanStatusForLead } from "../../../constants/leadStatuses";
import { 
  createLead,  
  updateLead, 
  deleteLead, 
  getLeadById, 
  createDiscussion 
} from "../../../services";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport"; // Import the enhanced component
import { db } from "../../../firebaseConfig"; // Import db for DBExportImport

/**
 * Main page component for lead management (lead pool) - Updated for 4-column Kanban with Import/Export
 */
const LeadManagementPage = () => {
  const { currentUser, userRole } = useAuth();
  const { leads, isLoadingLeads, qualificationBadges, refreshLeads } = useCRM();
  
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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterBadge, setFilterBadge] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Toggle state for showing leads moved to clients
  const [showMovedToClients, setShowMovedToClients] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });
  
  // Check if user is admin
  const isAdmin = userRole === "admin";
  
  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Handle notification from export/import operations
  const handleExportImportSuccess = (message) => {
    showNotification(message, "success");
    // Trigger leads refresh if refreshLeads function is available
    if (refreshLeads) {
      refreshLeads();
    }
  };

  const handleExportImportError = (message) => {
    showNotification(message, "error");
  };
  
  // Check if user has permission to manage leads
  const hasPermission = userRole === "admin" || userRole === "staff";
  
  // Helper function to check if lead is added to clients
  const isLeadAddedToClients = (lead) => {
    return lead.status === "converted" && lead.movedToClients;
  };
  
  // ENHANCED: Handle lead updates from inline editing and discussion changes
  const handleLeadUpdate = async () => {
    // Refresh the leads list after inline updates
    if (refreshLeads) {
      refreshLeads();
    }
    
    // If a lead is currently being viewed, refresh that lead's data
    if (viewingLead) {
      try {
        const updatedLead = await getLeadById(viewingLead.id);
        setViewingLead(updatedLead);
        console.log("Viewing lead refreshed after update");
      } catch (error) {
        console.error("Error refreshing viewed lead:", error);
      }
    }
    
    // Show a subtle notification for inline updates
    showNotification("Lead updated successfully", "success");
  };
  
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
      
      // Refresh leads list
      if (refreshLeads) {
        refreshLeads();
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // Handle form submission for editing or creating
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
      
      // Refresh the lead list
      if (refreshLeads) {
        refreshLeads();
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
      
      // Refresh leads list to update last contact info
      if (refreshLeads) {
        refreshLeads();
      }
      
      // Close discussion modal
      setDiscussionLead(null);
    } catch (error) {
      console.error("Error adding discussion:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };
  
  // Handle lead conversion
  const handleSubmitConversion = async (leadId, success, newClient = null) => {
    if (success) {
      showNotification("Lead converted to client successfully");
      
      // Refresh lead if viewing
      if (viewingLead && viewingLead.id === leadId) {
        const updatedLead = await getLeadById(leadId);
        setViewingLead(updatedLead);
      }
      
      // Refresh leads list
      if (refreshLeads) {
        refreshLeads();
      }
    }
    
    // Close conversion modal
    setConvertingLead(null);
  };
  
  // Handle Add New Lead click
  const handleAddNew = () => {
    setSelectedLead(null);
    setIsFormModalOpen(true);
  };
  
  // Filter leads based on search and filter criteria
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      searchTerm === "" ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastDiscussionSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === "" || lead.source === filterSource;
    const matchesBadge = filterBadge === "" || lead.badgeId === filterBadge;
    const matchesStatus = filterStatus === "" || lead.status === filterStatus;
    
    // Filter based on showMovedToClients toggle
    const matchesMovedToClients = showMovedToClients || !isLeadAddedToClients(lead);
    
    return matchesSearch && matchesSource && matchesBadge && matchesStatus && matchesMovedToClients;
  });
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterSource('');
    setFilterBadge('');
    setFilterStatus('');
    setShowMovedToClients(false);
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
  
  // Calculate lead statistics - Updated for 4-column Kanban structure
  const displayedLeads = showMovedToClients ? leads : leads.filter(lead => !isLeadAddedToClients(lead));
  
  // Group leads by Kanban status for statistics
  const kanbanStats = {
    newLead: displayedLeads.filter(lead => getKanbanStatusForLead(lead.status) === "newLead").length,
    qualified: displayedLeads.filter(lead => getKanbanStatusForLead(lead.status) === "qualified").length,
    converted: displayedLeads.filter(lead => getKanbanStatusForLead(lead.status) === "converted").length,
    lost: displayedLeads.filter(lead => getKanbanStatusForLead(lead.status) === "lost").length
  };
  
  // Additional detailed stats for intermediate statuses
  const detailedStats = {
    total: displayedLeads.length,
    contacted: displayedLeads.filter(lead => lead.status === "contacted").length,
    negotiation: displayedLeads.filter(lead => lead.status === "negotiation").length
  };
  
  // Calculate conversion rate
  const conversionRate = displayedLeads.length > 0 
    ? Math.round((kanbanStats.converted / displayedLeads.length) * 100)
    : 0;
  
  // Count leads moved to clients
  const movedToClientsCount = leads.filter(lead => isLeadAddedToClients(lead)).length;
  
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Qualified Leads</h1>
        <p className="text-gray-600 mt-1">
          Manage your leads through the sales pipeline
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
      
      {/* Lead Statistics - Updated for 4-column layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Total Leads</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{detailedStats.total}</span>
        </div>
        
        {/* New Leads (includes contacted) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">New Leads</span>
          <span className="text-2xl font-bold text-blue-600 mt-1">{kanbanStats.newLead}</span>
          {detailedStats.contacted > 0 && (
            <span className="text-xs text-gray-400 mt-1">{detailedStats.contacted} contacted</span>
          )}
        </div>
        
        {/* Qualified (includes negotiation) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Qualified</span>
          <span className="text-2xl font-bold text-green-600 mt-1">{kanbanStats.qualified}</span>
          {detailedStats.negotiation > 0 && (
            <span className="text-xs text-gray-400 mt-1">{detailedStats.negotiation} negotiating</span>
          )}
        </div>
        
        {/* Converted */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Converted</span>
          <span className="text-2xl font-bold text-purple-600 mt-1">{kanbanStats.converted}</span>
        </div>
        
        {/* Lost */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Lost</span>
          <span className="text-2xl font-bold text-red-600 mt-1">{kanbanStats.lost}</span>
        </div>
        
        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Conversion Rate</span>
          <span className="text-2xl font-bold text-purple-600 mt-1">{conversionRate}%</span>
        </div>
        
        {/* Added to Clients Count */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Added to Clients</span>
          <span className="text-2xl font-bold text-blue-600 mt-1">{movedToClientsCount}</span>
        </div>
        
        {/* Win Rate (Converted vs Lost) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
          <span className="text-xs font-medium text-gray-500">Win Rate</span>
          <span className="text-2xl font-bold text-green-600 mt-1">
            {(kanbanStats.converted + kanbanStats.lost) > 0 
              ? Math.round((kanbanStats.converted / (kanbanStats.converted + kanbanStats.lost)) * 100)
              : 0}%
          </span>
        </div>
      </div>
      
      {/* Action buttons with Export/Import options - UPDATED SECTION */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {/* Only show import/export to admins */}
          {isAdmin && (
            <DBExportImport 
              db={db}
              collectionName="leads"
              onSuccess={handleExportImportSuccess}
              onError={handleExportImportError}
              dateFields={['createdAt', 'updatedAt', 'lastDiscussionDate']}
              qualificationBadges={qualificationBadges} // Pass badges for processing
            />
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              viewMode === "kanban"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban View
          </button>
          
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              viewMode === "list"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>
          
          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Lead
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Status Filter - Updated for all statuses */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="newLead">New Leads</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            
            {/* Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Sources</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website">Website</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="walkIn">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="exhibition">Exhibition</option>
              <option value="other">Other</option>
            </select>
            
            {/* Badge Filter */}
            <select
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Badges</option>
              {qualificationBadges && qualificationBadges.map(badge => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
            
            {/* Show Moved to Clients Toggle */}
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showMovedToClients}
                onChange={(e) => setShowMovedToClients(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Added to Clients</span>
              {movedToClientsCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {movedToClientsCount}
                </span>
              )}
            </label>
            
            {/* Clear Filters Button */}
            {(searchTerm || filterSource || filterBadge || filterStatus || showMovedToClients) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md border border-gray-300"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Lead Count */}
      <div className="px-4 py-2 text-sm text-gray-600 mb-4 flex justify-between items-center">
        <span>Showing {filteredLeads.length} of {leads.length} leads</span>
        {showMovedToClients && movedToClientsCount > 0 && (
          <span className="text-blue-600 font-medium">
            Including {movedToClientsCount} leads moved to clients
          </span>
        )}
      </div>
      
      {/* Main Content - Conditionally render based on viewMode */}
      {viewMode === "kanban" ? (
        <LeadPool
          leads={filteredLeads}
          onView={handleView}
          onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion}
          onConvert={handleConvert}
          onDelete={handleDelete}
          loading={isLoadingLeads}
          showMovedToClients={showMovedToClients}
          onLeadUpdate={handleLeadUpdate}
        />
      ) : (
        <DisplayLeadsTable
          leads={filteredLeads}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddDiscussion={handleAddDiscussion}
          onConvert={handleConvert}
          loading={isLoadingLeads}
          fields={LEAD_PIPELINE_FIELDS}
          showMovedToClients={showMovedToClients}
          onLeadUpdate={handleLeadUpdate}
        />
      )}
      
      {/* Lead Details Modal - ENHANCED with lead update callback */}
      {viewingLead && (
        <LeadDetailsModal
          lead={viewingLead}
          onClose={() => setViewingLead(null)}
          onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion}
          onConvert={handleConvert}
          onLeadUpdate={handleLeadUpdate}
        />
      )}
      
      {/* Add/Edit Lead Modal */}
      {isFormModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedLead(null);
          }}
          title={selectedLead ? "Edit Lead" : "Add New Lead"}
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