// components/billing-form/fields/FormToggle.jsx
import React from "react";

/**
 * Improved form toggle component
 * This component addresses toggle inconsistency issues
 */
const FormToggle = ({ 
  label, 
  isChecked, 
  onChange,
  className = "",
  disabled = false 
}) => {
  // Direct click handler to ensure consistent behavior
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onChange) {
      onChange();
    }
  };

  // Handle keyboard interactions for accessibility
  const handleKeyPress = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onChange) {
      e.preventDefault();
      onChange();
    }
  };

  return (
    <div className={`flex items-center ${disabled ? 'opacity-60' : ''} ${className}`}>
      <div 
        className={`flex items-center space-x-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggleClick}
        onKeyPress={handleKeyPress}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={0}
      >
        {/* Modern toggle switch */}
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isChecked ? 'bg-blue-600' : 'bg-gray-200'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
        
        {/* Label */}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  );
};

export default FormToggle;