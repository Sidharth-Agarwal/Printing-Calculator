// components/Vendors/VendorDuplicateIndicator.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Component to check and display duplicate indicators for vendor email/phone/gstin/account
 * @param {Object} props - Component props
 * @param {string} props.type - "email", "phone", "gstin", or "account"
 * @param {string} props.value - The value to check
 * @param {string} props.currentVendorId - Current vendor ID to exclude from check
 * @param {string} props.className - Additional CSS classes
 */
const VendorDuplicateIndicator = ({ type, value, currentVendorId, className = "" }) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateVendors, setDuplicateVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!value || !value.trim()) {
        setIsDuplicate(false);
        setDuplicateVendors([]);
        return;
      }

      setLoading(true);
      try {
        const vendorsRef = collection(db, "vendors");
        let normalizedValue = value;
        let queryField = type;

        // Normalize value based on type
        switch (type) {
          case "email":
            normalizedValue = value.trim().toLowerCase();
            break;
          case "phone":
            normalizedValue = value.replace(/[\s\-\(\)]/g, '');
            break;
          case "gstin":
            normalizedValue = value.replace(/\s/g, '').toUpperCase();
            break;
          case "account":
            normalizedValue = value.replace(/\s/g, '');
            queryField = "accountDetails.accountNumber";
            break;
          default:
            normalizedValue = value.trim();
        }
          
        const duplicateQuery = query(vendorsRef, where(queryField, "==", normalizedValue));
        const querySnapshot = await getDocs(duplicateQuery);
        
        // Filter out current vendor and get duplicate vendor info
        const duplicates = querySnapshot.docs
          .filter(doc => doc.id !== currentVendorId)
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            vendorCode: doc.data().vendorCode
          }));

        setIsDuplicate(duplicates.length > 0);
        setDuplicateVendors(duplicates);
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        setIsDuplicate(false);
        setDuplicateVendors([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(checkForDuplicates, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [type, value, currentVendorId]);

  if (loading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 ml-1"></div>
      </div>
    );
  }

  if (!isDuplicate) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className="ml-1 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg 
          className="w-4 h-4 text-red-500" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded py-2 px-3 z-10">
          <div className="font-medium mb-1">
            Duplicate {type} found!
          </div>
          <div className="space-y-1">
            {duplicateVendors.map(vendor => (
              <div key={vendor.id}>
                {vendor.name} ({vendor.vendorCode})
              </div>
            ))}
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default VendorDuplicateIndicator;