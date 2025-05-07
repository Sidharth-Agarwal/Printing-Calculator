import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

// Custom hook to fetch DST types from Firestore
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

const DstPaste = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dstPaste = state.dstPaste || {
    isDstPasteUsed: false,
    dstType: "", // New field to store selected DST type
  };

  const [errors, setErrors] = useState({});
  
  // Use the custom hook to fetch DST types
  const { dstTypes, loading: dstTypesLoading, error: dstTypesError } = useDSTTypes();

  // Automatically select first option when types load
  useEffect(() => {
    if (dstTypes.length > 0 && !dstPaste.dstType) {
      dispatch({
        type: "UPDATE_DST_PASTE",
        payload: { dstType: dstTypes[0].type }
      });
    }
  }, [dstTypes, dispatch, dstPaste.dstType]);

  // Handle changes in the component
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    dispatch({
      type: "UPDATE_DST_PASTE",
      payload: { [name]: value },
    });
  };

  // Validate fields before submission
  const validateFields = () => {
    const newErrors = {};
    
    // If DST Paste is used, validate DST type
    if (dstPaste.isDstPasteUsed && !dstPaste.dstType) {
      newErrors.dstType = "DST Type is required.";
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

  // When DST Paste is not used, don't render content
  if (!dstPaste.isDstPasteUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="dstType" className="block text-xs font-medium text-gray-600 mb-1">
            DST Type:
          </label>
          <select
            id="dstType"
            name="dstType"
            value={dstPaste.dstType || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.dstType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
            disabled={dstTypesLoading}
          >
            <option value="">
              {dstTypesLoading ? "Loading DST Types..." : "Select DST Type"}
            </option>
            {dstTypes.map((type) => (
              <option key={type.id} value={type.type}>
                {`${type.type}`}
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

        {!singlePageMode && (
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default DstPaste;