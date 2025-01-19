import React, { useEffect } from "react";
import Estimate from "./Estimate";

const GroupDropdown = ({
  clientName,
  projectName,
  estimates,
  ordersData,
  setOrdersData,
  setEstimatesData,
  isOpen,
  onToggle
}) => {
  const groupKey = `${clientName}-${projectName}`;
  const movedToOrdersEstimateId = ordersData[groupKey] || null;
  const firstEstimate = estimates[0] || {};

  // Determine the group status
  const groupStatus = (() => {
    if (estimates.some((est) => est.isCanceled)) return "Cancelled";
    if (movedToOrdersEstimateId) return "Order Confirmed";
    return "Pending";
  })();

  // Set background color based on status
  const groupColor = (() => {
    switch (groupStatus) {
      case "Cancelled":
        return "bg-red-100 hover:bg-red-200";
      case "Order Confirmed":
        return "bg-green-100 hover:bg-green-200";
      case "Pending":
      default:
        return "bg-yellow-100 hover:bg-yellow-200";
    }
  })();

  // Restore dropdown state from local storage on mount
  useEffect(() => {
    const savedGroupKey = localStorage.getItem("openGroupKey");
    if (savedGroupKey === groupKey) {
      onToggle();
      localStorage.removeItem("openGroupKey");
    }
  }, [groupKey, onToggle]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not Specified";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className={`border rounded-lg shadow-md ${groupColor} relative`}>
      {/* Status Badge */}
      <div
        className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-semibold ${
          groupStatus === "Cancelled"
            ? "bg-red-500 text-white"
            : groupStatus === "Order Confirmed"
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-white"
        }`}
      >
        {groupStatus}
      </div>

      {/* Group Header */}
      <div
        onClick={onToggle}
        className="cursor-pointer px-4 py-3 rounded-t-md transition relative"
      >
        <div className="space-y-1">
          {/* Client and Project Info */}
          <h3 className="text-lg font-bold text-gray-800">{clientName}</h3>
          <p className="text-sm font-semibold text-gray-700">{projectName}</p>
          
          {/* Job Details */}
          <p className="text-xs text-gray-500">
            {firstEstimate?.jobDetails?.jobType || "N/A"} · {firstEstimate?.jobDetails?.quantity || "0"} items
          </p>
          
          {/* Delivery Date */}
          <p className="text-xs text-gray-600">
            Expected Delivery: {formatDate(firstEstimate?.deliveryDate)}
          </p>
        </div>

        {/* Dropdown Arrow Indicator - Now at bottom right */}
        <div className={`absolute bottom-2 right-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className="absolute z-10 left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-lg"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {/* Render Estimate Cards */}
            {estimates.map((estimate, index) => (
              <Estimate
                key={estimate.id}
                estimate={estimate}
                estimateNumber={index + 1}
                movedToOrdersEstimateId={movedToOrdersEstimateId}
                setMovedToOrders={(id) =>
                  setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
                }
                estimates={estimates}
                setEstimatesData={setEstimatesData}
                groupKey={groupKey}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;