// import React, { useEffect, useState } from "react";

// const DigiDetails = ({ state, dispatch, onNext, onPrevious }) => {
//   const { isDigiUsed = false, digiDie = "" } = state.digiDetails || {};
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     dispatch({
//       type: "UPDATE_DIGI_DETAILS",
//       payload: { [name]: type === "checkbox" ? checked : value },
//     });
//   };

//   const validateFields = () => {
//     const validationErrors = {};
//     if (isDigiUsed && !digiDie) {
//       validationErrors.digiDie = "Digi Die is required when Digi is being used.";
//     }
//     setErrors(validationErrors);
//     return Object.keys(validationErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateFields()) {
//       onNext();
//     }
//   };

//   useEffect(() => {
//     if (!isDigiUsed) {
//       // Clear digiDie field when Digi is not used
//       dispatch({
//         type: "UPDATE_DIGI_DETAILS",
//         payload: { digiDie: "" },
//       });
//       setErrors({});
//     }
//   }, [isDigiUsed, dispatch]);

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Digi Details</h2>
//       {/* Checkbox for Digi Usage */}
//       <label className="font-semibold flex items-center">
//         <input
//           type="checkbox"
//           name="isDigiUsed"
//           checked={isDigiUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is Digi being used?
//       </label>
//       {/* Conditional Dropdown for Digi Die */}
//       {isDigiUsed && (
//         <div>
//           <label className="block mb-2 font-medium">Select Digi Die:</label>
//           <select
//             name="digiDie"
//             value={digiDie}
//             onChange={handleChange}
//             className={`border rounded-md p-2 w-full ${
//               errors.digiDie ? "border-red-500" : ""
//             }`}
//           >
//             <option value="">Select Digi Die</option>
//             <option value="12x18">12x18</option>
//             <option value="13x19">13x19</option>
//           </select>
//           {errors.digiDie && (
//             <p className="text-red-500 text-sm mt-1">{errors.digiDie}</p>
//           )}
//         </div>
//       )}
//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded-md"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </div>
//     </form>
//   );
// };

// export default DigiDetails;

import React, { useEffect, useState } from "react";

const DigiDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const { isDigiUsed = false, digiDie = "", digiDimensions = {} } = state.digiDetails || {};
  const [errors, setErrors] = useState({});

  const DIGI_DIE_OPTIONS = {
    "12x18": { length: "12", breadth: "18" },
    "13x19": { length: "13", breadth: "19" },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "digiDie") {
      const selectedDimensions = DIGI_DIE_OPTIONS[value] || {};
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: {
          digiDie: value,
          digiDimensions: selectedDimensions,
        },
      });
    } else {
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: { [name]: type === "checkbox" ? checked : value },
      });
    }
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isDigiUsed && !digiDie) {
      validationErrors.digiDie = "Digi Die is required when Digi is being used.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  useEffect(() => {
    if (!isDigiUsed) {
      // Clear digiDie and digiDimensions fields when Digi is not used
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: { digiDie: "", digiDimensions: {} },
      });
      setErrors({});
    }
  }, [isDigiUsed, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Digi Details</h2>
      {/* Checkbox for Digi Usage */}
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isDigiUsed"
          checked={isDigiUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is Digi being used?
      </label>
      {/* Conditional Dropdown for Digi Die */}
      {isDigiUsed && (
        <div>
          <label className="block mb-2 font-medium">Select Digi Die:</label>
          <select
            name="digiDie"
            value={digiDie}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${
              errors.digiDie ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Digi Die</option>
            {Object.keys(DIGI_DIE_OPTIONS).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.digiDie && (
            <p className="text-red-500 text-sm mt-1">{errors.digiDie}</p>
          )}
        </div>
      )}
      {/* Display Dimensions if Digi Die is selected */}
      {isDigiUsed && digiDie && (
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Dimensions:</strong>
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-100 p-2 rounded">
              <span className="font-medium">Length:</span> {digiDimensions.length || "N/A"}
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <span className="font-medium">Breadth:</span> {digiDimensions.breadth || "N/A"}
            </div>
          </div>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default DigiDetails;
