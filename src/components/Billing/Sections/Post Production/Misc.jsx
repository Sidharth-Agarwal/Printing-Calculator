import React, { useState, useEffect, useRef } from "react";
import { fetchOverheadValue } from "../../../../utils/dbFetchUtils";

const Misc = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const misc = state.misc || {
    isMiscUsed: false,
    miscCharge: ""
  };

  const [loading, setLoading] = useState(false);
  const [dbDefaultValue, setDbDefaultValue] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const prevMiscUsed = useRef(misc.isMiscUsed);

  // FIXED: Clear errors and reset when toggled off (this is the working pattern)
  useEffect(() => {
    if (misc.isMiscUsed) {
      if (!isInitialized || (!misc.miscCharge && misc.isMiscUsed !== prevMiscUsed.current)) {
        fetchDefaultMiscCharge();
      }
    } else {
      // Reset initialization when toggled off
      setIsInitialized(false);
      setDbDefaultValue(null);
    }
    
    // Track changes to isMiscUsed
    prevMiscUsed.current = misc.isMiscUsed;
  }, [misc.isMiscUsed, misc.miscCharge]);

  // Function to fetch default misc charge from DB
  const fetchDefaultMiscCharge = async () => {
    setLoading(true);
    try {
      const miscOverhead = await fetchOverheadValue("MISCELLANEOUS");
      const defaultValue = miscOverhead && miscOverhead.value
        ? parseFloat(miscOverhead.value)
        : 5.0; // Default to 5.0 if not found
      
      setDbDefaultValue(defaultValue);
      
      if (!misc.miscCharge && !isInitialized) {
        handleMiscChargeChange({ target: { value: defaultValue.toString() } });
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error fetching misc charge:", error);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle misc charge input change
  const handleMiscChargeChange = (e) => {
    const value = e.target.value;
    
    // Validate input (allow only numbers and decimal point)
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      dispatch({
        type: "UPDATE_MISC",
        payload: { 
          ...misc,
          miscCharge: value
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode) {
      onNext();
    }
  };

  // Helper to determine if current value is custom
  const isCustomValue = () => {
    if (!dbDefaultValue || !misc.miscCharge) return false;
    return parseFloat(misc.miscCharge) !== dbDefaultValue;
  };

  // UPDATED: Always render all form fields, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="miscCharge" className="block text-xs font-medium text-gray-600 mb-1">
            Miscellaneous Charge (₹ per card)
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-xs">₹</span>
            </div>
            <input
              type="text"
              name="miscCharge"
              id="miscCharge"
              disabled={loading}
              value={misc.miscCharge}
              onChange={handleMiscChargeChange}
              className={`w-full px-3 py-2 pl-7 pr-12 border ${loading ? "bg-gray-50" : ""} ${isCustomValue() ? "border-blue-300 bg-blue-50" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              placeholder={loading ? "Loading..." : "0.00"}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-xs">per card</span>
            </div>
          </div>
          
          <div className="mt-1 space-y-1">
            {isCustomValue() && (
              <p className="text-xs text-blue-600 font-medium">
                ✓ Using custom value: ₹ {parseFloat(misc.miscCharge).toFixed(2)}
              </p>
            )}
            
            {misc.miscCharge && !isCustomValue() && dbDefaultValue !== null && (
              <p className="text-xs text-green-600">
                ✓ Using default value
              </p>
            )}
          </div>
        </div>
        
        <div className="p-3 mt-2 bg-green-50 border border-green-100 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 font-medium text-xs">
              Miscellaneous services charges will be added to the final pricing.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Misc;