import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";

const ScreenPrint = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const screenPrint = state.screenPrint || {
    isScreenPrintUsed: false,
    noOfColors: 1,
    screenMR: "",
    screenMRConcatenated: ""
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch MR types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("SCREEN MR");

  // FIXED: Clear errors when Screen Print is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!screenPrint.isScreenPrintUsed) {
      setErrors({});
    }
  }, [screenPrint.isScreenPrintUsed]);

  // FIXED: Reset Screen Print data when toggled off
  useEffect(() => {
    if (!screenPrint.isScreenPrintUsed) {
      // When Screen Print is not used, ensure clean state
      if (screenPrint.noOfColors !== 1 || screenPrint.screenMR !== "" || screenPrint.screenMRConcatenated !== "") {
        dispatch({
          type: "UPDATE_SCREEN_PRINT",
          payload: {
            isScreenPrintUsed: false,
            noOfColors: 1,
            screenMR: "",
            screenMRConcatenated: ""
          }
        });
      }
    }
  }, [screenPrint.isScreenPrintUsed, screenPrint.noOfColors, screenPrint.screenMR, screenPrint.screenMRConcatenated, dispatch]);

  // Set default MR Type when component mounts or when Screen Print is first enabled
  useEffect(() => {
    if (screenPrint.isScreenPrintUsed && mrTypes.length > 0) {
      const defaultMRType = mrTypes[0];
      const updates = {};
      
      // Set screenMR if it's empty
      if (!screenPrint.screenMR) {
        updates.screenMR = defaultMRType.type;
      }
      
      // Set screenMRConcatenated if it's empty
      if (!screenPrint.screenMRConcatenated) {
        updates.screenMRConcatenated = defaultMRType.concatenated || `SCREEN MR ${defaultMRType.type}`;
      }
      
      // Only dispatch if we have updates
      if (Object.keys(updates).length > 0) {
        dispatch({
          type: "UPDATE_SCREEN_PRINT",
          payload: updates
        });
      }
    }
  }, [screenPrint.isScreenPrintUsed, screenPrint.screenMR, screenPrint.screenMRConcatenated, mrTypes, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for screenMR to also set the concatenated version
    if (name === "screenMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      
      if (selectedMRType && selectedMRType.concatenated) {
        dispatch({
          type: "UPDATE_SCREEN_PRINT",
          payload: { 
            screenMR: value,
            screenMRConcatenated: selectedMRType.concatenated
          },
        });
      } else {
        // Fallback: create concatenated version if not found
        dispatch({
          type: "UPDATE_SCREEN_PRINT",
          payload: { 
            screenMR: value,
            screenMRConcatenated: `SCREEN MR ${value}`
          },
        });
      }
    } else {
      // Handle other fields normally
      dispatch({
        type: "UPDATE_SCREEN_PRINT",
        payload: { [name]: value },
      });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    
    if (screenPrint.isScreenPrintUsed) {
      if (!screenPrint.noOfColors || screenPrint.noOfColors < 1) {
        newErrors.noOfColors = "Number of colors must be at least 1.";
      }
      if (!screenPrint.screenMR) {
        newErrors.screenMR = "MR Type is required.";
      }
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

  // FIXED: Same pattern as LPDetails and Misc component - return null if not being used
  if (!screenPrint.isScreenPrintUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Screen Print Configuration - Fields side by side */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Number of Colors Input */}
            <div>
              <label htmlFor="noOfColors" className="block text-xs font-medium text-gray-600 mb-1">
                Number of Colors:
              </label>
              <input
                type="number"
                id="noOfColors"
                name="noOfColors"
                value={screenPrint.noOfColors || 1}
                min="1"
                max="10"
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                className={`w-full px-3 py-2 border ${errors.noOfColors ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              />
              {errors.noOfColors && (
                <p className="text-red-500 text-xs mt-1">{errors.noOfColors}</p>
              )}
            </div>

            {/* MR Type */}
            <div>
              <label htmlFor="screenMR" className="block text-xs font-medium text-gray-600 mb-1">
                Screen MR Type:
              </label>
              <select
                id="screenMR"
                name="screenMR"
                value={screenPrint.screenMR || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.screenMR ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              >
                {mrTypesLoading ? (
                  <option value="" disabled>Loading...</option>
                ) : (
                  mrTypes.map((typeOption, idx) => (
                    <option key={idx} value={typeOption.type}>
                      {typeOption.type}
                    </option>
                  ))
                )}
              </select>
              {errors.screenMR && <p className="text-red-500 text-xs mt-1">{errors.screenMR}</p>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ScreenPrint;