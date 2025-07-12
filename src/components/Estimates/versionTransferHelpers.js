import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Get all available versions for a specific client
 * @param {Object} clientGroups - The client groups object
 * @param {string} clientId - The client ID
 * @returns {Array} Array of available version strings
 */
export const getAllAvailableVersionsForClient = (clientGroups, clientId) => {
  if (!clientId || !clientGroups[clientId]) return [];
  
  const client = clientGroups[clientId];
  if (!client) return [];
  
  // Get existing versions
  const existingVersions = Array.from(client.versions.keys()).map(v => parseInt(v)).sort((a, b) => a - b);
  
  if (existingVersions.length === 0) return ["1", "2", "3", "4", "5"];
  
  // Return existing versions plus some additional options
  const maxVersion = Math.max(...existingVersions);
  const additionalVersions = [];
  
  // Add next 3 versions as options
  for (let i = 1; i <= 3; i++) {
    additionalVersions.push((maxVersion + i).toString());
  }
  
  return [...existingVersions.map(v => v.toString()), ...additionalVersions];
};

/**
 * Filter selected estimates that can actually be moved to target version
 * @param {Object} selectedEstimates - The selected estimates object
 * @param {Array} allEstimates - All estimates array
 * @param {string} targetVersionId - Target version ID
 * @returns {Array} Array of estimates that can be moved
 */
export const getMovableEstimates = (selectedEstimates, allEstimates, targetVersionId) => {
  const movableEstimates = [];
  
  Object.keys(selectedEstimates).forEach(estimateId => {
    if (selectedEstimates[estimateId]?.selected) {
      const estimate = allEstimates.find(est => est.id === estimateId);
      
      // Only include if estimate exists, is not in final states, and is NOT already in target version
      if (estimate && 
          !estimate.movedToOrders && 
          !estimate.isCanceled && 
          !estimate.inEscrow &&
          estimate.versionId !== targetVersionId) {
        movableEstimates.push(estimate);
      }
    }
  });
  
  return movableEstimates;
};

/**
 * Get selected estimates for display purposes (including unmovable ones)
 * @param {Object} selectedEstimates - The selected estimates object  
 * @param {Array} allEstimates - All estimates array
 * @returns {Array} Array of all selected estimates
 */
export const getSelectedEstimatesForDisplay = (selectedEstimates, allEstimates) => {
  const selectedEstimatesList = [];
  
  Object.keys(selectedEstimates).forEach(estimateId => {
    if (selectedEstimates[estimateId]?.selected) {
      const estimate = allEstimates.find(est => est.id === estimateId);
      if (estimate) {
        selectedEstimatesList.push(estimate);
      }
    }
  });
  
  return selectedEstimatesList;
};

/**
 * Handle version transfer for multiple estimates
 * @param {Array} movableEstimates - Estimates that can be moved
 * @param {string} targetVersionId - Target version ID
 * @param {Function} setAllEstimates - State setter for all estimates
 * @param {Function} setSelectedEstimates - State setter for selected estimates
 * @param {Function} setIsVersionTransferMode - State setter for transfer mode
 * @returns {Promise<boolean>} Success status
 */
export const handleVersionTransfer = async (
  movableEstimates, 
  targetVersionId, 
  setAllEstimates, 
  setSelectedEstimates, 
  setIsVersionTransferMode
) => {
  if (movableEstimates.length === 0) {
    alert("No estimates can be moved. Selected estimates are already in the target version or cannot be moved.");
    return false;
  }
  
  // Show confirmation with count
  const confirmMessage = `Move ${movableEstimates.length} estimate(s) to Version ${targetVersionId}?`;
  if (!window.confirm(confirmMessage)) return false;
  
  try {
    const currentTimestamp = new Date().toISOString();
    
    // Update each movable estimate in Firestore
    const updatePromises = movableEstimates.map(estimate => {
      const estimateRef = doc(db, "estimates", estimate.id);
      return updateDoc(estimateRef, {
        versionId: targetVersionId,
        updatedAt: currentTimestamp
      });
    });
    
    await Promise.all(updatePromises);
    
    // Update local state
    setAllEstimates(prev => prev.map(est => {
      const shouldMove = movableEstimates.find(movable => movable.id === est.id);
      return shouldMove 
        ? { ...est, versionId: targetVersionId, updatedAt: currentTimestamp } 
        : est;
    }));
    
    // Clear selections and exit transfer mode
    setSelectedEstimates({});
    setIsVersionTransferMode(false);
    
    alert(`Successfully moved ${movableEstimates.length} estimate(s) to Version ${targetVersionId}`);
    return true;
    
  } catch (error) {
    console.error("Error moving estimates:", error);
    alert("Failed to move estimates. Please try again.");
    return false;
  }
};

/**
 * Handle single estimate version transfer
 * @param {Object} estimate - The estimate to move
 * @param {Function} setSelectedEstimates - State setter for selected estimates
 * @param {Function} setIsMultiSelectActive - State setter for multi-select mode
 * @param {Function} setIsVersionTransferMode - State setter for transfer mode
 */
export const handleSingleEstimateVersionMove = (
  estimate, 
  setSelectedEstimates, 
  setIsMultiSelectActive, 
  setIsVersionTransferMode
) => {
  // Check if estimate can be moved
  if (estimate.movedToOrders || estimate.isCanceled || estimate.inEscrow) {
    alert("This estimate cannot be moved to another version because it has been moved to orders, canceled, or is in escrow.");
    return;
  }
  
  // Set single estimate as selected
  setSelectedEstimates({ 
    [estimate.id]: { 
      selected: true, 
      versionId: estimate.versionId || "1" 
    } 
  });
  
  // Enable multi-select mode and transfer mode
  setIsMultiSelectActive(true);
  setIsVersionTransferMode(true);
};

/**
 * Get count of selected estimates that are actually selectable
 * @param {Object} selectedEstimates - The selected estimates object
 * @param {Array} allEstimates - All estimates array
 * @returns {number} Count of selectable estimates
 */
export const getSelectableEstimatesCount = (selectedEstimates, allEstimates) => {
  let count = 0;
  
  Object.keys(selectedEstimates).forEach(estimateId => {
    if (selectedEstimates[estimateId]?.selected) {
      const estimate = allEstimates.find(est => est.id === estimateId);
      if (estimate && !estimate.movedToOrders && !estimate.isCanceled && !estimate.inEscrow) {
        count++;
      }
    }
  });
  
  return count;
};

/**
 * Validate if version transfer is possible
 * @param {Array} selectedEstimates - Selected estimates
 * @param {string} targetVersion - Target version
 * @param {string} currentVersion - Current version
 * @returns {Object} Validation result with isValid and message
 */
export const validateVersionTransfer = (selectedEstimates, targetVersion, currentVersion) => {
  if (!targetVersion) {
    return { isValid: false, message: "Please select a target version." };
  }
  
  if (targetVersion === currentVersion) {
    return { isValid: false, message: "Target version cannot be the same as current version." };
  }
  
  if (selectedEstimates.length === 0) {
    return { isValid: false, message: "No estimates selected for transfer." };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Get version statistics for display
 * @param {Object} clientGroups - Client groups object
 * @param {string} clientId - Client ID
 * @returns {Object} Version statistics
 */
export const getVersionStatistics = (clientGroups, clientId) => {
  if (!clientId || !clientGroups[clientId]) {
    return { totalVersions: 0, totalEstimates: 0, versionBreakdown: [] };
  }
  
  const client = clientGroups[clientId];
  const versionBreakdown = [];
  
  client.versions.forEach((versionData, versionId) => {
    versionBreakdown.push({
      version: versionId,
      count: versionData.count,
      estimates: versionData.estimates
    });
  });
  
  // Sort by version number
  versionBreakdown.sort((a, b) => parseInt(a.version) - parseInt(b.version));
  
  return {
    totalVersions: client.versions.size,
    totalEstimates: client.totalEstimates,
    versionBreakdown
  };
};