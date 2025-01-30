// import React from 'react';

// const EstimatePdfTemplate = ({ estimate }) => {
//   const renderCheckbox = (checked) => (
//     <div className={`w-4 h-4 border border-gray-400 ${checked ? 'bg-gray-400' : ''}`} />
//   );

//   const calculateTotalCostPerCard = (calculations) => {
//     if (!calculations) return 0;
    
//     const relevantFields = [
//       'paperAndCuttingCostPerCard',
//       'lpCostPerCard',
//       'fsCostPerCard',
//       'embCostPerCard',
//       'lpCostPerCardSandwich',
//       'fsCostPerCardSandwich',
//       'embCostPerCardSandwich',
//       'digiCostPerCard'
//     ];

//     return relevantFields.reduce((acc, key) => {
//       const value = calculations[key];
//       return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
//     }, 0);
//   };

//   const totalCostPerCard = calculateTotalCostPerCard(estimate.calculations);
//   const totalProjectCost = totalCostPerCard * (estimate.jobDetails?.quantity || 0);

//   return (
//     <div className="p-8 max-w-3xl mx-auto bg-white">
//       {/* Header */}
//       <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
//         <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
//         <div className="flex-1 ml-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="font-bold">Client</div>
//               <div>{estimate.clientName}</div>
//             </div>
//             <div>
//               <div className="font-bold">Job Ticket no.</div>
//               <div className="text-red-600">ROD-14DEC24</div>
//             </div>
//             <div>
//               <div className="font-bold">Assigned to:</div>
//               <div className="text-red-600">Press Team</div>
//             </div>
//             <div>
//               <div className="font-bold">Order No.</div>
//               <div>{`${estimate.clientName}_V1/Sep/2024_455570`}</div>
//             </div>
//             <div>
//               <div className="font-bold">Delivery Date</div>
//               <div>
//                 {new Date(estimate.deliveryDate).toLocaleDateString('en-GB', {
//                   day: '2-digit',
//                   month: 'short',
//                   year: 'numeric'
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Job Section */}
//       <div className="border border-gray-800 p-4 mb-6">
//         {/* Job Type Header */}
//         <div className="flex justify-between mb-4">
//           <div>
//             <div className="font-bold">Job</div>
//             <div>{estimate.jobDetails?.jobType || 'CARD'}</div>
//           </div>
//           <div>
//             <div className="font-bold">Die. Image</div>
//             {estimate.dieDetails?.image && (
//               <img 
//                 src={estimate.dieDetails.image} 
//                 alt="Die" 
//                 className="w-24 h-24 object-contain"
//               />
//             )}
//           </div>
//         </div>

//         {/* Paper & Die Details */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <div className="font-bold">Paper & GSM</div>
//             <div>{estimate.jobDetails?.paperName || ''}</div>
//           </div>
//           <div>
//             <div className="font-bold">Die. No</div>
//             <div>{estimate.dieDetails?.dieCode || ''}</div>
//           </div>
//         </div>

//         {/* Size Details */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <div className="font-bold">Final Size</div>
//             <div>
//               {estimate.dieDetails?.dieSize?.length || ''}" x {estimate.dieDetails?.dieSize?.breadth || ''}"
//             </div>
//           </div>
//           <div>
//             <div className="font-bold">Closed Size</div>
//             <div>
//               {estimate.dieDetails?.dieSize?.length || ''}" x {estimate.dieDetails?.dieSize?.breadth || ''}"
//             </div>
//           </div>
//         </div>

//         {/* Quantity Details */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <div className="font-bold">Total Qnty.</div>
//             <div>{estimate.jobDetails?.quantity || ''}</div>
//           </div>
//           <div>
//             <div className="font-bold">Babies Qnty.</div>
//             <div>10</div>
//           </div>
//         </div>

//         {/* Letter Press Section */}
//         <div className="mb-4">
//           <div className="font-bold">LETTER PRESS</div>
//           <div className="flex items-center gap-2 mb-2">
//             <span>{estimate.lpDetails?.isLPUsed ? 'YES' : 'NO'}</span>
//             <div className="flex gap-4 ml-auto">
//               <div className="flex items-center gap-1">
//                 <span>Kiss</span>
//                 {renderCheckbox(false)}
//               </div>
//               <div className="flex items-center gap-1">
//                 <span>Bite</span>
//                 {renderCheckbox(false)}
//               </div>
//               <div className="flex items-center gap-1">
//                 <span>Blind</span>
//                 {renderCheckbox(false)}
//               </div>
//             </div>
//           </div>
//           {estimate.lpDetails?.colorDetails?.map((color, index) => (
//             <div key={index} className="bg-gray-200 p-1 mb-1">
//               <span>Color {index + 1}: </span>
//               <span>{color.pantoneType || 'XXXXXXXXX'}</span>
//             </div>
//           ))}
//         </div>

//         {/* Foil Stamping Section */}
//         <div className="mb-4">
//           <div className="font-bold">FOIL STAMPING</div>
//           <div>{estimate.fsDetails?.isFSUsed ? 'YES' : 'NO'}</div>
//           {estimate.fsDetails?.isFSUsed && (
//             <>
//               <div>FS TYPE: {estimate.fsDetails.fsType}</div>
//               {estimate.fsDetails.foilDetails?.map((foil, index) => (
//                 <div key={index}>Foil Color {index + 1}: {foil.foilType}</div>
//               ))}
//             </>
//           )}
//         </div>

//         {/* Embossing Section */}
//         <div className="mb-4">
//           <div className="font-bold">EMBOSSING</div>
//           <div>{estimate.embDetails?.isEMBUsed ? 'YES' : 'NO'}</div>
//         </div>

//         {/* Digital Section */}
//         <div className="mb-4">
//           <div className="font-bold">DIGITAL</div>
//           <div>{estimate.digiDetails?.isDigiUsed ? 'YES' : 'NO'}</div>
//         </div>

//         {/* Cost Calculations */}
//         <div className="mt-6 border-t border-gray-300 pt-4">
//           <div className="space-y-2">
//             {estimate.calculations && Object.entries(estimate.calculations)
//               .filter(([key, value]) => value && value !== "0" && value !== "0.00")
//               .map(([key, value]) => (
//                 <div key={key} className="flex justify-between items-center">
//                   <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/Per Card/g, '')}</span>
//                   <span>₹ {parseFloat(value).toFixed(2)}</span>
//                 </div>
//               ))
//             }
            
//             <div className="border-t border-gray-300 pt-2 mt-4">
//               <div className="flex justify-between items-center font-bold">
//                 <span>Total Cost per Card:</span>
//                 <span>₹ {totalCostPerCard.toFixed(2)}</span>
//               </div>
//             </div>
            
//             <div className="border-t border-gray-300 pt-2 mt-2">
//               <div className="flex justify-between items-center font-bold text-lg text-blue-600">
//                 <span>Total Project Cost ({estimate.jobDetails?.quantity || 0} pcs):</span>
//                 <span>₹ {totalProjectCost.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EstimatePdfTemplate;