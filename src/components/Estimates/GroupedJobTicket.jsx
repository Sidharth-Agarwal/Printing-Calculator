// import React, { useEffect, useState } from 'react';
// import logo from '../../assets/logo.png';

// // Format currency values
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 2
//   }).format(amount || 0);
// };

// // Main Job Ticket component
// const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
//   const [isReady, setIsReady] = useState(false);
//   const [logoLoaded, setLogoLoaded] = useState(false);

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       });
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return String(dateString);
//     }
//   };

//   // Get the current date for the document
//   const currentDate = formatDate(new Date());

//   // Calculate total quantities and amounts
//   const totals = React.useMemo(() => {
//     let totalQuantity = 0;
//     let totalAmount = 0;
//     let totalGST = 0;
//     let totalWithGST = 0;
//     let gstRate = 18; // Default GST rate

//     estimates.forEach(estimate => {
//       const qty = parseInt(estimate?.jobDetails?.quantity) || 0;
//       const calc = estimate?.calculations || {};
      
//       // Get per card cost
//       const costPerCard = parseFloat(calc.totalCostPerCard || 0);
//       const amount = costPerCard * qty;
      
//       // Get GST info
//       const estimateGSTRate = calc.gstRate || 18;
//       const gstAmount = parseFloat(calc.gstAmount || (amount * estimateGSTRate / 100)) || 0;
      
//       // Update totals
//       totalQuantity += qty;
//       totalAmount += amount;
//       totalGST += gstAmount;
      
//       // Use the last GST rate (in case estimates have different rates)
//       gstRate = estimateGSTRate;
//     });

//     totalWithGST = totalAmount + totalGST;

//     return {
//       quantity: totalQuantity,
//       amount: totalAmount,
//       gstRate: gstRate,
//       gstAmount: totalGST,
//       total: totalWithGST
//     };
//   }, [estimates]);

//   // Prepare line items similar to invoice format
//   const lineItems = React.useMemo(() => {
//     return estimates.map((estimate, index) => {
//       const jobDetails = estimate?.jobDetails || {};
//       const dieDetails = estimate?.dieDetails || {};
//       const calc = estimate?.calculations || {};
      
//       // Get HSN code from jobDetails if available
//       const hsnCode = jobDetails.hsnCode || "N/A";
      
//       // Get processing features
//       const features = [];
//       if (estimate?.lpDetails?.isLPUsed) features.push("Letterpress");
//       if (estimate?.fsDetails?.isFSUsed) features.push("Foil Stamping");
//       if (estimate?.embDetails?.isEMBUsed) features.push("Embossing");
//       if (estimate?.digiDetails?.isDigiUsed) features.push("Digital Print");
//       if (estimate?.sandwich?.isSandwichComponentUsed) features.push("Sandwich");
//       if (estimate?.pasting?.isPastingUsed) features.push("Pasting");
      
//       // Get quantities and costs
//       const quantity = parseInt(jobDetails.quantity) || 0;
//       const unitCost = parseFloat(calc.totalCostPerCard || 0);
//       const totalCost = unitCost * quantity;
      
//       // GST calculations
//       const gstRate = calc.gstRate || 18;
//       const gstAmount = parseFloat(calc.gstAmount || (totalCost * gstRate / 100)) || 0;
//       const finalTotal = totalCost + gstAmount;
      
//       return {
//         id: estimate.id || `est-${index}`,
//         name: estimate.projectName || "Unnamed Project",
//         description: features.join(", "),
//         jobType: jobDetails.jobType || "Card",
//         paperName: jobDetails.paperName || "Standard Paper",
//         dieCode: dieDetails.dieCode || "",
//         quantity: quantity,
//         price: unitCost,
//         total: totalCost,
//         gstRate: gstRate,
//         gstAmount: gstAmount,
//         finalTotal: finalTotal,
//         hsnCode: hsnCode
//       };
//     });
//   }, [estimates]);

//   // Call onRenderComplete when component is done rendering
//   useEffect(() => {
//     if (onRenderComplete) {
//       // Set a delay to ensure images have loaded
//       const timer = setTimeout(() => {
//         setIsReady(true);
//         onRenderComplete();
//       }, 1000);
//       return () => clearTimeout(timer);
//     } else {
//       setIsReady(true);
//     }
//   }, [onRenderComplete, logoLoaded]);

//   return (
//     <div className="bg-white p-4 print:p-0" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '90%' }}>
//       {/* Loading indicator */}
//       {!isReady && (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-pulse text-center">
//             <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
//             <p className="text-blue-500 text-sm">Loading estimate...</p>
//           </div>
//         </div>
//       )}

//       <div className={!isReady ? 'opacity-0' : 'opacity-100'}>
//         {/* Header with Title and Logo */}
//         <div className="flex justify-between mb-1">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">ESTIMATE</h1>
//             <div className="text-sm text-gray-500 mb-2">Version: {version}</div>
            
//             {/* Client Info - Positioned directly under version */}
//             <div>
//               <h2 className="text-sm font-semibold text-gray-700 mb-1">Client:</h2>
//               <div className="font-medium">{clientInfo?.name || "Unknown Client"}</div>
//               <div className="text-gray-600 text-sm">{clientInfo?.address?.line1 || ""}</div>
//               {clientInfo?.address?.line2 && <div className="text-gray-600 text-sm">{clientInfo.address.line2}</div>}
//               {clientInfo?.address?.city && (
//                 <div className="text-gray-600 text-sm">
//                   {clientInfo.address.city}
//                   {clientInfo.address.postalCode && `-${clientInfo.address.postalCode}`}
//                   {clientInfo.address.state && `, ${clientInfo.address.state}`}
//                 </div>
//               )}
//               <div className="text-gray-600 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
//             </div>
            
//             {/* Date Information */}
//             <div className="mt-2 mb-2">
//               <div className="text-sm">
//                 <div className="text-gray-600">Estimate Date: {currentDate}</div>
//                 <div className="text-gray-600">Tentative Delivery Date: {formatDate(estimates[0]?.deliveryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}</div>
//               </div>
//             </div>

//             {/* Bank Details as simple text */}
//             <div className="mb-4">
//               <div className="text-sm">
//                 <div className="font-medium">Bank Details</div>
//                 <div className="text-gray-600">A/C No: 912020005432066</div>
//                 <div className="text-gray-600">IFSC Code: UTIB0000378</div>
//                 <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
//               </div>
//             </div>
//           </div>
//           <div className="text-right">
//             <img 
//               src={logo} 
//               alt="Famous Letterpress" 
//               className="w-16 h-16 object-contain mb-2 ml-auto"
//               onLoad={() => setLogoLoaded(true)}
//               onError={() => {
//                 console.error("Logo failed to load");
//                 setLogoLoaded(true);
//               }}
//             />
//             <div className="font-bold text-lg text-gray-900">FAMOUS</div>
//             <div className="text-gray-600 text-sm">91 Tetris Building, Subjail Tinali</div>
//             <div className="text-gray-600 text-sm">Dimapur-797112, Nagaland, India</div>
//             <div className="text-gray-600 text-sm">GSTIN: 13ALFPA2458Q2ZO</div>
//             <div className="text-gray-600 text-sm">Phone: +919233152718</div>
//             <div className="text-gray-600 text-sm">Email: info@famousletterpress.com</div>
//           </div>
//         </div>
        
//         {/* Line Items */}
//         <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
//           <table className="w-full border-collapse text-xs">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700">
//                 <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
//                 <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">HSN</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">Die Code</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">Qty</th>
//                 <th className="py-1 px-2 border border-gray-300 text-right">Unit Cost</th>
//                 <th className="py-1 px-2 border border-gray-300 text-right">Total</th>
//                 <th className="py-1 px-2 border border-gray-300 text-center">GST %</th>
//                 <th className="py-1 px-2 border border-gray-300 text-right">GST Amt</th>
//                 <th className="py-1 px-2 border border-gray-300 text-right">Final Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {lineItems.map((item, index) => (
//                 <tr key={item.id} className="text-gray-700">
//                   <td className="py-1 px-2 border border-gray-300 text-center">{index + 1}</td>
//                   <td className="py-1 px-2 border border-gray-300">
//                     <div className="font-medium">{item.name}</div>
//                     {item.description && (
//                       <div className="text-xs text-gray-500">{item.description}</div>
//                     )}
//                   </td>
//                   <td className="py-1 px-2 border border-gray-300 text-center font-mono">{item.hsnCode}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-center">{item.paperName}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-center">{item.dieCode}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-center">{item.quantity}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.total.toFixed(2)}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-center">{item.gstRate}%</td>
//                   <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
//                   <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         {/* Summary */}
//         <div className="flex justify-end mb-3">
//           <div className="w-64">
//             <div className="flex justify-between py-1 text-sm border-t border-gray-200">
//               <div className="text-gray-700">Subtotal:</div>
//               <div className="text-gray-900 font-medium font-mono">
//                 {formatCurrency(totals.amount)}
//               </div>
//             </div>
            
//             <div className="flex justify-between py-1 text-sm">
//               <div className="text-gray-700">GST Amount:</div>
//               <div className="text-gray-900 font-mono">
//                 {formatCurrency(totals.gstAmount)}
//               </div>
//             </div>
            
//             <div className="flex justify-between py-1 font-bold border-t border-gray-300">
//               <div>Total:</div>
//               <div className="font-mono">
//                 {formatCurrency(totals.total)}
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Terms and Conditions */}
//         <div className="mb-3">
//           <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
//           <div className="text-gray-600 text-xs">
//             <div>
//               <div>1. This estimate is valid for 7 days from the date of issue.</div>
//               <div>2. 100% advance payment is required to confirm the order.</div>
//               <div>3. Final artwork approval is required before production.</div>
//               <div>4. Delivery time will be confirmed upon order confirmation.</div>
//               <div>5. Prices are subject to change based on final specifications.</div>
//             </div>
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div className="mt-4 pt-2 border-t border-gray-200">
//           <div className="grid grid-cols-2">
//             <div>
//               <div className="font-medium mb-1 text-xs">Note</div>
//               <div className="text-xs text-gray-600">
//                 This is just an estimate, not a tax invoice. Prices may vary based on final specifications and quantity.
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="font-medium mb-6">for FAMOUS</div>
//               <div className="text-xs">Authorised Signatory</div>
//             </div>
//           </div>
//         </div>
        
//         {/* Print Info */}
//         <div className="mt-3 text-center text-xs text-gray-500">
//           <p>This is a computer generated estimate and does not require a signature.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GroupedJobTicket;

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
const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
  const [isReady, setIsReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

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

  // Get the current date for the document
  const currentDate = formatDate(new Date());

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
      
      // Get HSN code from jobDetails if available
      const hsnCode = jobDetails.hsnCode || "N/A";
      
      // Get processing features
      const features = [];
      if (estimate?.lpDetails?.isLPUsed) features.push("Letterpress");
      if (estimate?.fsDetails?.isFSUsed) features.push("Foil Stamping");
      if (estimate?.embDetails?.isEMBUsed) features.push("Embossing");
      if (estimate?.digiDetails?.isDigiUsed) features.push("Digital Print");
      if (estimate?.sandwich?.isSandwichComponentUsed) features.push("Sandwich");
      if (estimate?.pasting?.isPastingUsed) features.push("Pasting");
      
      // Get quantities and costs
      const quantity = parseInt(jobDetails.quantity) || 0;
      const unitCost = parseFloat(calc.totalCostPerCard || 0);
      const totalCost = unitCost * quantity;
      
      // GST calculations
      const gstRate = calc.gstRate || 18;
      const gstAmount = parseFloat(calc.gstAmount || (totalCost * gstRate / 100)) || 0;
      const finalTotal = totalCost + gstAmount;
      
      // Product dimensions
      const productSize = dieDetails?.productSize || {};
      const productDimensions = productSize.length && productSize.breadth 
        ? `${productSize.length}" × ${productSize.breadth}"`
        : "";
      
      return {
        id: estimate.id || `est-${index}`,
        name: estimate.projectName || "Unnamed Project",
        description: features.join(", "),
        jobType: jobDetails.jobType || "Card",
        paperName: jobDetails.paperName || "Standard Paper",
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
    <div className="bg-white p-4 print:p-0" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '90%' }}>
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
            <h1 className="text-xl font-bold text-gray-900">ESTIMATE</h1>
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
            
            {/* Date Information */}
            <div className="mt-2 mb-2">
              <div className="text-sm">
                <div className="text-gray-600">Estimate Date: {currentDate}</div>
                <div className="text-gray-600">Tentative Delivery Date: {formatDate(estimates[0]?.deliveryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}</div>
              </div>
            </div>

            {/* Bank Details as simple text */}
            <div className="mb-4">
              <div className="text-sm">
                <div className="font-medium">Bank Details</div>
                <div className="text-gray-600">A/C No: 912020005432066</div>
                <div className="text-gray-600">IFSC Code: UTIB0000378</div>
                <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
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
          </div>
        </div>
        
        {/* Line Items */}
        <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
                <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
                <th className="py-1 px-2 border border-gray-300 text-center">HSN</th>
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
                  <td className="py-1 px-2 border border-gray-300 text-center font-mono">{item.hsnCode}</td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{item.paperName}</td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{item.productDimensions}</td>
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
        
        {/* Terms and Conditions */}
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
          <div className="text-gray-600 text-xs">
            <div>
              <div>1. This estimate is valid for 7 days from the date of issue.</div>
              <div>2. 100% advance payment is required to confirm the order.</div>
              <div>3. Final artwork approval is required before production.</div>
              <div>4. Delivery time will be confirmed upon order confirmation.</div>
              <div>5. Prices are subject to change based on final specifications.</div>
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
    </div>
  );
};

export default GroupedJobTicket;