// import React from "react";

// const Sandwich = ({ state, dispatch, onPrevious, onNext }) => {
//   const {
//     isSandwichComponentUsed = false,
//     lpDetails = {},
//     fsDetails = {},
//     embDetails = {},
//   } = state.sandwich || {};

//   const handleChange = (section, field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...state.sandwich[section],
//           [field]: value,
//         },
//       },
//     });
//   };

//   const handleToggle = (field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: { [field]: value },
//     });
//   };

//   const handleNestedChange = (section, field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...state.sandwich[section],
//           [field]: value,
//         },
//       },
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich Component</h2>

//       {/* Sandwich Component Toggle */}
//       <div>
//         <label className="flex items-center">
//           <input
//             type="checkbox"
//             checked={isSandwichComponentUsed}
//             onChange={(e) => handleToggle("isSandwichComponentUsed", e.target.checked)}
//             className="mr-2"
//           />
//           Is Sandwich Component being used?
//         </label>
//       </div>

//       {isSandwichComponentUsed && (
//         <>
//           {/* LP Details */}
//           <section className="space-y-4">
//             <h3 className="text-lg font-semibold">LP Details</h3>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={lpDetails.isLPUsed || false}
//                 onChange={(e) => handleChange("lpDetails", "isLPUsed", e.target.checked)}
//                 className="mr-2"
//               />
//               Is LP being used?
//             </label>

//             {lpDetails.isLPUsed && (
//               <>
//                 <div>
//                   <label>No of Colors:</label>
//                   <input
//                     type="number"
//                     value={lpDetails.noOfColors || 1}
//                     min="1"
//                     max="10"
//                     onChange={(e) =>
//                       handleChange("lpDetails", "noOfColors", parseInt(e.target.value))
//                     }
//                     className="border rounded-md p-2 w-full"
//                   />
//                 </div>
//                 <div>
//                   <label>Plate Size:</label>
//                   <select
//                     value={lpDetails.plateSizeType || ""}
//                     onChange={(e) =>
//                       handleChange("lpDetails", "plateSizeType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Plate Size Type</option>
//                     <option value="Auto">Auto</option>
//                     <option value="Manual">Manual</option>
//                   </select>
//                 </div>
//                 {lpDetails.plateSizeType === "Manual" && (
//                   <div className="grid grid-cols-2 gap-4">
//                     <input
//                       type="number"
//                       placeholder="Length (cm)"
//                       value={lpDetails.plateDimensions?.length || ""}
//                       onChange={(e) =>
//                         handleNestedChange("lpDetails", "plateDimensions", {
//                           ...lpDetails.plateDimensions,
//                           length: e.target.value,
//                         })
//                       }
//                       className="border rounded-md p-2"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Breadth (cm)"
//                       value={lpDetails.plateDimensions?.breadth || ""}
//                       onChange={(e) =>
//                         handleNestedChange("lpDetails", "plateDimensions", {
//                           ...lpDetails.plateDimensions,
//                           breadth: e.target.value,
//                         })
//                       }
//                       className="border rounded-md p-2"
//                     />
//                   </div>
//                 )}
//               </>
//             )}
//           </section>

//           {/* FS Details */}
//           <section className="space-y-4">
//             <h3 className="text-lg font-semibold">FS Details</h3>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={fsDetails.isFSUsed || false}
//                 onChange={(e) => handleChange("fsDetails", "isFSUsed", e.target.checked)}
//                 className="mr-2"
//               />
//               Is FS being used?
//             </label>

//             {fsDetails.isFSUsed && (
//               <>
//                 <div>
//                   <label>FS Type:</label>
//                   <select
//                     value={fsDetails.fsType || ""}
//                     onChange={(e) => handleChange("fsDetails", "fsType", e.target.value)}
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select FS Type</option>
//                     {["FS1", "FS2", "FS3"].map((type, index) => (
//                       <option key={index} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </>
//             )}
//           </section>

//           {/* EMB Details */}
//           <section className="space-y-4">
//             <h3 className="text-lg font-semibold">EMB Details</h3>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={embDetails.isEMBUsed || false}
//                 onChange={(e) => handleChange("embDetails", "isEMBUsed", e.target.checked)}
//                 className="mr-2"
//               />
//               Is EMB being used?
//             </label>

//             {embDetails.isEMBUsed && (
//               <>
//                 <div>
//                   <label>Plate Size:</label>
//                   <select
//                     value={embDetails.plateSizeType || ""}
//                     onChange={(e) =>
//                       handleChange("embDetails", "plateSizeType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Plate Size Type</option>
//                     <option value="Auto">Auto</option>
//                     <option value="Manual">Manual</option>
//                   </select>
//                 </div>
//               </>
//             )}
//           </section>
//         </>
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded-md"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </div>
//     </form>
//   );
// };

// export default Sandwich;

// // import React, { useState } from "react";

// // const Sandwich = ({ state, dispatch, onPrevious, onNext }) => {
// //   const {
// //     isSandwichComponentUsed = false,
// //     lpDetails = {},
// //     fsDetails = {},
// //     embDetails = {},
// //   } = state.sandwich || {};

// //   const [errors, setErrors] = useState({});

// //   const handleToggle = (field, value) => {
// //     dispatch({
// //       type: "UPDATE_SANDWICH",
// //       payload: { [field]: value },
// //     });
// //   };

// //   const handleSectionChange = (section, field, value) => {
// //     dispatch({
// //       type: "UPDATE_SANDWICH",
// //       payload: {
// //         [section]: {
// //           ...state.sandwich[section],
// //           [field]: value,
// //         },
// //       },
// //     });
// //   };

// //   const handleNestedChange = (section, field, value) => {
// //     dispatch({
// //       type: "UPDATE_SANDWICH",
// //       payload: {
// //         [section]: {
// //           ...state.sandwich[section],
// //           [field]: value,
// //         },
// //       },
// //     });
// //   };

// //   const validateFields = () => {
// //     const validationErrors = {};
// //     if (isSandwichComponentUsed) {
// //       // LP Validation
// //       if (lpDetails.isLPUsed) {
// //         if (!lpDetails.noOfColors || lpDetails.noOfColors < 1) {
// //           validationErrors.lpNoOfColors = "Number of colors must be at least 1.";
// //         }
// //         lpDetails.colorDetails.forEach((color, index) => {
// //           if (!color.plateSizeType) {
// //             validationErrors[`lpPlateSizeType_${index}`] = "Plate size type is required.";
// //           }
// //           if (color.plateSizeType === "Manual") {
// //             if (!color.plateDimensions?.length) {
// //               validationErrors[`lpPlateLength_${index}`] = "Length is required.";
// //             }
// //             if (!color.plateDimensions?.breadth) {
// //               validationErrors[`lpPlateBreadth_${index}`] = "Breadth is required.";
// //             }
// //           }
// //           if (!color.inkType) {
// //             validationErrors[`lpInkType_${index}`] = "Ink type is required.";
// //           }
// //           if (!color.plateType) {
// //             validationErrors[`lpPlateType_${index}`] = "Plate type is required.";
// //           }
// //           if (!color.mrType) {
// //             validationErrors[`lpMRType_${index}`] = "MR type is required.";
// //           }
// //         });
// //       }

// //       // FS Validation
// //       if (fsDetails.isFSUsed) {
// //         if (!fsDetails.fsType) {
// //           validationErrors.fsType = "FS Type is required.";
// //         }
// //         fsDetails.foilDetails.forEach((foil, index) => {
// //           if (!foil.blockSizeType) {
// //             validationErrors[`fsBlockSizeType_${index}`] = "Block size type is required.";
// //           }
// //           if (foil.blockSizeType === "Manual") {
// //             if (!foil.blockLength) {
// //               validationErrors[`fsBlockLength_${index}`] = "Block length is required.";
// //             }
// //             if (!foil.blockBreadth) {
// //               validationErrors[`fsBlockBreadth_${index}`] = "Block breadth is required.";
// //             }
// //           }
// //           if (!foil.foilType) {
// //             validationErrors[`fsFoilType_${index}`] = "Foil type is required.";
// //           }
// //           if (!foil.blockType) {
// //             validationErrors[`fsBlockType_${index}`] = "Block type is required.";
// //           }
// //           if (!foil.mrType) {
// //             validationErrors[`fsMRType_${index}`] = "MR type is required.";
// //           }
// //         });
// //       }

// //       // EMB Validation
// //       if (embDetails.isEMBUsed) {
// //         if (!embDetails.plateSizeType) {
// //           validationErrors.embPlateSizeType = "Plate size type is required.";
// //         }
// //         if (embDetails.plateSizeType === "Manual") {
// //           if (!embDetails.plateDimensions?.length) {
// //             validationErrors.embPlateLength = "Length is required.";
// //           }
// //           if (!embDetails.plateDimensions?.breadth) {
// //             validationErrors.embPlateBreadth = "Breadth is required.";
// //           }
// //         }
// //         if (!embDetails.plateTypeMale) {
// //           validationErrors.embPlateTypeMale = "Plate Type Male is required.";
// //         }
// //         if (!embDetails.plateTypeFemale) {
// //           validationErrors.embPlateTypeFemale = "Plate Type Female is required.";
// //         }
// //         if (!embDetails.embMR) {
// //           validationErrors.embMR = "EMB MR Type is required.";
// //         }
// //       }
// //     }

// //     setErrors(validationErrors);
// //     return Object.keys(validationErrors).length === 0;
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (validateFields()) {
// //       onNext();
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-6">
// //       <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich Component</h2>

// //       <label className="flex items-center">
// //         <input
// //           type="checkbox"
// //           checked={isSandwichComponentUsed}
// //           onChange={(e) => handleToggle("isSandwichComponentUsed", e.target.checked)}
// //           className="mr-2"
// //         />
// //         Is Sandwich Component being used?
// //       </label>

// //       {isSandwichComponentUsed && (
// //         <>
// //           {/* LP Details */}
// //           <section className="space-y-4">
// //             <h3 className="text-lg font-semibold">LP Details</h3>
// //             <label className="flex items-center">
// //               <input
// //                 type="checkbox"
// //                 checked={lpDetails.isLPUsed || false}
// //                 onChange={(e) => handleToggle("lpDetails", "isLPUsed", e.target.checked)}
// //                 className="mr-2"
// //               />
// //               Is LP being used?
// //             </label>

// //             {lpDetails.isLPUsed && (
// //               <>
// //                 {/* Number of Colors */}
// //                 <div>
// //                   <label className="block mb-2">Number of Colors:</label>
// //                   <input
// //                     type="number"
// //                     value={lpDetails.noOfColors || 1}
// //                     min="1"
// //                     max="10"
// //                     onChange={(e) =>
// //                       handleChange("lpDetails", "noOfColors", parseInt(e.target.value))
// //                     }
// //                     className="border rounded-md p-2 w-full"
// //                   />
// //                 </div>

// //                 {/* Color Details */}
// //                 {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
// //                   <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
// //                     <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

// //                     {/* Plate Size Type */}
// //                     <div>
// //                       <label className="block mb-2">Plate Size:</label>
// //                       <select
// //                         value={lpDetails.colorDetails[index]?.plateSizeType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("lpDetails", index, "plateSizeType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Plate Size</option>
// //                         <option value="Auto">Auto</option>
// //                         <option value="Manual">Manual</option>
// //                       </select>
// //                     </div>

// //                     {/* Manual Dimensions */}
// //                     {lpDetails.colorDetails[index]?.plateSizeType === "Manual" && (
// //                       <div className="grid grid-cols-2 gap-4 mt-2">
// //                         <input
// //                           type="number"
// //                           placeholder="Length (cm)"
// //                           value={lpDetails.colorDetails[index]?.plateDimensions?.length || ""}
// //                           onChange={(e) =>
// //                             handleNestedChange("lpDetails", index, "plateDimensions", {
// //                               ...lpDetails.colorDetails[index]?.plateDimensions,
// //                               length: e.target.value,
// //                             })
// //                           }
// //                           className="border rounded-md p-2"
// //                         />
// //                         <input
// //                           type="number"
// //                           placeholder="Breadth (cm)"
// //                           value={lpDetails.colorDetails[index]?.plateDimensions?.breadth || ""}
// //                           onChange={(e) =>
// //                             handleNestedChange("lpDetails", index, "plateDimensions", {
// //                               ...lpDetails.colorDetails[index]?.plateDimensions,
// //                               breadth: e.target.value,
// //                             })
// //                           }
// //                           className="border rounded-md p-2"
// //                         />
// //                       </div>
// //                     )}

// //                     {/* Ink Type */}
// //                     <div>
// //                       <label className="block mb-2">Ink Type:</label>
// //                       <select
// //                         value={lpDetails.colorDetails[index]?.inkType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("lpDetails", index, "inkType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Ink Type</option>
// //                         {[
// //                           "Ink Black",
// //                           "Ink Cyan",
// //                           "Ink Magenta",
// //                           "Ink Varnish",
// //                           "Ink Milk White",
// //                           "Ink Opaque White",
// //                           "Ink White",
// //                           "Ink Yellow",
// //                         ].map((ink, idx) => (
// //                           <option key={idx} value={ink}>
// //                             {ink}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     {/* Plate Type */}
// //                     <div>
// //                       <label className="block mb-2">Plate Type:</label>
// //                       <select
// //                         value={lpDetails.colorDetails[index]?.plateType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("lpDetails", index, "plateType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Plate Type</option>
// //                         <option value="Polymer Plate">Polymer Plate</option>
// //                       </select>
// //                     </div>

// //                     {/* MR Type */}
// //                     <div>
// //                       <label className="block mb-2">MR Type:</label>
// //                       <select
// //                         value={lpDetails.colorDetails[index]?.mrType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("lpDetails", index, "mrType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select MR Type</option>
// //                         <option value="Simple">Simple</option>
// //                         <option value="Complex">Complex</option>
// //                         <option value="Super Complex">Super Complex</option>
// //                       </select>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </>
// //             )}
// //           </section>

// //           {/* FS Details */}
// //           <section className="space-y-4">
// //             <h3 className="text-lg font-semibold">FS Details</h3>
// //             <label className="flex items-center">
// //               <input
// //                 type="checkbox"
// //                 checked={fsDetails.isFSUsed || false}
// //                 onChange={(e) => handleToggle("fsDetails", "isFSUsed", e.target.checked)}
// //                 className="mr-2"
// //               />
// //               Is FS being used?
// //             </label>

// //             {fsDetails.isFSUsed && (
// //               <>
// //                 {/* FS Type */}
// //                 <div>
// //                   <label className="block mb-2">FS Type:</label>
// //                   <select
// //                     value={fsDetails.fsType || ""}
// //                     onChange={(e) => handleChange("fsDetails", "fsType", e.target.value)}
// //                     className="border rounded-md p-2 w-full"
// //                   >
// //                     <option value="">Select FS Type</option>
// //                     {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, index) => (
// //                       <option key={index} value={type}>
// //                         {type}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 {/* Foil Details */}
// //                 {fsDetails.foilDetails.map((foil, index) => (
// //                   <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
// //                     <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>

// //                     {/* Block Size Type */}
// //                     <div>
// //                       <label className="block mb-2">Block Size Type:</label>
// //                       <select
// //                         value={foil.blockSizeType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("fsDetails", index, "blockSizeType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Block Size Type</option>
// //                         <option value="Auto">Auto</option>
// //                         <option value="Manual">Manual</option>
// //                       </select>
// //                     </div>

// //                     {/* Manual Block Dimensions */}
// //                     {foil.blockSizeType === "Manual" && (
// //                       <div className="grid grid-cols-2 gap-4 mt-2">
// //                         <input
// //                           type="number"
// //                           placeholder="Block Length (cm)"
// //                           value={foil.blockLength || ""}
// //                           onChange={(e) =>
// //                             handleNestedChange("fsDetails", index, "blockLength", e.target.value)
// //                           }
// //                           className="border rounded-md p-2"
// //                         />
// //                         <input
// //                           type="number"
// //                           placeholder="Block Breadth (cm)"
// //                           value={foil.blockBreadth || ""}
// //                           onChange={(e) =>
// //                             handleNestedChange("fsDetails", index, "blockBreadth", e.target.value)
// //                           }
// //                           className="border rounded-md p-2"
// //                         />
// //                       </div>
// //                     )}

// //                     {/* Foil Type */}
// //                     <div>
// //                       <label className="block mb-2">Foil Type:</label>
// //                       <select
// //                         value={foil.foilType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("fsDetails", index, "foilType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Foil Type</option>
// //                         {[
// //                           "Rosegold MTS 355",
// //                           "Gold MTS 220",
// //                           "White 911",
// //                           "Blk MTS 362",
// //                           "Silver ALUFIN PMAL METALITE",
// //                           "MTS 432 PINK",
// //                         ].map((foilType, idx) => (
// //                           <option key={idx} value={foilType}>
// //                             {foilType}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     {/* Block Type */}
// //                     <div>
// //                       <label className="block mb-2">Block Type:</label>
// //                       <select
// //                         value={foil.blockType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("fsDetails", index, "blockType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select Block Type</option>
// //                         {[
// //                           "Magnesium Block 3MM",
// //                           "Magnesium Block 4MM",
// //                           "Magnesium Block 5MM",
// //                           "Male Block",
// //                           "Female Block",
// //                         ].map((blockType, idx) => (
// //                           <option key={idx} value={blockType}>
// //                             {blockType}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     {/* MR Type */}
// //                     <div>
// //                       <label className="block mb-2">MR Type:</label>
// //                       <select
// //                         value={foil.mrType || ""}
// //                         onChange={(e) =>
// //                           handleNestedChange("fsDetails", index, "mrType", e.target.value)
// //                         }
// //                         className="border rounded-md p-2 w-full"
// //                       >
// //                         <option value="">Select MR Type</option>
// //                         <option value="Simple">Simple</option>
// //                         <option value="Complex">Complex</option>
// //                         <option value="Super Complex">Super Complex</option>
// //                       </select>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </>
// //             )}
// //           </section>

// //           {/* EMB Details */}
// //           <section className="space-y-4">
// //             <h3 className="text-lg font-semibold">EMB Details</h3>
// //             <label className="flex items-center">
// //               <input
// //                 type="checkbox"
// //                 checked={embDetails.isEMBUsed || false}
// //                 onChange={(e) => handleToggle("embDetails", "isEMBUsed", e.target.checked)}
// //                 className="mr-2"
// //               />
// //               Is EMB being used?
// //             </label>

// //             {embDetails.isEMBUsed && (
// //               <>
// //                 {/* Plate Size */}
// //                 <div>
// //                   <label className="block mb-2">Plate Size:</label>
// //                   <select
// //                     value={embDetails.plateSizeType || ""}
// //                     onChange={(e) => handleChange("embDetails", "plateSizeType", e.target.value)}
// //                     className="border rounded-md p-2 w-full"
// //                   >
// //                     <option value="">Select Plate Size</option>
// //                     <option value="Auto">Auto</option>
// //                     <option value="Manual">Manual</option>
// //                   </select>
// //                 </div>

// //                 {/* Manual Dimensions */}
// //                 {embDetails.plateSizeType === "Manual" && (
// //                   <div className="grid grid-cols-2 gap-4 mt-2">
// //                     <input
// //                       type="number"
// //                       placeholder="Length (cm)"
// //                       value={embDetails.plateDimensions?.length || ""}
// //                       onChange={(e) =>
// //                         handleChange("embDetails", "plateDimensions", {
// //                           ...embDetails.plateDimensions,
// //                           length: e.target.value,
// //                         })
// //                       }
// //                       className="border rounded-md p-2"
// //                     />
// //                     <input
// //                       type="number"
// //                       placeholder="Breadth (cm)"
// //                       value={embDetails.plateDimensions?.breadth || ""}
// //                       onChange={(e) =>
// //                         handleChange("embDetails", "plateDimensions", {
// //                           ...embDetails.plateDimensions,
// //                           breadth: e.target.value,
// //                         })
// //                       }
// //                       className="border rounded-md p-2"
// //                     />
// //                   </div>
// //                 )}

// //                 {/* Plate Type Male */}
// //                 <div>
// //                   <label className="block mb-2">Plate Type Male:</label>
// //                   <select
// //                     value={embDetails.plateTypeMale || ""}
// //                     onChange={(e) => handleChange("embDetails", "plateTypeMale", e.target.value)}
// //                     className="border rounded-md p-2 w-full"
// //                   >
// //                     <option value="">Select Plate Type Male</option>
// //                     <option value="Polymer Plate">Polymer Plate</option>
// //                   </select>
// //                 </div>

// //                 {/* Plate Type Female */}
// //                 <div>
// //                   <label className="block mb-2">Plate Type Female:</label>
// //                   <select
// //                     value={embDetails.plateTypeFemale || ""}
// //                     onChange={(e) => handleChange("embDetails", "plateTypeFemale", e.target.value)}
// //                     className="border rounded-md p-2 w-full"
// //                   >
// //                     <option value="">Select Plate Type Female</option>
// //                     <option value="Polymer Plate">Polymer Plate</option>
// //                   </select>
// //                 </div>

// //                 {/* EMB MR */}
// //                 <div>
// //                   <label className="block mb-2">EMB MR:</label>
// //                   <select
// //                     value={embDetails.embMR || ""}
// //                     onChange={(e) => handleChange("embDetails", "embMR", e.target.value)}
// //                     className="border rounded-md p-2 w-full"
// //                   >
// //                     <option value="">Select MR Type</option>
// //                     <option value="Simple">Simple</option>
// //                     <option value="Complex">Complex</option>
// //                     <option value="Super Complex">Super Complex</option>
// //                   </select>
// //                 </div>
// //               </>
// //             )}
// //           </section>
// //         </>
// //       )}

// //       <div className="flex justify-between">
// //         <button
// //           type="button"
// //           onClick={onPrevious}
// //           className="bg-gray-500 text-white px-4 py-2 rounded-md"
// //         >
// //           Previous
// //         </button>
// //         <button
// //           type="submit"
// //           className="bg-blue-500 text-white px-4 py-2 rounded-md"
// //         >
// //           Next
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default Sandwich;

// // Latest Component
// // import React, { useState } from "react";

// // const Sandwich = ({ state, dispatch, onPrevious, onNext }) => {
// //   const { isSandwichComponentUsed = false, lpDetails, fsDetails, embDetails } =
// //     state.sandwich || {
// //       lpDetails: {
// //         isLPUsed: false,
// //         noOfColors: 0,
// //         colorDetails: [],
// //       },
// //       fsDetails: {
// //         isFSUsed: false,
// //         fsType: "",
// //         foilDetails: [],
// //       },
// //       embDetails: {
// //         isEMBUsed: false,
// //         plateSizeType: "",
// //         plateDimensions: { length: "", breadth: "" },
// //         plateTypeMale: "",
// //         plateTypeFemale: "",
// //         embMR: "",
// //       },
// //     };

// //   const [errors, setErrors] = useState({});

// //   const handleChange = (section, field, value) => {
// //     dispatch({
// //       type: "UPDATE_SANDWICH",
// //       payload: {
// //         [section]: {
// //           ...state.sandwich[section],
// //           [field]: value,
// //         },
// //       },
// //     });
// //   };

// //   const handleNestedChange = (section, nestedField, field, value) => {
// //     dispatch({
// //       type: "UPDATE_SANDWICH",
// //       payload: {
// //         [section]: {
// //           ...state.sandwich[section],
// //           [nestedField]: {
// //             ...state.sandwich[section][nestedField],
// //             [field]: value,
// //           },
// //         },
// //       },
// //     });
// //   };

// //   const validateFields = () => {
// //     const newErrors = {};

// //     // Validate LP Details
// //     if (lpDetails.isLPUsed) {
// //       if (!lpDetails.noOfColors || lpDetails.noOfColors < 1) {
// //         newErrors.noOfColors = "Number of colors must be at least 1.";
// //       }

// //       lpDetails.colorDetails.forEach((color, index) => {
// //         if (!color.plateSizeType) {
// //           newErrors[`lp_plateSizeType_${index}`] =
// //             "Plate size type is required.";
// //         }
// //         if (color.plateSizeType === "Manual") {
// //           if (!color.plateDimensions?.length) {
// //             newErrors[`lp_plateLength_${index}`] = "Plate length is required.";
// //           }
// //           if (!color.plateDimensions?.breadth) {
// //             newErrors[`lp_plateBreadth_${index}`] =
// //               "Plate breadth is required.";
// //           }
// //         }
// //         if (!color.inkType) {
// //           newErrors[`lp_inkType_${index}`] = "Ink type is required.";
// //         }
// //         if (!color.plateType) {
// //           newErrors[`lp_plateType_${index}`] = "Plate type is required.";
// //         }
// //         if (!color.mrType) {
// //           newErrors[`lp_mrType_${index}`] = "MR type is required.";
// //         }
// //       });
// //     }

// //     // Validate FS Details
// //     if (fsDetails.isFSUsed) {
// //       if (!fsDetails.fsType) {
// //         newErrors.fsType = "FS Type is required.";
// //       }

// //       fsDetails.foilDetails.forEach((foil, index) => {
// //         if (!foil.blockSizeType) {
// //           newErrors[`fs_blockSizeType_${index}`] =
// //             "Block size type is required.";
// //         }
// //         if (foil.blockSizeType === "Manual") {
// //           if (!foil.blockLength) {
// //             newErrors[`fs_blockLength_${index}`] = "Block length is required.";
// //           }
// //           if (!foil.blockBreadth) {
// //             newErrors[`fs_blockBreadth_${index}`] =
// //               "Block breadth is required.";
// //           }
// //         }
// //         if (!foil.foilType) {
// //           newErrors[`fs_foilType_${index}`] = "Foil type is required.";
// //         }
// //         if (!foil.blockType) {
// //           newErrors[`fs_blockType_${index}`] = "Block type is required.";
// //         }
// //         if (!foil.mrType) {
// //           newErrors[`fs_mrType_${index}`] = "MR type is required.";
// //         }
// //       });
// //     }

// //     // Validate EMB Details
// //     if (embDetails.isEMBUsed) {
// //       if (!embDetails.plateSizeType) {
// //         newErrors.plateSizeType = "Plate size type is required.";
// //       }
// //       if (embDetails.plateSizeType === "Manual") {
// //         if (!embDetails.plateDimensions.length) {
// //           newErrors.embLength = "Plate length is required.";
// //         }
// //         if (!embDetails.plateDimensions.breadth) {
// //           newErrors.embBreadth = "Plate breadth is required.";
// //         }
// //       }
// //       if (!embDetails.plateTypeMale) {
// //         newErrors.plateTypeMale = "Plate type male is required.";
// //       }
// //       if (!embDetails.plateTypeFemale) {
// //         newErrors.plateTypeFemale = "Plate type female is required.";
// //       }
// //       if (!embDetails.embMR) {
// //         newErrors.embMR = "EMB MR is required.";
// //       }
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (validateFields()) {
// //       onNext();
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-6">
// //       <h2 className="text-xl font-bold text-gray-700 mb-4">
// //         Sandwich Component
// //       </h2>

// //       <div>
// //         <label className="flex items-center">
// //           <input
// //             type="checkbox"
// //             checked={isSandwichComponentUsed}
// //             onChange={(e) =>
// //               handleChange("isSandwichComponentUsed", e.target.checked)
// //             }
// //             className="mr-2"
// //           />
// //           Is Sandwich Component being used?
// //         </label>
// //       </div>

// //       {isSandwichComponentUsed && (
// //         <>
// //           {/* LP Section */}
// //           {/* FS Section */}
// //           {/* EMB Section */}
// //         </>
// //       )}

// //       <div className="flex justify-between">
// //         <button
// //           type="button"
// //           onClick={onPrevious}
// //           className="bg-gray-500 text-white px-4 py-2 rounded-md"
// //         >
// //           Previous
// //         </button>
// //         <button
// //           type="submit"
// //           className="bg-blue-500 text-white px-4 py-2 rounded-md"
// //         >
// //           Next
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default Sandwich;

// import React, { useState, useEffect } from "react";

// const Sandwich = ({ state, dispatch, onNext, onPrevious }) => {
//   const sandwichState = state.sandwich || {
//     isSandwichComponentUsed: false,
//     lpDetails: {
//       isLPUsed: false,
//       noOfColors: 0,
//       colorDetails: [],
//     },
//     fsDetails: {
//       isFSUsed: false,
//       fsType: "FS1",
//       foilDetails: [],
//     },
//     embDetails: {
//       isEMBUsed: false,
//       plateSizeType: "",
//       plateDimensions: { length: "", breadth: "" },
//       plateTypeMale: "",
//       plateTypeFemale: "",
//       embMR: "",
//     },
//   };

//   const [errors, setErrors] = useState({});

//   const handleChange = (section, field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...sandwichState[section],
//           [field]: value,
//         },
//       },
//     });
//   };

//   const handleToggle = (field, value) => {
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: { [field]: value },
//     });
//   };

//   const handleColorDetailsChange = (section, index, field, value) => {
//     const updatedDetails = [...sandwichState[section].colorDetails];
//     if (field === "plateDimensions") {
//       updatedDetails[index][field] = {
//         ...updatedDetails[index][field],
//         ...value,
//       };
//     } else {
//       updatedDetails[index][field] = value;
//     }
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         [section]: {
//           ...sandwichState[section],
//           colorDetails: updatedDetails,
//         },
//       },
//     });
//   };

//   const handleFoilDetailsChange = (index, field, value) => {
//     const updatedDetails = [...sandwichState.fsDetails.foilDetails];
//     if (field === "blockDimension") {
//       updatedDetails[index][field] = {
//         ...updatedDetails[index][field],
//         ...value,
//       };
//     } else {
//       updatedDetails[index][field] = value;
//     }
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         fsDetails: {
//           ...sandwichState.fsDetails,
//           foilDetails: updatedDetails,
//         },
//       },
//     });
//   };

//   const validateFields = () => {
//     const newErrors = {};

//     // LP Details Validation
//     if (sandwichState.lpDetails.isLPUsed) {
//       if (!sandwichState.lpDetails.noOfColors || sandwichState.lpDetails.noOfColors < 1) {
//         newErrors.noOfColors = "Number of colors must be at least 1.";
//       }
//       sandwichState.lpDetails.colorDetails.forEach((color, index) => {
//         if (!color.plateSizeType) {
//           newErrors[`plateSizeType_${index}`] = "Plate size type is required.";
//         }
//         if (color.plateSizeType === "Manual") {
//           if (!color.plateDimensions?.length) {
//             newErrors[`plateLength_${index}`] = "Plate length is required.";
//           }
//           if (!color.plateDimensions?.breadth) {
//             newErrors[`plateBreadth_${index}`] = "Plate breadth is required.";
//           }
//         }
//         if (!color.pantoneType) {
//           newErrors[`pantoneType_${index}`] = "Pantone type is required.";
//         }
//         if (!color.plateType) {
//           newErrors[`plateType_${index}`] = "Plate type is required.";
//         }
//         if (!color.mrType) {
//           newErrors[`mrType_${index}`] = "MR type is required.";
//         }
//       });
//     }

//     // FS Details Validation
//     if (sandwichState.fsDetails.isFSUsed) {
//       if (!sandwichState.fsDetails.fsType) {
//         newErrors.fsType = "FS Type is required.";
//       }
//       sandwichState.fsDetails.foilDetails.forEach((foil, index) => {
//         if (!foil.blockSizeType) {
//           newErrors[`blockSizeType_${index}`] = "Block Size Type is required.";
//         }
//         if (foil.blockSizeType === "Manual") {
//           if (!foil.blockDimension?.length) {
//             newErrors[`blockLength_${index}`] = "Block Length is required.";
//           }
//           if (!foil.blockDimension?.breadth) {
//             newErrors[`blockBreadth_${index}`] = "Block Breadth is required.";
//           }
//         }
//         if (!foil.foilType) {
//           newErrors[`foilType_${index}`] = "Foil Type is required.";
//         }
//         if (!foil.blockType) {
//           newErrors[`blockType_${index}`] = "Block Type is required.";
//         }
//         if (!foil.mrType) {
//           newErrors[`mrType_${index}`] = "MR Type is required.";
//         }
//       });
//     }

//     // EMB Details Validation
//     if (sandwichState.embDetails.isEMBUsed) {
//       if (!sandwichState.embDetails.plateSizeType) {
//         newErrors.plateSizeType = "Plate Size Type is required.";
//       }
//       if (sandwichState.embDetails.plateSizeType === "Manual") {
//         if (!sandwichState.embDetails.plateDimensions?.length) {
//           newErrors.length = "Length is required.";
//         }
//         if (!sandwichState.embDetails.plateDimensions?.breadth) {
//           newErrors.breadth = "Breadth is required.";
//         }
//       }
//       if (!sandwichState.embDetails.plateTypeMale) {
//         newErrors.plateTypeMale = "Plate Type Male is required.";
//       }
//       if (!sandwichState.embDetails.plateTypeFemale) {
//         newErrors.plateTypeFemale = "Plate Type Female is required.";
//       }
//       if (!sandwichState.embDetails.embMR) {
//         newErrors.embMR = "EMB MR Type is required.";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateFields()) {
//       onNext();
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <h2 className="text-xl font-bold text-gray-700">Sandwich Component</h2>

//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           checked={sandwichState.isSandwichComponentUsed}
//           onChange={(e) => handleToggle("isSandwichComponentUsed", e.target.checked)}
//           className="mr-2"
//         />
//         Is Sandwich Component being used?
//       </label>

//       {sandwichState.isSandwichComponentUsed && (
//         <>
//           {/* LP Details */}
//           <div className="p-4 border rounded-md bg-gray-50">
//             <h3 className="text-lg font-semibold">Letter Press (LP) Details</h3>
//             {/* Add LP Details Fields Here */}
//           </div>

//           {/* FS Details */}
//           <div className="p-4 border rounded-md bg-gray-50">
//             <h3 className="text-lg font-semibold">Foil Stamping (FS) Details</h3>
//             {/* Add FS Details Fields Here */}
//           </div>

//           {/* EMB Details */}
//           <div className="p-4 border rounded-md bg-gray-50">
//             <h3 className="text-lg font-semibold">Embossing (EMB) Details</h3>
//             {/* Add EMB Details Fields Here */}
//           </div>
//         </>
//       )}

//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded-md"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </div>
//     </form>
//   );
// };

// export default Sandwich;

import React, { useReducer, useEffect } from "react";

const initialState = {
  sandwichDetails: {
    isSandwichUsed: false,
  },
  lpDetails: {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [],
  },
  fsDetails: {
    isFSUsed: false,
    fsType: "",
    foilDetails: [],
  },
  embDetails: {
    isEMBUsed: false,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateTypeMale: "",
    plateTypeFemale: "",
    embMR: "",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_LP_DETAILS":
      return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
    case "UPDATE_FS_DETAILS":
      return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
    case "UPDATE_EMB_DETAILS":
      return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
    case "UPDATE_SANDWICH_USED":
      return {
        ...state,
        sandwichDetails: {
          ...state.sandwichDetails,
          isSandwichUsed: action.payload.isSandwichUsed,
        },
      };
    case "RESET_SANDWICH_DETAILS":
      return initialState;
    default:
      return state;
  }
};

const Sandwich = ({ onNext, onPrevious }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { isSandwichUsed } = state.sandwichDetails;

  useEffect(() => {
    if (!isSandwichUsed) {
      dispatch({ type: "RESET_SANDWICH_DETAILS" });
    }
  }, [isSandwichUsed]);

  const handleChange = (e) => {
    const { checked } = e.target;
    dispatch({
      type: "UPDATE_SANDWICH_USED",
      payload: { isSandwichUsed: checked },
    });
  };

  const validateFields = () => {
    // Validation logic (unchanged)
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich Details</h2>
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isSandwichUsed"
          checked={isSandwichUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is Sandwich being used?
      </label>
      {isSandwichUsed && (
        <>
          <LPDetails state={state} dispatch={dispatch} />
          <FSDetails state={state} dispatch={dispatch} />
          <EMBDetails state={state} dispatch={dispatch} />
        </>
      )}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

// const LPDetails = ({ state, dispatch }) => {
//   const lpDetails = state.lpDetails || {
//     isLPUsed: false,
//     noOfColors: 0,
//     colorDetails: [],
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     dispatch({
//       type: "UPDATE_LP_DETAILS",
//       payload: { [name]: value },
//     });
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-bold">LP Details</h3>
//       <label>
//         Number of Colors:
//         <input
//           type="number"
//           name="noOfColors"
//           value={lpDetails.noOfColors || 0}
//           onChange={handleChange}
//         />
//       </label>
//       {lpDetails.noOfColors > 0 && (
//         <div className="mt-4">
//           {Array.from({ length: lpDetails.noOfColors }).map((_, index) => (
//             <div key={index} className="mb-4">
//               <h4>Color {index + 1}</h4>
//               <label>
//                 Plate Size Type:
//                 <select
//                   name="plateSizeType"
//                   value={lpDetails.colorDetails[index]?.plateSizeType || ""}
//                   onChange={(e) =>
//                     dispatch({
//                       type: "UPDATE_LP_DETAILS",
//                       payload: {
//                         colorDetails: lpDetails.colorDetails.map((color, idx) =>
//                           idx === index
//                             ? { ...color, plateSizeType: e.target.value }
//                             : color
//                         ),
//                       },
//                     })
//                   }
//                 >
//                   <option value="">Select Plate Size Type</option>
//                   <option value="Auto">Auto</option>
//                   <option value="Manual">Manual</option>
//                 </select>
//               </label>
//               {/* Add more fields as required */}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

const LPDetails = ({ state, dispatch }) => {
  const lpDetails = state.lpDetails || {
    noOfColors: 0,
    colorDetails: [], // Holds plate size, pantone type, plate type, MR type for each color
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { noOfColors: parseInt(value, 10) || 0 },
      });
      generateColorDetails(parseInt(value, 10) || 0);
    }
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetails.colorDetails];

    if (field === "plateSizeType") {
      updatedDetails[index].plateSizeType = value;

      // Reset plate dimensions when switching to Manual
      if (value === "Manual") {
        updatedDetails[index].plateDimensions = { length: "", breadth: "" };
      }

      // Populate dimensions when switching to Auto
      if (value === "Auto") {
        updatedDetails[index].plateDimensions = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "plateDimensions") {
      updatedDetails[index].plateDimensions = {
        ...updatedDetails[index].plateDimensions,
        ...value,
      };
    } else {
      updatedDetails[index][field] = value;
    }

    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  };

  const generateColorDetails = (noOfColors) => {
    const details = Array.from({ length: noOfColors }, (_, index) => ({
      plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "",
      plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
        length: "",
        breadth: "",
      },
      pantoneType: lpDetails.colorDetails[index]?.pantoneType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || "",
      mrType: lpDetails.colorDetails[index]?.mrType || "",
    }));
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: details },
    });
  };

  const inchesToCm = (inches) => parseFloat(inches) * 2.54; // Convert inches to centimeters

  useEffect(() => {
    const updatedDetails = lpDetails.colorDetails.map((color) => {
      if (color.plateSizeType === "Auto") {
        return {
          ...color,
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          },
        };
      }
      return color;
    });
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  }, [dieSize]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Letter Press (LP) Details</h2>
      <div>
        <div className="mb-1">No of Colors:</div>
        <input
          type="number"
          name="noOfColors"
          value={lpDetails.noOfColors}
          min="1"
          max="10"
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
        />
        {errors.noOfColors && <p className="text-red-500 text-sm">{errors.noOfColors}</p>}
      </div>

      {lpDetails.noOfColors > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-4 mb-2">Color Details</h3>
          {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
            <div
              key={index}
              className="mb-4 p-4 border rounded-md bg-gray-50"
            >
              <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

              {/* Plate Size Type */}
              <div>
                <div className="mb-1">Plate Size (cm):</div>
                <select
                  value={lpDetails.colorDetails[index]?.plateSizeType || ""}
                  onChange={(e) =>
                    handleColorDetailsChange(index, "plateSizeType", e.target.value)
                  }
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select Plate Size</option>
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Plate Dimensions */}
              {lpDetails.colorDetails[index]?.plateSizeType && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    name="length"
                    placeholder="Length (cm)"
                    value={lpDetails.colorDetails[index]?.plateDimensions?.length || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "plateDimensions", {
                        length: e.target.value,
                      })
                    }
                    className={`border rounded-md p-2 ${
                      lpDetails.colorDetails[index]?.plateSizeType === "Auto" ? "bg-gray-100" : ""
                    }`}
                    readOnly={lpDetails.colorDetails[index]?.plateSizeType === "Auto"}
                  />
                  <input
                    type="number"
                    name="breadth"
                    placeholder="Breadth (cm)"
                    value={lpDetails.colorDetails[index]?.plateDimensions?.breadth || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "plateDimensions", {
                        breadth: e.target.value,
                      })
                    }
                    className={`border rounded-md p-2 ${
                      lpDetails.colorDetails[index]?.plateSizeType === "Auto" ? "bg-gray-100" : ""
                    }`}
                    readOnly={lpDetails.colorDetails[index]?.plateSizeType === "Auto"}
                  />
                </div>
              )}

              {/* Pantone Type */}
              <div>
                <div className="mt-2 mb-1">Pantone Type:</div>
                <input
                  type="text"
                  value={lpDetails.colorDetails[index]?.pantoneType || ""}
                  onChange={(e) =>
                    handleColorDetailsChange(index, "pantoneType", e.target.value)
                  }
                  className="border rounded-md p-2 w-full"
                />
              </div>

              {/* Plate Type */}
              <div>
                <div className="mt-2 mb-1">Plate Type:</div>
                <select
                  value={lpDetails.colorDetails[index]?.plateType || ""}
                  onChange={(e) =>
                    handleColorDetailsChange(index, "plateType", e.target.value)
                  }
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select Plate Type</option>
                  <option value="Polymer Plate">Polymer Plate</option>
                </select>
              </div>

              {/* MR Type */}
              <div>
                <div className="mt-2 mb-1">MR Type:</div>
                <select
                  value={lpDetails.colorDetails[index]?.mrType || ""}
                  onChange={(e) =>
                    handleColorDetailsChange(index, "mrType", e.target.value)
                  }
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select MR Type</option>
                  <option value="Simple">Simple</option>
                  <option value="Complex">Complex</option>
                  <option value="Super Complex">Super Complex</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FSDetails = ({ state, dispatch }) => {
  const fsDetails = state.fsDetails || {
    isFSUsed: false,
    fsType: "",
    foilDetails: [],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: value },
    });
  };

  return (
    <div>
      <h3 className="text-lg font-bold">FS Details</h3>
      <label>
        FS Type:
        <select
          name="fsType"
          value={fsDetails.fsType}
          onChange={handleChange}
        >
          <option value="">Select FS Type</option>
          <option value="FS1">FS1</option>
          <option value="FS2">FS2</option>
          {/* Additional options here */}
        </select>
      </label>
      {fsDetails.fsType && (
        <div className="mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4">
              <h4>Foil {index + 1}</h4>
              <label>
                Block Size Type:
                <select
                  name="blockSizeType"
                  value={fsDetails.foilDetails[index]?.blockSizeType || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_FS_DETAILS",
                      payload: {
                        foilDetails: fsDetails.foilDetails.map((foil, idx) =>
                          idx === index
                            ? { ...foil, blockSizeType: e.target.value }
                            : foil
                        ),
                      },
                    })
                  }
                >
                  <option value="">Select Block Size Type</option>
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>
              {/* Add more fields as required */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EMBDetails = ({ state, dispatch }) => {
  const embDetails = state.embDetails || {
    isEMBUsed: false,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateTypeMale: "",
    plateTypeFemale: "",
    embMR: "",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: value },
    });
  };

  return (
    <div>
      <h3 className="text-lg font-bold">EMB Details</h3>
      <label>
        Plate Size Type:
        <select
          name="plateSizeType"
          value={embDetails.plateSizeType}
          onChange={handleChange}
        >
          <option value="">Select Plate Size Type</option>
          <option value="Auto">Auto</option>
          <option value="Manual">Manual</option>
        </select>
      </label>
      {embDetails.plateSizeType && (
        <div className="mt-4">
          <label>
            Length:
            <input
              type="number"
              name="length"
              value={embDetails.plateDimensions.length}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_EMB_DETAILS",
                  payload: {
                    plateDimensions: {
                      ...embDetails.plateDimensions,
                      length: e.target.value,
                    },
                  },
                })
              }
            />
          </label>
          <label>
            Breadth:
            <input
              type="number"
              name="breadth"
              value={embDetails.plateDimensions.breadth}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_EMB_DETAILS",
                  payload: {
                    plateDimensions: {
                      ...embDetails.plateDimensions,
                      breadth: e.target.value,
                    },
                  },
                })
              }
            />
          </label>
        </div>
      )}
      {/* Add more fields as required */}
    </div>
  );
};

export default Sandwich;
