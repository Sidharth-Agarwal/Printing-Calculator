import React, { useState } from "react";

const LPDetails = ({ onNext, onPrevious, initialData }) => {
  const [data, setData] = useState({
    isLPUsed: initialData?.isLPUsed || false,
    noOfColors: initialData?.noOfColors || 1,
    plateSizeType: initialData?.plateSizeType || "",
    plateDimensions: {
      length: initialData?.plateDimensions?.length || "",
      breadth: initialData?.plateDimensions?.breadth || "",
    },
    colorDetails: initialData?.colorDetails || [], // Holds plate type, MR type, and ink type for each color
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      plateDimensions: { ...prev.plateDimensions, [name]: value },
    }));
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...data.colorDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setData((prev) => ({ ...prev, colorDetails: updatedDetails }));
  };

  const generateColorDetails = () => {
    const details = Array.from({ length: data.noOfColors }, (_, index) => ({
      inkType: data.colorDetails[index]?.inkType || "",
      plateType: data.colorDetails[index]?.plateType || "",
      mrType: data.colorDetails[index]?.mrType || "",
    }));
    setData((prev) => ({ ...prev, colorDetails: details }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">LP Details</h2>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isLPUsed"
          checked={data.isLPUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is LP being used?
      </label>
      {data.isLPUsed && (
        <>
          <div>
            <label>No of Colors:</label>
            <input
              type="number"
              name="noOfColors"
              value={data.noOfColors}
              min="1"
              max="10"
              onChange={(e) => {
                handleChange(e);
                generateColorDetails();
              }}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label>Plate Size:</label>
            <select
              name="plateSizeType"
              value={data.plateSizeType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Size Type</option>
              <option value="Auto">Auto</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          {data.plateSizeType === "Manual" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="length"
                placeholder="Length (cm)"
                value={data.plateDimensions.length}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
              <input
                type="number"
                name="breadth"
                placeholder="Breadth (cm)"
                value={data.plateDimensions.breadth}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Color Details</h3>
            {Array.from({ length: data.noOfColors }, (_, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50"
              >
                <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>
                <div>
                  <label>Ink Type:</label>
                  <select
                    value={data.colorDetails[index]?.inkType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "inkType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Ink Type</option>
                    {[
                      "Ink Black",
                      "Ink Cyan",
                      "Ink Magenta",
                      "Ink Varnish",
                      "Ink Milk White",
                      "Ink Opaque White",
                      "Ink White",
                      "Ink Yellow",
                    ].map((ink, idx) => (
                      <option key={idx} value={ink}>
                        {ink}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Plate Type:</label>
                  <select
                    value={data.colorDetails[index]?.plateType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(
                        index,
                        "plateType",
                        e.target.value
                      )
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Type</option>
                    <option value="Polymer Plate">Polymer Plate</option>
                  </select>
                </div>
                <div>
                  <label>MR Type:</label>
                  <select
                    value={data.colorDetails[index]?.mrType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "mrType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select MR Type</option>
                    <option value="Simple">Simple</option>
                    <option value="Complex">Complex</option>
                    <option value="Super Complex">Super Complex</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default LPDetails;
