import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Version Transfer Utility Functions
 * Extracted from EstimatesPage to improve code organization and maintainability
 */

/**
 * Get all available versions for a specific client - EXISTING ONLY
 * New versions are handled by the modal's "Create new version" option
 */
export const getAllAvailableVersionsForClient = (clientGroups, clientId) => {
  if (!clientId || !clientGroups[clientId]) return [];
  
  const client = clientGroups[clientId];
  if (!client) return [];
  
  // Get existing versions only - no automatic additional versions
  const existingVersions = Array.from(client.versions.keys())
    .map(v => parseInt(v))
    .sort((a, b) => a - b);
  
  if (existingVersions.length === 0) return ["1"]; // If no versions, suggest version 1
  
  // Return ONLY existing versions - let modal handle new version creation
  return existingVersions.map(v => v.toString());
};

/**
 * Filter selected estimates that can actually be moved to target version
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
 */
export const handleVersionTransferCore = async (
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
 * Create component-specific helper functions that use the core utilities
 * These functions are bound to specific component state and data
 */
export const createVersionTransferHelpers = (
  expandedClientId,
  clientGroups,
  selectedEstimates,
  allEstimates
) => {
  return {
    /**
     * Get all available versions for the currently expanded client
     */
    getAllAvailableVersions: () => {
      if (!expandedClientId) return [];
      return getAllAvailableVersionsForClient(clientGroups, expandedClientId);
    },

    /**
     * Get count of selected valid estimates
     */
    getSelectedEstimatesCount: () => {
      return getSelectableEstimatesCount(selectedEstimates, allEstimates);
    },

    /**
     * Get movable estimates for the current target version
     */
    getMovableEstimatesForTarget: (targetVersion) => {
      return getMovableEstimates(selectedEstimates, allEstimates, targetVersion);
    },

    /**
     * Get selected estimates for display in modal
     */
    getSelectedEstimatesForModal: () => {
      return getSelectedEstimatesForDisplay(selectedEstimates, allEstimates);
    }
  };
};

/**
 * Create version transfer event handlers
 * These functions handle the UI interactions and state updates
 */
export const createVersionTransferHandlers = (
  setIsTransferringVersions,
  setAllEstimates,
  setSelectedEstimates,
  setIsVersionTransferMode,
  setIsMultiSelectActive
) => {
  return {
    /**
     * Handle version transfer confirmation from modal
     */
    handleVersionTransferConfirm: async (targetVersionId, movableEstimates) => {
      setIsTransferringVersions(true);
      
      const success = await handleVersionTransferCore(
        movableEstimates,
        targetVersionId,
        setAllEstimates,
        setSelectedEstimates,
        setIsVersionTransferMode
      );

      setIsTransferringVersions(false);
      
      if (success) {
        // If we successfully moved estimates, deactivate multi-select
        setIsMultiSelectActive(false);
      }

      return success;
    },

    /**
     * Handle single estimate version move
     */
    handleSingleEstimateVersionMoveLocal: (estimate) => {
      handleSingleEstimateVersionMove(
        estimate,
        setSelectedEstimates,
        setIsMultiSelectActive,
        setIsVersionTransferMode
      );
    },

    /**
     * Handle starting version transfer mode
     */
    handleStartVersionTransfer: (selectedCount) => {
      if (selectedCount === 0) {
        alert("Please select at least one estimate to move.");
        return false;
      }
      
      setIsVersionTransferMode(true);
      return true;
    },

    /**
     * Handle canceling version transfer
     */
    handleCancelVersionTransfer: () => {
      setIsVersionTransferMode(false);
      // Don't clear selections automatically - let user decide
    }
  };
};