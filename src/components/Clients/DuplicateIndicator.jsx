// components/Clients/DuplicateIndicator.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Component to check and display duplicate indicators for client email/phone
 * @param {Object} props - Component props
 * @param {string} props.type - "email" or "phone"
 * @param {string} props.value - The email or phone value to check
 * @param {string} props.currentClientId - Current client ID to exclude from check
 * @param {string} props.className - Additional CSS classes
 */
const DuplicateIndicator = ({ type, value, currentClientId, className = "" }) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateClients, setDuplicateClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!value || !value.trim()) {
        setIsDuplicate(false);
        setDuplicateClients([]);
        return;
      }

      setLoading(true);
      try {
        const clientsRef = collection(db, "clients");
        const normalizedValue = type === "email" 
          ? value.trim().toLowerCase() 
          : value.replace(/[\s\-\(\)]/g, '');
          
        const duplicateQuery = query(clientsRef, where(type, "==", normalizedValue));
        const querySnapshot = await getDocs(duplicateQuery);
        
        // Filter out current client and get duplicate client info
        const duplicates = querySnapshot.docs
          .filter(doc => doc.id !== currentClientId)
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            clientCode: doc.data().clientCode
          }));

        setIsDuplicate(duplicates.length > 0);
        setDuplicateClients(duplicates);
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        setIsDuplicate(false);
        setDuplicateClients([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(checkForDuplicates, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [type, value, currentClientId]);

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
            {duplicateClients.map(client => (
              <div key={client.id}>
                {client.name} ({client.clientCode})
              </div>
            ))}
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default DuplicateIndicator;