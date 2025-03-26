import React, { useState } from "react";
import Button from "../../shared/Button";
import Pagination from "../../shared/Pagination";
import StatusBadge from "../../shared/StatusBadge";

const MaterialTable = ({ materials, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'materialType',
    direction: 'asc'
  });
  
  const itemsPerPage = 10;
  
  // Sorting function
  const sortedMaterials = [...materials].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle dates
    if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
      aValue = a[sortConfig.key]?.seconds ? new Date(a[sortConfig.key].seconds * 1000) : new Date(a[sortConfig.key]);
      bValue = b[sortConfig.key]?.seconds ? new Date(b[sortConfig.key].seconds * 1000) : new Date(b[sortConfig.key]);
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle strings
    const stringA = String(aValue || '').toLowerCase();
    const stringB = String(bValue || '').toLowerCase();
    
    if (stringA < stringB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (stringA > stringB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedMaterials.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedMaterials.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '₹0.00';
    return `₹${parseFloat(value).toFixed(2)}`;
  };
  
  // Custom header component with sort functionality
  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left cursor-pointer hover:bg-gray-200"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">AVAILABLE MATERIALS</h2>
        <div className="text-sm text-gray-500">
          Showing {Math.min(sortedMaterials.length, 1 + indexOfFirstItem)}-{Math.min(sortedMaterials.length, indexOfLastItem)} of {sortedMaterials.length} items
        </div>
      </div>
      
      {sortedMaterials.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No materials found. Add a new material to get started.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortableHeader label="Material Type" sortKey="materialType" />
                  <SortableHeader label="Material Name" sortKey="materialName" />
                  <SortableHeader label="Supplier" sortKey="supplier" />
                  <SortableHeader label="Rate" sortKey="rate" />
                  <SortableHeader label="Size" sortKey="area" />
                  <SortableHeader label="Quantity" sortKey="quantity" />
                  <SortableHeader label="Mark Up" sortKey="markUp" />
                  <SortableHeader label="Final Cost/Unit" sortKey="finalCostPerUnit" />
                  <th className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((material) => (
                  <tr key={material.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <StatusBadge 
                        status={material.materialType ? material.materialType.charAt(0).toUpperCase() + material.materialType.slice(1) : 'Other'} 
                        variant="info"
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{material.materialName}</td>
                    <td className="px-4 py-2">{material.supplier || '-'}</td>
                    <td className="px-4 py-2">{formatCurrency(material.rate)}</td>
                    <td className="px-4 py-2">{material.sizeL} × {material.sizeB} cm</td>
                    <td className="px-4 py-2">{material.quantity}</td>
                    <td className="px-4 py-2">{material.markUp}</td>
                    <td className="px-4 py-2 font-semibold">{formatCurrency(material.finalCostPerUnit)}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(material)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(material.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
};

export default MaterialTable;