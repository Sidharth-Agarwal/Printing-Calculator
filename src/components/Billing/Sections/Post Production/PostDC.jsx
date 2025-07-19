import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const PostDC = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const postDC = state.postDC || {
    isPostDCUsed: false,
    pdcMR: "",
    pdcMRConcatenated: ""
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch PDC MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("PDC MR");

  // FIXED: Clear errors when Post DC is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!postDC.isPostDCUsed) {
      setErrors({});
    }
  }, [postDC.isPostDCUsed]);

  // FIXED: Reset Post DC data when toggled off
  useEffect(() => {
    if (!postDC.isPostDCUsed) {
      // When Post DC is not used, ensure clean state
      if (postDC.pdcMR !== "" || postDC.pdcMRConcatenated !== "") {
        dispatch({
          type: "UPDATE_POST_DC",
          payload: {
            isPostDCUsed: false,
            pdcMR: "",
            pdcMRConcatenated: ""
          }
        });
      }
    }
  }, [postDC.isPostDCUsed, postDC.pdcMR, postDC.pdcMRConcatenated, dispatch]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For MR type, also store the concatenated value for calculations
    if (name === "pdcMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      const concatenatedValue = selectedMRType ? selectedMRType.concatenated : `PDC MR ${value}`;
      
      dispatch({
        type: "UPDATE_POST_DC",
        payload: { 
          [name]: value,
          pdcMRConcatenated: concatenatedValue 
        },
      });
    } else {
      dispatch({
        type: "UPDATE_POST_DC",
        payload: { [name]: value },
      });
    }
  };

  // Set default MR type when MR types are loaded if none is selected
  useEffect(() => {
    if (postDC.isPostDCUsed && mrTypes.length > 0 && !postDC.pdcMR) {
      const defaultMRType = mrTypes[0];
      
      dispatch({
        type: "UPDATE_POST_DC",
        payload: { 
          pdcMR: defaultMRType.type,
          pdcMRConcatenated: defaultMRType.concatenated
        },
      });
    }
  }, [mrTypes, postDC.isPostDCUsed, postDC.pdcMR, dispatch]);

  const validateFields = () => {
    const newErrors = {};

    if (postDC.isPostDCUsed && !postDC.pdcMR) {
      newErrors.pdcMR = "MR type is required.";
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
          <label htmlFor="pdcMR" className="block text-xs font-medium text-gray-600 mb-1">
            PDC MR Type:
          </label>
          <select
            id="pdcMR"
            name="pdcMR"
            value={postDC.pdcMR}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.pdcMR ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
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
          {errors.pdcMR && (
            <p className="text-red-500 text-xs mt-1">{errors.pdcMR}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default PostDC;