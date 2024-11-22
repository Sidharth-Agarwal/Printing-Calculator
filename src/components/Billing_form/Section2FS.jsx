// import React, { useState } from "react";

// const FSSection = () => {
//   const [fsData, setFsData] = useState({
//     isFSUsed: false,
//     fsType: "",
//     blockSizeType: "",
//     blockDimensions: { length: "", breadth: "" },
//     blockType: "",
//     foilTypes: ["", "", ""],
//     fsMR: ""
//   });

//   const fsTypeOptions = ["FS1", "FS2", "FS3", "FS4"];
//   const blockTypeOptions = [
//     "Magnesium Block 3MM",
//     "Magnesium Block 4MM",
//     "Magnesium Block 5MM",
//     "Male Block",
//     "Female Block"
//   ];
//   const foilTypeOptions = [
//     "Rosegold MTS 355",
//     "Gold MTS 220",
//     "White 911",
//     "Blk MTS 362",
//     "Silver ALUFIN PMAL METALITE",
//     "MTS 432 PINK"
//   ];
//   const fsMROptions = ["Simple", "Complex", "Super Complex"];

//   const handleFSChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setFsData((prev) => ({
//         ...prev,
//         [name]: checked,
//         ...(name === "isFSUsed" && !checked
//           ? {
//               fsType: "",
//               blockSizeType: "",
//               blockDimensions: { length: "", breadth: "" },
//               blockType: "",
//               foilTypes: ["", "", ""],
//               fsMR: ""
//             }
//           : {})
//       }));
//     } else {
//       setFsData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleFoilTypeChange = (index, value) => {
//     const newFoilTypes = [...fsData.foilTypes];
//     newFoilTypes[index] = value;
//     setFsData((prev) => ({ ...prev, foilTypes: newFoilTypes }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("FS Data Submitted: ", fsData);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>Section 2: Part 2 - FS</h3>

//       {/* FS Usage */}
//       <div>
//         <label>
//           <input
//             type="checkbox"
//             name="isFSUsed"
//             checked={fsData.isFSUsed}
//             onChange={handleFSChange}
//           />
//           Is FS being used?
//         </label>
//       </div>

//       {/* Show FS Options only if FS is used */}
//       {fsData.isFSUsed && (
//         <>
//           {/* FS Type */}
//           <div>
//             <label>FS Type (C1):</label>
//             <select
//               name="fsType"
//               value={fsData.fsType}
//               onChange={handleFSChange}
//               required
//             >
//               <option value="">Select FS Type</option>
//               {fsTypeOptions.map((type, index) => (
//                 <option key={index} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Block Size */}
//           <div>
//             <label>Block Size (C1):</label>
//             <select
//               name="blockSizeType"
//               value={fsData.blockSizeType}
//               onChange={handleFSChange}
//               required
//             >
//               <option value="">Select Block Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>

//           {/* Block Dimensions (Only for Manual Block Size) */}
//           {fsData.blockSizeType === "Manual" && (
//             <div>
//               <label>Enter Block Size (C1):</label>
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Length (L) in cm"
//                 value={fsData.blockDimensions.length}
//                 onChange={(e) =>
//                   setFsData((prev) => ({
//                     ...prev,
//                     blockDimensions: {
//                       ...prev.blockDimensions,
//                       length: e.target.value
//                     }
//                   }))
//                 }
//                 required
//               />
//               <input
//                 type="number"
//                 name="breadth"
//                 placeholder="Breadth (B) in cm"
//                 value={fsData.blockDimensions.breadth}
//                 onChange={(e) =>
//                   setFsData((prev) => ({
//                     ...prev,
//                     blockDimensions: {
//                       ...prev.blockDimensions,
//                       breadth: e.target.value
//                     }
//                   }))
//                 }
//                 required
//               />
//             </div>
//           )}

//           {/* Block Type */}
//           <div>
//             <label>Block Type:</label>
//             <select
//               name="blockType"
//               value={fsData.blockType}
//               onChange={handleFSChange}
//               required
//             >
//               <option value="">Select Block Type</option>
//               {blockTypeOptions.map((type, index) => (
//                 <option key={index} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Foil Types */}
//           <div>
//             <label>Foil Types:</label>
//             {fsData.foilTypes.map((foil, index) => (
//               <div key={index}>
//                 <select
//                   value={foil}
//                   onChange={(e) => handleFoilTypeChange(index, e.target.value)}
//                   required
//                 >
//                   <option value="">Select Foil Type {index + 1}</option>
//                   {foilTypeOptions.map((option, idx) => (
//                     <option key={idx} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))}
//           </div>

//           {/* FS MR */}
//           <div>
//             <label>FS MR:</label>
//             <select
//               name="fsMR"
//               value={fsData.fsMR}
//               onChange={handleFSChange}
//               required
//             >
//               <option value="">Select MR Type</option>
//               {fsMROptions.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </>
//       )}

//       {/* Submit Button */}
//       <div>
//         <button type="submit">Submit</button>
//       </div>
//     </form>
//   );
// };

// export default FSSection;

// // import React from "react";
// // import "./styles.css";
// // import "./styles/tailwind-pre-build.css";
// // import { useState } from "react";

// // const FSSection = () => {
// //   const [fsData, setFsData] = useState({
// //     isFSUsed: false,
// //     fsType: "",
// //     blockSizeType: "",
// //     blockDimensions: { length: "", breadth: "" },
// //     blockType: "",
// //     foilTypes: ["", "", ""],
// //     fsMR: "",
// //   });

// //   const fsTypeOptions = ["FS1", "FS2", "FS3", "FS4"];
// //   const blockTypeOptions = [
// //     "Magnesium Block 3MM",
// //     "Magnesium Block 4MM",
// //     "Magnesium Block 5MM",
// //     "Male Block",
// //     "Female Block",
// //   ];
// //   const foilTypeOptions = [
// //     "Rosegold MTS 355",
// //     "Gold MTS 220",
// //     "White 911",
// //     "Blk MTS 362",
// //     "Silver ALUFIN PMAL METALITE",
// //     "MTS 432 PINK",
// //   ];
// //   const fsMROptions = ["Simple", "Complex", "Super Complex"];

// //   const handleFSChange = (e) => {
// //     const { name, value, type, checked } = e.target;
// //     if (type === "checkbox") {
// //       setFsData((prev) => ({
// //         ...prev,
// //         [name]: checked,
// //         ...(name === "isFSUsed" && !checked
// //           ? {
// //               fsType: "",
// //               blockSizeType: "",
// //               blockDimensions: { length: "", breadth: "" },
// //               blockType: "",
// //               foilTypes: ["", "", ""],
// //               fsMR: "",
// //             }
// //           : {}),
// //       }));
// //     } else {
// //       setFsData((prev) => ({ ...prev, [name]: value }));
// //     }
// //   };

// //   const handleFoilTypeChange = (index, value) => {
// //     const newFoilTypes = [...fsData.foilTypes];
// //     newFoilTypes[index] = value;
// //     setFsData((prev) => ({ ...prev, foilTypes: newFoilTypes }));
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     console.log("FS Data Submitted: ", fsData);
// //   };

// //   return (
// //     <form
// //       onSubmit={handleSubmit}
// //       className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto space-y-6"
// //     >
// //       <h3 className="text-xl font-bold">Section 2: Part 2 - FS</h3>

// //       {/* FS Usage */}
// //       <div className="flex items-center space-x-2">
// //         <input
// //           type="checkbox"
// //           name="isFSUsed"
// //           checked={fsData.isFSUsed}
// //           onChange={handleFSChange}
// //           className="w-4 h-4 border-gray-300 rounded focus:ring-indigo-500"
// //         />
// //         <label className="text-sm font-medium">Is FS being used?</label>
// //       </div>

// //       {/* Show FS Options only if FS is used */}
// //       {fsData.isFSUsed && (
// //         <>
// //           {/* FS Type */}
// //           <div>
// //             <label className="block text-sm font-medium mb-1">
// //               FS Type (C1):
// //             </label>
// //             <select
// //               name="fsType"
// //               value={fsData.fsType}
// //               onChange={handleFSChange}
// //               required
// //               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //             >
// //               <option value="">Select FS Type</option>
// //               {fsTypeOptions.map((type, index) => (
// //                 <option key={index} value={type}>
// //                   {type}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Block Size */}
// //           <div>
// //             <label className="block text-sm font-medium mb-1">
// //               Block Size (C1):
// //             </label>
// //             <select
// //               name="blockSizeType"
// //               value={fsData.blockSizeType}
// //               onChange={handleFSChange}
// //               required
// //               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //             >
// //               <option value="">Select Block Size Type</option>
// //               <option value="Auto">Auto</option>
// //               <option value="Manual">Manual</option>
// //             </select>
// //           </div>

// //           {/* Block Dimensions (Only for Manual Block Size) */}
// //           {fsData.blockSizeType === "Manual" && (
// //             <div className="space-y-4">
// //               <label className="block text-sm font-medium">
// //                 Enter Block Size (C1):
// //               </label>
// //               <div className="grid grid-cols-2 gap-4">
// //                 <input
// //                   type="number"
// //                   name="length"
// //                   placeholder="Length (L) in cm"
// //                   value={fsData.blockDimensions.length}
// //                   onChange={(e) =>
// //                     setFsData((prev) => ({
// //                       ...prev,
// //                       blockDimensions: {
// //                         ...prev.blockDimensions,
// //                         length: e.target.value,
// //                       },
// //                     }))
// //                   }
// //                   required
// //                   className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //                 />
// //                 <input
// //                   type="number"
// //                   name="breadth"
// //                   placeholder="Breadth (B) in cm"
// //                   value={fsData.blockDimensions.breadth}
// //                   onChange={(e) =>
// //                     setFsData((prev) => ({
// //                       ...prev,
// //                       blockDimensions: {
// //                         ...prev.blockDimensions,
// //                         breadth: e.target.value,
// //                       },
// //                     }))
// //                   }
// //                   required
// //                   className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //                 />
// //               </div>
// //             </div>
// //           )}

// //           {/* Block Type */}
// //           <div>
// //             <label className="block text-sm font-medium mb-1">
// //               Block Type:
// //             </label>
// //             <select
// //               name="blockType"
// //               value={fsData.blockType}
// //               onChange={handleFSChange}
// //               required
// //               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //             >
// //               <option value="">Select Block Type</option>
// //               {blockTypeOptions.map((type, index) => (
// //                 <option key={index} value={type}>
// //                   {type}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Foil Types */}
// //           <div>
// //             <label className="block text-sm font-medium mb-1">
// //               Foil Types:
// //             </label>
// //             {fsData.foilTypes.map((foil, index) => (
// //               <div key={index} className="mt-2">
// //                 <select
// //                   value={foil}
// //                   onChange={(e) => handleFoilTypeChange(index, e.target.value)}
// //                   required
// //                   className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //                 >
// //                   <option value="">Select Foil Type {index + 1}</option>
// //                   {foilTypeOptions.map((option, idx) => (
// //                     <option key={idx} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
// //             ))}
// //           </div>

// //           {/* FS MR */}
// //           <div>
// //             <label className="block text-sm font-medium mb-1">FS MR:</label>
// //             <select
// //               name="fsMR"
// //               value={fsData.fsMR}
// //               onChange={handleFSChange}
// //               required
// //               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
// //             >
// //               <option value="">Select MR Type</option>
// //               {fsMROptions.map((option, index) => (
// //                 <option key={index} value={option}>
// //                   {option}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </>
// //       )}

// //       {/* Submit Button */}
// //       <div className="mt-6">
// //         <button
// //           type="submit"
// //           className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:ring focus:ring-indigo-400"
// //         >
// //           Submit
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default FSSection;

import React from "react";

const FSSection = ({ data, onChange, onNext, onPrevious }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">FS Details</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">FS Type</label>
        <select
          name="fsType"
          value={data.fsType || ""}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select FS Type</option>
          <option value="FS1">FS1</option>
          <option value="FS2">FS2</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Foil Type</label>
        <input
          type="text"
          name="foilType"
          value={data.foilType || ""}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FSSection;
