import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { ChevronDown } from 'lucide-react';

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

// Custom hook to fetch DST Types from Firestore
const useDSTTypes = () => {
  const [dstTypes, setDSTTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDSTTypes = async () => {
      try {
        // Query to fetch DST types from standard rates
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

  // Automatically select first option when materials/types load
  useEffect(() => {
    if (dstMaterials.length > 0 && !foldAndPaste.dstMaterial) {
      dispatch({
        type: "UPDATE_FOLD_AND_PASTE",
        payload: { dstMaterial: dstMaterials[0].materialName }
      });
    }
  }, [dstMaterials, dispatch, foldAndPaste.dstMaterial]);

  useEffect(() => {
    if (dstTypes.length > 0 && !foldAndPaste.dstType) {
      dispatch({
        type: "UPDATE_FOLD_AND_PASTE",
        payload: { dstType: dstTypes[0].type }
      });
    }
  }, [dstTypes, dispatch, foldAndPaste.dstType]);

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

  // When Fold & Paste is not used, don't render content
  if (!foldAndPaste.isFoldAndPasteUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex w-full space-x-4">
        {/* DST Material Dropdown */}
        <div className="flex-1">
          <div className="text-sm mb-1">DST Material:</div>
          <div className="relative">
            <select
              name="dstMaterial"
              value={foldAndPaste.dstMaterial || ""}
              onChange={handleChange}
              className={`appearance-none w-full border rounded-md p-2 pr-8 text-sm ${
                errors.dstMaterial ? "border-red-500" : "border-gray-300"
              }`}
              disabled={dstMaterialsLoading}
              required
            >
              {dstMaterialsLoading ? (
                <option>Loading DST Materials...</option>
              ) : (
                dstMaterials.map((material) => (
                  <option key={material.id} value={material.materialName}>
                    {material.materialName}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
          {errors.dstMaterial && (
            <p className="text-red-500 text-xs mt-1">{errors.dstMaterial}</p>
          )}
        </div>

        {/* DST Type Dropdown */}
        <div className="flex-1">
          <div className="text-sm mb-1">DST Type:</div>
          <div className="relative">
            <select
              name="dstType"
              value={foldAndPaste.dstType || ""}
              onChange={handleChange}
              className={`appearance-none w-full border rounded-md p-2 pr-8 text-sm ${
                errors.dstType ? "border-red-500" : "border-gray-300"
              }`}
              disabled={dstTypesLoading}
              required
            >
              {dstTypesLoading ? (
                <option>Loading DST Types...</option>
              ) : (
                dstTypes.map((type) => (
                  <option key={type.id} value={type.type}>
                    {type.type}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
          {errors.dstType && (
            <p className="text-red-500 text-xs mt-1">{errors.dstType}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default FoldAndPaste;