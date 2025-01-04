import React, { useState, useEffect } from "react";

const LPDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [], // Holds plate size, pantone type, plate type, MR type for each color
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isLPUsed") {
      if (checked) {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: {
            isLPUsed: true,
            noOfColors: 1,
            colorDetails: [
              {
                plateSizeType: "",
                plateDimensions: { length: "", breadth: "" },
                pantoneType: "",
                plateType: "",
                mrType: "",
              },
            ],
          },
        });
      } else {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: {
            isLPUsed: false,
            noOfColors: 0,
            colorDetails: [],
          },
        });
        setErrors({});
      }
    } else if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { [name]: value },
      });
      generateColorDetails(value);
    }
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
      plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "",
      plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
        length: "",
        breadth: "",
      },
      pantoneType: lpDetails.colorDetails[index]?.pantoneType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || "",
      mrType: lpDetails.colorDetails[index]?.mrType || "",
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

  const inchesToCm = (inches) => parseFloat(inches) * 2.54; // Convert inches to centimeters

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
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { colorDetails: updatedDetails },
      });
    }
  }, [lpDetails.isLPUsed, lpDetails.colorDetails, dieSize, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Letter Press (LP) Details</h2>
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isLPUsed"
          checked={lpDetails.isLPUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is LP being used?
      </label>
      {lpDetails.isLPUsed && (
        <>
          <div>
            <div className="mb-1">No of Colors:</div>
            <input
              type="number"
              name="noOfColors"
              value={lpDetails.noOfColors}
              min="1"
              max="10"
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
            {errors.noOfColors && (
              <p className="text-red-500 text-sm">{errors.noOfColors}</p>
            )}
          </div>

          {lpDetails.noOfColors > 0 && (
            <div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Color Details</h3>
              {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

                  {/* Plate Size Type */}
                  <div>
                    <div className="mb-1">Plate Size (cm):</div>
                    <select
                      value={lpDetails.colorDetails[index]?.plateSizeType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(
                          index,
                          "plateSizeType",
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Plate Size</option>
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                    {errors[`plateSizeType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`plateSizeType_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Display Plate Dimensions Only When Plate Size Type is Selected */}
                  {lpDetails.colorDetails[index]?.plateSizeType && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="number"
                        name="length"
                        placeholder="Length (cm)"
                        value={
                          lpDetails.colorDetails[index]?.plateDimensions?.length || ""
                        }
                        onChange={(e) =>
                          handleColorDetailsChange(index, "plateDimensions", {
                            length: e.target.value,
                          })
                        }
                        className={`border rounded-md p-2 ${
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                            ? "bg-gray-100"
                            : ""
                        }`}
                        readOnly={
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                        }
                      />
                      <input
                        type="number"
                        name="breadth"
                        placeholder="Breadth (cm)"
                        value={
                          lpDetails.colorDetails[index]?.plateDimensions?.breadth || ""
                        }
                        onChange={(e) =>
                          handleColorDetailsChange(index, "plateDimensions", {
                            breadth: e.target.value,
                          })
                        }
                        className={`border rounded-md p-2 ${
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                            ? "bg-gray-100"
                            : ""
                        }`}
                        readOnly={
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto"
                        }
                      />
                    </div>
                  )}

                  {/* Pantone Type */}
                  <div>
                    <div className="mt-2 mb-1">Pantone Type:</div>
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
                  <div>
                    <div className="mt-2 mb-1">Plate Type:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.plateType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(index, "plateType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Plate Type</option>
                      <option value="Polymer Plate">Polymer Plate</option>
                    </select>
                    {errors[`plateType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`plateType_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* MR Type */}
                  <div>
                    <div className="mt-2 mb-1">MR Type:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.mrType || ""}
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
                    {errors[`mrType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`mrType_${index}`]}
                      </p>
                    )}
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

export default LPDetails;
