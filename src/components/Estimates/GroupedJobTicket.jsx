import React, { useEffect, useState } from 'react';
import format from 'date-fns/format';

// Component to display die image with error handling
const DieImage = ({ imageUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when imageUrl changes
    setHasError(false);
    setIsLoading(true);
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-xs text-gray-500">
          {hasError ? "Failed to load image" : "No image"}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-1 bg-white h-16 flex items-center justify-center">
      {isLoading && (
        <div className="text-xs text-gray-400">Loading...</div>
      )}
      <img 
        src={imageUrl} 
        alt="Die" 
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

// Safely render a value or provide a fallback
const SafeValue = ({ value, fallback = "N/A" }) => {
  if (value === null || value === undefined || value === "") {
    return <span>{fallback}</span>;
  }
  return <span>{value}</span>;
};

// More compact estimate details component
const EstimateDetails = ({ estimate, index }) => {
  // Helper function to calculate cost with safeguards
  const calculateTotalCost = (estimate) => {
    if (!estimate?.calculations) return { perCard: 0, total: 0 };
    
    const relevantFields = [
      'paperAndCuttingCostPerCard', 'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 'digiCostPerCard',
      'pastingCostPerCard'
    ];
    
    const costPerCard = relevantFields.reduce((acc, key) => {
      const value = estimate.calculations[key];
      const numValue = parseFloat(value);
      return acc + (!isNaN(numValue) ? numValue : 0);
    }, 0);
    
    return {
      perCard: costPerCard,
      total: costPerCard * (parseInt(estimate?.jobDetails?.quantity) || 0)
    };
  };

  // Wrap calculations in try/catch to prevent errors
  let costs = { perCard: 0, total: 0 };
  try {
    costs = calculateTotalCost(estimate);
  } catch (error) {
    console.error("Error calculating costs:", error);
  }

  // Get processing features used in this estimate
  const processingFeatures = [];
  if (estimate?.lpDetails?.isLPUsed) processingFeatures.push("LP");
  if (estimate?.fsDetails?.isFSUsed) processingFeatures.push("FS");
  if (estimate?.embDetails?.isEMBUsed) processingFeatures.push("EMB");
  if (estimate?.digiDetails?.isDigiUsed) processingFeatures.push("DIGI");
  if (estimate?.sandwich?.isSandwichComponentUsed) processingFeatures.push("Sandwich");
  if (estimate?.pasting?.isPastingUsed) processingFeatures.push("Pasting");

  return (
    <div className="border rounded p-2 mb-2 bg-gray-50 print:break-inside-avoid">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold">
          #{index + 1}: <SafeValue value={estimate?.jobDetails?.jobType} fallback="Unknown" /> 
          (<SafeValue value={estimate?.jobDetails?.quantity} fallback="0" /> pcs)
        </h3>
        <div className="text-xs text-gray-500">
          Cost: ₹{costs.perCard.toFixed(2)}/pc
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-1">
        {/* Left column - Basic details */}
        <div className="col-span-2 space-y-1 text-xs">
          <div><span className="font-medium">Project:</span> <SafeValue value={estimate?.projectName} /></div>
          <div><span className="font-medium">Paper:</span> <SafeValue value={estimate?.jobDetails?.paperName} /></div>
          <div><span className="font-medium">Die Code:</span> <SafeValue value={estimate?.dieDetails?.dieCode} /></div>
          <div>
            <span className="font-medium">Size:</span> 
            <SafeValue 
              value={`${estimate?.dieDetails?.dieSize?.length || "?"} x ${estimate?.dieDetails?.dieSize?.breadth || "?"}`} 
              fallback="Not specified"
            />
          </div>

          {/* Processing Features */}
          {processingFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {processingFeatures.map((feature, idx) => {
                let bgColor = "bg-gray-100";
                let textColor = "text-gray-800";
                
                switch(feature) {
                  case "LP": 
                    bgColor = "bg-blue-100"; 
                    textColor = "text-blue-800"; 
                    break;
                  case "FS": 
                    bgColor = "bg-yellow-100"; 
                    textColor = "text-yellow-800"; 
                    break;
                  case "EMB": 
                    bgColor = "bg-purple-100"; 
                    textColor = "text-purple-800"; 
                    break;
                  case "DIGI": 
                    bgColor = "bg-green-100"; 
                    textColor = "text-green-800"; 
                    break;
                  case "Sandwich": 
                    bgColor = "bg-orange-100"; 
                    textColor = "text-orange-800"; 
                    break;
                  case "Pasting": 
                    bgColor = "bg-pink-100"; 
                    textColor = "text-pink-800"; 
                    break;
                }
                
                return (
                  <span 
                    key={idx} 
                    className={`${bgColor} ${textColor} text-xs px-1.5 py-0.5 rounded-full`}
                  >
                    {feature}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Right column - Die image */}
        <div>
          <DieImage imageUrl={estimate?.dieDetails?.image} />
        </div>
      </div>
    </div>
  );
};

// Main Job Ticket component - More compact layout
const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
  // Add state to track rendering status
  const [isReady, setIsReady] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(dateString);
    }
  };

  // Safely group estimates by project name
  const projectGroups = React.useMemo(() => {
    try {
      return (estimates || []).reduce((acc, est) => {
        const projectName = est?.projectName || "Unnamed Project";
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(est);
        return acc;
      }, {});
    } catch (error) {
      console.error("Error grouping by project:", error);
      return { "Error Processing Projects": estimates || [] };
    }
  }, [estimates]);

  // Calculate total quantity
  const totalQuantity = React.useMemo(() => {
    try {
      return (estimates || []).reduce((total, est) => {
        const qty = parseInt(est?.jobDetails?.quantity);
        return total + (isNaN(qty) ? 0 : qty);
      }, 0);
    } catch (error) {
      console.error("Error calculating quantity:", error);
      return 0;
    }
  }, [estimates]);

  // Call onRenderComplete when component is done rendering
  useEffect(() => {
    if (onRenderComplete) {
      // Set a delay to ensure images have loaded
      const timer = setTimeout(() => {
        setIsReady(true);
        onRenderComplete();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [onRenderComplete]);

  return (
    <div className="bg-white p-3 max-w-4xl mx-auto print:p-0">
      {/* Loading indicator */}
      {!isReady && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-center">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p className="text-blue-500 text-sm">Loading job ticket...</p>
          </div>
        </div>
      )}

      <div className={!isReady ? 'opacity-0' : 'opacity-100'}>
        {/* Header - More compact */}
        <div className="border-b-2 border-gray-800 pb-2 mb-3 print:mb-4">
          <h1 className="text-lg font-bold text-center mb-2">
            JOB TICKET - {clientInfo?.name || "Client"} - Version {version}
          </h1>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p><span className="font-medium">Client:</span> <SafeValue value={clientInfo?.name} fallback="Unknown Client" /></p>
              <p><span className="font-medium">Client Code:</span> <SafeValue value={clientInfo?.clientCode} /></p>
              <p><span className="font-medium">Total Estimates:</span> {estimates?.length || 0}</p>
            </div>
            <div>
              <p><span className="font-medium">Version:</span> {version}</p>
              <p><span className="font-medium">Total Quantity:</span> {totalQuantity.toLocaleString()} pcs</p>
              <p><span className="font-medium">Date:</span> {formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Estimates by Project - More compact */}
        {Object.entries(projectGroups).map(([projectName, projectEstimates]) => (
          <div key={projectName} className="mb-3 print:mb-4">
            <h2 className="text-base font-semibold border-b pb-1 mb-2">
              Project: {projectName}
            </h2>
            <div className="space-y-2">
              {projectEstimates.map((estimate, index) => (
                <EstimateDetails 
                  key={estimate?.id || index} 
                  estimate={estimate} 
                  index={index + 1}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Print Info - Only visible when printing */}
        <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
          <p>Generated on: {new Date().toLocaleString()}</p>
          <p>Job Ticket - {clientInfo?.name} - Version {version}</p>
        </div>
      </div>
    </div>
  );
};

export default GroupedJobTicket;