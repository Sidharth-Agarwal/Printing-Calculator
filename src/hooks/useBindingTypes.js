import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Cache to prevent redundant fetches
const bindingTypesCache = new Map();

/**
 * Custom hook to fetch binding types from standard_rates collection
 * @returns {Object} - Object containing bindingTypes array, loading state, and error
 */
const useBindingTypes = () => {
  const [bindingTypes, setBindingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback values
  const defaultBindingTypes = [
    { id: "stapler", type: "STAPLER", concatenate: "BINDING STAPLER", finalRate: "1" },
    { id: "thread", type: "THREAD", concatenate: "BINDING THREAD", finalRate: "1" }
  ];

  useEffect(() => {
    const fetchBindingTypes = async () => {
      // Return cached data if available
      if (bindingTypesCache.has("BINDING")) {
        setBindingTypes(bindingTypesCache.get("BINDING"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching binding types from standard_rates collection...");
        
        // Query standard_rates collection for binding group
        const ratesCollection = collection(db, "standard_rates");
        const q = query(ratesCollection, where("group", "==", "BINDING"));
        console.log("Query created for BINDING group");
        
        const querySnapshot = await getDocs(q);
        console.log(`Binding query returned ${querySnapshot.size} documents`);
        
        if (!querySnapshot.empty) {
          // Process the fetched data
          const types = querySnapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type, // Display value
            concatenate: doc.data().concatenate || `BINDING ${doc.data().type}`, // Value for calculations
            finalRate: doc.data().finalRate || "0"
          }));
          
          console.log("Fetched binding types:", types);
          
          // Cache the results
          bindingTypesCache.set("BINDING", types);
          setBindingTypes(types);
        } else {
          console.warn("No binding types found in standard_rates. Using defaults.");
          
          // Try a different approach - fetch all records and find binding types
          console.log("Attempting to fetch all standard rates...");
          const allRatesSnapshot = await getDocs(ratesCollection);
          
          if (!allRatesSnapshot.empty) {
            console.log(`Found ${allRatesSnapshot.size} total standard rates`);
            
            // Log all groups to see what's available
            const groups = new Set();
            allRatesSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.group) groups.add(data.group);
            });
            console.log("Available groups in standard_rates:", [...groups]);
            
            // Look for binding-related items regardless of group name
            const bindingItems = allRatesSnapshot.docs
              .filter(doc => {
                const data = doc.data();
                return data.type && 
                       (data.type.includes("STAPLER") || 
                        data.type.includes("THREAD") ||
                        data.type.includes("BINDING") ||
                        (data.group && data.group.includes("BINDING")));
              })
              .map(doc => ({
                id: doc.id,
                type: doc.data().type,
                concatenate: doc.data().concatenate || `BINDING ${doc.data().type}`,
                finalRate: doc.data().finalRate || "0"
              }));
            
            if (bindingItems.length > 0) {
              console.log("Found binding items by searching:", bindingItems);
              bindingTypesCache.set("BINDING", bindingItems);
              setBindingTypes(bindingItems);
            } else {
              console.log("No binding items found even in all standard rates. Using defaults.");
              setBindingTypes(defaultBindingTypes);
            }
          } else {
            console.log("No standard rates found at all. Using defaults.");
            setBindingTypes(defaultBindingTypes);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching binding types:", err);
        setError(err);
        setBindingTypes(defaultBindingTypes); // Use defaults on error
      } finally {
        setLoading(false);
      }
    };

    fetchBindingTypes();
  }, []);

  return { 
    bindingTypes, 
    loading, 
    error 
  };
};

export default useBindingTypes;