import React, { useState } from "react";

const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
  // Sort papers alphabetically by paper name
  const sortedPapers = [...papers].sort((a, b) => 
    (a.paperName || '').localeCompare(b.paperName || '')
  );
  
  // State for expanded rows in mobile view
  const [expandedRows, setExpandedRows] = useState({});
  
  // State for view type (compact or detailed)
  const [viewType, setViewType] = useState('compact');
  
  // Toggle expanded state for a row
  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Define column groups and their respective widths
  const columnGroups = {
    main: [
      { name: "Date", key: "timestamp", width: "w-24" },
      { name: "Paper Name", key: "paperName", width: "w-32" },
      { name: "Company", key: "company", width: "w-28" },
      { name: "GSM", key: "gsm", width: "w-16" },
      { name: "Price/Sheet", key: "pricePerSheet", width: "w-24" },
      { name: "Final Rate", key: "finalRate", width: "w-24" }
    ],
    dimensions: [
      { name: "Length", key: "length", width: "w-16" },
      { name: "Breadth", key: "breadth", width: "w-16" },
      { name: "Area", key: "area", width: "w-20" }
    ],
    calculations: [
      { name: "Freight/KG", key: "freightPerKg", width: "w-20" },
      { name: "Rate/Gram", key: "ratePerGram", width: "w-20" },
      { name: "1 Sqcm in Gram", key: "oneSqcmInGram", width: "w-24" },
      { name: "GSM/Sheet", key: "gsmPerSheet", width: "w-20" },
      { name: "Freight/Sheet", key: "freightPerSheet", width: "w-24" }
    ]
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  // Compact view - shows only essential columns
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border font-medium text-gray-700">Date</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Paper Name</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Company</th>
              <th className="px-3 py-2 border font-medium text-gray-700">GSM</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Price/Sheet</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Final Rate</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Dimensions (L×B)</th>
              <th className="px-3 py-2 border font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPapers.map((paper) => (
              <React.Fragment key={paper.id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 border">{formatDate(paper.timestamp)}</td>
                  <td className="px-3 py-2 border">{paper.paperName || "-"}</td>
                  <td className="px-3 py-2 border">{paper.company || "-"}</td>
                  <td className="px-3 py-2 border">{paper.gsm || "-"}</td>
                  <td className="px-3 py-2 border">{paper.pricePerSheet || "-"}</td>
                  <td className="px-3 py-2 border font-medium">{paper.finalRate || "-"}</td>
                  <td className="px-3 py-2 border">{paper.length || "-"}×{paper.breadth || "-"}</td>
                  <td className="px-3 py-2 border">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEditPaper(paper)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeletePaper(paper.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => toggleRowExpand(paper.id)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        {expandedRows[paper.id] ? '▲' : '▼'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows[paper.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="px-3 py-2 border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Area:</p>
                          <p>{paper.area || "-"} sqcm</p>
                        </div>
                        <div>
                          <p className="font-medium">Weight Details:</p>
                          <p>1 Sqcm: {paper.oneSqcmInGram || "-"} g</p>
                          <p>GSM/Sheet: {paper.gsmPerSheet || "-"} g</p>
                        </div>
                        <div>
                          <p className="font-medium">Freight:</p>
                          <p>Per KG: ₹{paper.freightPerKg || "-"}</p>
                          <p>Per Sheet: ₹{paper.freightPerSheet || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Rate:</p>
                          <p>Per Gram: ₹{paper.ratePerGram || "-"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
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
              <th colSpan={columnGroups.dimensions.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Dimensions
              </th>
              <th colSpan={columnGroups.calculations.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Calculations
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-medium text-gray-700 w-20">
                Actions
              </th>
            </tr>
            <tr className="bg-gray-100">
              {/* Main Info Headers */}
              {columnGroups.main.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name}
                </th>
              ))}
              
              {/* Dimensions Headers */}
              {columnGroups.dimensions.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name}
                </th>
              ))}
              
              {/* Calculations Headers */}
              {columnGroups.calculations.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPapers.map((paper) => (
              <tr key={paper.id} className="border-t hover:bg-gray-50">
                {/* Main Info Cells */}
                <td className="px-2 py-2 border truncate">{formatDate(paper.timestamp)}</td>
                <td className="px-2 py-2 border truncate">{paper.paperName || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.company || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.gsm || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.pricePerSheet || "-"}</td>
                <td className="px-2 py-2 border truncate font-medium">{paper.finalRate || "-"}</td>
                
                {/* Dimensions Cells */}
                <td className="px-2 py-2 border truncate">{paper.length || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.breadth || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.area || "-"}</td>
                
                {/* Calculations Cells */}
                <td className="px-2 py-2 border truncate">{paper.freightPerKg || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.ratePerGram || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.oneSqcmInGram || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.gsmPerSheet || "-"}</td>
                <td className="px-2 py-2 border truncate">{paper.freightPerSheet || "-"}</td>
                
                {/* Actions Cell */}
                <td className="px-2 py-2 border">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onEditPaper(paper)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeletePaper(paper.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {sortedPapers.map((paper) => (
          <div key={paper.id} className="border rounded shadow-sm">
            {/* Main paper information always visible */}
            <div className="p-4 flex flex-wrap justify-between items-center">
              <div className="w-full md:w-1/2 mb-2 md:mb-0">
                <h3 className="font-medium">{paper.paperName || "Unnamed Paper"}</h3>
                <p className="text-sm text-gray-600">{paper.company || "No company"} | {paper.gsm || "-"} GSM</p>
              </div>
              <div className="w-full md:w-1/4 mb-2 md:mb-0 text-center">
                <p className="text-sm">Price: ₹{paper.pricePerSheet || "-"}</p>
                <p className="font-medium">Final: ₹{paper.finalRate || "-"}</p>
              </div>
              <div className="w-full md:w-1/4 flex justify-end space-x-2">
                <button
                  onClick={() => onEditPaper(paper)}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeletePaper(paper.id)}
                  className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => toggleRowExpand(paper.id)}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  {expandedRows[paper.id] ? "Hide" : "Details"}
                </button>
              </div>
            </div>
            
            {/* Expandable detailed information */}
            {expandedRows[paper.id] && (
              <div className="border-t p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Dimensions</p>
                    <p>Length: {paper.length || "-"} cm</p>
                    <p>Breadth: {paper.breadth || "-"} cm</p>
                    <p>Area: {paper.area || "-"} sq.cm</p>
                  </div>
                  <div>
                    <p className="font-medium">Weight</p>
                    <p>1 Sqcm in Gram: {paper.oneSqcmInGram || "-"}</p>
                    <p>GSM/Sheet: {paper.gsmPerSheet || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Freight</p>
                    <p>Freight/KG: ₹{paper.freightPerKg || "-"}</p>
                    <p>Rate/Gram: ₹{paper.ratePerGram || "-"}</p>
                    <p>Freight/Sheet: ₹{paper.freightPerSheet || "-"}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-gray-500">
                      Added on: {formatDate(paper.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Available Papers</h2>
        <div className="flex space-x-2">
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
      
      {/* Show when no papers exist */}
      {sortedPapers.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No papers available. Add papers using the form above.</p>
        </div>
      )}
    </div>
  );
};

export default DisplayPaperTable;