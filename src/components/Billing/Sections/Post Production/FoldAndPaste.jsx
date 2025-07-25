import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

// Custom hook to fetch DST Materials from Firestore
const useDSTMaterials = () => {
  const [dstMaterials, setDSTMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDSTMaterials = async () => {
      try {
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

// Custom hook to fetch DST Types from Firestore
const useDSTTypes = () => {
  const [dstTypes, setDSTTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDSTTypes = async () => {
      try {
        const ratesCollection = collection(db, "standard_rates");
        const dstQuery = query(ratesCollection, where("group", "==", "DST"));
        
        const querySnapshot = await getDocs(dstQuery);
        
        const types = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDSTTypes(types);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching DST types:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDSTTypes();
  }, []);

  return { dstTypes, loading, error };
};

const FoldAndPaste = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const foldAndPaste = state.foldAndPaste || {
    isFoldAndPasteUsed: false,
    dstMaterial: "", 
    dstType: "",     
  };

  const [errors, setErrors] = useState({});
  
  // Use custom hooks to fetch DST materials and types
  const { 
    dstMaterials, 
    loading: dstMaterialsLoading, 
    error: dstMaterialsError 
  } = useDSTMaterials();
  
  const { 
    dstTypes, 
    loading: dstTypesLoading, 
    error: dstTypesError 
  } = useDSTTypes();

  // FIXED: Clear errors when Fold And Paste is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!foldAndPaste.isFoldAndPasteUsed) {
      setErrors({});
    }
  }, [foldAndPaste.isFoldAndPasteUsed]);

  // FIXED: Reset Fold And Paste data when toggled off
  useEffect(() => {
    if (!foldAndPaste.isFoldAndPasteUsed) {
      // When Fold And Paste is not used, ensure clean state
      if (foldAndPaste.dstMaterial !== "" || foldAndPaste.dstType !== "") {
        dispatch({
          type: "UPDATE_FOLD_AND_PASTE",
          payload: {
            isFoldAndPasteUsed: false,
            dstMaterial: "",
            dstType: ""
          }
        });
      }
    }
  }, [foldAndPaste.isFoldAndPasteUsed, foldAndPaste.dstMaterial, foldAndPaste.dstType, dispatch]);

  // Automatically select first option when materials/types load
  useEffect(() => {
    if (foldAndPaste.isFoldAndPasteUsed && dstMaterials.length > 0 && !foldAndPaste.dstMaterial) {
      dispatch({
        type: "UPDATE_FOLD_AND_PASTE",
        payload: { dstMaterial: dstMaterials[0].materialName }
      });
    }
  }, [dstMaterials, dispatch, foldAndPaste.dstMaterial, foldAndPaste.isFoldAndPasteUsed]);

  useEffect(() => {
    if (foldAndPaste.isFoldAndPasteUsed && dstTypes.length > 0 && !foldAndPaste.dstType) {
      dispatch({
        type: "UPDATE_FOLD_AND_PASTE",
        payload: { dstType: dstTypes[0].type }
      });
    }
  }, [dstTypes, dispatch, foldAndPaste.dstType, foldAndPaste.isFoldAndPasteUsed]);

  // Handle changes in the component
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    dispatch({
      type: "UPDATE_FOLD_AND_PASTE",
      payload: { [name]: value },
    });
  };

  // Validate fields before submission
  const validateFields = () => {
    const newErrors = {};
    
    // If Fold & Paste is used, validate DST material and type
    if (foldAndPaste.isFoldAndPasteUsed) {
      if (!foldAndPaste.dstMaterial) {
        newErrors.dstMaterial = "DST Material is required.";
      }
      if (!foldAndPaste.dstType) {
        newErrors.dstType = "DST Type is required.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  // UPDATED: Always render all form fields, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* DST Material Dropdown */}
          <div>
            <label htmlFor="dstMaterial" className="block text-xs font-medium text-gray-600 mb-1">
              DST Material:
            </label>
            <select
              id="dstMaterial"
              name="dstMaterial"
              value={foldAndPaste.dstMaterial || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.dstMaterial ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              disabled={dstMaterialsLoading}
            >
              {dstMaterials.map((material) => (
                <option key={material.id} value={material.materialName}>
                  {material.materialName}
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

          {/* DST Type Dropdown */}
          <div>
            <label htmlFor="dstType" className="block text-xs font-medium text-gray-600 mb-1">
              DST Type:
            </label>
            <select
              id="dstType"
              name="dstType"
              value={foldAndPaste.dstType || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.dstType ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              disabled={dstTypesLoading}
            >
              {dstTypes.map((type) => (
                <option key={type.id} value={type.type}>
                  {type.type}
                </option>
              ))}
            </select>
            {errors.dstType && (
              <p className="text-red-500 text-xs mt-1">{errors.dstType}</p>
            )}
            {dstTypesError && (
              <p className="text-red-500 text-xs mt-1">Failed to load DST types</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default FoldAndPaste;