import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { recalculateTotals } from "./Services/Calculations/enhancedCalculations";

const ReviewAndSubmit = ({ 
  state, 
  calculations, 
  isCalculating, 
  onPrevious, 
  onCreateEstimate, 
  isEditMode = false,
  isSaving = false,
  singlePageMode = false,
  previewMode = false
}) => {
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [markupRates, setMarkupRates] = useState([]);
  const [selectedMarkupType, setSelectedMarkupType] = useState("");
  const [isLoadingMarkups, setIsLoadingMarkups] = useState(false);
  const [miscCharge, setMiscCharge] = useState(5); // Default misc charge is 5 rupees per card
  const [localCalculations, setLocalCalculations] = useState(null);
  
  // Section collapse state for cost details
  const [expandedSections, setExpandedSections] = useState({
    paperAndCutting: true,
    letterPress: false,
    foilStamping: false,
    embossing: false,
    dieCutting: false,
    digital: false,
    sandwich: false,
    pasting: false,
    summary: true
  });
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Initialize calculations with current values and check for existing markup values
  useEffect(() => {
    if (calculations && !calculations.error) {
      // Check if calculations already have markup data (e.g., in edit mode)
      if (calculations.markupPercentage !== undefined && calculations.markupType) {
        setMarkupPercentage(parseFloat(calculations.markupPercentage) || 0);
        setSelectedMarkupType(calculations.markupType);
        console.log("Loaded existing markup data:", {
          type: calculations.markupType,
          percentage: calculations.markupPercentage
        });
      }
      
      // Initialize misc charge if it exists
      if (calculations.miscChargePerCard !== undefined) {
        setMiscCharge(parseFloat(calculations.miscChargePerCard) || 5);
      }
      
      setLocalCalculations(calculations);
    }
  }, [calculations]);
  
  // Update local calculations when misc charge or markup changes
  useEffect(() => {
    if (calculations && !calculations.error) {
      const updatedCalculations = recalculateTotals(
        calculations,
        miscCharge,
        markupPercentage,
        parseInt(state.orderAndPaper?.quantity || 0, 10)
      );
      
      // Explicitly set markup values in local calculations
      setLocalCalculations({
        ...calculations,
        ...updatedCalculations,
        markupType: selectedMarkupType,
        markupPercentage: markupPercentage
      });
      
      // Log updates to verify values
      console.log("Updated calculations with markup:", {
        type: selectedMarkupType,
        percentage: markupPercentage,
        amount: updatedCalculations.markupAmount
      });
    }
  }, [miscCharge, markupPercentage, selectedMarkupType, state.orderAndPaper?.quantity]);
  
  // Fetch markup rates from standard_rates collection
  useEffect(() => {
    const fetchMarkupRates = async () => {
      setIsLoadingMarkups(true);
      try {
        const ratesCollection = collection(db, "standard_rates");
        const querySnapshot = await getDocs(ratesCollection);
        
        // Filter for entries where group is "MARKUP"
        const markupData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(rate => rate.group && rate.group.toUpperCase() === "MARKUP");
        
        setMarkupRates(markupData);
        
        // Only set default markup if no existing markup is present
        if (markupData.length > 0 && !selectedMarkupType) {
          const defaultMarkup = markupData.find(rate => rate.type === "STANDARD") || markupData[0];
          setSelectedMarkupType(defaultMarkup.type);
          setMarkupPercentage(parseFloat(defaultMarkup.finalRate) || 0);
          
          // Log to verify values
          console.log("Set default markup:", {
            type: defaultMarkup.type,
            percentage: parseFloat(defaultMarkup.finalRate)
          });
        }
      } catch (error) {
        console.error("Error fetching markup rates:", error);
      } finally {
        setIsLoadingMarkups(false);
      }
    };
    
    fetchMarkupRates();
  }, []);

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
    image: "Image",
    breadth: "Breadth",
    length: "Length",
    paperName: "Paper Name",
    plateSizeType: "Type of Plate Size",
    noOfColors: "Total number of colors",
    colorDetails: "Color Details of LP",
    mrType: "Type of MR",
    pantoneType: "Type of Pantone",
    plateDimensions: "Dimensions of Plate",
    plateType: "Type of Plate",
    fsType: "Type of FS",
    foilDetails: "Foil Details of FS",
    blockSizeType: "Block size Type",
    blockDimension: "Block Dimensions",
    foilType: "Type of Foil",
    blockType: "Type of Block",
    plateTypeMale: "Male Plate Type",
    plateTypeFemale: "Female Plate Type",
    embMR: "Type of MR",
    digiDie: "Digital Die Selected",
    digiDimensions: "Digital Die Dimensions",
    lpDetailsSandwich: "LP Details in Sandwich",
    fsDetailsSandwich: "FS Details in Sandwich",
    embDetailsSandwich: "EMB Details in Sandwich",
    
    // Paper & Cutting
    paperCostPerCard: "Paper Cost",
    cuttingCostPerCard: "Cutting Cost",
    gilCutCostPerCard: "Gil Cutting Labor",
    paperAndCuttingCostPerCard: "Total Paper & Cutting",
    
    // Letter Press
    lpCostPerCard: "Total LP Cost",
    lpPlateCostPerCard: "LP Plate Cost",
    lpMRCostPerCard: "LP MR Cost",
    lpImpressionAndLaborCostPerCard: "LP Impression & Labor",
    
    // Foil Stamping
    fsCostPerCard: "Total FS Cost",
    fsBlockCostPerCard: "FS Block Cost",
    fsFoilCostPerCard: "FS Foil Cost",
    fsMRCostPerCard: "FS MR Cost",
    fsImpressionCostPerCard: "FS Impression Cost",
    
    // Embossing
    embCostPerCard: "Total EMB Cost",
    embPlateCostPerCard: "EMB Plate Cost",
    embMRCostPerCard: "EMB MR Cost",
    
    // Die Cutting
    dieCuttingCostPerCard: "Total Die Cutting Cost",
    dcImpressionCostPerCard: "DC Impression Cost",
    dcMRCostPerCard: "DC MR Cost",
    pdcCostPerCard: "Pre Die Cutting Cost",
    
    // Digital Printing
    digiCostPerCard: "Digital Print Cost",
    
    // Sandwich Component
    lpCostPerCardSandwich: "LP Cost in Sandwich",
    lpPlateCostPerCardSandwich: "LP Plate Cost in Sandwich",
    lpMRCostPerCardSandwich: "LP MR Cost in Sandwich",
    lpImpressionAndLaborCostPerCardSandwich: "LP Impression & Labor in Sandwich",
    fsCostPerCardSandwich: "FS Cost in Sandwich",
    fsBlockCostPerCardSandwich: "FS Block Cost in Sandwich",
    fsFoilCostPerCardSandwich: "FS Foil Cost in Sandwich",
    fsMRCostPerCardSandwich: "FS MR Cost in Sandwich",
    fsImpressionCostPerCardSandwich: "FS Impression Cost in Sandwich",
    embCostPerCardSandwich: "EMB Cost in Sandwich",
    embPlateCostPerCardSandwich: "EMB Plate Cost in Sandwich",
    embMRCostPerCardSandwich: "EMB MR Cost in Sandwich",
    
    // Pasting
    pastingCostPerCard: "Pasting Cost per Unit",
    pastingType: "Type of Pasting",
    totalPastingCost: "Total Pasting Cost",
    
    // Others
    markupPercentage: "Markup Percentage",
    difficulty: "Die Cut",
    pdc: "Pre Die Cut",
    dcMR: "Die Cutting MR Type",
    miscChargePerCard: "Misc. Charge per Card",
    baseCost: "Base Cost",
    baseWithMisc: "Base with Misc",
    wastageAmount: "Wastage Cost",
    overheadAmount: "Overhead Cost",
    markupAmount: "Markup Cost",
    subtotalPerCard: "Subtotal per Card",
    totalCostPerCard: "Total Cost per Card",
    totalCost: "Total Cost (All Units)"
  };

  const costFieldsOrder = [
    'paperCostPerCard',
    'cuttingCostPerCard',
    'paperAndCuttingCostPerCard',
    'lpCostPerCard',
    'fsCostPerCard',
    'embCostPerCard',
    'lpCostPerCardSandwich',
    'fsCostPerCardSandwich',
    'embCostPerCardSandwich',
    'digiCostPerCard',
    'dieCuttingCostPerCard',
    'pastingCostPerCard',
  ];

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

  const handleMiscChargeChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setMiscCharge(Math.max(0, value)); // Ensure it's not negative
  };
  
  const handleMarkupSelection = (e) => {
    const selectedValue = e.target.value;
    setSelectedMarkupType(selectedValue);
    
    // Find the selected markup rate from the fetched data
    const selectedRate = markupRates.find(rate => 
      rate.type && rate.type.toLowerCase() === selectedValue.toLowerCase()
    );
    
    if (selectedRate && selectedRate.finalRate) {
      setMarkupPercentage(parseFloat(selectedRate.finalRate));
      console.log(`Selected markup: ${selectedValue} (${selectedRate.finalRate}%)`);
    } else {
      console.warn(`Markup rate for "${selectedValue}" not found in database`);
    }
  };

  // Render a collapsible cost section with detailed breakdown
  const renderCostSection = (title, isUsed, totalCost, details, showExpanded = false) => {
    if (!isUsed || !localCalculations) return null;
    
    const sectionKey = title.toLowerCase().replace(/\s+/g, '');
    const isExpanded = expandedSections[sectionKey] || showExpanded;
    
    return (
      <div className="mb-4 border rounded-md overflow-hidden">
        {/* Section Header */}
        <div 
          className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          <h3 className="font-semibold text-gray-700">{title}</h3>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-600">₹ {parseFloat(totalCost || 0).toFixed(2)}</span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {/* Section Details */}
        {isExpanded && (
          <div className="p-3 border-t">
            <ul className="space-y-2">
              {Object.entries(details).map(([key, value]) => {
                // Skip the total cost entry since it's already in the header
                if (key === totalCost) return null;
                
                const costValue = parseFloat(value || 0);
                
                return (
                  <li key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">{fieldLabels[key] || key}</span>
                    <span className="font-medium">₹ {costValue.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pass the complete calculations with all the derived values
    if (localCalculations) {
      // Ensure markup values are explicitly set
      const finalCalculations = {
        ...localCalculations,
        markupPercentage: markupPercentage,
        markupType: selectedMarkupType,
        miscChargePerCard: miscCharge,
        // Recalculate markup amount to ensure consistency
        markupAmount: (
          parseFloat(localCalculations.subtotalPerCard || 0) * 
          (markupPercentage / 100)
        ).toFixed(2)
      };
      
      // Log the final values to verify
      console.log("Final calculations with markup:", {
        markupType: selectedMarkupType,
        markupPercentage: markupPercentage,
        markupAmount: finalCalculations.markupAmount,
        miscCharge: miscCharge
      });
      
      onCreateEstimate(finalCalculations);
    } else {
      onCreateEstimate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cost Calculations Section */}
      {isCalculating ? (
        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Calculating costs...</span>
          </div>
        </div>
      ) : localCalculations && !localCalculations.error ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cost Breakdown (per card)</h3>
          
          {/* Paper and Cutting Section */}
          {renderCostSection(
            "Paper and Cutting", 
            true, 
            localCalculations.paperAndCuttingCostPerCard,
            {
              paperCostPerCard: localCalculations.paperCostPerCard,
              cuttingCostPerCard: localCalculations.cuttingCostPerCard,
              gilCutCostPerCard: localCalculations.gilCutCostPerCard,
              paperAndCuttingCostPerCard: localCalculations.paperAndCuttingCostPerCard
            },
            true // Always expanded by default
          )}
          
          {/* Letter Press Section */}
          {renderCostSection(
            "Letter Press", 
            state.lpDetails?.isLPUsed, 
            localCalculations.lpCostPerCard,
            {
              lpPlateCostPerCard: localCalculations.lpPlateCostPerCard,
              lpMRCostPerCard: localCalculations.lpMRCostPerCard,
              lpImpressionAndLaborCostPerCard: localCalculations.lpImpressionAndLaborCostPerCard,
              lpCostPerCard: localCalculations.lpCostPerCard
            }
          )}
          
          {/* Foil Stamping Section */}
          {renderCostSection(
            "Foil Stamping", 
            state.fsDetails?.isFSUsed, 
            localCalculations.fsCostPerCard,
            {
              fsBlockCostPerCard: localCalculations.fsBlockCostPerCard,
              fsFoilCostPerCard: localCalculations.fsFoilCostPerCard,
              fsMRCostPerCard: localCalculations.fsMRCostPerCard,
              fsImpressionCostPerCard: localCalculations.fsImpressionCostPerCard,
              fsCostPerCard: localCalculations.fsCostPerCard
            }
          )}
          
          {/* Embossing Section */}
          {renderCostSection(
            "Embossing", 
            state.embDetails?.isEMBUsed, 
            localCalculations.embCostPerCard,
            {
              embPlateCostPerCard: localCalculations.embPlateCostPerCard,
              embMRCostPerCard: localCalculations.embMRCostPerCard,
              embCostPerCard: localCalculations.embCostPerCard
            }
          )}
          
          {/* Die Cutting Section */}
          {renderCostSection(
            "Die Cutting", 
            state.dieCutting?.isDieCuttingUsed, 
            localCalculations.dieCuttingCostPerCard,
            {
              dcImpressionCostPerCard: localCalculations.dcImpressionCostPerCard,
              dcMRCostPerCard: localCalculations.dcMRCostPerCard,
              pdcCostPerCard: localCalculations.pdcCostPerCard,
              dieCuttingCostPerCard: localCalculations.dieCuttingCostPerCard
            }
          )}
          
          {/* Digital Printing Section */}
          {renderCostSection(
            "Digital Printing", 
            state.digiDetails?.isDigiUsed, 
            localCalculations.digiCostPerCard,
            {
              digiCostPerCard: localCalculations.digiCostPerCard
            }
          )}
          
          {/* Sandwich Component Section */}
          {state.sandwich?.isSandwichComponentUsed && (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Sandwich Component Costs</h3>
              <div className="space-y-2">
                {/* LP in Sandwich */}
                {renderCostSection(
                  "LP in Sandwich", 
                  state.sandwich.lpDetailsSandwich?.isLPUsed, 
                  localCalculations.lpCostPerCardSandwich,
                  {
                    lpPlateCostPerCardSandwich: localCalculations.lpPlateCostPerCardSandwich,
                    lpMRCostPerCardSandwich: localCalculations.lpMRCostPerCardSandwich,
                    lpImpressionAndLaborCostPerCardSandwich: localCalculations.lpImpressionAndLaborCostPerCardSandwich,
                    lpCostPerCardSandwich: localCalculations.lpCostPerCardSandwich
                  }
                )}
                
                {/* FS in Sandwich */}
                {renderCostSection(
                  "FS in Sandwich", 
                  state.sandwich.fsDetailsSandwich?.isFSUsed, 
                  localCalculations.fsCostPerCardSandwich,
                  {
                    fsBlockCostPerCardSandwich: localCalculations.fsBlockCostPerCardSandwich,
                    fsFoilCostPerCardSandwich: localCalculations.fsFoilCostPerCardSandwich,
                    fsMRCostPerCardSandwich: localCalculations.fsMRCostPerCardSandwich,
                    fsImpressionCostPerCardSandwich: localCalculations.fsImpressionCostPerCardSandwich,
                    fsCostPerCardSandwich: localCalculations.fsCostPerCardSandwich
                  }
                )}
                
                {/* EMB in Sandwich */}
                {renderCostSection(
                  "EMB in Sandwich", 
                  state.sandwich.embDetailsSandwich?.isEMBUsed, 
                  localCalculations.embCostPerCardSandwich,
                  {
                    embPlateCostPerCardSandwich: localCalculations.embPlateCostPerCardSandwich,
                    embMRCostPerCardSandwich: localCalculations.embMRCostPerCardSandwich,
                    embCostPerCardSandwich: localCalculations.embCostPerCardSandwich
                  }
                )}
              </div>
            </div>
          )}
          
          {/* Pasting Section */}
          {renderCostSection(
            "Pasting", 
            state.pasting?.isPastingUsed, 
            localCalculations.pastingCostPerCard,
            {
              pastingCostPerCard: localCalculations.pastingCostPerCard
            }
          )}

          {/* Miscellaneous Charge Field - Always expanded */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Miscellaneous Charge</h3>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-1/3 flex items-center gap-2">
                <label htmlFor="miscCharge" className="whitespace-nowrap">
                  Misc. Charge per Card:
                </label>
                <div className="flex items-center w-full">
                  <span className="text-lg font-bold px-2">₹</span>
                  <input
                    id="miscCharge"
                    type="number"
                    step="0.01"
                    value={miscCharge}
                    onChange={handleMiscChargeChange}
                    className="border rounded-md p-2 w-full text-lg font-bold"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <span className="text-md text-gray-600">
                Additional charge per card for miscellaneous expenses
              </span>
            </div>
          </div>

          {/* Markup Selection Field - Always expanded */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Markup Selection</h3>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-1/2">
                <select
                  id="markupSelection"
                  onChange={handleMarkupSelection}
                  value={selectedMarkupType}
                  className="border rounded-md p-2 w-full text-md"
                  disabled={isLoadingMarkups}
                >
                  <option value="">Select Markup Type</option>
                  {isLoadingMarkups ? (
                    <option disabled>Loading markups...</option>
                  ) : (
                    markupRates.map(rate => (
                      <option key={rate.id} value={rate.type}>
                        {rate.type} ({rate.finalRate}%)
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="w-full md:w-1/2 flex items-center gap-2">
                <div className="border rounded-md p-2 w-full text-lg font-bold bg-gray-100">
                  {markupPercentage}%
                </div>
                <span className="text-md text-gray-600">
                  Applied markup percentage from database
                </span>
              </div>
            </div>
          </div>

          {/* Total Calculations - Always expanded */}
          <div className="mt-6 bg-gray-50 p-4 rounded-md border">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Summary</h3>
            
            {/* Display calculations */}
            <div className="space-y-2 mt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Base Cost per Card:</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.baseCost || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Miscellaneous Charge:</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(miscCharge).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Base Cost per card with Misc:</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.baseWithMisc || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Wastage (5%):</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.wastageAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Overheads (35%):</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.overheadAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Subtotal per Card:</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.subtotalPerCard || 0).toFixed(2)}
                </span>
              </div>
              
              {/* Markup Line */}
              <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
                <span className="font-medium">Markup ({selectedMarkupType}: {markupPercentage}%):</span>
                <span className="font-medium">
                  ₹ {parseFloat(localCalculations.markupAmount || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹ {parseFloat(localCalculations.totalCostPerCard || 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-300">
              <span className="text-lg font-bold text-gray-700">
                Total Cost ({state.orderAndPaper?.quantity || 0} pcs):
              </span>
              <span className="text-xl font-bold text-blue-600">
                ₹ {parseFloat(localCalculations.totalCost || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-md">
          <p className="text-red-600 text-center">
            {localCalculations?.error || calculations?.error || "Unable to fetch calculations. Please fill in the required fields to see cost details."}
          </p>
        </div>
      )}

      {/* Navigation Buttons - Only show in step-by-step mode */}
      {!singlePageMode && !previewMode && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md ${
              isSaving ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'
            } text-white`}
          >
            Previous
          </button>
          
          <button
            type="submit"
            disabled={isSaving || isCalculating}
            className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
              isSaving || isCalculating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white transition-colors duration-200`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : isCalculating ? (
              'Calculating...'
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Submit'
            )}
          </button>
        </div>
      )}

      {/* Submit button hidden when in preview mode */}
      {previewMode && (
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2 text-yellow-700">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>This is a preview only. Close this preview and submit the form to create the estimate.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(localCalculations?.error || calculations?.error) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error calculating costs:</p>
          <p>{localCalculations?.error || calculations?.error}</p>
        </div>
      )}
    </form>
  );
};

export default ReviewAndSubmit;