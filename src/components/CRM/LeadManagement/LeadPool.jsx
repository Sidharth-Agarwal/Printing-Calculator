import React, { useState } from "react";
import { LEAD_STATUSES, getStatusById } from "../../../constants/leadStatuses";
import QualificationBadge from "../../Shared/QualificationBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import CRMActionButton from "../../Shared/CRMActionButton";
import { updateLeadStatus } from "../../../services";

/**
 * Lead Pool component for kanban-style lead management
 * @param {Object} props - Component props
 * @param {Array} props.leads - Array of lead objects (pre-filtered)
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
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // Group leads by status
  const groupedLeads = {};
  
  // Initialize groups with empty arrays
  LEAD_STATUSES.forEach(status => {
    groupedLeads[status.id] = [];
  });
  
  // Group leads by status
  leads.forEach(lead => {
    if (groupedLeads[lead.status]) {
      groupedLeads[lead.status].push(lead);
    } else {
      // If status doesn't exist in our predefined statuses, put it in newLead
      groupedLeads.newLead.push(lead);
    }
  });
  
  // Handle drag start
  const handleDragStart = (e, lead, status, index) => {
    setDraggedLead({ ...lead, status, index });
    e.dataTransfer.setData("text/plain", lead.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
  };
  
  // Handle drag over (for status columns)
  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };
  
  // Handle drag over (for lead cards)
  const handleDragOverCard = (e, status, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
    setDragOverStatus(status);
  };
  
  // Handle drop (for both status change and reordering)
  const handleDrop = async (e, statusId, dropIndex = -1) => {
    e.preventDefault();
    
    if (!draggedLead) return;
    
    // Reset drag over states
    setDragOverStatus(null);
    setDragOverIndex(null);
    
    // Case 1: Moving to a different status
    if (draggedLead.status !== statusId) {
      try {
        setUpdatingLeadId(draggedLead.id);
        // Call API to update lead status
        await updateLeadStatus(draggedLead.id, statusId);
        setUpdatingLeadId(null);
      } catch (error) {
        console.error("Error updating lead status:", error);
      }
    } 
    // Case 2: Reordering within the same status
    else if (dropIndex !== -1 && draggedLead.index !== dropIndex) {
      // In a real implementation, you would call an API to update the order
      // For now, just log the reorder action
      console.log(`Reordering lead ${draggedLead.id} from position ${draggedLead.index} to position ${dropIndex} in status ${statusId}`);
      
      // Here you would call a service like:
      // await updateLeadOrder(draggedLead.id, statusId, dropIndex);
    }
    
    // Reset dragged lead
    setDraggedLead(null);
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
      {/* Lead Pool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {LEAD_STATUSES.map((status) => (
          <div 
            key={status.id}
            className="bg-white rounded-md border border-gray-200 flex flex-col"
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
            
            {/* Lead Cards - No scroll, with reordering */}
            <div className="p-2 flex-grow">
              {groupedLeads[status.id].length > 0 ? (
                <div className="space-y-2">
                  {groupedLeads[status.id].map((lead, index) => (
                    <div
                      key={lead.id}
                      className={`bg-white border rounded-md p-3 cursor-pointer
                                ${draggedLead?.id === lead.id ? "opacity-50" : ""}
                                ${updatingLeadId === lead.id ? "animate-pulse" : ""}
                                ${dragOverStatus === status.id && dragOverIndex === index ? "border-2 border-blue-400" : ""}`}
                      onClick={() => onView(lead)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead, status.id, index)}
                      onDragOver={(e) => handleDragOverCard(e, status.id, index)}
                      onDrop={(e) => handleDrop(e, status.id, index)}
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
                        
                        {/* Simplified last discussion summary to avoid overflow */}
                        {lead.lastDiscussionSummary && (
                          <div className="mb-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                            <div className="text-xs text-gray-500 mb-1">
                              <span>Last contact: {formatRelativeTime(lead.lastDiscussionDate)}</span>
                            </div>
                            <p className="break-words line-clamp-2">{truncateText(lead.lastDiscussionSummary, 60)}</p>
                          </div>
                        )}
                        
                        {/* Actions - Conditionally render based on lead status */}
                        <div className="mt-2 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {lead.status === "converted" ? (
                            // For converted leads, only show Move to Clients button
                            <CRMActionButton
                              type="primary"
                              size="xs"
                              onClick={() => onConvert(lead)}
                              aria-label="Move to Clients"
                              icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              }
                            >
                              Move to Clients
                            </CRMActionButton>
                          ) : (
                            // For non-converted leads, show Talk and Convert buttons
                            <>
                              {/* Talk button - available for all non-converted leads */}
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
                              
                              {/* Convert button */}
                              <CRMActionButton
                                type="success"
                                size="xs"
                                onClick={() => {
                                  // Update lead status to converted
                                  updateLeadStatus(lead.id, "converted");
                                }}
                                aria-label="Convert lead"
                                icon={
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                }
                              >
                                Convert
                              </CRMActionButton>
                            </>
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