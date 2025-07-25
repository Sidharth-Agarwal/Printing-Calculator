import React, { useState } from 'react';

const InvoiceCard = ({ 
  order, 
  isSelected,
  onSelect,
  onClick,
  formatDate 
}) => {
  // Stage colors for visual representation
  const stageColors = {
    'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    'Printing': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'Delivery': { bg: 'bg-green-100', text: 'text-green-800' },
    'Completed': { bg: 'bg-green-200', text: 'text-green-900' }
  };

  // Get current stage color
  const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  // Handle checkbox click
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent card click when clicking checkbox
    onSelect(order.id, !isSelected);
  };

  // Flag if order is completed
  const isCompleted = order.stage === 'Completed';

  return (
    <div 
      className={`border rounded-lg p-2.5 transition cursor-pointer shadow-sm hover:shadow-md
        ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
        ${isSelected ? 'ring-2 ring-red-500' : ''}`}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-sm font-medium text-gray-800">
            {order.jobDetails?.jobType || "Unknown Job"}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
          {order.stage}
        </span>
      </div>

      {/* Project name */}
      <p className="text-sm text-gray-700 truncate mb-1">
        {order.projectName || "No Project Name"}
      </p>
      
      {/* Info line */}
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
        <span>Due: {formatDate(order.deliveryDate)}</span>
      </div>

      {/* Processing Types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {order.lpDetails?.isLPUsed && 
          <span className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">LP</span>}
        {order.fsDetails?.isFSUsed && 
          <span className="bg-yellow-50 text-yellow-700 text-xs px-1.5 py-0.5 rounded">FS</span>}
        {order.embDetails?.isEMBUsed && 
          <span className="bg-purple-50 text-purple-700 text-xs px-1.5 py-0.5 rounded">EMB</span>}
        {order.digiDetails?.isDigiUsed && 
          <span className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded">DIGI</span>}
        {order.pasting?.isPastingUsed && 
          <span className="bg-pink-50 text-pink-700 text-xs px-1.5 py-0.5 rounded">Pasting</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1">
        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(order);
          }}
          className="flex-1 p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
          title="View Details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Generate Invoice Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // This would be handled by the parent component through selection
          }}
          className="flex-1 p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600"
          title="Generate Invoice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Generate Job Ticket Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // This would be handled by the parent component through selection
          }}
          className="flex-1 p-1 rounded bg-green-50 hover:bg-green-100 text-green-600"
          title="Generate Job Ticket"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </button>

        {/* Generate Delivery Slip Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // This would be handled by the parent component through selection
          }}
          className="flex-1 p-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-600"
          title="Generate Delivery Slip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.5l2.085-4.17A1 1 0 0014.665 5H11a1 1 0 00-1-1H3zM16 14v-1h-4v-5h2.295l1.405-2.8h-3.7l-.835 1.67A1 1 0 0010.5 7H5v1h5.5l.535-.67h.96v2.67H5V14h1.05a2.5 2.5 0 014.9 0H16z" />
          </svg>
        </button>
      </div>

      {/* Completion Date - only shown if completed */}
      {isCompleted && order.completedAt && (
        <div className="mt-2 text-xs text-gray-500 italic text-center">
          Completed: {formatDate(order.completedAt)}
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;