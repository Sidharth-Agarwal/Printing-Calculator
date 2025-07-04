import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Check if email already exists for another client
 * @param {string} email - Email to check
 * @param {string} excludeClientId - Client ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if email exists
 */
export const checkClientEmailExists = async (email, excludeClientId = null) => {
  if (!email || !email.trim()) return false;
  
  try {
    const clientsRef = collection(db, "clients");
    const emailQuery = query(clientsRef, where("email", "==", email.trim().toLowerCase()));
    const querySnapshot = await getDocs(emailQuery);
    
    // If excluding a client ID (for editing), check if any other client has this email
    if (excludeClientId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeClientId);
    }
    
    // For new clients, return true if any client has this email
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking client email:", error);
    throw new Error("Unable to validate email. Please try again.");
  }
};

/**
 * Check if phone number already exists for another client
 * @param {string} phone - Phone number to check
 * @param {string} excludeClientId - Client ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if phone exists
 */
export const checkClientPhoneExists = async (phone, excludeClientId = null) => {
  if (!phone || !phone.trim()) return false;
  
  try {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    const clientsRef = collection(db, "clients");
    const phoneQuery = query(clientsRef, where("phone", "==", normalizedPhone));
    const querySnapshot = await getDocs(phoneQuery);
    
    // If excluding a client ID (for editing), check if any other client has this phone
    if (excludeClientId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeClientId);
    }
    
    // For new clients, return true if any client has this phone
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking client phone:", error);
    throw new Error("Unable to validate phone number. Please try again.");
  }
};

/**
 * Validate all client data including uniqueness checks
 * @param {Object} clientData - Client data to validate
 * @param {string} excludeClientId - Client ID to exclude from uniqueness checks
 * @returns {Promise<Object>} - Validation result with isValid and errors
 */
export const validateClientData = async (clientData, excludeClientId = null) => {
  const errors = {};
  
  // Basic required field validation
  if (!clientData.name || !clientData.name.trim()) {
    errors.name = "Client name is required";
  }
  
  if (!clientData.email || !clientData.email.trim()) {
    errors.email = "Email address is required";
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
  }
  
  if (!clientData.phone || !clientData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else {
    // Basic phone number validation (adjust regex as needed for your locale)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(clientData.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }
  }
  
  // Check for uniqueness if basic validation passes
  if (!errors.email && clientData.email) {
    try {
      const emailExists = await checkClientEmailExists(clientData.email, excludeClientId);
      if (emailExists) {
        errors.email = "This email address is already used by another client";
      }
    } catch (error) {
      errors.email = error.message;
    }
  }
  
  if (!errors.phone && clientData.phone) {
    try {
      const phoneExists = await checkClientPhoneExists(clientData.phone, excludeClientId);
      if (phoneExists) {
        errors.phone = "This phone number is already used by another client";
      }
    } catch (error) {
      errors.phone = error.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Normalize email for storage
 * @param {string} email 
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : "";
};

/**
 * Normalize phone for storage
 * @param {string} phone 
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  return phone ? phone.replace(/[\s\-\(\)]/g, '') : "";
};