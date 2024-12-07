// import React from "react";
// import SectionWrapper from "./SectionWrapper";
// import OrderProgressBar from "./OrderProgressBar";

// const OrderDetails = ({ order }) => {
//   if (!order) return <p className="text-gray-500">No details available.</p>;

//   const {
//     jobDetails,
//     dieDetails,
//     lpDetails,
//     fsDetails,
//     embDetails,
//     digiDetails,
//     dieCuttingDetails,
//     progressStage,
//   } = order;

//   return (
//     <div className="space-y-6">
//       {/* Progress Bar */}
//       <SectionWrapper title="Order Progress">
//         <OrderProgressBar currentStage={progressStage || 0} />
//       </SectionWrapper>

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
//           <div>
//             <strong>Die Image:</strong>
//             <img
//               src={dieDetails.image || "https://via.placeholder.com/200"}
//               alt="Die"
//               className="w-48 h-48 object-contain rounded-md border mt-2"
//             />
//           </div>
//         </SectionWrapper>
//       )}

//       {/* Additional Sections (LP, FS, EMB, etc.) */}
//       {/* Reuse the structure from EstimateDetails for LPDetails, FSDetails, etc. */}
//     </div>
//   );
// };

// export default OrderDetails;

import React from "react";
import SectionWrapper from "./SectionWrapper";
import OrderProgressBar from "./OrderProgressBar";

const OrderDetails = ({ order, onProgressUpdate }) => {
  if (!order) return <p className="text-gray-500">No details available.</p>;

  const {
    jobDetails,
    dieDetails,
    lpDetails,
    fsDetails,
    embDetails,
    digiDetails,
    dieCuttingDetails,
    progressStage,
  } = order;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <SectionWrapper title="Order Progress">
        <OrderProgressBar
          currentStage={progressStage || 0}
          onStageClick={onProgressUpdate}
        />
      </SectionWrapper>

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
    </div>
  );
};

export default OrderDetails;
