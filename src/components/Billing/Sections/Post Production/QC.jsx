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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 p-2 rounded text-center border border-green-200">
        <p className="text-green-600 font-medium">Quality Control charges will now be added in the final pricing.</p>
      </div>
    </form>
  );
};

export default QC;