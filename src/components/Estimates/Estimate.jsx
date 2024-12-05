import React, { useState } from "react";
import EstimateDetails from "./EstimateDetails";

const Estimate = ({ estimate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">
          Estimate: {estimate.jobDetails?.jobType || "Unknown Job"}
        </h4>
        <button
          onClick={toggleDetails}
          className="text-blue-500 text-sm hover:underline"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>
      </div>
      {showDetails && <EstimateDetails estimate={estimate} />}
    </div>
  );
};

export default Estimate;
