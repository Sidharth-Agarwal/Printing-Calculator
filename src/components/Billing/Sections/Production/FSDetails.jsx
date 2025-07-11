import React, { useState, useEffect, useRef } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

const FSDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const fsDetails = state.fsDetails || {
    isFSUsed: false,
    fsType: "FS1",
    foilDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});
  const initialRender = useRef(true);
  const selectionMade = useRef(false);

  const { mrTypes, loading: mrTypesLoading } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // FIXED: Clear errors when FS is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!fsDetails.isFSUsed) {
      setErrors({});
    }
  }, [fsDetails.isFSUsed]);

  // FIXED: Reset FS data when toggled off
  useEffect(() => {
    if (!fsDetails.isFSUsed) {
      // When FS is not used, ensure clean state
      if (fsDetails.fsType !== "" || fsDetails.foilDetails.length !== 0) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { 
            isFSUsed: false,
            fsType: "",
            foilDetails: []
          }
        });
      }
    }
  }, [fsDetails.isFSUsed, fsDetails.fsType, fsDetails.foilDetails.length, dispatch]);

  // Rest of existing useEffects and methods remain the same...
  useEffect(() => {
    if (fsDetails.isFSUsed) {
      const updatedFoilDetails = fsDetails.foilDetails.map((foil) => {
        if (foil.blockSizeType === "Auto") {
          const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
          const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
          
          return {
            ...foil,
            blockDimension: {
              length: lengthCm,
              breadth: breadthCm,
              lengthInInches: dieSize.length || "",
              breadthInInches: dieSize.breadth || ""
            },
          };
        }
        return foil;
      });

      const needsUpdate = JSON.stringify(fsDetails.foilDetails) !== JSON.stringify(updatedFoilDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [fsDetails.isFSUsed, dieSize, dispatch, fsDetails.foilDetails]);

  // All other existing methods remain unchanged...
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: value },
    });
  };

  const handleFoilDetailsChange = (index, field, value) => {
    selectionMade.current = true;
    
    const updatedFoilDetails = JSON.parse(JSON.stringify(fsDetails.foilDetails));
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;

      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { 
          length: "", 
          breadth: "",
          lengthInInches: "",
          breadthInInches: ""
        };
      }

      if (value === "Auto") {
        const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
        const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
        
        updatedFoilDetails[index].blockDimension = {
          length: lengthCm,
          breadth: breadthCm,
          lengthInInches: dieSize.length || "",
          breadthInInches: dieSize.breadth || ""
        };
      }
    } else if (field === "blockDimension") {
      if (value.length !== undefined) {
        updatedFoilDetails[index].blockDimension.lengthInInches = value.length;
        updatedFoilDetails[index].blockDimension.length = value.length ? inchesToCm(value.length).toFixed(2) : "";
      }
      
      if (value.breadth !== undefined) {
        updatedFoilDetails[index].blockDimension.breadthInInches = value.breadth;
        updatedFoilDetails[index].blockDimension.breadth = value.breadth ? inchesToCm(value.breadth).toFixed(2) : "";
      }
    } else if (field === "foilType") {
      updatedFoilDetails[index].foilType = value;
    } else if (field === "mrType") {
      updatedFoilDetails[index].mrType = value;
      
      const selectedMRType = mrTypes.find(type => type.type === value);
      if (selectedMRType && selectedMRType.concatenated) {
        updatedFoilDetails[index].mrTypeConcatenated = selectedMRType.concatenated;
      } else {
        updatedFoilDetails[index].mrTypeConcatenated = `FS MR ${value}`;
      }
    } else {
      updatedFoilDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { foilDetails: updatedFoilDetails },
    });
  };

  const validateFields = () => {
    const newErrors = {};

    if (fsDetails.isFSUsed) {
      if (!fsDetails.fsType) {
        newErrors.fsType = "FS Type is required.";
      }

      fsDetails.foilDetails.forEach((foil, index) => {
        if (!foil.blockSizeType) {
          newErrors[`blockSizeType-${index}`] = "Block Size Type is required.";
        }
        if (foil.blockSizeType === "Manual") {
          if (!foil.blockDimension?.lengthInInches) {
            newErrors[`blockLength-${index}`] = "Block Length is required.";
          }
          if (!foil.blockDimension?.breadthInInches) {
            newErrors[`blockBreadth-${index}`] = "Block Breadth is required.";
          }
        }
        if (!foil.foilType) {
          newErrors[`foilType-${index}`] = "Foil Type is required.";
        }
        if (!foil.blockType) {
          newErrors[`blockType-${index}`] = "Block Type is required.";
        }
        if (!foil.mrType) {
          newErrors[`mrType-${index}`] = "MR Type is required.";
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

  // FIXED: Same pattern as LPDetails - return null if not being used
  if (!fsDetails.isFSUsed) {
    return null;
  }

  const isLoading = foilTypesLoading || blockTypesLoading || mrTypesLoading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label htmlFor="fsType" className="block text-xs font-medium text-gray-600 mb-1">
            FS Type:
          </label>
          <select
            id="fsType"
            name="fsType"
            value={fsDetails.fsType || ""}
            onChange={handleChange}
            className={`w-full px-2 py-2 border ${errors.fsType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
          >
            {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.fsType && <p className="text-red-500 text-xs mt-1">{errors.fsType}</p>}
        </div>

        {fsDetails.fsType && (
          <div>
            {isLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading materials...</p>
              </div>
            ) : (
              fsDetails.foilDetails.map((foil, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Foil {index + 1}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Block Size:
                      </label>
                      <select
                        value={foil.blockSizeType || "Auto"}
                        onChange={(e) => handleFoilDetailsChange(index, "blockSizeType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockSizeType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                      >
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`blockSizeType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`blockSizeType-${index}`]}</p>
                      )}
                    </div>

                    {foil.blockSizeType && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Length:
                          </label>
                          <input
                            type="number"
                            value={foil.blockDimension?.lengthInInches || ""}
                            onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                              length: e.target.value,
                            })}
                            onWheel={(e) => e.target.blur()}
                            className={`w-full px-2 py-2 border ${
                              errors[`blockLength-${index}`] ? "border-red-500" : "border-gray-300"
                            } rounded-md ${
                              foil.blockSizeType === "Auto" ? "bg-gray-50" : ""
                            } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                            readOnly={foil.blockSizeType === "Auto"}
                          />
                          {foil.blockDimension?.length && (
                            <div className="text-xs text-gray-500 mt-1">{foil.blockDimension.length} cm</div>
                          )}
                          {errors[`blockLength-${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`blockLength-${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Breadth:
                          </label>
                          <input
                            type="number"
                            value={foil.blockDimension?.breadthInInches || ""}
                            onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                              breadth: e.target.value,
                            })}
                            onWheel={(e) => e.target.blur()}
                            className={`w-full px-2 py-2 border ${
                              errors[`blockBreadth-${index}`] ? "border-red-500" : "border-gray-300"
                            } rounded-md ${
                              foil.blockSizeType === "Auto" ? "bg-gray-50" : ""
                            } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                            readOnly={foil.blockSizeType === "Auto"}
                          />
                          {foil.blockDimension?.breadth && (
                            <div className="text-xs text-gray-500 mt-1">{foil.blockDimension.breadth} cm</div>
                          )}
                          {errors[`blockBreadth-${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`blockBreadth-${index}`]}</p>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Foil Type:
                      </label>
                      <select
                        value={foil.foilType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "foilType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`foilType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                      >
                        {foilTypes.map((foilType, idx) => (
                          <option key={idx} value={foilType.materialName}>
                            {foilType.materialName}
                          </option>
                        ))}
                      </select>
                      {errors[`foilType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`foilType-${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Block Type:
                      </label>
                      <select
                        value={foil.blockType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "blockType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                      >
                        {blockTypes.map((blockType, idx) => (
                          <option key={idx} value={blockType.materialName}>
                            {blockType.materialName}
                          </option>
                        ))}
                      </select>
                      {errors[`blockType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`blockType-${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        MR Type:
                      </label>
                      <select
                        value={foil.mrType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "mrType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`mrType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
                      >
                        {mrTypes.map((typeOption, idx) => (
                          <option key={idx} value={typeOption.type}>
                            {typeOption.type}
                          </option>
                        ))}
                      </select>
                      {errors[`mrType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`mrType-${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default FSDetails;