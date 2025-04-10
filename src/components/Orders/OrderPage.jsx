import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import OrderDetailsModal from './OrderDetailsModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc"); // Default sort: Latest to oldest
  const [stageFilter, setStageFilter] = useState(""); // Default: All stages
  const [viewMode, setViewMode] = useState("active"); // Default: Active orders
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
    'Design': { bg: 'bg-[#6366F1]' },
    'Positives': { bg: 'bg-[#06B6D4]' },
    'Printing': { bg: 'bg-[#F97316]' },
    'Quality Check': { bg: 'bg-[#EC4899]' },
    'Delivery': { bg: 'bg-[#10B981]' },
    'Completed': { bg: 'bg-[#4F46E5]' }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      {
        includeMetadataChanges: true
      },
      (snapshot) => {
        try {
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              clientName: data.clientInfo.name || '',
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
  }, []);

  // Sort function
  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortBy) {
        case "quantity-asc":
          return (a.jobDetails?.quantity || 0) - (b.jobDetails?.quantity || 0);
        case "quantity-desc":
          return (b.jobDetails?.quantity || 0) - (a.jobDetails?.quantity || 0);
        case "date-desc":
          return new Date(b.deliveryDate) - new Date(a.deliveryDate);
        case "date-asc":
          return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        case "status": {
          // Get the index of each stage from the stages array
          const stageIndexA = stages.indexOf(a.stage);
          const stageIndexB = stages.indexOf(b.stage);
          // Sort by stage index (this will follow the order in the stages array)
          return stageIndexA - stageIndexB;
        }
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  };

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.jobDetails?.jobType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.jobDetails?.quantity?.toString().includes(searchQuery)
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
    // For 'all', we don't need to filter

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
        lastUpdated: new Date().toISOString()
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
    const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
    const thisStageOrder = stages.indexOf(stage);
    const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
    const isCurrent = currentStage === stage;
    const colors = stageColors[stage];
  
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
          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer
            transition duration-150 ease-in-out
            ${isCompleted ? colors.bg : 'bg-gray-200'}`}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Orders</h2>
        <div className="flex gap-4">
          {/* View mode selector */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'active' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('completed')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'completed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-sm border rounded-md w-[350px] focus:outline-none"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                Sort by: {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 uppercase text-xs">
              <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Client Name
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Project Type
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Quantity
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Delivery Date
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Current Stage
              </th>
              {stages.slice(1).map((stage) => (
                <th key={stage} className="px-2 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                  {stage}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-3 py-4">
                    <span className="text-blue-600 hover:underline font-medium">
                      {order.clientName}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {order.jobDetails?.jobType || 'N/A'}
                  </td>
                  <td className="px-3 py-4">
                    {order.jobDetails?.quantity || 'N/A'}
                  </td>
                  <td className="px-3 py-4">
                    {formatDate(order.deliveryDate)}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`px-2 py-1 text-sm rounded-full text-white inline-block
                      ${stageColors[order.stage]?.bg || 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.stage || 'Not started yet'}
                    </span>
                  </td>
                  {stages.slice(1).map((stage) => (
                    <td key={`${order.id}-${stage}`} className="px-2 py-4 text-center">
                      <StatusCircle 
                        stage={stage} 
                        currentStage={order.stage} 
                        orderId={order.id}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5 + stages.slice(1).length} className="px-3 py-6 text-center text-gray-500">
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingStageUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Stage Update</h3>
            <p className="mb-4">
              Are you sure you want to change the stage from
              <span className="font-medium"> "{pendingStageUpdate.currentStage}" </span>
              to
              <span className="font-medium"> "{pendingStageUpdate.newStage}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelStageUpdate}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateStage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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