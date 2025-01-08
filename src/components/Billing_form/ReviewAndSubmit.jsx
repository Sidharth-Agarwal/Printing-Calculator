// // import React from "react";

// // const ReviewAndSubmit = ({ state, calculations, isCalculating, onPrevious, onCreateEstimate }) => {
// //   const handleCreateEstimate = (e) => {
// //     e.preventDefault();
// //     onCreateEstimate();
// //   };

// //   const renderValue = (key, value) => {
// //     if (key.toLowerCase().includes("date") && value) {
// //       // Format date values
// //       return new Date(value).toLocaleDateString();
// //     }

// //     if (key.toLowerCase() === "image" && value) {
// //       // Render image if the key is "Image" and value is a valid URL
// //       return (
// //         <img
// //           src={value}
// //           alt="Die Image"
// //           className="max-w-full max-h-40 object-contain border rounded-md"
// //         />
// //       );
// //     }

// //     if (Array.isArray(value)) {
// //       // Render arrays as lists for better readability
// //       return (
// //         <ul className="list-disc pl-6">
// //           {value.map((item, index) => (
// //             <li key={index}>{renderValue("item", item)}</li>
// //           ))}
// //         </ul>
// //       );
// //     }

// //     if (typeof value === "object" && value !== null) {
// //       // Render objects as key-value pairs in a styled table
// //       return (
// //         <table className="w-full table-auto border-collapse border border-gray-300 rounded-md">
// //           <tbody>
// //             {Object.entries(value).map(([subKey, subValue], index) => (
// //               <tr
// //                 key={subKey}
// //                 className={`${
// //                   index % 2 === 0 ? "bg-gray-100" : "bg-white"
// //                 } border border-gray-300`}
// //               >
// //                 <td className="p-2 font-medium text-gray-700 capitalize">{subKey}:</td>
// //                 <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       );
// //     }    

// //     return value || "Not Provided";
// //   };

// //   const renderSection = (heading, sectionData) => {
// //     if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
// //       // Skip rendering if section data is missing or empty
// //       return null;
// //     }

// //     return (
// //       <div key={heading} className="mb-6">
// //         <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">{heading}:</h3>
// //         <div className="space-y-2">
// //           {Object.entries(sectionData).map(([key, value]) => (
// //             <div
// //               key={key}
// //               className="flex flex-col bg-gray-100 p-3 rounded-md"
// //             >
// //               <span className="font-medium text-gray-600 capitalize">{key}:</span>
// //               <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     );
// //   };

// //   return (
// //     <form onSubmit={handleCreateEstimate} className="space-y-6">
// //       <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>

// //       {/* Review Input Sections */}
// //       <div className="space-y-4 bg-white p-6 rounded shadow-md">

// //         {/* Render sections only if data is provided */}
// //         {state.orderAndPaper && renderSection("Order and Paper", state.orderAndPaper)}
// //         {state.lpDetails?.isLPUsed && renderSection("LP Details", state.lpDetails)}
// //         {state.fsDetails?.isFSUsed && renderSection("FS Details", state.fsDetails)}
// //         {state.embDetails?.isEMBUsed && renderSection("EMB Details", state.embDetails)}
// //         {state.digiDetails?.isDigiUsed && renderSection("Digi Details", state.digiDetails)}
// //         {state.dieCutting?.isDieCuttingUsed && renderSection("Die Cutting", state.dieCutting)}
// //         {state.sandwich?.isSandwichComponentUsed &&
// //           renderSection("Sandwich Details", state.sandwich)}
// //         {state.pasting?.isPastingUsed && renderSection("Pasting Details", state.pasting)}
// //       </div>

// //       {/* Calculations */}
// //       {isCalculating ? (
// //         <div className="bg-white p-6 rounded shadow-md">
// //           <p className="text-gray-600 text-center">Calculating costs...</p>
// //         </div>
// //       ) : calculations && !calculations.error ? (
// //         <div className="space-y-4 bg-white p-6 rounded shadow-md">
// //           <h3 className="text-lg font-semibold text-gray-600 mb-4">Cost Calculations</h3>
// //           <div className="grid grid-cols-2 gap-4">
// //             {Object.entries(calculations).map(([key, value]) => (
// //               <div
// //                 key={key}
// //                 className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
// //               >
// //                 <span className="font-medium text-gray-600 capitalize">{key}:</span>
// //                 <span className="text-gray-800">{renderValue(key, value)}</span>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       ) : (
// //         <div className="bg-white p-6 rounded shadow-md">
// //           <p className="text-red-600 text-center">
// //             {calculations?.error || "Unable to fetch calculations."}
// //           </p>
// //         </div>
// //       )}

// //       {/* Navigation Buttons */}
// //       <div className="flex justify-between mt-6">
// //         <button
// //           type="button"
// //           onClick={onPrevious}
// //           className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
// //         >
// //           Previous
// //         </button>
// //         <button
// //           type="submit"
// //           className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
// //         >
// //           Create Estimate
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default ReviewAndSubmit;

// import React from "react";

// const ReviewAndSubmit = ({ state, calculations, isCalculating, onPrevious, onCreateEstimate }) => {
//   // Mapping for user-friendly labels
//   const fieldLabels = {
//     PaperCostPerCard: "Paper Cost Per Card",
//     CuttingCostPerCard: "Cutting Cost Per Card",
//     PaperAndCuttingCostPerCard: "Paper and Cutting Cost Per Card",
//     FsCostPerCard: "FS Cost Per Card",
//     DigiCostPerCard: "Digi Cost Per Card",
//     PaperCost: "Paper Cost",
//     PrintingCost: "Printing Cost",
//     TotalPapersRequired: "Total Papers Required",
//     LpCostPerCard: "LP Cost Per Card",
//     LpCostPerCardSandwich: "LP Cost Per Card Sandwich",
//     EmbCostPerCard: "Embossing Cost Per Card",
//     EmbCostPerCardSandwich: "Embossing Cost Per Card Sandwich",
//     FsCostPerCardSandwich: "FS Cost Per Card Sandwich",
//     isLPUsed: "Is LP Used",
//     isFSUsed: "Is FS Used",
//     isEMBUsed: "Is Embossing Used",
//     isDieCuttingUsed: "Is Die Cutting Used",
//     isSandwichComponentUsed: "Is Sandwich Component Used",
//     isPastingUsed: "Is Pasting Used",
//     Length: "Length",
//     Breadth: "Breadth",
//     Image: "Image",
//   };

//   const handleCreateEstimate = (e) => {
//     e.preventDefault();
//     onCreateEstimate();
//   };

//   const renderValue = (key, value) => {
//     if (key.toLowerCase().includes("date") && value) {
//       // Format date values
//       return new Date(value).toLocaleDateString();
//     }

//     if (key.toLowerCase() === "image" && value) {
//       // Render image if the key is "Image" and value is a valid URL
//       return (
//         <img
//           src={value}
//           alt="Die Image"
//           className="max-w-full max-h-40 object-contain border rounded-md"
//         />
//       );
//     }

//     if (Array.isArray(value)) {
//       // Render arrays as lists for better readability
//       return (
//         <ul className="list-disc pl-6">
//           {value.map((item, index) => (
//             <li key={index}>{renderValue("item", item)}</li>
//           ))}
//         </ul>
//       );
//     }

//     if (typeof value === "object" && value !== null) {
//       // Render objects as key-value pairs in a styled table
//       return (
//         <table className="w-full table-auto border-collapse border border-gray-300 rounded-md">
//           <tbody>
//             {Object.entries(value).map(([subKey, subValue], index) => (
//               <tr
//                 key={subKey}
//                 className={`${
//                   index % 2 === 0 ? "bg-gray-100" : "bg-white"
//                 } border border-gray-300`}
//               >
//                 <td className="p-2 font-medium text-gray-700 capitalize">
//                   {fieldLabels[subKey] || subKey}:
//                 </td>
//                 <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       );
//     }

//     return value || "Not Provided";
//   };

//   const renderSection = (heading, sectionData) => {
//     if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
//       // Skip rendering if section data is missing or empty
//       return null;
//     }

//     return (
//       <div key={heading} className="mb-6">
//         <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">{heading}:</h3>
//         <div className="space-y-2">
//           {Object.entries(sectionData).map(([key, value]) => (
//             <div
//               key={key}
//               className="flex flex-col bg-gray-100 p-3 rounded-md"
//             >
//               <span className="font-medium text-gray-600 capitalize">
//                 {fieldLabels[key] || key}:
//               </span>
//               <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <form onSubmit={handleCreateEstimate} className="space-y-6">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>

//       {/* Review Input Sections */}
//       <div className="space-y-4 bg-white p-6 rounded shadow-md">
//         {/* Render sections only if data is provided */}
//         {state.orderAndPaper && renderSection("Order and Paper", state.orderAndPaper)}
//         {state.lpDetails?.isLPUsed && renderSection("LP Details", state.lpDetails)}
//         {state.fsDetails?.isFSUsed && renderSection("FS Details", state.fsDetails)}
//         {state.embDetails?.isEMBUsed && renderSection("EMB Details", state.embDetails)}
//         {state.digiDetails?.isDigiUsed && renderSection("Digi Details", state.digiDetails)}
//         {state.dieCutting?.isDieCuttingUsed && renderSection("Die Cutting", state.dieCutting)}
//         {state.sandwich?.isSandwichComponentUsed &&
//           renderSection("Sandwich Details", state.sandwich)}
//         {state.pasting?.isPastingUsed && renderSection("Pasting Details", state.pasting)}
//       </div>

//       {/* Calculations */}
//       {isCalculating ? (
//         <div className="bg-white p-6 rounded shadow-md">
//           <p className="text-gray-600 text-center">Calculating costs...</p>
//         </div>
//       ) : calculations && !calculations.error ? (
//         <div className="space-y-4 bg-white p-6 rounded shadow-md">
//           <h3 className="text-lg font-semibold text-gray-600 mb-4">Cost Calculations</h3>
//           <div className="grid grid-cols-2 gap-4">
//             {Object.entries(calculations).map(([key, value]) => (
//               <div
//                 key={key}
//                 className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
//               >
//                 <span className="font-medium text-gray-600 capitalize">
//                   {fieldLabels[key] || key}:
//                 </span>
//                 <span className="text-gray-800">{renderValue(key, value)}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white p-6 rounded shadow-md">
//           <p className="text-red-600 text-center">
//             {calculations?.error || "Unable to fetch calculations."}
//           </p>
//         </div>
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-6">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
//         >
//           Create Estimate
//         </button>
//       </div>
//     </form>
//   );
// };

// export default ReviewAndSubmit;

import React from "react";

const ReviewAndSubmit = ({ state, calculations, isCalculating, onPrevious, onCreateEstimate }) => {
  // Field labels for explicit mapping (special cases)
  const fieldLabels = {
    paperCostPerCard: "Paper Costing for each Card",
    date: "Order Date",
    lpCostPerCardSandwich: "LP Costing Per Card Sandwich",
    fsCostPerCardSandwich: "FS Cost Per Card Sandwich",
    embCostPerCardSandwich: "EMB Cost Per Card Sandwich",
    // Add more explicit mappings here if needed
  };

  // Helper function to generate labels dynamically
  const getLabel = (key) => {
    if (fieldLabels[key]) {
      console.log("Explicit label used:", fieldLabels[key]);
      return fieldLabels[key]; // Use the explicit mapping if available
    }

    // Fallback logic: dynamically generate a label
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add a space between lowercase and uppercase letters
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Add a space between consecutive uppercase letters followed by lowercase
      .replace(/([a-z])([0-9])/g, "$1 $2") // Add a space between letters and numbers
      .replace(/([0-9])([a-z])/g, "$1 $2") // Add a space between numbers and letters
      .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1)) // Capitalize words
      .trim(); // Remove leading and trailing spaces
  };

  const handleCreateEstimate = (e) => {
    e.preventDefault();
    onCreateEstimate();
  };

  const renderValue = (key, value) => {
    if (key.toLowerCase().includes("date") && value) {
      // Format date values
      return new Date(value).toLocaleDateString();
    }

    if (key.toLowerCase() === "image" && value) {
      // Render image if the key is "Image" and value is a valid URL
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-40 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      // Render arrays as lists for better readability
      return (
        <ul className="list-disc pl-6">
          {value.map((item, index) => (
            <li key={index}>{renderValue("item", item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      // Render objects as key-value pairs in a styled table
      return (
        <table className="w-full table-auto border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value).map(([subKey, subValue], index) => (
              <tr
                key={subKey}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } border border-gray-300`}
              >
                <td className="p-2 font-medium text-gray-700 capitalize">{getLabel(subKey)}:</td>
                <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return value || "Not Provided";
  };

  const renderSection = (heading, sectionData) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      // Skip rendering if section data is missing or empty
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">{heading}:</h3>
        <div className="space-y-2">
          {Object.entries(sectionData).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col bg-gray-100 p-3 rounded-md"
            >
              <span className="font-medium text-gray-600 capitalize">{getLabel(key)}:</span>
              <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleCreateEstimate} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>

      {/* Review Input Sections */}
      <div className="space-y-4 bg-white p-6 rounded shadow-md">
        {/* Render sections only if data is provided */}
        {state.orderAndPaper && renderSection("Order and Paper", state.orderAndPaper)}
        {state.lpDetails?.isLPUsed && renderSection("LP Details", state.lpDetails)}
        {state.fsDetails?.isFSUsed && renderSection("FS Details", state.fsDetails)}
        {state.embDetails?.isEMBUsed && renderSection("EMB Details", state.embDetails)}
        {state.digiDetails?.isDigiUsed && renderSection("Digi Details", state.digiDetails)}
        {state.dieCutting?.isDieCuttingUsed && renderSection("Die Cutting", state.dieCutting)}
        {state.sandwich?.isSandwichComponentUsed &&
          renderSection("Sandwich Details", state.sandwich)}
        {state.pasting?.isPastingUsed && renderSection("Pasting Details", state.pasting)}
      </div>

      {/* Calculations */}
      {isCalculating ? (
        <div className="bg-white p-6 rounded shadow-md">
          <p className="text-gray-600 text-center">Calculating costs...</p>
        </div>
      ) : calculations && !calculations.error ? (
        <div className="space-y-4 bg-white p-6 rounded shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Cost Calculations</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(calculations).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
              >
                <span className="font-medium text-gray-600 capitalize">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow-md">
          <p className="text-red-600 text-center">
            {calculations?.error || "Unable to fetch calculations."}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Estimate
        </button>
      </div>
    </form>
  );
};

export default ReviewAndSubmit;
