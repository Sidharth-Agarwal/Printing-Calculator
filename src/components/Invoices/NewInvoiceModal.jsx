import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceTemplate from './InvoiceTemplate';

const NewInvoiceModal = ({ orders, onClose, selectedOrderIds }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
  const contentRef = useRef(null);
  
  // Get client info (all orders should be from the same client)
  const clientInfo = orders.length > 0 ? {
    name: orders[0].clientName,
    id: orders[0].clientId
  } : { name: 'Unknown Client', id: 'unknown' };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Calculate totals for all orders
  const calculateTotals = () => {
    let subtotal = 0;
    let totalQuantity = 0;
    
    orders.forEach(order => {
      // Calculate cost per card
      const calculations = order.calculations || {};
      
      // List of possible cost fields
      const costFields = [
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
      
      // Calculate cost per card by summing all applicable costs
      const costPerCard = costFields.reduce((total, field) => {
        const value = calculations[field];
        return total + (value !== null && value !== undefined ? parseFloat(value) || 0 : 0);
      }, 0);
      
      // Apply overheads and wastage
      const wastageRate = 0.05; // 5%
      const overheadRate = 0.35; // 35%
      
      const wastage = costPerCard * wastageRate;
      const overhead = costPerCard * overheadRate;
      const totalCostPerCard = costPerCard + wastage + overhead;
      
      // Calculate total cost for this order
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      totalQuantity += quantity;
      
      const orderTotal = totalCostPerCard * quantity;
      subtotal += orderTotal;
    });
    
    // Calculate discount amount
    const discountAmount = (subtotal * (invoiceData.discount / 100)) || 0;
    
    // Calculate tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = invoiceData.showTax ? (taxableAmount * (invoiceData.taxRate / 100)) : 0;
    
    // Calculate final total
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      tax: parseFloat(taxAmount.toFixed(2)),
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
      
      // Generate PDF
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
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
          {/* Invoice Controls */}
          <div className="p-6 md:w-1/3 overflow-y-auto border-r border-gray-200">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invoice Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoiceData.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={invoiceData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="showTax"
                  checked={invoiceData.showTax}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Include Tax (GST)
                </label>
              </div>
              
              {invoiceData.showTax && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={invoiceData.taxRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Payment terms, delivery notes, etc."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={invoiceData.additionalInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Bank details, etc."
                ></textarea>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Invoice Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({invoiceData.discount}%):</span>
                      <span>-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  {invoiceData.showTax && (
                    <div className="flex justify-between">
                      <span>Tax ({invoiceData.taxRate}%):</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
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

export default NewInvoiceModal;