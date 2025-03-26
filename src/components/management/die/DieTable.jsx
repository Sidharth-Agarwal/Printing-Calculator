import React, { useState } from "react";
import Button from "../../shared/Button";
import Pagination from "../../shared/Pagination";
import StatusBadge from "../../shared/StatusBadge";

const DieTable = ({ dies, onEditDie, onDeleteDie }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });
  
  const itemsPerPage = 10;
  
  // Sorting function
  const sortedDies = [...dies].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle dates
    if (sortConfig.key === 'timestamp') {
      aValue = a[sortConfig.key]?.seconds ? new Date(a[sortConfig.key].seconds * 1000) : new Date(a[sortConfig.key]);
      bValue = b[sortConfig.key]?.seconds ? new Date(b[sortConfig.key].seconds * 1000) : new Date(b[sortConfig.key]);
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle strings
    const stringA = String(aValue).toLowerCase();
    const stringB = String(bValue).toLowerCase();
    
    if (stringA < stringB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (stringA > stringB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedDies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDies.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
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
        <h2 className="text-lg font-medium">AVAILABLE DIES</h2>
        <div className="text-sm text-gray-500">
          Showing {Math.min(sortedDies.length, 1 + indexOfFirstItem)}-{Math.min(sortedDies.length, indexOfLastItem)} of {sortedDies.length} items
        </div>
      </div>
      
      {sortedDies.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No dies found. Add a new die to get started.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortableHeader label="Job Type" sortKey="jobType" />
                  <SortableHeader label="Type" sortKey="type" />
                  <SortableHeader label="Die Code" sortKey="dieCode" />
                  <SortableHeader label="Frags" sortKey="frags" />
                  <SortableHeader label="Product Size" sortKey="productSizeL" />
                  <SortableHeader label="Die Size" sortKey="dieSizeL" />
                  <SortableHeader label="Price (INR)" sortKey="price" />
                  <th className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left">Image</th>
                  <th className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((die) => (
                  <tr key={die.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <StatusBadge 
                        status={die.jobType} 
                        variant="info"
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2">{die.type}</td>
                    <td className="px-4 py-2 font-medium">{die.dieCode}</td>
                    <td className="px-4 py-2">{die.frags}</td>
                    <td className="px-4 py-2">{die.productSizeL} × {die.productSizeB} in</td>
                    <td className="px-4 py-2">{die.dieSizeL} × {die.dieSizeB} in</td>
                    <td className="px-4 py-2 font-semibold">₹{parseFloat(die.price).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {die.imageUrl ? (
                        <div className="h-12 w-12 rounded overflow-hidden border">
                          <img 
                            src={die.imageUrl} 
                            alt={die.dieCode} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditDie(die)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDeleteDie(die.id)}
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

export default DieTable;