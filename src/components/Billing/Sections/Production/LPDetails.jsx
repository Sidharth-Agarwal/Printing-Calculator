import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

const LPDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});
  
  // Use the custom hooks to fetch LP MR types and plate types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("LP MR");
  const { materials: plateTypes, loading: plateTypesLoading } = useMaterialTypes("Plate Type");

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

      // Special handling for mrType to also set the concatenated version
      if (field === "mrType" && mrTypes.length > 0) {
        const selectedMRType = mrTypes.find(type => type.type === value);
        if (selectedMRType && selectedMRType.concatenated) {
          updatedDetails[index].mrTypeConcatenated = selectedMRType.concatenated;
        } else {
          // Fallback: create concatenated version if not found
          updatedDetails[index].mrTypeConcatenated = `LP MR ${value}`;
        }
      }
    }

    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  };

  const generateColorDetails = (noOfColors) => {
    // Get the default MR type from the fetched list, or fallback to "SIMPLE"
    const defaultMRType = mrTypes.length > 0 ? 
      { type: mrTypes[0].type, concatenated: mrTypes[0].concatenated } : 
      { type: "SIMPLE", concatenated: "LP MR SIMPLE" };
    
    // Get the default plate type from the fetched list, or fallback to "Polymer Plate"
    const defaultPlateType = plateTypes.length > 0 ? plateTypes[0].materialName : "Polymer Plate";

    const details = Array.from({ length: noOfColors }, (_, index) => ({
      plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "Auto", // Default to "Auto"
      plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
        length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
      },
      pantoneType: lpDetails.colorDetails[index]?.pantoneType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || defaultPlateType, // Use first plate type from API
      mrType: lpDetails.colorDetails[index]?.mrType || defaultMRType.type, // Use first MR type from API
      mrTypeConcatenated: lpDetails.colorDetails[index]?.mrTypeConcatenated || defaultMRType.concatenated // Store concatenated version
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
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Update dimensions when die size changes (for Auto mode)
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
  }, [lpDetails.isLPUsed, dieSize, dispatch, lpDetails.colorDetails]);

  // Set default MR Types when MR types are loaded and colors have null/empty MR types
  useEffect(() => {
    if (lpDetails.isLPUsed && mrTypes.length > 0 && lpDetails.colorDetails.length > 0) {
      const defaultMRType = mrTypes[0];
      
      // Check if any color has an empty/missing MR type
      const needsMRTypeUpdate = lpDetails.colorDetails.some(color => !color.mrType || !color.mrTypeConcatenated);
      
      if (needsMRTypeUpdate) {
        const updatedDetails = lpDetails.colorDetails.map(color => ({
          ...color,
          mrType: color.mrType || defaultMRType.type,
          mrTypeConcatenated: color.mrTypeConcatenated || defaultMRType.concatenated || `LP MR ${defaultMRType.type}`
        }));
        
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [mrTypes, lpDetails.isLPUsed, lpDetails.colorDetails, dispatch]);

  // Set default plate types when plate types are loaded and colors have null/empty plate types
  useEffect(() => {
    if (lpDetails.isLPUsed && plateTypes.length > 0 && lpDetails.colorDetails.length > 0) {
      const defaultPlateType = plateTypes[0].materialName;
      
      // Check if any color has an empty/missing plate type
      const needsPlateTypeUpdate = lpDetails.colorDetails.some(color => !color.plateType);
      
      if (needsPlateTypeUpdate) {
        const updatedDetails = lpDetails.colorDetails.map(color => ({
          ...color,
          plateType: color.plateType || defaultPlateType
        }));
        
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [plateTypes, lpDetails.isLPUsed, lpDetails.colorDetails, dispatch]);

  // When LP is not used, we don't need to show any content
  if (!lpDetails.isLPUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Plate Type - Updated to use dynamic plate types from the materials hook */}
                <div className="flex-1">
                  <div className="mb-1">Plate Type:</div>
                  <select
                    value={lpDetails.colorDetails[index]?.plateType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "plateType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    {plateTypesLoading ? (
                      <option value="" disabled>Loading Plate Types...</option>
                    ) : (
                      plateTypes.map((plateType, idx) => (
                        <option key={idx} value={plateType.materialName}>
                          {plateType.materialName}
                        </option>
                      ))
                    )}
                  </select>
                  {errors[`plateType_${index}`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`plateType_${index}`]}
                    </p>
                  )}
                </div>

                {/* MR Type - Updated to use dynamic MR types and store concatenated version */}
                <div className="flex-1">
                  <div className="mb-1">MR Type:</div>
                  <select
                    value={lpDetails.colorDetails[index]?.mrType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "mrType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    {mrTypesLoading ? (
                      <option value="" disabled>Loading MR Types...</option>
                    ) : (
                      mrTypes.map((typeOption, idx) => (
                        <option key={idx} value={typeOption.type}>
                          {typeOption.type}
                        </option>
                      ))
                    )}
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

      {!singlePageMode && (
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
      )}
    </form>
  );
};

export default LPDetails;