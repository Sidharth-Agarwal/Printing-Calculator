import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import OrderJobTicket from './OrderJobTicket';
import TaxInvoice from './TaxInvoice';

const OrderDetailsModal = ({ order, onClose, onStageUpdate }) => {
  const [activeView, setActiveView] = useState('details');
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef(null);
  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

  // Stage colors for visual representation
  const stageColors = {
    'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    'Printing': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'Delivery': { bg: 'bg-green-100', text: 'text-green-800' }
  };

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
    paperName: "Paper Name"
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
          alt="Die"
          className="max-w-full max-h-36 object-contain border rounded-md"
        />
      );
    }

    return value.toString();
  };

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
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}</h3>
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(filteredData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
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

  // Handle stage update
  const handleStageUpdate = async (newStage) => {
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { stage: newStage });
      onStageUpdate(newStage);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage");
    }
  };

  // Render the main cost components section
  const renderMainCostComponents = (calculations) => {
    if (!calculations) return null;

    const mainCostComponents = [
      { key: 'paperAndCuttingCostPerCard', label: 'Paper & Cutting' },
      { key: 'lpCostPerCard', label: 'Letter Press', condition: order.lpDetails?.isLPUsed },
      { key: 'fsCostPerCard', label: 'Foil Stamping', condition: order.fsDetails?.isFSUsed },
      { key: 'embCostPerCard', label: 'Embossing', condition: order.embDetails?.isEMBUsed },
      { key: 'digiCostPerCard', label: 'Digital Printing', condition: order.digiDetails?.isDigiUsed },
      { key: 'dieCuttingCostPerCard', label: 'Die Cutting', condition: order.dieCutting?.isDieCuttingUsed },
      { key: 'pastingCostPerCard', label: 'Pasting', condition: order.pasting?.isPastingUsed },
    ];

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Main Cost Components</h3>
        <div className="grid grid-cols-3 gap-3">
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
    const costCalculationSteps = [];
    
    // Add base cost if available
    if (calculations.baseCost !== undefined) {
      costCalculationSteps.push({ 
        key: 'baseCost', 
        label: 'Base Cost per Card'
      });
    } else {
      // For compatibility with old format
      costCalculationSteps.push({ 
        key: 'baseCost', 
        label: 'Base Cost per Card',
        value: calculateTotalCosts().baseCost.toFixed(2)
      });
    }
    
    // Add misc charge if available
    if (calculations.miscChargePerCard !== undefined) {
      costCalculationSteps.push({ 
        key: 'miscChargePerCard', 
        label: 'Miscellaneous Charge'
      });
    }
    
    // Add base with misc if available
    if (calculations.baseWithMisc !== undefined) {
      costCalculationSteps.push({ 
        key: 'baseWithMisc', 
        label: 'Base Cost with Misc',
        isSeparator: true
      });
    }
    
    // Add wastage
    if (calculations.wastageAmount !== undefined) {
      costCalculationSteps.push({ 
        key: 'wastageAmount', 
        label: 'Wastage (5%)'
      });
    } else {
      // For compatibility with old format
      costCalculationSteps.push({ 
        key: 'wastageCost', 
        label: 'Wastage (5%)',
        value: calculateTotalCosts().wastageCost.toFixed(2)
      });
    }
    
    // Add overhead
    if (calculations.overheadAmount !== undefined) {
      costCalculationSteps.push({ 
        key: 'overheadAmount', 
        label: 'Overheads (35%)'
      });
    } else {
      // For compatibility with old format
      costCalculationSteps.push({ 
        key: 'overheadCost', 
        label: 'Overheads (35%)',
        value: calculateTotalCosts().overheadCost.toFixed(2)
      });
    }
    
    // Add subtotal if available
    if (calculations.subtotalPerCard !== undefined) {
      costCalculationSteps.push({ 
        key: 'subtotalPerCard', 
        label: 'Subtotal per Card',
        isSeparator: true
      });
    }
    
    // Add markup if available
    if (calculations.markupAmount !== undefined) {
      costCalculationSteps.push({ 
        key: 'markupAmount',
        label: `Markup (${calculations.markupType || 'Standard'}: ${calculations.markupPercentage || 0}%)`,
        isHighlighted: true
      });
    }
    
    // Add total cost per card
    costCalculationSteps.push({ 
      key: 'totalCostPerCard', 
      label: 'Total Cost per Card',
      isSeparator: true,
      isTotal: true,
      value: calculations.totalCostPerCard || calculateTotalCosts().totalCostPerCard.toFixed(2)
    });

    const quantity = parseInt(order.jobDetails?.quantity || 0);
    const totalCost = calculations.totalCost || 
      (parseFloat(calculations.totalCostPerCard || calculateTotalCosts().totalCostPerCard || 0) * quantity).toFixed(2);
    
    return (
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cost Summary</h3>
        
        <div className="space-y-2 mb-4">
          {costCalculationSteps.map(({ key, label, value, isSeparator, isHighlighted, isTotal }) => {
            // Use provided value or get from calculations
            const displayValue = value !== undefined ? 
              value : 
              (calculations[key] !== undefined ? parseFloat(calculations[key] || 0).toFixed(2) : "0.00");
              
            return (
              <div key={key} className={`flex justify-between items-center ${isSeparator ? 'border-t border-gray-300 pt-2 mt-2' : ''}`}>
                <span className={`${isTotal ? 'text-lg font-bold' : 'font-medium'} ${isHighlighted ? 'text-blue-700' : 'text-gray-700'}`}>
                  {label}:
                </span>
                <span className={`${isTotal ? 'text-lg font-bold' : ''} ${isHighlighted ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
                  ₹ {displayValue}
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
            ₹ {parseFloat(totalCost).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  // Calculate total costs (for backwards compatibility)
  const calculateTotalCosts = () => {
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead

    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'pastingCostPerCard'
    ];

    // Calculate base cost per card
    const baseCost = relevantFields.reduce((acc, key) => {
      const value = order.calculations?.[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);

    // Calculate wastage cost
    const wastageCost = baseCost * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseCost * (OVERHEAD_PERCENTAGE / 100);
    
    // Total cost per card including wastage and overhead
    const totalCostPerCard = baseCost + wastageCost + overheadCost;
    
    // Total cost for all cards
    const totalCost = totalCostPerCard * (order.jobDetails?.quantity || 0);

    return {
      baseCost,
      wastageCost,
      overheadCost,
      totalCostPerCard,
      totalCost
    };
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    try {
      const images = contentRef.current.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      await Promise.all(imagePromises);

      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${order.clientName}_${activeView === 'invoice' ? 'Invoice' : 'Job_Ticket'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeView === 'details' ? 'Order Details' : 
               activeView === 'invoice' ? 'Tax Invoice' : 'Job Ticket'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('details')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'details' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveView('ticket')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'ticket' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Job Ticket
              </button>
              <button
                onClick={() => setActiveView('invoice')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'invoice' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Invoice
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {(activeView === 'invoice' || activeView === 'ticket') && (
              <button
                onClick={generatePDF}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isDownloading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-md`}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>Download {activeView === 'invoice' ? 'Invoice' : 'Job Ticket'}</>
                )}
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stage Progress (making this section visible unlike the previous example) */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <span className="mr-2 font-medium">Current Stage:</span>
              <span className={`px-3 py-1 rounded-full ${stageColors[order.stage]?.bg || 'bg-gray-100'} ${stageColors[order.stage]?.text || 'text-gray-800'}`}>
                {order.stage}
              </span>
            </div>
            
            <div className="flex gap-2">
              {/* Stage progression stepper */}
              <div className="flex items-center">
                {stages.map((stage, index) => {
                  const currentStageIndex = stages.indexOf(order.stage);
                  const isCompletedStage = index <= currentStageIndex;
                  const isCurrentStage = index === currentStageIndex;
                  
                  return (
                    <div key={stage} className="flex items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
                          ${isCompletedStage 
                            ? stageColors[stage]?.bg || 'bg-gray-200' 
                            : 'bg-gray-200'} 
                          ${isCompletedStage 
                            ? stageColors[stage]?.text || 'text-gray-700' 
                            : 'text-gray-500'}
                          ${isCurrentStage ? 'ring-2 ring-blue-400' : ''}
                        `}
                        onClick={() => handleStageUpdate(stage)}
                      >
                        {isCompletedStage ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < stages.length - 1 && (
                        <div className={`w-8 h-1 ${
                          index < currentStageIndex 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'details' ? (
            <div className="p-6" id="order-content">
              {/* Basic Order Information */}
              {renderSectionInGrid("Order and Client Information", {
                clientName: order.clientName,
                projectName: order.projectName,
                date: order.date,
                deliveryDate: order.deliveryDate,
                jobType: order.jobDetails?.jobType,
                quantity: order.jobDetails?.quantity,
                paperName: order.jobDetails?.paperName,
                dieCode: order.dieDetails?.dieCode,
                dieSize: `${order.dieDetails?.dieSize?.length || ''} x ${order.dieDetails?.dieSize?.breadth || ''}`,
                image: order.dieDetails?.image
              })}

              {/* Main Cost Components */}
              {order.calculations && renderMainCostComponents(order.calculations)}

              {/* Total Cost Calculation */}
              {order.calculations && renderTotalCostCalculation(order.calculations)}
            </div>
          ) : (
            <div ref={contentRef} className="p-6">
              {activeView === 'invoice' ? (
                <TaxInvoice order={order} />
              ) : (
                <OrderJobTicket order={order} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;