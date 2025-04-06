import React, { useEffect } from 'react';
import { format } from 'date-fns';

// Component to display die image
const DieImage = ({ imageUrl }) => {
  if (!imageUrl) {
    return (
      <div className="border rounded p-1 h-20 flex items-center justify-center bg-gray-50">
        <div className="text-center text-xs text-gray-500">No image</div>
      </div>
    );
  }

  return (
    <div className="border rounded p-1 bg-white h-20 flex items-center justify-center">
      <img 
        src={imageUrl} 
        alt="Die" 
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'contain'
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
};

// Component to display details for a single estimate
const EstimateDetails = ({ estimate, index }) => {
  // Helper function to calculate cost
  const calculateTotalCost = (estimate) => {
    if (!estimate.calculations) return { perCard: 0, total: 0 };
    
    const relevantFields = [
      'paperAndCuttingCostPerCard', 'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 'digiCostPerCard',
      'pastingCostPerCard'
    ];
    
    const costPerCard = relevantFields.reduce((acc, key) => {
      const value = estimate.calculations[key];
      return acc + (value !== null && value !== undefined && value !== "" ? parseFloat(value) || 0 : 0);
    }, 0);
    
    return {
      perCard: costPerCard,
      total: costPerCard * (parseInt(estimate.jobDetails?.quantity) || 0)
    };
  };

  const costs = calculateTotalCost(estimate);

  return (
    <div className="border rounded p-3 mb-3 bg-gray-50 print:break-inside-avoid">
      <h3 className="text-sm font-bold mb-2 bg-white p-2 rounded border">
        #{index + 1}: {estimate.jobDetails?.jobType || "Unknown"} ({estimate.jobDetails?.quantity || "0"} pcs)
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1 text-xs">
          <div><span className="font-medium">Project:</span> {estimate.projectName || "N/A"}</div>
          <div><span className="font-medium">Paper:</span> {estimate.jobDetails?.paperName || "N/A"}</div>
          <div><span className="font-medium">Provided:</span> {estimate.jobDetails?.paperProvided || "No"}</div>
          <div><span className="font-medium">Die Code:</span> {estimate.dieDetails?.dieCode || "N/A"}</div>
          <div><span className="font-medium">Size:</span> {estimate.dieDetails?.dieSize?.length || "?"} x {estimate.dieDetails?.dieSize?.breadth || "?"}</div>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div><span className="font-medium">Cost per Card:</span> ₹ {costs.perCard.toFixed(2)}</div>
            <div><span className="font-medium">Total Cost:</span> ₹ {costs.total.toFixed(2)}</div>
          </div>
        </div>
        <div>
          <DieImage imageUrl={estimate.dieDetails?.image} />
          
          {/* Processing Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {estimate.lpDetails?.isLPUsed && 
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
            {estimate.fsDetails?.isFSUsed && 
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
            {estimate.embDetails?.isEMBUsed && 
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
            {estimate.digiDetails?.isDigiUsed && 
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
            {estimate.sandwich?.isSandwichComponentUsed && 
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">Sandwich</span>}
            {estimate.pasting?.isPastingUsed && 
              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
          </div>
        </div>
      </div>

      {/* Processing Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* LP Details */}
        {estimate.lpDetails?.isLPUsed && (
          <div className="bg-white p-2 rounded border">
            <h4 className="font-semibold mb-1">LP Details</h4>
            <div><span className="font-medium">Colors:</span> {estimate.lpDetails.noOfColors}</div>
            {estimate.lpDetails.colorDetails && estimate.lpDetails.colorDetails.length > 0 && (
              <div className="mt-1">
                {estimate.lpDetails.colorDetails.map((color, idx) => (
                  <div key={idx} className="bg-blue-50 p-1 rounded my-1">
                    <span className="font-medium">Color {idx + 1}:</span> {color.pantoneType || "N/A"}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FS Details */}
        {estimate.fsDetails?.isFSUsed && (
          <div className="bg-white p-2 rounded border">
            <h4 className="font-semibold mb-1">FS Details</h4>
            <div><span className="font-medium">Type:</span> {estimate.fsDetails.fsType}</div>
            {estimate.fsDetails.foilDetails && estimate.fsDetails.foilDetails.length > 0 && (
              <div className="mt-1">
                {estimate.fsDetails.foilDetails.map((foil, idx) => (
                  <div key={idx} className="bg-yellow-50 p-1 rounded my-1">
                    <span className="font-medium">Foil {idx + 1}:</span> {foil.foilType || "N/A"}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EMB Details */}
        {estimate.embDetails?.isEMBUsed && (
          <div className="bg-white p-2 rounded border">
            <h4 className="font-semibold mb-1">EMB Details</h4>
            <div><span className="font-medium">Size:</span> {estimate.embDetails.plateDimensions?.length} x {estimate.embDetails.plateDimensions?.breadth}</div>
            <div><span className="font-medium">Male Plate:</span> {estimate.embDetails.plateTypeMale}</div>
            <div><span className="font-medium">Female Plate:</span> {estimate.embDetails.plateTypeFemale}</div>
          </div>
        )}

        {/* Digital Details */}
        {estimate.digiDetails?.isDigiUsed && (
          <div className="bg-white p-2 rounded border">
            <h4 className="font-semibold mb-1">Digital Details</h4>
            <div><span className="font-medium">Die:</span> {estimate.digiDetails.digiDie}</div>
            <div><span className="font-medium">Size:</span> {estimate.digiDetails.digiDimensions?.length} x {estimate.digiDetails.digiDimensions?.breadth}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Job Ticket component
const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Group estimates by project name for better organization
  const projectGroups = estimates.reduce((acc, est) => {
    const projectName = est.projectName || "Unnamed Project";
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(est);
    return acc;
  }, {});

  // Calculate total quantity
  const totalQuantity = estimates.reduce((total, est) => {
    return total + (parseInt(est.jobDetails?.quantity) || 0);
  }, 0);

  // Call onRenderComplete when component is done rendering
  useEffect(() => {
    if (onRenderComplete) {
      // Small delay to ensure images have loaded
      const timer = setTimeout(() => {
        onRenderComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onRenderComplete]);

  return (
    <div className="bg-white p-4 max-w-4xl mx-auto print:p-0">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-3 mb-4 print:mb-6">
        <h1 className="text-xl font-bold text-center mb-4">
          JOB TICKET - {clientInfo?.name || "Client"} - Version {version}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Client:</span> {clientInfo?.name || "Unknown Client"}</p>
            <p><span className="font-medium">Client Code:</span> {clientInfo?.clientCode || "N/A"}</p>
            <p><span className="font-medium">Total Estimates:</span> {estimates.length}</p>
          </div>
          <div>
            <p><span className="font-medium">Version:</span> {version}</p>
            <p><span className="font-medium">Total Quantity:</span> {totalQuantity.toLocaleString()} pcs</p>
            <p><span className="font-medium">Date:</span> {formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Estimates by Project */}
      {Object.entries(projectGroups).map(([projectName, projectEstimates]) => (
        <div key={projectName} className="mb-5 print:mb-8">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">
            Project: {projectName}
          </h2>
          <div className="space-y-3">
            {projectEstimates.map((estimate, index) => (
              <EstimateDetails 
                key={estimate.id} 
                estimate={estimate} 
                index={index + 1}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Print Info - Only visible when printing */}
      <div className="hidden print:block text-xs text-gray-400 text-center mt-8">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>Job Ticket - {clientInfo?.name} - Version {version}</p>
      </div>
    </div>
  );
};

export default GroupedJobTicket;