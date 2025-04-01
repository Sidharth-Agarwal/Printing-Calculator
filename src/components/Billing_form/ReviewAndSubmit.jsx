import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ReviewAndSubmit = ({ 
  state, 
  calculations, 
  isCalculating, 
  onPrevious, 
  onCreateEstimate, 
  isEditMode = false,
  isSaving = false,
  singlePageMode = false
}) => {
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [markupRates, setMarkupRates] = useState([]);
  const [isLoadingMarkups, setIsLoadingMarkups] = useState(false);
  
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
    dcMR: "Die Cutting MR Type"
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

  const handleMarkupChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setMarkupPercentage(Math.max(0, value)); // Only ensure it's not negative
  };
  
  const handleMarkupSelection = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === "custom") {
      // Just enable the input field but don't change the current value
      return;
    }
    
    // Find the selected markup rate from the fetched data
    const selectedRate = markupRates.find(rate => 
      rate.type && rate.type.toLowerCase() === selectedValue.toLowerCase()
    );
    
    if (selectedRate && selectedRate.finalRate) {
      setMarkupPercentage(parseFloat(selectedRate.finalRate));
    } else {
      console.warn(`Markup rate for "${selectedValue}" not found in database`);
    }
  };

  // Render a collapsible cost section with detailed breakdown
  const renderCostSection = (title, isUsed, totalCost, details, showExpanded = false) => {
    if (!isUsed || !calculations) return null;
    
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

  // Calculate total cost per card with wastage, overhead, and markup
  const calculateTotalCostPerCard = (calculations) => {
    if (!calculations) return { totalCost: 0 };
    
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead
    const MISC_CHARGE_PER_CARD = 5; // 5 rupees miscellaneous charge per card

    // Define all cost fields that should be included
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'dieCuttingCostPerCard',
      'pastingCostPerCard'
    ];

    // Calculate base cost per card
    const baseCost = relevantFields.reduce((acc, key) => {
      const value = calculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);

    // Add miscellaneous charge to base cost
    const baseWithMisc = baseCost + MISC_CHARGE_PER_CARD;
    
    // Calculate wastage cost
    const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
    // Calculate cost with wastage and overhead
    const costWithOverhead = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = costWithOverhead * (markupPercentage / 100);
    
    // Return total cost including wastage, overhead, and markup
    return {
      baseCost,
      miscCharge: MISC_CHARGE_PER_CARD,
      baseWithMisc,
      wastageCost,
      overheadCost,
      markupCost,
      totalCost: costWithOverhead + markupCost
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Include the markup percentage and other calculated values in the estimate data
    if (calculations) {
      const costs = calculateTotalCostPerCard(calculations);
      
      // Create an enhanced calculations object with all the cost details
      const enhancedCalculations = {
        ...calculations,
        // Standard cost components
        baseCost: costs.baseCost.toFixed(2),
        miscChargePerCard: costs.miscCharge.toFixed(2),
        baseWithMisc: costs.baseWithMisc.toFixed(2),
        wastagePercentage: 5, // Store the actual percentages used
        wastageAmount: costs.wastageCost.toFixed(2),
        overheadPercentage: 35,
        overheadAmount: costs.overheadCost.toFixed(2),
        
        // Markup information
        markupPercentage: markupPercentage,
        markupAmount: costs.markupCost.toFixed(2),
        
        // Totals
        subtotalPerCard: (costs.baseWithMisc + costs.wastageCost + costs.overheadCost).toFixed(2),
        totalCostPerCard: costs.totalCost.toFixed(2),
        totalCost: (costs.totalCost * (state.orderAndPaper?.quantity || 0)).toFixed(2)
      };
      
      // If using single page mode, handle the submission through the parent component
      onCreateEstimate(enhancedCalculations);
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
      ) : calculations && !calculations.error ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cost Breakdown (per card)</h3>
          
          {/* Paper and Cutting Section */}
          {renderCostSection(
            "Paper and Cutting", 
            true, 
            calculations.paperAndCuttingCostPerCard,
            {
              paperCostPerCard: calculations.paperCostPerCard,
              cuttingCostPerCard: calculations.cuttingCostPerCard,
              gilCutCostPerCard: calculations.gilCutCostPerCard,
              paperAndCuttingCostPerCard: calculations.paperAndCuttingCostPerCard
            },
            true // Always expanded by default
          )}
          
          {/* Letter Press Section */}
          {renderCostSection(
            "Letter Press", 
            state.lpDetails?.isLPUsed, 
            calculations.lpCostPerCard,
            {
              lpPlateCostPerCard: calculations.lpPlateCostPerCard,
              lpMRCostPerCard: calculations.lpMRCostPerCard,
              lpImpressionAndLaborCostPerCard: calculations.lpImpressionAndLaborCostPerCard,
              lpCostPerCard: calculations.lpCostPerCard
            }
          )}
          
          {/* Foil Stamping Section */}
          {renderCostSection(
            "Foil Stamping", 
            state.fsDetails?.isFSUsed, 
            calculations.fsCostPerCard,
            {
              fsBlockCostPerCard: calculations.fsBlockCostPerCard,
              fsFoilCostPerCard: calculations.fsFoilCostPerCard,
              fsMRCostPerCard: calculations.fsMRCostPerCard,
              fsImpressionCostPerCard: calculations.fsImpressionCostPerCard,
              fsCostPerCard: calculations.fsCostPerCard
            }
          )}
          
          {/* Embossing Section */}
          {renderCostSection(
            "Embossing", 
            state.embDetails?.isEMBUsed, 
            calculations.embCostPerCard,
            {
              embPlateCostPerCard: calculations.embPlateCostPerCard,
              embMRCostPerCard: calculations.embMRCostPerCard,
              embCostPerCard: calculations.embCostPerCard
            }
          )}
          
          {/* Die Cutting Section */}
          {renderCostSection(
            "Die Cutting", 
            state.dieCutting?.isDieCuttingUsed, 
            calculations.dieCuttingCostPerCard,
            {
              dcImpressionCostPerCard: calculations.dcImpressionCostPerCard,
              dcMRCostPerCard: calculations.dcMRCostPerCard,
              pdcCostPerCard: calculations.pdcCostPerCard,
              dieCuttingCostPerCard: calculations.dieCuttingCostPerCard
            }
          )}
          
          {/* Digital Printing Section */}
          {renderCostSection(
            "Digital Printing", 
            state.digiDetails?.isDigiUsed, 
            calculations.digiCostPerCard,
            {
              digiCostPerCard: calculations.digiCostPerCard
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
                  calculations.lpCostPerCardSandwich,
                  {
                    lpPlateCostPerCardSandwich: calculations.lpPlateCostPerCardSandwich,
                    lpMRCostPerCardSandwich: calculations.lpMRCostPerCardSandwich,
                    lpImpressionAndLaborCostPerCardSandwich: calculations.lpImpressionAndLaborCostPerCardSandwich,
                    lpCostPerCardSandwich: calculations.lpCostPerCardSandwich
                  }
                )}
                
                {/* FS in Sandwich */}
                {renderCostSection(
                  "FS in Sandwich", 
                  state.sandwich.fsDetailsSandwich?.isFSUsed, 
                  calculations.fsCostPerCardSandwich,
                  {
                    fsBlockCostPerCardSandwich: calculations.fsBlockCostPerCardSandwich,
                    fsFoilCostPerCardSandwich: calculations.fsFoilCostPerCardSandwich,
                    fsMRCostPerCardSandwich: calculations.fsMRCostPerCardSandwich,
                    fsImpressionCostPerCardSandwich: calculations.fsImpressionCostPerCardSandwich,
                    fsCostPerCardSandwich: calculations.fsCostPerCardSandwich
                  }
                )}
                
                {/* EMB in Sandwich */}
                {renderCostSection(
                  "EMB in Sandwich", 
                  state.sandwich.embDetailsSandwich?.isEMBUsed, 
                  calculations.embCostPerCardSandwich,
                  {
                    embPlateCostPerCardSandwich: calculations.embPlateCostPerCardSandwich,
                    embMRCostPerCardSandwich: calculations.embMRCostPerCardSandwich,
                    embCostPerCardSandwich: calculations.embCostPerCardSandwich
                  }
                )}
              </div>
            </div>
          )}
          
          {/* Pasting Section */}
          {renderCostSection(
            "Pasting", 
            state.pasting?.isPastingUsed, 
            calculations.pastingCostPerCard,
            {
              pastingCostPerCard: calculations.pastingCostPerCard
            }
          )}

          {/* Markup Selection Field */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('markupSelection')}
            >
              <h3 className="text-md font-semibold text-gray-700">Markup Selection</h3>
              <span className={`transform transition-transform ${expandedSections.markupSelection ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
            
            {(expandedSections.markupSelection || !singlePageMode) && (
              <div className="mt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-1/3">
                    <select
                      id="markupSelection"
                      onChange={handleMarkupSelection}
                      className="border rounded-md p-2 w-full text-md"
                      disabled={isLoadingMarkups}
                    >
                      <option value="">Select Markup Type</option>
                      <option value="custom">Custom</option>
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
                  <div className="w-full md:w-1/3 flex items-center gap-2">
                    <input
                      id="markupPercentage"
                      type="number"
                      step="1"
                      value={markupPercentage}
                      onChange={handleMarkupChange}
                      className="border rounded-md p-2 w-full text-lg font-bold"
                      placeholder="Enter markup %"
                    />
                    <span className="text-lg font-bold">%</span>
                  </div>
                  <span className="text-md text-gray-600">
                    Markup percentage to add to the final price as profit
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Total Calculations */}
          <div 
            className="mt-6 bg-gray-50 p-4 rounded-md border cursor-pointer"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-700">Cost Summary</h3>
              <span className={`transform transition-transform ${expandedSections.summary ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.summary && (
              <>
                {/* Calculate all costs */}
                {(() => {
                  const costs = calculateTotalCostPerCard(calculations);
                  const quantity = state.orderAndPaper?.quantity || 0;
                  
                  return (
                    <>
                      <div className="space-y-2 mt-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Base Cost per Card:</span>
                          <span className="text-gray-900">
                            ₹ {costs.baseCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Miscellaneous Charge:</span>
                          <span className="text-gray-900">
                            ₹ {costs.miscCharge.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Base Cost per card with Misc:</span>
                          <span className="text-gray-900">
                            ₹ {costs.baseWithMisc.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Wastage (5%):</span>
                          <span className="text-gray-900">
                            ₹ {costs.wastageCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Overheads (35%):</span>
                          <span className="text-gray-900">
                            ₹ {costs.overheadCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Subtotal per Card:</span>
                          <span className="text-gray-900">
                            ₹ {(costs.baseWithMisc + costs.wastageCost + costs.overheadCost).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Markup Line */}
                        <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
                          <span className="font-medium">Markup ({markupPercentage}%):</span>
                          <span className="font-medium">
                            ₹ {costs.markupCost.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                          <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                          <span className="text-lg font-bold text-gray-900">
                            ₹ {costs.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                        <span className="text-lg font-bold text-gray-700">
                          Total Cost ({quantity} pcs):
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹ {(costs.totalCost * quantity).toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-md">
          <p className="text-red-600 text-center">
            {calculations?.error || "Unable to fetch calculations. Please fill in the required fields to see cost details."}
          </p>
        </div>
      )}

      {/* Navigation Buttons - Only show in step-by-step mode */}
      {!singlePageMode && (
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
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              'Create Estimate'
            )}
          </button>
        </div>
      )}

      {/* For single page mode - no buttons, submit happens from parent component */}

      {/* Error Message */}
      {calculations?.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error calculating costs:</p>
          <p>{calculations.error}</p>
        </div>
      )}
    </form>
  );
};

export default ReviewAndSubmit;