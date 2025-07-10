import React, { useEffect, useState } from "react";

const DigiDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const { isDigiUsed = false, digiDie = "", digiDimensions = {} } = state.digiDetails || {};
  const [errors, setErrors] = useState({});

  const DIGI_DIE_OPTIONS = {
    "12x18": { length: "12", breadth: "18" },
    "13x19": { length: "13", breadth: "19" },
  };

  // Set default selection when Digi is first enabled
  useEffect(() => {
    if (isDigiUsed && !digiDie && Object.keys(DIGI_DIE_OPTIONS).length > 0) {
      const firstOption = Object.keys(DIGI_DIE_OPTIONS)[0];
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: {
          digiDie: firstOption,
          digiDimensions: DIGI_DIE_OPTIONS[firstOption],
        },
      });
    }
  }, [isDigiUsed, digiDie, dispatch]);

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
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Single line layout: 1/3 each column */}
        <div className="grid grid-cols-3 gap-2 items-end">
          {/* Digital Die Selection - 1/3 width */}
          <div className="col-span-1">
            <label htmlFor="digiDie" className="block text-xs font-medium text-gray-600 mb-1">
              Digital Printing Die:
            </label>
            <select
              id="digiDie"
              name="digiDie"
              value={digiDie}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.digiDie ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
            >
              {Object.keys(DIGI_DIE_OPTIONS).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions Display */}
          {digiDie && (
            <>
              <div className="col-span-1">
                <div className="text-xs text-gray-600 mb-1">Length:</div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs w-full">
                  {digiDimensions.length || "N/A"} inches
                </div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-gray-600 mb-1">Breadth:</div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs w-full">
                  {digiDimensions.breadth || "N/A"} inches
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error display */}
        {errors.digiDie && (
          <p className="text-red-500 text-xs">{errors.digiDie}</p>
        )}
      </div>
    </form>
  );
};

export default DigiDetails;