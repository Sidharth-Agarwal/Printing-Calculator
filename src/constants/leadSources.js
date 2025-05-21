// constants/leadSources.js
export const LEAD_SOURCES = [
  {
    id: "facebook",
    label: "Facebook",
    icon: "facebook",
    color: "#4267B2" 
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "instagram",
    color: "#E1306C"
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "whatsapp",
    color: "#25D366"
  },
  {
    id: "website",
    label: "Website",
    icon: "globe",
    color: "#2563EB"
  },
  {
    id: "email",
    label: "Email Inquiry",
    icon: "mail",
    color: "#DB4437"
  },
  {
    id: "phone",
    label: "Phone Call",
    icon: "phone",
    color: "#4CAF50"
  },
  {
    id: "walkIn",
    label: "Walk-in",
    icon: "map-pin",
    color: "#FF9800"
  },
  {
    id: "referral",
    label: "Referral",
    icon: "users",
    color: "#9C27B0"
  },
  {
    id: "other",
    label: "Other",
    icon: "more-horizontal",
    color: "#607D8B"
  }
];

// Function to get source by ID
export const getSourceById = (id) => {
  return LEAD_SOURCES.find(source => source.id === id) || LEAD_SOURCES[LEAD_SOURCES.length - 1]; // Default to "Other"
};

// Function to get options for select inputs
export const getLeadSourceOptions = () => {
  return LEAD_SOURCES.map(source => ({
    value: source.id,
    label: source.label
  }));
};