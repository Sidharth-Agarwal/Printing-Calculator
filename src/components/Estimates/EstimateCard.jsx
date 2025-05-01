import React, { useState } from "react";

const EstimateCard = ({
  estimate,
  estimateNumber,
  onViewDetails,
  onMoveToOrders,
  onCancelEstimate,
  onDeleteEstimate,
  isAdmin
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMovedToOrders = estimate.movedToOrders;
  const isCanceled = estimate.isCanceled;
  
  // Check if this client is eligible for loyalty benefits (B2B client)
  const isLoyaltyEligible = estimate.clientInfo?.clientType === "B2B";

  // Handle moving estimate to orders
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

  // Handle cancelling estimate
  const handleCancelEstimate = async (e) => {
    e.stopPropagation();
    if (isMovedToOrders || isCanceled) return;
    
    if (!window.confirm("Are you sure you want to cancel this estimate?")) {
      return;
    }
    
    try {
      setIsCancelling(true);
      await onCancelEstimate(estimate);
    } catch (error) {
      console.error("Error cancelling estimate:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle deleting estimate
  const handleDeleteEstimate = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this estimate? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await onDeleteEstimate(estimate);
    } catch (error) {
      console.error("Error deleting estimate:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(estimate)}
      className="border rounded-md p-2 bg-white transition cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Header with Status Badge and Admin Delete Button */}
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium text-sm text-blue-700">
          #{estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown Job"}
          
          {/* Add loyalty badge for B2B clients */}
          {isLoyaltyEligible && (
            <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
              B2B
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge - Now First */}
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            isMovedToOrders
              ? "bg-green-100 text-green-800"
              : isCanceled
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {isMovedToOrders 
              ? "Moved" 
              : isCanceled 
              ? "Cancelled" 
              : "Pending"}
          </span>
          
          {/* Admin Delete Button - Now Second */}
          {isAdmin && (
            <button
              onClick={handleDeleteEstimate}
              disabled={isDeleting}
              className={`p-1 rounded-full ${isDeleting 
                ? 'bg-red-100 text-red-300 cursor-wait' 
                : 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700'}`}
              title="Delete Estimate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Brief Details */}
      <div className="text-xs text-gray-600 mb-2">
        <div className="flex justify-between">
          <span>Quantity: {estimate?.jobDetails?.quantity || "N/A"}</span>
          <span>Version: {estimate?.versionId || "1"}</span>
        </div>
        <div className="truncate">{estimate?.projectName || "No Project"}</div>
      </div>

      {/* Processing Types */}
      <div className="flex flex-wrap gap-1 mb-2">
        {estimate?.lpDetails?.isLPUsed && 
          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">LP</span>}
        {estimate?.fsDetails?.isFSUsed && 
          <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">FS</span>}
        {estimate?.embDetails?.isEMBUsed && 
          <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">EMB</span>}
        {estimate?.digiDetails?.isDigiUsed && 
          <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">DIGI</span>}
        
        {/* Add loyalty discount badge if available for B2B client */}
        {isLoyaltyEligible && estimate.clientInfo?.loyaltyDiscount > 0 && (
          <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
            {estimate.clientInfo.loyaltyDiscount}% Off
          </span>
        )}
      </div>

      {/* Buttons Section - Horizontal Layout */}
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(estimate);
          }}
          className="text-xs flex-1 px-1 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          View
        </button>

        {!isCanceled && (
          <button
            onClick={handleMoveToOrders}
            disabled={isMovedToOrders || isMoving}
            className={`text-xs flex-1 px-1 py-1 rounded-md flex items-center justify-center ${
              isMovedToOrders
                ? "bg-green-500 text-white cursor-not-allowed"
                : isMoving
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isMovedToOrders ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Moved
              </>
            ) : isMoving ? (
              <>
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Moving
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                  <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
                Order
              </>
            )}
          </button>
        )}

        {!isMovedToOrders && !isCanceled && (
          <button
            onClick={handleCancelEstimate}
            disabled={isCancelling}
            className={`text-xs flex-1 px-1 py-1 rounded-md flex items-center justify-center ${
              isCancelling
                ? "bg-red-400 text-white cursor-wait"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isCancelling ? (
              <>
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cancelling
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </>
            )}
          </button>
        )}

        {isCanceled && (
          <button
            disabled
            className="text-xs flex-1 px-1 py-1 rounded-md bg-gray-400 text-white cursor-not-allowed flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancelled
          </button>
        )}
      </div>
    </div>
  );
};

export default EstimateCard;