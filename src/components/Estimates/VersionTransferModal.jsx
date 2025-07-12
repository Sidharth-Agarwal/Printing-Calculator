import React, { useState, useEffect } from 'react';

const VersionTransferModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  availableVersions = [], 
  currentVersion,
  estimateCount = 0,
  movableCount = 0,
  selectedEstimates = [],
  clientName = ""
}) => {
  const [selectedVersion, setSelectedVersion] = useState("");
  const [isCreatingNewVersion, setIsCreatingNewVersion] = useState(false);
  const [newVersionNumber, setNewVersionNumber] = useState("");

  // Calculate the next available version number
  useEffect(() => {
    if (availableVersions.length > 0) {
      const maxVersion = Math.max(...availableVersions.map(v => parseInt(v)));
      setNewVersionNumber((maxVersion + 1).toString());
    } else {
      // If no versions available (shouldn't happen), suggest version 2
      setNewVersionNumber("2");
    }
  }, [availableVersions]);

  // Reset state when modal opens/closes and handle auto-selection
  useEffect(() => {
    if (!isOpen) {
      setSelectedVersion("");
      setIsCreatingNewVersion(false);
    } else {
      // Auto-select the appropriate option when modal opens
      const availableExistingVersions = availableVersions.filter(v => v !== currentVersion);
      
      if (availableExistingVersions.length > 0) {
        // If there are existing versions to move to, default to "existing version" mode
        setIsCreatingNewVersion(false);
      } else {
        // If no existing versions available, default to "create new version" mode
        setIsCreatingNewVersion(true);
      }
    }
  }, [isOpen, availableVersions, currentVersion]);

  const handleConfirm = () => {
    const targetVersion = isCreatingNewVersion ? newVersionNumber : selectedVersion;
    
    if (!targetVersion) {
      alert("Please select a version or create a new one.");
      return;
    }

    onConfirm(targetVersion);
  };

  const handleCreateNewVersion = () => {
    setIsCreatingNewVersion(true);
    setSelectedVersion("");
  };

  const handleSelectExistingVersion = () => {
    setIsCreatingNewVersion(false);
    setSelectedVersion("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Move Estimates to Version
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Client and estimate info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Client:</span> {clientName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected Estimates:</span> {estimateCount}
            </p>
            {currentVersion && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Current Version:</span> {currentVersion}
              </p>
            )}
          </div>

          {/* Warning about unmovable estimates */}
          {estimateCount !== movableCount && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    {movableCount} of {estimateCount} estimates will be moved
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Estimates already in the target version will remain unchanged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Version selection options */}
          <div className="space-y-4">
            {/* Existing versions - only show if there are versions to move to */}
            {availableVersions.filter(v => v !== currentVersion).length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    id="existing-version"
                    checked={!isCreatingNewVersion}
                    onChange={handleSelectExistingVersion}
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <label htmlFor="existing-version" className="ml-2 text-sm font-medium text-gray-700">
                    Move to existing version
                  </label>
                </div>
                
                {!isCreatingNewVersion && (
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isCreatingNewVersion}
                  >
                    <option value="">Choose Version</option>
                    {availableVersions
                      .filter(v => v !== currentVersion) // Filter out current version
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map(version => (
                        <option key={version} value={version}>
                          Version {version}
                        </option>
                      ))
                    }
                  </select>
                )}
              </div>
            )}

            {/* Create new version */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="new-version"
                  checked={isCreatingNewVersion}
                  onChange={handleCreateNewVersion}
                  className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="new-version" className="ml-2 text-sm font-medium text-gray-700">
                  Create new version
                </label>
              </div>
              
              {isCreatingNewVersion && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Version</span>
                  <input
                    type="number"
                    value={newVersionNumber}
                    onChange={(e) => setNewVersionNumber(e.target.value)}
                    min="1"
                    className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <span className="text-xs text-gray-500">(Suggested: {Math.max(...availableVersions.map(v => parseInt(v)), 0) + 1})</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected estimates preview */}
          {movableCount > 0 && selectedEstimates.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Estimates to be moved ({movableCount}):
              </p>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                {selectedEstimates.slice(0, 5).map((estimate, index) => (
                  <div key={estimate.id} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                    <p className="text-xs text-gray-600">
                      {estimate.projectName || `Estimate #${index + 1}`}
                      <span className="ml-2 text-gray-400">
                        (V{estimate.versionId})
                      </span>
                    </p>
                  </div>
                ))}
                {selectedEstimates.length > 5 && (
                  <div className="px-3 py-2 text-xs text-gray-500 italic">
                    ... and {selectedEstimates.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVersion && !isCreatingNewVersion}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Move {movableCount} Estimate{movableCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionTransferModal;