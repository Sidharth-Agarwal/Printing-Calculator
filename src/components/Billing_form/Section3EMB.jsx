// import React, { useState } from "react";

// const EMBSection = () => {
//   const [embData, setEmbData] = useState({
//     isEMBUsed: false,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     plateTypeMale: "",
//     plateTypeFemale: "",
//     embMR: ""
//   });

//   const plateTypeOptions = ["Polymer Plate"];
//   const embMROptions = ["Simple", "Complex", "Super Complex"];

//   const handleEMBChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setEmbData((prev) => ({
//         ...prev,
//         [name]: checked,
//         ...(name === "isEMBUsed" && !checked
//           ? {
//               plateSizeType: "",
//               plateDimensions: { length: "", breadth: "" },
//               plateTypeMale: "",
//               plateTypeFemale: "",
//               embMR: ""
//             }
//           : {})
//       }));
//     } else {
//       setEmbData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("EMB Data Submitted: ", embData);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>Section 2: Part 3 - EMB</h3>

//       {/* EMB Usage */}
//       <div>
//         <label>
//           <input
//             type="checkbox"
//             name="isEMBUsed"
//             checked={embData.isEMBUsed}
//             onChange={handleEMBChange}
//           />
//           Is EMB being used?
//         </label>
//       </div>

//       {/* Show EMB Options only if EMB is used */}
//       {embData.isEMBUsed && (
//         <>
//           {/* Plate Size */}
//           <div>
//             <label>Plate Size (C1):</label>
//             <select
//               name="plateSizeType"
//               value={embData.plateSizeType}
//               onChange={handleEMBChange}
//               required
//             >
//               <option value="">Select Plate Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>

//           {/* Plate Dimensions (Only for Manual Plate Size) */}
//           {embData.plateSizeType === "Manual" && (
//             <div>
//               <label>Enter Plate Size (C1):</label>
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Length (L) in cm"
//                 value={embData.plateDimensions.length}
//                 onChange={(e) =>
//                   setEmbData((prev) => ({
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
//                 value={embData.plateDimensions.breadth}
//                 onChange={(e) =>
//                   setEmbData((prev) => ({
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

//           {/* Plate Type Male */}
//           <div>
//             <label>Plate Type Male:</label>
//             <select
//               name="plateTypeMale"
//               value={embData.plateTypeMale}
//               onChange={handleEMBChange}
//               required
//             >
//               <option value="">Select Plate Type</option>
//               {plateTypeOptions.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Plate Type Female */}
//           <div>
//             <label>Plate Type Female:</label>
//             <select
//               name="plateTypeFemale"
//               value={embData.plateTypeFemale}
//               onChange={handleEMBChange}
//               required
//             >
//               <option value="">Select Plate Type</option>
//               {plateTypeOptions.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* EMBOSS MR */}
//           <div>
//             <label>EMBOSS MR:</label>
//             <select
//               name="embMR"
//               value={embData.embMR}
//               onChange={handleEMBChange}
//               required
//             >
//               <option value="">Select MR Type</option>
//               {embMROptions.map((option, index) => (
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

// export default EMBSection;

import React from "react";

const EMBSection = ({ data, onChange, onPrevious, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">EMB Details</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Plate Type</label>
        <input
          type="text"
          name="plateType"
          value={data.plateType || ""}
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
          onClick={onSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default EMBSection;
