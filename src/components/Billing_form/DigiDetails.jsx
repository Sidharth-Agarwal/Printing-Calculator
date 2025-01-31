import React, { useEffect, useState } from "react";

const DigiDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const { isDigiUsed = false, digiDie = "", digiDimensions = {} } = state.digiDetails || {};
  const [errors, setErrors] = useState({});

  const DIGI_DIE_OPTIONS = {
    "12x18": { length: "12", breadth: "18" },
    "13x19": { length: "13", breadth: "19" },
  };

  const toggleDigiUsed = () => {
    const updatedIsDigiUsed = !isDigiUsed;
    dispatch({
      type: "UPDATE_DIGI_DETAILS",
      payload: {
        isDigiUsed: updatedIsDigiUsed,
        digiDie: updatedIsDigiUsed ? "" : "",
        digiDimensions: updatedIsDigiUsed ? {} : {},
      },
    });
    setErrors({});
  };

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">DIGITAL PRINTING DETAILS</h2>
        <div className="flex items-center space-x-3 cursor-pointer">
          <label className="flex items-center space-x-3" onClick={toggleDigiUsed}>
            {/* Circular Button */}
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {isDigiUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            {/* Label Text */}
            <span className="text-gray-700 font-semibold text-sm">Is Digi being used?</span>
          </label>
        </div>
      </div>

      {isDigiUsed && (
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
      )}

      {isDigiUsed && digiDie && (
        <div className="mt-2 text-sm">
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
    </form>
  );
};

export default DigiDetails;
