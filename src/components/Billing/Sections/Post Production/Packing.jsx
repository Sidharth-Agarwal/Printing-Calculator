import React, { useEffect } from "react";

const Packing = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const packing = state.packing || {
    isPackingUsed: false
  };

  // FIXED: Reset Packing data when toggled off (same pattern as other components)
  useEffect(() => {
    if (!packing.isPackingUsed) {
      // When Packing is not used, ensure clean state
      dispatch({
        type: "UPDATE_PACKING",
        payload: {
          isPackingUsed: false
        }
      });
    }
  }, [packing.isPackingUsed, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode) {
      onNext();
    }
  };

  // UPDATED: Always render the content, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 bg-green-50 border border-green-100 rounded-md">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-700 font-medium text-xs">
            Packaging charges will be added to the final pricing.
          </p>
        </div>
      </div>
    </form>
  );
};

export default Packing;