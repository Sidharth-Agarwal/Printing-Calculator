// Kanban board statuses - Only 4 columns for the Kanban view
export const LEAD_STATUSES = [
  {
    id: "newLead",
    label: "New Lead",
    color: "#3B82F6", // Blue
    bgColor: "#EFF6FF",
    textColor: "#1E40AF"
  },
  {
    id: "qualified",
    label: "Qualified",
    color: "#10B981", // Green
    bgColor: "#ECFDF5",
    textColor: "#047857"
  },
  {
    id: "converted",
    label: "Converted",
    color: "#8B5CF6", // Purple
    bgColor: "#F3E8FF",
    textColor: "#6B21A8"
  },
  {
    id: "lost",
    label: "Lost",
    color: "#EF4444", // Red
    bgColor: "#FEF2F2",
    textColor: "#DC2626"
  }
];

// All lead statuses - Complete list for forms, dropdowns, and detailed tracking
export const ALL_LEAD_STATUSES = [
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

// Function to get status by ID (searches in ALL_LEAD_STATUSES for complete info)
export const getStatusById = (id) => {
  return ALL_LEAD_STATUSES.find(status => status.id === id) || ALL_LEAD_STATUSES[0]; // Default to "New Lead"
};

// Function to get options for select inputs (uses all statuses)
export const getLeadStatusOptions = () => {
  return ALL_LEAD_STATUSES.map(status => ({
    value: status.id,
    label: status.label
  }));
};

// Function to get the next logical status in the pipeline
export const getNextStatus = (currentStatusId) => {
  const currentStatus = getStatusById(currentStatusId);
  const nextStatusOrder = currentStatus.order + 1;
  
  // Find the next status by order (excluding lost)
  const nextStatus = ALL_LEAD_STATUSES.find(
    status => status.order === nextStatusOrder && status.id !== "lost"
  );
  
  return nextStatus || currentStatus; // If no next status, return current
};

// Helper function to check if status should be shown in Kanban
export const isKanbanStatus = (statusId) => {
  return LEAD_STATUSES.some(status => status.id === statusId);
};

// Map intermediate statuses to Kanban columns
export const getKanbanStatusForLead = (leadStatus) => {
  switch (leadStatus) {
    case "newLead":
      return "newLead";
    case "contacted":
      return "newLead"; // Show contacted leads in New Lead column
    case "qualified":
      return "qualified";
    case "negotiation":
      return "qualified"; // Show negotiation leads in Qualified column
    case "converted":
      return "converted";
    case "lost":
      return "lost";
    default:
      return "newLead";
  }
};

// Get the target status when dropping in a Kanban column
export const getTargetStatusForDrop = (kanbanStatusId, originalLeadStatus) => {
  // If dropping in the same Kanban column, keep original status
  if (getKanbanStatusForLead(originalLeadStatus) === kanbanStatusId) {
    return originalLeadStatus;
  }
  
  // Map Kanban columns to appropriate statuses
  switch (kanbanStatusId) {
    case "newLead":
      return "newLead";
    case "qualified":
      return "qualified";
    case "converted":
      return "converted";
    case "lost":
      return "lost";
    default:
      return originalLeadStatus;
  }
};

// Get Kanban column statistics
export const getKanbanStats = (leads) => {
  return {
    newLead: leads.filter(lead => getKanbanStatusForLead(lead.status) === "newLead").length,
    qualified: leads.filter(lead => getKanbanStatusForLead(lead.status) === "qualified").length,
    converted: leads.filter(lead => getKanbanStatusForLead(lead.status) === "converted").length,
    lost: leads.filter(lead => getKanbanStatusForLead(lead.status) === "lost").length
  };
};

// Get detailed status breakdown
export const getDetailedStats = (leads) => {
  return {
    total: leads.length,
    newLead: leads.filter(lead => lead.status === "newLead").length,
    contacted: leads.filter(lead => lead.status === "contacted").length,
    qualified: leads.filter(lead => lead.status === "qualified").length,
    negotiation: leads.filter(lead => lead.status === "negotiation").length,
    converted: leads.filter(lead => lead.status === "converted").length,
    lost: leads.filter(lead => lead.status === "lost").length
  };
};