import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';

/**
 * Fetches GST rate from gst_and_hsn collection based on job type
 * @param {string} jobType - Type of job (Card, Folder, Box, etc.)
 * @returns {Promise<number>} - GST percentage for the job type
 */
const fetchGSTRate = async (jobType) => {
  try {
    // Normalize the job type
    const normalizedType = jobType?.trim().toUpperCase() || 'CARD';
    
    // Query the gst_and_hsn collection for GST rate
    const gstHsnCollection = collection(db, "gst_and_hsn");
    const q = query(
      gstHsnCollection, 
      where("group", "==", "GST"),
      where("type", "==", normalizedType)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the first matching record
      const gstRate = querySnapshot.docs[0].data();
      
      // Use value field for GST from the new database structure
      if (gstRate.value) {
        return parseFloat(gstRate.value);
      }
    }
    
    // If no matching record found, try to find a default GST rate
    const defaultQuery = query(
      gstHsnCollection, 
      where("group", "==", "GST"),
      where("type", "==", "CARD") // Using CARD as the default
    );
    
    const defaultSnapshot = await getDocs(defaultQuery);
    if (!defaultSnapshot.empty) {
      const defaultRate = defaultSnapshot.docs[0].data();
      if (defaultRate.value) {
        console.log(`No GST rate found for ${jobType}, using default GST CARD: ${defaultRate.value}%`);
        return parseFloat(defaultRate.value);
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