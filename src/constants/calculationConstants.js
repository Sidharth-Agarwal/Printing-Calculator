/**
 * Constants used in cost calculations throughout the application
 */

// Conversion factors
export const INCH_TO_CM = 2.54; // 1 inch = 2.54 cm
export const MARGIN_ADDITION = 2; // 2cm margin addition

// Percentages
export const WASTAGE_PERCENTAGE = 5; // 5% wastage
export const OVERHEAD_PERCENTAGE = 35; // 35% overhead
export const DEFAULT_MARKUP_PERCENTAGE = 15; // 15% default markup

// Fixed charges
export const MISC_CHARGE_PER_CARD = 5; // 5 rupees miscellaneous charge per card
export const CUTTING_COST_PER_CARD = 0.10; // ₹0.10 per card
export const GIL_CUT_COST_PER_PAPER = 0.25; // ₹0.25 per paper

// Impression costs
export const LP_IMPRESSION_COST = 0.50; // ₹0.50 per impression
export const LP_LABOR_COST = 1.00; // ₹1.00 labor cost
export const LP_COLOR_COST = 1.00; // ₹1.00 per color
export const FS_IMPRESSION_COST = 1.00; // ₹1.00 per impression
export const DC_IMPRESSION_COST = 0.25; // ₹0.25 per impression

// MR rates (fallback values if not fetched from Firebase)
export const MR_RATES = {
  SIMPLE: 50, // ₹50 for simple MR
  COMPLEX: 100, // ₹100 for complex MR
  SUPER_COMPLEX: 150, // ₹150 for super complex MR
};