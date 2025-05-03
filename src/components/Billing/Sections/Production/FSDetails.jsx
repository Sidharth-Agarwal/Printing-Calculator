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
  const { mrTypes, loading: mrTypesLoading, refreshMRTypes } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");

  // Debugging: log what's loaded from hooks
  useEffect(() => {
    if (!foilTypesLoading && foilTypes.length > 0) {
      console.log("Loaded foil types from hook:", foilTypes.map(ft => ft.materialName));
    }
    if (!blockTypesLoading && blockTypes.length > 0) {
      console.log("Loaded block types from hook:", blockTypes.map(bt => bt.materialName));
    }
    if (!mrTypesLoading && mrTypes.length > 0) {
      console.log("Loaded MR types from hook:", mrTypes.map(mt => mt.type));
    }
  }, [foilTypes, blockTypes, mrTypes, foilTypesLoading, blockTypesLoading, mrTypesLoading]);

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
          console.log(`Foil type ${foil.foilType} not found in available options. Updating to ${foilTypes[0].materialName}`);
          updatedFoilDetails[index].foilType = foilTypes[0].materialName;
          needsUpdate = true;
        }
      }

      // Check if block type exists in available options
      if (foil.blockType) {
        const blockTypeExists = blockTypes.some(bt => bt.materialName === foil.blockType);
        if (!blockTypeExists) {
          console.log(`Block type ${foil.blockType} not found in available options. Updating to ${blockTypes[0].materialName}`);
          updatedFoilDetails[index].blockType = blockTypes[0].materialName;
          needsUpdate = true;
        }
      }

      // Check if MR type exists in available options
      if (foil.mrType) {
        const mrTypeExists = mrTypes.some(mt => mt.type === foil.mrType);
        if (!mrTypeExists) {
          console.log(`MR type ${foil.mrType} not found in available options. Updating to ${mrTypes[0].type}`);
          updatedFoilDetails[index].mrType = mrTypes[0].type;
          const selectedMrType = mrTypes.find(mt => mt.type === mrTypes[0].type);
          updatedFoilDetails[index].mrTypeConcatenated = selectedMrType?.concatenated || `FS MR ${mrTypes[0].type}`;
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      console.log("Updating foil details with validated options:", updatedFoilDetails);
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

      console.log("Creating new foil details with defaults:", {
        defaultFoilType,
        defaultBlockType,
        defaultMrType
      });

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
    console.log(`Changing ${field} for foil ${index} to:`, value);
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
      // Special handling for foil type to ensure it is correctly set
      updatedFoilDetails[index].foilType = value;
      console.log(`Set foil type at index ${index} to:`, value);
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

    // Log the updated details before dispatching
    console.log(`Updated foil detail ${index}:`, updatedFoilDetails[index]);
    
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { foilDetails: updatedFoilDetails },
    });
    
    // Verify the update after next render cycle
    setTimeout(() => {
      console.log(`Current state after update for ${field}:`, fsDetails.foilDetails[index]);
    }, 0);
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
    
    // Log the final state before validating
    console.log("Final foil details before submit:", fsDetails.foilDetails);
    
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-1 text-sm">FS Type:</div>
        <select
          name="fsType"
          value={fsDetails.fsType || ""}
          onChange={handleChange}
          className="border rounded-md p-2 w-full text-sm"
        >
          <option value="">Select FS Type</option>
          {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.fsType && <p className="text-red-500 text-sm">{errors.fsType}</p>}
      </div>

      {fsDetails.fsType && (
        <div>
          <h3 className="text-md font-semibold mt-4 mb-2">Foil Details</h3>
          
          {isLoading ? (
            <div className="p-4 bg-gray-50 border rounded-md">
              <p className="text-center text-gray-500">Loading material options...</p>
            </div>
          ) : (
            fsDetails.foilDetails.map((foil, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                <h4 className="text-sm font-semibold mb-2">Foil {index + 1}</h4>

                <div className="flex flex-wrap gap-4 text-sm">
                  {/* Block Size Type */}
                  <div className="flex-1">
                    <div className="mb-1">Block Size:</div>
                    <select
                      value={foil.blockSizeType || "Auto"}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "blockSizeType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                    {errors[`blockSizeType-${index}`] && (
                      <p className="text-red-500 text-sm">{errors[`blockSizeType-${index}`]}</p>
                    )}
                  </div>

                  {/* Block Dimensions */}
                  {foil.blockSizeType && (
                    <div className="flex flex-wrap gap-4 flex-1">
                      <div className="flex-1">
                        <label htmlFor={`length-${index}`} className="block mb-1">
                          Length:
                        </label>
                        <input
                          type="number"
                          id={`length-${index}`}
                          placeholder="(inches)"
                          value={foil.blockDimension?.lengthInInches || ""}
                          onChange={(e) =>
                            handleFoilDetailsChange(index, "blockDimension", {
                              length: e.target.value,
                            })
                          }
                          className={`border rounded-md p-2 w-full ${
                            foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                          }`}
                          readOnly={foil.blockSizeType === "Auto"}
                        />
                        {/* Display the converted cm value */}
                        <div className="text-xs text-gray-500 mt-1">
                          {foil.blockDimension?.length ? `${foil.blockDimension.length} cm` : ""}
                        </div>
                        {errors[`blockLength-${index}`] && (
                          <p className="text-red-500 text-sm">{errors[`blockLength-${index}`]}</p>
                        )}
                      </div>

                      <div className="flex-1">
                        <label htmlFor={`breadth-${index}`} className="block mb-1">
                          Breadth:
                        </label>
                        <input
                          type="number"
                          id={`breadth-${index}`}
                          placeholder="(inches)"
                          value={foil.blockDimension?.breadthInInches || ""}
                          onChange={(e) =>
                            handleFoilDetailsChange(index, "blockDimension", {
                              breadth: e.target.value,
                            })
                          }
                          className={`border rounded-md p-2 w-full ${
                            foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                          }`}
                          readOnly={foil.blockSizeType === "Auto"}
                        />
                        {/* Display the converted cm value */}
                        <div className="text-xs text-gray-500 mt-1">
                          {foil.blockDimension?.breadth ? `${foil.blockDimension.breadth} cm` : ""}
                        </div>
                        {errors[`blockBreadth-${index}`] && (
                          <p className="text-red-500 text-sm">{errors[`blockBreadth-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Foil Type */}
                  <div className="flex-1">
                    <div className="mb-1">Foil Type:</div>
                    <select
                      value={foil.foilType || ""}
                      onChange={(e) => {
                        console.log(`Selected foil type: ${e.target.value}`);
                        handleFoilDetailsChange(index, "foilType", e.target.value);
                      }}
                      className="border rounded-md p-2 w-full"
                      data-testid={`foil-type-select-${index}`}
                    >
                      {foilTypes.map((foilType, idx) => (
                        <option key={idx} value={foilType.materialName}>
                          {foilType.materialName}
                        </option>
                      ))}
                    </select>
                    {errors[`foilType-${index}`] && (
                      <p className="text-red-500 text-sm">{errors[`foilType-${index}`]}</p>
                    )}
                  </div>

                  {/* Block Type */}
                  <div className="flex-1">
                    <div className="mb-1">Block Type:</div>
                    <select
                      value={foil.blockType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "blockType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      {blockTypes.map((blockType, idx) => (
                        <option key={idx} value={blockType.materialName}>
                          {blockType.materialName}
                        </option>
                      ))}
                    </select>
                    {errors[`blockType-${index}`] && (
                      <p className="text-red-500 text-sm">{errors[`blockType-${index}`]}</p>
                    )}
                  </div>

                  {/* MR Type */}
                  <div className="flex-1">
                    <div className="mb-1">MR Type:</div>
                    <select
                      value={foil.mrType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "mrType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      {mrTypes.map((typeOption, idx) => (
                        <option key={idx} value={typeOption.type}>
                          {typeOption.type}
                        </option>
                      ))}
                    </select>
                    {errors[`mrType-${index}`] && (
                      <p className="text-red-500 text-sm">{errors[`mrType-${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </form>
  );
};

export default FSDetails;