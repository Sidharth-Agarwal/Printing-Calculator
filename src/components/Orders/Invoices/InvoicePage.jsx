import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import UnifiedDetailsModal from '../../Shared/UnifiedDetailsModal'; 
import ClientInvoiceGroup from './ClientInvoiceGroup';
import InvoiceModal from './InvoiceModal';
import JobTicketModal from './JobTicketModal';
import DeliverySlipModal from './DeliverySlipModal';
import { useAuth } from "../../Login/AuthContext";

const InvoicesPage = () => {
  const { userRole, currentUser } = useAuth();
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState(null);
  const [linkedClientName, setLinkedClientName] = useState("");
  
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('active');
  const [sortBy, setSortBy] = useState('date-desc');
  
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isJobTicketModalOpen, setIsJobTicketModalOpen] = useState(false);
  const [isDeliverySlipModalOpen, setIsDeliverySlipModalOpen] = useState(false);
  
  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery', 'Completed'];

  const sortOptions = {
    "quantity-asc": "Quantity - Low to High",
    "quantity-desc": "Quantity - High to Low",
    "date-desc": "Delivery Date - Latest to Oldest",
    "date-asc": "Delivery Date - Oldest to Latest",
    "stage": "Stage"
  };

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
              
              const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
              if (clientDoc.exists()) {
                setLinkedClientName(clientDoc.data().name);
              }
              
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
    let ordersQuery = collection(db, "orders");
    
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
              pasting: data.pasting || {},
              postDC: data.postDC || null,
              foldAndPaste: data.foldAndPaste || null,
              dstPaste: data.dstPaste || null,
              qc: data.qc || null,
              packing: data.packing || null,
              misc: data.misc || null,
              completedAt: data.completedAt || null,
              orderSerial: data.orderSerial || null
            };
          });
          
          setAllOrders(ordersData);
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
          const stageIndexA = stages.indexOf(a.stage);
          const stageIndexB = stages.indexOf(b.stage);
          return stageIndexA - stageIndexB;
        }
        default:
          return new Date(b.date || 0) - new Date(a.date || 0);
      }
    });
  };

  const invoiceMetrics = React.useMemo(() => {
    if (allOrders.length === 0) return {
      pendingCount: 0,
      completedCount: 0,
      totalQuantity: 0
    };
    
    const pendingOrders = allOrders.filter(order => order.stage !== 'Completed');
    const completedOrders = allOrders.filter(order => order.stage === 'Completed');
    
    const totalQuantity = allOrders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    const pendingQuantity = pendingOrders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    const completedQuantity = completedOrders.reduce((sum, order) => 
      sum + (parseInt(order.jobDetails?.quantity) || 0), 0);
    
    return {
      pendingCount: pendingOrders.length,
      completedCount: completedOrders.length,
      totalQuantity,
      pendingQuantity,
      completedQuantity
    };
  }, [allOrders]);

  const clientGroups = React.useMemo(() => {
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
    
    if (filterStatus) {
      filtered = filtered.filter(order => order.stage === filterStatus);
    }
    
    if (viewMode === 'active') {
      filtered = filtered.filter(order => order.stage !== 'Completed');
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(order => order.stage === 'Completed');
    }
    
    filtered = sortOrders(filtered, sortBy);
    
    return filtered.reduce((acc, order) => {
      const clientId = order.clientId || "unknown";
      
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
      
      acc[clientId].orders.push(order);
      acc[clientId].totalOrders++;
      
      if (order.stage === 'Completed') {
        acc[clientId].completedOrders++;
      }
      
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      acc[clientId].totalQuantity += quantity;
      
      return acc;
    }, {});
  }, [allOrders, searchQuery, filterStatus, sortBy, viewMode]);

  // ✅ KEY FUNCTION: Get orders in UI display order
  const getOrdersInDisplayOrder = (orderIds) => {
    const displayOrderedOrders = Object.values(clientGroups)
      .flatMap(client => client.orders);
    
    return displayOrderedOrders.filter(order => orderIds.includes(order.id));
  };

  const toggleClient = (clientId) => {
    if (isB2BClient && clientId !== linkedClientId) {
      return;
    }
    
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  const handleOrderSelection = (orderId, isSelected) => {
    if (isSelected) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAllClientOrders = (clientId, isSelected) => {
    const clientOrders = clientGroups[clientId]?.orders || [];
    const clientOrderIds = clientOrders.map(order => order.id);
    
    if (isSelected) {
      setSelectedOrders(prev => {
        const currentSelectedSet = new Set(prev);
        clientOrderIds.forEach(id => currentSelectedSet.add(id));
        return Array.from(currentSelectedSet);
      });
    } else {
      setSelectedOrders(prev => 
        prev.filter(id => !clientOrderIds.includes(id))
      );
    }
  };

  const handleGenerateInvoice = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to generate an invoice.");
      return;
    }
    
    setIsInvoiceModalOpen(true);
  };

  const handleGenerateJobTicket = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to generate a job ticket.");
      return;
    }
    
    setIsJobTicketModalOpen(true);
  };

  const handleGenerateDeliverySlip = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to generate a delivery slip.");
      return;
    }
    
    setIsDeliverySlipModalOpen(true);
  };

  const handleSingleOrderInvoice = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    
    const orderIds = orders.map(order => order.id);
    setSelectedOrders(orderIds);
    
    setTimeout(() => {
      setIsInvoiceModalOpen(true);
    }, 100);
  };

  const handleSingleOrderJobTicket = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    
    const orderIds = orders.map(order => order.id);
    setSelectedOrders(orderIds);
    
    setTimeout(() => {
      setIsJobTicketModalOpen(true);
    }, 100);
  };

  const handleSingleOrderDeliverySlip = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    
    const orderIds = orders.map(order => order.id);
    setSelectedOrders(orderIds);
    
    setTimeout(() => {
      setIsDeliverySlipModalOpen(true);
    }, 100);
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const clearSelection = () => {
    setSelectedOrders([]);
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
            {isB2BClient ? "Your Invoices" : "Invoices Management"}
          </h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200 rounded-md"></div>
            <div className="h-64 bg-gray-200 rounded-md"></div>
            <div className="h-64 bg-gray-200 rounded-md"></div>
          </div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isB2BClient ? "Your Invoices" : "Invoices Management"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isB2BClient 
            ? "View and manage your invoices and delivery documents" 
            : "Generate invoices, job tickets and delivery slips from your orders"}
        </p>
      </div>

      {(userRole === "admin" || userRole === "staff") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
            <p className="text-2xl font-bold text-blue-600">
              {invoiceMetrics.pendingCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {invoiceMetrics.pendingQuantity > 0 ? 
                `${invoiceMetrics.pendingQuantity.toLocaleString()} items pending invoice` : 
                'No pending items'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {invoiceMetrics.completedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {invoiceMetrics.completedQuantity > 0 ? 
                `${invoiceMetrics.completedQuantity.toLocaleString()} items ready for invoice` : 
                'No completed items'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-800">
              {allOrders.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {invoiceMetrics.totalQuantity > 0 ? 
                `${invoiceMetrics.totalQuantity.toLocaleString()} total items` : 
                'No items to display'}
            </p>
          </div>
        </div>
      )}

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
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
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
      
      {selectedOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {selectedOrders.length}
              </span>
              <span className="text-gray-700">orders selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateInvoice}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Generate Invoice
              </button>
              <button
                onClick={handleGenerateJobTicket}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                Generate Job Ticket
              </button>
              <button
                onClick={handleGenerateDeliverySlip}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5h2.5a1 1 0 00.91-.6l1.59-3.36a1 1 0 00-.91-1.4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45A2.5 2.5 0 009 15h7.5a1 1 0 000-2H9c-.412 0-.787.164-1.06.43-.273.266-.44.638-.44 1.06s.167.794.44 1.06c.273.266.648.43 1.06.43h7.5a2.5 2.5 0 010 5h-15a1 1 0 100 2h15a4.5 4.5 0 100-9H9a2.5 2.5 0 00-2.45 2h1.05a1.5 1.5 0 013 0z" />
                </svg>
                Generate Delivery Slip
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">No Orders Found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
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
              className="mt-4 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
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
              formatDate={formatDate}
              onGenerateInvoice={handleSingleOrderInvoice}
              onGenerateJobTicket={handleSingleOrderJobTicket}
              onGenerateDeliverySlip={handleSingleOrderDeliverySlip}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
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

      {/* ✅ UPDATED: Invoice Modal - Pass orders in display order */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          selectedOrderIds={selectedOrders}
          orders={getOrdersInDisplayOrder(selectedOrders)}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {/* ✅ UPDATED: Job Ticket Modal - Pass orders in display order */}
      {isJobTicketModalOpen && (
        <JobTicketModal
          selectedOrderIds={selectedOrders}
          orders={getOrdersInDisplayOrder(selectedOrders)}
          onClose={() => setIsJobTicketModalOpen(false)}
        />
      )}

      {/* ✅ UPDATED: Delivery Slip Modal - Pass orders in display order */}
      {isDeliverySlipModalOpen && (
        <DeliverySlipModal
          selectedOrderIds={selectedOrders}
          orders={getOrdersInDisplayOrder(selectedOrders)}
          onClose={() => setIsDeliverySlipModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InvoicesPage;