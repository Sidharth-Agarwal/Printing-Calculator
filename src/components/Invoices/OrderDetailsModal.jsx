import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import OrderJobTicket from './OrderJobTicket';
import InvoiceTemplate from './InvoiceTemplate';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose, onStageUpdate }) => {
  const [activeView, setActiveView] = useState('details');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const contentRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    paperAndCutting: true,
    production: false,
    postProduction: false,
    wastageAndOverhead: false
  });
  
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
    paperName: "Paper Name",
    // Cost calculation fields
    baseCost: "Base Cost per Card",
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
      setIsUpdatingStage(true);
      await onStageUpdate(newStage);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage");
    } finally {
      setIsUpdatingStage(false);
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
    const calculations = order.calculations;
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
    const calculations = order.calculations;
    if (!calculations) return null;
    
    // Check if any production services are enabled
    const hasLP = order.lpDetails?.isLPUsed;
    const hasFS = order.fsDetails?.isFSUsed;
    const hasEMB = order.embDetails?.isEMBUsed;
    const hasScreenPrint = order.screenPrint?.isScreenPrintUsed;
    const hasDigi = order.digiDetails?.isDigiUsed;
    
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
    const calculations = order.calculations;
    if (!calculations) return null;
    
    // Check if any post-production services are enabled
    const hasDieCutting = order.dieCutting?.isDieCuttingUsed;
    const hasPostDC = order.postDC?.isPostDCUsed;
    const hasFoldAndPaste = order.foldAndPaste?.isFoldAndPasteUsed;
    const hasDstPaste = order.dstPaste?.isDstPasteUsed;
    const hasQC = order.qc?.isQCUsed;
    const hasPacking = order.packing?.isPackingUsed;
    const hasMisc = order.misc?.isMiscUsed;
    const hasSandwich = order.sandwich?.isSandwichComponentUsed;
    
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
    const calculations = order.calculations;
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

  // Render the final cost summary
  const renderCostSummary = () => {
    const calculations = order.calculations;
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
            Total Cost ({order.jobDetails?.quantity || 0} pcs):
          </span>
          <span className="text-xl font-bold text-blue-600">
            ₹ {parseFloat(calculations.totalCost || 0).toFixed(2)}
          </span>
        </div>
      </div>
    );
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

  // Calculate invoice totals
  const calculateInvoiceTotals = () => {
    const totalCostPerCard = parseFloat(order.calculations?.totalCostPerCard || 0);
    const quantity = parseInt(order.jobDetails?.quantity) || 0;
    
    const subtotal = totalCostPerCard * quantity;
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

              {/* Detailed Cost Sections */}
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
                {renderCostSummary()}
              </div>
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