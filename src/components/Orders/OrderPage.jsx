// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import OrderDetailsModal from "./OrderDetailsModal";

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null); // For modal

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "orders"));
//         const ordersData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
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
//               <td className="px-4 py-2">{order.projectType || "N/A"}</td>
//               <td className="px-4 py-2">{order.quantity || "N/A"}</td>
//               <td className="px-4 py-2">
//                 {order.deliveryDate
//                   ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
//                   : "Not Specified"}
//               </td>
//               {/* Render dummy toggles */}
//               {["Design", "Positives", "Printing", "Quality Check", "Delivery"].map(
//                 (stage, index) => (
//                   <td key={index} className="px-4 py-2">
//                     <div className="flex items-center justify-center">
//                       <div
//                         className={`w-6 h-6 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200`}
//                       ></div>
//                     </div>
//                   </td>
//                 )
//               )}
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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDetailsModal from "./OrderDetailsModal";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          toggles: {
            Design: false,
            Positives: false,
            Printing: false,
            "Quality Check": false,
            Delivery: false,
          }, // Initialize toggles for each order
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleToggle = (orderId, stage) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              toggles: {
                ...order.toggles,
                [stage]: !order.toggles[stage], // Toggle the value
              },
            }
          : order
      )
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
              <td className="px-4 py-2">{order.jobDetails.jobType || "N/A"}</td>
              <td className="px-4 py-2">{order.jobDetails.quantity || "N/A"}</td>
              <td className="px-4 py-2">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                  : "Not Specified"}
              </td>
              {/* Render toggles */}
              {["Design", "Positives", "Printing", "Quality Check", "Delivery"].map(
                (stage) => (
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
                )
              )}
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
