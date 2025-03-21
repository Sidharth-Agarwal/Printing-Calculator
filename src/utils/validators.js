// utils/validators.js
/**
 * Validation utility functions
 */

// Validate required field
export const validateRequired = (value) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    return null;
  };
  
  // Validate number field
  export const validateNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return null; // Empty is handled by required validation
    }
    if (isNaN(parseFloat(value))) {
      return "Must be a valid number";
    }
    return null;
  };
  
  // Validate positive number
  export const validatePositiveNumber = (value) => {
    const numberError = validateNumber(value);
    if (numberError) return numberError;
    
    if (parseFloat(value) <= 0) {
      return "Must be greater than zero";
    }
    return null;
  };
  
  // Validate date fields
  export const validateDate = (date) => {
    if (!date) {
      return "Date is required";
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid date";
    }
    return null;
  };