import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from "../Login/AuthContext";
import CostDisplaySection from "./CostDisplaySection";
import SectionDetailsPanel from "./SectionDetailsPanel";
import { normalizeDataForDisplay } from "../../utils/normalizeDataForOrders";

const UnifiedDetailsModal = ({ 
  data, 
  dataType, // 'estimate', 'order', or 'invoice'
  onClose
}) => {
  // Add state to store normalized data
  const [normalizedData, setNormalizedData] = useState(null);
  
  // Get user role from auth context for access control
  const { userRole } = useAuth();
  const isB2BClient = userRole === "b2b";
  
  // Whether the user can view detailed costs depends on role and data type
  const canViewDetailedCosts = userRole === "admin" || 
    (dataType === "estimate" && !isB2BClient);

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    productionStatus: dataType === 'order', // Auto-expand for orders
    loyaltyInfo: true, // Auto-expand loyalty info
    costs: true,
    productionDetails: true, // New section for production details
    postProductionDetails: true // New section for post-production details
  });
  
  // Common field labels across all data types
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
    // GST fields
    gstRate: "GST Rate",
    gstAmount: "GST Amount",
    totalWithGST: "Total with GST"
  };

  // Effect to normalize data for consistent display
  useEffect(() => {
    if (!data) return;
    
    // Use the imported normalization function
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
          className="max-w-full max-h-36 object-contain border rounded-md"
        />
      );
    }

    return value.toString();
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

  // Render section in grid layout
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
        {heading && <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}</h3>}
        
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

  // Render production status (for order type only)
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
        <div className="flex flex-wrap gap-2 mt-2">
          {stages.map((stage) => {
            const isCurrentStage = stage === displayData.stage;
            return (
              <div 
                key={stage}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  isCurrentStage 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {stage}
                {isCurrentStage && (
                  <span className="ml-2 inline-block">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

  // Render loyalty information section
  const renderLoyaltySection = () => {
    // Only show for B2B clients that have loyalty info
    if (!displayData.isLoyaltyEligible && !displayData.loyaltyInfo) return null;
    
    const loyaltyInfo = displayData.loyaltyInfo || {};
    const calculations = displayData.calculations || {};
    
    return (
      <CollapsibleSection
        title="Loyalty Program Information"
        isExpanded={expandedSections.loyaltyInfo}
        onToggle={() => toggleSection('loyaltyInfo')}
        bgColor="bg-purple-50"
      >
        {loyaltyInfo.tierName ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: loyaltyInfo.tierColor || '#9f7aea' }}>
                <span className="text-white text-sm font-semibold">B2B</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800">{loyaltyInfo.tierName}</h4>
                <p className="text-sm text-gray-600">Order #{loyaltyInfo.clientOrderCount || '?'}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border border-purple-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Discount Rate</span>
                  <span className="text-lg font-bold text-green-600">{loyaltyInfo.discount}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Discount Amount</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹ {parseFloat(loyaltyInfo.discountAmount || calculations.loyaltyDiscountAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {loyaltyInfo.tierChanged && (
              <div className="mt-2 bg-green-50 text-green-800 p-2 rounded-md text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Tier Upgraded!</span>
                </div>
                <p className="mt-1 ml-5">
                  Client has reached a new loyalty tier with this order.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-purple-700 mb-2">B2B Client - Eligible for Loyalty Program</p>
            <p className="text-sm text-gray-600">
              This client is eligible for the B2B loyalty program but hasn't reached any tier yet.
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

  // Render production details section
  const renderProductionDetailsSection = () => {
    const usedProcesses = getUsedProductionProcesses();
    
    if (usedProcesses.length === 0) return null;
    
    return (
      <CollapsibleSection
        title="Production Details"
        isExpanded={expandedSections.productionDetails}
        onToggle={() => toggleSection('productionDetails')}
        bgColor="bg-blue-50"
      >
        <div className="space-y-4">
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
  
  // Render post-production details section
  const renderPostProductionDetailsSection = () => {
    const usedProcesses = getUsedPostProductionProcesses();
    
    if (usedProcesses.length === 0) return null;
    
    return (
      <CollapsibleSection
        title="Post-Production Details"
        isExpanded={expandedSections.postProductionDetails}
        onToggle={() => toggleSection('postProductionDetails')}
        bgColor="bg-purple-50"
      >
        <div className="space-y-4">
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
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="text-center mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-700">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ✖
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Basic Information - Always visible */}
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

            {/* Cost Information */}
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
                dataType={dataType} // Pass dataType to display correct format
              />
            </CollapsibleSection>
            
            {/* Production Details Section */}
            {renderProductionDetailsSection()}
            
            {/* Post-Production Details Section */}
            {renderPostProductionDetailsSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDetailsModal;