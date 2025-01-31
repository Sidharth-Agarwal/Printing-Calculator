import React, { useState, useEffect } from "react";

const FSDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const fsDetails = state.fsDetails || {
    isFSUsed: false,
    fsType: "FS1",
    foilDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});

  const { isFSUsed, fsType, foilDetails } = fsDetails;

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Update foil details dynamically when FS type changes
  useEffect(() => {
    if (isFSUsed && fsType) {
      const numberOfFoilOptions =
        fsType === "FS1"
          ? 1
          : fsType === "FS2"
          ? 2
          : fsType === "FS3"
          ? 3
          : fsType === "FS4"
          ? 4
          : 5; // For FS5

      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        const currentFoil = foilDetails[index] || {};
        if (currentFoil.blockSizeType === "Auto") {
          return {
            ...currentFoil,
            blockDimension: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            },
          };
        }
        return currentFoil;
      });

      const needsUpdate = JSON.stringify(foilDetails) !== JSON.stringify(updatedFoilDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [fsType, isFSUsed, foilDetails, dieSize, dispatch]);

  const toggleFSUsed = () => {
    const updatedIsFSUsed = !isFSUsed;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: {
        isFSUsed: updatedIsFSUsed,
        fsType: updatedIsFSUsed ? "FS1" : "",
        foilDetails: updatedIsFSUsed
          ? [
              {
                blockSizeType: "",
                blockDimension: { length: "", breadth: "" },
                foilType: "",
                blockType: "",
                mrType: "",
              },
            ]
          : [],
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: value },
    });
  };

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...foilDetails];

    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;

      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      }

      if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value,
      };
    } else {
      updatedFoilDetails[index][field] = value;
    }

    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { foilDetails: updatedFoilDetails },
    });
  };

  const validateFields = () => {
    const newErrors = {};

    if (isFSUsed) {
      if (!fsType) {
        newErrors.fsType = "FS Type is required.";
      }

      foilDetails.forEach((foil, index) => {
        if (!foil.blockSizeType) {
          newErrors[`blockSizeType-${index}`] = "Block Size Type is required.";
        }
        if (foil.blockSizeType === "Manual") {
          if (!foil.blockDimension?.length) {
            newErrors[`blockLength-${index}`] = "Block Length is required.";
          }
          if (!foil.blockDimension?.breadth) {
            newErrors[`blockBreadth-${index}`] = "Block Breadth is required.";
          }
        }
        if (!foil.foilType) {
          newErrors[`foilType-${index}`] = "Foil Type is required.";
        }
        if (!foil.blockType) {
          newErrors[`blockType-${index}`] = "Block Type is required.";
        }
        if (!foil.mrType) {
          newErrors[`mrType-${index}`] = "MR Type is required.";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">FOIL STAMPING (FS) DETAILS</h2>
        <div className="flex items-center space-x-3 cursor-pointer">
          <label className="flex items-center space-x-3" onClick={toggleFSUsed}>
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {isFSUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Is FS being used?</span>
          </label>
        </div>
      </div>

      {isFSUsed && (
        <>
          <div>
            <div className="mb-1 text-sm">FS Type:</div>
            <select
              name="fsType"
              value={fsType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full text-sm"
            >
              <option value="">Select FS Type</option>
              {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, idx) => (
                <option key={idx} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.fsType && <p className="text-red-500 text-sm">{errors.fsType}</p>}
          </div>

          {fsType && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Foil Details</h3>
              {foilDetails.map((foil, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-sm font-semibold mb-2">Foil {index + 1}</h4>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {/* Block Size Type */}
                    <div className="flex-1">
                      <div className="mb-1">Block Size (cm):</div>
                      <select
                        value={foil.blockSizeType || ""}
                        onChange={(e) =>
                          handleFoilDetailsChange(index, "blockSizeType", e.target.value)
                        }
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="">Select Block Size Type</option>
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`blockSizeType-${index}`] && (
                        <p className="text-red-500 text-sm">{errors[`blockSizeType-${index}`]}</p>
                      )}
                    </div>

                    {/* Block Dimensions */}
                    {foil.blockSizeType && (
                      <>
                        <div className="flex-1">
                          <label htmlFor={`length-${index}`} className="block mb-1">
                            Length:
                          </label>
                          <input
                            type="number"
                            id={`length-${index}`}
                            placeholder="Length (cm)"
                            value={foil.blockDimension?.length || ""}
                            onChange={(e) =>
                              handleFoilDetailsChange(index, "blockDimension", {
                                length: e.target.value,
                              })
                            }
                            className={`border rounded-md p-2 w-full ${
                              foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                            }`}
                            readOnly={foil.blockSizeType === "Auto"}
                          />
                        </div>

                        <div className="flex-1">
                          <label htmlFor={`breadth-${index}`} className="block mb-1">
                            Breadth:
                          </label>
                          <input
                            type="number"
                            id={`breadth-${index}`}
                            placeholder="Breadth (cm)"
                            value={foil.blockDimension?.breadth || ""}
                            onChange={(e) =>
                              handleFoilDetailsChange(index, "blockDimension", {
                                breadth: e.target.value,
                              })
                            }
                            className={`border rounded-md p-2 w-full ${
                              foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                            }`}
                            readOnly={foil.blockSizeType === "Auto"}
                          />
                        </div>
                      </>
                    )}

                    {/* Foil Type */}
                    <div className="flex-1">
                      <div className="mb-1">Foil Type:</div>
                      <select
                        value={foil.foilType || ""}
                        onChange={(e) =>
                          handleFoilDetailsChange(index, "foilType", e.target.value)
                        }
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="">Select Foil Type</option>
                        {["Rosegold MTS 355",
                          "Gold MTS 220",
                          "White 911",
                          "Blk MTS 362",
                          "Silver ALUFIN PMAL METALITE",
                          "MTS 432 PINK"
                        ].map((type, idx) => (
                          <option key={idx} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors[`foilType-${index}`] && (
                        <p className="text-red-500 text-sm">{errors[`foilType-${index}`]}</p>
                      )}
                    </div>

                    {/* Block Type */}
                    <div className="flex-1">
                      <div className="mb-1">Block Type:</div>
                      <select
                        value={foil.blockType || ""}
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
                      {errors[`blockType-${index}`] && (
                        <p className="text-red-500 text-sm">{errors[`blockType-${index}`]}</p>
                      )}
                    </div>

                    {/* MR Type */}
                    <div className="flex-1">
                      <div className="mb-1">MR Type:</div>
                      <select
                        value={foil.mrType || ""}
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
                      {errors[`mrType-${index}`] && (
                        <p className="text-red-500 text-sm">{errors[`mrType-${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
        >
          Previous
        </button>
        <button
          type="submit"
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default FSDetails;
