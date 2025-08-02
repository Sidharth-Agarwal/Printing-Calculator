import React from "react";
import CRMActionButton from "../../Shared/CRMActionButton";

/**
 * Component to display a list of qualification badges
 * @param {Object} props - Component props
 * @param {Array} props.badges - Array of badge objects
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onDelete - Delete handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.isDraggable - Enable drag and drop reordering
 * @param {function} props.onReorder - Reorder handler
 */
const BadgeList = ({ 
  badges = [], 
  onEdit,
  onDelete,
  loading = false,
  isDraggable = false,
  onReorder
}) => {
  // Handle edit click
  const handleEdit = (badge) => {
    console.log("Edit clicked for badge:", badge);
    if (onEdit) {
      onEdit(badge);
    }
  };
  
  // Handle delete click
  const handleDelete = (badge) => {
    console.log("Delete clicked for badge:", badge);
    if (onDelete) {
      onDelete(badge);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
        <span className="ml-2 text-gray-600">Loading badges...</span>
      </div>
    );
  }
  
  if (badges.length === 0) {
    return (
      <div className="p-6 border border-gray-200 rounded-md text-center bg-gray-50">
        <p className="text-gray-500">No qualification badges found.</p>
        <p className="text-sm text-gray-400 mt-1">
          Create badges to categorize leads based on their potential.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {badges.map((badge) => {
        // Debug logging for each badge
        console.log("Rendering badge:", badge);
        
        return (
          <div 
            key={badge.id || badge._id || badge.key} 
            className="flex items-center p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow"
          >
            {isDraggable && (
              <div className="mr-2 text-gray-400 cursor-move">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            )}
            
            <div
              className="w-5 h-5 rounded-full mr-3"
              style={{ backgroundColor: badge.color }}
            ></div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{badge.name}</h3>
              {badge.description && (
                <p className="text-sm text-gray-500 truncate">{badge.description}</p>
              )}
            </div>
            
            <div className="ml-4 text-sm text-gray-500">
              Priority: {badge.priority}
            </div>
            
            <div className="ml-4 flex space-x-1">
              <CRMActionButton
                type="secondary"
                size="xs"
                onClick={() => handleEdit(badge)}
                aria-label="Edit badge"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
              >
                Edit
              </CRMActionButton>
              
              <CRMActionButton
                type="danger"
                size="xs"
                onClick={() => handleDelete(badge)}
                aria-label="Delete badge"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                Delete
              </CRMActionButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Component to display a badge (for use in lead displays)
 * @param {Object} props - Component props
 * @param {Object} props.badge - Badge object
 * @param {string} props.size - Badge size (sm, md, lg)
 */
export const QualificationBadge = ({ 
  badge, 
  size = "md",
  className = ""
}) => {
  if (!badge) return null;
  
  // Size variations
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1"
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${badge.color}20`,
        color: badge.color 
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: badge.color }}
      ></span>
      {badge.name}
    </span>
  );
};

/**
 * Component for selecting a qualification badge
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {Array} props.badges - Array of badge objects
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether field is required
 */
export const BadgeSelector = ({ 
  value, 
  badges = [],
  onChange, 
  required = false,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Select a badge</option>
        {badges.map((badge) => (
          <option key={badge.id || badge._id || badge.key} value={badge.id || badge._id || badge.key}>
            {badge.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BadgeList;