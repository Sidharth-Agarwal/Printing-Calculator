import React, { useState, useEffect } from "react";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

const Sandwich = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  
  const { 
    isSandwichComponentUsed = false,
    lpDetailsSandwich = { 
      isLPUsed: false, 
      noOfColors: 0, 
      colorDetails: [] 
    },
    fsDetailsSandwich = { 
      isFSUsed: false, 
      fsType: "", 
      foilDetails: [] 
    },
    embDetailsSandwich = { 
      isEMBUsed: false, 
      plateSizeType: "", 
      plateDimensions: { length: "", breadth: "" },
      plateTypeMale: "",
      plateTypeFemale: "",
      embMR: "",
      embMRConcatenated: ""
    }
  } = state.sandwich || {};
  
  const [errors, setErrors] = useState({});

  // Use custom hooks to fetch dynamic data
  const { mrTypes: lpMRTypes, loading: lpMRTypesLoading } = useMRTypes("LP MR");
  const { materials: lpPlateTypes, loading: lpPlateTypesLoading } = useMaterialTypes("Plate Type");
  
  const { mrTypes: fsMRTypes, loading: fsMRTypesLoading } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");
  
  const { mrTypes: embMRTypes, loading: embMRTypesLoading } = useMRTypes("EMB MR");
  const { materials: embPlateTypes, loading: embPlateTypesLoading } = useMaterialTypes("Plate Type");

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Set default MR Types for LP when component mounts or when LP is first enabled
  useEffect(() => {
    if (lpDetailsSandwich.isLPUsed && lpMRTypes.length > 0) {
      const defaultMRType = lpMRTypes[0];
      const needsUpdate = lpDetailsSandwich.colorDetails.some(
        color => !color.mrType || !color.mrTypeConcatenated
      );

      if (needsUpdate) {
        const updatedColorDetails = lpDetailsSandwich.colorDetails.map(color => ({
          ...color,
          mrType: color.mrType || defaultMRType.type,
          mrTypeConcatenated: color.mrTypeConcatenated || defaultMRType.concatenated || `LP MR ${defaultMRType.type}`
        }));

        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            lpDetailsSandwich: {
              ...lpDetailsSandwich,
              colorDetails: updatedColorDetails
            }
          }
        });
      }
    }
  }, [lpDetailsSandwich.isLPUsed, lpMRTypes, lpDetailsSandwich.colorDetails, dispatch]);

  // Set default Plate Types for LP when component mounts or when LP is first enabled
  useEffect(() => {
    if (lpDetailsSandwich.isLPUsed && lpPlateTypes.length > 0) {
      const defaultPlateType = lpPlateTypes[0].materialName;
      const needsUpdate = lpDetailsSandwich.colorDetails.some(
        color => !color.plateType
      );

      if (needsUpdate) {
        const updatedColorDetails = lpDetailsSandwich.colorDetails.map(color => ({
          ...color,
          plateType: color.plateType || defaultPlateType
        }));

        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            lpDetailsSandwich: {
              ...lpDetailsSandwich,
              colorDetails: updatedColorDetails
            }
          }
        });
      }
    }
  }, [lpDetailsSandwich.isLPUsed, lpPlateTypes, lpDetailsSandwich.colorDetails, dispatch]);

  // Set default MR Types for FS when component mounts or when FS is first enabled
  useEffect(() => {
    if (fsDetailsSandwich.isFSUsed && fsMRTypes.length > 0) {
      const defaultMRType = fsMRTypes[0];
      const needsUpdate = fsDetailsSandwich.foilDetails.some(
        foil => !foil.mrType || !foil.mrTypeConcatenated
      );

      if (needsUpdate) {
        const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => ({
          ...foil,
          mrType: foil.mrType || defaultMRType.type,
          mrTypeConcatenated: foil.mrTypeConcatenated || defaultMRType.concatenated || `FS MR ${defaultMRType.type}`
        }));

        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            fsDetailsSandwich: {
              ...fsDetailsSandwich,
              foilDetails: updatedFoilDetails
            }
          }
        });
      }
    }
  }, [fsDetailsSandwich.isFSUsed, fsMRTypes, fsDetailsSandwich.foilDetails, dispatch]);

  // Set default Foil Types for FS when component mounts or when FS is first enabled
  useEffect(() => {
    if (fsDetailsSandwich.isFSUsed && foilTypes.length > 0) {
      const defaultFoilType = foilTypes[0].materialName;
      const needsUpdate = fsDetailsSandwich.foilDetails.some(
        foil => !foil.foilType
      );

      if (needsUpdate) {
        const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => ({
          ...foil,
          foilType: foil.foilType || defaultFoilType
        }));

        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            fsDetailsSandwich: {
              ...fsDetailsSandwich,
              foilDetails: updatedFoilDetails
            }
          }
        });
      }
    }
  }, [fsDetailsSandwich.isFSUsed, foilTypes, fsDetailsSandwich.foilDetails, dispatch]);

  // Set default Block Types for FS when component mounts or when FS is first enabled
  useEffect(() => {
    if (fsDetailsSandwich.isFSUsed && blockTypes.length > 0) {
      const defaultBlockType = blockTypes[0].materialName;
      const needsUpdate = fsDetailsSandwich.foilDetails.some(
        foil => !foil.blockType
      );

      if (needsUpdate) {
        const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => ({
          ...foil,
          blockType: foil.blockType || defaultBlockType
        }));

        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            fsDetailsSandwich: {
              ...fsDetailsSandwich,
              foilDetails: updatedFoilDetails
            }
          }
        });
      }
    }
  }, [fsDetailsSandwich.isFSUsed, blockTypes, fsDetailsSandwich.foilDetails, dispatch]);

  // Set default MR Types for EMB when component mounts or when EMB is first enabled
  useEffect(() => {
    if (embDetailsSandwich.isEMBUsed && embMRTypes.length > 0) {
      const defaultMRType = embMRTypes[0];
      const updatePayload = {};

      if (!embDetailsSandwich.embMR) {
        updatePayload.embMR = defaultMRType.type;
      }

      if (!embDetailsSandwich.embMRConcatenated) {
        updatePayload.embMRConcatenated = defaultMRType.concatenated || `EMB MR ${defaultMRType.type}`;
      }

      if (Object.keys(updatePayload).length > 0) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              ...updatePayload
            }
          }
        });
      }
    }
  }, [embDetailsSandwich.isEMBUsed, embMRTypes, embDetailsSandwich, dispatch]);

  // Set default Plate Types for EMB when component mounts or when EMB is first enabled
  useEffect(() => {
    if (embDetailsSandwich.isEMBUsed && embPlateTypes.length > 0) {
      const defaultPlateType = embPlateTypes[0].materialName;
      const updatePayload = {};

      if (!embDetailsSandwich.plateTypeMale) {
        updatePayload.plateTypeMale = defaultPlateType;
      }

      if (!embDetailsSandwich.plateTypeFemale) {
        updatePayload.plateTypeFemale = defaultPlateType;
      }

      if (Object.keys(updatePayload).length > 0) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              ...updatePayload
            }
          }
        });
      }
    }
  }, [embDetailsSandwich.isEMBUsed, embPlateTypes, embDetailsSandwich, dispatch]);

  // Compute default dimensions when die size changes
  useEffect(() => {
    const updates = {};

    // LP Color Details
    if (lpDetailsSandwich.isLPUsed) {
      const updatedColorDetails = lpDetailsSandwich.colorDetails.map(color => {
        if (color.plateSizeType === "Auto") {
          return {
            ...color,
            plateDimensions: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            }
          };
        }
        return color;
      });

      if (JSON.stringify(updatedColorDetails) !== JSON.stringify(lpDetailsSandwich.colorDetails)) {
        updates.lpDetailsSandwich = {
          ...lpDetailsSandwich,
          colorDetails: updatedColorDetails
        };
      }
    }

    // FS Foil Details
    if (fsDetailsSandwich.isFSUsed) {
      const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => {
        if (foil.blockSizeType === "Auto") {
          return {
            ...foil,
            blockDimension: {
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
            }
          };
        }
        return foil;
      });

      if (JSON.stringify(updatedFoilDetails) !== JSON.stringify(fsDetailsSandwich.foilDetails)) {
        updates.fsDetailsSandwich = {
          ...fsDetailsSandwich,
          foilDetails: updatedFoilDetails
        };
      }
    }

    // EMB Plate Dimensions
    if (embDetailsSandwich.isEMBUsed && embDetailsSandwich.plateSizeType === "Auto") {
      const updatedDimensions = {
        length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
      };

      if (JSON.stringify(updatedDimensions) !== JSON.stringify(embDetailsSandwich.plateDimensions)) {
        updates.embDetailsSandwich = {
          ...embDetailsSandwich,
          plateDimensions: updatedDimensions
        };
      }
    }

    // Dispatch updates if any
    if (Object.keys(updates).length > 0) {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: updates
      });
    }
  }, [dieSize, lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich, dispatch]);

  // Helper method to validate fields
  const validateFields = () => {
    const newErrors = {};

    // Validate LP if used
    if (lpDetailsSandwich.isLPUsed) {
      if (!lpDetailsSandwich.noOfColors || lpDetailsSandwich.noOfColors < 1) {
        newErrors.lpNoOfColors = "Number of colors must be at least 1.";
      }

      lpDetailsSandwich.colorDetails.forEach((color, index) => {
        if (!color.plateSizeType) {
          newErrors[`lpPlateSizeType_${index}`] = "Plate size type is required.";
        }
        if (color.plateSizeType === "Manual") {
          if (!color.plateDimensions?.length) {
            newErrors[`lpPlateLength_${index}`] = "Plate length is required.";
          }
          if (!color.plateDimensions?.breadth) {
            newErrors[`lpPlateBreadth_${index}`] = "Plate breadth is required.";
          }
        }
        if (!color.pantoneType) {
          newErrors[`lpPantoneType_${index}`] = "Pantone type is required.";
        }
        if (!color.plateType) {
          newErrors[`lpPlateType_${index}`] = "Plate type is required.";
        }
        if (!color.mrType) {
          newErrors[`lpMrType_${index}`] = "MR type is required.";
        }
      });
    }

    // Validate FS if used
    if (fsDetailsSandwich.isFSUsed) {
      if (!fsDetailsSandwich.fsType) {
        newErrors.fsType = "FS Type is required.";
      }

      fsDetailsSandwich.foilDetails.forEach((foil, index) => {
        if (!foil.blockSizeType) {
          newErrors[`fsBlockSizeType_${index}`] = "Block size type is required.";
        }
        if (foil.blockSizeType === "Manual") {
          if (!foil.blockDimension?.length) {
            newErrors[`fsBlockLength_${index}`] = "Block length is required.";
          }
          if (!foil.blockDimension?.breadth) {
            newErrors[`fsBlockBreadth_${index}`] = "Block breadth is required.";
          }
        }
        if (!foil.foilType) {
          newErrors[`fsFoilType_${index}`] = "Foil type is required.";
        }
        if (!foil.blockType) {
          newErrors[`fsBlockType_${index}`] = "Block type is required.";
        }
        if (!foil.mrType) {
          newErrors[`fsMrType_${index}`] = "MR type is required.";
        }
      });
    }

    // Validate EMB if used
    if (embDetailsSandwich.isEMBUsed) {
      if (!embDetailsSandwich.plateSizeType) {
        newErrors.embPlateSizeType = "Plate size type is required.";
      }
      if (embDetailsSandwich.plateSizeType === "Manual") {
        if (!embDetailsSandwich.plateDimensions?.length) {
          newErrors.embPlateLength = "Plate length is required.";
        }
        if (!embDetailsSandwich.plateDimensions?.breadth) {
          newErrors.embPlateBreadth = "Plate breadth is required.";
        }
      }
      if (!embDetailsSandwich.plateTypeMale) {
        newErrors.embPlateTypeMale = "Male plate type is required.";
      }
      if (!embDetailsSandwich.plateTypeFemale) {
        newErrors.embPlateTypeFemale = "Female plate type is required.";
      }
      if (!embDetailsSandwich.embMR) {
        newErrors.embMR = "EMB MR type is required.";
      }
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

  // Handle LP Sandwich changes
  const handleLPSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          lpDetailsSandwich: {
            ...lpDetailsSandwich,
            [name]: parseInt(value, 10),
            colorDetails: Array.from({ length: parseInt(value, 10) }, (_, index) => {
              const currentColor = lpDetailsSandwich.colorDetails[index] || {};
              const defaultPlateType = lpPlateTypes.length > 0 ? lpPlateTypes[0].materialName : "Polymer Plate";
              const defaultMRType = lpMRTypes.length > 0 ? 
                { type: lpMRTypes[0].type, concatenated: lpMRTypes[0].concatenated } : 
                { type: "SIMPLE", concatenated: "LP MR SIMPLE" };

              return {
                plateSizeType: currentColor.plateSizeType || "Auto",
                plateDimensions: currentColor.plateDimensions || {
                  length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
                  breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
                },
                pantoneType: currentColor.pantoneType || "",
                plateType: currentColor.plateType || defaultPlateType,
                mrType: currentColor.mrType || defaultMRType.type,
                mrTypeConcatenated: currentColor.mrTypeConcatenated || defaultMRType.concatenated
              };
            })
          }
        }
      });
    }
  };

  // Handle LP Sandwich color details change
  const handleLPColorDetailsChange = (index, field, value) => {
    const updatedColorDetails = [...lpDetailsSandwich.colorDetails];
    
    if (field === "plateSizeType") {
      updatedColorDetails[index].plateSizeType = value;
      
      if (value === "Manual") {
        updatedColorDetails[index].plateDimensions = { length: "", breadth: "" };
      } else if (value === "Auto") {
        updatedColorDetails[index].plateDimensions = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "plateDimensions") {
      updatedColorDetails[index].plateDimensions = {
        ...updatedColorDetails[index].plateDimensions,
        ...value
      };
    } else if (field === "mrType" && lpMRTypes.length > 0) {
      const selectedMRType = lpMRTypes.find(type => type.type === value);
      updatedColorDetails[index].mrType = value;
      updatedColorDetails[index].mrTypeConcatenated = 
        selectedMRType?.concatenated || `LP MR ${value}`;
    } else {
      updatedColorDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          colorDetails: updatedColorDetails
        }
      }
    });
  };

  // Handle FS Sandwich change
  const handleFSSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "fsType") {
      const numberOfFoilOptions =
        value === "FS1"
          ? 1
          : value === "FS2"
          ? 2
          : value === "FS3"
          ? 3
          : value === "FS4"
          ? 4
          : 5; // For FS5
          
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        const currentFoil = fsDetailsSandwich.foilDetails[index] || {};
        
        const defaultMRType = fsMRTypes.length > 0 ? 
          { type: fsMRTypes[0].type, concatenated: fsMRTypes[0].concatenated } : 
          { type: "SIMPLE", concatenated: "FS MR SIMPLE" };
        
        const defaultFoilType = foilTypes.length > 0 ? foilTypes[0].materialName : "Gold MTS 220";
        const defaultBlockType = blockTypes.length > 0 ? blockTypes[0].materialName : "Magnesium Block 3MM";

        return {
          blockSizeType: currentFoil.blockSizeType || "Auto",
          blockDimension: currentFoil.blockDimension || { 
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : ""
          },
          foilType: currentFoil.foilType || defaultFoilType,
          blockType: currentFoil.blockType || defaultBlockType,
          mrType: currentFoil.mrType || defaultMRType.type,
          mrTypeConcatenated: currentFoil.mrTypeConcatenated || defaultMRType.concatenated
        };
      });
      
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          fsDetailsSandwich: {
            ...fsDetailsSandwich,
            [name]: value,
            foilDetails: updatedFoilDetails
          }
        }
      });
    } else {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          fsDetailsSandwich: {
            ...fsDetailsSandwich,
            [name]: value
          }
        }
      });
    }
  };

  // Handle FS Sandwich foil details change
  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...fsDetailsSandwich.foilDetails];
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;
      
      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      } else if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value
      };
    } else if (field === "mrType" && fsMRTypes.length > 0) {
      const selectedMRType = fsMRTypes.find(type => type.type === value);
      updatedFoilDetails[index].mrType = value;
      updatedFoilDetails[index].mrTypeConcatenated = 
        selectedMRType?.concatenated || `FS MR ${value}`;
    } else {
      updatedFoilDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          foilDetails: updatedFoilDetails
        }
      }
    });
  };

  // Handle EMB Sandwich change
  const handleEMBSandwichChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "plateSizeType") {
      if (value === "Auto") {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              [name]: value,
              plateDimensions: {
                length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
                breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
              }
            }
          }
        });
      } else if (value === "Manual") {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              [name]: value,
              plateDimensions: { length: "", breadth: "" }
            }
          }
        });
      }
    } else if (name === "embMR" && embMRTypes.length > 0) {
      const selectedMRType = embMRTypes.find(type => type.type === value);
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            embMR: value,
            embMRConcatenated: selectedMRType?.concatenated || `EMB MR ${value}`
          }
        }
      });
    } else {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            [name]: value
          }
        }
      });
    }
  };

  // Handle EMB Sandwich plate dimensions change
  const handleEMBDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          plateDimensions: {
            ...embDetailsSandwich.plateDimensions,
            [field]: value
          }
        }
      }
    });
  };

  // Toggle LP Usage in Sandwich
  const toggleLPUsageInSandwich = () => {
    const isCurrentlyUsed = lpDetailsSandwich.isLPUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          isLPUsed: !isCurrentlyUsed,
          ...((!isCurrentlyUsed) && {
            noOfColors: 1,
            colorDetails: [
              {
                plateSizeType: "Auto",
                plateDimensions: { 
                  length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                  breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                },
                pantoneType: "",
                plateType: lpPlateTypes.length > 0 ? lpPlateTypes[0].materialName : "Polymer Plate",
                mrType: lpMRTypes.length > 0 ? lpMRTypes[0].type : "SIMPLE",
                mrTypeConcatenated: lpMRTypes.length > 0 ? 
                  lpMRTypes[0].concatenated || `LP MR ${lpMRTypes[0].type}` : 
                  "LP MR SIMPLE"
              }
            ]
          })
        }
      }
    });
  };

  // Toggle FS Usage in Sandwich
  const toggleFSUsageInSandwich = () => {
    const isCurrentlyUsed = fsDetailsSandwich.isFSUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          isFSUsed: !isCurrentlyUsed,
          ...((!isCurrentlyUsed) && {
            fsType: "FS1",
            foilDetails: [
              {
                blockSizeType: "Auto",
                blockDimension: { 
                  length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                  breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                },
                foilType: foilTypes.length > 0 ? foilTypes[0].materialName : "Gold MTS 220",
                blockType: blockTypes.length > 0 ? blockTypes[0].materialName : "Magnesium Block 3MM",
                mrType: fsMRTypes.length > 0 ? fsMRTypes[0].type : "SIMPLE",
                mrTypeConcatenated: fsMRTypes.length > 0 ? 
                  fsMRTypes[0].concatenated || `FS MR ${fsMRTypes[0].type}` : 
                  "FS MR SIMPLE"
              }
            ]
          })
        }
      }
    });
  };

  // Toggle EMB Usage in Sandwich
  const toggleEMBUsageInSandwich = () => {
    const isCurrentlyUsed = embDetailsSandwich.isEMBUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          isEMBUsed: !isCurrentlyUsed,
          ...((!isCurrentlyUsed) && {
            plateSizeType: "Auto",
            plateDimensions: { 
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
            },
            plateTypeMale: embPlateTypes.length > 0 ? embPlateTypes[0].materialName : "Polymer Plate",
            plateTypeFemale: embPlateTypes.length > 0 ? embPlateTypes[0].materialName : "Polymer Plate",
            embMR: embMRTypes.length > 0 ? embMRTypes[0].type : "SIMPLE",
            embMRConcatenated: embMRTypes.length > 0 ? 
              embMRTypes[0].concatenated || `EMB MR ${embMRTypes[0].type}` : 
              "EMB MR SIMPLE"
          })
        }
      }
    });
  };

  // If Sandwich is not used, don't render any content
  if (!isSandwichComponentUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* LP Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleLPUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {lpDetailsSandwich.isLPUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use LP in Sandwich?</span>
          </label>
        </div>

        {lpDetailsSandwich.isLPUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="text-sm">
              <label className="block font-medium mb-2">Number of Colors:</label>
              <input
                type="number"
                name="noOfColors"
                min="1"
                max="10"
                value={lpDetailsSandwich.noOfColors}
                onChange={handleLPSandwichChange}
                className="border rounded-md p-2 w-full text-sm"
              />
              {errors.lpNoOfColors && <p className="text-red-500 text-sm">{errors.lpNoOfColors}</p>}
            </div>

            {lpDetailsSandwich.noOfColors > 0 && lpDetailsSandwich.colorDetails.map((color, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
                <h4 className="text-xs font-semibold mb-2">Color {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Plate Size Type */}
                  <div>
                    <label className="block text-xs mb-1">Plate Size (cm):</label>
                    <select
                      value={color.plateSizeType || "Auto"}
                      onChange={(e) => handleLPColorDetailsChange(index, "plateSizeType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    >
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                    {errors[`lpPlateSizeType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateSizeType_${index}`]}</p>}
                  </div>

                  {/* Plate Dimensions */}
                  {color.plateSizeType === "Manual" && (
                    <>
                      <div>
                        <label className="block text-xs mb-1">Length:</label>
                        <input
                          type="number"
                          placeholder="(cm)"
                          value={color.plateDimensions?.length || ""}
                          onChange={(e) => handleLPColorDetailsChange(index, "plateDimensions", { length: e.target.value })}
                          className="border rounded-md p-2 w-full text-xs"
                        />
                        {errors[`lpPlateLength_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateLength_${index}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Breadth:</label>
                        <input
                          type="number"
                          placeholder="(cm)"
                          value={color.plateDimensions?.breadth || ""}
                          onChange={(e) => handleLPColorDetailsChange(index, "plateDimensions", { breadth: e.target.value })}
                          className="border rounded-md p-2 w-full text-xs"
                        />
                        {errors[`lpPlateBreadth_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateBreadth_${index}`]}</p>}
                      </div>
                    </>
                  )}

                  {/* Pantone Type */}
                  <div>
                    <label className="block text-xs mb-1">Pantone Type:</label>
                    <input
                      type="text"
                      placeholder="Pantone Type"
                      value={color.pantoneType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "pantoneType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    />
                    {errors[`lpPantoneType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPantoneType_${index}`]}</p>}
                  </div>

                  {/* Plate Type */}
                  <div>
                    <label className="block text-xs mb-1">Plate Type:</label>
                    <select
                      value={color.plateType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "plateType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    >
                      {lpPlateTypesLoading ? (
                        <option value="" disabled>Loading Plate Types...</option>
                      ) : (
                        lpPlateTypes.map((plateType, idx) => (
                          <option key={idx} value={plateType.materialName}>
                            {plateType.materialName}
                          </option>
                        ))
                      )}
                    </select>
                    {errors[`lpPlateType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateType_${index}`]}</p>}
                  </div>

                  {/* MR Type */}
                  <div>
                    <label className="block text-xs mb-1">MR Type:</label>
                    <select
                      value={color.mrType || ""}
                      onChange={(e) => handleLPColorDetailsChange(index, "mrType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    >
                      {lpMRTypesLoading ? (
                        <option value="" disabled>Loading MR Types...</option>
                      ) : (
                        lpMRTypes.map((typeOption, idx) => (
                          <option key={idx} value={typeOption.type}>
                            {typeOption.type}
                          </option>
                        ))
                      )}
                    </select>
                    {errors[`lpMrType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpMrType_${index}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FS Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleFSUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {fsDetailsSandwich.isFSUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use FS in Sandwich?</span>
          </label>
        </div>

        {fsDetailsSandwich.isFSUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="text-sm">
              <label className="block font-medium mb-2">FS Type:</label>
              <select
                name="fsType"
                value={fsDetailsSandwich.fsType}
                onChange={handleFSSandwichChange}
                className="border rounded-md p-2 w-full"
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

            {fsDetailsSandwich.foilDetails.map((foil, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50 mt-3">
                <h4 className="text-xs font-semibold mb-2">Foil {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Block Size Type */}
                  <div>
                    <label className="block text-xs mb-1">Block Size (cm):</label>
                    <select
                      value={foil.blockSizeType || "Auto"}
                      onChange={(e) => handleFoilDetailsChange(index, "blockSizeType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    >
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                    {errors[`fsBlockSizeType_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockSizeType_${index}`]}</p>}
                  </div>

                  {/* Block Dimensions */}
                  {foil.blockSizeType === "Manual" && (
                    <>
                      <div>
                        <label className="block text-xs mb-1">Length:</label>
                        <input
                          type="number"
                          placeholder="(cm)"
                          value={foil.blockDimension?.length || ""}
                          onChange={(e) => handleFoilDetailsChange(index, "blockDimension", { length: e.target.value })}
                          className="border rounded-md p-2 w-full text-xs"
                        />
                        {errors[`fsBlockLength_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockLength_${index}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Breadth:</label>
                        <input
                          type="number"
                          placeholder="(cm)"
                          value={foil.blockDimension?.breadth || ""}
                          onChange={(e) => handleFoilDetailsChange(index, "blockDimension", { breadth: e.target.value })}
                          className="border rounded-md p-2 w-full text-xs"
                        />
                        {errors[`fsBlockBreadth_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockBreadth_${index}`]}</p>}
                      </div>
                    </>
                  )}

                  {/* Foil Type */}
                  <div>
                    <label className="block text-xs mb-1">Foil Type:</label>
                    <select
                      value={foil.foilType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "foilType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
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
                    {errors[`fsFoilType_${index}`] && <p className="text-red-500 text-xs">{errors[`fsFoilType_${index}`]}</p>}
                  </div>

                  {/* Block Type */}
                  <div>
                    <label className="block text-xs mb-1">Block Type:</label>
                    <select
                      value={foil.blockType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "blockType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
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
                    {errors[`fsBlockType_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockType_${index}`]}</p>}
                  </div>

                  {/* MR Type */}
                  <div>
                    <label className="block text-xs mb-1">MR Type:</label>
                    <select
                      value={foil.mrType || ""}
                      onChange={(e) => handleFoilDetailsChange(index, "mrType", e.target.value)}
                      className="border rounded-md p-2 w-full text-xs"
                    >
                      {fsMRTypesLoading ? (
                        <option value="" disabled>Loading MR Types...</option>
                      ) : (
                        fsMRTypes.map((typeOption, idx) => (
                          <option key={idx} value={typeOption.type}>
                            {typeOption.type}
                          </option>
                        ))
                      )}
                    </select>
                    {errors[`mrType_${index}`] && <p className="text-red-500 text-xs">{errors[`mrType_${index}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMB Section in Sandwich */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleEMBUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {embDetailsSandwich.isEMBUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-sm">Use EMB in Sandwich?</span>
          </label>
        </div>

        {embDetailsSandwich.isEMBUsed && (
          <div className="pl-6 border-l-2 border-gray-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Plate Size Type */}
              <div>
                <label className="block text-xs mb-1">Plate Size:</label>
                <select
                  name="plateSizeType"
                  value={embDetailsSandwich.plateSizeType}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-2 w-full text-xs ${errors.embPlateSizeType ? "border-red-500" : ""}`}
                >
                  <option value="">Select Plate Size Type</option>
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
                {errors.embPlateSizeType && <p className="text-red-500 text-xs">{errors.embPlateSizeType}</p>}
              </div>

              {/* Plate Dimensions */}
              {embDetailsSandwich.plateSizeType === "Manual" && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Length (cm):</label>
                    <input
                      type="number"
                      placeholder="Length"
                      value={embDetailsSandwich.plateDimensions.length || ""}
                      onChange={(e) => handleEMBDimensionChange("length", e.target.value)}
                      className={`border rounded-md p-2 w-full text-xs ${errors.embPlateLength ? "border-red-500" : ""}`}
                    />
                    {errors.embPlateLength && <p className="text-red-500 text-xs">{errors.embPlateLength}</p>}
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Breadth (cm):</label>
                    <input
                      type="number"
                      placeholder="Breadth"
                      value={embDetailsSandwich.plateDimensions.breadth || ""}
                      onChange={(e) => handleEMBDimensionChange("breadth", e.target.value)}
                      className={`border rounded-md p-2 w-full text-xs ${errors.embPlateBreadth ? "border-red-500" : ""}`}
                    />
                    {errors.embPlateBreadth && <p className="text-red-500 text-xs">{errors.embPlateBreadth}</p>}
                  </div>
                </>
              )}

              {/* Plate Type Male */}
              <div>
                <label className="block text-xs mb-1">Plate Type Male:</label>
                <select
                  name="plateTypeMale"
                  value={embDetailsSandwich.plateTypeMale}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-2 w-full text-xs ${errors.embPlateTypeMale ? "border-red-500" : ""}`}
                >
                  {embPlateTypesLoading ? (
                    <option value="" disabled>Loading Plate Types...</option>
                  ) : (
                    embPlateTypes.map((plateType, idx) => (
                      <option key={idx} value={plateType.materialName}>
                        {plateType.materialName}
                      </option>
                    ))
                  )}
                </select>
                {errors.embPlateTypeMale && <p className="text-red-500 text-xs">{errors.embPlateTypeMale}</p>}
              </div>

              {/* Plate Type Female */}
              <div>
                <label className="block text-xs mb-1">Plate Type Female:</label>
                <select
                  name="plateTypeFemale"
                  value={embDetailsSandwich.plateTypeFemale}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-2 w-full text-xs ${errors.embPlateTypeFemale ? "border-red-500" : ""}`}
                >
                  {embPlateTypesLoading ? (
                    <option value="" disabled>Loading Plate Types...</option>
                  ) : (
                    embPlateTypes.map((plateType, idx) => (
                      <option key={idx} value={plateType.materialName}>
                        {plateType.materialName}
                      </option>
                    ))
                  )}
                </select>
                {errors.embPlateTypeFemale && <p className="text-red-500 text-xs">{errors.embPlateTypeFemale}</p>}
              </div>

              {/* EMB MR */}
              <div>
                <label className="block text-xs mb-1">EMB MR:</label>
                <select
                  name="embMR"
                  value={embDetailsSandwich.embMR}
                  onChange={handleEMBSandwichChange}
                  className={`border rounded-md p-2 w-full text-xs ${errors.embMR ? "border-red-500" : ""}`}
                >
                  {embMRTypesLoading ? (
                    <option value="" disabled>Loading MR Types...</option>
                  ) : (
                    embMRTypes.map((typeOption, idx) => (
                      <option key={idx} value={typeOption.type}>
                        {typeOption.type}
                      </option>
                    ))
                  )}
                </select>
                {errors.embMR && <p className="text-red-500 text-xs">{errors.embMR}</p>}
              </div>
            </div>
          </div>
        )}
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

export default Sandwich;