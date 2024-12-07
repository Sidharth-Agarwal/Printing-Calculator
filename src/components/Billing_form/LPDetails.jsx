import React from "react";

const LPDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [], // Holds plate size, ink type, plate type, MR type for each color
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isLPUsed" && !checked) {
      // Reset noOfColors to 0 and clear colorDetails if LP is not used
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: {
          isLPUsed: false,
          noOfColors: 0,
          colorDetails: [],
        },
      });
    } else {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: {
          [name]: type === "checkbox" ? checked : value,
        },
      });

      if (name === "noOfColors") {
        generateColorDetails(value);
      }
    }
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetails.colorDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
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
      inkType: lpDetails.colorDetails[index]?.inkType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || "",
      mrType: lpDetails.colorDetails[index]?.mrType || "",
    }));
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: details },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">LP Details</h2>
      <label className="flex items-center">
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
            <label>No of Colors:</label>
            <input
              type="number"
              name="noOfColors"
              value={lpDetails.noOfColors}
              min="1"
              max="10"
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Color Details</h3>
            {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50"
              >
                <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

                {/* Plate Size Type */}
                <div>
                  <label>Plate Size:</label>
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
                </div>

                {/* Manual Plate Dimensions */}
                {lpDetails.colorDetails[index]?.plateSizeType === "Manual" && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <input
                      type="number"
                      name="length"
                      placeholder="Length (cm)"
                      value={
                        lpDetails.colorDetails[index]?.plateDimensions?.length ||
                        ""
                      }
                      onChange={(e) =>
                        handleColorDetailsChange(index, "plateDimensions", {
                          ...lpDetails.colorDetails[index]?.plateDimensions,
                          length: e.target.value,
                        })
                      }
                      className="border rounded-md p-2"
                    />
                    <input
                      type="number"
                      name="breadth"
                      placeholder="Breadth (cm)"
                      value={
                        lpDetails.colorDetails[index]?.plateDimensions
                          ?.breadth || ""
                      }
                      onChange={(e) =>
                        handleColorDetailsChange(index, "plateDimensions", {
                          ...lpDetails.colorDetails[index]?.plateDimensions,
                          breadth: e.target.value,
                        })
                      }
                      className="border rounded-md p-2"
                    />
                  </div>
                )}

                {/* Ink Type */}
                <div>
                  <label>Ink Type:</label>
                  <select
                    value={lpDetails.colorDetails[index]?.inkType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(index, "inkType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Ink Type</option>
                    {[
                      "Ink Black",
                      "Ink Cyan",
                      "Ink Magenta",
                      "Ink Varnish",
                      "Ink Milk White",
                      "Ink Opaque White",
                      "Ink White",
                      "Ink Yellow",
                    ].map((ink, idx) => (
                      <option key={idx} value={ink}>
                        {ink}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plate Type */}
                <div>
                  <label>Plate Type:</label>
                  <select
                    value={lpDetails.colorDetails[index]?.plateType || ""}
                    onChange={(e) =>
                      handleColorDetailsChange(
                        index,
                        "plateType",
                        e.target.value
                      )
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Type</option>
                    <option value="Polymer Plate">Polymer Plate</option>
                  </select>
                </div>

                {/* MR Type */}
                <div>
                  <label>MR Type:</label>
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
                </div>
              </div>
            ))}
          </div>
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
