import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

// Format currency values
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Single Page Content Component for PDF generation
const SinglePageContent = ({ 
  pageNumber, totalPages, estimates, allLineItems, totals, hsnSummary, 
  clientInfo, version, currentDate, usedProcesses, formatCurrency,
  logoLoaded, setLogoLoaded, logo 
}) => {
  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === totalPages;

  return (
    <div className="p-4" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900">ESTIMATE</h1>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Page {pageNumber} of {totalPages}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-2">Version: {version}</div>
          
          {/* Client Info - Show on every page */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Client:</h2>
            <div className="font-medium">{clientInfo?.name || "Unknown Client"}</div>
            <div className="text-gray-600 text-sm">{clientInfo?.address?.city || ""}</div>
            {clientInfo?.address?.city && clientInfo?.address?.state && (
              <div className="text-gray-600 text-sm">
                {clientInfo.address.city}, {clientInfo.address.state}
              </div>
            )}
            <div className="text-gray-600 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
          </div>
          
          {/* Date Information - Show on every page */}
          <div className="mt-2 mb-2">
            <div className="text-sm">
              <div className="text-gray-600">Estimate Date: {currentDate}</div>
              <div className="text-gray-600">Tentative Delivery Date: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              
              {/* Process Legend - Show on every page */}
              {usedProcesses.length > 0 && (
                <div className="mt-3 mb-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Processes:</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {usedProcesses.map((process, index) => (
                      <div key={index} className="flex items-center">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs mr-2 min-w-[3rem] text-center">
                          {process.abbreviation}
                        </span>
                        <span>{process.fullForm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Company Info */}
        <div className="text-right">
          <img 
            src={logo} 
            alt="Famous Letterpress" 
            className="w-16 h-16 object-contain mb-2 ml-auto"
            onLoad={() => setLogoLoaded(true)}
            onError={() => {
              console.error("Logo failed to load");
              setLogoLoaded(true);
            }}
          />
          <div className="font-bold text-lg text-gray-900">FAMOUS</div>
          <div className="text-gray-600 text-sm">91 Tetris Building, Subjail Tinali</div>
          <div className="text-gray-600 text-sm">Dimapur-797112, Nagaland, India</div>
          <div className="text-gray-600 text-sm">GSTIN: 13ALFPA2458Q2ZO</div>
          <div className="text-gray-600 text-sm">Phone: +919233152718</div>
          <div className="text-gray-600 text-sm">Email: info@famousletterpress.com</div>
          
          <div className="my-2">
            <div className="text-sm">
              <div className="font-medium">Bank Details</div>
              <div className="text-gray-600">A/C No: 912020005432066</div>
              <div className="text-gray-600">IFSC Code: UTIB0000378</div>
              <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Line Items Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
              <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Size</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Qty</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Unit Cost</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Total</th>
              <th className="py-1 px-2 border border-gray-300 text-center">GST %</th>
              <th className="py-1 px-2 border border-gray-300 text-right">GST Amt</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Final Total</th>
            </tr>
          </thead>
          <tbody>
            {allLineItems.map((item) => (
              <tr key={item.id} className="text-gray-700">
                <td className="py-1 px-2 border border-gray-300 text-center">{item.serialNumber}</td>
                <td className="py-1 px-2 border border-gray-300">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.paperInfo}</td>
                <td className="py-1 px-2 border border-gray-300 text-center whitespace-nowrap">{item.productDimensions}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.quantity}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.total.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.gstRate}%</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary - Only show on last page */}
      {isLastPage && (
        <div className="flex justify-end mb-3">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm border-t border-gray-200">
              <div className="text-gray-700">{totalPages > 1 ? 'Grand Total:' : 'Subtotal:'}</div>
              <div className="text-gray-900 font-medium font-mono">
                {formatCurrency(totals.amount)}
              </div>
            </div>
            
            <div className="flex justify-between py-1 text-sm">
              <div className="text-gray-700">GST Amount:</div>
              <div className="text-gray-900 font-mono">
                {formatCurrency(totals.gstAmount)}
              </div>
            </div>
            
            <div className="flex justify-between py-1 font-bold border-t border-gray-300">
              <div>Total:</div>
              <div className="font-mono">
                {formatCurrency(totals.total)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* HSN Summary - Only on last page */}
      {isLastPage && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-1">HSN Summary:</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-4 border border-gray-300 text-left">HSN Code</th>
                <th className="py-1 px-4 border border-gray-300 text-left">Job Types</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hsnSummary).map(([hsnCode, data], idx) => (
                <tr key={idx}>
                  <td className="py-1 px-4 border border-gray-300 font-mono">{hsnCode}</td>
                  <td className="py-1 px-4 border border-gray-300">{data.jobTypes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Terms and Conditions - Only on last page */}
      {isLastPage && (
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
          <div className="text-gray-600 text-xs">
            <div>1. This estimate is valid for 7 days from the date of issue.</div>
            <div>2. 100% advance payment is required to confirm the order.</div>
            <div>3. Final artwork approval is required before production.</div>
            <div>4. Delivery time will be confirmed upon order confirmation.</div>
            <div>5. Prices are subject to change based on final specifications.</div>
          </div>
        </div>
      )}
      
      {/* Footer - Show on every page */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2">
          <div>
            <div className="font-medium mb-1 text-xs">Note</div>
            <div className="text-xs text-gray-600">
              This is just an estimate, not a tax invoice. Prices may vary based on final specifications and quantity.
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium mb-6">for FAMOUS</div>
            <div className="text-xs">Authorised Signatory</div>
          </div>
        </div>
      </div>
      
      {/* Print Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>This is a computer generated estimate and does not require a signature.</p>
      </div>
    </div>
  );
};

// Page Content Component for Preview mode
const PageContent = ({ 
  pageNumber, totalPages, isFirstPage, isLastPage, pageLineItems, 
  pageTotals, totals, hsnSummary, clientInfo, version, currentDate, 
  usedProcesses, estimates, formatCurrency, logoLoaded, setLogoLoaded, logo 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return String(dateString);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900">ESTIMATE</h1>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Page {pageNumber} of {totalPages}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-2">Version: {version}</div>
          
          {/* Client Info - Show on every page */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Client:</h2>
            <div className="font-medium">{clientInfo?.name || "Unknown Client"}</div>
            <div className="text-gray-600 text-sm">{clientInfo?.address?.city || ""}</div>
            {clientInfo?.address?.city && clientInfo?.address?.state && (
              <div className="text-gray-600 text-sm">
                {clientInfo.address.city}, {clientInfo.address.state}
              </div>
            )}
            <div className="text-gray-600 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
          </div>
          
          {/* Date Information - Show on every page */}
          <div className="mt-2 mb-2">
            <div className="text-sm">
              <div className="text-gray-600">Estimate Date: {currentDate}</div>
              <div className="text-gray-600">Tentative Delivery Date: {formatDate(estimates[0]?.deliveryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}</div>
              
              {/* Process Legend - Show on every page */}
              {usedProcesses.length > 0 && (
                <div className="mt-3 mb-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Processes:</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {usedProcesses.map((process, index) => (
                      <div key={index} className="flex items-center">
                        <span>
                          {process.abbreviation} - {process.fullForm}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Company Info */}
        <div className="text-right">
          <img 
            src={logo} 
            alt="Famous Letterpress" 
            className="w-16 h-16 object-contain mb-2 ml-auto"
            onLoad={() => setLogoLoaded(true)}
            onError={() => {
              console.error("Logo failed to load");
              setLogoLoaded(true);
            }}
          />
          <div className="font-bold text-lg text-gray-900">FAMOUS</div>
          <div className="text-gray-600 text-sm">91 Tetris Building, Subjail Tinali</div>
          <div className="text-gray-600 text-sm">Dimapur-797112, Nagaland, India</div>
          <div className="text-gray-600 text-sm">GSTIN: 13ALFPA2458Q2ZO</div>
          <div className="text-gray-600 text-sm">Phone: +919233152718</div>
          <div className="text-gray-600 text-sm">Email: info@famousletterpress.com</div>
          
          <div className="my-2">
            <div className="text-sm">
              <div className="font-medium">Bank Details</div>
              <div className="text-gray-600">A/C No: 912020005432066</div>
              <div className="text-gray-600">IFSC Code: UTIB0000378</div>
              <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Line Items Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
              <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Size</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Qty</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Unit Cost</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Total</th>
              <th className="py-1 px-2 border border-gray-300 text-center">GST %</th>
              <th className="py-1 px-2 border border-gray-300 text-right">GST Amt</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Final Total</th>
            </tr>
          </thead>
          <tbody>
            {pageLineItems.map((item) => (
              <tr key={item.id} className="text-gray-700">
                <td className="py-1 px-2 border border-gray-300 text-center">{item.serialNumber}</td>
                <td className="py-1 px-2 border border-gray-300">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.paperInfo}</td>
                <td className="py-1 px-2 border border-gray-300 text-center whitespace-nowrap">{item.productDimensions}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.quantity}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.total.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.gstRate}%</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary - Only show on last page */}
      {isLastPage && (
        <div className="flex justify-end mb-3">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm border-t border-gray-200">
              <div className="text-gray-700">{totalPages > 1 ? 'Grand Total:' : 'Subtotal:'}</div>
              <div className="text-gray-900 font-medium font-mono">
                {formatCurrency(totals.amount)}
              </div>
            </div>
            
            <div className="flex justify-between py-1 text-sm">
              <div className="text-gray-700">GST Amount:</div>
              <div className="text-gray-900 font-mono">
                {formatCurrency(totals.gstAmount)}
              </div>
            </div>
            
            <div className="flex justify-between py-1 font-bold border-t border-gray-300">
              <div>Total:</div>
              <div className="font-mono">
                {formatCurrency(totals.total)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* HSN Summary - Only on last page */}
      {isLastPage && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-1">HSN Summary:</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-4 border border-gray-300 text-left">HSN Code</th>
                <th className="py-1 px-4 border border-gray-300 text-left">Job Types</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hsnSummary).map(([hsnCode, data], idx) => (
                <tr key={idx}>
                  <td className="py-1 px-4 border border-gray-300 font-mono">{hsnCode}</td>
                  <td className="py-1 px-4 border border-gray-300">{data.jobTypes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Terms and Conditions - Only on last page */}
      {isLastPage && (
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
          <div className="text-gray-600 text-xs">
            <div>1. This estimate is valid for 7 days from the date of issue.</div>
            <div>2. 100% advance payment is required to confirm the order.</div>
            <div>3. Final artwork approval is required before production.</div>
            <div>4. Delivery time will be confirmed upon order confirmation.</div>
            <div>5. Prices are subject to change based on final specifications.</div>
          </div>
        </div>
      )}
      
      {/* Footer - Show on every page */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2">
          <div>
            <div className="font-medium mb-1 text-xs">Note</div>
            <div className="text-xs text-gray-600">
              This is just an estimate, not a tax invoice. Prices may vary based on final specifications and quantity.
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium mb-6">for FAMOUS</div>
            <div className="text-xs">Authorised Signatory</div>
          </div>
        </div>
      </div>
      
      {/* Print Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>This is a computer generated estimate and does not require a signature.</p>
      </div>
    </>
  );
};

// Main Job Ticket component
const EstimateTemplate = ({ 
  estimates, 
  clientInfo, 
  version, 
  onRenderComplete,
  currentPage = null,     // For PDF generation: which page is this?
  totalPages = null,      // For PDF generation: total pages
  allEstimates = null     // For PDF generation: all estimates for grand total
}) => {
  const [isReady, setIsReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Pagination constants
  const ESTIMATES_PER_PAGE = 5;
  
  // If currentPage is provided, we're in PDF generation mode (single page)
  // Otherwise, we're in normal preview mode (multi-page)
  const isPDFMode = currentPage !== null;
  const calculatedTotalPages = isPDFMode ? totalPages : Math.ceil((estimates?.length || 0) / ESTIMATES_PER_PAGE);

  // UPDATED: Enhanced date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(dateString);
    }
  };

  // Get unique processes used across all estimates
  const getUsedProcesses = () => {
    if (!estimates || estimates.length === 0) return [];
    
    const processMap = {
      'LP': 'Letter Press',
      'FS': 'Foil Stamping', 
      'EMB': 'Embossing',
      'Digi': 'Digital Printing',
      'Notebook': 'Notebook Binding',
      'Screen': 'Screen Printing'
    };
    
    const usedProcesses = new Set();
    
    estimates.forEach(estimate => {
      if (estimate?.lpDetails?.isLPUsed) usedProcesses.add('LP');
      if (estimate?.fsDetails?.isFSUsed) usedProcesses.add('FS');
      if (estimate?.embDetails?.isEMBUsed) usedProcesses.add('EMB');
      if (estimate?.digiDetails?.isDigiUsed) usedProcesses.add('Digi');
      if (estimate?.notebookDetails?.isNotebookUsed) usedProcesses.add('Notebook');
      if (estimate?.screenPrint?.isScreenPrintUsed) usedProcesses.add('Screen');
    });
    
    return Array.from(usedProcesses).map(abbr => ({
      abbreviation: abbr,
      fullForm: processMap[abbr] || abbr
    }));
  };

  // Get the current date for the document
  const currentDate = formatDate(new Date());
  const usedProcesses = getUsedProcesses();

  // Calculate total quantities and amounts for ALL estimates
  const totals = React.useMemo(() => {
    // In PDF mode, use allEstimates for grand total, otherwise use estimates
    const estimatesForTotal = isPDFMode && allEstimates ? allEstimates : estimates;
    
    if (!estimatesForTotal || estimatesForTotal.length === 0) {
      return { quantity: 0, amount: 0, gstRate: 18, gstAmount: 0, total: 0 };
    }

    let totalQuantity = 0;
    let totalAmount = 0;
    let totalGST = 0;
    let gstRate = 18;

    estimatesForTotal.forEach(estimate => {
      const qty = parseInt(estimate?.jobDetails?.quantity) || 0;
      const calc = estimate?.calculations || {};
      
      const costPerCard = parseFloat(calc.totalCostPerCard || 0);
      const amount = costPerCard * qty;
      
      const estimateGSTRate = calc.gstRate || 18;
      const gstAmount = parseFloat(calc.gstAmount || (amount * estimateGSTRate / 100)) || 0;
      
      totalQuantity += qty;
      totalAmount += amount;
      totalGST += gstAmount;
      gstRate = estimateGSTRate;
    });

    return {
      quantity: totalQuantity,
      amount: totalAmount,
      gstRate: gstRate,
      gstAmount: totalGST,
      total: totalAmount + totalGST
    };
  }, [estimates, allEstimates, isPDFMode]);

  // Prepare line items with global serial numbers
  const allLineItems = React.useMemo(() => {
    if (!estimates || estimates.length === 0) return [];

    return estimates.map((estimate, index) => {
      const jobDetails = estimate?.jobDetails || {};
      const dieDetails = estimate?.dieDetails || {};
      const calc = estimate?.calculations || {};
      
      const paperName = jobDetails.paperName || "Standard Paper";
      const paperGsm = jobDetails.paperGsm || "";
      const paperCompany = jobDetails.paperCompany || "";
      const paperInfo = paperName + (paperGsm ? ` ${paperGsm}gsm` : '') + (paperCompany ? ` (${paperCompany})` : '');
      const hsnCode = jobDetails.hsnCode || "N/A";
      
      const features = [];
      if (estimate?.lpDetails?.isLPUsed) features.push("LP");
      if (estimate?.fsDetails?.isFSUsed) features.push("FS");
      if (estimate?.embDetails?.isEMBUsed) features.push("EMB");
      if (estimate?.digiDetails?.isDigiUsed) features.push("Digi");
      if (estimate?.notebookDetails?.isNotebookUsed) features.push("Notebook");
      if (estimate?.screenPrint?.isScreenPrintUsed) features.push("Screen");
      
      const quantity = parseInt(jobDetails.quantity) || 0;
      const unitCost = parseFloat(calc.totalCostPerCard || 0);
      const totalCost = unitCost * quantity;
      
      const gstRate = calc.gstRate || 18;
      const gstAmount = parseFloat(calc.gstAmount || (totalCost * gstRate / 100)) || 0;
      const finalTotal = totalCost + gstAmount;
      
      const productSize = dieDetails?.productSize || {};
      const productDimensions = productSize.length && productSize.breadth 
        ? productSize.length + "″ × " + productSize.breadth + "″"
        : "";
      
      return {
        id: estimate.id || `est-${index}`,
        name: estimate.projectName || "Unnamed Project",
        description: features.join(", "),
        jobType: jobDetails.jobType || "Card",
        paperInfo: paperInfo,
        dieCode: dieDetails.dieCode || "",
        productDimensions: productDimensions,
        quantity: quantity,
        price: unitCost,
        total: totalCost,
        gstRate: gstRate,
        gstAmount: gstAmount,
        finalTotal: finalTotal,
        hsnCode: hsnCode,
        serialNumber: index + 1
      };
    });
  }, [estimates]);

  // HSN Summary for all estimates
  const hsnSummary = React.useMemo(() => {
    // In PDF mode, use allEstimates for complete HSN summary
    const estimatesForHSN = isPDFMode && allEstimates ? allEstimates : estimates;
    
    if (!estimatesForHSN || estimatesForHSN.length === 0) return {};

    const allItems = estimatesForHSN.map((estimate, index) => {
      const jobDetails = estimate?.jobDetails || {};
      const hsnCode = jobDetails.hsnCode || "N/A";
      const jobType = jobDetails.jobType || "Card";
      return { hsnCode, jobType };
    });

    return allItems.reduce((acc, item) => {
      if (!acc[item.hsnCode]) {
        acc[item.hsnCode] = {
          jobTypes: [item.jobType],
          count: 1
        };
      } else {
        if (!acc[item.hsnCode].jobTypes.includes(item.jobType)) {
          acc[item.hsnCode].jobTypes.push(item.jobType);
        }
        acc[item.hsnCode].count++;
      }
      return acc;
    }, {});
  }, [allLineItems, allEstimates, isPDFMode]);

  useEffect(() => {
    if (onRenderComplete) {
      const timer = setTimeout(() => {
        setIsReady(true);
        onRenderComplete();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [onRenderComplete, logoLoaded]);

  if (!estimates || estimates.length === 0) {
    return (
      <div className="bg-white p-4 print:p-0 text-center" style={{ maxWidth: '750px', margin: '0 auto' }}>
        <p className="text-gray-500">No estimates to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '85%' }}>
      {!isReady && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-center">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p className="text-blue-500 text-sm">Loading estimate...</p>
          </div>
        </div>
      )}

      <div className={!isReady ? 'opacity-0' : 'opacity-100'}>
        {isPDFMode ? (
          // PDF Mode: Render single page
          <SinglePageContent 
            pageNumber={currentPage}
            totalPages={calculatedTotalPages}
            estimates={estimates}
            allLineItems={allLineItems}
            totals={totals}
            hsnSummary={hsnSummary}
            clientInfo={clientInfo}
            version={version}
            currentDate={currentDate}
            usedProcesses={usedProcesses}
            formatCurrency={formatCurrency}
            logoLoaded={logoLoaded}
            setLogoLoaded={setLogoLoaded}
            logo={logo}
          />
        ) : (
          // Preview Mode: Render all pages
          Array.from({ length: calculatedTotalPages }, (_, pageIndex) => {
            const pageNumber = pageIndex + 1;
            const isFirstPage = pageNumber === 1;
            const isLastPage = pageNumber === calculatedTotalPages;
            
            // Calculate which estimates belong to this page
            const startIndex = (pageNumber - 1) * ESTIMATES_PER_PAGE;
            const endIndex = Math.min(startIndex + ESTIMATES_PER_PAGE, allLineItems.length);
            const pageLineItems = allLineItems.slice(startIndex, endIndex);
            
            // Calculate page totals
            const pageTotals = pageLineItems.reduce((acc, item) => {
              acc.amount += item.total;
              acc.gstAmount += item.gstAmount;
              acc.total += item.finalTotal;
              return acc;
            }, { amount: 0, gstAmount: 0, total: 0 });

            return (
              <div 
                key={pageNumber} 
                className={`p-4 print:p-0 print-page ${pageNumber > 1 ? 'print:break-before-page' : ''}`}
                style={{ 
                  minHeight: pageNumber > 1 ? '100vh' : 'auto',
                  pageBreakBefore: pageNumber > 1 ? 'always' : 'auto',
                  pageBreakAfter: 'auto'
                }}
              >
                <PageContent 
                  pageNumber={pageNumber}
                  totalPages={calculatedTotalPages}
                  isFirstPage={isFirstPage}
                  isLastPage={isLastPage}
                  pageLineItems={pageLineItems}
                  pageTotals={pageTotals}
                  totals={totals}
                  hsnSummary={hsnSummary}
                  clientInfo={clientInfo}
                  version={version}
                  currentDate={currentDate}
                  usedProcesses={usedProcesses}
                  estimates={estimates}
                  formatCurrency={formatCurrency}
                  logoLoaded={logoLoaded}
                  setLogoLoaded={setLogoLoaded}
                  logo={logo}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EstimateTemplate;