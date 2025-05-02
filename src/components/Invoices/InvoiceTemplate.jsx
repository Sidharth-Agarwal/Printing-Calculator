// import React from 'react';

// const InvoiceTemplate = ({ invoiceData, orders, clientInfo, totals }) => {
//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     if (typeof amount === 'string') {
//       amount = parseFloat(amount);
//     }
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
//   };

//   // Convert number to words
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
  
//   // Get tax information
//   const getTaxInfo = (order) => {
//     const calculations = order.calculations || {};
//     return {
//       rate: calculations.gstRate || 18,
//       amount: parseFloat(calculations.gstAmount) || 0
//     };
//   };

//   // Prepare line items from orders
//   const prepareLineItems = () => {
//     return orders.map(order => {
//       // Calculate cost per card from calculations
//       const calculations = order.calculations || {};
//       const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
      
//       // Get quantity and name
//       const quantity = parseInt(order.jobDetails?.quantity) || 0;
//       const name = `${order.projectName || 'Project'}`;
      
//       // Get job type, paper, and die code
//       const jobType = order.jobDetails?.jobType || 'Card';
//       const paperName = order.jobDetails?.paperName || 'Standard Paper';
//       const dieCode = order.dieDetails?.dieCode || '';
      
//       // Get description of processing
//       const processes = [];
//       if (order.lpDetails?.isLPUsed) processes.push('Letterpress');
//       if (order.fsDetails?.isFSUsed) processes.push('Foil Stamping');
//       if (order.embDetails?.isEMBUsed) processes.push('Embossing');
//       if (order.digiDetails?.isDigiUsed) processes.push('Digital Print');
//       if (order.pasting?.isPastingUsed) processes.push('Pasting');
      
//       const description = processes.length > 0 
//         ? `${processes.join(', ')}`
//         : '';
      
//       // Tax information (GST)
//       const taxInfo = getTaxInfo(order);
//       const itemTotal = costPerCard * quantity;
//       const gstAmount = taxInfo.rate > 0 ? (itemTotal * taxInfo.rate / 100) : 0;
//       const finalTotal = itemTotal + gstAmount;
      
//       return {
//         id: order.id,
//         name,
//         description,
//         jobType,
//         paperName,
//         dieCode,
//         quantity,
//         price: costPerCard,
//         total: itemTotal,
//         gstRate: taxInfo.rate,
//         gstAmount: gstAmount,
//         finalTotal: finalTotal,
//         hsn: '49100010' // Default HSN code for printed matter
//       };
//     });
//   };
  
//   const lineItems = prepareLineItems();
//   const discountAmount = totals.discount || 0;
//   const discountPercentage = invoiceData.discount || 0;

//   return (
//     <div className="bg-white p-5 print:p-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
//       {/* Header */}
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
//           <div className="text-gray-500">{invoiceData.invoiceNumber}</div>
//         </div>
//         <div className="text-right">
//           <div className="font-bold text-lg text-gray-900">M/S FAMOUS</div>
//           <div className="text-gray-500 text-sm">AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
//           <div className="text-gray-500 text-sm">DIMAPUR NAGALAND</div>
//           <div className="text-gray-500 text-sm">GSTIN/UIN: 13ALFPA3458Q2Z0</div>
//           <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
//         </div>
//       </div>
      
//       {/* Bill Info */}
//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div>
//           <h2 className="text-sm font-semibold text-gray-700 mb-1">Bill To:</h2>
//           <div className="font-medium">{clientInfo.name}</div>
//           <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
//         </div>
//         <div>
//           <div className="grid grid-cols-2 gap-2 text-sm">
//             <div className="text-gray-500">Invoice Date:</div>
//             <div className="text-right">{formatDate(invoiceData.date)}</div>
            
//             <div className="text-gray-500">Due Date:</div>
//             <div className="text-right">{formatDate(invoiceData.dueDate)}</div>
            
//             <div className="text-gray-500">Amount Due:</div>
//             <div className="text-right font-semibold text-blue-600">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Line Items */}
//       <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
//         <table className="w-full border-collapse text-sm">
//           <thead>
//             <tr className="bg-gray-100 text-gray-700">
//               <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
//               <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
//               <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
//               <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
//               <th className="py-1 px-2 border border-gray-300 text-center">Die Code</th>
//               <th className="py-1 px-2 border border-gray-300 text-center">Qty</th>
//               <th className="py-1 px-2 border border-gray-300 text-right">Unit Cost</th>
//               <th className="py-1 px-2 border border-gray-300 text-right">Total</th>
//               <th className="py-1 px-2 border border-gray-300 text-center">GST %</th>
//               <th className="py-1 px-2 border border-gray-300 text-right">GST Amt</th>
//               <th className="py-1 px-2 border border-gray-300 text-right">Final Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {lineItems.map((item, index) => (
//               <tr key={item.id} className="text-gray-700">
//                 <td className="py-1 px-2 border border-gray-300 text-center">{index + 1}</td>
//                 <td className="py-1 px-2 border border-gray-300">
//                   <div className="font-medium">{item.name}</div>
//                   {item.description && (
//                     <div className="text-xs text-gray-500">{item.description}</div>
//                   )}
//                 </td>
//                 <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-center">{item.paperName}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-center">{item.dieCode}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-center">{item.quantity}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.total.toFixed(2)}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-center">{item.gstRate}%</td>
//                 <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
//                 <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
      
//       {/* Summary */}
//       <div className="flex justify-end mb-3">
//         <div className="w-64">
//           <div className="flex justify-between py-1 text-sm border-t border-gray-200">
//             <div className="text-gray-700">Subtotal:</div>
//             <div className="text-gray-900 font-medium font-mono">₹{totals.subtotal.toFixed(2)}</div>
//           </div>
          
//           {discountPercentage > 0 && (
//             <div className="flex justify-between py-1 text-sm text-red-600">
//               <div>Discount ({discountPercentage}%):</div>
//               <div className="font-mono">-₹{discountAmount.toFixed(2)}</div>
//             </div>
//           )}
          
//           <div className="flex justify-between py-1 text-sm">
//             <div className="text-gray-700">GST ({lineItems[0]?.gstRate || 18}%):</div>
//             <div className="text-gray-900 font-mono">₹{totals.tax.toFixed(2)}</div>
//           </div>
          
//           <div className="flex justify-between py-1 font-bold border-t border-gray-300">
//             <div>Total:</div>
//             <div className="font-mono">₹{totals.total.toFixed(2)}</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Amount in Words */}
//       <div className="mb-3 border-t border-b border-gray-200 py-2">
//         <div className="text-xs text-gray-600">Amount in Words:</div>
//         <div className="font-medium text-sm">Indian Rupees {numberToWords(totals.total)}</div>
//       </div>
      
//       {/* Notes */}
//       {invoiceData.notes && (
//         <div className="mb-3">
//           <div className="font-medium text-gray-700 mb-1 text-xs">Notes:</div>
//           <div className="text-gray-600 text-xs">{invoiceData.notes}</div>
//         </div>
//       )}
      
//       {/* Footer */}
//       <div className="mt-4 pt-2 border-t border-gray-200">
//         <div className="grid grid-cols-2">
//           <div>
//             <div className="font-medium mb-1 text-xs">Declaration</div>
//             <div className="text-xs text-gray-600">
//               We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
//             </div>
//           </div>
//           <div className="text-right">
//             <div className="font-medium mb-8">for M/S FAMOUS</div>
//             <div className="text-xs">Authorised Signatory</div>
//           </div>
//         </div>
//         <div className="mt-3 text-center text-xs text-gray-500">
//           <p>This is a computer generated invoice and does not require a signature.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceTemplate;

import React from 'react';

const InvoiceTemplate = ({ invoiceData, orders, clientInfo, totals }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Convert number to words
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
  
  // Get tax information
  const getTaxInfo = (order) => {
    const calculations = order.calculations || {};
    return {
      rate: calculations.gstRate || 18,
      amount: parseFloat(calculations.gstAmount) || 0
    };
  };

  // Prepare line items from orders
  const prepareLineItems = () => {
    return orders.map(order => {
      // Calculate cost per card from calculations
      const calculations = order.calculations || {};
      const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
      
      // Get quantity and name
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      const name = `${order.projectName || 'Project'}`;
      
      // Get job type, paper, and die code
      const jobType = order.jobDetails?.jobType || 'Card';
      const paperName = order.jobDetails?.paperName || 'Standard Paper';
      const dieCode = order.dieDetails?.dieCode || '';
      
      // Get HSN code from jobDetails if available
      const hsnCode = order.jobDetails?.hsnCode || '';
      
      // Get description of processing
      const processes = [];
      if (order.lpDetails?.isLPUsed) processes.push('Letterpress');
      if (order.fsDetails?.isFSUsed) processes.push('Foil Stamping');
      if (order.embDetails?.isEMBUsed) processes.push('Embossing');
      if (order.digiDetails?.isDigiUsed) processes.push('Digital Print');
      if (order.pasting?.isPastingUsed) processes.push('Pasting');
      
      const description = processes.length > 0 
        ? `${processes.join(', ')}`
        : '';
      
      // Tax information (GST)
      const taxInfo = getTaxInfo(order);
      const itemTotal = costPerCard * quantity;
      const gstAmount = taxInfo.rate > 0 ? (itemTotal * taxInfo.rate / 100) : 0;
      const finalTotal = itemTotal + gstAmount;
      
      return {
        id: order.id,
        name,
        description,
        jobType,
        paperName,
        dieCode,
        quantity,
        price: costPerCard,
        total: itemTotal,
        gstRate: taxInfo.rate,
        gstAmount: gstAmount,
        finalTotal: finalTotal,
        hsnCode: hsnCode || 'N/A' // Use HSN code from order data or default to N/A
      };
    });
  };
  
  const lineItems = prepareLineItems();
  const discountAmount = totals.discount || 0;
  const discountPercentage = invoiceData.discount || 0;

  return (
    <div className="bg-white p-5 print:p-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
          <div className="text-gray-500">{invoiceData.invoiceNumber}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-gray-900">M/S FAMOUS</div>
          <div className="text-gray-500 text-sm">AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
          <div className="text-gray-500 text-sm">DIMAPUR NAGALAND</div>
          <div className="text-gray-500 text-sm">GSTIN/UIN: 13ALFPA3458Q2Z0</div>
          <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
        </div>
      </div>
      
      {/* Bill Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Bill To:</h2>
          <div className="font-medium">{clientInfo.name}</div>
          <div className="text-gray-500 text-sm">State Name: Nagaland, Code: 13</div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Invoice Date:</div>
            <div className="text-right">{formatDate(invoiceData.date)}</div>
            
            <div className="text-gray-500">Due Date:</div>
            <div className="text-right">{formatDate(invoiceData.dueDate)}</div>
            
            <div className="text-gray-500">Amount Due:</div>
            <div className="text-right font-semibold text-blue-600">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
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
            <div className="text-gray-900 font-medium font-mono">₹{totals.subtotal.toFixed(2)}</div>
          </div>
          
          {discountPercentage > 0 && (
            <div className="flex justify-between py-1 text-sm text-red-600">
              <div>Discount ({discountPercentage}%):</div>
              <div className="font-mono">-₹{discountAmount.toFixed(2)}</div>
            </div>
          )}
          
          <div className="flex justify-between py-1 text-sm">
            <div className="text-gray-700">GST ({lineItems[0]?.gstRate || 18}%):</div>
            <div className="text-gray-900 font-mono">₹{totals.tax.toFixed(2)}</div>
          </div>
          
          <div className="flex justify-between py-1 font-bold border-t border-gray-300">
            <div>Total:</div>
            <div className="font-mono">₹{totals.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Amount in Words */}
      <div className="mb-3 border-t border-b border-gray-200 py-2">
        <div className="text-xs text-gray-600">Amount in Words:</div>
        <div className="font-medium text-sm">Indian Rupees {numberToWords(totals.total)}</div>
      </div>
      
      {/* Notes */}
      {invoiceData.notes && (
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1 text-xs">Notes:</div>
          <div className="text-gray-600 text-xs">{invoiceData.notes}</div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2">
          <div>
            <div className="font-medium mb-1 text-xs">Declaration</div>
            <div className="text-xs text-gray-600">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium mb-8">for M/S FAMOUS</div>
            <div className="text-xs">Authorised Signatory</div>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500">
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;