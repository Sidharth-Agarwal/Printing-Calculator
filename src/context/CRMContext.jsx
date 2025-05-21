import React, { createContext, useState, useContext, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../components/Login/AuthContext";

// Create context
const CRMContext = createContext();

// Custom hook to use the CRM context
export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};

// Provider component
export const CRMProvider = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  // State for leads
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  
  // State for badges
  const [qualificationBadges, setQualificationBadges] = useState([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);
  
  // Selected lead for detailed view
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Fetch leads on component mount
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoadingLeads(true);
    
    // Create query with ordering
    const leadsQuery = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc")
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLeads(leadsData);
      setIsLoadingLeads(false);
    }, (error) => {
      console.error("Error fetching leads:", error);
      setIsLoadingLeads(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);
  
  // Fetch qualification badges
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoadingBadges(true);
    
    // Create query with ordering by priority
    const badgesQuery = query(
      collection(db, "qualificationBadges"),
      orderBy("priority", "asc")
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(badgesQuery, (snapshot) => {
      const badgesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setQualificationBadges(badgesData);
      setIsLoadingBadges(false);
    }, (error) => {
      console.error("Error fetching qualification badges:", error);
      setIsLoadingBadges(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);
  
  // Count leads by status
  const getLeadCountsByStatus = () => {
    const counts = {
      total: leads.length,
      newLead: 0,
      contacted: 0,
      qualified: 0,
      negotiation: 0,
      converted: 0,
      lost: 0
    };
    
    leads.forEach(lead => {
      if (counts.hasOwnProperty(lead.status)) {
        counts[lead.status]++;
      }
    });
    
    return counts;
  };
  
  // Count leads by source
  const getLeadCountsBySource = () => {
    const counts = {};
    
    leads.forEach(lead => {
      const source = lead.source || "Unknown";
      if (!counts[source]) {
        counts[source] = 0;
      }
      counts[source]++;
    });
    
    return counts;
  };
  
  // Calculate conversion rate
  const getConversionRate = () => {
    const converted = leads.filter(lead => lead.status === "converted").length;
    return leads.length > 0 ? (converted / leads.length) * 100 : 0;
  };
  
  // Provide context value
  const contextValue = {
    leads,
    isLoadingLeads,
    qualificationBadges,
    isLoadingBadges,
    selectedLead,
    setSelectedLead,
    getLeadCountsByStatus,
    getLeadCountsBySource,
    getConversionRate
  };
  
  return (
    <CRMContext.Provider value={contextValue}>
      {children}
    </CRMContext.Provider>
  );
};

export default CRMContext;