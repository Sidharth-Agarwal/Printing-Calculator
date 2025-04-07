// // // import React, { useState } from 'react';

// // // const OrderCard = ({ 
// // //   order, 
// // //   isSelected,
// // //   onSelect,
// // //   onClick,
// // //   onUpdateStage,
// // //   stages,
// // //   formatDate 
// // // }) => {
// // //   const [isUpdating, setIsUpdating] = useState(false);

// // //   // Stage colors for visual representation
// // //   const stageColors = {
// // //     'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
// // //     'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
// // //     'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
// // //     'Printing': { bg: 'bg-orange-100', text: 'text-orange-800' },
// // //     'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800' },
// // //     'Delivery': { bg: 'bg-green-100', text: 'text-green-800' }
// // //   };

// // //   // Get current stage color
// // //   const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

// // //   // Handle checkbox click
// // //   const handleCheckboxChange = (e) => {
// // //     e.stopPropagation(); // Prevent card click when clicking checkbox
// // //     onSelect(order.id, !isSelected);
// // //   };

// // //   // Handle stage update
// // //   const handleStageUpdate = async (newStage) => {
// // //     if (isUpdating) return;
    
// // //     try {
// // //       setIsUpdating(true);
// // //       await onUpdateStage(order.id, newStage);
// // //     } catch (error) {
// // //       console.error("Error updating stage:", error);
// // //     } finally {
// // //       setIsUpdating(false);
// // //     }
// // //   };

// // //   // Calculate next and previous stages
// // //   const currentStageIndex = stages.indexOf(order.stage);
// // //   const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;
// // //   const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;

// // //   return (
// // //     <div 
// // //       className={`border rounded-md p-3 bg-white transition cursor-pointer shadow-sm hover:shadow-md
// // //         ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
// // //       onClick={onClick}
// // //     >
// // //       {/* Header Section */}
// // //       <div className="flex justify-between items-center mb-2">
// // //         <div className="flex items-center gap-2">
// // //           <input
// // //             type="checkbox"
// // //             checked={isSelected}
// // //             onChange={handleCheckboxChange}
// // //             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
// // //             onClick={(e) => e.stopPropagation()}
// // //           />
// // //           <div className="font-medium text-sm text-blue-700">
// // //             {order.jobDetails?.jobType || "Unknown Job"}
// // //           </div>
// // //         </div>
// // //         <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
// // //           {order.stage}
// // //         </span>
// // //       </div>

// // //       {/* Brief Details */}
// // //       <div className="text-xs text-gray-600 mb-3">
// // //         <div className="flex justify-between">
// // //           <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
// // //           <span>Due: {formatDate(order.deliveryDate)}</span>
// // //         </div>
// // //         <div>{order.projectName || "No Project"}</div>
// // //         <div>{order.jobDetails?.paperName || "No Paper Specified"}</div>
// // //       </div>

// // //       {/* Processing Types */}
// // //       <div className="flex flex-wrap gap-1 mb-3">
// // //         {order.lpDetails?.isLPUsed && 
// // //           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
// // //         {order.fsDetails?.isFSUsed && 
// // //           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
// // //         {order.embDetails?.isEMBUsed && 
// // //           <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
// // //         {order.digiDetails?.isDigiUsed && 
// // //           <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
// // //         {order.pasting?.isPastingUsed && 
// // //           <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
// // //       </div>

// // //       {/* Buttons Section */}
// // //       <div className="space-y-1.5">
// // //         <button
// // //           onClick={(e) => {
// // //             e.stopPropagation();
// // //             onClick(order);
// // //           }}
// // //           className="text-xs w-full px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
// // //         >
// // //           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
// // //             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
// // //             <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
// // //           </svg>
// // //           View Details
// // //         </button>

// // //         {/* Stage Progress Buttons */}
// // //         <div className="flex gap-1">
// // //           {prevStage && (
// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 handleStageUpdate(prevStage);
// // //               }}
// // //               disabled={isUpdating}
// // //               className="text-xs flex-1 px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
// // //             >
// // //               <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
// // //                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
// // //               </svg>
// // //               Back
// // //             </button>
// // //           )}
          
// // //           {nextStage && (
// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 handleStageUpdate(nextStage);
// // //               }}
// // //               disabled={isUpdating}
// // //               className="text-xs flex-1 px-2 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
// // //             >
// // //               {isUpdating ? (
// // //                 <>
// // //                   <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // //                   </svg>
// // //                   Updating...
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   {nextStage}
// // //                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" viewBox="0 0 20 20" fill="currentColor">
// // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
// // //                   </svg>
// // //                 </>
// // //               )}
// // //             </button>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default OrderCard;

// // import React, { useState } from 'react';

// // const OrderCard = ({ 
// //   order, 
// //   isSelected,
// //   onSelect,
// //   onClick,
// //   onUpdateStage,
// //   stages,
// //   formatDate 
// // }) => {
// //   const [isUpdating, setIsUpdating] = useState(false);

// //   // Stage colors for visual representation
// //   const stageColors = {
// //     'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
// //     'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800', color: 'bg-indigo-500' },
// //     'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800', color: 'bg-cyan-500' },
// //     'Printing': { bg: 'bg-orange-100', text: 'text-orange-800', color: 'bg-orange-500' },
// //     'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800', color: 'bg-pink-500' },
// //     'Delivery': { bg: 'bg-green-100', text: 'text-green-800', color: 'bg-green-500' }
// //   };

// //   // Get current stage color
// //   const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

// //   // Handle checkbox click
// //   const handleCheckboxChange = (e) => {
// //     e.stopPropagation(); // Prevent card click when clicking checkbox
// //     onSelect(order.id, !isSelected);
// //   };

// //   // Handle stage update
// //   const handleStageUpdate = async (e, newStage) => {
// //     e.stopPropagation(); // Prevent card click when updating stage
// //     if (isUpdating) return;
    
// //     try {
// //       setIsUpdating(true);
// //       await onUpdateStage(order.id, newStage);
// //     } catch (error) {
// //       console.error("Error updating stage:", error);
// //     } finally {
// //       setIsUpdating(false);
// //     }
// //   };

// //   // Calculate stage progress percent
// //   const currentStageIndex = stages.indexOf(order.stage);
// //   const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;

// //   return (
// //     <div 
// //       className={`border rounded-md p-3 bg-white transition cursor-pointer shadow-sm hover:shadow-md
// //         ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
// //       onClick={onClick}
// //     >
// //       {/* Header Section */}
// //       <div className="flex justify-between items-center mb-2">
// //         <div className="flex items-center gap-2">
// //           <input
// //             type="checkbox"
// //             checked={isSelected}
// //             onChange={handleCheckboxChange}
// //             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
// //             onClick={(e) => e.stopPropagation()}
// //           />
// //           <div className="font-medium text-sm text-blue-700">
// //             {order.jobDetails?.jobType || "Unknown Job"}
// //           </div>
// //         </div>
// //         <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
// //           {order.stage}
// //         </span>
// //       </div>

// //       {/* Brief Details */}
// //       <div className="text-xs text-gray-600 mb-3">
// //         <div className="flex justify-between">
// //           <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
// //           <span>Due: {formatDate(order.deliveryDate)}</span>
// //         </div>
// //         <div>{order.projectName || "No Project"}</div>
// //         <div>{order.jobDetails?.paperName || "No Paper Specified"}</div>
// //       </div>

// //       {/* Processing Types */}
// //       <div className="flex flex-wrap gap-1 mb-3">
// //         {order.lpDetails?.isLPUsed && 
// //           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
// //         {order.fsDetails?.isFSUsed && 
// //           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
// //         {order.embDetails?.isEMBUsed && 
// //           <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
// //         {order.digiDetails?.isDigiUsed && 
// //           <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
// //         {order.pasting?.isPastingUsed && 
// //           <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
// //       </div>

// //       {/* Progress Bar */}
// //       <div className="h-1.5 w-full bg-gray-200 rounded-full mb-3">
// //         <div 
// //           className={`h-1.5 rounded-full ${stageColors[order.stage]?.color || 'bg-blue-500'}`}
// //           style={{ width: `${progressPercent}%` }}
// //         ></div>
// //       </div>

// //       {/* Stage Tracking */}
// //       <div className="flex justify-between items-center mb-3">
// //         {stages.map((stage, index) => {
// //           const stageComplete = index <= currentStageIndex;
// //           const isCurrentStage = index === currentStageIndex;
          
// //           return (
// //             <div 
// //               key={stage}
// //               onClick={(e) => handleStageUpdate(e, stage)}
// //               className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center
// //                 ${isCurrentStage ? 'ring-2 ring-blue-300' : ''}
// //                 ${stageComplete ? stageColors[stage]?.color || 'bg-blue-500' : 'bg-gray-200'}
// //                 ${stageComplete ? 'text-white' : 'text-gray-500'}
// //                 transition-all hover:opacity-80`}
// //               title={stage}
// //             >
// //               {isUpdating && isCurrentStage ? (
// //                 <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
// //               ) : stageComplete ? (
// //                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
// //                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //                 </svg>
// //               ) : (
// //                 <span className="text-xs">{index + 1}</span>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       {/* View Details Button */}
// //       <button
// //         onClick={(e) => {
// //           e.stopPropagation();
// //           onClick(order);
// //         }}
// //         className="text-xs w-full px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
// //       >
// //         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
// //           <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
// //           <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
// //         </svg>
// //         View Details
// //       </button>
// //     </div>
// //   );
// // };

// // export default OrderCard;

// import React, { useState } from 'react';

// const OrderCard = ({ 
//   order, 
//   isSelected,
//   onSelect,
//   onClick,
//   onUpdateStage,
//   stages,
//   formatDate 
// }) => {
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Stage colors for visual representation
//   const stageColors = {
//     'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800', color: 'bg-gray-400' },
//     'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800', color: 'bg-indigo-500' },
//     'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800', color: 'bg-cyan-500' },
//     'Printing': { bg: 'bg-orange-100', text: 'text-orange-800', color: 'bg-orange-500' },
//     'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800', color: 'bg-pink-500' },
//     'Delivery': { bg: 'bg-green-100', text: 'text-green-800', color: 'bg-green-500' },
//     'Completed': { bg: 'bg-green-200', text: 'text-green-900', color: 'bg-green-600' } // Completed stage
//   };

//   // Get current stage color
//   const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

//   // Handle checkbox click
//   const handleCheckboxChange = (e) => {
//     e.stopPropagation(); // Prevent card click when clicking checkbox
//     onSelect(order.id, !isSelected);
//   };

//   // Handle stage update
//   const handleStageUpdate = async (e, newStage) => {
//     e.stopPropagation(); // Prevent card click when updating stage
//     if (isUpdating) return;
    
//     try {
//       setIsUpdating(true);
//       await onUpdateStage(order.id, newStage);
//     } catch (error) {
//       console.error("Error updating stage:", error);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Calculate stage progress percent
//   const currentStageIndex = stages.indexOf(order.stage);
//   const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;

//   // Flag if order is completed
//   const isCompleted = order.stage === 'Completed';

//   return (
//     <div 
//       className={`border rounded-md p-3 transition cursor-pointer shadow-sm hover:shadow-md
//         ${isCompleted ? 'bg-green-50' : 'bg-white'}
//         ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
//       onClick={onClick}
//     >
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-2">
//         <div className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={handleCheckboxChange}
//             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//             onClick={(e) => e.stopPropagation()}
//           />
//           <div className="font-medium text-sm text-blue-700">
//             {order.jobDetails?.jobType || "Unknown Job"}
//           </div>
//         </div>
//         <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
//           {order.stage}
//         </span>
//       </div>

//       {/* Brief Details */}
//       <div className="text-xs text-gray-600 mb-3">
//         <div className="flex justify-between">
//           <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
//           <span>Due: {formatDate(order.deliveryDate)}</span>
//         </div>
//         <div>{order.projectName || "No Project"}</div>
//         <div>{order.jobDetails?.paperName || "No Paper Specified"}</div>
//       </div>

//       {/* Processing Types */}
//       <div className="flex flex-wrap gap-1 mb-3">
//         {order.lpDetails?.isLPUsed && 
//           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
//         {order.fsDetails?.isFSUsed && 
//           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
//         {order.embDetails?.isEMBUsed && 
//           <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
//         {order.digiDetails?.isDigiUsed && 
//           <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
//         {order.pasting?.isPastingUsed && 
//           <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
//       </div>

//       {/* Progress Bar */}
//       <div className="h-1.5 w-full bg-gray-200 rounded-full mb-3">
//         <div 
//           className={`h-1.5 rounded-full ${stageColors[order.stage]?.color || 'bg-blue-500'}`}
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>

//       {/* Stage Tracking */}
//       <div className="flex justify-between items-center mb-3">
//         {stages.map((stage, index) => {
//           const stageComplete = index <= currentStageIndex;
//           const isCurrentStage = index === currentStageIndex;
          
//           return (
//             <div 
//               key={stage}
//               onClick={(e) => handleStageUpdate(e, stage)}
//               className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center
//                 ${isCurrentStage ? 'ring-2 ring-blue-300' : ''}
//                 ${stageComplete ? stageColors[stage]?.color || 'bg-blue-500' : 'bg-gray-200'}
//                 ${stageComplete ? 'text-white' : 'text-gray-500'}
//                 transition-all hover:opacity-80`}
//               title={stage}
//             >
//               {isUpdating && isCurrentStage ? (
//                 <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
//               ) : stageComplete ? (
//                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//               ) : (
//                 <span className="text-[10px]">{index + 1}</span>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Action Buttons */}
//       <div className="space-y-1.5">
//         {/* View Details Button */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onClick(order);
//           }}
//           className="text-xs w-full px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//             <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//           </svg>
//           View Details
//         </button>

//         {/* Mark as Completed Button - only shown if not already completed */}
//         {!isCompleted && (
//           <button
//             onClick={(e) => handleStageUpdate(e, 'Completed')}
//             disabled={isUpdating}
//             className={`text-xs w-full px-2 py-1.5 rounded-md flex items-center justify-center
//               ${isUpdating ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
//           >
//             {isUpdating ? (
//               <>
//                 <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//                 Mark Completed
//               </>
//             )}
//           </button>
//         )}

//         {/* Reopening Button - only shown if already completed */}
//         {isCompleted && (
//           <button
//             onClick={(e) => handleStageUpdate(e, 'Delivery')}
//             disabled={isUpdating}
//             className={`text-xs w-full px-2 py-1.5 rounded-md flex items-center justify-center
//               ${isUpdating ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
//           >
//             {isUpdating ? (
//               <>
//                 <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//                 </svg>
//                 Reopen Order
//               </>
//             )}
//           </button>
//         )}
//       </div>

//       {/* Completion Date - only shown if completed */}
//       {isCompleted && order.completedAt && (
//         <div className="mt-2 text-xs text-gray-500 italic text-center">
//           Completed on: {formatDate(order.completedAt)}
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderCard;

import React, { useState } from 'react';

const OrderCard = ({ 
  order, 
  isSelected,
  onSelect,
  onClick,
  onUpdateStage,
  stages,
  formatDate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmStage, setConfirmStage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Stage colors for visual representation
  const stageColors = {
    'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800', color: 'bg-gray-400' },
    'Design': { bg: 'bg-indigo-100', text: 'text-indigo-800', color: 'bg-indigo-500' },
    'Positives': { bg: 'bg-cyan-100', text: 'text-cyan-800', color: 'bg-cyan-500' },
    'Printing': { bg: 'bg-orange-100', text: 'text-orange-800', color: 'bg-orange-500' },
    'Quality Check': { bg: 'bg-pink-100', text: 'text-pink-800', color: 'bg-pink-500' },
    'Delivery': { bg: 'bg-green-100', text: 'text-green-800', color: 'bg-green-500' },
    'Completed': { bg: 'bg-green-200', text: 'text-green-900', color: 'bg-green-600' } // Completed stage
  };

  // Get current stage color
  const currentStageColor = stageColors[order.stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  // Handle checkbox click
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent card click when clicking checkbox
    onSelect(order.id, !isSelected);
  };

  // Show confirmation dialog for stage update
  const promptStageUpdate = (e, newStage) => {
    e.stopPropagation(); // Prevent card click
    setConfirmStage(newStage);
    setShowConfirmation(true);
  };

  // Handle stage update after confirmation
  const handleStageUpdate = async () => {
    if (isUpdating || !confirmStage) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStage(order.id, confirmStage);
      setShowConfirmation(false);
      setConfirmStage(null);
    } catch (error) {
      console.error("Error updating stage:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel stage update
  const cancelStageUpdate = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowConfirmation(false);
    setConfirmStage(null);
  };

  // Calculate stage progress percent
  const currentStageIndex = stages.indexOf(order.stage);
  const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;

  // Flag if order is completed
  const isCompleted = order.stage === 'Completed';

  return (
    <div 
      className={`border rounded-md p-3 transition cursor-pointer shadow-sm hover:shadow-md relative
        ${isCompleted ? 'bg-green-50' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div 
          className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()} // Prevent propagation to parent
        >
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-300 max-w-[90%]">
            <h3 className="text-sm font-medium mb-2">
              {confirmStage === 'Completed' 
                ? 'Mark this order as completed?' 
                : confirmStage === 'Delivery' && isCompleted
                  ? 'Reopen this order?'
                  : `Change order stage to "${confirmStage}"?`}
            </h3>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelStageUpdate}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleStageUpdate}
                disabled={isUpdating}
                className={`px-3 py-1 text-xs text-white rounded
                  ${isUpdating 
                    ? 'bg-blue-400' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="font-medium text-sm text-blue-700">
            {order.jobDetails?.jobType || "Unknown Job"}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${currentStageColor.bg} ${currentStageColor.text}`}>
          {order.stage}
        </span>
      </div>

      {/* Brief Details */}
      <div className="text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Qty: {order.jobDetails?.quantity || "N/A"}</span>
          <span>Due: {formatDate(order.deliveryDate)}</span>
        </div>
        <div>{order.projectName || "No Project"}</div>
        <div>{order.jobDetails?.paperName || "No Paper Specified"}</div>
      </div>

      {/* Processing Types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {order.lpDetails?.isLPUsed && 
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">LP</span>}
        {order.fsDetails?.isFSUsed && 
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">FS</span>}
        {order.embDetails?.isEMBUsed && 
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">EMB</span>}
        {order.digiDetails?.isDigiUsed && 
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">DIGI</span>}
        {order.pasting?.isPastingUsed && 
          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">Pasting</span>}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full mb-3">
        <div 
          className={`h-1.5 rounded-full ${stageColors[order.stage]?.color || 'bg-blue-500'}`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Stage Tracking */}
      <div className="flex justify-between items-center mb-3">
        {stages.map((stage, index) => {
          const stageComplete = index <= currentStageIndex;
          const isCurrentStage = index === currentStageIndex;
          
          return (
            <div 
              key={stage}
              onClick={(e) => promptStageUpdate(e, stage)}
              className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center
                ${isCurrentStage ? 'ring-2 ring-blue-300' : ''}
                ${stageComplete ? stageColors[stage]?.color || 'bg-blue-500' : 'bg-gray-200'}
                ${stageComplete ? 'text-white' : 'text-gray-500'}
                transition-all hover:opacity-80`}
              title={stage}
            >
              {isUpdating && isCurrentStage ? (
                <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
              ) : stageComplete ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-[10px]">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5">
        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(order);
          }}
          className="text-xs w-full px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          View Details
        </button>

        {/* Mark as Completed Button - only shown if not already completed */}
        {!isCompleted && (
          <button
            onClick={(e) => promptStageUpdate(e, 'Completed')}
            disabled={isUpdating}
            className={`text-xs w-full px-2 py-1.5 rounded-md flex items-center justify-center
              ${isUpdating ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mark Completed
          </button>
        )}

        {/* Reopening Button - only shown if already completed */}
        {isCompleted && (
          <button
            onClick={(e) => promptStageUpdate(e, 'Delivery')}
            disabled={isUpdating}
            className={`text-xs w-full px-2 py-1.5 rounded-md flex items-center justify-center
              ${isUpdating ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reopen Order
          </button>
        )}
      </div>

      {/* Completion Date - only shown if completed */}
      {isCompleted && order.completedAt && (
        <div className="mt-2 text-xs text-gray-500 italic text-center">
          Completed on: {formatDate(order.completedAt)}
        </div>
      )}
    </div>
  );
};

export default OrderCard;