import React, { useState } from "react";
import { LEAD_TABLE_FIELDS } from "../../../constants/leadFields";
import { LEAD_STATUSES } from "../../../constants/leadStatuses";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useCRM } from "../../../context/CRMContext";
import { updateLead, updateLeadStatus } from "../../../services";

/**
 * Inline dropdown component for editing qualification badges
 */
const InlineQualificationDropdown = ({ 
  leadId, 
  currentBadgeId, 
  onUpdate, 
  disabled = false 
}) => {
  const { qualificationBadges } = useCRM();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBadgeChange = async (newBadgeId) => {
    if (newBadgeId === currentBadgeId) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateLead(leadId, { badgeId: newBadgeId });
      onUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating badge:", error);
      // Could add toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  if (disabled) {
    return <QualificationBadge badgeId={currentBadgeId} size="sm" />;
  }

  if (isEditing) {
    return (
      <div className="relative">
        <select
          value={currentBadgeId || ""}
          onChange={(e) => handleBadgeChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          disabled={isUpdating}
          className="text-xs px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[120px]"
        >
          <option value="">No Badge</option>
          {qualificationBadges?.map((badge) => (
            <option key={badge.id} value={badge.id}>
              {badge.name}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute right-1 top-1">
            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
      title="Click to edit qualification"
    >
      <QualificationBadge badgeId={currentBadgeId} size="sm" />
      {!currentBadgeId && (
        <span className="text-gray-400 text-xs italic">Click to add</span>
      )}
    </div>
  );
};

/**
 * Inline dropdown component for editing lead status
 */
const InlineStatusDropdown = ({ 
  leadId, 
  currentStatus, 
  onUpdate, 
  disabled = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateLeadStatus(leadId, newStatus);
      onUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating status:", error);
      // Could add toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  if (disabled) {
    return <LeadStatusBadge status={currentStatus} size="sm" />;
  }

  if (isEditing) {
    return (
      <div className="relative">
        <select
          value={currentStatus || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          disabled={isUpdating}
          className="text-xs px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[120px]"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute right-1 top-1">
            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
      title="Click to edit status"
    >
      <LeadStatusBadge status={currentStatus} size="sm" />
    </div>
  );
};

/**
 * Component to display leads in a table with inline editing
 */
const DisplayLeadsTable = ({ 
  leads = [], 
  onView,
  onEdit,
  onDelete,
  onAddDiscussion,
  onConvert,
  loading = false,
  fields = LEAD_TABLE_FIELDS,
  onLeadUpdate // New prop to handle lead updates
}) => {
  // State for sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Helper function to check if lead is added to clients
  const isLeadAddedToClients = (lead) => {
    return lead.status === "converted" && lead.movedToClients;
  };
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Confirm delete
  const confirmDelete = (lead) => {
    if (window.confirm(`Are you sure you want to delete the lead for "${lead.name}"?`)) {
      onDelete(lead.id);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  // Truncate text for display
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  // Sort leads
  const sortedLeads = [...leads].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date fields
    if (sortField === "createdAt" || sortField === "lastDiscussionDate") {
      aValue = aValue ? new Date(aValue.seconds ? aValue.seconds * 1000 : aValue) : new Date(0);
      bValue = bValue ? new Date(bValue.seconds ? bValue.seconds * 1000 : bValue) : new Date(0);
    } else {
      // Handle string fields
      aValue = aValue || "";
      bValue = bValue || "";
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Render cell content based on field type with inline editing
  const renderCellContent = (lead, field) => {
    const value = lead[field.field];
    const isAddedToClients = isLeadAddedToClients(lead);
    
    if (field.field === 'phone') {
      return (
        <div className="flex flex-col">
          {lead.phone && <span className="text-gray-600">{lead.phone}</span>}
        </div>
      );
    }
    
    if (field.field === 'email') {
      return (
        <div className="flex flex-col">
          {lead.email && <span className="text-gray-600">{lead.email}</span>}
        </div>
      );
    }
    
    if (field.field === 'source') {
      return <LeadSourceDisplay sourceId={value} />;
    }
    
    // Inline editable qualification badge
    if (field.field === 'badgeId') {
      return (
        <InlineQualificationDropdown
          leadId={lead.id}
          currentBadgeId={value}
          onUpdate={onLeadUpdate}
          disabled={isAddedToClients}
        />
      );
    }
    
    // Inline editable status
    if (field.field === 'status') {
      return (
        <InlineStatusDropdown
          leadId={lead.id}
          currentStatus={value}
          onUpdate={onLeadUpdate}
          disabled={isAddedToClients}
        />
      );
    }
    
    if (field.type === 'date' && value) {
      return formatDate(value);
    }
    
    if (field.truncate && typeof value === 'string') {
      return <div className="truncate max-w-xs">{truncateText(value, 60)}</div>;
    }
    
    return value || "-";
  };
  
  // Create a sortable table header
  const SortableHeader = ({ field, label, className = "" }) => (
    <th 
      className={`px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="bg-gray-100">
            {fields.map((field) => (
              field.sortable ? (
                <SortableHeader 
                  key={field.field}
                  field={field.field} 
                  label={field.label} 
                />
              ) : (
                <th 
                  key={field.field}
                  className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left"
                >
                  {field.label}
                </th>
              )
            ))}
            <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead) => (
            <tr 
              key={lead.id} 
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {fields.map((field) => (
                <td 
                  key={field.field} 
                  className="px-3 py-3"
                  onClick={(e) => {
                    // Don't trigger row click for inline editable fields
                    if (field.field !== 'badgeId' && field.field !== 'status') {
                      onView(lead);
                    }
                  }}
                  style={{ cursor: field.field === 'badgeId' || field.field === 'status' ? 'default' : 'pointer' }}
                >
                  {renderCellContent(lead, field)}
                </td>
              ))}
              <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-1">
                  {isLeadAddedToClients(lead) ? (
                    // Only show "Added to Clients" status for leads that have been moved
                    <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Clients
                    </div>
                  ) : (
                    // Show action buttons for all other leads
                    <>
                      <CRMActionButton
                        type="info"
                        size="xs"
                        onClick={() => onAddDiscussion(lead)}
                        aria-label="Add discussion"
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        }
                      >
                        Edit
                      </CRMActionButton>
                      
                      {/* Show appropriate action for converted leads */}
                      {lead.status === "converted" && onConvert && (
                        <CRMActionButton
                          type="success"
                          size="xs"
                          onClick={() => onConvert(lead)}
                          aria-label="Move to clients"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          }
                        >
                          Move to Clients
                        </CRMActionButton>
                      )}
                      
                      <CRMActionButton
                        type="danger"
                        size="xs"
                        onClick={() => confirmDelete(lead)}
                        aria-label="Delete lead"
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
                        }
                      >
                        Delete
                      </CRMActionButton>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Empty State */}
      {sortedLeads.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 font-medium">No leads found</p>
          <p className="mt-1">Try using different filters or add a new lead to get started</p>
        </div>
      )}
    </div>
  );
};

export default DisplayLeadsTable;