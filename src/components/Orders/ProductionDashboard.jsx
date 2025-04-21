import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from "../Login/AuthContext";
import OrderDetailsModal from './OrderDetailsModal';

const ProductionDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  // States for filtering
  const [filterStatus, setFilterStatus] = useState('active'); // 'all', 'active', 'completed'

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Query all orders that have production assignments
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(
          ordersRef,
          orderBy("deliveryDate", "asc")
        );
        
        const querySnapshot = await getDocs(ordersQuery);
        
        // Filter orders to find those assigned to current user
        const assignedOrders = [];
        
        for (const doc of querySnapshot.docs) {
          const orderData = doc.data();
          
          // Skip orders without assignments
          if (!orderData.productionAssignments) continue;
          
          // Check if current user is assigned to any process in this order
          const isAssigned = Object.values(orderData.productionAssignments).includes(currentUser.uid);
          
          if (isAssigned) {
            // Get assigned processes
            const assignedProcesses = Object.entries(orderData.productionAssignments)
              .filter(([_, staffId]) => staffId === currentUser.uid)
              .map(([process]) => process);
              
            // Skip completed orders if filtering for active only
            if (filterStatus === 'active' && orderData.stage === 'Completed') {
              continue;
            }
            
            // Skip non-completed orders if filtering for completed only
            if (filterStatus === 'completed' && orderData.stage !== 'Completed') {
              continue;
            }
            
            // Process mapping for display
            const processNames = {
              letterpress: 'Letterpress',
              foilStamping: 'Foil Stamping',
              embossing: 'Embossing',
              digiPrinting: 'Digital Printing',
              dieCutting: 'Die Cutting',
              postDC: 'Post Die Cutting',
              folding: 'Fold & Paste',
              dstPaste: 'DST Paste',
              quality: 'Quality Check',
              packing: 'Packing'
            };
            
            assignedOrders.push({
              id: doc.id,
              clientName: orderData.clientName || 'Unknown Client',
              projectName: orderData.projectName || 'Unnamed Project',
              jobType: orderData.jobDetails?.jobType || 'Unknown',
              quantity: orderData.jobDetails?.quantity || 0,
              deliveryDate: orderData.deliveryDate,
              stage: orderData.stage || 'Not started yet',
              assignedProcesses: assignedProcesses.map(p => processNames[p] || p),
              fullOrderData: orderData
            });
          }
        }
        
        setAssignments(assignedOrders);
        setError(null);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load your assignments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [currentUser, filterStatus]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get color for stage badge
  const getStageColor = (stage) => {
    const colors = {
      'Not started yet': 'bg-gray-100 text-gray-800',
      'Design': 'bg-indigo-100 text-indigo-800',
      'Positives': 'bg-cyan-100 text-cyan-800',
      'Printing': 'bg-orange-100 text-orange-800',
      'Quality Check': 'bg-pink-100 text-pink-800',
      'Delivery': 'bg-green-100 text-green-800',
      'Completed': 'bg-emerald-100 text-emerald-800'
    };
    
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };
  
  // Open order details
  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order.fullOrderData);
    setOrderDetailsOpen(true);
  };
  
  // Filter orders by status
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">My Production Assignments</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">My Production Assignments</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-xl font-bold">My Production Assignments</h1>
        
        {/* Filter controls */}
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              filterStatus === 'completed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h2>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'active' 
              ? "You don't have any active assignments."
              : filterStatus === 'completed'
                ? "You don't have any completed assignments."
                : "You don't have any assignments yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenOrderDetails(order)}
            >
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
                <h3 className="font-medium text-blue-600 truncate">{order.projectName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(order.stage)}`}>
                  {order.stage}
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm mb-3">
                  <p><span className="font-medium">Client:</span> {order.clientName}</p>
                  <p><span className="font-medium">Job Type:</span> {order.jobType}</p>
                  <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                  <p><span className="font-medium">Delivery:</span> {formatDate(order.deliveryDate)}</p>
                </div>
                
                {/* <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Responsibilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.assignedProcesses.map((process, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {process}
                      </span>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Order Details Modal */}
      {orderDetailsOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setOrderDetailsOpen(false);
            setSelectedOrder(null);
          }}
          onStageUpdate={() => {}} // No stage update from here
        />
      )}
    </div>
  );
};

export default ProductionDashboard;