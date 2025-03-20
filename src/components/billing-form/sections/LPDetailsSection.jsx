import React, { useState, useEffect } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";
import DimensionInput from "../fields/DimensionInput";

const LPDetailsSection = ({ state, dispatch }) => {
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
    <div className="space-y-6">
      <FormToggle
        label="Is LP being used?"
        isChecked={lpDetails.isLPUsed}
        onChange={toggleLPUsed}
      />

      {lpDetails.isLPUsed && (
        <>
          <FormGroup
            label="No of Colors"
            htmlFor="noOfColors"
          >
            <NumberField
              id="noOfColors"
              name="noOfColors"
              value={lpDetails.noOfColors}
              onChange={handleChange}
              min={1}
              max={10}
              required={lpDetails.isLPUsed}
            />
            {errors.noOfColors && (
              <p className="text-red-500 text-sm">{errors.noOfColors}</p>
            )}
          </FormGroup>

          {lpDetails.noOfColors > 0 && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Color Details</h3>
              {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
                <ColorDetailsCard
                  key={index}
                  index={index}
                  color={lpDetails.colorDetails[index] || {}}
                  handleColorDetailsChange={handleColorDetailsChange}
                  errors={errors}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Color Details Card Component to reduce complexity
const ColorDetailsCard = ({ index, color, handleColorDetailsChange, errors }) => {
  return (
    <div
      className="mb-4 p-4 border rounded-md bg-gray-50"
    >
      <h4 className="text-sm font-semibold mb-2">Color {index + 1}</h4>

      <div className="flex flex-wrap gap-4 text-sm">
        {/* Plate Size Type */}
        <div className="flex-1">
          <div className="mb-1">Plate Size (cm):</div>
          <SelectField
            value={color.plateSizeType || "Auto"}
            onChange={(e) =>
              handleColorDetailsChange(index, "plateSizeType", e.target.value)
            }
            options={["Auto", "Manual"]}
            placeholder="Select plate size type"
          />
          {errors[`plateSizeType_${index}`] && (
            <p className="text-red-500 text-sm">
              {errors[`plateSizeType_${index}`]}
            </p>
          )}
        </div>

        {/* Plate Dimensions */}
        {color.plateSizeType && (
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
                  color.plateDimensions?.length || ""
                }
                onChange={(e) =>
                  handleColorDetailsChange(index, "plateDimensions", {
                    length: e.target.value,
                  })
                }
                className={`border rounded-md p-2 w-full ${
                  color.plateSizeType === "Auto"
                    ? "bg-gray-100"
                    : ""
                }`}
                readOnly={
                  color.plateSizeType === "Auto"
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
                  color.plateDimensions?.breadth || ""
                }
                onChange={(e) =>
                  handleColorDetailsChange(index, "plateDimensions", {
                    breadth: e.target.value,
                  })
                }
                className={`border rounded-md p-2 w-full ${
                  color.plateSizeType === "Auto"
                    ? "bg-gray-100"
                    : ""
                }`}
                readOnly={
                  color.plateSizeType === "Auto"
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
            value={color.pantoneType || ""}
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
          <SelectField
            value={color.plateType || "Polymer Plate"}
            onChange={(e) =>
              handleColorDetailsChange(index, "plateType", e.target.value)
            }
            options={["Polymer Plate"]}
          />
          {errors[`plateType_${index}`] && (
            <p className="text-red-500 text-sm">
              {errors[`plateType_${index}`]}
            </p>
          )}
        </div>

        {/* MR Type */}
        <div className="flex-1">
          <div className="mb-1">MR Type:</div>
          <SelectField
            value={color.mrType || "Simple"}
            onChange={(e) =>
              handleColorDetailsChange(index, "mrType", e.target.value)
            }
            options={["Simple", "Complex", "Super Complex"]}
          />
          {errors[`mrType_${index}`] && (
            <p className="text-red-500 text-sm">
              {errors[`mrType_${index}`]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LPDetailsSection;