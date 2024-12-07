// import React, { useState } from "react";
// import OrderDetails from "./OrderDetails";

// const OrderDropdown = ({ order }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleDropdown = () => {
//     setIsOpen((prev) => !prev);
//   };

//   // Determine the order's status dynamically
//   const orderStatus = order.isCanceled
//     ? "Cancelled"
//     : order.isCompleted
//     ? "Completed"
//     : "In Progress";

//   const orderColor = (() => {
//     switch (orderStatus) {
//       case "Cancelled":
//         return "bg-red-100 hover:bg-red-200";
//       case "Completed":
//         return "bg-green-100 hover:bg-green-200";
//       case "In Progress":
//       default:
//         return "bg-yellow-100 hover:bg-yellow-200";
//     }
//   })();

//   return (
//     <div className={`border rounded-lg shadow-md ${orderColor} relative`}>
//       {/* Status Badge */}
//       <div
//         className={`absolute top-3 right-3 text-sm px-3 py-1 rounded-md ${
//           orderStatus === "Cancelled"
//             ? "bg-red-500 text-white"
//             : orderStatus === "Completed"
//             ? "bg-green-500 text-white"
//             : "bg-yellow-500 text-white"
//         }`}
//       >
//         {orderStatus}
//       </div>

//       {/* Dropdown Header */}
//       <div
//         onClick={toggleDropdown}
//         className="cursor-pointer px-4 py-3 rounded-t-md flex justify-between items-center transition"
//       >
//         <div className="space-y-1">
//           <h3 className="text-xl font-bold text-gray-800">{order.clientName}</h3>
//           <p className="text-lg font-semibold text-gray-700">{order.projectName}</p>
//           <p className="text-sm text-gray-500">
//             {order.jobDetails?.jobType || "N/A"} · {order.jobDetails?.quantity || "0"} items
//           </p>
//           <p className="text-base text-gray-600">
//             Expected Delivery:{" "}
//             {order.deliveryDate
//               ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
//               : "Not Specified"}
//           </p>
//         </div>
//       </div>

//       {/* Dropdown Content */}
//       {isOpen && (
//         <div className="p-4 space-y-2 bg-gray-50">
//           <OrderDetails order={order} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderDropdown;

import React, { useState } from "react";
import OrderDetails from "./OrderDetails";

const statusColors = {
  "Not started yet": "bg-gray-100 hover:bg-gray-200",
  Design: "bg-yellow-100 hover:bg-yellow-200",
  Positives: "bg-orange-100 hover:bg-orange-200",
  Printing: "bg-blue-100 hover:bg-blue-200",
  "Quality Check": "bg-green-100 hover:bg-green-200",
  Delivery: "bg-green-200 hover:bg-green-300",
};

const OrderDropdown = ({ order, onOrderUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleProgressUpdate = (newStage) => {
    const updatedOrder = { ...order, status: newStage, progressStage: newStage };
    onOrderUpdate(updatedOrder); // Update the order in the parent component
  };

  const dropdownColor = statusColors[order.status] || "bg-gray-100";

  return (
    <div className={`border rounded-lg shadow-md ${dropdownColor} relative`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 text-sm px-3 py-1 rounded-md text-white bg-gray-500">
        {order.status || "Not started yet"}
      </div>

      {/* Dropdown Header */}
      <div
        onClick={toggleDropdown}
        className="cursor-pointer px-4 py-3 rounded-t-md flex justify-between items-center transition"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-800">{order.clientName}</h3>
          <p className="text-lg font-semibold text-gray-700">{order.projectName}</p>
          <p className="text-sm text-gray-500">
            {order.jobDetails?.jobType || "N/A"} · {order.jobDetails?.quantity || "0"} items
          </p>
          <p className="text-base text-gray-600">
            Expected Delivery:{" "}
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
              : "Not Specified"}
          </p>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-4 space-y-2 bg-gray-50">
          <OrderDetails order={order} onProgressUpdate={handleProgressUpdate} />
        </div>
      )}
    </div>
  );
};

export default OrderDropdown;
