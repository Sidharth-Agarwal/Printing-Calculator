// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import OrderDropdown from "./OrderDropdown";

// const OrdersPage = () => {
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [noResults, setNoResults] = useState(false);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "orders"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setOrdersData(data);
//         setFilteredOrders(data);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = ordersData.filter((order) => {
//       const clientName = order.clientName.toLowerCase();
//       const projectName = order.projectName.toLowerCase();
//       const jobType = order.jobDetails?.jobType?.toLowerCase() || "";
//       const quantity = order.jobDetails?.quantity?.toString() || "";

//       return (
//         clientName.includes(query) ||
//         projectName.includes(query) ||
//         jobType.includes(query) ||
//         quantity.includes(query)
//       );
//     });

//     setFilteredOrders(filtered);
//     setNoResults(filtered.length === 0);
//   };

//   if (loading) return <p>Loading orders...</p>;

//   return (
//     <div className="p-6 bg-gray-100 rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Orders Page</h2>

//       <div className="mt-6 mb-6">
//         <input
//           type="text"
//           placeholder="Search by client, project name, job type, or quantity..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
//         />
//         {noResults && <p className="text-gray-500 mt-2 text-sm">No such orders found.</p>}
//       </div>

//       <div className="space-y-4">
//         {filteredOrders.map((order) => (
//           <OrderDropdown key={order.id} order={order} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDropdown from "./OrderDropdown";

const OrdersPage = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrdersData(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = ordersData.filter((order) => {
      const clientName = order.clientName.toLowerCase();
      const projectName = order.projectName.toLowerCase();
      const jobType = order.jobDetails?.jobType?.toLowerCase() || "";
      const quantity = order.jobDetails?.quantity?.toString() || "";

      return (
        clientName.includes(query) ||
        projectName.includes(query) ||
        jobType.includes(query) ||
        quantity.includes(query)
      );
    });

    setFilteredOrders(filtered);
    setNoResults(filtered.length === 0);
  };

  const handleOrderUpdate = async (orderId, updatedOrder) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, updatedOrder);

      // Update local state
      setOrdersData((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Orders Page</h2>

      <div className="mt-6 mb-6">
        <input
          type="text"
          placeholder="Search by client, project name, job type, or quantity..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
        {noResults && <p className="text-gray-500 mt-2 text-sm">No such orders found.</p>}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderDropdown
            key={order.id}
            order={order}
            onOrderUpdate={(updatedOrder) => handleOrderUpdate(order.id, updatedOrder)}
          />
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
