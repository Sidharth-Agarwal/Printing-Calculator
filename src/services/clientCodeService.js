// services/clientCodeService.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Check if a client code already exists in the database
 * @param {string} code - The client code to check
 * @returns {Promise<boolean>} - True if code exists, false otherwise
 */
export const checkClientCodeExists = async (code) => {
  try {
    const clientsCollection = collection(db, "clients");
    const q = query(clientsCollection, where("clientCode", "==", code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking client code existence:", error);
    return false;
  }
};

/**
 * Generate a unique client code based on the client name
 * Uses sequential numbering to ensure uniqueness
 * @param {string} clientName - The client name to generate code from
 * @returns {Promise<string>} - The generated client code
 */
export const generateClientCode = async (clientName) => {
  try {
    // Clean the name: remove spaces, special characters, and take first 4 letters
    const prefix = clientName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    
    // If prefix is empty after cleaning, use a default
    const finalPrefix = prefix || 'CLNT';
    
    // Get all clients to find the highest number for this prefix
    const clientsCollection = collection(db, "clients");
    const querySnapshot = await getDocs(clientsCollection);
    
    let highestNum = 0;
    const pattern = new RegExp(`^${finalPrefix}(\\d+)$`);
    
    // Look for existing codes with the same prefix
    querySnapshot.forEach(doc => {
      const clientData = doc.data();
      if (clientData.clientCode) {
        const match = clientData.clientCode.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1]);
          if (!isNaN(num) && num > highestNum) {
            highestNum = num;
          }
        }
      }
    });
    
    // Generate new code with incremented number
    const nextNum = highestNum + 1;
    // Pad to ensure at least 3 digits
    const paddedNum = nextNum.toString().padStart(3, '0');
    
    return `${finalPrefix}${paddedNum}`;
  } catch (error) {
    console.error("Error generating client code:", error);
    // Fallback to a simple random code if there's an error
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const prefix = clientName.substring(0, 4).toUpperCase() || 'CLNT';
    return `${prefix}${randomNum}`;
  }
};