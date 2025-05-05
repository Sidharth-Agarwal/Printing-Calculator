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
  
  // Calculate totals for all orders with GST and loyalty discounts
  const calculateTotals = () => {
    let subtotal = 0;
    let loyaltyDiscountTotal = 0;
    let totalQuantity = 0;
    let totalGstAmount = 0;
    
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
      
      // Get discounted total
      const discountedTotal = parseFloat(calculations.discountedTotalCost || (itemTotal - loyaltyDiscountAmount));
      
      // Get GST info from calculations
      const gstRate = calculations.gstRate || 18;
      const gstAmount = invoiceData.showTax ? parseFloat(calculations.gstAmount || (discountedTotal * gstRate / 100)) : 0;
      totalGstAmount += gstAmount;
    });
    
    // Calculate discount amount (from invoice discount percentage, not loyalty)
    const invoiceDiscountAmount = (subtotal * (invoiceData.discount / 100)) || 0;
    
    // Apply discounts to subtotal
    const taxableAmount = subtotal - loyaltyDiscountTotal - invoiceDiscountAmount;
    
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
  
  // Generate PDF
  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Wait for any images to load
      const images = contentRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      await Promise.all(imagePromises);
      
      // Clone the element for PDF generation to avoid affecting the display
      const originalElement = contentRef.current;
      const clonedElement = originalElement.cloneNode(true);
      
      // Temporarily add the cloned element to the body with fixed dimensions
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '800px'; // Fixed width for PDF generation
      document.body.appendChild(clonedElement);
      
      // Generate PDF
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      // Remove the cloned element
      document.body.removeChild(clonedElement);
      
      // Calculate aspect ratio to determine orientation
      const aspectRatio = canvas.width / canvas.height;
      const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
      
      // Create PDF with the appropriate orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = orientation === 'landscape' ? 297 : 210; // A4 width in mm
      const pdfHeight = orientation === 'landscape' ? 210 : 297; // A4 height in mm
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If the image height exceeds the PDF height, adjust scale to fit
      if (imgHeight > pdfHeight) {
        const scale = pdfHeight / imgHeight;
        const adjustedWidth = pdfWidth * scale;
        const adjustedHeight = pdfHeight;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          (pdfWidth - adjustedWidth) / 2, // Center horizontally
          0,
          adjustedWidth,
          adjustedHeight
        );
      } else {
        // Image fits, add it to PDF
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
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
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Invoice
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>Download Invoice</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isGeneratingPDF}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Invoice Controls - Reduced width */}
          <div className="p-4 md:w-1/4 overflow-y-auto border-r border-gray-200">
            <div className="space-y-3">
              <h3 className="text-md font-medium">Invoice Details</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoiceData.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Payment terms, delivery notes, etc."
                ></textarea>
              </div>
              
              {/* HSN Summary */}
              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs">
                <h4 className="font-medium text-gray-700 mb-2">HSN Codes</h4>
                <div className="space-y-1">
                  {Object.entries(hsnSummary).map(([hsnCode, data], index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{hsnCode}:</span>
                      <span>{data.jobTypes.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs">
                <h4 className="font-medium text-gray-700 mb-2">Invoice Summary</h4>
                <div className="space-y-1">
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
                  
                  {invoiceData.showTax && (
                    <div className="flex justify-between">
                      <span>GST Amount:</span>
                      <span className="font-mono">{formatCurrency(totals.tax)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-1">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Preview - Expanded */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <div ref={contentRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
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