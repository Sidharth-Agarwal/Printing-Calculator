import React, { useState } from "react";

const Pasting = ({ state, dispatch, onPrevious, onNext }) => {
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
    if (validateFields()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Pasting</h2>

      {/* Toggle for "Is Pasting being used?" */}
      <div className="flex items-center space-x-3 cursor-pointer">
        <label
          className="flex items-center space-x-3"
          onClick={() => handleChange("isPastingUsed", !isPastingUsed)}
        >
          {/* Circular Toggle */}
          <div className="w-6 h-6 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
            {isPastingUsed && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
          </div>
          <span className="text-gray-700 font-semibold">Use Pasting Component?</span>
        </label>
      </div>

      {/* Conditional Pasting Type Dropdown */}
      {isPastingUsed && (
        <div>
          <label className="block font-medium mb-2">Pasting Type:</label>
          <select
            value={pastingType}
            onChange={(e) => handleChange("pastingType", e.target.value)}
            className={`border rounded-md p-2 w-full ${
              errors.pastingType ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Pasting Type</option>
            <option value="DST">DST</option>
            <option value="Fold">Fold</option>
            <option value="Paste">Paste</option>
            <option value="Fold & Paste">Fold & Paste</option>
            <option value="Sandwich">Sandwich</option>
          </select>
          {errors.pastingType && <p className="text-red-500 text-sm mt-1">{errors.pastingType}</p>}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Pasting;
