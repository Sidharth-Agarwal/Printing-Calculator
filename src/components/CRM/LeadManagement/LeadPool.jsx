import React, { useState } from "react";
import { LEAD_STATUSES, getStatusById } from "../../../constants/leadStatuses";
import QualificationBadge from "../../Shared/QualificationBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import CRMActionButton from "../../Shared/CRMActionButton";
import { updateLeadStatus } from "../../../services";

/**
 * Lead Pool component for kanban-style lead management
 * @param {Object} props - Component props
 * @param {Array} props.leads - Array of lead objects
 * @param {function} props.onView - View handler
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onAddDiscussion - Add discussion handler
 * @param {function} props.onConvert - Convert handler
 * @param {function} props.onDelete - Delete handler
 * @param {boolean} props.loading - Loading state
 */
const LeadPool = ({ 
  leads = [], 
  onView,
  onEdit,
  onAddDiscussion,
  onConvert,
  onDelete,
  loading = false
}) => {
  const [draggedLead, setDraggedLead] = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterBadge, setFilterBadge] = useState("");
  
  // Group leads by status
  const groupedLeads = {};
  
  // Filter leads
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
    
    return matchesSearch && matchesSource && matchesBadge;
  });
  
  // Initialize groups with empty arrays
  LEAD_STATUSES.forEach(status => {
    groupedLeads[status.id] = [];
  });
  
  // Group filtered leads by status
  filteredLeads.forEach(lead => {
    if (groupedLeads[lead.status]) {
      groupedLeads[lead.status].push(lead);
    } else {
      // If status doesn't exist in our predefined statuses, put it in newLead
      groupedLeads.newLead.push(lead);
    }
  });
  
  // Handle drag start
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData("text/plain", lead.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
  };
  
  // Handle drag over
  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  // Handle drop
  const handleDrop = async (e, statusId) => {
    e.preventDefault();
    
    if (!draggedLead) return;
    
    // If dropping in the same status, do nothing
    if (draggedLead.status === statusId) {
      setDraggedLead(null);
      return;
    }
    
    // Update lead status
    try {
      setUpdatingLeadId(draggedLead.id);
      await updateLeadStatus(draggedLead.id, statusId);
      setUpdatingLeadId(null);
    } catch (error) {
      console.error("Error updating lead status:", error);
    } finally {
      setDraggedLead(null);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
    
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric"
    });
  };
  
  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  // Format relative time for last contact
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Never";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
               
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pb-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-4 mb-4 bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 0110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
          
          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Badges</option>
            {/* This would be populated dynamically from the qualificationBadges */}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterSource('');
              setFilterBadge('');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            title="Clear filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Lead Count */}
      <div className="px-4 py-2 text-sm text-gray-600 bg-white rounded-md shadow-sm border border-gray-200 mb-4">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>
      
      {/* Lead Pool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {LEAD_STATUSES.map((status) => (
          <div 
            key={status.id}
            className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-full"
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            {/* Status Header */}
            <div 
              className="p-3 border-b"
              style={{ 
                backgroundColor: status.bgColor,
                color: status.textColor
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="h-2.5 w-2.5 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></span>
                  <h3 className="font-medium">{status.label}</h3>
                </div>
                <span className="bg-white bg-opacity-30 text-xs font-medium py-1 px-2 rounded-full">
                  {groupedLeads[status.id].length}
                </span>
              </div>
            </div>
            
            {/* Lead Cards */}
            <div className="p-2 flex-grow overflow-y-auto max-h-[calc(100vh-14rem)]">
              {groupedLeads[status.id].length > 0 ? (
                <div className="space-y-2">
                  {groupedLeads[status.id].map((lead) => (
                    <div
                      key={lead.id}
                      className={`bg-white border rounded-md shadow-sm p-3 cursor-pointer
                                ${draggedLead?.id === lead.id ? "opacity-50" : ""}
                                ${updatingLeadId === lead.id ? "animate-pulse" : ""}`}
                      onClick={() => onView(lead)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                            {lead.company && (
                              <p className="text-gray-500 text-xs">{lead.company}</p>
                            )}
                          </div>
                          <QualificationBadge badgeId={lead.badgeId} size="sm" />
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                          <div>
                            <LeadSourceDisplay sourceId={lead.source} />
                          </div>
                          <div>{formatDate(lead.createdAt)}</div>
                        </div>
                        
                        {lead.lastDiscussionSummary && (
                          <div className="mb-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                            <div className="text-xs text-gray-500 mb-1 flex justify-between">
                              <span>Last contact:</span>
                              <span>{formatRelativeTime(lead.lastDiscussionDate)}</span>
                            </div>
                            <p className="break-words line-clamp-3">{truncateText(lead.lastDiscussionSummary, 80)}</p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="mt-2 flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <CRMActionButton
                            type="info"
                            size="xs"
                            onClick={() => onAddDiscussion(lead)}
                            aria-label="Add discussion"
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            }
                          >
                            Talk
                          </CRMActionButton>
                          
                          <CRMActionButton
                            type="secondary"
                            size="xs"
                            onClick={() => onEdit(lead)}
                            aria-label="Edit lead"
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            }
                          >
                            Edit
                          </CRMActionButton>
                          
                          {(status.id === "qualified" || status.id === "negotiation") && (
                            <CRMActionButton
                              type="success"
                              size="xs"
                              onClick={() => onConvert(lead)}
                              aria-label="Convert lead"
                              icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              }
                            >
                              Convert
                            </CRMActionButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-400 text-sm">
                  No leads in this status
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadPool;