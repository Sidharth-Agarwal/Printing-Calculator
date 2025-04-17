import React from "react";

const Misc = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const misc = state.misc || {
    isMiscUsed: false
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
      <div className="bg-green-50 p-2 rounded text-center border border-green-200">
        <p className="text-green-600 font-medium">Miscellaneous services are enabled now.</p>
      </div>
    </form>
  );
};

export default Misc;