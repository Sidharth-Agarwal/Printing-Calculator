import React, { useState } from "react";

const LPDetails = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    isLPUsed: false,
    noOfColors: 1,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateType: "",
    inkTypes: [],
    lpMR: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInkTypeChange = (index, value) => {
    const newInkTypes = [...data.inkTypes];
    newInkTypes[index] = value;
    setData((prev) => ({ ...prev, inkTypes: newInkTypes }));
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      plateDimensions: { ...prev.plateDimensions, [name]: value },
    }));
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
              onChange={handleChange}
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
            <label>Plate Type:</label>
            <select
              name="plateType"
              value={data.plateType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
          </div>
          <div>
            <label>Ink Types:</label>
            {Array.from({ length: data.noOfColors }, (_, i) => (
              <div key={i} className="mb-2">
                <select
                  value={data.inkTypes[i] || ""}
                  onChange={(e) => handleInkTypeChange(i, e.target.value)}
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
                  ].map((ink, index) => (
                    <option key={index} value={ink}>
                      {ink}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label>LP MR:</label>
            <select
              name="lpMR"
              value={data.lpMR}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select MR Type</option>
              <option value="Simple">Simple</option>
              <option value="Complex">Complex</option>
              <option value="Super Complex">Super Complex</option>
            </select>
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
