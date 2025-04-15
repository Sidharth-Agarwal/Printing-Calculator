import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import ExistingEstimates from "./ExistingEstimates";

const VersionSelection = ({ clientId, selectedVersion, onVersionSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingEstimates, setExistingEstimates] = useState([]);
  const [availableVersions, setAvailableVersions] = useState([]);
  
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
    onVersionSelect(e.target.value);
  };
  
  // Function to add a new version
  const addNewVersion = () => {
    const nextVersionNumber = availableVersions.length + 1;
    const newVersion = {
      id: nextVersionNumber.toString(),
      name: `Version ${nextVersionNumber}`
    };
    
    setAvailableVersions(prevVersions => [...prevVersions, newVersion]);
    
    // Optionally, automatically select the new version
    // onVersionSelect(newVersion.id);
  };

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-sm mt-4">
      <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">VERSION SELECTION</h2>
      
      <div className="mb-4">
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-2">
              Select Version <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedVersion}
              onChange={handleVersionChange}
              className="border rounded-md p-2 w-full text-sm"
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
          
          {/* Add new version button */}
          <button
            type="button"
            onClick={addNewVersion}
            disabled={!clientId}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={clientId ? "Add a new version" : "Select a client first"}
          >
            + Add Version
          </button>
        </div>
        
        {!clientId && (
          <p className="text-sm text-gray-500 mt-1">
            Please select a client first to choose a version.
          </p>
        )}
      </div>

      {/* Display existing estimates */}
      {selectedVersion && (
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
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