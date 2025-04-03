// src/hooks/useVersionControl.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getEstimateById, 
  getEstimateVersions, 
  createEstimateVersion,
  updateEstimateStatus 
} from '../utils/estimateVersionUtils';
import { compareEstimateVersions } from '../utils/estimateVersionUtils';
import { ESTIMATE_STATUS } from '../constants/statusConstants';

/**
 * Custom hook for estimate version control
 * Manages version history, comparisons, and version creation
 */
const useVersionControl = (estimateId = null, initialState = null) => {
  const [currentEstimate, setCurrentEstimate] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDiff, setVersionDiff] = useState(null);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [originalState, setOriginalState] = useState(initialState);
  
  // Load estimate and its version history
  const loadEstimate = useCallback(async (id) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current estimate
      const estimate = await getEstimateById(id);
      if (!estimate) {
        throw new Error('Estimate not found');
      }
      
      setCurrentEstimate(estimate);
      
      // Get all versions of this estimate
      let versions;
      if (estimate.baseEstimateId) {
        // This is a version - get all versions of the base estimate
        versions = await getEstimateVersions(estimate.baseEstimateId);
      } else {
        // This is the base estimate - get all its versions
        versions = await getEstimateVersions(estimate.id);
      }
      
      setVersionHistory(versions || []);
      return estimate;
    } catch (err) {
      setError('Error loading estimate: ' + err.message);
      console.error('Error loading estimate:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load initial estimate if ID is provided
  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId, loadEstimate]);
  
  // Set original state for comparison
  useEffect(() => {
    if (initialState) {
      setOriginalState(initialState);
    }
  }, [initialState]);
  
  // Compare two versions of an estimate
  const compareVersions = useCallback((version1, version2) => {
    if (!version1 || !version2) return null;
    
    const diff = compareEstimateVersions(version1, version2);
    setVersionDiff(diff);
    return diff;
  }, []);
  
  // Check if current state has been modified
  const checkModified = useCallback((currentState) => {
    if (!originalState || !currentState) return false;
    
    // Convert to JSON for deep comparison
    const originalJson = JSON.stringify(originalState);
    const currentJson = JSON.stringify(currentState);
    
    const modified = originalJson !== currentJson;
    setIsModified(modified);
    return modified;
  }, [originalState]);
  
  // Create a new version of the estimate
  const createNewVersion = useCallback(async (formState, userId, changeNotes) => {
    if (!currentEstimate || !formState) {
      setError('Missing required data for creating new version');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const baseId = currentEstimate.baseEstimateId || currentEstimate.id;
      const newVersion = await createEstimateVersion(baseId, formState, userId, changeNotes);
      
      // Update local state
      await loadEstimate(newVersion.id);
      
      setOriginalState(formState);
      setIsModified(false);
      
      return newVersion;
    } catch (err) {
      setError('Error creating new version: ' + err.message);
      console.error('Error creating new version:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentEstimate, loadEstimate]);
  
  // Update estimate status
  const changeStatus = useCallback(async (status, userId) => {
    if (!currentEstimate || !Object.values(ESTIMATE_STATUS).includes(status)) {
      setError('Invalid status or missing estimate');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await updateEstimateStatus(currentEstimate.id, status, userId);
      
      if (success) {
        // Update local state
        setCurrentEstimate(prev => ({
          ...prev,
          status
        }));
        
        // Reload estimate to get latest data
        await loadEstimate(currentEstimate.id);
      }
      
      return success;
    } catch (err) {
      setError('Error updating status: ' + err.message);
      console.error('Error updating status:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentEstimate, loadEstimate]);
  
  // Select a specific version
  const selectVersion = useCallback(async (versionId) => {
    if (!versionId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const version = await getEstimateById(versionId);
      setSelectedVersion(version);
      return version;
    } catch (err) {
      setError('Error loading version: ' + err.message);
      console.error('Error loading version:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    currentEstimate,
    versionHistory,
    isLoading,
    error,
    selectedVersion,
    versionDiff,
    isModified,
    loadEstimate,
    compareVersions,
    checkModified,
    createNewVersion,
    changeStatus,
    selectVersion
  };
};

export default useVersionControl;