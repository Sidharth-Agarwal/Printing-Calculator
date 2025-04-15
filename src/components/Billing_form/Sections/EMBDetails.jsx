import React, { useEffect, useState } from "react";

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

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // NOTE: Toggle function removed as it's now handled in the parent component

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
                placeholder="Length (cm)"
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
                placeholder="Breadth (cm)"
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

        {/* Plate Type Male */}
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
            <option value="">Select Plate Type Male</option>
            <option value="Polymer Plate">Polymer Plate</option>
          </select>
          {errors.plateTypeMale && (
            <p className="text-red-500 text-sm">{errors.plateTypeMale}</p>
          )}
        </div>

        {/* Plate Type Female */}
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
            <option value="">Select Plate Type Female</option>
            <option value="Polymer Plate">Polymer Plate</option>
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
            <option value="">Select MR Type</option>
            <option value="Simple">Simple</option>
            <option value="Complex">Complex</option>
            <option value="Super Complex">Super Complex</option>
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