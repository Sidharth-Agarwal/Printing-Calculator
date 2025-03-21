import { useState, useCallback } from 'react';
import { useBillingForm } from '../context/BillingFormContext';
import { validateRequired, validateNumber, validatePositiveNumber } from '../utils/validators';

/**
 * Custom hook for managing form field state with validation
 */
const useFormState = (section) => {
  const { state, dispatch } = useBillingForm();
  const [errors, setErrors] = useState({});

  // Get the section data from global state
  const sectionData = state[section] || {};

  // Update a field in the section
  const updateField = useCallback((name, value) => {
    dispatch({
      type: `UPDATE_${section.toUpperCase()}`,
      payload: { [name]: value }
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [dispatch, section, errors]);

  // Update a nested field in the section
  const updateNestedField = useCallback((parent, name, value) => {
    dispatch({
      type: `UPDATE_${section.toUpperCase()}`,
      payload: {
        [parent]: {
          ...sectionData[parent],
          [name]: value
        }
      }
    });

    // Clear error for this field
    const errorKey = `${parent}.${name}`;
    if (errors[errorKey]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [dispatch, section, sectionData, errors]);

  // Toggle a boolean field
  const toggleField = useCallback((name) => {
    const currentValue = sectionData[name] || false;
    updateField(name, !currentValue);
  }, [sectionData, updateField]);

  // Validate all fields in the section
  const validate = useCallback((validationRules = {}) => {
    const newErrors = {};

    // Check each field according to validation rules
    Object.entries(validationRules).forEach(([field, rules]) => {
      // Get the field value (supporting nested fields with dot notation)
      let value = sectionData;
      const fieldPath = field.split('.');
      
      for (const part of fieldPath) {
        value = value?.[part];
        if (value === undefined) break;
      }

      // Apply each validation rule
      for (const rule of rules) {
        let error = null;

        // Handle different validation types
        if (rule === 'required') {
          error = validateRequired(value);
        } else if (rule === 'number') {
          error = validateNumber(value);
        } else if (rule === 'positiveNumber') {
          error = validatePositiveNumber(value);
        } else if (typeof rule === 'function') {
          // Custom validation function
          error = rule(value, sectionData);
        }

        if (error) {
          newErrors[field] = error;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [sectionData]);

  return {
    data: sectionData,
    errors,
    updateField,
    updateNestedField,
    toggleField,
    validate,
    setErrors
  };
};

export default useFormState;