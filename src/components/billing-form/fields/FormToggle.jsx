// import React from "react";

// const FormToggle = ({ 
//   label, 
//   isChecked, 
//   onChange,
//   className = "" 
// }) => {
//   return (
//     <div className={`flex items-center space-x-3 cursor-pointer ${className}`}>
//       <div 
//         className="flex items-center space-x-3"
//         onClick={onChange}
//       >
//         {/* Toggle Circle */}
//         <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//           {isChecked && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
//         </div>
//         {/* Label */}
//         <span className="text-gray-700 font-semibold text-sm">{label}</span>
//       </div>
//     </div>
//   );
// };

// export default FormToggle;

import React from "react";

/**
 * Improved Form Toggle component to ensure consistent toggling behavior
 */
const FormToggle = ({ 
  label, 
  isChecked, 
  onChange,
  className = "",
  disabled = false 
}) => {
  // Use a direct click handler instead of relying on onChange
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange();
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${disabled ? 'opacity-60' : ''} ${className}`}>
      <div 
        className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggleClick}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={0}
        onKeyPress={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            onChange();
          }
        }}
      >
        {/* Toggle Circle */}
        <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isChecked ? 'bg-blue-500' : 'bg-gray-300'
        }`}>
          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            isChecked ? 'translate-x-5' : 'translate-x-0'
          }`}></div>
        </div>
        
        {/* Label */}
        <span className="text-gray-700 font-semibold text-sm">{label}</span>
      </div>
    </div>
  );
};

export default FormToggle;