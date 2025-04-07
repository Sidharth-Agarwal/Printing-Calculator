// // import React, { useEffect, useState } from 'react';
// // import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
// // import { db } from '../../firebaseConfig';
// // import OrderDetailsModal from './OrderDetailsModal';

// // const OrdersPage = () => {
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedOrder, setSelectedOrder] = useState(null);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [filteredOrders, setFilteredOrders] = useState([]);
// //   const [updating, setUpdating] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [sortBy, setSortBy] = useState("date-desc"); // Default sort: Latest to oldest
// //   const [stageFilter, setStageFilter] = useState(""); // Default: All stages

// //   const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

// //   const sortOptions = {
// //     "quantity-asc": "Quantity - Low to High",
// //     "quantity-desc": "Quantity - High to Low",
// //     "date-desc": "Delivery Date - Latest to Oldest",
// //     "date-asc": "Delivery Date - Oldest to Latest",
// //     "status": "Status"
// //   };

// //   const stageColors = {
// //     'Design': { bg: 'bg-[#6366F1]' },
// //     'Positives': { bg: 'bg-[#06B6D4]' },
// //     'Printing': { bg: 'bg-[#F97316]' },
// //     'Quality Check': { bg: 'bg-[#EC4899]' },
// //     'Delivery': { bg: 'bg-[#10B981]' }
// //   };

// //   useEffect(() => {
// //     const unsubscribe = onSnapshot(
// //       collection(db, "orders"),
// //       {
// //         includeMetadataChanges: true
// //       },
// //       (snapshot) => {
// //         try {
// //           const ordersData = snapshot.docs.map(doc => {
// //             const data = doc.data();
// //             return {
// //               id: doc.id,
// //               clientName: data.clientName || '',
// //               projectName: data.projectName || '',
// //               date: data.date || null,
// //               deliveryDate: data.deliveryDate || null,
// //               stage: data.stage || 'Not started yet',
// //               status: data.status || 'In Progress',
// //               jobDetails: data.jobDetails || {},
// //               dieDetails: data.dieDetails || {},
// //               calculations: data.calculations || {},
// //               lpDetails: data.lpDetails || null,
// //               fsDetails: data.fsDetails || null,
// //               embDetails: data.embDetails || null,
// //               digiDetails: data.digiDetails || null,
// //               dieCuttingDetails: data.dieCuttingDetails || null,
// //               sandwichDetails: data.sandwichDetails || null,
// //               pastingDetails: data.pastingDetails || {}
// //             };
// //           });
// //           setOrders(ordersData);
// //           setFilteredOrders(ordersData);
// //           setError(null);
// //         } catch (err) {
// //           console.error("Error processing orders data:", err);
// //           setError(err);
// //         } finally {
// //           setLoading(false);
// //         }
// //       }
// //     );

// //     return () => unsubscribe();
// //   }, []);

// //   // Sort function
// //   const sortOrders = (ordersToSort) => {
// //     return [...ordersToSort].sort((a, b) => {
// //       switch (sortBy) {
// //         case "quantity-asc":
// //           return (a.jobDetails?.quantity || 0) - (b.jobDetails?.quantity || 0);
// //         case "quantity-desc":
// //           return (b.jobDetails?.quantity || 0) - (a.jobDetails?.quantity || 0);
// //         case "date-desc":
// //           return new Date(b.deliveryDate) - new Date(a.deliveryDate);
// //         case "date-asc":
// //           return new Date(a.deliveryDate) - new Date(b.deliveryDate);
// //         case "status": {
// //           // Get the index of each stage from the stages array
// //           const stageIndexA = stages.indexOf(a.stage);
// //           const stageIndexB = stages.indexOf(b.stage);
// //           // Sort by stage index (this will follow the order in the stages array)
// //           return stageIndexA - stageIndexB;
// //         }
// //         default:
// //           return new Date(b.date) - new Date(a.date);
// //       }
// //     });
// //   };

// //   useEffect(() => {
// //     let filtered = orders;

// //     // Apply search filter
// //     if (searchQuery) {
// //       filtered = filtered.filter(order =>
// //         order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //         order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //         order.jobDetails?.jobType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //         order.jobDetails?.quantity?.toString().includes(searchQuery)
// //       );
// //     }

// //     // Apply stage filter
// //     if (stageFilter) {
// //       filtered = filtered.filter(order => order.stage === stageFilter);
// //     }

// //     // Apply sorting
// //     const sortedOrders = sortOrders(filtered);
// //     setFilteredOrders(sortedOrders);
// //   }, [searchQuery, orders, sortBy, stageFilter]);

// //   const updateStage = async (orderId, newStage) => {
// //     try {
// //       setUpdating(true);
// //       const orderRef = doc(db, "orders", orderId);
// //       await updateDoc(orderRef, {
// //         stage: newStage,
// //         status: newStage === 'Delivery' ? 'Delivered' : 'In Progress',
// //         lastUpdated: new Date().toISOString()
// //       });
// //     } catch (error) {
// //       console.error("Error updating stage:", error);
// //       throw error;
// //     } finally {
// //       setUpdating(false);
// //     }
// //   };

// //   const StatusCircle = ({ stage, currentStage, orderId }) => {
// //     const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
// //     const thisStageOrder = stages.indexOf(stage);
// //     const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
// //     const isCurrent = currentStage === stage;
// //     const colors = stageColors[stage];
  
// //     const handleStageClick = async (e) => {
// //       e.stopPropagation();
// //       if (updating) return;
  
// //       try {
// //         if (isCurrent) {
// //           const previousStage = stages[thisStageOrder - 1] || 'Not started yet';
// //           await updateStage(orderId, previousStage);
// //         } else {
// //           await updateStage(orderId, stage);
// //         }
// //       } catch (error) {
// //         alert("Failed to update stage. Please try again.");
// //       }
// //     };
  
// //     return (
// //       <div className="flex justify-center">
// //         <div 
// //           onClick={handleStageClick}
// //           className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer
// //             transition duration-150 ease-in-out
// //             ${isCompleted ? colors.bg : 'bg-gray-200'}`}
// //         >
// //           {isCompleted && (
// //             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
// //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //             </svg>
// //           )}
// //         </div>
// //       </div>
// //     );
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return "Not specified";
// //     try {
// //       return new Date(dateString).toLocaleDateString('en-GB');
// //     } catch (error) {
// //       return dateString;
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="p-6">
// //         <div className="flex justify-between items-center mb-6">
// //           <h1 className="text-2xl font-bold">Orders</h1>
// //           <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
// //         </div>
// //         <div className="animate-pulse space-y-4">
// //           <div className="h-12 bg-gray-200 rounded-md"></div>
// //           <div className="h-12 bg-gray-200 rounded-md"></div>
// //           <div className="h-12 bg-gray-200 rounded-md"></div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-6">
// //         <div className="bg-red-50 border border-red-200 rounded-md p-4">
// //           <h3 className="text-red-800 font-medium">Error loading orders</h3>
// //           <p className="text-red-600 mt-1">{error.message}</p>
// //           <button 
// //             onClick={() => window.location.reload()}
// //             className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
// //           >
// //             Retry
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-6">
// //       <div className="flex justify-between items-center mb-6">
// //         <h2 className="text-xl font-medium">ORDERS</h2>
// //         <div className="flex gap-4">
// //           <input
// //             type="text"
// //             placeholder="Search orders..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             className="px-4 py-2 text-sm border rounded-md w-[350px] focus:outline-none"
// //           />
// //           <select
// //             value={stageFilter}
// //             onChange={(e) => setStageFilter(e.target.value)}
// //             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           >
// //             <option value="">All Stages</option>
// //             {stages.map(stage => (
// //               <option key={stage} value={stage}>{stage}</option>
// //             ))}
// //           </select>
// //           <select
// //             value={sortBy}
// //             onChange={(e) => setSortBy(e.target.value)}
// //             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           >
// //             {Object.entries(sortOptions).map(([value, label]) => (
// //               <option key={value} value={value}>
// //                 Sort by: {label}
// //               </option>
// //             ))}
// //           </select>
// //         </div>
// //       </div>

// //       <div className="bg-white rounded-lg shadow-sm">
// //         <table className="w-full">
// //           <thead>
// //             <tr className="bg-gray-50 uppercase text-xs">
// //               <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
// //                 Client Name
// //               </th>
// //               <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
// //                 Project Type
// //               </th>
// //               <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
// //                 Quantity
// //               </th>
// //               <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
// //                 Delivery Date
// //               </th>
// //               <th className="px-3 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
// //                 Current Stage
// //               </th>
// //               {stages.slice(1).map((stage) => (
// //                 <th key={stage} className="px-2 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
// //                   {stage}
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody className="text-sm">
// //             {filteredOrders.map((order) => (
// //               <tr 
// //                 key={order.id} 
// //                 className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
// //                 onClick={() => setSelectedOrder(order)}
// //               >
// //                 <td className="px-3 py-4">
// //                   <span className="text-blue-600 hover:underline font-medium">
// //                     {order.clientName}
// //                   </span>
// //                 </td>
// //                 <td className="px-3 py-4">
// //                   {order.jobDetails?.jobType || 'N/A'}
// //                 </td>
// //                 <td className="px-3 py-4">
// //                   {order.jobDetails?.quantity || 'N/A'}
// //                 </td>
// //                 <td className="px-3 py-4">
// //                   {formatDate(order.deliveryDate)}
// //                 </td>
// //                 <td className="px-3 py-4">
// //                   <span className={`px-2 py-1 text-sm rounded-full text-white inline-block
// //                     ${stageColors[order.stage]?.bg || 'bg-gray-100 text-gray-800'}`}
// //                   >
// //                     {order.stage === 'Delivery' ? 'Delivered' : order.stage || 'Not started yet'}
// //                   </span>
// //                 </td>
// //                 {stages.slice(1).map((stage) => (
// //                   <td key={`${order.id}-${stage}`} className="px-2 py-4 text-center">
// //                     <StatusCircle 
// //                       stage={stage} 
// //                       currentStage={order.stage} 
// //                       orderId={order.id}
// //                     />
// //                   </td>
// //                 ))}
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {selectedOrder && (
// //         <OrderDetailsModal
// //           order={selectedOrder}
// //           onClose={() => setSelectedOrder(null)}
// //           onStageUpdate={(newStage) => updateStage(selectedOrder.id, newStage)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default OrdersPage;

// import React, { useEffect, useState } from 'react';
// import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
// import { db } from '../../firebaseConfig';
// import OrderDetailsModal from './OrderDetailsModal';
// import ClientOrderGroup from './ClientOrderGroup';
// import NewInvoiceModal from './NewInvoiceModal';

// const OrdersPage = () => {
//   // State for data loading
//   const [allOrders, setAllOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // State for filtering and search
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState(''); // All orders by default
//   const [viewMode, setViewMode] = useState('active'); // 'active', 'completed', 'all'
//   const [sortBy, setSortBy] = useState('date-desc'); // Default sort
  
//   // State for expanded clients and selection
//   const [expandedClientId, setExpandedClientId] = useState(null);
//   const [selectedOrders, setSelectedOrders] = useState([]);
  
//   // State for modals
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
//   const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
//   // Available stages for orders
//   const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

//   // Sort options for dropdown
//   const sortOptions = {
//     "quantity-asc": "Quantity - Low to High",
//     "quantity-desc": "Quantity - High to Low",
//     "date-desc": "Delivery Date - Latest to Oldest",
//     "date-asc": "Delivery Date - Oldest to Latest",
//     "stage": "Stage"
//   };

//   // Fetch all orders on mount
//   useEffect(() => {
//     const unsubscribe = onSnapshot(
//       collection(db, "orders"),
//       {
//         includeMetadataChanges: true
//       },
//       (snapshot) => {
//         try {
//           const ordersData = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               clientId: data.clientId || "unknown",
//               clientName: data.clientName || 'Unknown Client',
//               projectName: data.projectName || '',
//               date: data.date || null,
//               deliveryDate: data.deliveryDate || null,
//               stage: data.stage || 'Not started yet',
//               status: data.status || 'In Progress',
//               jobDetails: data.jobDetails || {},
//               dieDetails: data.dieDetails || {},
//               calculations: data.calculations || {},
//               lpDetails: data.lpDetails || null,
//               fsDetails: data.fsDetails || null,
//               embDetails: data.embDetails || null,
//               digiDetails: data.digiDetails || null,
//               dieCutting: data.dieCutting || null,
//               sandwich: data.sandwich || null,
//               pasting: data.pasting || {}
//             };
//           });
          
//           setAllOrders(ordersData);
//           setError(null);
//         } catch (err) {
//           console.error("Error processing orders data:", err);
//           setError(err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Update order stage
//   const updateOrderStage = async (orderId, newStage) => {
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       await updateDoc(orderRef, {
//         stage: newStage,
//         status: newStage === 'Delivery' ? 'Completed' : 'In Progress',
//         lastUpdated: new Date().toISOString()
//       });
      
//       // Success message could be added here
//     } catch (error) {
//       console.error("Error updating order stage:", error);
//       alert("Failed to update order stage. Please try again.");
//     }
//   };

//   // Filter and group orders by client
//   const clientGroups = React.useMemo(() => {
//     // Apply search filter
//     let filtered = [...allOrders];
    
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(order => 
//         (order.clientName && order.clientName.toLowerCase().includes(query)) ||
//         (order.projectName && order.projectName.toLowerCase().includes(query)) ||
//         (order.jobDetails?.jobType && order.jobDetails.jobType.toLowerCase().includes(query)) ||
//         (order.jobDetails?.quantity && order.jobDetails.quantity.toString().includes(query))
//       );
//     }
    
//     // Apply status/stage filter
//     if (filterStatus) {
//       filtered = filtered.filter(order => order.stage === filterStatus);
//     }
    
//     // Apply view mode filter (active/completed)
//     if (viewMode === 'active') {
//       filtered = filtered.filter(order => order.stage !== 'Delivery');
//     } else if (viewMode === 'completed') {
//       filtered = filtered.filter(order => order.stage === 'Delivery');
//     }
    
//     // Sort filtered orders
//     filtered = sortOrders(filtered, sortBy);
    
//     // Group by client
//     return filtered.reduce((acc, order) => {
//       const clientId = order.clientId || "unknown";
      
//       if (!acc[clientId]) {
//         acc[clientId] = {
//           id: clientId,
//           name: order.clientName || "Unknown Client",
//           orders: [],
//           totalOrders: 0,
//           completedOrders: 0,
//           totalQuantity: 0
//         };
//       }
      
//       // Add order to client group
//       acc[clientId].orders.push(order);
//       acc[clientId].totalOrders++;
      
//       // Count completed orders
//       if (order.stage === 'Delivery') {
//         acc[clientId].completedOrders++;
//       }
      
//       // Sum up quantity
//       const quantity = parseInt(order.jobDetails?.quantity) || 0;
//       acc[clientId].totalQuantity += quantity;
      
//       return acc;
//     }, {});
//   }, [allOrders, searchQuery, filterStatus, sortBy, viewMode]);

//   // Sort function
//   const sortOrders = (ordersToSort, sortOption) => {
//     return [...ordersToSort].sort((a, b) => {
//       switch (sortOption) {
//         case "quantity-asc":
//           return (parseInt(a.jobDetails?.quantity) || 0) - (parseInt(b.jobDetails?.quantity) || 0);
//         case "quantity-desc":
//           return (parseInt(b.jobDetails?.quantity) || 0) - (parseInt(a.jobDetails?.quantity) || 0);
//         case "date-desc":
//           return new Date(b.deliveryDate || 0) - new Date(a.deliveryDate || 0);
//         case "date-asc":
//           return new Date(a.deliveryDate || 0) - new Date(b.deliveryDate || 0);
//         case "stage": {
//           // Get the index of each stage from the stages array
//           const stageIndexA = stages.indexOf(a.stage);
//           const stageIndexB = stages.indexOf(b.stage);
//           // Sort by stage index (this will follow the order in the stages array)
//           return stageIndexA - stageIndexB;
//         }
//         default:
//           return new Date(b.date || 0) - new Date(a.date || 0);
//       }
//     });
//   };

//   // Toggle client expansion
//   const toggleClient = (clientId) => {
//     if (expandedClientId === clientId) {
//       setExpandedClientId(null);
//     } else {
//       setExpandedClientId(clientId);
//     }
//   };

//   // Handle order selection
//   const handleOrderSelection = (orderId, isSelected) => {
//     if (isSelected) {
//       setSelectedOrders(prev => [...prev, orderId]);
//     } else {
//       setSelectedOrders(prev => prev.filter(id => id !== orderId));
//     }
//   };

//   // Handle select all orders for a client
//   const handleSelectAllClientOrders = (clientId, isSelected) => {
//     const clientOrders = clientGroups[clientId]?.orders || [];
//     const clientOrderIds = clientOrders.map(order => order.id);
    
//     if (isSelected) {
//       // Add all client orders that aren't already selected
//       setSelectedOrders(prev => {
//         const currentSelectedSet = new Set(prev);
//         clientOrderIds.forEach(id => currentSelectedSet.add(id));
//         return Array.from(currentSelectedSet);
//       });
//     } else {
//       // Remove all client orders
//       setSelectedOrders(prev => 
//         prev.filter(id => !clientOrderIds.includes(id))
//       );
//     }
//   };

//   // Handle invoice generation for selected orders
//   const handleGenerateInvoice = () => {
//     if (selectedOrders.length === 0) {
//       alert("Please select at least one order to generate an invoice.");
//       return;
//     }
    
//     // Open invoice modal
//     setIsInvoiceModalOpen(true);
//   };

//   // Handle view order details
//   const handleViewOrderDetails = (order) => {
//     setSelectedOrder(order);
//     setIsOrderDetailsModalOpen(true);
//   };

//   // Reset selection
//   const clearSelection = () => {
//     setSelectedOrders([]);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Orders</h1>
//           <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
//         </div>
//         <div className="animate-pulse space-y-4">
//           <div className="h-12 bg-gray-200 rounded-md"></div>
//           <div className="h-12 bg-gray-200 rounded-md"></div>
//           <div className="h-12 bg-gray-200 rounded-md"></div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <h3 className="text-red-800 font-medium">Error loading orders</h3>
//           <p className="text-red-600 mt-1">{error.message}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <h1 className="text-2xl font-bold">Orders Management</h1>
        
//         <div className="flex flex-wrap gap-2 w-full md:w-auto">
//           {/* View mode selector */}
//           <div className="flex rounded-md overflow-hidden border border-gray-300">
//             <button
//               onClick={() => setViewMode('active')}
//               className={`px-3 py-2 text-sm ${
//                 viewMode === 'active' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-white text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               Active
//             </button>
//             <button
//               onClick={() => setViewMode('completed')}
//               className={`px-3 py-2 text-sm ${
//                 viewMode === 'completed' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-white text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               Completed
//             </button>
//             <button
//               onClick={() => setViewMode('all')}
//               className={`px-3 py-2 text-sm ${
//                 viewMode === 'all' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-white text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               All
//             </button>
//           </div>
          
//           {/* Search and filter controls */}
//           <input
//             type="text"
//             placeholder="Search orders..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="px-3 py-2 border text-sm rounded-md flex-grow md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
          
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//           >
//             <option value="">All Stages</option>
//             {stages.map(stage => (
//               <option key={stage} value={stage}>{stage}</option>
//             ))}
//           </select>
          
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//           >
//             {Object.entries(sortOptions).map(([value, label]) => (
//               <option key={value} value={value}>
//                 Sort by: {label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
      
//       {/* Selection Controls */}
//       {selectedOrders.length > 0 && (
//         <div className="mb-4 bg-blue-50 p-3 rounded-lg flex justify-between items-center">
//           <div>
//             <span className="font-medium">{selectedOrders.length}</span> orders selected
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleGenerateInvoice}
//               className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               Generate Invoice
//             </button>
//             <button
//               onClick={clearSelection}
//               className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//             >
//               Clear Selection
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Content - Client Groups */}
//       {Object.keys(clientGroups).length === 0 ? (
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <h2 className="text-xl font-medium text-gray-700 mt-4 mb-2">No Orders Found</h2>
//           <p className="text-gray-500">
//             {viewMode === 'active' 
//               ? 'There are no active orders that match your search criteria.' 
//               : viewMode === 'completed' 
//                 ? 'There are no completed orders that match your search criteria.'
//                 : 'No orders match your search criteria.'}
//           </p>
//           {(searchQuery || filterStatus || viewMode !== 'all') && (
//             <button
//               onClick={() => {
//                 setSearchQuery("");
//                 setFilterStatus("");
//                 setViewMode("all");
//               }}
//               className="mt-4 text-blue-500 hover:underline"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* List of client groups */}
//           {Object.values(clientGroups).map((client) => (
//             <ClientOrderGroup
//               key={client.id}
//               client={client}
//               isExpanded={expandedClientId === client.id}
//               onToggle={() => toggleClient(client.id)}
//               selectedOrders={selectedOrders}
//               onSelectOrder={handleOrderSelection}
//               onSelectAllOrders={handleSelectAllClientOrders}
//               onOrderClick={handleViewOrderDetails}
//               onUpdateStage={updateOrderStage}
//               stages={stages}
//             />
//           ))}
//         </div>
//       )}

//       {/* Order Details Modal */}
//       {isOrderDetailsModalOpen && selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => {
//             setIsOrderDetailsModalOpen(false);
//             setSelectedOrder(null);
//           }}
//           onStageUpdate={(newStage) => updateOrderStage(selectedOrder.id, newStage)}
//         />
//       )}

//       {/* Invoice Modal */}
//       {isInvoiceModalOpen && (
//         <NewInvoiceModal
//           selectedOrderIds={selectedOrders}
//           orders={allOrders.filter(order => selectedOrders.includes(order.id))}
//           onClose={() => setIsInvoiceModalOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import OrderDetailsModal from './OrderDetailsModal';
import ClientOrderGroup from './ClientOrderGroup';
import NewInvoiceModal from './NewInvoiceModal';

const OrdersPage = () => {
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Available stages for orders
  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

  // Sort options for dropdown
  const sortOptions = {
    "quantity-asc": "Quantity - Low to High",
    "quantity-desc": "Quantity - High to Low",
    "date-desc": "Delivery Date - Latest to Oldest",
    "date-asc": "Delivery Date - Oldest to Latest",
    "stage": "Stage"
  };

  // Fetch all orders on mount
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
              clientId: data.clientId || "unknown",
              clientName: data.clientName || 'Unknown Client',
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
  }, []);

  // Update order stage
  const updateOrderStage = async (orderId, newStage) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        stage: newStage,
        status: newStage === 'Delivery' ? 'Completed' : 'In Progress',
        lastUpdated: new Date().toISOString()
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
      filtered = filtered.filter(order => order.stage !== 'Delivery');
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(order => order.stage === 'Delivery');
    }
    
    // Sort filtered orders
    filtered = sortOrders(filtered, sortBy);
    
    // Group by client
    return filtered.reduce((acc, order) => {
      const clientId = order.clientId || "unknown";
      
      if (!acc[clientId]) {
        acc[clientId] = {
          id: clientId,
          name: order.clientName || "Unknown Client",
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
      if (order.stage === 'Delivery') {
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

  // Error state
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
          
          {/* Search and filter controls */}
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border text-sm rounded-md flex-grow md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                Sort by: {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Selection Controls */}
      {selectedOrders.length > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-medium">{selectedOrders.length}</span> orders selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateInvoice}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Invoice
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Client Groups */}
      {Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-gray-700 mt-4 mb-2">No Orders Found</h2>
          <p className="text-gray-500">
            {viewMode === 'active' 
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
              className="mt-4 text-blue-500 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* List of client groups */}
          {Object.values(clientGroups).map((client) => (
            <ClientOrderGroup
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

      {/* Order Details Modal */}
      {isOrderDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          onStageUpdate={(newStage) => updateOrderStage(selectedOrder.id, newStage)}
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

export default OrdersPage;