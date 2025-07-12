import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, where, getDoc, query, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import EstimateCard from "./EstimateCard";
import UnifiedDetailsModal from "../Shared/UnifiedDetailsModal";
import EstimatePreviewModal from "./EstimatePreviewModal";
import EstimateTemplate from "./EsimateTemplate";
import EditEstimateModal from "./EditEstimateModal";
import VersionTransferModal from "./VersionTransferModal";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from "react-dom/client";
import { useAuth } from "../Login/AuthContext";
import { normalizeDataForOrders } from "../../utils/normalizeDataForOrders";
import OrderSerializationService from "../../utils/OrderSerializationService";
import {
  createVersionTransferHelpers,
  createVersionTransferHandlers
} from "../../utils/versionTransferUtils";

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
  const [clientTypeFilter, setClientTypeFilter] = useState(""); // "", "B2B", "Direct"
  
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
  
  // Multi-select state for estimates
  const [selectedEstimates, setSelectedEstimates] = useState({});
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [isMovingMultiple, setIsMovingMultiple] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);

  // Version Transfer state
  const [isVersionTransferMode, setIsVersionTransferMode] = useState(false);
  const [isTransferringVersions, setIsTransferringVersions] = useState(false);

  // Initialize order serial counter on component mount
  useEffect(() => {
    OrderSerializationService.initializeCounter().catch(console.error);
  }, []);

  // Helper function to safely parse dates and provide fallbacks
  const getEstimateTimestamp = (estimate) => {
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
    
    return new Date().getTime();
  };

  // Sort estimates by creation/update time (oldest first)
  const sortEstimatesByTimestamp = (estimates) => {
    return [...estimates].sort((a, b) => {
      // Use createdAt as primary sort field
      const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      // If both have createdAt, sort by createdAt (oldest first)
      if (createdAtA && createdAtB) {
        return createdAtA - createdAtB; // A - B for ascending order (oldest first)
      }
      
      // Fallback to existing logic if createdAt is missing
      const timestampA = getEstimateTimestamp(a);
      const timestampB = getEstimateTimestamp(b);
      return timestampA - timestampB; // A - B for ascending order
    });
  };

  // Helper function to determine client type from estimate
  const getClientType = (estimate) => {
    const clientType = estimate.clientInfo?.clientType;
    if (clientType === "B2B") return "B2B";
    if (!clientType || clientType === "Direct" || clientType === "direct") return "Direct";
    return "Direct"; // Default fallback
  };

  // Fetch B2B client data if applicable
  useEffect(() => {
    const fetchB2BClientData = async () => {
      if (userRole === "b2b" && currentUser) {
        setIsB2BClient(true);
        
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.clientId) {
              setLinkedClientId(userData.clientId);
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

  useEffect(() => {
    if (!isMultiSelectActive) {
      setSelectedEstimates({});
      setIsVersionTransferMode(false); // Clear version transfer mode too
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

    if (!isB2BClient || linkedClientId) {
      fetchEstimates();
    }
  }, [isB2BClient, linkedClientId]);

  // Process estimates into client groups with proper ordering and filtering
  const clientGroups = React.useMemo(() => {
    let filtered = [...allEstimates];
    
    // Apply search filter
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
        filtered = filtered.filter(estimate => !estimate.movedToOrders && !estimate.isCanceled && !estimate.inEscrow);
      } else if (filterStatus === "Moved") {
        filtered = filtered.filter(estimate => estimate.movedToOrders);
      } else if (filterStatus === "Cancelled") {
        filtered = filtered.filter(estimate => estimate.isCanceled);
      } else if (filterStatus === "InEscrow") {
        filtered = filtered.filter(estimate => estimate.inEscrow);
      }
    }
    
    // Apply client type filter
    if (clientTypeFilter) {
      filtered = filtered.filter(estimate => {
        const estimateClientType = getClientType(estimate);
        return estimateClientType === clientTypeFilter;
      });
    }
    
    const groups = filtered.reduce((acc, estimate) => {
      const clientId = estimate.clientId || "unknown";
      const clientName = estimate.clientInfo?.name || estimate.clientName || "Unknown Client";
      
      const isClientActive = clientId === "unknown" ? true : (activeClientsMap[clientId] !== false);
      
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
      
      acc[clientId].estimates.push(estimate);
      acc[clientId].totalEstimates++;
      
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

    Object.values(groups).forEach(client => {
      client.estimates = sortEstimatesByTimestamp(client.estimates);
      
      client.versions.forEach((versionData, versionId) => {
        versionData.estimates = sortEstimatesByTimestamp(versionData.estimates);
        client.versions.set(versionId, versionData);
      });
    });

    return groups;
  }, [allEstimates, searchQuery, filterStatus, clientTypeFilter, activeClientsMap, showInactiveClients, isB2BClient, linkedClientId]);

  // Create version transfer helpers using the extracted utilities
  const versionHelpers = createVersionTransferHelpers(
    expandedClientId,
    clientGroups,
    selectedEstimates,
    allEstimates
  );

  // Create version transfer handlers using the extracted utilities
  const versionHandlers = createVersionTransferHandlers(
    setIsTransferringVersions,
    setAllEstimates,
    setSelectedEstimates,
    setIsVersionTransferMode,
    setIsMultiSelectActive
  );

  // Sort client groups alphabetically by client name
  const sortedClientGroups = React.useMemo(() => {
    return Object.values(clientGroups).sort((a, b) => {
      // Sort alphabetically by client name, case-insensitive
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }, [clientGroups]);

  // Toggle multi-select mode
  const toggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedEstimates({});
      setIsVersionTransferMode(false); // Clear version transfer mode too
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
    
    const client = clientGroups[clientId];
    if (!client) return;
    
    const versionData = client.versions.get(versionId);
    if (!versionData) return;
    
    const newSelections = { ...selectedEstimates };
    versionData.estimates.forEach(estimate => {
      if (!estimate.movedToOrders && !estimate.isCanceled && !estimate.inEscrow) {
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
    console.log("toggleClient called with:", clientId);
    console.log("Current expandedClientId:", expandedClientId);
    
    if (isB2BClient && clientId !== linkedClientId) {
      console.log("B2B client trying to access different client - blocked");
      return;
    }
    
    if (expandedClientId === clientId) {
      console.log("Collapsing client:", clientId);
      setExpandedClientId(null);
    } else {
      console.log("Expanding client:", clientId);
      setExpandedClientId(clientId);
      
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

  // Handle edit estimate
  const handleEditEstimate = (estimate) => {
    if (estimate.movedToOrders || estimate.isCanceled || estimate.inEscrow) {
      alert("Estimates that have been moved to orders, escrow, or canceled cannot be edited.");
      return;
    }
    
    setEstimateToEdit(estimate);
    setIsEditModalOpen(true);
  };

  // Handle save edited estimate with proper timestamp update
  const handleSaveEditedEstimate = async (editedEstimate) => {
    try {
      if (!editedEstimate) {
        throw new Error("No estimate data provided");
      }
      
      console.log("Saving edited estimate:", editedEstimate);
      
      if (!editedEstimate.clientName) {
        console.warn("clientName is missing, setting default value");
        editedEstimate.clientName = editedEstimate.clientInfo?.name || "Unknown Client";
      }
      
      console.log("Project name before saving:", editedEstimate.projectName);
      
      editedEstimate.updatedAt = new Date().toISOString();
      
      const estimateRef = doc(db, "estimates", editedEstimate.id);
      await updateDoc(estimateRef, editedEstimate);
      
      setAllEstimates(prev => prev.map(est => 
        est.id === editedEstimate.id ? editedEstimate : est
      ));
      
      setIsEditModalOpen(false);
      setEstimateToEdit(null);
      
      alert("Estimate updated successfully!");
    } catch (error) {
      console.error("Error updating estimate:", error);
      alert(`Failed to update estimate: ${error.message}`);
    }
  };

  // Handle moving estimate to orders or escrow with serial number generation
  const handleMoveToOrders = async (estimate) => {
    try {
      // Check if this is a B2B client
      const isB2B = estimate.clientInfo?.clientType === "B2B" || 
                    (estimate.clientInfo?.clientType || "").toUpperCase() === "B2B";
      
      if (isB2B) {
        // Move to escrow instead of orders (existing B2B flow)
        const estimateRef = doc(db, "estimates", estimate.id);
        const updateData = { 
          inEscrow: true,
          movedToEscrow: true,
          movedToEscrowAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(estimateRef, updateData);
        
        // Update local state
        setAllEstimates(prev => 
          prev.map(est => est.id === estimate.id ? { 
            ...est, 
            ...updateData
          } : est)
        );
        
        alert("Estimate successfully moved to escrow for B2B approval!");
      } else {
        // For direct clients, move directly to orders with serial number
        try {
          // Generate serial number (non-blocking - if it fails, order still gets created)
          const orderSerial = await OrderSerializationService.generateOrderSerial();
          
          // Normalize the data to ensure proper structure
          console.log("Moving estimate to orders, normalizing data first...");
          const normalizedEstimate = normalizeDataForOrders(estimate);
          
          // Add the key fields that mark this as an order
          normalizedEstimate.stage = "Not started yet";
          normalizedEstimate.status = "In Progress";
          normalizedEstimate.createdAt = new Date().toISOString();
          normalizedEstimate.orderCreatedFrom = 'estimate';
          normalizedEstimate.originalEstimateId = estimate.id;
          
          // Add serial number if generated successfully
          if (orderSerial) {
            normalizedEstimate.orderSerial = orderSerial;
            console.log(`Order will be created with serial: ${orderSerial}`);
          } else {
            console.warn('Serial number generation failed, order will be created without serial');
          }
          
          // Add to orders collection
          await addDoc(collection(db, "orders"), normalizedEstimate);

          // Update the estimate
          const estimateRef = doc(db, "estimates", estimate.id);
          const updateData = { 
            movedToOrders: true,
            updatedAt: new Date().toISOString()
          };
          
          // Add serial reference to estimate if generated
          if (orderSerial) {
            updateData.linkedOrderSerial = orderSerial;
          }
          
          await updateDoc(estimateRef, updateData);

          // Update local state
          setAllEstimates(prev => 
            prev.map(est => est.id === estimate.id ? { ...est, ...updateData } : est)
          );
          
          console.log("Successfully moved estimate to orders");
          
          // Show success message with serial number if available
          const successMessage = orderSerial 
            ? `Estimate successfully moved to orders! Order Serial: ${orderSerial}`
            : "Estimate successfully moved to orders!";
          alert(successMessage);
          
        } catch (orderError) {
          console.error("Error creating order:", orderError);
          throw orderError;
        }
      }
    } catch (error) {
      console.error("Error moving estimate:", error);
      alert("Failed to process estimate. See console for details.");
    }
  };

  // Handle moving multiple estimates to orders or escrow with serial numbers
  const handleMoveMultipleToOrders = async () => {
    try {
      setIsMovingMultiple(true);
      
      // Create a list of estimates to move
      const estimatesToMove = [];
      Object.keys(selectedEstimates).forEach(estimateId => {
        if (selectedEstimates[estimateId]?.selected) {
          const estimate = allEstimates.find(est => est.id === estimateId);
          if (estimate && !estimate.movedToOrders && !estimate.isCanceled && !estimate.inEscrow) {
            estimatesToMove.push(estimate);
          }
        }
      });
      
      if (estimatesToMove.length === 0) {
        alert("No valid estimates selected to move. Please select estimates that are not already moved, canceled, or in escrow.");
        setIsMovingMultiple(false);
        return;
      }
      
      // Create counters for tracking operations
      let directMoveCount = 0;
      let escrowMoveCount = 0;
      let serialNumbers = []; // Track generated serials
      const currentTimestamp = new Date().toISOString();
      
      // Process each estimate one by one, handling B2B and direct clients differently
      for (const estimate of estimatesToMove) {
        try {
          // Check if this is a B2B client
          const isB2B = estimate.clientInfo?.clientType === "B2B" || 
                        (estimate.clientInfo?.clientType || "").toUpperCase() === "B2B";
          
          if (isB2B) {
            // Move to escrow
            const estimateRef = doc(db, "estimates", estimate.id);
            await updateDoc(estimateRef, { 
              inEscrow: true,
              movedToEscrow: true,
              movedToEscrowAt: currentTimestamp,
              updatedAt: currentTimestamp
            });
            
            escrowMoveCount++;
          } else {
            // Move directly to orders with serial
            try {
              // Generate serial number
              const orderSerial = await OrderSerializationService.generateOrderSerial();
              
              const normalizedEstimate = normalizeDataForOrders(estimate);
              normalizedEstimate.stage = "Not started yet";
              normalizedEstimate.status = "In Progress";
              normalizedEstimate.createdAt = currentTimestamp;
              normalizedEstimate.orderCreatedFrom = 'estimate';
              normalizedEstimate.originalEstimateId = estimate.id;
              
              // Add serial if generated
              if (orderSerial) {
                normalizedEstimate.orderSerial = orderSerial;
                serialNumbers.push(orderSerial);
              }
              
              await addDoc(collection(db, "orders"), normalizedEstimate);
              
              const estimateRef = doc(db, "estimates", estimate.id);
              const updateData = { 
                movedToOrders: true,
                updatedAt: currentTimestamp
              };
              
              if (orderSerial) {
                updateData.linkedOrderSerial = orderSerial;
              }
              
              await updateDoc(estimateRef, updateData);
              
              directMoveCount++;
            } catch (orderError) {
              console.error(`Error creating order for estimate ${estimate.id}:`, orderError);
              // Continue with other estimates even if one fails
            }
          }
        } catch (error) {
          console.error(`Error processing estimate ${estimate.id}:`, error);
        }
      }
      
      // Update all estimates in local state
      setAllEstimates(prev => 
        prev.map(est => {
          if (selectedEstimates[est.id]?.selected && !est.movedToOrders && !est.isCanceled && !est.inEscrow) {
            const isB2B = est.clientInfo?.clientType === "B2B" || 
                          (est.clientInfo?.clientType || "").toUpperCase() === "B2B";
            
            if (isB2B) {
              return { 
                ...est, 
                inEscrow: true, 
                movedToEscrow: true,
                updatedAt: currentTimestamp
              };
            } else {
              return { 
                ...est, 
                movedToOrders: true,
                updatedAt: currentTimestamp
              };
            }
          }
          return est;
        })
      );
      
      // Show success message with details
      let successMessage = `Successfully processed ${estimatesToMove.length} estimates:\n`;
      successMessage += `${directMoveCount} direct estimates moved to orders\n`;
      successMessage += `${escrowMoveCount} B2B estimates moved to escrow`;
      
      if (serialNumbers.length > 0) {
        successMessage += `\n\nGenerated Order Serials:\n${serialNumbers.join(', ')}`;
      }
      
      alert(successMessage);
      
      // Clear selections
      setSelectedEstimates({});
      setIsMultiSelectActive(false);
      
    } catch (error) {
      console.error("Error during bulk processing:", error);
      alert("There was an error processing the selected estimates. Please check the console for details.");
    } finally {
      setIsMovingMultiple(false);
    }
  };

  // Handle cancel estimate with timestamp update
  const handleCancelEstimate = async (estimate) => {
    try {
      if (estimate.inEscrow) {
        alert("This estimate is currently in escrow and cannot be canceled. It must be rejected in the escrow system first.");
        return;
      }
      
      const estimateRef = doc(db, "estimates", estimate.id);
      const updateData = { 
        isCanceled: true,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(estimateRef, updateData);
      
      setAllEstimates(prev => 
        prev.map(est => est.id === estimate.id ? { ...est, ...updateData } : est)
      );
    } catch (error) {
      console.error("Error cancelling estimate:", error);
      alert("Failed to cancel estimate.");
    }
  };

  // Handle deleting an estimate
  const handleDeleteEstimate = async (estimate) => {
    try {
      if (estimate.inEscrow) {
        alert("This estimate is currently in escrow and cannot be deleted. It must be rejected in the escrow system first.");
        return;
      }
      
      const estimateRef = doc(db, "estimates", estimate.id);
      await deleteDoc(estimateRef);
      
      setAllEstimates(prev => prev.filter(est => est.id !== estimate.id));
    } catch (error) {
      console.error("Error deleting estimate:", error);
      alert("Failed to delete estimate.");
    }
  };

  // Handle preview job ticket for a specific client version
  const handlePreviewJobTicket = (clientId, versionId) => {
    try {
      const client = clientGroups[clientId];
      const versionData = client.versions.get(versionId);
      
      if (versionData && versionData.estimates.length > 0) {
        setPdfError(null);
        
        setPreviewData({
          clientName: client.name,
          clientId: client.id,
          version: versionId,
          estimates: versionData.estimates,
          clientInfo: {
            name: client.name,
            ...(versionData.estimates[0].clientInfo || {}),
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
      // Calculate pagination
      const ESTIMATES_PER_PAGE = 6;
      const totalPages = Math.ceil(previewData.estimates.length / ESTIMATES_PER_PAGE);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log(`Generating PDF with ${totalPages} pages for ${previewData.estimates.length} estimates`);
      
      // Process each page separately
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageNumber = pageIndex + 1;
        const startIndex = pageIndex * ESTIMATES_PER_PAGE;
        const endIndex = Math.min(startIndex + ESTIMATES_PER_PAGE, previewData.estimates.length);
        const pageEstimates = previewData.estimates.slice(startIndex, endIndex);
        
        console.log(`Processing page ${pageNumber}: estimates ${startIndex + 1}-${endIndex}`);
        
        // Create a temporary div for this page
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.background = 'white';
        document.body.appendChild(tempDiv);
        
        try {
          // Render only this page's estimates
          const root = createRoot(tempDiv);
          await new Promise(resolve => {
            root.render(
              <EstimateTemplate
                estimates={pageEstimates}
                clientInfo={previewData.clientInfo}
                version={previewData.version}
                onRenderComplete={resolve}
                // Pass page info for proper headers/footers
                currentPage={pageNumber}
                totalPages={totalPages}
                allEstimates={previewData.estimates} // For grand totals on last page
              />
            );
          });
          
          // Wait for rendering to complete
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Capture this page
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: 800,
            height: 1000, // A4 aspect ratio
            backgroundColor: '#ffffff'
          });

          // Add page to PDF
          if (pageIndex > 0) {
            pdf.addPage();
          }
          
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm
          
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (imgHeight > pdfHeight) {
            // Scale down if content is too tall
            const scale = pdfHeight / imgHeight;
            const adjustedWidth = pdfWidth * scale;
            const adjustedHeight = pdfHeight;
            
            pdf.addImage(
              canvas.toDataURL('image/jpeg', 0.95),
              'JPEG',
              (pdfWidth - adjustedWidth) / 2,
              0,
              adjustedWidth,
              adjustedHeight
            );
          } else {
            // Center vertically if content is shorter
            pdf.addImage(
              canvas.toDataURL('image/jpeg', 0.95),
              'JPEG',
              0,
              (pdfHeight - imgHeight) / 2,
              imgWidth,
              imgHeight
            );
          }
          
          console.log(`Page ${pageNumber} added to PDF`);
          
        } finally {
          // Clean up
          if (tempDiv && tempDiv.parentNode) {
            try {
              root.unmount();
            } catch (e) {
              console.warn('Error unmounting root:', e);
            }
            tempDiv.parentNode.removeChild(tempDiv);
          }
        }
      }
      
      // Save the multi-page PDF
      const fileName = `Customer_Estimate_${previewData.clientInfo.name}_V${previewData.version}_${totalPages}pages.pdf`;
      pdf.save(fileName);
      
      console.log(`PDF generated successfully: ${fileName}`);
      
    } catch (error) {
      console.error('Error generating paginated PDF:', error);
      setPdfError(error.message || 'Failed to generate paginated estimate');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDuplicateEstimate = async (estimate) => {
    try {
      const duplicatedEstimate = {
        ...estimate
      };
      
      delete duplicatedEstimate.id;
      
      const currentTimestamp = new Date().toISOString();
      duplicatedEstimate.createdAt = currentTimestamp;
      duplicatedEstimate.updatedAt = currentTimestamp;
      duplicatedEstimate.movedToOrders = false;
      duplicatedEstimate.isCanceled = false;
      duplicatedEstimate.inEscrow = false;
      duplicatedEstimate.movedToEscrow = false;
      
      duplicatedEstimate.isApproved = false;
      duplicatedEstimate.isRejected = false;
      duplicatedEstimate.approvalNotes = null;
      duplicatedEstimate.rejectionNotes = null;
      duplicatedEstimate.approvedAt = null;
      duplicatedEstimate.rejectedAt = null;
      duplicatedEstimate.approvedBy = null;
      duplicatedEstimate.rejectedBy = null;
      
      duplicatedEstimate.projectName = `${estimate.projectName || "Unnamed Project"} - Copy`;

      // CRITICAL FIX: Preserve calculations including markup information when duplicating
      if (estimate.calculations) {
        duplicatedEstimate.calculations = {
          ...estimate.calculations,
          // Ensure markup information is preserved
          markupType: estimate.calculations.markupType,
          markupPercentage: estimate.calculations.markupPercentage,
          markupAmount: estimate.calculations.markupAmount
        };
        
        console.log("Duplicating estimate with preserved markup:", {
          markupType: duplicatedEstimate.calculations.markupType,
          markupPercentage: duplicatedEstimate.calculations.markupPercentage
        });
      }

      const docRef = await addDoc(collection(db, "estimates"), duplicatedEstimate);
      
      const newEstimate = {
        ...duplicatedEstimate,
        id: docRef.id
      };
      
      setAllEstimates(prev => [...prev, newEstimate]);
      
      alert("Estimate duplicated successfully!");
      
      return newEstimate;
    } catch (error) {
      console.error("Error duplicating estimate:", error);
      throw error;
    }
  };

  // Version Transfer Event Handlers (using extracted utilities)
  const handleVersionTransferConfirm = async (targetVersionId) => {
    const movableEstimates = versionHelpers.getMovableEstimatesForTarget(targetVersionId);
    return await versionHandlers.handleVersionTransferConfirm(targetVersionId, movableEstimates);
  };

  const handleSingleEstimateVersionMoveLocal = (estimate) => {
    versionHandlers.handleSingleEstimateVersionMoveLocal(estimate);
  };

  const handleStartVersionTransfer = () => {
    const selectedCount = versionHelpers.getSelectedEstimatesCount();
    return versionHandlers.handleStartVersionTransfer(selectedCount);
  };

  const handleCancelVersionTransfer = () => {
    versionHandlers.handleCancelVersionTransfer();
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

  // Calculate counts for different estimate states including client type breakdown
  const estimateCounts = React.useMemo(() => {
    let pendingCount = 0;
    let movedCount = 0;
    let canceledCount = 0;
    let inEscrowCount = 0;
    let b2bCount = 0;
    let directCount = 0;
    
    allEstimates.forEach(estimate => {
      const clientType = getClientType(estimate);
      
      if (clientType === "B2B") {
        b2bCount++;
      } else {
        directCount++;
      }
      
      if (estimate.movedToOrders) {
        movedCount++;
      } else if (estimate.isCanceled) {
        canceledCount++;
      } else if (estimate.inEscrow) {
        inEscrowCount++;
      } else {
        pendingCount++;
      }
    });
    
    return { pendingCount, movedCount, canceledCount, inEscrowCount, b2bCount, directCount };
  }, [allEstimates]);

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

      {/* Stats Cards */}
      {!isB2BClient && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">Pending Estimates</h3>
            <p className="text-xl font-bold text-amber-600">{estimateCounts.pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to process</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">In Escrow</h3>
            <p className="text-xl font-bold text-purple-600">{estimateCounts.inEscrowCount}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting for B2B approval</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">Moved to Orders</h3>
            <p className="text-xl font-bold text-green-600">{estimateCounts.movedCount}</p>
            <p className="text-xs text-gray-500 mt-1">In production workflow</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">Canceled</h3>
            <p className="text-xl font-bold text-red-600">{estimateCounts.canceledCount}</p>
            <p className="text-xs text-gray-500 mt-1">No longer active</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">B2B Estimates</h3>
            <p className="text-xl font-bold text-purple-600">{estimateCounts.b2bCount}</p>
            <p className="text-xs text-gray-500 mt-1">Business clients</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-1">Direct Estimates</h3>
            <p className="text-xl font-bold text-blue-600">{estimateCounts.directCount}</p>
            <p className="text-xs text-gray-500 mt-1">Direct clients</p>
          </div>
        </div>
      )}

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
              <option value="InEscrow">In Escrow</option>
              <option value="Moved">Moved to Orders</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Client Types</option>
              <option value="B2B">B2B Clients</option>
              <option value="Direct">Direct Clients</option>
            </select>
            
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
        
        <div className="flex gap-2 mt-4 flex-wrap">
          <div className="bg-green-50 border border-green-100 rounded-md px-3 py-1.5 text-xs font-medium text-green-800">
            {clientCounts.activeCount} Active Client{clientCounts.activeCount !== 1 ? 's' : ''}
          </div>
          {showInactiveClients && clientCounts.inactiveCount > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-md px-3 py-1.5 text-xs font-medium text-red-800">
              {clientCounts.inactiveCount} Inactive Client{clientCounts.inactiveCount !== 1 ? 's' : ''}
            </div>
          )}
          {clientTypeFilter && (
            <div className={`border rounded-md px-3 py-1.5 text-xs font-medium ${
              clientTypeFilter === "B2B" 
                ? "bg-purple-50 border-purple-100 text-purple-800"
                : "bg-blue-50 border-blue-100 text-blue-800"
            }`}>
              Showing {clientTypeFilter} Clients Only
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-red-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-500">Loading estimates...</p>
        </div>
      ) : sortedClientGroups.length === 0 ? (
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
          {(searchQuery || filterStatus || clientTypeFilter || (!isB2BClient && !showInactiveClients)) && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {(searchQuery || filterStatus || clientTypeFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("");
                    setClientTypeFilter("");
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
          {/* Client Groups - Now sorted alphabetically */}
          {sortedClientGroups.map((client) => (
            <div key={client.id} className={`bg-white rounded-lg shadow-sm border ${!client.isActive ? 'border-red-300 border-l-4' : 'border-gray-200'} overflow-hidden`}>
              {/* Client Header */}
              <div 
                className={`px-4 py-3 ${expandedClientId === client.id ? 'bg-gray-50' : ''} cursor-pointer transition-colors hover:bg-gray-50 flex justify-between items-center`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Client header clicked:", client.id);
                  toggleClient(client.id);
                }}
                style={{ cursor: 'pointer' }}
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
                <div className="flex items-center pointer-events-none">
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
                      {Array.from(client.versions.entries()).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([versionId, versionData]) => (
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
                          {/* NEW: Version Transfer Button */}
                          {isMultiSelectActive && versionHelpers.getSelectedEstimatesCount() > 0 && (
                            <button
                              onClick={handleStartVersionTransfer}
                              disabled={isVersionTransferMode || isTransferringVersions}
                              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                                isVersionTransferMode || isTransferringVersions
                                ? 'bg-purple-300 text-white cursor-wait' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Move to Version ({versionHelpers.getSelectedEstimatesCount()})
                            </button>
                          )}
                          
                          {/* Existing Bulk Move Action Button */}
                          {isMultiSelectActive && versionHelpers.getSelectedEstimatesCount() > 0 && !isVersionTransferMode && (
                            <button
                              onClick={handleMoveMultipleToOrders}
                              disabled={isMovingMultiple}
                              className={`px-3 py-1.5 rounded text-sm ${
                                isMovingMultiple
                                ? 'bg-blue-300 text-white cursor-wait' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                              } flex items-center gap-1.5`}
                            >
                              {isMovingMultiple ? (
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
                                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                                    <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                  </svg>
                                  Process {versionHelpers.getSelectedEstimatesCount()}
                                </>
                              )}
                            </button>
                          )}
                          
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
                      </div>
                      
                      {/* Enhanced EstimateCard Grid with Version Transfer Props */}
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
                            onMoveToVersion={() => handleSingleEstimateVersionMoveLocal(estimate)}
                            isAdmin={userRole === "admin"}
                            isStaff={userRole === "staff"}
                            // Multi-select props
                            isMultiSelectActive={isMultiSelectActive}
                            isSelected={selectedEstimates[estimate.id]?.selected || false}
                            onSelectToggle={(isSelected) => toggleEstimateSelection(
                              estimate.id, 
                              isSelected, 
                              estimate.versionId || "1"
                            )}
                            // Version transfer props
                            availableVersions={versionHelpers.getAllAvailableVersions()}
                            currentVersion={selectedVersions[client.id]}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show all versions at once with enhanced version transfer */}
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
                        
                        <div className="flex gap-2">
                          {/* Version Transfer Button for All Versions */}
                          {isMultiSelectActive && versionHelpers.getSelectedEstimatesCount() > 0 && (
                            <button
                              onClick={handleStartVersionTransfer}
                              disabled={isVersionTransferMode || isTransferringVersions}
                              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                                isVersionTransferMode || isTransferringVersions
                                ? 'bg-purple-300 text-white cursor-wait' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Move to Version ({versionHelpers.getSelectedEstimatesCount()})
                            </button>
                          )}

                          {/* Bulk Move Action Button */}
                          {isMultiSelectActive && versionHelpers.getSelectedEstimatesCount() > 0 && !isVersionTransferMode && (
                            <button
                              onClick={handleMoveMultipleToOrders}
                              disabled={isMovingMultiple}
                              className={`px-3 py-1.5 rounded text-sm ${
                                isMovingMultiple
                                ? 'bg-blue-300 text-white cursor-wait' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                              } flex items-center gap-1.5`}
                            >
                              {isMovingMultiple ? (
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
                                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                                    <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                  </svg>
                                  Process {versionHelpers.getSelectedEstimatesCount()}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* All versions with enhanced estimate cards */}
                      {Array.from(client.versions.entries()).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([versionId, versionData]) => (
                        <div key={versionId} className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <h4 className="text-md font-medium text-gray-700">
                                Version {versionId}
                              </h4>
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                {versionData.count} Estimate{versionData.count !== 1 ? 's' : ''}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">(ordered by latest activity)</span>
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
                              
                              <button
                                onClick={() => handlePreviewJobTicket(client.id, versionId)}
                                className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                Preview
                              </button>
                            </div>
                          </div>
                          
                          {/* Enhanced estimate cards with version transfer */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                            {versionData.estimates.map((estimate, index) => (
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
                                onMoveToVersion={() => handleSingleEstimateVersionMoveLocal(estimate)}
                                isAdmin={userRole === "admin"}
                                isStaff={userRole === "staff"}
                                // Multi-select props
                                isMultiSelectActive={isMultiSelectActive}
                                isSelected={selectedEstimates[estimate.id]?.selected || false}
                                onSelectToggle={(isSelected) => toggleEstimateSelection(
                                  estimate.id, 
                                  isSelected, 
                                  estimate.versionId || "1"
                                )}
                                // Version transfer props
                                availableVersions={versionHelpers.getAllAvailableVersions()}
                                currentVersion={versionId}
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

      {/* Preview Modal */}
      {isPreviewOpen && (
        <EstimatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleGenerateJobTicket}
          isGeneratingPDF={isGeneratingPDF}
          error={pdfError}
          estimates={previewData?.estimates || []}
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

      {/* Version Transfer Modal */}
      {isVersionTransferMode && (
        <VersionTransferModal
          isOpen={isVersionTransferMode}
          onClose={handleCancelVersionTransfer}
          onConfirm={handleVersionTransferConfirm}
          availableVersions={versionHelpers.getAllAvailableVersions()}
          currentVersion={selectedVersions[expandedClientId]}
          estimateCount={versionHelpers.getSelectedEstimatesForModal().length}
          movableCount={versionHelpers.getMovableEstimatesForTarget("").length}
          selectedEstimates={versionHelpers.getSelectedEstimatesForModal()}
          clientName={expandedClientId ? clientGroups[expandedClientId]?.name : ""}
        />
      )}
    </div>
  );
};

export default EstimatesPage;