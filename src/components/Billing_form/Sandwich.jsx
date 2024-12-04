import React from "react";

const Sandwich = ({ state, dispatch, onPrevious, onNext }) => {
  const {
    isSandwichComponentUsed = false,
    lpDetails = {},
    fsDetails = {},
    embDetails = {},
  } = state.sandwich || {};

  const handleChange = (section, field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        [section]: {
          ...state.sandwich[section],
          [field]: value,
        },
      },
    });
  };

  const handleToggle = (field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: { [field]: value },
    });
  };

  const handleNestedChange = (section, field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        [section]: {
          ...state.sandwich[section],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich Component</h2>

      {/* Sandwich Component Toggle */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSandwichComponentUsed}
            onChange={(e) => handleToggle("isSandwichComponentUsed", e.target.checked)}
            className="mr-2"
          />
          Is Sandwich Component being used?
        </label>
      </div>

      {isSandwichComponentUsed && (
        <>
          {/* LP Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">LP Details</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={lpDetails.isLPUsed || false}
                onChange={(e) => handleChange("lpDetails", "isLPUsed", e.target.checked)}
                className="mr-2"
              />
              Is LP being used?
            </label>

            {lpDetails.isLPUsed && (
              <>
                <div>
                  <label>No of Colors:</label>
                  <input
                    type="number"
                    value={lpDetails.noOfColors || 1}
                    min="1"
                    max="10"
                    onChange={(e) =>
                      handleChange("lpDetails", "noOfColors", parseInt(e.target.value))
                    }
                    className="border rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label>Plate Size:</label>
                  <select
                    value={lpDetails.plateSizeType || ""}
                    onChange={(e) =>
                      handleChange("lpDetails", "plateSizeType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Size Type</option>
                    <option value="Auto">Auto</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                {lpDetails.plateSizeType === "Manual" && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Length (cm)"
                      value={lpDetails.plateDimensions?.length || ""}
                      onChange={(e) =>
                        handleNestedChange("lpDetails", "plateDimensions", {
                          ...lpDetails.plateDimensions,
                          length: e.target.value,
                        })
                      }
                      className="border rounded-md p-2"
                    />
                    <input
                      type="number"
                      placeholder="Breadth (cm)"
                      value={lpDetails.plateDimensions?.breadth || ""}
                      onChange={(e) =>
                        handleNestedChange("lpDetails", "plateDimensions", {
                          ...lpDetails.plateDimensions,
                          breadth: e.target.value,
                        })
                      }
                      className="border rounded-md p-2"
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {/* FS Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">FS Details</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fsDetails.isFSUsed || false}
                onChange={(e) => handleChange("fsDetails", "isFSUsed", e.target.checked)}
                className="mr-2"
              />
              Is FS being used?
            </label>

            {fsDetails.isFSUsed && (
              <>
                <div>
                  <label>FS Type:</label>
                  <select
                    value={fsDetails.fsType || ""}
                    onChange={(e) => handleChange("fsDetails", "fsType", e.target.value)}
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
              </>
            )}
          </section>

          {/* EMB Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">EMB Details</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={embDetails.isEMBUsed || false}
                onChange={(e) => handleChange("embDetails", "isEMBUsed", e.target.checked)}
                className="mr-2"
              />
              Is EMB being used?
            </label>

            {embDetails.isEMBUsed && (
              <>
                <div>
                  <label>Plate Size:</label>
                  <select
                    value={embDetails.plateSizeType || ""}
                    onChange={(e) =>
                      handleChange("embDetails", "plateSizeType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Size Type</option>
                    <option value="Auto">Auto</option>
                    <option value="Manual">Manual</option>
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
