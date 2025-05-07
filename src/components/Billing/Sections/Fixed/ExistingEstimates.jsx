import React from "react";

/**
 * ExistingEstimates component displays a grid of estimates for the selected client and version.
 * 
 * @param {Array} estimates - Array of estimate objects from Firebase
 */
const ExistingEstimates = ({ estimates }) => {
  // Format date from Firebase timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Estimates in this Version</h3>
      
      {estimates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {estimates.map(estimate => {
            return (
              <div key={estimate.id} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-red-700 text-sm truncate" title={estimate.projectName}>
                    {estimate.projectName}
                  </h4>
                  <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    #{estimate.id.substring(0, 4)}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mt-1 truncate">
                  Job Type: {estimate.jobDetails?.jobType || "N/A"} | Qty: {(estimate.jobDetails?.quantity || 0).toLocaleString()}
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  Created: {formatDate(estimate.createdAt)}
                </div>
                
                {/* Processing options indicators - horizontal scrollable if needed */}
                <div className="flex flex-wrap gap-1 mt-2 overflow-x-auto max-w-full pb-1">
                  {estimate.lpDetails && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs whitespace-nowrap">LP</span>
                  )}
                  {estimate.fsDetails && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs whitespace-nowrap">FS</span>
                  )}
                  {estimate.embDetails && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs whitespace-nowrap">EMB</span>
                  )}
                  {estimate.digiDetails && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs whitespace-nowrap">DIGI</span>
                  )}
                  {estimate.dieCutting && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs whitespace-nowrap">DC</span>
                  )}
                  {estimate.sandwich && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs whitespace-nowrap">SAND</span>
                  )}
                  {estimate.pasting && (
                    <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs whitespace-nowrap">PASTE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500">No existing estimates found for this version.</p>
          <p className="text-sm text-gray-400 mt-1">Estimates you create will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ExistingEstimates;