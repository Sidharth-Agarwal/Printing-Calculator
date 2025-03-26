import React from 'react';

const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'md',
  className = '',
  customStyles = null, 
  ...props 
}) => {
  // Standard variants
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
    // Status-specific variants
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    approved: 'bg-green-100 text-green-800',
    processing: 'bg-indigo-100 text-indigo-800',
    onhold: 'bg-yellow-100 text-yellow-800',
    inprogress: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  };
  
  // Size variants
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  // Use custom styles if provided, otherwise use the predefined variant
  const finalStyles = customStyles || 
    `inline-flex items-center rounded-full font-medium ${variantStyles[variant.toLowerCase()] || variantStyles.default} ${sizeStyles[size]} ${className}`;
  
  return (
    <span className={finalStyles} {...props}>
      {status}
    </span>
  );
};

export default StatusBadge;