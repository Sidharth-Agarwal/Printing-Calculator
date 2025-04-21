import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import OrderDetailsModal from './OrderDetailsModal';
import { useAuth } from "../Login/AuthContext"; // Add auth context

const OrdersPage = () => {
  const { userRole, currentUser } = useAuth(); // Get user role and current user
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc"); // Default sort: Latest to oldest
  const [stageFilter, setStageFilter] = useState(""); // Default: All stages
  const [viewMode, setViewMode] = useState("all"); // Default: Active orders
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStageUpdate, setPendingStageUpdate] = useState(null);

  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery', 'Completed'];

  const sortOptions = {
    "quantity-asc": "Quantity - Low to High",
    "quantity-desc": "Quantity - High to Low",
    "date-desc": "Delivery Date - Latest to Oldest",
    "date-asc": "Delivery Date - Oldest to Latest",
    "status": "Status"
  };

  const stageColors = {
    'Not started yet': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'Design': { bg: 'bg-[#6366F1]', text: 'text-white' },
    'Positives': { bg: 'bg-[#06B6D4]', text: 'text-white' },
    'Printing': { bg: 'bg-[#F97316]', text: 'text-white' },
    'Quality Check': { bg: 'bg-[#EC4899]', text: 'text-white' },
    'Delivery': { bg: 'bg-[#10B981]', text: 'text-white' },
    'Completed': { bg: 'bg-[#4F46E5]', text: 'text-white' }
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
              clientName: data.clientInfo?.name || data.clientName || '',
              projectName: data.projectName || '',
              date: data.date || null,
              deliveryDate: data.deliveryDate || null,
              stage: data.stage || 'Not started yet',
              status: data.status || 'In Progress',
              completed: data.stage === 'Completed',
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
          setOrders(ordersData);
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

  // Sort function
  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortBy) {
        case "quantity-asc":
          return (a.jobDetails?.quantity || 0) - (b.jobDetails?.quantity || 0);
        case "quantity-desc":
          return (b.jobDetails?.quantity || 0) - (a.jobDetails?.quantity || 0);
        case "date-desc":
          return new Date(b.deliveryDate || 0) - new Date(a.deliveryDate || 0);
        case "date-asc":
          return new Date(a.deliveryDate || 0) - new Date(b.deliveryDate || 0);
        case "status": {
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

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order.clientName && order.clientName.toLowerCase().includes(query)) ||
        (order.projectName && order.projectName.toLowerCase().includes(query)) ||
        (order.jobDetails?.jobType && order.jobDetails.jobType.toLowerCase().includes(query)) ||
        (order.jobDetails?.quantity && order.jobDetails.quantity.toString().includes(query))
      );
    }

    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter(order => order.stage === stageFilter);
    }

    // Apply view mode filter
    if (viewMode === 'active') {
      filtered = filtered.filter(order => order.stage !== 'Completed');
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(order => order.stage === 'Completed');
    }

    // Apply sorting
    const sortedOrders = sortOrders(filtered);
    setFilteredOrders(sortedOrders);
  }, [searchQuery, orders, sortBy, stageFilter, viewMode]);

  const handleStageUpdateRequest = (orderId, currentStage, newStage) => {
    setPendingStageUpdate({ orderId, currentStage, newStage });
    setShowConfirmation(true);
  };

  const updateStage = async () => {
    if (!pendingStageUpdate) return;
    
    try {
      setUpdating(true);
      const { orderId, newStage } = pendingStageUpdate;
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        stage: newStage,
        status: newStage === 'Completed' ? 'Completed' : 'In Progress',
        lastUpdated: new Date().toISOString(),
        ...(newStage === 'Completed' ? { completedAt: new Date().toISOString() } : {})
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      throw error;
    } finally {
      setUpdating(false);
      setShowConfirmation(false);
      setPendingStageUpdate(null);
    }
  };

  const cancelStageUpdate = () => {
    setShowConfirmation(false);
    setPendingStageUpdate(null);
  };

  const StatusCircle = ({ stage, currentStage, orderId }) => {
    // Don't allow B2B clients to update stages
    if (isB2BClient) {
      const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
      const thisStageOrder = stages.indexOf(stage);
      const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
      const colors = stageColors[stage] || { bg: 'bg-gray-200' };
      
      return (
        <div className="flex justify-center">
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center
              transition duration-150 ease-in-out
              ${isCompleted ? colors.bg : 'bg-gray-200'}`}
          >
            {isCompleted && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      );
    }
    
    // Admin functionality remains the same
    const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
    const thisStageOrder = stages.indexOf(stage);
    const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
    const isCurrent = currentStage === stage;
    const colors = stageColors[stage] || { bg: 'bg-gray-200' };
  
    const handleStageClick = (e) => {
      e.stopPropagation();
      if (updating) return;
  
      if (isCurrent) {
        const previousStage = stages[thisStageOrder - 1] || 'Not started yet';
        handleStageUpdateRequest(orderId, currentStage, previousStage);
      } else {
        handleStageUpdateRequest(orderId, currentStage, stage);
      }
    };
  
    return (
      <div className="flex justify-center">
        <div 
          onClick={handleStageClick}
          className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
            transition duration-150 ease-in-out
            ${isCompleted ? colors.bg : 'bg-gray-200'}`}
        >
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            {isB2BClient ? "Your Orders" : "Orders"}
          </h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

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
      {/* Header Section - More Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">
          {isB2BClient ? "Your Orders" : "Orders"}
        </h1>
        
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {/* View mode selector - Smaller */}
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
          
          {/* Search input - Smaller */}
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md flex-grow sm:w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          {/* Stage filter dropdown - Smaller */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          
          {/* Sort dropdown - Smaller */}
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

      <div className="bg-white rounded-lg shadow-sm">
        {filteredOrders.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs">
                {!isB2BClient && (
                  <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                    Client
                  </th>
                )}
                <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                  Project
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                  Quantity
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                  Delivery
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                  Status
                </th>
                {stages.slice(1).map((stage) => (
                  <th key={stage} className="px-2 py-2 text-center font-medium text-gray-500 whitespace-nowrap text-xs">
                    {stage.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {!isB2BClient && (
                    <td className="px-3 py-2">
                      <span className="text-blue-600 hover:underline font-medium">
                        {order.clientName}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2">
                    {order.projectName || 'Unnamed Project'}
                  </td>
                  <td className="px-3 py-2">
                    {order.jobDetails?.jobType || 'N/A'}
                  </td>
                  <td className="px-3 py-2">
                    {order.jobDetails?.quantity || 'N/A'}
                  </td>
                  <td className="px-3 py-2">
                    {formatDate(order.deliveryDate)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full text-white inline-block
                      ${stageColors[order.stage]?.bg || 'bg-gray-100'}`}
                    >
                      {order.stage || 'Not started yet'}
                    </span>
                  </td>
                  {stages.slice(1).map((stage) => (
                    <td key={`${order.id}-${stage}`} className="px-2 py-2 text-center">
                      <StatusCircle 
                        stage={stage} 
                        currentStage={order.stage} 
                        orderId={order.id}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-700 mt-3 mb-1">No Orders Found</h2>
            <p className="text-sm text-gray-500">
              {isB2BClient 
                ? "You don't have any orders yet."
                : "No orders found matching your criteria."}
            </p>
            {(searchQuery || stageFilter || viewMode !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("");
                  setViewMode("all");
                }}
                className="mt-3 text-blue-500 hover:underline text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingStageUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-md">
            <h3 className="text-lg font-medium mb-3">Confirm Stage Update</h3>
            <p className="mb-3 text-sm">
              Are you sure you want to change the stage from
              <span className="font-medium"> "{pendingStageUpdate.currentStage}" </span>
              to
              <span className="font-medium"> "{pendingStageUpdate.newStage}"</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelStageUpdate}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateStage}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStageUpdate={(newStage) => handleStageUpdateRequest(selectedOrder.id, selectedOrder.stage, newStage)}
        />
      )}
    </div>
  );
};

export default OrdersPage;