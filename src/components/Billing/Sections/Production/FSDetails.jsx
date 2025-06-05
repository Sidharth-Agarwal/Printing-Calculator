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

  // Use the custom hooks to fetch data
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

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

  // Update foil details dynamically when FS type changes
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
    selectionMade.current = true; // Mark that user has made an explicit selection
    
    // Deep copy the foil details array
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
      // Handle input values as inches
      if (value.length !== undefined) {
        // Store original inches value
        updatedFoilDetails[index].blockDimension.lengthInInches = value.length;
        // Convert to cm for the standard length field
        updatedFoilDetails[index].blockDimension.length = value.length ? inchesToCm(value.length).toFixed(2) : "";
      }
      
      if (value.breadth !== undefined) {
        // Store original inches value
        updatedFoilDetails[index].blockDimension.breadthInInches = value.breadth;
        // Convert to cm for the standard breadth field
        updatedFoilDetails[index].blockDimension.breadth = value.breadth ? inchesToCm(value.breadth).toFixed(2) : "";
      }
    } else if (field === "foilType") {
      updatedFoilDetails[index].foilType = value;
    } else if (field === "mrType") {
      updatedFoilDetails[index].mrType = value;
      
      // Set the concatenated version for calculations
      const selectedMRType = mrTypes.find(type => type.type === value);
      if (selectedMRType && selectedMRType.concatenated) {
        updatedFoilDetails[index].mrTypeConcatenated = selectedMRType.concatenated;
      } else {
        // Fallback if not found
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

  // If FS is not used, don't render any content
  if (!fsDetails.isFSUsed) {
    return null;
  }

  // Loading state for the entire component
  const isLoading = foilTypesLoading || blockTypesLoading || mrTypesLoading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* FS Type Selection */}
        <div>
          <label htmlFor="fsType" className="block text-xs font-medium text-gray-600 mb-1">
            FS Type:
          </label>
          <select
            id="fsType"
            name="fsType"
            value={fsDetails.fsType || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.fsType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
          >
            <option value="">Select FS Type</option>
            {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.fsType && <p className="text-red-500 text-xs mt-1">{errors.fsType}</p>}
        </div>

        {/* Foil Details Section */}
        {fsDetails.fsType && (
          <div>
            <h3 className="text-xs uppercase font-medium text-gray-500 mb-3">Foil Details</h3>
            
            {isLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading materials...</p>
              </div>
            ) : (
              fsDetails.foilDetails.map((foil, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Foil {index + 1}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Block Size Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Block Size:
                      </label>
                      <select
                        value={foil.blockSizeType || "Auto"}
                        onChange={(e) => handleFoilDetailsChange(index, "blockSizeType", e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors[`blockSizeType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`blockSizeType-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`blockSizeType-${index}`]}</p>
                      )}
                    </div>

                    {/* Block Dimensions */}
                    {foil.blockSizeType && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Length (inches):
                          </label>
                          <input
                            type="number"
                            placeholder="Enter length"
                            value={foil.blockDimension?.lengthInInches || ""}
                            onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                              length: e.target.value,
                            })}
                            className={`w-full px-3 py-2 border ${
                              errors[`blockLength-${index}`] ? "border-red-500" : "border-gray-300"
                            } rounded-md ${
                              foil.blockSizeType === "Auto" ? "bg-gray-50" : ""
                            } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
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
                            Breadth (inches):
                          </label>
                          <input
                            type="number"
                            placeholder="Enter breadth"
                            value={foil.blockDimension?.breadthInInches || ""}
                            onChange={(e) => handleFoilDetailsChange(index, "blockDimension", {
                              breadth: e.target.value,
                            })}
                            className={`w-full px-3 py-2 border ${
                              errors[`blockBreadth-${index}`] ? "border-red-500" : "border-gray-300"
                            } rounded-md ${
                              foil.blockSizeType === "Auto" ? "bg-gray-50" : ""
                            } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
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

                    {/* Foil Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Foil Type:
                      </label>
                      <select
                        value={foil.foilType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "foilType", e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors[`foilType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                        data-testid={`foil-type-select-${index}`}
                      >
                        <option value="">Select Foil Type</option>
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

                    {/* Block Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Block Type:
                      </label>
                      <select
                        value={foil.blockType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "blockType", e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors[`blockType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="">Select Block Type</option>
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

                    {/* MR Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        MR Type:
                      </label>
                      <select
                        value={foil.mrType || ""}
                        onChange={(e) => handleFoilDetailsChange(index, "mrType", e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors[`mrType-${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="">Select MR Type</option>
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