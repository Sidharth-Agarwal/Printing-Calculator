import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const PreDieCutting = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const preDieCutting = state.preDieCutting || {
    isPreDieCuttingUsed: false,
    predcMR: "",
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch Pre-DC MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("PDC MR");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For MR type, also store the concatenated value for calculations
    if (name === "predcMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      const concatenatedValue = selectedMRType ? selectedMRType.concatenated : `PDC MR ${value.toUpperCase()}`;
      
      dispatch({
        type: "UPDATE_PRE_DIE_CUTTING",
        payload: { 
          [name]: value,
          predcMRConcatenated: concatenatedValue 
        },
      });
    } else {
      dispatch({
        type: "UPDATE_PRE_DIE_CUTTING",
        payload: { [name]: value },
      });
    }
  };

  // Set default MR type when MR types are loaded if none is selected
  useEffect(() => {
    if (preDieCutting.isPreDieCuttingUsed && mrTypes.length > 0 && !preDieCutting.predcMR) {
      const defaultMRType = mrTypes[0];
      
      dispatch({
        type: "UPDATE_PRE_DIE_CUTTING",
        payload: { 
          predcMR: defaultMRType.type,
          predcMRConcatenated: defaultMRType.concatenated 
        },
      });
    }
  }, [mrTypes, preDieCutting.isPreDieCuttingUsed, preDieCutting.predcMR, dispatch]);

  const validateFields = () => {
    const newErrors = {};

    if (preDieCutting.isPreDieCuttingUsed && !preDieCutting.predcMR) {
      newErrors.predcMR = "MR type is required.";
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

  // When Pre-DC is not used, we don't need to show any content
  if (!preDieCutting.isPreDieCuttingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="predcMR" className="block text-xs font-medium text-gray-600 mb-1">
            Pre-DC MR Type:
          </label>
          <select
            id="predcMR"
            name="predcMR"
            value={preDieCutting.predcMR}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.predcMR ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
          >
            <option value="">Select MR Type</option>
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
          {errors.predcMR && (
            <p className="text-red-500 text-xs mt-1">{errors.predcMR}</p>
          )}
        </div>
        
        {!singlePageMode && (
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default PreDieCutting;