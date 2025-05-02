// import React, { useEffect, useState } from 'react';

// // Component to display die image with error handling
// const DieImage = ({ imageUrl }) => {
//   const [hasError, setHasError] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Reset state when imageUrl changes
//     setHasError(false);
//     setIsLoading(true);
//   }, [imageUrl]);

//   if (!imageUrl || hasError) {
//     return (
//       <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
//         <div className="text-center text-xs text-gray-500">
//           {hasError ? "Failed to load image" : "No image"}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="border rounded p-1 bg-white h-16 flex items-center justify-center">
//       {isLoading && (
//         <div className="text-xs text-gray-400">Loading...</div>
//       )}
//       <img 
//         src={imageUrl} 
//         alt="Die" 
//         style={{
//           maxHeight: '100%',
//           maxWidth: '100%',
//           objectFit: 'contain',
//           display: isLoading ? 'none' : 'block'
//         }}
//         onLoad={() => setIsLoading(false)}
//         onError={() => {
//           setHasError(true);
//           setIsLoading(false);
//         }}
//       />
//     </div>
//   );
// };

// // Format currency values
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 2
//   }).format(amount || 0);
// };

// // Safely render a value or provide a fallback
// const SafeValue = ({ value, fallback = "N/A" }) => {
//   if (value === null || value === undefined || value === "") {
//     return <span>{fallback}</span>;
//   }
//   return <span>{value}</span>;
// };

// // Main Job Ticket component - Invoice-like format
// const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
//   const [isReady, setIsReady] = useState(false);

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
//   const dueDate = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now

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
//         finalTotal: finalTotal
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
//   }, [onRenderComplete]);

//   // Convert number to words (for amount in words)
//   const numberToWords = (num) => {
//     if (isNaN(num)) return '';
    
//     const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//     const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
//     const formatHundred = (n) => {
//       if (n < 10) return single[n];
//       else if (n < 20) return double[n - 10];
//       else {
//         const digit = n % 10;
//         return tens[Math.floor(n / 10)] + (digit ? '-' + single[digit] : '');
//       }
//     };
    
//     const clean = Math.abs(num);
//     const trillion = Math.floor(clean / 1000000000000);
//     const billion = Math.floor((clean % 1000000000000) / 1000000000);
//     const million = Math.floor((clean % 1000000000) / 1000000);
//     const thousand = Math.floor((clean % 1000000) / 1000);
//     const hundred = Math.floor((clean % 1000) / 100);
//     const tens_ones = clean % 100;
//     const decimals = (clean % 1).toFixed(2).slice(2);
    
//     let words = '';
    
//     if (trillion) words += formatHundred(trillion) + ' Trillion ';
//     if (billion) words += formatHundred(billion) + ' Billion ';
//     if (million) words += formatHundred(million) + ' Million ';
//     if (thousand) words += formatHundred(thousand) + ' Thousand ';
//     if (hundred) words += single[hundred] + ' Hundred ';
    
//     if (tens_ones) {
//       if (words !== '') words += 'and ';
//       words += formatHundred(tens_ones);
//     }
    
//     if (decimals !== '00') {
//       words += ' and ' + decimals + '/100';
//     }
    
//     return words + ' Only';
//   };

//   return (
//     <div className="bg-white p-5 print:p-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
//         {/* Header */}
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">CUSTOMER ESTIMATE</h1>
//             <div className="mt-1 text-gray-500">Version: {version}</div>
//           </div>
//           <div className="text-right">
//             <div className="font-bold text-lg text-gray-900">M/S FAMOUS</div>
//             <div className="text-gray-500 text-sm">AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
//             <div className="text-gray-500 text-sm">DIMAPUR NAGALAND</div>
//             <div className="text-gray-500 text-sm">GSTIN/UIN: 13ALFPA3458Q2Z0</div>
//             <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
//           </div>
//         </div>
        
//         {/* Client Info */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <h2 className="text-sm font-semibold text-gray-700 mb-1">Client:</h2>
//             <div className="font-medium">{clientInfo?.name || "Unknown Client"}</div>
//             <div className="text-gray-500 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
//             <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
//           </div>
//           <div>
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div className="text-gray-500">Estimate Date:</div>
//               <div className="text-right">{currentDate}</div>
              
//               <div className="text-gray-500">Valid Until:</div>
//               <div className="text-right">{dueDate}</div>
              
//               <div className="text-gray-500">Estimate Total:</div>
//               <div className="text-right font-semibold text-blue-600">
//                 {formatCurrency(totals.total)}
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Line Items */}
//         <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
//           <table className="w-full border-collapse text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700">
//                 <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
//                 <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
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
//               <div className="text-gray-700">GST ({totals.gstRate}%):</div>
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
        
//         {/* Amount in Words */}
//         <div className="mb-3 border-t border-b border-gray-200 py-2">
//           <div className="text-xs text-gray-600">Amount in Words:</div>
//           <div className="font-medium text-sm">Indian Rupees {numberToWords(totals.total)}</div>
//         </div>
        
//         {/* Terms and Conditions */}
//         <div className="mb-3">
//           <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
//           <div className="text-gray-600 text-xs">
//             <ol className="list-decimal pl-4 space-y-1">
//               <li>This estimate is valid for 30 days from the date of issue.</li>
//               <li>50% advance payment is required to confirm the order.</li>
//               <li>Final artwork approval is required before production.</li>
//               <li>Delivery time will be confirmed upon order confirmation.</li>
//               <li>Prices are subject to change based on final specifications.</li>
//             </ol>
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
//               <div className="font-medium mb-8">for M/S FAMOUS</div>
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

// Component to display die image with error handling
const DieImage = ({ imageUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when imageUrl changes
    setHasError(false);
    setIsLoading(true);
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-xs text-gray-500">
          {hasError ? "Failed to load image" : "No image"}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-1 bg-white h-16 flex items-center justify-center">
      {isLoading && (
        <div className="text-xs text-gray-400">Loading...</div>
      )}
      <img 
        src={imageUrl} 
        alt="Die" 
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

// Format currency values
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Safely render a value or provide a fallback
const SafeValue = ({ value, fallback = "N/A" }) => {
  if (value === null || value === undefined || value === "") {
    return <span>{fallback}</span>;
  }
  return <span>{value}</span>;
};

// Main Job Ticket component - Invoice-like format
const GroupedJobTicket = ({ estimates, clientInfo, version, onRenderComplete }) => {
  const [isReady, setIsReady] = useState(false);

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
  const dueDate = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now

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
      
      return {
        id: estimate.id || `est-${index}`,
        name: estimate.projectName || "Unnamed Project",
        description: features.join(", "),
        jobType: jobDetails.jobType || "Card",
        paperName: jobDetails.paperName || "Standard Paper",
        dieCode: dieDetails.dieCode || "",
        quantity: quantity,
        price: unitCost,
        total: totalCost,
        gstRate: gstRate,
        gstAmount: gstAmount,
        finalTotal: finalTotal,
        hsnCode: hsnCode // Include HSN code from jobDetails
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
  }, [onRenderComplete]);

  // Convert number to words (for amount in words)
  const numberToWords = (num) => {
    if (isNaN(num)) return '';
    
    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const formatHundred = (n) => {
      if (n < 10) return single[n];
      else if (n < 20) return double[n - 10];
      else {
        const digit = n % 10;
        return tens[Math.floor(n / 10)] + (digit ? '-' + single[digit] : '');
      }
    };
    
    const clean = Math.abs(num);
    const trillion = Math.floor(clean / 1000000000000);
    const billion = Math.floor((clean % 1000000000000) / 1000000000);
    const million = Math.floor((clean % 1000000000) / 1000000);
    const thousand = Math.floor((clean % 1000000) / 1000);
    const hundred = Math.floor((clean % 1000) / 100);
    const tens_ones = clean % 100;
    const decimals = (clean % 1).toFixed(2).slice(2);
    
    let words = '';
    
    if (trillion) words += formatHundred(trillion) + ' Trillion ';
    if (billion) words += formatHundred(billion) + ' Billion ';
    if (million) words += formatHundred(million) + ' Million ';
    if (thousand) words += formatHundred(thousand) + ' Thousand ';
    if (hundred) words += single[hundred] + ' Hundred ';
    
    if (tens_ones) {
      if (words !== '') words += 'and ';
      words += formatHundred(tens_ones);
    }
    
    if (decimals !== '00') {
      words += ' and ' + decimals + '/100';
    }
    
    return words + ' Only';
  };

  return (
    <div className="bg-white p-5 print:p-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CUSTOMER ESTIMATE</h1>
            <div className="mt-1 text-gray-500">Version: {version}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">M/S FAMOUS</div>
            <div className="text-gray-500 text-sm">AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
            <div className="text-gray-500 text-sm">DIMAPUR NAGALAND</div>
            <div className="text-gray-500 text-sm">GSTIN/UIN: 13ALFPA3458Q2Z0</div>
            <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
          </div>
        </div>
        
        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Client:</h2>
            <div className="font-medium">{clientInfo?.name || "Unknown Client"}</div>
            <div className="text-gray-500 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
            <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Estimate Date:</div>
              <div className="text-right">{currentDate}</div>
              
              <div className="text-gray-500">Valid Until:</div>
              <div className="text-right">{dueDate}</div>
              
              <div className="text-gray-500">Estimate Total:</div>
              <div className="text-right font-semibold text-blue-600">
                {formatCurrency(totals.total)}
              </div>
            </div>
          </div>
          </div>
        
        {/* Line Items */}
        <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
                <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
                <th className="py-1 px-2 border border-gray-300 text-center">HSN</th>
                <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
                <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
                <th className="py-1 px-2 border border-gray-300 text-center">Die Code</th>
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
                  <td className="py-1 px-2 border border-gray-300 text-center">{item.dieCode}</td>
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
        
        {/* HSN/SAC Summary - Added HSN Code Summary */}
        <div className="mb-3 overflow-x-auto">
          <h3 className="text-sm font-semibold mb-1">HSN/SAC Summary:</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-1 px-2 border border-gray-300 text-center">HSN/SAC</th>
                <th className="py-1 px-2 border border-gray-300 text-center">Taxable Value</th>
                <th className="py-1 px-2 border border-gray-300 text-center">IGST Rate</th>
                <th className="py-1 px-2 border border-gray-300 text-center">IGST Amount</th>
                <th className="py-1 px-2 border border-gray-300 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Group line items by HSN code for the summary */}
              {Object.entries(
                lineItems.reduce((acc, item) => {
                  const key = item.hsnCode;
                  if (!acc[key]) {
                    acc[key] = {
                      taxable: 0,
                      gstRate: item.gstRate,
                      gstAmount: 0,
                      total: 0
                    };
                  }
                  acc[key].taxable += item.total;
                  acc[key].gstAmount += item.gstAmount;
                  acc[key].total += item.finalTotal;
                  return acc;
                }, {})
              ).map(([hsnCode, data], idx) => (
                <tr key={idx} className="text-gray-700">
                  <td className="py-1 px-2 border border-gray-300 text-center font-mono">{hsnCode}</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-mono">{data.taxable.toFixed(2)}</td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{data.gstRate}%</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-mono">{data.gstAmount.toFixed(2)}</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{data.total.toFixed(2)}</td>
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
              <div className="text-gray-700">GST ({totals.gstRate}%):</div>
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
        
        {/* Amount in Words */}
        <div className="mb-3 border-t border-b border-gray-200 py-2">
          <div className="text-xs text-gray-600">Amount in Words:</div>
          <div className="font-medium text-sm">Indian Rupees {numberToWords(totals.total)}</div>
        </div>
        
        {/* Terms and Conditions */}
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Terms and Conditions:</div>
          <div className="text-gray-600 text-xs">
            <ol className="list-decimal pl-4 space-y-1">
              <li>This estimate is valid for 30 days from the date of issue.</li>
              <li>50% advance payment is required to confirm the order.</li>
              <li>Final artwork approval is required before production.</li>
              <li>Delivery time will be confirmed upon order confirmation.</li>
              <li>Prices are subject to change based on final specifications.</li>
            </ol>
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
              <div className="font-medium mb-8">for M/S FAMOUS</div>
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