import React, { useState } from "react";

const FSDetails = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    isFSUsed: false,
    fsType: "",
    blockSizeType: "",
    blockDimensions: { length: "", breadth: "" },
    blockType: "",
    foilTypes: ["", "", ""],
    fsMR: "",
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
      blockDimensions: { ...prev.blockDimensions, [name]: value },
    }));
  };

  const handleFoilChange = (index, value) => {
    const newFoilTypes = [...data.foilTypes];
    newFoilTypes[index] = value;
    setData((prev) => ({ ...prev, foilTypes: newFoilTypes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">FS Details</h2>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isFSUsed"
          checked={data.isFSUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is FS being used?
      </label>
      {data.isFSUsed && (
        <>
          <div>
            <label>FS Type:</label>
            <select
              name="fsType"
              value={data.fsType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select FS Type</option>
              {["FS1", "FS2", "FS3", "FS4"].map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Block Size:</label>
            <select
              name="blockSizeType"
              value={data.blockSizeType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Block Size Type</option>
              <option value="Auto">Auto</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          {data.blockSizeType === "Manual" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="length"
                placeholder="Block Length (cm)"
                value={data.blockDimensions.length}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
              <input
                type="number"
                name="breadth"
                placeholder="Block Breadth (cm)"
                value={data.blockDimensions.breadth}
                onChange={handleNestedChange}
                className="border rounded-md p-2"
              />
            </div>
          )}
          <div>
            <label>Block Type:</label>
            <select
              name="blockType"
              value={data.blockType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Block Type</option>
              {[
                "Magnesium Block 3MM",
                "Magnesium Block 4MM",
                "Magnesium Block 5MM",
                "Male Block",
                "Female Block",
              ].map((block, index) => (
                <option key={index} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Foil Types:</label>
            {data.foilTypes.map((foil, index) => (
              <div key={index} className="mb-2">
                <select
                  value={foil}
                  onChange={(e) => handleFoilChange(index, e.target.value)}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select Foil Type {index + 1}</option>
                  {[
                    "Rosegold MTS 355",
                    "Gold MTS 220",
                    "White 911",
                    "Blk MTS 362",
                    "Silver ALUFIN PMAL METALITE",
                    "MTS 432 PINK",
                  ].map((foilOption, idx) => (
                    <option key={idx} value={foilOption}>
                      {foilOption}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label>FS MR:</label>
            <select
              name="fsMR"
              value={data.fsMR}
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

export default FSDetails;
