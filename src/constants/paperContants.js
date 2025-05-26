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
  ],
  // New stock tracking fields - Paper specific (in sheets)
  STOCK_MANAGEMENT: [
    { name: "skuCode", label: "SKU Code", type: "text", readOnly: true, placeholder: "Auto-generated" },
    { name: "initialStock", label: "Initial Stock (Sheets)", type: "number", required: true, placeholder: "Enter number of sheets" },
    { name: "minStockLevel", label: "Min Stock Alert (Sheets)", type: "number", required: true, placeholder: "Low stock threshold" },
    { name: "maxStockLevel", label: "Max Stock Level (Sheets)", type: "number", placeholder: "Maximum sheets capacity" },
    { 
      name: "stockLocation", 
      label: "Stock Location", 
      type: "select", 
      required: true,
      options: [
        { value: "Paper Storage A", label: "Paper Storage A" },
        { value: "Paper Storage B", label: "Paper Storage B" },
        { value: "Climate Room", label: "Climate Controlled Room" },
        { value: "Dry Storage", label: "Dry Storage" },
        { value: "Production Floor", label: "Production Floor" }
      ]
    },
    { 
      name: "unitOfMeasure", 
      label: "Unit of Measure", 
      type: "text", 
      readOnly: true,
      value: "sheets" // Fixed for papers
    }
  ]
};

// Stock status constants for papers
export const PAPER_STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK", 
  OUT_OF_STOCK: "OUT_OF_STOCK",
  OVERSTOCK: "OVERSTOCK"
};

// Helper function to determine paper stock status
export const getPaperStockStatus = (currentStock, minStockLevel, maxStockLevel) => {
  const current = parseFloat(currentStock) || 0;
  const min = parseFloat(minStockLevel) || 0;
  const max = parseFloat(maxStockLevel) || 999999;
  
  if (current <= 0) return PAPER_STOCK_STATUS.OUT_OF_STOCK;
  if (current <= min) return PAPER_STOCK_STATUS.LOW_STOCK;
  if (current >= max) return PAPER_STOCK_STATUS.OVERSTOCK;
  return PAPER_STOCK_STATUS.IN_STOCK;
};

// Helper function to get paper stock status display info
export const getPaperStockStatusInfo = (status) => {
  switch (status) {
    case PAPER_STOCK_STATUS.OUT_OF_STOCK:
      return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: "📄❌" };
    case PAPER_STOCK_STATUS.LOW_STOCK:
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: "📄⚡" };
    case PAPER_STOCK_STATUS.OVERSTOCK:
      return { label: "Overstock", color: "bg-purple-100 text-purple-800", icon: "📄📦" };
    case PAPER_STOCK_STATUS.IN_STOCK:
    default:
      return { label: "In Stock", color: "bg-green-100 text-green-800", icon: "📄✅" };
  }
};

// SKU generation helper for papers
export const generatePaperSKU = async (paperName, company, gsm, existingSkus = []) => {
  // Clean and format the prefix
  const namePrefix = paperName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const companyPrefix = company.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const gsmValue = gsm ? gsm.toString() : "000";
  
  const prefix = `PAP-${namePrefix}-${companyPrefix}-${gsmValue}`;
  
  // Find the highest existing number for this prefix
  let highestNum = 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  
  existingSkus.forEach(sku => {
    const match = sku.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1]);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  });
  
  // Generate new SKU with incremented number
  const nextNum = highestNum + 1;
  const paddedNum = nextNum.toString().padStart(3, '0');
  
  return `${prefix}-${paddedNum}`;
};

// Helper function to calculate paper stock area coverage
export const calculatePaperAreaCoverage = (sheets, length, breadth) => {
  const sheetsCount = parseFloat(sheets) || 0;
  const paperLength = parseFloat(length) || 0;
  const paperBreadth = parseFloat(breadth) || 0;
  
  const areaPerSheet = paperLength * paperBreadth; // in sqcm
  const totalArea = sheetsCount * areaPerSheet;
  
  return {
    areaPerSheet: areaPerSheet.toFixed(2),
    totalArea: totalArea.toFixed(2),
    sheetsCount: sheetsCount
  };
};