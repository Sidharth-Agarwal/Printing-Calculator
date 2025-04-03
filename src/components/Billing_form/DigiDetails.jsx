import React, { useEffect, useState } from "react";

const DigiDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const { isDigiUsed = false, digiDie = "", digiDimensions = {} } = state.digiDetails || {};
  const [errors, setErrors] = useState({});

  const DIGI_DIE_OPTIONS = {
    "12x18": { length: "12", breadth: "18" },
    "13x19": { length: "13", breadth: "19" },
  };

  // NOTE: Toggle function removed as it's now handled in the parent component

  const handleChange = (e) => {
    const { name, value } = e.target;

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
        payload: { [name]: value },
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
    if (!singlePageMode && validateFields()) {
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

  // If Digi is not used, don't render any content
  if (!isDigiUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium text-sm">Select Digital Printing Die:</label>
          <select
            name="digiDie"
            value={digiDie}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full text-sm ${
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

        {digiDie && (
          <div className="mt-2 text-sm">
            <p className="text-gray-700 font-medium mb-2">
              Dimensions:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-medium text-gray-700">Length:</span> {digiDimensions.length || "N/A"} inches
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-medium text-gray-700">Breadth:</span> {digiDimensions.breadth || "N/A"} inches
              </div>
            </div>
          </div>
        )}
      </div>

      {!singlePageMode && (
        <div className="flex justify-between">
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

export default DigiDetails;