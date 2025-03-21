/**
 * Form field configurations for various form components
 */

export const DIE_FORM_FIELDS = [
    { label: "Job Type", name: "jobType", type: "select", options: ["Card", "Biz Card", "Magnet", "Envelope"] },
    { label: "Type", name: "type", type: "text", placeholder: "Enter the type of the die" },
    { label: "Die Code", name: "dieCode", type: "text", placeholder: "Enter die code" },
    { label: "Frags", name: "frags", type: "number", placeholder: "Enter number of frags" },
    { label: "Product Size L (in)", name: "productSizeL", type: "number", placeholder: "Enter length of the product" },
    { label: "Product Size B (in)", name: "productSizeB", type: "number", placeholder: "Enter breadth of the product" },
    { label: "Die Size L (in)", name: "dieSizeL", type: "number", placeholder: "Enter length of the die" },
    { label: "Die Size B (in)", name: "dieSizeB", type: "number", placeholder: "Enter breadth of the die" },
    { label: "Price (INR)", name: "price", type: "number", placeholder: "Enter price of the die" }
];
  
export const MATERIAL_FORM_FIELDS = [
    { label: "Material Type", name: "materialType", placeholder: "Enter the type of the material", type: "text" },
    { label: "Material Name", name: "materialName", placeholder: "Enter the name of the material", type: "text" },
    { label: "Rate (INR)", name: "rate", placeholder: "Enter the rate of the material", type: "number" },
    { label: "Quantity", name: "quantity", placeholder: "Enter the quantity", type: "number" },
    { label: "Size (L in cm)", name: "sizeL", placeholder: "Enter the length", type: "number" },
    { label: "Size (B in cm)", name: "sizeB", placeholder: "Enter the breadth", type: "number" },
    { label: "Courier Cost (INR)", name: "courier", placeholder: "Enter the cost of the courier", type: "number" },
    { label: "Mark Up", name: "markUp", placeholder: "Enter mark up value", type: "number" },
    { label: "Area (calculated)", name: "area", placeholder: "", type: "text", readOnly: true },
    { label: "Landed Cost (calculated)", name: "landedCost", placeholder: "", type: "text", readOnly: true },
    { label: "Cost/Unit (calculated)", name: "costPerUnit", placeholder: "", type: "text", readOnly: true },
    { label: "Final Cost/Unit (calculated)", name: "finalCostPerUnit", placeholder: "", type: "text", readOnly: true }
];
  
export const PAPER_FORM_FIELDS = [
    { label: "Paper Name", placeholder: "Enter the name of the paper", name: "paperName", type: "text" },
    { label: "Company", placeholder: "Enter the name of the company", name: "company", type: "text" },
    { label: "GSM", placeholder: "Enter the GSM information", name: "gsm", type: "number" },
    { label: "Price/Sheet (INR)", placeholder: "Enter the Price/Sheet", name: "pricePerSheet", type: "number" },
    { label: "Length (CM)", placeholder: "Enter the length of the paper", name: "length", type: "number" },
    { label: "Breadth (CM)", placeholder: "Enter the breadth of the paper", name: "breadth", type: "number" },
    { label: "Freight/KG (INR)", placeholder: "Enter the freight/KG of the paper", name: "freightPerKg", type: "number" },
    { label: "Rate/Gram (INR)", name: "ratePerGram", type: "text", readOnly: true },
    { label: "Area (sqcm)", name: "area", type: "text", readOnly: true },
    { label: "1 Sqcm in Gram", name: "oneSqcmInGram", type: "text", readOnly: true },
    { label: "GSM/Sheet", name: "gsmPerSheet", type: "text", readOnly: true },
    { label: "Freight/Sheet (INR)", name: "freightPerSheet", type: "text", readOnly: true },
    { label: "Final Rate (INR)", name: "finalRate", type: "text", readOnly: true }
];
  
export const STANDARD_RATE_FORM_FIELDS = [
    { label: "Group", name: "group", placeholder: "Enter group name", type: "text" },
    { label: "Type", name: "type", placeholder: "Enter type name", type: "text" },
    { label: "Concatenate", name: "concatenate", type: "text", readOnly: true },
    { label: "Final Rate (INR)", name: "finalRate", placeholder: "Enter rate", type: "number" }
];
  
export const ORDER_AND_PAPER_FIELDS = [
    { label: "Client Name", name: "clientName", type: "text", placeholder: "Enter the client name", required: true },
    { label: "Project Name", name: "projectName", type: "text", placeholder: "Enter the project name", required: true },
    { label: "Date", name: "date", type: "date", required: true },
    { label: "Estimated Delivery Date", name: "deliveryDate", type: "date", required: true },
    { label: "Job Type", name: "jobType", type: "select", options: "JOB_TYPE_OPTIONS", required: true },
    { label: "Quantity", name: "quantity", type: "number", placeholder: "Enter the required quantity", required: true },
    { label: "Paper Provided", name: "paperProvided", type: "select", options: "PAPER_PROVIDED_OPTIONS", required: true },
    { label: "Paper Name", name: "paperName", type: "select", optionsFrom: "papers", required: true },
    { label: "Die Selection", name: "dieSelection", type: "button", action: "selectDie", required: false },
    { label: "Die Code", name: "dieCode", type: "text", readOnly: true, required: false },
    { label: "Die Size", name: "dieSize", type: "dimensions", unit: "in", readOnly: true, required: false }
];