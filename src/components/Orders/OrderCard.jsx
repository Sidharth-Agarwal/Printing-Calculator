import React, { useState } from 'react';

const OrderCard = ({ 
  order, 
  isSelected,
  onSelect,
  onClick,
  onUpdateStage,
  stages,
  formatDate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Stage colors for visual representation
  const stageColors = {
    'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    'Printing': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'Delivery': { bg: 'bg-green-100', text: 'text-green-800' }
  };

  // Get current stage color
  const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  // Handle checkbox click
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent card click when clicking checkbox
    onSelect(order.id, !isSelected);
  };

  // Handle stage update
  const handleStageUpdate = async (newStage) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStage(order.id, newStage);
    } catch (error) {
      console.error("Error updating stage:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate next and previous stages
  const currentStageIndex = stages.indexOf(order.stage);
  const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;
  const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;

  return (
    <div 
      className={`border rounded-md p-3 bg-white transition cursor-pointer shadow-sm hover:shadow-md
        ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="font-medium text-sm text-blue-700">
            {order.jobDetails?.jobType || "Unknown Job"}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
          {order.stage}
        </span>
      </div>

      {/* Brief Details */}
      <div className="text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
          <span>Due: {formatDate(order.deliveryDate)}</span>
        </div>
        <div>{order.projectName || "No Project"}</div>
        <div>{order.jobDetails?.paperName || "No Paper Specified"}</div>
      </div>

      {/* Processing Types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {order.lpDetails?.isLPUsed && 
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
        {order.fsDetails?.isFSUsed && 
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
        {order.embDetails?.isEMBUsed && 
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
        {order.digiDetails?.isDigiUsed && 
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
        {order.pasting?.isPastingUsed && 
          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
      </div>

      {/* Buttons Section */}
      <div className="space-y-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(order);
          }}
          className="text-xs w-full px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          View Details
        </button>

        {/* Stage Progress Buttons */}
        <div className="flex gap-1">
          {prevStage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStageUpdate(prevStage);
              }}
              disabled={isUpdating}
              className="text-xs flex-1 px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          )}
          
          {nextStage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStageUpdate(nextStage);
              }}
              disabled={isUpdating}
              className="text-xs flex-1 px-2 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  {nextStage}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;