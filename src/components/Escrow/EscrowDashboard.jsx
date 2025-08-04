import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, where, getDoc, query, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import EscrowCard from "./EscrowCard";
import UnifiedDetailsModal from "../Shared/UnifiedDetailsModal";
import EscrowApprovalModal from "./EscrowApprovalModal";
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
import OrderSerializationService from "../../utils/OrderSerializationService";

const EscrowDashboard = () => {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  
  // State for data loading
  const [escrowEstimates, setEscrowEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeClientsMap, setActiveClientsMap] = useState({});
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // State for expanded clients and selected versions
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  
  // State for modals
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Approval modal state (kept for backward compatibility)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [estimateToApprove, setEstimateToApprove] = useState(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  
  // Multi-select state for estimates
  const [selectedEstimates, setSelectedEstimates] = useState({});
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [isApprovingMultiple, setIsApprovingMultiple] = useState(false);
  
  // State to show all versions of a client simultaneously
  const [showAllVersions, setShowAllVersions] = useState(false);

  // Loyalty status update notification state
  const [loyaltyNotification, setLoyaltyNotification] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [redirectTimerId, setRedirectTimerId] = useState(null);

  // Initialize order serial counter on component mount
  useEffect(() => {
    OrderSerializationService.initializeCounter().catch(console.error);
  }, []);

  // Helper function to safely parse dates and provide fallbacks
  const getEstimateTimestamp = (estimate) => {
    // Try to use updatedAt first (most recent activity), then createdAt, then fallback
    const updatedAt = estimate.updatedAt;
    const createdAt = estimate.createdAt;
    
    if (updatedAt) {
      const updatedDate = new Date(updatedAt);
      if (!isNaN(updatedDate.getTime())) {
        return updatedDate.getTime();
      }
    }
    
    if (createdAt) {
      const createdDate = new Date(createdAt);
      if (!isNaN(createdDate.getTime())) {
        return createdDate.getTime();
      }
    }
    
    // Fallback to current time if no valid dates found
    return new Date().getTime();
  };

  // UPDATED: Sort estimates by creation/update time (oldest first)
  const sortEstimatesByTimestamp = (estimates) => {
    return [...estimates].sort((a, b) => {
      const timestampA = getEstimateTimestamp(a);
      const timestampB = getEstimateTimestamp(b);
      
      // CHANGED: Sort in ascending order (oldest first)
      return timestampA - timestampB;
    });
  };

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

  // Only clear selections if we exit multi-select mode
  useEffect(() => {
    if (!isMultiSelectActive) {
      setSelectedEstimates({});
    }
  }, [isMultiSelectActive]);

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

  // UPDATED: Fetch all B2B estimates in escrow on mount - filter out already processed estimates
  useEffect(() => {
    const fetchEscrowEstimates = async () => {
      try {
        setIsLoading(true);
        
        // Query for estimates in escrow
        const escrowQuery = query(
          collection(db, "estimates"),
          where("inEscrow", "==", true)
        );
        
        const querySnapshot = await getDocs(escrowQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // ADDED: Filter out estimates that have been moved to orders
        const filteredData = data.filter(estimate => !estimate.movedToOrders);
        
        setEscrowEstimates(filteredData);
      } catch (error) {
        console.error("Error fetching escrow estimates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEscrowEstimates();
  }, []);

  // Process estimates into client groups with proper ordering
  const clientGroups = React.useMemo(() => {
    // UPDATED: Apply search filter and ensure moved estimates are excluded
    let filtered = [...escrowEstimates].filter(estimate => !estimate.movedToOrders);
    
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
        filtered = filtered.filter(estimate => !estimate.isApproved && !estimate.isRejected);
      } else if (filterStatus === "Approved") {
        filtered = filtered.filter(estimate => estimate.isApproved);
      } else if (filterStatus === "Rejected") {
        filtered = filtered.filter(estimate => estimate.isRejected);
      }
    }
    
    // Group by client
    const groups = filtered.reduce((acc, estimate) => {
      const clientId = estimate.clientId || "unknown";
      const clientName = estimate.clientInfo?.name || estimate.clientName || "Unknown Client";
      
      // Check if client is active (default to true if not found for backward compatibility)
      const isClientActive = clientId === "unknown" ? true : (activeClientsMap[clientId] !== false);
      
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

    // Sort estimates within each client group and version
    Object.values(groups).forEach(client => {
      // Sort all estimates for this client
      client.estimates = sortEstimatesByTimestamp(client.estimates);
      
      // Sort estimates within each version
      client.versions.forEach((versionData, versionId) => {
        versionData.estimates = sortEstimatesByTimestamp(versionData.estimates);
        client.versions.set(versionId, versionData);
      });
    });

    return groups;
  }, [escrowEstimates, searchQuery, filterStatus, activeClientsMap]);

  // UPDATED: Get a count of selected valid estimates (not approved, rejected, or moved)
  const getSelectedEstimatesCount = () => {
    let count = 0;
    Object.keys(selectedEstimates).forEach(estimateId => {
      if (selectedEstimates[estimateId]?.selected) {
        const estimate = escrowEstimates.find(est => est.id === estimateId);
        if (estimate && !estimate.isApproved && !estimate.isRejected && !estimate.movedToOrders) {
          count++;
        }
      }
    });
    return count;
  };

  // Toggle multi-select mode
  const toggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    // Clear selections when toggling off
    if (isMultiSelectActive) {
      setSelectedEstimates({});
    }
  };

  // Toggle selection for a single estimate
  const toggleEstimateSelection = (estimateId, isSelected, versionId) => {
    setSelectedEstimates(prev => ({
      ...prev,
      [estimateId]: isSelected ? { selected: true, versionId } : undefined
    }));
  };

  // Select all estimates for current version
  const selectAllCurrentVersionEstimates = (clientId, versionId) => {
    if (!clientId || !versionId) return;
    
    // Get all estimates for this version
    const client = clientGroups[clientId];
    if (!client) return;
    
    const versionData = client.versions.get(versionId);
    if (!versionData) return;
    
    // Update selected estimates
    const newSelections = { ...selectedEstimates };
    versionData.estimates.forEach(estimate => {
      // UPDATED: Only include estimates that can be processed (not moved to orders)
      if (!estimate.isApproved && !estimate.isRejected && !estimate.movedToOrders) {
        newSelections[estimate.id] = { 
          selected: true, 
          versionId: estimate.versionId || "1" 
        };
      }
    });
    
    setSelectedEstimates(newSelections);
  };

  // Toggle showing all versions
  const toggleShowAllVersions = () => {
    setShowAllVersions(!showAllVersions);
  };

  // Toggle client expansion
  const toggleClient = (clientId) => {
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

  // Select a version without clearing selections
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

  // Open approval modal for a single estimate
  const handleApproveEstimate = (estimate) => {
    setEstimateToApprove(estimate);
    setIsApprovalModalOpen(true);
  };

  // UPDATED: Process approval for a single estimate with serial number generation
  const processApproveEstimate = async (estimate, notes = "") => {
    try {
      setIsProcessingApproval(true);
      
      // Generate serial number for B2B order
      const orderSerial = await OrderSerializationService.generateOrderSerial();
      
      // Current timestamp for all updates
      const currentTimestamp = new Date().toISOString();
      
      // Normalize the data to ensure proper structure
      const normalizedEstimate = normalizeDataForOrders(estimate);
      
      // Add the keys that mark this as an order
      normalizedEstimate.stage = "Not started yet";
      normalizedEstimate.status = "In Progress";
      normalizedEstimate.approvalNotes = notes;
      normalizedEstimate.approvedAt = currentTimestamp;
      normalizedEstimate.approvedBy = currentUser.uid;
      normalizedEstimate.orderCreatedFrom = 'b2b_approval';
      normalizedEstimate.originalEstimateId = estimate.id;
      
      // Add serial number if generated successfully
      if (orderSerial) {
        normalizedEstimate.orderSerial = orderSerial;
        console.log(`B2B order will be created with serial: ${orderSerial}`);
      } else {
        console.warn('Serial number generation failed for B2B order, order will be created without serial');
      }
      
      // Ensure proper timestamp handling
      normalizedEstimate.createdAt = estimate.createdAt || currentTimestamp;
      normalizedEstimate.updatedAt = currentTimestamp;
      
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

      // Update the estimate in escrow with proper timestamps
      const estimateRef = doc(db, "estimates", estimate.id);
      const updateData = { 
        isApproved: true,
        isRejected: false,
        movedToOrders: true,
        approvalNotes: notes,
        approvedAt: currentTimestamp,
        approvedBy: currentUser.uid,
        updatedAt: currentTimestamp
      };
      
      // Add serial reference to estimate if generated
      if (orderSerial) {
        updateData.linkedOrderSerial = orderSerial;
      }
      
      await updateDoc(estimateRef, updateData);

      // UPDATED: Remove the estimate from local state since it's now moved to orders
      setEscrowEstimates(prev => 
        prev.filter(est => est.id !== estimate.id)
      );
      
      console.log("Successfully approved B2B estimate and moved to orders");
      
      // Show popup if tier changed
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
        // Show success message with serial number if available
        const successMessage = orderSerial 
          ? `B2B estimate successfully approved and moved to orders! Order Serial: ${orderSerial}`
          : "B2B estimate successfully approved and moved to orders!";
        alert(successMessage);
      }
      
      // Close approval modal
      setIsApprovalModalOpen(false);
      setEstimateToApprove(null);
      
      return true;
    } catch (error) {
      console.error("Error approving B2B estimate:", error);
      alert("Failed to approve estimate. See console for details.");
      return false;
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Handle rejection of an estimate directly from card with timestamp
  const processRejectEstimate = async (estimate, notes) => {
    try {
      setIsProcessingApproval(true);
      
      // Current timestamp for updates
      const currentTimestamp = new Date().toISOString();
      
      // Update the estimate in escrow
      const estimateRef = doc(db, "estimates", estimate.id);
      const updateData = { 
        isRejected: true,
        isApproved: false,
        rejectionNotes: notes,
        rejectedAt: currentTimestamp,
        rejectedBy: currentUser.uid,
        updatedAt: currentTimestamp
      };
      
      await updateDoc(estimateRef, updateData);

      // Update local state
      setEscrowEstimates(prev => 
        prev.map(est => est.id === estimate.id ? { 
          ...est, 
          ...updateData
        } : est)
      );
      
      // Close approval modal if open
      setIsApprovalModalOpen(false);
      setEstimateToApprove(null);
      
      alert("Estimate has been rejected");
      
      return true;
    } catch (error) {
      console.error("Error rejecting estimate:", error);
      alert("Failed to reject estimate. See console for details.");
      return false;
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Handle approving multiple estimates with serial number generation
  const handleApproveMultiple = async () => {
    try {
      setIsApprovingMultiple(true);
      
      // Create a list of estimates to approve
      const estimatesToApprove = [];
      Object.keys(selectedEstimates).forEach(estimateId => {
        if (selectedEstimates[estimateId]?.selected) {
          const estimate = escrowEstimates.find(est => est.id === estimateId);
          // UPDATED: Check for movedToOrders as well
          if (estimate && !estimate.isApproved && !estimate.isRejected && !estimate.movedToOrders) {
            estimatesToApprove.push(estimate);
          }
        }
      });
      
      if (estimatesToApprove.length === 0) {
        alert("No valid estimates selected to approve. Please select estimates that are not already processed.");
        setIsApprovingMultiple(false);
        return;
      }
      
      // Create a counter for successful approvals and track serial numbers
      let successCount = 0;
      let serialNumbers = [];
      
      // Process each estimate one by one
      for (const estimate of estimatesToApprove) {
        try {
          // Use the same approval logic as for a single estimate
          const success = await processApproveEstimate(estimate, "Bulk approval");
          if (success) {
            successCount++;
            // Check if serial was added to the updated estimate
            const updatedEstimate = escrowEstimates.find(est => est.id === estimate.id);
            if (updatedEstimate?.linkedOrderSerial) {
              serialNumbers.push(updatedEstimate.linkedOrderSerial);
            }
          }
        } catch (error) {
          console.error(`Error approving estimate ${estimate.id}:`, error);
        }
      }
      
      // Show success message with serial numbers
      let successMessage = `Successfully approved ${successCount} out of ${estimatesToApprove.length} B2B estimates.`;
      if (serialNumbers.length > 0) {
        successMessage += `\n\nGenerated Order Serials:\n${serialNumbers.join(', ')}`;
      }
      
      console.log(successMessage);
      alert(successMessage);
      
      // Clear selections
      setSelectedEstimates({});
      setIsMultiSelectActive(false);
      
    } catch (error) {
      console.error("Error during bulk approval:", error);
      alert("There was an error approving the selected estimates. Please check the console for details.");
    } finally {
      setIsApprovingMultiple(false);
    }
  };

  // Handle rejection of multiple estimates with proper timestamps
  const handleRejectMultiple = async () => {
    try {
      setIsApprovingMultiple(true);
      
      // Create a list of estimates to reject
      const estimatesToReject = [];
      Object.keys(selectedEstimates).forEach(estimateId => {
        if (selectedEstimates[estimateId]?.selected) {
          const estimate = escrowEstimates.find(est => est.id === estimateId);
          // UPDATED: Check for movedToOrders as well
          if (estimate && !estimate.isApproved && !estimate.isRejected && !estimate.movedToOrders) {
            estimatesToReject.push(estimate);
          }
        }
      });
      
      if (estimatesToReject.length === 0) {
        alert("No valid estimates selected to reject. Please select estimates that are not already processed.");
        setIsApprovingMultiple(false);
        return;
      }
      
      // Confirm bulk rejection
      if (!window.confirm(`Are you sure you want to reject ${estimatesToReject.length} estimates?`)) {
        setIsApprovingMultiple(false);
        return;
      }
      
      // Prompt for rejection reason
      const reason = window.prompt("Please provide a rejection reason for all selected estimates:");
      
      if (reason === null) {
        setIsApprovingMultiple(false);
        return; // User canceled
      }
      
      if (reason.trim() === "") {
        alert("A rejection reason is required");
        setIsApprovingMultiple(false);
        return;
      }
      
      // Create a counter for successful rejections
      let successCount = 0;
      
      // Process each estimate one by one
      for (const estimate of estimatesToReject) {
        try {
          // Use the same rejection logic as for a single estimate
          const success = await processRejectEstimate(estimate, reason);
          if (success) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error rejecting estimate ${estimate.id}:`, error);
        }
      }
      
      // Show success message
      console.log(`Successfully rejected ${successCount} out of ${estimatesToReject.length} estimates.`);
      alert(`Successfully rejected ${successCount} out of ${estimatesToReject.length} estimates.`);
      
      // Clear selections
      setSelectedEstimates({});
      setIsMultiSelectActive(false);
      
    } catch (error) {
      console.error("Error during bulk rejection:", error);
      alert("There was an error rejecting the selected estimates. Please check the console for details.");
    } finally {
      setIsApprovingMultiple(false);
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

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          B2B Escrow Approval
        </h1>
        <p className="text-gray-600 mt-1">
          Review and approve B2B estimates before converting them to orders with serial numbers
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
              placeholder="Search escrow items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
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
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <p className="text-sm text-gray-500">Notification will close in {redirectTimer} seconds...</p>
             </div>
             <button
               onClick={handleDismissLoyaltyNotification}
               className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
         <p className="text-gray-500">Loading escrow items...</p>
       </div>
     ) : Object.keys(clientGroups).length === 0 ? (
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
         <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">No Estimates in Escrow</h2>
         <p className="text-sm text-gray-500 max-w-md mx-auto">
           There are currently no B2B estimates in the escrow system waiting for approval.
         </p>
       </div>
     ) : (
       <div className="space-y-4">
         {/* Client Groups */}
         {Object.values(clientGroups).map((client) => (
           <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             {/* Client Header */}
             <div 
               className={`px-4 py-3 ${expandedClientId === client.id ? 'bg-gray-50' : ''} cursor-pointer transition-colors hover:bg-gray-50 flex justify-between items-center`}
               onClick={() => toggleClient(client.id)}
             >
               <div className="flex items-center">
                 <h2 className="text-base font-medium text-gray-800">{client.name}</h2>
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
                 {/* Toggle to show all versions at once */}
                 {client.versions.size > 1 && (
                   <div className="flex justify-end px-4 pt-2">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         toggleShowAllVersions();
                       }}
                       className={`px-3 py-1 text-xs rounded-full flex items-center ${
                         showAllVersions 
                           ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                       }`}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                         {showAllVersions ? (
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                         ) : (
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                         )}
                       </svg>
                       {showAllVersions ? 'Hide Versions' : 'Show All Versions'}
                     </button>
                   </div>
                 )}
                 
                 {/* Version Selection Tabs - Only show if not in "Show All Versions" mode */}
                 {!showAllVersions && (
                   <div className="flex border-b border-gray-200 overflow-x-auto">
                     {Array.from(client.versions.entries())
                       .sort(([a], [b]) => parseInt(a) - parseInt(b))
                       .map(([versionId, versionData]) => (
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
                 )}

                 {/* If not showing all versions, show the selected version */}
                 {!showAllVersions && selectedVersions[client.id] && (
                   <div className="p-4">
                     <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2">
                         <h3 className="font-medium text-gray-800">
                           Version {selectedVersions[client.id]} Estimates
                           <span className="text-xs text-gray-500 ml-1">(ordered by earliest activity)</span>
                         </h3>
                         
                         {/* Multi-select toggle */}
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleMultiSelect();
                           }}
                           className={`px-2 py-1 rounded text-xs flex items-center ${
                             isMultiSelectActive 
                               ? 'bg-red-500 text-white' 
                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                           }`}
                         >
                           {isMultiSelectActive ? 'Cancel' : 'Multi-Select'}
                         </button>
                         
                         {/* Select All button (visible in multi-select mode) */}
                         {isMultiSelectActive && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               selectAllCurrentVersionEstimates(client.id, selectedVersions[client.id]);
                             }}
                             className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                               <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                             </svg>
                             Select All
                           </button>
                         )}
                       </div>
                       
                       <div className="flex gap-2">
                         {/* Bulk Action Buttons */}
                         {isMultiSelectActive && getSelectedEstimatesCount() > 0 && (
                           <div className="flex gap-2">
                             <button
                               onClick={handleApproveMultiple}
                               disabled={isApprovingMultiple}
                               className={`px-3 py-1.5 rounded text-sm ${
                                 isApprovingMultiple
                                 ? 'bg-green-300 text-white cursor-wait' 
                                 : 'bg-green-600 text-white hover:bg-green-700'
                               } flex items-center gap-1.5`}
                             >
                               {isApprovingMultiple ? (
                                 <>
                                   <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   Processing...
                                 </>
                               ) : (
                                 <>
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                   </svg>
                                   Approve {getSelectedEstimatesCount()}
                                 </>
                               )}
                             </button>
                             <button
                               onClick={handleRejectMultiple}
                               disabled={isApprovingMultiple}
                               className={`px-3 py-1.5 rounded text-sm ${
                                 isApprovingMultiple
                                 ? 'bg-red-300 text-white cursor-wait' 
                                 : 'bg-red-600 text-white hover:bg-red-700'
                               } flex items-center gap-1.5`}
                             >
                               {isApprovingMultiple ? (
                                 <>
                                   <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   Processing...
                                 </>
                               ) : (
                                 <>
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                   </svg>
                                   Reject {getSelectedEstimatesCount()}
                                 </>
                               )}
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                       {client.versions.get(selectedVersions[client.id])?.estimates.map((estimate, index) => (
                         <EscrowCard
                           key={estimate.id}
                           estimate={estimate}
                           estimateNumber={index + 1}
                           onViewDetails={() => handleViewEstimate(estimate)}
                           onApprove={processApproveEstimate}
                           onReject={processRejectEstimate}
                           // Multi-select props
                           isMultiSelectActive={isMultiSelectActive}
                           isSelected={selectedEstimates[estimate.id]?.selected || false}
                           onSelectToggle={(isSelected) => toggleEstimateSelection(
                             estimate.id, 
                             isSelected, 
                             estimate.versionId || "1"
                           )}
                         />
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Show all versions at once in a tabbed layout */}
                 {showAllVersions && (
                   <div className="p-4">
                     <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2">
                         <h3 className="font-medium text-gray-800">
                           All Versions - {client.totalEstimates} Estimates
                           <span className="text-xs text-gray-500 ml-1">(ordered by earliest activity)</span>
                         </h3>
                         
                         {/* Multi-select toggle */}
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleMultiSelect();
                           }}
                           className={`px-2 py-1 rounded text-xs flex items-center ${
                             isMultiSelectActive 
                               ? 'bg-red-500 text-white' 
                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                           }`}
                         >
                           {isMultiSelectActive ? 'Cancel' : 'Multi-Select'}
                         </button>
                       </div>
                       
                       {/* Bulk Action Buttons */}
                       {isMultiSelectActive && getSelectedEstimatesCount() > 0 && (
                         <div className="flex gap-2">
                           <button
                             onClick={handleApproveMultiple}
                             disabled={isApprovingMultiple}
                             className={`px-3 py-1.5 rounded text-sm ${
                               isApprovingMultiple
                               ? 'bg-green-300 text-white cursor-wait' 
                               : 'bg-green-600 text-white hover:bg-green-700'
                             } flex items-center gap-1.5`}
                           >
                             {isApprovingMultiple ? (
                               <>
                                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Processing...
                               </>
                             ) : (
                               <>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                 </svg>
                                 Approve {getSelectedEstimatesCount()}
                               </>
                             )}
                           </button>
                           <button
                             onClick={handleRejectMultiple}
                             disabled={isApprovingMultiple}
                             className={`px-3 py-1.5 rounded text-sm ${
                               isApprovingMultiple
                               ? 'bg-red-300 text-white cursor-wait' 
                               : 'bg-red-600 text-white hover:bg-red-700'
                             } flex items-center gap-1.5`}
                           >
                             {isApprovingMultiple ? (
                               <>
                                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Processing...
                               </>
                             ) : (
                               <>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                 </svg>
                                 Reject {getSelectedEstimatesCount()}
                               </>
                             )}
                           </button>
                         </div>
                       )}
                     </div>
                     
                     {/* All versions shown with dividers between them */}
                     {Array.from(client.versions.entries())
                       .sort(([a], [b]) => parseInt(a) - parseInt(b))
                       .map(([versionId, versionData]) => (
                       <div key={versionId} className="mb-6">
                         <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center">
                             <h4 className="text-md font-medium text-gray-700">
                               Version {versionId}
                             </h4>
                             <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                               {versionData.count} Estimate{versionData.count !== 1 ? 's' : ''}
                             </span>
                             <span className="ml-2 text-xs text-gray-500">(ordered by earliest activity)</span>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             {/* Select All for this version */}
                             {isMultiSelectActive && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   selectAllCurrentVersionEstimates(client.id, versionId);
                                 }}
                                 className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                   <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                   <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                                   </svg>
                                 Select All
                               </button>
                             )}
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                           {versionData.estimates.map((estimate, index) => (
                             <EscrowCard
                               key={estimate.id}
                               estimate={estimate}
                               estimateNumber={index + 1}
                               onViewDetails={() => handleViewEstimate(estimate)}
                               onApprove={processApproveEstimate}
                               onReject={processRejectEstimate}
                               // Multi-select props
                               isMultiSelectActive={isMultiSelectActive}
                               isSelected={selectedEstimates[estimate.id]?.selected || false}
                               onSelectToggle={(isSelected) => toggleEstimateSelection(
                                 estimate.id, 
                                 isSelected, 
                                 estimate.versionId || "1"
                               )}
                             />
                           ))}
                         </div>
                         
                         {/* Add divider between versions */}
                         {Array.from(client.versions.keys()).pop() !== versionId && (
                           <div className="border-b border-gray-200 my-4"></div>
                         )}
                       </div>
                     ))}
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

      {/* Approval Modal - kept for backward compatibility */}
      {isApprovalModalOpen && estimateToApprove && (
        <EscrowApprovalModal
          estimate={estimateToApprove}
          isOpen={isApprovalModalOpen}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setEstimateToApprove(null);
          }}
          onApprove={processApproveEstimate}
          onReject={processRejectEstimate}
          isProcessing={isProcessingApproval}
        />
      )}
    </div>
  );
};

export default EscrowDashboard;