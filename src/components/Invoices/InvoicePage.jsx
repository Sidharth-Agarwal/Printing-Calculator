import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, onSnapshot, addDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import UnifiedDetailsModal from '../Shared/UnifiedDetailsModal'; 
import ClientInvoiceGroup from './ClientInvoiceGroup';
import NewInvoiceModal from './NewInvoiceModal';
import { useAuth } from "../Login/AuthContext";

const InvoicesPage = () => {
  const { userRole, currentUser } = useAuth(); // Get user role and current user
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState(null);
  const [linkedClientName, setLinkedClientName] = useState("");
  
  // State for data loading
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // All orders by default
  const [viewMode, setViewMode] = useState('active'); // 'active', 'completed', 'all'
  const [sortBy, setSortBy] = useState('date-desc'); // Default sort
  
  // State for expanded clients and selection
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // State for modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Available stages for orders - added "Completed" as final stage
  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery', 'Completed'];

  // Sort options for dropdown
  const sortOptions = {
    "quantity-asc": "Quantity - Low to High",
    "quantity-desc": "Quantity - High to Low",
    "date-desc": "Delivery Date - Latest to Oldest",
    "date-asc": "Delivery Date - Oldest to Latest",
    "stage": "Stage"
  };

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
              
              // Also get the client name for display
              const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
              if (clientDoc.exists()) {
                setLinkedClientName(clientDoc.data().name);
              }
              
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

  // Fetch all orders on mount
  useEffect(() => {
    let ordersQuery = collection(db, "orders");
    
    // If B2B client, filter orders by clientId
    if (isB2BClient && linkedClientId) {
      ordersQuery = query(
        collection(db, "orders"),
        where("clientId", "==", linkedClientId)
      );
    }
    
    const unsubscribe = onSnapshot(
      ordersQuery,
      {
        includeMetadataChanges: true
      },
      (snapshot) => {
        try {
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              clientId: data.clientId || "unknown",
              clientName: data.clientInfo?.name || data.clientName || 'Unknown Client',
              clientInfo: data.clientInfo || null,
              projectName: data.projectName || '',
              date: data.date || null,
              deliveryDate: data.deliveryDate || null,
              stage: data.stage || 'Not started yet',
              status: data.status || 'In Progress',
              jobDetails: data.jobDetails || {},
              dieDetails: data.dieDetails || {},
              calculations: data.calculations || {},
              lpDetails: data.lpDetails || null,
              fsDetails: data.fsDetails || null,
              embDetails: data.embDetails || null,
              digiDetails: data.digiDetails || null,
              dieCutting: data.dieCutting || null,
              sandwich: data.sandwich || null,
              pasting: data.pasting || {}
            };
          });
          
          setAllOrders(ordersData);
          setError(null);
        } catch (err) {
          console.error("Error processing orders data:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [isB2BClient, linkedClientId]);

  // Update order stage
  const updateOrderStage = async (orderId, newStage) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        stage: newStage,
        status: newStage === 'Completed' ? 'Completed' : 'In Progress',
        lastUpdated: new Date().toISOString(),
        // If the stage is completed, add a completion date
        ...(newStage === 'Completed' ? { completedAt: new Date().toISOString() } : {})
      });
      
      // Success message could be added here
    } catch (error) {
      console.error("Error updating order stage:", error);
      alert("Failed to update order stage. Please try again.");
    }
  };

  // Sort function
  const sortOrders = (ordersToSort, sortOption) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortOption) {
        case "quantity-asc":
          return (parseInt(a.jobDetails?.quantity) || 0) - (parseInt(b.jobDetails?.quantity) || 0);
        case "quantity-desc":
          return (parseInt(b.jobDetails?.quantity) || 0) - (parseInt(a.jobDetails?.quantity) || 0);
        case "date-desc":
          return new Date(b.deliveryDate || 0) - new Date(a.deliveryDate || 0);
        case "date-asc":
          return new Date(a.deliveryDate || 0) - new Date(b.deliveryDate || 0);
        case "stage": {
          // Get the index of each stage from the stages array
          const stageIndexA = stages.indexOf(a.stage);
          const stageIndexB = stages.indexOf(b.stage);
          // Sort by stage index (this will follow the order in the stages array)
          return stageIndexA - stageIndexB;
        }
        default:
          return new Date(b.date || 0) - new Date(a.date || 0);
      }
    });
  };

  // Filter and group orders by client
  const clientGroups = React.useMemo(() => {
    // Apply search filter
    let filtered = [...allOrders];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        (order.clientName && order.clientName.toLowerCase().includes(query)) ||
        (order.projectName && order.projectName.toLowerCase().includes(query)) ||
        (order.jobDetails?.jobType && order.jobDetails.jobType.toLowerCase().includes(query)) ||
        (order.jobDetails?.quantity && order.jobDetails.quantity.toString().includes(query))
      );
    }
    
    // Apply status/stage filter
    if (filterStatus) {
      filtered = filtered.filter(order => order.stage === filterStatus);
    }
    
    // Apply view mode filter (active/completed)
    if (viewMode === 'active') {
      filtered = filtered.filter(order => order.stage !== 'Completed');
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(order => order.stage === 'Completed');
    }
    
    // Sort filtered orders
    filtered = sortOrders(filtered, sortBy);
    
    // Group by client
    return filtered.reduce((acc, order) => {
      // Use clientId as the key for grouping
      const clientId = order.clientId || "unknown";
      
      // Create client group if it doesn't exist
      if (!acc[clientId]) {
        acc[clientId] = {
          id: clientId,
          name: order.clientName || "Unknown Client",
          clientInfo: order.clientInfo,
          orders: [],
          totalOrders: 0,
          completedOrders: 0,
          totalQuantity: 0
        };
      }
      
      // Add order to client group
      acc[clientId].orders.push(order);
      acc[clientId].totalOrders++;
      
      // Count completed orders
      if (order.stage === 'Completed') {
        acc[clientId].completedOrders++;
      }
      
      // Sum up quantity
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      acc[clientId].totalQuantity += quantity;
      
      return acc;
    }, {});
  }, [allOrders, searchQuery, filterStatus, sortBy, viewMode, stages]);

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
    }
  };

  // Handle order selection
  const handleOrderSelection = (orderId, isSelected) => {
    if (isSelected) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  // Handle select all orders for a client
  const handleSelectAllClientOrders = (clientId, isSelected) => {
    const clientOrders = clientGroups[clientId]?.orders || [];
    const clientOrderIds = clientOrders.map(order => order.id);
    
    if (isSelected) {
      // Add all client orders that aren't already selected
      setSelectedOrders(prev => {
        const currentSelectedSet = new Set(prev);
        clientOrderIds.forEach(id => currentSelectedSet.add(id));
        return Array.from(currentSelectedSet);
      });
    } else {
      // Remove all client orders
      setSelectedOrders(prev => 
        prev.filter(id => !clientOrderIds.includes(id))
      );
    }
  };

  // Handle invoice generation for selected orders
  const handleGenerateInvoice = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to generate an invoice.");
      return;
    }
    
    // Open invoice modal
    setIsInvoiceModalOpen(true);
  };

  // Handle view order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  // Reset selection
  const clearSelection = () => {
    setSelectedOrders([]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            {isB2BClient ? "Your Invoices" : "Invoices Management"}
          </h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading orders</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">
          {isB2BClient ? "Your Invoices" : "Invoices Management"}
        </h1>
        
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {/* View mode selector */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 text-xs ${
                viewMode === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('active')}
              className={`px-2 py-1 text-xs ${
                viewMode === 'active' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('completed')}
              className={`px-2 py-1 text-xs ${
                viewMode === 'completed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
          
          {/* Search and filter controls */}
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 border text-xs rounded-md flex-grow sm:w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                Sort: {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Selection Controls */}
      {selectedOrders.length > 0 && (
        <div className="mb-3 bg-blue-50 p-2 rounded-lg flex justify-between items-center text-sm">
          <div>
            <span className="font-medium">{selectedOrders.length}</span> orders selected
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleGenerateInvoice}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Invoice
            </button>
            <button
              onClick={clearSelection}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Client Groups */}
      {Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-700 mt-3 mb-1">No Orders Found</h2>
          <p className="text-sm text-gray-500">
            {isB2BClient 
              ? "You don't have any orders ready for invoicing yet."
              : viewMode === 'active' 
                ? 'There are no active orders that match your search criteria.' 
                : viewMode === 'completed' 
                  ? 'There are no completed orders that match your search criteria.'
                  : 'No orders match your search criteria.'}
          </p>
          {(searchQuery || filterStatus || viewMode !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("");
                setViewMode("all");
              }}
              className="mt-3 text-blue-500 hover:underline text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* List of client groups */}
          {Object.values(clientGroups).map((client) => (
            <ClientInvoiceGroup
              key={client.id}
              client={client}
              isExpanded={expandedClientId === client.id}
              onToggle={() => toggleClient(client.id)}
              selectedOrders={selectedOrders}
              onSelectOrder={handleOrderSelection}
              onSelectAllOrders={handleSelectAllClientOrders}
              onOrderClick={handleViewOrderDetails}
              onUpdateStage={updateOrderStage}
              stages={stages}
            />
          ))}
        </div>
      )}

      {/* Using Unified Modal Component for Order Details */}
      {isOrderDetailsModalOpen && selectedOrder && (
        <UnifiedDetailsModal
          data={selectedOrder}
          dataType="invoice"
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <NewInvoiceModal
          selectedOrderIds={selectedOrders}
          orders={allOrders.filter(order => selectedOrders.includes(order.id))}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InvoicesPage;