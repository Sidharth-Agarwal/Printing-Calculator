import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceTemplate from './InvoiceTemplate';

const InvoiceModal = ({ orders, onClose, selectedOrderIds }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    additionalInfo: '',
    discount: 0,
    showTax: true
  });
  const contentRef = useRef(null);
  
  // Get client info (all orders should be from the same client)
  const clientInfo = orders.length > 0 ? {
    name: orders[0].clientName || orders[0].clientInfo?.name,
    clientCode: orders[0].clientInfo?.clientCode || 'N/A',
    address: orders[0].clientInfo?.address || {},
    id: orders[0].clientId,
    clientType: orders[0].clientInfo?.clientType || 'Direct'
  } : { name: 'Unknown Client', id: 'unknown', clientCode: 'N/A', address: {} };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Calculate totals for all orders with GST and loyalty discounts - FIXED GST CALCULATION
  const calculateTotals = () => {
    let subtotal = 0;
    let loyaltyDiscountTotal = 0;
    let totalQuantity = 0;
    
    orders.forEach(order => {
      // Get cost per card from calculations
      const calculations = order.calculations || {};
      const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
      
      // Get quantity
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      totalQuantity += quantity;
      
      // Calculate item total (before loyalty discount)
      const itemTotal = costPerCard * quantity;
      subtotal += itemTotal;
      
      // Apply loyalty discount if available
      const loyaltyDiscountAmount = parseFloat(order.loyaltyInfo?.discountAmount || calculations.loyaltyDiscountAmount || 0);
      loyaltyDiscountTotal += loyaltyDiscountAmount;
    });
    
    // Calculate discount amount (from invoice discount percentage, not loyalty)
    const invoiceDiscountAmount = (subtotal * (invoiceData.discount / 100)) || 0;
    
    // Apply discounts to subtotal to get taxable amount
    const taxableAmount = subtotal - loyaltyDiscountTotal - invoiceDiscountAmount;
    
    // FIXED: Calculate GST on the final taxable amount (after all discounts)
    const gstRate = 18; // Standard GST rate
    const totalGstAmount = invoiceData.showTax ? (taxableAmount * gstRate / 100) : 0;
    
    // Calculate total with GST
    const total = taxableAmount + totalGstAmount;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      loyaltyDiscount: parseFloat(loyaltyDiscountTotal.toFixed(2)),
      discount: parseFloat(invoiceDiscountAmount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      tax: parseFloat(totalGstAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalQuantity
    };
  };
  
  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get HSN data for display in the modal summary
  const getHsnSummary = () => {
    const hsnSummary = {};
    
    orders.forEach(order => {
      // Extract HSN code from the order
      const hsnCode = order.jobDetails?.hsnCode || 'N/A';
      const jobType = order.jobDetails?.jobType || 'Unknown';
      
      if (!hsnSummary[hsnCode]) {
        hsnSummary[hsnCode] = {
          jobTypes: [jobType],
          count: 1
        };
      } else {
        if (!hsnSummary[hsnCode].jobTypes.includes(jobType)) {
          hsnSummary[hsnCode].jobTypes.push(jobType);
        }
        hsnSummary[hsnCode].count++;
      }
    });
    
    return hsnSummary;
  };
  
  // Generate PDF - Improved version with enforced portrait orientation
  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Wait for any images to load
      const images = contentRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Use resolve even for errors to proceed
          // Set a timeout to resolve after 2 seconds in case image loading hangs
          setTimeout(resolve, 2000);
        });
      });
      
      await Promise.all(imagePromises);
      
      // Create a new container with improved settings for PDF generation
      // Setting width to match A4 proportions for portrait mode
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      // Set width to match A4 portrait dimensions ratio (width/height = 210/297)
      container.style.width = '620px'; // Slightly narrower to ensure portrait fit
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.backgroundColor = 'white';
      container.style.overflow = 'visible'; // Prevent scrollbars in rendering
      
      // Clone the invoice content
      const clone = contentRef.current.cloneNode(true);
      
      // Remove any potential overflow issues in the clone
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.style) {
          el.style.overflow = 'visible';
        }
      });
      
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Generate PDF with better settings
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0,
        scrollY: 0, // Fix scroll position issues
        windowWidth: 620, // Match container width for portrait
        onclone: (clonedDoc) => {
          // Additional adjustments to the cloned document if needed
          const clonedContent = clonedDoc.querySelector('[data-html2canvas-clone]');
          if (clonedContent) {
            clonedContent.style.overflow = 'visible';
          }
        }
      });
      
      // Remove the temp container
      document.body.removeChild(container);
      
      // ENFORCE PORTRAIT: Always create PDF in portrait mode regardless of content proportions
      const pdf = new jsPDF({
        orientation: 'portrait', // Always portrait
        unit: 'mm',
        format: 'a4',
        compress: true // Enable compression for smaller file size
      });
      
      // Get PDF dimensions (A4 portrait)
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Calculate image dimensions to fit in PDF while maintaining aspect ratio
      // Adjust width to fit portrait mode
      const imgWidth = pdfWidth - 20; // Add some margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If the content would be too wide for portrait, scale it down
      if (canvas.width / canvas.height > pdfWidth / pdfHeight) {
        const adjustedWidth = pdfWidth - 20; // Leave 10mm margin on each side
        const adjustedHeight = (canvas.height * adjustedWidth) / canvas.width;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), // Slightly reduce quality for smaller file
          'JPEG',
          10, // Left margin of 10mm
          10, // Top margin of 10mm
          adjustedWidth,
          adjustedHeight
        );
      } 
      // If the content would be too tall, scale it down to fit
      else if (imgHeight > pdfHeight - 20) {
        const adjustedHeight = pdfHeight - 20; // Leave 10mm margin top and bottom
        const adjustedWidth = (canvas.width * adjustedHeight) / canvas.height;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          (pdfWidth - adjustedWidth) / 2, // Center horizontally
          10, // Top margin
          adjustedWidth,
          adjustedHeight
        );
      } 
      // Otherwise center it
      else {
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          (pdfWidth - imgWidth) / 2, // Center horizontally
          (pdfHeight - imgHeight) / 2, // Center vertically
          imgWidth,
          imgHeight
        );
      }
      
      // Save the PDF
      pdf.save(`Invoice_${clientInfo.name}_${invoiceData.invoiceNumber}.pdf`);
      
      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Get totals
  const totals = calculateTotals();
  
  // Get HSN summary
  const hsnSummary = getHsnSummary();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Generate Invoice
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>Download Invoice (Portrait)</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isGeneratingPDF}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body - Updated layout for better space utilization */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Invoice Controls - Smaller width */}
          <div className="p-3 md:w-1/5 overflow-y-auto border-r border-gray-200">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Invoice Details</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoiceData.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Payment terms, delivery notes, etc."
                ></textarea>
              </div>
              
              {/* HSN Summary */}
              <div className="mt-2 bg-gray-50 p-2 rounded-lg text-xs">
                <h4 className="font-medium text-gray-700 mb-1">HSN Codes</h4>
                <div className="space-y-0.5">
                  {Object.entries(hsnSummary).map(([hsnCode, data], index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{hsnCode}:</span>
                      <span>{data.jobTypes.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 bg-gray-50 p-2 rounded-lg text-xs">
                <h4 className="font-medium text-gray-700 mb-1">Invoice Summary</h4>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  {totals.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Loyalty Discount:</span>
                      <span className="font-mono">-{formatCurrency(totals.loyaltyDiscount)}</span>
                    </div>
                  )}
                  
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Invoice Discount ({invoiceData.discount}%):</span>
                      <span className="font-mono">-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-gray-300 pt-0.5">
                    <span>Taxable Amount:</span>
                    <span className="font-mono">{formatCurrency(totals.taxableAmount)}</span>
                  </div>
                  
                  {invoiceData.showTax && (
                    <div className="flex justify-between">
                      <span>GST Amount (18%):</span>
                      <span className="font-mono">{formatCurrency(totals.tax)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5 mt-0.5">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
              
              {/* Discount control */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700">
                  Additional Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={invoiceData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.5"
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                />
              </div>
              
              {/* Tax toggle */}
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="showTax"
                  name="showTax"
                  checked={invoiceData.showTax}
                  onChange={handleInputChange}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showTax" className="ml-2 text-xs text-gray-700">
                  Show GST
                </label>
              </div>
            </div>
          </div>
          
          {/* Invoice Preview - Resized for A4 Portrait proportions */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-3">
              <div 
                ref={contentRef} 
                className="bg-white shadow-lg rounded overflow-hidden mx-auto"
                style={{ 
                  maxWidth: '600px', 
                  width: '100%',
                  aspectRatio: '210/297', /* A4 portrait ratio */
                  boxSizing: 'border-box'
                }}
              >
                <InvoiceTemplate
                  invoiceData={invoiceData}
                  orders={orders}
                  clientInfo={clientInfo}
                  totals={totals}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;