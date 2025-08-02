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

  // Update dimensions when die size changes (for Auto mode)
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

  // Validate foil details against available options
  useEffect(() => {
    // Skip during initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Skip if hooks are still loading or FS is not used
    if (foilTypesLoading || blockTypesLoading || mrTypesLoading || !fsDetails.isFSUsed) {
      return;
    }

    // Skip if no foil details or no types are loaded
    if (fsDetails.foilDetails.length === 0 || foilTypes.length === 0 || blockTypes.length === 0 || mrTypes.length === 0) {
      return;
    }

    // Don't override user selections if they've explicitly made a choice
    if (selectionMade.current) {
      return;
    }

    // Validate each foil detail against available options
    let needsUpdate = false;
    const updatedFoilDetails = [...fsDetails.foilDetails];

    updatedFoilDetails.forEach((foil, index) => {
      // Check if foil type exists in available options
      if (foil.foilType) {
        const foilTypeExists = foilTypes.some(ft => ft.materialName === foil.foilType);
        if (!foilTypeExists) {
          updatedFoilDetails[index].foilType = foilTypes[0].materialName;
          needsUpdate = true;
        }
      }

      // Check if block type exists in available options
      if (foil.blockType) {
        const blockTypeExists = blockTypes.some(bt => bt.materialName === foil.blockType);
        if (!blockTypeExists) {
          updatedFoilDetails[index].blockType = blockTypes[0].materialName;
          needsUpdate = true;
        }
      }

      // Check if MR type exists in available options
      if (foil.mrType) {
        const mrTypeExists = mrTypes.some(mt => mt.type === foil.mrType);
        if (!mrTypeExists) {
          updatedFoilDetails[index].mrType = mrTypes[0].type;
          const selectedMrType = mrTypes.find(mt => mt.type === mrTypes[0].type);
          updatedFoilDetails[index].mrTypeConcatenated = selectedMrType?.concatenated || `FS MR ${mrTypes[0].type}`;
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      dispatch({
        type: "UPDATE_FS_DETAILS",
        payload: { foilDetails: updatedFoilDetails },
      });
    }
  }, [foilTypes, blockTypes, mrTypes, foilTypesLoading, blockTypesLoading, mrTypesLoading, fsDetails.foilDetails, fsDetails.isFSUsed, dispatch]);

  // RESTORED: Update foil details dynamically when FS type changes
  useEffect(() => {
    if (!fsDetails.isFSUsed || fsDetails.fsType === undefined) return;

    // Determine how many foil details are needed based on FS type
    const numberOfFoilOptions =
      fsDetails.fsType === "FS1" ? 1 :
      fsDetails.fsType === "FS2" ? 2 :
      fsDetails.fsType === "FS3" ? 3 :
      fsDetails.fsType === "FS4" ? 4 : 5; // For FS5

    // Only update if the count doesn't match
    if (fsDetails.foilDetails.length !== numberOfFoilOptions) {
      // Get default values from loaded data
      const defaultFoilType = !foilTypesLoading && foilTypes.length > 0 ? foilTypes[0].materialName : "";
      const defaultBlockType = !blockTypesLoading && blockTypes.length > 0 ? blockTypes[0].materialName : "";
      const defaultMrType = !mrTypesLoading && mrTypes.length > 0 ? {
        type: mrTypes[0].type,
        concatenated: mrTypes[0].concatenated
      } : {
        type: "SIMPLE",
        concatenated: "FS MR SIMPLE"
      };

      // Create new foil details array with the correct number of items
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        // Preserve existing details if available
        if (index < fsDetails.foilDetails.length) {
          return fsDetails.foilDetails[index];
        }

        // Create new detail with proper defaults
        const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
        const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
        
        return {
          blockSizeType: "Auto",
          blockDimension: {
            length: lengthCm,
            breadth: breadthCm,
            lengthInInches: dieSize.length || "",
            breadthInInches: dieSize.breadth || ""
          },
          foilType: defaultFoilType,
          blockType: defaultBlockType,
          mrType: defaultMrType.type,
          mrTypeConcatenated: defaultMrType.concatenated
        };
      });

      dispatch({
        type: "UPDATE_FS_DETAILS",
        payload: { foilDetails: updatedFoilDetails },
      });
    }
  }, [fsDetails.fsType, fsDetails.isFSUsed, fsDetails.foilDetails, dieSize, foilTypes, blockTypes, mrTypes, foilTypesLoading, blockTypesLoading, mrTypesLoading, dispatch]);

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

  const isLoading = foilTypesLoading || blockTypesLoading || mrTypesLoading;

  // UPDATED: Always render all form fields, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* FS Type - Always visible */}
        <div>
          <label htmlFor="fsType" className="block text-xs font-medium text-gray-600 mb-1">
            FS Type:
          </label>
          <select
            id="fsType"
            name="fsType"
            value={fsDetails.fsType || ""}
            onChange={handleChange}
            className={`w-full px-2 py-2 border ${errors.fsType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 text-xs`}
          >
            {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.fsType && <p className="text-red-500 text-xs mt-1">{errors.fsType}</p>}
        </div>

        {/* Foil Details - Always visible, show at least 1 foil based on fsType */}
        <div>
          {isLoading ? (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex justify-center">
                <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Loading materials...</p>
            </div>
          ) : (
            // Always show foil details based on fsType, default to 1 if no foil details exist
            (() => {
              const numberOfFoilOptions = fsDetails.fsType === "FS1" ? 1 :
                fsDetails.fsType === "FS2" ? 2 :
                fsDetails.fsType === "FS3" ? 3 :
                fsDetails.fsType === "FS4" ? 4 :
                fsDetails.fsType === "FS5" ? 5 : 1; // Default to 1
              
              return Array.from({ length: numberOfFoilOptions }, (_, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Foil {index + 1}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Block Size:
                      </label>
                      <select
                        value={fsDetails.foilDetails[index]?.blockSizeType || "Auto"}
                        onChange={(e) => handleFoilDetailsChange(index, "blockSizeType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockSizeType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 text-xs`}
                      >
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`blockSizeType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`blockSizeType-${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Length:
                      </label>
                      <input
                        type="number"
                        value={fsDetails.foilDetails[index]?.blockDimension?.lengthInInches || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                          length: e.target.value,
                        })}
                        onWheel={(e) => e.target.blur()}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockLength-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md ${
                          (fsDetails.foilDetails[index]?.blockSizeType || "Auto") === "Auto" ? "bg-gray-50" : ""
                        } focus:outline-none focus:ring-1 text-xs`}
                        readOnly={(fsDetails.foilDetails[index]?.blockSizeType || "Auto") === "Auto"}
                      />
                      {fsDetails.foilDetails[index]?.blockDimension?.length && (
                        <div className="text-xs text-gray-500 mt-1">{fsDetails.foilDetails[index].blockDimension.length} cm</div>
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
                        value={fsDetails.foilDetails[index]?.blockDimension?.breadthInInches || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                          breadth: e.target.value,
                        })}
                        onWheel={(e) => e.target.blur()}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockBreadth-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md ${
                          (fsDetails.foilDetails[index]?.blockSizeType || "Auto") === "Auto" ? "bg-gray-50" : ""
                        } focus:outline-none focus:ring-1 text-xs`}
                        readOnly={(fsDetails.foilDetails[index]?.blockSizeType || "Auto") === "Auto"}
                      />
                      {fsDetails.foilDetails[index]?.blockDimension?.breadth && (
                        <div className="text-xs text-gray-500 mt-1">{fsDetails.foilDetails[index].blockDimension.breadth} cm</div>
                      )}
                      {errors[`blockBreadth-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`blockBreadth-${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Foil Type:
                      </label>
                      <select
                        value={fsDetails.foilDetails[index]?.foilType || (foilTypes.length > 0 ? foilTypes[0].materialName : "")}
                        onChange={(e) => handleFoilDetailsChange(index, "foilType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`foilType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 text-xs`}
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
                        value={fsDetails.foilDetails[index]?.blockType || (blockTypes.length > 0 ? blockTypes[0].materialName : "")}
                        onChange={(e) => handleFoilDetailsChange(index, "blockType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`blockType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 text-xs`}
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
                        value={fsDetails.foilDetails[index]?.mrType || (mrTypes.length > 0 ? mrTypes[0].type : "")}
                        onChange={(e) => handleFoilDetailsChange(index, "mrType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`mrType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 text-xs`}
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
              ));
            })()
          )}
        </div>
      </div>
    </form>
  );
};

export default FSDetails;