// import React from "react";

// const EstimateDetailsModal = ({ estimate, onClose }) => {
//   const renderValue = (key, value) => {
//     if (key.toLowerCase() === "image" && value) {
//       return (
//         <img
//           src={value}
//           alt="Die Image"
//           className="max-w-full max-h-40 object-contain border rounded-md"
//         />
//       );
//     }

//     if (Array.isArray(value)) {
//       return (
//         <ul className="list-disc pl-6">
//           {value.map((item, index) => (
//             <li key={index}>{renderValue("item", item)}</li>
//           ))}
//         </ul>
//       );
//     }

//     if (typeof value === "object" && value !== null) {
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
//                 <td className="p-2 font-medium text-gray-700 capitalize">{subKey}:</td>
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
//       return null;
//     }

//     return (
//       <div key={heading} className="mb-6">
//         <h3 className="text-lg font-semibold text-gray-700 capitalize mb-4">{heading}:</h3>
//         <div className="space-y-4">
//           {Object.entries(sectionData).map(([key, value]) => (
//             <div
//               key={key}
//               className="flex flex-col bg-gray-100 p-3 rounded-md shadow-sm"
//             >
//               <span className="font-medium text-gray-600 capitalize">{key}:</span>
//               <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
//       <div
//         className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]"
//         style={{ width: "90vw" }} // Increase width for a spacious layout
//       >
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg font-bold"
//         >
//           ✖
//         </button>

//         {/* Modal Header */}
//         <h2 className="text-xl font-bold text-gray-700 mb-6">Estimate Details</h2>

//         {/* Render Details Sections */}
//         <div className="space-y-8">
//           {renderSection("Order and Paper", estimate.jobDetails)}
//           {renderSection("Die Details", estimate.dieDetails)}
//           {renderSection("LP Details", estimate.lpDetails)}
//           {renderSection("FS Details", estimate.fsDetails)}
//           {renderSection("EMB Details", estimate.embDetails)}
//           {renderSection("Die Cutting Details", estimate.dieCuttingDetails)}
//           {renderSection("Calculations", estimate.calculations)}
//         </div>

//         {/* Modal Footer */}
//         <div className="mt-6 text-right">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EstimateDetailsModal;

import React from "react";

const EstimateDetailsModal = ({ estimate, onClose }) => {
  const fieldLabels = {
    clientName: "Name of the Client ",
    projectName: "Name of the Project ",
    date: "Order Date ",
    deliveryDate: "Expected Delivery Date ",
    jobType: "Job Type ",
    quantity: "Quantity ",
    paperProvided: "Paper Provided ",
    dieCode: "Die Code ",
    dieSize: "Die Size ",
    dieSelection: "Die Selection ",
    image: "Image ",
    breadth: "Breadth ",
    length: "Length ",
    paperName: "Paper Name ",
    plateSizeType: "Type of Plate Size ",
    noOfColors: "Total number of colors ",
    colorDetails: "Color Details of LP ",
    mrType: "Type of MR ",
    pantoneType: "Type of Pantone ",
    plateDimensions: "Dimensions of Plate ",
    plateType: "Type of Plate ",
    fsType: "Type of FS ",
    foilDetails: "Foil Details of FS ",
    blockSizeType: "Block size Type ",
    blockDimension: "Block Dimensions ",
    foilType: "Type of Foil ",
    blockType: "Type of Block ",
    plateTypeMale: "Male Plate Type ",
    plateTypeFemale: "Female Plate Type ",
    embMR: "Type of MR ",
    digiDie: "Digital Die Selected ",
    digiDimensions: "Digital Die Dimensions ",
    lpDetailsSandwich: "LP Details in Sandwich ",
    fsDetailsSandwich: "FS Details in Sandwich ",
    embDetailsSandwich: "EMB Details in Sandwich ",
    paperCostPerCard: "Cost of Paper ",
    cuttingCostPerCard: "Cost of Cutting ",
    paperAndCuttingCostPerCard: "Total Paper and Cutting Cost ",
    lpCostPerCard: "Cost of LP ",
    fsCostPerCard: "Cost of FS ",
    embCostPerCard: "Cost of EMB ",
    lpCostPerCardSandwich: "Cost of LP in Sandwich ",
    fsCostPerCardSandwich: "Cost of FS in Sandwich ",
    embCostPerCardSandwich: "Cost of EMB in Sandwich ",
    digiCostPerCard: "Digital Print Cost per Unit ",
    paperCost: "Digital Paper Cost ",
    printingCost: "Digital Print Cost ",
    totalPapersRequired: "Papers Required in Digital Print ",
  };

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
    if (key.toLowerCase().includes("date") && value) {
      return new Date(value).toLocaleDateString();
    }

    if (typeof value === "object" && value !== null && "length" in value && "breadth" in value) {
      const { length, breadth } = value;
      return `${length || "N/A"} x ${breadth || "N/A"}`;
    }

    if (key === "digiDimensions" || key === "plateDimensions" || key === "dieSize") {
      if (typeof value === "object") {
        const { length, breadth } = value;
        return `${length || "N/A"} x ${breadth || "N/A"}`;
      }
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

    return value || "Not Provided";
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

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]"
        style={{ width: "90vw" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-20 text-gray-600 hover:text-gray-900 text-lg font-bold"
        >
          ✖
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">Estimate Details</h2>

        {/* Render Details Sections */}
        <div className="space-y-8">
          {renderSectionInGrid("Order and Paper", estimate.jobDetails, ["dieSelection"])}
          {renderSectionInFlex("Die Details", estimate.dieDetails)}
          {renderSectionInFlex("LP Details", estimate.lpDetails)}
          {renderSectionInFlex("FS Details", estimate.fsDetails)}
          {renderSectionInFlex("EMB Details", estimate.embDetails)}
          {renderSectionInFlex("Die Cutting Details", estimate.dieCuttingDetails)}
          {renderSectionInGrid("Calculations", estimate.calculations)}
        </div>

        {/* Modal Footer */}
        {/* <div className="mt-6 text-right">     
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default EstimateDetailsModal;
