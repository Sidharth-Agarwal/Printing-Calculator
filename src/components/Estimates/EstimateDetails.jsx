import React from "react";
import SectionWrapper from "./SectionWrapper";

const EstimateDetails = ({ estimate }) => {
  if (!estimate) return <p>No details available.</p>;

  const { jobDetails, dieDetails, lpDetails, fsDetails, embDetails } = estimate;

  return (
    <div>
      <SectionWrapper title="Order and Paper">
        <p>
          <strong>Job Type:</strong> {jobDetails?.jobType || "N/A"}
        </p>
        <p>
          <strong>Quantity:</strong> {jobDetails?.quantity || "N/A"}
        </p>
        <p>
          <strong>Delivery Date:</strong> {estimate.deliveryDate || "N/A"}
        </p>
      </SectionWrapper>

      {lpDetails?.isLPUsed && (
        <SectionWrapper title="LP Details">
          <p>
            <strong>No. of Colors:</strong> {lpDetails.noOfColors || "N/A"}
          </p>
          {lpDetails.colorDetails?.map((color, index) => (
            <div key={index}>
              <p>
                <strong>Color {index + 1} Ink Type:</strong> {color.inkType || "N/A"}
              </p>
            </div>
          ))}
        </SectionWrapper>
      )}

      {fsDetails?.isFSUsed && (
        <SectionWrapper title="FS Details">
          <p>
            <strong>FS Type:</strong> {fsDetails.fsType || "N/A"}
          </p>
          {fsDetails.foilDetails?.map((foil, index) => (
            <div key={index}>
              <p>
                <strong>Foil {index + 1} Type:</strong> {foil.foilType || "N/A"}
              </p>
            </div>
          ))}
        </SectionWrapper>
      )}

      {/* Repeat for other sections like embDetails and dieDetails */}
    </div>
  );
};

export default EstimateDetails;
