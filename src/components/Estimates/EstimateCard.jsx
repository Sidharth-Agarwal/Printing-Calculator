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
  // Multi-select props
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
  const isInEscrow = estimate.inEscrow;
  const isApproved = estimate.isApproved;
  const isRejected = estimate.isRejected;
  
  // Determine if this estimate can be selected (not moved, canceled, or in escrow)
  const isSelectable = !isMovedToOrders && !isCanceled && !isInEscrow;
  
  // FIXED: Match exact database values
  const clientType = estimate.clientInfo?.clientType;
  const isB2BClient = clientType === "B2B";
  const isDirectClient = clientType === "DIRECT" || !clientType; // Handle both "DIRECT" and null/undefined
  
  // For backward compatibility
  const isLoyaltyEligible = isB2BClient;

  // Format last activity date
  const formatLastActivity = () => {
    const updatedAt = estimate.updatedAt;
    const createdAt = estimate.createdAt;
    
    // Use updatedAt if available, otherwise createdAt
    const timestamp = updatedAt || createdAt;
    
    if (!timestamp) return "Unknown";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) { // 7 days
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short'
        });
      }
    } catch (error) {
      return "Unknown";
    }
  };

  // Check if this estimate was recently updated (within 24 hours)
  const isRecentlyUpdated = () => {
    const updatedAt = estimate.updatedAt;
    if (!updatedAt) return false;
    
    try {
      const updateDate = new Date(updatedAt);
      const now = new Date();
      const diffInHours = (now - updateDate) / (1000 * 60 * 60);
      return diffInHours < 24;
    } catch (error) {
      return false;
    }
  };
  
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
    if (isMovedToOrders || isCanceled || isInEscrow) return;
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
    if (isMovedToOrders || isCanceled || isInEscrow) return;
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
    if (isMovedToOrders || isInEscrow) return;
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
    if (isMovedToOrders || isCanceled || isInEscrow) {
      alert("Estimates that have been moved to orders, escrow, or canceled cannot be edited.");
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

  // Generate the proper move to orders text based on client type
  const getMoveToOrdersText = () => {
    return isLoyaltyEligible ? "Move to Escrow" : "Move to Orders";
  };

  // Get status badge text - FIXED PRIORITY ORDER
  const getStatusBadgeText = () => {
    // First priority: Check escrow status
    if (isInEscrow) {
      if (isApproved) return "Approved";
      if (isRejected) return "Rejected";
      return "In Escrow";
    }
    
    // Second priority: Check other states
    if (isMovedToOrders) return "Moved";
    if (isCanceled) return "Cancelled";
    return "Pending";
  };

  // Get status badge color - FIXED PRIORITY ORDER
  const getStatusBadgeColor = () => {
    // First priority: Check escrow status
    if (isInEscrow) {
      if (isApproved) return "bg-green-100 text-green-700";
      if (isRejected) return "bg-red-100 text-red-700";
      return "bg-purple-100 text-purple-700";
    }
    
    // Second priority: Check other states
    if (isMovedToOrders) return "bg-green-100 text-green-700";
    if (isCanceled) return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700"; // Pending state color
  };

  // Get card border color
  const getCardBorderClass = () => {
    // Handle multi-select mode first
    if (isMultiSelectActive && isSelectable) {
      return isSelected ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200';
    }
    
    // First priority: Check escrow status
    if (isInEscrow) {
      if (isApproved) return 'border-green-400 border-l-4'; // Green for approved
      if (isRejected) return 'border-red-400 border-l-4'; // Red for rejected
      return 'border-purple-400 border-l-4'; // Purple for in escrow
    }
    
    // Second priority: Check other states
    if (isMovedToOrders) return 'border-green-400 border-l-4'; // Green for moved
    if (isCanceled) return 'border-red-400 border-l-4'; // Red for canceled
    
    // Pending state - amber/yellow border
    return 'border-amber-400 border-l-4'; // Amber for pending
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded-lg p-2 bg-white hover:shadow-sm cursor-pointer transition-all ${getCardBorderClass()}`}
    >
      {/* Header row - More compact */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Checkbox for multi-select mode */}
          {isMultiSelectActive && (
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => isSelectable && onSelectToggle(e.target.checked, estimate.versionId || "1")}
                disabled={!isSelectable}
                className={`h-3.5 w-3.5 rounded ${
                  isSelectable 
                    ? 'text-blue-600 focus:ring-blue-500 cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              />
            </div>
          )}
          
          <h3 className="text-xs font-medium text-gray-800 truncate">
            #{estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown"}
          </h3>
          
          {/* Version badge */}
          <span className="px-1 py-0.5 text-[8px] rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
            V{estimate?.versionId || "1"}
          </span>
          
          {/* Status Badge */}
          <span className={`px-1 py-0.5 text-[10px] rounded-full flex-shrink-0 ${getStatusBadgeColor()}`}>
            {getStatusBadgeText()}
          </span>
        </div>
        
        {/* Quick Actions - Smaller icons */}
        <div className="flex gap-0.5 flex-shrink-0">
          {isAdmin && (
            <button
              onClick={handleDeleteEstimate}
              disabled={isDeleting || isMovedToOrders || isInEscrow}
              className={`p-0.5 rounded ${isDeleting || isMovedToOrders || isInEscrow ? 'opacity-30 cursor-not-allowed text-gray-400' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleDuplicateEstimate}
            disabled={isDuplicating}
            className={`p-0.5 rounded ${isDuplicating ? 'opacity-30 cursor-wait text-gray-400' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
            title="Duplicate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Project name - Smaller text */}
      <p className="text-xs text-gray-700 truncate mb-1">
        {estimate?.projectName || "No Project Name"}
      </p>
      
      {/* Info line with smaller text and more compact layout - FIXED: Show both client types */}
      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px]">HSN: {estimate?.jobDetails?.hsnCode || "N/A"}</span>
          
          {/* Client type tags - FIXED: Handle both "B2B" and "DIRECT" values */}
          {isB2BClient ? (
            <span className="px-1 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">
              B2B
            </span>
          ) : (
            <span className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
              Direct
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
          <span>Qty: {estimate?.jobDetails?.quantity || "N/A"}</span>
          <span className="text-[10px] text-gray-400" title={`Last activity: ${formatLastActivity()}`}>
            • {formatLastActivity()}
          </span>
        </div>
      </div>

      {/* Action Buttons - More compact */}
      {!isMultiSelectActive && (
        <div className="flex gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(estimate);
            }}
            className="flex-1 p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>

          {!isMovedToOrders && !isCanceled && !isInEscrow && (
            <button
              onClick={handleEditEstimate}
              className="flex-1 p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
              title="Edit Estimate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}

          {!isCanceled && !isMovedToOrders && !isInEscrow && (
            <button
              onClick={handleMoveToOrders}
              disabled={isMoving}
              className={`flex-1 p-1 rounded ${
                isMoving
                ? "bg-blue-50 text-blue-500 cursor-wait"
                : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title={getMoveToOrdersText()}
            >
              {isMoving ? (
                <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                  <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              )}
            </button>
          )}

          {!isMovedToOrders && !isCanceled && !isInEscrow && (
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
                <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {isMovedToOrders && !isInEscrow && (
            <button
              disabled
              className="flex-1 p-1 rounded bg-green-50 text-green-600 cursor-not-allowed"
              title="Moved to Orders"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {isCanceled && (
            <button
              disabled
              className="flex-1 p-1 rounded bg-gray-50 text-gray-400 cursor-not-allowed"
              title="Cancelled"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {isInEscrow && (
            <button
              disabled
              className={`flex-1 p-1 rounded ${
                isApproved
                  ? "bg-green-50 text-green-600"
                  : isRejected
                    ? "bg-red-50 text-red-600"
                    : "bg-purple-50 text-purple-600"
              } cursor-not-allowed`}
              title={isApproved ? "Approved" : isRejected ? "Rejected" : "In Escrow"}
            >
              {isApproved ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : isRejected ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Selection indicator for multi-select mode - Smaller text */}
      {isMultiSelectActive && (
        <div className="mt-1 text-center">
          {isSelectable ? (
            <span className={`text-[10px] ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
              {isSelected ? 'Selected' : 'Click to select'}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400">
              {isInEscrow ? 
                (isApproved ? 'Approved' : isRejected ? 'Rejected' : 'In escrow') 
                : isMovedToOrders ? 'Already moved' 
                : 'Cancelled'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EstimateCard;