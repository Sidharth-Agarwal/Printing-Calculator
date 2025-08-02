import React, { useState } from "react";

const DisplayGstHsnTable = ({ gstHsns, onDelete, onEdit }) => {
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for sort field and direction
  const [sortField, setSortField] = useState('group');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Check if edit functionality is enabled
  const hasEditAccess = typeof onEdit === "function" && typeof onDelete === "function";
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  // Filter gstHsns based on search term
  const filteredGstHsns = gstHsns.filter(gstHsn => {
    if (!searchTerm.trim()) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    const searchFields = [
      gstHsn.group || "",
      gstHsn.type || "",
      gstHsn.concatenate || "",
      gstHsn.value?.toString() || ""
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(lowerSearchTerm)
    );
  });
  
  // Sort gstHsns based on sort field and direction
  const sortedGstHsns = [...filteredGstHsns].sort((a, b) => {
    // Primary sort by group
    if (sortField === 'group') {
      const aGroup = (a.group || "").toString().toLowerCase();
      const bGroup = (b.group || "").toString().toLowerCase();
      
      if (aGroup !== bGroup) {
        return sortDirection === "asc" 
          ? aGroup.localeCompare(bGroup, undefined, { numeric: true })
          : bGroup.localeCompare(aGroup, undefined, { numeric: true });
      }
      
      // Secondary sort by type when group is the same
      const aType = (a.type || "").toString().toLowerCase();
      const bType = (b.type || "").toString().toLowerCase();
      return aType.localeCompare(bType, undefined, { numeric: true });
    } 
    
    // Normal sort for other fields
    const aValue = (a[sortField] || "").toString().toLowerCase();
    const bValue = (b[sortField] || "").toString().toLowerCase();
    
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue, undefined, { numeric: true })
      : bValue.localeCompare(aValue, undefined, { numeric: true });
  });

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  // Create a sortable table header
  const SortableHeader = ({ field, label, className = "" }) => (
    <th 
      className={`px-4 py-3 border-b-2 border-gray-200 font-semibold text-left text-xs uppercase text-gray-700 cursor-pointer hover:bg-gray-50 ${className}`}
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

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Search and count indicator */}
      <div className="pb-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search GST & HSN..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2"
          />
        </div>
        
        <div className="text-sm text-gray-600">
          {sortedGstHsns.length} {sortedGstHsns.length === 1 ? 'record' : 'records'} found
        </div>
      </div>

      {/* Table */}
      {sortedGstHsns.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="group" label="Group" />
                <SortableHeader field="type" label="Type" />
                <SortableHeader field="concatenate" label="Concatenate" />
                <SortableHeader field="value" label="Value" />
                {hasEditAccess && (
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-left text-xs uppercase text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedGstHsns.map((gstHsn, index) => (
                <tr key={gstHsn.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium">
                    {gstHsn.group || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {gstHsn.type || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {gstHsn.concatenate || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {gstHsn.value || "-"}
                  </td>
                  {hasEditAccess && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(gstHsn)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(gstHsn.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {searchTerm ? (
            <>
              <p className="text-lg font-medium">No GST & HSN records match your search</p>
              <p className="mt-1">Try using different keywords or clear your search</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No GST & HSN records found</p>
              <p className="mt-1">Add your first record to get started</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayGstHsnTable;