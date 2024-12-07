// import React, { useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({ clientName, projectName, estimates }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   // Extract the first estimate's data for displaying general project info
//   const firstEstimate = estimates[0] || {};

//   // Format the delivery date to show only the date
//   const formattedDeliveryDate = firstEstimate?.deliveryDate
//     ? new Date(firstEstimate.deliveryDate).toISOString().split("T")[0]
//     : "Not Specified";

//   return (
//     <div className="border rounded-lg shadow-md bg-white">
//       {/* Header */}
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="cursor-pointer bg-gray-100 px-4 py-3 rounded-t-md flex justify-between items-center hover:bg-gray-200 transition"
//       >
//         {/* Header Information */}
//         <div className="space-y-1">
//           <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
//           <p className="text-lg font-semibold text-gray-700">{projectName}</p>
//           <p className="text-sm text-gray-500">
//             {firstEstimate?.jobDetails?.jobType || "N/A"} ·{" "}
//             {firstEstimate?.jobDetails?.quantity || "0"} items
//           </p>
//           <p className="text-base text-gray-600">
//             Expected Delivery: {formattedDeliveryDate}
//           </p>
//         </div>

//         {/* Dropdown Icon */}
//         <span className="text-blue-500 text-xl">
//           {openDropdown ? "▼" : "▶"}
//         </span>
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

// import React, { useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({ clientName, projectName, estimates, ordersData, setOrdersData }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   // Check if an estimate from this group is already moved to orders
//   const groupKey = `${clientName}-${projectName}`;
//   const movedToOrdersEstimateId = ordersData[groupKey] || null;

//   return (
//     <div className="border rounded-lg shadow-md bg-white">
//       {/* Header */}
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="cursor-pointer bg-gray-100 px-4 py-3 rounded-t-md flex justify-between items-center hover:bg-gray-200 transition"
//       >
//         <div className="space-y-1">
//           <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
//           <p className="text-lg font-semibold text-gray-700">{projectName}</p>
//           <p className="text-sm text-gray-500">
//             {estimates[0]?.jobDetails?.jobType || "N/A"} · {estimates[0]?.jobDetails?.quantity || "0"} items
//           </p>
//           <p className="text-base text-gray-600">
//             Expected Delivery:{" "}
//             {estimates[0]?.deliveryDate
//               ? new Date(estimates[0].deliveryDate).toISOString().split("T")[0]
//               : "Not Specified"}
//           </p>
//         </div>

//         <span className="text-blue-500 text-xl">{openDropdown ? "▼" : "▶"}</span>
//       </div>

//       {/* Dropdown Content */}
//       {openDropdown && (
//         <div className="p-4 space-y-2 bg-gray-50">
//           {estimates.map((estimate, index) => (
//             <Estimate
//               key={estimate.id}
//               estimate={estimate}
//               estimateNumber={index + 1}
//               movedToOrdersEstimateId={movedToOrdersEstimateId} // Pass which estimate is moved
//               setMovedToOrders={(id) => setOrdersData((prev) => ({ ...prev, [groupKey]: id }))}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

// import React, { useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({ clientName, projectName, estimates, ordersData, setOrdersData }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   // Check if an estimate from this group is already moved to orders
//   const groupKey = `${clientName}-${projectName}`;
//   const movedToOrdersEstimateId = ordersData[groupKey] || null;

//   return (
//     <div className="border rounded-lg shadow-md bg-white">
//       {/* Header */}
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="cursor-pointer bg-gray-100 px-4 py-3 rounded-t-md flex justify-between items-center hover:bg-gray-200 transition"
//       >
//         <div className="space-y-1">
//           <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
//           <p className="text-lg font-semibold text-gray-700">{projectName}</p>
//           <p className="text-sm text-gray-500">
//             {estimates[0]?.jobDetails?.jobType || "N/A"} · {estimates[0]?.jobDetails?.quantity || "0"} items
//           </p>
//           <p className="text-base text-gray-600">
//             Expected Delivery:{" "}
//             {estimates[0]?.deliveryDate
//               ? new Date(estimates[0].deliveryDate).toISOString().split("T")[0]
//               : "Not Specified"}
//           </p>
//         </div>

//         <span className="text-blue-500 text-xl">{openDropdown ? "▼" : "▶"}</span>
//       </div>

//       {/* Dropdown Content */}
//       {openDropdown && (
//         <div className="p-4 space-y-2 bg-gray-50">
//           {estimates.map((estimate, index) => (
//             <Estimate
//               key={estimate.id}
//               estimate={estimate}
//               estimateNumber={index + 1}
//               movedToOrdersEstimateId={movedToOrdersEstimateId} // Pass which estimate is moved
//               setMovedToOrders={(id) => setOrdersData((prev) => ({ ...prev, [groupKey]: id }))}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

import React, { useState } from "react";
import Estimate from "./Estimate";

const GroupDropdown = ({ clientName, projectName, estimates, ordersData, setOrdersData }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const groupKey = `${clientName}-${projectName}`;
  const movedToOrdersEstimateId = ordersData[groupKey] || null;

  // Use the first estimate for group-level details
  const firstEstimate = estimates[0] || {};

  return (
    <div className="border rounded-lg shadow-md bg-white">
      {/* Header */}
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="cursor-pointer bg-gray-100 px-4 py-3 rounded-t-md flex justify-between items-center hover:bg-gray-200 transition"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
          <p className="text-lg font-semibold text-gray-700">{projectName}</p>
          <p className="text-sm text-gray-500">
            {firstEstimate?.jobDetails?.jobType || "N/A"} · {firstEstimate?.jobDetails?.quantity || "0"} items
          </p>
          <p className="text-base text-gray-600">
            Expected Delivery:{" "}
            {firstEstimate?.deliveryDate
              ? new Date(firstEstimate.deliveryDate).toISOString().split("T")[0]
              : "Not Specified"}
          </p>
        </div>

        <span className="text-blue-500 text-xl">{openDropdown ? "▼" : "▶"}</span>
      </div>

      {/* Dropdown Content */}
      {openDropdown && (
        <div className="p-4 space-y-2 bg-gray-50">
          {estimates.map((estimate, index) => (
            <Estimate
              key={estimate.id}
              estimate={estimate}
              estimateNumber={index + 1}
              movedToOrdersEstimateId={movedToOrdersEstimateId} // Pass which estimate is moved
              setMovedToOrders={(id) =>
                setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
