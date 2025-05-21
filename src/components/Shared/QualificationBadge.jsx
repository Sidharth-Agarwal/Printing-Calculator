import React from "react";
import { useCRM } from "../../context/CRMContext";

/**
 * Component to display a lead qualification badge
 * @param {Object} props - Component props
 * @param {string} props.badgeId - ID of the badge to display
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const QualificationBadge = ({ 
  badgeId, 
  size = "md",
  className = ""
}) => {
  const { qualificationBadges } = useCRM();
  
  // Find the badge in context
  const badge = badgeId ? qualificationBadges.find(b => b.id === badgeId) : null;
  
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
        backgroundColor: `${badge.color}20`, // 20% opacity version of the badge color
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
 * @param {string} props.value - Current selected badge ID
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {string} props.className - Additional CSS classes
 */
export const QualificationBadgeSelector = ({ 
  value, 
  onChange, 
  required = false,
  disabled = false,
  className = ""
}) => {
  const { qualificationBadges, isLoadingBadges } = useCRM();
  
  return (
    <div className={`w-full ${className}`}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || isLoadingBadges}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
          disabled || isLoadingBadges ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Select a qualification level</option>
        {qualificationBadges.map((badge) => (
          <option key={badge.id} value={badge.id}>
            {badge.name}
          </option>
        ))}
      </select>
      
      {isLoadingBadges && (
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <svg className="animate-spin h-3 w-3 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading badges...
        </div>
      )}
    </div>
  );
};

export default QualificationBadge;