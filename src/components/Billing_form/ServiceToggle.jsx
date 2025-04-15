import React from "react";

/**
 * A reusable component for toggling services in the billing form
 * 
 * @param {Object} props
 * @param {string} props.title - The display title of the service
 * @param {boolean} props.isUsed - Whether the service is currently active
 * @param {Function} props.onToggle - Toggle handler function
 * @param {boolean} props.isExpanded - Whether the service details are expanded
 * @param {Function} props.onExpand - Function to handle expanding/collapsing
 * @param {React.ReactNode} props.children - The content to render when expanded
 * @param {boolean} props.disabled - Whether the toggle is disabled
 */
const ServiceToggle = ({ 
  title, 
  isUsed, 
  onToggle, 
  isExpanded, 
  onExpand, 
  children, 
  disabled = false 
}) => {
  return (
    <div className="mb-4">
      <div 
        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
          isUsed ? "bg-blue-50" : "bg-gray-100"
        } ${disabled ? "opacity-60" : ""}`}
        onClick={() => !disabled && isUsed && onExpand()}
      >
        <div className="flex items-center">
          <div 
            className={`w-5 h-5 flex items-center justify-center border rounded-full ${
              disabled 
                ? "border-gray-400 bg-gray-300" 
                : "border-gray-300 bg-gray-200 hover:bg-gray-300"
            } mr-3 cursor-pointer`}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onToggle();
            }}
          >
            {isUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
          </div>
          <h3 className={`font-medium ${isUsed ? "text-blue-700" : "text-gray-700"}`}>{title}</h3>
        </div>
        {isUsed && !disabled && (
          <button 
            type="button" 
            className="text-gray-600 w-6 h-6 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </div>
      
      {isUsed && isExpanded && !disabled && (
        <div className="mt-3 pl-8 pr-2 border-l-2 border-blue-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default ServiceToggle;