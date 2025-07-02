import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import useMRTypes from "../../../../hooks/useMRTypes";

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

const EMBDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "", lengthInInches: "", breadthInInches: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
    embMRConcatenated = "",
    dstMaterial = ""
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  // Use the custom hooks to fetch data
  const { mrTypes, loading: mrTypesLoading } = useMRTypes("EMB MR");
  
  // Use custom hook to fetch DST materials
  const { dstMaterials, loading: dstMaterialsLoading, error: dstMaterialsError } = useDSTMaterials();

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Set default MR Type and DST Material when component mounts or when EMB is first enabled
  useEffect(() => {
    if (isEMBUsed && mrTypes.length > 0 && dstMaterials.length > 0) {
      const defaultMRType = mrTypes[0];
      
      // UPDATED: Look for "DST PP PLATE" first, fallback to first material
      const preferredDstMaterial = dstMaterials.find(material => 
        material.materialName === "DST PP PLATE"
      );
      const defaultDstMaterial = preferredDstMaterial ? 
        preferredDstMaterial.materialName : 
        (dstMaterials[0]?.materialName || "");
      
      const updates = {};
      
      // Set embMR if it's empty
      if (!embMR) {
        updates.embMR = defaultMRType.type;
      }
      
      // Set embMRConcatenated if it's empty
      if (!embMRConcatenated) {
        updates.embMRConcatenated = defaultMRType.concatenated || `EMB MR ${defaultMRType.type}`;
      }
      
      // Set dstMaterial if it's empty (prioritize DST PP PLATE)
      if (!dstMaterial) {
        updates.dstMaterial = defaultDstMaterial;
        
        // Log for debugging
        if (preferredDstMaterial) {
          console.log("EMB: Selected preferred DST material:", defaultDstMaterial);
        } else {
          console.log("EMB: DST PP PLATE not found, using fallback:", defaultDstMaterial);
        }
      }
      
      // Only dispatch if we have updates
      if (Object.keys(updates).length > 0) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: updates
        });
      }
    }
  }, [isEMBUsed, embMR, embMRConcatenated, dstMaterial, mrTypes, dstMaterials, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for embMR to also set the concatenated version
    if (name === "embMR" && mrTypes.length > 0) {
      const selectedMRType = mrTypes.find(type => type.type === value);
      
      if (selectedMRType && selectedMRType.concatenated) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { 
            embMR: value,
            embMRConcatenated: selectedMRType.concatenated
          },
        });
      } else {
        // Fallback: create concatenated version if not found
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { 
            embMR: value,
            embMRConcatenated: `EMB MR ${value}`
          },
        });
      }
    } else {
      // Handle other fields normally
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: { [name]: value },
      });
    }

    // Handle automatic dimension updates for plate size
    if (name === "plateSizeType" && value === "Auto") {
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: {
            length: lengthCm,
            breadth: breadthCm,
            lengthInInches: dieSize.length || "",
            breadthInInches: dieSize.breadth || ""
          },
        },
      });
    }

    if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: { 
            length: "", 
            breadth: "",
            lengthInInches: "",
            breadthInInches: ""
          },
        },
      });
    }
  };

  const handleDimensionChange = (field, value) => {
    // Store both the original inches value and the converted cm value
    let updatedDimensions = { ...plateDimensions };
    
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
      type: "UPDATE_EMB_DETAILS",
      payload: {
        plateDimensions: updatedDimensions,
      },
    });
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isEMBUsed) {
      if (!plateSizeType) validationErrors.plateSizeType = "Plate Size Type is required.";
      if (plateSizeType === "Manual") {
        if (!plateDimensions.lengthInInches) validationErrors.length = "Length is required.";
        if (!plateDimensions.breadthInInches) validationErrors.breadth = "Breadth is required.";
      }
      if (!embMR) validationErrors.embMR = "EMB MR Type is required.";
      if (!dstMaterial) validationErrors.dstMaterial = "DST Material is required.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  useEffect(() => {
    if (isEMBUsed && plateSizeType === "Auto") {
      // Update plate dimensions when die size changes (for Auto mode)
      const lengthCm = dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "";
      const breadthCm = dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "";
      
      const updatedDimensions = {
        length: lengthCm,
        breadth: breadthCm,
        lengthInInches: dieSize.length || "",
        breadthInInches: dieSize.breadth || ""
      };

      const needsUpdate = 
        plateDimensions.length !== updatedDimensions.length || 
        plateDimensions.breadth !== updatedDimensions.breadth ||
        plateDimensions.lengthInInches !== updatedDimensions.lengthInInches ||
        plateDimensions.breadthInInches !== updatedDimensions.breadthInInches;

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_EMB_DETAILS",
          payload: { plateDimensions: updatedDimensions },
        });
      }
    }
  }, [dieSize, isEMBUsed, plateSizeType, plateDimensions, dispatch]);

  // If EMB is not used, don't render any content
  if (!isEMBUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* All Fields in a Single Line */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="plateSizeType" className="block text-xs font-medium text-gray-600 mb-1">
              Plate Size:
            </label>
            <select
              id="plateSizeType"
              name="plateSizeType"
              value={plateSizeType}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${errors.plateSizeType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
            >
              <option value="">Select Option</option>
              <option value="Auto">Auto</option>
              <option value="Manual">Manual</option>
            </select>
            {errors.plateSizeType && (
              <p className="text-red-500 text-xs mt-1">{errors.plateSizeType}</p>
            )}
          </div>

          {plateSizeType && (
            <>
              <div>
                <label htmlFor="length" className="block text-xs font-medium text-gray-600 mb-1">
                  Length (inches):
                </label>
                <input
                  type="number"
                  id="length"
                  placeholder="Length"
                  value={plateDimensions.lengthInInches || ""}
                  onChange={(e) => plateSizeType === "Manual" ? handleDimensionChange("length", e.target.value) : null}
                  className={`w-full px-2 py-2 border ${errors.length ? "border-red-500" : "border-gray-300"} rounded-md ${plateSizeType === "Auto" ? "bg-gray-50" : ""} focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                  readOnly={plateSizeType === "Auto"}
                />
                {plateDimensions.length && (
                  <div className="text-xs text-gray-500 mt-1">{plateDimensions.length} cm</div>
                )}
                {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
              </div>
              <div>
                <label htmlFor="breadth" className="block text-xs font-medium text-gray-600 mb-1">
                  Breadth (inches):
                </label>
                <input
                  type="number"
                  id="breadth"
                  placeholder="Breadth"
                  value={plateDimensions.breadthInInches || ""}
                  onChange={(e) => plateSizeType === "Manual" ? handleDimensionChange("breadth", e.target.value) : null}
                  className={`w-full px-2 py-2 border ${errors.breadth ? "border-red-500" : "border-gray-300"} rounded-md ${plateSizeType === "Auto" ? "bg-gray-50" : ""} focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                  readOnly={plateSizeType === "Auto"}
                />
                {plateDimensions.breadth && (
                  <div className="text-xs text-gray-500 mt-1">{plateDimensions.breadth} cm</div>
                )}
                {errors.breadth && <p className="text-red-500 text-xs mt-1">{errors.breadth}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="embMR" className="block text-xs font-medium text-gray-600 mb-1">
              EMB MR Type:
            </label>
            <select
              id="embMR"
              name="embMR"
              value={embMR}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${errors.embMR ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
            >
              <option value="">Select Type</option>
              {mrTypesLoading ? (
                <option value="" disabled>Loading...</option>
              ) : (
                mrTypes.map((typeOption, idx) => (
                  <option key={idx} value={typeOption.type}>
                    {typeOption.type}
                  </option>
                ))
              )}
            </select>
            {errors.embMR && <p className="text-red-500 text-xs mt-1">{errors.embMR}</p>}
          </div>

          <div>
            <label htmlFor="dstMaterial" className="block text-xs font-medium text-gray-600 mb-1">
              DST Material:
            </label>
            <select
              id="dstMaterial"
              name="dstMaterial"
              value={dstMaterial}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${
                errors.dstMaterial ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
              disabled={dstMaterialsLoading}
            >
              <option value="">
                {dstMaterialsLoading ? "Loading DST Materials..." : "Select DST Material"}
              </option>
              {/* UPDATED: Sort DST materials to show DST PP PLATE first if available */}
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
                    {material.materialName === "DST PP PLATE"}
                  </option>
                ))}
            </select>
            {errors.dstMaterial && (
              <p className="text-red-500 text-xs mt-1">{errors.dstMaterial}</p>
            )}
            {dstMaterialsError && (
              <p className="text-red-500 text-xs mt-1">Failed to load DST materials</p>
            )}
          </div>
        </div>

        {/* Plate Cost Message */}
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md mt-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-700 text-sm">
              Embossing plate costs will be calculated separately.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EMBDetails;