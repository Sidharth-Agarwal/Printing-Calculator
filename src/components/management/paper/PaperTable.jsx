import React, { useState } from "react";
import Button from "../../shared/Button";
import Pagination from "../../shared/Pagination";
import StatusBadge from "../../shared/StatusBadge";

const PaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'updatedAt',
    direction: 'desc'
  });
  
  const itemsPerPage = 10;
  
  // Sorting function
  const sortedPapers = [...papers].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle dates
    if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
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
  const totalPages = Math.ceil(sortedPapers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPapers.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    const date = timestamp?.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
      
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h2 className="text-lg font-medium">AVAILABLE PAPERS</h2>
        <div className="text-sm text-gray-500">
          Showing {Math.min(sortedPapers.length, 1 + indexOfFirstItem)}-{Math.min(sortedPapers.length, indexOfLastItem)} of {sortedPapers.length} items
        </div>
      </div>
      
      {sortedPapers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No papers found. Add a new paper to get started.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortableHeader label="Date" sortKey="updatedAt" />
                  <SortableHeader label="Paper Name" sortKey="paperName" />
                  <SortableHeader label="Company" sortKey="company" />
                  <SortableHeader label="Paper Type" sortKey="paperType" />
                  <SortableHeader label="GSM" sortKey="gsm" />
                  <SortableHeader label="Price/Sheet" sortKey="pricePerSheet" />
                  <SortableHeader label="Dimensions" sortKey="area" />
                  <SortableHeader label="Final Rate" sortKey="finalRate" />
                  <th className="px-4 py-2 border font-medium text-gray-700 bg-gray-100 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((paper) => (
                  <tr key={paper.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {formatDate(paper.updatedAt)}
                    </td>
                    <td className="px-4 py-2 font-medium">{paper.paperName}</td>
                    <td className="px-4 py-2">{paper.company}</td>
                    <td className="px-4 py-2">
                      {paper.paperType && (
                        <StatusBadge 
                          status={paper.paperType === 'other' ? 'Other' : paper.paperType.charAt(0).toUpperCase() + paper.paperType.slice(1)} 
                          variant="info"
                          size="sm"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">{paper.gsm}</td>
                    <td className="px-4 py-2">₹{parseFloat(paper.pricePerSheet).toFixed(2)}</td>
                    <td className="px-4 py-2">{paper.length} × {paper.breadth} cm</td>
                    <td className="px-4 py-2 font-semibold">₹{parseFloat(paper.finalRate).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPaper(paper)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDeletePaper(paper.id)}
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

export default PaperTable;