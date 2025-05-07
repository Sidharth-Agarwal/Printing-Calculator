import React from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';

const FormSection = ({ 
  title, 
  children, 
  id, 
  activeSection, 
  setActiveSection, 
  isUsed = false, 
  onToggleUsage, 
  isDisabled = false
}) => {
  const isActive = activeSection === id;
  
  const toggleSection = () => {
    if (!isDisabled) {
      setActiveSection(isActive ? null : id);
    }
  };
  
  // Special handling for the ReviewAndSubmit section (which has no toggle)
  const isReviewSection = id === "reviewAndSubmit";
  
  // Color coding based on usage - using red theme
  const getBgColor = () => {
    if (isActive) return "bg-grey-50";
    if (isUsed) return "bg-grey-50"; // Red for active items
    return "bg-white";
  };

  const getBorderColor = () => {
    if (isActive) return "border-red-200";
    if (isUsed) return "border-red-100"; // Red for active items
    return "border-gray-200";
  };
  
  return (
    <div className={`mb-4 border rounded-md overflow-hidden shadow-sm ${isDisabled ? 'opacity-60' : ''} ${getBorderColor()}`}>
      <div 
        className={`p-3 flex justify-between items-center ${getBgColor()} cursor-pointer`}
        onClick={toggleSection}
      >
        <div className="flex items-center space-x-4">
          {/* Toggle switch in section header - not shown for ReviewAndSubmit */}
          {!isReviewSection && (
            <div 
              className={`flex items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent section expansion when clicking toggle
                if (!isDisabled) {
                  onToggleUsage();
                }
              }}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${
                isDisabled 
                  ? 'bg-gray-100 border-gray-300' 
                  : isUsed 
                    ? 'bg-white border border-red-500' // Red border when active
                    : 'border border-gray-300 bg-white'
              }`}>
                {isUsed && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
              </div>
            </div>
          )}
          
          {/* Section title */}
          <h2 
            className="font-semibold"
          >
            {title}
          </h2>
          
          {/* Add a red badge if used */}
          {isUsed && !isReviewSection && (
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        
        {/* Expand/collapse button */}
        <span className={`${isUsed ? 'text-red-600' : 'text-gray-500'}`}>
          {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </div>
      <div className={`transition-all duration-300 ${isActive ? 'block p-4 border-t border-gray-200' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default FormSection;