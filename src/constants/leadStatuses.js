// constants/leadStatuses.js
export const LEAD_STATUSES = [
  {
    id: "newLead",
    label: "New Lead",
    color: "#3B82F6", // Blue
    bgColor: "#EFF6FF", // Light blue background
    textColor: "#1E40AF", // Darker blue text
    description: "Recently added lead, not yet contacted",
    order: 1
  },
  {
    id: "contacted",
    label: "Contacted",
    color: "#8B5CF6", // Purple
    bgColor: "#F5F3FF", // Light purple background
    textColor: "#6D28D9", // Darker purple text
    description: "Initial contact made, awaiting response",
    order: 2
  },
  {
    id: "qualified",
    label: "Qualified",
    color: "#10B981", // Green
    bgColor: "#ECFDF5", // Light green background
    textColor: "#047857", // Darker green text
    description: "Lead qualified as a potential customer",
    order: 3
  },
  {
    id: "negotiation",
    label: "Negotiation",
    color: "#F59E0B", // Amber
    bgColor: "#FFFBEB", // Light amber background
    textColor: "#B45309", // Darker amber text
    description: "In discussion/negotiation phase",
    order: 4
  },
  {
    id: "converted",
    label: "Converted",
    color: "#059669", // Emerald
    bgColor: "#D1FAE5", // Light emerald background
    textColor: "#065F46", // Darker emerald text
    description: "Successfully converted to client",
    order: 5
  },
  {
    id: "lost",
    label: "Lost",
    color: "#EF4444", // Red
    bgColor: "#FEF2F2", // Light red background
    textColor: "#B91C1C", // Darker red text
    description: "Opportunity lost",
    order: 6
  }
];

// Function to get status by ID
export const getStatusById = (id) => {
  return LEAD_STATUSES.find(status => status.id === id) || LEAD_STATUSES[0]; // Default to "New Lead"
};

// Function to get options for select inputs
export const getLeadStatusOptions = () => {
  return LEAD_STATUSES.map(status => ({
    value: status.id,
    label: status.label
  }));
};

// Function to get the next logical status in the pipeline
export const getNextStatus = (currentStatusId) => {
  const currentStatus = getStatusById(currentStatusId);
  const nextStatusOrder = currentStatus.order + 1;
  
  // Find the next status by order (excluding lost)
  const nextStatus = LEAD_STATUSES.find(
    status => status.order === nextStatusOrder && status.id !== "lost"
  );
  
  return nextStatus || currentStatus; // If no next status, return current
};