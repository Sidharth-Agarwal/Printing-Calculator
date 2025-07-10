import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

// Custom hook to fetch Magnet materials from Firestore
const useMagnetMaterials = () => {
  const [magnetMaterials, setMagnetMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMagnetMaterials = async () => {
      try {
        // Query to fetch Magnet materials from materials collection
        const materialsCollection = collection(db, "materials");
        const magnetMaterialsQuery = query(
          materialsCollection, 
          where("materialType", "==", "Magnet")
        );
        
        const querySnapshot = await getDocs(magnetMaterialsQuery);
        
        const materials = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMagnetMaterials(materials);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Magnet materials:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchMagnetMaterials();
  }, []);

  return { magnetMaterials, loading, error };
};

const Magnet = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const magnet = state.magnet || {
    isMagnetUsed: false,
    magnetMaterial: "", // New field to store selected Magnet material
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch Magnet materials
  const { magnetMaterials, loading: magnetMaterialsLoading, error: magnetMaterialsError } = useMagnetMaterials();

  // Automatically select first option when materials load
  useEffect(() => {
    if (magnetMaterials.length > 0 && !magnet.magnetMaterial) {
      dispatch({
        type: "UPDATE_MAGNET",
        payload: { magnetMaterial: magnetMaterials[0].materialName }
      });
    }
  }, [magnetMaterials, dispatch, magnet.magnetMaterial]);

  // Handle changes in the component
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    dispatch({
      type: "UPDATE_MAGNET",
      payload: { [name]: value },
    });
  };

  // Validate fields before submission
  const validateFields = () => {
    const newErrors = {};
    
    // If Magnet is used, validate Magnet material
    if (magnet.isMagnetUsed && !magnet.magnetMaterial) {
      newErrors.magnetMaterial = "Magnet Material is required.";
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

  // When Magnet is not used, don't render content
  if (!magnet.isMagnetUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="magnetMaterial" className="block text-xs font-medium text-gray-600 mb-1">
            Magnet Material:
          </label>
          <select
            id="magnetMaterial"
            name="magnetMaterial"
            value={magnet.magnetMaterial || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.magnetMaterial ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
            disabled={magnetMaterialsLoading}
          >
            {/* <option value="">
              {magnetMaterialsLoading ? "Loading Magnet Materials..." : "Select Magnet Material"}
            </option> */}
            {magnetMaterials.map((material) => (
              <option key={material.id} value={material.materialName}>
                {material.materialName}
              </option>
            ))}
          </select>
          {errors.magnetMaterial && (
            <p className="text-red-500 text-xs mt-1">{errors.magnetMaterial}</p>
          )}
          {magnetMaterialsError && (
            <p className="text-red-500 text-xs mt-1">Failed to load Magnet materials</p>
          )}
        </div>

        {!singlePageMode && (
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default Magnet;