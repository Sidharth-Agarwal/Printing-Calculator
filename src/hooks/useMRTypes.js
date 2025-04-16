import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

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

  // Default fallback values with concatenated version
  const defaultMRTypes = [
    { id: "simple", type: "SIMPLE", concatenated: `${group} SIMPLE`, finalRate: "0" },
    { id: "complex", type: "COMPLEX", concatenated: `${group} COMPLEX`, finalRate: "0" },
    { id: "supercomplex", type: "SUPER COMPLEX", concatenated: `${group} SUPER COMPLEX`, finalRate: "0" }
  ];

  useEffect(() => {
    const fetchMRTypes = async () => {
      // Return cached data if available
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
            type: doc.data().type, // Display value
            concatenated: doc.data().concatenate || `${group} ${doc.data().type}`, // Value for calculations
            finalRate: doc.data().finalRate || "0",
            description: doc.data().description || ""
          }));
          
          // Sort types (Simple, Complex, Super Complex)
          types.sort((a, b) => {
            const order = { "SIMPLE": 1, "COMPLEX": 2, "SUPER COMPLEX": 3 };
            return (order[a.type] || 999) - (order[b.type] || 999);
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
        setMRTypes(defaultMRTypes); // Use defaults on error
      } finally {
        setLoading(false);
      }
    };

    if (group) {
      fetchMRTypes();
    } else {
      setMRTypes(defaultMRTypes);
      setLoading(false);
    }
  }, [group]);

  // Function to refresh the data if needed
  const refreshMRTypes = () => {
    if (group) {
      mrTypesCache.delete(group);
      setLoading(true);
      const fetchMRTypes = async () => {
        try {
          const ratesCollection = collection(db, "standard_rates");
          const q = query(ratesCollection, where("group", "==", group));
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const types = querySnapshot.docs.map(doc => ({
              id: doc.id,
              type: doc.data().type,
              concatenated: doc.data().concatenate || `${group} ${doc.data().type}`,
              finalRate: doc.data().finalRate || "0",
              description: doc.data().description || ""
            }));
            
            types.sort((a, b) => {
              const order = { "SIMPLE": 1, "COMPLEX": 2, "SUPER COMPLEX": 3 };
              return (order[a.type] || 999) - (order[b.type] || 999);
            });
            
            mrTypesCache.set(group, types);
            setMRTypes(types);
          } else {
            setMRTypes(defaultMRTypes);
          }
          
          setError(null);
        } catch (err) {
          console.error(`Error refreshing MR types for ${group}:`, err);
          setError(err);
          setMRTypes(defaultMRTypes);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMRTypes();
    }
  };

  return { 
    mrTypes, 
    loading, 
    error, 
    refreshMRTypes,
    defaultMRTypes // Expose defaults in case they're needed
  };
};

export default useMRTypes;