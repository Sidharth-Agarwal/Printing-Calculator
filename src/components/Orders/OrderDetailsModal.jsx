import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import OrderJobTicket from './OrderJobTicket';
import InvoiceTemplate from './InvoiceTemplate';

const OrderDetailsModal = ({ order, onClose, onStageUpdate }) => {
  const [activeView, setActiveView] = useState('details');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const contentRef = useRef(null);
  
  // Invoice data state
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    additionalInfo: '',
    discount: 0,
    taxRate: 12, // Default to 12% (6% CGST + 6% SGST)
    showTax: true
  });
  
  // Available stages for orders
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

  // Field labels for order details
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
    paperCostPerCard: "Cost of Paper",
    cuttingCostPerCard: "Cost of Cutting",
    paperAndCuttingCostPerCard: "Total Paper and Cutting Cost",
    lpCostPerCard: "Cost of LP",
    fsCostPerCard: "Cost of FS",
    embCostPerCard: "Cost of EMB",
    lpCostPerCardSandwich: "Cost of LP in Sandwich",
    fsCostPerCardSandwich: "Cost of FS in Sandwich",
    embCostPerCardSandwich: "Cost of EMB in Sandwich",
    digiCostPerCard: "Digital Print Cost per Unit",
    pastingCostPerCard: "Pasting Cost per Unit",
    pastingType: "Type of Pasting",
    totalPastingCost: "Total Pasting Cost"
  };

  // Cost fields order for display
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
    'pastingCostPerCard'
  ];

  // Format field label
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
          className="max-w-full max-h-20 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-4 bg-gray-100 p-2 rounded-md">
              {renderValue("item", item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      if ('length' in value && 'breadth' in value) {
        return `${value.length || 'N/A'} x ${value.breadth || 'N/A'}`;
      }

      return (
        <table className="w-full border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value)
              .filter(([key]) => !key.startsWith('is'))
              .map(([subKey, subValue], index) => (
                <tr
                  key={subKey}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } border border-gray-300`}
                >
                  <td className="p-2 font-medium text-gray-600">{getLabel(subKey)}:</td>
                  <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      );
    }

    return value.toString();
  };

  // Render multiple tables in a row
  const renderMultipleTablesInRow = (dataArray) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {dataArray.map((item, index) => (
          <div key={index} className="bg-white p-2 rounded-md border">
            {renderValue("table", item)}
          </div>
        ))}
      </div>
    );
  };

  // Render section in flex layout
  const renderSectionInFlex = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="space-y-4 bg-gray-100 p-4 rounded-md">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <h4 className="font-medium text-gray-600 mb-2">{getLabel(key)}:</h4>
                    {renderMultipleTablesInRow(value)}
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                  <span className="text-gray-800">{renderValue(key, value)}</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Render section in grid layout
  const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Handle stage update
  const handleStageUpdate = async (newStage) => {
    try {
      setIsUpdatingStage(true);
      await onStageUpdate(newStage);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Calculate total costs
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
      'pastingCostPerCard' // Include pasting cost in total calculation
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate totals for invoice
  const calculateInvoiceTotals = () => {
    const costs = calculateTotalCosts();
    const quantity = parseInt(order.jobDetails?.quantity) || 0;
    
    const subtotal = costs.totalCostPerCard * quantity;
    const discount = subtotal * (invoiceData.discount / 100);
    const taxableAmount = subtotal - discount;
    const tax = invoiceData.showTax ? (taxableAmount * (invoiceData.taxRate / 100)) : 0;
    const total = taxableAmount + tax;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalQuantity: quantity
    };
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    try {
      // Wait for any images to load
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
      pdf.save(`${activeView === 'invoice' ? 'Invoice' : 'Job_Ticket'}_${order.clientName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Get invoice totals
  const invoiceTotals = calculateInvoiceTotals();
  
  // Get client info for invoice
  const clientInfo = {
    name: order.clientName,
    id: order.clientId || 'unknown'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeView === 'details' ? 'Order Details' : 
               activeView === 'invoice' ? 'Invoice' : 'Job Ticket'}
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

        {/* Stage Progression */}
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
              {/* Order and Paper Details */}
              {renderSectionInGrid("Order and Paper", {
                clientName: order.clientName,
                projectName: order.projectName,
                date: order.date,
                deliveryDate: order.deliveryDate,
                jobType: order.jobDetails?.jobType,
                quantity: order.jobDetails?.quantity,
                paperProvided: order.jobDetails?.paperProvided,
                paperName: order.jobDetails?.paperName,
                dieCode: order.dieDetails?.dieCode,
                dieSize: `${order.dieDetails?.dieSize?.length || ''} x ${order.dieDetails?.dieSize?.breadth || ''}`,
                image: order.dieDetails?.image
              })}

              {/* Process Details */}
              <div className="space-y-4 bg-white">
                {order.lpDetails?.isLPUsed && 
                  renderSectionInFlex("LP Details", order.lpDetails, ["isLPUsed"])}
                {order.fsDetails?.isFSUsed &&
                  renderSectionInFlex("FS Details", order.fsDetails, ["isFSUsed"])}
                {order.embDetails?.isEMBUsed &&
                  renderSectionInFlex("EMB Details", order.embDetails, ["isEMBUsed"])}
                {order.digiDetails?.isDigiUsed &&
                  renderSectionInFlex("Digi Details", order.digiDetails, ["isDigiUsed"])}
                {order.dieCutting?.isDieCuttingUsed &&
                  renderSectionInFlex("Die Cutting", order.dieCutting, ["isDieCuttingUsed"])}
                {order.sandwich?.isSandwichComponentUsed && (
                  <div>
                    {order.sandwich.lpDetailsSandwich?.isLPUsed &&
                      renderSectionInFlex("Sandwich LP Details", order.sandwich.lpDetailsSandwich, ["isLPUsed"])}
                    {order.sandwich.fsDetailsSandwich?.isFSUsed &&
                      renderSectionInFlex("Sandwich FS Details", order.sandwich.fsDetailsSandwich, ["isFSUsed"])}
                    {order.sandwich.embDetailsSandwich?.isEMBUsed &&
                      renderSectionInFlex("Sandwich EMB Details", order.sandwich.embDetailsSandwich, ["isEMBUsed"])}
                  </div>
                )}
                {order.pasting?.isPastingUsed &&
                  renderSectionInFlex("Pasting Details", order.pasting, ["isPastingUsed"])}
              </div>

              {/* Cost Information */}
              {order.calculations && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {costFieldsOrder
                      .filter(key => 
                        key !== 'pastingCostPerCard' && // Handle pasting cost separately
                        order.calculations[key] !== null && 
                        order.calculations[key] !== undefined &&
                        order.calculations[key] !== "" &&
                        order.calculations[key] !== "Not Provided" && 
                        parseFloat(order.calculations[key]) > 0
                      )
                      .map((key) => (
                        <div
                          key={key}
                          className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                        >
                          <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                          <span className="text-gray-800">₹ {parseFloat(order.calculations[key]).toFixed(2)}</span>
                        </div>
                      ))}
                      
                    {/* Special handling for pasting cost */}
                    {order.pasting?.isPastingUsed && (
                      <div 
                        className={`flex justify-between items-center bg-gray-100 p-2 rounded-md ${
                          parseFloat(order.calculations.pastingCostPerCard || 0) === 0 && order.calculations.totalPastingCost && parseFloat(order.calculations.totalPastingCost) > 0 
                            ? "border border-blue-300" : ""
                        }`}
                      >
                        <span className="font-medium text-gray-600">Pasting Cost:</span>
                        <div className="text-right">
                          <div className="text-gray-800">₹ {parseFloat(order.calculations.pastingCostPerCard || 0).toFixed(2)} per card</div>
                          {order.calculations.totalPastingCost && parseFloat(order.calculations.totalPastingCost) > 0 && (
                            <div className="text-xs text-gray-600">
                              (Total: ₹ {order.calculations.totalPastingCost} for all cards)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Cost Summary with Wastage and Overhead */}
                  <div className="mt-6 bg-gray-100 p-4 rounded-md">
                    {(() => {
                      const costs = calculateTotalCosts();
                      const quantity = order.jobDetails?.quantity || 0;
                      
                      return (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Base Cost per Card:</span>
                              <span className="text-gray-900">
                                ₹ {costs.baseCost.toFixed(2)}
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
                            <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                              <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                              <span className="text-lg font-bold text-gray-900">
                                ₹ {costs.totalCostPerCard.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                            <span className="text-lg font-bold text-gray-700">
                              Total Cost ({quantity} pcs):
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                              ₹ {costs.totalCost.toFixed(2)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div ref={contentRef} className="p-6">
              {activeView === 'invoice' ? (
                <InvoiceTemplate
                  invoiceData={invoiceData}
                  orders={[order]}
                  clientInfo={clientInfo}
                  totals={invoiceTotals}
                />
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