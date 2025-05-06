import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, where, getDoc, query, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import EstimateCard from "./EstimateCard";
import UnifiedDetailsModal from "../Shared/UnifiedDetailsModal";
import EstimatePreviewModal from "./EstimatePreviewModal";
import EstimateTemplate from "./EsimateTemplate";
import EditEstimateModal from "./EditEstimateModal";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from "react-dom/client";
import { useAuth } from "../Login/AuthContext";
import { normalizeDataForOrders } from "../../utils/normalizeDataForOrders";
import { 
  updateClientOrderCountAndTier, 
  getClientCurrentTier, 
  applyLoyaltyDiscount,
  isClientEligibleForLoyalty 
} from "../../utils/LoyaltyService";
import { 
  createLoyaltyTierChangeNotification,
  deleteRelatedNotifications 
} from "../../utils/loyaltyUtils";

const EstimatesPage = () => {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState(null);
  
  // State for data loading
  const [allEstimates, setAllEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeClientsMap, setActiveClientsMap] = useState({});
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showInactiveClients, setShowInactiveClients] = useState(false);
  
  // State for expanded clients and selected versions
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  
  // State for modals
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  
  // Edit estimate modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [estimateToEdit, setEstimateToEdit] = useState(null);
  
  // Loyalty status update notification state
  const [loyaltyNotification, setLoyaltyNotification] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [redirectTimerId, setRedirectTimerId] = useState(null);

  // Fetch B2B client data if applicable
  useEffect(() => {
    const fetchB2BClientData = async () => {
      if (userRole === "b2b" && currentUser) {
        setIsB2BClient(true);
        
        try {
          // Get the user doc to find the linked client ID
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.clientId) {
              setLinkedClientId(userData.clientId);
              // Auto-expand this client
              setExpandedClientId(userData.clientId);
            }
          }
        } catch (error) {
          console.error("Error fetching B2B client data:", error);
        }
      }
    };
    
    fetchB2BClientData();
  }, [userRole, currentUser]);

  // Handle timer for auto-dismiss without redirecting
  useEffect(() => {
    // If loyalty notification is shown, start the timer
    if (loyaltyNotification) {
      setRedirectTimer(5);
      
      // Clear any existing timer
      if (redirectTimerId) {
        clearInterval(redirectTimerId);
      }
      
      // Start a new timer that updates every second
      const timerId = setInterval(() => {
        setRedirectTimer(prev => {
          if (prev <= 1) {
            // Time's up, clear the interval and dismiss the notification without redirecting
            clearInterval(timerId);
            setLoyaltyNotification(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Save the timer ID for cleanup
      setRedirectTimerId(timerId);
      
      // Cleanup function to clear timer if component unmounts
      return () => clearInterval(timerId);
    }
  }, [loyaltyNotification]);

  // Fetch all clients' active status
  useEffect(() => {
    const fetchActiveClients = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const clientsData = {};
        
        clientsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          // If isActive is undefined or null, default to true (backward compatibility)
          clientsData[doc.id] = data.isActive !== false;
        });
        
        setActiveClientsMap(clientsData);
      } catch (error) {
        console.error("Error fetching clients active status:", error);
      }
    };
    
    fetchActiveClients();
  }, []);

  // Fetch all estimates on mount
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        setIsLoading(true);
        
        let estimatesQuery = collection(db, "estimates");
        
        // If B2B client, filter estimates by clientId
        if (isB2BClient && linkedClientId) {
          estimatesQuery = query(
            collection(db, "estimates"),
            where("clientId", "==", linkedClientId)
          );
        }
        
        const querySnapshot = await getDocs(estimatesQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setAllEstimates(data);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch estimates if not B2B or if B2B with linked client ID
    if (!isB2BClient || linkedClientId) {
      fetchEstimates();
    }
  }, [isB2BClient, linkedClientId]);

  // Process estimates into client groups
  const clientGroups = React.useMemo(() => {
    // Apply search filter
    let filtered = [...allEstimates];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(estimate => 
        (estimate.clientInfo?.name && estimate.clientInfo.name.toLowerCase().includes(query)) ||
        (estimate.clientName && estimate.clientName.toLowerCase().includes(query)) ||
        (estimate.projectName && estimate.projectName.toLowerCase().includes(query)) ||
        (estimate.jobDetails?.jobType && estimate.jobDetails.jobType.toLowerCase().includes(query)) ||
        (estimate.jobDetails?.quantity && estimate.jobDetails.quantity.toString().includes(query))
      );
    }
    
    // Apply status filter
    if (filterStatus) {
      if (filterStatus === "Pending") {
        filtered = filtered.filter(estimate => !estimate.movedToOrders && !estimate.isCanceled);
      } else if (filterStatus === "Moved") {
        filtered = filtered.filter(estimate => estimate.movedToOrders);
      } else if (filterStatus === "Cancelled") {
        filtered = filtered.filter(estimate => estimate.isCanceled);
      }
    }
    
    // Group by client and filter by active status unless showInactiveClients is true
    return filtered.reduce((acc, estimate) => {
      const clientId = estimate.clientId || "unknown";
      const clientName = estimate.clientInfo?.name || estimate.clientName || "Unknown Client";
      
      // Check if client is active (default to true if not found for backward compatibility)
      const isClientActive = clientId === "unknown" ? true : (activeClientsMap[clientId] !== false);
      
      // Skip inactive clients unless showInactiveClients is true or if we're a B2B client viewing our own estimates
      if (!isClientActive && !showInactiveClients && !(isB2BClient && clientId === linkedClientId)) {
        return acc;
      }
      
      if (!acc[clientId]) {
        acc[clientId] = {
          id: clientId,
          name: clientName,
          isActive: isClientActive,
          estimates: [],
          versions: new Map(),
          totalEstimates: 0
        };
      }
      
      // Add estimate to client group
      acc[clientId].estimates.push(estimate);
      acc[clientId].totalEstimates++;
      
      // Collect versions for this client
      const version = estimate.versionId || "1";
      if (!acc[clientId].versions.has(version)) {
        acc[clientId].versions.set(version, {
          id: version,
          estimates: [estimate],
          count: 1
        });
      } else {
        const versionData = acc[clientId].versions.get(version);
        versionData.estimates.push(estimate);
        versionData.count++;
        acc[clientId].versions.set(version, versionData);
      }
      
      return acc;
    }, {});
  }, [allEstimates, searchQuery, filterStatus, activeClientsMap, showInactiveClients, isB2BClient, linkedClientId]);

  // Toggle client expansion
  const toggleClient = (clientId) => {
    // For B2B clients, don't allow expanding other clients
    if (isB2BClient && clientId !== linkedClientId) {
      return;
    }
    
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
      
      // Set first version as selected if not already selected
      const client = clientGroups[clientId];
      if (client && client.versions.size > 0 && !selectedVersions[clientId]) {
        const firstVersion = Array.from(client.versions.keys())[0];
        setSelectedVersions(prev => ({
          ...prev,
          [clientId]: firstVersion
        }));
      }
    }
  };

  // Select a version
  const selectVersion = (clientId, versionId) => {
    setSelectedVersions(prev => ({
      ...prev,
      [clientId]: versionId
    }));
  };

  // Handle view estimate details
  const handleViewEstimate = (estimate) => {
    setSelectedEstimate(estimate);
    setIsModalOpen(true);
  };

  // Handle edit estimate
  const handleEditEstimate = (estimate) => {
    // Only allow editing estimates that haven't been moved to orders or canceled
    if (estimate.movedToOrders || estimate.isCanceled) {
      alert("Estimates that have been moved to orders or canceled cannot be edited.");
      return;
    }
    
    setEstimateToEdit(estimate);
    setIsEditModalOpen(true);
  };

  // Handle save edited estimate
  const handleSaveEditedEstimate = async (editedEstimate) => {
    try {
      // Ensure we have an estimate object to work with
      if (!editedEstimate) {
        throw new Error("No estimate data provided");
      }
      
      // Log the estimate we're about to save
      console.log("Saving edited estimate:", editedEstimate);
      
      // Verify clientName exists before updating
      if (!editedEstimate.clientName) {
        console.warn("clientName is missing, setting default value");
        editedEstimate.clientName = editedEstimate.clientInfo?.name || "Unknown Client";
      }
      
      // Verify projectName exists and is properly set
      console.log("Project name before saving:", editedEstimate.projectName);
      
      // Update the estimate in Firestore
      const estimateRef = doc(db, "estimates", editedEstimate.id);
      await updateDoc(estimateRef, editedEstimate);
      
      // Update local state
      setAllEstimates(prev => prev.map(est => 
        est.id === editedEstimate.id ? editedEstimate : est
      ));
      
      // Close edit modal
      setIsEditModalOpen(false);
      setEstimateToEdit(null);
      
      // Show success message
      alert("Estimate updated successfully!");
    } catch (error) {
      console.error("Error updating estimate:", error);
      alert(`Failed to update estimate: ${error.message}`);
    }
  };  

  // Handle moving estimate to orders - Updated to stay on estimates page
  const handleMoveToOrders = async (estimate) => {
    try {
      // Normalize the data to ensure proper structure
      console.log("Moving estimate to orders, normalizing data first...");
      const normalizedEstimate = normalizeDataForOrders(estimate);
      
      // Add the key that marks this as an order
      normalizedEstimate.stage = "Not started yet";
      normalizedEstimate.status = "In Progress";
      
      // Get the client ID
      const clientId = normalizedEstimate.clientId;
      
      // Process loyalty for B2B clients
      let loyaltyUpdate = null;
      let tierChanged = false;
      let oldTier = null;
      
      if (clientId) {
        try {
          // Check if this client is eligible for the loyalty program (B2B)
          const isLoyaltyEligible = await isClientEligibleForLoyalty(clientId);
          normalizedEstimate.isLoyaltyEligible = isLoyaltyEligible;
          
          if (isLoyaltyEligible) {
            console.log("Processing B2B client loyalty...");
            
            // Get current tier info before updating
            oldTier = await getClientCurrentTier(clientId);
            
            // Update client's order count and get updated tier info
            loyaltyUpdate = await updateClientOrderCountAndTier(clientId);
            tierChanged = loyaltyUpdate.tierChanged;
            
            if (loyaltyUpdate.success && loyaltyUpdate.tier) {
              console.log("Applied loyalty tier:", loyaltyUpdate.tier.name);
              
              // Apply loyalty discount to calculations
              const updatedCalculations = applyLoyaltyDiscount(
                normalizedEstimate.calculations,
                loyaltyUpdate.tier
              );
              
              // Update the estimate with new calculations
              normalizedEstimate.calculations = updatedCalculations;
              
              // Add loyalty information to the order
              normalizedEstimate.loyaltyInfo = {
                tierId: loyaltyUpdate.tier.dbId,
                tierName: loyaltyUpdate.tier.name,
                discount: loyaltyUpdate.tier.discount,
                discountAmount: updatedCalculations.loyaltyDiscountAmount,
                tierChanged: loyaltyUpdate.tierChanged,
                clientOrderCount: loyaltyUpdate.orderCount
              };
              
              // If tier changed, create a notification
              if (loyaltyUpdate.tierChanged) {
                // Generate tier change notification
                const clientDoc = await getDoc(doc(db, "clients", clientId));
                const clientName = clientDoc.exists() ? clientDoc.data().name : "Unknown Client";
                
                await createLoyaltyTierChangeNotification(
                  clientId, 
                  clientName, 
                  oldTier, 
                  loyaltyUpdate.tier
                );
              }
            }
          }
        } catch (loyaltyError) {
          // Log error but continue with order creation
          console.error("Error processing loyalty discount:", loyaltyError);
        }
      }

      // Add to orders collection
      await addDoc(collection(db, "orders"), normalizedEstimate);

      // Update the estimate
      const estimateRef = doc(db, "estimates", estimate.id);
      await updateDoc(estimateRef, { movedToOrders: true });

      // Update local state
      setAllEstimates(prev => 
        prev.map(est => est.id === estimate.id ? { ...est, movedToOrders: true } : est)
      );
      
      console.log("Successfully moved estimate to orders");
      
      // Show popup if tier changed, but don't redirect
      if (tierChanged && loyaltyUpdate && loyaltyUpdate.tier) {
        // Get client info for the popup
        const clientDoc = await getDoc(doc(db, "clients", clientId));
        const clientName = clientDoc.exists() ? clientDoc.data().name : "Unknown Client";
        
        // Set loyalty notification data for popup
        setLoyaltyNotification({
          clientName: clientName,
          oldTier: oldTier?.name || "No Tier",
          newTier: loyaltyUpdate.tier.name,
          newDiscount: loyaltyUpdate.tier.discount
        });
      } else {
        // Show success message
        alert("Estimate successfully moved to orders!");
      }
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
      alert("Failed to move estimate to orders. See console for details.");
    }
  };

  // Handle cancel estimate
  const handleCancelEstimate = async (estimate) => {
    try {
      const estimateRef = doc(db, "estimates", estimate.id);
      await updateDoc(estimateRef, { isCanceled: true });
      
      // Update local state
      setAllEstimates(prev => 
        prev.map(est => est.id === estimate.id ? { ...est, isCanceled: true } : est)
      );
    } catch (error) {
      console.error("Error cancelling estimate:", error);
      alert("Failed to cancel estimate.");
    }
  };

  // Handle deleting an individual estimate and its related notifications
  const handleDeleteEstimate = async (estimate) => {
    try {
      // First delete the estimate document
      const estimateRef = doc(db, "estimates", estimate.id);
      await deleteDoc(estimateRef);
      
      // Then check if we need to clean up notifications
      // For B2B clients with loyalty changes, we need to be careful
      // Only delete loyalty tier change notifications if this was the only estimate
      if (estimate.clientId) {
        // Check if there are other estimates for this client
        const remainingEstimates = allEstimates.filter(est => 
          est.clientId === estimate.clientId && est.id !== estimate.id
        );
        
        if (remainingEstimates.length === 0) {
          // This was the last estimate for this client, safe to delete notifications
          await deleteRelatedNotifications(estimate.id, estimate.clientId);
        }
      }
      
      // Update local state to remove the deleted estimate
      setAllEstimates(prev => prev.filter(est => est.id !== estimate.id));
      
      console.log("Successfully deleted estimate");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      alert("Failed to delete estimate. Please try again.");
    }
  };

  // Dismiss loyalty notification without navigating away
  const handleDismissLoyaltyNotification = () => {
    // Clear the timer
    if (redirectTimerId) {
      clearInterval(redirectTimerId);
      setRedirectTimerId(null);
    }
    
    // Close notification without navigating away
    setLoyaltyNotification(null);
  };

  // Handle preview job ticket for a specific client version
  const handlePreviewJobTicket = (clientId, versionId) => {
    try {
      const client = clientGroups[clientId];
      const versionData = client.versions.get(versionId);
      
      if (versionData && versionData.estimates.length > 0) {
        // Reset any previous error
        setPdfError(null);
        
        setPreviewData({
          clientName: client.name,
          clientId: client.id,
          version: versionId,
          estimates: versionData.estimates,
          clientInfo: {
            name: client.name,
            // Extract additional client info from the first estimate
            ...(versionData.estimates[0].clientInfo || {}),
            // Fallback to clientName if needed
            clientCode: versionData.estimates[0]?.clientInfo?.clientCode || 
                        versionData.estimates[0]?.clientCode || 
                        "N/A"
          }
        });
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error preparing job ticket preview:", error);
      alert("There was a problem preparing the job ticket preview. Please try again.");
    }
  };

  // Generate PDF for job ticket
  const handleGenerateJobTicket = async () => {
    if (!previewData || !previewData.estimates.length) return;
    
    setIsGeneratingPDF(true);
    setPdfError(null);
    
    try {
      // Create a temporary div for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px'; // Fixed width for PDF generation
      document.body.appendChild(tempDiv);
      
      // Create a new root and render the component to the temporary div
      const root = createRoot(tempDiv);
      await new Promise(resolve => {
        root.render(
          <EstimateTemplate
            estimates={previewData.estimates}
            clientInfo={previewData.clientInfo}
            version={previewData.version}
            onRenderComplete={resolve}
          />
        );
      });
      
      // Wait a bit for fonts and images to load properly
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate the PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Calculate aspect ratio to determine orientation
      const aspectRatio = canvas.width / canvas.height;
      const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
      
      // Create PDF with appropriate orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = orientation === 'landscape' ? 297 : 210; // A4 width in mm
      const pdfHeight = orientation === 'landscape' ? 210 : 297; // A4 height in mm
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If the image height exceeds the PDF height, adjust scale to fit
      if (imgHeight > pdfHeight) {
        const scale = pdfHeight / imgHeight;
        const adjustedWidth = pdfWidth * scale;
        const adjustedHeight = pdfHeight;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          (pdfWidth - adjustedWidth) / 2, // Center horizontally
          0,
          adjustedWidth,
          adjustedHeight
        );
      } else {
        // Image fits, add it to PDF
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          (pdfHeight - imgHeight) / 2, // Center vertically
          imgWidth,
          imgHeight
        );
      }
      
      // Save the PDF with customer-specific name
      pdf.save(`Customer_Estimate_${previewData.clientInfo.name}_V${previewData.version}.pdf`);
      
      // Clean up
      if (tempDiv && tempDiv.parentNode) {
        root.unmount();
        tempDiv.parentNode.removeChild(tempDiv);
      }
    } catch (error) {
      console.error('Error generating customer estimate:', error);
      setPdfError(error.message || 'Failed to generate estimate');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDuplicateEstimate = async (estimate) => {
    try {
      // Create a new object from the original estimate
      const duplicatedEstimate = {
        ...estimate
      };
      
      // Remove the id completely instead of setting it to undefined
      delete duplicatedEstimate.id;
      
      // Update timestamps and reset flags
      duplicatedEstimate.createdAt = new Date().toISOString();
      duplicatedEstimate.updatedAt = new Date().toISOString();
      duplicatedEstimate.movedToOrders = false;
      duplicatedEstimate.isCanceled = false;
      
      // Append "- Copy" to project name for easy identification
      duplicatedEstimate.projectName = `${estimate.projectName || "Unnamed Project"} - Copy`;
  
      // Add the duplicated estimate to Firestore
      const docRef = await addDoc(collection(db, "estimates"), duplicatedEstimate);
      
      // Get the new document with its ID
      const newEstimate = {
        ...duplicatedEstimate,
        id: docRef.id
      };
      
      // Update local state to include the new estimate
      setAllEstimates(prev => [...prev, newEstimate]);
      
      // Show success message
      alert("Estimate duplicated successfully!");
      
      return newEstimate;
    } catch (error) {
      console.error("Error duplicating estimate:", error);
      throw error; // Rethrow to be caught in the EstimateCard component
    }
  };

  // Calculate active and inactive client counts
  const clientCounts = React.useMemo(() => {
    let activeCount = 0;
    let inactiveCount = 0;
    
    Object.values(clientGroups).forEach(client => {
      if (client.isActive !== false) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });
    
    return { activeCount, inactiveCount };
  }, [clientGroups]);

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isB2BClient ? "Your Estimates" : "Estimates Management"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isB2BClient 
            ? "View and manage your estimate requests" 
            : "Track, update, and convert estimates into orders"}
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Moved">Moved to Orders</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            {/* Only show the inactive clients toggle for admin/staff */}
            {(userRole === "admin" || userRole === "staff") && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInactiveClients"
                  checked={showInactiveClients}
                  onChange={(e) => setShowInactiveClients(e.target.checked)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="showInactiveClients" className="ml-2 text-sm text-gray-700">
                  Show Inactive Clients
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Client Status Summary - Only for admin/staff */}
        {(userRole === "admin" || userRole === "staff") && (
          <div className="flex gap-2 mt-4">
            <div className="bg-green-50 border border-green-100 rounded-md px-3 py-1.5 text-xs font-medium text-green-800">
              {clientCounts.activeCount} Active Client{clientCounts.activeCount !== 1 ? 's' : ''}
            </div>
            {showInactiveClients && clientCounts.inactiveCount > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-md px-3 py-1.5 text-xs font-medium text-red-800">
                {clientCounts.inactiveCount} Inactive Client{clientCounts.inactiveCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loyalty Tier Upgrade Popup with Timer */}
      {loyaltyNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-l-4 border-red-500">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Loyalty Tier Upgraded!</h3>
                <p className="mt-2 text-gray-700">
                  <span className="font-medium">{loyaltyNotification.clientName}</span> has been upgraded from 
                  <span className="font-medium"> {loyaltyNotification.oldTier}</span> to
                  <span className="font-medium"> {loyaltyNotification.newTier}</span>.
                </p>
                <p className="text-red-600 font-medium">
                  New discount: {loyaltyNotification.newDiscount}%
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-500">Notification will close in {redirectTimer} seconds...</p>
              </div>
              <button
                onClick={handleDismissLoyaltyNotification}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-red-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-500">Loading estimates...</p>
        </div>
      ) : Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">No Estimates Found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {isB2BClient 
              ? "You don't have any estimates yet. Contact us to request a new estimate." 
              : showInactiveClients
                ? "No estimates match your current search criteria."
                : "No estimates for active clients match your search criteria."}
          </p>
          {(searchQuery || filterStatus || (!isB2BClient && !showInactiveClients)) && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {(searchQuery || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("");
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear Filters
                </button>
              )}
              {!isB2BClient && !showInactiveClients && (
                <button
                  onClick={() => setShowInactiveClients(true)}
                  className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Show Inactive Clients
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Client Groups */}
          {Object.values(clientGroups).map((client) => (
            <div key={client.id} className={`bg-white rounded-lg shadow-sm border ${!client.isActive ? 'border-red-300 border-l-4' : 'border-gray-200'} overflow-hidden`}>
              {/* Client Header */}
              <div 
                className={`px-4 py-3 ${expandedClientId === client.id ? 'bg-gray-50' : ''} cursor-pointer transition-colors hover:bg-gray-50 flex justify-between items-center`}
                onClick={() => toggleClient(client.id)}
              >
                <div className="flex items-center">
                  <h2 className="text-base font-medium text-gray-800">{client.name}</h2>
                  {!client.isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                  <div className="flex items-center ml-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      {client.totalEstimates} Estimate{client.totalEstimates !== 1 ? 's' : ''}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 7H7v6h6V7z" />
                        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                      </svg>
                      {client.versions.size} Version{client.versions.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {expandedClientId === client.id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedClientId === client.id && (
                <div className="border-t border-gray-200 bg-white">
                  {/* Version Selection Tabs */}
                  <div className="flex border-b border-gray-200 overflow-x-auto">
                    {Array.from(client.versions.entries()).map(([versionId, versionData]) => (
                      <button
                        key={versionId}
                        onClick={() => selectVersion(client.id, versionId)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          selectedVersions[client.id] === versionId
                            ? 'border-b-2 border-red-500 text-red-600'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        Version {versionId} 
                        <span className="ml-1 text-xs text-gray-500">({versionData.count})</span>
                      </button>
                    ))}
                  </div>

                  {/* Version Estimates */}
                  {selectedVersions[client.id] && (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800">
                          Version {selectedVersions[client.id]} Estimates
                        </h3>
                        <button
                          onClick={() => handlePreviewJobTicket(client.id, selectedVersions[client.id])}
                          className="px-3 py-1.5 rounded text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Preview Customer Estimate
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {client.versions.get(selectedVersions[client.id])?.estimates.map((estimate, index) => (
                        <EstimateCard
                          key={estimate.id}
                          estimate={estimate}
                          estimateNumber={index + 1}
                          onViewDetails={() => handleViewEstimate(estimate)}
                          onMoveToOrders={() => handleMoveToOrders(estimate)}
                          onCancelEstimate={() => handleCancelEstimate(estimate)}
                          onDeleteEstimate={() => handleDeleteEstimate(estimate)}
                          onEditEstimate={() => handleEditEstimate(estimate)}
                          onDuplicateEstimate={() => handleDuplicateEstimate(estimate)}
                          isAdmin={userRole === "admin"}
                        />
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && selectedEstimate && (
        <UnifiedDetailsModal
          data={selectedEstimate}
          dataType="estimate"
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <EstimatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleGenerateJobTicket}
          isGeneratingPDF={isGeneratingPDF}
          error={pdfError}
        >
          {previewData && previewData.estimates.length > 0 && (
            <EstimateTemplate
              estimates={previewData.estimates}
              clientInfo={previewData.clientInfo}
              version={previewData.version}
            />
          )}
        </EstimatePreviewModal>
      )}

      {/* Edit Estimate Modal */}
      {isEditModalOpen && estimateToEdit && (
        <EditEstimateModal
          estimate={estimateToEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setEstimateToEdit(null);
          }}
          onSave={handleSaveEditedEstimate}
        />
      )}
    </div>
  );
};

export default EstimatesPage;