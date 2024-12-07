import React, { useState } from "react";
import { collection, addDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EstimateDetails from "./EstimateDetails";

const Estimate = ({
  estimate,
  estimateNumber,
  movedToOrdersEstimateId,
  setMovedToOrders,
  estimates,
  setEstimatesData,
  groupKey,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
  const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;
  const isCanceled = estimate.isCanceled;

  const toggleDetails = () => setShowDetails((prev) => !prev);

  const handleAddToOrders = async (e) => {
    e.stopPropagation();

    if (isMovedToOrders || cannotMoveToOrders || isCanceled) return;

    try {
      // Add the selected estimate to the "orders" collection
      await addDoc(collection(db, "orders"), estimate);

      // Update all estimates in the group
      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { movedToOrders: est.id === estimate.id });
      });
      await batch.commit();

      // Immediately update local state
      const updatedEstimates = estimates.map((est) => ({
        ...est,
        movedToOrders: est.id === estimate.id,
      }));
      setEstimatesData((prevData) => ({
        ...prevData,
        [groupKey]: updatedEstimates,
      }));

      setMovedToOrders(estimate.id);
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
      alert("Failed to move estimate to orders.");
    }
  };

  const handleCancelOrder = async (e) => {
    e.stopPropagation();

    if (isMovedToOrders || isCanceled) return;

    try {
      // Save the groupKey to local storage
      localStorage.setItem("openGroupKey", groupKey);

      // Batch update all estimates in Firestore
      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { isCanceled: true });
      });
      await batch.commit();

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error canceling estimates:", error);
      alert("Failed to cancel the order.");
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

        <div className="space-x-2">
          {/* Move to Orders Button */}
          {!isCanceled && (
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
              {isMovedToOrders
                ? "Moved to Orders"
                : cannotMoveToOrders
                ? "Can't Move to Orders"
                : "Move to Orders"}
            </button>
          )}

          {/* Cancel Order Button */}
          {!isMovedToOrders && !isCanceled && !movedToOrdersEstimateId && (
            <button
              onClick={handleCancelOrder}
              className="text-sm px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Cancel Order
            </button>
          )}

          {/* Orders Canceled Button */}
          {isCanceled && (
            <button
              disabled
              className="text-sm px-3 py-1 rounded-md bg-gray-400 text-white cursor-not-allowed"
            >
              Orders Canceled
            </button>
          )}
        </div>
      </div>

      {/* Details Section */}
      {showDetails && <EstimateDetails estimate={estimate} />}
    </div>
  );
};

export default Estimate;
