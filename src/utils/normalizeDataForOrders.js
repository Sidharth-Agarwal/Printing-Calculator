/**
 * Normalize estimate data for consistent order processing
 * Adds compatibility for B2B loyalty program
 * 
 * @param {Object} estimate - The estimate data from Firestore
 * @returns {Object} - Normalized data for order creation
 */
export const normalizeDataForOrders = (estimate) => {
  if (!estimate) {
    return null;
  }
  
  // Initialize normalized structure
  const normalizedData = {
    // Preserve original estimate ID for reference
    estimateId: estimate.id,
    
    // Client information
    clientId: estimate.clientId || null,
    clientInfo: estimate.clientInfo || null,
    clientName: estimate.clientName || null,
    
    // Project information
    projectName: estimate.projectName || null,
    date: new Date().toISOString(),
    deliveryDate: estimate.deliveryDate || null,
    
    // Track order status
    stage: "Not started yet",
    status: "In Progress",
    
    // Form data fields - ensure consistent structure
    jobDetails: estimate.jobDetails || {},
    dieDetails: estimate.dieDetails || {},
    lpDetails: estimate.lpDetails || null,
    fsDetails: estimate.fsDetails || null,
    embDetails: estimate.embDetails || null,
    digiDetails: estimate.digiDetails || null,
    screenPrint: estimate.screenPrint || null,
    dieCutting: estimate.dieCutting || null,
    postDC: estimate.postDC || null,
    qc: estimate.qc || null,
    packing: estimate.packing || null,
    misc: estimate.misc || null,
    sandwich: estimate.sandwich || null,
    foldAndPaste: estimate.foldAndPaste || null,
    dstPaste: estimate.dstPaste || null,
    magnet: estimate.magnet || null,
    
    // Calculations/costs
    calculations: estimate.calculations || {},
    
    // NEW: Loyalty information fields
    isLoyaltyEligible: false, // Will be set to true for B2B clients
    loyaltyInfo: null, // Will hold loyalty tier and discount details
    
    // Track history
    created: {
      at: new Date().toISOString(),
      from: "estimate",
      estimateId: estimate.id
    },
    
    // Timestamp for sorting/filtering
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Check if B2B client based on client type
  if (estimate.clientInfo && estimate.clientInfo.clientType === "B2B") {
    normalizedData.isLoyaltyEligible = true;
  }
  
  return normalizedData;
};

/**
 * Normalize data for consistent display in details modals
 * Adds compatibility for loyalty program display
 * 
 * @param {Object} data - The data to normalize (estimate, order, etc.)
 * @returns {Object} - Normalized data for display
 */
export const normalizeDataForDisplay = (data) => {
  if (!data) {
    return null;
  }
  
  // Make a copy to avoid modifying original
  const normalizedData = { ...data };
  
  // Ensure client info exists
  if (!normalizedData.clientInfo) {
    normalizedData.clientInfo = {
      name: normalizedData.clientName || "Unknown Client"
    };
  }
  
  // Ensure calculations object exists
  if (!normalizedData.calculations) {
    normalizedData.calculations = {};
  }
  
  // Normalize loyalty information for display
  if (normalizedData.loyaltyInfo) {
    // Copy loyalty discount info to calculations for display in cost breakdown
    if (!normalizedData.calculations.loyaltyDiscount && normalizedData.loyaltyInfo.discount) {
      normalizedData.calculations.loyaltyDiscount = normalizedData.loyaltyInfo.discount;
    }
    
    if (!normalizedData.calculations.loyaltyDiscountAmount && normalizedData.loyaltyInfo.discountAmount) {
      normalizedData.calculations.loyaltyDiscountAmount = normalizedData.loyaltyInfo.discountAmount;
    }
    
    if (!normalizedData.calculations.loyaltyTierName && normalizedData.loyaltyInfo.tierName) {
      normalizedData.calculations.loyaltyTierName = normalizedData.loyaltyInfo.tierName;
    }
  }
  
  return normalizedData;
};

/**
 * Format loyalty tier information for display
 * 
 * @param {Object} tier - The loyalty tier object
 * @returns {Object} - Formatted tier information
 */
export const formatTierForDisplay = (tier) => {
  if (!tier) return null;
  
  return {
    id: tier.id || tier.dbId,
    name: tier.name,
    discount: tier.discount || 0,
    color: tier.color || "#CCCCCC",
    orderThreshold: tier.orderThreshold
  };
};