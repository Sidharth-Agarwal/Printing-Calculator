// import React, { useState } from "react";

// const Sandwich = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
//   const { isSandwichComponentUsed = false } = state.sandwich || {};
//   const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

//   const inchesToCm = (inches) => parseFloat(inches) * 2.54;

//   const toggleComponentUsage = (section) => {
//     const isCurrentlyUsed = state.sandwich[section]?.isUsed || false;
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...state.sandwich[section],
//           isUsed: !isCurrentlyUsed,
//           ...(section === "lpDetailsSandwich" && {
//             noOfColors: !isCurrentlyUsed ? 1 : 0,
//             colorDetails: !isCurrentlyUsed
//               ? [
//                   {
//                     plateSizeType: "",
//                     plateDimensions: { length: "", breadth: "" },
//                     pantoneType: "",
//                     plateType: "",
//                     mrType: "",
//                   },
//                 ]
//               : [],
//           }),
//           ...(section === "fsDetailsSandwich" && {
//             fsType: !isCurrentlyUsed ? "FS1" : "",
//             foilDetails: !isCurrentlyUsed
//               ? [
//                   {
//                     blockSizeType: "",
//                     blockDimension: { length: "", breadth: "" },
//                     foilType: "",
//                     blockType: "",
//                     mrType: "",
//                   },
//                 ]
//               : [],
//           }),
//           ...(section === "embDetailsSandwich" && {
//             plateSizeType: "",
//             plateDimensions: { length: "", breadth: "" },
//             plateTypeMale: "",
//             plateTypeFemale: "",
//             embMR: "",
//           }),
//         },
//       },
//     });
//   };

//   const handleColorChange = (section, index, field, value) => {
//     const updatedDetails = [...state.sandwich[section].colorDetails];
//     updatedDetails[index][field] = value;
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...state.sandwich[section],
//           colorDetails: updatedDetails,
//         },
//       },
//     });
//   };

//   const handleFoilChange = (index, field, value) => {
//     const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
//     updatedFoilDetails[index][field] = value;
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         fsDetailsSandwich: {
//           ...state.sandwich.fsDetailsSandwich,
//           foilDetails: updatedFoilDetails,
//         },
//       },
//     });
//   };

//   const handleDimensionChange = (section, field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...state.sandwich[section],
//           plateDimensions: {
//             ...state.sandwich[section].plateDimensions,
//             [field]: value,
//           },
//         },
//       },
//     });
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Add any required validations if needed before moving to the next step
//     if (!singlePageMode && onNext) {
//       onNext();
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {!singlePageMode && (
//         <h2 className="text-lg font-bold text-gray-700 mb-4">SANDWICH DETAILS</h2>
//       )}

//       {/* Main Sandwich Toggle */}
//       <div className="flex items-center space-x-3 cursor-pointer">
//         <label
//           className="flex items-center space-x-3"
//           onClick={() =>
//             dispatch({
//               type: "UPDATE_SANDWICH",
//               payload: { isSandwichComponentUsed: !isSandwichComponentUsed },
//             })
//           }
//         >
//           <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//             {isSandwichComponentUsed && (
//               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//             )}
//           </div>
//           <span className="text-gray-700 font-semibold text-sm">
//             Use Sandwich Component?
//           </span>
//         </label>
//       </div>

//       {isSandwichComponentUsed && (
//         <div className="space-y-6">
//           {/* LP Section */}
//           <div className="border-t pt-4">
//             <h3 className="text-md font-semibold mb-3">LETTER PRESS (LP) IN SANDWICH</h3>

//             {/* Toggle LP Usage */}
//             <div className="flex items-center space-x-3 cursor-pointer mb-4">
//               <label
//                 className="flex items-center space-x-3"
//                 onClick={() =>
//                   dispatch({
//                     type: "UPDATE_SANDWICH",
//                     payload: {
//                       lpDetailsSandwich: {
//                         ...state.sandwich.lpDetailsSandwich,
//                         isLPUsed: !state.sandwich.lpDetailsSandwich?.isLPUsed,
//                         noOfColors: !state.sandwich.lpDetailsSandwich?.isLPUsed ? 1 : 0,
//                         colorDetails: !state.sandwich.lpDetailsSandwich?.isLPUsed
//                           ? [
//                               {
//                                 plateSizeType: "",
//                                 plateDimensions: { length: "", breadth: "" },
//                                 pantoneType: "",
//                                 plateType: "",
//                                 mrType: "",
//                               },
//                             ]
//                           : [],
//                       },
//                     },
//                   })
//                 }
//               >
//                 <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//                   {state.sandwich.lpDetailsSandwich?.isLPUsed && (
//                     <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   )}
//                 </div>
//                 <span className="text-gray-700 font-semibold text-sm">Use LP in Sandwich?</span>
//               </label>
//             </div>

//             {state.sandwich.lpDetailsSandwich?.isLPUsed && (
//               <div className="pl-6 border-l-2 border-gray-200 mb-4">
//                 {/* LP Details collapsed for brevity - use similar structure as the main LP component */}
//                 <div className="text-sm">
//                   <label className="block font-medium mb-2">Number of Colors:</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="10"
//                     value={state.sandwich.lpDetailsSandwich.noOfColors || ""}
//                     onChange={(e) =>
//                       dispatch({
//                         type: "UPDATE_SANDWICH",
//                         payload: {
//                           lpDetailsSandwich: {
//                             ...state.sandwich.lpDetailsSandwich,
//                             noOfColors: parseInt(e.target.value, 10) || 0,
//                             colorDetails: Array.from(
//                               { length: parseInt(e.target.value, 10) || 0 },
//                               (_, index) => ({
//                                 plateSizeType:
//                                   state.sandwich.lpDetailsSandwich.colorDetails[index]
//                                     ?.plateSizeType || "",
//                                 plateDimensions:
//                                   state.sandwich.lpDetailsSandwich.colorDetails[index]
//                                     ?.plateDimensions || { length: "", breadth: "" },
//                                 pantoneType:
//                                   state.sandwich.lpDetailsSandwich.colorDetails[index]
//                                     ?.pantoneType || "",
//                                 plateType:
//                                   state.sandwich.lpDetailsSandwich.colorDetails[index]
//                                     ?.plateType || "",
//                                 mrType:
//                                   state.sandwich.lpDetailsSandwich.colorDetails[index]
//                                     ?.mrType || "",
//                               })
//                             ),
//                           },
//                         },
//                       })
//                     }
//                     className="border rounded-md p-2 w-full"
//                   />
//                 </div>

//                 {/* Color Details - simplified for single page view */}
//                 {state.sandwich.lpDetailsSandwich.colorDetails.map((color, index) => (
//                   <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
//                     <h4 className="text-xs font-semibold mb-2">Color {index + 1}</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {/* Pantone Type */}
//                       <div>
//                         <label className="block text-xs mb-1">Pantone Type:</label>
//                         <input
//                           type="text"
//                           placeholder="Pantone Type"
//                           value={color.pantoneType || ""}
//                           onChange={(e) => {
//                             const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
//                             updatedDetails[index].pantoneType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 lpDetailsSandwich: {
//                                   ...state.sandwich.lpDetailsSandwich,
//                                   colorDetails: updatedDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         />
//                       </div>

//                       {/* Plate Type */}
//                       <div>
//                         <label className="block text-xs mb-1">Plate Type:</label>
//                         <select
//                           value={color.plateType || ""}
//                           onChange={(e) => {
//                             const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
//                             updatedDetails[index].plateType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 lpDetailsSandwich: {
//                                   ...state.sandwich.lpDetailsSandwich,
//                                   colorDetails: updatedDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         >
//                           <option value="">Select Plate Type</option>
//                           <option value="Polymer Plate">Polymer Plate</option>
//                         </select>
//                       </div>

//                       {/* MR Type */}
//                       <div>
//                         <label className="block text-xs mb-1">MR Type:</label>
//                         <select
//                           value={color.mrType || ""}
//                           onChange={(e) => {
//                             const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
//                             updatedDetails[index].mrType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 lpDetailsSandwich: {
//                                   ...state.sandwich.lpDetailsSandwich,
//                                   colorDetails: updatedDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         >
//                           <option value="">Select MR Type</option>
//                           <option value="Simple">Simple</option>
//                           <option value="Complex">Complex</option>
//                           <option value="Super Complex">Super Complex</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* FS Section */}
//           <div className="border-t pt-4">
//             <h3 className="text-md font-semibold mb-3">FOIL STAMPING (FS) IN SANDWICH</h3>

//             {/* Toggle FS Usage */}
//             <div className="flex items-center space-x-3 cursor-pointer mb-4">
//               <label
//                 className="flex items-center space-x-3"
//                 onClick={() =>
//                   dispatch({
//                     type: "UPDATE_SANDWICH",
//                     payload: {
//                       fsDetailsSandwich: {
//                         ...state.sandwich.fsDetailsSandwich,
//                         isFSUsed: !state.sandwich.fsDetailsSandwich?.isFSUsed,
//                         fsType: !state.sandwich.fsDetailsSandwich?.isFSUsed ? "FS1" : "",
//                         foilDetails: !state.sandwich.fsDetailsSandwich?.isFSUsed
//                           ? [
//                               {
//                                 blockSizeType: "",
//                                 blockDimension: { length: "", breadth: "" },
//                                 foilType: "",
//                                 blockType: "",
//                                 mrType: "",
//                               },
//                             ]
//                           : [],
//                       },
//                     },
//                   })
//                 }
//               >
//                 <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//                   {state.sandwich.fsDetailsSandwich?.isFSUsed && (
//                     <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   )}
//                 </div>
//                 <span className="text-gray-700 font-semibold text-sm">Use FS in Sandwich?</span>
//               </label>
//             </div>

//             {state.sandwich.fsDetailsSandwich?.isFSUsed && (
//               <div className="pl-6 border-l-2 border-gray-200 mb-4">
//                 {/* FS Type */}
//                 <div className="text-sm">
//                   <label className="block font-medium mb-2">FS Type:</label>
//                   <select
//                     value={state.sandwich.fsDetailsSandwich.fsType || ""}
//                     onChange={(e) => {
//                       const numFoils = parseInt(e.target.value.replace("FS", ""), 10) || 0;
//                       const updatedFoilDetails = Array.from({ length: numFoils }, () => ({
//                         blockSizeType: "",
//                         blockDimension: { length: "", breadth: "" },
//                         foilType: "",
//                         blockType: "",
//                         mrType: "",
//                       }));
//                       dispatch({
//                         type: "UPDATE_SANDWICH",
//                         payload: {
//                           fsDetailsSandwich: {
//                             ...state.sandwich.fsDetailsSandwich,
//                             fsType: e.target.value,
//                             foilDetails: updatedFoilDetails,
//                           },
//                         },
//                       });
//                     }}
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select FS Type</option>
//                     <option value="FS1">FS1</option>
//                     <option value="FS2">FS2</option>
//                     <option value="FS3">FS3</option>
//                     <option value="FS4">FS4</option>
//                     <option value="FS5">FS5</option>
//                   </select>
//                 </div>

//                 {/* Foil Details - simplified for single page view */}
//                 {state.sandwich.fsDetailsSandwich.foilDetails.map((foil, index) => (
//                   <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
//                     <h4 className="text-xs font-semibold mb-2">Foil {index + 1}</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {/* Foil Type */}
//                       <div>
//                         <label className="block text-xs mb-1">Foil Type:</label>
//                         <select
//                           value={foil.foilType || ""}
//                           onChange={(e) => {
//                             const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
//                             updatedFoilDetails[index].foilType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 fsDetailsSandwich: {
//                                   ...state.sandwich.fsDetailsSandwich,
//                                   foilDetails: updatedFoilDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         >
//                           <option value="">Select Foil Type</option>
//                           <option value="Gold MTS 220">Gold MTS 220</option>
//                           <option value="Rosegold MTS 355">Rosegold MTS 355</option>
//                           <option value="Silver ALUFIN PMAL METALITE">Silver ALUFIN PMAL METALITE</option>
//                           <option value="Blk MTS 362">Blk MTS 362</option>
//                         </select>
//                       </div>

//                       {/* Block Type */}
//                       <div>
//                         <label className="block text-xs mb-1">Block Type:</label>
//                         <select
//                           value={foil.blockType || ""}
//                           onChange={(e) => {
//                             const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
//                             updatedFoilDetails[index].blockType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 fsDetailsSandwich: {
//                                   ...state.sandwich.fsDetailsSandwich,
//                                   foilDetails: updatedFoilDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         >
//                           <option value="">Select Block Type</option>
//                           <option value="Magnesium Block 3MM">Magnesium Block 3MM</option>
//                           <option value="Magnesium Block 4MM">Magnesium Block 4MM</option>
//                           <option value="Magnesium Block 5MM">Magnesium Block 5MM</option>
//                         </select>
//                       </div>

//                       {/* MR Type */}
//                       <div>
//                         <label className="block text-xs mb-1">MR Type:</label>
//                         <select
//                           value={foil.mrType || ""}
//                           onChange={(e) => {
//                             const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
//                             updatedFoilDetails[index].mrType = e.target.value;
//                             dispatch({
//                               type: "UPDATE_SANDWICH",
//                               payload: {
//                                 fsDetailsSandwich: {
//                                   ...state.sandwich.fsDetailsSandwich,
//                                   foilDetails: updatedFoilDetails,
//                                 },
//                               },
//                             });
//                           }}
//                           className="border rounded-md p-1 w-full text-xs"
//                         >
//                           <option value="">Select MR Type</option>
//                           <option value="Simple">Simple</option>
//                           <option value="Complex">Complex</option>
//                           <option value="Super Complex">Super Complex</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* EMB Section */}
//           <div className="border-t pt-4">
//             <h3 className="text-md font-semibold mb-3">EMBOSSING (EMB) IN SANDWICH</h3>

//             {/* Toggle EMB Usage */}
//             <div className="flex items-center space-x-3 cursor-pointer mb-4">
//               <label
//                 className="flex items-center space-x-3"
//                 onClick={() =>
//                   dispatch({
//                     type: "UPDATE_SANDWICH",
//                     payload: {
//                       embDetailsSandwich: {
//                         ...state.sandwich.embDetailsSandwich,
//                         isEMBUsed: !state.sandwich.embDetailsSandwich?.isEMBUsed,
//                         plateSizeType: "",
//                         plateDimensions: { length: "", breadth: "" },
//                         plateTypeMale: "",
//                         plateTypeFemale: "",
//                         embMR: "",
//                       },
//                     },
//                   })
//                 }
//               >
//                 <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//                   {state.sandwich.embDetailsSandwich?.isEMBUsed && (
//                     <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   )}
//                 </div>
//                 <span className="text-gray-700 font-semibold text-sm">Use EMB in Sandwich?</span>
//               </label>
//             </div>

//             {state.sandwich.embDetailsSandwich?.isEMBUsed && (
//               <div className="pl-6 border-l-2 border-gray-200 mb-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                   {/* Plate Type Male */}
//                   <div>
//                     <label className="block text-xs mb-1">Plate Type Male:</label>
//                     <select
//                       name="plateTypeMale"
//                       value={state.sandwich.embDetailsSandwich.plateTypeMale || ""}
//                       onChange={(e) =>
//                         dispatch({
//                           type: "UPDATE_SANDWICH",
//                           payload: {
//                             embDetailsSandwich: {
//                               ...state.sandwich.embDetailsSandwich,
//                               plateTypeMale: e.target.value,
//                             },
//                           },
//                         })
//                       }
//                       className="border rounded-md p-1 w-full text-xs"
//                     >
//                       <option value="">Select Plate Type Male</option>
//                       <option value="Polymer Plate">Polymer Plate</option>
//                     </select>
//                   </div>

//                   {/* Plate Type Female */}
//                   <div>
//                     <label className="block text-xs mb-1">Plate Type Female:</label>
//                     <select
//                       name="plateTypeFemale"
//                       value={state.sandwich.embDetailsSandwich.plateTypeFemale || ""}
//                       onChange={(e) =>
//                         dispatch({
//                           type: "UPDATE_SANDWICH",
//                           payload: {
//                             embDetailsSandwich: {
//                               ...state.sandwich.embDetailsSandwich,
//                               plateTypeFemale: e.target.value,
//                             },
//                           },
//                         })
//                       }
//                       className="border rounded-md p-1 w-full text-xs"
//                     >
//                       <option value="">Select Plate Type Female</option>
//                       <option value="Polymer Plate">Polymer Plate</option>
//                     </select>
//                   </div>

//                   {/* EMB MR */}
//                   <div>
//                     <label className="block text-xs mb-1">EMB MR:</label>
//                     <select
//                       name="embMR"
//                       value={state.sandwich.embDetailsSandwich.embMR || ""}
//                       onChange={(e) =>
//                         dispatch({
//                           type: "UPDATE_SANDWICH",
//                           payload: {
//                             embDetailsSandwich: {
//                               ...state.sandwich.embDetailsSandwich,
//                               embMR: e.target.value,
//                             },
//                           },
//                         })
//                       }
//                       className="border rounded-md p-1 w-full text-xs"
//                     >
//                       <option value="">Select MR Type</option>
//                       <option value="Simple">Simple</option>
//                       <option value="Complex">Complex</option>
//                       <option value="Super Complex">Super Complex</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {!singlePageMode && (
//         <div className="flex justify-between">
//           <button
//             type="button"
//             onClick={onPrevious}
//             className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
//           >
//             Previous
//           </button>
//           <button
//             type="submit"
//             className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </form>
//   );
// };

// export default Sandwich;

import React, { useState, useEffect } from "react";

const Sandwich = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const { isSandwichComponentUsed = false } = state.sandwich || {};
  const { 
    lpDetailsSandwich = { isLPUsed: false, noOfColors: 0, colorDetails: [] },
    fsDetailsSandwich = { isFSUsed: false, fsType: "", foilDetails: [] },
    embDetailsSandwich = { 
      isEMBUsed: false, 
      plateSizeType: "", 
      plateDimensions: { length: "", breadth: "" },
      plateTypeMale: "",
      plateTypeFemale: "",
      embMR: ""
    }
  } = state.sandwich || {};
  
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;
  
  // Helper function to validate fields
  const validateFields = () => {
    const newErrors = {};
    
    // Validate LP details if used
    if (lpDetailsSandwich.isLPUsed) {
      if (!lpDetailsSandwich.noOfColors || lpDetailsSandwich.noOfColors < 1) {
        newErrors.lpNoOfColors = "Number of colors must be at least 1.";
      }
      
      lpDetailsSandwich.colorDetails.forEach((color, index) => {
        if (!color.pantoneType) {
          newErrors[`lpPantoneType_${index}`] = "Pantone type is required.";
        }
        if (!color.plateType) {
          newErrors[`lpPlateType_${index}`] = "Plate type is required.";
        }
        if (!color.mrType) {
          newErrors[`lpMrType_${index}`] = "MR type is required.";
        }
      });
    }
    
    // Validate FS details if used
    if (fsDetailsSandwich.isFSUsed) {
      if (!fsDetailsSandwich.fsType) {
        newErrors.fsType = "FS Type is required.";
      }
      
      fsDetailsSandwich.foilDetails.forEach((foil, index) => {
        if (!foil.foilType) {
          newErrors[`foilType_${index}`] = "Foil type is required.";
        }
        if (!foil.blockType) {
          newErrors[`blockType_${index}`] = "Block type is required.";
        }
        if (!foil.mrType) {
          newErrors[`mrType_${index}`] = "MR type is required.";
        }
      });
    }
    
    // Validate EMB details if used
    if (embDetailsSandwich.isEMBUsed) {
      if (!embDetailsSandwich.plateSizeType) {
        newErrors.embPlateSizeType = "Plate size type is required.";
      }
      if (!embDetailsSandwich.plateTypeMale) {
        newErrors.embPlateTypeMale = "Male plate type is required.";
      }
      if (!embDetailsSandwich.plateTypeFemale) {
        newErrors.embPlateTypeFemale = "Female plate type is required.";
      }
      if (!embDetailsSandwich.embMR) {
        newErrors.embMR = "EMB MR type is required.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };
  
  // Toggle LP Usage in Sandwich
  const toggleLPUsageInSandwich = () => {
    const isCurrentlyUsed = lpDetailsSandwich.isLPUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          isLPUsed: !isCurrentlyUsed,
          noOfColors: !isCurrentlyUsed ? 1 : 0,
          colorDetails: !isCurrentlyUsed
            ? [
                {
                  plateSizeType: "Auto",
                  plateDimensions: { 
                    length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                    breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                  },
                  pantoneType: "",
                  plateType: "Polymer Plate",
                  mrType: "Simple"
                }
              ]
            : []
        }
      }
    });
  };
  
  // Toggle FS Usage in Sandwich
  const toggleFSUsageInSandwich = () => {
    const isCurrentlyUsed = fsDetailsSandwich.isFSUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          isFSUsed: !isCurrentlyUsed,
          fsType: !isCurrentlyUsed ? "FS1" : "",
          foilDetails: !isCurrentlyUsed
            ? [
                {
                  blockSizeType: "Auto",
                  blockDimension: { 
                    length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                    breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                  },
                  foilType: "Gold MTS 220",
                  blockType: "Magnesium Block 3MM",
                  mrType: "Simple"
                }
              ]
            : []
        }
      }
    });
  };
  
  // Toggle EMB Usage in Sandwich
  const toggleEMBUsageInSandwich = () => {
    const isCurrentlyUsed = embDetailsSandwich.isEMBUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          isEMBUsed: !isCurrentlyUsed,
          plateSizeType: !isCurrentlyUsed ? "Auto" : "",
          plateDimensions: !isCurrentlyUsed
            ? { 
                length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
              }
            : { length: "", breadth: "" },
          plateTypeMale: !isCurrentlyUsed ? "Polymer Plate" : "",
          plateTypeFemale: !isCurrentlyUsed ? "Polymer Plate" : "",
          embMR: !isCurrentlyUsed ? "Simple" : ""
        }
      }
    });
  };

  // Handle LP Sandwich change events
  const handleLPSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          lpDetailsSandwich: {
            ...lpDetailsSandwich,
            [name]: parseInt(value, 10),
            colorDetails: Array.from({ length: parseInt(value, 10) }, (_, index) => ({
              plateSizeType: lpDetailsSandwich.colorDetails[index]?.plateSizeType || "Auto",
              plateDimensions: lpDetailsSandwich.colorDetails[index]?.plateDimensions || {
                length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
                breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
              },
              pantoneType: lpDetailsSandwich.colorDetails[index]?.pantoneType || "",
              plateType: lpDetailsSandwich.colorDetails[index]?.plateType || "Polymer Plate",
              mrType: lpDetailsSandwich.colorDetails[index]?.mrType || "Simple",
            }))
          }
        }
      });
    }
  };
  
  // Handle LP Sandwich color details change
  const handleLPColorDetailsChange = (index, field, value) => {
    const updatedColorDetails = [...lpDetailsSandwich.colorDetails];
    
    if (field === "plateSizeType") {
      updatedColorDetails[index].plateSizeType = value;
      
      if (value === "Manual") {
        updatedColorDetails[index].plateDimensions = { length: "", breadth: "" };
      } else if (value === "Auto") {
        updatedColorDetails[index].plateDimensions = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "plateDimensions") {
      updatedColorDetails[index].plateDimensions = {
        ...updatedColorDetails[index].plateDimensions,
        ...value
      };
    } else {
      updatedColorDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          colorDetails: updatedColorDetails
        }
      }
    });
  };
  
  // Handle FS Sandwich change
  const handleFSSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "fsType") {
      const numberOfFoilOptions =
        value === "FS1"
          ? 1
          : value === "FS2"
          ? 2
          : value === "FS3"
          ? 3
          : value === "FS4"
          ? 4
          : 5; // For FS5
          
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        const currentFoil = fsDetailsSandwich.foilDetails[index] || {};
        
        // Set defaults for new entries
        return {
          blockSizeType: currentFoil.blockSizeType || "Auto",
          blockDimension: currentFoil.blockDimension || { 
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : ""
          },
          foilType: currentFoil.foilType || "Gold MTS 220",
          blockType: currentFoil.blockType || "Magnesium Block 3MM",
          mrType: currentFoil.mrType || "Simple"
        };
      });
      
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          fsDetailsSandwich: {
            ...fsDetailsSandwich,
            [name]: value,
            foilDetails: updatedFoilDetails
          }
        }
      });
    } else {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          fsDetailsSandwich: {
            ...fsDetailsSandwich,
            [name]: value
          }
        }
      });
    }
  };
  
  // Handle FS Sandwich foil details change
  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...fsDetailsSandwich.foilDetails];
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;
      
      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      } else if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value
      };
    } else {
      updatedFoilDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          foilDetails: updatedFoilDetails
        }
      }
    });
  };
  
  // Handle EMB Sandwich change
  const handleEMBSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "plateSizeType" && value === "Auto") {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            [name]: value,
            plateDimensions: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            }
          }
        }
      });
    } else if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            [name]: value,
            plateDimensions: { length: "", breadth: "" }
          }
        }
      });
    } else {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            [name]: value
          }
        }
      });
    }
  };
  
  // Handle EMB Sandwich plate dimensions change
  const handleEMBDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          plateDimensions: {
            ...embDetailsSandwich.plateDimensions,
            [field]: value
          }
        }
      }
    });
  };
  
  // Update auto dimensions when die size changes
  useEffect(() => {
    const updates = {};
    
    // Update LP color details auto dimensions
    if (lpDetailsSandwich.isLPUsed) {
      const updatedColorDetails = lpDetailsSandwich.colorDetails.map(color => {
        if (color.plateSizeType === "Auto") {
          return {
            ...color,
            plateDimensions: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            }
          };
        }
        return color;
      });
      
      if (JSON.stringify(updatedColorDetails) !== JSON.stringify(lpDetailsSandwich.colorDetails)) {
        updates.lpDetailsSandwich = {
          ...lpDetailsSandwich,
          colorDetails: updatedColorDetails
        };
      }
    }
    
    // Update FS foil details auto dimensions
    if (fsDetailsSandwich.isFSUsed) {
      const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => {
        if (foil.blockSizeType === "Auto") {
          return {
            ...foil,
            blockDimension: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            }
          };
        }
        return foil;
      });
      
      if (JSON.stringify(updatedFoilDetails) !== JSON.stringify(fsDetailsSandwich.foilDetails)) {
        updates.fsDetailsSandwich = {
          ...fsDetailsSandwich,
          foilDetails: updatedFoilDetails
        };
      }
    }
    
    // Update EMB plate dimensions if in Auto mode
    if (embDetailsSandwich.isEMBUsed && embDetailsSandwich.plateSizeType === "Auto") {
      const updatedDimensions = {
        length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : ""
      };
      
      if (JSON.stringify(updatedDimensions) !== JSON.stringify(embDetailsSandwich.plateDimensions)) {
        updates.embDetailsSandwich = {
          ...embDetailsSandwich,
          plateDimensions: updatedDimensions
        };
      }
    }
    
    // Dispatch updates if any
    if (Object.keys(updates).length > 0) {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: updates
      });
    }
  }, [dieSize, lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich, dispatch]);
  
  // If Sandwich is not used, don't render any content
  if (!isSandwichComponentUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* LP Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleLPUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {lpDetailsSandwich.isLPUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use LP in Sandwich?</span>
          </label>
        </div>

        {lpDetailsSandwich.isLPUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="text-sm">
              <label className="block font-medium mb-2">Number of Colors:</label>
              <input
                type="number"
                name="noOfColors"
                min="1"
                max="10"
                value={lpDetailsSandwich.noOfColors}
                onChange={handleLPSandwichChange}
                className="border rounded-md p-2 w-full text-sm"
              />
              {errors.lpNoOfColors && <p className="text-red-500 text-sm">{errors.lpNoOfColors}</p>}
            </div>

            {lpDetailsSandwich.noOfColors > 0 && lpDetailsSandwich.colorDetails.map((color, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
                <h4 className="text-xs font-semibold mb-2">Color {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pantone Type */}
                  <div>
                    <label className="block text-xs mb-1">Pantone Type:</label>
                    <input
                      type="text"
                      placeholder="Pantone Type"
                      value={color.pantoneType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "pantoneType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    />
                    {errors[`lpPantoneType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPantoneType_${index}`]}</p>}
                  </div>

                  {/* Plate Type */}
                  <div>
                    <label className="block text-xs mb-1">Plate Type:</label>
                    <select
                      value={color.plateType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "plateType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    >
                      <option value="">Select Plate Type</option>
                      <option value="Polymer Plate">Polymer Plate</option>
                    </select>
                    {errors[`lpPlateType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateType_${index}`]}</p>}
                  </div>

                  {/* MR Type */}
                  <div>
                    <label className="block text-xs mb-1">MR Type:</label>
                    <select
                      value={color.mrType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "mrType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    >
                      <option value="">Select MR Type</option>
                      <option value="Simple">Simple</option>
                      <option value="Complex">Complex</option>
                      <option value="Super Complex">Super Complex</option>
                    </select>
                    {errors[`lpMrType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpMrType_${index}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FS Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleFSUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {fsDetailsSandwich.isFSUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use FS in Sandwich?</span>
          </label>
        </div>

        {fsDetailsSandwich.isFSUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="text-sm">
              <label className="block font-medium mb-2">FS Type:</label>
              <select
                name="fsType"
                value={fsDetailsSandwich.fsType}
                onChange={handleFSSandwichChange}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select FS Type</option>
                {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.fsType && <p className="text-red-500 text-sm">{errors.fsType}</p>}
            </div>

            {fsDetailsSandwich.foilDetails.map((foil, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
                <h4 className="text-xs font-semibold mb-2">Foil {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Foil Type */}
                  <div>
                    <label className="block text-xs mb-1">Foil Type:</label>
                    <select
                      value={foil.foilType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "foilType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    >
                      <option value="">Select Foil Type</option>
                      <option value="Gold MTS 220">Gold MTS 220</option>
                      <option value="Rosegold MTS 355">Rosegold MTS 355</option>
                      <option value="Silver ALUFIN PMAL METALITE">Silver ALUFIN PMAL METALITE</option>
                      <option value="Blk MTS 362">Blk MTS 362</option>
                    </select>
                    {errors[`foilType_${index}`] && <p className="text-red-500 text-xs">{errors[`foilType_${index}`]}</p>}
                  </div>

                  {/* Block Type */}
                  <div>
                    <label className="block text-xs mb-1">Block Type:</label>
                    <select
                      value={foil.blockType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "blockType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    >
                      <option value="">Select Block Type</option>
                      <option value="Magnesium Block 3MM">Magnesium Block 3MM</option>
                      <option value="Magnesium Block 4MM">Magnesium Block 4MM</option>
                      <option value="Magnesium Block 5MM">Magnesium Block 5MM</option>
                    </select>
                    {errors[`blockType_${index}`] && <p className="text-red-500 text-xs">{errors[`blockType_${index}`]}</p>}
                  </div>

                  {/* MR Type */}
                  <div>
                    <label className="block text-xs mb-1">MR Type:</label>
                    <select
                      value={foil.mrType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "mrType", e.target.value)}
                      className="border rounded-md p-1 w-full text-xs"
                    >
                      <option value="">Select MR Type</option>
                      <option value="Simple">Simple</option>
                      <option value="Complex">Complex</option>
                      <option value="Super Complex">Super Complex</option>
                    </select>
                    {errors[`mrType_${index}`] && <p className="text-red-500 text-xs">{errors[`mrType_${index}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMB Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleEMBUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {embDetailsSandwich.isEMBUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use EMB in Sandwich?</span>
          </label>
        </div>

        {embDetailsSandwich.isEMBUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Plate Size Type */}
              <div>
                <label className="block text-xs mb-1">Plate Size:</label>
                <select
                  name="plateSizeType"
                  value={embDetailsSandwich.plateSizeType}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-1 w-full text-xs ${errors.embPlateSizeType ? "border-red-500" : ""}`}
                >
                  <option value="">Select Plate Size Type</option>
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
                {errors.embPlateSizeType && <p className="text-red-500 text-xs">{errors.embPlateSizeType}</p>}
              </div>

              {/* Plate Type Male */}
              <div>
                <label className="block text-xs mb-1">Plate Type Male:</label>
                <select
                  name="plateTypeMale"
                  value={embDetailsSandwich.plateTypeMale}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-1 w-full text-xs ${errors.embPlateTypeMale ? "border-red-500" : ""}`}
                >
                  <option value="">Select Plate Type Male</option>
                  <option value="Polymer Plate">Polymer Plate</option>
                </select>
                {errors.embPlateTypeMale && <p className="text-red-500 text-xs">{errors.embPlateTypeMale}</p>}
              </div>

              {/* Plate Type Female */}
              <div>
                <label className="block text-xs mb-1">Plate Type Female:</label>
                <select
                  name="plateTypeFemale"
                  value={embDetailsSandwich.plateTypeFemale}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-1 w-full text-xs ${errors.embPlateTypeFemale ? "border-red-500" : ""}`}
                >
                  <option value="">Select Plate Type Female</option>
                  <option value="Polymer Plate">Polymer Plate</option>
                </select>
                {errors.embPlateTypeFemale && <p className="text-red-500 text-xs">{errors.embPlateTypeFemale}</p>}
              </div>

              {/* EMB MR */}
              <div>
                <label className="block text-xs mb-1">EMB MR:</label>
                <select
                  name="embMR"
                  value={embDetailsSandwich.embMR}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-1 w-full text-xs ${errors.embMR ? "border-red-500" : ""}`}
                >
                  <option value="">Select MR Type</option>
                  <option value="Simple">Simple</option>
                  <option value="Complex">Complex</option>
                  <option value="Super Complex">Super Complex</option>
                </select>
                {errors.embMR && <p className="text-red-500 text-xs">{errors.embMR}</p>}
              </div>
              
              {/* Plate Dimensions - Show only when plateSizeType is selected */}
              {embDetailsSandwich.plateSizeType && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Length (cm):</label>
                    <input
                      type="number"
                      placeholder="Length (cm)"
                      value={embDetailsSandwich.plateDimensions.length || ""}
                      onChange={(e) => 
                        embDetailsSandwich.plateSizeType === "Manual"
                          ? handleEMBDimensionChange("length", e.target.value)
                          : null
                      }
                      className={`border rounded-md p-1 w-full text-xs ${
                        embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""
                      }`}
                      readOnly={embDetailsSandwich.plateSizeType === "Auto"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Breadth (cm):</label>
                    <input
                      type="number"
                      placeholder="Breadth (cm)"
                      value={embDetailsSandwich.plateDimensions.breadth || ""}
                      onChange={(e) => 
                        embDetailsSandwich.plateSizeType === "Manual"
                          ? handleEMBDimensionChange("breadth", e.target.value)
                          : null
                      }
                      className={`border rounded-md p-1 w-full text-xs ${
                        embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""
                      }`}
                      readOnly={embDetailsSandwich.plateSizeType === "Auto"}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {!singlePageMode && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
          >
            Previous
          </button>
          <button
            type="submit"
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Next
          </button>
        </div>
      )}
    </form>
  );
};

export default Sandwich;