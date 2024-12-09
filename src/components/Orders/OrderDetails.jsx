// import React from "react";
// import SectionWrapper from "./SectionWrapper";

// const OrderDetails = ({ order }) => {
//   const { jobDetails, dieDetails } = order;

//   return (
//     <div className="space-y-6">
//       {/* Order and Paper Section */}
//       <SectionWrapper title="Order and Paper">
//         <p>
//           <strong>Job Type:</strong> {jobDetails?.jobType || "N/A"}
//         </p>
//         <p>
//           <strong>Quantity:</strong> {jobDetails?.quantity || "N/A"}
//         </p>
//         <p>
//           <strong>Delivery Date:</strong> {order.deliveryDate || "N/A"}
//         </p>
//         <p>
//           <strong>Paper Name:</strong> {jobDetails?.paperName || "N/A"}
//         </p>
//         <p>
//           <strong>Paper Provided:</strong> {jobDetails?.paperProvided || "N/A"}
//         </p>
//       </SectionWrapper>

//       {/* Die Details Section */}
//       {dieDetails && (
//         <SectionWrapper title="Die Details">
//           <p>
//             <strong>Die Selection:</strong> {dieDetails.dieSelection || "N/A"}
//           </p>
//           <p>
//             <strong>Die Code:</strong> {dieDetails.dieCode || "N/A"}
//           </p>
//           <p>
//             <strong>Die Size:</strong> {dieDetails.dieSize?.length} x{" "}
//             {dieDetails.dieSize?.breadth || "N/A"}
//           </p>
//         </SectionWrapper>
//       )}
//     </div>
//   );
// };

// export default OrderDetails;

import React, { useRef } from "react";
import SectionWrapper from "./SectionWrapper";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const OrderDetails = ({ order }) => {
  if (!order) return <p className="text-gray-500">No details available.</p>;

  const {
    jobDetails,
    dieDetails,
    lpDetails,
    fsDetails,
    embDetails,
    digiDetails,
    dieCuttingDetails,
  } = order;

  const pdfRef = useRef(); // Reference to the PDF content container

  const exportToPDF = async () => {
    const input = pdfRef.current;

    try {
      // Convert the content to a canvas
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Create a jsPDF instance
      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      pdf.save(`${order.clientName}_${order.projectName}_OrderDetails.pdf`);
      alert("PDF exported successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to export PDF.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Details Section (PDF content) */}
      <div ref={pdfRef} className="border border-gray-300 rounded-lg p-4">
        {/* Order and Paper Section */}
        <SectionWrapper title="Order and Paper">
          <p>
            <strong>Job Type:</strong> {jobDetails?.jobType || "N/A"}
          </p>
          <p>
            <strong>Quantity:</strong> {jobDetails?.quantity || "N/A"}
          </p>
          <p>
            <strong>Delivery Date:</strong> {order.deliveryDate || "N/A"}
          </p>
          <p>
            <strong>Paper Name:</strong> {jobDetails?.paperName || "N/A"}
          </p>
          <p>
            <strong>Paper Provided:</strong> {jobDetails?.paperProvided || "N/A"}
          </p>
        </SectionWrapper>

        {/* Die Details Section */}
        {dieDetails && (
          <SectionWrapper title="Die Details">
            <p>
              <strong>Die Selection:</strong> {dieDetails.dieSelection || "N/A"}
            </p>
            <p>
              <strong>Die Code:</strong> {dieDetails.dieCode || "N/A"}
            </p>
            <p>
              <strong>Die Size:</strong> {dieDetails.dieSize?.length} x{" "}
              {dieDetails.dieSize?.breadth || "N/A"}
            </p>
            <div>
              <strong>Die Image:</strong>
              <img
                src={dieDetails.image || "https://via.placeholder.com/200"}
                alt="Die"
                className="w-48 h-48 object-contain rounded-md border mt-2"
              />
            </div>
          </SectionWrapper>
        )}

        {/* LP Details Section */}
        {lpDetails?.isLPUsed && (
          <SectionWrapper title="LP Details">
            <p>
              <strong>No. of Colors:</strong> {lpDetails.noOfColors || "N/A"}
            </p>
            {lpDetails.colorDetails?.map((color, index) => (
              <div key={index}>
                <p>
                  <strong>Color {index + 1} Ink Type:</strong>{" "}
                  {color.inkType || "N/A"}
                </p>
                <p>
                  <strong>Plate Type:</strong> {color.plateType || "N/A"}
                </p>
                <p>
                  <strong>MR Type:</strong> {color.mrType || "N/A"}
                </p>
              </div>
            ))}
          </SectionWrapper>
        )}

        {/* FS Details Section */}
        {fsDetails?.isFSUsed && (
          <SectionWrapper title="FS Details">
            <p>
              <strong>FS Type:</strong> {fsDetails.fsType || "N/A"}
            </p>
            {fsDetails.foilDetails?.map((foil, index) => (
              <div key={index}>
                <p>
                  <strong>Foil {index + 1} Type:</strong>{" "}
                  {foil.foilType || "N/A"}
                </p>
                <p>
                  <strong>Block Type:</strong> {foil.blockType || "N/A"}
                </p>
                <p>
                  <strong>MR Type:</strong> {foil.mrType || "N/A"}
                </p>
              </div>
            ))}
          </SectionWrapper>
        )}

        {/* EMB Details Section */}
        {embDetails?.isEMBUsed && (
          <SectionWrapper title="EMB Details">
            <p>
              <strong>Plate Size:</strong> {embDetails.plateSizeType || "N/A"}
            </p>
            {embDetails.plateSizeType === "Manual" && (
              <p>
                <strong>Plate Dimensions:</strong>{" "}
                {embDetails.plateDimensions?.length} x{" "}
                {embDetails.plateDimensions?.breadth || "N/A"}
              </p>
            )}
            <p>
              <strong>Plate Type Male:</strong>{" "}
              {embDetails.plateTypeMale || "N/A"}
            </p>
            <p>
              <strong>Plate Type Female:</strong>{" "}
              {embDetails.plateTypeFemale || "N/A"}
            </p>
          </SectionWrapper>
        )}

        {/* Die Cutting Details Section */}
        {dieCuttingDetails?.isDieCuttingUsed && (
          <SectionWrapper title="Die Cutting">
            <p>
              <strong>Difficulty:</strong> {dieCuttingDetails.difficulty || "N/A"}
            </p>
            <p>
              <strong>PDC:</strong> {dieCuttingDetails.pdc || "N/A"}
            </p>
            {dieCuttingDetails.pdc === "Yes" && (
              <p>
                <strong>DC MR:</strong> {dieCuttingDetails.dcMR || "N/A"}
              </p>
            )}
          </SectionWrapper>
        )}

        {/* Digi Details Section */}
        {digiDetails?.isDigiUsed && (
          <SectionWrapper title="Digi Details">
            <p>
              <strong>Digi Die:</strong> {digiDetails.digiDie || "N/A"}
            </p>
          </SectionWrapper>
        )}
      </div>

      {/* Export to PDF Button */}
      <div className="mt-4">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Export Order Details
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
