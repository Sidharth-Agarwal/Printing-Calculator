// // import React from "react";
// // import SectionWrapper from "./SectionWrapper";

// // const EstimateDetails = ({ estimate }) => {
// //   if (!estimate) return <p className="text-gray-500">No details available.</p>;

// //   const { 
// //     jobDetails, 
// //     dieDetails, 
// //     lpDetails, 
// //     fsDetails, 
// //     embDetails, 
// //     digiDetails, 
// //     dieCuttingDetails 
// //   } = estimate;

// //   return (
// //     <div className="space-y-6">
// //       {/* Order and Paper Section */}
// //       <SectionWrapper title="Order and Paper">
// //         <p>
// //           <strong>Job Type:</strong> {jobDetails?.jobType || "N/A"}
// //         </p>
// //         <p>
// //           <strong>Quantity:</strong> {jobDetails?.quantity || "N/A"}
// //         </p>
// //         <p>
// //           <strong>Delivery Date:</strong> {estimate.deliveryDate || "N/A"}
// //         </p>
// //         <p>
// //           <strong>Paper Name:</strong> {jobDetails?.paperName || "N/A"}
// //         </p>
// //         <p>
// //           <strong>Paper Provided:</strong> {jobDetails?.paperProvided || "N/A"}
// //         </p>
// //       </SectionWrapper>

// //       {/* Die Details Section */}
// //       {dieDetails && (
// //         <SectionWrapper title="Die Details">
// //           <p>
// //             <strong>Die Selection:</strong> {dieDetails.dieSelection || "N/A"}
// //           </p>
// //           <p>
// //             <strong>Die Code:</strong> {dieDetails.dieCode || "N/A"}
// //           </p>
// //           <p>
// //             <strong>Die Size:</strong> {dieDetails.dieSize?.length} x{" "}
// //             {dieDetails.dieSize?.breadth || "N/A"}
// //           </p>
// //           <div>
// //             <strong>Die Image:</strong>
// //             <img
// //               src={dieDetails.image || "https://via.placeholder.com/200"}
// //               alt="Die"
// //               className="w-48 h-48 object-contain rounded-md border mt-2"
// //             />
// //           </div>
// //         </SectionWrapper>
// //       )}

// //       {/* LP Details Section */}
// //       {lpDetails?.isLPUsed && (
// //         <SectionWrapper title="LP Details">
// //           <p>
// //             <strong>No. of Colors:</strong> {lpDetails.noOfColors || "N/A"}
// //           </p>
// //           {lpDetails.colorDetails?.map((color, index) => (
// //             <div key={index}>
// //               <p>
// //                 <strong>Color {index + 1} Ink Type:</strong> {color.inkType || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>Plate Type:</strong> {color.plateType || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>MR Type:</strong> {color.mrType || "N/A"}
// //               </p>
// //             </div>
// //           ))}
// //         </SectionWrapper>
// //       )}

// //       {/* FS Details Section */}
// //       {fsDetails?.isFSUsed && (
// //         <SectionWrapper title="FS Details">
// //           <p>
// //             <strong>FS Type:</strong> {fsDetails.fsType || "N/A"}
// //           </p>
// //           {fsDetails.foilDetails?.map((foil, index) => (
// //             <div key={index}>
// //               <p>
// //                 <strong>Foil {index + 1} Type:</strong> {foil.foilType || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>Block Type:</strong> {foil.blockType || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>MR Type:</strong> {foil.mrType || "N/A"}
// //               </p>
// //             </div>
// //           ))}
// //         </SectionWrapper>
// //       )}

// //       {/* EMB Details Section */}
// //       {embDetails?.isEMBUsed && (
// //         <SectionWrapper title="EMB Details">
// //           <p>
// //             <strong>Plate Size:</strong> {embDetails.plateSizeType || "N/A"}
// //           </p>
// //           {embDetails.plateSizeType === "Manual" && (
// //             <p>
// //               <strong>Plate Dimensions:</strong> {embDetails.plateDimensions?.length} x{" "}
// //               {embDetails.plateDimensions?.breadth || "N/A"}
// //             </p>
// //           )}
// //           <p>
// //             <strong>Plate Type Male:</strong> {embDetails.plateTypeMale || "N/A"}
// //           </p>
// //           <p>
// //             <strong>Plate Type Female:</strong> {embDetails.plateTypeFemale || "N/A"}
// //           </p>
// //         </SectionWrapper>
// //       )}

// //       {/* Die Cutting Details Section */}
// //       {dieCuttingDetails?.isDieCuttingUsed && (
// //         <SectionWrapper title="Die Cutting">
// //           <p>
// //             <strong>Difficulty:</strong> {dieCuttingDetails.difficulty || "N/A"}
// //           </p>
// //           <p>
// //             <strong>PDC:</strong> {dieCuttingDetails.pdc || "N/A"}
// //           </p>
// //           {dieCuttingDetails.pdc === "Yes" && (
// //             <p>
// //               <strong>DC MR:</strong> {dieCuttingDetails.dcMR || "N/A"}
// //             </p>
// //           )}
// //         </SectionWrapper>
// //       )}

// //       {/* Digi Details Section */}
// //       {digiDetails?.isDigiUsed && (
// //         <SectionWrapper title="Digi Details">
// //           <p>
// //             <strong>Digi Die:</strong> {digiDetails.digiDie || "N/A"}
// //           </p>
// //         </SectionWrapper>
// //       )}
// //     </div>
// //   );
// // };

// // export default EstimateDetails;

// import React from "react";

// const EstimateDetailsModal = ({ estimate, onClose }) => {
//   const renderValue = (key, value) => {
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
//         <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">{heading}:</h3>
//         <div className="space-y-2">
//           {Object.entries(sectionData).map(([key, value]) => (
//             <div key={key} className="flex flex-col bg-gray-100 p-3 rounded-md">
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
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 space-y-4">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//         >
//           ✖
//         </button>
//         <h2 className="text-xl font-bold text-gray-700 mb-4">Estimate Details</h2>

//         {renderSection("Order and Paper", estimate.jobDetails)}
//         {renderSection("Die Details", estimate.dieDetails)}
//         {renderSection("LP Details", estimate.lpDetails)}
//         {renderSection("FS Details", estimate.fsDetails)}
//         {renderSection("EMB Details", estimate.embDetails)}
//         {renderSection("Calculations", estimate.calculations)}
//       </div>
//     </div>
//   );
// };

// export default EstimateDetailsModal;

import React from "react";

const EstimateDetailsModal = ({ estimate, onClose }) => {
  const renderValue = (key, value) => {
    if (key.toLowerCase() === "image" && value) {
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-40 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-6">
          {value.map((item, index) => (
            <li key={index}>{renderValue("item", item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
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
                <td className="p-2 font-medium text-gray-700 capitalize">{subKey}:</td>
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
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 capitalize mb-4">{heading}:</h3>
        <div className="space-y-4">
          {Object.entries(sectionData).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col bg-gray-100 p-3 rounded-md shadow-sm"
            >
              <span className="font-medium text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
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
        style={{ width: "90vw" }} // Increase width for a spacious layout
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg font-bold"
        >
          ✖
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">Estimate Details</h2>

        {/* Render Details Sections */}
        <div className="space-y-8">
          {renderSection("Order and Paper", estimate.jobDetails)}
          {renderSection("Die Details", estimate.dieDetails)}
          {renderSection("LP Details", estimate.lpDetails)}
          {renderSection("FS Details", estimate.fsDetails)}
          {renderSection("EMB Details", estimate.embDetails)}
          {renderSection("Die Cutting Details", estimate.dieCuttingDetails)}
          {renderSection("Calculations", estimate.calculations)}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetailsModal;
