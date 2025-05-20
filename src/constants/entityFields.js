export const CLIENT_FIELDS = {
  BASIC_INFO: [
    { name: "clientCode", label: "Client Code", type: "text", required: true, readOnly: true },
    { name: "name", label: "Client / Company Name", type: "text", required: true },
    { name: "clientType", label: "Client Type", type: "select", required: true, 
      options: [
        { value: "Direct", label: "Direct Client" },
        { value: "B2B", label: "B2B" }
      ]
    },
    { name: "contactPerson", label: "Contact Person", type: "text" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "gstin", label: "GSTIN", type: "text" },
    { name: "isActive", label: "Client is Active", type: "checkbox", defaultValue: true }
  ],
  ADDRESS: [
    { name: "address.line1", label: "Address Line 1", type: "text" },
    { name: "address.line2", label: "Address Line 2", type: "text" },
    { name: "address.city", label: "City", type: "text" },
    { name: "address.state", label: "State", type: "text" },
    { name: "address.postalCode", label: "Postal Code", type: "text" },
    { name: "address.country", label: "Country", type: "text" }
  ],
  BILLING_ADDRESS: [
    { name: "billingAddress.line1", label: "Address Line 1", type: "text" },
    { name: "billingAddress.line2", label: "Address Line 2", type: "text" },
    { name: "billingAddress.city", label: "City", type: "text" },
    { name: "billingAddress.state", label: "State", type: "text" },
    { name: "billingAddress.postalCode", label: "Postal Code", type: "text" },
    { name: "billingAddress.country", label: "Country", type: "text" }
  ],
  NOTES: [
    { name: "notes", label: "Notes", type: "textarea" }
  ]
};

export const VENDOR_FIELDS = {
  BASIC_INFO: [
    { name: "vendorCode", label: "Vendor Code", type: "text", required: true, readOnly: true },
    { name: "name", label: "Vendor / Company Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "gstin", label: "GSTIN", type: "text" },
    { name: "isActive", label: "Vendor is Active", type: "checkbox", defaultValue: true }
  ],
  ADDRESS: [
    { name: "address.line1", label: "Address Line 1", type: "text" },
    { name: "address.line2", label: "Address Line 2", type: "text" },
    { name: "address.city", label: "City", type: "text" },
    { name: "address.state", label: "State", type: "text" },
    { name: "address.postalCode", label: "Postal Code", type: "text" },
    { name: "address.country", label: "Country", type: "text" }
  ],
  ACCOUNT_DETAILS: [
    { name: "accountDetails.bankName", label: "Bank Name", type: "text" },
    { name: "accountDetails.accountNumber", label: "Account Number", type: "text" },
    { name: "accountDetails.ifscCode", label: "IFSC Code", type: "text" },
    { name: "accountDetails.accountType", label: "Account Type", type: "select",
      options: [
        { value: "Savings", label: "Savings" },
        { value: "Current", label: "Current" }
      ]
    },
    { name: "accountDetails.upiId", label: "UPI ID", type: "text" }
  ],
  PAYMENT_TERMS: [
    { name: "paymentTerms.creditDays", label: "Credit Period (Days)", type: "number" }
  ],
  NOTES: [
    { name: "notes", label: "Notes", type: "textarea" }
  ]
};

// Define which fields to display in the table
export const TABLE_DISPLAY_FIELDS = [
  { field: "clientCode", label: "Client Code" },
  { field: "name", label: "Name" },
  { field: "clientType", label: "Type" },
  { field: "contactPerson", label: "Contact Person" },
  { field: "phone", label: "Phone" }
];

// Define which fields to display in the detailed view
export const DETAILED_DISPLAY_FIELDS = [
  { field: "clientCode", label: "Client Code" },
  { field: "name", label: "Name" },
  { field: "clientType", label: "Type" },
  { field: "contactPerson", label: "Contact Person" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "gstin", label: "GSTIN" }
];