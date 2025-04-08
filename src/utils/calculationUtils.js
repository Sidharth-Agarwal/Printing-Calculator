/**
 * calculationUtils.js
 * Shared utilities for consistent calculations between components and Firebase
 */

// Safe number conversion that handles all input types
export const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  // Format to 2 decimal places as string
  export const format = (num) => {
    const value = safeNumber(num);
    return value.toFixed(2);
  };
  
  /**
   * Central calculation function used by both components
   * @param {Object} calculations - The base calculations object
   * @param {number|string} quantity - Order quantity
   * @param {number|string} miscCharge - Miscellaneous charge per card
   * @param {number|string} markupPercentage - Markup percentage
   * @returns {Object} - Enhanced calculations object
   */
  export const calculateEnhancedValues = (calculations, quantity, miscCharge = 5, markupPercentage = 20) => {
    // Safety check - if no calculations provided, return basic structure
    if (!calculations) {
      return {
        baseCost: "0.00",
        miscChargePerCard: format(miscCharge),
        baseWithMisc: format(miscCharge),
        wastagePercentage: 5,
        wastageAmount: "0.00",
        overheadPercentage: 35,
        overheadAmount: "0.00",
        markupPercentage: markupPercentage,
        markupType: "STANDARD",
        markupAmount: "0.00",
        subtotalPerCard: "0.00",
        totalCostPerCard: "0.00",
        totalCost: "0.00",
        quantity: parseInt(quantity) || 0,
        calculatedAt: new Date().toISOString()
      };
    }
    
    // Extract important values with safe conversion
    const paperCostPerCard = safeNumber(calculations.paperCostPerCard);
    const cuttingCostPerCard = safeNumber(calculations.cuttingCostPerCard);
    const gilCutCostPerCard = safeNumber(calculations.gilCutCostPerCard);
    const paperAndCuttingCostPerCard = safeNumber(calculations.paperAndCuttingCostPerCard);
    
    const lpPlateCostPerCard = safeNumber(calculations.lpPlateCostPerCard);
    const lpMRCostPerCard = safeNumber(calculations.lpMRCostPerCard);
    const lpImpressionAndLaborCostPerCard = safeNumber(calculations.lpImpressionAndLaborCostPerCard);
    const lpCostPerCard = safeNumber(calculations.lpCostPerCard);
    
    const fsBlockCostPerCard = safeNumber(calculations.fsBlockCostPerCard);
    const fsFoilCostPerCard = safeNumber(calculations.fsFoilCostPerCard);
    const fsMRCostPerCard = safeNumber(calculations.fsMRCostPerCard);
    const fsImpressionCostPerCard = safeNumber(calculations.fsImpressionCostPerCard);
    const fsCostPerCard = safeNumber(calculations.fsCostPerCard);
    
    const embPlateCostPerCard = safeNumber(calculations.embPlateCostPerCard);
    const embMRCostPerCard = safeNumber(calculations.embMRCostPerCard);
    const embCostPerCard = safeNumber(calculations.embCostPerCard);
    
    const dieCuttingCostPerCard = safeNumber(calculations.dieCuttingCostPerCard);
    const dcImpressionCostPerCard = safeNumber(calculations.dcImpressionCostPerCard);
    const dcMRCostPerCard = safeNumber(calculations.dcMRCostPerCard);
    const pdcCostPerCard = safeNumber(calculations.pdcCostPerCard);
    
    const digiCostPerCard = safeNumber(calculations.digiCostPerCard);
    
    const lpCostPerCardSandwich = safeNumber(calculations.lpCostPerCardSandwich);
    const lpPlateCostPerCardSandwich = safeNumber(calculations.lpPlateCostPerCardSandwich);
    const lpMRCostPerCardSandwich = safeNumber(calculations.lpMRCostPerCardSandwich);
    const lpImpressionAndLaborCostPerCardSandwich = safeNumber(calculations.lpImpressionAndLaborCostPerCardSandwich);
    
    const fsCostPerCardSandwich = safeNumber(calculations.fsCostPerCardSandwich);
    const fsBlockCostPerCardSandwich = safeNumber(calculations.fsBlockCostPerCardSandwich);
    const fsFoilCostPerCardSandwich = safeNumber(calculations.fsFoilCostPerCardSandwich);
    const fsMRCostPerCardSandwich = safeNumber(calculations.fsMRCostPerCardSandwich);
    const fsImpressionCostPerCardSandwich = safeNumber(calculations.fsImpressionCostPerCardSandwich);
    
    const embCostPerCardSandwich = safeNumber(calculations.embCostPerCardSandwich);
    const embPlateCostPerCardSandwich = safeNumber(calculations.embPlateCostPerCardSandwich);
    const embMRCostPerCardSandwich = safeNumber(calculations.embMRCostPerCardSandwich);
    
    const pastingCostPerCard = safeNumber(calculations.pastingCostPerCard);
    
    // Calculate base cost - Sum of all processing costs
    const baseCost = 
      paperAndCuttingCostPerCard + 
      lpCostPerCard + 
      fsCostPerCard + 
      embCostPerCard + 
      digiCostPerCard + 
      dieCuttingCostPerCard + 
      lpCostPerCardSandwich + 
      fsCostPerCardSandwich + 
      embCostPerCardSandwich + 
      pastingCostPerCard;
    
    // Convert quantity, misc charge and markup to numbers
    const numQuantity = parseInt(quantity) || 0;
    const numMiscCharge = safeNumber(miscCharge);
    const numMarkupPercentage = safeNumber(markupPercentage);
    
    // Add miscellaneous charge
    const baseWithMisc = baseCost + numMiscCharge;
    
    // Calculate wastage (5%)
    const wastageAmount = baseWithMisc * 0.05;
    
    // Calculate overhead (35%)
    const overheadAmount = baseWithMisc * 0.35;
    
    // Calculate subtotal
    const subtotal = baseWithMisc + wastageAmount + overheadAmount;
    
    // Calculate markup
    const markupAmount = subtotal * (numMarkupPercentage / 100);
    
    // Calculate total per card
    const totalPerCard = subtotal + markupAmount;
    
    // Calculate total for order
    const totalCost = totalPerCard * numQuantity;
    
    // Return comprehensive enhanced calculations object
    return {
      // Main calculation components
      baseCost: format(baseCost),
      miscChargePerCard: format(numMiscCharge),
      baseWithMisc: format(baseWithMisc),
      
      // Wastage
      wastagePercentage: 5,
      wastageAmount: format(wastageAmount),
      
      // Overhead
      overheadPercentage: 35,
      overheadAmount: format(overheadAmount),
      
      // Markup
      markupPercentage: numMarkupPercentage,
      markupType: "STANDARD",
      markupAmount: format(markupAmount),
      
      // Totals
      subtotalPerCard: format(subtotal),
      totalCostPerCard: format(totalPerCard),
      totalCost: format(totalCost),
      
      // Order quantity
      quantity: numQuantity,
      
      // COMPONENT COSTS - all safely converted and formatted
      // Paper & Cutting details
      paperCostPerCard: format(paperCostPerCard),
      cuttingCostPerCard: format(cuttingCostPerCard),
      gilCutCostPerCard: format(gilCutCostPerCard),
      paperAndCuttingCostPerCard: format(paperAndCuttingCostPerCard),
      
      // Letter Press details
      lpPlateCostPerCard: format(lpPlateCostPerCard),
      lpMRCostPerCard: format(lpMRCostPerCard),
      lpImpressionAndLaborCostPerCard: format(lpImpressionAndLaborCostPerCard),
      lpCostPerCard: format(lpCostPerCard),
      
      // Foil Stamping details
      fsBlockCostPerCard: format(fsBlockCostPerCard),
      fsFoilCostPerCard: format(fsFoilCostPerCard),
      fsMRCostPerCard: format(fsMRCostPerCard),
      fsImpressionCostPerCard: format(fsImpressionCostPerCard),
      fsCostPerCard: format(fsCostPerCard),
      
      // Embossing details
      embPlateCostPerCard: format(embPlateCostPerCard),
      embMRCostPerCard: format(embMRCostPerCard),
      embCostPerCard: format(embCostPerCard),
      
      // Die Cutting details
      dcImpressionCostPerCard: format(dcImpressionCostPerCard),
      dcMRCostPerCard: format(dcMRCostPerCard), 
      pdcCostPerCard: format(pdcCostPerCard),
      dieCuttingCostPerCard: format(dieCuttingCostPerCard),
      
      // Digital Printing details
      digiCostPerCard: format(digiCostPerCard),
      
      // Sandwich component details
      lpCostPerCardSandwich: format(lpCostPerCardSandwich),
      lpPlateCostPerCardSandwich: format(lpPlateCostPerCardSandwich),
      lpMRCostPerCardSandwich: format(lpMRCostPerCardSandwich),
      lpImpressionAndLaborCostPerCardSandwich: format(lpImpressionAndLaborCostPerCardSandwich),
      
      fsCostPerCardSandwich: format(fsCostPerCardSandwich),
      fsBlockCostPerCardSandwich: format(fsBlockCostPerCardSandwich),
      fsFoilCostPerCardSandwich: format(fsFoilCostPerCardSandwich),
      fsMRCostPerCardSandwich: format(fsMRCostPerCardSandwich),
      fsImpressionCostPerCardSandwich: format(fsImpressionCostPerCardSandwich),
      
      embCostPerCardSandwich: format(embCostPerCardSandwich),
      embPlateCostPerCardSandwich: format(embPlateCostPerCardSandwich),
      embMRCostPerCardSandwich: format(embMRCostPerCardSandwich),
      
      // Pasting details
      pastingCostPerCard: format(pastingCostPerCard),
      
      // Add timestamp
      calculatedAt: new Date().toISOString()
    };
};