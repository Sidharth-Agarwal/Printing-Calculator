import React, { useState } from "react";

const Packing = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const packing = state.packing || {
    isPackingUsed: false,
  };

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    // Add validation logic as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  // When Packing is not used, we don't need to show any content
  if (!packing.isPackingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PACKING CONTENT WILL GO HERE */}
      <div className="bg-gray-50 p-4 rounded text-center">
        <p className="text-gray-500">Packing options will go here.</p>
      </div>

      {!singlePageMode && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
          >
            Previous
          </button>
          <button
            type="submit"
            className="mt-2 px-3 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Next
          </button>
        </div>
      )}
    </form>
  );
};

export default Packing;