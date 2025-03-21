import React from "react";

/**
 * Generic form field wrapper that provides consistent styling and error handling
 */
const FormField = ({ 
  label, 
  name,
  required = false,
  error = null,
  children,
  className = ""
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;