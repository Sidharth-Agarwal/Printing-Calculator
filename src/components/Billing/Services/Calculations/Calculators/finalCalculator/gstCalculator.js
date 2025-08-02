import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';
import { calculatePercentage, addCurrency } from '../../../../../../utils/calculationValidator';

/**
 * Fetches GST rate from gst_and_hsn collection based on job type
 * @param {string} jobType - Type of job (Card, Folder, Box, etc.)
 * @returns {Promise<number>} - GST percentage for the job type
 */
export const fetchGSTRate = async (jobType) => {
  try {
    const normalizedType = jobType?.trim().toUpperCase() || 'CARD';
    
    const gstHsnCollection = collection(db, "gst_and_hsn");
    const q = query(
      gstHsnCollection, 
      where("group", "==", "GST"),
      where("type", "==", normalizedType)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const gstRate = querySnapshot.docs[0].data();
      if (gstRate.value) {
        console.log(`Found GST rate for ${normalizedType}: ${gstRate.value}%`);
        return parseFloat(gstRate.value);
      }
    }
    
    // If no matching record found, try to find a default CARD entry
    if (normalizedType !== 'CARD') {
      console.log(`No GST rate found for ${normalizedType}, trying CARD as fallback`);
      const defaultQuery = query(
        gstHsnCollection, 
        where("group", "==", "GST"),
        where("type", "==", "CARD")
      );
      
      const defaultSnapshot = await getDocs(defaultQuery);
      if (!defaultSnapshot.empty) {
        const defaultRate = defaultSnapshot.docs[0].data();
        if (defaultRate.value) {
          console.log(`Using CARD GST rate as fallback: ${defaultRate.value}%`);
          return parseFloat(defaultRate.value);
        }
      }
    }
    
    // If still not found, throw an error instead of using hardcoded value
    throw new Error(`No GST rate found in database for job type: ${jobType}. Please configure GST rates in the gst_and_hsn collection.`);
    
  } catch (error) {
    console.error("Error fetching GST rate:", error);
    throw error; // Re-throw to handle in calling function
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
    
    // CRITICAL FIX: Calculate GST amount using precision calculation
    const gstAmount = calculatePercentage(totalCost.toString(), gstRate);
    
    // CRITICAL FIX: Calculate total with GST using precision addition
    const totalWithGST = addCurrency(totalCost.toString(), gstAmount);
    
    console.log(`GST calculation for ${jobType}: Rate=${gstRate}%, Amount=${gstAmount}, Total=${totalWithGST}`);
    
    return {
      gstRate,
      gstAmount: parseFloat(gstAmount).toFixed(2),
      totalWithGST: parseFloat(totalWithGST).toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating GST:", error);
    return {
      gstRate: null,
      gstAmount: "0.00",
      totalWithGST: totalCost.toFixed(2),
      success: false,
      error: `Failed to fetch GST rate from database: ${error.message}`
    };
  }
};