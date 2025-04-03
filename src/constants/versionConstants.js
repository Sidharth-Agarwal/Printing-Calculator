// src/constants/versionConstants.js

/**
 * Constants related to estimate versioning
 */

// Maximum number of versions to keep in the version history
export const MAX_VERSION_HISTORY = 20;

// Types of version changes
export const VERSION_CHANGE_TYPE = {
  MINOR: 'minor', // Small changes (e.g., correcting typos, minor price adjustments)
  MAJOR: 'major', // Significant changes (e.g., changing quantities, adding new processes)
  INITIAL: 'initial' // First version
};

// Version display format options
export const VERSION_DISPLAY_FORMAT = {
  NUMERIC: 'numeric', // e.g., "1.0", "1.1", "2.0"
  REVISION: 'revision' // e.g., "Rev 1", "Rev 2", "Rev 3"
};

// Default version display format
export const DEFAULT_VERSION_FORMAT = VERSION_DISPLAY_FORMAT.NUMERIC;

// Default initial version number
export const INITIAL_VERSION = 1;

// Fields to track for version changes (for history)
export const VERSION_TRACKED_FIELDS = [
  'clientInfo',
  'orderAndPaper.quantity',
  'orderAndPaper.paperName',
  'orderAndPaper.jobType',
  'orderAndPaper.dieCode',
  'lpDetails.isLPUsed',
  'fsDetails.isFSUsed',
  'embDetails.isEMBUsed',
  'digiDetails.isDigiUsed',
  'dieCutting.isDieCuttingUsed',
  'sandwich.isSandwichComponentUsed',
  'pasting.isPastingUsed',
  'calculations.markupPercentage'
];

// Comparison threshold for detecting significant changes
export const SIGNIFICANT_CHANGE_THRESHOLD = {
  QUANTITY: 0.1, // 10% change in quantity
  PRICE: 0.05    // 5% change in price
};