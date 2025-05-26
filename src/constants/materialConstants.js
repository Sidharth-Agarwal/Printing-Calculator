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
  ],
  // New stock tracking fields
  STOCK_MANAGEMENT: [
    { name: "skuCode", label: "SKU Code", type: "text", readOnly: true, placeholder: "Auto-generated" },
    { name: "initialStock", label: "Initial Stock", type: "number", required: true, placeholder: "Enter initial quantity" },
    { name: "minStockLevel", label: "Min Stock Alert", type: "number", required: true, placeholder: "Low stock threshold" },
    { name: "maxStockLevel", label: "Max Stock Level", type: "number", placeholder: "Maximum stock capacity" },
    { 
      name: "stockLocation", 
      label: "Stock Location", 
      type: "select", 
      required: true,
      options: [
        { value: "Warehouse A", label: "Warehouse A" },
        { value: "Warehouse B", label: "Warehouse B" },
        { value: "Production Floor", label: "Production Floor" },
        { value: "Storage Room", label: "Storage Room" },
        { value: "Office Stock", label: "Office Stock" }
      ]
    },
    { 
      name: "unitOfMeasure", 
      label: "Unit of Measure", 
      type: "select", 
      required: true,
      options: [
        { value: "sqcm", label: "Square CM (Area)" },
        { value: "pieces", label: "Pieces" },
        { value: "kg", label: "Kilograms" },
        { value: "meters", label: "Meters" },
        { value: "rolls", label: "Rolls" }
      ]
    }
  ]
};

// Stock status constants
export const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK", 
  OUT_OF_STOCK: "OUT_OF_STOCK",
  OVERSTOCK: "OVERSTOCK"
};

// Helper function to determine stock status
export const getStockStatus = (currentStock, minStockLevel, maxStockLevel) => {
  const current = parseFloat(currentStock) || 0;
  const min = parseFloat(minStockLevel) || 0;
  const max = parseFloat(maxStockLevel) || 999999;
  
  if (current <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (current <= min) return STOCK_STATUS.LOW_STOCK;
  if (current >= max) return STOCK_STATUS.OVERSTOCK;
  return STOCK_STATUS.IN_STOCK;
};

// Helper function to get stock status display info
export const getStockStatusInfo = (status) => {
  switch (status) {
    case STOCK_STATUS.OUT_OF_STOCK:
      return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: "⚠️" };
    case STOCK_STATUS.LOW_STOCK:
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: "⚡" };
    case STOCK_STATUS.OVERSTOCK:
      return { label: "Overstock", color: "bg-purple-100 text-purple-800", icon: "📦" };
    case STOCK_STATUS.IN_STOCK:
    default:
      return { label: "In Stock", color: "bg-green-100 text-green-800", icon: "✅" };
  }
};

// SKU generation helper
export const generateMaterialSKU = async (materialType, company, existingSkus = []) => {
  // Clean and format the prefix
  const typePrefix = materialType.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const companyPrefix = company.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  
  const prefix = `MAT-${typePrefix}-${companyPrefix}`;
  
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