import React, { useState } from "react";
import { collection, addDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EstimateDetailsModal from "./EstimateDetailsModal";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Estimate = ({
  estimate,
  estimateNumber,
  movedToOrdersEstimateId,
  setMovedToOrders,
  estimates,
  setEstimatesData,
  groupKey,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isMovedToOrders = movedToOrdersEstimateId === estimate.id;
  const cannotMoveToOrders = !!movedToOrdersEstimateId && movedToOrdersEstimateId !== estimate.id;
  const isCanceled = estimate.isCanceled;

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
    } catch (error) {
      console.error("Error canceling estimates:", error);
      alert("Failed to cancel the order.");
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Wait for a brief moment to ensure modal content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const modalContent = document.querySelector('.overflow-y-auto');
      if (!modalContent) {
        throw new Error('Modal content not found');
      }

      // Temporarily modify the modal content for better PDF capture
      const originalOverflow = modalContent.style.overflow;
      const originalHeight = modalContent.style.height;
      modalContent.style.overflow = 'visible';
      modalContent.style.height = 'auto';

      const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: modalContent.scrollWidth,
        windowHeight: modalContent.scrollHeight
      });

      // Restore original modal styles
      modalContent.style.overflow = originalOverflow;
      modalContent.style.height = originalHeight;

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Handle multi-page if content is longer than A4
      let heightLeft = imgHeight;
      let position = 0;
      let pageData = imgData;

      pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename using client name and estimate number
      const clientName = estimate?.clientName || 'Unknown';
      const filename = `${clientName} Estimate-${estimateNumber}.pdf`;
      
      pdf.save(filename);
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
        className={`border rounded-md p-2 bg-white transition cursor-pointer shadow-sm`}
        style={{
          flex: "1 1 calc(25% - 10px)",
          minWidth: "200px",
          maxWidth: "250px",
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
      </div>

      {/* Modal for Estimate Details */}
      {isModalOpen && (
        <EstimateDetailsModal
          estimate={estimate}
          onClose={() => setIsModalOpen(false)}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
        />
      )}
    </>
  );
};

export default Estimate;