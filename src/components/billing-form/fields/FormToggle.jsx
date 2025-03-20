import React from "react";

const FormToggle = ({ 
  label, 
  isChecked, 
  onChange,
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-3 cursor-pointer ${className}`}>
      <div 
        className="flex items-center space-x-3"
        onClick={onChange}
      >
        {/* Toggle Circle */}
        <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
          {isChecked && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
        </div>
        {/* Label */}
        <span className="text-gray-700 font-semibold text-sm">{label}</span>
      </div>
    </div>
  );
};

export default FormToggle;