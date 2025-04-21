import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"

// Cache to prevent redundant fetches
const materialTypesCache = new Map();

/**
 * Custom hook to fetch material types from materials collection
 * @param {string} materialType - The material type to fetch (e.g., "Plate Type", "Foil Type", "Block Type")
 * @returns {Object} - Object containing materials array, loading state, and error
 */
const useMaterialTypes = (materialType) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback values based on material type
  const getDefaultMaterials = () => {
    switch (materialType) {
      case "Plate Type":
        return [{ materialName: "Polymer Plate" }];
      case "Foil Type":
        return [{ materialName: "Gold MTS 220" }];
      case "Block Type":
        return [{ materialName: "Magnesium Block 3MM" }];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      // Check cache first
      if (materialTypesCache.has(materialType)) {
        setMaterials(materialTypesCache.get(materialType));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query materials collection for the specified material type
        const materialsCollection = collection(db, "materials");
        const q = query(materialsCollection, where("materialType", "==", materialType));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Process the fetched data
          const types = querySnapshot.docs.map(doc => ({
            id: doc.id,
            materialName: doc.data().materialName || "",
            ...doc.data()
          }));
          
          // Sort by material name
          types.sort((a, b) => a.materialName.localeCompare(b.materialName));
          
          // Cache the results
          materialTypesCache.set(materialType, types);
          setMaterials(types);
        } else {
          console.warn(`No materials found for type: ${materialType}. Using defaults.`);
          const defaultMaterials = getDefaultMaterials();
          setMaterials(defaultMaterials);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Error fetching materials for ${materialType}:`, err);
        setError(err);
        // Use defaults on error
        const defaultMaterials = getDefaultMaterials();
        setMaterials(defaultMaterials);
      } finally {
        setLoading(false);
      }
    };

    if (materialType) {
      fetchMaterialTypes();
    }
  }, [materialType]);

  return { 
    materials, 
    loading, 
    error 
  };
};

export default useMaterialTypes;