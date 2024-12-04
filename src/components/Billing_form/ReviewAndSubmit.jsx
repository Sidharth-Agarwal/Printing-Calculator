import React from "react";

const ReviewAndSubmit = ({ state, onPrevious, onCreateEstimate }) => {
  const handleCreateEstimate = (e) => {
    e.preventDefault();
    onCreateEstimate(); // Trigger the final submission logic
  };

  const renderValue = (key, value) => {
    if (key === "image" && value) {
      return (
        <img
          src={value}
          alt="Uploaded"
          className="w-24 h-24 object-contain border rounded-md"
        />
      );
    }

    if (typeof value === "object" && value !== null) {
      // For nested objects like dimensions or details arrays
      return JSON.stringify(value, null, 2);
    }

    return value || "Not Provided";
  };

  const renderSection = (sectionKey, sectionData) => (
    <div key={sectionKey} className="mb-6">
      <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">
        {sectionKey.replace(/([A-Z])/g, " $1")}:
      </h3>
      <div className="space-y-2">
        {Object.entries(sectionData).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
          >
            <span className="font-medium text-gray-600 capitalize">{key}:</span>
            <span className="text-gray-800">{renderValue(key, value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleCreateEstimate} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>
      <div className="space-y-4 bg-white p-6 rounded shadow-md">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Review Your Entries</h3>
        {Object.entries(state).map(([sectionKey, sectionData]) =>
          typeof sectionData === "object" && sectionData !== null ? (
            renderSection(sectionKey, sectionData)
          ) : null
        )}
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Estimate
        </button>
      </div>
    </form>
  );
};

export default ReviewAndSubmit;
