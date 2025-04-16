import React, { useState, useEffect } from "react";
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

  // Use the custom hooks to fetch data
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Update foil details dynamically when FS type changes
  useEffect(() => {
    if (fsDetails.isFSUsed && fsDetails.fsType) {
      const numberOfFoilOptions =
        fsDetails.fsType === "FS1"
          ? 1
          : fsDetails.fsType === "FS2"
          ? 2
          : fsDetails.fsType === "FS3"
          ? 3
          : fsDetails.fsType === "FS4"
          ? 4
          : 5; // For FS5

      // Get default values from fetched lists or use fallbacks
      const defaultMRType = mrTypes.length > 0 ? mrTypes[0].type : "Simple";
      const defaultFoilType = foilTypes.length > 0 ? foilTypes[0].materialName : "Gold MTS 220";
      const defaultBlockType = blockTypes.length > 0 ? blockTypes[0].materialName : "Magnesium Block 3MM";

      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        const currentFoil = fsDetails.foilDetails[index] || {};
        
        // Set defaults for new entries
        const newFoil = {
          blockSizeType: currentFoil.blockSizeType || "Auto",
          blockDimension: currentFoil.blockDimension || { 
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : ""
          },
          foilType: currentFoil.foilType || defaultFoilType,
          blockType: currentFoil.blockType || defaultBlockType,
          mrType: currentFoil.mrType || defaultMRType
        };
        
        // Always update dimensions if Auto is selected
        if (newFoil.blockSizeType === "Auto") {
          newFoil.blockDimension = {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          };
        }
        
        return newFoil;
      });

      const needsUpdate = JSON.stringify(fsDetails.foilDetails) !== JSON.stringify(updatedFoilDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [
    fsDetails.fsType, 
    fsDetails.isFSUsed, 
    fsDetails.foilDetails, 
    dieSize, 
    dispatch, 
    mrTypes, 
    foilTypes, 
    blockTypes
  ]);

  // Set default MR Types when MR types are loaded and foil details have null/empty MR types
  useEffect(() => {
    if (fsDetails.isFSUsed && mrTypes.length > 0 && fsDetails.foilDetails.length > 0) {
      const defaultMRType = mrTypes[0].type;
      
      // Check if any foil detail has an empty/missing MR type
      const needsMRTypeUpdate = fsDetails.foilDetails.some(foil => !foil.mrType);
      
      if (needsMRTypeUpdate) {
        const updatedFoilDetails = fsDetails.foilDetails.map(foil => ({
          ...foil,
          mrType: foil.mrType || defaultMRType
        }));
        
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [mrTypes, fsDetails.isFSUsed, fsDetails.foilDetails, dispatch]);

  // Set default Foil Types when foil types are loaded and foil details have null/empty foil types
  useEffect(() => {
    if (fsDetails.isFSUsed && foilTypes.length > 0 && fsDetails.foilDetails.length > 0) {
      const defaultFoilType = foilTypes[0].materialName;
      
      // Check if any foil detail has an empty/missing foil type
      const needsFoilTypeUpdate = fsDetails.foilDetails.some(foil => !foil.foilType);
      
      if (needsFoilTypeUpdate) {
        const updatedFoilDetails = fsDetails.foilDetails.map(foil => ({
          ...foil,
          foilType: foil.foilType || defaultFoilType
        }));
        
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [foilTypes, fsDetails.isFSUsed, fsDetails.foilDetails, dispatch]);

  // Set default Block Types when block types are loaded and foil details have null/empty block types
  useEffect(() => {
    if (fsDetails.isFSUsed && blockTypes.length > 0 && fsDetails.foilDetails.length > 0) {
      const defaultBlockType = blockTypes[0].materialName;
      
      // Check if any foil detail has an empty/missing block type
      const needsBlockTypeUpdate = fsDetails.foilDetails.some(foil => !foil.blockType);
      
      if (needsBlockTypeUpdate) {
        const updatedFoilDetails = fsDetails.foilDetails.map(foil => ({
          ...foil,
          blockType: foil.blockType || defaultBlockType
        }));
        
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [blockTypes, fsDetails.isFSUsed, fsDetails.foilDetails, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: value },
    });
  };

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...fsDetails.foilDetails];

    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;

      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      }

      if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value,
      };
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
          if (!foil.blockDimension?.length) {
            newErrors[`blockLength-${index}`] = "Block Length is required.";
          }
          if (!foil.blockDimension?.breadth) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-1 text-sm">FS Type:</div>
        <select
          name="fsType"
          value={fsDetails.fsType}
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
          {fsDetails.foilDetails.map((foil, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
              <h4 className="text-sm font-semibold mb-2">Foil {index + 1}</h4>

              <div className="flex flex-wrap gap-4 text-sm">
                {/* Block Size Type */}
                <div className="flex-1">
                  <div className="mb-1">Block Size (cm):</div>
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

                {/* Block Dimensions - Updated to match LP styling with flex-wrap */}
                {foil.blockSizeType && (
                  <div className="flex flex-wrap gap-4 flex-1">
                    <div className="flex-1">
                      <label htmlFor={`length-${index}`} className="block mb-1">
                        Length:
                      </label>
                      <input
                        type="number"
                        id={`length-${index}`}
                        placeholder="(cm)"
                        value={foil.blockDimension?.length || ""}
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
                        placeholder="(cm)"
                        value={foil.blockDimension?.breadth || ""}
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
                    onChange={(e) =>
                      handleFoilDetailsChange(index, "foilType", e.target.value)
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    {foilTypesLoading ? (
                      <option value="" disabled>Loading Foil Types...</option>
                    ) : (
                      foilTypes.map((foilType, idx) => (
                        <option key={idx} value={foilType.materialName}>
                          {foilType.materialName}
                        </option>
                      ))
                    )}
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
                    {blockTypesLoading ? (
                      <option value="" disabled>Loading Block Types...</option>
                    ) : (
                      blockTypes.map((blockType, idx) => (
                        <option key={idx} value={blockType.materialName}>
                          {blockType.materialName}
                        </option>
                      ))
                    )}
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
                  {errors[`mrType-${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`mrType-${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default FSDetails;