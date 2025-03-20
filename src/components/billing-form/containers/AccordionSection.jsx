import React, { useState } from "react";

const AccordionSection = ({ 
  id,
  title, 
  children, 
  defaultOpen = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <button 
          type="button"
          className="text-xl font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-expanded={isOpen}
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;