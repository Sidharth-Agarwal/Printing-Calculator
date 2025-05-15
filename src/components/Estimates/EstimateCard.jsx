import React, { useState } from "react";

const EstimateCard = ({
  estimate,
  estimateNumber,
  onViewDetails,
  onMoveToOrders,
  onCancelEstimate,
  onDeleteEstimate,
  onEditEstimate,
  onDuplicateEstimate,
  isAdmin,
  // NEW: multi-select props
  isMultiSelectActive = false,
  isSelected = false,
  onSelectToggle = () => {}
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const isMovedToOrders = estimate.movedToOrders;
  const isCanceled = estimate.isCanceled;
  
  // Determine if this estimate can be selected (not moved or canceled)
  const isSelectable = !isMovedToOrders && !isCanceled;
  
  // Check if this client is eligible for loyalty benefits (B2B client)
  const isLoyaltyEligible = estimate.clientInfo?.clientType === "B2B";
  
  // Handle card click - different behavior in multi-select mode
  const handleCardClick = (e) => {
    if (isMultiSelectActive) {
      if (isSelectable) {
        onSelectToggle(!isSelected);
      }
    } else {
      onViewDetails(estimate);
    }
  };
  
  // Action handlers
  const handleMoveToOrders = async (e) => {
    e.stopPropagation();
    if (isMovedToOrders || isCanceled) return;
    try {
      setIsMoving(true);
      await onMoveToOrders(estimate);
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleCancelEstimate = async (e) => {
    e.stopPropagation();
    if (isMovedToOrders || isCanceled) return;
    if (!window.confirm("Cancel this estimate?")) return;
    try {
      setIsCancelling(true);
      await onCancelEstimate(estimate);
    } catch (error) {
      console.error("Error cancelling estimate:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteEstimate = async (e) => {
    e.stopPropagation();
    if (isMovedToOrders) return;
    if (!window.confirm("Delete this estimate? This cannot be undone.")) return;
    try {
      setIsDeleting(true);
      await onDeleteEstimate(estimate);
    } catch (error) {
      console.error("Error deleting estimate:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditEstimate = (e) => {
    e.stopPropagation();
    if (isMovedToOrders || isCanceled) {
      alert("Estimates that have been moved to orders or canceled cannot be edited.");
      return;
    }
    onEditEstimate(estimate);
  };

  const handleDuplicateEstimate = async (e) => {
    e.stopPropagation();
    try {
      setIsDuplicating(true);
      await onDuplicateEstimate(estimate);
    } catch (error) {
      console.error("Error duplicating estimate:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded-lg p-2.5 bg-white hover:shadow-sm cursor-pointer transition-all ${
        isMultiSelectActive && isSelectable
          ? isSelected 
            ? 'border-blue-500 bg-blue-50 shadow' 
            : 'border-gray-200'
          : 'border-gray-200'
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          {/* NEW: Checkbox for multi-select mode */}
          {isMultiSelectActive && (
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => isSelectable && onSelectToggle(e.target.checked, estimate.versionId || "1")}
                disabled={!isSelectable}
                className={`h-4 w-4 rounded ${
                  isSelectable 
                    ? 'text-blue-600 focus:ring-blue-500 cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              />
            </div>
          )}
          
          <h3 className="text-sm font-medium text-gray-800">
            #{estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown"}
          </h3>
          
          {/* Version badge - showing version information in the card */}
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            V{estimate?.versionId || "1"}
          </span>
          
          {/* Status Badge */}
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            isMovedToOrders
              ? "bg-green-100 text-green-700"
              : isCanceled
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {isMovedToOrders 
              ? "Moved" 
              : isCanceled 
              ? "Cancelled" 
              : "Pending"}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-1">
          {isAdmin && (
            <button
              onClick={handleDeleteEstimate}
              disabled={isDeleting || isMovedToOrders}
              className={`text-red-500 ${isDeleting || isMovedToOrders ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-700'}`}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleDuplicateEstimate}
            disabled={isDuplicating}
            className={`text-amber-500 ${isDuplicating ? 'opacity-30 cursor-wait' : 'hover:text-amber-700'}`}
            title="Duplicate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Project name */}
      <p className="text-sm text-gray-700 truncate mb-1">
        {estimate?.projectName || "No Project Name"}
      </p>
      
      {/* Info line */}
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <div className="flex items-center gap-2">
          <span>HSN: {estimate?.jobDetails?.hsnCode || "N/A"}</span>
          {isLoyaltyEligible && (
            <span className="px-1 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
              B2B
            </span>
          )}
        </div>
        <span>Qty: {estimate?.jobDetails?.quantity || "N/A"}</span>
      </div>

      {/* Action Buttons - Hide in multi-select mode to avoid confusion */}
      {!isMultiSelectActive && (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(estimate);
            }}
            className="flex-1 p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>

          {!isMovedToOrders && !isCanceled && (
            <button
              onClick={handleEditEstimate}
              className="flex-1 p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
              title="Edit Estimate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}

          {!isCanceled && (
            <button
              onClick={handleMoveToOrders}
              disabled={isMovedToOrders || isMoving}
              className={`flex-1 p-1 rounded ${
                isMovedToOrders
                  ? "bg-green-50 text-green-600 cursor-not-allowed"
                  : isMoving
                  ? "bg-blue-50 text-blue-500 cursor-wait"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title="Move to Orders"
            >
              {isMoving ? (
                <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                  <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              )}
            </button>
          )}

          {!isMovedToOrders && !isCanceled && (
            <button
              onClick={handleCancelEstimate}
              disabled={isCancelling}
              className={`flex-1 p-1 rounded ${
                isCancelling
                  ? "bg-red-50 text-red-400 cursor-wait"
                  : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
              title="Cancel Estimate"
            >
              {isCancelling ? (
                <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {isCanceled && (
            <button
              disabled
              className="flex-1 p-1 rounded bg-gray-50 text-gray-400 cursor-not-allowed"
              title="Cancelled"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Selection indicator for multi-select mode */}
      {isMultiSelectActive && (
        <div className="mt-1 text-center">
          {isSelectable ? (
            <span className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
              {isSelected ? 'Selected' : 'Click to select'}
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              {isMovedToOrders ? 'Already moved' : 'Cancelled'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EstimateCard;