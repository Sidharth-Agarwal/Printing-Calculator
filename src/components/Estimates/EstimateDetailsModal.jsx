import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EditEstimateModal from "./EditEstimateModal";

const EstimateDetailsModal = ({ 
  estimate, 
  onClose, 
  onDownloadPdf, 
  isGeneratingPdf,
  estimates = [],
  setEstimatesData,
  groupKey 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const fieldLabels = {
    clientName: "Name of the Client",
    projectName: "Name of the Project",
    date: "Order Date",
    deliveryDate: "Expected Delivery Date",
    jobType: "Job Type",
    quantity: "Quantity",
    paperProvided: "Paper Provided",
    dieCode: "Die Code",
    dieSize: "Die Size",
    dieSelection: "Die Selection",
    paperName: "Paper Name",
    // Main cost fields with clearer labels
    baseCost: "Base Cost",
    miscChargePerCard: "Misc. Charge",
    baseWithMisc: "Base with Misc",
    wastageAmount: "Wastage Cost",
    overheadAmount: "Overhead Cost",
    markupPercentage: "Markup Percentage",
    markupType: "Markup Type",
    markupAmount: "Markup Cost",
    subtotalPerCard: "Subtotal per Card",
    totalCostPerCard: "Total Cost per Card",
    totalCost: "Total Cost (All Units)"
  };

  const handleSaveNewEstimate = async (newEstimateData) => {
    try {
      // Add the new estimate to Firestore
      const docRef = await addDoc(collection(db, "estimates"), newEstimateData);
      
      // Add the new estimate to the local state
      const newEstimate = {
        id: docRef.id,
        ...newEstimateData
      };
      
      // Ensure we have a valid array of estimates
      const currentEstimates = Array.isArray(estimates) ? estimates : [];
      const updatedEstimates = [...currentEstimates, newEstimate];
      
      // Update the estimates data state
      setEstimatesData(prevData => ({
        ...prevData,
        [groupKey]: updatedEstimates
      }));

      setIsEditModalOpen(false);
      alert('New estimate created successfully!');
      
      // Reload the page after Firebase update
      window.location.reload();
    } catch (error) {
      console.error('Error creating new estimate:', error);
      alert('Failed to create new estimate. Please try again.');
    }
  };

  const getLabel = (key) => {
    if (fieldLabels[key]) {
      return fieldLabels[key];
    }
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z])([0-9])/g, "$1 $2")
      .replace(/([0-9])([a-z])/g, "$1 $2")
      .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
      .trim();
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "Not Provided";
    }

    if (key.toLowerCase().includes("date") && value) {
      try {
        const date = new Date(value);
        return date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        return value || "Not Provided";
      }
    }

    if (key === "dieSize" && typeof value === "string") {
      return value === " x " ? "Not Provided" : value;
    }
    
    if (key.toLowerCase() === "image" && value) {
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-36 object-contain border rounded-md"
        />
      );
    }

    return value.toString();
  };

  const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }
    
    // Extract image if it exists for special handling
    const imageData = sectionData.image;
    const filteredData = {...sectionData};
    if (imageData) {
      delete filteredData.image;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(filteredData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
        
        {/* Display die image if present */}
        {imageData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-600 mb-2">Die Image:</h4>
            <div className="flex justify-center">
              {renderValue("image", imageData)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the main cost components section
  const renderMainCostComponents = (calculations) => {
    if (!calculations) return null;

    const mainCostComponents = [
      { key: 'paperAndCuttingCostPerCard', label: 'Paper & Cutting' },
      { key: 'lpCostPerCard', label: 'Letter Press', condition: estimate.lpDetails?.isLPUsed },
      { key: 'fsCostPerCard', label: 'Foil Stamping', condition: estimate.fsDetails?.isFSUsed },
      { key: 'embCostPerCard', label: 'Embossing', condition: estimate.embDetails?.isEMBUsed },
      { key: 'digiCostPerCard', label: 'Digital Printing', condition: estimate.digiDetails?.isDigiUsed },
      { key: 'dieCuttingCostPerCard', label: 'Die Cutting', condition: estimate.dieCutting?.isDieCuttingUsed },
      { key: 'pastingCostPerCard', label: 'Pasting', condition: estimate.pasting?.isPastingUsed },
    ];

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Main Cost Components:</h3>
        <div className="grid grid-cols-3 gap-3 bg-white">
          {mainCostComponents.map(({ key, label, condition }) => {
            // Only show components that are used and have a value > 0
            if (condition !== false && calculations[key] && parseFloat(calculations[key]) > 0) {
              return (
                <div key={key} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                  <span className="font-medium text-gray-600">{label}:</span>
                  <span className="text-gray-800 font-bold">₹ {parseFloat(calculations[key]).toFixed(2)}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  // Render the total cost calculation section
  const renderTotalCostCalculation = (calculations) => {
    if (!calculations) return null;

    // Create an array for the calculation breakdown
    const costCalculationSteps = [
      { key: 'baseCost', label: 'Base Cost per Card' },
      { key: 'miscChargePerCard', label: 'Miscellaneous Charge' },
      { key: 'baseWithMisc', label: 'Base Cost with Misc', isSeparator: true },
      { key: 'wastageAmount', label: 'Wastage (5%)' },
      { key: 'overheadAmount', label: 'Overheads (35%)' },
      { key: 'subtotalPerCard', label: 'Subtotal per Card', isSeparator: true },
      { key: 'markupAmount', label: `Markup (${calculations.markupType || 'Standard'}: ${calculations.markupPercentage || 0}%)`, isHighlighted: true },
      { key: 'totalCostPerCard', label: 'Total Cost per Card', isSeparator: true, isTotal: true }
    ];

    const quantity = parseInt(estimate.jobDetails?.quantity || 0);
    
    return (
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cost Summary</h3>
        
        <div className="space-y-2 mb-4">
          {costCalculationSteps.map(({ key, label, isSeparator, isHighlighted, isTotal }) => {
            const value = calculations[key] !== undefined ? 
              parseFloat(calculations[key] || 0).toFixed(2) : "0.00";
              
            return (
              <div key={key} className={`flex justify-between items-center ${isSeparator ? 'border-t border-gray-300 pt-2 mt-2' : ''}`}>
                <span className={`${isTotal ? 'text-lg font-bold' : 'font-medium'} ${isHighlighted ? 'text-blue-700' : 'text-gray-700'}`}>
                  {label}:
                </span>
                <span className={`${isTotal ? 'text-lg font-bold' : ''} ${isHighlighted ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
                  ₹ {value}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300 mt-4">
          <span className="text-xl font-bold text-gray-800">
            Total Cost ({quantity} pcs):
          </span>
          <span className="text-xl font-bold text-blue-600">
            ₹ {calculations.totalCost ? parseFloat(calculations.totalCost).toFixed(2) : "0.00"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-700">Estimate Details</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Estimate
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-xl"
            >
              ✖
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" id="pdf-content">
          <div className="space-y-6 bg-white">
            {/* Basic Order Information */}
            {estimate && 
              renderSectionInGrid("Order and Client Information", {
                clientName: estimate.clientInfo.name,
                projectName: estimate.projectName,
                date: estimate.date,
                deliveryDate: estimate.deliveryDate,
                jobType: estimate.jobDetails?.jobType,
                quantity: estimate.jobDetails?.quantity,
                paperName: estimate.jobDetails?.paperName,
                dieCode: estimate.dieDetails?.dieCode,
                dieSize: `${estimate.dieDetails?.dieSize?.length || ''} x ${estimate.dieDetails?.dieSize?.breadth || ''}`,
                image: estimate.dieDetails?.image
              })}

            {/* Main Cost Components Section */}
            {estimate.calculations && renderMainCostComponents(estimate.calculations)}

            {/* Total Cost Calculation Section */}
            {estimate.calculations && renderTotalCostCalculation(estimate.calculations)}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditEstimateModal
            estimate={estimate}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveNewEstimate}
            groupKey={groupKey}
            estimates={estimates}
          />
        )}
      </div>
    </div>
  );
};

export default EstimateDetailsModal;