import React, { useState } from "react";

const DisplayMaterialTable = ({ materials, onDelete, onEdit }) => {
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for sort field and direction
  const [sortField, setSortField] = useState('materialType');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // State for expanded rows in mobile view
  const [expandedRows, setExpandedRows] = useState({});
  
  // State for view type (compact or detailed)
  const [viewType, setViewType] = useState('compact');
  
  // Check if edit/delete functionality is enabled
  const hasEditAccess = typeof onEdit === "function";
  const hasDeleteAccess = typeof onDelete === "function";
  
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
  
  // Toggle expanded state for a row
  const toggleRowExpand = (e, id) => {
    e.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter materials based on search term
  const filteredMaterials = materials.filter(material => {
    if (!searchTerm.trim()) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    const searchFields = [
      material.materialType || "",
      material.materialName || "",
      material.company || "",
      material.rate?.toString() || "",
      material.finalCostPerUnit?.toString() || ""
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(lowerSearchTerm)
    );
  });
  
  // Sort materials based on sort field and direction
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const aValue = (a[sortField] || "").toString().toLowerCase();
    const bValue = (b[sortField] || "").toString().toLowerCase();
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue, undefined, { numeric: true });
    } else {
      return bValue.localeCompare(aValue, undefined, { numeric: true });
    }
  });

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
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

  // Renders the action buttons with minimal styling like vendor management
  const renderActionButtons = (material) => (
    <div className="flex items-center space-x-1">
      {hasEditAccess && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(material);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title="Edit Material"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
      )}
      {hasDeleteAccess && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(material.id);
          }}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Delete Material"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      )}
      <button
        onClick={(e) => toggleRowExpand(e, material.id)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title={expandedRows[material.id] ? "Show Less" : "Show More"}
      >
        <svg className={`w-4 h-4 transition-transform ${expandedRows[material.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  );

  // Compact view - shows only essential columns
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="materialType" label="Material Type" />
              <SortableHeader field="materialName" label="Material Name" />
              <SortableHeader field="company" label="Company" />
              <SortableHeader field="rate" label="Rate" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Size (L×B)</th>
              <SortableHeader field="finalCostPerUnit" label="Final Cost/Unit" />
              {(hasEditAccess || hasDeleteAccess) && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 w-32">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <React.Fragment key={material.id}>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-medium">{material.materialType || "-"}</td>
                  <td className="px-3 py-3">{material.materialName || "-"}</td>
                  <td className="px-3 py-3">{material.company || "-"}</td>
                  <td className="px-3 py-3">₹{material.rate || "-"}</td>
                  <td className="px-3 py-3">{material.sizeL || "-"}×{material.sizeB || "-"}</td>
                  <td className="px-3 py-3 font-medium text-red-600">₹{material.finalCostPerUnit || "-"}</td>
                  {(hasEditAccess || hasDeleteAccess) && (
                    <td className="px-3 py-3">
                      {renderActionButtons(material)}
                    </td>
                  )}
                </tr>
                {expandedRows[material.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={(hasEditAccess || hasDeleteAccess) ? 7 : 6} className="px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Quantity:</p>
                          <p>{material.quantity || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Area:</p>
                          <p>{material.area || "-"} sqcm</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Costs:</p>
                          <p>Courier: ₹{material.courier || "-"}</p>
                          <p>Mark Up: {material.markUp || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Pricing:</p>
                          <p>Landed: ₹{material.landedCost || "-"}</p>
                          <p>Per Unit: ₹{material.costPerUnit || "-"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {sortedMaterials.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No materials match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view - shows all columns with more width
  const renderDetailedView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="materialType" label="Material Type" />
              <SortableHeader field="materialName" label="Material Name" />
              <SortableHeader field="company" label="Company" />
              <SortableHeader field="rate" label="Rate" />
              <SortableHeader field="quantity" label="Quantity" />
              <SortableHeader field="sizeL" label="Length" />
              <SortableHeader field="sizeB" label="Breadth" />
              <SortableHeader field="area" label="Area" />
              <SortableHeader field="courier" label="Courier" />
              <SortableHeader field="markUp" label="Mark Up" />
              <SortableHeader field="landedCost" label="Landed Cost" />
              <SortableHeader field="costPerUnit" label="Cost/Unit" />
              <SortableHeader field="finalCostPerUnit" label="Final Cost/Unit" />
              {(hasEditAccess || hasDeleteAccess) && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 w-32">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material, index) => (
              <tr key={material.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-3 font-medium">{material.materialType || "-"}</td>
                <td className="px-3 py-3">{material.materialName || "-"}</td>
                <td className="px-3 py-3">{material.company || "-"}</td>
                <td className="px-3 py-3">₹{material.rate || "-"}</td>
                <td className="px-3 py-3">{material.quantity || "-"}</td>
                <td className="px-3 py-3">{material.sizeL || "-"}</td>
                <td className="px-3 py-3">{material.sizeB || "-"}</td>
                <td className="px-3 py-3">{material.area || "-"}</td>
                <td className="px-3 py-3">₹{material.courier || "-"}</td>
                <td className="px-3 py-3">{material.markUp || "-"}</td>
                <td className="px-3 py-3">₹{material.landedCost || "-"}</td>
                <td className="px-3 py-3">₹{material.costPerUnit || "-"}</td>
                <td className="px-3 py-3 font-medium text-red-600">₹{material.finalCostPerUnit || "-"}</td>
                {(hasEditAccess || hasDeleteAccess) && (
                  <td className="px-3 py-3">
                    {renderActionButtons(material)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {sortedMaterials.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No materials match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {sortedMaterials.map((material) => (
          <div key={material.id} className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            {/* Main material information always visible */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{material.materialType || "Unknown Type"}</h3>
                  <p className="text-sm text-gray-600">{material.materialName || "Unknown"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Company: {material.company || "-"}</p>
                  <p className="text-sm text-gray-600">Rate: ₹{material.rate || "-"}</p>
                  <p className="font-medium text-red-600">Final: ₹{material.finalCostPerUnit || "-"}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Size:</span> {material.sizeL || "-"}×{material.sizeB || "-"}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Quantity:</span> {material.quantity || "-"}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={(e) => toggleRowExpand(e, material.id)}
                  className="text-xs text-gray-600 flex items-center"
                >
                  {expandedRows[material.id] ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
                
                {(hasEditAccess || hasDeleteAccess) && (
                  <div className="flex space-x-2">
                    {hasEditAccess && (
                      <button
                        onClick={() => onEdit(material)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                        Edit
                      </button>
                    )}
                    {hasDeleteAccess && (
                      <button
                        onClick={() => onDelete(material.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Expandable detailed information */}
            {expandedRows[material.id] && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Area:</p>
                    <p>{material.area || "-"} sqcm</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Costs:</p>
                    <p>Courier: ₹{material.courier || "-"}</p>
                    <p>Mark Up: {material.markUp || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Pricing:</p>
                    <p>Landed: ₹{material.landedCost || "-"}</p>
                    <p>Per Unit: ₹{material.costPerUnit || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {sortedMaterials.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded">
            <p>No materials match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Search and View Options */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{sortedMaterials.length} {sortedMaterials.length === 1 ? 'material' : 'materials'} found</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewType('compact')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'compact' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Compact
            </button>
            <button 
              onClick={() => setViewType('detailed')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'detailed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {sortedMaterials.length > 0 ? (
        <div>
          {/* Responsive views based on screen size and selected view type */}
          <div className="hidden md:block">
            {viewType === 'detailed' ? renderDetailedView() : renderCompactView()}
          </div>
          
          {/* Mobile view */}
          <div className="md:hidden">
            {renderMobileCardView()}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {searchTerm ? (
            <>
              <p className="text-lg font-medium">No materials match your search</p>
              <p className="mt-1">Try using different keywords or clear your search</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No materials found</p>
              <p className="mt-1">Add your first material to get started</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayMaterialTable;