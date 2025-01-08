// import React, { useState, useEffect } from "react";
// import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import OrderDetailsModal from "./OrderDetailsModal";

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null); // For modal

//   // Define the toggle stages in correct sequence
//   const stages = ["Design", "Positives", "Printing", "Quality Check", "Delivery"];

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "orders"));
//         const ordersData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//           toggles: stages.reduce((acc, stage) => {
//             acc[stage] = false; // Initialize all toggles to false
//             return acc;
//           }, {}),
//         }));
//         setOrders(ordersData);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
  
//   const updateFirestoreStage = async (orderId, stage) => {
//     console.log("Updating stage for order ID:", orderId); // Log the orderId
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       const docSnapshot = await getDoc(orderRef);
  
//       if (!docSnapshot.exists()) {
//         console.error(`Order with ID ${orderId} does not exist in Firestore.`);
//         return;
//       }
  
//       await updateDoc(orderRef, { stage });
//       console.log(`Order ${orderId} updated to stage: ${stage}`);
//     } catch (error) {
//       console.error("Error updating Firestore stage:", error);
//     }
//   };  

//   const handleToggle = (orderId, clickedStage) => {
//     setOrders((prevOrders) =>
//       prevOrders.map((order) => {
//         if (order.id === orderId) {
//           const updatedToggles = { ...order.toggles };
//           let enableToggles = true;

//           // Update toggles in sequence
//           stages.forEach((stage) => {
//             if (enableToggles) {
//               updatedToggles[stage] = true; // Enable toggles until the clicked stage
//             } else {
//               updatedToggles[stage] = false; // Disable toggles after the clicked stage
//             }

//             if (stage === clickedStage) {
//               enableToggles = false;
//             }
//           });

//           // Find the last checked stage
//           const lastCheckedStage = stages.findLast((stage) => updatedToggles[stage]);

//           // Update Firestore with the last checked stage
//           updateFirestoreStage(order.id, lastCheckedStage || "Not started yet");

//           return {
//             ...order,
//             toggles: updatedToggles,
//             stage: lastCheckedStage || "Not started yet", // Update the local state
//           };
//         }
//         return order;
//       })
//     );
//   };

//   if (loading) return <p>Loading orders...</p>;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-8">Orders Page</h2>

//       {/* Orders Table */}
//       <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden text-center">
//         <thead className="bg-gray-200">
//           <tr>
//             <th className="px-4 py-2">Client Name</th>
//             <th className="px-4 py-2">Project Type</th>
//             <th className="px-4 py-2">Quantity</th>
//             <th className="px-4 py-2">Delivery Date</th>
//             <th className="px-4 py-2">Design</th>
//             <th className="px-4 py-2">Positives</th>
//             <th className="px-4 py-2">Printing</th>
//             <th className="px-4 py-2">Quality Check</th>
//             <th className="px-4 py-2">Delivery</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.id} className="border-b">
//               <td
//                 className="px-4 py-2 text-blue-600 cursor-pointer"
//                 onClick={() => setSelectedOrder(order)} // Open modal
//               >
//                 {order.clientName || "N/A"}
//               </td>
//               <td className="px-4 py-2">{order.jobDetails?.jobType || "N/A"}</td>
//               <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>
//               <td className="px-4 py-2">
//                 {order.deliveryDate
//                   ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
//                   : "Not Specified"}
//               </td>
//               {/* Render toggles */}
//               {stages.map((stage) => (
//                 <td key={stage} className="px-4 py-2">
//                   <div
//                     className="flex items-center justify-center cursor-pointer"
//                     onClick={() => handleToggle(order.id, stage)} // Handle toggle click
//                   >
//                     <div
//                       className={`w-6 h-6 flex items-center justify-center border rounded-full ${
//                         order.toggles[stage]
//                           ? "border-blue-400 bg-blue-500"
//                           : "border-gray-300 bg-gray-200"
//                       }`}
//                     >
//                       {order.toggles[stage] && (
//                         <div className="w-4 h-4 rounded-full bg-white"></div>
//                       )}
//                     </div>
//                   </div>
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Order Details Modal */}
//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)} // Close modal
//         />
//       )}
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDetailsModal from "./OrderDetailsModal";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal

  // Define the toggle stages in correct sequence
  const stages = ["Design", "Positives", "Printing", "Quality Check", "Delivery"];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID
          ...doc.data(),
          toggles: stages.reduce((acc, stage) => {
            acc[stage] = false; // Initialize all toggles to false
            return acc;
          }, {}),
        }));
        console.log("Fetched Orders:", ordersData); // Debugging
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // // Function to update the Firestore stage
  // const updateFirestoreStage = async (orderId, stage) => {
  //   console.log("Updating stage for order ID:", orderId); // Log the orderId
  //   try {
  //     const orderRef = doc(db, "orders", orderId); // Reference the document
  //     const docSnapshot = await getDoc(orderRef); // Fetch the document

  //     if (!docSnapshot.exists()) {
  //       console.error(`Order with ID ${orderId} does not exist in Firestore.`);
  //       return; // Exit the function early
  //     }

  //     await updateDoc(orderRef, { stage });
  //     console.log(`Order ${orderId} updated to stage: ${stage}`);
  //   } catch (error) {
  //     console.error("Error updating Firestore stage:", error);
  //   }
  // };

  const updateFirestoreStage = async (orderId, stage) => {
    console.log("Updating stage for order ID:", orderId); // Log the orderId
  
    try {
      const orderRef = doc(db, "orders", orderId); // Reference the document
      console.log("OrderRef Path:", orderRef.path); // Log the Firestore path
  
      const docSnapshot = await getDoc(orderRef, { source: "server" }); // Fetch from server
  
      if (!docSnapshot.exists()) {
        console.error(`Order with ID ${orderId} does not exist in Firestore.`);
        return; // Exit if document does not exist
      }
  
      await updateDoc(orderRef, { stage }); // Update the document
      console.log(`Order ${orderId} updated to stage: ${stage}`);
    } catch (error) {
      console.error("Error updating Firestore stage:", error);
    }
  };  

  // Handle toggle updates
  const handleToggle = (orderId, clickedStage) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedToggles = { ...order.toggles };
          let enableToggles = true;

          // Update toggles sequentially based on the clicked stage
          stages.forEach((stage) => {
            if (enableToggles) {
              updatedToggles[stage] = true; // Enable toggles until the clicked stage
            } else {
              updatedToggles[stage] = false; // Disable toggles after the clicked stage
            }

            if (stage === clickedStage) {
              enableToggles = false;
            }
          });

          // Find the last checked stage
          const lastCheckedStage = stages.findLast((stage) => updatedToggles[stage]);

          // Update Firestore with the last checked stage
          updateFirestoreStage(order.id, lastCheckedStage || "Not started yet");

          return {
            ...order,
            toggles: updatedToggles,
            stage: lastCheckedStage || "Not started yet", // Update the local state
          };
        }
        return order;
      })
    );
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Orders Page</h2>

      {/* Orders Table */}
      <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Client Name</th>
            <th className="px-4 py-2">Project Type</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Delivery Date</th>
            <th className="px-4 py-2">Design</th>
            <th className="px-4 py-2">Positives</th>
            <th className="px-4 py-2">Printing</th>
            <th className="px-4 py-2">Quality Check</th>
            <th className="px-4 py-2">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td
                className="px-4 py-2 text-blue-600 cursor-pointer"
                onClick={() => setSelectedOrder(order)} // Open modal
              >
                {order.clientName || "N/A"}
              </td>
              <td className="px-4 py-2">{order.jobDetails?.jobType || "N/A"}</td>
              <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>
              <td className="px-4 py-2">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                  : "Not Specified"}
              </td>
              {/* Render toggles */}
              {stages.map((stage) => (
                <td key={stage} className="px-4 py-2">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => handleToggle(order.id, stage)} // Handle toggle click
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center border rounded-full ${
                        order.toggles[stage]
                          ? "border-blue-400 bg-blue-500"
                          : "border-gray-300 bg-gray-200"
                      }`}
                    >
                      {order.toggles[stage] && (
                        <div className="w-4 h-4 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)} // Close modal
        />
      )}
    </div>
  );
};

export default OrdersPage;
