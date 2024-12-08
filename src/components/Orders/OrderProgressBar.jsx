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
      <div className="relative flex items-center justify-between">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              {/* Checkpoint */}
              <div
                onClick={() => onStageClick(stage)}
                className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition ${
                  index <= currentStageIndex
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {index + 1}
              </div>
              {/* Label */}
              <span className="mt-2 text-sm text-center w-20">
                {stage}
              </span>
            </div>

            {/* Connector */}
            {index < stages.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStageIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;
