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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 p-2 rounded text-center border border-green-200">
        <p className="text-green-600 font-medium">Screen Print is enabled now.</p>
      </div>
    </form>
  );
};

export default ScreenPrint;