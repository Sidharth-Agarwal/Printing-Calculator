import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, onSnapshot, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import UnifiedDetailsModal from '../../Shared/UnifiedDetailsModal';
import ProductionAssignmentModal from './ProductionAssignmentModal';
import { useAuth } from "../../Login/AuthContext";

const OrdersPage = () => {
  const { userRole, currentUser } = useAuth();
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // Production assignment states
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [orderForAssignment, setOrderForAssignment] = useState(null);
  const [staffNames, setStaffNames] = useState({});

  // Check if user can edit stages (admin, staff, and production can)
  const canEditStages = userRole === "admin" || userRole === "staff" || userRole === "production";
  
  // Check if user can assign production staff (only admin and staff can)
  const canAssignProduction = userRole === "admin" || userRole === "staff";

  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery', 'Completed'];

  const sortOptions = {
    "serial-asc": "Serial Number - Low to High",
    "serial-desc": "Serial Number - High to Low",
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

  // Calculate KPI metrics
  const orderMetrics = React.useMemo(() => {
    if (orders.length === 0) return {
      activeCount: 0,
      completedCount: 0,
      b2bCount: 0,
      directCount: 0,
      totalQuantity: 0,
      b2bQuantity: 0,
      directQuantity: 0,
      serializedCount: 0,
      nonSerializedCount: 0
    };
    
    // Filter orders for different categories
    const activeOrders = orders.filter(order => order.stage !== 'Completed');
    const completedOrders = orders.filter(order => order.stage === 'Completed');
    const b2bOrders = orders.filter(order => order.isLoyaltyEligible);
    const directOrders = orders.filter(order => !order.isLoyaltyEligible);
    const serializedOrders = orders.filter(order => order.orderSerial);
    const nonSerializedOrders = orders.filter(order => !order.orderSerial);
    
    // Calculate totals
    const totalQuantity = orders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    const b2bQuantity = b2bOrders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    const directQuantity = directOrders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    return {
      activeCount: activeOrders.length,
      completedCount: completedOrders.length,
      b2bCount: b2bOrders.length,
      directCount: directOrders.length,
      totalQuantity,
      b2bQuantity,
      directQuantity,
      serializedCount: serializedOrders.length,
      nonSerializedCount: nonSerializedOrders.length
    };
  }, [orders]);

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

  // Fetch staff names
  useEffect(() => {
    const fetchStaffNames = async () => {
      const staffIds = new Set();
      
      // Collect all unique staff IDs from orders
      orders.forEach(order => {
        if (order.productionAssignments && order.productionAssignments.assigned) {
          staffIds.add(order.productionAssignments.assigned);
        }
      });
      
      if (staffIds.size === 0) return;
      
      // Fetch user details for each staff ID
      const names = {};
      const promises = Array.from(staffIds).map(async staffId => {
        try {
          const userDoc = await getDoc(doc(db, "users", staffId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            names[staffId] = userData.displayName || userData.email || 'Unknown';
          }
        } catch (error) {
          console.error("Error fetching staff details:", error);
        }
      });
      
      await Promise.all(promises);
      setStaffNames(names);
    };
    
    if (orders.length > 0) {
      fetchStaffNames();
    }
  }, [orders]);

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
              pasting: data.pasting || {},
              productionAssignments: data.productionAssignments || {},
              clientId: data.clientId || null,
              isLoyaltyEligible: data.isLoyaltyEligible || false,
              loyaltyInfo: data.loyaltyInfo || null,
              orderSerial: data.orderSerial || null, // Added serial number
              orderCreatedFrom: data.orderCreatedFrom || null
            };
          });
          setOrders(ordersData);
          setError(null);
        } catch (err) {
          console.error("Error processing orders data:", err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [isB2BClient, linkedClientId]);

  // Helper function to extract serial number for sorting
  const getSerialNumber = (orderSerial) => {
    if (!orderSerial) return 0;
    
    // Extract the numeric part from FL-YYYY-NNNNN format
    const match = orderSerial.match(/FL-(\d{4})-(\d{5})/);
    if (match) {
      const year = parseInt(match[1]);
      const sequence = parseInt(match[2]);
      // Create a sortable number: year * 100000 + sequence
      return year * 100000 + sequence;
    }
    return 0;
  };

  // Sort function
  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortBy) {
        case "serial-asc": {
          const serialA = getSerialNumber(a.orderSerial);
          const serialB = getSerialNumber(b.orderSerial);
          return serialA - serialB;
        }
        case "serial-desc": {
          const serialA = getSerialNumber(a.orderSerial);
          const serialB = getSerialNumber(b.orderSerial);
          return serialB - serialA;
        }
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

    // Apply search filter (now includes serial number search)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order.clientName && order.clientName.toLowerCase().includes(query)) ||
        (order.projectName && order.projectName.toLowerCase().includes(query)) ||
        (order.jobDetails?.jobType && order.jobDetails.jobType.toLowerCase().includes(query)) ||
        (order.jobDetails?.quantity && order.jobDetails.quantity.toString().includes(query)) ||
        (order.orderSerial && order.orderSerial.toLowerCase().includes(query)) // Added serial search
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
    // Allow admin, staff and production to update stages
    if (!canEditStages) return;
    
    setPendingStageUpdate({ orderId, currentStage, newStage });
    setShowConfirmation(true);
  };

  const updateStage = async () => {
    if (!pendingStageUpdate || !canEditStages) return;
    
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

  // Handle opening the assignment modal
  const handleOpenAssignmentModal = (order) => {
    // Only admin and staff can assign production
    if (!canAssignProduction) return;
    setOrderForAssignment(order);
    setIsAssignmentModalOpen(true);
  };

  // Handle assignment updates
  const handleAssignmentUpdate = (productionAssignments) => {
    // Update the local orders array
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderForAssignment.id 
          ? { ...order, productionAssignments } 
          : order
      )
    );
  };

  // Get assigned staff name
  const getAssignedStaffName = (productionAssignments) => {
    if (!productionAssignments || !productionAssignments.assigned) {
      return 'Not Assigned';
    }
    
    const staffId = productionAssignments.assigned;
    return staffNames[staffId] || 'Unknown';
  };

  // Format serial number for display
  const formatSerialNumber = (orderSerial) => {
    if (!orderSerial) return 'Not Assigned';
    return orderSerial;
  };

  // Get order source icon and tooltip
  // const getOrderSource = (order) => {
  //   if (order.orderCreatedFrom === 'b2b_approval') {
  //     return {
  //       icon: '🏢',
  //       tooltip: 'B2B Order (from Escrow)',
  //       className: 'text-purple-600'
  //     };
  //   } else if (order.orderCreatedFrom === 'estimate') {
  //     return {
  //       icon: '📋',
  //       tooltip: 'Direct Order (from Estimate)',
  //       className: 'text-blue-600'
  //     };
  //   } else {
  //     return {
  //       icon: '📝',
  //       tooltip: 'Legacy Order',
  //       className: 'text-gray-600'
  //     };
  //   }
  // };

  const StatusCircle = ({ stage, currentStage, orderId }) => {
    // B2B clients can only view stages - all other users can edit
    if (isB2BClient) {
      const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
      const thisStageOrder = stages.indexOf(stage);
      const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
      const colors = stageColors[stage] || { bg: 'bg-gray-200' };
      
      return (
        <div className="flex justify-center">
          <div 
            className={`w-4 h-4 rounded-full flex items-center justify-center
              transition duration-150 ease-in-out
              ${isCompleted ? colors.bg : 'bg-gray-200'}`}
          >
            {isCompleted && (
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      );
    }
    
    // Admin, staff, and production users can edit stages
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
          className={`w-4 h-4 rounded-full flex items-center justify-center cursor-pointer
            transition duration-150 ease-in-out
            ${isCompleted ? colors.bg : 'bg-gray-200'}`}
        >
          {isCompleted && (
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
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

  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isB2BClient ? "Your Orders" : "Orders Management"}
          </h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-md"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
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
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isB2BClient ? "Your Orders" : "Orders Management"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isB2BClient 
            ? "View and track the progress of your orders" 
            : "Manage order workflow, assign production staff, and track progress with serial numbers"}
        </p>
      </div>

      {/* KPI Cards - Only visible to admins and staff */}
      {(userRole === "admin" || userRole === "staff") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Orders</h3>
            <p className="text-2xl font-bold text-gray-800">
              {orderMetrics.activeCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderMetrics.activeCount > 0 ? 
                `${Math.round((orderMetrics.activeCount / orders.length) * 100)}% of total orders` : 
                'No active orders'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {orderMetrics.completedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderMetrics.completedCount > 0 ? 
                `${Math.round((orderMetrics.completedCount / orders.length) * 100)}% of total orders` : 
                'No completed orders'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">B2B Orders</h3>
            <p className="text-2xl font-bold text-purple-600">
              {orderMetrics.b2bCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderMetrics.b2bQuantity > 0 ? 
                `${orderMetrics.b2bQuantity.toLocaleString()} total items` : 
                'No B2B orders'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Direct Orders</h3>
            <p className="text-2xl font-bold text-blue-600">
              {orderMetrics.directCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderMetrics.directQuantity > 0 ? 
                `${orderMetrics.directQuantity.toLocaleString()} total items` : 
                'No direct orders'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Serialized Orders</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {orderMetrics.serializedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderMetrics.nonSerializedCount > 0 ? 
                `${orderMetrics.nonSerializedCount} legacy orders` : 
                'All orders serialized'}
            </p>
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
              placeholder="Search orders, serials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'all' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('active')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'active' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setViewMode('completed')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'completed' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* Order Serial Column - Most prominent */}
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Order Serial
                  </th>
                  {!isB2BClient && (
                    <th className="px-2 py-2 text-left font-medium text-gray-500">
                      Client
                    </th>
                  )}
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Project
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Quantity
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Delivery
                  </th>
                  {/* Deadline column */}
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Deadline
                  </th>
                  {/* Assigned production staff column */}
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Assigned
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">
                    Status
                  </th>
                  {/* Loyalty column for admins and staff */}
                  {(userRole === "admin" || userRole === "staff") && (
                    <th className="px-2 py-2 text-left font-medium text-gray-500">
                      Discount
                    </th>
                  )}
                  {stages.slice(1).map((stage) => (
                    <th key={stage} className="px-1 py-2 text-center font-medium text-gray-500 whitespace-nowrap">
                      {stage.split(' ')[0]}
                    </th>
                  ))}
                  {canAssignProduction && (
                    <th className="px-2 py-2 text-center font-medium text-gray-500 w-10">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  // const orderSource = getOrderSource(order);
                  return (
                    <tr 
                      key={order.id} 
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Serial Cell - Most prominent */}
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <span 
                            className={`text-xs font-mono ${
                              order.orderSerial ? 'text-indigo-600' : 'text-gray-400 italic'
                            }`}
                          >
                            {formatSerialNumber(order.orderSerial)}
                          </span>
                          {/* {order.orderSerial && (
                            <span 
                              className={orderSource.className}
                              title={orderSource.tooltip}
                            >
                              {orderSource.icon}
                            </span>
                          )} */}
                        </div>
                      </td>
                      {!isB2BClient && (
                        <td className="px-2 py-1.5">
                          <div className="flex items-center">
                            <span className="text-blue-600 hover:text-blue-800 font-medium truncate max-w-[100px]">
                              {order.clientName}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-2 py-1.5">
                        <span className="font-medium text-gray-800 truncate max-w-[100px] block">{order.projectName || 'Unnamed'}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        {order.jobDetails?.jobType || 'N/A'}
                      </td>
                      <td className="px-2 py-1.5">
                        {order.jobDetails?.quantity || 'N/A'}
                      </td>
                      <td className="px-2 py-1.5">
                        {formatDate(order.deliveryDate)}
                      </td>
                      {/* Deadline cell */}
                      <td className="px-2 py-1.5">
                        {order.productionAssignments?.deadlineDate ? (
                          <span className={`${
                            new Date(order.productionAssignments.deadlineDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                            order.stage !== 'Completed' ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}>
                            {formatDate(order.productionAssignments.deadlineDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </td>
                      {/* Assigned production staff cell */}
                      <td className="px-2 py-1.5">
                        <span className={`${order.productionAssignments?.assigned ? 'text-teal-600 font-medium' : 'text-gray-500 italic'} truncate max-w-[80px] block`}>
                          {getAssignedStaffName(order.productionAssignments)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full text-white inline-block
                            ${stageColors[order.stage]?.bg || 'bg-gray-100'}`}
                          >
                          {order.stage || 'Not started'}
                        </span>
                      </td>
                      {/* Loyalty column for admins and staff */}
                      {(userRole === "admin" || userRole === "staff") && (
                        <td className="px-2 py-1.5">
                          {order.isLoyaltyEligible ? (
                            order.loyaltyInfo ? (
                              <div className="text-xs">
                                <div className="text-green-600">
                                  <strong>{order.loyaltyInfo.discount}%</strong>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-purple-700">
                                B2B
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-blue-600"><strong>Direct</strong></span>
                          )}
                        </td>
                      )}
                      {/* Status indicators for each stage */}
                      {stages.slice(1).map((stage) => (
                        <td key={`${order.id}-${stage}`} className="px-1 py-1.5 text-center">
                          <StatusCircle 
                            stage={stage} 
                            currentStage={order.stage} 
                            orderId={order.id}
                          />
                        </td>
                      ))}
                      {/* Actions column */}
                      {canAssignProduction && (
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click action
                              handleOpenAssignmentModal(order);
                            }}
                            className="p-0.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                            title="Assign Production Staff"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">No Orders Found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {isB2BClient 
                ? "You don't have any orders yet. Check your estimates or contact us." 
                : "No orders match your current search criteria."}
            </p>
            {(searchQuery || stageFilter || viewMode !== 'all') && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStageFilter("");
                    setViewMode("all");
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Overview - Only for admin and staff */}
      {(userRole === "admin" || userRole === "staff") && filteredOrders.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Order Progress Overview</h3>
          <div className="grid grid-cols-7 gap-2">
            {stages.map(stage => {
              const count = filteredOrders.filter(order => order.stage === stage).length;
              const percentage = Math.round((count / filteredOrders.length) * 100);
              const colors = stageColors[stage] || { bg: 'bg-gray-100', text: 'text-gray-800' };
              
              return (
                <div key={stage} className="flex flex-col items-center">
                  <div className={`${colors.bg} rounded-full w-7 h-7 flex items-center justify-center mb-1`}>
                    <span className="text-xs text-white font-medium">{count}</span>
                  </div>
                  <div className="text-xs text-center">
                    <div className="font-medium">{stage.split(' ')[0]}</div>
                    <div className="text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Serial Number Statistics - Only for admin and staff */}
      {(userRole === "admin" || userRole === "staff") && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Serial Number Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{orderMetrics.serializedCount}</div>
              <div className="text-xs text-gray-500">Serialized Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{orderMetrics.nonSerializedCount}</div>
              <div className="text-xs text-gray-500">Legacy Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.length > 0 ? Math.round((orderMetrics.serializedCount / orders.length) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-500">Serialization Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Date().getFullYear()}
              </div>
              <div className="text-xs text-gray-500">Current Year</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {canEditStages && showConfirmation && pendingStageUpdate && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Confirm Stage Update</h3>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to change the stage from
              <span className="font-medium text-gray-800"> "{pendingStageUpdate.currentStage}" </span>
              to
              <span className="font-medium text-gray-800"> "{pendingStageUpdate.newStage}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelStageUpdate}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={updateStage}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={updating}
              >
                {updating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <UnifiedDetailsModal
          data={selectedOrder}
          dataType="order"
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Production Assignment Modal */}
      {canAssignProduction && isAssignmentModalOpen && orderForAssignment && (
        <ProductionAssignmentModal
          order={orderForAssignment}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setOrderForAssignment(null);
          }}
          onAssignmentUpdate={handleAssignmentUpdate}
        />
      )}
    </div>
  );
};

export default OrdersPage;