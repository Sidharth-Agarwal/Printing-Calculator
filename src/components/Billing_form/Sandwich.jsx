import React, { useState, useEffect } from "react";

const Sandwich = ({ onPrevious, onNext, initialData }) => {
  const [data, setData] = useState({
    isSandwichComponentUsed: initialData?.isSandwichComponentUsed || false,
    isLPUsed: initialData?.isLPUsed || false,
    noOfColors: initialData?.noOfColors || 1,
    plateSizeType: initialData?.plateSizeType || "",
    plateDimensions: initialData?.plateDimensions || { length: "", breadth: "" },
    colorDetails: initialData?.colorDetails || [],
    isFSUsed: initialData?.isFSUsed || false,
    fsType: initialData?.fsType || "",
    blockSizeType: initialData?.blockSizeType || "",
    blockDimensions: initialData?.blockDimensions || { length: "", breadth: "" },
    foilDetails: initialData?.foilDetails || [],
    isEMBUsed: initialData?.isEMBUsed || false,
    EMBplateSizeType: initialData?.EMBplateSizeType || "",
    EMBplateDimensions: initialData?.EMBplateDimensions || { length: "", breadth: "" },
    EMBplateTypeMale: initialData?.EMBplateTypeMale || "",
    EMBplateTypeFemale: initialData?.EMBplateTypeFemale || "",
    embMR: initialData?.embMR || "",
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      colorDetails: Array.from({ length: data.noOfColors }, (_, index) => ({
        inkType: data.colorDetails[index]?.inkType || "",
        plateType: data.colorDetails[index]?.plateType || "",
        mrType: data.colorDetails[index]?.mrType || "",
      })),
    }));
  }, [data.noOfColors]);

  useEffect(() => {
    if (data.fsType) {
      const foilCount = data.fsType === "FS1" ? 1 : data.fsType === "FS2" ? 2 : 3;
      setData((prev) => ({
        ...prev,
        foilDetails: Array.from({ length: foilCount }, (_, index) => ({
          foilType: data.foilDetails[index]?.foilType || "",
          blockType: data.foilDetails[index]?.blockType || "",
          mrType: data.foilDetails[index]?.mrType || "",
        })),
      }));
    }
  }, [data.fsType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNestedChange = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleDetailChange = (section, index, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">SandwichComponent</h2>

      {/* SandwichComponent Toggle */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isSandwichComponentUsed"
            checked={data.isSandwichComponentUsed}
            onChange={(e) => handleChange(e)}
            className="mr-2"
          />
          Is SandwichComponent being used?
        </label>
      </div>

      {data.isSandwichComponentUsed && (
        <>
            {/* LP Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">LP Details</h3>
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
                        onChange={(e) =>
                          handleNestedChange("plateDimensions", "length", e.target.value)
                        }
                        className="border rounded-md p-2"
                      />
                      <input
                        type="number"
                        name="breadth"
                        placeholder="Breadth (cm)"
                        value={data.plateDimensions.breadth}
                        onChange={(e) =>
                          handleNestedChange("plateDimensions", "breadth", e.target.value)
                        }
                        className="border rounded-md p-2"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mt-4 mb-2">Color Details</h3>
                    {data.colorDetails.map((color, index) => (
                      <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                        <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>
                        <div>
                          <label>Ink Type:</label>
                          <select
                            value={color.inkType}
                            onChange={(e) =>
                              handleDetailChange("colorDetails", index, "inkType", e.target.value)
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
                            value={color.plateType}
                            onChange={(e) =>
                              handleDetailChange("colorDetails", index, "plateType", e.target.value)
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
                            value={color.mrType}
                            onChange={(e) =>
                              handleDetailChange("colorDetails", index, "mrType", e.target.value)
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
            </section>

            {/* FS Details */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold">FS Details</h3>
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
                        name="length"
                        placeholder="Block Length (cm)"
                        value={data.blockDimensions.length}
                        onChange={(e) =>
                            handleNestedChange("blockDimensions", "length", e.target.value)
                        }
                        className="border rounded-md p-2"
                        />
                        <input
                        type="number"
                        name="breadth"
                        placeholder="Block Breadth (cm)"
                        value={data.blockDimensions.breadth}
                        onChange={(e) =>
                            handleNestedChange("blockDimensions", "breadth", e.target.value)
                        }
                        className="border rounded-md p-2"
                        />
                    </div>
                    )}
                    {data.fsType && (
                    <div>
                        <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
                        {data.foilDetails.map((_, index) => (
                        <div
                            key={index}
                            className="mb-4 p-4 border rounded-md bg-gray-50"
                        >
                            <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>
                            <div>
                            <label>Foil Type:</label>
                            <select
                                value={data.foilDetails[index]?.foilType || ""}
                                onChange={(e) =>
                                handleDetailChange(
                                    "foilDetails",
                                    index,
                                    "foilType",
                                    e.target.value
                                )
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
                                handleDetailChange(
                                    "foilDetails",
                                    index,
                                    "blockType",
                                    e.target.value
                                )
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
                                handleDetailChange(
                                    "foilDetails",
                                    index,
                                    "mrType",
                                    e.target.value
                                )
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
                    )}
                </>
                )}
            </section>
            
            {/* EMB Details*/}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold">EMB Details</h3>
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
                        name="length"
                        placeholder="Plate Length (cm)"
                        value={data.EMBplateDimensions.length}
                        onChange={(e) =>
                            handleNestedChange("EMBplateDimensions", "length", e.target.value)
                        }
                        className="border rounded-md p-2"
                        />
                        <input
                        type="number"
                        name="breadth"
                        placeholder="Plate Breadth (cm)"
                        value={data.EMBplateDimensions.breadth}
                        onChange={(e) =>
                            handleNestedChange("EMBplateDimensions", "breadth", e.target.value)
                        }
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
                        <option value="">Select Plate Type Male</option>
                        <option value="Polymer Plate">Polymer Plate</option>
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
            </section>
        </>
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

export default Sandwich;
