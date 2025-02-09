// // import React from 'react';

// // const TaxInvoice = ({ order }) => {
// //   // Helper function to format numbers with 2 decimal places
// //   const formatNumber = (num) => {
// //     return Number(num || 0).toFixed(2);
// //   };

// //   // Helper function to format date
// //   const formatDate = (dateString) => {
// //     if (!dateString) return '';
// //     return new Date(dateString).toLocaleDateString('en-GB', {
// //       day: '2-digit',
// //       month: 'short',
// //       year: 'numeric'
// //     });
// //   };

// //   // Calculate costs
// //   const calculateCosts = () => {
// //     // Get base amount per card from calculations
// //     const totalPerCard = order.calculations?.lpCostPerCard || 0;
// //     const quantity = parseInt(order.jobDetails?.quantity || 0);
// //     const baseAmount = totalPerCard * quantity;

// //     // Calculate GST
// //     const gstRate = 0.06; // 6% GST
// //     const cgst = baseAmount * gstRate;
// //     const sgst = baseAmount * gstRate;
// //     const totalAmount = baseAmount + cgst + sgst;

// //     return {
// //       baseAmount: formatNumber(baseAmount),
// //       cgst: formatNumber(cgst),
// //       sgst: formatNumber(sgst),
// //       totalAmount: formatNumber(totalAmount),
// //       ratePerUnit: formatNumber(totalPerCard)
// //     };
// //   };

// //   const costs = calculateCosts();

// //   // Convert number to words
// //   const numberToWords = (num) => {
// //     const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
// //     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
// //     const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

// //     if (num === 0) return 'Zero';
// //     const [whole, decimal] = num.toString().split('.');
// //     let words = '';

// //     // Handle whole number part
// //     const wholeNum = parseInt(whole);
// //     if (wholeNum >= 1000) {
// //       words += ones[Math.floor(wholeNum / 1000)] + ' Thousand ';
// //       num %= 1000;
// //     }
// //     if (wholeNum >= 100) {
// //       words += ones[Math.floor(wholeNum / 100)] + ' Hundred ';
// //       num %= 100;
// //     }
// //     if (wholeNum >= 20) {
// //       words += tens[Math.floor(wholeNum / 10)] + ' ';
// //       num %= 10;
// //     }
// //     if (wholeNum >= 10 && wholeNum < 20) {
// //       words += teens[wholeNum - 10] + ' ';
// //     } else {
// //       words += ones[wholeNum % 10] + ' ';
// //     }

// //     // Handle decimal part
// //     if (decimal) {
// //       words += 'and ' + decimal + '/100';
// //     }

// //     return words.trim() + ' Only';
// //   };

// //   return (
// //     <div className="w-full bg-white p-8">
// //       <div className="text-center font-bold text-xl mb-4">TAX INVOICE</div>
      
// //       <div className="border border-black">
// //         {/* Company Details */}
// //         <div className="grid grid-cols-2">
// //           <div className="border-r border-b border-black p-4">
// //             <div className="font-bold">M/S FAMOUS</div>
// //             <div>AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
// //             <div>DIMAPUR NAGALAND</div>
// //             <div>GSTIN/UIN: 13ALFPA3458Q2Z0</div>
// //             <div>State Name: Nagaland, Code: 13</div>
// //           </div>
// //           <div className="border-b border-black p-4">
// //             <table className="w-full text-sm">
// //               <tbody>
// //                 <tr>
// //                   <td className="py-1">Invoice No. : {order.id || 'INV/2024/'}</td>
// //                   {/* <td className="py-1"> {order.id || 'INV/2024/'}</td> */}
// //                 </tr>
// //                 <tr>
// //                   <td className="py-1">Dated : {formatDate(order.date)}</td>
// //                   {/* <td className="py-1">: {formatDate(order.date)}</td> */}
// //                 </tr>
// //                 <tr>
// //                   <td className="py-1">Mode/Terms of Payment : </td>
// //                   {/* <td className="py-1">:</td> */}
// //                 </tr>
// //                 <tr>
// //                   <td className="py-1">Supplier's Ref. : </td>
// //                   {/* <td className="py-1">:</td> */}
// //                 </tr>
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {/* Buyer Details */}
// //         <div className="grid grid-cols-2">
// //           <div className="border-r border-b border-black p-4">
// //             <div className="mb-2">Buyer</div>
// //             <div className="font-bold mb-2">{order.clientName}</div>
// //             <div>State Name: Nagaland, Code: 13</div>
// //           </div>
// //           <div className="border-b border-black p-4">
// //             <table className="w-full text-sm">
// //               <tbody>
// //                 <tr>
// //                   <td className="py-1">Buyer's Order No. :</td>
// //                 </tr>
// //                 <tr>
// //                   <td className="py-1">Dated :</td>
// //                 </tr>
// //                 <tr>
// //                   <td className="py-1">Terms of Delivery :</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {/* Items Table */}
// //         <table className="w-full border-b border-black">
// //           <thead className="text-sm">
// //             <tr>
// //               <th className="border-r border-b border-black p-2 w-16">SI No.</th>
// //               <th className="border-r border-b border-black p-2">Description of Goods</th>
// //               <th className="border-r border-b border-black p-2 w-24">HSN/SAC</th>
// //               <th className="border-r border-b border-black p-2 w-24">Quantity</th>
// //               <th className="border-r border-b border-black p-2 w-24">Rate</th>
// //               <th className="border-r border-b border-black p-2 w-16">per</th>
// //               <th className="border-r border-b border-black p-2 w-20">Disc. %</th>
// //               <th className="border-b border-black p-2 w-28">Amount</th>
// //             </tr>
// //           </thead>
// //           <tbody className="text-sm">
// //             <tr>
// //               <td className="border-r border-black p-2 text-center">1</td>
// //               <td className="border-r border-black p-2">{order.jobDetails?.jobType || 'Card'}</td>
// //               <td className="border-r border-black p-2 text-center">49100010</td>
// //               <td className="border-r border-black p-2 text-right">{order.jobDetails?.quantity}.00 pcs</td>
// //               <td className="border-r border-black p-2 text-right">{costs.ratePerUnit}</td>
// //               <td className="border-r border-black p-2 text-center">pcs</td>
// //               <td className="border-r border-black p-2 text-right"></td>
// //               <td className="p-2 text-right">{costs.baseAmount}</td>
// //             </tr>
// //             <tr>
// //               <td colSpan="7" className="border-r border-black p-2 text-right">Output CGST</td>
// //               <td className="p-2 text-right">{costs.cgst}</td>
// //             </tr>
// //             <tr>
// //               <td colSpan="7" className="border-r border-black p-2 text-right">Output SGST</td>
// //               <td className="p-2 text-right">{costs.sgst}</td>
// //             </tr>
// //           </tbody>
// //         </table>

// //         {/* Amount in Words */}
// //         <div className="border-b border-black p-4">
// //           <div className="text-sm">Amount Chargeable (in words)</div>
// //           <div className="font-bold">INR {numberToWords(parseFloat(costs.totalAmount))}</div>
// //         </div>

// //         {/* Tax Details */}
// //         <table className="w-full border-b border-black text-sm">
// //           <thead>
// //             <tr>
// //               <th className="border-r border-b border-black p-2" rowSpan="2">HSN/SAC</th>
// //               <th className="border-r border-b border-black p-2" rowSpan="2">Taxable Value</th>
// //               <th className="border-r border-black p-2" colSpan="2">Central Tax</th>
// //               <th className="border-r border-black p-2" colSpan="2">State Tax</th>
// //               <th className="border-b border-black p-2" rowSpan="2">Total Tax Amount</th>
// //             </tr>
// //             <tr>
// //               <th className="border-r border-b border-black p-2">Rate</th>
// //               <th className="border-r border-b border-black p-2">Amount</th>
// //               <th className="border-r border-b border-black p-2">Rate</th>
// //               <th className="border-r border-b border-black p-2">Amount</th>
// //             </tr>
// //           </thead>
// //           <tbody className="text-right">
// //             <tr>
// //               <td className="border-r border-black p-2">49100010</td>
// //               <td className="border-r border-black p-2">{costs.baseAmount}</td>
// //               <td className="border-r border-black p-2">6%</td>
// //               <td className="border-r border-black p-2">{costs.cgst}</td>
// //               <td className="border-r border-black p-2">6%</td>
// //               <td className="border-r border-black p-2">{costs.sgst}</td>
// //               <td className="p-2">{formatNumber(parseFloat(costs.cgst) + parseFloat(costs.sgst))}</td>
// //             </tr>
// //           </tbody>
// //         </table>

// //         {/* Tax Amount in Words */}
// //         <div className="border-b border-black p-4">
// //           <div>Tax Amount (in words):</div>
// //           <div>INR {numberToWords(parseFloat(costs.cgst) + parseFloat(costs.sgst))}</div>
// //         </div>

// //         {/* Declaration and Signature */}
// //         <div className="grid grid-cols-2">
// //           <div className="border-r border-black p-4">
// //             <div className="font-bold mb-2">Declaration</div>
// //             <div className="text-sm">
// //               We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
// //             </div>
// //           </div>
// //           <div className="p-4">
// //             <div className="text-right">
// //               <div className="font-bold mb-16">for M/S FAMOUS</div>
// //               <div>Authorised Signatory</div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="text-center text-sm mt-4">This is a Computer Generated Invoice</div>
// //     </div>
// //   );
// // };

// // export default TaxInvoice;

// import React from 'react';

// const TaxInvoice = ({ order }) => {
//   // Helper function to format numbers with 2 decimal places
//   const formatNumber = (num) => {
//     return Number(num || 0).toFixed(2);
//   };

//   // Helper function to format date
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Calculate costs
//   const calculateCosts = () => {
//     // Prepare line items based on order details
//     const lineItems = [];

//     // Add Letterpress if used
//     if (order.lpDetails?.isLPUsed) {
//       const lpCost = order.calculations?.lpCostPerCard || 0;
//       lineItems.push({
//         description: 'Letterpress',
//         quantity: order.jobDetails?.quantity || 0,
//         rate: lpCost
//       });
//     }

//     // Add Foil Stamping if used
//     if (order.fsDetails?.isFSUsed) {
//       const fsCost = order.calculations?.fsCostPerCard || 0;
//       lineItems.push({
//         description: 'Foil Stamping',
//         quantity: order.jobDetails?.quantity || 0,
//         rate: fsCost
//       });
//     }

//     // Add Embossing if used
//     if (order.embDetails?.isEMBUsed) {
//       const embCost = order.calculations?.embCostPerCard || 0;
//       lineItems.push({
//         description: 'Embossing',
//         quantity: order.jobDetails?.quantity || 0,
//         rate: embCost
//       });
//     }

//     // Add Digital if used
//     if (order.digiDetails?.isDigiUsed) {
//       const digiCost = order.calculations?.digiCostPerCard || 0;
//       lineItems.push({
//         description: 'Digital Print',
//         quantity: order.jobDetails?.quantity || 0,
//         rate: digiCost
//       });
//     }

//     // Add Die Cutting if used
//     if (order.dieCutting?.isDieCuttingUsed) {
//       const cuttingCost = order.calculations?.cuttingCostPerCard || 0;
//       lineItems.push({
//         description: 'Die Cutting',
//         quantity: order.jobDetails?.quantity || 0,
//         rate: cuttingCost
//       });
//     }

//     // Add Paper Cost
//     const paperCost = order.calculations?.paperCostPerCard || 0;
//     lineItems.push({
//       description: 'Paper',
//       quantity: order.jobDetails?.quantity || 0,
//       rate: paperCost
//     });

//     // Calculate base amount
//     const baseAmount = lineItems.reduce((total, item) => 
//       total + (item.quantity * item.rate), 0);

//     // Calculate GST
//     const gstRate = 0.06; // 6% GST
//     const cgst = baseAmount * gstRate;
//     const sgst = baseAmount * gstRate;
//     const totalAmount = baseAmount + cgst + sgst;

//     return {
//       lineItems,
//       baseAmount: formatNumber(baseAmount),
//       cgst: formatNumber(cgst),
//       sgst: formatNumber(sgst),
//       totalAmount: formatNumber(totalAmount),
//       totalTaxAmount: formatNumber(cgst + sgst),
//       totalQuantity: order.jobDetails?.quantity || 0
//     };
//   };

//   const costs = calculateCosts();

//   // Convert number to words
//   const numberToWords = (num) => {
//     const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
//     const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

//     if (num === 0) return 'Zero';
//     const [whole, decimal] = num.toString().split('.');
//     let words = '';

//     // Handle whole number part
//     const wholeNum = parseInt(whole);
//     if (wholeNum >= 1000) {
//       words += ones[Math.floor(wholeNum / 1000)] + ' Thousand ';
//       num %= 1000;
//     }
//     if (wholeNum >= 100) {
//       words += ones[Math.floor(wholeNum / 100)] + ' Hundred ';
//       num %= 100;
//     }
//     if (wholeNum >= 20) {
//       words += tens[Math.floor(wholeNum / 10)] + ' ';
//       num %= 10;
//     }
//     if (wholeNum >= 10 && wholeNum < 20) {
//       words += teens[wholeNum - 10] + ' ';
//     } else {
//       words += ones[wholeNum % 10] + ' ';
//     }

//     // Handle decimal part
//     if (decimal) {
//       words += 'and ' + decimal + '/100';
//     }

//     return words.trim() + ' Only';
//   };

//   return (
//     <div className="w-full bg-white p-8">
//       <div className="text-center font-bold text-xl mb-4">TAX INVOICE</div>
      
//       <div className="border border-black">
//         {/* Company Details */}
//         <div className="grid grid-cols-2">
//           <div className="border-r border-b border-black p-4">
//             <div className="font-bold">M/S FAMOUS</div>
//             <div>AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
//             <div>DIMAPUR NAGALAND</div>
//             <div>GSTIN/UIN: 13ALFPA3458Q2Z0</div>
//             <div>State Name: Nagaland, Code: 13</div>
//           </div>
//           <div className="border-b border-black p-4">
//             <table className="w-full text-sm">
//               <tbody>
//                 <tr>
//                   <td className="py-1">Invoice No. : {order.id || 'INV/2024/'}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-1">Dated : {formatDate(order.date)}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-1">Mode/Terms of Payment : </td>
//                 </tr>
//                 <tr>
//                   <td className="py-1">Supplier's Ref. : </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Buyer Details */}
//         <div className="grid grid-cols-2">
//           <div className="border-r border-b border-black p-4">
//             <div className="mb-2">Buyer</div>
//             <div className="font-bold mb-2">{order.clientName}</div>
//             <div>State Name: Nagaland, Code: 13</div>
//           </div>
//           <div className="border-b border-black p-4">
//             <table className="w-full text-sm">
//               <tbody>
//                 <tr>
//                   <td className="py-1">Buyer's Order No. :</td>
//                 </tr>
//                 <tr>
//                   <td className="py-1">Dated :</td>
//                 </tr>
//                 <tr>
//                   <td className="py-1">Terms of Delivery :</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Items Table */}
//         <table className="w-full border-b border-black">
//           <thead className="text-sm">
//             <tr>
//               <th className="border-r border-b border-black p-2 w-16">SI No.</th>
//               <th className="border-r border-b border-black p-2">Description of Goods</th>
//               <th className="border-r border-b border-black p-2 w-24">HSN/SAC</th>
//               <th className="border-r border-b border-black p-2 w-24">Quantity</th>
//               <th className="border-r border-b border-black p-2 w-24">Rate</th>
//               <th className="border-r border-b border-black p-2 w-16">per</th>
//               <th className="border-r border-b border-black p-2 w-20">Disc. %</th>
//               <th className="border-b border-black p-2 w-28">Amount</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm">
//             {costs.lineItems.map((item, index) => (
//               <tr key={index}>
//                 <td className="border-r border-black p-2 text-center">{index + 1}</td>
//                 <td className="border-r border-black p-2">{item.description}</td>
//                 <td className="border-r border-black p-2 text-center">49100010</td>
//                 <td className="border-r border-black p-2 text-right">{item.quantity}.00 pcs</td>
//                 <td className="border-r border-black p-2 text-right">{formatNumber(item.rate)}</td>
//                 <td className="border-r border-black p-2 text-center">pcs</td>
//                 <td className="border-r border-black p-2 text-right"></td>
//                 <td className="p-2 text-right">{formatNumber(item.quantity * item.rate)}</td>
//               </tr>
//             ))}
//             <tr>
//               <td className="border-r border-black p-2 text-left" colSpan="3">Total</td>
//               <td className="border-r border-black p-2 text-right">{costs.totalQuantity}.00 pcs</td>
//               <td colSpan="3" className="border-r border-black p-2"></td>
//               <td className="p-2 text-right font-bold">{costs.baseAmount}</td>
//             </tr>
//             <tr>
//               <td colSpan="7" className="border-r border-black p-2 text-right">Output CGST</td>
//               <td className="p-2 text-right">{costs.cgst}</td>
//             </tr>
//             <tr>
//               <td colSpan="7" className="border-r border-black p-2 text-right">Output SGST</td>
//               <td className="p-2 text-right">{costs.sgst}</td>
//             </tr>
//           </tbody>
//         </table>

//         {/* Amount in Words */}
//         <div className="border-b border-black p-4">
//           <div className="text-sm">Amount Chargeable (in words)</div>
//           <div className="font-bold">INR {numberToWords(parseFloat(costs.totalAmount))}</div>
//         </div>

//         {/* Tax Details */}
//         <table className="w-full border-b border-black text-sm">
//           <thead>
//             <tr>
//               <th className="border-r border-b border-black p-2" rowSpan="2">HSN/SAC</th>
//               <th className="border-r border-b border-black p-2" rowSpan="2">Taxable Value</th>
//               <th className="border-r border-black p-2" colSpan="2">Central Tax</th>
//               <th className="border-r border-black p-2" colSpan="2">State Tax</th>
//               <th className="border-b border-black p-2" rowSpan="2">Total Tax Amount</th>
//             </tr>
//             <tr>
//               <th className="border-r border-b border-black p-2">Rate</th>
//               <th className="border-r border-b border-black p-2">Amount</th>
//               <th className="border-r border-b border-black p-2">Rate</th>
//               <th className="border-r border-b border-black p-2">Amount</th>
//             </tr>
//           </thead>
//           <tbody className="text-right">
//             <tr>
//               <td className="border-r border-black p-2">49100010</td>
//               <td className="border-r border-black p-2">{costs.baseAmount}</td>
//               <td className="border-r border-black p-2">6%</td>
//               <td className="border-r border-black p-2">{costs.cgst}</td>
//               <td className="border-r border-black p-2">6%</td>
//               <td className="border-r border-black p-2">{costs.sgst}</td>
//               <td className="p-2">{costs.totalTaxAmount}</td>
//             </tr>
//           </tbody>
//         </table>

//         {/* Tax Amount in Words */}
//         <div className="border-b border-black p-4">
//           <div>Tax Amount (in words):</div>
//           <div>INR {numberToWords(parseFloat(costs.totalTaxAmount))}</div>
//         </div>

//         {/* Declaration and Signature */}
//         <div className="grid grid-cols-2">
//           <div className="border-r border-black p-4">
//             <div className="font-bold mb-2">Declaration</div>
//             <div className="text-sm">
//               We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
//             </div>
//           </div>
//           <div className="p-4">
//             <div className="text-right">
//               <div className="font-bold mb-16">for M/S FAMOUS</div>
//               <div>Authorised Signatory</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="text-center text-sm mt-4">This is a Computer Generated Invoice</div>
//     </div>
//   );
// };

// export default TaxInvoice;

import React from 'react';

const TaxInvoice = ({ order }) => {
  // Helper function to format numbers with 2 decimal places
  const formatNumber = (num) => {
    return Number(num || 0).toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate costs
  const calculateCosts = () => {
    // Prepare line items based on order details
    const lineItems = [];

    // Check and add Letterpress/Card
    if (order.lpDetails?.isLPUsed || order.jobDetails?.jobType === 'Card') {
      lineItems.push({
        description: 'Card',
        quantity: order.jobDetails?.quantity || 0,
        rate: parseFloat(order.calculations?.lpCostPerCard || 83.23)
      });
    }

    // Check and add Pre-Press or other services
    const prePressCost = parseFloat(order.calculations?.prePressPerCard || 350.00);
    if (prePressCost > 0) {
      lineItems.push({
        description: 'Pre Press',
        quantity: order.jobDetails?.quantity ? Math.ceil(order.jobDetails.quantity * 0.03) : 0,
        rate: prePressCost
      });
    }

    // Add other possible services
    const additionalServices = [
      { key: 'fsCostPerCard', description: 'Foil Stamping' },
      { key: 'embCostPerCard', description: 'Embossing' },
      { key: 'digiCostPerCard', description: 'Digital Print' }
    ];

    additionalServices.forEach(service => {
      const cost = parseFloat(order.calculations?.[service.key] || 0);
      if (cost > 0) {
        lineItems.push({
          description: service.description,
          quantity: order.jobDetails?.quantity || 0,
          rate: cost
        });
      }
    });

    // Calculate base amount
    const baseAmount = lineItems.reduce((total, item) => 
      total + (item.quantity * item.rate), 0);

    // Calculate GST
    const gstRate = 0.06; // 6% GST
    const cgst = baseAmount * gstRate;
    const sgst = baseAmount * gstRate;
    const totalAmount = baseAmount + cgst + sgst;

    return {
      lineItems,
      baseAmount: formatNumber(baseAmount),
      cgst: formatNumber(cgst),
      sgst: formatNumber(sgst),
      totalAmount: formatNumber(totalAmount),
      totalTaxAmount: formatNumber(cgst + sgst),
      totalQuantity: lineItems.reduce((total, item) => total + item.quantity, 0)
    };
  };

  const costs = calculateCosts();

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    const [whole, decimal] = num.toString().split('.');
    let words = '';

    // Handle whole number part
    const wholeNum = parseInt(whole);
    if (wholeNum >= 1000) {
      words += ones[Math.floor(wholeNum / 1000)] + ' Thousand ';
      num %= 1000;
    }
    if (wholeNum >= 100) {
      words += ones[Math.floor(wholeNum / 100)] + ' Hundred ';
      num %= 100;
    }
    if (wholeNum >= 20) {
      words += tens[Math.floor(wholeNum / 10)] + ' ';
      num %= 10;
    }
    if (wholeNum >= 10 && wholeNum < 20) {
      words += teens[wholeNum - 10] + ' ';
    } else {
      words += ones[wholeNum % 10] + ' ';
    }

    // Handle decimal part
    if (decimal) {
      words += 'and ' + decimal + '/100';
    }

    return words.trim() + ' Only';
  };

  return (
    <div className="w-full bg-white p-8">
      <div className="text-center font-bold text-xl mb-4">TAX INVOICE</div>
      
      <div className="border border-black">
        {/* Company Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-4">
            <div className="font-bold">M/S FAMOUS</div>
            <div>AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
            <div>DIMAPUR NAGALAND</div>
            <div>GSTIN/UIN: 13ALFPA3458Q2Z0</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1">Invoice No. : {order.id || 'INV/2024/'}</td>
                </tr>
                <tr>
                  <td className="py-1">Dated : {formatDate(order.date)}</td>
                </tr>
                <tr>
                  <td className="py-1">Mode/Terms of Payment : </td>
                </tr>
                <tr>
                  <td className="py-1">Supplier's Ref. : </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-4">
            <div className="mb-2">Buyer</div>
            <div className="font-bold mb-2">{order.clientName}</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1">Buyer's Order No. :</td>
                </tr>
                <tr>
                  <td className="py-1">Dated :</td>
                </tr>
                <tr>
                  <td className="py-1">Terms of Delivery :</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-b border-black">
          <thead className="text-sm">
            <tr>
              <th className="border-r border-b border-black p-2 w-16">SI No.</th>
              <th className="border-r border-b border-black p-2">Description of Goods</th>
              <th className="border-r border-b border-black p-2 w-24">HSN/SAC</th>
              <th className="border-r border-b border-black p-2 w-24">Quantity</th>
              <th className="border-r border-b border-black p-2 w-24">Rate</th>
              <th className="border-r border-b border-black p-2 w-16">per</th>
              <th className="border-r border-b border-black p-2 w-20">Disc. %</th>
              <th className="border-b border-black p-2 w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {costs.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="border-r border-black p-2 text-center">{index + 1}</td>
                <td className="border-r border-black p-2">{item.description}</td>
                <td className="border-r border-black p-2 text-center">49100010</td>
                <td className="border-r border-black p-2 text-right">{item.quantity}.00 pcs</td>
                <td className="border-r border-black p-2 text-right">{formatNumber(item.rate)}</td>
                <td className="border-r border-black p-2 text-center">pcs</td>
                <td className="border-r border-black p-2 text-right"></td>
                <td className="p-2 text-right">{formatNumber(item.quantity * item.rate)}</td>
              </tr>
            ))}
            <tr>
              <td className="border-r border-black p-2 text-left" colSpan="3">Total</td>
              <td className="border-r border-black p-2 text-right">{costs.totalQuantity}.00 pcs</td>
              <td colSpan="3" className="border-r border-black p-2"></td>
              <td className="p-2 text-right font-bold">{costs.baseAmount}</td>
            </tr>
            <tr>
              <td colSpan="7" className="border-r border-black p-2 text-right">Output CGST</td>
              <td className="p-2 text-right">{costs.cgst}</td>
            </tr>
            <tr>
              <td colSpan="7" className="border-r border-black p-2 text-right">Output SGST</td>
              <td className="p-2 text-right">{costs.sgst}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border-b border-black p-4">
          <div className="text-sm">Amount Chargeable (in words)</div>
          <div className="font-bold">INR {numberToWords(parseFloat(costs.totalAmount))}</div>
        </div>

        {/* Tax Details */}
        <table className="w-full border-b border-black text-sm">
          <thead>
            <tr>
              <th className="border-r border-b border-black p-2" rowSpan="2">HSN/SAC</th>
              <th className="border-r border-b border-black p-2" rowSpan="2">Taxable Value</th>
              <th className="border-r border-black p-2" colSpan="2">Central Tax</th>
              <th className="border-r border-black p-2" colSpan="2">State Tax</th>
              <th className="border-b border-black p-2" rowSpan="2">Total Tax Amount</th>
            </tr>
            <tr>
              <th className="border-r border-b border-black p-2">Rate</th>
              <th className="border-r border-b border-black p-2">Amount</th>
              <th className="border-r border-b border-black p-2">Rate</th>
              <th className="border-r border-b border-black p-2">Amount</th>
            </tr>
          </thead>
          <tbody className="text-right">
            <tr>
              <td className="border-r border-black p-2">49100010</td>
              <td className="border-r border-black p-2">{costs.baseAmount}</td>
              <td className="border-r border-black p-2">6%</td>
              <td className="border-r border-black p-2">{costs.cgst}</td>
              <td className="border-r border-black p-2">6%</td>
              <td className="border-r border-black p-2">{costs.sgst}</td>
              <td className="p-2">{costs.totalTaxAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in Words */}
        <div className="border-b border-black p-4">
          <div>Tax Amount (in words):</div>
          <div>INR {numberToWords(parseFloat(costs.totalTaxAmount))}</div>
        </div>

        {/* Declaration and Signature */}
        <div className="grid grid-cols-2">
          <div className="border-r border-black p-4">
            <div className="font-bold mb-2">Declaration</div>
            <div className="text-sm">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="p-4">
            <div className="text-right">
              <div className="font-bold mb-16">for M/S FAMOUS</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm mt-4">This is a Computer Generated Invoice</div>
    </div>
  );
};

export default TaxInvoice;