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