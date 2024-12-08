import React from "react";

const OrderProgressBar = ({ currentStage, onStageClick }) => {
  const stages = [
    "Not started yet",
    "Design",
    "Positives",
    "Printing",
    "Quality Check",
    "Delivery",
  ];

  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Order Progress</h3>

      {/* Progress Bar */}
      <div className="flex items-center">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            {/* Checkpoint */}
            <div
              onClick={() => onStageClick(stage)} // Trigger stage click
              className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition ${
                index <= currentStageIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {index + 1}
            </div>
            {/* Line */}
            {index < stages.length - 1 && (
              <div
                className={`h-1 flex-1 transition ${
                  index < currentStageIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stage Labels */}
      <div className="flex justify-between text-sm text-gray-600">
        {stages.map((stage) => (
          <span key={stage}>{stage}</span>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;
