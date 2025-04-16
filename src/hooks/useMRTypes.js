import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"

// Cache to prevent redundant fetches
const mrTypesCache = new Map();

/**
 * Custom hook to fetch MR types from standard_rates collection
 * @param {string} group - The group name (e.g., "LP MR", "FS MR", "EMB MR")
 * @returns {Object} - Object containing mrTypes array, loading state, and error
 */
const useMRTypes = (group) => {
  const [mrTypes, setMRTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback values
  const defaultMRTypes = [
    { type: "Simple", finalRate: "0" },
    { type: "Complex", finalRate: "0" },
    { type: "Super Complex", finalRate: "0" }
  ];

  useEffect(() => {
    const fetchMRTypes = async () => {
      // Check cache first
      if (mrTypesCache.has(group)) {
        setMRTypes(mrTypesCache.get(group));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query standard_rates collection for the specified group
        const ratesCollection = collection(db, "standard_rates");
        const q = query(ratesCollection, where("group", "==", group));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Process the fetched data
          const types = querySnapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type || "",
            finalRate: doc.data().finalRate || "0"
          }));
          
          // Sort types (Simple, Complex, Super Complex)
          types.sort((a, b) => {
            const order = { "SIMPLE": 1, "COMPLEX": 2, "SUPER COMPLEX": 3 };
            return (order[a.type.toUpperCase()] || 999) - (order[b.type.toUpperCase()] || 999);
          });
          
          // Cache the results
          mrTypesCache.set(group, types);
          setMRTypes(types);
        } else {
          console.warn(`No MR types found for group: ${group}. Using defaults.`);
          setMRTypes(defaultMRTypes);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Error fetching MR types for ${group}:`, err);
        setError(err);
        setMRTypes(defaultMRTypes);
      } finally {
        setLoading(false);
      }
    };

    if (group) {
      fetchMRTypes();
    }
  }, [group]);

  return { 
    mrTypes, 
    loading, 
    error 
  };
};

export default useMRTypes;