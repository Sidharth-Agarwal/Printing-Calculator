import React from "react";

const ReviewAndSubmit = ({ formData, onPrevious, onCreateEstimate }) => {
  const handleCreateEstimate = (e) => {
    e.preventDefault();
    onCreateEstimate(); // Trigger the final submission logic
  };

  return (
    <form onSubmit={handleCreateEstimate} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>
      <div className="space-y-4 bg-white p-6 rounded shadow-md">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Review Your Entries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
              <span className="font-medium text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-800">
                {typeof value === "object" && value !== null
                  ? JSON.stringify(value, null, 2) // Format nested objects
                  : value || "Not Provided"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Create Estimate
        </button>
      </div>
    </form>
  );
};

export default ReviewAndSubmit;
