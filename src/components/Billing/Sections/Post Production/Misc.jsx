import React, { useState, useEffect } from "react";
import { fetchOverheadValue } from "../../../../utils/dbFetchUtils";

const Misc = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const misc = state.misc || {
    isMiscUsed: false,
    miscCharge: ""
  };

  const [loading, setLoading] = useState(false);
  const [dbDefaultValue, setDbDefaultValue] = useState(null);

  // Fetch the default value from DB when component mounts or when isMiscUsed changes
  useEffect(() => {
    if (misc.isMiscUsed) {
      fetchDefaultMiscCharge();
    }
  }, [misc.isMiscUsed]);

  // Function to fetch default misc charge from DB
  const fetchDefaultMiscCharge = async () => {
    setLoading(true);
    try {
      const miscOverhead = await fetchOverheadValue("MISCELLANEOUS");
      const defaultValue = miscOverhead && miscOverhead.value
        ? parseFloat(miscOverhead.value)
        : 5.0; // Default to 5.0 if not found
      
      setDbDefaultValue(defaultValue);
      
      // Only set the value if it hasn't been manually set yet
      if (!misc.miscCharge) {
        handleMiscChargeChange({ target: { value: defaultValue.toString() } });
      }
    } catch (error) {
      console.error("Error fetching misc charge:", error);
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

  // If Misc is not used, don't render any content
  if (!misc.isMiscUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="miscCharge" className="block text-xs font-medium text-gray-600 mb-1">
            Miscellaneous Charge (₹ per card)
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="text"
              name="miscCharge"
              id="miscCharge"
              disabled={loading}
              value={misc.miscCharge}
              onChange={handleMiscChargeChange}
              className={`w-full px-3 py-2 pl-7 pr-12 border ${loading ? "bg-gray-50" : ""} border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
              placeholder={loading ? "Loading..." : "0.00"}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">per card</span>
            </div>
          </div>
          {dbDefaultValue !== null && (
            <p className="mt-1 text-xs text-gray-500">
              Default value from database: ₹ {dbDefaultValue.toFixed(2)}
              {misc.miscCharge && parseFloat(misc.miscCharge) !== dbDefaultValue && (
                <span className="ml-1 text-red-500">
                  (You've customized this value)
                </span>
              )}
            </p>
          )}
        </div>
        
        <div className="p-3 mt-2 bg-red-50 border border-red-100 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium text-sm">
              Miscellaneous services charges will be added to the final pricing.
            </p>
          </div>
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

export default Misc;