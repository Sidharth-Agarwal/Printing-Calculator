// PostDC.jsx
import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const PostDC = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const postDC = state.postDC || {
    isPostDCUsed: false,
    pdcMR: "",
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch PDC MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("PDC MR");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For MR type, also store the concatenated value for calculations
    if (name === "pdcMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      const concatenatedValue = selectedMRType ? selectedMRType.concatenate : `PDC MR ${value}`;
      
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

  // When Post DC is not used, we don't need to show any content
  if (!postDC.isPostDCUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-1 text-sm">PDC MR Type:</div>
        <select
          name="pdcMR"
          value={postDC.pdcMR}
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
        {errors.pdcMR && (
          <p className="text-red-500 text-sm">{errors.pdcMR}</p>
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

export default PostDC;