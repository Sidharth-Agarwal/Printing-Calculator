// import React, { useState } from "react";

// const LPSection = () => {
//   const [lpData, setLpData] = useState({
//     isLPUsed: false,
//     numColors: 0,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     plateType: "",
//     inkTypes: [],
//     lpMR: ""
//   });

//   const colorOptions = [
//     "Ink Black",
//     "Ink Cyan",
//     "Ink Magenta",
//     "Ink Varnish",
//     "Ink Milk White",
//     "Ink Opaque White",
//     "Ink White",
//     "Ink Yellow"
//   ];

//   const handleLPChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setLpData((prev) => ({
//         ...prev,
//         [name]: checked,
//         ...(name === "isLPUsed" && !checked
//           ? {
//               numColors: 0,
//               plateSizeType: "",
//               plateDimensions: { length: "", breadth: "" },
//               plateType: "",
//               inkTypes: [],
//               lpMR: ""
//             }
//           : {})
//       }));
//     } else {
//       setLpData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleInkTypeChange = (index, value) => {
//     const newInkTypes = [...lpData.inkTypes];
//     newInkTypes[index] = value;
//     setLpData((prev) => ({ ...prev, inkTypes: newInkTypes }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("LP Data Submitted: ", lpData);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>Section 2: Part 1 - LP</h3>

//       {/* LP Usage */}
//       <div>
//         <label>
//           <input
//             type="checkbox"
//             name="isLPUsed"
//             checked={lpData.isLPUsed}
//             onChange={handleLPChange}
//           />
//           Is LP being used?
//         </label>
//       </div>

//       {/* Show LP Options only if LP is used */}
//       {lpData.isLPUsed && (
//         <>
//           {/* Number of Colors */}
//           <div>
//             <label>Number of Colors (C1):</label>
//             <input
//               type="number"
//               name="numColors"
//               value={lpData.numColors}
//               min="1"
//               max="10"
//               onChange={handleLPChange}
//               required
//             />
//           </div>

//           {/* Plate Size Type */}
//           <div>
//             <label>Plate Size (C1):</label>
//             <select
//               name="plateSizeType"
//               value={lpData.plateSizeType}
//               onChange={handleLPChange}
//               required
//             >
//               <option value="">Select Plate Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>

//           {/* Plate Dimensions (Only for Manual Plate Size) */}
//           {lpData.plateSizeType === "Manual" && (
//             <div>
//               <label>Enter Plate Size (C1):</label>
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Length (L) in cm"
//                 value={lpData.plateDimensions.length}
//                 onChange={(e) =>
//                   setLpData((prev) => ({
//                     ...prev,
//                     plateDimensions: {
//                       ...prev.plateDimensions,
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
//                 value={lpData.plateDimensions.breadth}
//                 onChange={(e) =>
//                   setLpData((prev) => ({
//                     ...prev,
//                     plateDimensions: {
//                       ...prev.plateDimensions,
//                       breadth: e.target.value
//                     }
//                   }))
//                 }
//                 required
//               />
//             </div>
//           )}

//           {/* Plate Type */}
//           <div>
//             <label>Plate Type:</label>
//             <select
//               name="plateType"
//               value={lpData.plateType}
//               onChange={handleLPChange}
//               required
//             >
//               <option value="">Select Plate Type</option>
//               <option value="Polymer Plate">Polymer Plate</option>
//             </select>
//           </div>

//           {/* Ink Types */}
//           <div>
//             <label>Ink Types:</label>
//             {[...Array(Number(lpData.numColors)).keys()].map((_, index) => (
//               <div key={index}>
//                 <select
//                   value={lpData.inkTypes[index] || ""}
//                   onChange={(e) => handleInkTypeChange(index, e.target.value)}
//                   required
//                 >
//                   <option value="">Select Ink Type</option>
//                   {colorOptions.map((color, idx) => (
//                     <option key={idx} value={color}>
//                       {color}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))}
//           </div>

//           {/* LP MR */}
//           <div>
//             <label>LP MR:</label>
//             <select
//               name="lpMR"
//               value={lpData.lpMR}
//               onChange={handleLPChange}
//               required
//             >
//               <option value="">Select MR Type</option>
//               <option value="Simple">Simple</option>
//               <option value="Complex">Complex</option>
//               <option value="Super Complex">Super Complex</option>
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

// export default LPSection;

import React from "react";

const LPSection = ({ data, onChange, onNext, onPrevious }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">LP Details</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">No. of Colors</label>
        <input
          type="number"
          name="colors"
          value={data.colors || ""}
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

export default LPSection;
