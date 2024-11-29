// import React, { useState } from "react";

// const LPDetails = ({ onNext, onPrevious }) => {
//   const [data, setData] = useState({
//     isLPUsed: false,
//     noOfColors: 1,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     colorDetails: [], // Holds plate type and MR for each color
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       plateDimensions: { ...prev.plateDimensions, [name]: value },
//     }));
//   };

//   const handleColorDetailsChange = (index, field, value) => {
//     const updatedDetails = [...data.colorDetails];
//     updatedDetails[index] = {
//       ...updatedDetails[index],
//       [field]: value,
//     };
//     setData((prev) => ({ ...prev, colorDetails: updatedDetails }));
//   };

//   const generateColorDetails = () => {
//     const details = Array.from({ length: data.noOfColors }, (_, index) => ({
//       plateType: data.colorDetails[index]?.plateType || "",
//       mrType: data.colorDetails[index]?.mrType || "",
//     }));
//     setData((prev) => ({ ...prev, colorDetails: details }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">LP Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isLPUsed"
//           checked={data.isLPUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is LP being used?
//       </label>
//       {data.isLPUsed && (
//         <>
//           <div>
//             <label>No of Colors:</label>
//             <input
//               type="number"
//               name="noOfColors"
//               value={data.noOfColors}
//               min="1"
//               max="10"
//               onChange={(e) => {
//                 handleChange(e);
//                 generateColorDetails(); // Ensure color details are updated
//               }}
//               className="border rounded-md p-2 w-full"
//             />
//           </div>
//           <div>
//             <label>Plate Size:</label>
//             <select
//               name="plateSizeType"
//               value={data.plateSizeType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>
//           {data.plateSizeType === "Manual" && (
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Length (cm)"
//                 value={data.plateDimensions.length}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//               <input
//                 type="number"
//                 name="breadth"
//                 placeholder="Breadth (cm)"
//                 value={data.plateDimensions.breadth}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//             </div>
//           )}
//           <div>
//             <h3 className="text-lg font-semibold mt-4 mb-2">Color Details</h3>
//             {Array.from({ length: data.noOfColors }, (_, index) => (
//               <div
//                 key={index}
//                 className="mb-4 p-4 border rounded-md bg-gray-50"
//               >
//                 <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>
//                 <div>
//                   <label>Ink Type:</label>
//                   <select
//                     value={data.colorDetails[index]?.inkType || ""}
//                     onChange={(e) =>
//                       handleColorDetailsChange(index, "inkType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Ink Type</option>
//                     {[
//                       "Ink Black",
//                       "Ink Cyan",
//                       "Ink Magenta",
//                       "Ink Varnish",
//                       "Ink Milk White",
//                       "Ink Opaque White",
//                       "Ink White",
//                       "Ink Yellow",
//                     ].map((ink, idx) => (
//                       <option key={idx} value={ink}>
//                         {ink}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label>Plate Type:</label>
//                   <select
//                     value={data.colorDetails[index]?.plateType || ""}
//                     onChange={(e) =>
//                       handleColorDetailsChange(
//                         index,
//                         "plateType",
//                         e.target.value
//                       )
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Plate Type</option>
//                     <option value="Polymer Plate">Polymer Plate</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label>MR Type:</label>
//                   <select
//                     value={data.colorDetails[index]?.mrType || ""}
//                     onChange={(e) =>
//                       handleColorDetailsChange(index, "mrType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select MR Type</option>
//                     <option value="Simple">Simple</option>
//                     <option value="Complex">Complex</option>
//                     <option value="Super Complex">Super Complex</option>
//                   </select>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </form>
//   );
// };

// export default LPDetails;

// import React, { useState, useEffect } from "react";

// const FSDetails = ({ onNext, onPrevious }) => {
//   const [data, setData] = useState({
//     isFSUsed: false,
//     fsType: "",
//     blockSizeType: "",
//     blockDimensions: { length: "", breadth: "" },
//     foilDetails: [], // Holds block type and MR for each foil
//   });

//   // Effect to reset foil details whenever fsType changes
//   useEffect(() => {
//     if (data.fsType) {
//       const numberOfFoilOptions = data.fsType === "FS1" ? 1 : data.fsType === "FS2" ? 2 : 3;
//       setData((prev) => ({
//         ...prev,
//         foilDetails: Array.from({ length: numberOfFoilOptions }, (_, index) => ({
//           foilType: "",
//           blockType: "",
//           mrType: "",
//         })),
//       }));
//     }
//   }, [data.fsType]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       blockDimensions: { ...prev.blockDimensions, [name]: value },
//     }));
//   };

//   const handleFoilDetailsChange = (index, field, value) => {
//     const updatedDetails = [...data.foilDetails];
//     updatedDetails[index] = {
//       ...updatedDetails[index],
//       [field]: value,
//     };
//     setData((prev) => ({ ...prev, foilDetails: updatedDetails }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">FS Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isFSUsed"
//           checked={data.isFSUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is FS being used?
//       </label>
//       {data.isFSUsed && (
//         <>
//           <div>
//             <label>FS Type:</label>
//             <select
//               name="fsType"
//               value={data.fsType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select FS Type</option>
//               {["FS1", "FS2", "FS3"].map((type, index) => (
//                 <option key={index} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label>Block Size:</label>
//             <select
//               name="blockSizeType"
//               value={data.blockSizeType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Block Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>
//           {data.blockSizeType === "Manual" && (
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Block Length (cm)"
//                 value={data.blockDimensions.length}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//               <input
//                 type="number"
//                 name="breadth"
//                 placeholder="Block Breadth (cm)"
//                 value={data.blockDimensions.breadth}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//             </div>
//           )}
//           <div>
//             <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
//             {data.foilDetails.map((_, index) => (
//               <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
//                 <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>
//                 <div>
//                   <label>Foil Type:</label>
//                   <select
//                     value={data.foilDetails[index]?.foilType || ""}
//                     onChange={(e) =>
//                       handleFoilDetailsChange(index, "foilType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Foil Type</option>
//                     {[
//                       "Rosegold MTS 355",
//                       "Gold MTS 220",
//                       "White 911",
//                       "Blk MTS 362",
//                       "Silver ALUFIN PMAL METALITE",
//                       "MTS 432 PINK",
//                     ].map((foilOption, idx) => (
//                       <option key={idx} value={foilOption}>
//                         {foilOption}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label>Block Type:</label>
//                   <select
//                     value={data.foilDetails[index]?.blockType || ""}
//                     onChange={(e) =>
//                       handleFoilDetailsChange(index, "blockType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select Block Type</option>
//                     {[
//                       "Magnesium Block 3MM",
//                       "Magnesium Block 4MM",
//                       "Magnesium Block 5MM",
//                       "Male Block",
//                       "Female Block",
//                     ].map((block, idx) => (
//                       <option key={idx} value={block}>
//                         {block}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label>MR Type:</label>
//                   <select
//                     value={data.foilDetails[index]?.mrType || ""}
//                     onChange={(e) =>
//                       handleFoilDetailsChange(index, "mrType", e.target.value)
//                     }
//                     className="border rounded-md p-2 w-full"
//                   >
//                     <option value="">Select MR Type</option>
//                     <option value="Simple">Simple</option>
//                     <option value="Complex">Complex</option>
//                     <option value="Super Complex">Super Complex</option>
//                   </select>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </form>
//   );
// };

// export default FSDetails;

// import React, { useState } from "react";

// const EMBDetails = ({ onNext, onPrevious }) => {
//   const [data, setData] = useState({
//     isEMBUsed: false,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     plateTypeMale: "",
//     plateTypeFemale: "",
//     embMR: "",
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === "checkbox") {
//       setData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       plateDimensions: { ...prev.plateDimensions, [name]: value },
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">EMB Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isEMBUsed"
//           checked={data.isEMBUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is EMB being used?
//       </label>
//       {data.isEMBUsed && (
//         <>
//           <div>
//             <label>Plate Size:</label>
//             <select
//               name="plateSizeType"
//               value={data.plateSizeType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>
//           {data.plateSizeType === "Manual" && (
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 name="length"
//                 placeholder="Plate Length (cm)"
//                 value={data.plateDimensions.length}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//               <input
//                 type="number"
//                 name="breadth"
//                 placeholder="Plate Breadth (cm)"
//                 value={data.plateDimensions.breadth}
//                 onChange={handleNestedChange}
//                 className="border rounded-md p-2"
//               />
//             </div>
//           )}
//           <div>
//             <label>Plate Type Male:</label>
//             <select
//               name="plateTypeMale"
//               value={data.plateTypeMale}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Type Male</option>
//               <option value="Polymer Plate">Polymer Plate</option>
//             </select>
//           </div>
//           <div>
//             <label>Plate Type Female:</label>
//             <select
//               name="plateTypeFemale"
//               value={data.plateTypeFemale}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Type Female</option>
//               <option value="Polymer Plate">Polymer Plate</option>
//             </select>
//           </div>
//           <div>
//             <label>EMB MR:</label>
//             <select
//               name="embMR"
//               value={data.embMR}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select MR Type</option>
//               <option value="Simple">Simple</option>
//               <option value="Complex">Complex</option>
//               <option value="Super Complex">Super Complex</option>
//             </select>
//           </div>
//         </>
//       )}
//     </form>
//   );
// };

// export default EMBDetails;

import React, { useState } from "react";

const Sandwich = () => {
  // State to manage the toggle for each section
  const [isLPUsed, setIsLPUsed] = useState(false);
  const [isFSUsed, setIsFSUsed] = useState(false);
  const [isEMBUsed, setIsEMBUsed] = useState(false);

  // Handlers to toggle the states
  const toggleLP = () => setIsLPUsed(!isLPUsed);
  const toggleFS = () => setIsFSUsed(!isFSUsed);
  const toggleEMB = () => setIsEMBUsed(!isEMBUsed);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Sandwich Configuration</h2>

      {/* LP Section Toggle */}
      <div className="flex items-center space-x-4">
        <label className="font-medium">Is LP Used?</label>
        <button
          onClick={toggleLP}
          className={`px-4 py-2 rounded-md ${isLPUsed ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {isLPUsed ? "Yes" : "No"}
        </button>
      </div>

      {/* LP Section */}
      {isLPUsed && (
        <div className="mt-4">
          <h3 className="font-semibold">LP Details</h3>
          <div className="space-y-4">
            <label>
              LP Usage:
              <select className="ml-2 p-2 border rounded">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              No. of Colors:
              <input type="number" min="1" max="10" className="ml-2 p-2 border rounded" />
            </label>
            <label>
              Plate Size:
              <select className="ml-2 p-2 border rounded">
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label>
              Plate Type:
              <select className="ml-2 p-2 border rounded">
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </label>
            <label>
              LP MR:
              <select className="ml-2 p-2 border rounded">
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="superComplex">Super Complex</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* FS Section Toggle */}
      <div className="flex items-center space-x-4 mt-4">
        <label className="font-medium">Is FS Used?</label>
        <button
          onClick={toggleFS}
          className={`px-4 py-2 rounded-md ${isFSUsed ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {isFSUsed ? "Yes" : "No"}
        </button>
      </div>

      {/* FS Section */}
      {isFSUsed && (
        <div className="mt-4">
          <h3 className="font-semibold">FS Details</h3>
          <div className="space-y-4">
            <label>
              FS Usage:
              <select className="ml-2 p-2 border rounded">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              FS Type:
              <select className="ml-2 p-2 border rounded">
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </label>
            <label>
              Block Size:
              <select className="ml-2 p-2 border rounded">
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label>
              Block Type:
              <select className="ml-2 p-2 border rounded">
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </label>
            <label>
              FS MR:
              <select className="ml-2 p-2 border rounded">
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="superComplex">Super Complex</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* EMB Section Toggle */}
      <div className="flex items-center space-x-4 mt-4">
        <label className="font-medium">Is EMB Used?</label>
        <button
          onClick={toggleEMB}
          className={`px-4 py-2 rounded-md ${isEMBUsed ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {isEMBUsed ? "Yes" : "No"}
        </button>
      </div>

      {/* EMB Section */}
      {isEMBUsed && (
        <div className="mt-4">
          <h3 className="font-semibold">EMB Details</h3>
          <div className="space-y-4">
            <label>
              EMB Usage:
              <select className="ml-2 p-2 border rounded">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              Plate Size:
              <select className="ml-2 p-2 border rounded">
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label>
              Plate Type Male:
              <select className="ml-2 p-2 border rounded">
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </label>
            <label>
              Plate Type Female:
              <select className="ml-2 p-2 border rounded">
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </label>
            <label>
              EMB MR:
              <select className="ml-2 p-2 border rounded">
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="superComplex">Super Complex</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => console.log("Going back to previous step")}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Previous
        </button>
        <button
          onClick={() => console.log("Next step")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Sandwich;
