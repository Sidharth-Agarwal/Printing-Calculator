// import React from "react";

// const ReviewAndSubmit = ({ 
//   state, 
//   calculations, 
//   isCalculating, 
//   onPrevious, 
//   onCreateEstimate, 
//   isEditMode = false,
//   isSaving = false 
// }) => {
//   const fieldLabels = {
//     clientName: "Name of the Client",
//     projectName: "Name of the Project",
//     date: "Order Date",
//     deliveryDate: "Expected Delivery Date",
//     jobType: "Job Type",
//     quantity: "Quantity",
//     paperProvided: "Paper Provided",
//     dieCode: "Die Code",
//     dieSize: "Die Size",
//     dieSelection: "Die Selection",
//     image: "Image",
//     breadth: "Breadth",
//     length: "Length",
//     paperName: "Paper Name",
//     plateSizeType: "Type of Plate Size",
//     noOfColors: "Total number of colors",
//     colorDetails: "Color Details of LP",
//     mrType: "Type of MR",
//     pantoneType: "Type of Pantone",
//     plateDimensions: "Dimensions of Plate",
//     plateType: "Type of Plate",
//     fsType: "Type of FS",
//     foilDetails: "Foil Details of FS",
//     blockSizeType: "Block size Type",
//     blockDimension: "Block Dimensions",
//     foilType: "Type of Foil",
//     blockType: "Type of Block",
//     plateTypeMale: "Male Plate Type",
//     plateTypeFemale: "Female Plate Type",
//     embMR: "Type of MR",
//     digiDie: "Digital Die Selected",
//     digiDimensions: "Digital Die Dimensions",
//     lpDetailsSandwich: "LP Details in Sandwich",
//     fsDetailsSandwich: "FS Details in Sandwich",
//     embDetailsSandwich: "EMB Details in Sandwich",
//     paperCostPerCard: "Cost of Paper",
//     cuttingCostPerCard: "Cost of Cutting",
//     paperAndCuttingCostPerCard: "Total Paper and Cutting Cost",
//     lpCostPerCard: "Cost of LP",
//     fsCostPerCard: "Cost of FS",
//     embCostPerCard: "Cost of EMB",
//     lpCostPerCardSandwich: "Cost of LP in Sandwich",
//     fsCostPerCardSandwich: "Cost of FS in Sandwich",
//     embCostPerCardSandwich: "Cost of EMB in Sandwich",
//     digiCostPerCard: "Digital Print Cost per Unit",
//   };

//   const costFieldsOrder = [
//     'paperCostPerCard',
//     'cuttingCostPerCard',
//     'paperAndCuttingCostPerCard',
//     'lpCostPerCard',
//     'fsCostPerCard',
//     'embCostPerCard',
//     'lpCostPerCardSandwich',
//     'fsCostPerCardSandwich',
//     'embCostPerCardSandwich',
//     'digiCostPerCard',
//   ];

//   const getLabel = (key) => {
//     if (fieldLabels[key]) {
//       return fieldLabels[key];
//     }
//     return key
//       .replace(/([a-z])([A-Z])/g, "$1 $2")
//       .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
//       .replace(/([a-z])([0-9])/g, "$1 $2")
//       .replace(/([0-9])([a-z])/g, "$1 $2")
//       .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
//       .trim();
//   };

//   const renderValue = (key, value) => {
//     if (value === null || value === undefined || value === "") {
//       return "Not Provided";
//     }

//     if (key.toLowerCase().includes("date") && value) {
//       try {
//         const date = new Date(value);
//         return date.toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//         });
//       } catch (error) {
//         return value || "Not Provided";
//       }
//     }

//     if (key === "dieSize" && typeof value === "string") {
//       return value === " x " ? "Not Provided" : value;
//     }

//     if (key.toLowerCase() === "image" && value) {
//       return (
//         <img
//           src={value}
//           alt="Die Image"
//           className="max-w-full max-h-20 object-contain border rounded-md"
//         />
//       );
//     }

//     if (Array.isArray(value)) {
//       return (
//         <div className="space-y-2">
//           {value.map((item, index) => (
//             <div key={index} className="flex justify-between items-center gap-4 bg-gray-100 p-2 rounded-md">
//               {renderValue("item", item)}
//             </div>
//           ))}
//         </div>
//       );
//     }

//     if (typeof value === "object" && value !== null) {
//       if ('length' in value && 'breadth' in value) {
//         return `${value.length || 'N/A'} x ${value.breadth || 'N/A'}`;
//       }

//       return (
//         <table className="w-full border-collapse border border-gray-300 rounded-md">
//           <tbody>
//             {Object.entries(value).map(([subKey, subValue], index) => (
//               <tr
//                 key={subKey}
//                 className={`${
//                   index % 2 === 0 ? "bg-gray-100" : "bg-white"
//                 } border border-gray-300`}
//               >
//                 <td className="p-2 font-medium text-gray-600">{getLabel(subKey)}:</td>
//                 <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       );
//     }

//     return value.toString();
//   };

//   const renderMultipleTablesInRow = (dataArray) => {
//     return (
//       <div className="grid grid-cols-3 gap-4">
//         {dataArray.map((item, index) => (
//           <div key={index} className="bg-white p-2 rounded-md border">
//             {renderValue("table", item)}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderSectionInFlex = (heading, sectionData, excludedFields = []) => {
//     if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
//       return null;
//     }

//     return (
//       <div key={heading} className="mb-6">
//         <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
//         <div className="space-y-4 bg-gray-100 p-4 rounded-md">
//           {Object.entries(sectionData)
//             .filter(([key]) => !excludedFields.includes(key))
//             .map(([key, value]) => {
//               if (Array.isArray(value)) {
//                 return (
//                   <div key={key}>
//                     <h4 className="font-medium text-gray-600 mb-2">{getLabel(key)}:</h4>
//                     {renderMultipleTablesInRow(value)}
//                   </div>
//                 );
//               }
//               return (
//                 <div key={key} className="flex items-center gap-1">
//                   <span className="font-medium text-gray-600">{getLabel(key)}:</span>
//                   <span className="text-gray-800">{renderValue(key, value)}</span>
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//     );
//   };

//   const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
//     if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
//       return null;
//     }

//     return (
//       <div key={heading} className="mb-6">
//         <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
//         <div className="grid grid-cols-2 gap-3 bg-white">
//           {Object.entries(sectionData)
//             .filter(([key]) => !excludedFields.includes(key))
//             .map(([key, value]) => (
//               <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
//                 <span className="font-medium text-gray-600">{getLabel(key)}:</span>
//                 <span className="text-gray-800">{renderValue(key, value)}</span>
//               </div>
//             ))}
//         </div>
//       </div>
//     );
//   };

//   const calculateTotalCostPerCard = (calculations) => {
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

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onCreateEstimate();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-6 bg-white">
//         {/* Order and Paper Section */}
//         {renderSectionInGrid("Order and Paper", {
//           clientName: state.orderAndPaper.clientName,
//           projectName: state.orderAndPaper.projectName,
//           date: state.orderAndPaper.date,
//           deliveryDate: state.orderAndPaper.deliveryDate,
//           jobType: state.orderAndPaper.jobType,
//           quantity: state.orderAndPaper.quantity,
//           paperProvided: state.orderAndPaper.paperProvided,
//           paperName: state.orderAndPaper.paperName,
//           dieCode: state.orderAndPaper.dieCode,
//           dieSize: state.orderAndPaper.dieSize,
//           image: state.orderAndPaper.image,
//         })}

//         {/* Process Details */}
//         <div className="space-y-4 bg-white">
//           {state.lpDetails?.isLPUsed && 
//             renderSectionInFlex("LP Details", state.lpDetails, ["isLPUsed"])}
//           {state.fsDetails?.isFSUsed &&
//             renderSectionInFlex("FS Details", state.fsDetails, ["isFSUsed"])}
//           {state.embDetails?.isEMBUsed &&
//             renderSectionInFlex("EMB Details", state.embDetails, ["isEMBUsed"])}
//           {state.digiDetails?.isDigiUsed &&
//             renderSectionInFlex("Digi Details", state.digiDetails, ["isDigiUsed"])}
//           {state.dieCutting?.isDieCuttingUsed &&
//             renderSectionInFlex("Die Cutting", state.dieCutting, ["isDieCuttingUsed"])}
          
//           {/* Sandwich Component */}
//           {state.sandwich?.isSandwichComponentUsed && (
//             <>
//               {state.sandwich.lpDetailsSandwich?.isLPUsed &&
//                 renderSectionInFlex("Sandwich LP Details", state.sandwich.lpDetailsSandwich, ["isLPUsed"])}
//               {state.sandwich.fsDetailsSandwich?.isFSUsed &&
//                 renderSectionInFlex("Sandwich FS Details", state.sandwich.fsDetailsSandwich, ["isFSUsed"])}
//               {state.sandwich.embDetailsSandwich?.isEMBUsed &&
//                 renderSectionInFlex("Sandwich EMB Details", state.sandwich.embDetailsSandwich, ["isEMBUsed"])}
//             </>
//           )}

//           {/* Pasting Details */}
//           {state.pasting?.isPastingUsed &&
//             renderSectionInFlex("Pasting Details", state.pasting, ["isPastingUsed"])}
//         </div>

//         {/* Calculations Section */}
//         {isCalculating ? (
//           <div className="bg-white p-4 rounded-md">
//             <div className="flex items-center justify-center space-x-2">
//               <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               <span className="text-gray-600">Calculating costs...</span>
//             </div>
//           </div>
//         ) : calculations && !calculations.error ? (
//           <div className="space-y-4 bg-white">
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
//             <div className="grid grid-cols-3 gap-3">
//               {costFieldsOrder
//                 .filter(key => 
//                   calculations[key] !== null && 
//                   calculations[key] !== undefined &&
//                   calculations[key] !== "" &&
//                   calculations[key] !== "Not Provided" && 
//                   parseFloat(calculations[key]) !== 0
//                 )
//                 .map((key) => (
//                   <div
//                     key={key}
//                     className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
//                   >
//                     <span className="font-medium text-gray-600">{getLabel(key)}:</span>
//                     <span className="text-gray-800">₹ {parseFloat(calculations[key]).toFixed(2)}</span>
//                   </div>
//                 ))}
//             </div>

//             {/* Total Calculations */}
//             <div className="mt-6 bg-gray-100 p-4 rounded-md">
//               <div className="flex justify-between items-center border-b border-gray-300 pb-3">
//                 <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
//                 <span className="text-lg font-bold text-gray-900">
//                   ₹ {calculateTotalCostPerCard(calculations).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center pt-3">
//                 <span className="text-lg font-bold text-gray-700">
//                   Total Cost ({state.orderAndPaper?.quantity || 0} pcs):
//                 </span>
//                 <span className="text-xl font-bold text-blue-600">
//                   ₹ {(calculateTotalCostPerCard(calculations) * 
//                     (state.orderAndPaper?.quantity || 0)).toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white p-4 rounded-md">
//             <p className="text-red-600 text-center">
//               {calculations?.error || "Unable to fetch calculations. Please try again."}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-6">
//         <button
//           type="button"
//           onClick={onPrevious}
//           disabled={isSaving}
//           className={`px-4 py-2 rounded-md ${
//             isSaving ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'
//           } text-white`}
//         >
//           Previous
//         </button>
        
//         <button
//           type="submit"
//           disabled={isSaving || isCalculating}
//           className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
//             isSaving || isCalculating
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-green-500 hover:bg-green-600'
//           } text-white transition-colors duration-200`}
//         >
//           {isSaving ? (
//             <>
//               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Saving...
//             </>
//           ) : isCalculating ? (
//             'Calculating...'
//           ) : isEditMode ? (
//             'Save Changes'
//           ) : (
//             'Create Estimate'
//           )}
//         </button>
//       </div>

//       {/* Error Message */}
//       {calculations?.error && (
//         <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           <p className="font-medium">Error calculating costs:</p>
//           <p>{calculations.error}</p>
//         </div>
//       )}
//     </form>
//   );
// };

// export default ReviewAndSubmit;

import React from "react";

const ReviewAndSubmit = ({ 
  state, 
  calculations, 
  isCalculating, 
  onPrevious, 
  onCreateEstimate, 
  isEditMode = false,
  isSaving = false 
}) => {
  const fieldLabels = {
    clientName: "Name of the Client",
    projectName: "Name of the Project",
    date: "Order Date",
    deliveryDate: "Expected Delivery Date",
    jobType: "Job Type",
    quantity: "Quantity",
    paperProvided: "Paper Provided",
    dieCode: "Die Code",
    dieSize: "Die Size",
    dieSelection: "Die Selection",
    image: "Image",
    breadth: "Breadth",
    length: "Length",
    paperName: "Paper Name",
    plateSizeType: "Type of Plate Size",
    noOfColors: "Total number of colors",
    colorDetails: "Color Details of LP",
    mrType: "Type of MR",
    pantoneType: "Type of Pantone",
    plateDimensions: "Dimensions of Plate",
    plateType: "Type of Plate",
    fsType: "Type of FS",
    foilDetails: "Foil Details of FS",
    blockSizeType: "Block size Type",
    blockDimension: "Block Dimensions",
    foilType: "Type of Foil",
    blockType: "Type of Block",
    plateTypeMale: "Male Plate Type",
    plateTypeFemale: "Female Plate Type",
    embMR: "Type of MR",
    digiDie: "Digital Die Selected",
    digiDimensions: "Digital Die Dimensions",
    lpDetailsSandwich: "LP Details in Sandwich",
    fsDetailsSandwich: "FS Details in Sandwich",
    embDetailsSandwich: "EMB Details in Sandwich",
    paperCostPerCard: "Cost of Paper",
    cuttingCostPerCard: "Cost of Cutting",
    paperAndCuttingCostPerCard: "Total Paper and Cutting Cost",
    lpCostPerCard: "Cost of LP",
    fsCostPerCard: "Cost of FS",
    embCostPerCard: "Cost of EMB",
    lpCostPerCardSandwich: "Cost of LP in Sandwich",
    fsCostPerCardSandwich: "Cost of FS in Sandwich",
    embCostPerCardSandwich: "Cost of EMB in Sandwich",
    digiCostPerCard: "Digital Print Cost per Unit",
    pastingCostPerCard: "Pasting Cost per Unit", // Added for pasting
    pastingType: "Type of Pasting" // Added for pasting
  };

  const costFieldsOrder = [
    'paperCostPerCard',
    'cuttingCostPerCard',
    'paperAndCuttingCostPerCard',
    'lpCostPerCard',
    'fsCostPerCard',
    'embCostPerCard',
    'lpCostPerCardSandwich',
    'fsCostPerCardSandwich',
    'embCostPerCardSandwich',
    'digiCostPerCard',
    'pastingCostPerCard', // Added for pasting
  ];

  const getLabel = (key) => {
    if (fieldLabels[key]) {
      return fieldLabels[key];
    }
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z])([0-9])/g, "$1 $2")
      .replace(/([0-9])([a-z])/g, "$1 $2")
      .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
      .trim();
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "Not Provided";
    }

    if (key.toLowerCase().includes("date") && value) {
      try {
        const date = new Date(value);
        return date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        return value || "Not Provided";
      }
    }

    if (key === "dieSize" && typeof value === "string") {
      return value === " x " ? "Not Provided" : value;
    }

    if (key.toLowerCase() === "image" && value) {
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-20 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-4 bg-gray-100 p-2 rounded-md">
              {renderValue("item", item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      if ('length' in value && 'breadth' in value) {
        return `${value.length || 'N/A'} x ${value.breadth || 'N/A'}`;
      }

      return (
        <table className="w-full border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value).map(([subKey, subValue], index) => (
              <tr
                key={subKey}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } border border-gray-300`}
              >
                <td className="p-2 font-medium text-gray-600">{getLabel(subKey)}:</td>
                <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return value.toString();
  };

  const renderMultipleTablesInRow = (dataArray) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {dataArray.map((item, index) => (
          <div key={index} className="bg-white p-2 rounded-md border">
            {renderValue("table", item)}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionInFlex = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="space-y-4 bg-gray-100 p-4 rounded-md">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <h4 className="font-medium text-gray-600 mb-2">{getLabel(key)}:</h4>
                    {renderMultipleTablesInRow(value)}
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                  <span className="text-gray-800">{renderValue(key, value)}</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const calculateTotalCostPerCard = (calculations) => {
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'pastingCostPerCard' // Added for pasting
    ];

    return relevantFields.reduce((acc, key) => {
      const value = calculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateEstimate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 bg-white">
        {/* Order and Paper Section */}
        {renderSectionInGrid("Order and Paper", {
          clientName: state.orderAndPaper.clientName,
          projectName: state.orderAndPaper.projectName,
          date: state.orderAndPaper.date,
          deliveryDate: state.orderAndPaper.deliveryDate,
          jobType: state.orderAndPaper.jobType,
          quantity: state.orderAndPaper.quantity,
          paperProvided: state.orderAndPaper.paperProvided,
          paperName: state.orderAndPaper.paperName,
          dieCode: state.orderAndPaper.dieCode,
          dieSize: state.orderAndPaper.dieSize,
          image: state.orderAndPaper.image,
        })}

        {/* Process Details */}
        <div className="space-y-4 bg-white">
          {state.lpDetails?.isLPUsed && 
            renderSectionInFlex("LP Details", state.lpDetails, ["isLPUsed"])}
          {state.fsDetails?.isFSUsed &&
            renderSectionInFlex("FS Details", state.fsDetails, ["isFSUsed"])}
          {state.embDetails?.isEMBUsed &&
            renderSectionInFlex("EMB Details", state.embDetails, ["isEMBUsed"])}
          {state.digiDetails?.isDigiUsed &&
            renderSectionInFlex("Digi Details", state.digiDetails, ["isDigiUsed"])}
          {state.dieCutting?.isDieCuttingUsed &&
            renderSectionInFlex("Die Cutting", state.dieCutting, ["isDieCuttingUsed"])}
          
          {/* Sandwich Component */}
          {state.sandwich?.isSandwichComponentUsed && (
            <>
              {state.sandwich.lpDetailsSandwich?.isLPUsed &&
                renderSectionInFlex("Sandwich LP Details", state.sandwich.lpDetailsSandwich, ["isLPUsed"])}
              {state.sandwich.fsDetailsSandwich?.isFSUsed &&
                renderSectionInFlex("Sandwich FS Details", state.sandwich.fsDetailsSandwich, ["isFSUsed"])}
              {state.sandwich.embDetailsSandwich?.isEMBUsed &&
                renderSectionInFlex("Sandwich EMB Details", state.sandwich.embDetailsSandwich, ["isEMBUsed"])}
            </>
          )}

          {/* Pasting Details */}
          {state.pasting?.isPastingUsed &&
            renderSectionInFlex("Pasting Details", state.pasting, ["isPastingUsed"])}
        </div>

        {/* Calculations Section */}
        {isCalculating ? (
          <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Calculating costs...</span>
            </div>
          </div>
        ) : calculations && !calculations.error ? (
          <div className="space-y-4 bg-white">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
            <div className="grid grid-cols-3 gap-3">
              {costFieldsOrder
                .filter(key => 
                  calculations[key] !== null && 
                  calculations[key] !== undefined &&
                  calculations[key] !== "" &&
                  calculations[key] !== "Not Provided" && 
                  parseFloat(calculations[key]) !== 0
                )
                .map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                  >
                    <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                    <span className="text-gray-800">₹ {parseFloat(calculations[key]).toFixed(2)}</span>
                  </div>
                ))}
            </div>

            {/* Total Calculations */}
            <div className="mt-6 bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹ {calculateTotalCostPerCard(calculations).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-gray-700">
                  Total Cost ({state.orderAndPaper?.quantity || 0} pcs):
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ₹ {(calculateTotalCostPerCard(calculations) * 
                    (state.orderAndPaper?.quantity || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-md">
            <p className="text-red-600 text-center">
              {calculations?.error || "Unable to fetch calculations. Please try again."}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md ${
            isSaving ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'
          } text-white`}
        >
          Previous
        </button>
        
        <button
          type="submit"
          disabled={isSaving || isCalculating}
          className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
            isSaving || isCalculating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors duration-200`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : isCalculating ? (
            'Calculating...'
          ) : isEditMode ? (
            'Save Changes'
          ) : (
            'Create Estimate'
          )}
        </button>
      </div>

      {/* Error Message */}
      {calculations?.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error calculating costs:</p>
          <p>{calculations.error}</p>
        </div>
      )}
    </form>
  );
};

export default ReviewAndSubmit;