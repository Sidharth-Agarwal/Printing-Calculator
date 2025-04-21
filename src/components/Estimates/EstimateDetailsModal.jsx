import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EditEstimateModal from "./EditEstimateModal";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from "../Login/AuthContext"; // Added Auth context import

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
  const [expandedSections, setExpandedSections] = useState({
    paperAndCutting: true,
    production: false,
    postProduction: false,
    wastageAndOverhead: false
  });
  
  // Get user role from auth context
  const { userRole } = useAuth();
  const isB2BClient = userRole === "b2b";
  
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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Paper and Cutting"
        isExpanded={expandedSections.paperAndCutting}
        onToggle={() => toggleSection('paperAndCutting')}
        bgColor="bg-blue-50"
      >
        <div className="space-y-1">
          {calculations.paperCostPerCard && (
            <CostItem label="Paper Cost" value={calculations.paperCostPerCard} isSubItem />
          )}
          {calculations.gilCutCostPerCard && (
            <CostItem label="Gil Cutting Labor" value={calculations.gilCutCostPerCard} isSubItem />
          )}
          {calculations.paperAndCuttingCostPerCard && (
            <CostItem 
              label="Total Paper & Cutting" 
              value={calculations.paperAndCuttingCostPerCard}
              isTotal
            />
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Production Services section
  const renderProductionServices = () => {
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    // Check if any production services are enabled
    const hasLP = estimate.lpDetails?.isLPUsed;
    const hasFS = estimate.fsDetails?.isFSUsed;
    const hasEMB = estimate.embDetails?.isEMBUsed;
    const hasScreenPrint = estimate.screenPrint?.isScreenPrintUsed;
    const hasDigi = estimate.digiDetails?.isDigiUsed;
    
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
          {hasLP && calculations.lpCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Letter Press (LP)" value={calculations.lpCostPerCard} isTotal />
              {calculations.lpPlateCostPerCard && (
                <CostItem label="LP Plate Cost" value={calculations.lpPlateCostPerCard} isSubItem />
              )}
              {calculations.lpPositiveFilmCostPerCard && (
                <CostItem label="LP Positive Film" value={calculations.lpPositiveFilmCostPerCard} isSubItem />
              )}
              {calculations.lpMRCostPerCard && (
                <CostItem label="LP MR Cost" value={calculations.lpMRCostPerCard} isSubItem />
              )}
              {calculations.lpMkgCostPerCard && (
                <CostItem label="LP Making Cost" value={calculations.lpMkgCostPerCard} isSubItem />
              )}
              {calculations.lpInkCostPerCard && (
                <CostItem label="LP Ink Cost" value={calculations.lpInkCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* FS Section */}
          {hasFS && calculations.fsCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Foil Stamping (FS)" value={calculations.fsCostPerCard} isTotal />
              {calculations.fsBlockCostPerCard && (
                <CostItem label="FS Block Cost" value={calculations.fsBlockCostPerCard} isSubItem />
              )}
              {calculations.fsFoilCostPerCard && (
                <CostItem label="FS Foil Cost" value={calculations.fsFoilCostPerCard} isSubItem />
              )}
              {calculations.fsMRCostPerCard && (
                <CostItem label="FS MR Cost" value={calculations.fsMRCostPerCard} isSubItem />
              )}
              {calculations.fsImpressionCostPerCard && (
                <CostItem label="FS Impression Cost" value={calculations.fsImpressionCostPerCard} isSubItem />
              )}
              {calculations.fsFreightCostPerCard && (
                <CostItem label="FS Freight Cost" value={calculations.fsFreightCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* EMB Section */}
          {hasEMB && calculations.embCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Embossing (EMB)" value={calculations.embCostPerCard} isTotal />
              {calculations.embPlateCostPerCard && (
                <CostItem label="EMB Plate Cost" value={calculations.embPlateCostPerCard} isSubItem />
              )}
              {calculations.embMRCostPerCard && (
                <CostItem label="EMB MR Cost" value={calculations.embMRCostPerCard} isSubItem />
              )}
              {calculations.embPositiveFilmCostPerCard && (
                <CostItem label="EMB Positive Film" value={calculations.embPositiveFilmCostPerCard} isSubItem />
              )}
              {calculations.embMkgPlateCostPerCard && (
                <CostItem label="EMB Making Plate" value={calculations.embMkgPlateCostPerCard} isSubItem />
              )}
              {calculations.embImpressionCostPerCard && (
                <CostItem label="EMB Impression" value={calculations.embImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Screen Print Section */}
          {hasScreenPrint && calculations.screenPrintCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Screen Printing" value={calculations.screenPrintCostPerCard} isTotal />
              {calculations.screenPrintPerPieceCost && (
                <CostItem label="Screen Print Per Piece" value={calculations.screenPrintPerPieceCost} isSubItem />
              )}
              {calculations.screenPrintBaseCostPerCard && (
                <CostItem label="Screen Print Base Cost" value={calculations.screenPrintBaseCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Digital Printing Section */}
          {hasDigi && calculations.digiCostPerCard && (
            <div className="space-y-1">
              <CostItem label="Digital Printing" value={calculations.digiCostPerCard} isTotal />
              {calculations.digiPrintCostPerCard && (
                <CostItem label="Digital Print Cost" value={calculations.digiPrintCostPerCard} isSubItem />
              )}
              {calculations.digiPaperCostPerCard && (
                <CostItem label="Digital Paper Cost" value={calculations.digiPaperCostPerCard} isSubItem />
              )}
              {calculations.digiGilCutCostPerCard && (
                <CostItem label="Digital Gil Cut Cost" value={calculations.digiGilCutCostPerCard} isSubItem />
              )}
              {calculations.totalFragsPerSheet && (
                <div className="pl-6 text-sm text-gray-600">
                  Fragments per sheet: {calculations.totalFragsPerSheet}
                </div>
              )}
              {calculations.totalSheets && (
                <div className="pl-6 text-sm text-gray-600">
                  Total sheets: {calculations.totalSheets}
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
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    // Check if any post-production services are enabled
    const hasDieCutting = estimate.dieCutting?.isDieCuttingUsed;
    const hasPostDC = estimate.postDC?.isPostDCUsed;
    const hasFoldAndPaste = estimate.foldAndPaste?.isFoldAndPasteUsed;
    const hasDstPaste = estimate.dstPaste?.isDstPasteUsed;
    const hasQC = estimate.qc?.isQCUsed;
    const hasPacking = estimate.packing?.isPackingUsed;
    const hasMisc = estimate.misc?.isMiscUsed;
    const hasSandwich = estimate.sandwich?.isSandwichComponentUsed;
    
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
          {hasDieCutting && calculations.dieCuttingCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Die Cutting" value={calculations.dieCuttingCostPerCard} isTotal />
              {calculations.dieCuttingMRCostPerCard && (
                <CostItem label="Die Cutting MR Cost" value={calculations.dieCuttingMRCostPerCard} isSubItem />
              )}
              {calculations.dieCuttingImpressionCostPerCard && (
                <CostItem label="Die Cutting Impression" value={calculations.dieCuttingImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Post Die Cutting Section */}
          {hasPostDC && calculations.postDCCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Post Die Cutting" value={calculations.postDCCostPerCard} isTotal />
              {calculations.postDCMRCostPerCard && (
                <CostItem label="Post DC MR Cost" value={calculations.postDCMRCostPerCard} isSubItem />
              )}
              {calculations.postDCImpressionCostPerCard && (
                <CostItem label="Post DC Impression" value={calculations.postDCImpressionCostPerCard} isSubItem />
              )}
            </div>
          )}
          
          {/* Fold and Paste Section */}
          {hasFoldAndPaste && calculations.foldAndPasteCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Fold and Paste" value={calculations.foldAndPasteCostPerCard} isTotal />
            </div>
          )}
          
          {/* DST Paste Section */}
          {hasDstPaste && calculations.dstPasteCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="DST Paste" value={calculations.dstPasteCostPerCard} isTotal />
            </div>
          )}
          
          {/* QC Section */}
          {hasQC && calculations.qcCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Quality Check" value={calculations.qcCostPerCard} isTotal />
            </div>
          )}
          
          {/* Packing Section */}
          {hasPacking && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Packing" value={calculations.packingCostPerCard} isTotal />
              {calculations.packingPercentage && (
                <div className="pl-6 text-sm text-gray-600">
                  Packing: {calculations.packingPercentage}% of COGS
                </div>
              )}
            </div>
          )}
          
          {/* Misc Section */}
          {hasMisc && calculations.miscCostPerCard && (
            <div className="space-y-1 border-b pb-2 mb-2">
              <CostItem label="Miscellaneous" value={calculations.miscCostPerCard} isTotal />
            </div>
          )}
          
          {/* Sandwich/Duplex Section */}
          {hasSandwich && (
            <div className="space-y-1">
              <CostItem label="Duplex/Sandwich" value={calculations.sandwichCostPerCard || 0} isTotal />
              {/* Sandwich-specific LP */}
              {calculations.lpCostPerCardSandwich && (
                <CostItem label="Sandwich LP Cost" value={calculations.lpCostPerCardSandwich} isSubItem />
              )}
              {/* Sandwich-specific FS */}
              {calculations.fsCostPerCardSandwich && (
                <CostItem label="Sandwich FS Cost" value={calculations.fsCostPerCardSandwich} isSubItem />
              )}
              {/* Sandwich-specific EMB */}
              {calculations.embCostPerCardSandwich && (
                <CostItem label="Sandwich EMB Cost" value={calculations.embCostPerCardSandwich} isSubItem />
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Wastage and Overhead section
  const renderWastageAndOverhead = () => {
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Wastage and Overhead"
        isExpanded={expandedSections.wastageAndOverhead}
        onToggle={() => toggleSection('wastageAndOverhead')}
        bgColor="bg-amber-50"
      >
        <div className="space-y-1">
          <CostItem label="Base Cost" value={calculations.baseCost} />
          
          {calculations.wastagePercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Wastage ({calculations.wastagePercentage}%)</span>
              <span>₹ {parseFloat(calculations.wastageAmount || 0).toFixed(2)}</span>
            </div>
          )}
          
          {calculations.overheadPercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Overhead ({calculations.overheadPercentage}%)</span>
              <span>₹ {parseFloat(calculations.overheadAmount || 0).toFixed(2)}</span>
            </div>
          )}
          
          <CostItem 
            label="COGS (Cost of Goods Sold)" 
            value={calculations.COGS} 
            isTotal
          />
        </div>
      </CollapsibleSection>
    );
  };

  // Render the detailed cost summary (for non-B2B users)
  const renderDetailedCostSummary = () => {
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-md border">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Subtotal per Card:</span>
            <span className="text-gray-900">
              ₹ {parseFloat(calculations.subtotalPerCard || 0).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
            <span className="font-medium">
              Markup ({calculations.markupType?.replace('MARKUP ', '') || 'Standard'}: {calculations.markupPercentage || 0}%):
            </span>
            <span className="font-medium">
              ₹ {parseFloat(calculations.markupAmount || 0).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
            <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
            <span className="text-lg font-bold text-gray-900">
              ₹ {parseFloat(calculations.totalCostPerCard || 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
          <span className="text-lg font-bold text-gray-700">
            Total Cost ({estimate.jobDetails?.quantity || 0} pcs):
          </span>
          <span className="text-xl font-bold text-blue-600">
            ₹ {parseFloat(calculations.totalCost || 0).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };
  
  // Render the simplified cost summary for B2B clients
  const renderSimplifiedCostSummary = () => {
    const calculations = estimate.calculations;
    if (!calculations) return null;
    
    const totalCostPerCard = parseFloat(calculations.totalCostPerCard || 0);
    const quantity = parseInt(estimate.jobDetails?.quantity || 0);
    const totalCost = parseFloat(calculations.totalCost || 0);
    
    // Get markup info if available
    const markupPercentage = calculations.markupPercentage || 0;
    const markupType = calculations.markupType || 'Standard';
    
    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Total Cost per Card:</span>
            <span className="font-bold">
              ₹ {totalCostPerCard.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-blue-300 text-xl">
            <span className="font-bold text-gray-700">
              Total Cost ({quantity} pcs):
            </span>
            <span className="font-bold text-blue-700">
              ₹ {totalCost.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Hidden markup info - display read-only for transparency */}
        {markupType && markupType.includes('B2B') && (
          <div className="mt-4 pt-3 border-t border-blue-200 text-sm text-gray-600">
            <p>Using B2B pricing ({markupPercentage}% markup)</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-700">Estimate Details</h2>
          <div className="flex items-center gap-4">
            {!isB2BClient && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Estimate
              </button>
            )}
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

            {/* For B2B clients, show simplified cost view */}
            {isB2BClient ? (
              renderSimplifiedCostSummary()
            ) : (
              /* For admin/staff: Show detailed breakdown */
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
                
                {/* Final Cost Summary */}
                {renderDetailedCostSummary()}
              </div>
            )}
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