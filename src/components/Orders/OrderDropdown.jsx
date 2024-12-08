import React, { useState } from "react";
import OrderDetails from "./OrderDetails";
import OrderProgressBar from "./OrderProgressBar";

const statusColors = {
  "Not started yet": "bg-gray-100 hover:bg-gray-200",
  Design: "bg-yellow-100 hover:bg-yellow-200",
  Positives: "bg-orange-100 hover:bg-orange-200",
  Printing: "bg-blue-100 hover:bg-blue-200",
  "Quality Check": "bg-green-100 hover:bg-green-200",
  Delivery: "bg-green-300 hover:bg-green-400",
};

const OrderDropdown = ({ order, onOrderUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(order.stage || "Not started yet");

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleProgressUpdate = (newStage) => {
    setCurrentStage(newStage); // Update local state
    onOrderUpdate({ stage: newStage }); // Update Firebase through parent
  };

  const dropdownColor = statusColors[currentStage] || "bg-gray-100";

  return (
    <div className={`border rounded-lg shadow-md ${dropdownColor} relative`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 text-sm px-3 py-1 rounded-md">
        {currentStage}
      </div>

      {/* Dropdown Header */}
      <div
        onClick={toggleDropdown}
        className="cursor-pointer px-4 py-3 rounded-t-md flex justify-between items-center transition"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-800">{order.clientName}</h3>
          <p className="text-lg font-semibold text-gray-700">{order.projectName}</p>
          <p className="text-sm text-gray-500">
            {order.jobDetails?.jobType || "N/A"} · {order.jobDetails?.quantity || "0"} items
          </p>
          <p className="text-base text-gray-600">
            Expected Delivery:{" "}
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
              : "Not Specified"}
          </p>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-4 space-y-4 bg-gray-50">
          <OrderProgressBar
            currentStage={currentStage}
            onStageClick={(newStage) => handleProgressUpdate(newStage)}
          />
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  );
};

export default OrderDropdown;
