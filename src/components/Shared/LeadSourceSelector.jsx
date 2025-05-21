import React from "react";
import { LEAD_SOURCES } from "../../constants/leadSources";

/**
 * Component for selecting lead sources with icons
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.className - Additional classes
 */
const LeadSourceSelector = ({ 
  value, 
  onChange, 
  required = false,
  className = "",
  disabled = false
}) => {
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
        <option value="">Select a source</option>
        {LEAD_SOURCES.map((source) => (
          <option key={source.id} value={source.id}>
            {source.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Component for displaying lead source with icon
 * @param {Object} props - Component props
 * @param {string} props.sourceId - Source ID
 * @param {string} props.className - Additional classes
 */
export const LeadSourceDisplay = ({ sourceId, className = "" }) => {
  if (!sourceId) return <span className="text-gray-400">Unknown</span>;
  
  const source = LEAD_SOURCES.find((s) => s.id === sourceId) || {
    id: "unknown",
    label: "Unknown",
    color: "#9CA3AF"
  };
  
  return (
    <div className={`inline-flex items-center text-sm ${className}`}>
      <span
        className="flex-shrink-0 h-2 w-2 rounded-full mr-1.5"
        style={{ backgroundColor: source.color }}
      ></span>
      <span>{source.label}</span>
    </div>
  );
};

export default LeadSourceSelector;