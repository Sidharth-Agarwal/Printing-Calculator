import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";
import SearchablePaperDropdown from "../Fixed/SearchablePaperDropdown";

// Custom hook to fetch DST Materials from Firestore
const useDSTMaterials = () => {
  const [dstMaterials, setDSTMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDSTMaterials = async () => {
      try {
        // Query to fetch DST materials from materials collection
        const materialsCollection = collection(db, "materials");
        const dstMaterialsQuery = query(
          materialsCollection, 
          where("materialType", "==", "DST Type")
        );
        
        const querySnapshot = await getDocs(dstMaterialsQuery);
        
        const materials = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDSTMaterials(materials);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching DST materials:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDSTMaterials();
  }, []);

  return { dstMaterials, loading, error };
};

const Sandwich = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const { 
    isSandwichComponentUsed = false,
    paperInfo = {
      paperName: "",
      paperGsm: "",
      paperCompany: ""
    },
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
      plateDimensions: { length: "", breadth: "", lengthInInches: "", breadthInInches: "" },
      embMR: "",
      embMRConcatenated: "",
      dstMaterial: ""
    }
  } = state.sandwich || {};
  
  const [papers, setPapers] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Refs to track user selections and initial render
  const initialRender = useRef(true);
  const lpSelectionMade = useRef(false);
  const fsSelectionMade = useRef(false);
  const embSelectionMade = useRef(false);

  // Use custom hooks to fetch dynamic data
  const { mrTypes: lpMRTypes, loading: lpMRTypesLoading } = useMRTypes("LP MR");
  const { materials: lpPlateTypes, loading: lpPlateTypesLoading } = useMaterialTypes("Plate Type");
  
  const { mrTypes: fsMRTypes, loading: fsMRTypesLoading } = useMRTypes("FS MR");
  const { materials: foilTypes, loading: foilTypesLoading } = useMaterialTypes("Foil Type");
  const { materials: blockTypes, loading: blockTypesLoading } = useMaterialTypes("Block Type");
  
  const { mrTypes: embMRTypes, loading: embMRTypesLoading } = useMRTypes("EMB MR");
  
  // Add DST materials hook
  const { dstMaterials, loading: dstMaterialsLoading, error: dstMaterialsError } = useDSTMaterials();

  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      // If papers are loaded and no paper name is selected yet, set the first paper
      if (paperData.length > 0 && !paperInfo.paperName) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            paperInfo: {
              paperName: paperData[0].paperName,
              paperGsm: paperData[0].gsm,
              paperCompany: paperData[0].company
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch, paperInfo.paperName]);

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // ENHANCED: Clear errors when components are turned off
  useEffect(() => {
    let clearedErrors = { ...errors };
    let needsErrorUpdate = false;

    if (!lpDetailsSandwich.isLPUsed) {
      // Clear LP-related errors
      Object.keys(clearedErrors).forEach(key => {
        if (key.includes('lp') || key.includes('LP')) {
          delete clearedErrors[key];
          needsErrorUpdate = true;
        }
      });
    }

    if (!fsDetailsSandwich.isFSUsed) {
      // Clear FS-related errors
      Object.keys(clearedErrors).forEach(key => {
        if (key.includes('fs') || key.includes('FS')) {
          delete clearedErrors[key];
          needsErrorUpdate = true;
        }
      });
    }

    if (!embDetailsSandwich.isEMBUsed) {
      // Clear EMB-related errors
      Object.keys(clearedErrors).forEach(key => {
        if (key.includes('emb') || key.includes('EMB')) {
          delete clearedErrors[key];
          needsErrorUpdate = true;
        }
      });
    }

    if (needsErrorUpdate) {
      setErrors(clearedErrors);
    }
  }, [lpDetailsSandwich.isLPUsed, fsDetailsSandwich.isFSUsed, embDetailsSandwich.isEMBUsed, errors]);

  // ENHANCED: Reset data when components are toggled off
  useEffect(() => {
    if (!lpDetailsSandwich.isLPUsed) {
      if (lpDetailsSandwich.noOfColors !== 0 || lpDetailsSandwich.colorDetails.length !== 0) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            lpDetailsSandwich: {
              isLPUsed: false,
              noOfColors: 0,
              colorDetails: []
            }
          }
        });
      }
    }
  }, [lpDetailsSandwich.isLPUsed, lpDetailsSandwich.noOfColors, lpDetailsSandwich.colorDetails.length, dispatch]);

  useEffect(() => {
    if (!fsDetailsSandwich.isFSUsed) {
      if (fsDetailsSandwich.fsType !== "" || fsDetailsSandwich.foilDetails.length !== 0) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            fsDetailsSandwich: {
              isFSUsed: false,
              fsType: "",
              foilDetails: []
            }
          }
        });
      }
    }
  }, [fsDetailsSandwich.isFSUsed, fsDetailsSandwich.fsType, fsDetailsSandwich.foilDetails.length, dispatch]);

  useEffect(() => {
    if (!embDetailsSandwich.isEMBUsed) {
      if (embDetailsSandwich.plateSizeType !== "" || embDetailsSandwich.plateDimensions.length !== "" || 
          embDetailsSandwich.plateDimensions.breadth !== "" || embDetailsSandwich.embMR !== "" || 
          embDetailsSandwich.dstMaterial !== "") {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              isEMBUsed: false,
              plateSizeType: "",
              plateDimensions: { length: "", breadth: "", lengthInInches: "", breadthInInches: "" },
              embMR: "",
              embMRConcatenated: "",
              dstMaterial: ""
            }
          }
        });
      }
    }
  }, [embDetailsSandwich.isEMBUsed, embDetailsSandwich.plateSizeType, embDetailsSandwich.plateDimensions.length, 
      embDetailsSandwich.plateDimensions.breadth, embDetailsSandwich.embMR, embDetailsSandwich.dstMaterial, dispatch]);

  // ENHANCED: Validate against available options (similar to FSDetails)
  useEffect(() => {
    // Skip during initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // LP validation
    if (lpDetailsSandwich.isLPUsed && !lpPlateTypesLoading && !lpMRTypesLoading && 
        lpPlateTypes.length > 0 && lpMRTypes.length > 0 && lpDetailsSandwich.colorDetails.length > 0 && 
        !lpSelectionMade.current) {
      
      let needsLPUpdate = false;
      const updatedLPColorDetails = [...lpDetailsSandwich.colorDetails];

      updatedLPColorDetails.forEach((color, index) => {
        // Check if plate type exists
        if (color.plateType) {
          const plateTypeExists = lpPlateTypes.some(pt => pt.materialName === color.plateType);
          if (!plateTypeExists) {
            updatedLPColorDetails[index].plateType = lpPlateTypes[0].materialName;
            needsLPUpdate = true;
          }
        }

        // Check if MR type exists
        if (color.mrType) {
          const mrTypeExists = lpMRTypes.some(mt => mt.type === color.mrType);
          if (!mrTypeExists) {
            updatedLPColorDetails[index].mrType = lpMRTypes[0].type;
            const selectedMrType = lpMRTypes.find(mt => mt.type === lpMRTypes[0].type);
            updatedLPColorDetails[index].mrTypeConcatenated = selectedMrType?.concatenated || `LP MR ${lpMRTypes[0].type}`;
            needsLPUpdate = true;
          }
        }
      });

      if (needsLPUpdate) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            lpDetailsSandwich: {
              ...lpDetailsSandwich,
              colorDetails: updatedLPColorDetails
            }
          }
        });
      }
    }

    // FS validation
    if (fsDetailsSandwich.isFSUsed && !foilTypesLoading && !blockTypesLoading && !fsMRTypesLoading &&
        foilTypes.length > 0 && blockTypes.length > 0 && fsMRTypes.length > 0 && 
        fsDetailsSandwich.foilDetails.length > 0 && !fsSelectionMade.current) {
      
      let needsFSUpdate = false;
      const updatedFSFoilDetails = [...fsDetailsSandwich.foilDetails];

      updatedFSFoilDetails.forEach((foil, index) => {
        // Check if foil type exists
        if (foil.foilType) {
          const foilTypeExists = foilTypes.some(ft => ft.materialName === foil.foilType);
          if (!foilTypeExists) {
            updatedFSFoilDetails[index].foilType = foilTypes[0].materialName;
            needsFSUpdate = true;
          }
        }

        // Check if block type exists
        if (foil.blockType) {
          const blockTypeExists = blockTypes.some(bt => bt.materialName === foil.blockType);
          if (!blockTypeExists) {
            updatedFSFoilDetails[index].blockType = blockTypes[0].materialName;
            needsFSUpdate = true;
          }
        }

        // Check if MR type exists
        if (foil.mrType) {
          const mrTypeExists = fsMRTypes.some(mt => mt.type === foil.mrType);
          if (!mrTypeExists) {
            updatedFSFoilDetails[index].mrType = fsMRTypes[0].type;
            const selectedMrType = fsMRTypes.find(mt => mt.type === fsMRTypes[0].type);
            updatedFSFoilDetails[index].mrTypeConcatenated = selectedMrType?.concatenated || `FS MR ${fsMRTypes[0].type}`;
            needsFSUpdate = true;
          }
        }
      });

      if (needsFSUpdate) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            fsDetailsSandwich: {
              ...fsDetailsSandwich,
              foilDetails: updatedFSFoilDetails
            }
          }
        });
      }
    }

    // EMB validation
    if (embDetailsSandwich.isEMBUsed && !embMRTypesLoading && !dstMaterialsLoading &&
        embMRTypes.length > 0 && dstMaterials.length > 0 && !embSelectionMade.current) {
      
      let needsEMBUpdate = false;
      const updates = {};

      // Check if EMB MR type exists
      if (embDetailsSandwich.embMR) {
        const mrTypeExists = embMRTypes.some(mt => mt.type === embDetailsSandwich.embMR);
        if (!mrTypeExists) {
          updates.embMR = embMRTypes[0].type;
          const selectedMrType = embMRTypes.find(mt => mt.type === embMRTypes[0].type);
          updates.embMRConcatenated = selectedMrType?.concatenated || `EMB MR ${embMRTypes[0].type}`;
          needsEMBUpdate = true;
        }
      }

      // Check if DST material exists
      if (embDetailsSandwich.dstMaterial) {
        const dstMaterialExists = dstMaterials.some(dm => dm.materialName === embDetailsSandwich.dstMaterial);
        if (!dstMaterialExists) {
          const preferredDstMaterial = dstMaterials.find(material => 
            material.materialName === "DST PP PLATE"
          );
          updates.dstMaterial = preferredDstMaterial ? 
            preferredDstMaterial.materialName : 
            (dstMaterials[0]?.materialName || "");
          needsEMBUpdate = true;
        }
      }

      if (needsEMBUpdate) {
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              ...updates
            }
          }
        });
      }
    }
  }, [lpPlateTypes, lpMRTypes, foilTypes, blockTypes, fsMRTypes, embMRTypes, dstMaterials,
      lpPlateTypesLoading, lpMRTypesLoading, foilTypesLoading, blockTypesLoading, 
      fsMRTypesLoading, embMRTypesLoading, dstMaterialsLoading,
      lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich, dispatch]);

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

  // ENHANCED: Update foil details dynamically when FS type changes (like FSDetails)
  useEffect(() => {
    if (!fsDetailsSandwich.isFSUsed || fsDetailsSandwich.fsType === undefined) return;

    // Determine how many foil details are needed based on FS type
    const numberOfFoilOptions =
      fsDetailsSandwich.fsType === "FS1" ? 1 :
      fsDetailsSandwich.fsType === "FS2" ? 2 :
      fsDetailsSandwich.fsType === "FS3" ? 3 :
      fsDetailsSandwich.fsType === "FS4" ? 4 : 5; // For FS5

    // Only update if the count doesn't match
    if (fsDetailsSandwich.foilDetails.length !== numberOfFoilOptions) {
      // Get default values from loaded data
      const defaultFoilType = !foilTypesLoading && foilTypes.length > 0 ? foilTypes[0].materialName : "";
      const defaultBlockType = !blockTypesLoading && blockTypes.length > 0 ? blockTypes[0].materialName : "";
      const defaultMrType = !fsMRTypesLoading && fsMRTypes.length > 0 ? {
        type: fsMRTypes[0].type,
        concatenated: fsMRTypes[0].concatenated
      } : {
        type: "SIMPLE",
        concatenated: "FS MR SIMPLE"
      };

      // Create new foil details array with the correct number of items
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        // Preserve existing details if available
        if (index < fsDetailsSandwich.foilDetails.length) {
          return fsDetailsSandwich.foilDetails[index];
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
        type: "UPDATE_SANDWICH",
        payload: {
          fsDetailsSandwich: {
            ...fsDetailsSandwich,
            foilDetails: updatedFoilDetails
          }
        }
      });
    }
  }, [fsDetailsSandwich.fsType, fsDetailsSandwich.isFSUsed, fsDetailsSandwich.foilDetails, dieSize, 
      foilTypes, blockTypes, fsMRTypes, foilTypesLoading, blockTypesLoading, fsMRTypesLoading, dispatch]);

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

  // Set default MR Types and DST Material for EMB when component mounts or when EMB is first enabled
  useEffect(() => {
    if (embDetailsSandwich.isEMBUsed && embMRTypes.length > 0 && dstMaterials.length > 0) {
      const defaultMRType = embMRTypes[0];
      
      // Look for "DST PP PLATE" first, fallback to first material
      const preferredDstMaterial = dstMaterials.find(material => 
        material.materialName === "DST PP PLATE"
      );
      const defaultDstMaterial = preferredDstMaterial ? 
        preferredDstMaterial.materialName : 
        (dstMaterials[0]?.materialName || "");
      
      const updatePayload = {};

      if (!embDetailsSandwich.embMR) {
        updatePayload.embMR = defaultMRType.type;
      }

      if (!embDetailsSandwich.embMRConcatenated) {
        updatePayload.embMRConcatenated = defaultMRType.concatenated || `EMB MR ${defaultMRType.type}`;
      }

      // Set dstMaterial if it's empty (prioritize DST PP PLATE)
      if (!embDetailsSandwich.dstMaterial) {
        updatePayload.dstMaterial = defaultDstMaterial;
        
        // Log for debugging
        if (preferredDstMaterial) {
          console.log("Sandwich EMB: Selected preferred DST material:", defaultDstMaterial);
        } else {
          console.log("Sandwich EMB: DST PP PLATE not found, using fallback:", defaultDstMaterial);
        }
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
  }, [embDetailsSandwich.isEMBUsed, embMRTypes, dstMaterials, embDetailsSandwich, dispatch]);

  // Update dimensions when die size changes (for Auto mode)
  useEffect(() => {
    const updates = {};
    let needsUpdate = false;

    // LP Color Details
    if (lpDetailsSandwich.isLPUsed) {
      const updatedColorDetails = lpDetailsSandwich.colorDetails.map(color => {
        if (color.plateSizeType === "Auto") {
          const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
          const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
          
          return {
            ...color,
            plateDimensions: {
              length: lengthCm,
              breadth: breadthCm,
              lengthInInches: dieSize.length || "",
              breadthInInches: dieSize.breadth || ""
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
        needsUpdate = true;
      }
    }

    // FS Foil Details
    if (fsDetailsSandwich.isFSUsed) {
      const updatedFoilDetails = fsDetailsSandwich.foilDetails.map(foil => {
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
        needsUpdate = true;
      }
    }

    // EMB Plate Dimensions
    if (embDetailsSandwich.isEMBUsed && embDetailsSandwich.plateSizeType === "Auto") {
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      const updatedDimensions = {
        length: lengthCm,
        breadth: breadthCm,
        lengthInInches: dieSize.length || "",
        breadthInInches: dieSize.breadth || ""
      };

      if (JSON.stringify(updatedDimensions) !== JSON.stringify(embDetailsSandwich.plateDimensions)) {
        updates.embDetailsSandwich = {
          ...embDetailsSandwich,
          plateDimensions: updatedDimensions
        };
        needsUpdate = true;
      }
    }

    // Dispatch updates if any
    if (needsUpdate) {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: updates
      });
    }
  }, [dieSize, lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich, dispatch]);

  // Helper method to validate fields
  const validateFields = () => {
    const newErrors = {};

    // Validate Paper
    if (!paperInfo.paperName) {
      newErrors.paperName = "Paper selection is required for sandwich component.";
    }

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
          if (!color.plateDimensions?.lengthInInches) {
            newErrors[`lpPlateLength_${index}`] = "Plate length is required.";
          }
          if (!color.plateDimensions?.breadthInInches) {
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
          if (!foil.blockDimension?.lengthInInches) {
            newErrors[`fsBlockLength_${index}`] = "Block length is required.";
          }
          if (!foil.blockDimension?.breadthInInches) {
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

    // Validate EMB if used - Updated to include DST material validation
    if (embDetailsSandwich.isEMBUsed) {
      if (!embDetailsSandwich.plateSizeType) {
        newErrors.embPlateSizeType = "Plate size type is required.";
      }
      if (embDetailsSandwich.plateSizeType === "Manual") {
        if (!embDetailsSandwich.plateDimensions?.lengthInInches) {
          newErrors.embPlateLength = "Plate length is required.";
        }
        if (!embDetailsSandwich.plateDimensions?.breadthInInches) {
          newErrors.embPlateBreadth = "Plate breadth is required.";
        }
      }
      if (!embDetailsSandwich.embMR) {
        newErrors.embMR = "EMB MR type is required.";
      }
      if (!embDetailsSandwich.dstMaterial) {
        newErrors.embDstMaterial = "DST Material is required.";
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

  // FIXED: Handle paper selection from SearchablePaperDropdown
  const handlePaperChange = (e) => {
    console.log("Sandwich paper change event:", e);
    
    // Handle complete paper selection data from SearchablePaperDropdown
    if (e.target.name === "paperSelection") {
      console.log("Complete paper selection changed in Sandwich:", e.target.value);
      
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          paperInfo: {
            paperName: e.target.value.paperName,
            paperGsm: e.target.value.paperGsm,
            paperCompany: e.target.value.paperCompany
          }
        }
      });
      return;
    }
    
    // Handle legacy paperName only updates (fallback)
    if (e.target.name === "paperName") {
      console.log("Paper name only changed in Sandwich:", e.target.value);
      
      // Find the complete paper data
      const selectedPaperObj = papers.find(paper => paper.paperName === e.target.value);
      
      if (selectedPaperObj) {
        console.log("Found complete paper data for Sandwich:", e.target.value, selectedPaperObj);
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            paperInfo: {
              paperName: selectedPaperObj.paperName,
              paperGsm: selectedPaperObj.gsm,
              paperCompany: selectedPaperObj.company
            }
          }
        });
      } else {
        // Fallback if paper not found
        console.warn("Paper not found in papers list for Sandwich:", e.target.value);
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            paperInfo: {
              ...paperInfo,
              paperName: e.target.value
            }
          }
        });
      }
      return;
    }
    
    // Default case - direct paper name update
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        paperInfo: {
          ...paperInfo,
          paperName: e.target.value
        }
      }
    });
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
              // Preserve existing details if available
              if (index < lpDetailsSandwich.colorDetails.length) {
                return lpDetailsSandwich.colorDetails[index];
              }

              // Create new detail with proper defaults
              const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
              const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
              
              const defaultPlateType = lpPlateTypes.length > 0 ? lpPlateTypes[0].materialName : "Polymer Plate";
              const defaultMRType = lpMRTypes.length > 0 ? 
                { type: lpMRTypes[0].type, concatenated: lpMRTypes[0].concatenated } : 
                { type: "SIMPLE", concatenated: "LP MR SIMPLE" };

              return {
                plateSizeType: "Auto",
                plateDimensions: {
                  length: lengthCm,
                  breadth: breadthCm,
                  lengthInInches: dieSize.length || "",
                  breadthInInches: dieSize.breadth || ""
                },
                pantoneType: "Not sure",  // Default as in LPDetails
                plateType: defaultPlateType,
                mrType: defaultMRType.type,
                mrTypeConcatenated: defaultMRType.concatenated
              };
            })
          }
        }
      });
    }
  };

  // ENHANCED: Handle LP Sandwich color details change with selection tracking
  const handleLPColorDetailsChange = (index, field, value) => {
    lpSelectionMade.current = true; // Track user selection
    
    const updatedColorDetails = [...lpDetailsSandwich.colorDetails];
    
    if (field === "plateSizeType") {
      updatedColorDetails[index].plateSizeType = value;
      
      // Reset plate dimensions when switching to Manual
      if (value === "Manual") {
        updatedColorDetails[index].plateDimensions = { 
          length: "", 
          breadth: "",
          lengthInInches: "",
          breadthInInches: ""
        };
      }

      // Populate dimensions when switching to Auto
      if (value === "Auto") {
        const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
        const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
        
        updatedColorDetails[index].plateDimensions = {
          length: lengthCm,
          breadth: breadthCm,
          lengthInInches: dieSize.length || "",
          breadthInInches: dieSize.breadth || ""
        };
      }
    } else if (field === "plateDimensions") {
      // Handle dimensions in inches and convert to cm for storage
      if (value.length !== undefined) {
        // Store the original inches value
        updatedColorDetails[index].plateDimensions.lengthInInches = value.length;
        // Convert to cm for the standard database field
        updatedColorDetails[index].plateDimensions.length = value.length ? inchesToCm(value.length).toFixed(2) : "";
      }
      
      if (value.breadth !== undefined) {
        // Store the original inches value
        updatedColorDetails[index].plateDimensions.breadthInInches = value.breadth;
        // Convert to cm for the standard database field
        updatedColorDetails[index].plateDimensions.breadth = value.breadth ? inchesToCm(value.breadth).toFixed(2) : "";
      }
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
        value === "FS1" ? 1 :
        value === "FS2" ? 2 :
        value === "FS3" ? 3 :
        value === "FS4" ? 4 : 5; // For FS5
          
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        // Preserve existing details if available
        if (index < fsDetailsSandwich.foilDetails.length) {
          return fsDetailsSandwich.foilDetails[index];
        }
        
        // Create new detail with proper defaults
        const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
        const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
        
        const defaultMRType = fsMRTypes.length > 0 ? 
          { type: fsMRTypes[0].type, concatenated: fsMRTypes[0].concatenated } : 
          { type: "SIMPLE", concatenated: "FS MR SIMPLE" };
        
        const defaultFoilType = foilTypes.length > 0 ? foilTypes[0].materialName : "Gold MTS 220";
        const defaultBlockType = blockTypes.length > 0 ? blockTypes[0].materialName : "Magnesium Block 3MM";

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
          mrType: defaultMRType.type,
          mrTypeConcatenated: defaultMRType.concatenated
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

  // ENHANCED: Handle FS Sandwich foil details change with selection tracking
  const handleFoilDetailsChange = (index, field, value) => {
    fsSelectionMade.current = true; // Track user selection
    
    const updatedFoilDetails = [...fsDetailsSandwich.foilDetails];
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;
      
      // Reset block dimensions when switching to Manual
      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { 
          length: "", 
          breadth: "",
          lengthInInches: "",
          breadthInInches: ""
        };
      }

      // Populate dimensions when switching to Auto
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
      // Handle input values as inches and convert to cm
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

  // ENHANCED: Handle EMB Sandwich change with selection tracking
  const handleEMBSandwichChange = (e) => {
    embSelectionMade.current = true; // Track user selection
    
    const { name, value } = e.target;
    
    if (name === "plateSizeType") {
      if (value === "Auto") {
        const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
        const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
        
        dispatch({
          type: "UPDATE_SANDWICH",
          payload: {
            embDetailsSandwich: {
              ...embDetailsSandwich,
              [name]: value,
              plateDimensions: {
                length: lengthCm,
                breadth: breadthCm,
                lengthInInches: dieSize.length || "",
                breadthInInches: dieSize.breadth || ""
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
              plateDimensions: { 
                length: "", 
                breadth: "",
                lengthInInches: "",
                breadthInInches: ""
              }
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
      // Handle other fields including DST material
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
    embSelectionMade.current = true; // Track user selection
    
    const updatedDimensions = { ...embDetailsSandwich.plateDimensions };
    
    if (field === "length") {
      // Store the original inches value
      updatedDimensions.lengthInInches = value;
      // Convert to cm for storage
      updatedDimensions.length = value ? inchesToCm(value).toFixed(2) : "";
    } else if (field === "breadth") {
      // Store the original inches value
      updatedDimensions.breadthInInches = value;
      // Convert to cm for storage
      updatedDimensions.breadth = value ? inchesToCm(value).toFixed(2) : "";
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          plateDimensions: updatedDimensions
        }
      }
    });
  }

  // Toggle LP Usage in Sandwich
  const toggleLPUsageInSandwich = () => {
    const isCurrentlyUsed = lpDetailsSandwich.isLPUsed;
    
    const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
    const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
    
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
                  length: lengthCm, 
                  breadth: breadthCm,
                  lengthInInches: dieSize.length || "",
                  breadthInInches: dieSize.breadth || ""
                },
                pantoneType: "Not sure",
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
    
    const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
    const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
    
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
                  length: lengthCm, 
                  breadth: breadthCm,
                  lengthInInches: dieSize.length || "",
                  breadthInInches: dieSize.breadth || ""
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

  // Toggle EMB Usage in Sandwich - Updated to include DST material
  const toggleEMBUsageInSandwich = () => {
    const isCurrentlyUsed = embDetailsSandwich.isEMBUsed;
    
    const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
    const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
    
    // Get default DST material
    const preferredDstMaterial = dstMaterials.find(material => 
      material.materialName === "DST PP PLATE"
    );
    const defaultDstMaterial = preferredDstMaterial ? 
      preferredDstMaterial.materialName : 
      (dstMaterials[0]?.materialName || "");
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          isEMBUsed: !isCurrentlyUsed,
          ...((!isCurrentlyUsed) && {
            plateSizeType: "Auto",
            plateDimensions: { 
              length: lengthCm, 
              breadth: breadthCm,
              lengthInInches: dieSize.length || "",
              breadthInInches: dieSize.breadth || ""
            },
            embMR: embMRTypes.length > 0 ? embMRTypes[0].type : "SIMPLE",
            embMRConcatenated: embMRTypes.length > 0 ? 
              embMRTypes[0].concatenated || `EMB MR ${embMRTypes[0].type}` : 
              "EMB MR SIMPLE",
            dstMaterial: defaultDstMaterial // Add default DST material
          })
        }
      }
    });
  };

  // If Sandwich is not used, don't render any content
  if (!isSandwichComponentUsed) {
    return null;
  }

  // ENHANCED: Check if any hooks are still loading
  const isLoading = lpMRTypesLoading || lpPlateTypesLoading || fsMRTypesLoading || 
                   foilTypesLoading || blockTypesLoading || embMRTypesLoading || dstMaterialsLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper Selection Section */}
      <div>
        <div>
          <label className="block mb-1 text-xs">Paper Name:</label>
          <SearchablePaperDropdown 
            papers={papers}
            selectedPaper={paperInfo.paperName || ""}
            onChange={handlePaperChange}
            compact={false}
            isDieSelected={true}
          />
          {errors.paperName && <p className="text-red-500 text-xs mt-1">{errors.paperName}</p>}
        </div>
      </div>

      {/* LP Section in Sandwich */}
      <div>
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleLPUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {lpDetailsSandwich.isLPUsed && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-xs">Use LP in Sandwich?</span>
          </label>
        </div>

        {lpDetailsSandwich.isLPUsed && (
          <div className="border-gray-200 mb-4">
            {/* ENHANCED: Loading state for LP */}
            {lpMRTypesLoading || lpPlateTypesLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading LP materials...</p>
              </div>
            ) : (
              <>
                <div className="text-xs">
                  <label className="block font-medium mb-2">Number of Colors:</label>
                  <input
                    type="number"
                    name="noOfColors"
                    min="1"
                    max="10"
                    value={lpDetailsSandwich.noOfColors}
                    onChange={handleLPSandwichChange}
                    onWheel={(e) => e.target.blur()}
                    className="border rounded-md p-2 w-full text-xs"
                  />
                  {errors.lpNoOfColors && <p className="text-red-500 text-xs">{errors.lpNoOfColors}</p>}
                </div>

                {lpDetailsSandwich.noOfColors > 0 && lpDetailsSandwich.colorDetails.map((color, index) => (
                  <div key={index} className="mt-3">
                    <h4 className="text-xs font-semibold mb-2">Color {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Plate Size Type */}
                      <div>
                        <label className="block text-xs mb-1">Plate Size:</label>
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
                      {color.plateSizeType === "Manual" ? (
                        <>
                          <div>
                            <label className="block text-xs mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={color.plateDimensions?.lengthInInches || ""}
                              onChange={(e) => handleLPColorDetailsChange(index, "plateDimensions", { length: e.target.value })}
                              className="border rounded-md p-2 w-full text-xs"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {color.plateDimensions?.length ? `${color.plateDimensions.length} cm` : ""}
                            </div>
                            {errors[`lpPlateLength_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateLength_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={color.plateDimensions?.breadthInInches || ""}
                              onChange={(e) => handleLPColorDetailsChange(index, "plateDimensions", { breadth: e.target.value })}
                              className="border rounded-md p-2 w-full text-xs"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {color.plateDimensions?.breadth ? `${color.plateDimensions.breadth} cm` : ""}
                            </div>
                            {errors[`lpPlateBreadth_${index}`] && <p className="text-red-500 text-xs">{errors[`lpPlateBreadth_${index}`]}</p>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={color.plateDimensions?.lengthInInches || ""}
                              className="border rounded-md p-2 w-full text-xs bg-gray-100"
                              readOnly
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {color.plateDimensions?.length ? `${color.plateDimensions.length} cm` : ""}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={color.plateDimensions?.breadthInInches || ""}
                              className="border rounded-md p-2 w-full text-xs bg-gray-100"
                              readOnly
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {color.plateDimensions?.breadth ? `${color.plateDimensions.breadth} cm` : ""}
                            </div>
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
                          {lpPlateTypes.map((plateType, idx) => (
                            <option key={idx} value={plateType.materialName}>
                              {plateType.materialName}
                            </option>
                          ))}
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
                          {lpMRTypes.map((typeOption, idx) => (
                            <option key={idx} value={typeOption.type}>
                              {typeOption.type}
                            </option>
                          ))}
                        </select>
                        {errors[`lpMrType_${index}`] && <p className="text-red-500 text-xs">{errors[`lpMrType_${index}`]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
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
              {fsDetailsSandwich.isFSUsed && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-xs">Use FS in Sandwich?</span>
          </label>
        </div>

        {fsDetailsSandwich.isFSUsed && (
          <div className="border-gray-200 mb-4">
            {/* ENHANCED: Loading state for FS */}
            {fsMRTypesLoading || foilTypesLoading || blockTypesLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading FS materials...</p>
              </div>
            ) : (
              <>
                <div className="text-xs">
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
                  {errors.fsType && <p className="text-red-500 text-xs">{errors.fsType}</p>}
                </div>

                {fsDetailsSandwich.foilDetails.map((foil, index) => (
                  <div key={index} className="mt-3">
                    <h4 className="text-xs font-semibold mb-2">Foil {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Block Size Type */}
                      <div>
                        <label className="block text-xs mb-1">Block Size:</label>
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
                      {foil.blockSizeType === "Manual" ? (
                        <>
                          <div>
                            <label className="block text-xs mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={foil.blockDimension?.lengthInInches || ""}
                              onChange={(e) => handleFoilDetailsChange(index, "blockDimension", { length: e.target.value })}
                              className="border rounded-md p-2 w-full text-xs"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {foil.blockDimension?.length ? `${foil.blockDimension.length} cm` : ""}
                            </div>
                            {errors[`fsBlockLength_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockLength_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={foil.blockDimension?.breadthInInches || ""}
                              onChange={(e) => handleFoilDetailsChange(index, "blockDimension", { breadth: e.target.value })}
                              className="border rounded-md p-2 w-full text-xs"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {foil.blockDimension?.breadth ? `${foil.blockDimension.breadth} cm` : ""}
                            </div>
                            {errors[`fsBlockBreadth_${index}`] && <p className="text-red-500 text-xs">{errors[`fsBlockBreadth_${index}`]}</p>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs mb-1">Length:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={foil.blockDimension?.lengthInInches || ""}
                              className="border rounded-md p-2 w-full text-xs bg-gray-100"
                              readOnly
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {foil.blockDimension?.length ? `${foil.blockDimension.length} cm` : ""}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Breadth:</label>
                            <input
                              type="number"
                              placeholder="(inches)"
                              value={foil.blockDimension?.breadthInInches || ""}
                              className="border rounded-md p-2 w-full text-xs bg-gray-100"
                              readOnly
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {foil.blockDimension?.breadth ? `${foil.blockDimension.breadth} cm` : ""}
                            </div>
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
                          {foilTypes.map((foilType, idx) => (
                            <option key={idx} value={foilType.materialName}>
                              {foilType.materialName}
                            </option>
                          ))}
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
                          {blockTypes.map((blockType, idx) => (
                            <option key={idx} value={blockType.materialName}>
                              {blockType.materialName}
                            </option>
                          ))}
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
                          {fsMRTypes.map((typeOption, idx) => (
                            <option key={idx} value={typeOption.type}>
                              {typeOption.type}
                            </option>
                          ))}
                        </select>
                        {errors[`fsMrType_${index}`] && <p className="text-red-500 text-xs">{errors[`fsMrType_${index}`]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* EMB Section in Sandwich - UPDATED WITH DST MATERIAL */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 cursor-pointer mb-4">
          <label
            className="flex items-center space-x-3"
            onClick={toggleEMBUsageInSandwich}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {embDetailsSandwich.isEMBUsed && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
            </div>
            <span className="text-gray-700 font-semibold text-xs">Use EMB in Sandwich?</span>
          </label>
        </div>

        {embDetailsSandwich.isEMBUsed && (
          <div className="border-gray-200 mb-4">
            {/* ENHANCED: Loading state for EMB */}
            {embMRTypesLoading || dstMaterialsLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading EMB materials...</p>
              </div>
            ) : (
              <>
                {/* All fields in a single line */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                  {/* Length Input - conditionally shown if plateSizeType is set */}
                  {embDetailsSandwich.plateSizeType && (
                    <div>
                      <label className="block text-xs mb-1">Length (inches):</label>
                      <input
                        type="number"
                        placeholder="Enter length"
                        value={embDetailsSandwich.plateDimensions?.lengthInInches || ""}
                        onChange={(e) => embDetailsSandwich.plateSizeType === "Manual" ? 
                          handleEMBDimensionChange("length", e.target.value) : null}
                        className={`border rounded-md p-2 w-full text-xs ${
                          embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-50" : ""
                        } ${errors.embPlateLength ? "border-red-500" : ""}`}
                        readOnly={embDetailsSandwich.plateSizeType === "Auto"}
                      />
                      {embDetailsSandwich.plateDimensions?.length && (
                        <div className="text-xs text-gray-500 mt-1">
                          {embDetailsSandwich.plateDimensions.length} cm
                        </div>
                      )}
                      {errors.embPlateLength && <p className="text-red-500 text-xs">{errors.embPlateLength}</p>}
                    </div>
                  )}

                  {/* Breadth Input - conditionally shown if plateSizeType is set */}
                  {embDetailsSandwich.plateSizeType && (
                    <div>
                      <label className="block text-xs mb-1">Breadth (inches):</label>
                      <input
                        type="number"
                        placeholder="Enter breadth"
                        value={embDetailsSandwich.plateDimensions?.breadthInInches || ""}
                        onChange={(e) => embDetailsSandwich.plateSizeType === "Manual" ? 
                          handleEMBDimensionChange("breadth", e.target.value) : null}
                        className={`border rounded-md p-2 w-full text-xs ${
                          embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-50" : ""
                        } ${errors.embPlateBreadth ? "border-red-500" : ""}`}
                        readOnly={embDetailsSandwich.plateSizeType === "Auto"}
                      />
                      {embDetailsSandwich.plateDimensions?.breadth && (
                        <div className="text-xs text-gray-500 mt-1">
                          {embDetailsSandwich.plateDimensions.breadth} cm
                        </div>
                      )}
                      {errors.embPlateBreadth && <p className="text-red-500 text-xs">{errors.embPlateBreadth}</p>}
                    </div>
                  )}

                  {/* EMB MR Type */}
                  <div>
                    <label className="block text-xs mb-1">EMB MR:</label>
                    <select
                      name="embMR"
                      value={embDetailsSandwich.embMR}
                      onChange={handleEMBSandwichChange}
                      className={`border rounded-md p-2 w-full text-xs ${errors.embMR ? "border-red-500" : ""}`}
                    >
                      <option value="">Select MR Type</option>
                      {embMRTypes.map((typeOption, idx) => (
                        <option key={idx} value={typeOption.type}>
                          {typeOption.type}
                        </option>
                      ))}
                    </select>
                    {errors.embMR && <p className="text-red-500 text-xs">{errors.embMR}</p>}
                  </div>

                  {/* DST Material - NEW FIELD */}
                  <div>
                    <label className="block text-xs mb-1">DST Material:</label>
                    <select
                      name="dstMaterial"
                      value={embDetailsSandwich.dstMaterial}
                      onChange={handleEMBSandwichChange}
                      className={`border rounded-md p-2 w-full text-xs ${
                        errors.embDstMaterial ? "border-red-500" : ""
                      }`}
                      disabled={dstMaterialsLoading}
                    >
                      <option value="">
                        {dstMaterialsLoading ? "Loading DST Materials..." : "Select DST Material"}
                      </option>
                      {/* Sort DST materials to show DST PP PLATE first if available */}
                      {dstMaterials
                        .sort((a, b) => {
                          // Prioritize "DST PP PLATE" at the top
                          if (a.materialName === "DST PP PLATE") return -1;
                          if (b.materialName === "DST PP PLATE") return 1;
                          return a.materialName.localeCompare(b.materialName);
                        })
                        .map((material) => (
                          <option key={material.id} value={material.materialName}>
                            {material.materialName}
                          </option>
                        ))}
                    </select>
                    {errors.embDstMaterial && (
                      <p className="text-red-500 text-xs">{errors.embDstMaterial}</p>
                    )}
                    {dstMaterialsError && (
                      <p className="text-red-500 text-xs">Failed to load DST materials</p>
                    )}
                  </div>
                </div>

                {/* Plate Cost Message */}
                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md mt-3">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-700 text-xs">
                      Embossing plate costs will be calculated separately.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {!singlePageMode && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-xs"
          >
            Previous
          </button>
          <button
            type="submit"
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Next
          </button>
        </div>
      )}
    </form>
  );
};

export default Sandwich;