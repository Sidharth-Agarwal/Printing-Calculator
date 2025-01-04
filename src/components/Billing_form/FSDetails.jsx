import React, { useEffect, useState } from "react";

const FSDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const fsDetails = state.fsDetails || {
    isFSUsed: false,
    fsType: "FS1", // Default to FS1
    foilDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const { isFSUsed, fsType, foilDetails } = fsDetails;
  const [errors, setErrors] = useState({});

  const inchesToCm = (inches) => parseFloat(inches) * 2.54; // Convert inches to centimeters

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
        } else if (currentFoil.blockSizeType === "Manual") {
          return {
            ...currentFoil,
            blockDimension: {
              length: currentFoil.blockDimension?.length || "",
              breadth: currentFoil.blockDimension?.breadth || "",
            },
          };
        }
        return currentFoil;
      });

      dispatch({
        type: "UPDATE_FS_DETAILS",
        payload: { foilDetails: updatedFoilDetails },
      });
    }
  }, [fsType, isFSUsed, foilDetails, dieSize, dispatch]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isFSUsed") {
      if (checked) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: {
            isFSUsed: true,
            fsType: "FS1",
            foilDetails: [
              {
                blockSizeType: "",
                blockDimension: { length: "", breadth: "" },
                foilType: "",
                blockType: "",
                mrType: "",
              },
            ],
          },
        });
      } else {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: {
            isFSUsed: false,
            fsType: "",
            foilDetails: [],
          },
        });
        setErrors({});
      }
    } else {
      dispatch({
        type: "UPDATE_FS_DETAILS",
        payload: { [name]: value },
      });
    }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Foil Stamping (FS) Details</h2>
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isFSUsed"
          checked={isFSUsed || false}
          onChange={handleChange}
          className="mr-2"
        />
        Is FS being used?
      </label>

      {isFSUsed && (
        <>
          <div>
            <div className="mb-1">FS Type:</div>
            <select
              name="fsType"
              value={fsType || "FS1"}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select FS Type</option>
              {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.fsType && <p className="text-red-500 text-sm">{errors.fsType}</p>}
          </div>

          {fsType && (
            <div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Foil Details</h3>
              {foilDetails.map((foil, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>

                  <div>
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
                      <p className="text-red-500 text-sm">
                        {errors[`blockSizeType-${index}`]}
                      </p>
                    )}
                  </div>

                  {foil.blockSizeType && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="number"
                        placeholder="Length (cm)"
                        value={foil.blockDimension?.length || ""}
                        onChange={(e) =>
                          foil.blockSizeType === "Manual"
                            ? handleFoilDetailsChange(index, "blockDimension", {
                                length: e.target.value,
                              })
                            : null
                        }
                        className={`border rounded-md p-2 ${
                          foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                        }`}
                        readOnly={foil.blockSizeType === "Auto"}
                      />
                      {errors[`blockLength-${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`blockLength-${index}`]}
                        </p>
                      )}
                      <input
                        type="number"
                        placeholder="Breadth (cm)"
                        value={foil.blockDimension?.breadth || ""}
                        onChange={(e) =>
                          foil.blockSizeType === "Manual"
                            ? handleFoilDetailsChange(index, "blockDimension", {
                                breadth: e.target.value,
                              })
                            : null
                        }
                        className={`border rounded-md p-2 ${
                          foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                        }`}
                        readOnly={foil.blockSizeType === "Auto"}
                      />
                      {errors[`blockBreadth-${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`blockBreadth-${index}`]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Foil Type */}
                  <div>
                    <div className="mt-2 mb-1">Foil Type:</div>
                    <select
                      value={foil.foilType || ""}
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
                    {errors[`foilType-${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`foilType-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Block Type */}
                  <div>
                    <div className="mt-2 mb-1">Block Type:</div>
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
                      <p className="text-red-500 text-sm">
                        {errors[`blockType-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* MR Type */}
                  <div>
                    <div className="mt-2 mb-1">MR Type:</div>
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
                      <p className="text-red-500 text-sm">
                        {errors[`mrType-${index}`]}
                      </p>
                    )}
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
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default FSDetails;
