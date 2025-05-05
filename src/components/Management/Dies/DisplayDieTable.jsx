import React, { useState } from "react";

const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("jobType");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});

  // Check if edit functionality is enabled
  const hasEditAccess = typeof onEditDie === "function" && typeof onDeleteDie === "function";

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
  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter dies based on search term
  const filteredDies = dies.filter((die) => {
    // If search is empty, return all dies
    if (!searchTerm.trim()) {
      return true;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    // Check if search contains dimension patterns
    const productLPattern = lowerSearchTerm.match(/l:([0-9.]+)/i);
    const productBPattern = lowerSearchTerm.match(/b:([0-9.]+)/i);
    const dieLPattern = lowerSearchTerm.match(/dl:([0-9.]+)/i);
    const dieBPattern = lowerSearchTerm.match(/db:([0-9.]+)/i);
    
    // With dimension patterns - check dimensions specifically
    if (productLPattern || productBPattern || dieLPattern || dieBPattern) {
      let isProductLMatch = true;
      let isProductBMatch = true;
      let isDieLMatch = true;
      let isDieBMatch = true;

      // Product L dimension search
      if (productLPattern && productLPattern[1]) {
        const lValue = productLPattern[1];
        isProductLMatch = (die.productSizeL && die.productSizeL.toString().includes(lValue));
      }

      // Product B dimension search
      if (productBPattern && productBPattern[1]) {
        const bValue = productBPattern[1];
        isProductBMatch = (die.productSizeB && die.productSizeB.toString().includes(bValue));
      }
      
      // Die L dimension search
      if (dieLPattern && dieLPattern[1]) {
        const dlValue = dieLPattern[1];
        isDieLMatch = (die.dieSizeL && die.dieSizeL.toString().includes(dlValue));
      }

      // Die B dimension search
      if (dieBPattern && dieBPattern[1]) {
        const dbValue = dieBPattern[1];
        isDieBMatch = (die.dieSizeB && die.dieSizeB.toString().includes(dbValue));
      }

      // Return true if all specified conditions are met
      return isProductLMatch && isProductBMatch && isDieLMatch && isDieBMatch;
    }
    
    // Search in all relevant fields, including product and die dimensions
    const searchFields = [
      die.jobType || "",
      die.type || "",
      die.dieCode || "",
      die.productSizeL?.toString() || "",
      die.productSizeB?.toString() || "",
      // If the product size exists as a combined field (like "3.34×2.12"), check it too
      `${die.productSizeL || ""}×${die.productSizeB || ""}`,
      // Also check die sizes
      die.dieSizeL?.toString() || "",
      die.dieSizeB?.toString() || "", 
      `${die.dieSizeL || ""}×${die.dieSizeB || ""}`,
      // Include frags
      die.frags?.toString() || ""
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Sort dies based on sort field and direction
  const sortedDies = [...filteredDies].sort((a, b) => {
    // For die code, use alphanumeric sorting
    if (sortField === 'dieCode') {
      const aValue = (a[sortField] || "").toString();
      const bValue = (b[sortField] || "").toString();
      
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      }
    }
    // For other fields, use the existing text sorting
    else {
      const aValue = (a[sortField] || "").toString().toLowerCase();
      const bValue = (b[sortField] || "").toString().toLowerCase();
      
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }
  });

  // Create a sortable table header
  const SortableHeader = ({ field, label }) => (
    <th 
      className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left cursor-pointer hover:bg-gray-50 transition-colors"
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

  // Calculate any missing values for a die
  const calculateDieValues = (die) => {
    const calculateCM = (inches) => {
      if (!inches || isNaN(inches)) return "-";
      return (parseFloat(inches) * 2.54).toFixed(2);
    };
    
    return {
      ...die,
      dieSizeL_CM: die.dieSizeL_CM || calculateCM(die.dieSizeL),
      dieSizeB_CM: die.dieSizeB_CM || calculateCM(die.dieSizeB),
      plateSizeL: die.plateSizeL || die.productSizeL || "-",
      plateSizeB: die.plateSizeB || die.productSizeB || "-",
      clsdPrntSizeL_CM: die.clsdPrntSizeL_CM || calculateCM(die.productSizeL),
      clsdPrntSizeB_CM: die.clsdPrntSizeB_CM || calculateCM(die.productSizeB),
    };
  };

  // Renders the action buttons with the correct styling
  const renderActionButtons = (die) => (
    <div className="flex space-x-2">
      <button
        onClick={() => onEditDie(calculateDieValues(die))}
        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
      >
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
        </svg>
        Edit
      </button>
      <button
        onClick={() => onDeleteDie(die.id)}
        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
      >
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Delete
      </button>
      <button
        onClick={() => toggleRowExpand(die.id)}
        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        {expandedRows[die.id] ? '▲' : '▼'}
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
              <SortableHeader field="jobType" label="Job Type" />
              <SortableHeader field="type" label="Type" />
              <SortableHeader field="dieCode" label="Die Code" />
              <SortableHeader field="frags" label="Frags" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Product Size (L×B)</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Die Size (L×B)</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Image</th>
              {hasEditAccess && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedDies.map((die, index) => (
              <React.Fragment key={die.id}>
                <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 py-3">{die.jobType || "-"}</td>
                  <td className="px-3 py-3">{die.type || "-"}</td>
                  <td className="px-3 py-3 font-medium">{die.dieCode || "-"}</td>
                  <td className="px-3 py-3">{die.frags || "-"}</td>
                  <td className="px-3 py-3">
                    {die.productSizeL || "-"}×{die.productSizeB || "-"}
                  </td>
                  <td className="px-3 py-3">
                    {die.dieSizeL || "-"}×{die.dieSizeB || "-"}
                  </td>
                  <td className="px-3 py-3">
                    {die.imageUrl ? (
                      <img 
                        src={die.imageUrl} 
                        alt="Die" 
                        className="w-12 h-12 object-cover rounded border hover:w-24 hover:h-24 transition-all cursor-pointer"
                        onClick={() => window.open(die.imageUrl, '_blank')}
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  {hasEditAccess && (
                    <td className="px-3 py-3">
                      {renderActionButtons(die)}
                    </td>
                  )}
                </tr>
                {expandedRows[die.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={hasEditAccess ? 8 : 7} className="px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Converted Sizes:</p>
                          <p>Paper L (CM): {calculateDieValues(die).dieSizeL_CM}</p>
                          <p>Paper B (CM): {calculateDieValues(die).dieSizeB_CM}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Plate Sizes:</p>
                          <p>L (in): {calculateDieValues(die).plateSizeL}</p>
                          <p>B (in): {calculateDieValues(die).plateSizeB}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Closed Print Sizes:</p>
                          <p>L (CM): {calculateDieValues(die).clsdPrntSizeL_CM}</p>
                          <p>B (CM): {calculateDieValues(die).clsdPrntSizeB_CM}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {sortedDies.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No dies match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view - shows all columns with fixed widths
  const renderDetailedView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="jobType" label="Job Type" />
              <SortableHeader field="type" label="Type" />
              <SortableHeader field="dieCode" label="Die Code" />
              <SortableHeader field="frags" label="Frags" />
              <SortableHeader field="productSizeL" label="Product L (in)" />
              <SortableHeader field="productSizeB" label="Product B (in)" />
              <SortableHeader field="dieSizeL" label="Die L (in)" />
              <SortableHeader field="dieSizeB" label="Die B (in)" />
              <SortableHeader field="dieSizeL_CM" label="Paper L (CM)" />
              <SortableHeader field="dieSizeB_CM" label="Paper B (CM)" />
              <SortableHeader field="clsdPrntSizeL_CM" label="CLSD PRNT L (CM)" />
              <SortableHeader field="clsdPrntSizeB_CM" label="CLSD PRNT B (CM)" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Image</th>
              {hasEditAccess && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedDies.map((die, index) => {
              const calculatedDie = calculateDieValues(die);
              
              return (
                <tr key={die.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 py-3">{die.jobType || "-"}</td>
                  <td className="px-3 py-3">{die.type || "-"}</td>
                  <td className="px-3 py-3 font-medium">{die.dieCode || "-"}</td>
                  <td className="px-3 py-3">{die.frags || "-"}</td>
                  <td className="px-3 py-3">{die.productSizeL || "-"}</td>
                  <td className="px-3 py-3">{die.productSizeB || "-"}</td>
                  <td className="px-3 py-3">{die.dieSizeL || "-"}</td>
                  <td className="px-3 py-3">{die.dieSizeB || "-"}</td>
                  <td className="px-3 py-3">{calculatedDie.dieSizeL_CM}</td>
                  <td className="px-3 py-3">{calculatedDie.dieSizeB_CM}</td>
                  <td className="px-3 py-3">{calculatedDie.clsdPrntSizeL_CM}</td>
                  <td className="px-3 py-3">{calculatedDie.clsdPrntSizeB_CM}</td>
                  <td className="px-3 py-3">
                    {die.imageUrl ? (
                      <img 
                        src={die.imageUrl} 
                        alt="Die" 
                        className="w-12 h-12 object-cover rounded border hover:w-24 hover:h-24 transition-all cursor-pointer"
                        onClick={() => window.open(die.imageUrl, '_blank')}
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  {hasEditAccess && (
                    <td className="px-3 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditDie(calculatedDie)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteDie(die.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
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
              );
            })}
          </tbody>
        </table>
        {sortedDies.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No dies match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {sortedDies.map((die) => {
          const calculatedDie = calculateDieValues(die);
          
          return (
            <div key={die.id} className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              {/* Main die information always visible */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{die.dieCode || "Unnamed Die"}</h3>
                    <p className="text-sm text-gray-600">{die.jobType || "No type"} | {die.type || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Frags: {die.frags || "-"}</p>
                    <p className="text-xs">
                      Size: {die.productSizeL || "-"}×{die.productSizeB || "-"} in
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {die.imageUrl ? (
                    <div className="flex justify-center">
                      <img 
                        src={die.imageUrl} 
                        alt="Die" 
                        className="w-16 h-16 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(die.imageUrl, '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">No Image Available</div>
                  )}
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <button
                    onClick={() => toggleRowExpand(die.id)}
                    className="text-xs text-gray-600 flex items-center"
                  >
                    {expandedRows[die.id] ? (
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
                  
                  {hasEditAccess && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditDie(calculatedDie)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteDie(die.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expandable detailed information */}
              {expandedRows[die.id] && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Product Size</p>
                      <p>Length: {die.productSizeL || "-"} in</p>
                      <p>Breadth: {die.productSizeB || "-"} in</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Die Size</p>
                      <p>Length: {die.dieSizeL || "-"} in</p>
                      <p>Breadth: {die.dieSizeB || "-"} in</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Calculated Values</p>
                      <p>Paper (CM): {calculatedDie.dieSizeL_CM} × {calculatedDie.dieSizeB_CM}</p>
                      <p>CLSD PRNT (CM): {calculatedDie.clsdPrntSizeL_CM} × {calculatedDie.clsdPrntSizeB_CM}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {sortedDies.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded">
            <p>No dies match your search criteria.</p>
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
            placeholder="Search dies..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{sortedDies.length} {sortedDies.length === 1 ? 'die' : 'dies'} found</span>
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
      {sortedDies.length > 0 ? (
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
              <p className="text-lg font-medium">No dies match your search</p>
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
              <p className="text-lg font-medium">No dies found</p>
              <p className="mt-1">Add your first die to get started</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayDieTable;