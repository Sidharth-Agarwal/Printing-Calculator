import React from "react";

/**
 * Reusable button component for CRM actions
 * @param {Object} props - Component props
 * @param {string} props.type - Button type (primary, secondary, success, danger, warning)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.icon - Optional icon component
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional classes
 * @param {ReactNode} props.children - Button content
 */
const CRMActionButton = ({ 
  type = "primary", 
  size = "md", 
  isLoading = false, 
  icon = null,
  onClick,
  disabled = false,
  className = "",
  children,
  ...rest
}) => {
  // Base classes
  const baseClasses = "flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Type classes
  const typeClasses = {
    primary: "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-red-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500",
    info: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
  };
  
  // Size classes
  const sizeClasses = {
    xs: "text-xs py-1 px-2",
    sm: "text-sm py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2 px-6"
  };
  
  // Disabled classes
  const disabledClasses = disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default CRMActionButton;