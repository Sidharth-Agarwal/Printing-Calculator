import React, { useState } from "react";

const DigiDetails = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    isDigiUsed: false,
    digiDie: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Digi Details</h2>
      {/* Checkbox for Digi Usage */}
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isDigiUsed"
          checked={data.isDigiUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is Digi being used?
      </label>
      {/* Conditional Dropdown for Digi Die */}
      {data.isDigiUsed && (
        <div>
          <label className="block mb-2 font-medium">Select Digi Die:</label>
          <select
            name="digiDie"
            value={data.digiDie}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select Digi Die</option>
            <option value="12x18">12x18</option>
            <option value="13x19">13x19</option>
          </select>
        </div>
      )}
      {/* Navigation Buttons */}
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

export default DigiDetails;
