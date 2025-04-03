import React from "react";
import { ESTIMATE_STATUS } from "../../constants/statusConstants";
import { formatDate, formatRelativeTime } from "../../utils/formatUtils";

/**
 * Version Info component
 * Displays and manages estimate version information
 */
const VersionInfo = ({ 
  versionInfo, 
  dispatch, 
  isModified = false,
  versionHistory = [],
  onViewHistory = () => {},
  validationErrors = {}
}) => {
  // Handle status change
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    dispatch({
      type: "UPDATE_VERSION_INFO",
      payload: { status: newStatus }
    });
  };

  // Get latest version history entry
  const getLatestHistory = () => {
    if (!versionHistory || versionHistory.length === 0) return null;
    
    return versionHistory.sort((a, b) => {
      // Sort by version in descending order
      return b.version - a.version;
    })[0];
  };

  const latestHistory = getLatestHistory();

  // Status badge with appropriate color
  const getStatusBadge = (status) => {
    let bgColor = "bg-gray-200 text-gray-800"; // Default
    
    switch (status) {
      case ESTIMATE_STATUS.DRAFT:
        bgColor = "bg-gray-200 text-gray-800";
        break;
      case ESTIMATE_STATUS.SENT:
        bgColor = "bg-blue-100 text-blue-800";
        break;
      case ESTIMATE_STATUS.APPROVED:
        bgColor = "bg-green-100 text-green-800";
        break;
      case ESTIMATE_STATUS.REJECTED:
        bgColor = "bg-red-100 text-red-800";
        break;
      case ESTIMATE_STATUS.REVISED:
        bgColor = "bg-purple-100 text-purple-800";
        break;
      case ESTIMATE_STATUS.CONVERTED:
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case ESTIMATE_STATUS.EXPIRED:
        bgColor = "bg-gray-200 text-gray-600";
        break;
      default:
        bgColor = "bg-gray-200 text-gray-800";
    }
    
    return <span className={`${bgColor} px-2 py-1 text-xs rounded-full`}>{status}</span>;
  };

  const statusOptions = () => {
    // Limit options based on current status
    let allowedStatuses = [];
    
    switch (versionInfo.status) {
      case ESTIMATE_STATUS.DRAFT:
        allowedStatuses = [ESTIMATE_STATUS.DRAFT, ESTIMATE_STATUS.SENT];
        break;
      case ESTIMATE_STATUS.SENT:
        allowedStatuses = [ESTIMATE_STATUS.SENT, ESTIMATE_STATUS.APPROVED, ESTIMATE_STATUS.REJECTED, ESTIMATE_STATUS.EXPIRED];
        break;
      case ESTIMATE_STATUS.APPROVED:
        allowedStatuses = [ESTIMATE_STATUS.APPROVED, ESTIMATE_STATUS.CONVERTED];
        break;
      case ESTIMATE_STATUS.REJECTED:
        allowedStatuses = [ESTIMATE_STATUS.REJECTED, ESTIMATE_STATUS.REVISED];
        break;
      case ESTIMATE_STATUS.EXPIRED:
        allowedStatuses = [ESTIMATE_STATUS.EXPIRED, ESTIMATE_STATUS.REVISED];
        break;
      default:
        // Others are terminal states or special cases
        allowedStatuses = [versionInfo.status];
    }
    
    return allowedStatuses.map(status => (
      <option key={status} value={status}>{status}</option>
    ));
  };

  // Only show if we have version info
  if (!versionInfo || (!versionInfo.estimateNumber && !versionInfo.version)) {
    return (
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500">
        New estimate - version info will appear here after creation
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-700">Version Information</h3>
        {isModified && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Modified
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        {/* Estimate Number */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Number</label>
          <div className="font-semibold">
            {versionInfo.estimateNumber || "New Estimate"}
          </div>
        </div>
        
        {/* Version */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {versionInfo.version || 1}
            </span>
            {versionHistory && versionHistory.length > 0 && (
              <button 
                type="button"
                onClick={onViewHistory}
                className="text-blue-600 text-xs hover:underline ml-2"
              >
                View History
              </button>
            )}
          </div>
        </div>
        
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <div className="flex items-center space-x-2">
            {getStatusBadge(versionInfo.status || ESTIMATE_STATUS.DRAFT)}
            
            {/* Only show dropdown if status can be changed */}
            {versionInfo.status && ![ESTIMATE_STATUS.REVISED, ESTIMATE_STATUS.CONVERTED].includes(versionInfo.status) && (
              <select
                value={versionInfo.status}
                onChange={handleStatusChange}
                className={`border text-xs rounded-md p-1 ml-2 ${
                  validationErrors.status ? "border-red-500" : ""
                }`}
              >
                {statusOptions()}
              </select>
            )}
          </div>
          {validationErrors.status && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
          )}
        </div>
      </div>
      
      {/* Latest update info - show if available */}
      {latestHistory && (
        <div className="mt-3 pt-2 border-t text-xs text-gray-500">
          <p>
            <span className="font-medium">Last updated:</span> {
              latestHistory.createdAt ? 
              formatRelativeTime(latestHistory.createdAt) : 
              "Recently"
            } by {latestHistory.createdBy || "Unknown user"}
            {latestHistory.changeNotes && (
              <span className="ml-1"> — "{latestHistory.changeNotes}"</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default VersionInfo;