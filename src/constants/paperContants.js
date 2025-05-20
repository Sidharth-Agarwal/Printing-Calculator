export const PAPER_FIELDS = {
  BASIC_INFO: [
    { name: "paperName", label: "Paper Name", type: "text", required: true },
    { name: "company", label: "Company", type: "select", required: true, options: [] },
    { name: "gsm", label: "GSM", type: "number", required: true },
    { name: "pricePerSheet", label: "Price/Sheet (INR)", type: "number", required: true },
  ],
  DIMENSIONS_SHIPPING: [
    { name: "length", label: "Length (CM)", type: "number", required: true },
    { name: "breadth", label: "Breadth (CM)", type: "number", required: true },
    { name: "freightPerKg", label: "Freight/KG (INR)", type: "number", required: true },
  ],
  CALCULATED_VALUES: [
    { name: "ratePerGram", label: "Rate/Gram (INR)", type: "text", readOnly: true },
    { name: "area", label: "Area (sqcm)", type: "text", readOnly: true },
    { name: "oneSqcmInGram", label: "1 Sqcm in Gram", type: "text", readOnly: true },
    { name: "gsmPerSheet", label: "GSM/Sheet", type: "text", readOnly: true },
    { name: "freightPerSheet", label: "Freight/Sheet (INR)", type: "text", readOnly: true },
    { name: "finalRate", label: "Final Rate (INR)", type: "text", readOnly: true },
  ]
};
