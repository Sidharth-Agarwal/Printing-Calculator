import React from "react";
import ReactDOM from "react-dom";

const OrderDetailsModal = ({ order, onClose }) => {
  const renderValue = (key, value) => {
    if (key.toLowerCase() === "image" && value) {
      // If it's an image, render the image
      return (
        <img
          src={value}
          alt={key}
          className="max-w-full max-h-40 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      // If it's an array, render a list
      return (
        <ul className="list-disc pl-6">
          {value.map((item, index) => (
            <li key={index}>{renderValue("item", item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      // If it's an object, render a table
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
                <td className="p-2 font-medium text-gray-700 capitalize">
                  {subKey}:
                </td>
                <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Render other types directly
    return value || "Not Provided";
  };

  const renderSection = (heading, sectionData) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 capitalize mb-4">{heading}:</h3>
        <div className="space-y-4">
          {Object.entries(sectionData).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col bg-gray-100 p-3 rounded-md shadow-sm"
            >
              <span className="font-medium text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-800 mt-1">{renderValue(key, value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]"
        style={{ width: "90vw" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg font-bold"
        >
          ✖
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">Order Details</h2>

        {/* Render Details Sections */}
        <div className="space-y-8">
          {renderSection("Order and Paper", order.jobDetails)}
          {renderSection("Die Details", order.dieDetails)}
          {renderSection("LP Details", order.lpDetails)}
          {renderSection("FS Details", order.fsDetails)}
          {renderSection("EMB Details", order.embDetails)}
          {renderSection("Die Cutting Details", order.dieCuttingDetails)}
          {renderSection("Calculations", order.calculations)}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body // Render to the body element
  );
};

export default OrderDetailsModal;
