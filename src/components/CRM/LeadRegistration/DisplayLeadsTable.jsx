import React, { useState } from "react";
import { LEAD_TABLE_FIELDS } from "../../../constants/leadFields";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";

/**
 * Component to display leads in a table
 * @param {Object} props - Component props
 * @param {Array} props.leads - Array of lead objects
 * @param {function} props.onView - View handler
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onDelete - Delete handler
 * @param {function} props.onAddDiscussion - Add discussion handler
 * @param {boolean} props.loading - Loading state
 */
const DisplayLeadsTable = ({ 
  leads = [], 
  onView,
  onEdit,
  onDelete,
  onAddDiscussion,
  loading = false
}) => {
  // State for search term and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  
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
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
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
  
  // Filter and sort leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      searchTerm === "" ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastDiscussionSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "" || lead.status === filterStatus;
    const matchesSource = filterSource === "" || lead.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });
  
  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
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
    <div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-4 border-b">
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
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="newLead">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiation">Negotiation</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          
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
        </div>
      </div>
      
      {/* Lead Count */}
      <div className="px-4 py-2 text-sm text-gray-600 bg-white">
        Showing {sortedLeads.length} of {leads.length} leads
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="name" label="Name" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Phone/Email</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Source</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Qualification</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <SortableHeader field="lastDiscussionDate" label="Last Contact" />
              {/* Last Discussion Summary column */}
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Last Discussion Summary</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map((lead) => (
              <tr 
                key={lead.id} 
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(lead)}
              >
                <td className="px-3 py-3 font-medium">
                  {lead.name}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    {lead.phone && <span className="text-gray-600">{lead.phone}</span>}
                    {lead.email && <span className="text-gray-600 text-xs">{lead.email}</span>}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <LeadSourceDisplay sourceId={lead.source} />
                </td>
                <td className="px-3 py-3">
                  <QualificationBadge badgeId={lead.badgeId} size="sm" />
                </td>
                <td className="px-3 py-3">
                  <LeadStatusBadge status={lead.status} size="sm" />
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {lead.lastDiscussionDate ? formatDate(lead.lastDiscussionDate) : "-"}
                </td>
                {/* Last Discussion Summary column */}
                <td className="px-3 py-3 text-gray-600 max-w-xs">
                  <div className="truncate">
                    {lead.lastDiscussionSummary ? truncateText(lead.lastDiscussionSummary, 60) : "-"}
                  </div>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-1">
                    <CRMActionButton
                      type="info"
                      size="xs"
                      onClick={() => onAddDiscussion(lead)}
                      aria-label="Add discussion"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      }
                    >
                      Edit
                    </CRMActionButton>
                    
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State */}
        {sortedLeads.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {searchTerm || filterStatus || filterSource ? (
              <>
                <p className="mt-4 font-medium">No leads match your search</p>
                <p className="mt-1">Try using different filters or clear your search</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('');
                    setFilterSource('');
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 font-medium">No leads found</p>
                <p className="mt-1">Add your first lead to get started</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayLeadsTable;