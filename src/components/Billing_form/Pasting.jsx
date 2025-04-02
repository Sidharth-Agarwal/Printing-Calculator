// import React, { useState } from "react";

// const Pasting = ({ state, dispatch, onPrevious, onNext, singlePageMode = false }) => {
//   const { isPastingUsed = false, pastingType = "" } = state.pasting || {};
//   const [errors, setErrors] = useState({});

//   const handleChange = (field, value) => {
//     dispatch({
//       type: "UPDATE_PASTING",
//       payload: { [field]: value },
//     });

//     // Clear errors on input change
//     setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
//   };

//   const validateFields = () => {
//     const validationErrors = {};
//     if (isPastingUsed && !pastingType) {
//       validationErrors.pastingType = "Please select a Pasting Type.";
//     }
//     setErrors(validationErrors);
//     return Object.keys(validationErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!singlePageMode && validateFields()) {
//       onNext();
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {!singlePageMode && (
//         <h2 className="text-lg font-bold text-gray-700 mb-4">PASTING</h2>
//       )}

//       {/* Toggle for "Is Pasting being used?" */}
//       <div className="flex items-center space-x-3 cursor-pointer">
//         <label
//           className="flex items-center space-x-3"
//           onClick={() => handleChange("isPastingUsed", !isPastingUsed)}
//         >
//           {/* Circular Toggle */}
//           <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//             {isPastingUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
//           </div>
//           <span className="text-gray-700 font-semibold text-sm">Use Pasting Component?</span>
//         </label>
//       </div>

//       {/* Conditional Pasting Type Dropdown */}
//       {isPastingUsed && (
//         <div className="text-sm max-w-md">
//           <label className="block font-medium mb-2">Pasting Type:</label>
//           <select
//             value={pastingType}
//             onChange={(e) => handleChange("pastingType", e.target.value)}
//             className={`border rounded-md p-2 w-full ${
//               errors.pastingType ? "border-red-500" : ""
//             }`}
//           >
//             <option value="">Select Pasting Type</option>
//             <option value="DST">DST - Double Sided Tape</option>
//             <option value="Fold">Fold</option>
//             <option value="Paste">Paste</option>
//             <option value="Fold & Paste">Fold & Paste</option>
//             <option value="Sandwich">Sandwich</option>
//           </select>
//           {errors.pastingType && <p className="text-red-500 text-sm mt-1">{errors.pastingType}</p>}
//         </div>
//       )}

//       {/* Navigation Buttons - Only show in step-by-step mode */}
//       {!singlePageMode && (
//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={onPrevious}
//             className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
//           >
//             Previous
//           </button>
//           <button
//             type="submit"
//             className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </form>
//   );
// };

// export default Pasting;

import React, { useState } from "react";

const Pasting = ({ state, dispatch, onPrevious, onNext, singlePageMode = false }) => {
  const { isPastingUsed = false, pastingType = "" } = state.pasting || {};
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    dispatch({
      type: "UPDATE_PASTING",
      payload: { [field]: value },
    });

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isPastingUsed && !pastingType) {
      validationErrors.pastingType = "Please select a Pasting Type.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  // If Pasting is not used, don't render any content
  if (!isPastingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-sm max-w-md">
        <label className="block font-medium mb-2">Pasting Type:</label>
        <select
          value={pastingType}
          onChange={(e) => handleChange("pastingType", e.target.value)}
          className={`border rounded-md p-2 w-full ${
            errors.pastingType ? "border-red-500" : ""
          }`}
        >
          <option value="">Select Pasting Type</option>
          <option value="DST">DST - Double Sided Tape</option>
          <option value="Fold">Fold</option>
          <option value="Paste">Paste</option>
          <option value="Fold & Paste">Fold & Paste</option>
          <option value="Sandwich">Sandwich</option>
        </select>
        {errors.pastingType && <p className="text-red-500 text-sm mt-1">{errors.pastingType}</p>}
      </div>

      {/* Navigation Buttons - Only show in step-by-step mode */}
      {!singlePageMode && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
          >
            Previous
          </button>
          <button
            type="submit"
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Next
          </button>
        </div>
      )}
    </form>
  );
};

export default Pasting;