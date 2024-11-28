import React, { useState } from "react";

const FSDetails = ({ onNext, onPrevious }) => {
  const [data, setData] = useState({
    isFSUsed: false,
    fsType: "",
    blockSizeType: "",
    blockDimensions: { length: "", breadth: "" },
    foilDetails: [], // Holds block type and MR for each foil
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

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedDetails = [...data.foilDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setData((prev) => ({ ...prev, foilDetails: updatedDetails }));
  };

  const generateFoilDetails = () => {
    const details = Array.from({ length: 3 }, (_, index) => ({
      foilType: data.foilDetails[index]?.foilType || "",
      blockType: data.foilDetails[index]?.blockType || "",
      mrType: data.foilDetails[index]?.mrType || "",
    }));
    setData((prev) => ({ ...prev, foilDetails: details }));
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
              {["FS1", "FS2", "FS3", ].map((type, index) => (
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
            <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>
                <div>
                  <label>Foil Type:</label>
                  <select
                    value={data.foilDetails[index]?.foilType || ""}
                    onChange={(e) =>
                      handleFoilDetailsChange(index, "foilType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Foil Type</option>
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
                <div>
                  <label>Block Type:</label>
                  <select
                    value={data.foilDetails[index]?.blockType || ""}
                    onChange={(e) =>
                      handleFoilDetailsChange(index, "blockType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Block Type</option>
                    {[
                      "Magnesium Block 3MM",
                      "Magnesium Block 4MM",
                      "Magnesium Block 5MM",
                      "Male Block",
                      "Female Block",
                    ].map((block, idx) => (
                      <option key={idx} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>MR Type:</label>
                  <select
                    value={data.foilDetails[index]?.mrType || ""}
                    onChange={(e) =>
                      handleFoilDetailsChange(index, "mrType", e.target.value)
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

export default FSDetails;
