import React from "react";
import { LEAD_STATUSES, getStatusById } from "../../constants/leadStatuses";

/**
 * Component to display lead status as a badge
 * @param {Object} props - Component props
 * @param {string} props.status - Status ID
 * @param {string} props.size - Badge size (sm, md, lg)
 */
const LeadStatusBadge = ({ 
  status, 
  size = "md",
  className = ""
}) => {
  // Get status data or use default
  const statusData = getStatusById(status);
  
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
        backgroundColor: statusData.bgColor,
        color: statusData.textColor
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: statusData.color }}
      ></span>
      {statusData.label}
    </span>
  );
};

/**
 * Component for selecting lead status
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether field is required
 * @param {Array} props.excludeStatuses - Array of status IDs to exclude
 */
export const LeadStatusSelector = ({ 
  value, 
  onChange, 
  required = false,
  disabled = false,
  excludeStatuses = [],
  className = ""
}) => {
  // Filter statuses if needed
  const filteredStatuses = excludeStatuses.length > 0
    ? LEAD_STATUSES.filter(status => !excludeStatuses.includes(status.id))
    : LEAD_STATUSES;
  
  return (
    <div className={`w-full ${className}`}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Select a status</option>
        {filteredStatuses.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LeadStatusBadge;