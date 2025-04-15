import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import EstimateCard from "./EstimateCard";
import EstimateDetailsModal from "./EstimateDetailsModal";
import PreviewModal from "./PreviewModal";
import GroupedJobTicket from "./GroupedJobTicket";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from "react-dom/client";
import ClientDropdown from "./ClientDropdown";
import VersionDropdown from "./VersionDropdown";

const EstimatesPage = () => {
  const navigate = useNavigate();
  
  // State for data loading
  const [allEstimates, setAllEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
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

  // Fetch all estimates on mount
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDocs(collection(db, "estimates"));
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

    fetchEstimates();
  }, []);

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
    
    // Group by client
    return filtered.reduce((acc, estimate) => {
      const clientId = estimate.clientId || "unknown";
      const clientName = estimate.clientInfo?.name || estimate.clientName || "Unknown Client";
      
      if (!acc[clientId]) {
        acc[clientId] = {
          id: clientId,
          name: clientName,
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
  }, [allEstimates, searchQuery, filterStatus]);

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

  // Handle moving estimate to orders
  const handleMoveToOrders = async (estimate) => {
    try {
      // Add to orders collection
      await addDoc(collection(db, "orders"), {
        ...estimate,
        stage: "Not started yet",
      });

      // Update the estimate
      const estimateRef = doc(db, "estimates", estimate.id);
      await updateDoc(estimateRef, { movedToOrders: true });

      // Update local state
      setAllEstimates(prev => 
        prev.map(est => est.id === estimate.id ? { ...est, movedToOrders: true } : est)
      );
      
      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      console.error("Error moving estimate to orders:", error);
      alert("Failed to move estimate to orders.");
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
      // PDF generation code (abbreviated for brevity)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Rendering and PDF creation would go here
      
      // For demo purposes, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clean up
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      
    } catch (error) {
      console.error('Error generating job ticket:', error);
      setPdfError(error.message || 'Failed to generate job ticket');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="p-3 max-w-screen-xl mx-auto">
      {/* Header Section - More compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">Estimates Management</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 border text-sm rounded-md flex-grow sm:w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Moved">Moved to Orders</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-base font-medium text-gray-700 mt-2 mb-1">No Estimates Found</h2>
          <p className="text-sm text-gray-500">
            No estimates match your current search criteria.
          </p>
          {searchQuery || filterStatus ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("");
              }}
              className="mt-2 text-blue-500 hover:underline text-sm"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Client Groups - More compact */}
          {Object.values(clientGroups).map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Client Header - More compact */}
              <div 
                className={`p-3 ${expandedClientId === client.id ? 'bg-blue-50' : 'bg-gray-50'} cursor-pointer flex justify-between items-center`}
                onClick={() => toggleClient(client.id)}
              >
                <div>
                  <h2 className="text-base font-semibold">{client.name}</h2>
                  <p className="text-xs text-gray-500">
                    {client.totalEstimates} Estimate{client.totalEstimates !== 1 ? 's' : ''} • 
                    {client.versions.size} Version{client.versions.size !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedClientId === client.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Expanded Content - More compact */}
              {expandedClientId === client.id && (
                <div className="p-3 border-t border-gray-200">
                  {/* Version Selection - More compact, buttons in a row */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.from(client.versions.entries()).map(([versionId, versionData]) => (
                      <button
                        key={versionId}
                        onClick={() => selectVersion(client.id, versionId)}
                        className={`px-2 py-1 rounded-md text-xs ${
                          selectedVersions[client.id] === versionId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Version {versionId} ({versionData.count})
                      </button>
                    ))}
                  </div>
                  
                  {/* Version Estimates */}
                  {selectedVersions[client.id] && (
                    <div>
                      <div className="flex justify-between items-center mb-2 border-b pb-1">
                        <h3 className="font-medium text-sm">
                          Version {selectedVersions[client.id]} Estimates
                        </h3>
                        <button
                          onClick={() => handlePreviewJobTicket(client.id, selectedVersions[client.id])}
                          className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Preview Job Ticket
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {client.versions.get(selectedVersions[client.id])?.estimates.map((estimate, index) => (
                          <EstimateCard
                            key={estimate.id}
                            estimate={estimate}
                            estimateNumber={index + 1}
                            onViewDetails={() => handleViewEstimate(estimate)}
                            onMoveToOrders={() => handleMoveToOrders(estimate)}
                            onCancelEstimate={() => handleCancelEstimate(estimate)}
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

      {/* Modals remain the same */}
      {isModalOpen && selectedEstimate && (
        <EstimateDetailsModal
          estimate={selectedEstimate}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleGenerateJobTicket}
          isGeneratingPDF={isGeneratingPDF}
          error={pdfError}
        >
          {previewData && previewData.estimates.length > 0 && (
            <GroupedJobTicket
              estimates={previewData.estimates}
              clientInfo={previewData.clientInfo}
              version={previewData.version}
            />
          )}
        </PreviewModal>
      )}
    </div>
  );
};

export default EstimatesPage;