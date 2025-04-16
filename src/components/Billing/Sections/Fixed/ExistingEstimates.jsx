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

  // NOTE: Cost display is commented out for now
  // Format currency
  /*
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "N/A";
    
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  */

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-md font-semibold mb-3">Existing Estimates in this Version</h3>
      
      {estimates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {estimates.map(estimate => {
            // NOTE: Cost calculation is commented out for now
            /*
            // Extract the total cost if available
            const totalCost = 
              (estimate.calculations?.totalCost) || 
              (estimate.calculations?.totalCostPerCard && estimate.jobDetails?.quantity 
                ? estimate.calculations.totalCostPerCard * estimate.jobDetails.quantity 
                : null);
            */
            
            return (
              <div key={estimate.id} className="px-2 pt-2 bg-gray-50 hover:bg-gray-100 rounded border transition-colors">
                <div className="flex items-start">
                  <h4 className="font-medium text-blue-700 text-sm truncate" title={estimate.projectName}>
                    {estimate.projectName}
                  </h4>
                  {/* Cost display removed */}
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
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No existing estimates found for this version.</p>
          <p className="text-sm text-gray-400 mt-1">Estimates you create will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ExistingEstimates;