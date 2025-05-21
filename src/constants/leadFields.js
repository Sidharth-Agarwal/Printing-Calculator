export const LEAD_FIELDS = {
  BASIC_INFO: [
    {
      name: "name",
      label: "Lead Name",
      type: "text",
      required: true,
      placeholder: "Enter lead name"
    },
    {
      name: "company",
      label: "Company Name",
      type: "text",
      required: false,
      placeholder: "Enter company name (if applicable)"
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: false,
      placeholder: "Enter email address"
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "Enter phone number"
    },
    {
      name: "source",
      label: "Lead Source",
      type: "select",
      required: true,
      options: [] // Will be populated from leadSources
    },
    {
      name: "status",
      label: "Lead Status",
      type: "select",
      required: true,
      options: [] // Will be populated from leadStatuses
    }
  ],
  
  CONTACT_INFO: [
    {
      name: "address.line1",
      label: "Address Line 1",
      type: "text",
      required: false,
      placeholder: "Enter street address"
    },
    {
      name: "address.line2",
      label: "Address Line 2",
      type: "text",
      required: false,
      placeholder: "Enter apartment, suite, etc."
    },
    {
      name: "address.city",
      label: "City",
      type: "text",
      required: false,
      placeholder: "Enter city"
    },
    {
      name: "address.state",
      label: "State",
      type: "text",
      required: false,
      placeholder: "Enter state or province"
    },
    {
      name: "address.postalCode",
      label: "Postal Code",
      type: "text",
      required: false,
      placeholder: "Enter postal code"
    },
    {
      name: "address.country",
      label: "Country",
      type: "text",
      required: false,
      placeholder: "Enter country",
      defaultValue: "India"
    }
  ],
  
  LEAD_DETAILS: [
    {
      name: "jobType",
      label: "Job Type",
      type: "select",
      required: false,
      options: [
        { value: "businessCards", label: "Business Cards" },
        { value: "stationery", label: "Stationery" },
        { value: "wedding", label: "Wedding Invitations" },
        { value: "packaging", label: "Packaging" },
        { value: "booklet", label: "Booklet / Book" },
        { value: "marketing", label: "Marketing Materials" },
        { value: "other", label: "Other" }
      ]
    },
    {
      name: "budget",
      label: "Budget Range",
      type: "select",
      required: false,
      options: [
        { value: "under10k", label: "Under ₹10,000" },
        { value: "10kTo50k", label: "₹10,000 - ₹50,000" },
        { value: "50kTo1L", label: "₹50,000 - ₹1,00,000" },
        { value: "1LTo5L", label: "₹1,00,000 - ₹5,00,000" },
        { value: "over5L", label: "Above ₹5,00,000" },
        { value: "unknown", label: "Unknown" }
      ]
    },
    {
      name: "urgency",
      label: "Urgency",
      type: "select",
      required: false,
      options: [
        { value: "immediate", label: "Immediate (< 1 week)" },
        { value: "soon", label: "Soon (1-4 weeks)" },
        { value: "planned", label: "Planned (1-3 months)" },
        { value: "exploratory", label: "Exploratory (> 3 months)" }
      ]
    }
  ],
  
  NOTES: [
    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      required: false,
      placeholder: "Enter any additional notes about this lead"
    }
  ],
  
  QUALIFICATION: [
    {
      name: "badgeId",
      label: "Qualification Badge",
      type: "select",
      required: false,
      options: [] // Will be populated from qualificationBadges
    }
  ],
  
  DISCUSSION: [
    {
      name: "discussionDate",
      label: "Discussion Date",
      type: "date",
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      name: "discussionSummary",
      label: "Discussion Summary",
      type: "textarea",
      required: true,
      placeholder: "Summarize your discussion with the lead"
    },
    {
      name: "nextSteps",
      label: "Next Steps",
      type: "textarea",
      required: false,
      placeholder: "What are the next steps or action items?"
    }
  ]
};

// Fields displayed in the leads table
export const LEAD_TABLE_FIELDS = [
  { field: "name", label: "Name", sortable: true },
  { field: "phone", label: "Phone/Email", sortable: false },
  { field: "source", label: "Source", sortable: true },
  { field: "badgeId", label: "Qualification", sortable: false },
  { field: "status", label: "Status", sortable: true },
  { field: "lastDiscussionDate", label: "Last Contact", sortable: true, type: "date" },
  { field: "lastDiscussionSummary", label: "Last Discussion Summary", sortable: false, truncate: true }
];

// Fields for lead pool display
export const LEAD_POOL_FIELDS = [
  { field: "name", label: "Name", sortable: true },
  { field: "company", label: "Company", sortable: true },
  { field: "lastDiscussionDate", label: "Last Contact", sortable: true, type: "date" },
  { field: "lastDiscussionSummary", label: "Last Discussion", sortable: false, truncate: true },
  { field: "status", label: "Status", sortable: true }
];