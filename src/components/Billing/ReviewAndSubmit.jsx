import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Calculator, Package, Settings, TrendingUp, FileText, DollarSign, Eye, Percent, Receipt } from 'lucide-react';
import { useAuth } from "../Login/AuthContext";
import { calculateWithPrecision, validateCalculationConsistency } from "../../utils/calculationValidator";
import { getEditModeCalculationsForReview } from "../../utils/editModeCalculationManager";

const ReviewAndSubmit = ({ 
  state, 
  calculations, 
  isCalculating, 
  onCreateEstimate, 
  onPreviewEstimate,
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
  
  const [hasAppliedB2BMarkup, setHasAppliedB2BMarkup] = useState(false);
  const calculationsRef = useRef(null);
  const markupInitializedRef = useRef(false);
  const editModeInitializedRef = useRef(false);
  const editModeMarkupRef = useRef(null);
  const userChangedMarkupRef = useRef(false);
  
  // ENHANCED: Store original base values for edit mode consistency
  const originalCalculationBaseRef = useRef(null);
  const editModeManagerRef = useRef(null);

  const { userRole } = useAuth(); 
  const isB2BClient = userRole === "b2b";

  // Helper function to check if required fields are filled
  const areRequiredFieldsFilled = () => {
    const { orderAndPaper, client } = state;
    
    const hasClient = client?.clientId;
    const hasProjectName = orderAndPaper?.projectName?.trim();
    const hasQuantity = orderAndPaper?.quantity;
    const hasPaperName = orderAndPaper?.paperName?.trim();
    const hasDieCode = orderAndPaper?.dieCode?.trim();
    const hasDieSize = orderAndPaper?.dieSize?.length && orderAndPaper?.dieSize?.breadth;
    
    return hasClient && hasProjectName && hasQuantity && hasPaperName && hasDieCode && hasDieSize;
  };

  const hasValidCalculations = () => {
    return localCalculations && !localCalculations.error && localCalculations.totalWithGST;
  };

  const shouldShowPreviewButton = () => {
    return !isEditMode && areRequiredFieldsFilled() && hasValidCalculations() && !isCalculating;
  };

  // ENHANCED: Markup initialization with improved edit mode handling
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
          
          // ENHANCED: Edit mode initialization with calculation manager
          if (isEditMode && calculations?.markupType && calculations?.markupPercentage && !editModeInitializedRef.current) {
            console.log('🔒 EDIT MODE: Initializing with saved markup values:', {
              markupType: calculations.markupType,
              markupPercentage: calculations.markupPercentage,
              subtotalPerCard: calculations.subtotalPerCard,
              totalCostPerCard: calculations.totalCostPerCard
            });
            
            // Store the original calculation base for consistency
            originalCalculationBaseRef.current = {
              subtotalPerCard: parseFloat(calculations.subtotalPerCard || calculations.costWithMisc || 0),
              markupType: calculations.markupType,
              markupPercentage: parseFloat(calculations.markupPercentage),
              quantity: parseInt(state.orderAndPaper?.quantity || 1),
              gstRate: parseFloat(calculations.gstRate || 18),
              originalCalculations: calculations
            };
            
            editModeMarkupRef.current = {
              markupType: calculations.markupType,
              markupPercentage: parseFloat(calculations.markupPercentage)
            };
            
            setSelectedMarkupType(calculations.markupType);
            setMarkupPercentage(parseFloat(calculations.markupPercentage));
            editModeInitializedRef.current = true;
            markupInitializedRef.current = true;
            return;
          }
          
          // For new estimates
          if (!isEditMode && !markupInitializedRef.current) {
            if (calculations?.markupType && calculations?.markupPercentage) {
              setSelectedMarkupType(calculations.markupType);
              setMarkupPercentage(parseFloat(calculations.markupPercentage));
              markupInitializedRef.current = true;
              return;
            }
            
            // B2B client defaults
            if (isB2BClient && !hasAppliedB2BMarkup) {
              const b2bMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP B2B MERCH");
              if (b2bMarkup) {
                setSelectedMarkupType(b2bMarkup.name);
                setMarkupPercentage(b2bMarkup.percentage);
                setHasAppliedB2BMarkup(true);
                markupInitializedRef.current = true;
                
                if (onMarkupChange) {
                  onMarkupChange(b2bMarkup.name, b2bMarkup.percentage);
                }
              }
            } else if (!isB2BClient) {
              const timelessMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
              setSelectedMarkupType(timelessMarkup.name);
              setMarkupPercentage(timelessMarkup.percentage);
              markupInitializedRef.current = true;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching markup rates from Firestore:", error);
      } finally {
        setIsLoadingMarkups(false);
      }
    };
    
    fetchMarkupRates();
  }, [isB2BClient, hasAppliedB2BMarkup, onMarkupChange, isEditMode, calculations?.markupType, calculations?.markupPercentage]);

  // ENHANCED: Calculations update handling with validation
  useEffect(() => {
    if (calculationsRef.current === calculations) {
      return;
    }
    
    calculationsRef.current = calculations;
    
    if (calculations && !calculations.error) {
      // ENHANCED: Edit mode - preserve EXACT saved values with validation
      if (isEditMode && editModeMarkupRef.current && editModeInitializedRef.current && !userChangedMarkupRef.current) {
        console.log('🔒 Edit mode: Using EXACT saved calculations without modification');
        
        // Validate the saved calculations for consistency
        const validation = validateCalculationConsistency([{
          id: 'edit-mode-validation',
          projectName: state.orderAndPaper?.projectName || 'Edit Mode',
          jobDetails: { quantity: state.orderAndPaper?.quantity },
          calculations: calculations
        }]);
        
        if (validation.hasErrors) {
          console.warn('⚠️ Edit mode: Saved calculations have inconsistencies:', validation.errors);
        } else {
          console.log('✅ Edit mode: Saved calculations are consistent');
        }
        
        setLocalCalculations({
          ...calculations,
          validationStatus: validation.hasErrors ? 'inconsistent' : 'consistent',
          validationErrors: validation.errors
        });
        return;
      }
      
      // New mode: Use calculations as they come with validation
      console.log('📊 New mode: Using calculations as received');
      
      const validation = validateCalculationConsistency([{
        id: 'new-mode-validation',
        projectName: state.orderAndPaper?.projectName || 'New Mode',
        jobDetails: { quantity: state.orderAndPaper?.quantity },
        calculations: calculations
      }]);
      
      setLocalCalculations({
        ...calculations,
        validationStatus: validation.hasErrors ? 'inconsistent' : 'consistent',
        validationErrors: validation.errors
      });
      
      // Set markup from calculations if not already initialized
      if (calculations.markupType && calculations.markupPercentage && !markupInitializedRef.current) {
        setSelectedMarkupType(calculations.markupType);
        setMarkupPercentage(parseFloat(calculations.markupPercentage));
        markupInitializedRef.current = true;
      }
    }
  }, [calculations, isEditMode, state.orderAndPaper?.quantity]);

  // ENHANCED: Markup selection handler with edit mode calculation manager
  const handleMarkupSelection = (e) => {
    const selectedValue = e.target.value;
    const selectedRate = markupRates.find(rate => rate.name === selectedValue);
    
    if (selectedRate) {
      userChangedMarkupRef.current = true;
      
      setSelectedMarkupType(selectedValue);
      setMarkupPercentage(selectedRate.percentage);
      
      // ENHANCED: Use edit mode calculation manager for consistency
      if (isEditMode && localCalculations && !localCalculations.error && originalCalculationBaseRef.current) {
        console.log('🔄 Edit mode markup change - using calculation manager');
        
        const editModeCalculations = getEditModeCalculationsForReview(
          {
            calculations: originalCalculationBaseRef.current.originalCalculations,
            jobDetails: { quantity: state.orderAndPaper?.quantity }
          },
          selectedValue,
          selectedRate.percentage
        );
        
        if (editModeCalculations) {
          // Validate the new calculations
          const validation = validateCalculationConsistency([{
            id: 'edit-markup-change',
            projectName: state.orderAndPaper?.projectName || 'Edit Mode',
            jobDetails: { quantity: parseInt(state.orderAndPaper?.quantity || 1) },
            calculations: editModeCalculations
          }]);
          
          if (!validation.hasErrors) {
            console.log('✅ Edit mode markup calculations validated successfully');
            setLocalCalculations({
              ...editModeCalculations,
              validationStatus: 'consistent',
              validationErrors: []
            });
          } else {
            console.warn('⚠️ Edit mode markup calculation validation failed:', validation.errors);
            // Use the calculations anyway but mark as inconsistent
            setLocalCalculations({
              ...editModeCalculations,
              validationStatus: 'inconsistent',
              validationErrors: validation.errors
            });
          }
        }
      } else if (!isEditMode && localCalculations && !localCalculations.error) {
        // New mode - use precision calculation
        console.log('🔄 New mode markup change - using precision calculation');
        
        const baseSubtotal = parseFloat(localCalculations.subtotalPerCard || localCalculations.costWithMisc || 0);
        const quantity = parseInt(state.orderAndPaper?.quantity || 1);
        const currentGstRate = parseFloat(localCalculations.gstRate || 18);
        
        const preciseCalc = calculateWithPrecision(
          baseSubtotal,
          selectedRate.percentage,
          quantity,
          currentGstRate
        );
        
        const updatedCalculations = {
          ...localCalculations,
          markupType: selectedValue,
          markupPercentage: selectedRate.percentage,
          markupAmount: preciseCalc.markupAmount,
          totalCostPerCard: preciseCalc.totalCostPerCard,
          totalCost: preciseCalc.totalCost,
          gstAmount: preciseCalc.gstAmount,
          totalWithGST: preciseCalc.totalWithGST
        };
        
        // Validate the updated calculations
        const validation = validateCalculationConsistency([{
          id: 'new-markup-change',
          projectName: state.orderAndPaper?.projectName || 'New Mode',
          jobDetails: { quantity: quantity },
          calculations: updatedCalculations
        }]);
        
        setLocalCalculations({
          ...updatedCalculations,
          validationStatus: validation.hasErrors ? 'inconsistent' : 'consistent',
          validationErrors: validation.errors
        });
        
        console.log('✅ New mode markup calculations updated:', {
          validation: validation.hasErrors ? 'Failed' : 'Passed',
          errors: validation.errors
        });
      }
      
      if (onMarkupChange) {
        onMarkupChange(selectedValue, selectedRate.percentage);
      }
    }
  };

  // Reset tracking when mode changes
  useEffect(() => {
    if (!isEditMode) {
      editModeInitializedRef.current = false;
      editModeMarkupRef.current = null;
      userChangedMarkupRef.current = false;
      originalCalculationBaseRef.current = null;
    }
  }, [isEditMode]);

  // Reset refs on unmount
  useEffect(() => {
    return () => {
      markupInitializedRef.current = false;
      editModeInitializedRef.current = false;
      editModeMarkupRef.current = null;
      userChangedMarkupRef.current = false;
      originalCalculationBaseRef.current = null;
    };
  }, []);

  // Compact cost item component
  const CostItem = ({ label, value, isSubItem = false, isTotal = false, isHighlight = false }) => {
    const formattedValue = parseFloat(value || 0).toFixed(2);
    
    return (
      <div className={`
        flex justify-between items-center py-1 px-2 text-sm rounded
        ${isTotal ? 'font-semibold bg-blue-50 border-l-2 border-blue-400' : 
          isHighlight ? 'font-medium bg-green-50 border-l-2 border-green-400' :
          isSubItem ? 'pl-4 text-gray-600 bg-gray-25' : 'bg-white'}
      `}>
        <span className="truncate pr-2">{label}</span>
        <span className="font-mono whitespace-nowrap text-right">₹{formattedValue}</span>
      </div>
    );
  };

  // Section header component
  const SectionHeader = ({ title, icon: Icon, count, totalValue }) => (
    <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-600" />
        <h4 className="font-medium text-gray-700 text-sm">{title}</h4>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 && <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{count}</span>}
        {totalValue !== undefined && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
            ₹{parseFloat(totalValue || 0).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );

  // Section component
  const Section = ({ title, children, icon, count = 0, totalValue, className = "" }) => (
    <div className={`border border-gray-200 rounded-lg overflow-hidden h-fit ${className}`}>
      <SectionHeader 
        title={title} 
        icon={icon}
        count={count}
        totalValue={totalValue}
      />
      <div className="p-2 bg-white space-y-1">
        {children}
      </div>
    </div>
  );

  // Get service counts
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

  // Render Paper and Cutting section
  const renderPaperAndCuttingSection = () => {
    if (!localCalculations || serviceCounts.paperCount === 0) {
      return (
        <Section
          title="Paper & Cutting"
          icon={FileText}
          count={0}
          totalValue={0}
        >
          <div className="text-sm text-gray-500 italic py-2">No paper & cutting services</div>
        </Section>
      );
    }
    
    return (
      <Section
        title="Paper & Cutting"
        icon={FileText}
        count={serviceCounts.paperCount}
        totalValue={localCalculations.paperAndCuttingCostPerCard}
      >
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
      </Section>
    );
  };

  // Render Wastage and Overhead section
  const renderWastageAndOverhead = () => {
    if (!localCalculations) return null;
    
    return (
      <Section
        title="Wastage & Overhead"
        icon={TrendingUp}
        count={3}
        totalValue={localCalculations.COGS}
      >
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
      </Section>
    );
  };

  // Render Markup Selection section
  const renderMarkupSelection = () => {
    if (!localCalculations) return null;
    
    return (
      <Section
        title="Markup Selection"
        icon={Percent}
        count={1}
        totalValue={localCalculations.markupAmount}
        className="bg-blue-50"
      >
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              onChange={handleMarkupSelection}
              value={selectedMarkupType}
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="w-16 bg-white border border-gray-300 rounded-md p-2 text-center font-bold text-sm">
              {markupPercentage}%
            </div>
          </div>
          
          {localCalculations.markupType && (
            <div className="space-y-1">
              <CostItem 
                label={`Selected: ${localCalculations.markupType.replace('MARKUP ', '')}`}
                value={localCalculations.markupAmount || 0}
                isTotal
              />
            </div>
          )}
          
          {!isEditMode && isB2BClient && (
            <div className="text-xs text-blue-600">
              B2B Markup automatically applied
            </div>
          )}
        </div>
      </Section>
    );
  };

  // Render Final Cost Summary section
  const renderCostSummary = () => {
    if (!localCalculations) return null;
    
    return (
      <Section
        title="Final Summary"
        icon={Receipt}
        count={1}
        totalValue={localCalculations.totalWithGST}
        className="bg-green-50"
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <CostItem 
              label="Subtotal per Item"
              value={localCalculations.subtotalPerCard || 0}
            />
            
            <CostItem 
              label={`Markup (${markupPercentage}%)`}
              value={localCalculations.markupAmount || 0}
              isSubItem
            />
            
            <CostItem 
              label="Cost per Item"
              value={localCalculations.totalCostPerCard || 0}
              isTotal
            />
            
            <CostItem 
              label={`Total (${state.orderAndPaper?.quantity || 0} pcs)`}
              value={localCalculations.totalCost || 0}
              isHighlight
            />
            
            <CostItem 
              label={`GST (${localCalculations.gstRate}%)`}
              value={localCalculations.gstAmount || 0}
            />
            
            <CostItem 
              label="Total with GST"
              value={localCalculations.totalWithGST || 0}
              isHighlight
            />
          </div>
          
          {/* Quick summary stats */}
          <div className="mt-3 pt-2 border-t border-green-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Per Item</div>
                <div className="font-bold text-green-700">₹{parseFloat(localCalculations.totalCostPerCard || 0).toFixed(2)}</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Total</div>
                <div className="font-bold text-green-700">₹{parseFloat(localCalculations.totalWithGST || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  };

  // Render Production Services section
  const renderProductionServices = () => {
    // Calculate total production cost
    const calculateProductionTotal = () => {
      if (!localCalculations) return 0;
      
      let total = 0;
      if (localCalculations.lpCostPerCard) total += parseFloat(localCalculations.lpCostPerCard);
      if (localCalculations.fsCostPerCard) total += parseFloat(localCalculations.fsCostPerCard);
      if (localCalculations.embCostPerCard) total += parseFloat(localCalculations.embCostPerCard);
      if (localCalculations.screenPrintCostPerCard) total += parseFloat(localCalculations.screenPrintCostPerCard);
      if (localCalculations.digiCostPerCard) total += parseFloat(localCalculations.digiCostPerCard);
      if (localCalculations.notebookCostPerCard) total += parseFloat(localCalculations.notebookCostPerCard);
      
      return total;
    };

    if (!localCalculations || serviceCounts.productionCount === 0) {
      return (
        <Section
          title="Production Services"
          icon={Settings}
          count={0}
          totalValue={0}
        >
          <div className="text-sm text-gray-500 italic py-2">No production services</div>
        </Section>
      );
    }
    
    return (
      <Section
        title="Production Services"
        icon={Settings}
        count={serviceCounts.productionCount}
        totalValue={calculateProductionTotal()}
      >
        {/* LP Section */}
        {state.lpDetails?.isLPUsed && localCalculations.lpCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Letter Press (LP)" value={localCalculations.lpCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.lpPlateCostPerCard && <CostItem label="Plate" value={localCalculations.lpPlateCostPerCard} isSubItem />}
              {localCalculations.lpImpressionCostPerCard && <CostItem label="Impression" value={localCalculations.lpImpressionCostPerCard} isSubItem />}
              {localCalculations.lpPositiveFilmCostPerCard && <CostItem label="LP Positive Film" value={localCalculations.lpPositiveFilmCostPerCard} isSubItem />}
              {localCalculations.lpMRCostPerCard && <CostItem label="MR Cost" value={localCalculations.lpMRCostPerCard} isSubItem />}
              {localCalculations.lpMkgCostPerCard && <CostItem label="LP Making Cost" value={localCalculations.lpMkgCostPerCard} isSubItem />}
              {localCalculations.lpInkCostPerCard && <CostItem label="Ink" value={localCalculations.lpInkCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* FS Section */}
        {state.fsDetails?.isFSUsed && localCalculations.fsCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Foil Stamping (FS)" value={localCalculations.fsCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.fsBlockCostPerCard && <CostItem label="Block" value={localCalculations.fsBlockCostPerCard} isSubItem />}
              {localCalculations.fsFoilCostPerCard && <CostItem label="Foil" value={localCalculations.fsFoilCostPerCard} isSubItem />}
              {localCalculations.fsMRCostPerCard && <CostItem label="MR Cost" value={localCalculations.fsMRCostPerCard} isSubItem />}
              {localCalculations.fsImpressionCostPerCard && <CostItem label="Impression" value={localCalculations.fsImpressionCostPerCard} isSubItem />}
              {localCalculations.fsFreightCostPerCard && <CostItem label="FS Freight Cost" value={localCalculations.fsFreightCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* EMB Section */}
        {state.embDetails?.isEMBUsed && localCalculations.embCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Embossing (EMB)" value={localCalculations.embCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.embPlateCostPerCard && <CostItem label="Plate" value={localCalculations.embPlateCostPerCard} isSubItem />}
              {localCalculations.embImpressionCostPerCard && <CostItem label="Impression" value={localCalculations.embImpressionCostPerCard} isSubItem />}
              {localCalculations.embMRCostPerCard && <CostItem label="MR Cost" value={localCalculations.embMRCostPerCard} isSubItem />}
              // Continuation of the component from where it was cut off...

              {localCalculations.embMkgPlateCostPerCard && <CostItem label="EMB Making Plate" value={localCalculations.embMkgPlateCostPerCard} isSubItem />}
              {localCalculations.embPositiveFilmCostPerCard && <CostItem label="EMB Positive Film" value={localCalculations.embPositiveFilmCostPerCard} isSubItem />}
              {localCalculations.embDstMaterialCostPerCard && parseFloat(localCalculations.embDstMaterialCostPerCard) > 0 && (
                <CostItem label="EMB DST Material" value={localCalculations.embDstMaterialCostPerCard} isSubItem />
              )}
            </div>
          </div>
        )}
        
        {/* Screen Print Section */}
        {(state.screenPrintDetails?.isScreenPrintUsed || state.screenPrint?.isScreenPrintUsed) && localCalculations.screenPrintCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Screen Printing" value={localCalculations.screenPrintCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.screenPrintPerPieceCost && <CostItem label="Screen Print Per Piece" value={localCalculations.screenPrintPerPieceCost} isSubItem />}
              {localCalculations.screenPrintBaseCostPerCard && <CostItem label="Screen Print Base Cost" value={localCalculations.screenPrintBaseCostPerCard} isSubItem />}
              {localCalculations.screenPrintMRCostPerCard && <CostItem label="Screen Print MR Cost" value={localCalculations.screenPrintMRCostPerCard} isSubItem />}
            </div>
            {localCalculations.noOfColors && (
              <div className="text-xs text-gray-500 pl-2">Colors: {localCalculations.noOfColors}</div>
            )}
          </div>
        )}
        
        {/* Digital Printing Section */}
        {state.digiDetails?.isDigiUsed && localCalculations.digiCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Digital Printing" value={localCalculations.digiCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.digiPrintCostPerCard && <CostItem label="Print Cost" value={localCalculations.digiPrintCostPerCard} isSubItem />}
              {localCalculations.digiPaperCostPerCard && <CostItem label="Paper Cost" value={localCalculations.digiPaperCostPerCard} isSubItem />}
              {localCalculations.digiGilCutCostPerCard && <CostItem label="Digital Gil Cut Cost" value={localCalculations.digiGilCutCostPerCard} isSubItem />}
            </div>
            {localCalculations.totalFragsPerSheet && (
              <div className="text-xs text-gray-500 pl-2">Fragments per sheet: {localCalculations.totalFragsPerSheet}</div>
            )}
            {localCalculations.totalSheets && (
              <div className="text-xs text-gray-500 pl-2">Total sheets: {localCalculations.totalSheets}</div>
            )}
          </div>
        )}
        
        {/* Notebook Section */}
        {state.orderAndPaper.jobType === "Notebook" && state.notebookDetails?.isNotebookUsed && localCalculations.notebookCostPerCard && (
          <div className="space-y-1">
            <CostItem label="Notebook" value={localCalculations.notebookCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.notebookPagesCostPerCard && <CostItem label="Pages" value={localCalculations.notebookPagesCostPerCard} isSubItem />}
              {localCalculations.notebookBindingCostPerCard && <CostItem label="Binding" value={localCalculations.notebookBindingCostPerCard} isSubItem />}
              {localCalculations.notebookGilCutCostPerCard && <CostItem label="Notebook GIL Cut Cost" value={localCalculations.notebookGilCutCostPerCard} isSubItem />}
            </div>
            {localCalculations.possibleNumberOfForma && (
              <div className="text-xs text-gray-500 pl-2">Forma per notebook: {localCalculations.possibleNumberOfForma}</div>
            )}
            {localCalculations.totalPages && (
              <div className="text-xs text-gray-500 pl-2">Total pages: {localCalculations.totalPages}</div>
            )}
            {localCalculations.totalFormaRequired && (
              <div className="text-xs text-gray-500 pl-2">Total forma required: {localCalculations.totalFormaRequired}</div>
            )}
            {localCalculations.totalSheets && (
              <div className="text-xs text-gray-500 pl-2">Total sheets: {localCalculations.totalSheets}</div>
            )}
          </div>
        )}
      </Section>
    );
  };

  // Render Post-Production Services section
  const renderPostProductionServices = () => {
    // Calculate total post-production cost
    const calculatePostProductionTotal = () => {
      if (!localCalculations) return 0;
      
      let total = 0;
      if (localCalculations.preDieCuttingCostPerCard) total += parseFloat(localCalculations.preDieCuttingCostPerCard);
      if (localCalculations.dieCuttingCostPerCard) total += parseFloat(localCalculations.dieCuttingCostPerCard);
      if (localCalculations.postDCCostPerCard) total += parseFloat(localCalculations.postDCCostPerCard);
      if (localCalculations.foldAndPasteCostPerCard) total += parseFloat(localCalculations.foldAndPasteCostPerCard);
      if (localCalculations.dstPasteCostPerCard) total += parseFloat(localCalculations.dstPasteCostPerCard);
      if (localCalculations.magnetCostPerCard) total += parseFloat(localCalculations.magnetCostPerCard);
      if (localCalculations.qcCostPerCard) total += parseFloat(localCalculations.qcCostPerCard);
      if (localCalculations.packingCostPerCard) total += parseFloat(localCalculations.packingCostPerCard);
      if (localCalculations.miscCostPerCard) total += parseFloat(localCalculations.miscCostPerCard);
      if (localCalculations.sandwichCostPerCard) total += parseFloat(localCalculations.sandwichCostPerCard);
      
      return total;
    };

    if (!localCalculations || serviceCounts.postProductionCount === 0) {
      return (
        <Section
          title="Post-Production"
          icon={Package}
          count={0}
          totalValue={0}
        >
          <div className="text-sm text-gray-500 italic py-2">No post-production services</div>
        </Section>
      );
    }
    
    return (
      <Section
        title="Post-Production"
        icon={Package}
        count={serviceCounts.postProductionCount}
        totalValue={calculatePostProductionTotal()}
      >
        {/* Pre Die Cutting Section */}
        {state.preDieCutting?.isPreDieCuttingUsed && localCalculations.preDieCuttingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Pre Die Cutting" value={localCalculations.preDieCuttingCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.preDieCuttingMRCostPerCard && <CostItem label="Pre Die Cutting MR Cost" value={localCalculations.preDieCuttingMRCostPerCard} isSubItem />}
              {localCalculations.preDieCuttingImpressionCostPerCard && <CostItem label="Pre Die Cutting Impression" value={localCalculations.preDieCuttingImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Die Cutting Section */}
        {state.dieCutting?.isDieCuttingUsed && localCalculations.dieCuttingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Die Cutting" value={localCalculations.dieCuttingCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.dieCuttingMRCostPerCard && <CostItem label="Die Cutting MR Cost" value={localCalculations.dieCuttingMRCostPerCard} isSubItem />}
              {localCalculations.dieCuttingImpressionCostPerCard && <CostItem label="Die Cutting Impression" value={localCalculations.dieCuttingImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Post Die Cutting Section */}
        {state.postDC?.isPostDCUsed && localCalculations.postDCCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Post Die Cutting" value={localCalculations.postDCCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.postDCMRCostPerCard && <CostItem label="Post DC MR Cost" value={localCalculations.postDCMRCostPerCard} isSubItem />}
              {localCalculations.postDCImpressionCostPerCard && <CostItem label="Post DC Impression" value={localCalculations.postDCImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Fold and Paste Section */}
        {state.foldAndPaste?.isFoldAndPasteUsed && localCalculations.foldAndPasteCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Fold and Paste" value={localCalculations.foldAndPasteCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.dstMaterialCostPerCard && <CostItem label="DST Material Cost" value={localCalculations.dstMaterialCostPerCard} isSubItem />}
              {localCalculations.foldAndPasteOperationCostPerCard && <CostItem label="Fold & Paste Operation" value={localCalculations.foldAndPasteOperationCostPerCard} isSubItem />}
            </div>
            {localCalculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {localCalculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* DST Paste Section */}
        {state.dstPaste?.isDstPasteUsed && localCalculations.dstPasteCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="DST Paste" value={localCalculations.dstPasteCostPerCard} isTotal />
            {localCalculations.dstType && (
              <div className="text-xs text-gray-500 pl-2">DST Type: {localCalculations.dstType}</div>
            )}
            {localCalculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {localCalculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* Magnet Section */}
        {state.magnet?.isMagnetUsed && localCalculations.magnetCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Magnet" value={localCalculations.magnetCostPerCard} isTotal />
            {localCalculations.plateArea && (
              <div className="text-xs text-gray-500 pl-2">Plate Area: {localCalculations.plateArea} cm²</div>
            )}
            {localCalculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {localCalculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* QC Section */}
        {state.qc?.isQCUsed && localCalculations.qcCostPerCard && (
          <CostItem label="Quality Check" value={localCalculations.qcCostPerCard} isTotal />
        )}
        
        {/* Packing Section */}
        {state.packing?.isPackingUsed && localCalculations.packingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Packing" value={localCalculations.packingCostPerCard} isTotal />
            {localCalculations.packingPercentage && (
              <div className="text-xs text-gray-500 pl-2">Packing: {localCalculations.packingPercentage}% of COGS</div>
            )}
          </div>
        )}
        
        {/* Misc Section */}
        {state.misc?.isMiscUsed && localCalculations.miscCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Miscellaneous" value={localCalculations.miscCostPerCard} isTotal />
            {localCalculations.miscChargeSource === "user" && (
              <div className="text-xs text-blue-600 pl-2">Custom charge</div>
            )}
            {localCalculations.miscChargeSource === "database" && (
              <div className="text-xs text-gray-600 pl-2">Standard charge</div>
            )}
          </div>
        )}
        
        {/* Sandwich/Duplex Section */}
        {state.sandwich?.isSandwichComponentUsed && localCalculations.sandwichCostPerCard && (
          <div className="space-y-1">
            <CostItem label="Duplex/Sandwich" value={localCalculations.sandwichCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {localCalculations.sandwichPaperCostPerCard && <CostItem label="Sandwich Paper Cost" value={localCalculations.sandwichPaperCostPerCard} isSubItem />}
              {localCalculations.sandwichGilCutCostPerCard && <CostItem label="Sandwich Gil Cut Cost" value={localCalculations.sandwichGilCutCostPerCard} isSubItem />}
              {localCalculations.lpCostPerCardSandwich && <CostItem label="Sandwich LP Cost" value={localCalculations.lpCostPerCardSandwich} isSubItem />}
              {localCalculations.fsCostPerCardSandwich && <CostItem label="Sandwich FS Cost" value={localCalculations.fsCostPerCardSandwich} isSubItem />}
              {localCalculations.embCostPerCardSandwich && <CostItem label="Sandwich EMB Cost" value={localCalculations.embCostPerCardSandwich} isSubItem />}
            </div>
          </div>
        )}
      </Section>
    );
  };

  // Handle submit for preview
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (localCalculations) {
      console.log('🎯 Submitting calculations for preview:', {
        calculations: localCalculations,
        validationStatus: localCalculations.validationStatus,
        preservationMode: localCalculations.preservationMode
      });
      onPreviewEstimate(localCalculations);
    } else {
      onPreviewEstimate();
    }
  };

  // Handle direct submit for edit mode
  const handleDirectSubmit = (e) => {
    e.preventDefault();
    
    if (localCalculations) {
      console.log('💾 Submitting calculations for save:', {
        calculations: localCalculations,
        validationStatus: localCalculations.validationStatus,
        preservationMode: localCalculations.preservationMode
      });
      onCreateEstimate(localCalculations);
    } else {
      onCreateEstimate();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Calculator className="text-blue-600" size={18} />
        <h3 className="text-lg font-semibold text-gray-800">Cost Calculation</h3>
        {/* Enhanced debug indicator for calculation consistency */}
        {localCalculations && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {isEditMode ? '🔒 Edit Mode' : '✨ New Mode'}
            </span>
          </div>
        )}
      </div>

      {/* Calculation Content */}
      {isCalculating ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Calculating costs...</p>
          </div>
        </div>
      ) : localCalculations && !localCalculations.error ? (
        <div className="space-y-3">
          {/* B2B Client Simplified View */}
          {isB2BClient ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-blue-600" />
                Cost Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Cost per Item</div>
                  <div className="text-xl font-bold text-gray-800">₹{parseFloat(localCalculations.totalCostPerCard || 0).toFixed(2)}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total ({state.orderAndPaper?.quantity || 0} pcs)</div>
                  <div className="text-xl font-bold text-blue-700">₹{parseFloat(localCalculations.totalCost || 0).toFixed(2)}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-600">GST ({localCalculations.gstRate}%)</div>
                  <div className="text-lg font-semibold text-green-600">₹{parseFloat(localCalculations.gstAmount || 0).toFixed(2)}</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-100 to-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-700 font-medium">Total with GST</div>
                  <div className="text-xl font-bold text-green-700">₹{parseFloat(localCalculations.totalWithGST || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Admin/Staff View with Three Columns Layout */}
              
              {/* Three Column Layout for ALL sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Column 1: Paper & Cutting + Wastage & Overhead + Markup Selection */}
                <div className="space-y-4">
                  {renderPaperAndCuttingSection()}
                  {renderWastageAndOverhead()}
                  {renderMarkupSelection()}
                </div>
                
                {/* Column 2: Production Services */}
                <div className="space-y-4">
                  {renderProductionServices()}
                </div>
                
                {/* Column 3: Post-Production Services + Final Summary */}
                <div className="space-y-4">
                  {renderPostProductionServices()}
                  {renderCostSummary()}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 text-center">
          <p className="text-cyan-600 text-sm">Please fill in the required fields to calculate costs.</p>
          {!areRequiredFieldsFilled() && (
            <div className="mt-2 text-xs text-cyan-500">
              Missing: {!state.client?.clientId && 'Client, '}
              {!state.orderAndPaper?.projectName?.trim() && 'Project Name, '}
              {!state.orderAndPaper?.quantity && 'Quantity, '}
              {!state.orderAndPaper?.paperName?.trim() && 'Paper Name, '}
              {!state.orderAndPaper?.dieCode?.trim() && 'Die Code, '}
              {(!state.orderAndPaper?.dieSize?.length || !state.orderAndPaper?.dieSize?.breadth) && 'Die Size'}
            </div>
          )}
        </div>
      )}

      {/* Submit Buttons */}
      {!previewMode && (
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          {/* Preview Button */}
          {shouldShowPreviewButton() && (
            <button
              onClick={handleSubmit}
              className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
              disabled={isSaving || isCalculating}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white text-xs"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Eye size={12} />
                  <div className="text-sm">Preview Estimate</div>
                </>
              )}
            </button>
          )}
          
          {/* Direct Submit Button */}
          {isEditMode && hasValidCalculations() && (
            <button
              onClick={handleDirectSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
              disabled={isSaving || isCalculating}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FileText size={12} />
                  <div className="text-sm">Update Estimate</div>
                </>
              )}
            </button>
          )}
          
          {/* Helper message */}
          {!shouldShowPreviewButton() && !isEditMode && (
            <div className="text-sm text-gray-500 italic">
              {!areRequiredFieldsFilled() ? 
                "Please fill all required fields to preview estimate" : 
                !hasValidCalculations() ? 
                "Calculating costs..." : 
                "Preview will be available once calculations are complete"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// PropTypes
ReviewAndSubmit.propTypes = {
  state: PropTypes.object.isRequired,
  calculations: PropTypes.object,
  isCalculating: PropTypes.bool,
  onCreateEstimate: PropTypes.func.isRequired,
  onPreviewEstimate: PropTypes.func.isRequired,
  onMarkupChange: PropTypes.func,
  isEditMode: PropTypes.bool,
  previewMode: PropTypes.bool,
  isSaving: PropTypes.bool
};

export default ReviewAndSubmit;