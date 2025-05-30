import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import useMRTypes from "../../../../hooks/useMRTypes";
import useMaterialTypes from "../../../../hooks/useMaterialTypes";

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

const LPDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});
  
  // Use the custom hooks to fetch LP MR types and plate types
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("LP MR");
  const { materials: plateTypes, loading: plateTypesLoading } = useMaterialTypes("Plate Type");
  
  // Use custom hook to fetch DST materials
  const { dstMaterials, loading: dstMaterialsLoading, error: dstMaterialsError } = useDSTMaterials();

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Helper function to get the default DST material
  const getDefaultDstMaterial = () => {
    if (dstMaterials.length === 0) return "";
    
    // Look for "DST PP PLATE" first
    const preferredMaterial = dstMaterials.find(material => 
      material.materialName === "DST PP PLATE"
    );
    
    // If "DST PP PLATE" is found, use it; otherwise use the first material
    return preferredMaterial ? preferredMaterial.materialName : dstMaterials[0]?.materialName || "";
  };

  // Update dimensions when die size changes (for Auto mode)
  useEffect(() => {
    if (lpDetails.isLPUsed) {
      const updatedDetails = lpDetails.colorDetails.map((color) => {
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
            },
          };
        }
        return color;
      });

      const needsUpdate = JSON.stringify(lpDetails.colorDetails) !== JSON.stringify(updatedDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [lpDetails.isLPUsed, dieSize, dispatch, lpDetails.colorDetails]);

  // Set default MR Types and DST Material when they are loaded
  useEffect(() => {
    if (lpDetails.isLPUsed && mrTypes.length > 0 && dstMaterials.length > 0 && lpDetails.colorDetails.length > 0) {
      const defaultMRType = mrTypes[0];
      const defaultDstMaterial = getDefaultDstMaterial();
      
      // Check if any color has empty/missing values that need updates
      const needsUpdate = lpDetails.colorDetails.some(color => 
        !color.mrType || 
        !color.mrTypeConcatenated || 
        !color.dstMaterial
      );
      
      if (needsUpdate) {
        const updatedDetails = lpDetails.colorDetails.map(color => ({
          ...color,
          mrType: color.mrType || defaultMRType.type,
          mrTypeConcatenated: color.mrTypeConcatenated || defaultMRType.concatenated || `LP MR ${defaultMRType.type}`,
          dstMaterial: color.dstMaterial || defaultDstMaterial
        }));
        
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [mrTypes, dstMaterials, lpDetails.isLPUsed, lpDetails.colorDetails, dispatch]);

  // Set default plate types when plate types are loaded
  useEffect(() => {
    if (lpDetails.isLPUsed && plateTypes.length > 0 && lpDetails.colorDetails.length > 0) {
      const defaultPlateType = plateTypes[0].materialName;
      
      // Check if any color has an empty/missing plate type
      const needsPlateTypeUpdate = lpDetails.colorDetails.some(color => !color.plateType);
      
      if (needsPlateTypeUpdate) {
        const updatedDetails = lpDetails.colorDetails.map(color => ({
          ...color,
          plateType: color.plateType || defaultPlateType
        }));
        
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: { colorDetails: updatedDetails },
        });
      }
    }
  }, [plateTypes, lpDetails.isLPUsed, lpDetails.colorDetails, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { [name]: value },
      });
      generateColorDetails(value);
    }
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetails.colorDetails];

    if (field === "plateSizeType") {
      updatedDetails[index].plateSizeType = value;

      // Reset plate dimensions when switching to Manual
      if (value === "Manual") {
        updatedDetails[index].plateDimensions = { 
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
        
        updatedDetails[index].plateDimensions = {
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
        updatedDetails[index].plateDimensions.lengthInInches = value.length;
        // Convert to cm for the standard database field
        updatedDetails[index].plateDimensions.length = value.length ? inchesToCm(value.length).toFixed(2) : "";
      }
      
      if (value.breadth !== undefined) {
        // Store the original inches value
        updatedDetails[index].plateDimensions.breadthInInches = value.breadth;
        // Convert to cm for the standard database field
        updatedDetails[index].plateDimensions.breadth = value.breadth ? inchesToCm(value.breadth).toFixed(2) : "";
      }
    } else if (field === "mrType" && mrTypes.length > 0) {
      // Special handling for mrType to also set the concatenated version
      updatedDetails[index].mrType = value;
      
      const selectedMRType = mrTypes.find(type => type.type === value);
      if (selectedMRType && selectedMRType.concatenated) {
        updatedDetails[index].mrTypeConcatenated = selectedMRType.concatenated;
      } else {
        // Fallback: create concatenated version if not found
        updatedDetails[index].mrTypeConcatenated = `LP MR ${value}`;
      }
    } else {
      // Handle all other fields normally
      updatedDetails[index][field] = value;
    }

    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  };

  const generateColorDetails = (noOfColors) => {
    // Get the default MR type from the fetched list, or fallback to "SIMPLE"
    const defaultMRType = mrTypes.length > 0 ? 
      { type: mrTypes[0].type, concatenated: mrTypes[0].concatenated } : 
      { type: "SIMPLE", concatenated: "LP MR SIMPLE" };
    
    // Get the default plate type from the fetched list, or fallback to "Polymer Plate"
    const defaultPlateType = plateTypes.length > 0 ? plateTypes[0].materialName : "Polymer Plate";
    
    // Get the default DST material (preferring "DST PP PLATE")
    const defaultDstMaterial = getDefaultDstMaterial();

    const details = Array.from({ length: noOfColors }, (_, index) => {
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      return {
        plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "Auto", // Default to "Auto"
        plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
          length: lengthCm,
          breadth: breadthCm,
          lengthInInches: dieSize.length || "",
          breadthInInches: dieSize.breadth || ""
        },
        pantoneType: lpDetails.colorDetails[index]?.pantoneType || "Not sure", // Pre-filled with "Not sure"
        plateType: lpDetails.colorDetails[index]?.plateType || defaultPlateType, // Use first plate type from API
        mrType: lpDetails.colorDetails[index]?.mrType || defaultMRType.type, // Use first MR type from API
        mrTypeConcatenated: lpDetails.colorDetails[index]?.mrTypeConcatenated || defaultMRType.concatenated, // Store concatenated version
        dstMaterial: lpDetails.colorDetails[index]?.dstMaterial || defaultDstMaterial // Add DST material to each color (preferring "DST PP PLATE")
      }
    });
    
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: details },
    });
  };

  const validateFields = () => {
    const newErrors = {};

    if (lpDetails.isLPUsed) {
      if (!lpDetails.noOfColors || lpDetails.noOfColors < 1) {
        newErrors.noOfColors = "Number of colors must be at least 1.";
      }

      lpDetails.colorDetails.forEach((color, index) => {
        if (!color.plateSizeType) {
          newErrors[`plateSizeType_${index}`] = "Plate size type is required.";
        }
        if (color.plateSizeType === "Manual") {
          if (!color.plateDimensions?.lengthInInches) {
            newErrors[`plateLength_${index}`] = "Plate length is required.";
          }
          if (!color.plateDimensions?.breadthInInches) {
            newErrors[`plateBreadth_${index}`] = "Plate breadth is required.";
          }
        }
        if (!color.pantoneType) {
          newErrors[`pantoneType_${index}`] = "Pantone type is required.";
        }
        if (!color.plateType) {
          newErrors[`plateType_${index}`] = "Plate type is required.";
        }
        if (!color.mrType) {
          newErrors[`mrType_${index}`] = "MR type is required.";
        }
        if (!color.dstMaterial) {
          newErrors[`dstMaterial_${index}`] = "DST Material is required.";
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

  // When LP is not used, we don't need to show any content
  if (!lpDetails.isLPUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Number of Colors Input */}
        <div>
          <label htmlFor="noOfColors" className="block text-xs font-medium text-gray-600 mb-1">
            Number of Colors:
          </label>
          <input
            type="number"
            id="noOfColors"
            name="noOfColors"
            value={lpDetails.noOfColors}
            min="1"
            max="10"
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            className={`w-full px-3 py-2 border ${errors.noOfColors ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
          />
          {errors.noOfColors && (
            <p className="text-red-500 text-xs mt-1">{errors.noOfColors}</p>
          )}
        </div>

        {/* Color Details Sections */}
        {lpDetails.noOfColors > 0 && (
          <div>
            <h3 className="text-xs uppercase font-medium text-gray-500 mb-3">COLOR DETAILS</h3>
            
            {/* Loading state */}
            {mrTypesLoading || plateTypesLoading || dstMaterialsLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex justify-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Loading materials...</p>
              </div>
            ) : (
              /* Color details form for each color */
              Array.from({ length: lpDetails.noOfColors }, (_, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Color {index + 1}</h4>
                  </div>
                  
                  {/* Single line layout for color fields */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* First row with all fields in a single line */}
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Plate Size:
                      </label>
                      <select
                        value={lpDetails.colorDetails[index]?.plateSizeType || "Auto"}
                        onChange={(e) => handleColorDetailsChange(
                          index,
                          "plateSizeType",
                          e.target.value
                        )}
                        className={`w-full px-2 py-2 border ${
                          errors[`plateSizeType_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                      {errors[`plateSizeType_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`plateSizeType_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Length (in):
                      </label>
                      <input
                        type="number"
                        placeholder="Length"
                        value={lpDetails.colorDetails[index]?.plateDimensions?.lengthInInches || ""}
                        onChange={(e) => handleColorDetailsChange(index, "plateDimensions", {
                          length: e.target.value,
                        })}
                        className={`w-full px-2 py-2 border ${
                          errors[`plateLength_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md ${
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto" ? "bg-gray-50" : ""
                        } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                        readOnly={lpDetails.colorDetails[index]?.plateSizeType === "Auto"}
                      />
                      {lpDetails.colorDetails[index]?.plateDimensions?.length && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lpDetails.colorDetails[index].plateDimensions.length} cm
                        </div>
                      )}
                      {errors[`plateLength_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`plateLength_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Breadth (in):
                      </label>
                      <input
                        type="number"
                        placeholder="Breadth"
                        value={lpDetails.colorDetails[index]?.plateDimensions?.breadthInInches || ""}
                        onChange={(e) => handleColorDetailsChange(index, "plateDimensions", {
                          breadth: e.target.value,
                        })}
                        className={`w-full px-2 py-2 border ${
                          errors[`plateBreadth_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md ${
                          lpDetails.colorDetails[index]?.plateSizeType === "Auto" ? "bg-gray-50" : ""
                        } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                        readOnly={lpDetails.colorDetails[index]?.plateSizeType === "Auto"}
                      />
                      {lpDetails.colorDetails[index]?.plateDimensions?.breadth && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lpDetails.colorDetails[index].plateDimensions.breadth} cm
                        </div>
                      )}
                      {errors[`plateBreadth_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`plateBreadth_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pantone:
                      </label>
                      <input
                        type="text"
                        value={lpDetails.colorDetails[index]?.pantoneType || "Not sure"}
                        onChange={(e) => handleColorDetailsChange(
                          index,
                          "pantoneType",
                          e.target.value
                        )}
                        className={`w-full px-2 py-2 border ${
                          errors[`pantoneType_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                        placeholder="Pantone"
                      />
                      {errors[`pantoneType_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`pantoneType_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Plate Type:
                      </label>
                      <select
                        value={lpDetails.colorDetails[index]?.plateType || ""}
                        onChange={(e) => handleColorDetailsChange(index, "plateType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`plateType_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="">Select Type</option>
                        {plateTypes.map((plateType, idx) => (
                          <option key={idx} value={plateType.materialName}>
                            {plateType.materialName}
                          </option>
                        ))}
                      </select>
                      {errors[`plateType_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`plateType_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        MR Type:
                      </label>
                      <select
                        value={lpDetails.colorDetails[index]?.mrType || ""}
                        onChange={(e) => handleColorDetailsChange(index, "mrType", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`mrType_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="">Select Type</option>
                        {mrTypes.map((typeOption, idx) => (
                          <option key={idx} value={typeOption.type}>
                            {typeOption.type}
                          </option>
                        ))}
                      </select>
                      {errors[`mrType_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`mrType_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        DST Material:
                      </label>
                      <select
                        value={lpDetails.colorDetails[index]?.dstMaterial || ""}
                        onChange={(e) => handleColorDetailsChange(index, "dstMaterial", e.target.value)}
                        className={`w-full px-2 py-2 border ${
                          errors[`dstMaterial_${index}`] ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                      >
                        <option value="">Select Material</option>
                        {dstMaterials.map((material) => (
                          <option key={material.id} value={material.materialName}>
                            {material.materialName}
                          </option>
                        ))}
                      </select>
                      {errors[`dstMaterial_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`dstMaterial_${index}`]}
                        </p>
                      )}
                      {dstMaterialsError && (
                        <p className="text-red-500 text-xs mt-1">Failed to load DST materials</p>
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

export default LPDetails;