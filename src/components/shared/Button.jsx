import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  onClick, 
  ...props 
}) => {
  const baseStyles = 'flex items-center justify-center font-medium rounded focus:outline-none transition-colors';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-300',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300',
    outline: 'bg-transparent border border-current text-blue-500 hover:bg-blue-50',
    ghost: 'bg-transparent text-blue-500 hover:bg-blue-50'
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-md px-4 py-2'
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;