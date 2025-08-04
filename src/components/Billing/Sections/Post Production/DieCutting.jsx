import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const DieCutting = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieCutting = state.dieCutting || {
    isDieCuttingUsed: false,
    dcMR: "",
    dcMRConcatenated: ""
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch DC MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("DC MR");

  // FIXED: Clear errors when Die Cutting is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!dieCutting.isDieCuttingUsed) {
      setErrors({});
    }
  }, [dieCutting.isDieCuttingUsed]);

  // FIXED: Reset Die Cutting data when toggled off
  useEffect(() => {
    if (!dieCutting.isDieCuttingUsed) {
      // When Die Cutting is not used, ensure clean state
      if (dieCutting.dcMR !== "" || dieCutting.dcMRConcatenated !== "") {
        dispatch({
          type: "UPDATE_DIE_CUTTING",
          payload: {
            isDieCuttingUsed: false,
            dcMR: "",
            dcMRConcatenated: ""
          }
        });
      }
    }
  }, [dieCutting.isDieCuttingUsed, dieCutting.dcMR, dieCutting.dcMRConcatenated, dispatch]);

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

  // UPDATED: Always render all form fields, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="dcMR" className="block text-xs font-medium text-gray-600 mb-1">
            DC MR Type:
          </label>
          <select
            id="dcMR"
            name="dcMR"
            value={dieCutting.dcMR}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.dcMR ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 text-xs`}
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
            <p className="text-red-500 text-xs mt-1">{errors.dcMR}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default DieCutting;