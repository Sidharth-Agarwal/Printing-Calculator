// // import React, { useState, useEffect } from 'react';

// // const DieImage = ({ imageUrl }) => {
// //   const [imageStatus, setImageStatus] = useState('loading');

// //   useEffect(() => {
// //     if (!imageUrl) {
// //       setImageStatus('error');
// //       return;
// //     }

// //     const img = new Image();
// //     img.onload = () => setImageStatus('loaded');
// //     img.onerror = () => setImageStatus('error');
// //     img.src = imageUrl;

// //     return () => {
// //       img.onload = null;
// //       img.onerror = null;
// //     };
// //   }, [imageUrl]);

// //   if (imageStatus === 'loading') {
// //     return (
// //       <div className="border rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
// //         <div className="text-center text-gray-500">
// //           <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
// //             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
// //           </svg>
// //           <span className="text-sm">Loading image...</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (imageStatus === 'error') {
// //     return (
// //       <div className="border rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
// //         <div className="text-center text-gray-500">
// //           <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
// //           </svg>
// //           <span className="text-sm">Die image unavailable</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="border rounded-lg p-2 h-32 bg-white">
// //       <div className="relative w-full h-full">
// //         <img 
// //           src={imageUrl} 
// //           alt="Die" 
// //           className="w-full h-full object-contain"
// //           onError={() => setImageStatus('error')}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // const ProcessDetails = ({ process, type }) => {
// //   if (!process || !process[`is${type}Used`]) return null;

// //   const renderDetails = () => {
// //     switch (type) {
// //       case 'LP':
// //         return (
// //           <>
// //             <p className="font-bold mb-2">Colors: <span className="font-normal">{process.noOfColors}</span></p>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {process.colorDetails.map((color, idx) => (
// //                 <div key={idx} className="border rounded-lg p-4 bg-white">
// //                   <p className="font-bold mb-2">Color {idx + 1}:</p>
// //                   <p className="text-sm">Pantone: <span className="font-normal">{color.pantoneType}</span></p>
// //                   <p className="text-sm">Plate Size: <span className="font-normal">
// //                     {color.plateDimensions?.length} x {color.plateDimensions?.breadth}
// //                   </span></p>
// //                   <p className="text-sm">Plate Type: <span className="font-normal">{color.plateType}</span></p>
// //                   <p className="text-sm">MR Type: <span className="font-normal">{color.mrType}</span></p>
// //                 </div>
// //               ))}
// //             </div>
// //           </>
// //         );
// //       case 'FS':
// //         return (
// //           <>
// //             <p className="font-bold mb-2">Type: <span className="font-normal">{process.fsType}</span></p>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {process.foilDetails.map((foil, idx) => (
// //                 <div key={idx} className="border rounded-lg p-4 bg-white">
// //                   <p className="font-bold mb-2">Foil {idx + 1}:</p>
// //                   <p className="text-sm">Size: <span className="font-normal">
// //                     {foil.blockDimension?.length} x {foil.blockDimension?.breadth}
// //                   </span></p>
// //                   <p className="text-sm">Foil Type: <span className="font-normal">{foil.foilType}</span></p>
// //                   <p className="text-sm">Block Type: <span className="font-normal">{foil.blockType}</span></p>
// //                   <p className="text-sm">MR Type: <span className="font-normal">{foil.mrType}</span></p>
// //                 </div>
// //               ))}
// //             </div>
// //           </>
// //         );
// //       case 'EMB':
// //         return (
// //           <div className="border rounded-lg p-4 bg-white">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <p className="text-sm">Plate Size: <span className="font-normal">
// //                   {process.plateDimensions?.length} x {process.plateDimensions?.breadth}
// //                 </span></p>
// //                 <p className="text-sm">Male Plate: <span className="font-normal">{process.plateTypeMale}</span></p>
// //               </div>
// //               <div>
// //                 <p className="text-sm">Female Plate: <span className="font-normal">{process.plateTypeFemale}</span></p>
// //                 <p className="text-sm">MR Type: <span className="font-normal">{process.embMR}</span></p>
// //               </div>
// //             </div>
// //           </div>
// //         );
// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="mb-6">
// //       <h3 className="text-lg font-bold mb-3 bg-gray-200 p-2">{type} Details</h3>
// //       {renderDetails()}
// //     </div>
// //   );
// // };

// // const GroupedJobTicket = ({ estimates, groupKey }) => {
// //   const [clientName, projectName] = groupKey.split('-');

// //   const formatDate = (dateString) => {
// //     if (!dateString) return "Not specified";
// //     return new Date(dateString).toLocaleDateString('en-GB');
// //   };

// //   const calculateTotalCost = (estimate) => {
// //     if (!estimate.calculations) return 0;

// //     const relevantFields = [
// //       'paperAndCuttingCostPerCard',
// //       'lpCostPerCard',
// //       'fsCostPerCard',
// //       'embCostPerCard',
// //       'lpCostPerCardSandwich',
// //       'fsCostPerCardSandwich',
// //       'embCostPerCardSandwich',
// //       'digiCostPerCard'
// //     ];

// //     const costPerCard = relevantFields.reduce((acc, key) => {
// //       const value = estimate.calculations[key];
// //       return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
// //     }, 0);

// //     return {
// //       perCard: costPerCard,
// //       total: costPerCard * (estimate.jobDetails?.quantity || 0)
// //     };
// //   };

// //   return (
// //     <div className="max-w-4xl mx-auto bg-white p-8">
// //       {/* Header Section */}
// //       <div className="border-b-2 border-gray-800 pb-4 mb-6">
// //         <h1 className="text-3xl font-bold text-center mb-4">GROUP JOB TICKET</h1>
// //         <div className="grid grid-cols-2 gap-4">
// //           <div>
// //             <p className="font-bold">Client Name: <span className="font-normal">{clientName}</span></p>
// //             <p className="font-bold">Project Name: <span className="font-normal">{projectName}</span></p>
// //             <p className="font-bold">Total Estimates: <span className="font-normal">{estimates.length}</span></p>
// //           </div>
// //           <div>
// //             <p className="font-bold">Initial Order Date: <span className="font-normal">
// //               {formatDate(estimates[0]?.date)}
// //             </span></p>
// //             <p className="font-bold">Latest Delivery Date: <span className="font-normal">
// //               {formatDate(estimates.reduce((latest, est) => 
// //                 !latest || new Date(est.deliveryDate) > new Date(latest) ? est.deliveryDate : latest, null
// //               ))}
// //             </span></p>
// //             <p className="font-bold">Job Type: <span className="font-normal">
// //               {estimates[0]?.jobDetails?.jobType}
// //             </span></p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Individual Estimates */}
// //       {estimates.map((estimate, index) => (
// //         <div key={estimate.id} className="mb-8 pb-6 border-b border-gray-300">
// //           <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">
// //             Estimate #{index + 1} - Quantity: {estimate.jobDetails?.quantity} pcs
// //           </h2>

// //           {/* Paper and Die Details */}
// //           <div className="mb-6">
// //             <h3 className="text-lg font-bold mb-3 bg-gray-200 p-2">Paper and Die Details</h3>
// //             <div className="grid grid-cols-3 gap-4">
// //               <div className="col-span-2">
// //                 <div className="grid grid-cols-2 gap-4">
// //                   <div>
// //                     <p className="font-bold">Paper: <span className="font-normal">{estimate.jobDetails?.paperName}</span></p>
// //                     <p className="font-bold">Paper Provided: <span className="font-normal">{estimate.jobDetails?.paperProvided}</span></p>
// //                   </div>
// //                   <div>
// //                     <p className="font-bold">Die Code: <span className="font-normal">{estimate.dieDetails?.dieCode}</span></p>
// //                     <p className="font-bold">Die Size: <span className="font-normal">
// //                       {estimate.dieDetails?.dieSize?.length} x {estimate.dieDetails?.dieSize?.breadth}
// //                     </span></p>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div>
// //                 <DieImage imageUrl={estimate.dieDetails?.image} />
// //               </div>
// //             </div>
// //           </div>

// //           {/* Process Details */}
// //           <ProcessDetails process={estimate.lpDetails} type="LP" />
// //           <ProcessDetails process={estimate.fsDetails} type="FS" />
// //           <ProcessDetails process={estimate.embDetails} type="EMB" />

// //           {/* Sandwich Component Details */}
// //           {estimate.sandwich?.isSandwichComponentUsed && (
// //             <div className="mb-6">
// //               <h3 className="text-lg font-bold mb-3 bg-gray-200 p-2">Sandwich Details</h3>
// //               <ProcessDetails process={estimate.sandwich.lpDetailsSandwich} type="LP" />
// //               <ProcessDetails process={estimate.sandwich.fsDetailsSandwich} type="FS" />
// //               <ProcessDetails process={estimate.sandwich.embDetailsSandwich} type="EMB" />
// //             </div>
// //           )}

// //           {/* Cost Summary */}
// //           <div className="mt-4 bg-gray-100 p-4 rounded-md">
// //             <h4 className="font-bold mb-2">Cost Summary:</h4>
// //             <div className="grid grid-cols-2 gap-4">
// //               {(() => {
// //                 const costs = calculateTotalCost(estimate);
// //                 return (
// //                   <>
// //                     <p className="text-sm">Cost per Card: <span className="font-bold">₹ {costs.perCard.toFixed(2)}</span></p>
// //                     <p className="text-sm">Total Cost: <span className="font-bold">₹ {costs.total.toFixed(2)}</span></p>
// //                   </>
// //                 );
// //               })()}
// //             </div>
// //           </div>
// //         </div>
// //       ))}

// //       {/* Sign-off Section */}
// //       <div className="mt-12">
// //         <div className="grid grid-cols-3 gap-8">
// //           {['Production Manager', 'Quality Control', 'Supervisor'].map((role) => (
// //             <div key={role} className="text-center">
// //               <div className="border-t border-black pt-4">
// //                 <p className="text-sm font-medium">{role}</p>
// //                 <div className="mt-8"></div>
// //                 <p className="text-xs text-gray-500 mt-2">Sign & Date</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Footer Notes */}
// //       <div className="mt-8 pt-4 border-t border-gray-200">
// //         <div className="text-xs text-gray-500 space-y-1">
// //           <p>* All measurements are in inches unless otherwise specified</p>
// //           <p>* Please verify all specifications before beginning production</p>
// //           <p>* Report any discrepancies immediately to the production manager</p>
// //         </div>
// //       </div>

// //       {/* Print Info */}
// //       <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
// //         <p>Generated on: {new Date().toLocaleString()}</p>
// //         <p>Group Job Ticket - {clientName} - {projectName}</p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default GroupedJobTicket;

// import React, { useState, useEffect } from 'react';

// const DieImage = ({ imageUrl }) => {
//   const [imageStatus, setImageStatus] = useState('loading');

//   useEffect(() => {
//     if (!imageUrl) {
//       setImageStatus('error');
//       return;
//     }

//     const img = new Image();
//     img.onload = () => setImageStatus('loaded');
//     img.onerror = () => setImageStatus('error');
//     img.src = imageUrl;

//     return () => {
//       img.onload = null;
//       img.onerror = null;
//     };
//   }, [imageUrl]);

//   if (imageStatus === 'loading') {
//     return (
//       <div className="border rounded-lg p-2 h-24 flex items-center justify-center bg-gray-50">
//         <div className="text-center text-gray-500">
//           <svg className="animate-spin h-6 w-6 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//           </svg>
//           <span className="text-xs">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (imageStatus === 'error') {
//     return (
//       <div className="border rounded-lg p-2 h-24 flex items-center justify-center bg-gray-50">
//         <div className="text-center text-gray-500">
//           <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <span className="text-xs">No image</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="border rounded-lg p-1 h-24 bg-white">
//       <div className="relative w-full h-full">
//         <img 
//           src={imageUrl} 
//           alt="Die" 
//           className="w-full h-full object-contain"
//           onError={() => setImageStatus('error')}
//         />
//       </div>
//     </div>
//   );
// };

// const ProcessDetails = ({ process, type }) => {
//   if (!process || !process[`is${type}Used`]) return null;

//   const renderDetails = () => {
//     switch (type) {
//       case 'LP':
//         return (
//           <>
//             <p className="text-sm mb-2"><span className="font-medium">Colors:</span> {process.noOfColors}</p>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
//               {process.colorDetails.map((color, idx) => (
//                 <div key={idx} className="border rounded p-2 bg-white text-sm">
//                   <p className="font-medium mb-1">Color {idx + 1}:</p>
//                   <p><span className="font-medium">Pantone:</span> {color.pantoneType}</p>
//                   <p><span className="font-medium">Plate Size:</span> {color.plateDimensions?.length} x {color.plateDimensions?.breadth}</p>
//                   <p><span className="font-medium">Plate Type:</span> {color.plateType}</p>
//                   <p><span className="font-medium">MR Type:</span> {color.mrType}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         );
//       case 'FS':
//         return (
//           <>
//             <p className="text-sm mb-2"><span className="font-medium">Type:</span> {process.fsType}</p>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
//               {process.foilDetails.map((foil, idx) => (
//                 <div key={idx} className="border rounded p-2 bg-white text-sm">
//                   <p className="font-medium mb-1">Foil {idx + 1}:</p>
//                   <p><span className="font-medium">Size:</span> {foil.blockDimension?.length} x {foil.blockDimension?.breadth}</p>
//                   <p><span className="font-medium">Foil Type:</span> {foil.foilType}</p>
//                   <p><span className="font-medium">Block Type:</span> {foil.blockType}</p>
//                   <p><span className="font-medium">MR Type:</span> {foil.mrType}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         );
//       case 'EMB':
//         return (
//           <div className="border rounded p-2 bg-white text-sm">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <p><span className="font-medium">Plate Size:</span> {process.plateDimensions?.length} x {process.plateDimensions?.breadth}</p>
//                 <p><span className="font-medium">Male Plate:</span> {process.plateTypeMale}</p>
//               </div>
//               <div>
//                 <p><span className="font-medium">Female Plate:</span> {process.plateTypeFemale}</p>
//                 <p><span className="font-medium">MR Type:</span> {process.embMR}</p>
//               </div>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="mb-3">
//       <h3 className="text-md font-bold mb-2 bg-gray-100 p-1 rounded">{type} Details</h3>
//       {renderDetails()}
//     </div>
//   );
// };

// const SandwichDetails = ({ sandwich }) => {
//   if (!sandwich?.isSandwichComponentUsed) return null;

//   return (
//     <div className="mb-3">
//       <h3 className="text-md font-bold mb-2 bg-gray-100 p-1 rounded">Sandwich Details</h3>
//       {sandwich.lpDetailsSandwich?.isLPUsed && (
//         <div className="mb-2">
//           <ProcessDetails process={sandwich.lpDetailsSandwich} type="LP" />
//         </div>
//       )}
//       {sandwich.fsDetailsSandwich?.isFSUsed && (
//         <div className="mb-2">
//           <ProcessDetails process={sandwich.fsDetailsSandwich} type="FS" />
//         </div>
//       )}
//       {sandwich.embDetailsSandwich?.isEMBUsed && (
//         <div className="mb-2">
//           <ProcessDetails process={sandwich.embDetailsSandwich} type="EMB" />
//         </div>
//       )}
//     </div>
//   );
// };

// const PastingDetails = ({ pasting }) => {
//   if (!pasting?.isPastingUsed) return null;

//   return (
//     <div className="mb-3">
//       <h3 className="text-md font-bold mb-2 bg-gray-100 p-1 rounded">Pasting Details</h3>
//       <div className="border rounded p-2 bg-white text-sm">
//         <p><span className="font-medium">Type:</span> {pasting.pastingType}</p>
//       </div>
//     </div>
//   );
// };

// const EstimateDetails = ({ estimate, index }) => {
//   const calculateTotalCost = (estimate) => {
//     if (!estimate.calculations) return { perCard: 0, total: 0 };

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

//     const costPerCard = relevantFields.reduce((acc, key) => {
//       const value = estimate.calculations[key];
//       return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
//     }, 0);

//     return {
//       perCard: costPerCard,
//       total: costPerCard * (estimate.jobDetails?.quantity || 0)
//     };
//   };

//   const costs = calculateTotalCost(estimate);

//   return (
//     <div className="border rounded-lg bg-white p-3">
//       <h2 className="text-lg font-bold mb-2 bg-gray-100 p-2 rounded">
//         Estimate #{index + 1} - Quantity: {estimate.jobDetails?.quantity} pcs
//       </h2>

//       {/* Paper and Die Details */}
//       <div className="mb-3">
//         <h3 className="text-md font-bold mb-2 bg-gray-100 p-1 rounded">Paper and Die Details</h3>
//         <div className="grid grid-cols-3 gap-2">
//           <div className="col-span-2">
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div>
//                 <p><span className="font-medium">Paper:</span> {estimate.jobDetails?.paperName}</p>
//                 <p><span className="font-medium">Paper Provided:</span> {estimate.jobDetails?.paperProvided}</p>
//               </div>
//               <div>
//                 <p><span className="font-medium">Die Code:</span> {estimate.dieDetails?.dieCode}</p>
//                 <p><span className="font-medium">Die Size:</span> {estimate.dieDetails?.dieSize?.length} x {estimate.dieDetails?.dieSize?.breadth}</p>
//               </div>
//             </div>
//           </div>
//           <div>
//             <DieImage imageUrl={estimate.dieDetails?.image} />
//           </div>
//         </div>
//       </div>

//       {/* Process Details */}
//       <ProcessDetails process={estimate.lpDetails} type="LP" />
//       <ProcessDetails process={estimate.fsDetails} type="FS" />
//       <ProcessDetails process={estimate.embDetails} type="EMB" />

//       {/* Sandwich Details */}
//       <SandwichDetails sandwich={estimate.sandwich} />

//       {/* Pasting Details */}
//       <PastingDetails pasting={estimate.pasting} />

//       {/* Cost Summary */}
//       <div className="bg-gray-100 p-2 rounded text-sm">
//         <h4 className="font-bold mb-1">Cost Summary:</h4>
//         <div className="grid grid-cols-2 gap-2">
//           <p>Cost per Card: <span className="font-bold">₹ {costs.perCard.toFixed(2)}</span></p>
//           <p>Total Cost: <span className="font-bold">₹ {costs.total.toFixed(2)}</span></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const GroupedJobTicket = ({ estimates, groupKey }) => {
//   const [clientName, projectName] = groupKey.split('-');

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     return new Date(dateString).toLocaleDateString('en-GB');
//   };

//   return (
//     <div className="max-w-full mx-auto bg-white p-4">
//       {/* Header Section */}
//       <div className="border-b-2 border-gray-800 pb-3 mb-4">
//         <h1 className="text-2xl font-bold text-center mb-3">GROUP JOB TICKET</h1>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p><span className="font-bold">Client Name:</span> {clientName}</p>
//             <p><span className="font-bold">Project Name:</span> {projectName}</p>
//             <p><span className="font-bold">Total Estimates:</span> {estimates.length}</p>
//           </div>
//           <div>
//             <p><span className="font-bold">Initial Order Date:</span> {formatDate(estimates[0]?.date)}</p>
//             <p><span className="font-bold">Latest Delivery Date:</span> {
//               formatDate(estimates.reduce((latest, est) => 
//                 !latest || new Date(est.deliveryDate) > new Date(latest) ? est.deliveryDate : latest, null
//               ))
//             }</p>
//             <p><span className="font-bold">Job Type:</span> {estimates[0]?.jobDetails?.jobType}</p>
//           </div>
//         </div>
//       </div>

//       {/* Estimates Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//         {estimates.map((estimate, index) => (
//           <EstimateDetails 
//             key={estimate.id} 
//             estimate={estimate} 
//             index={index}
//           />
//         ))}
//       </div>

//       {/* Sign-off Section */}
//       <div className="mt-6">
//         <div className="grid grid-cols-3 gap-4">
//           {['Production Manager', 'Quality Control', 'Supervisor'].map((role) => (
//             <div key={role} className="text-center">
//               <div className="border-t border-black pt-2">
//                 <p className="text-sm font-medium">{role}</p>
//                 <div className="mt-6"></div>
//                 <p className="text-xs text-gray-500">Sign & Date</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Footer Notes */}
//       <div className="mt-4 pt-2 border-t border-gray-200">
//         <div className="text-xs text-gray-500 space-y-1">
//           <p>* All measurements are in inches unless otherwise specified</p>
//           <p>* Please verify all specifications before beginning production</p>
//           <p>* Report any discrepancies immediately to the production manager</p>
//         </div>
//       </div>

//       {/* Print Info */}
//       <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
//         <p>Generated on: {new Date().toLocaleString()}</p>
//         <p>Group Job Ticket - {clientName} - {projectName}</p>
//       </div>
//     </div>
//   );
// };

// export default GroupedJobTicket;

import React, { useState, useEffect } from 'react';

const DieImage = ({ imageUrl }) => {
  const [imageStatus, setImageStatus] = useState('loading');

  useEffect(() => {
    if (!imageUrl) {
      setImageStatus('error');
      return;
    }

    const img = new Image();
    img.onload = () => setImageStatus('loaded');
    img.onerror = () => setImageStatus('error');
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  if (imageStatus === 'loading') {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (imageStatus === 'error') {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-1 h-16 bg-white">
      <img 
        src={imageUrl} 
        alt="Die" 
        className="w-full h-full object-contain"
        onError={() => setImageStatus('error')}
      />
    </div>
  );
};

const LPSection = ({ lpDetails }) => {
  if (!lpDetails?.isLPUsed) return null;

  return (
    <div className="space-y-1">
      <p className="font-medium text-xs">Colors: {lpDetails.noOfColors}</p>
      <div className="grid grid-cols-1 gap-1">
        {lpDetails.colorDetails.map((color, idx) => (
          <div key={idx} className="border rounded p-1 bg-white text-xs">
            <div className="grid grid-cols-4 gap-x-2">
              <div>
                <span className="font-medium">Color {idx + 1}:</span><br />
                <span>{color.pantoneType}</span>
              </div>
              <div>
                <span className="font-medium">Size:</span><br />
                <span>{color.plateDimensions?.length} x {color.plateDimensions?.breadth}</span>
              </div>
              <div>
                <span className="font-medium">Plate:</span><br />
                <span>{color.plateType}</span>
              </div>
              <div>
                <span className="font-medium">MR:</span><br />
                <span>{color.mrType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FSSection = ({ fsDetails }) => {
  if (!fsDetails?.isFSUsed) return null;

  return (
    <div className="space-y-1">
      <p className="font-medium text-xs">Type: {fsDetails.fsType}</p>
      <div className="grid grid-cols-1 gap-1">
        {fsDetails.foilDetails.map((foil, idx) => (
          <div key={idx} className="border rounded p-1 bg-white text-xs">
            <div className="grid grid-cols-4 gap-x-2">
              <div>
                <span className="font-medium">Foil {idx + 1}:</span><br />
                <span>{foil.foilType}</span>
              </div>
              <div>
                <span className="font-medium">Size:</span><br />
                <span>{foil.blockDimension?.length} x {foil.blockDimension?.breadth}</span>
              </div>
              <div>
                <span className="font-medium">Block:</span><br />
                <span>{foil.blockType}</span>
              </div>
              <div>
                <span className="font-medium">MR:</span><br />
                <span>{foil.mrType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EMBSection = ({ embDetails }) => {
  if (!embDetails?.isEMBUsed) return null;

  return (
    <div className="border rounded p-1 bg-white text-xs">
      <div className="grid grid-cols-4 gap-x-2">
        <div>
          <span className="font-medium">Plate Size:</span><br />
          <span>{embDetails.plateDimensions?.length} x {embDetails.plateDimensions?.breadth}</span>
        </div>
        <div>
          <span className="font-medium">Male Plate:</span><br />
          <span>{embDetails.plateTypeMale}</span>
        </div>
        <div>
          <span className="font-medium">Female Plate:</span><br />
          <span>{embDetails.plateTypeFemale}</span>
        </div>
        <div>
          <span className="font-medium">MR Type:</span><br />
          <span>{embDetails.embMR}</span>
        </div>
      </div>
    </div>
  );
};

const EstimateDetails = ({ estimate, index }) => {
  const calculateTotalCost = (estimate) => {
    if (!estimate.calculations) return { perCard: 0, total: 0 };
    const relevantFields = [
      'paperAndCuttingCostPerCard', 'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 'digiCostPerCard'
    ];
    const costPerCard = relevantFields.reduce((acc, key) => {
      const value = estimate.calculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
    return {
      perCard: costPerCard,
      total: costPerCard * (estimate.jobDetails?.quantity || 0)
    };
  };

  const costs = calculateTotalCost(estimate);

  return (
    <div className="border rounded p-2 mb-2 bg-gray-50 print:break-inside-avoid">
      <h2 className="text-sm font-bold mb-2 bg-white p-1 rounded">
        Estimate #{index + 1} - Quantity: {estimate.jobDetails?.quantity} pcs
      </h2>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Column - Paper, Die, Cost */}
        <div className="col-span-3">
          <div className="space-y-2">
            {/* Paper and Die Details */}
            <div className="bg-white p-1 rounded text-xs">
              <h3 className="font-bold mb-1">Paper and Die Details</h3>
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <p><span className="font-medium">Paper:</span> {estimate.jobDetails?.paperName}</p>
                  <p><span className="font-medium">Provided:</span> {estimate.jobDetails?.paperProvided}</p>
                </div>
                <div>
                  <p><span className="font-medium">Die Code:</span> {estimate.dieDetails?.dieCode}</p>
                  <p><span className="font-medium">Size:</span> {estimate.dieDetails?.dieSize?.length} x {estimate.dieDetails?.dieSize?.breadth}</p>
                </div>
              </div>
              <div className="mt-1">
                <DieImage imageUrl={estimate.dieDetails?.image} />
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white p-1 rounded text-xs">
              <h4 className="font-bold mb-1">Cost Summary</h4>
              <p><span className="font-medium">Per Card:</span> ₹ {costs.perCard.toFixed(2)}</p>
              <p><span className="font-medium">Total:</span> ₹ {costs.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Process Details */}
        <div className="col-span-9">
          <div className="grid grid-cols-3 gap-3">
            {/* LP Details */}
            {estimate.lpDetails?.isLPUsed && (
              <div className="bg-white p-1 rounded">
                <h3 className="font-bold text-xs mb-1">LP Details</h3>
                <LPSection lpDetails={estimate.lpDetails} />
              </div>
            )}

            {/* FS Details */}
            {estimate.fsDetails?.isFSUsed && (
              <div className="bg-white p-1 rounded">
                <h3 className="font-bold text-xs mb-1">FS Details</h3>
                <FSSection fsDetails={estimate.fsDetails} />
              </div>
            )}

            {/* EMB Details */}
            {estimate.embDetails?.isEMBUsed && (
              <div className="bg-white p-1 rounded">
                <h3 className="font-bold text-xs mb-1">EMB Details</h3>
                <EMBSection embDetails={estimate.embDetails} />
              </div>
            )}

            {/* Sandwich Details */}
            {estimate.sandwich?.isSandwichComponentUsed && (
              <div className="bg-white p-1 rounded">
                <h3 className="font-bold text-xs mb-1">Sandwich Details</h3>
                {estimate.sandwich.lpDetailsSandwich?.isLPUsed && (
                  <div className="mb-1">
                    <LPSection lpDetails={estimate.sandwich.lpDetailsSandwich} />
                  </div>
                )}
                {estimate.sandwich.fsDetailsSandwich?.isFSUsed && (
                  <div className="mb-1">
                    <FSSection fsDetails={estimate.sandwich.fsDetailsSandwich} />
                  </div>
                )}
                {estimate.sandwich.embDetailsSandwich?.isEMBUsed && (
                  <EMBSection embDetails={estimate.sandwich.embDetailsSandwich} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupedJobTicket = ({ estimates, groupKey }) => {
  const [clientName, projectName] = groupKey.split('-');

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-white p-4" style={{ minWidth: '1200px' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-2 mb-4">
        <h1 className="text-xl font-bold text-center mb-2">GROUP JOB TICKET</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p><span className="font-bold">Client:</span> {clientName}</p>
            <p><span className="font-bold">Project:</span> {projectName}</p>
          </div>
          <div>
            <p><span className="font-bold">Initial Date:</span> {formatDate(estimates[0]?.date)}</p>
            <p><span className="font-bold">Delivery Date:</span> {
              formatDate(estimates.reduce((latest, est) => 
                !latest || new Date(est.deliveryDate) > new Date(latest) ? est.deliveryDate : latest, null
              ))
            }</p>
          </div>
          <div>
            <p><span className="font-bold">Estimates:</span> {estimates.length}</p>
            <p><span className="font-bold">Job Type:</span> {estimates[0]?.jobDetails?.jobType}</p>
          </div>
        </div>
      </div>

      {/* Estimates */}
      <div className="mb-4 space-y-2">
        {estimates.map((estimate, index) => (
          <EstimateDetails 
            key={estimate.id} 
            estimate={estimate} 
            index={index}
          />
        ))}
      </div>

      {/* Sign-off Section */}
      <div className="mt-6 print:mt-4">
        <div className="grid grid-cols-3 gap-8">
          {['Production Manager', 'Quality Control', 'Supervisor'].map((role) => (
            <div key={role} className="text-center">
              <div className="border-t border-black pt-2">
                <p className="text-sm font-medium">{role}</p>
                <div className="mt-4"></div>
                <p className="text-xs text-gray-500">Sign & Date</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>* All measurements are in inches unless otherwise specified</p>
          <p>* Please verify all specifications before beginning production</p>
          <p>* Report any discrepancies immediately to the production manager</p>
        </div>
      </div>

      {/* Print Info */}
      <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>Group Job Ticket - {clientName} - {projectName}</p>
      </div>
    </div>
  );
};

export default GroupedJobTicket;