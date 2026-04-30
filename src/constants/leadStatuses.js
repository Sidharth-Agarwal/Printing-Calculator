// Kanban board statuses - Only 4 columns for the Kanban view
export const LEAD_STATUSES = [
  {
    id: "newLead",
    label: "New Lead",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    textColor: "#1E40AF"
  },
  {
    id: "qualified",
    label: "Qualified",
    color: "#10B981",
    bgColor: "#ECFDF5",
    textColor: "#047857"
  },
  {
    id: "converted",
    label: "Converted",
    color: "#8B5CF6",
    bgColor: "#F3E8FF",
    textColor: "#6B21A8"
  },
  {
    id: "lost",
    label: "Lost",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    textColor: "#DC2626"
  }
];

// All lead statuses - complete list for forms, dropdowns, and detailed tracking
export const ALL_LEAD_STATUSES = [
  {
    id: "newLead",
    label: "New Lead",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    textColor: "#1E40AF",
    description: "Recently added lead, not yet contacted",
    order: 1
  },
  {
    id: "contacted",
    label: "Contacted",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    textColor: "#6D28D9",
    description: "Initial contact made, awaiting response",
    order: 2
  },
  {
    id: "qualified",
    label: "Qualified",
    color: "#10B981",
    bgColor: "#ECFDF5",
    textColor: "#047857",
    description: "Lead qualified as a potential customer",
    order: 3
  },
  {
    id: "negotiation",
    label: "Negotiation",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    textColor: "#B45309",
    description: "In discussion/negotiation phase",
    order: 4
  },
  {
    id: "converted",
    label: "Converted",
    color: "#059669",
    bgColor: "#D1FAE5",
    textColor: "#065F46",
    description: "Successfully converted to client",
    order: 5
  },
  {
    id: "lost",
    label: "Lost",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    textColor: "#B91C1C",
    description: "Opportunity lost",
    order: 6
  },
  // --- NEW ---
  {
    id: "dormant",
    label: "Dormant",
    color: "#9CA3AF",
    bgColor: "#F9FAFB",
    textColor: "#374151",
    description: "Lead has gone cold — ghosted or dropped contact",
    order: 7
  }
];

// Function to get status by ID
export const getStatusById = (id) => {
  return ALL_LEAD_STATUSES.find(s => s.id === id) || ALL_LEAD_STATUSES[0];
};

// Function to get options for select inputs
export const getLeadStatusOptions = () => {
  return ALL_LEAD_STATUSES.map(s => ({ value: s.id, label: s.label }));
};

// Function to get the next logical status in the pipeline
// Dormant is excluded from the normal progression
export const getNextStatus = (currentStatusId) => {
  const current = getStatusById(currentStatusId);
  const next = ALL_LEAD_STATUSES.find(
    s => s.order === current.order + 1 && s.id !== "lost" && s.id !== "dormant"
  );
  return next || current;
};

// Helper: is this a Kanban column status?
export const isKanbanStatus = (statusId) => {
  return LEAD_STATUSES.some(s => s.id === statusId);
};

// Map intermediate/special statuses to Kanban columns
export const getKanbanStatusForLead = (leadStatus) => {
  switch (leadStatus) {
    case "newLead":
    case "contacted":
      return "newLead";
    case "qualified":
    case "negotiation":
      return "qualified";
    case "converted":
      return "converted";
    case "lost":
      return "lost";
    case "dormant":
      // Dormant leads stay in whichever column they were in.
      // We keep them in newLead by default so they're visible.
      return "newLead";
    default:
      return "newLead";
  }
};

// Get the target status when dropping in a Kanban column
export const getTargetStatusForDrop = (kanbanStatusId, originalLeadStatus) => {
  if (getKanbanStatusForLead(originalLeadStatus) === kanbanStatusId) {
    return originalLeadStatus;
  }
  switch (kanbanStatusId) {
    case "newLead":   return "newLead";
    case "qualified": return "qualified";
    case "converted": return "converted";
    case "lost":      return "lost";
    default:          return originalLeadStatus;
  }
};

// Kanban column statistics (excludes dormant from active counts)
export const getKanbanStats = (leads) => ({
  newLead:   leads.filter(l => getKanbanStatusForLead(l.status) === "newLead" && l.status !== "dormant").length,
  qualified: leads.filter(l => getKanbanStatusForLead(l.status) === "qualified").length,
  converted: leads.filter(l => getKanbanStatusForLead(l.status) === "converted").length,
  lost:      leads.filter(l => getKanbanStatusForLead(l.status) === "lost").length,
  dormant:   leads.filter(l => l.status === "dormant").length
});

// Detailed status breakdown
export const getDetailedStats = (leads) => ({
  total:       leads.length,
  newLead:     leads.filter(l => l.status === "newLead").length,
  contacted:   leads.filter(l => l.status === "contacted").length,
  qualified:   leads.filter(l => l.status === "qualified").length,
  negotiation: leads.filter(l => l.status === "negotiation").length,
  converted:   leads.filter(l => l.status === "converted").length,
  lost:        leads.filter(l => l.status === "lost").length,
  dormant:     leads.filter(l => l.status === "dormant").length
});