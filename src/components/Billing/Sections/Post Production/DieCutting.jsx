import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const DieCutting = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieCutting = state.dieCutting || {
    isDieCuttingUsed: false,
    dcMR: "",
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch DC MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("DC MR");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For MR type, also store the concatenated value for calculations
    if (name === "dcMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      const concatenatedValue = selectedMRType ? selectedMRType.concatenated : `DC MR ${value.toUpperCase()}`;
      
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { 
          [name]: value,
          dcMRConcatenated: concatenatedValue 
        },
      });
    } else {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { [name]: value },
      });
    }
  };

  // Set default MR type when MR types are loaded if none is selected
  useEffect(() => {
    if (dieCutting.isDieCuttingUsed && mrTypes.length > 0 && !dieCutting.dcMR) {
      const defaultMRType = mrTypes[0];
      
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { 
          dcMR: defaultMRType.type,
          dcMRConcatenated: defaultMRType.concatenated 
        },
      });
    }
  }, [mrTypes, dieCutting.isDieCuttingUsed, dieCutting.dcMR, dispatch]);

  const validateFields = () => {
    const newErrors = {};

    if (dieCutting.isDieCuttingUsed && !dieCutting.dcMR) {
      newErrors.dcMR = "MR type is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  // When DC is not used, we don't need to show any content
  if (!dieCutting.isDieCuttingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-1 text-sm">DC MR Type:</div>
        <select
          name="dcMR"
          value={dieCutting.dcMR}
          onChange={handleChange}
          className="border rounded-md p-2 w-full text-sm"
        >
          {mrTypesLoading ? (
            <option value="" disabled>Loading MR Types...</option>
          ) : (
            mrTypes.map((type, idx) => (
              <option key={idx} value={type.type}>
                {type.type}
              </option>
            ))
          )}
        </select>
        {errors.dcMR && (
          <p className="text-red-500 text-sm">{errors.dcMR}</p>
        )}
      </div>

      {!singlePageMode && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white px-3 py-2 rounded text-sm"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            Next
          </button>
        </div>
      )}
    </form>
  );
};

export default DieCutting;