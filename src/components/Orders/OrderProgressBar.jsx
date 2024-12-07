// import React from "react";

// const OrderProgressBar = ({ currentStage }) => {
//   const stages = [
//     "Not started yet",
//     "Design",
//     "Positives",
//     "Printing",
//     "Quality Check",
//     "Delivery",
//   ];

//   // Calculate percentage based on the current stage
//   const progressPercentage = ((currentStage - 1) / (stages.length - 1)) * 100;

//   return (
//     <div className="p-4 bg-white rounded-md shadow-md space-y-4">
//       <h3 className="text-lg font-bold">Order Progress</h3>
      
//       {/* Progress Bar */}
//       <div className="relative w-full h-4 bg-gray-300 rounded-full">
//         <div
//           className="absolute h-4 bg-blue-500 rounded-full"
//           style={{ width: `${progressPercentage}%` }}
//         ></div>
//       </div>
      
//       {/* Stages */}
//       <div className="flex justify-between text-sm text-gray-600">
//         {stages.map((stage, index) => (
//           <span
//             key={index}
//             className={index + 1 <= currentStage ? "font-bold text-gray-800" : ""}
//           >
//             {stage}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OrderProgressBar;

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

  return (
    <div className="p-4 bg-white rounded-md shadow-md space-y-4">
      <h3 className="text-lg font-bold">Order Progress</h3>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-300 rounded-full">
        <div
          className="absolute h-4 bg-blue-500 rounded-full transition-all"
          style={{
            width: `${((currentStage - 1) / (stages.length - 1)) * 100}%`,
          }}
        ></div>
      </div>

      {/* Stages */}
      <div className="flex justify-between text-sm text-gray-600">
        {stages.map((stage, index) => (
          <span
            key={index}
            className={`cursor-pointer ${
              index + 1 <= currentStage ? "font-bold text-gray-800" : "text-gray-600"
            }`}
            onClick={() => onStageClick(index + 1)}
          >
            {stage}
          </span>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;
