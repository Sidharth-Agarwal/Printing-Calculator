import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { ChevronDown, ChevronUp, Calculator, Package, Layers, Settings, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { useAuth } from "../Login/AuthContext";

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
    paperAndCutting: false,
    production: false,
    postProduction: false,
    wastageAndOverhead: false
  });
  
  const [hasAppliedB2BMarkup, setHasAppliedB2BMarkup] = useState(false);
  const calculationsRef = useRef(null);
  const markupInitializedRef = useRef(false);

  const { userRole } = useAuth(); 
  const isB2BClient = userRole === "b2b";

  // Fetch markup rates with proper priority handling
  useEffect(() => {
    const fetchMarkupRates = async () => {
      setIsLoadingMarkups(true);
      try {
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
        
        fetchedMarkups.sort((a, b) => a.name.localeCompare(b.name));
        
        if (fetchedMarkups.length > 0) {
          setMarkupRates(fetchedMarkups);
          
          if (calculations?.markupType && calculations?.markupPercentage && !markupInitializedRef.current) {
            setSelectedMarkupType(calculations.markupType);
            setMarkupPercentage(parseFloat(calculations.markupPercentage));
            markupInitializedRef.current = true;
            return;
          }
          
          if (isB2BClient && !hasAppliedB2BMarkup) {
            const b2bMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP B2B MERCH");
            if (b2bMarkup) {
              setSelectedMarkupType(b2bMarkup.name);
              setMarkupPercentage(b2bMarkup.percentage);
              setHasAppliedB2BMarkup(true);
              
              if (!calculations?.markupType || calculations.markupType !== b2bMarkup.name) {
                if (onMarkupChange) {
                  onMarkupChange(b2bMarkup.name, b2bMarkup.percentage);
                }
              }
            }
          } else if (!isB2BClient && !markupInitializedRef.current) {
            const timelessMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
            setSelectedMarkupType(timelessMarkup.name);
            setMarkupPercentage(timelessMarkup.percentage);
            markupInitializedRef.current = true;
          }
        }
      } catch (error) {
        console.error("Error fetching markup rates from Firestore:", error);
      } finally {
        setIsLoadingMarkups(false);
      }
    };
    
    fetchMarkupRates();
  }, [isB2BClient, hasAppliedB2BMarkup, onMarkupChange]);

  // Handle calculations updates
  useEffect(() => {
    if (calculationsRef.current === calculations) {
      return;
    }
    
    calculationsRef.current = calculations;
    
    if (calculations && !calculations.error) {
      if (isEditMode && localCalculations && 
          localCalculations.markupType && 
          localCalculations.markupPercentage &&
          (localCalculations.markupType !== calculations.markupType || 
           localCalculations.markupPercentage !== calculations.markupPercentage)) {
        return;
      }
      
      setLocalCalculations(calculations);
      
      if (calculations.markupType && calculations.markupPercentage && !markupInitializedRef.current) {
        setSelectedMarkupType(calculations.markupType);
        setMarkupPercentage(parseFloat(calculations.markupPercentage));
        markupInitializedRef.current = true;
      }
    }
  }, [calculations, isEditMode, localCalculations]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Markup selection handler
  const handleMarkupSelection = (e) => {
    if (isB2BClient) return;
    
    const selectedValue = e.target.value;
    const selectedRate = markupRates.find(rate => rate.name === selectedValue);
    
    if (selectedRate) {
      setSelectedMarkupType(selectedValue);
      setMarkupPercentage(selectedRate.percentage);
      
      const hasValidCalculations = localCalculations && !localCalculations.error;
      
      if (isEditMode && hasValidCalculations) {
        const currentSubtotal = parseFloat(localCalculations.subtotalPerCard || localCalculations.costWithMisc || 0);
        const newMarkupPercentage = selectedRate.percentage;
        const quantity = parseInt(state.orderAndPaper?.quantity || 1);
        const currentGstRate = parseFloat(localCalculations.gstRate || 18);
        
        const newMarkupAmount = currentSubtotal * (newMarkupPercentage / 100);
        const newTotalCostPerCard = currentSubtotal + newMarkupAmount;
        const newTotalCost = newTotalCostPerCard * quantity;
        const newGstAmount = newTotalCost * (currentGstRate / 100);
        const newTotalWithGST = newTotalCost + newGstAmount;
        
        const updatedLocalCalculations = {
          ...localCalculations,
          markupType: selectedValue,
          markupPercentage: newMarkupPercentage,
          markupAmount: newMarkupAmount.toFixed(2),
          totalCostPerCard: newTotalCostPerCard.toFixed(2),
          totalCost: newTotalCost.toFixed(2),
          gstAmount: newGstAmount.toFixed(2),
          totalWithGST: newTotalWithGST.toFixed(2)
        };
        
        setLocalCalculations(updatedLocalCalculations);
      }
      
      if (onMarkupChange) {
        onMarkupChange(selectedValue, selectedRate.percentage);
      }
    }
  };

  // Compact section header component
  const SectionHeader = ({ title, isExpanded, onToggle, icon: Icon, bgColor = "bg-slate-50", count }) => (
    <div 
      className={`flex justify-between items-center p-3 ${bgColor} hover:bg-opacity-80 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-400`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-slate-600" />
        <h3 className="font-medium text-slate-700 text-sm">{title}</h3>
        {count && <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{count}</span>}
      </div>
      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
    </div>
  );

  // Compact collapsible section
  const CollapsibleSection = ({ title, isExpanded, onToggle, children, icon, bgColor, count }) => (
    <div className="border border-slate-200 rounded-lg mb-2 overflow-hidden shadow-sm">
      <SectionHeader 
        title={title} 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
        icon={icon}
        bgColor={bgColor}
        count={count}
      />
      {isExpanded && (
        <div className="p-3 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );

  // Compact cost item row
  const CostItem = ({ label, value, isSubItem = false, isTotal = false, isHighlight = false }) => {
    const formattedValue = parseFloat(value || 0).toFixed(2);
    
    return (
      <div className={`
        flex justify-between items-center py-1.5 px-2 rounded text-sm
        ${isTotal ? 'font-semibold bg-blue-50 border border-blue-100' : 
          isHighlight ? 'font-medium bg-green-50' :
          isSubItem ? 'pl-4 text-slate-600 bg-slate-25' : 'bg-slate-25'}
      `}>
        <span className="truncate pr-2">{label}</span>
        <span className="font-mono whitespace-nowrap">₹{formattedValue}</span>
      </div>
    );
  };

  // Get active service counts for section headers
  const getServiceCounts = () => {
    if (!localCalculations) return {};
    
    const paperCount = (localCalculations.paperCostPerCard ? 1 : 0) + (localCalculations.gilCutCostPerCard ? 1 : 0);
    
    let productionCount = 0;
    if (state.lpDetails?.isLPUsed) productionCount++;
    if (state.fsDetails?.isFSUsed) productionCount++;
    if (state.embDetails?.isEMBUsed) productionCount++;
    if (state.screenPrintDetails?.isScreenPrintUsed || state.screenPrint?.isScreenPrintUsed) productionCount++;
    if (state.digiDetails?.isDigiUsed) productionCount++;
    if (state.orderAndPaper.jobType === "Notebook" && state.notebookDetails?.isNotebookUsed) productionCount++;
    
    let postProductionCount = 0;
    if (state.preDieCutting?.isPreDieCuttingUsed) postProductionCount++;
    if (state.dieCutting?.isDieCuttingUsed) postProductionCount++;
    if (state.postDC?.isPostDCUsed) postProductionCount++;
    if (state.foldAndPaste?.isFoldAndPasteUsed) postProductionCount++;
    if (state.dstPaste?.isDstPasteUsed) postProductionCount++;
    if (state.magnet?.isMagnetUsed) postProductionCount++;
    if (state.qc?.isQCUsed) postProductionCount++;
    if (state.packing?.isPackingUsed) postProductionCount++;
    if (state.misc?.isMiscUsed) postProductionCount++;
    if (state.sandwich?.isSandwichComponentUsed) postProductionCount++;
    
    return { paperCount, productionCount, postProductionCount };
  };

  const serviceCounts = getServiceCounts();

  // Render sections with improved layout
  const renderPaperAndCuttingSection = () => {
    if (!localCalculations || serviceCounts.paperCount === 0) return null;
    
    return (
      <CollapsibleSection
        title="Paper & Cutting"
        isExpanded={expandedSections.paperAndCutting}
        onToggle={() => toggleSection('paperAndCutting')}
        icon={FileText}
        bgColor="bg-blue-50"
        count={serviceCounts.paperCount}
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

  const renderProductionServices = () => {
    if (!localCalculations || serviceCounts.productionCount === 0) return null;
    
    return (
      <CollapsibleSection
        title="Production Services"
        isExpanded={expandedSections.production}
        onToggle={() => toggleSection('production')}
        icon={Settings}
        bgColor="bg-green-50"
        count={serviceCounts.productionCount}
      >
        <div className="space-y-2">
          {/* Compact service rendering with key details only */}
          {state.lpDetails?.isLPUsed && localCalculations.lpCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Letter Press (LP)" value={localCalculations.lpCostPerCard} isTotal />
              <div className="grid grid-cols-2 gap-1 text-xs">
                {localCalculations.lpPlateCostPerCard && <CostItem label="Plate" value={localCalculations.lpPlateCostPerCard} isSubItem />}
                {localCalculations.lpImpressionCostPerCard && <CostItem label="Impression" value={localCalculations.lpImpressionCostPerCard} isSubItem />}
              </div>
            </div>
          )}
          
          {state.fsDetails?.isFSUsed && localCalculations.fsCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Foil Stamping (FS)" value={localCalculations.fsCostPerCard} isTotal />
              <div className="grid grid-cols-2 gap-1 text-xs">
                {localCalculations.fsBlockCostPerCard && <CostItem label="Block" value={localCalculations.fsBlockCostPerCard} isSubItem />}
                {localCalculations.fsFoilCostPerCard && <CostItem label="Foil" value={localCalculations.fsFoilCostPerCard} isSubItem />}
              </div>
            </div>
          )}
          
          {state.embDetails?.isEMBUsed && localCalculations.embCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Embossing (EMB)" value={localCalculations.embCostPerCard} isTotal />
              <div className="grid grid-cols-2 gap-1 text-xs">
                {localCalculations.embPlateCostPerCard && <CostItem label="Plate" value={localCalculations.embPlateCostPerCard} isSubItem />}
                {localCalculations.embImpressionCostPerCard && <CostItem label="Impression" value={localCalculations.embImpressionCostPerCard} isSubItem />}
              </div>
            </div>
          )}
          
          {(state.screenPrintDetails?.isScreenPrintUsed || state.screenPrint?.isScreenPrintUsed) && localCalculations.screenPrintCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Screen Printing" value={localCalculations.screenPrintCostPerCard} isTotal />
              {localCalculations.noOfColors && (
                <div className="text-xs text-slate-500 pl-4">Colors: {localCalculations.noOfColors}</div>
              )}
            </div>
          )}
          
          {state.digiDetails?.isDigiUsed && localCalculations.digiCostPerCard && (
            <CostItem label="Digital Printing" value={localCalculations.digiCostPerCard} isTotal />
          )}
          
          {state.orderAndPaper.jobType === "Notebook" && state.notebookDetails?.isNotebookUsed && localCalculations.notebookCostPerCard && (
            <CostItem label="Notebook" value={localCalculations.notebookCostPerCard} isTotal />
          )}
        </div>
      </CollapsibleSection>
    );
  };

  const renderPostProductionServices = () => {
    if (!localCalculations || serviceCounts.postProductionCount === 0) return null;
    
    return (
      <CollapsibleSection
        title="Post-Production"
        isExpanded={expandedSections.postProduction}
        onToggle={() => toggleSection('postProduction')}
        icon={Package}
        bgColor="bg-purple-50"
        count={serviceCounts.postProductionCount}
      >
        <div className="space-y-1">
          {/* Compact post-production services */}
          {state.preDieCutting?.isPreDieCuttingUsed && localCalculations.preDieCuttingCostPerCard && (
            <CostItem label="Pre Die Cutting" value={localCalculations.preDieCuttingCostPerCard} isTotal />
          )}
          {state.dieCutting?.isDieCuttingUsed && localCalculations.dieCuttingCostPerCard && (
            <CostItem label="Die Cutting" value={localCalculations.dieCuttingCostPerCard} isTotal />
          )}
          {state.postDC?.isPostDCUsed && localCalculations.postDCCostPerCard && (
            <CostItem label="Post Die Cutting" value={localCalculations.postDCCostPerCard} isTotal />
          )}
          {state.foldAndPaste?.isFoldAndPasteUsed && localCalculations.foldAndPasteCostPerCard && (
            <CostItem label="Fold & Paste" value={localCalculations.foldAndPasteCostPerCard} isTotal />
          )}
          {state.dstPaste?.isDstPasteUsed && localCalculations.dstPasteCostPerCard && (
            <CostItem label="DST Paste" value={localCalculations.dstPasteCostPerCard} isTotal />
          )}
          {state.magnet?.isMagnetUsed && localCalculations.magnetCostPerCard && (
            <CostItem label="Magnet" value={localCalculations.magnetCostPerCard} isTotal />
          )}
          {state.qc?.isQCUsed && localCalculations.qcCostPerCard && (
            <CostItem label="Quality Check" value={localCalculations.qcCostPerCard} isTotal />
          )}
          {state.packing?.isPackingUsed && localCalculations.packingCostPerCard && (
            <CostItem label="Packing" value={localCalculations.packingCostPerCard} isTotal />
          )}
          {state.misc?.isMiscUsed && localCalculations.miscCostPerCard && (
            <CostItem label="Miscellaneous" value={localCalculations.miscCostPerCard} isTotal />
          )}
          {state.sandwich?.isSandwichComponentUsed && localCalculations.sandwichCostPerCard && (
            <CostItem label="Duplex/Sandwich" value={localCalculations.sandwichCostPerCard} isTotal />
          )}
        </div>
      </CollapsibleSection>
    );
  };

  const renderWastageAndOverhead = () => {
    if (!localCalculations) return null;
    
    return (
      <CollapsibleSection
        title="Wastage & Overhead"
        isExpanded={expandedSections.wastageAndOverhead}
        onToggle={() => toggleSection('wastageAndOverhead')}
        icon={TrendingUp}
        bgColor="bg-amber-50"
        count={3}
      >
        <div className="space-y-1">
          <CostItem label="Base Cost" value={localCalculations.baseCost} />
          
          {localCalculations.wastagePercentage && (
            <CostItem 
              label={`Wastage (${localCalculations.wastagePercentage}%)`} 
              value={localCalculations.wastageAmount || 0} 
            />
          )}
          
          {localCalculations.overheadPercentage && (
            <CostItem 
              label={`Overhead (${localCalculations.overheadPercentage}%)`} 
              value={localCalculations.overheadAmount || 0} 
            />
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (localCalculations) {
      onCreateEstimate(localCalculations);
    } else {
      onCreateEstimate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Calculator className="text-blue-600" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">Cost Calculation</h2>
      </div>

      {/* Calculation Loading State */}
      {isCalculating ? (
        <div className="bg-white p-6 rounded-lg border border-slate-200 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-slate-600">Calculating costs...</p>
          </div>
        </div>
      ) : localCalculations && !localCalculations.error ? (
        <div className="space-y-4">
          {/* B2B Client Simplified View */}
          {isB2BClient ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" />
                Cost Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-slate-700">Cost per Item:</span>
                  <span className="font-bold text-lg">₹{parseFloat(localCalculations.totalCostPerCard || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-slate-700">
                    Total ({state.orderAndPaper?.quantity || 0} pcs):
                  </span>
                  <span className="font-bold text-xl text-blue-700">₹{parseFloat(localCalculations.totalCost || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-slate-700">GST ({localCalculations.gstRate}%):</span>
                  <span className="font-semibold text-green-600">₹{parseFloat(localCalculations.gstAmount || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border border-green-200">
                  <span className="font-bold text-slate-800">Total with GST:</span>
                  <span className="font-bold text-2xl text-green-700">₹{parseFloat(localCalculations.totalWithGST || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Breakdown Sections */}
              {renderPaperAndCuttingSection()}
              {renderProductionServices()}
              {renderPostProductionServices()}
              {renderWastageAndOverhead()}

              {/* Markup Selection - Compact */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Layers size={16} />
                  Markup Selection
                </h3>
                <div className="flex gap-3">
                  <select
                    onChange={handleMarkupSelection}
                    value={selectedMarkupType}
                    className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoadingMarkups}
                  >
                    <option value="">Select Markup Type</option>
                    {isLoadingMarkups ? (
                      <option disabled>Loading...</option>
                    ) : (
                      markupRates.map(rate => (
                        <option key={rate.id} value={rate.name}>
                          {rate.name.replace('MARKUP ', '')} ({rate.percentage}%)
                        </option>
                      ))
                    )}
                  </select>
                  <div className="w-20 bg-white border border-slate-300 rounded-md p-2 text-center font-bold text-sm">
                    {markupPercentage}%
                  </div>
                </div>
              </div>

              {/* Cost Summary - Compact */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal per Item:</span>
                      <span className="font-mono">₹{parseFloat(localCalculations.subtotalPerCard || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Markup ({markupPercentage}%):</span>
                      <span className="font-mono">₹{parseFloat(localCalculations.markupAmount || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Cost per Item:</span>
                      <span className="font-mono">₹{parseFloat(localCalculations.totalCostPerCard || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total ({state.orderAndPaper?.quantity || 0} pcs):</span>
                      <span className="font-mono text-blue-600">₹{parseFloat(localCalculations.totalCost || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-green-600">
                      <span>GST ({localCalculations.gstRate}%):</span>
                      <span className="font-mono">₹{parseFloat(localCalculations.gstAmount || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-700">
                      <span>Total with GST:</span>
                      <span className="font-mono">₹{parseFloat(localCalculations.totalWithGST || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-600">Please fill in the required fields to calculate costs.</p>
        </div>
      )}

      {/* Submit Button */}
      {!previewMode && (
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            disabled={isSaving || isCalculating}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FileText size={16} />
                {isEditMode ? "Update Estimate" : "Submit Estimate"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
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