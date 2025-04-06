import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import ExistingEstimates from "./ExistingEstimates";

const VersionSelection = ({ clientId, selectedVersion, onVersionSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingEstimates, setExistingEstimates] = useState([]);
  
  // Define available versions
  const availableVersions = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Version ${i + 1}`
  }));

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

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-sm mt-4">
      <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">VERSION SELECTION</h2>
      
      <div className="mb-4">
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