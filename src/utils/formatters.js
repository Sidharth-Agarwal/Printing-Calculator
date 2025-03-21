// utils/formatters.js
/**
 * Utility functions for formatting values
 */

// Format currency in INR
export const formatCurrency = (value) => {
    if (!value && value !== 0) return "";
    return `₹ ${parseFloat(value).toFixed(2)}`;
  };
  
  // Format date in DD/MM/YYYY
  export const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };
  
  // Format dimensions (length x breadth)
  export const formatDimensions = (dimensions, unit = "") => {
    if (!dimensions) return "";
    const { length, breadth } = dimensions;
    if (!length && !breadth) return "";
    return `${length || "0"} × ${breadth || "0"}${unit ? ` ${unit}` : ""}`;
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    if (!value && value !== 0) return "";
    return `${parseFloat(value).toFixed(2)}%`;
  };