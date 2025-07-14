import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from "../Login/AuthContext";
import CostDisplaySection from "./CostDisplaySection";
import SectionDetailsPanel from "./SectionDetailsPanel";
import { normalizeDataForDisplay } from "../../utils/normalizeDataForOrders";

const UnifiedDetailsModal = ({ 
  data, 
  dataType, // 'estimate', 'order', or 'invoice'
  onClose,
  customFooter = null // NEW: Optional custom footer
}) => {
  // Add state to store normalized data
  const [normalizedData, setNormalizedData] = useState(null);
  
  // Get user role from auth context for access control
  const { userRole } = useAuth();
  const isB2BClient = userRole === "b2b";
  
  // Whether the user can view detailed costs depends on role and data type
  const canViewDetailedCosts = userRole === "admin" || 
    (dataType === "estimate" && !isB2BClient);

  // UPDATED: State for expandable sections - production details now open by default
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    productionStatus: dataType === 'order',
    loyaltyInfo: true,
    costs: true,
    productionDetails: true, // CHANGED: Now open by default
    postProductionDetails: true // CHANGED: Now open by default
  });
  
  // Common field labels across all data types
  const fieldLabels = {
    clientName: "Client",
    projectName: "Project",
    date: "Order Date",
    deliveryDate: "Delivery Date",
    weddingDate: "Wedding Date",
    jobType: "Job Type",
    quantity: "Quantity",
    paperProvided: "Paper Provided",
    dieCode: "Die Code",
    dieSize: "Die Size",
    dieSelection: "Die Selection",
    paperName: "Paper",
    gstRate: "GST Rate",
    gstAmount: "GST Amount",
    totalWithGST: "Total with GST"
  };

  // Effect to normalize data for consistent display
  useEffect(() => {
    if (!data) return;
    
    const normalized = normalizeDataForDisplay(data);
    setNormalizedData(normalized);
  }, [data]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get label for field
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

  // Render value based on field type
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
          className="max-w-full max-h-24 object-contain border rounded-md"
        />
      );
    }

    return value.toString();
  };

  // Compact section header component
  const SectionHeader = ({ title, isExpanded, onToggle, bgColor = "bg-gray-50" }) => (
    <div 
      className={`flex justify-between items-center p-2 ${bgColor} rounded-t cursor-pointer border-b`}
      onClick={onToggle}
    >
      <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  );

  // Compact collapsible section component
  const CollapsibleSection = ({ title, isExpanded, onToggle, children, bgColor }) => (
    <div className="border rounded-md mb-2 overflow-hidden">
      <SectionHeader 
        title={title} 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
        bgColor={bgColor}
      />
      {isExpanded && (
        <div className="p-2">
          {children}
        </div>
      )}
    </div>
  );

  // Compact grid layout for sections
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
      <div key={heading} className="mb-3">
        {heading && <h4 className="text-md font-medium text-gray-600 mb-2">{heading}</h4>}
        
        <div className="grid grid-cols-3 gap-2 bg-white">
          {Object.entries(filteredData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                <span className="font-medium text-gray-600 text-xs">{getLabel(key)}:</span>
                <span className="text-gray-800 text-xs">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
        
        {/* Display die image if present */}
        {imageData && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <h5 className="font-medium text-gray-600 mb-1 text-xs">Die Image:</h5>
            <div className="flex justify-center">
              {renderValue("image", imageData)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Compact production status (for order type only)
  const renderProductionStatus = () => {
    if (dataType !== 'order' || !displayData.stage) return null;
    
    const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery', 'Completed'];
    
    return (
      <CollapsibleSection
        title="Production Status"
        isExpanded={expandedSections.productionStatus}
        onToggle={() => toggleSection('productionStatus')}
        bgColor="bg-gray-50"
      >
        <div className="flex flex-wrap gap-1 mt-1">
          {stages.map((stage) => {
            const isCurrentStage = stage === displayData.stage;
            return (
              <div 
                key={stage}
                className={`px-2 py-1 rounded text-xs ${
                  isCurrentStage 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {stage}
                {isCurrentStage && (
                  <span className="ml-1 inline-block">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>
    );
  };

  // Compact loyalty information section
  const renderLoyaltySection = () => {
    if (!displayData.isLoyaltyEligible && !displayData.loyaltyInfo) return null;
    
    const loyaltyInfo = displayData.loyaltyInfo || {};
    const calculations = displayData.calculations || {};
    
    return (
      <CollapsibleSection
        title="Loyalty Program"
        isExpanded={expandedSections.loyaltyInfo}
        onToggle={() => toggleSection('loyaltyInfo')}
        bgColor="bg-purple-50"
      >
        {loyaltyInfo.tierName ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" 
                   style={{ backgroundColor: loyaltyInfo.tierColor || '#9f7aea' }}>
                <span className="text-white font-semibold">B2B</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-800">{loyaltyInfo.tierName}</h5>
                <p className="text-xs text-gray-600">Order #{loyaltyInfo.clientOrderCount || '?'}</p>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded border border-purple-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">Discount Rate</span>
                  <span className="text-sm font-bold text-green-600">{loyaltyInfo.discount}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">Discount Amount</span>
                  <span className="text-sm font-bold text-green-600">
                    ₹ {parseFloat(loyaltyInfo.discountAmount || calculations.loyaltyDiscountAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {loyaltyInfo.tierChanged && (
              <div className="mt-1 bg-green-50 text-green-800 p-2 rounded text-xs">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Tier Upgraded!</span>
                </div>
                <p className="mt-1 ml-4 text-xs">
                  Client reached a new loyalty tier with this order.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 bg-gray-50 rounded text-center">
            <p className="text-purple-700 mb-1 text-xs">B2B Client - Eligible for Loyalty Program</p>
            <p className="text-xs text-gray-600">
              This client is eligible but hasn't reached any tier yet.
            </p>
          </div>
        )}
      </CollapsibleSection>
    );
  };

  // Determine which production processes are used
  const getUsedProductionProcesses = () => {
    const processes = [];
    
    if (displayData.lpDetails?.isLPUsed) processes.push('lpDetails');
    if (displayData.fsDetails?.isFSUsed) processes.push('fsDetails');
    if (displayData.embDetails?.isEMBUsed) processes.push('embDetails');
    if (displayData.digiDetails?.isDigiUsed) processes.push('digiDetails');
    if (displayData.screenPrint?.isScreenPrintUsed) processes.push('screenPrint');
    if (displayData.notebookDetails?.isNotebookUsed) processes.push('notebookDetails');
    
    return processes;
  };
  
  // Determine which post-production processes are used
  const getUsedPostProductionProcesses = () => {
    const processes = [];
    
    if (displayData.preDieCutting?.isPreDieCuttingUsed) processes.push('preDieCutting');
    if (displayData.dieCutting?.isDieCuttingUsed) processes.push('dieCutting');
    if (displayData.postDC?.isPostDCUsed) processes.push('postDC');
    if (displayData.foldAndPaste?.isFoldAndPasteUsed) processes.push('foldAndPaste');
    if (displayData.dstPaste?.isDstPasteUsed) processes.push('dstPaste');
    if (displayData.magnet?.isMagnetUsed) processes.push('magnet');
    if (displayData.qc?.isQCUsed) processes.push('qc');
    if (displayData.packing?.isPackingUsed) processes.push('packing');
    if (displayData.misc?.isMiscUsed) processes.push('misc');
    if (displayData.sandwich?.isSandwichComponentUsed) processes.push('sandwich');
    
    return processes;
  };

  // Compact production details section
  const renderProductionDetailsSection = () => {
    const usedProcesses = getUsedProductionProcesses();
    
    if (usedProcesses.length === 0) return null;
    
    return (
      <CollapsibleSection
        title={`Production Details (${usedProcesses.length})`}
        isExpanded={expandedSections.productionDetails}
        onToggle={() => toggleSection('productionDetails')}
        bgColor="bg-blue-50"
      >
        <div className="space-y-2">
          {usedProcesses.map(process => (
            <SectionDetailsPanel 
              key={process}
              data={displayData[process]}
              sectionType={process}
            />
          ))}
        </div>
      </CollapsibleSection>
    );
  };
  
  // Compact post-production details section
  const renderPostProductionDetailsSection = () => {
    const usedProcesses = getUsedPostProductionProcesses();
    
    if (usedProcesses.length === 0) return null;
    
    return (
      <CollapsibleSection
        title={`Post-Production Details (${usedProcesses.length})`}
        isExpanded={expandedSections.postProductionDetails}
        onToggle={() => toggleSection('postProductionDetails')}
        bgColor="bg-purple-50"
      >
        <div className="space-y-2">
          {usedProcesses.map(process => (
            <SectionDetailsPanel 
              key={process}
              data={displayData[process]}
              sectionType={process}
            />
          ))}
        </div>
      </CollapsibleSection>
    );
  };

  // Get dynamic title based on data type
  const getModalTitle = () => {
    switch (dataType) {
      case 'estimate':
        return 'Estimate Details';
      case 'order':
        return 'Order Details';
      case 'invoice':
        return 'Invoice Details';
      default:
        return 'Details';
    }
  };

  // Use normalized data if available, otherwise use original data
  const displayData = normalizedData || data;

  // If data is missing, show loading state
  if (!data) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin w-6 h-6 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="text-center mt-3 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-bold text-gray-700">{getModalTitle()}</h2>
          {/* <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-lg"
          >
            ✖
          </button> */}
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            {/* Basic Information - Compact */}
            <CollapsibleSection
              title="Client and Project Information"
              isExpanded={expandedSections.basicInfo}
              onToggle={() => toggleSection('basicInfo')}
              bgColor="bg-blue-50"
            >
              {renderSectionInGrid("", {
                clientName: displayData.clientInfo?.name || displayData.clientName,
                projectName: displayData.projectName,
                date: displayData.date,
                deliveryDate: displayData.deliveryDate,
                weddingDate: displayData.weddingDate,
                jobType: displayData.jobDetails?.jobType,
                quantity: displayData.jobDetails?.quantity,
                paperName: displayData.jobDetails?.paperName,
                dieCode: displayData.dieDetails?.dieCode,
                dieSize: displayData.dieDetails?.dieSize ? 
                  `${displayData.dieDetails?.dieSize?.length || ''} x ${displayData.dieDetails?.dieSize?.breadth || ''}` : "",
                image: displayData.dieDetails?.image
              })}
            </CollapsibleSection>

            {/* Production Status - Only for Orders */}
            {renderProductionStatus()}
            
            {/* Loyalty Information - Only for applicable orders */}
            {renderLoyaltySection()}

            {/* Cost Information - Using updated CostDisplaySection */}
            <CollapsibleSection
              title="Cost Information"
              isExpanded={expandedSections.costs}
              onToggle={() => toggleSection('costs')}
              bgColor="bg-green-50"
            >
              <CostDisplaySection 
                data={displayData} 
                calculations={displayData.calculations} 
                canViewDetailedCosts={canViewDetailedCosts}
                dataType={dataType}
              />
            </CollapsibleSection>
            
            {/* Production Details Section */}
            {renderProductionDetailsSection()}
            
            {/* Post-Production Details Section */}
            {renderPostProductionDetailsSection()}
          </div>
        </div>

        {/* UPDATED: Footer with custom footer support */}
        {customFooter ? (
          customFooter
        ) : (
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDetailsModal;