/**
 * Utility functions to normalize data between estimates and orders
 */

/**
 * Normalizes an estimate object before converting to an order
 * Ensures all service flags are properly set based on calculation data
 * @param {Object} estimate - The estimate data object
 * @returns {Object} - Normalized estimate data
 */
export function normalizeDataForOrders(estimate) {
    // Make a deep copy to avoid modifying original
    const normalized = JSON.parse(JSON.stringify(estimate));
    
    // Define all possible services and their toggle flags
    const serviceFlags = [
      { key: 'lpDetails', flag: 'isLPUsed' },
      { key: 'fsDetails', flag: 'isFSUsed' },
      { key: 'embDetails', flag: 'isEMBUsed' },
      { key: 'digiDetails', flag: 'isDigiUsed' },
      { key: 'screenPrint', flag: 'isScreenPrintUsed' },
      { key: 'dieCutting', flag: 'isDieCuttingUsed' },
      { key: 'postDC', flag: 'isPostDCUsed' },
      { key: 'foldAndPaste', flag: 'isFoldAndPasteUsed' },
      { key: 'dstPaste', flag: 'isDstPasteUsed' },
      { key: 'qc', flag: 'isQCUsed' },
      { key: 'packing', flag: 'isPackingUsed' },
      { key: 'misc', flag: 'isMiscUsed' },
      { key: 'sandwich', flag: 'isSandwichComponentUsed' },
      { key: 'magnet', flag: 'isMagnetUsed' }
    ];
    
    // Check calculations exists
    if (!normalized.calculations) {
      normalized.calculations = {};
    }
    
    // Normalize each service
    serviceFlags.forEach(({ key, flag }) => {
      // Generate the cost key (e.g., 'lpDetails' -> 'lpCostPerCard')
      const costKey = `${key.replace('Details', '')}CostPerCard`;
      
      // If calculation exists but service doesn't, create it
      if (normalized.calculations[costKey] && !normalized[key]) {
        normalized[key] = { [flag]: true };
        console.log(`Normalizing data: Created missing service ${key} with ${flag}=true`);
      }
      // If service exists but flag is undefined, set it to true if cost exists
      else if (normalized[key] && normalized[key][flag] === undefined) {
        if (normalized.calculations[costKey]) {
          normalized[key][flag] = true;
          console.log(`Normalizing data: Set undefined flag ${flag} to true for ${key}`);
        } else {
          normalized[key][flag] = false;
          console.log(`Normalizing data: Set undefined flag ${flag} to false for ${key}`);
        }
      }
      // If service exists but flag is false, check if cost exists (potential mismatch)
      else if (normalized[key] && normalized[key][flag] === false && normalized.calculations[costKey]) {
        normalized[key][flag] = true;
        console.log(`Normalizing data: Fixed mismatched flag for ${key} (had cost but flag was false)`);
      }
    });
    
    return normalized;
  }
  
  /**
   * Normalize any display data for consistent UI rendering
   * This function can be used in the modal component
   * @param {Object} data - The data object (estimate, order, or invoice)
   * @returns {Object} - Normalized data for display
   */
  export function normalizeDataForDisplay(data) {
    if (!data) return data;
    
    // Make a deep copy to avoid modifying original
    const normalizedCopy = JSON.parse(JSON.stringify(data));
    
    // Define all possible services and their toggle flags
    const serviceFlags = [
      { key: 'lpDetails', flag: 'isLPUsed' },
      { key: 'fsDetails', flag: 'isFSUsed' },
      { key: 'embDetails', flag: 'isEMBUsed' },
      { key: 'digiDetails', flag: 'isDigiUsed' },
      { key: 'screenPrint', flag: 'isScreenPrintUsed' },
      { key: 'dieCutting', flag: 'isDieCuttingUsed' },
      { key: 'postDC', flag: 'isPostDCUsed' },
      { key: 'foldAndPaste', flag: 'isFoldAndPasteUsed' },
      { key: 'dstPaste', flag: 'isDstPasteUsed' },
      { key: 'qc', flag: 'isQCUsed' },
      { key: 'packing', flag: 'isPackingUsed' },
      { key: 'misc', flag: 'isMiscUsed' },
      { key: 'sandwich', flag: 'isSandwichComponentUsed' },
      { key: 'magnet', flag: 'isMagnetUsed' }
    ];
    
    // Ensure each service exists and has its toggle flag
    serviceFlags.forEach(({ key, flag }) => {
      // Get the corresponding cost key
      const costKey = `${key.replace('Details', '')}CostPerCard`;
      
      // If the service doesn't exist but should be enabled based on calculations
      if (!normalizedCopy[key] && normalizedCopy.calculations?.[costKey]) {
        // Create the service with the proper flag
        normalizedCopy[key] = { [flag]: true };
      }
      // If the service exists but has no flag, ensure it's properly flagged
      else if (normalizedCopy[key] && normalizedCopy[key][flag] === undefined) {
        normalizedCopy[key][flag] = !!normalizedCopy.calculations?.[costKey];
      }
      // Fix mismatched flags (service is marked as not used but has a cost)
      else if (normalizedCopy[key] && normalizedCopy[key][flag] === false && normalizedCopy.calculations?.[costKey]) {
        normalizedCopy[key][flag] = true;
      }
    });
    
    return normalizedCopy;
}