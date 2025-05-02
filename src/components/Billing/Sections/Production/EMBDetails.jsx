import React, { useEffect, useState } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

const EMBDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "", lengthInInches: "", breadthInInches: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
    embMRConcatenated = ""
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  // Use the custom hooks to fetch data
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("EMB MR");
  const { materials: plateTypes, loading: plateTypesLoading } = useMaterialTypes("Plate Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Set default MR Type when component mounts or when EMB is first enabled
  useEffect(() => {
    if (isEMBUsed && mrTypes.length > 0) {
      const defaultMRType = mrTypes[0];
      const updates = {};
      
      // Set embMR if it's empty
      if (!embMR) {
        updates.embMR = defaultMRType.type;
      }
      
      // Set embMRConcatenated if it's empty
      if (!embMRConcatenated) {
        updates.embMRConcatenated = defaultMRType.concatenated || `EMB MR ${defaultMRType.type}`;
      }
      
      // Only dispatch if we have updates
      if (Object.keys(updates).length > 0) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: updates
        });
      }
    }
  }, [isEMBUsed, embMR, embMRConcatenated, mrTypes, dispatch]);

  // Set default plate types when component mounts or when EMB is first enabled
  useEffect(() => {
    if (isEMBUsed && plateTypes.length > 0) {
      const defaultPlateType = plateTypes[0].materialName;
      const updates = {};
      
      // Set plateTypeMale if it's empty
      if (!plateTypeMale) {
        updates.plateTypeMale = defaultPlateType;
      }
      
      // Set plateTypeFemale if it's empty
      if (!plateTypeFemale) {
        updates.plateTypeFemale = defaultPlateType;
      }
      
      // Only dispatch if we have updates
      if (Object.keys(updates).length > 0) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: updates
        });
      }
    }
  }, [isEMBUsed, plateTypes, plateTypeMale, plateTypeFemale, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for embMR to also set the concatenated version
    if (name === "embMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      
      if (selectedMRType && selectedMRType.concatenated) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { 
            embMR: value,
            embMRConcatenated: selectedMRType.concatenated
          },
        });
      } else {
        // Fallback: create concatenated version if not found
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { 
            embMR: value,
            embMRConcatenated: `EMB MR ${value}`
          },
        });
      }
    } else {
      // Handle other fields normally
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: { [name]: value },
      });
    }

    // Handle automatic dimension updates for plate size
    if (name === "plateSizeType" && value === "Auto") {
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: {
            length: lengthCm,
            breadth: breadthCm,
            lengthInInches: dieSize.length || "",
            breadthInInches: dieSize.breadth || ""
          },
        },
      });
    }

    if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: { 
            length: "", 
            breadth: "",
            lengthInInches: "",
            breadthInInches: ""
          },
        },
      });
    }
  };

  const handleDimensionChange = (field, value) => {
    // Store both the original inches value and the converted cm value
    let updatedDimensions = { ...plateDimensions };
    
    if (field === "length") {
      // Store the original inches value
      updatedDimensions.lengthInInches = value;
      // Convert to cm for storage
      updatedDimensions.length = value ? inchesToCm(value).toFixed(2) : "";
    } else if (field === "breadth") {
      // Store the original inches value
      updatedDimensions.breadthInInches = value;
      // Convert to cm for storage
      updatedDimensions.breadth = value ? inchesToCm(value).toFixed(2) : "";
    }
    
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        plateDimensions: updatedDimensions,
      },
    });
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isEMBUsed) {
      if (!plateSizeType) validationErrors.plateSizeType = "Plate Size Type is required.";
      if (plateSizeType === "Manual") {
        if (!plateDimensions.lengthInInches) validationErrors.length = "Length is required.";
        if (!plateDimensions.breadthInInches) validationErrors.breadth = "Breadth is required.";
      }
      if (!plateTypeMale) validationErrors.plateTypeMale = "Plate Type Male is required.";
      if (!plateTypeFemale) validationErrors.plateTypeFemale = "Plate Type Female is required.";
      if (!embMR) validationErrors.embMR = "EMB MR Type is required.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  useEffect(() => {
    if (isEMBUsed && plateSizeType === "Auto") {
      // Update plate dimensions when die size changes (for Auto mode)
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      const updatedDimensions = {
        length: lengthCm,
        breadth: breadthCm,
        lengthInInches: dieSize.length || "",
        breadthInInches: dieSize.breadth || ""
      };

      const needsUpdate = 
        plateDimensions.length !== updatedDimensions.length || 
        plateDimensions.breadth !== updatedDimensions.breadth ||
        plateDimensions.lengthInInches !== updatedDimensions.lengthInInches ||
        plateDimensions.breadthInInches !== updatedDimensions.breadthInInches;

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { plateDimensions: updatedDimensions },
        });
      }
    }
  }, [dieSize, isEMBUsed, plateSizeType, plateDimensions, dispatch]);

  // If EMB is not used, don't render any content
  if (!isEMBUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Plate Size Type */}
        <div>
          <label htmlFor="plateSizeType" className="block mb-1">
            Plate Size:
          </label>
          <select
            name="plateSizeType"
            value={plateSizeType}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.plateSizeType ? "border-red-500" : ""}`}
          >
            <option value="">Select Plate Size Type</option>
            <option value="Auto">Auto</option>
            <option value="Manual">Manual</option>
          </select>
          {errors.plateSizeType && (
            <p className="text-red-500 text-sm">{errors.plateSizeType}</p>
          )}
        </div>

        {/* Plate Dimensions - Show only when plateSizeType is selected */}
        {plateSizeType && (
          <>
            <div>
              <label htmlFor="length" className="block mb-1">
                Length (inches):
              </label>
              <input
                type="number"
                id="length"
                placeholder="(inches)"
                value={plateDimensions.lengthInInches || ""}
                onChange={(e) =>
                  plateSizeType === "Manual"
                    ? handleDimensionChange("length", e.target.value)
                    : null
                }
                className={`border rounded-md p-2 w-full ${
                  plateSizeType === "Auto" ? "bg-gray-100" : ""
                } ${errors.length ? "border-red-500" : ""}`}
                readOnly={plateSizeType === "Auto"}
              />
              <div className="text-xs text-gray-500 mt-1">
                {plateDimensions.length ? `${plateDimensions.length} cm` : ""}
              </div>
              {errors.length && <p className="text-red-500 text-sm">{errors.length}</p>}
            </div>
            <div>
              <label htmlFor="breadth" className="block mb-1">
                Breadth (inches):
              </label>
              <input
                type="number"
                id="breadth"
                placeholder="(inches)"
                value={plateDimensions.breadthInInches || ""}
                onChange={(e) =>
                  plateSizeType === "Manual"
                    ? handleDimensionChange("breadth", e.target.value)
                    : null
                }
                className={`border rounded-md p-2 w-full ${
                  plateSizeType === "Auto" ? "bg-gray-100" : ""
                } ${errors.breadth ? "border-red-500" : ""}`}
                readOnly={plateSizeType === "Auto"}
              />
              <div className="text-xs text-gray-500 mt-1">
                {plateDimensions.breadth ? `${plateDimensions.breadth} cm` : ""}
              </div>
              {errors.breadth && <p className="text-red-500 text-sm">{errors.breadth}</p>}
            </div>
          </>
        )}

        {/* Plate Type Male - Updated to use dynamic plate types */}
        <div>
          <label htmlFor="plateTypeMale" className="block mb-1">
            Plate Type Male:
          </label>
          <select
            name="plateTypeMale"
            value={plateTypeMale}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.plateTypeMale ? "border-red-500" : ""}`}
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
          {errors.plateTypeMale && (
            <p className="text-red-500 text-sm">{errors.plateTypeMale}</p>
          )}
        </div>

        {/* Plate Type Female - Updated to use dynamic plate types */}
        <div>
          <label htmlFor="plateTypeFemale" className="block mb-1">
            Plate Type Female:
          </label>
          <select
            name="plateTypeFemale"
            value={plateTypeFemale}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.plateTypeFemale ? "border-red-500" : ""}`}
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
          {errors.plateTypeFemale && (
            <p className="text-red-500 text-sm">{errors.plateTypeFemale}</p>
          )}
        </div>

        {/* EMB MR - Updated to use dynamic MR types and store concatenated version */}
        <div>
          <label htmlFor="embMR" className="block mb-1">
            EMB MR:
          </label>
          <select
            name="embMR"
            value={embMR}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full ${errors.embMR ? "border-red-500" : ""}`}
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
          {errors.embMR && <p className="text-red-500 text-sm">{errors.embMR}</p>}
        </div>
      </div>
    </form>
  );
};

export default EMBDetails;