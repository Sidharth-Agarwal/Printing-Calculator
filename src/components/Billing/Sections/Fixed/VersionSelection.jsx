import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import ExistingEstimates from "./ExistingEstimates";

const VersionSelection = ({ clientId, selectedVersion, onVersionSelect, compact = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingEstimates, setExistingEstimates] = useState([]);
  const [availableVersions, setAvailableVersions] = useState([]);
  const [showEstimates, setShowEstimates] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  // Initialize versions on component mount or when clientId changes
  useEffect(() => {
    // Start with the default 10 versions
    const initialVersions = Array.from({ length: 10 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Version ${i + 1}`
    }));
    
    setAvailableVersions(initialVersions);
    
    // If we have a clientId, check for existing estimates to find the highest version
    if (clientId) {
      checkForExistingVersions(clientId);
    }
  }, [clientId]);

  // Auto-select Version 1 when clientId is available and no version is selected
  useEffect(() => {
    if (clientId && !selectedVersion && !hasAutoSelected && availableVersions.length > 0) {
      console.log("Auto-selecting Version 1 for client:", clientId);
      onVersionSelect("1"); // Auto-select Version 1
      setHasAutoSelected(true);
    }
    
    // Reset auto-selection flag when clientId changes
    if (!clientId) {
      setHasAutoSelected(false);
    }
  }, [clientId, selectedVersion, hasAutoSelected, availableVersions, onVersionSelect]);

  // Reset auto-selection flag when client changes
  useEffect(() => {
    if (clientId) {
      setHasAutoSelected(false);
    }
  }, [clientId]);
  
  // Function to check for existing versions in Firebase
  const checkForExistingVersions = async (clientId) => {
    try {
      const estimatesCollection = collection(db, "estimates");
      const q = query(
        estimatesCollection,
        where("clientId", "==", clientId)
      );
      const querySnapshot = await getDocs(q);
      
      // Find the highest version used
      let highestVersion = 10; // Start with our default 10
      
      querySnapshot.forEach(doc => {
        const versionId = doc.data().versionId;
        if (versionId && !isNaN(parseInt(versionId))) {
          const versionNumber = parseInt(versionId);
          if (versionNumber > highestVersion) {
            highestVersion = versionNumber;
          }
        }
      });
      
      // If we found versions higher than 10, add them to available versions
      if (highestVersion > 10) {
        const additionalVersions = Array.from(
          { length: highestVersion - 10 }, 
          (_, i) => ({
            id: (i + 11).toString(),
            name: `Version ${i + 11}`
          })
        );
        
        setAvailableVersions(prevVersions => [...prevVersions, ...additionalVersions]);
      }
    } catch (error) {
      console.error("Error checking for existing versions:", error);
    }
  };

  // Fetch existing estimates for selected client and version
  useEffect(() => {
    const fetchEstimates = async () => {
      if (!clientId || !selectedVersion) {
        setExistingEstimates([]);
        return;
      }

      setIsLoading(true);
      try {
        const estimatesCollection = collection(db, "estimates");
        const q = query(
          estimatesCollection,
          where("clientId", "==", clientId),
          where("versionId", "==", selectedVersion)
        );
        const querySnapshot = await getDocs(q);
        const estimates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExistingEstimates(estimates);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimates();
  }, [clientId, selectedVersion]);

  const handleVersionChange = (e) => {
    const newVersion = e.target.value;
    console.log("Version manually changed to:", newVersion);
    onVersionSelect(newVersion);
  };
  
  // Function to add a new version
  const addNewVersion = () => {
    const nextVersionNumber = availableVersions.length + 1;
    const newVersion = {
      id: nextVersionNumber.toString(),
      name: `Version ${nextVersionNumber}`
    };
    
    setAvailableVersions(prevVersions => [...prevVersions, newVersion]);
  };

  return (
    <div>
      <div className="mb-2">
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <select
              value={selectedVersion || ""}
              onChange={handleVersionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs appearance-none"
              disabled={!clientId}
            >
              <option value="">Select a Version</option>
              {availableVersions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Add new version button - Changed to red */}
          <button
            type="button"
            onClick={addNewVersion}
            disabled={!clientId}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
            title={clientId ? "Add a new version" : "Select a client first"}
          >
            + New
          </button>
        </div>
      </div>

      {/* Display existing estimates */}
      {showEstimates && selectedVersion && (
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading estimates...</p>
            </div>
          ) : (
            <ExistingEstimates estimates={existingEstimates} />
          )}
        </div>
      )}
    </div>
  );
};

export default VersionSelection;