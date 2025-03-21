// hooks/useFormSection.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBillingForm } from '../context/BillingFormContext';
import { ACTION_TYPES } from '../context/BillingFormContext';

/**
 * Custom hook for managing section-level state in the billing form
 * 
 * @param {string} sectionId - The ID of the section (e.g., "lpDetails", "fsDetails")
 * @returns {Object} - Methods and state for the section
 */
const useFormSection = (sectionId) => {
  const { state, dispatch } = useBillingForm();
  
  // Extract section data from global state, initialize if not exists
  const sectionData = state[sectionId] || {};
  
  // Create local state that mirrors the global state
  const [localData, setLocalData] = useState(sectionData);
  
  // Track if local changes need to be synced to global state
  const [isDirty, setIsDirty] = useState(false);
  
  // References
  const updateTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Get the action type for this section
  const getActionType = useCallback(() => {
    // Convert section ID to uppercase and prepend "UPDATE_"
    return `UPDATE_${sectionId.toUpperCase()}`;
  }, [sectionId]);
  
  // Sync local state with global state when it changes
  useEffect(() => {
    if (!isDirty && JSON.stringify(sectionData) !== JSON.stringify(localData)) {
      console.log(`Syncing ${sectionId} local state from global:`, sectionData);
      setLocalData(sectionData);
    }
  }, [sectionData, localData, isDirty, sectionId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Update a field in the section
   */
  const updateField = useCallback((name, value) => {
    console.log(`Updating field ${name} in ${sectionId} to:`, value);
    
    // Update local state immediately
    setLocalData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule update to global state
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: getActionType(),
          payload: { [name]: value }
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, getActionType, sectionId]);
  
  /**
   * Toggle a boolean field
   */
  const toggleField = useCallback((name) => {
    const currentValue = Boolean(localData[name]);
    const newValue = !currentValue;
    
    console.log(`Toggling ${name} in ${sectionId} from ${currentValue} to ${newValue}`);
    
    // Update local state immediately
    setLocalData(prev => ({ ...prev, [name]: newValue }));
    
    // Update global state immediately for toggles
    dispatch({
      type: getActionType(),
      payload: { [name]: newValue }
    });
    
    // No need to use timeout for toggles
    setIsDirty(false);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
  }, [localData, dispatch, getActionType, sectionId]);
  
  /**
   * Update a nested field
   */
  const updateNestedField = useCallback((parent, name, value) => {
    // Get current parent object or empty object
    const parentObj = localData[parent] || {};
    
    // Update local state
    setLocalData(prev => ({
      ...prev,
      [parent]: {
        ...parentObj,
        [name]: value
      }
    }));
    setIsDirty(true);
    
    // Clear pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule update to global state
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: getActionType(),
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
  }, [dispatch, getActionType, localData, sectionId]);
  
  /**
   * Update multiple fields at once
   */
  const updateMultipleFields = useCallback((fieldsObject) => {
    setLocalData(prev => ({
      ...prev,
      ...fieldsObject
    }));
    setIsDirty(true);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({
          type: getActionType(),
          payload: fieldsObject
        });
        setIsDirty(false);
      }
    }, 100);
  }, [dispatch, getActionType, sectionId]);
  
  /**
   * Reset the section to default values
   */
  const resetSection = useCallback((defaultValues = {}) => {
    setLocalData(defaultValues);
    
    dispatch({
      type: getActionType(),
      payload: defaultValues
    });
    
    setIsDirty(false);
  }, [dispatch, getActionType, sectionId]);
  
  return {
    data: localData,
    updateField,
    updateNestedField,
    toggleField,
    updateMultipleFields,
    resetSection,
    isDirty
  };
};

export default useFormSection;