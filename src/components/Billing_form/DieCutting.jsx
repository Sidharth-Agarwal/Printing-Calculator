import React, { useState } from "react";

const DieCutting = ({ state, dispatch, onNext, onPrevious }) => {
  const { isDieCuttingUsed = false, difficulty = "", pdc = "", dcMR = "" } = state.dieCutting || {};
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_DIE_CUTTING",
      payload: { [name]: type === "checkbox" ? checked : value },
    });

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (isDieCuttingUsed) {
      if (!difficulty) newErrors.difficulty = "Please select Difficulty.";
      if (!pdc) newErrors.pdc = "Please select PDC.";
      if ((difficulty === "Yes" || pdc === "Yes") && !dcMR) {
        newErrors.dcMR = "Please select DC MR.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Die Cutting</h2>

      {/* Toggle for Die Cutting Usage */}
      <div className="flex items-center space-x-3 cursor-pointer mb-4">
        <label
          className="flex items-center space-x-3"
          onClick={() =>
            dispatch({
              type: "UPDATE_DIE_CUTTING",
              payload: { isDieCuttingUsed: !isDieCuttingUsed },
            })
          }
        >
          {/* Toggle Circle */}
          <div className="w-6 h-6 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
            {isDieCuttingUsed && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
          </div>
          <span className="text-gray-700 font-semibold">Is Die Cutting being used?</span>
        </label>
      </div>

      {/* Conditional Fields */}
      {isDieCuttingUsed && (
        <>
          {/* Difficulty Dropdown */}
          <div>
            <label className="block font-medium mb-2">Difficulty:</label>
            <select
              name="difficulty"
              value={difficulty}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full ${errors.difficulty ? "border-red-500" : ""}`}
            >
              <option value="">Select Difficulty</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
          </div>

          {/* PDC Dropdown */}
          <div>
            <label className="block font-medium mb-2">PDC:</label>
            <select
              name="pdc"
              value={pdc}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full ${errors.pdc ? "border-red-500" : ""}`}
            >
              <option value="">Select PDC</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.pdc && <p className="text-red-500 text-sm">{errors.pdc}</p>}
          </div>

          {/* DC MR Dropdown (Conditional) */}
          {(difficulty === "Yes" || pdc === "Yes") && (
            <div>
              <label className="block font-medium mb-2">DC MR:</label>
              <select
                name="dcMR"
                value={dcMR}
                onChange={handleChange}
                className={`border rounded-md p-2 w-full ${errors.dcMR ? "border-red-500" : ""}`}
              >
                <option value="">Select MR Type</option>
                <option value="Simple">Simple</option>
                <option value="Complex">Complex</option>
                <option value="Super Complex">Super Complex</option>
              </select>
              {errors.dcMR && <p className="text-red-500 text-sm">{errors.dcMR}</p>}
            </div>
          )}
        </>
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

export default DieCutting;
