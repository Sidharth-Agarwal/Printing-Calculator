import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EstimateDetails from "./EstimateDetails";

const Estimate = ({ estimate, estimateNumber }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isMovedToOrders, setIsMovedToOrders] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const handleAddToOrders = async () => {
    try {
      // Add the estimate to the "orders" collection
      await addDoc(collection(db, "orders"), estimate);

      // Update the button state
      setIsMovedToOrders(true);
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
      alert("Failed to move estimate to orders.");
    }
  };

  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="flex justify-between items-center">
        {/* Display Estimate Version */}
        <h4 className="font-medium">
          Estimate {estimateNumber}: {estimate.jobDetails?.jobType || "Unknown Job"}
        </h4>

        <div className="space-x-4">
          {/* Show/Hide Details Button */}
          <button
            onClick={toggleDetails}
            className="text-blue-500 text-sm hover:underline"
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>

          {/* Add to Orders Button */}
          <button
            onClick={handleAddToOrders}
            disabled={isMovedToOrders}
            className={`text-sm px-3 py-1 rounded-md ${
              isMovedToOrders
                ? "bg-green-500 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isMovedToOrders ? "Moved to Orders" : "Move to Orders"}
          </button>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && <EstimateDetails estimate={estimate} />}
    </div>
  );
};

export default Estimate;