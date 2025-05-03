import React, { useState } from "react";

const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("jobType");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});

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
      className="px-3 py-2 border font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-200"
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

  // Define column groups and their respective widths
  const columnGroups = {
    main: [
      { name: "Job Type", key: "jobType", width: "w-28" },
      { name: "Type", key: "type", width: "w-28" },
      { name: "Die Code", key: "dieCode", width: "w-28" },
      { name: "Frags", key: "frags", width: "w-16" },
    ],
    originalSizes: [
      { name: "Product L (in)", key: "productSizeL", width: "w-24" },
      { name: "Product B (in)", key: "productSizeB", width: "w-24" },
      { name: "Die L (in)", key: "dieSizeL", width: "w-20" },
      { name: "Die B (in)", key: "dieSizeB", width: "w-20" },
    ],
    calculatedSizes: [
      { name: "L (CM) PAPER", key: "dieSizeL_CM", width: "w-24" },
      { name: "B (CM) PAPER", key: "dieSizeB_CM", width: "w-24" },
      { name: "PLATE L (in)", key: "plateSizeL", width: "w-24" },
      { name: "PLATE B (in)", key: "plateSizeB", width: "w-24" },
      { name: "CLSD PRNT L (CM)", key: "clsdPrntSizeL_CM", width: "w-32" },
      { name: "CLSD PRNT B (CM)", key: "clsdPrntSizeB_CM", width: "w-32" },
    ]
  };

  // Compact view - shows only essential columns
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="jobType" label="Job Type" />
              <SortableHeader field="type" label="Type" />
              <SortableHeader field="dieCode" label="Die Code" />
              <SortableHeader field="frags" label="Frags" />
              <th className="px-3 py-2 border font-medium text-gray-700">Product Size (L×B)</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Die Size (L×B)</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Image</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDies.map((die) => {
              const calculatedDie = calculateDieValues(die);
              
              return (
                <React.Fragment key={die.id}>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 border">{die.jobType || "-"}</td>
                    <td className="px-3 py-2 border">{die.type || "-"}</td>
                    <td className="px-3 py-2 border font-medium">{die.dieCode || "-"}</td>
                    <td className="px-3 py-2 border">{die.frags || "-"}</td>
                    <td className="px-3 py-2 border">
                      {die.productSizeL || "-"}×{die.productSizeB || "-"}
                    </td>
                    <td className="px-3 py-2 border">
                      {die.dieSizeL || "-"}×{die.dieSizeB || "-"}
                    </td>
                    <td className="px-3 py-2 border">
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
                    <td className="px-3 py-2 border">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEditDie(calculatedDie)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteDie(die.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => toggleRowExpand(die.id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                          {expandedRows[die.id] ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[die.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-3 py-2 border">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Converted Sizes:</p>
                            <p>Paper L (CM): {calculatedDie.dieSizeL_CM}</p>
                            <p>Paper B (CM): {calculatedDie.dieSizeB_CM}</p>
                          </div>
                          <div>
                            <p className="font-medium">Plate Sizes:</p>
                            <p>L (in): {calculatedDie.plateSizeL}</p>
                            <p>B (in): {calculatedDie.plateSizeB}</p>
                          </div>
                          <div>
                            <p className="font-medium">Closed Print Sizes:</p>
                            <p>L (CM): {calculatedDie.clsdPrntSizeL_CM}</p>
                            <p>B (CM): {calculatedDie.clsdPrntSizeB_CM}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Detailed view - shows all columns with fixed widths
  const renderDetailedView = () => {
    return (
      <div>
        <table className="text-sm w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th colSpan={columnGroups.main.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Main Information
              </th>
              <th colSpan={columnGroups.originalSizes.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Original Sizes
              </th>
              <th colSpan={columnGroups.calculatedSizes.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Calculated Sizes
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-medium text-gray-700 w-20">
                Image
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-medium text-gray-700 w-20">
                Actions
              </th>
            </tr>
            <tr className="bg-gray-100">
              {/* Main Info Headers */}
              {columnGroups.main.map((col) => (
                <th 
                  key={`head-${col.key}`} 
                  className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width} cursor-pointer hover:bg-gray-200`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.name}
                    {sortField === col.key && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Original Sizes Headers */}
              {columnGroups.originalSizes.map((col) => (
                <th 
                  key={`head-${col.key}`} 
                  className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width} cursor-pointer hover:bg-gray-200`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.name.includes(' ') ? (
                      <>
                        {col.name.split(' ')[0]} {col.name.split(' ')[1]}
                        <br />
                        {col.name.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      col.name
                    )}
                    {sortField === col.key && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Calculated Sizes Headers */}
              {columnGroups.calculatedSizes.map((col) => (
                <th 
                  key={`head-${col.key}`} 
                  className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width} cursor-pointer hover:bg-gray-200`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.name.includes(' ') ? (
                      <>
                        {col.name.split(' ')[0]} {col.name.split(' ')[1]}
                        <br />
                        {col.name.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      col.name
                    )}
                    {sortField === col.key && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedDies.map((die) => {
              const calculatedDie = calculateDieValues(die);
              
              return (
                <tr key={die.id} className="border-t hover:bg-gray-50">
                  {/* Main Info Cells */}
                  <td className="px-2 py-2 border truncate">{die.jobType || "-"}</td>
                  <td className="px-2 py-2 border truncate">{die.type || "-"}</td>
                  <td className="px-2 py-2 border truncate font-medium">{die.dieCode || "-"}</td>
                  <td className="px-2 py-2 border truncate">{die.frags || "-"}</td>
                  
                  {/* Original Sizes Cells */}
                  <td className="px-2 py-2 border truncate">{die.productSizeL || "-"}</td>
                  <td className="px-2 py-2 border truncate">{die.productSizeB || "-"}</td>
                  <td className="px-2 py-2 border truncate">{die.dieSizeL || "-"}</td>
                  <td className="px-2 py-2 border truncate">{die.dieSizeB || "-"}</td>
                  
                  {/* Calculated Sizes Cells */}
                  <td className="px-2 py-2 border truncate">{calculatedDie.dieSizeL_CM}</td>
                  <td className="px-2 py-2 border truncate">{calculatedDie.dieSizeB_CM}</td>
                  <td className="px-2 py-2 border truncate">{calculatedDie.plateSizeL}</td>
                  <td className="px-2 py-2 border truncate">{calculatedDie.plateSizeB}</td>
                  <td className="px-2 py-2 border truncate">{calculatedDie.clsdPrntSizeL_CM}</td>
                  <td className="px-2 py-2 border truncate">{calculatedDie.clsdPrntSizeB_CM}</td>
                  
                  {/* Image Cell */}
                  <td className="px-2 py-2 border">
                    {die.imageUrl ? (
                      <img 
                        src={die.imageUrl} 
                        alt="Die" 
                        className="w-12 h-12 object-cover rounded border hover:w-24 hover:h-24 transition-all cursor-pointer"
                        onClick={() => window.open(die.imageUrl, '_blank')}
                      />
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  
                  {/* Actions Cell */}
                  <td className="px-2 py-2 border">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => onEditDie(calculatedDie)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteDie(die.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
            <div key={die.id} className="border rounded shadow-sm">
              {/* Main die information always visible */}
              <div className="p-4 flex flex-wrap justify-between items-center">
                <div className="w-full md:w-1/2 mb-2 md:mb-0">
                  <h3 className="font-medium">{die.dieCode || "Unnamed Die"}</h3>
                  <p className="text-sm text-gray-600">{die.jobType || "No type"} | {die.type || "-"}</p>
                </div>
                <div className="w-full md:w-1/4 mb-2 md:mb-0 text-center">
                  <p className="text-sm">Frags: {die.frags || "-"}</p>
                  <p className="text-xs">
                    Size: {die.productSizeL || "-"}×{die.productSizeB || "-"} in
                  </p>
                </div>
                <div className="w-full md:w-1/4 flex justify-end space-x-2">
                  <button
                    onClick={() => onEditDie(calculatedDie)}
                    className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteDie(die.id)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleRowExpand(die.id)}
                    className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    {expandedRows[die.id] ? "Hide" : "Details"}
                  </button>
                </div>
              </div>
              
              {/* Expandable detailed information */}
              {expandedRows[die.id] && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Product Size</p>
                      <p>Length: {die.productSizeL || "-"} in</p>
                      <p>Breadth: {die.productSizeB || "-"} in</p>
                    </div>
                    <div>
                      <p className="font-medium">Die Size</p>
                      <p>Length: {die.dieSizeL || "-"} in</p>
                      <p>Breadth: {die.dieSizeB || "-"} in</p>
                    </div>
                    <div>
                      <p className="font-medium">Calculated Values</p>
                      <p>Paper (CM): {calculatedDie.dieSizeL_CM} × {calculatedDie.dieSizeB_CM}</p>
                      <p>CLSD PRNT (CM): {calculatedDie.clsdPrntSizeL_CM} × {calculatedDie.clsdPrntSizeB_CM}</p>
                    </div>
                    {die.imageUrl && (
                      <div className="col-span-1">
                        <p className="font-medium">Image</p>
                        <img 
                          src={die.imageUrl} 
                          alt="Die" 
                          className="mt-1 w-24 h-24 object-cover rounded border cursor-pointer"
                          onClick={() => window.open(die.imageUrl, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Available Dies</h2>
        <div className="flex space-x-2">
          <div className="w-64 mr-2">
            <input
              type="text"
              placeholder="Search dies..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <button 
            onClick={() => setViewType('detailed')}
            className={`px-2 py-1 text-sm rounded ${viewType === 'detailed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Full View
          </button>
          <button 
            onClick={() => setViewType('compact')}
            className={`px-2 py-1 text-sm rounded ${viewType === 'compact' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Compact
          </button>
        </div>
      </div>
      
      {/* Responsive views based on screen size and selected view type */}
      <div className="hidden md:block">
        {viewType === 'detailed' ? renderDetailedView() : renderCompactView()}
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        {renderMobileCardView()}
      </div>
      
      {/* Show when no dies exist */}
      {sortedDies.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          {searchTerm ? "No dies match your search criteria." : "No dies available."}
        </div>
      )}
      
      <div className="mt-4 text-gray-500 text-sm">
        {sortedDies.length} dies found
      </div>
    </div>
  );
};

export default DisplayDieTable;