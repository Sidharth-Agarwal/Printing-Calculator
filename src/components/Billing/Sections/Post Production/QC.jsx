import React from "react";

const QC = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const qc = state.qc || {
    isQCUsed: false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode) {
      onNext();
    }
  };

  // If QC is not used, don't render any content
  if (!qc.isQCUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 bg-red-50 border border-red-100 rounded-md">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 font-medium text-sm">
            Quality Control charges will be added to the final pricing.
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
    </form>
  );
};

export default QC;