import React, { useState, useEffect } from "react";
import { getEstimateVersions } from "../../utils/estimateVersionUtils";

/**
 * Version History Modal component
 * Displays the history of estimate versions in a modal
 */
const VersionHistoryModal = ({ 
  versionHistory, 
  estimateNumber, 
  currentVersion,
  baseEstimateId,
  onClose,
  onSelectVersion
}) => {
  const [loading, setLoading] = useState(false);
  const [fullVersions, setFullVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  
  // Load full version details if baseEstimateId is provided
  useEffect(() => {
    const loadFullVersions = async () => {
      if (baseEstimateId) {
        setLoading(true);
        try {
          const versions = await getEstimateVersions(baseEstimateId);
          setFullVersions(versions);
        } catch (error) {
          console.error("Error loading estimate versions:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    // If we have the full versions directly from the parent
    if (Array.isArray(versionHistory) && versionHistory.length > 0 && 
        typeof versionHistory[0] === 'object' && versionHistory[0].id) {
      setFullVersions(versionHistory);
    } else if (baseEstimateId) {
      loadFullVersions();
    }
  }, [baseEstimateId, versionHistory]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    
    if (timestamp.seconds) {
      // Firestore timestamp
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } else if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    } else {
      return "Unknown";
    }
  };
  
  // Determine if a version can be selected
  const canSelectVersion = (version) => {
    return onSelectVersion && version.id && version.version !== currentVersion;
  };

  // Handler for version selection
  const handleSelectVersion = (version) => {
    if (canSelectVersion(version)) {
      setSelectedVersionId(version.id);
      onSelectVersion(version.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold">Version History</h2>
          <div>
            <span className="text-gray-600 mr-4">
              Estimate #{estimateNumber}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow my-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : fullVersions.length > 0 ? (
            <div className="space-y-4">
              {fullVersions.map((version) => (
                <div 
                  key={version.id || `v${version.version}`}
                  className={`p-4 rounded-md border ${
                    version.version === currentVersion 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${canSelectVersion(version) ? 'cursor-pointer' : ''}`}
                  onClick={() => canSelectVersion(version) && handleSelectVersion(version)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-semibold ${
                        version.version === currentVersion ? 'text-blue-600' : ''
                      }`}>
                        Version {version.version}
                      </span>
                      {version.version === currentVersion && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                      {version.status && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {version.status}
                        </span>
                      )}
                    </div>
                    
                    {canSelectVersion(version) ? (
                      <button
                        type="button"
                        className={`text-sm px-3 py-1 rounded ${
                          selectedVersionId === version.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVersion(version);
                        }}
                      >
                        {selectedVersionId === version.id ? 'Selected' : 'Select'}
                      </button>
                    ) : null}
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Created:</span> {formatTimestamp(version.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">By:</span> {version.createdBy || 'Unknown'}
                    </div>
                  </div>
                  
                  {version.changeNotes && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Notes:</span> {version.changeNotes}
                    </div>
                  )}
                  
                  {/* Version differences - if available */}
                  {version.differences && Object.keys(version.differences).length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Changes from previous version:</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(version.differences).map(([field, { old, new: newValue }]) => (
                          <li key={field} className="text-gray-700">
                            <span className="font-medium">{field}:</span> {old} → {newValue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No version history found for this estimate.
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;