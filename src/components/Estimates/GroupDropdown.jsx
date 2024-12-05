// // import React, { useState } from "react";
// // import EstimateDetails from "./EstimateDetails";

// // const GroupDropdown = ({ clientName, projectName, estimates }) => {
// //   const [openDropdown, setOpenDropdown] = useState(false);

// //   return (
// //     <div className="border rounded-lg p-4 shadow-md">
// //       <div
// //         onClick={() => setOpenDropdown(!openDropdown)}
// //         className="cursor-pointer bg-gray-100 px-4 py-2 rounded-md flex justify-between items-center"
// //       >
// //         <h3 className="font-semibold text-lg">
// //           {clientName} - {projectName}
// //         </h3>
// //         <span>{openDropdown ? "▼" : "▶"}</span>
// //       </div>
// //       {openDropdown && (
// //         <div className="mt-4 space-y-4">
// //           {estimates.map((estimate) => (
// //             <EstimateDetails key={estimate.id} estimate={estimate} />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GroupDropdown;

// // import React, { useState } from "react";
// // import EstimateDetails from "./EstimateDetails";

// // const GroupDropdown = ({ clientName, projectName, estimates }) => {
// //   const [openDropdown, setOpenDropdown] = useState(false);

// //   return (
// //     <div className="border border-gray-300 rounded-lg shadow-md bg-white">
// //       <div
// //         onClick={() => setOpenDropdown(!openDropdown)}
// //         className="cursor-pointer bg-gray-100 px-4 py-2 rounded-t-md flex justify-between items-center hover:bg-gray-200"
// //       >
// //         <h3 className="font-semibold text-lg text-gray-700">
// //           {clientName} - {projectName}
// //         </h3>
// //         <span className="text-blue-500">{openDropdown ? "▼" : "▶"}</span>
// //       </div>
// //       {openDropdown && (
// //         <div className="p-4">
// //           {estimates.map((estimate) => (
// //             <EstimateDetails key={estimate.id} estimate={estimate} />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GroupDropdown;

// // Updated
// // import React, { useState } from "react";

// // const GroupDropdown = ({ clientName, projectName, estimates }) => {
// //   const [openDropdown, setOpenDropdown] = useState(false);

// //   const lastUpdated = estimates.length
// //     ? new Date(estimates[estimates.length - 1]?.date).toLocaleDateString()
// //     : "N/A";

// //   const estimateCount = estimates.length;

// //   return (
// //     <div className="border border-gray-300 rounded-lg shadow-md bg-white mb-4">
// //       {/* Dropdown Header */}
// //       <div
// //         onClick={() => setOpenDropdown(!openDropdown)}
// //         className="cursor-pointer bg-gray-100 px-6 py-4 flex justify-between items-center hover:bg-gray-200 rounded-t-md transition-all"
// //       >
// //         <div>
// //           <h3 className="font-semibold text-lg text-gray-700">
// //             {clientName} - {projectName}
// //           </h3>
// //           <p className="text-sm text-gray-500">
// //             {estimateCount} {estimateCount === 1 ? "Estimate" : "Estimates"} | Last Updated: {lastUpdated}
// //           </p>
// //         </div>
// //         <span className="text-blue-500 text-xl">
// //           {openDropdown ? "▼" : "▶"}
// //         </span>
// //       </div>

// //       {/* Dropdown Content */}
// //       {openDropdown && (
// //         <div className="p-4 space-y-4 bg-gray-50 rounded-b-md">
// //           {estimates.map((estimate, index) => (
// //             <div
// //               key={estimate.id}
// //               className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition"
// //             >
// //               <h4 className="text-lg font-bold text-gray-700 mb-2">
// //                 Estimate #{index + 1}
// //               </h4>
// //               <p>
// //                 <strong>Date:</strong>{" "}
// //                 {new Date(estimate.date).toLocaleDateString() || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>Job Type:</strong>{" "}
// //                 {estimate.jobDetails?.jobType || "N/A"}
// //               </p>
// //               <p>
// //                 <strong>Quantity:</strong> {estimate.jobDetails?.quantity || "N/A"}
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GroupDropdown;

// import React, { useState } from "react";
// import Estimate from "./Estimate123"; // Import your Estimate component here

// const GroupDropdown = ({ clientName = "-", projectName = "-", estimates = [] }) => {
//     const [openDropdown, setOpenDropdown] = useState(false);
  
//     const estimateCount = estimates.length;
  
//     return (
//       <div className="border border-gray-300 rounded-lg shadow-md bg-white mb-4">
//         {/* Dropdown Header */}
//         <div
//           onClick={() => setOpenDropdown(!openDropdown)}
//           className="cursor-pointer bg-gray-100 px-6 py-4 flex justify-between items-center hover:bg-gray-200 rounded-t-md transition-all"
//         >
//           <div>
//             <h3 className="font-semibold text-lg text-gray-700">
//               {clientName} - {projectName}
//             </h3>
//             <p className="text-sm text-gray-500">
//               {estimateCount} {estimateCount === 1 ? "Estimate" : "Estimates"}
//             </p>
//           </div>
//           <span className="text-blue-500 text-xl">
//             {openDropdown ? "▼" : "▶"}
//           </span>
//         </div>
  
//         {/* Dropdown Content */}
//         {openDropdown && estimates.length > 0 && (
//           <div className="p-4 space-y-4 bg-gray-50 rounded-b-md">
//             {estimates.map((estimate, index) => (
//               <Estimate
//                 key={estimate.id}
//                 estimate={estimate}
//                 estimateNumber={index + 1}
//               />
//             ))}
//           </div>
//         )}
  
//         {openDropdown && estimates.length === 0 && (
//           <div className="p-4 text-sm text-gray-500">
//             No estimates available for this project.
//           </div>
//         )}
//       </div>
//     );
//   };
  
// export default GroupDropdown;

// import React, { useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({ clientName, projectName, estimates }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   return (
//     <div className="border rounded-lg shadow-md bg-white">
//       {/* Header */}
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="cursor-pointer bg-gray-100 px-4 py-2 rounded-t-md flex justify-between items-center"
//       >
//         <h3 className="font-semibold text-lg">
//           {clientName} - {projectName}
//         </h3>
//         <span className="text-blue-500">{openDropdown ? "▼" : "▶"}</span>
//       </div>

//       {/* Dropdown Content */}
//       {openDropdown && (
//         <div className="p-4 space-y-2 bg-gray-50">
//           {estimates.map((estimate) => (
//             <Estimate key={estimate.id} estimate={estimate} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

import React, { useState } from "react";
import Estimate from "./Estimate";

const GroupDropdown = ({ clientName, projectName, estimates }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  // Extract the first estimate's data for displaying general project info
  const firstEstimate = estimates[0] || {};

  // Format the delivery date to show only the date
  const formattedDeliveryDate = firstEstimate?.deliveryDate
    ? new Date(firstEstimate.deliveryDate).toISOString().split("T")[0]
    : "Not Specified";

  return (
    <div className="border rounded-lg shadow-md bg-white">
      {/* Header */}
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="cursor-pointer bg-gray-100 px-4 py-3 rounded-t-md flex justify-between items-center hover:bg-gray-200 transition"
      >
        {/* Header Information */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
          <p className="text-lg font-semibold text-gray-700">{projectName}</p>
          <p className="text-sm text-gray-500">
            {firstEstimate?.jobDetails?.jobType || "N/A"} ·{" "}
            {firstEstimate?.jobDetails?.quantity || "0"} items
          </p>
          <p className="text-base text-gray-600">
            Expected Delivery: {formattedDeliveryDate}
          </p>
        </div>

        {/* Dropdown Icon */}
        <span className="text-blue-500 text-xl">
          {openDropdown ? "▼" : "▶"}
        </span>
      </div>

      {/* Dropdown Content */}
      {openDropdown && (
        <div className="p-4 space-y-2 bg-gray-50">
          {estimates.map((estimate) => (
            <Estimate key={estimate.id} estimate={estimate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
