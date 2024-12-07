// import React, { useEffect, useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({
//   clientName,
//   projectName,
//   estimates,
//   ordersData,
//   setOrdersData,
//   setEstimatesData,
// }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   const groupKey = `${clientName}-${projectName}`;
//   const movedToOrdersEstimateId = ordersData[groupKey] || null;

//   const firstEstimate = estimates[0] || {};

//   // Restore dropdown state from local storage
//   useEffect(() => {
//     const openGroupKey = localStorage.getItem("openGroupKey");
//     if (openGroupKey === groupKey) {
//       setOpenDropdown(true);
//       // Clear the saved group key after restoring state
//       localStorage.removeItem("openGroupKey");
//     }
//   }, [groupKey]);

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
//             {firstEstimate?.jobDetails?.jobType || "N/A"} · {firstEstimate?.jobDetails?.quantity || "0"} items
//           </p>
//           <p className="text-base text-gray-600">
//             Expected Delivery:{" "}
//             {firstEstimate?.deliveryDate
//               ? new Date(firstEstimate.deliveryDate).toISOString().split("T")[0]
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
//               movedToOrdersEstimateId={movedToOrdersEstimateId}
//               setMovedToOrders={(id) =>
//                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
//               }
//               estimates={estimates}
//               setEstimatesData={setEstimatesData}
//               groupKey={groupKey}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

// import React, { useEffect, useState } from "react";
// import Estimate from "./Estimate";

// const GroupDropdown = ({
//   clientName,
//   projectName,
//   estimates,
//   ordersData,
//   setOrdersData,
//   setEstimatesData,
// }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);
//   const [status, setStatus] = useState("Pending"); // Local status state
//   const [bgColor, setBgColor] = useState("bg-yellow-100 hover:bg-yellow-200"); // Local background color state

//   const groupKey = `${clientName}-${projectName}`;
//   const movedToOrdersEstimateId = ordersData[groupKey] || null;

//   // Determine the initial status and color
//   useEffect(() => {
//     const allCanceled = estimates.every((estimate) => estimate.isCanceled);
//     const movedToOrders = estimates.some((estimate) => estimate.movedToOrders);

//     if (allCanceled) {
//       setStatus("Cancelled");
//       setBgColor("bg-red-100 hover:bg-red-200");
//     } else if (movedToOrders) {
//       setStatus("Order Confirmed");
//       setBgColor("bg-green-200 hover:bg-green-300");
//     } else {
//       setStatus("Pending");
//       setBgColor("bg-yellow-100 hover:bg-yellow-200");
//     }
//   }, [estimates]); // Recompute status when estimates change

//   // Restore dropdown state from local storage
//   useEffect(() => {
//     const openGroupKey = localStorage.getItem("openGroupKey");
//     if (openGroupKey === groupKey) {
//       setOpenDropdown(true);
//       localStorage.removeItem("openGroupKey");
//     }
//   }, [groupKey]);

//   // Handle real-time updates from Estimate component
//   const handleEstimateUpdate = (updatedEstimates) => {
//     const allCanceled = updatedEstimates.every((estimate) => estimate.isCanceled);
//     const movedToOrders = updatedEstimates.some((estimate) => estimate.movedToOrders);

//     if (allCanceled) {
//       setStatus("Cancelled");
//       setBgColor("bg-red-100 hover:bg-red-200");
//     } else if (movedToOrders) {
//       setStatus("Order Confirmed");
//       setBgColor("bg-green-200 hover:bg-green-300");
//     } else {
//       setStatus("Pending");
//       setBgColor("bg-yellow-100 hover:bg-yellow-200");
//     }
//   };

//   return (
//     <div className={`border rounded-lg shadow-md ${bgColor}`}>
//       {/* Header */}
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="px-4 py-3 rounded-t-md flex justify-between items-start"
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

//         {/* Status */}
//         <span
//           className={`text-sm font-semibold px-2 py-1 rounded ${
//             status === "Order Confirmed"
//               ? "bg-green-500 text-white"
//               : status === "Cancelled"
//               ? "bg-red-500 text-white"
//               : "bg-yellow-500 text-black"
//           }`}
//         >
//           {status}
//         </span>
//       </div>

//       {/* Dropdown Content */}
//       {openDropdown && (
//         <div className="p-4 space-y-2 bg-gray-50">
//           {estimates.map((estimate, index) => (
//             <Estimate
//               key={estimate.id}
//               estimate={estimate}
//               estimateNumber={index + 1}
//               movedToOrdersEstimateId={movedToOrdersEstimateId}
//               setMovedToOrders={(id) =>
//                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
//               }
//               estimates={estimates}
//               setEstimatesData={setEstimatesData}
//               groupKey={groupKey}
//               onEstimateUpdate={handleEstimateUpdate} // Pass update handler
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

import React, { useEffect, useState } from "react";
import Estimate from "./Estimate";

const GroupDropdown = ({
  clientName,
  projectName,
  estimates,
  ordersData,
  setOrdersData,
  setEstimatesData,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const groupKey = `${clientName}-${projectName}`;
  const movedToOrdersEstimateId = ordersData[groupKey] || null;

  const firstEstimate = estimates[0] || {};

  // Determine the status dynamically
  const groupStatus = (() => {
    if (estimates.some((est) => est.isCanceled)) return "Cancelled";
    if (movedToOrdersEstimateId) return "Order Confirmed";
    return "Pending";
  })();

  const groupColor = (() => {
    switch (groupStatus) {
      case "Cancelled":
        return "bg-red-100 hover:bg-red-200";
      case "Order Confirmed":
        return "bg-green-100 hover:bg-green-200";
      case "Pending":
      default:
        return "bg-yellow-100 hover:bg-yellow-200";
    }
  })();

  // Restore dropdown state from local storage
  useEffect(() => {
    const openGroupKey = localStorage.getItem("openGroupKey");
    if (openGroupKey === groupKey) {
      setOpenDropdown(true);
      localStorage.removeItem("openGroupKey");
    }
  }, [groupKey]);

  return (
    <div className={`border rounded-lg shadow-md ${groupColor}`}>
      {/* Header */}
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="cursor-pointer px-4 py-3 rounded-t-md flex justify-between items-center transition"
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

        {/* Status Badge */}
        <div
          className={`text-sm px-3 py-1 rounded-md ${
            groupStatus === "Cancelled"
              ? "bg-red-500 text-white"
              : groupStatus === "Order Confirmed"
              ? "bg-green-500 text-white"
              : "bg-yellow-500 text-white"
          }`}
        >
          {groupStatus}
        </div>
      </div>

      {/* Dropdown Content */}
      {openDropdown && (
        <div className="p-4 space-y-2 bg-gray-50">
          {estimates.map((estimate, index) => (
            <Estimate
              key={estimate.id}
              estimate={estimate}
              estimateNumber={index + 1}
              movedToOrdersEstimateId={movedToOrdersEstimateId}
              setMovedToOrders={(id) =>
                setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
              }
              estimates={estimates}
              setEstimatesData={setEstimatesData}
              groupKey={groupKey}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
