import React from "react";

const ScreenPrint = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const screenPrint = state.screenPrint || {
    isScreenPrintUsed: false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode) {
      onNext();
    }
  };

  // If Screen Print is not used, don't render any content
  if (!screenPrint.isScreenPrintUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-700 font-medium text-sm">Screen Print is enabled for this project.</p>
        </div>
        <p className="text-green-600 text-xs mt-1 ml-7">No additional configuration is required.</p>
      </div>
    </form>
  );
};

export default ScreenPrint;