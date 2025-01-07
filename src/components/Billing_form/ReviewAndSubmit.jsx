import React from "react";

const ReviewAndSubmit = ({ state, calculations, isCalculating, onPrevious, onCreateEstimate }) => {
  const handleCreateEstimate = (e) => {
    e.preventDefault();
    onCreateEstimate();
  };

  const renderValue = (key, value) => {
    if (key.toLowerCase().includes("date") && value) {
      // Format date values
      return new Date(value).toLocaleDateString();
    }

    if (key.toLowerCase() === "image" && value) {
      // Render image if the key is "Image" and value is a valid URL
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-40 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      // Render arrays as lists for better readability
      return (
        <ul className="list-disc pl-6">
          {value.map((item, index) => (
            <li key={index}>{renderValue("item", item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      // Render objects as key-value pairs in a styled table
      return (
        <table className="w-full table-auto border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value).map(([subKey, subValue], index) => (
              <tr
                key={subKey}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } border border-gray-300`}
              >
                <td className="p-2 font-medium text-gray-700 capitalize">{subKey}:</td>
                <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }    

    return value || "Not Provided";
  };

  const renderSection = (heading, sectionData) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      // Skip rendering if section data is missing or empty
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 capitalize mb-4">{heading}:</h3>
        <div className="space-y-2">
          {Object.entries(sectionData).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col bg-gray-100 p-3 rounded-md"
            >
              <span className="font-medium text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleCreateEstimate} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>

      {/* Review Input Sections */}
      <div className="space-y-4 bg-white p-6 rounded shadow-md">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Review Your Entries</h3>

        {/* Render sections only if data is provided */}
        {state.orderAndPaper && renderSection("Order and Paper", state.orderAndPaper)}
        {state.lpDetails?.isLPUsed && renderSection("LP Details", state.lpDetails)}
        {state.fsDetails?.isFSUsed && renderSection("FS Details", state.fsDetails)}
        {state.embDetails?.isEMBUsed && renderSection("EMB Details", state.embDetails)}
        {state.digiDetails?.isDigiUsed && renderSection("Digi Details", state.digiDetails)}
        {state.dieCutting?.isDieCuttingUsed && renderSection("Die Cutting", state.dieCutting)}
        {state.sandwich?.isSandwichComponentUsed &&
          renderSection("Sandwich Details", state.sandwich)}
        {state.pasting?.isPastingUsed && renderSection("Pasting Details", state.pasting)}
      </div>

      {/* Calculations */}
      {isCalculating ? (
        <div className="bg-white p-6 rounded shadow-md">
          <p className="text-gray-600 text-center">Calculating costs...</p>
        </div>
      ) : calculations && !calculations.error ? (
        <div className="space-y-4 bg-white p-6 rounded shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Cost Calculations</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(calculations).map(([key, value]) => (
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
      ) : (
        <div className="bg-white p-6 rounded shadow-md">
          <p className="text-red-600 text-center">
            {calculations?.error || "Unable to fetch calculations."}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
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
