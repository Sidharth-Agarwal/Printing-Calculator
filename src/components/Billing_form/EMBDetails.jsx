import React, { useState } from "react";

const EMBDetails = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    isEMBUsed: false,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateTypeMale: "",
    plateTypeFemale: "",
    embMR: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
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
      <h2 className="text-xl font-bold text-gray-700 mb-4">EMB Details</h2>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isEMBUsed"
          checked={data.isEMBUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is EMB being used?
      </label>
      {data.isEMBUsed && (
        <>
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
                placeholder="Plate Length (cm)"
                value={data.plateDimensions.length}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
              <input
                type="number"
                name="breadth"
                placeholder="Plate Breadth (cm)"
                value={data.plateDimensions.breadth}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
            </div>
          )}
          <div>
            <label>Plate Type Male:</label>
            <select
              name="plateTypeMale"
              value={data.plateTypeMale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Male</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
          </div>
          <div>
            <label>Plate Type Female:</label>
            <select
              name="plateTypeFemale"
              value={data.plateTypeFemale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Female</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
          </div>
          <div>
            <label>EMB MR:</label>
            <select
              name="embMR"
              value={data.embMR}
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

export default EMBDetails;
