import React, { useState } from "react";

const EscrowCard = ({
  estimate,
  estimateNumber,
  onViewDetails,
  onApprove,
  onReject, // New prop for rejection functionality
  // Multi-select props
  isMultiSelectActive = false,
  isSelected = false,
  onSelectToggle = () => {}
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isApproved = estimate.isApproved;
  const isRejected = estimate.isRejected;
  
  // Determine if this estimate can be selected (not approved or rejected)
  const isSelectable = !isApproved && !isRejected;
  
  // Check if this client is eligible for loyalty benefits (B2B client)
  const isLoyaltyEligible = estimate.clientInfo?.clientType === "B2B";

  // ADDED: Format last activity date
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

  // ADDED: Check if this estimate was recently updated (within 24 hours)
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

  // Direct handle approve 
  const handleApprove = (e) => {
    e.stopPropagation();
    if (isApproved || isRejected || isProcessing) return;
    setIsProcessing(true);
    
    onApprove(estimate)
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Direct handle reject with prompt for notes
  const handleReject = (e) => {
    e.stopPropagation();
    if (isApproved || isRejected || isProcessing) return;
    
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User canceled the prompt
    
    if (reason.trim() === "") {
      alert("A rejection reason is required");
      return;
    }
    
    setIsProcessing(true);
    onReject(estimate, reason)
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded-lg p-2.5 bg-white hover:shadow-sm cursor-pointer transition-all ${
        isMultiSelectActive && isSelectable
          ? isSelected 
            ? 'border-blue-500 bg-blue-50 shadow' 
            : 'border-gray-200'
          : isApproved
            ? 'border-green-400 border-l-4' // Green for approved
            : isRejected
            ? 'border-red-400 border-l-4' // Red for rejected
            : 'border-amber-400 border-l-4' // Amber for pending
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          {/* Checkbox for multi-select mode */}
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
            isApproved
              ? "bg-green-100 text-green-700"
              : isRejected
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {isApproved 
              ? "Approved" 
              : isRejected 
              ? "Rejected" 
              : "Pending"}
          </span>

          {/* ADDED: Recently updated indicator */}
          {isRecentlyUpdated() && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              NEW
            </span>
          )}
        </div>
      </div>
      
      {/* Project name */}
      <p className="text-sm text-gray-700 truncate mb-1">
        {estimate?.projectName || "No Project Name"}
      </p>
      
      {/* UPDATED: Info line with last activity */}
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <div className="flex items-center gap-2">
          <span>HSN: {estimate?.jobDetails?.hsnCode || "N/A"}</span>
          {isLoyaltyEligible && (
            <span className="px-1 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
              B2B
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Qty: {estimate?.jobDetails?.quantity || "N/A"}</span>
          {/* ADDED: Last activity indicator */}
          <span className="text-xs text-gray-400" title={`Last activity: ${formatLastActivity()}`}>
            • {formatLastActivity()}
          </span>
        </div>
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

          {!isApproved && !isRejected && (
            <>
              {/* Direct Approve Button */}
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className={`flex-1 p-1 rounded ${
                  isProcessing
                  ? "bg-green-50 text-green-300 cursor-wait"
                  : "bg-green-50 hover:bg-green-100 text-green-600"
                }`}
                title="Approve"
              >
                {isProcessing ? (
                  <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* Direct Reject Button */}
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className={`flex-1 p-1 rounded ${
                  isProcessing
                  ? "bg-red-50 text-red-300 cursor-wait"
                  : "bg-red-50 hover:bg-red-100 text-red-600"
                }`}
                title="Reject"
              >
                {isProcessing ? (
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
            </>
          )}

          {isApproved && (
            <button
              disabled
              className="flex-1 p-1 rounded bg-green-50 text-green-600 cursor-not-allowed"
              title="Approved"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {isRejected && (
            <button
              disabled
              className="flex-1 p-1 rounded bg-red-50 text-red-600 cursor-not-allowed"
              title="Rejected"
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
              {isApproved ? 'Already approved' : 'Already rejected'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EscrowCard;