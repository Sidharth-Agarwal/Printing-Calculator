import React, { useState } from "react";

const Sandwich = ({ state, dispatch, onNext, onPrevious }) => {
  const { isSandwichComponentUsed = false } = state.sandwich || {};
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const [errors, setErrors] = useState({});

  // Local state for Sandwich component details
  const [sandwichDetails, setSandwichDetails] = useState({
    lpDetailsSandwich: {
      isLPUsed: false,
      noOfColors: 0,
      colorDetails: [],
    },
    fsDetailsSandwich: {
      isFSUsed: false,
      fsType: "FS1",
      foilDetails: [],
    },
    embDetailsSandwich: {
      isEMBUsed: false,
      plateSizeType: "",
      plateDimensions: { length: "", breadth: "" },
      plateTypeMale: "",
      plateTypeFemale: "",
      embMR: "",
    },
  });

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  const handleToggle = (section, checked) => {
    setSandwichDetails((prevDetails) => ({
      ...prevDetails,
      [section]: {
        ...prevDetails[section],
        isUsed: checked,
      },
    }));
  };

  const handleFieldChange = (section, field, value) => {
    setSandwichDetails((prevDetails) => ({
      ...prevDetails,
      [section]: {
        ...prevDetails[section],
        [field]: value,
      },
    }));
  };

  const handleColorDetailsChange = (index, section, field, value) => {
    const updatedDetails = [...sandwichDetails[section].colorDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setSandwichDetails((prevDetails) => ({
      ...prevDetails,
      [section]: {
        ...prevDetails[section],
        colorDetails: updatedDetails,
      },
    }));
  };

  const validateFields = () => {
    const newErrors = {};

    // Validate LP Details
    if (sandwichDetails.lpDetailsSandwich.isLPUsed) {
      if (!sandwichDetails.lpDetailsSandwich.noOfColors) {
        newErrors.lpNoOfColors = "Number of colors is required";
      }
      sandwichDetails.lpDetailsSandwich.colorDetails.forEach((color, index) => {
        if (!color.plateSizeType)
          newErrors[`lpPlateSizeType_${index}`] = "Plate size type is required";
        if (color.plateSizeType === "Manual") {
          if (!color.plateDimensions.length)
            newErrors[`lpLength_${index}`] = "Length is required";
          if (!color.plateDimensions.breadth)
            newErrors[`lpBreadth_${index}`] = "Breadth is required";
        }
        if (!color.pantoneType)
          newErrors[`lpPantoneType_${index}`] = "Pantone type is required";
        if (!color.plateType)
          newErrors[`lpPlateType_${index}`] = "Plate type is required";
        if (!color.mrType)
          newErrors[`lpMRType_${index}`] = "MR type is required";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Sandwich Component</h2>

      {/* Main Sandwich Toggle */}
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isSandwichComponentUsed"
          checked={isSandwichComponentUsed}
          onChange={(e) =>
          dispatch({
              type: "UPDATE_SANDWICH",
              payload: { isSandwichComponentUsed: e.target.checked },
            })
          }
          className="mr-2"
        />
        Use Sandwich Component?
      </label>

      {isSandwichComponentUsed && (
        <div className="space-y-8">
          {/* LP Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Letter Press (LP) Details</h3>

            {/* Toggle LP Usage */}
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                name="isLPUsedSandwich"
                checked={state.sandwich.lpDetailsSandwich?.isLPUsed || false}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      lpDetailsSandwich: {
                        ...state.sandwich.lpDetailsSandwich,
                        isLPUsed: e.target.checked,
                        noOfColors: e.target.checked ? 1 : 0,
                        colorDetails: e.target.checked
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
                className="mr-2"
              />
              Use LP Component?
            </label>

            {/* LP Fields */}
            {state.sandwich.lpDetailsSandwich?.isLPUsed && (
              <div className="space-y-4">
                {/* Number of Colors */}
                <div>
                  <label className="block mb-1">Number of Colors:</label>
                  <input
                    type="number"
                    name="noOfColors"
                    min="1"
                    max="10"
                    value={state.sandwich.lpDetailsSandwich.noOfColors || ""}
                    onChange={(e) => {
                      const numColors = parseInt(e.target.value, 10) || 0;
                      const updatedColorDetails = Array.from({ length: numColors }, (_, index) => ({
                        plateSizeType: state.sandwich.lpDetailsSandwich.colorDetails[index]?.plateSizeType || "",
                        plateDimensions:
                          state.sandwich.lpDetailsSandwich.colorDetails[index]?.plateSizeType === "Auto"
                            ? {
                                length: dieSize.length
                                  ? (parseFloat(dieSize.length) * 2.54).toFixed(2)
                                  : "",
                                breadth: dieSize.breadth
                                  ? (parseFloat(dieSize.breadth) * 2.54).toFixed(2)
                                  : "",
                              }
                            : state.sandwich.lpDetailsSandwich.colorDetails[index]?.plateDimensions || {
                                length: "",
                                breadth: "",
                              },
                        pantoneType: state.sandwich.lpDetailsSandwich.colorDetails[index]?.pantoneType || "",
                        plateType: state.sandwich.lpDetailsSandwich.colorDetails[index]?.plateType || "",
                        mrType: state.sandwich.lpDetailsSandwich.colorDetails[index]?.mrType || "",
                      }));
                      dispatch({
                        type: "UPDATE_SANDWICH",
                        payload: {
                          lpDetailsSandwich: {
                            ...state.sandwich.lpDetailsSandwich,
                            noOfColors: numColors,
                            colorDetails: updatedColorDetails,
                          },
                        },
                      });
                    }}
                    className="border rounded-md p-2 w-full"
                  />
                </div>

                {/* Color Details */}
                {state.sandwich.lpDetailsSandwich.colorDetails.map((color, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
                    <h4 className="font-semibold">Color {index + 1}</h4>

                    {/* Plate Size Type */}
                    <div>
                      <label className="block mb-1">Plate Size Type:</label>
                      <select
                        value={color.plateSizeType || ""}
                        onChange={(e) => {
                          const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                          updatedDetails[index] = {
                            ...updatedDetails[index],
                            plateSizeType: e.target.value,
                            plateDimensions: e.target.value === "Auto"
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
                            payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="number"
                            placeholder="Length (cm)"
                            value={color.plateDimensions.length || ""}
                            onChange={(e) => {
                              const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                              updatedDetails[index].plateDimensions.length = e.target.value;
                              dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
                              });
                            }}
                            className={`border rounded-md p-2 w-full ${
                              color.plateSizeType === "Auto" ? "bg-gray-100" : ""
                            }`}
                            readOnly={color.plateSizeType === "Auto"}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Breadth (cm)"
                            value={color.plateDimensions.breadth || ""}
                            onChange={(e) => {
                              const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                              updatedDetails[index].plateDimensions.breadth = e.target.value;
                              dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
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
                    <div>
                      <label className="block mb-1">Pantone Type:</label>
                      <input
                        type="text"
                        value={color.pantoneType || ""}
                        onChange={(e) => {
                          const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                          updatedDetails[index].pantoneType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
                          });
                        }}
                        className="border rounded-md p-2 w-full"
                      />
                    </div>

                    {/* Plate Type */}
                    <div>
                      <label className="block mb-1">Plate Type:</label>
                      <select
                        value={color.plateType || ""}
                        onChange={(e) => {
                          const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                          updatedDetails[index].plateType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
                          });
                        }}
                        className="border rounded-md p-2 w-full"
                      >
                        <option value="">Select Plate Type</option>
                        <option value="Polymer Plate">Polymer Plate</option>
                      </select>
                    </div>

                    {/* MR Type */}
                    <div>
                      <label className="block mb-1">MR Type:</label>
                      <select
                        value={color.mrType || ""}
                        onChange={(e) => {
                          const updatedDetails = [...state.sandwich.lpDetailsSandwich.colorDetails];
                          updatedDetails[index].mrType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { lpDetailsSandwich: { ...state.sandwich.lpDetailsSandwich, colorDetails: updatedDetails } },
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
                ))}
              </div>
            )}
          </div>

          {/* FS Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Foil Stamping (FS) Details</h3>

            {/* Toggle FS Usage */}
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                name="isFSUsedSandwich"
                checked={state.sandwich.fsDetailsSandwich?.isFSUsed || false}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      fsDetailsSandwich: {
                        ...state.sandwich.fsDetailsSandwich,
                        isFSUsed: e.target.checked,
                        fsType: e.target.checked ? "FS1" : "",
                        foilDetails: e.target.checked
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
                className="mr-2"
              />
              Use FS Component?
            </label>

            {/* FS Fields */}
            {state.sandwich.fsDetailsSandwich?.isFSUsed && (
              <div className="space-y-4">
                {/* FS Type */}
                <div>
                  <label className="block mb-1">FS Type:</label>
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
                    <option value="FS1">FS1</option>
                    <option value="FS2">FS2</option>
                    <option value="FS3">FS3</option>
                    <option value="FS4">FS4</option>
                    <option value="FS5">FS5</option>
                  </select>
                </div>

                {/* Foil Details */}
                {state.sandwich.fsDetailsSandwich.foilDetails.map((foil, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
                    <h4 className="font-semibold">Foil {index + 1}</h4>

                    {/* Block Size Type */}
                    <div>
                      <label className="block mb-1">Block Size Type:</label>
                      <select
                        value={foil.blockSizeType || ""}
                        onChange={(e) => {
                          const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                          updatedFoilDetails[index] = {
                            ...updatedFoilDetails[index],
                            blockSizeType: e.target.value,
                            blockDimension: e.target.value === "Auto"
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
                            payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="number"
                            placeholder="Length (cm)"
                            value={foil.blockDimension.length || ""}
                            onChange={(e) => {
                              const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                              updatedFoilDetails[index].blockDimension.length = e.target.value;
                              dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
                              });
                            }}
                            className={`border rounded-md p-2 w-full ${
                              foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                            }`}
                            readOnly={foil.blockSizeType === "Auto"}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Breadth (cm)"
                            value={foil.blockDimension.breadth || ""}
                            onChange={(e) => {
                              const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                              updatedFoilDetails[index].blockDimension.breadth = e.target.value;
                              dispatch({
                                type: "UPDATE_SANDWICH",
                                payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
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
                    <div>
                      <label className="block mb-1">Foil Type:</label>
                      <select
                        value={foil.foilType || ""}
                        onChange={(e) => {
                          const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                          updatedFoilDetails[index].foilType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
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
                    <div>
                      <label className="block mb-1">Block Type:</label>
                      <select
                        value={foil.blockType || ""}
                        onChange={(e) => {
                          const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                          updatedFoilDetails[index].blockType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
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
                    <div>
                      <label className="block mb-1">MR Type:</label>
                      <select
                        value={foil.mrType || ""}
                        onChange={(e) => {
                          const updatedFoilDetails = [...state.sandwich.fsDetailsSandwich.foilDetails];
                          updatedFoilDetails[index].mrType = e.target.value;
                          dispatch({
                            type: "UPDATE_SANDWICH",
                            payload: { fsDetailsSandwich: { ...state.sandwich.fsDetailsSandwich, foilDetails: updatedFoilDetails } },
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
                ))}
              </div>
            )}
          </div>

          {/* EMB Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Embossing (EMB) Details</h3>

            {/* Toggle EMB Usage */}
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                name="isEMBUsedSandwich"
                checked={state.sandwich.embDetailsSandwich?.isEMBUsed || false}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SANDWICH",
                    payload: {
                      embDetailsSandwich: {
                        ...state.sandwich.embDetailsSandwich,
                        isEMBUsed: e.target.checked,
                        plateSizeType: "",
                        plateDimensions: { length: "", breadth: "" },
                        plateTypeMale: "",
                        plateTypeFemale: "",
                        embMR: "",
                      },
                    },
                  })
                }
                className="mr-2"
              />
              Use EMB Component?
            </label>

            {/* EMB Fields */}
            {state.sandwich.embDetailsSandwich?.isEMBUsed && (
              <div className="space-y-4">
                {/* Plate Size Type */}
                <div>
                  <label className="block mb-1">Plate Size Type:</label>
                  <select
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
                    <option value="">Select Plate Size Type</option>
                    <option value="Auto">Auto</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                {/* Dimensions */}
                {state.sandwich.embDetailsSandwich.plateSizeType && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Length (cm)"
                        value={state.sandwich.embDetailsSandwich.plateDimensions.length || ""}
                        onChange={(e) =>
                          dispatch({
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
                        }
                        className={`border rounded-md p-2 w-full ${
                          state.sandwich.embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""
                        }`}
                        readOnly={state.sandwich.embDetailsSandwich.plateSizeType === "Auto"}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Breadth (cm)"
                        value={state.sandwich.embDetailsSandwich.plateDimensions.breadth || ""}
                        onChange={(e) =>
                          dispatch({
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
                        }
                        className={`border rounded-md p-2 w-full ${
                          state.sandwich.embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""
                        }`}
                        readOnly={state.sandwich.embDetailsSandwich.plateSizeType === "Auto"}
                      />
                    </div>
                  </div>
                )}

                {/* Plate Type Male */}
                <div>
                  <label className="block mb-1">Plate Type Male:</label>
                  <select
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
                <div>
                  <label className="block mb-1">Plate Type Female:</label>
                  <select
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

                {/* EMB MR Type */}
                <div>
                  <label className="block mb-1">EMB MR:</label>
                  <select
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

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Sandwich;
