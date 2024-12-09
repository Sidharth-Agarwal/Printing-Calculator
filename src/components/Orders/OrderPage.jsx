// import React, { useEffect, useState } from "react";
// import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
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

//   const handleOrderUpdate = async (orderId, updatedOrder) => {
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       await updateDoc(orderRef, { stage: updatedOrder.stage });

//       // Update local state for UI synchronization
//       setOrdersData((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === orderId ? { ...order, stage: updatedOrder.stage } : order
//         )
//       );

//       setFilteredOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === orderId ? { ...order, stage: updatedOrder.stage } : order
//         )
//       );
//     } catch (error) {
//       console.error("Error updating order in Firebase:", error);
//     }
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
//           <OrderDropdown
//             key={order.id}
//             order={order}
//             onOrderUpdate={(updatedOrder) => handleOrderUpdate(order.id, updatedOrder)}
//           />
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
  const [sortCriteria, setSortCriteria] = useState(""); // For sorting
  const [filterStage, setFilterStage] = useState(""); // For filtering by stage

  const stages = [
    "Not started yet",
    "Design",
    "Positives",
    "Printing",
    "Quality Check",
    "Delivery",
  ];

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
    applyFiltersAndSort(query, filterStage, sortCriteria);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortCriteria(selectedSort);
    applyFiltersAndSort(searchQuery, filterStage, selectedSort);
  };

  const handleFilterChange = (e) => {
    const selectedStage = e.target.value;
    setFilterStage(selectedStage);
    applyFiltersAndSort(searchQuery, selectedStage, sortCriteria);
  };

  const applyFiltersAndSort = (query, stageFilter, sortBy) => {
    let filtered = [...ordersData];

    // Apply search filter
    if (query) {
      filtered = filtered.filter((order) => {
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
    }

    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter((order) => order.stage === stageFilter);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "clientName") return a.clientName.localeCompare(b.clientName);
        if (sortBy === "projectName") return a.projectName.localeCompare(b.projectName);
        if (sortBy === "quantity") return (a.jobDetails?.quantity || 0) - (b.jobDetails?.quantity || 0);
        if (sortBy === "deliveryDate") {
          const dateA = new Date(a.deliveryDate || 0);
          const dateB = new Date(b.deliveryDate || 0);
          return dateA - dateB;
        }
        return 0;
      });
    }

    setFilteredOrders(filtered);
    setNoResults(filtered.length === 0);
  };

  const handleOrderUpdate = async (orderId, updatedOrder) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { stage: updatedOrder.stage });

      // Update local state for UI synchronization
      setOrdersData((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, stage: updatedOrder.stage } : order
        )
      );

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, stage: updatedOrder.stage } : order
        )
      );
    } catch (error) {
      console.error("Error updating order in Firebase:", error);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Orders Page</h2>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by client, project name, job type, or quantity..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-grow p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />

        {/* Filter Dropdown */}
        <select
          value={filterStage}
          onChange={handleFilterChange}
          className="p-3 border rounded-md shadow-sm"
        >
          <option value="">All Stages</option>
          {stages.map((stage, index) => (
            <option key={index} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortCriteria}
          onChange={handleSortChange}
          className="p-3 border rounded-md shadow-sm"
        >
          <option value="">Sort By</option>
          <option value="clientName">Client Name</option>
          <option value="projectName">Project Name</option>
          <option value="quantity">Quantity</option>
          <option value="deliveryDate">Delivery Date</option>
        </select>
      </div>

      {noResults && <p className="text-gray-500 mt-2 text-sm">No such order found.</p>}

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
