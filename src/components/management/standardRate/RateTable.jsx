import React, { useState } from "react";
import Button from "../../shared/Button";
import Pagination from "../../shared/Pagination";

const RateTable = ({ rates, onEdit, onDelete, activeGroup }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'group',
    direction: 'asc'
  });
  
  const itemsPerPage = 10;
  
  // Sorting function
  const sortedRates = [...rates].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle dates
    if (sortConfig.key === 'effective') {
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
  const totalPages = Math.ceil(sortedRates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRates.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    const dateObj = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0.00';
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
        <h2 className="text-lg font-medium">
          {activeGroup === "all" ? "ALL STANDARD RATES" : `${activeGroup.toUpperCase()} RATES`}
        </h2>
        <div className="text-sm text-gray-500">
          Showing {Math.min(sortedRates.length, 1 + indexOfFirstItem)}-{Math.min(sortedRates.length, indexOfLastItem)} of {sortedRates.length} items
        </div>
      </div>
      
      {sortedRates.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {activeGroup === "all" 
            ? "No rates found. Add a new rate to get started."
            : `No rates found for group "${activeGroup}". Add a new rate or select a different group.`
          }
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortableHeader label="Group" sortKey="group" />
                  <SortableHeader label="Type" sortKey="type" />
                  <SortableHeader label="Concatenate" sortKey="concatenate" />
                  <SortableHeader label="Rate" sortKey="finalRate" />
                  <SortableHeader label="Effective Date" sortKey="effective" />
                  <th className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((rate) => (
                  <tr key={rate.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{rate.group}</td>
                    <td className="px-4 py-2">{rate.type}</td>
                    <td className="px-4 py-2">{rate.concatenate}</td>
                    <td className="px-4 py-2 font-semibold">{formatCurrency(rate.finalRate)}</td>
                    <td className="px-4 py-2">{formatDate(rate.effective)}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(rate)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(rate.id)}
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

export default RateTable;