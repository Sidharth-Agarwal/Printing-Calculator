// // import React, { useEffect, useState } from "react";
// // import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
// // import { db } from "../../firebaseConfig";
// // import OrderDetails from "./OrderDetails";
// // import ToggleSwitch from "./ToggleSwitch"; // Reusing ToggleSwitch component

// // const OrdersPage = () => {
// //   const [ordersData, setOrdersData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [filteredOrders, setFilteredOrders] = useState([]);
// //   const [noResults, setNoResults] = useState(false);
// //   const [selectedOrder, setSelectedOrder] = useState(null); // For modal

// //   useEffect(() => {
// //     const fetchOrders = async () => {
// //       try {
// //         const querySnapshot = await getDocs(collection(db, "orders"));
// //         const data = querySnapshot.docs.map((doc) => ({
// //           id: doc.id,
// //           ...doc.data(),
// //         }));

// //         setOrdersData(data);
// //         setFilteredOrders(data);
// //       } catch (error) {
// //         console.error("Error fetching orders:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchOrders();
// //   }, []);

// //   const handleSearch = (e) => {
// //     const query = e.target.value.toLowerCase();
// //     setSearchQuery(query);

// //     const filtered = ordersData.filter((order) => {
// //       const clientName = order.clientName.toLowerCase();
// //       const projectName = order.projectName.toLowerCase();
// //       const jobType = order.jobDetails?.jobType?.toLowerCase() || "";
// //       const quantity = order.jobDetails?.quantity?.toString() || "";

// //       return (
// //         clientName.includes(query) ||
// //         projectName.includes(query) ||
// //         jobType.includes(query) ||
// //         quantity.includes(query)
// //       );
// //     });

// //     setFilteredOrders(filtered);
// //     setNoResults(filtered.length === 0);
// //   };

// //   const handleToggle = async (orderId, stage, value) => {
// //     try {
// //       const orderRef = doc(db, "orders", orderId);
// //       await updateDoc(orderRef, { [stage]: value });

// //       // Update local state
// //       setOrdersData((prevOrders) =>
// //         prevOrders.map((order) =>
// //           order.id === orderId ? { ...order, [stage]: value } : order
// //         )
// //       );

// //       setFilteredOrders((prevOrders) =>
// //         prevOrders.map((order) =>
// //           order.id === orderId ? { ...order, [stage]: value } : order
// //         )
// //       );
// //     } catch (error) {
// //       console.error("Error updating stage in Firebase:", error);
// //     }
// //   };

// //   if (loading) return <p>Loading orders...</p>;

// //   return (
// //     <div className="p-6 bg-gray-100 rounded shadow">
// //       <h2 className="text-2xl font-bold mb-4">Orders Page</h2>

// //       <div className="flex flex-wrap gap-4 items-center mb-6">
// //         {/* Search Bar */}
// //         <input
// //           type="text"
// //           placeholder="Search by client, project name, job type, or quantity..."
// //           value={searchQuery}
// //           onChange={handleSearch}
// //           className="flex-grow p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
// //         />
// //       </div>

// //       {noResults && <p className="text-gray-500 mt-2 text-sm">No such order found.</p>}

// //       <table className="w-full border-collapse border border-gray-200 rounded-md shadow">
// //         <thead className="bg-gray-100">
// //           <tr>
// //             <th className="p-3 border border-gray-300">Client Name</th>
// //             <th className="p-3 border border-gray-300">Project Type</th>
// //             <th className="p-3 border border-gray-300">Quantity</th>
// //             <th className="p-3 border border-gray-300">Delivery Date</th>
// //             <th className="p-3 border border-gray-300">Design</th>
// //             <th className="p-3 border border-gray-300">Positives</th>
// //             <th className="p-3 border border-gray-300">Printing</th>
// //             <th className="p-3 border border-gray-300">Quality Check</th>
// //             <th className="p-3 border border-gray-300">Delivery</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredOrders.map((order) => (
// //             <tr key={order.id} className="hover:bg-gray-50">
// //               <td
// //                 className="p-3 border border-gray-300 text-blue-500 cursor-pointer"
// //                 onClick={() => setSelectedOrder(order)}
// //               >
// //                 {order.clientName}
// //               </td>
// //               <td className="p-3 border border-gray-300">{order.jobDetails?.jobType || "N/A"}</td>
// //               <td className="p-3 border border-gray-300">{order.jobDetails?.quantity || 0}</td>
// //               <td className="p-3 border border-gray-300">
// //                 {order.deliveryDate
// //                   ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
// //                   : "Not Specified"}
// //               </td>
// //               {["design", "positives", "printing", "qualityCheck", "delivery"].map((stage) => (
// //                 <td className="p-3 border border-gray-300" key={stage}>
// //                   <ToggleSwitch
// //                     value={order[stage] || false}
// //                     onChange={(value) => handleToggle(order.id, stage, value)}
// //                   />
// //                 </td>
// //               ))}
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {/* Modal Popup for Order Details */}
// //       {selectedOrder && (
// //         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
// //           <div className="bg-white w-3/4 p-6 rounded-lg relative">
// //             <button
// //               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
// //               onClick={() => setSelectedOrder(null)}
// //             >
// //               &times;
// //             </button>
// //             <OrderDetails order={selectedOrder} />
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default OrdersPage;

// import React, { useEffect, useState } from "react";
// import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import OrderDetailsModal from "./OrderDetailsModal";

// const OrdersPage = () => {
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [noResults, setNoResults] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null); // For modal popup

//   const stages = ["Design", "Positives", "Printing", "Quality Check", "Delivery"];

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
//     applyFilters(query);
//   };

//   const applyFilters = (query) => {
//     let filtered = [...ordersData];

//     // Apply search filter
//     if (query) {
//       filtered = filtered.filter((order) => {
//         const clientName = order.clientName.toLowerCase();
//         const projectName = order.projectName.toLowerCase();
//         const jobType = order.jobDetails?.jobType?.toLowerCase() || "";
//         const quantity = order.jobDetails?.quantity?.toString() || "";
//         return (
//           clientName.includes(query) ||
//           projectName.includes(query) ||
//           jobType.includes(query) ||
//           quantity.includes(query)
//         );
//       });
//     }

//     setFilteredOrders(filtered);
//     setNoResults(filtered.length === 0);
//   };

//   const toggleStage = async (orderId, stage) => {
//     try {
//       const updatedOrders = ordersData.map((order) => {
//         if (order.id === orderId) {
//           const updatedStageValue = !order[stage];
//           return { ...order, [stage]: updatedStageValue };
//         }
//         return order;
//       });

//       setOrdersData(updatedOrders);
//       setFilteredOrders(updatedOrders);

//       // Update in Firebase
//       const orderRef = doc(db, "orders", orderId);
//       await updateDoc(orderRef, {
//         [stage]: !ordersData.find((order) => order.id === orderId)[stage],
//       });
//     } catch (error) {
//       console.error("Error updating stage:", error);
//     }
//   };

//   const handleClientNameClick = (order) => {
//     setSelectedOrder(order); // Set the selected order for the modal popup
//   };

//   const closeModal = () => {
//     setSelectedOrder(null); // Close the modal
//   };

//   if (loading) return <p>Loading orders...</p>;

//   return (
//     <div className="p-6 bg-gray-100 rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Orders Page</h2>

//       <div className="flex flex-wrap gap-4 items-center mb-6">
//         {/* Search Bar */}
//         <input
//           type="text"
//           placeholder="Search by client, project name, job type, or quantity..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="flex-grow p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
//         />
//       </div>

//       {noResults && <p className="text-gray-500 mt-2 text-sm">No such order found.</p>}

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-300 rounded-md">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Client Name</th>
//               <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Project Name</th>
//               <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Quantity</th>
//               <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Delivery Date</th>
//               {stages.map((stage) => (
//                 <th key={stage} className="px-4 py-2 text-center font-semibold text-gray-700 border-b">
//                   {stage}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredOrders.map((order) => (
//               <tr key={order.id} className="hover:bg-gray-100">
//                 {/* Client Name (Clickable for modal) */}
//                 <td
//                   className="px-4 py-2 text-blue-500 font-semibold cursor-pointer underline"
//                   onClick={() => handleClientNameClick(order)}
//                 >
//                   {order.clientName}
//                 </td>

//                 {/* Project Name */}
//                 <td className="px-4 py-2">{order.projectName}</td>

//                 {/* Quantity */}
//                 <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>

//                 {/* Delivery Date */}
//                 <td className="px-4 py-2">
//                   {order.deliveryDate
//                     ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
//                     : "Not Specified"}
//                 </td>

//                 {/* Toggles for Stages */}
//                 {stages.map((stage) => (
//                   <td key={stage} className="px-4 py-2 text-center">
//                     <div
//                       className="flex items-center space-x-3 cursor-pointer"
//                       onClick={() => toggleStage(order.id, stage)}
//                     >
//                       <div className="w-6 h-6 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//                         {order[stage] && (
//                           <div className="w-4 h-4 rounded-full bg-blue-500"></div>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal for Order Details */}
//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={closeModal}
//         />
//       )}
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDetailsModal from "./OrderDetailsModal";

const OrdersPage = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [sortCriteria, setSortCriteria] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // For the modal

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

  const handleToggleStage = async (orderId, stage) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { stage });

      // Update local state for UI synchronization
      setOrdersData((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, stage } : order
        )
      );

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, stage } : order
        )
      );
    } catch (error) {
      console.error("Error updating stage in Firebase:", error);
    }
  };

  const renderToggle = (order, stage) => {
    const isActive = order.stage === stage;

    return (
      <label
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => handleToggleStage(order.id, stage)}
      >
        {/* Circular Button */}
        <div
          className={`w-6 h-6 flex items-center justify-center border rounded-full ${
            isActive ? "border-blue-400 bg-blue-500" : "border-gray-300 bg-gray-200"
          }`}
        >
          {isActive && <div className="w-4 h-4 rounded-full bg-white"></div>}
        </div>
      </label>
    );
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

      {/* Orders Table */}
      <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Client Name</th>
            <th className="px-4 py-2 text-left">Project Name</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Delivery Date</th>
            <th className="px-4 py-2">Design</th>
            <th className="px-4 py-2">Positives</th>
            <th className="px-4 py-2">Printing</th>
            <th className="px-4 py-2">Quality Check</th>
            <th className="px-4 py-2">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td
                className="px-4 py-2 text-blue-600 cursor-pointer"
                onClick={() => setSelectedOrder(order)} // Open modal
              >
                {order.clientName}
              </td>
              <td className="px-4 py-2">{order.projectName}</td>
              <td className="px-4 py-2">{order.jobDetails?.quantity || "0"}</td>
              <td className="px-4 py-2">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                  : "Not Specified"}
              </td>
              {stages.map((stage) => (
                <td key={stage} className="px-4 py-2">
                  {renderToggle(order, stage)}
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
