import React, { useState } from "react";

const DieCutting = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    difficulty: "",
    pdc: "",
    dcMR: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Die Cutting</h2>
      <div>
        <label>Difficulty:</label>
        <select
          name="difficulty"
          value={data.difficulty}
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
        >
          <option value="">Select Difficulty</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
        <label>PDC:</label>
        <select
          name="pdc"
          value={data.pdc}
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
        >
          <option value="">Select PDC</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      {data.pdc === "Yes" && (
        <div>
          <label>DC MR:</label>
          <select
            name="dcMR"
            value={data.dcMR}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select MR Type</option>
            <option value="Simple">Simple</option>
            <option value="Complex">Complex</option>
            <option value="Super Complex">Super Complex</option>
          </select>
        </div>
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

export default DieCutting;
