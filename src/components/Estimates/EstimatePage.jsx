// // // import React, { useEffect, useState } from "react";
// // // import { collection, getDocs } from "firebase/firestore";
// // // import { db } from "../../firebaseConfig";
// // // import Estimate from "./Estimate";

// // // const EstimatesPage = () => {
// // //   const [estimatesData, setEstimatesData] = useState({});
// // //   const [loading, setLoading] = useState(true);
// // //   const [searchQuery, setSearchQuery] = useState("");
// // //   const [filteredData, setFilteredData] = useState({});
// // //   const [ordersData, setOrdersData] = useState({});
// // //   const [sortCriteria, setSortCriteria] = useState("");
// // //   const [filterStatus, setFilterStatus] = useState("");
// // //   const [expandedGroups, setExpandedGroups] = useState({});

// // //   useEffect(() => {
// // //     const fetchEstimates = async () => {
// // //       try {
// // //         const querySnapshot = await getDocs(collection(db, "estimates"));
// // //         const data = querySnapshot.docs.map((doc) => ({
// // //           id: doc.id,
// // //           ...doc.data(),
// // //         }));

// // //         // Group data by client and project
// // //         const groupedData = data.reduce((acc, estimate) => {
// // //           const { clientName, projectName } = estimate;
// // //           const groupKey = `${clientName}-${projectName}`;
// // //           if (!acc[groupKey]) acc[groupKey] = [];
// // //           acc[groupKey].push(estimate);
// // //           return acc;
// // //         }, {});

// // //         setEstimatesData(groupedData);
// // //         setFilteredData(groupedData);

// // //         // Set orders state
// // //         const ordersState = Object.entries(groupedData).reduce(
// // //           (acc, [groupKey, estimates]) => {
// // //             const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
// // //             if (movedEstimate) {
// // //               acc[groupKey] = movedEstimate.id;
// // //             }
// // //             return acc;
// // //           },
// // //           {}
// // //         );
// // //         setOrdersData(ordersState);
// // //       } catch (error) {
// // //         console.error("Error fetching estimates:", error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchEstimates();
// // //   }, []);

// // //   // Calculate total estimate cost for a group
// // //   const calculateTotalCost = (estimates) => {
// // //     return estimates.reduce((total, estimate) => {
// // //       if (!estimate.calculations) return total;

// // //       const relevantFields = [
// // //         'paperAndCuttingCostPerCard',
// // //         'lpCostPerCard',
// // //         'fsCostPerCard',
// // //         'embCostPerCard',
// // //         'lpCostPerCardSandwich',
// // //         'fsCostPerCardSandwich',
// // //         'embCostPerCardSandwich',
// // //         'digiCostPerCard'
// // //       ];

// // //       const costPerCard = relevantFields.reduce((acc, key) => {
// // //         const value = estimate.calculations[key];
// // //         return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
// // //       }, 0);

// // //       return total + (costPerCard * (estimate.jobDetails?.quantity || 0));
// // //     }, 0);
// // //   };

// // //   // Determine group status
// // //   const getGroupStatus = (estimates) => {
// // //     if (estimates.some(est => est.isCanceled)) return "Cancelled";
// // //     if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
// // //     return "Pending";
// // //   };

// // //   // Handle search and filtering
// // //   useEffect(() => {
// // //     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
// // //       const [clientName, projectName] = groupKey.split("-");
// // //       const matchesSearch = estimates.some((estimate) =>
// // //         Object.values({
// // //           clientName: clientName || "",
// // //           projectName: projectName || "",
// // //           jobType: estimate.jobDetails?.jobType || "",
// // //           quantity: estimate.jobDetails?.quantity?.toString() || "",
// // //         }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
// // //       );

// // //       if (matchesSearch) {
// // //         if (filterStatus) {
// // //           const status = getGroupStatus(estimates);
// // //           if (status === filterStatus) {
// // //             acc[groupKey] = estimates;
// // //           }
// // //         } else {
// // //           acc[groupKey] = estimates;
// // //         }
// // //       }

// // //       return acc;
// // //     }, {});

// // //     setFilteredData(filtered);
// // //   }, [searchQuery, estimatesData, filterStatus]);

// // //   if (loading) {
// // //     return (
// // //       <div className="p-6">
// // //         <div className="flex justify-between items-center mb-6">
// // //           <h1 className="text-2xl font-bold">Estimates</h1>
// // //           <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
// // //         </div>
// // //         <div className="animate-pulse space-y-4">
// // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   const toggleGroup = (groupKey) => {
// // //     setExpandedGroups(prev => ({
// // //       ...prev,
// // //       [groupKey]: !prev[groupKey]
// // //     }));
// // //   };

// // //   return (
// // //     <div className="p-6">
// // //       <div className="flex justify-between items-center mb-6">
// // //         <h1 className="text-xl font-medium">ESTIMATES MANAGEMENT</h1>
// // //         <div className="flex gap-4">
// // //           <input
// // //             type="text"
// // //             placeholder="Search estimates..."
// // //             value={searchQuery}
// // //             onChange={(e) => setSearchQuery(e.target.value)}
// // //             className="px-3 py-2 border text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //           />
// // //           <select
// // //             value={filterStatus}
// // //             onChange={(e) => setFilterStatus(e.target.value)}
// // //             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //           >
// // //             <option value="">All Status</option>
// // //             <option value="Pending">Pending</option>
// // //             <option value="Moved to Orders">Moved to Orders</option>
// // //             <option value="Cancelled">Cancelled</option>
// // //           </select>
// // //         </div>
// // //       </div>

// // //       <div className="bg-white rounded-lg shadow overflow-hidden">
// // //         <table className="min-w-full divide-y divide-gray-200">
// // //           <thead className="bg-gray-50">
// // //             <tr>
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Client Name
// // //               </th>
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Project Name
// // //               </th>
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Project Type
// // //               </th>
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Quantity
// // //               </th>
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Delivery Date
// // //               </th>
// // //               {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Total Estimate
// // //               </th> */}
// // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // //                 Status
// // //               </th>
// // //             </tr>
// // //           </thead>
// // //           <tbody className="bg-white divide-y divide-gray-200">
// // //             {Object.entries(filteredData).map(([groupKey, estimates]) => {
// // //               const [clientName, projectName] = groupKey.split("-");
// // //               const firstEstimate = estimates[0];
// // //               const status = getGroupStatus(estimates);
// // //               const totalCost = calculateTotalCost(estimates);

// // //               return (
// // //                 <React.Fragment key={groupKey}>
// // //                   <tr 
// // //                     className="hover:bg-gray-50 cursor-pointer"
// // //                     onClick={() => toggleGroup(groupKey)}
// // //                   >
// // //                     <td className="px-6 py-4">
// // //                       <div className="text-sm font-medium text-blue-600">{clientName}</div>
// // //                     </td>
// // //                     <td className="px-6 py-4">
// // //                       <div className="text-sm text-gray-900">{projectName}</div>
// // //                     </td>
// // //                     <td className="px-6 py-4">
// // //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
// // //                     </td>
// // //                     <td className="px-6 py-4">
// // //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
// // //                     </td>
// // //                     <td className="px-6 py-4">
// // //                       <div className="text-sm text-gray-900">
// // //                         {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
// // //                       </div>
// // //                     </td>
// // //                     {/* <td className="px-6 py-4">
// // //                       <div className="text-sm text-gray-900">₹ {totalCost.toFixed(2)}</div>
// // //                     </td> */}
// // //                     <td className="px-6 py-4">
// // //                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
// // //                         status === "Moved to Orders"
// // //                           ? "bg-green-100 text-green-800"
// // //                           : status === "Cancelled"
// // //                           ? "bg-red-100 text-red-800"
// // //                           : "bg-yellow-100 text-yellow-800"
// // //                       }`}>
// // //                         {status}
// // //                       </span>
// // //                     </td>
// // //                   </tr>
// // //                   {expandedGroups[groupKey] && (
// // //                     <tr>
// // //                       <td colSpan="7" className="px-6 py-4 bg-gray-50">
// // //                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
// // //                           {estimates.map((estimate, index) => (
// // //                             <Estimate
// // //                               key={estimate.id}
// // //                               estimate={estimate}
// // //                               estimateNumber={index + 1}
// // //                               movedToOrdersEstimateId={ordersData[groupKey]}
// // //                               setMovedToOrders={(id) =>
// // //                                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
// // //                               }
// // //                               estimates={estimates}
// // //                               setEstimatesData={setEstimatesData}
// // //                               groupKey={groupKey}
// // //                             />
// // //                           ))}
// // //                         </div>
// // //                       </td>
// // //                     </tr>
// // //                   )}
// // //                 </React.Fragment>
// // //               );
// // //             })}
// // //           </tbody>
// // //         </table>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default EstimatesPage;

// // // // import React, { useEffect, useState } from "react";
// // // // import { collection, getDocs } from "firebase/firestore";
// // // // import { db } from "../../firebaseConfig";
// // // // import Estimate from "./Estimate";
// // // // import { generateGroupEstimatePDF, generateGroupJobTicket } from "../../utils/pdfUtils";

// // // // const EstimatesPage = () => {
// // // //   const [estimatesData, setEstimatesData] = useState({});
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [searchQuery, setSearchQuery] = useState("");
// // // //   const [filteredData, setFilteredData] = useState({});
// // // //   const [ordersData, setOrdersData] = useState({});
// // // //   const [sortCriteria, setSortCriteria] = useState("");
// // // //   const [filterStatus, setFilterStatus] = useState("");
// // // //   const [expandedGroups, setExpandedGroups] = useState({});

// // // //   useEffect(() => {
// // // //     const fetchEstimates = async () => {
// // // //       try {
// // // //         const querySnapshot = await getDocs(collection(db, "estimates"));
// // // //         const data = querySnapshot.docs.map((doc) => ({
// // // //           id: doc.id,
// // // //           ...doc.data(),
// // // //         }));

// // // //         // Group data by client and project
// // // //         const groupedData = data.reduce((acc, estimate) => {
// // // //           const { clientName, projectName } = estimate;
// // // //           const groupKey = `${clientName}-${projectName}`;
// // // //           if (!acc[groupKey]) acc[groupKey] = [];
// // // //           acc[groupKey].push(estimate);
// // // //           return acc;
// // // //         }, {});

// // // //         setEstimatesData(groupedData);
// // // //         setFilteredData(groupedData);

// // // //         // Set orders state
// // // //         const ordersState = Object.entries(groupedData).reduce(
// // // //           (acc, [groupKey, estimates]) => {
// // // //             const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
// // // //             if (movedEstimate) {
// // // //               acc[groupKey] = movedEstimate.id;
// // // //             }
// // // //             return acc;
// // // //           },
// // // //           {}
// // // //         );
// // // //         setOrdersData(ordersState);
// // // //       } catch (error) {
// // // //         console.error("Error fetching estimates:", error);
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchEstimates();
// // // //   }, []);

// // // //   // Calculate total estimate cost for a group
// // // //   const calculateTotalCost = (estimates) => {
// // // //     return estimates.reduce((total, estimate) => {
// // // //       if (!estimate.calculations) return total;

// // // //       const relevantFields = [
// // // //         'paperAndCuttingCostPerCard',
// // // //         'lpCostPerCard',
// // // //         'fsCostPerCard',
// // // //         'embCostPerCard',
// // // //         'lpCostPerCardSandwich',
// // // //         'fsCostPerCardSandwich',
// // // //         'embCostPerCardSandwich',
// // // //         'digiCostPerCard'
// // // //       ];

// // // //       const costPerCard = relevantFields.reduce((acc, key) => {
// // // //         const value = estimate.calculations[key];
// // // //         return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
// // // //       }, 0);

// // // //       return total + (costPerCard * (estimate.jobDetails?.quantity || 0));
// // // //     }, 0);
// // // //   };

// // // //   // Determine group status
// // // //   const getGroupStatus = (estimates) => {
// // // //     if (estimates.some(est => est.isCanceled)) return "Cancelled";
// // // //     if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
// // // //     return "Pending";
// // // //   };

// // // //   // Handle search and filtering
// // // //   useEffect(() => {
// // // //     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
// // // //       const [clientName, projectName] = groupKey.split("-");
// // // //       const matchesSearch = estimates.some((estimate) =>
// // // //         Object.values({
// // // //           clientName: clientName || "",
// // // //           projectName: projectName || "",
// // // //           jobType: estimate.jobDetails?.jobType || "",
// // // //           quantity: estimate.jobDetails?.quantity?.toString() || "",
// // // //         }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
// // // //       );

// // // //       if (matchesSearch) {
// // // //         if (filterStatus) {
// // // //           const status = getGroupStatus(estimates);
// // // //           if (status === filterStatus) {
// // // //             acc[groupKey] = estimates;
// // // //           }
// // // //         } else {
// // // //           acc[groupKey] = estimates;
// // // //         }
// // // //       }

// // // //       return acc;
// // // //     }, {});

// // // //     setFilteredData(filtered);
// // // //   }, [searchQuery, estimatesData, filterStatus]);

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="p-6">
// // // //         <div className="flex justify-between items-center mb-6">
// // // //           <h1 className="text-2xl font-bold">Estimates</h1>
// // // //           <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
// // // //         </div>
// // // //         <div className="animate-pulse space-y-4">
// // // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // // //           <div className="h-12 bg-gray-200 rounded-md"></div>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   const toggleGroup = (groupKey) => {
// // // //     setExpandedGroups(prev => ({
// // // //       ...prev,
// // // //       [groupKey]: !prev[groupKey]
// // // //     }));
// // // //   };

// // // //   return (
// // // //     <div className="p-6">
// // // //       <div className="flex justify-between items-center mb-6">
// // // //         <h1 className="text-xl font-medium">ESTIMATES MANAGEMENT</h1>
// // // //         <div className="flex gap-4">
// // // //           <input
// // // //             type="text"
// // // //             placeholder="Search estimates..."
// // // //             value={searchQuery}
// // // //             onChange={(e) => setSearchQuery(e.target.value)}
// // // //             className="px-3 py-2 border text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
// // // //           />
// // // //           <select
// // // //             value={filterStatus}
// // // //             onChange={(e) => setFilterStatus(e.target.value)}
// // // //             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // // //           >
// // // //             <option value="">All Status</option>
// // // //             <option value="Pending">Pending</option>
// // // //             <option value="Moved to Orders">Moved to Orders</option>
// // // //             <option value="Cancelled">Cancelled</option>
// // // //           </select>
// // // //         </div>
// // // //       </div>

// // // //       <div className="bg-white rounded-lg shadow overflow-hidden">
// // // //         <table className="min-w-full divide-y divide-gray-200">
// // // //           <thead className="bg-gray-50">
// // // //             <tr>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Client Name
// // // //               </th>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Project Name
// // // //               </th>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Project Type
// // // //               </th>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Quantity
// // // //               </th>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Delivery Date
// // // //               </th>
// // // //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// // // //                 Status
// // // //               </th>
// // // //             </tr>
// // // //           </thead>
// // // //           <tbody className="bg-white divide-y divide-gray-200">
// // // //             {Object.entries(filteredData).map(([groupKey, estimates]) => {
// // // //               const [clientName, projectName] = groupKey.split("-");
// // // //               const firstEstimate = estimates[0];
// // // //               const status = getGroupStatus(estimates);
// // // //               const totalCost = calculateTotalCost(estimates);

// // // //               return (
// // // //                 <React.Fragment key={groupKey}>
// // // //                   <tr 
// // // //                     className="hover:bg-gray-50 cursor-pointer"
// // // //                     onClick={() => toggleGroup(groupKey)}
// // // //                   >
// // // //                     <td className="px-6 py-4">
// // // //                       <div className="text-sm font-medium text-blue-600">{clientName}</div>
// // // //                     </td>
// // // //                     <td className="px-6 py-4">
// // // //                       <div className="text-sm text-gray-900">{projectName}</div>
// // // //                     </td>
// // // //                     <td className="px-6 py-4">
// // // //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
// // // //                     </td>
// // // //                     <td className="px-6 py-4">
// // // //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
// // // //                     </td>
// // // //                     <td className="px-6 py-4">
// // // //                       <div className="text-sm text-gray-900">
// // // //                         {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
// // // //                       </div>
// // // //                     </td>
// // // //                     <td className="px-6 py-4">
// // // //                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
// // // //                         status === "Moved to Orders"
// // // //                           ? "bg-green-100 text-green-800"
// // // //                           : status === "Cancelled"
// // // //                           ? "bg-red-100 text-red-800"
// // // //                           : "bg-yellow-100 text-yellow-800"
// // // //                       }`}>
// // // //                         {status}
// // // //                       </span>
// // // //                     </td>
// // // //                   </tr>
// // // //                   {expandedGroups[groupKey] && (
// // // //                     <tr>
// // // //                       <td colSpan="6" className="px-6 py-4 bg-gray-50">
// // // //                         {/* Download Buttons */}
// // // //                         <div className="flex justify-end space-x-4 mb-4">
// // // //                           <button
// // // //                             onClick={() => generateGroupEstimatePDF(estimates)}
// // // //                             className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
// // // //                           >
// // // //                             Download Estimate PDF
// // // //                           </button>
// // // //                           <button
// // // //                             onClick={() => generateGroupJobTicket(estimates)}
// // // //                             className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
// // // //                           >
// // // //                             Download Job Ticket
// // // //                           </button>
// // // //                         </div>

// // // //                         {/* Existing estimates grid */}
// // // //                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
// // // //                           {estimates.map((estimate, index) => (
// // // //                             <Estimate
// // // //                               key={estimate.id}
// // // //                               estimate={estimate}
// // // //                               estimateNumber={index + 1}
// // // //                               movedToOrdersEstimateId={ordersData[groupKey]}
// // // //                               setMovedToOrders={(id) =>
// // // //                                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
// // // //                               }
// // // //                               estimates={estimates}
// // // //                               setEstimatesData={setEstimatesData}
// // // //                               groupKey={groupKey}
// // // //                             />
// // // //                           ))}
// // // //                         </div>
// // // //                       </td>
// // // //                     </tr>
// // // //                   )}
// // // //                 </React.Fragment>
// // // //               );
// // // //             })}
// // // //           </tbody>
// // // //         </table>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default EstimatesPage;

// // import React, { useEffect, useState } from "react";
// // import { collection, getDocs } from "firebase/firestore";
// // import { db } from "../../firebaseConfig";
// // import ReactDOM from 'react-dom';
// // import Estimate from "./Estimate";
// // import GroupedJobTicket from "./GroupedJobTicket";
// // import {generateGroupedJobTicketPDF} from "../../utils/pdfUtils"

// // const EstimatesPage = () => {
// //   const [estimatesData, setEstimatesData] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [filteredData, setFilteredData] = useState({});
// //   const [ordersData, setOrdersData] = useState({});
// //   const [filterStatus, setFilterStatus] = useState("");
// //   const [expandedGroups, setExpandedGroups] = useState({});
// //   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

// //   useEffect(() => {
// //     const fetchEstimates = async () => {
// //       try {
// //         const querySnapshot = await getDocs(collection(db, "estimates"));
// //         const data = querySnapshot.docs.map((doc) => ({
// //           id: doc.id,
// //           ...doc.data(),
// //         }));

// //         // Group data by client and project
// //         const groupedData = data.reduce((acc, estimate) => {
// //           const { clientName, projectName } = estimate;
// //           const groupKey = `${clientName}-${projectName}`;
// //           if (!acc[groupKey]) acc[groupKey] = [];
// //           acc[groupKey].push(estimate);
// //           return acc;
// //         }, {});

// //         setEstimatesData(groupedData);
// //         setFilteredData(groupedData);

// //         // Set orders state
// //         const ordersState = Object.entries(groupedData).reduce(
// //           (acc, [groupKey, estimates]) => {
// //             const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
// //             if (movedEstimate) {
// //               acc[groupKey] = movedEstimate.id;
// //             }
// //             return acc;
// //           },
// //           {}
// //         );
// //         setOrdersData(ordersState);
// //       } catch (error) {
// //         console.error("Error fetching estimates:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchEstimates();
// //   }, []);

// //   // Determine group status
// //   const getGroupStatus = (estimates) => {
// //     if (estimates.some(est => est.isCanceled)) return "Cancelled";
// //     if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
// //     return "Pending";
// //   };

// //   const handleGenerateGroupedJobTicket = async (groupKey, estimates) => {
// //     setIsGeneratingPDF(true);
// //     try {
// //       // Create a temporary div for the job ticket
// //       const tempDiv = document.createElement('div');
// //       document.body.appendChild(tempDiv);

// //       // Render the GroupedJobTicket component
// //       ReactDOM.render(
// //         <GroupedJobTicket 
// //           estimates={estimates} 
// //           groupKey={groupKey}
// //         />, 
// //         tempDiv,
// //         async () => {
// //           try {
// //             await generateGroupedJobTicketPDF(tempDiv, groupKey);
// //           } finally {
// //             // Clean up
// //             ReactDOM.unmountComponentAtNode(tempDiv);
// //             document.body.removeChild(tempDiv);
// //             setIsGeneratingPDF(false);
// //           }
// //         }
// //       );
// //     } catch (error) {
// //       console.error('Error generating group job ticket:', error);
// //       alert('Failed to generate job ticket. Please try again.');
// //       setIsGeneratingPDF(false);
// //     }
// //   };

// //   // Handle search and filtering
// //   useEffect(() => {
// //     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
// //       const [clientName, projectName] = groupKey.split("-");
// //       const matchesSearch = estimates.some((estimate) =>
// //         Object.values({
// //           clientName: clientName || "",
// //           projectName: projectName || "",
// //           jobType: estimate.jobDetails?.jobType || "",
// //           quantity: estimate.jobDetails?.quantity?.toString() || "",
// //         }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
// //       );

// //       if (matchesSearch) {
// //         if (filterStatus) {
// //           const status = getGroupStatus(estimates);
// //           if (status === filterStatus) {
// //             acc[groupKey] = estimates;
// //           }
// //         } else {
// //           acc[groupKey] = estimates;
// //         }
// //       }

// //       return acc;
// //     }, {});

// //     setFilteredData(filtered);
// //   }, [searchQuery, estimatesData, filterStatus]);

// //   const toggleGroup = (groupKey) => {
// //     setExpandedGroups(prev => ({
// //       ...prev,
// //       [groupKey]: !prev[groupKey]
// //     }));
// //   };

// //   if (loading) {
// //     return (
// //       <div className="p-6">
// //         <div className="flex justify-between items-center mb-6">
// //           <h1 className="text-2xl font-bold">Estimates</h1>
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

// //   return (
// //     <div className="p-6">
// //       <div className="flex justify-between items-center mb-6">
// //         <h1 className="text-xl font-medium">ESTIMATES MANAGEMENT</h1>
// //         <div className="flex gap-4">
// //           <input
// //             type="text"
// //             placeholder="Search estimates..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             className="px-3 py-2 border text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //           <select
// //             value={filterStatus}
// //             onChange={(e) => setFilterStatus(e.target.value)}
// //             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           >
// //             <option value="">All Status</option>
// //             <option value="Pending">Pending</option>
// //             <option value="Moved to Orders">Moved to Orders</option>
// //             <option value="Cancelled">Cancelled</option>
// //           </select>
// //         </div>
// //       </div>

// //       <div className="bg-white rounded-lg shadow overflow-hidden">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Client Name
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Project Name
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Project Type
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Quantity
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Delivery Date
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Status
// //               </th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {Object.entries(filteredData).map(([groupKey, estimates]) => {
// //               const [clientName, projectName] = groupKey.split("-");
// //               const firstEstimate = estimates[0];
// //               const status = getGroupStatus(estimates);

// //               return (
// //                 <React.Fragment key={groupKey}>
// //                   <tr 
// //                     className="hover:bg-gray-50 cursor-pointer"
// //                     onClick={() => toggleGroup(groupKey)}
// //                   >
// //                     <td className="px-6 py-4">
// //                       <div className="text-sm font-medium text-blue-600">{clientName}</div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div className="text-sm text-gray-900">{projectName}</div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div className="text-sm text-gray-900">
// //                         {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
// //                       </div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
// //                         status === "Moved to Orders"
// //                           ? "bg-green-100 text-green-800"
// //                           : status === "Cancelled"
// //                           ? "bg-red-100 text-red-800"
// //                           : "bg-yellow-100 text-yellow-800"
// //                       }`}>
// //                         {status}
// //                       </span>
// //                     </td>
// //                   </tr>
// //                   {expandedGroups[groupKey] && (
// //                     <tr>
// //                       <td colSpan="6" className="px-6 py-4 bg-gray-50">
// //                         {/* Download Button */}
// //                         <div className="flex justify-end mb-4">
// //                           <button
// //                             onClick={() => handleGenerateGroupedJobTicket(groupKey, estimates)}
// //                             disabled={isGeneratingPDF}
// //                             className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center gap-2 disabled:bg-blue-300"
// //                           >
// //                             {isGeneratingPDF ? (
// //                               <>
// //                                 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
// //                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
// //                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
// //                                 </svg>
// //                                 Generating Job Ticket...
// //                               </>
// //                             ) : (
// //                               <>
// //                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
// //                                   <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
// //                                 </svg>
// //                                 Download Group Job Ticket
// //                               </>
// //                             )}
// //                           </button>
// //                         </div>

// //                         {/* Estimates Grid */}
// //                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
// //                           {estimates.map((estimate, index) => (
// //                             <Estimate
// //                               key={estimate.id}
// //                               estimate={estimate}
// //                               estimateNumber={index + 1}
// //                               movedToOrdersEstimateId={ordersData[groupKey]}
// //                               setMovedToOrders={(id) =>
// //                                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
// //                               }
// //                               estimates={estimates}
// //                               setEstimatesData={setEstimatesData}
// //                               groupKey={groupKey}
// //                             />
// //                           ))}
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </React.Fragment>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default EstimatesPage;

// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import ReactDOM from 'react-dom';
// import Estimate from "./Estimate";
// import GroupedJobTicket from "./GroupedJobTicket";
// import PreviewModal from "./PreviewModal";
// import { generateGroupedJobTicketPDF } from "../../utils/pdfUtils";

// const EstimatesPage = () => {
//   const [estimatesData, setEstimatesData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredData, setFilteredData] = useState({});
//   const [ordersData, setOrdersData] = useState({});
//   const [filterStatus, setFilterStatus] = useState("");
//   const [expandedGroups, setExpandedGroups] = useState({});
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
//   const [previewData, setPreviewData] = useState(null);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         // Group data by client and project
//         const groupedData = data.reduce((acc, estimate) => {
//           const { clientName, projectName } = estimate;
//           const groupKey = `${clientName}-${projectName}`;
//           if (!acc[groupKey]) acc[groupKey] = [];
//           acc[groupKey].push(estimate);
//           return acc;
//         }, {});

//         setEstimatesData(groupedData);
//         setFilteredData(groupedData);

//         // Set orders state
//         const ordersState = Object.entries(groupedData).reduce(
//           (acc, [groupKey, estimates]) => {
//             const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
//             if (movedEstimate) {
//               acc[groupKey] = movedEstimate.id;
//             }
//             return acc;
//           },
//           {}
//         );
//         setOrdersData(ordersState);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   // Determine group status
//   const getGroupStatus = (estimates) => {
//     if (estimates.some(est => est.isCanceled)) return "Cancelled";
//     if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
//     return "Pending";
//   };

//   const handlePreview = (groupKey, estimates) => {
//     setPreviewData({ groupKey, estimates });
//     setIsPreviewOpen(true);
//   };

//   const handleGenerateGroupedJobTicket = async (groupKey, estimates) => {
//     setIsGeneratingPDF(true);
//     try {
//       // Create a temporary div for the job ticket
//       const tempDiv = document.createElement('div');
//       document.body.appendChild(tempDiv);

//       // Render the GroupedJobTicket component
//       ReactDOM.render(
//         <GroupedJobTicket 
//           estimates={estimates} 
//           groupKey={groupKey}
//         />, 
//         tempDiv,
//         async () => {
//           try {
//             await generateGroupedJobTicketPDF(tempDiv, groupKey);
//           } finally {
//             // Clean up
//             ReactDOM.unmountComponentAtNode(tempDiv);
//             document.body.removeChild(tempDiv);
//             setIsGeneratingPDF(false);
//           }
//         }
//       );
//     } catch (error) {
//       console.error('Error generating group job ticket:', error);
//       alert('Failed to generate job ticket. Please try again.');
//       setIsGeneratingPDF(false);
//     }
//   };

//   // Handle search and filtering
//   useEffect(() => {
//     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
//       const [clientName, projectName] = groupKey.split("-");
//       const matchesSearch = estimates.some((estimate) =>
//         Object.values({
//           clientName: clientName || "",
//           projectName: projectName || "",
//           jobType: estimate.jobDetails?.jobType || "",
//           quantity: estimate.jobDetails?.quantity?.toString() || "",
//         }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
//       );

//       if (matchesSearch) {
//         if (filterStatus) {
//           const status = getGroupStatus(estimates);
//           if (status === filterStatus) {
//             acc[groupKey] = estimates;
//           }
//         } else {
//           acc[groupKey] = estimates;
//         }
//       }

//       return acc;
//     }, {});

//     setFilteredData(filtered);
//   }, [searchQuery, estimatesData, filterStatus]);

//   const toggleGroup = (groupKey) => {
//     setExpandedGroups(prev => ({
//       ...prev,
//       [groupKey]: !prev[groupKey]
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Estimates</h1>
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

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-xl font-medium">ESTIMATES MANAGEMENT</h1>
//         <div className="flex gap-4">
//           <input
//             type="text"
//             placeholder="Search estimates..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="px-3 py-2 border text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="Moved to Orders">Moved to Orders</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Client Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Project Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Project Type
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Quantity
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Delivery Date
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {Object.entries(filteredData).map(([groupKey, estimates]) => {
//               const [clientName, projectName] = groupKey.split("-");
//               const firstEstimate = estimates[0];
//               const status = getGroupStatus(estimates);

//               return (
//                 <React.Fragment key={groupKey}>
//                   <tr 
//                     className="hover:bg-gray-50 cursor-pointer"
//                     onClick={() => toggleGroup(groupKey)}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium text-blue-600">{clientName}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">{projectName}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">
//                         {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                         status === "Moved to Orders"
//                           ? "bg-green-100 text-green-800"
//                           : status === "Cancelled"
//                           ? "bg-red-100 text-red-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}>
//                         {status}
//                       </span>
//                     </td>
//                   </tr>
//                   {expandedGroups[groupKey] && (
//                     <tr>
//                       <td colSpan="6" className="px-6 py-4 bg-gray-50">
//                         {/* Action Buttons */}
//                         <div className="flex justify-end mb-4 gap-2">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handlePreview(groupKey, estimates);
//                             }}
//                             className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 flex items-center gap-2"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                             </svg>
//                             Preview Job Ticket
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleGenerateGroupedJobTicket(groupKey, estimates);
//                             }}
//                             disabled={isGeneratingPDF}
//                             className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center gap-2 disabled:bg-blue-300"
//                           >
//                             {isGeneratingPDF ? (
//                               <>
//                                 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                 </svg>
//                                 Generating Job Ticket...
//                               </>
//                             ) : (
//                               <>
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
//                                 </svg>
//                                 Download Group Job Ticket
//                               </>
//                             )}
//                           </button>
//                         </div>

//                         {/* Estimates Grid */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                           {estimates.map((estimate, index) => (
//                             <Estimate
//                               key={estimate.id}
//                               estimate={estimate}
//                               estimateNumber={index + 1}
//                               movedToOrdersEstimateId={ordersData[groupKey]}
//                               setMovedToOrders={(id) =>
//                                 setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
//                               }
//                               estimates={estimates}
//                               setEstimatesData={setEstimatesData}
//                               groupKey={groupKey}
//                             />
//                           ))}
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Preview Modal */}
//       <PreviewModal
//         isOpen={isPreviewOpen}
//         onClose={() => {
//           setIsPreviewOpen(false);
//           setPreviewData(null);
//         }}
//       >
//         {previewData && (
//           <GroupedJobTicket
//             estimates={previewData.estimates}
//             groupKey={previewData.groupKey}
//           />
//         )}
//       </PreviewModal>
//     </div>
//   );
// };

// export default EstimatesPage;

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import ReactDOM from 'react-dom';
import Estimate from "./Estimate";
import GroupedJobTicket from "./GroupedJobTicket";
import PreviewModal from "./PreviewModal";
import { generateGroupedJobTicketPDF } from "../../utils/pdfUtils";

const EstimatesPage = () => {
  const [estimatesData, setEstimatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [ordersData, setOrdersData] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group data by client and project
        const groupedData = data.reduce((acc, estimate) => {
          const { clientName, projectName } = estimate;
          const groupKey = `${clientName}-${projectName}`;
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(estimate);
          return acc;
        }, {});

        setEstimatesData(groupedData);
        setFilteredData(groupedData);

        // Set orders state
        const ordersState = Object.entries(groupedData).reduce(
          (acc, [groupKey, estimates]) => {
            const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
            if (movedEstimate) {
              acc[groupKey] = movedEstimate.id;
            }
            return acc;
          },
          {}
        );
        setOrdersData(ordersState);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  // Determine group status
  const getGroupStatus = (estimates) => {
    if (estimates.some(est => est.isCanceled)) return "Cancelled";
    if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
    return "Pending";
  };

  const handlePreview = (groupKey, estimates) => {
    setPreviewData({ groupKey, estimates });
    setIsPreviewOpen(true);
  };

  const handleGenerateGroupedJobTicket = async (groupKey, estimates) => {
    setIsGeneratingPDF(true);
    try {
      // Create a temporary div for the job ticket
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);

      // Render the GroupedJobTicket component
      ReactDOM.render(
        <GroupedJobTicket 
          estimates={estimates} 
          groupKey={groupKey}
        />, 
        tempDiv,
        async () => {
          try {
            await generateGroupedJobTicketPDF(tempDiv, groupKey);
          } finally {
            // Clean up
            ReactDOM.unmountComponentAtNode(tempDiv);
            document.body.removeChild(tempDiv);
            setIsGeneratingPDF(false);
          }
        }
      );
    } catch (error) {
      console.error('Error generating group job ticket:', error);
      alert('Failed to generate job ticket. Please try again.');
      setIsGeneratingPDF(false);
    }
  };

  // Handle search and filtering
  useEffect(() => {
    const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
      const [clientName, projectName] = groupKey.split("-");
      const matchesSearch = estimates.some((estimate) =>
        Object.values({
          clientName: clientName || "",
          projectName: projectName || "",
          jobType: estimate.jobDetails?.jobType || "",
          quantity: estimate.jobDetails?.quantity?.toString() || "",
        }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (matchesSearch) {
        if (filterStatus) {
          const status = getGroupStatus(estimates);
          if (status === filterStatus) {
            acc[groupKey] = estimates;
          }
        } else {
          acc[groupKey] = estimates;
        }
      }

      return acc;
    }, {});

    setFilteredData(filtered);
  }, [searchQuery, estimatesData, filterStatus]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Estimates</h1>
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

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">ESTIMATES MANAGEMENT</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Moved to Orders">Moved to Orders</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(filteredData).map(([groupKey, estimates]) => {
              const [clientName, projectName] = groupKey.split("-");
              const firstEstimate = estimates[0];
              const status = getGroupStatus(estimates);

              return (
                <React.Fragment key={groupKey}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-blue-600">{clientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{projectName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === "Moved to Orders"
                          ? "bg-green-100 text-green-800"
                          : status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                  {expandedGroups[groupKey] && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        {/* Preview Button */}
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(groupKey, estimates);
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Preview Job Ticket
                          </button>
                        </div>

                        {/* Estimates Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {estimates.map((estimate, index) => (
                            <Estimate
                              key={estimate.id}
                              estimate={estimate}
                              estimateNumber={index + 1}
                              movedToOrdersEstimateId={ordersData[groupKey]}
                              setMovedToOrders={(id) =>
                                setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
                              }
                              estimates={estimates}
                              setEstimatesData={setEstimatesData}
                              groupKey={groupKey}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewData(null);
        }}
        onDownload={() => previewData && handleGenerateGroupedJobTicket(previewData.groupKey, previewData.estimates)}
        isGeneratingPDF={isGeneratingPDF}
      >
        {previewData && (
          <GroupedJobTicket
            estimates={previewData.estimates}
            groupKey={previewData.groupKey}
          />
        )}
      </PreviewModal>
    </div>
  );
};

export default EstimatesPage;