// services/vendorValidationService.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Check if email already exists for another vendor
 * @param {string} email - Email to check
 * @param {string} excludeVendorId - Vendor ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if email exists
 */
export const checkVendorEmailExists = async (email, excludeVendorId = null) => {
  if (!email || !email.trim()) return false;
  
  try {
    const vendorsRef = collection(db, "vendors");
    const emailQuery = query(vendorsRef, where("email", "==", email.trim().toLowerCase()));
    const querySnapshot = await getDocs(emailQuery);
    
    // If excluding a vendor ID (for editing), check if any other vendor has this email
    if (excludeVendorId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeVendorId);
    }
    
    // For new vendors, return true if any vendor has this email
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking vendor email:", error);
    throw new Error("Unable to validate email. Please try again.");
  }
};

/**
 * Check if phone number already exists for another vendor
 * @param {string} phone - Phone number to check
 * @param {string} excludeVendorId - Vendor ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if phone exists
 */
export const checkVendorPhoneExists = async (phone, excludeVendorId = null) => {
  if (!phone || !phone.trim()) return false;
  
  try {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    const vendorsRef = collection(db, "vendors");
    const phoneQuery = query(vendorsRef, where("phone", "==", normalizedPhone));
    const querySnapshot = await getDocs(phoneQuery);
    
    // If excluding a vendor ID (for editing), check if any other vendor has this phone
    if (excludeVendorId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeVendorId);
    }
    
    // For new vendors, return true if any vendor has this phone
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking vendor phone:", error);
    throw new Error("Unable to validate phone number. Please try again.");
  }
};

/**
 * Check if GSTIN already exists for another vendor
 * @param {string} gstin - GSTIN to check
 * @param {string} excludeVendorId - Vendor ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if GSTIN exists
 */
export const checkVendorGstinExists = async (gstin, excludeVendorId = null) => {
  if (!gstin || !gstin.trim()) return false;
  
  try {
    // Normalize GSTIN (remove spaces, convert to uppercase)
    const normalizedGstin = gstin.replace(/\s/g, '').toUpperCase();
    
    const vendorsRef = collection(db, "vendors");
    const gstinQuery = query(vendorsRef, where("gstin", "==", normalizedGstin));
    const querySnapshot = await getDocs(gstinQuery);
    
    // If excluding a vendor ID (for editing), check if any other vendor has this GSTIN
    if (excludeVendorId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeVendorId);
    }
    
    // For new vendors, return true if any vendor has this GSTIN
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking vendor GSTIN:", error);
    throw new Error("Unable to validate GSTIN. Please try again.");
  }
};

/**
 * Check if account number already exists for another vendor
 * @param {string} accountNumber - Account number to check
 * @param {string} excludeVendorId - Vendor ID to exclude from check (for editing)
 * @returns {Promise<boolean>} - True if account number exists
 */
export const checkVendorAccountExists = async (accountNumber, excludeVendorId = null) => {
  if (!accountNumber || !accountNumber.trim()) return false;
  
  try {
    // Normalize account number (remove spaces)
    const normalizedAccount = accountNumber.replace(/\s/g, '');
    
    const vendorsRef = collection(db, "vendors");
    const accountQuery = query(vendorsRef, where("accountDetails.accountNumber", "==", normalizedAccount));
    const querySnapshot = await getDocs(accountQuery);
    
    // If excluding a vendor ID (for editing), check if any other vendor has this account
    if (excludeVendorId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeVendorId);
    }
    
    // For new vendors, return true if any vendor has this account
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking vendor account number:", error);
    throw new Error("Unable to validate account number. Please try again.");
  }
};

/**
 * Validate all vendor data including uniqueness checks
 * @param {Object} vendorData - Vendor data to validate
 * @param {string} excludeVendorId - Vendor ID to exclude from uniqueness checks
 * @returns {Promise<Object>} - Validation result with isValid and errors
 */
export const validateVendorData = async (vendorData, excludeVendorId = null) => {
  const errors = {};
  
  // Basic required field validation
  if (!vendorData.name || !vendorData.name.trim()) {
    errors.name = "Vendor name is required";
  }
  
  if (!vendorData.email || !vendorData.email.trim()) {
    errors.email = "Email address is required";
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
  }
  
  if (!vendorData.phone || !vendorData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else {
    // Basic phone number validation (adjust regex as needed for your locale)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(vendorData.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  // GSTIN validation if provided
  if (vendorData.gstin && vendorData.gstin.trim()) {
    // Basic GSTIN format validation (15 characters)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(vendorData.gstin.trim().toUpperCase())) {
      errors.gstin = "Please enter a valid GSTIN format";
    }
  }

  // Account number validation if provided
  if (vendorData.accountDetails?.accountNumber && vendorData.accountDetails.accountNumber.trim()) {
    const accountNumber = vendorData.accountDetails.accountNumber.trim();
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      errors['accountDetails.accountNumber'] = "Account number should be between 9-18 digits";
    }
  }

  // IFSC code validation if provided
  if (vendorData.accountDetails?.ifscCode && vendorData.accountDetails.ifscCode.trim()) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(vendorData.accountDetails.ifscCode.trim().toUpperCase())) {
      errors['accountDetails.ifscCode'] = "Please enter a valid IFSC code";
    }
  }
  
  // Check for uniqueness if basic validation passes
  if (!errors.email && vendorData.email) {
    try {
      const emailExists = await checkVendorEmailExists(vendorData.email, excludeVendorId);
      if (emailExists) {
        errors.email = "This email address is already used by another vendor";
      }
    } catch (error) {
      errors.email = error.message;
    }
  }
  
  if (!errors.phone && vendorData.phone) {
    try {
      const phoneExists = await checkVendorPhoneExists(vendorData.phone, excludeVendorId);
      if (phoneExists) {
        errors.phone = "This phone number is already used by another vendor";
      }
    } catch (error) {
      errors.phone = error.message;
    }
  }

  if (!errors.gstin && vendorData.gstin && vendorData.gstin.trim()) {
    try {
      const gstinExists = await checkVendorGstinExists(vendorData.gstin, excludeVendorId);
      if (gstinExists) {
        errors.gstin = "This GSTIN is already used by another vendor";
      }
    } catch (error) {
      errors.gstin = error.message;
    }
  }

  if (!errors['accountDetails.accountNumber'] && vendorData.accountDetails?.accountNumber && vendorData.accountDetails.accountNumber.trim()) {
    try {
      const accountExists = await checkVendorAccountExists(vendorData.accountDetails.accountNumber, excludeVendorId);
      if (accountExists) {
        errors['accountDetails.accountNumber'] = "This account number is already used by another vendor";
      }
    } catch (error) {
      errors['accountDetails.accountNumber'] = error.message;
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

/**
 * Normalize GSTIN for storage
 * @param {string} gstin 
 * @returns {string}
 */
export const normalizeGstin = (gstin) => {
  return gstin ? gstin.replace(/\s/g, '').toUpperCase() : "";
};

/**
 * Normalize account number for storage
 * @param {string} accountNumber 
 * @returns {string}
 */
export const normalizeAccountNumber = (accountNumber) => {
  return accountNumber ? accountNumber.replace(/\s/g, '') : "";
};

/**
 * Normalize IFSC code for storage
 * @param {string} ifscCode 
 * @returns {string}
 */
export const normalizeIfscCode = (ifscCode) => {
  return ifscCode ? ifscCode.replace(/\s/g, '').toUpperCase() : "";
};