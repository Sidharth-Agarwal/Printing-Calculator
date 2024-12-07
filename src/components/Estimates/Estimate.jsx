// import React, { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import EstimateDetails from "./EstimateDetails";

// const Estimate = ({ estimate, estimateNumber }) => {
//   const [showDetails, setShowDetails] = useState(false);
//   const [isMovedToOrders, setIsMovedToOrders] = useState(false);

//   const toggleDetails = () => {
//     setShowDetails((prev) => !prev);
//   };

//   const handleAddToOrders = async () => {
//     try {
//       // Add the estimate to the "orders" collection
//       await addDoc(collection(db, "orders"), estimate);

//       // Update the button state
//       setIsMovedToOrders(true);
//     } catch (error) {
//       console.error("Error moving estimate to orders:", error);
//       alert("Failed to move estimate to orders.");
//     }
//   };

//   return (
//     <div className="border rounded-md p-3 bg-white">
//       <div className="flex justify-between items-center">
//         {/* Display Estimate Version */}
//         <h4 className="font-medium">
//           Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
//         </h4>

//         <div className="space-x-4">
//           {/* Show/Hide Details Button */}
//           <button
//             onClick={toggleDetails}
//             className="text-blue-500 text-sm hover:underline"
//           >
//             {showDetails ? "Hide Details" : "View Details"}
//           </button>

//           {/* Add to Orders Button */}
//           <button
//             onClick={handleAddToOrders}
//             disabled={isMovedToOrders}
//             className={`text-sm px-3 py-1 rounded-md ${
//               isMovedToOrders
//                 ? "bg-green-500 text-white cursor-not-allowed"
//                 : "bg-blue-500 text-white hover:bg-blue-600"
//             }`}
//           >
//             {isMovedToOrders ? "Moved to Orders" : "Move to Orders"}
//           </button>
//         </div>
//       </div>

//       {/* Details Section */}
//       {showDetails && <EstimateDetails estimate={estimate} />}
//     </div>
//   );
// };

// export default Estimate;

// import React, { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import EstimateDetails from "./EstimateDetails";

// const Estimate = ({ estimate, estimateNumber, movedToOrdersEstimateId, setMovedToOrders }) => {
//   const [showDetails, setShowDetails] = useState(false);

//   const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
//   const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;

//   const toggleDetails = () => {
//     setShowDetails((prev) => !prev);
//   };

//   const handleAddToOrders = async () => {
//     if (isMovedToOrders || cannotMoveToOrders) return;

//     try {
//       await addDoc(collection(db, "orders"), estimate);
//       setMovedToOrders(estimate.id);
//     } catch (error) {
//       console.error("Error moving estimate to orders:", error);
//       alert("Failed to move estimate to orders.");
//     }
//   };

//   return (
//     <div className="border rounded-md p-3 bg-white">
//       <div className="flex justify-between items-center">
//         <h4 className="font-medium">
//           Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
//         </h4>

//         <button
//           onClick={handleAddToOrders}
//           disabled={cannotMoveToOrders}
//           className={`text-sm px-3 py-1 rounded-md ${
//             isMovedToOrders
//               ? "bg-green-500 text-white cursor-not-allowed"
//               : cannotMoveToOrders
//               ? "bg-gray-400 text-white cursor-not-allowed"
//               : "bg-blue-500 text-white hover:bg-blue-600"
//           }`}
//         >
//           {isMovedToOrders
//             ? "Moved to Orders"
//             : cannotMoveToOrders
//             ? "Can't Move to Orders"
//             : "Move to Orders"}
//         </button>
//       </div>

//       {showDetails && <EstimateDetails estimate={estimate} />}
//     </div>
//   );
// };

// export default Estimate;

// import React, { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import EstimateDetails from "./EstimateDetails";

// const Estimate = ({ estimate, estimateNumber, movedToOrdersEstimateId, setMovedToOrders }) => {
//   const [showDetails, setShowDetails] = useState(false);

//   const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
//   const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;

//   const toggleDetails = () => {
//     setShowDetails((prev) => !prev);
//   };

//   const handleAddToOrders = async () => {
//     if (isMovedToOrders || cannotMoveToOrders) return;

//     try {
//       await addDoc(collection(db, "orders"), estimate);
//       setMovedToOrders(estimate.id);
//     } catch (error) {
//       console.error("Error moving estimate to orders:", error);
//       alert("Failed to move estimate to orders.");
//     }
//   };

//   return (
//     <div
//       className={`border rounded-md p-3 bg-white transition ${
//         showDetails ? "shadow-lg" : "shadow-sm"
//       }`}
//     >
//       {/* Estimate Header */}
//       <div
//         onClick={toggleDetails}
//         className="cursor-pointer flex justify-between items-center"
//       >
//         <h4 className="font-medium">
//           Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
//         </h4>

//         <span
//           className={`text-sm font-semibold ${
//             showDetails ? "text-blue-500" : "text-gray-500"
//           }`}
//         >
//           {showDetails ? "Hide Details" : "Show Details"}
//         </span>
//       </div>

//       {/* Action Button */}
//       <div className="mt-2 flex justify-end">
//         <button
//           onClick={handleAddToOrders}
//           disabled={cannotMoveToOrders}
//           className={`text-sm px-3 py-1 rounded-md ${
//             isMovedToOrders
//               ? "bg-green-500 text-white cursor-not-allowed"
//               : cannotMoveToOrders
//               ? "bg-gray-400 text-white cursor-not-allowed"
//               : "bg-blue-500 text-white hover:bg-blue-600"
//           }`}
//         >
//           {isMovedToOrders
//             ? "Moved to Orders"
//             : cannotMoveToOrders
//             ? "Can't Move to Orders"
//             : "Move to Orders"}
//         </button>
//       </div>

//       {/* Estimate Details */}
//       {showDetails && <EstimateDetails estimate={estimate} />}
//     </div>
//   );
// };

// export default Estimate;

// import React, { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import EstimateDetails from "./EstimateDetails";

// const Estimate = ({ estimate, estimateNumber, movedToOrdersEstimateId, setMovedToOrders }) => {
//   const [showDetails, setShowDetails] = useState(false);

//   const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
//   const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;

//   const toggleDetails = () => {
//     setShowDetails((prev) => !prev);
//   };

//   const handleAddToOrders = async (e) => {
//     // Prevent toggling details when clicking the "Move to Orders" button
//     e.stopPropagation();

//     if (isMovedToOrders || cannotMoveToOrders) return;

//     try {
//       await addDoc(collection(db, "orders"), estimate);
//       setMovedToOrders(estimate.id);
//     } catch (error) {
//       console.error("Error moving estimate to orders:", error);
//       alert("Failed to move estimate to orders.");
//     }
//   };

//   return (
//     <div
//       onClick={toggleDetails}
//       className={`border rounded-md p-3 bg-white transition cursor-pointer ${
//         showDetails ? "shadow-lg" : "shadow-sm"
//       }`}
//     >
//       {/* Estimate Header */}
//       <div className="flex justify-between items-center">
//         <h4 className="font-medium">
//           Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
//         </h4>

//         {/* Move to Orders Button */}
//         <button
//           onClick={handleAddToOrders}
//           disabled={cannotMoveToOrders}
//           className={`text-sm px-3 py-1 rounded-md ${
//             isMovedToOrders
//               ? "bg-green-500 text-white cursor-not-allowed"
//               : cannotMoveToOrders
//               ? "bg-gray-400 text-white cursor-not-allowed"
//               : "bg-blue-500 text-white hover:bg-blue-600"
//           }`}
//         >
//           {isMovedToOrders
//             ? "Moved to Orders"
//             : cannotMoveToOrders
//             ? "Can't Move to Orders"
//             : "Move to Orders"}
//         </button>
//       </div>

//       {/* Estimate Details */}
//       {showDetails && <EstimateDetails estimate={estimate} />}
//     </div>
//   );
// };

// export default Estimate;

// import React, { useState } from "react";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import EstimateDetails from "./EstimateDetails";

// const Estimate = ({ estimate, estimateNumber, movedToOrdersEstimateId, setMovedToOrders }) => {
//   const [showDetails, setShowDetails] = useState(false);

//   const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
//   const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;

//   const toggleDetails = () => {
//     setShowDetails((prev) => !prev);
//   };

//   const handleAddToOrders = async (e) => {
//     e.stopPropagation();

//     if (isMovedToOrders || cannotMoveToOrders) return;

//     try {
//       const estimateRef = doc(db, "estimates", estimate.id);
//       await updateDoc(estimateRef, { movedToOrders: true });
//       setMovedToOrders(estimate.id);
//     } catch (error) {
//       console.error("Error moving estimate to orders:", error);
//       alert("Failed to move estimate to orders.");
//     }
//   };

//   return (
//     <div
//       onClick={toggleDetails}
//       className={`border rounded-md p-3 bg-white transition cursor-pointer ${showDetails ? "shadow-lg" : "shadow-sm"}`}
//     >
//       <div className="flex justify-between items-center">
//         <h4 className="font-medium">
//           Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
//         </h4>

//         <button
//           onClick={handleAddToOrders}
//           disabled={cannotMoveToOrders}
//           className={`text-sm px-3 py-1 rounded-md ${
//             isMovedToOrders
//               ? "bg-green-500 text-white cursor-not-allowed"
//               : cannotMoveToOrders
//               ? "bg-gray-400 text-white cursor-not-allowed"
//               : "bg-blue-500 text-white hover:bg-blue-600"
//           }`}
//         >
//           {isMovedToOrders ? "Moved to Orders" : cannotMoveToOrders ? "Can't Move to Orders" : "Move to Orders"}
//         </button>
//       </div>

//       {showDetails && <EstimateDetails estimate={estimate} />}
//     </div>
//   );
// };

// export default Estimate;

import React, { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EstimateDetails from "./EstimateDetails";

const Estimate = ({ estimate, estimateNumber, movedToOrdersEstimateId, setMovedToOrders }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
  const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const handleAddToOrders = async (e) => {
    e.stopPropagation();

    if (isMovedToOrders || cannotMoveToOrders) return;

    try {
      // Add the estimate to the "orders" collection
      await addDoc(collection(db, "orders"), estimate);

      // Update the `movedToOrders` field in the "estimates" document
      const estimateRef = doc(db, "estimates", estimate.id);
      await updateDoc(estimateRef, { movedToOrders: true });

      // Update the local state
      setMovedToOrders(estimate.id);

      console.log(`Successfully moved estimate ${estimate.id} to orders.`);
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
      alert("Failed to move estimate to orders.");
    }
  };

  return (
    <div
      onClick={toggleDetails}
      className={`border rounded-md p-3 bg-white transition cursor-pointer ${
        showDetails ? "shadow-lg" : "shadow-sm"
      }`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium">
          Estimate {estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown Job"}
        </h4>

        {/* Move to Orders Button */}
        <button
          onClick={handleAddToOrders}
          disabled={cannotMoveToOrders}
          className={`text-sm px-3 py-1 rounded-md ${
            isMovedToOrders
              ? "bg-green-500 text-white cursor-not-allowed"
              : cannotMoveToOrders
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isMovedToOrders ? "Moved to Orders" : cannotMoveToOrders ? "Can't Move to Orders" : "Move to Orders"}
        </button>
      </div>

      {/* Details Section */}
      {showDetails && <EstimateDetails estimate={estimate} />}
    </div>
  );
};

export default Estimate;
