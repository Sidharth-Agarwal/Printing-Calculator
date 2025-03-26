import React, { useState } from 'react';

const CollapsibleSection = ({ 
  title, 
  children,
  initiallyExpanded = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`border rounded-md overflow-hidden ${className}`} {...props}>
      {/* Section Header */}
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 ${titleClassName}`}
        onClick={toggleExpanded}
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        <button 
          type="button" 
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          <svg 
            className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Section Content */}
      <div 
        className={`transition-all duration-200 overflow-hidden ${
          isExpanded ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className={`p-4 border-t ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;