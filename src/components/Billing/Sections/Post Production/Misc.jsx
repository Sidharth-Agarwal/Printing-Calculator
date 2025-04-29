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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-4 rounded-md border">
        <div className="mb-4">
          <label htmlFor="miscCharge" className="block text-sm font-medium text-gray-700 mb-1">
            Miscellaneous Charge (₹ per card)
          </label>
          <div className="relative rounded-md shadow-sm">
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
              className={`block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md ${loading ? 'bg-gray-100' : 'bg-white'}`}
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
                <span className="ml-1 text-blue-500">
                  (You've customized this value)
                </span>
              )}
            </p>
          )}
        </div>
        
        <div className="bg-green-50 p-2 rounded text-center border border-green-200 mt-4">
          <p className="text-green-600 font-medium">
            Miscellaneous services charges will be added to the final pricing.
          </p>
        </div>
      </div>
    </form>
  );
};

export default Misc;