import React, { useState, useEffect } from "react";

const LPDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { [name]: value },
      });
      generateColorDetails(value);
    }
  };

  const toggleLPUsed = () => {
    const updatedIsLPUsed = !lpDetails.isLPUsed;
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: {
        isLPUsed: updatedIsLPUsed,
        noOfColors: updatedIsLPUsed ? 1 : 0,
        colorDetails: updatedIsLPUsed
          ? [
              {
                plateSizeType: "Auto", // Default to "Auto"
                plateDimensions: { 
                  length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                  breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                },
                pantoneType: "",
                plateType: "Polymer Plate", // Default to "Polymer Plate"
                mrType: "Simple", // Default to "Simple"
              },
            ]
          : [],
      },
    });
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetails.colorDetails];

    if (field === "plateSizeType") {
      updatedDetails[index].plateSizeType = value;

      // Reset plate dimensions when switching to Manual
      if (value === "Manual") {
        updatedDetails[index].plateDimensions = { length: "", breadth: "" };
      }

      // Populate dimensions when switching to Auto
      if (value === "Auto") {
        updatedDetails[index].plateDimensions = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "plateDimensions") {
      updatedDetails[index].plateDimensions = {
        ...updatedDetails[index].plateDimensions,
        ...value,
      };
    } else {
      updatedDetails[index][field] = value;
    }

    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  };

  const generateColorDetails = (noOfColors) => {
    const details = Array.from({ length: noOfColors }, (_, index) => ({
      plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "Auto", // Default to "Auto"
      plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
        length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
      },
      pantoneType: lpDetails.colorDetails[index]?.pantoneType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || "Polymer Plate", // Default to "Polymer Plate"
      mrType: lpDetails.colorDetails[index]?.mrType || "Simple", // Default to "Simple"
    }));
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: details },
    });
  };

  const validateFields = () => {
    const newErrors = {};

    if (lpDetails.isLPUsed) {
      if (!lpDetails.noOfColors || lpDetails.noOfColors < 1) {
        newErrors.noOfColors = "Number of colors must be at least 1.";
      }

      lpDetails.colorDetails.forEach((color, index) => {
        if (!color.plateSizeType) {
          newErrors[`plateSizeType_${index}`] = "Plate size type is required.";
        }
        if (color.plateSizeType === "Manual") {
          if (!color.plateDimensions?.length) {
            newErrors[`plateLength_${index}`] = "Plate length is required.";
          }
          if (!color.plateDimensions?.breadth) {
            newErrors[`plateBreadth_${index}`] = "Plate breadth is required.";
          }
        }
        if (!color.pantoneType) {
          newErrors[`pantoneType_${index}`] = "Pantone type is required.";
        }
        if (!color.plateType) {
          newErrors[`plateType_${index}`] = "Plate type is required.";
        }
        if (!color.mrType) {
          newErrors[`mrType_${index}`] = "MR type is required.";
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

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  useEffect(() => {
    if (lpDetails.isLPUsed) {
      const updatedDetails = lpDetails.colorDetails.map((color) => {
        if (color.plateSizeType === "Auto") {
          return {
            ...color,
            plateDimensions: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            },
          };
        }
        return color;
      });

      const needsUpdate = JSON.stringify(lpDetails.colorDetails) !== JSON.stringify(updatedDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [lpDetails.isLPUsed, dieSize, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">LETTER PRESS (LP) DETAILS</h2>
        <div className="flex items-center space-x-3 cursor-pointer">
          <label className="flex items-center space-x-3" onClick={toggleLPUsed}>
            {/* Circular Button */}
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {lpDetails.isLPUsed && (
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              )}
            </div>
            {/* Label Text */}
            <span className="text-gray-700 font-semibold text-sm">Is LP being used?</span>
          </label>
        </div>
      </div>

      {lpDetails.isLPUsed && (
        <>
          <div>
            <div className="mb-1 text-sm">No of Colors:</div>
            <input
              type="number"
              name="noOfColors"
              value={lpDetails.noOfColors}
              min="1"
              max="10"
              onChange={handleChange}
              className="border rounded-md p-2 w-full text-sm"
            />
            {errors.noOfColors && (
              <p className="text-red-500 text-sm">{errors.noOfColors}</p>
            )}
          </div>

          {lpDetails.noOfColors > 0 && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Color Details</h3>
              {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <h4 className="text-sm font-semibold mb-2">Color {index + 1}</h4>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {/* Plate Size Type */}
                    <div className="flex-1">
                      <div className="mb-1">Plate Size (cm):</div>
                      <select
                        value={lpDetails.colorDetails[index]?.plateSizeType || "Auto"}
                        onChange={(e) =>
                          handleColorDetailsChange(
                            index,
                            "plateSizeType",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`plateSizeType_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`plateSizeType_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Plate Dimensions */}
                    {lpDetails.colorDetails[index]?.plateSizeType && (
                      <div className="flex flex-wrap gap-4 flex-1">
                        <div className="flex-1">
                          <label htmlFor={`length_${index}`} className="block mb-1">
                            Length:
                          </label>
                          <input
                            id={`length_${index}`}
                            type="number"
                            name="length"
                            placeholder="(cm)"
                            value={
                              lpDetails.colorDetails[index]?.plateDimensions?.length || ""
                            }
                            onChange={(e) =>
                              handleColorDetailsChange(index, "plateDimensions", {
                                length: e.target.value,
                              })
                            }
                            className={`border rounded-md p-2 w-full ${
                              lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                                ? "bg-gray-100"
                                : ""
                            }`}
                            readOnly={
                              lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                            }
                          />
                          {errors[`plateLength_${index}`] && (
                            <p className="text-red-500 text-sm">
                              {errors[`plateLength_${index}`]}
                            </p>
                          )}
                        </div>

                        <div className="flex-1">
                          <label htmlFor={`breadth_${index}`} className="block mb-1">
                            Breadth:
                          </label>
                          <input
                            id={`breadth_${index}`}
                            type="number"
                            name="breadth"
                            placeholder="(cm)"
                            value={
                              lpDetails.colorDetails[index]?.plateDimensions?.breadth || ""
                            }
                            onChange={(e) =>
                              handleColorDetailsChange(index, "plateDimensions", {
                                breadth: e.target.value,
                              })
                            }
                            className={`border rounded-md p-2 w-full ${
                              lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                                ? "bg-gray-100"
                                : ""
                            }`}
                            readOnly={
                              lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                            }
                          />
                          {errors[`plateBreadth_${index}`] && (
                            <p className="text-red-500 text-sm">
                              {errors[`plateBreadth_${index}`]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pantone Type */}
                    <div className="flex-1">
                      <div className="mb-1">Pantone Type:</div>
                      <input
                        type="text"
                        value={lpDetails.colorDetails[index]?.pantoneType || ""}
                        onChange={(e) =>
                          handleColorDetailsChange(
                            index,
                            "pantoneType",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full"
                        placeholder="Enter Pantone Type"
                      />
                      {errors[`pantoneType_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`pantoneType_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Plate Type */}
                    <div className="flex-1">
                      <div className="mb-1">Plate Type:</div>
                      <select
                        value={lpDetails.colorDetails[index]?.plateType || "Polymer Plate"}
                        onChange={(e) =>
                          handleColorDetailsChange(index, "plateType", e.target.value)
                        }
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="Polymer Plate">Polymer Plate</option>
                      </select>
                      {errors[`plateType_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`plateType_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* MR Type */}
                    <div className="flex-1">
                      <div className="mb-1">MR Type:</div>
                      <select
                        value={lpDetails.colorDetails[index]?.mrType || "Simple"}
                        onChange={(e) =>
                          handleColorDetailsChange(index, "mrType", e.target.value)
                        }
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="Simple">Simple</option>
                        <option value="Complex">Complex</option>
                        <option value="Super Complex">Super Complex</option>
                      </select>
                      {errors[`mrType_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`mrType_${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
        >
          Previous
        </button>
        <button
          type="submit"
          className="mt-2 px-3 py-2 bg-blue-500 text-white rounded text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default LPDetails;