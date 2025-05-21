export const MATERIAL_FIELDS = {
  BASIC_INFO: [
    { 
      name: "materialType", 
      label: "Material Type", 
      type: "select", 
      required: true,
      options: [
        { value: "Block Type", label: "Block Type" },
        { value: "DST Type", label: "DST Type" },
        { value: "Foil Type", label: "Foil Type" },
        { value: "Magnet", label: "Magnet" },
        { value: "Plate Type", label: "Plate Type" },
        { value: "Positives", label: "Positives" }
      ]
    },
    { name: "materialName", label: "Material Name", type: "text", required: true },
    { name: "company", label: "Company", type: "select", required: true, options: [] },
    { name: "rate", label: "Rate (INR)", type: "number", required: true },
    { name: "quantity", label: "Quantity", type: "number", required: true },
  ],
  DIMENSIONS_COSTS: [
    { name: "sizeL", label: "Size (L in cm)", type: "number", required: true },
    { name: "sizeB", label: "Size (B in cm)", type: "number", required: true },
    { name: "courier", label: "Courier Cost (INR)", type: "number", required: true },
    { name: "markUp", label: "Mark Up", type: "number", required: true },
  ],
  CALCULATED_VALUES: [
    { name: "area", label: "Area (calculated)", type: "text", readOnly: true },
    { name: "landedCost", label: "Landed Cost (calculated)", type: "text", readOnly: true },
    { name: "costPerUnit", label: "Cost/Unit (calculated)", type: "text", readOnly: true },
    { name: "finalCostPerUnit", label: "Final Cost/Unit (calculated)", type: "text", readOnly: true },
  ]
};