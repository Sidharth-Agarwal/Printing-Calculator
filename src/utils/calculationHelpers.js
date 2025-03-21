// utils/calculationHelpers.js
/**
 * Helper functions for calculations
 */

import { INCH_TO_CM, MARGIN_ADDITION } from "../constants/calculationConstants";

// Convert inches to centimeters
export const inchesToCm = (inches) => {
  if (!inches) return "";
  const num = parseFloat(inches);
  return isNaN(num) ? "" : (num * INCH_TO_CM).toFixed(2);
};

// Add margin to dimensions
export const addMargin = (dimensions, margin = MARGIN_ADDITION) => {
  if (!dimensions) return { length: "", breadth: "" };
  
  return {
    length: dimensions.length ? (parseFloat(dimensions.length) + margin).toFixed(2) : "",
    breadth: dimensions.breadth ? (parseFloat(dimensions.breadth) + margin).toFixed(2) : ""
  };
};

// Calculate maximum cards per sheet
export const calculateMaxCardsPerSheet = (dieSize, paperSize) => {
  if (!dieSize || !paperSize) return 0;
  if (!dieSize.length || !dieSize.breadth || !paperSize.length || !paperSize.breadth) return 0;
  
  const dieLengthCm = parseFloat(dieSize.length);
  const dieBreadthCm = parseFloat(dieSize.breadth);
  const paperLengthCm = parseFloat(paperSize.length);
  const paperBreadthCm = parseFloat(paperSize.breadth);
  
  if (isNaN(dieLengthCm) || isNaN(dieBreadthCm) || isNaN(paperLengthCm) || isNaN(paperBreadthCm)) return 0;
  
  // Calculate in both orientations
  const landscape = Math.floor(paperLengthCm / dieLengthCm) * Math.floor(paperBreadthCm / dieBreadthCm);
  const portrait = Math.floor(paperLengthCm / dieBreadthCm) * Math.floor(paperBreadthCm / dieLengthCm);
  
  return Math.max(landscape, portrait);
};

// Calculate area (length * breadth)
export const calculateArea = (length, breadth) => {
  if (!length || !breadth) return 0;
  const l = parseFloat(length);
  const b = parseFloat(breadth);
  return isNaN(l) || isNaN(b) ? 0 : l * b;
};