import React, { useState } from "react";

const DisplayMaterialTable = ({ materials, onDelete, onEdit }) => {
  // Sort materials alphabetically by material type
  const sortedMaterials = [...materials].sort((a, b) => 
    (a.materialType || '').localeCompare(b.materialType || '')
  );
  
  // State for expanded rows in mobile view
  const [expandedRows, setExpandedRows] = useState({});
  
  // State for view type (compact or detailed)
  const [viewType, setViewType] = useState('detailed');
  
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
      { name: "Material Type", key: "materialType", width: "w-32" },
      { name: "Material Name", key: "materialName", width: "w-32" },
      { name: "Rate", key: "rate", width: "w-20" },
      { name: "Quantity", key: "quantity", width: "w-20" }
    ],
    size: [
      { name: "Size (L)", key: "sizeL", width: "w-16" },
      { name: "Size (B)", key: "sizeB", width: "w-16" },
      { name: "Area", key: "area", width: "w-20" }
    ],
    cost: [
      { name: "Courier Cost", key: "courier", width: "w-24" },
      { name: "Mark Up", key: "markUp", width: "w-20" },
      { name: "Landed Cost", key: "landedCost", width: "w-24" },
      { name: "Cost/Unit", key: "costPerUnit", width: "w-24" },
      { name: "Final Cost/Unit", key: "finalCostPerUnit", width: "w-28" }
    ]
  };

  // Detailed view - shows all columns with fixed widths
  const renderDetailedView = () => {
    return (
      <div>
        <table className="text-sm w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th colSpan={columnGroups.main.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Material Information
              </th>
              <th colSpan={columnGroups.size.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Dimensions
              </th>
              <th colSpan={columnGroups.cost.length} className="px-2 py-2 border text-center font-medium text-gray-700">
                Cost Information
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-medium text-gray-700 w-20">
                Actions
              </th>
            </tr>
            <tr className="bg-gray-100">
              {/* Main Info Headers */}
              {columnGroups.main.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name.includes(' ') && !col.name.includes('(') ? (
                    <>
                      {col.name.split(' ')[0]} 
                      <br />
                      {col.name.split(' ').slice(1).join(' ')}
                    </>
                  ) : (
                    col.name
                  )}
                </th>
              ))}
              
              {/* Size Headers */}
              {columnGroups.size.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name}
                </th>
              ))}
              
              {/* Cost Headers */}
              {columnGroups.cost.map((col) => (
                <th key={`head-${col.key}`} className={`px-2 py-2 border font-medium text-gray-700 text-left ${col.width}`}>
                  {col.name.includes('/') ? (
                    <>
                      {col.name.split('/')[0]}/
                      <br />
                      {col.name.split('/')[1]}
                    </>
                  ) : col.name.includes(' ') ? (
                    <>
                      {col.name.split(' ')[0]} 
                      <br />
                      {col.name.split(' ').slice(1).join(' ')}
                    </>
                  ) : (
                    col.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <tr key={material.id} className="border-t hover:bg-gray-50">
                {/* Main Info Cells */}
                <td className="px-2 py-2 border truncate">{material.materialType || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.materialName || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.rate || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.quantity || "-"}</td>
                
                {/* Size Cells */}
                <td className="px-2 py-2 border truncate">{material.sizeL || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.sizeB || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.area || "-"}</td>
                
                {/* Cost Cells */}
                <td className="px-2 py-2 border truncate">{material.courier || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.markUp || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.landedCost || "-"}</td>
                <td className="px-2 py-2 border truncate">{material.costPerUnit || "-"}</td>
                <td className="px-2 py-2 border truncate font-medium">{material.finalCostPerUnit || "-"}</td>
                
                {/* Actions Cell */}
                <td className="px-2 py-2 border">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onEdit(material)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(material.id)}
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

  // Compact view - shows only essential columns
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border font-medium text-gray-700">
                Material 
                <br />
                Type
              </th>
              <th className="px-3 py-2 border font-medium text-gray-700">
                Material 
                <br />
                Name
              </th>
              <th className="px-3 py-2 border font-medium text-gray-700">Rate</th>
              <th className="px-3 py-2 border font-medium text-gray-700">
                Size 
                <br />
                (L×B)
              </th>
              <th className="px-3 py-2 border font-medium text-gray-700">
                Final 
                <br />
                Cost/Unit
              </th>
              <th className="px-3 py-2 border font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <React.Fragment key={material.id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 border">{material.materialType || "-"}</td>
                  <td className="px-3 py-2 border">{material.materialName || "-"}</td>
                  <td className="px-3 py-2 border">{material.landedCost || "-"}</td>
                  <td className="px-3 py-2 border">{material.sizeL || "-"}×{material.sizeB || "-"}</td>
                  <td className="px-3 py-2 border font-medium">{material.finalCostPerUnit || "-"}</td>
                  <td className="px-3 py-2 border">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(material)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(material.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => toggleRowExpand(material.id)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        {expandedRows[material.id] ? '▲' : '▼'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows[material.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-3 py-2 border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Quantity:</p>
                          <p>{material.quantity || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Area:</p>
                          <p>{material.area || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Costs:</p>
                          <p>Courier: {material.courier || "-"}</p>
                          <p>Mark Up: {material.markUp || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Pricing:</p>
                          <p>Landed: {material.landedCost || "-"}</p>
                          <p>Per Unit: {material.costPerUnit || "-"}</p>
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

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {sortedMaterials.map((material) => (
          <div key={material.id} className="border rounded shadow-sm">
            {/* Main material information always visible */}
            <div className="p-4 flex flex-wrap justify-between items-center">
              <div className="w-full md:w-1/2 mb-2 md:mb-0">
                <h3 className="font-medium">{material.materialType || "Unknown Type"}</h3>
                <p className="text-sm text-gray-600">{material.materialName || "Unknown"}</p>
              </div>
              <div className="w-full md:w-1/4 mb-2 md:mb-0 text-center">
                <p className="text-sm">Rate: {material.rate || "-"}</p>
                <p className="font-medium">Final: {material.finalCostPerUnit || "-"}</p>
              </div>
              <div className="w-full md:w-1/4 flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(material)}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(material.id)}
                  className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => toggleRowExpand(material.id)}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  {expandedRows[material.id] ? "Hide" : "Details"}
                </button>
              </div>
            </div>
            
            {/* Expandable detailed information */}
            {expandedRows[material.id] && (
              <div className="border-t p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Details</p>
                    <p>Quantity: {material.quantity || "-"}</p>
                    <p>Size: {material.sizeL || "-"} × {material.sizeB || "-"}</p>
                    <p>Area: {material.area || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Costs</p>
                    <p>Courier: {material.courier || "-"}</p>
                    <p>Mark Up: {material.markUp || "-"}</p>
                    <p>Landed: {material.landedCost || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Pricing</p>
                    <p>Cost Per Unit: {material.costPerUnit || "-"}</p>
                    <p>Final Cost Per Unit: {material.finalCostPerUnit || "-"}</p>
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
        <h2 className="text-lg font-medium">Available Materials</h2>
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
      
      {/* Show when no materials exist */}
      {sortedMaterials.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No materials available. Add materials using the form above.</p>
        </div>
      )}
    </div>
  );
};

export default DisplayMaterialTable;