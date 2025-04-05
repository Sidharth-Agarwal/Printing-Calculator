// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import ReactDOM from 'react-dom';
// import Estimate from "./Estimate";
// import GroupedJobTicket from "./GroupedJobTicket";
// import PreviewModal from "./PreviewModal";
// import { generateGroupedJobTicketPDF } from "../../utils/pdfUtils";
// import { createRoot } from "react-dom/client";
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

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
//   const [sortBy, setSortBy] = useState("date-desc"); // Default sort: Latest to oldest

//   const sortOptions = {
//     "quantity-asc": "Quantity - Low to High",
//     "quantity-desc": "Quantity - High to Low",
//     "date-desc": "Delivery Date - Latest to Oldest",
//     "date-asc": "Delivery Date - Oldest to Latest",
//     "status": "Status"
//   };

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

//   // Sort function for groups
//   const sortGroups = (groups) => {
//     return Object.entries(groups).sort((a, b) => {
//       const [, estimatesA] = a;
//       const [, estimatesB] = b;
//       const firstEstimateA = estimatesA[0];
//       const firstEstimateB = estimatesB[0];

//       switch (sortBy) {
//         case "quantity-asc":
//           return (firstEstimateA.jobDetails?.quantity || 0) - (firstEstimateB.jobDetails?.quantity || 0);
//         case "quantity-desc":
//           return (firstEstimateB.jobDetails?.quantity || 0) - (firstEstimateA.jobDetails?.quantity || 0);
//         case "date-desc":
//           return new Date(firstEstimateB.deliveryDate) - new Date(firstEstimateA.deliveryDate);
//         case "date-asc":
//           return new Date(firstEstimateA.deliveryDate) - new Date(firstEstimateB.deliveryDate);
//         case "status":
//           const statusA = getGroupStatus(estimatesA);
//           const statusB = getGroupStatus(estimatesB);
//           return statusA.localeCompare(statusB);
//         default:
//           return new Date(firstEstimateB.date) - new Date(firstEstimateA.date);
//       }
//     }).reduce((acc, [key, value]) => {
//       acc[key] = value;
//       return acc;
//     }, {});
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

//     // Apply sorting to filtered data
//     const sortedData = sortGroups(filtered);
//     setFilteredData(sortedData);
//   }, [searchQuery, estimatesData, filterStatus, sortBy]);

//   const handlePreview = (groupKey, estimates) => {
//     setPreviewData({ groupKey, estimates });
//     setIsPreviewOpen(true);
//   };

//   const handleGenerateGroupedJobTicket = async (groupKey, estimates) => {
//     setIsGeneratingPDF(true);
//     try {
//       const tempDiv = document.createElement('div');
//       document.body.appendChild(tempDiv);
  
//       // Create a promise to handle the rendering and PDF generation
//       await new Promise((resolve, reject) => {
//         const root = createRoot(tempDiv);
//         root.render(
//           <GroupedJobTicket 
//             estimates={estimates} 
//             groupKey={groupKey} 
//             onRenderComplete={async () => {
//               try {
//                 // Wait a moment to ensure all images are loaded
//                 await new Promise(res => setTimeout(res, 1000));
  
//                 const canvas = await html2canvas(tempDiv, {
//                   scale: 2,
//                   useCORS: true,
//                   logging: false,
//                   allowTaint: true,
//                   imageTimeout: 0
//                 });
  
//                 const imgData = canvas.toDataURL('image/jpeg', 1.0);
//                 const pdf = new jsPDF({
//                   orientation: 'portrait',
//                   unit: 'mm',
//                   format: 'a4'
//                 });
  
//                 const imgWidth = 210;
//                 const imgHeight = canvas.height * imgWidth / canvas.width;
                
//                 pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
//                 pdf.save(`${groupKey}_Job_Ticket_${new Date().toISOString().split('T')[0]}.pdf`);
  
//                 resolve();
//               } catch (error) {
//                 console.error('Error generating PDF:', error);
//                 reject(error);
//               } finally {
//                 root.unmount();
//                 document.body.removeChild(tempDiv);
//               }
//             }}
//           />
//         );
//       });
//     } catch (error) {
//       console.error('Error generating group job ticket:', error);
//       alert('Failed to generate job ticket. Please try again.');
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };
  
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
//       {/* Header Section */}
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
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {Object.entries(sortOptions).map(([value, label]) => (
//               <option key={value} value={value}>
//                 Sort by: {label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Main Table */}
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
//                         <div className="flex justify-end mb-4">
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
//                         </div>

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
//         onDownload={() => previewData && handleGenerateGroupedJobTicket(previewData.groupKey, previewData.estimates)}
//         isGeneratingPDF={isGeneratingPDF}
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
import { createRoot } from "react-dom/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EstimatesPage = () => {
  const [estimatesData, setEstimatesData] = useState({});
  const [loading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [ordersData, setOrdersData] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState("date-desc"); // Default sort: Latest to oldest

  const sortOptions = {
    "quantity-asc": "Quantity - Low to High",
    "quantity-desc": "Quantity - High to Low",
    "date-desc": "Delivery Date - Latest to Oldest",
    "date-asc": "Delivery Date - Oldest to Latest",
    "status": "Status"
  };

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group data by client and project
        const groupedData = data.reduce((acc, estimate) => {
          // Get client name from either new or old structure
          const clientName = estimate.clientInfo?.name || estimate.clientName || "Unknown Client";
          const projectName = estimate.projectName || "Unknown Project";
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
        setIsLoading(false);
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

  // Sort function for groups
  const sortGroups = (groups) => {
    return Object.entries(groups).sort((a, b) => {
      const [, estimatesA] = a;
      const [, estimatesB] = b;
      const firstEstimateA = estimatesA[0];
      const firstEstimateB = estimatesB[0];

      switch (sortBy) {
        case "quantity-asc":
          return (firstEstimateA.jobDetails?.quantity || 0) - (firstEstimateB.jobDetails?.quantity || 0);
        case "quantity-desc":
          return (firstEstimateB.jobDetails?.quantity || 0) - (firstEstimateA.jobDetails?.quantity || 0);
        case "date-desc":
          return new Date(firstEstimateB.deliveryDate) - new Date(firstEstimateA.deliveryDate);
        case "date-asc":
          return new Date(firstEstimateA.deliveryDate) - new Date(firstEstimateB.deliveryDate);
        case "status":
          const statusA = getGroupStatus(estimatesA);
          const statusB = getGroupStatus(estimatesB);
          return statusA.localeCompare(statusB);
        default:
          return new Date(firstEstimateB.date) - new Date(firstEstimateA.date);
      }
    }).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
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

    // Apply sorting to filtered data
    const sortedData = sortGroups(filtered);
    setFilteredData(sortedData);
  }, [searchQuery, estimatesData, filterStatus, sortBy]);

  const handlePreview = (groupKey, estimates) => {
    setPreviewData({ groupKey, estimates });
    setIsPreviewOpen(true);
  };

  const handleGenerateGroupedJobTicket = async (groupKey, estimates) => {
    setIsGeneratingPDF(true);
    try {
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
  
      // Create a promise to handle the rendering and PDF generation
      await new Promise((resolve, reject) => {
        const root = createRoot(tempDiv);
        root.render(
          <GroupedJobTicket 
            estimates={estimates} 
            groupKey={groupKey} 
            onRenderComplete={async () => {
              try {
                // Wait a moment to ensure all images are loaded
                await new Promise(res => setTimeout(res, 1000));
  
                const canvas = await html2canvas(tempDiv, {
                  scale: 2,
                  useCORS: true,
                  logging: false,
                  allowTaint: true,
                  imageTimeout: 0
                });
  
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF({
                  orientation: 'portrait',
                  unit: 'mm',
                  format: 'a4'
                });
  
                const imgWidth = 210;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${groupKey}_Job_Ticket_${new Date().toISOString().split('T')[0]}.pdf`);
  
                resolve();
              } catch (error) {
                console.error('Error generating PDF:', error);
                reject(error);
              } finally {
                root.unmount();
                document.body.removeChild(tempDiv);
              }
            }}
          />
        );
      });
    } catch (error) {
      console.error('Error generating group job ticket:', error);
      alert('Failed to generate job ticket. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                Sort by: {label}
              </option>
            ))}
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
                      <div className="text-sm font-medium text-blue-600">
                        {/* Updated client name display to handle new data structure */}
                        {firstEstimate.clientInfo?.name || clientName || "Unknown Client"}
                      </div>
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