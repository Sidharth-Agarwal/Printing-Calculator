import React, { useEffect, useState } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

const EMBDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  // Use the custom hooks to fetch data
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("EMB MR");
  const { materials: plateTypes, loading: plateTypesLoading } = useMaterialTypes("Plate Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Set default MR Type when component mounts or when EMB is first enabled
  useEffect(() => {
    if (isEMBUsed && mrTypes.length > 0 && !embMR) {
      // Use the first MR type from the fetched list as default
      const defaultMRType = mrTypes[0].type;
      
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: { embMR: defaultMRType }
      });
    }
  }, [isEMBUsed, embMR, mrTypes, dispatch]);

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
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: value },
    });

    if (name === "plateSizeType" && value === "Auto") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          },
        },
      });
    }

    if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: { length: "", breadth: "" },
        },
      });
    }
  };

  const handleDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        plateDimensions: {
          ...plateDimensions,
          [field]: value,
        },
      },
    });
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isEMBUsed) {
      if (!plateSizeType) validationErrors.plateSizeType = "Plate Size Type is required.";
      if (plateSizeType === "Manual") {
        if (!plateDimensions.length) validationErrors.length = "Length is required.";
        if (!plateDimensions.breadth) validationErrors.breadth = "Breadth is required.";
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
      const updatedDimensions = {
        length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
      };

      const needsUpdate = 
        plateDimensions.length !== updatedDimensions.length || 
        plateDimensions.breadth !== updatedDimensions.breadth;

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
                Length (cm):
              </label>
              <input
                type="number"
                id="length"
                placeholder="(cm)"
                value={plateDimensions.length || ""}
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
              {errors.length && <p className="text-red-500 text-sm">{errors.length}</p>}
            </div>
            <div>
              <label htmlFor="breadth" className="block mb-1">
                Breadth (cm):
              </label>
              <input
                type="number"
                id="breadth"
                placeholder="(cm)"
                value={plateDimensions.breadth || ""}
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

        {/* EMB MR */}
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

      {!singlePageMode && (
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
      )}
    </form>
  );
};

export default EMBDetails;