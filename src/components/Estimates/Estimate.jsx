import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EstimateDetailsModal from "./EstimateDetailsModal";

const Estimate = ({
  estimate,
  estimateNumber,
  movedToOrdersEstimateId,
  setMovedToOrders,
  estimates = [], 
  setEstimatesData,
  groupKey,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
  const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;
  const isCanceled = estimate.isCanceled;

  const handleAddToOrders = async (e) => {
    e.stopPropagation();

    if (isMovedToOrders || cannotMoveToOrders || isCanceled) return;

    try {
      // Add to orders collection
      await addDoc(collection(db, "orders"), {
        ...estimate,
        stage: "Not started yet",
      });

      // Update all estimates in the group
      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { movedToOrders: est.id === estimate.id });
      });
      await batch.commit();

      // Update local state
      const updatedEstimates = estimates.map((est) => ({
        ...est,
        movedToOrders: est.id === estimate.id,
      }));

      setEstimatesData((prevData) => ({
        ...prevData,
        [groupKey]: updatedEstimates,
      }));

      setMovedToOrders(estimate.id);
      
      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
    }
  };

  const handleCancelOrder = async (e) => {
    e.stopPropagation();

    if (isMovedToOrders || isCanceled) return;

    try {
      // Update all estimates in the group
      const batch = writeBatch(db);
      estimates.forEach((est) => {
        const estimateRef = doc(db, "estimates", est.id);
        batch.update(estimateRef, { isCanceled: true });
      });
      await batch.commit();

      // Update local state
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

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await onDownloadPdf(); // Your PDF generation logic
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="border rounded-md p-2 bg-white transition cursor-pointer shadow-sm hover:shadow-md"
        style={{
          flex: "1 1 calc(25% - 10px)",
          minWidth: "200px",
          maxWidth: "250px",
        }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-normal text-sm">
            Estimate {estimateNumber}: {estimate?.jobDetails?.jobType || "Unknown Job"}
          </h4>
        </div>

        {/* Buttons Section */}
        <div className="space-y-1">
          {!isCanceled && (
            <button
              onClick={handleAddToOrders}
              disabled={cannotMoveToOrders}
              className={`text-xs w-full px-2 py-1 rounded-md shadow-sm ${
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
      </div>

      {/* Estimate Details Modal */}
      {isModalOpen && (
        <EstimateDetailsModal
          estimate={estimate}
          onClose={() => setIsModalOpen(false)}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
          estimates={estimates}
          setEstimatesData={setEstimatesData}
          groupKey={groupKey}
        />
      )}
    </>
  );
};

export default Estimate;