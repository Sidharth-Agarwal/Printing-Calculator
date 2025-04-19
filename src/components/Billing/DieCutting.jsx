import React, { useState, useEffect } from "react";

const DieCutting = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const { 
    isDieCuttingUsed = false, 
    difficulty = "No", 
    pdc = "No", 
    dcMR = "Simple",
    dcImpression = 0.25 // Added default impression cost
  } = state.dieCutting || {};
  
  const [errors, setErrors] = useState({});

  // When DC is changed to No, automatically set PDC to No
  useEffect(() => {
    if (difficulty === "No" && pdc === "Yes") {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { pdc: "No" }
      });
    }
  }, [difficulty, pdc, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special case for difficulty - if changed to No, reset PDC
    if (name === "difficulty" && value === "No") {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { 
          [name]: value,
          pdc: "No" 
        }
      });
    } else {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { [name]: type === "checkbox" ? checked : value }
      });
    }

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (isDieCuttingUsed) {
      if (!difficulty) newErrors.difficulty = "Please select Die Cut option.";
      
      // Only validate PDC when Die Cut is Yes
      if (difficulty === "Yes" && !pdc) {
        newErrors.pdc = "Please select PDC option.";
      }
      
      // Only validate MR when Die Cut is Yes
      if (difficulty === "Yes" && !dcMR) {
        newErrors.dcMR = "Please select DC MR.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!singlePageMode) {
      onNext();
    }
  };

  // If Die Cutting is not used, don't render any content
  if (!isDieCuttingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Die Cut Dropdown */}
        <div className="text-sm">
          <label className="block font-medium mb-2">DIE CUT:</label>
          <select
            name="difficulty"
            value={difficulty}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.difficulty ? "border-red-500" : ""}`}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
        </div>

        {/* PDC Dropdown - Only enabled when Die Cut is Yes */}
        <div className="text-sm">
          <label className="block font-medium mb-2">PRE DIE CUT:</label>
          <select
            name="pdc"
            value={pdc}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.pdc ? "border-red-500" : ""}
              ${difficulty === "No" ? "bg-gray-100" : ""}`}
            disabled={difficulty === "No"}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {errors.pdc && <p className="text-red-500 text-sm">{errors.pdc}</p>}
        </div>

        {/* DC MR Dropdown - Only visible when Die Cut is Yes */}
        {difficulty === "Yes" && (
          <div className="text-sm">
            <label className="block font-medium mb-2">DC MR:</label>
            <select
              name="dcMR"
              value={dcMR}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full ${errors.dcMR ? "border-red-500" : ""}`}
            >
              <option value="Simple">Simple</option>
              <option value="Complex">Complex</option>
              <option value="Super Complex">Super Complex</option>
            </select>
            {errors.dcMR && <p className="text-red-500 text-sm">{errors.dcMR}</p>}
          </div>
        )}
      </div>

      {/* Navigation Buttons - only show in step-by-step mode */}
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

export default DieCutting;