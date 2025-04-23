// src/components/BillingForm/Services/Calculations/calculators/finalCalculator/gstCalculator.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';

/**
 * GST Rate mapping based on job types
 * These are default rates that will be used if database values aren't found
 */
const DEFAULT_GST_RATES = {
  "Card": 18,         // Standard GST for cards
  "Biz Card": 18,     // Business cards
  "Envelope": 18,     // Envelopes
  "Seal": 18,         // Seals
  "Magnet": 18,       // Magnets
  "Packaging": 18,    // Packaging
  "Notebook": 18,     // Notebooks
  "Custom": 18,       // Custom jobs
  "Other": 18         // Default rate for other job types
};

/**
 * Fetches GST rate from standard_rates collection based on job type
 * @param {string} jobType - Type of job (Card, Folder, Box, etc.)
 * @returns {Promise<number>} - GST percentage for the job type
 */
const fetchGSTRate = async (jobType) => {
  try {
    // Normalize the job type
    const normalizedType = jobType?.trim().toUpperCase() || 'CARD';
    
    // Query the standard_rates collection for GST rate
    const standardRatesCollection = collection(db, "standard_rates");
    const q = query(
      standardRatesCollection, 
      where("group", "==", "GST"),
      where("type", "==", normalizedType)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the first matching record
      const gstRate = querySnapshot.docs[0].data();
      
      // Use percentage field for GST
      if (gstRate.percentage) {
        return parseFloat(gstRate.percentage);
      }
      
      // Fallback to finalRate if percentage is not available
      if (gstRate.finalRate) {
        return parseFloat(gstRate.finalRate);
      }
    }
    
    // If no matching record found, try to find a default GST rate
    const defaultQuery = query(
      standardRatesCollection, 
      where("group", "==", "GST"),
      where("type", "==", "CARD") // Using CARD as the default
    );
    
    const defaultSnapshot = await getDocs(defaultQuery);
    if (!defaultSnapshot.empty) {
      const defaultRate = defaultSnapshot.docs[0].data();
      if (defaultRate.percentage) {
        console.log(`No GST rate found for ${jobType}, using default GST CARD: ${defaultRate.percentage}%`);
        return parseFloat(defaultRate.percentage);
      }
    }
    
    // If still not found, use hardcoded default
    console.log(`No GST rate found in database for ${jobType}, using hardcoded default: ${DEFAULT_GST_RATES[jobType] || DEFAULT_GST_RATES["Other"]}%`);
    return DEFAULT_GST_RATES[jobType] || DEFAULT_GST_RATES["Other"];
  } catch (error) {
    console.error("Error fetching GST rate:", error);
    // Return default in case of error
    return DEFAULT_GST_RATES[jobType] || DEFAULT_GST_RATES["Other"];
  }
};

/**
 * Calculates GST amount based on the total cost and job type
 * @param {number} totalCost - The total cost before GST
 * @param {string} jobType - Type of job (Card, Folder, Box, etc.)
 * @returns {Promise<Object>} - GST calculation details
 */
export const calculateGST = async (totalCost, jobType = "Card") => {
  try {
    // Fetch the appropriate GST rate for this job type
    const gstRate = await fetchGSTRate(jobType);
    
    // Calculate GST amount
    const gstAmount = totalCost * (gstRate / 100);
    
    // Calculate total with GST
    const totalWithGST = totalCost + gstAmount;
    
    return {
      gstRate,
      gstAmount: gstAmount.toFixed(2),
      totalWithGST: totalWithGST.toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating GST:", error);
    // Return default values in case of error
    const defaultRate = DEFAULT_GST_RATES[jobType] || DEFAULT_GST_RATES["Other"];
    const defaultGST = totalCost * (defaultRate / 100);
    
    return {
      gstRate: defaultRate,
      gstAmount: defaultGST.toFixed(2),
      totalWithGST: (totalCost + defaultGST).toFixed(2),
      success: false,
      error: "Failed to calculate GST"
    };
  }
};