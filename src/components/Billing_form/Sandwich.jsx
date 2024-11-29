import React, { useState, useEffect } from "react";

const Sandwich = ({ onPrevious, onNext }) => {
  const [data, setData] = useState({
    isLPUsed: false,
    noOfColors: 1,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    colorDetails: [], // Holds plate type, MR, and ink type for each color
    isFSUsed: false,
    fsType: "",
    blockSizeType: "",
    blockDimensions: { length: "", breadth: "" },
    foilDetails: [], // Holds block type and MR for each foil
    isEMBUsed: false,
    EMBplateSizeType: "",
    EMBplateDimensions: { length: "", breadth: "" },
    EMBplateTypeMale: "",
    EMBplateTypeFemale: "",
    embMR: "",
  });

  // Effect to reset color details when number of colors changes
  useEffect(() => {
    const updatedColorDetails = Array.from({ length: data.noOfColors }, () => ({
      plateType: "",
      mrType: "",
      inkType: "", // New field for each color's ink type
    }));
    setData((prev) => ({ ...prev, colorDetails: updatedColorDetails }));
  }, [data.noOfColors]);

  // Effect to reset foil details whenever fsType changes
  useEffect(() => {
    if (data.fsType) {
      const numberOfFoilOptions = data.fsType === "FS1" ? 1 : data.fsType === "FS2" ? 2 : 3;
      setData((prev) => ({
        ...prev,
        foilDetails: Array.from({ length: numberOfFoilOptions }, (_, index) => ({
          foilType: "",
          blockType: "",
          mrType: "",
        })),
      }));
    }
  }, [data.fsType]);

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

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedDetails = [...data.foilDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setData((prev) => ({ ...prev, foilDetails: updatedDetails }));
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...data.colorDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setData((prev) => ({ ...prev, colorDetails: updatedDetails }));
  };

  return (
    <form className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich</h2>

      {/* LP Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-600">LP Details</h3>
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
              {data.colorDetails.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>
                  <div>
                    <label>Plate Type:</label>
                    <select
                      value={data.colorDetails[index]?.plateType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(index, "plateType", e.target.value)
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
                      <option value="Water Based">Water Based</option>
                      <option value="Solvent Based">Solvent Based</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FS Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-600">FS Details</h3>
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
                {["FS1", "FS2", "FS3"].map((type, index) => (
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
                  name="blockLength"
                  placeholder="Length (cm)"
                  value={data.blockDimensions.length}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2"
                />
                <input
                  type="number"
                  name="blockBreadth"
                  placeholder="Breadth (cm)"
                  value={data.blockDimensions.breadth}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
              {data.foilDetails.map((_, index) => (
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
                      <option value="Foil Type 1">Foil Type 1</option>
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
                      <option value="Block Type 1">Block Type 1</option>
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
      </div>

      {/* EMB Details Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-600">EMB Details</h3>
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
                name="EMBplateSizeType"
                value={data.EMBplateSizeType}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select Plate Size Type</option>
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            {data.EMBplateSizeType === "Manual" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="EMBlength"
                  placeholder="Length (cm)"
                  value={data.EMBplateDimensions.length}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2"
                />
                <input
                  type="number"
                  name="EMBbreadth"
                  placeholder="Breadth (cm)"
                  value={data.EMBplateDimensions.breadth}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2"
                />
              </div>
            )}
            <div>
              <label>Plate Type Male:</label>
              <select
                name="EMBplateTypeMale"
                value={data.EMBplateTypeMale}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select Plate Type</option>
                <option value="Plate Type Male 1">Plate Type Male 1</option>
              </select>
            </div>
            <div>
              <label>Plate Type Female:</label>
              <select
                name="EMBplateTypeFemale"
                value={data.EMBplateTypeFemale}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select Plate Type</option>
                <option value="Plate Type Female 1">Plate Type Female 1</option>
              </select>
            </div>
            <div>
              <label>MR Type:</label>
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onPrevious}
          className="py-2 px-4 bg-gray-300 text-white rounded-md"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Sandwich;
