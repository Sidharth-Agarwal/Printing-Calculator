// hooks/useFormSection.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBillingForm } from '../context/BillingFormContext';

/**
 * Custom hook for managing section-level state in the billing form
 * This hook replaces useFormState.js with a non-blocking implementation
 * 
 * @param {string} sectionId - The ID of the section (e.g., "lpDetails", "fsDetails")
 * @returns {Object} - Methods and state for the section
 */
const useFormSection = (sectionId) => {
  const { state, dispatch } = useBillingForm();
  
  // Extract section data from global state
  const sectionData = state[sectionId] || {};
  
  // Create local state that mirrors the global state
  // This is key to preventing UI freezing
  const [localData, setLocalData] = useState(sectionData);
  
  // Track if local changes need to be synced to global state
  const [isDirty, setIsDirty] = useState(false);
  
  // Refs to manage update timing
  const updateTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Sync from global state to local state on initial load and when global state changes
  useEffect(() => {
    if (!isDirty && JSON.stringify(sectionData) !== JSON.stringify(localData)) {
      setLocalData(sectionData);
    }
  }, [sectionData, localData, isDirty]);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Update a field in the local state immediately
   * Only sync to global state after a delay
   */
  const updateField = useCallback((name, value) => {
    // Update local state immediately for responsive UI
    setLocalData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule an update to global state
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: `UPDATE_${sectionId.toUpperCase()}`,
          payload: { [name]: value }
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, sectionId]);
  
  /**
   * Update a nested field within the section
   */
  const updateNestedField = useCallback((parent, name, value) => {
    // Get current parent object or initialize empty object
    const parentObj = localData[parent] || {};
    
    // Update local state immediately
    setLocalData(prev => ({
      ...prev,
      [parent]: {
        ...parentObj,
        [name]: value
      }
    }));
    setIsDirty(true);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule an update to global state
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: `UPDATE_${sectionId.toUpperCase()}`,
          payload: {
            [parent]: {
              ...parentObj,
              [name]: value
            }
          }
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, sectionId, localData]);
  
  /**
   * Toggle a boolean field in the section
   */
  const toggleField = useCallback((name) => {
    const currentValue = localData[name] || false;
    updateField(name, !currentValue);
  }, [localData, updateField]);
  
  /**
   * Update multiple fields at once
   */
  const updateMultipleFields = useCallback((fieldsObject) => {
    // Update local state immediately
    setLocalData(prev => ({
      ...prev,
      ...fieldsObject
    }));
    setIsDirty(true);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule an update to global state
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: `UPDATE_${sectionId.toUpperCase()}`,
          payload: fieldsObject
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, sectionId]);
  
  /**
   * Reset section to default values
   */
  const resetSection = useCallback((defaultValues = {}) => {
    setLocalData(defaultValues);
    setIsDirty(true);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: `UPDATE_${sectionId.toUpperCase()}`,
          payload: defaultValues
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, sectionId]);
  
  return {
    // Return local data for UI responsiveness
    data: localData,
    // Methods
    updateField,
    updateNestedField,
    toggleField,
    updateMultipleFields,
    resetSection,
    // State info
    isDirty
  };
};

export default useFormSection;