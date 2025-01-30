// import React, { useEffect, useState } from 'react';
// import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
// import { db } from '../../firebaseConfig';
// import OrderDetailsModal from './OrderDetailsModal';

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState(null);

//   const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

//   const stageColors = {
//     'Design': { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', border: 'border-indigo-500' },
//     'Positives': { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', border: 'border-cyan-500' },
//     'Printing': { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-500' },
//     'Quality Check': { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'border-pink-500' },
//     'Delivery': { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', border: 'border-emerald-500' }
//   };

//   // Set up real-time listener
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
//               clientName: data.clientName || '',
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
//               dieCuttingDetails: data.dieCuttingDetails || null,
//               sandwichDetails: data.sandwichDetails || null,
//               pastingDetails: data.pastingDetails || {}
//             };
//           });
//           setOrders(ordersData);
//           setFilteredOrders(ordersData);
//           setError(null);
//         } catch (err) {
//           console.error("Error processing orders data:", err);
//           setError(err);
//         } finally {
//           setLoading(false);
//         }
//       },
//       (err) => {
//         console.error("Firestore subscription error:", err);
//         setError(err);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const filtered = orders.filter(order => 
//       order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.jobDetails?.jobType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.jobDetails?.quantity?.toString().includes(searchQuery)
//     );
//     setFilteredOrders(filtered);
//   }, [searchQuery, orders]);

//   const updateStage = async (orderId, newStage) => {
//     try {
//       setUpdating(true);
//       const orderRef = doc(db, "orders", orderId);
      
//       // Update both stage and status for Delivery stage
//       await updateDoc(orderRef, {
//         stage: newStage,
//         status: newStage === 'Delivery' ? 'Delivered' : 'In Progress',
//         lastUpdated: new Date().toISOString()
//       });
//     } catch (error) {
//       console.error("Error updating stage:", error);
//       throw error;
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const StatusCircle = ({ stage, currentStage, orderId }) => {
//     const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
//     const thisStageOrder = stages.indexOf(stage);
//     const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
//     const isCurrent = currentStage === stage;
//     const colors = stageColors[stage];
  
//     const handleStageClick = async (e) => {
//       e.stopPropagation();
//       if (updating) return;
  
//       try {
//         // If clicking current stage, move back one stage
//         if (isCurrent) {
//           const previousStage = stages[thisStageOrder - 1] || 'Not started yet';
//           await updateStage(orderId, previousStage);
//         } else {
//           // If clicking another stage, move to that stage
//           await updateStage(orderId, stage);
//         }
//       } catch (error) {
//         alert("Failed to update stage. Please try again.");
//       }
//     };
  
//     return (
//       <div className="flex justify-center">
//         <div 
//           onClick={handleStageClick}
//           className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer
//             transition duration-150 ease-in-out
//             ${isCompleted ? `${colors.bg} ${colors.border}` : 'bg-gray-200 border-gray-300'} 
//             ${!isCompleted ? 'hover:bg-gray-300' : colors.hover}
//             ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           {isCompleted && (
//             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//             </svg>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     try {
//       return new Date(dateString).toLocaleDateString('en-GB');
//     } catch (error) {
//       return dateString;
//     }
//   };

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
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Orders</h1>
//         <input
//           type="text"
//           placeholder="Search orders..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-3 text-left">Client Name</th>
//               <th className="px-4 py-3 text-left">Project Type</th>
//               <th className="px-4 py-3 text-left">Quantity</th>
//               <th className="px-4 py-3 text-left">Delivery Date</th>
//               <th className="px-4 py-3 text-left">Current Stage</th>
//               {stages.slice(1).map((stage) => (
//                 <th key={stage} className="px-4 py-3 text-center relative group">
//                   {stage}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredOrders.map((order) => (
//               <tr 
//                 key={order.id} 
//                 className="hover:bg-gray-50 cursor-pointer transition-colors"
//                 onClick={() => setSelectedOrder(order)}
//               >
//                 <td className="px-4 py-3">
//                   <span className="text-blue-500 hover:underline">
//                     {order.clientName}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">{order.jobDetails?.jobType || 'N/A'}</td>
//                 <td className="px-4 py-3">{order.jobDetails?.quantity || 'N/A'}</td>
//                 <td className="px-4 py-3">{formatDate(order.deliveryDate)}</td>
//                 <td className="px-4 py-3">
//                   <span className={`px-2 py-1 text-sm rounded-full text-white
//                     ${stageColors[order.stage]?.bg || 'bg-gray-100 text-gray-800'}`}
//                   >
//                     {order.stage === 'Delivery' ? 'Delivered' : order.stage || 'Not started yet'}
//                   </span>
//                 </td>
//                 {stages.slice(1).map((stage) => (
//                   <td key={`${order.id}-${stage}`} className="px-4 py-3">
//                     <StatusCircle 
//                       stage={stage} 
//                       currentStage={order.stage} 
//                       orderId={order.id}
//                     />
//                   </td>
//                 ))}
//               </tr>
//             ))}
//             {filteredOrders.length === 0 && (
//               <tr>
//                 <td colSpan={stages.length + 4} className="px-4 py-8 text-center text-gray-500">
//                   No orders found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onStageUpdate={(newStage) => updateStage(selectedOrder.id, newStage)}
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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

  const stageColors = {
    'Design': { bg: 'bg-[#6366F1]', text: 'text-white' },
    'Positives': { bg: 'bg-[#06B6D4]', text: 'text-white' },
    'Printing': { bg: 'bg-[#F97316]', text: 'text-white' },
    'Quality Check': { bg: 'bg-[#EC4899]', text: 'text-white' },
    'Delivery': { bg: 'bg-[#10B981]', text: 'text-white' }
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
              clientName: data.clientName || '',
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
              dieCuttingDetails: data.dieCuttingDetails || null,
              sandwichDetails: data.sandwichDetails || null,
              pastingDetails: data.pastingDetails || {}
            };
          });
          setOrders(ordersData);
          setFilteredOrders(ordersData);
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

  useEffect(() => {
    const filtered = orders.filter(order => 
      order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.jobDetails?.jobType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.jobDetails?.quantity?.toString().includes(searchQuery)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const updateStage = async (orderId, newStage) => {
    try {
      setUpdating(true);
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        stage: newStage,
        status: newStage === 'Delivery' ? 'Delivered' : 'In Progress',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const StatusCircle = ({ stage, currentStage, orderId }) => {
    const currentStageOrder = stages.indexOf(currentStage || 'Not started yet');
    const thisStageOrder = stages.indexOf(stage);
    const isCompleted = currentStageOrder > thisStageOrder || currentStage === stage;
    const isCurrent = currentStage === stage;
    const colors = stageColors[stage];
  
    const handleStageClick = async (e) => {
      e.stopPropagation();
      if (updating) return;
  
      try {
        if (isCurrent) {
          const previousStage = stages[thisStageOrder - 1] || 'Not started yet';
          await updateStage(orderId, previousStage);
        } else {
          await updateStage(orderId, stage);
        }
      } catch (error) {
        alert("Failed to update stage. Please try again.");
      }
    };
  
    return (
      <div className="flex justify-center">
        <div 
          onClick={handleStageClick}
          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
            transition duration-150 ease-in-out
            ${isCompleted ? colors.bg : 'bg-gray-200'}`}
        >
          {isCompleted && (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md w-[350px] focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stage</th>
              {stages.slice(1).map((stage) => (
                <th key={stage} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  {stage}
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
                <td className="px-6 py-4">
                  <span className="text-blue-600 hover:underline">
                    {order.clientName}
                  </span>
                </td>
                <td className="px-6 py-4">{order.jobDetails?.jobType || 'N/A'}</td>
                <td className="px-6 py-4">{order.jobDetails?.quantity || 'N/A'}</td>
                <td className="px-6 py-4">{formatDate(order.deliveryDate)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs rounded-full
                    ${stageColors[order.stage]?.bg || 'bg-gray-100'} 
                    ${stageColors[order.stage]?.text || 'text-gray-800'}`}
                  >
                    {order.stage === 'Delivery' ? 'Delivered' : order.stage || 'Not started yet'}
                  </span>
                </td>
                {stages.slice(1).map((stage) => (
                  <td key={`${order.id}-${stage}`} className="px-6 py-4">
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
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStageUpdate={(newStage) => updateStage(selectedOrder.id, newStage)}
        />
      )}
    </div>
  );
};

export default OrdersPage;