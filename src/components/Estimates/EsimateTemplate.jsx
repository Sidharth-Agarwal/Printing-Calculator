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

// Main Job Ticket component
const EstimateTemplate = ({ estimates, clientInfo, version, onRenderComplete }) => {
  const [isReady, setIsReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // UPDATED: Enhanced date formatting with last updated info
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

  // ADDED: Get the most recent activity date from estimates
  const getLastUpdatedDate = () => {
    if (!estimates || estimates.length === 0) return null;
    
    // Find the most recent updatedAt timestamp across all estimates
    let latestTimestamp = null;
    let latestEstimate = null;
    
    estimates.forEach(estimate => {
      const updatedAt = estimate.updatedAt || estimate.createdAt;
      if (updatedAt) {
        const timestamp = new Date(updatedAt).getTime();
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestEstimate = estimate;
        }
      }
    });
    
    return {
      date: latestTimestamp ? formatDate(new Date(latestTimestamp)) : null,
      estimate: latestEstimate
    };
  };

  // ADDED: Check if any estimate was recently updated (within 24 hours)
  const hasRecentUpdates = () => {
    if (!estimates || estimates.length === 0) return false;
    
    const now = new Date().getTime();
    return estimates.some(estimate => {
      const updatedAt = estimate.updatedAt;
      if (!updatedAt) return false;
      
      try {
        const updateTime = new Date(updatedAt).getTime();
        const hoursDiff = (now - updateTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      } catch {
        return false;
      }
    });
  };

  // Get the current date for the document
  const currentDate = formatDate(new Date());
  
  // ADDED: Get last updated information
  const lastUpdatedInfo = getLastUpdatedDate();
  const recentlyUpdated = hasRecentUpdates();

  // Calculate total quantities and amounts
  const totals = React.useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalGST = 0;
    let totalWithGST = 0;
    let gstRate = 18; // Default GST rate

    estimates.forEach(estimate => {
      const qty = parseInt(estimate?.jobDetails?.quantity) || 0;
      const calc = estimate?.calculations || {};
      
      // Get per card cost
      const costPerCard = parseFloat(calc.totalCostPerCard || 0);
      const amount = costPerCard * qty;
      
      // Get GST info
      const estimateGSTRate = calc.gstRate || 18;
      const gstAmount = parseFloat(calc.gstAmount || (amount * estimateGSTRate / 100)) || 0;
      
      // Update totals
      totalQuantity += qty;
      totalAmount += amount;
      totalGST += gstAmount;
      
      // Use the last GST rate (in case estimates have different rates)
      gstRate = estimateGSTRate;
    });

    totalWithGST = totalAmount + totalGST;

    return {
      quantity: totalQuantity,
      amount: totalAmount,
      gstRate: gstRate,
      gstAmount: totalGST,
      total: totalWithGST
    };
  }, [estimates]);

  // Prepare line items similar to invoice format
  const lineItems = React.useMemo(() => {
    return estimates.map((estimate, index) => {
      const jobDetails = estimate?.jobDetails || {};
      const dieDetails = estimate?.dieDetails || {};
      const calc = estimate?.calculations || {};
      
      // Get paper details with GSM
      const paperName = jobDetails.paperName || "Standard Paper";
      const paperGsm = jobDetails.paperGsm || "";
      const paperCompany = jobDetails.paperCompany || "";
      
      // Format paper info including GSM if available
      const paperInfo = paperName + (paperGsm ? ` ${paperGsm}gsm` : '') + (paperCompany ? ` (${paperCompany})` : '');
      
      // Get HSN code from jobDetails if available
      const hsnCode = jobDetails.hsnCode || "N/A";
      
      // Get processing features - UNCOMMENTED AND UPDATED THIS SECTION
      const features = [];
      if (estimate?.lpDetails?.isLPUsed) features.push("Letterpress");
      if (estimate?.fsDetails?.isFSUsed) features.push("Foil Stamping");
      if (estimate?.embDetails?.isEMBUsed) features.push("Embossing");
      if (estimate?.digiDetails?.isDigiUsed) features.push("Digital Print");
      if (estimate?.notebookDetails?.isNotebookUsed) features.push("Notebook");
      if (estimate?.screenPrint?.isScreenPrintUsed) features.push("Screen Print");
      if (estimate?.preDieCutting?.isPreDieCuttingUsed) features.push("Pre Die Cutting");
      if (estimate?.dieCutting?.isDieCuttingUsed) features.push("Die Cutting");
      if (estimate?.postDC?.isPostDCUsed) features.push("Post Die Cutting");
      if (estimate?.foldAndPaste?.isFoldAndPasteUsed) features.push("Fold & Paste");
      if (estimate?.dstPaste?.isDstPasteUsed) features.push("DST Paste");
      if (estimate?.magnet?.isMagnetUsed) features.push("Magnet");
      if (estimate?.qc?.isQCUsed) features.push("Quality Check");
      if (estimate?.packing?.isPackingUsed) features.push("Packing");
      if (estimate?.sandwich?.isSandwichComponentUsed) features.push("Sandwich/Duplex");
      if (estimate?.misc?.isMiscUsed) features.push("Misc");
      
      // Get quantities and costs
      const quantity = parseInt(jobDetails.quantity) || 0;
      const unitCost = parseFloat(calc.totalCostPerCard || 0);
      const totalCost = unitCost * quantity;
      
      // GST calculations
      const gstRate = calc.gstRate || 18;
      const gstAmount = parseFloat(calc.gstAmount || (totalCost * gstRate / 100)) || 0;
      const finalTotal = totalCost + gstAmount;
      
      // Product dimensions - format as single line
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
        hsnCode: hsnCode
      };
    });
  }, [estimates]);

  // Call onRenderComplete when component is done rendering
  useEffect(() => {
    if (onRenderComplete) {
      // Set a delay to ensure images have loaded
      const timer = setTimeout(() => {
        setIsReady(true);
        onRenderComplete();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [onRenderComplete, logoLoaded]);

  return (
    <div className="bg-white p-4 print:p-0" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '85%' }}>
      {/* Loading indicator */}
      {!isReady && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-center">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p className="text-blue-500 text-sm">Loading estimate...</p>
          </div>
        </div>
      )}

      <div className={!isReady ? 'opacity-0' : 'opacity-100'}>
        {/* Header with Title and Logo */}
        <div className="flex justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">ESTIMATE</h1>
              {/* ADDED: Recently updated indicator */}
              {recentlyUpdated && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  RECENTLY UPDATED
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-2">Version: {version}</div>
            
            {/* Client Info - Positioned directly under version */}
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
            
            {/* UPDATED: Date Information with Last Updated */}
            <div className="mt-2 mb-2">
              <div className="text-sm">
                <div className="text-gray-600">Estimate Date: {currentDate}</div>
                <div className="text-gray-600">Tentative Delivery Date: {formatDate(estimates[0]?.deliveryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}</div>
                
                {/* ADDED: Last updated information */}
                {/* {lastUpdatedInfo.date && (
                  <div className="text-gray-500 text-xs mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Last Updated: {lastUpdatedInfo.date}
                    {lastUpdatedInfo.estimate?.projectName && (
                      <span className="ml-1">({lastUpdatedInfo.estimate.projectName})</span>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          </div>
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
            
            {/* Bank Details moved to right side, below company info */}
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
        
        {/* Line Items */}
        <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
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
              {lineItems.map((item, index) => (
                <tr key={item.id} className="text-gray-700">
                  <td className="py-1 px-2 border border-gray-300 text-center">{index + 1}</td>
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
        
        {/* Added: Process Details Section */}
        {/* <div className="mb-4">
          <div className="font-medium text-sm mb-1">Process Details:</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
                <th className="py-1 px-2 border border-gray-300 text-left">Processes Used</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-1 px-2 border border-gray-300 font-medium">{item.name}</td>
                  <td className="py-1 px-2 border border-gray-300">{item.description || "No special processes"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
        
        {/* Summary */}
        <div className="flex justify-end mb-3">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm border-t border-gray-200">
              <div className="text-gray-700">Subtotal:</div>
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
        
        {/* HSN Summary */}
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
              {(() => {
                // Collect HSN codes from line items
                const hsnSummary = lineItems.reduce((acc, item) => {
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
                
                return Object.entries(hsnSummary).map(([hsnCode, data], idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-4 border border-gray-300 font-mono">{hsnCode}</td>
                    <td className="py-1 px-4 border border-gray-300">{data.jobTypes.join(', ')}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* UPDATED: Terms and Conditions with version note */}
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
          <div className="text-gray-600 text-xs">
            <div>
              <div>1. This estimate is valid for 7 days from the date of issue.</div>
              <div>2. 100% advance payment is required to confirm the order.</div>
              <div>3. Final artwork approval is required before production.</div>
              <div>4. Delivery time will be confirmed upon order confirmation.</div>
              <div>5. Prices are subject to change based on final specifications.</div>
              {lastUpdatedInfo.date && currentDate !== lastUpdatedInfo.date && (
                <div className="mt-1 text-gray-500">
                  6. This estimate was last updated on {lastUpdatedInfo.date}. Please confirm current pricing before proceeding.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2">
            <div>
              <div className="font-medium mb-1 text-xs">Note</div>
              <div className="text-xs text-gray-600">
                This is just an estimate, not a tax invoice. Prices may vary based on final specifications and quantity.
                {recentlyUpdated && (
                  <div className="mt-1 text-blue-600">
                    This estimate includes recent updates - please review all details carefully.
                  </div>
                )}
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
          {/* {lastUpdatedInfo.date && (
            <p>Document generated on {currentDate} | Last updated: {lastUpdatedInfo.date}</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EstimateTemplate;