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
      await addDoc(collection(db, "orders"), {
        ...estimate,
        stage: "Not started yet",
      });

      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { movedToOrders: est.id === estimate.id });
      });
      await batch.commit();

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
      localStorage.setItem("openGroupKey", groupKey);

      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { isCanceled: true });
      });
      await batch.commit();

      const updatedEstimates = estimates.map((est) => ({
        ...est,
        isCanceled: true,
      }));
      setEstimatesData((prevData) => ({
        ...prevData,
        [groupKey]: updatedEstimates,
      }));

      window.location.reload();
    } catch (error) {
      console.error("Error canceling estimates:", error);
      alert("Failed to cancel the order.");
    }
  };

  return (
    <div
      onClick={toggleDetails}
      className={`border rounded-md p-2 bg-white transition cursor-pointer shadow-sm ${
        showDetails ? "shadow-lg" : ""
      }`}
      style={{
        flex: "1 1 calc(25% - 10px)", // Makes it responsive and ensures 4 per row
        minWidth: "200px",
        maxWidth: "220px",
        margin: "5px",
      }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-medium text-sm">
          Estimate {estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown Job"}
        </h4>
      </div>

      {/* Buttons Section */}
      <div className="space-y-1">
        {!isCanceled && (
          <button
            onClick={handleAddToOrders}
            disabled={cannotMoveToOrders}
            className={`text-xs w-full px-2 py-1 rounded-md ${
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

        {!isMovedToOrders && !isCanceled && !movedToOrdersEstimateId && (
          <button
            onClick={handleCancelOrder}
            className="text-xs w-full px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Cancel Order
          </button>
        )}

        {isCanceled && (
          <button
            disabled
            className="text-xs w-full px-2 py-1 rounded-md bg-gray-400 text-white cursor-not-allowed"
          >
            Orders Canceled
          </button>
        )}
      </div>

      {/* Details Section */}
      {showDetails && <EstimateDetails estimate={estimate} />}
    </div>
  );
};

export default Estimate;
