import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { ChevronDown, ChevronUp } from 'lucide-react';

const ReviewAndSubmit = ({ 
  state, 
  calculations, 
  isCalculating, 
  onCreateEstimate, 
  onMarkupChange,
  isEditMode = false,
  previewMode = false,
  isSaving = false
}) => {
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [markupRates, setMarkupRates] = useState([]);
  const [selectedMarkupType, setSelectedMarkupType] = useState("");
  const [isLoadingMarkups, setIsLoadingMarkups] = useState(false);
  const [localCalculations, setLocalCalculations] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    paperAndCutting: true,
    production: false,
    postProduction: false,
    wastageAndOverhead: false
  });

  // Fetch markup rates directly from Firestore overheads collection
  useEffect(() => {
    const fetchMarkupRates = async () => {
      setIsLoadingMarkups(true);
      try {
        // Query the overheads collection for markup entries
        const overheadsCollection = collection(db, "overheads");
        const markupQuery = query(overheadsCollection, where("name", ">=", "MARKUP "), where("name", "<=", "MARKUP" + "\uf8ff"));
        const querySnapshot = await getDocs(markupQuery);
        
        const fetchedMarkups = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetchedMarkups.push({
            id: doc.id,
            name: data.name,
            percentage: parseFloat(data.percentage) || 0
          });
        });
        
        // Sort by name for consistent display
        fetchedMarkups.sort((a, b) => a.name.localeCompare(b.name));
        
        if (fetchedMarkups.length > 0) {
          setMarkupRates(fetchedMarkups);
          
          // Set default markup to MARKUP TIMELESS or first available
          const defaultMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
          setSelectedMarkupType(defaultMarkup.name);
          setMarkupPercentage(defaultMarkup.percentage);
          
          console.log("Fetched markup rates:", fetchedMarkups);
        }
      } catch (error) {
        console.error("Error fetching markup rates from Firestore:", error);
      } finally {
        setIsLoadingMarkups(false);
      }
    };
    
    fetchMarkupRates();
  }, []);

  // Initialize and update calculations
  useEffect(() => {
    if (calculations && !calculations.error) {
      // Update local calculations with the provided ones
      setLocalCalculations(calculations);
      
      // If there's a markupType and markupPercentage in calculations, use those
      if (calculations.markupType) {
        setSelectedMarkupType(calculations.markupType);
      }
      
      if (calculations.markupPercentage) {
        setMarkupPercentage(parseFloat(calculations.markupPercentage));
      }
    }
  }, [calculations]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Markup selection handler
  const handleMarkupSelection = (e) => {
    const selectedValue = e.target.value;
    
    // Find the selected markup in our rates
    const selectedRate = markupRates.find(rate => rate.name === selectedValue);
    
    if (selectedRate) {
      // Update local state
      setSelectedMarkupType(selectedValue);
      setMarkupPercentage(selectedRate.percentage);
      
      // Call the callback to update calculations in parent component
      if (onMarkupChange) {
        onMarkupChange(selectedValue, selectedRate.percentage);
      }
    }
  };

  // Section header component
  const SectionHeader = ({ title, isExpanded, onToggle, bgColor = "bg-gray-50" }) => (
    <div 
      className={`flex justify-between items-center p-3 ${bgColor} rounded-t cursor-pointer`}
      onClick={onToggle}
    >
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  // Collapsible section component
  const CollapsibleSection = ({ title, isExpanded, onToggle, children, bgColor }) => (
    <div className="border rounded-md mb-3 overflow-hidden">
      <SectionHeader 
        title={title} 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
        bgColor={bgColor}
      />
      {isExpanded && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );

  // Cost item row component
  const CostItem = ({ label, value, isSubItem = false, isTotal = false }) => {
    const formattedValue = parseFloat(value || 0).toFixed(2);
    
    return (
      <div className={`
        flex justify-between items-center py-1.5 px-2 rounded 
        ${isTotal ? 'font-bold bg-blue-50' : isSubItem ? 'pl-6 text-sm' : 'bg-white'}
      `}>
        <span>{label}</span>
        <span>₹ {formattedValue}</span>
      </div>
    );
  };

  // Render Paper and Cutting section
  const renderPaperAndCuttingSection = () => {
    if (!localCalculations) return null;
    
    return (
      <CollapsibleSection
        title="Paper and Cutting"
        isExpanded={expandedSections.paperAndCutting}
        onToggle={() => toggleSection('paperAndCutting')}
        bgColor="bg-blue-50"
      >
        <div className="space-y-1">
          {localCalculations.paperCostPerCard && (
            <CostItem label="Paper Cost" value={localCalculations.paperCostPerCard} isSubItem />
          )}
          {localCalculations.gilCutCostPerCard && (
            <CostItem label="Gil Cutting Labor" value={localCalculations.gilCutCostPerCard} isSubItem />
          )}
          {localCalculations.paperAndCuttingCostPerCard && (
            <CostItem 
              label="Total Paper & Cutting" 
              value={localCalculations.paperAndCuttingCostPerCard}
              isTotal
            />
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Production Services section
  const renderProductionServices = () => {
    if (!localCalculations) return null;
    
    const hasLP = state.lpDetails?.isLPUsed;
    const hasFS = state.fsDetails?.isFSUsed;
    const hasEMB = state.embDetails?.isEMBUsed;
    const hasScreenPrint = state.screenPrintDetails?.isScreenPrintUsed || state.screenPrint?.isScreenPrintUsed;
    const hasDigi = state.digiDetails?.isDigiUsed;
    
    if (!hasLP && !hasFS && !hasEMB && !hasScreenPrint && !hasDigi) {
      return null;
    }
    
    return (
      <CollapsibleSection
        title="Production Services"
        isExpanded={expandedSections.production}
        onToggle={() => toggleSection('production')}
        bgColor="bg-green-50"
      >
        <div className="space-y-3">
          {/* LP Section */}
          {hasLP && localCalculations.lpCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Letter Press (LP)" value={localCalculations.lpCostPerCard} isTotal />
              {localCalculations.lpPlateCostPerCard && (
                <CostItem label="LP Plate Cost" value={localCalculations.lpPlateCostPerCard} isSubItem />
              )}
              {localCalculations.lpPositiveFilmCostPerCard && (
                <CostItem label="LP Positive Film" value={localCalculations.lpPositiveFilmCostPerCard} isSubItem />
              )}
              {localCalculations.lpMRCostPerCard && (
                <CostItem label="LP MR Cost" value={localCalculations.lpMRCostPerCard} isSubItem />
              )}
              {localCalculations.lpMkgCostPerCard && (
                <CostItem label="LP Making Cost" value={localCalculations.lpMkgCostPerCard} isSubItem />
              )}
              {localCalculations.lpInkCostPerCard && (
                <CostItem label="LP Ink Cost" value={localCalculations.lpInkCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* FS Section */}
          {hasFS && localCalculations.fsCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Foil Stamping (FS)" value={localCalculations.fsCostPerCard} isTotal />
              {localCalculations.fsBlockCostPerCard && (
                <CostItem label="FS Block Cost" value={localCalculations.fsBlockCostPerCard} isSubItem />
              )}
              {localCalculations.fsFoilCostPerCard && (
                <CostItem label="FS Foil Cost" value={localCalculations.fsFoilCostPerCard} isSubItem />
              )}
              {localCalculations.fsMRCostPerCard && (
                <CostItem label="FS MR Cost" value={localCalculations.fsMRCostPerCard} isSubItem />
              )}
              {localCalculations.fsImpressionCostPerCard && (
                <CostItem label="FS Impression Cost" value={localCalculations.fsImpressionCostPerCard} isSubItem />
              )}
              {localCalculations.fsFreightCostPerCard && (
                <CostItem label="FS Freight Cost" value={localCalculations.fsFreightCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* EMB Section */}
          {hasEMB && localCalculations.embCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Embossing (EMB)" value={localCalculations.embCostPerCard} isTotal />
              {localCalculations.embPlateCostPerCard && (
                <CostItem label="EMB Plate Cost" value={localCalculations.embPlateCostPerCard} isSubItem />
              )}
              {localCalculations.embMRCostPerCard && (
                <CostItem label="EMB MR Cost" value={localCalculations.embMRCostPerCard} isSubItem />
              )}
              {localCalculations.embPositiveFilmCostPerCard && (
                <CostItem label="EMB Positive Film" value={localCalculations.embPositiveFilmCostPerCard} isSubItem />
              )}
              {localCalculations.embMkgPlateCostPerCard && (
                <CostItem label="EMB Making Plate" value={localCalculations.embMkgPlateCostPerCard} isSubItem />
              )}
              {localCalculations.embImpressionCostPerCard && (
                <CostItem label="EMB Impression" value={localCalculations.embImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Screen Print Section */}
          {hasScreenPrint && localCalculations.screenPrintCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Screen Printing" value={localCalculations.screenPrintCostPerCard} isTotal />
              {localCalculations.screenPrintPerPieceCost && (
                <CostItem label="Screen Print Per Piece" value={localCalculations.screenPrintPerPieceCost} isSubItem />
              )}
              {localCalculations.screenPrintBaseCostPerCard && (
                <CostItem label="Screen Print Base Cost" value={localCalculations.screenPrintBaseCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Digital Printing Section */}
          {hasDigi && localCalculations.digiCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Digital Printing" value={localCalculations.digiCostPerCard} isTotal />
              {localCalculations.digiPrintCostPerCard && (
                <CostItem label="Digital Print Cost" value={localCalculations.digiPrintCostPerCard} isSubItem />
              )}
              {localCalculations.digiPaperCostPerCard && (
                <CostItem label="Digital Paper Cost" value={localCalculations.digiPaperCostPerCard} isSubItem />
              )}
              {localCalculations.digiGilCutCostPerCard && (
                <CostItem label="Digital Gil Cut Cost" value={localCalculations.digiGilCutCostPerCard} isSubItem />
              )}
              {localCalculations.totalFragsPerSheet && (
                <div className="pl-6 text-sm text-gray-600">
                  Fragments per sheet: {localCalculations.totalFragsPerSheet}
                </div>
              )}
              {localCalculations.totalSheets && (
                <div className="pl-6 text-sm text-gray-600">
                  Total sheets: {localCalculations.totalSheets}
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Post-Production Services section
  const renderPostProductionServices = () => {
    if (!localCalculations) return null;
    
    // Check if any post-production services are enabled
    const hasDieCutting = state.dieCutting?.isDieCuttingUsed;
    const hasPostDC = state.postDC?.isPostDCUsed;
    const hasFoldAndPaste = state.foldAndPaste?.isFoldAndPasteUsed;
    const hasDstPaste = state.dstPaste?.isDstPasteUsed;
    const hasQC = state.qc?.isQCUsed;
    const hasPacking = state.packing?.isPackingUsed;
    const hasMisc = state.misc?.isMiscUsed;
    const hasSandwich = state.sandwich?.isSandwichComponentUsed;
    
    if (!hasDieCutting && !hasPostDC && !hasFoldAndPaste && !hasDstPaste && 
        !hasQC && !hasPacking && !hasMisc && !hasSandwich) {
      return null;
    }
    
    return (
      <CollapsibleSection
        title="Post-Production Services"
        isExpanded={expandedSections.postProduction}
        onToggle={() => toggleSection('postProduction')}
        bgColor="bg-purple-50"
      >
        <div className="space-y-3">
          {/* Die Cutting Section */}
          {hasDieCutting && localCalculations.dieCuttingCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Die Cutting" value={localCalculations.dieCuttingCostPerCard} isTotal />
              {localCalculations.dieCuttingMRCostPerCard && (
                <CostItem label="Die Cutting MR Cost" value={localCalculations.dieCuttingMRCostPerCard} isSubItem />
              )}
              {localCalculations.dieCuttingImpressionCostPerCard && (
                <CostItem label="Die Cutting Impression" value={localCalculations.dieCuttingImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Post Die Cutting Section */}
          {hasPostDC && localCalculations.postDCCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Post Die Cutting" value={localCalculations.postDCCostPerCard} isTotal />
              {localCalculations.postDCMRCostPerCard && (
                <CostItem label="Post DC MR Cost" value={localCalculations.postDCMRCostPerCard} isSubItem />
              )}
              {localCalculations.postDCImpressionCostPerCard && (
                <CostItem label="Post DC Impression" value={localCalculations.postDCImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Fold and Paste Section */}
          {hasFoldAndPaste && localCalculations.foldAndPasteCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Fold and Paste" value={localCalculations.foldAndPasteCostPerCard} isTotal />
            </div>
          )}
          
          {/* DST Paste Section */}
          {hasDstPaste && localCalculations.dstPasteCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="DST Paste" value={localCalculations.dstPasteCostPerCard} isTotal />
            </div>
          )}
          
          {/* QC Section */}
          {hasQC && localCalculations.qcCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Quality Check" value={localCalculations.qcCostPerCard} isTotal />
            </div>
          )}
          
          {/* Packing Section */}
          {hasPacking && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Packing" value={localCalculations.packingCostPerCard} isTotal />
              {localCalculations.packingPercentage && (
                <div className="pl-6 text-sm text-gray-600">
                  Packing: {localCalculations.packingPercentage}% of COGS
                </div>
              )}
            </div>
          )}
          
          {/* Misc Section */}
          {hasMisc && localCalculations.miscCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Miscellaneous" value={localCalculations.miscCostPerCard} isTotal />
            </div>
          )}
          
          {/* Sandwich/Duplex Section */}
          {hasSandwich && (
            <div className="space-y-1">
              <CostItem label="Duplex/Sandwich" value={localCalculations.sandwichCostPerCard || 0} isTotal />
              {/* Sandwich-specific LP */}
              {localCalculations.lpCostPerCardSandwich && (
                <CostItem label="Sandwich LP Cost" value={localCalculations.lpCostPerCardSandwich} isSubItem />
              )}
              {/* Sandwich-specific FS */}
              {localCalculations.fsCostPerCardSandwich && (
                <CostItem label="Sandwich FS Cost" value={localCalculations.fsCostPerCardSandwich} isSubItem />
              )}
              {/* Sandwich-specific EMB */}
              {localCalculations.embCostPerCardSandwich && (
                <CostItem label="Sandwich EMB Cost" value={localCalculations.embCostPerCardSandwich} isSubItem />
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Wastage and Overhead section
  const renderWastageAndOverhead = () => {
    if (!localCalculations) return null;
    
    return (
      <CollapsibleSection
        title="Wastage and Overhead"
        isExpanded={expandedSections.wastageAndOverhead}
        onToggle={() => toggleSection('wastageAndOverhead')}
        bgColor="bg-amber-50"
      >
        <div className="space-y-1">
          <CostItem label="Base Cost" value={localCalculations.baseCost} />
          
          {localCalculations.wastagePercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Wastage ({localCalculations.wastagePercentage}%)</span>
              <span>₹ {parseFloat(localCalculations.wastageAmount || 0).toFixed(2)}</span>
            </div>
          )}
          
          {localCalculations.overheadPercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Overhead ({localCalculations.overheadPercentage}%)</span>
              <span>₹ {parseFloat(localCalculations.overheadAmount || 0).toFixed(2)}</span>
            </div>
          )}
          
          <CostItem 
            label="COGS (Cost of Goods Sold)" 
            value={localCalculations.COGS} 
            isTotal
          />
        </div>
      </CollapsibleSection>
    );
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (localCalculations) {
      onCreateEstimate(localCalculations);
    } else {
      onCreateEstimate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Calculation Loading State */}
      {isCalculating ? (
        <div className="bg-white p-4 rounded-md text-center">
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Calculating costs...</p>
          </div>
        </div>
      ) : localCalculations && !localCalculations.error ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
          
          {/* Paper and Cutting Section */}
          {renderPaperAndCuttingSection()}
          
          {/* Production Services Section */}
          {renderProductionServices()}
          
          {/* Post-Production Services Section */}
          {renderPostProductionServices()}
          
          {/* Wastage and Overhead Section */}
          {renderWastageAndOverhead()}

          {/* Markup Selection */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Markup Selection</h3>
            <div className="flex items-center gap-4">
              <div className="w-full">
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
                      <option key={rate.id} value={rate.name}>
                        {rate.name.replace('MARKUP ', '')} ({rate.percentage}%)
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="w-1/3 flex items-center gap-2">
                <div className="border rounded-md p-2 w-full text-lg font-bold bg-gray-100">
                  {markupPercentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="mt-6 bg-gray-50 p-4 rounded-md border">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Subtotal per Card:</span>
                <span className="text-gray-900">
                  ₹ {parseFloat(localCalculations.subtotalPerCard || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
                <span className="font-medium">
                  Markup ({selectedMarkupType.replace('MARKUP ', '')}: {markupPercentage}%):
                </span>
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
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
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
            Unable to fetch calculations. Please fill in the required fields.
          </p>
        </div>
      )}

      {/* Preview Mode Notice */}
      {previewMode ? (
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2 text-yellow-700">
            <p>This is a preview only. Close this preview and submit the form to create the estimate.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors font-medium"
            disabled={isSaving || isCalculating}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEditMode ? "Update Estimate" : "Submit Estimate"
            )}
          </button>
        </div>
      )}
    </form>
  );
};

// PropTypes for type checking
ReviewAndSubmit.propTypes = {
  state: PropTypes.object.isRequired,
  calculations: PropTypes.object,
  isCalculating: PropTypes.bool,
  onCreateEstimate: PropTypes.func.isRequired,
  onMarkupChange: PropTypes.func,
  isEditMode: PropTypes.bool,
  previewMode: PropTypes.bool,
  isSaving: PropTypes.bool
};

export default ReviewAndSubmit;