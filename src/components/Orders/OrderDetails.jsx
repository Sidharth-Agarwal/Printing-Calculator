import React from "react";
import SectionWrapper from "./SectionWrapper";

const OrderDetails = ({ order }) => {
  const { jobDetails, dieDetails } = order;

  return (
    <div className="space-y-6">
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
        </SectionWrapper>
      )}
    </div>
  );
};

export default OrderDetails;
