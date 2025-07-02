/**
 * Helper function to get margin values based on job type
 * @param {string} jobType - The job type (e.g., "Envelope", "Card", etc.)
 * @returns {Object} - Object containing length and breadth margins in cm
 */
export const getMarginsByJobType = (jobType) => {
  const normalizedJobType = (jobType || "").toLowerCase();
  
  if (normalizedJobType === "envelope") {
    return {
      lengthMargin: 1.5,
      breadthMargin: 1.5
    };
  } else {
    // For all other job types (Card, Biz Card, Seal, Magnet, Packaging, Notebook, Liner, Custom, etc.)
    return {
      lengthMargin: 2.0,
      breadthMargin: 2.0
    };
  }
};

/**
 * Helper function to get legacy single margin value for backward compatibility
 * This can be used where you need a single margin value instead of separate length/breadth
 * @param {string} jobType - The job type
 * @returns {number} - Single margin value (uses lengthMargin as default)
 */
export const getSingleMargin = (jobType) => {
  const margins = getMarginsByJobType(jobType);
  return margins.lengthMargin; // Use length margin as the default single value
};