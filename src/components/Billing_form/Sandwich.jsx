import React, { useState } from "react";

const Sandwich = ({ state, dispatch, onNext, onPrevious }) => {
  const { isSandwichComponentUsed = false } = state.sandwich || {};
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  const toggleComponentUsage = (section) => {
    const isCurrentlyUsed = state.sandwich[section]?.isUsed || false;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        [section]: {
          ...state.sandwich[section],
          isUsed: !isCurrentlyUsed,
          ...(section === "lpDetailsSandwich" && {
            noOfColors: !isCurrentlyUsed ? 1 : 0,
            colorDetails: !isCurrentlyUsed
              ? [
                  {
                    plateSizeType: "",
                    plateDimensions: { length: "", breadth: "" },
                    pantoneType: "",
                    plateType: "",
                    mrType: "",
                  },
                ]
              : [],
          }),
          ...(section === "fsDetailsSandwich" && {
            fsType: !isCurrentlyUsed ? "FS1" : "",
            foilDetails: !isCurrentlyUsed
              ? [
                  {
                    blockSizeType: "",
                    blockDimension: { length: "", breadth: "" },
                    foilType: "",
                    blockType: "",
                    mrType: "",
                  },
                ]
              : [],
          }),
          ...(section === "embDetailsSandwich" && {
            plateSizeType: "",
            plateDimensions: { length: "", breadth: "" },
            plateTypeMale: "",
            plateTypeFemale: "",
            embMR: "",
          }),
        },
      },
    });
  };

  const handleColorChange = (section, index, field, value) => {
    const updatedDetails = [...state.sandwich[section].colorDetails];
    updatedDetails[index][field] = value;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        [section]: {
          ...state.sandwich[section],
          colorDetails: updatedDetails,
        },
      },
    });
  };

  const handleFoilChange = (index, field, value) => {
    const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
    updatedFoilDetails[index][field] = value;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...state.sandwich.fsDetailsSandwich,
          foilDetails: updatedFoilDetails,
        },
      },
    });
  };

  const handleDimensionChange = (section, field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        [section]: {
          ...state.sandwich[section],
          plateDimensions: {
            ...state.sandwich[section].plateDimensions,
            [field]: value,
          },
        },
      },
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Add any required validations if needed before moving to the next step
    if (onNext) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">SANDWICH DETAILS</h2>

      {/* Main Sandwich Toggle */}
      <div className="flex items-center space-x-3 cursor-pointer">
        <label
          className="flex items-center space-x-3"
          onClick={() =>
            dispatch({
              type: "UPDATE_SANDWICH",
              payload: { isSandwichComponentUsed: !isSandwichComponentUsed },
            })
          }
        >
          <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
            {isSandwichComponentUsed && (
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            )}
          </div>
          <span className="text-gray-700 font-semibold text-sm">
            Use Sandwich Component?
          </span>
        </label>
      </div>

      {isSandwichComponentUsed && (
        <div className="space-y-8">
          {/* LP Section */}
          <div className="border-t pt-4">
            <h3 className="text-medium font-semibold mb-4">LETTER PRESS (LP) DETAILS</h3>

            {/* Toggle LP Usage */}
            <div className="flex items-center space-x-3 cursor-pointer">
              <label
                className="flex items-center space-x-3"
                onClick={() =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      lpDetailsSandwich: {
                        ...state.sandwich.lpDetailsSandwich,
                        isLPUsed: !state.sandwich.lpDetailsSandwich?.isLPUsed,
                        noOfColors: !state.sandwich.lpDetailsSandwich?.isLPUsed ? 1 : 0,
                        colorDetails: !state.sandwich.lpDetailsSandwich?.isLPUsed
                          ? [
                              {
                                plateSizeType: "",
                                plateDimensions: { length: "", breadth: "" },
                                pantoneType: "",
                                plateType: "",
                                mrType: "",
                              },
                            ]
                          : [],
                      },
                    },
                  })
                }
              >
                <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
                  {state.sandwich.lpDetailsSandwich?.isLPUsed && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span className="text-gray-700 font-semibold text-sm">Use LP Component?</span>
              </label>
            </div>

            {state.sandwich.lpDetailsSandwich?.isLPUsed && (
              <div className="space-y-4 text-sm">
                {/* Number of Colors */}
                <div>
                  <label className="block mt-4 mb-1 font-medium">Number of Colors:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={state.sandwich.lpDetailsSandwich.noOfColors || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          lpDetailsSandwich: {
                            ...state.sandwich.lpDetailsSandwich,
                            noOfColors: parseInt(e.target.value, 10) || 0,
                            colorDetails: Array.from(
                              { length: parseInt(e.target.value, 10) || 0 },
                              (_, index) => ({
                                plateSizeType:
                                  state.sandwich.lpDetailsSandwich.colorDetails[index]
                                    ?.plateSizeType || "",
                                plateDimensions:
                                  state.sandwich.lpDetailsSandwich.colorDetails[index]
                                    ?.plateDimensions || { length: "", breadth: "" },
                                pantoneType:
                                  state.sandwich.lpDetailsSandwich.colorDetails[index]
                                    ?.pantoneType || "",
                                plateType:
                                  state.sandwich.lpDetailsSandwich.colorDetails[index]
                                    ?.plateType || "",
                                mrType:
                                  state.sandwich.lpDetailsSandwich.colorDetails[index]
                                    ?.mrType || "",
                              })
                            ),
                          },
                        },
                      })
                    }
                    className="border rounded-md p-2 w-full"
                  />
                </div>

                {/* Color Details */}
                {state.sandwich.lpDetailsSandwich.colorDetails.map((color, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md bg-gray-50 space-y-4"
                  >
                    <h4 className="font-semibold">Color {index + 1}</h4>
                    <div className="flex flex-wrap gap-4">
                      {/* Plate Size Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Plate Size Type:</label>
                        <select
                          value={color.plateSizeType || ""}
                          onChange={(e) => {
                            const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                            updatedDetails[index] = {
                              ...updatedDetails[index],
                              plateSizeType: e.target.value,
                              plateDimensions:
                                e.target.value === "Auto"
                                  ? {
                                      length: dieSize.length
                                        ? (parseFloat(dieSize.length) * 2.54).toFixed(2)
                                        : "",
                                      breadth: dieSize.breadth
                                        ? (parseFloat(dieSize.breadth) * 2.54).toFixed(2)
                                        : "",
                                    }
                                  : { length: "", breadth: "" },
                            };
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                lpDetailsSandwich: {
                                  ...state.sandwich.lpDetailsSandwich,
                                  colorDetails: updatedDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select Plate Size Type</option>
                          <option value="Auto">Auto</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>

                      {/* Dimensions */}
                      {color.plateSizeType && (
                        <div className="flex flex-wrap gap-4 flex-1">
                          <div className="flex-1">
                            <label className="block mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(cm)"
                              value={color.plateDimensions.length || ""}
                              onChange={(e) => {
                                const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                                updatedDetails[index].plateDimensions.length =
                                  e.target.value;
                                dispatch({
                                  type: "UPDATE_SANDWICH",
                                  payload: {
                                    lpDetailsSandwich: {
                                      ...state.sandwich.lpDetailsSandwich,
                                      colorDetails: updatedDetails,
                                    },
                                  },
                                });
                              }}
                              className={`border rounded-md p-2 w-full ${
                                color.plateSizeType === "Auto" ? "bg-gray-100" : ""
                              }`}
                              readOnly={color.plateSizeType === "Auto"}
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(cm)"
                              value={color.plateDimensions.breadth || ""}
                              onChange={(e) => {
                                const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                                updatedDetails[index].plateDimensions.breadth =
                                  e.target.value;
                                dispatch({
                                  type: "UPDATE_SANDWICH",
                                  payload: {
                                    lpDetailsSandwich: {
                                      ...state.sandwich.lpDetailsSandwich,
                                      colorDetails: updatedDetails,
                                    },
                                  },
                                });
                              }}
                              className={`border rounded-md p-2 w-full ${
                                color.plateSizeType === "Auto" ? "bg-gray-100" : ""
                              }`}
                              readOnly={color.plateSizeType === "Auto"}
                            />
                          </div>
                        </div>
                      )}

                      {/* Pantone Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Pantone Type:</label>
                        <input
                          type="text"
                          placeholder="Pantone Type"
                          value={color.pantoneType || ""}
                          onChange={(e) => {
                            const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                            updatedDetails[index].pantoneType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                lpDetailsSandwich: {
                                  ...state.sandwich.lpDetailsSandwich,
                                  colorDetails: updatedDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        />
                      </div>

                      {/* Plate Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Plate Type:</label>
                        <select
                          value={color.plateType || ""}
                          onChange={(e) => {
                            const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                            updatedDetails[index].plateType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                lpDetailsSandwich: {
                                  ...state.sandwich.lpDetailsSandwich,
                                  colorDetails: updatedDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select Plate Type</option>
                          <option value="Polymer Plate">Polymer Plate</option>
                        </select>
                      </div>

                      {/* MR Type */}
                      <div className="flex-1">
                        <label className="block mb-1">MR Type:</label>
                        <select
                          value={color.mrType || ""}
                          onChange={(e) => {
                            const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                            updatedDetails[index].mrType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                lpDetailsSandwich: {
                                  ...state.sandwich.lpDetailsSandwich,
                                  colorDetails: updatedDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select MR Type</option>
                          <option value="Simple">Simple</option>
                          <option value="Complex">Complex</option>
                          <option value="Super Complex">Super Complex</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FS Section */}
          <div className="border-t pt-4">
            <h3 className="text-medium font-semibold mb-4">FOIL STAMPING (FS) DETAILS</h3>

            {/* Toggle FS Usage */}
            <div className="flex items-center space-x-3 cursor-pointer">
              <label
                className="flex items-center space-x-3"
                onClick={() =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      fsDetailsSandwich: {
                        ...state.sandwich.fsDetailsSandwich,
                        isFSUsed: !state.sandwich.fsDetailsSandwich?.isFSUsed,
                        fsType: !state.sandwich.fsDetailsSandwich?.isFSUsed ? "FS1" : "",
                        foilDetails: !state.sandwich.fsDetailsSandwich?.isFSUsed
                          ? [
                              {
                                blockSizeType: "",
                                blockDimension: { length: "", breadth: "" },
                                foilType: "",
                                blockType: "",
                                mrType: "",
                              },
                            ]
                          : [],
                      },
                    },
                  })
                }
              >
                <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
                  {state.sandwich.fsDetailsSandwich?.isFSUsed && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span className="text-gray-700 font-semibold text-sm">Use FS Component?</span>
              </label>
            </div>

            {state.sandwich.fsDetailsSandwich?.isFSUsed && (
              <div className="space-y-4 text-sm">
                {/* FS Type */}
                <div>
                  <label className="block mt-3 mb-1 font-medium">FS Type:</label>
                  <select
                    value={state.sandwich.fsDetailsSandwich.fsType || ""}
                    onChange={(e) => {
                      const numFoils = parseInt(e.target.value.replace("FS", ""), 10) || 0;
                      const updatedFoilDetails = Array.from({ length: numFoils }, () => ({
                        blockSizeType: "",
                        blockDimension: { length: "", breadth: "" },
                        foilType: "",
                        blockType: "",
                        mrType: "",
                      }));
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          fsDetailsSandwich: {
                            ...state.sandwich.fsDetailsSandwich,
                            fsType: e.target.value,
                            foilDetails: updatedFoilDetails,
                          },
                        },
                      });
                    }}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select FS Type</option>
                    <option value="FS1">FS1</option>
                    <option value="FS2">FS2</option>
                    <option value="FS3">FS3</option>
                    <option value="FS4">FS4</option>
                    <option value="FS5">FS5</option>
                  </select>
                </div>

                {/* Foil Details */}
                {state.sandwich.fsDetailsSandwich.foilDetails.map((foil, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md bg-gray-50 space-y-4"
                  >
                    <h4 className="font-semibold">Foil {index + 1}</h4>
                    <div className="flex flex-wrap gap-4">
                      {/* Block Size Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Block Size Type:</label>
                        <select
                          value={foil.blockSizeType || ""}
                          onChange={(e) => {
                            const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                            updatedFoilDetails[index] = {
                              ...updatedFoilDetails[index],
                              blockSizeType: e.target.value,
                              blockDimension:
                                e.target.value === "Auto"
                                  ? {
                                      length: dieSize.length
                                        ? (parseFloat(dieSize.length) * 2.54).toFixed(2)
                                        : "",
                                      breadth: dieSize.breadth
                                        ? (parseFloat(dieSize.breadth) * 2.54).toFixed(2)
                                        : "",
                                    }
                                  : { length: "", breadth: "" },
                            };
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                fsDetailsSandwich: {
                                  ...state.sandwich.fsDetailsSandwich,
                                  foilDetails: updatedFoilDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select Block Size Type</option>
                          <option value="Auto">Auto</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>

                      {/* Dimensions */}
                      {foil.blockSizeType && (
                        <div className="flex flex-wrap gap-4 flex-1">
                          <div className="flex-1">
                            <label className="block mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(cm)"
                              value={foil.blockDimension.length || ""}
                              onChange={(e) => {
                                const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                                updatedFoilDetails[index].blockDimension.length =
                                  e.target.value;
                                dispatch({
                                  type: "UPDATE_SANDWICH",
                                  payload: {
                                    fsDetailsSandwich: {
                                      ...state.sandwich.fsDetailsSandwich,
                                      foilDetails: updatedFoilDetails,
                                    },
                                  },
                                });
                              }}
                              className={`border rounded-md p-2 w-full ${
                                foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                              }`}
                              readOnly={foil.blockSizeType === "Auto"}
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(cm)"
                              value={foil.blockDimension.breadth || ""}
                              onChange={(e) => {
                                const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                                updatedFoilDetails[index].blockDimension.breadth =
                                  e.target.value;
                                dispatch({
                                  type: "UPDATE_SANDWICH",
                                  payload: {
                                    fsDetailsSandwich: {
                                      ...state.sandwich.fsDetailsSandwich,
                                      foilDetails: updatedFoilDetails,
                                    },
                                  },
                                });
                              }}
                              className={`border rounded-md p-2 w-full ${
                                foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                              }`}
                              readOnly={foil.blockSizeType === "Auto"}
                            />
                          </div>
                        </div>
                      )}

                      {/* Foil Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Foil Type:</label>
                        <select
                          value={foil.foilType || ""}
                          onChange={(e) => {
                            const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                            updatedFoilDetails[index].foilType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                fsDetailsSandwich: {
                                  ...state.sandwich.fsDetailsSandwich,
                                  foilDetails: updatedFoilDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select Foil Type</option>
                          <option value="Rosegold MTS 355">Rosegold MTS 355</option>
                          <option value="Gold MTS 220">Gold MTS 220</option>
                          <option value="White 911">White 911</option>
                          <option value="Blk MTS 362">Blk MTS 362</option>
                          <option value="Silver ALUFIN PMAL METALITE">
                            Silver ALUFIN PMAL METALITE
                          </option>
                          <option value="MTS 432 PINK">MTS 432 PINK</option>
                        </select>
                      </div>

                      {/* Block Type */}
                      <div className="flex-1">
                        <label className="block mb-1">Block Type:</label>
                        <select
                          value={foil.blockType || ""}
                          onChange={(e) => {
                            const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                            updatedFoilDetails[index].blockType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                fsDetailsSandwich: {
                                  ...state.sandwich.fsDetailsSandwich,
                                  foilDetails: updatedFoilDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select Block Type</option>
                          <option value="Magnesium Block 3MM">Magnesium Block 3MM</option>
                          <option value="Magnesium Block 4MM">Magnesium Block 4MM</option>
                          <option value="Magnesium Block 5MM">Magnesium Block 5MM</option>
                          <option value="Male Block">Male Block</option>
                          <option value="Female Block">Female Block</option>
                        </select>
                      </div>

                      {/* MR Type */}
                      <div className="flex-1">
                        <label className="block mb-1">MR Type:</label>
                        <select
                          value={foil.mrType || ""}
                          onChange={(e) => {
                            const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                            updatedFoilDetails[index].mrType = e.target.value;
                            dispatch({
                              type: "UPDATE_SANDWICH",
                              payload: {
                                fsDetailsSandwich: {
                                  ...state.sandwich.fsDetailsSandwich,
                                  foilDetails: updatedFoilDetails,
                                },
                              },
                            });
                          }}
                          className="border rounded-md p-2 w-full"
                        >
                          <option value="">Select MR Type</option>
                          <option value="Simple">Simple</option>
                          <option value="Complex">Complex</option>
                          <option value="Super Complex">Super Complex</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EMB Section */}
          <div className="border-t pt-4">
            <h3 className="text-medium font-semibold mb-4">EMBOSSING (EMB) DETAILS</h3>

            {/* Toggle EMB Usage */}
            <div className="flex items-center space-x-3 cursor-pointer mb-4">
              <label
                className="flex items-center space-x-3"
                onClick={() =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      embDetailsSandwich: {
                        ...state.sandwich.embDetailsSandwich,
                        isEMBUsed: !state.sandwich.embDetailsSandwich?.isEMBUsed,
                        plateSizeType: "",
                        plateDimensions: { length: "", breadth: "" },
                        plateTypeMale: "",
                        plateTypeFemale: "",
                        embMR: "",
                      },
                    },
                  })
                }
              >
                <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
                  {state.sandwich.embDetailsSandwich?.isEMBUsed && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span className="text-gray-700 font-semibold text-sm">Use EMB Component?</span>
              </label>
            </div>

            {state.sandwich.embDetailsSandwich?.isEMBUsed && (
              <div className="flex flex-wrap gap-4 text-sm">
                {/* Plate Size Type */}
                <div className="flex-1">
                  <label className="block mb-1">Plate Size Type:</label>
                  <select
                    name="plateSizeType"
                    value={state.sandwich.embDetailsSandwich.plateSizeType || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          embDetailsSandwich: {
                            ...state.sandwich.embDetailsSandwich,
                            plateSizeType: e.target.value,
                            plateDimensions:
                              e.target.value === "Auto"
                                ? {
                                    length: dieSize.length
                                      ? (parseFloat(dieSize.length) * 2.54).toFixed(2)
                                      : "",
                                    breadth: dieSize.breadth
                                      ? (parseFloat(dieSize.breadth) * 2.54).toFixed(2)
                                      : "",
                                  }
                                : { length: "", breadth: "" },
                          },
                        },
                      })
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Size</option>
                    <option value="Auto">Auto</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                {/* Length and Breadth Fields */}
                {state.sandwich.embDetailsSandwich.plateSizeType && (
                  <>
                    <div className="flex-1">
                      <label className="block mb-1">Length (cm):</label>
                      <input
                        type="number"
                        placeholder="Length"
                        value={state.sandwich.embDetailsSandwich.plateDimensions.length || ""}
                        onChange={(e) =>
                          state.sandwich.embDetailsSandwich.plateSizeType === "Manual"
                            ? dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: {
                                  embDetailsSandwich: {
                                    ...state.sandwich.embDetailsSandwich,
                                    plateDimensions: {
                                      ...state.sandwich.embDetailsSandwich.plateDimensions,
                                      length: e.target.value,
                                    },
                                  },
                                },
                              })
                            : null
                        }
                        className={`border rounded-md p-2 w-full ${
                          state.sandwich.embDetailsSandwich.plateSizeType === "Auto"
                            ? "bg-gray-100"
                            : ""
                        }`}
                        readOnly={state.sandwich.embDetailsSandwich.plateSizeType === "Auto"}
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block mb-1">Breadth (cm):</label>
                      <input
                        type="number"
                        placeholder="Breadth"
                        value={state.sandwich.embDetailsSandwich.plateDimensions.breadth || ""}
                        onChange={(e) =>
                          state.sandwich.embDetailsSandwich.plateSizeType === "Manual"
                            ? dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: {
                                  embDetailsSandwich: {
                                    ...state.sandwich.embDetailsSandwich,
                                    plateDimensions: {
                                      ...state.sandwich.embDetailsSandwich.plateDimensions,
                                      breadth: e.target.value,
                                    },
                                  },
                                },
                              })
                            : null
                        }
                        className={`border rounded-md p-2 w-full ${
                          state.sandwich.embDetailsSandwich.plateSizeType === "Auto"
                            ? "bg-gray-100"
                            : ""
                        }`}
                        readOnly={state.sandwich.embDetailsSandwich.plateSizeType === "Auto"}
                      />
                    </div>
                  </>
                )}

                {/* Plate Type Male */}
                <div className="flex-1">
                  <label className="block mb-1">Plate Type Male:</label>
                  <select
                    name="plateTypeMale"
                    value={state.sandwich.embDetailsSandwich.plateTypeMale || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          embDetailsSandwich: {
                            ...state.sandwich.embDetailsSandwich,
                            plateTypeMale: e.target.value,
                          },
                        },
                      })
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Type Male</option>
                    <option value="Polymer Plate">Polymer Plate</option>
                  </select>
                </div>

                {/* Plate Type Female */}
                <div className="flex-1">
                  <label className="block mb-1">Plate Type Female:</label>
                  <select
                    name="plateTypeFemale"
                    value={state.sandwich.embDetailsSandwich.plateTypeFemale || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          embDetailsSandwich: {
                            ...state.sandwich.embDetailsSandwich,
                            plateTypeFemale: e.target.value,
                          },
                        },
                      })
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select Plate Type Female</option>
                    <option value="Polymer Plate">Polymer Plate</option>
                  </select>
                </div>

                {/* EMB MR */}
                <div className="flex-1">
                  <label className="block mb-1">EMB MR:</label>
                  <select
                    name="embMR"
                    value={state.sandwich.embDetailsSandwich.embMR || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          embDetailsSandwich: {
                            ...state.sandwich.embDetailsSandwich,
                            embMR: e.target.value,
                          },
                        },
                      })
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
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
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
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Sandwich;
