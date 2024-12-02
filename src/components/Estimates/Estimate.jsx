// import React, { useState, useEffect } from "react";
// import { collection, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const Estimates = () => {
//   const [estimates, setEstimates] = useState([]);

//   // Fetch estimates from Firestore
//   useEffect(() => {
//     const estimatesCollection = collection(db, "estimates");
//     const unsubscribe = onSnapshot(estimatesCollection, (snapshot) => {
//       const fetchedEstimates = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setEstimates(fetchedEstimates);
//     });

//     return () => unsubscribe(); // Clean up the listener
//   }, []);

//   // Group estimates by client and project
//   const groupedEstimates = estimates.reduce((acc, estimate) => {
//     const { clientName, projectName } = estimate;
//     if (!acc[clientName]) acc[clientName] = {};
//     if (!acc[clientName][projectName]) acc[clientName][projectName] = [];
//     acc[clientName][projectName].push(estimate);
//     return acc;
//   }, {});

//   // Action Handlers
//   const handleEditEstimate = (estimateId) => {
//     console.log("Edit estimate:", estimateId);
//     // Add your edit logic here (navigate to a form pre-filled with estimate data)
//   };

//   const handleGeneratePDF = (estimateId) => {
//     console.log("Generate PDF for estimate:", estimateId);
//     // Add your PDF generation logic here
//   };

//   const handleMoveToFinalOrder = async (estimate) => {
//     try {
//       const finalOrdersCollection = collection(db, "finalOrders");
//       await addDoc(finalOrdersCollection, estimate);
//       await deleteDoc(doc(db, "estimates", estimate.id));
//       alert("Estimate moved to Final Orders!");
//     } catch (error) {
//       console.error("Error moving to final orders:", error);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Estimates</h1>
//       {Object.keys(groupedEstimates).map((clientName) => (
//         <div key={clientName} className="mb-8">
//           <h2 className="text-xl font-bold mb-4">Client: {clientName}</h2>
//           {Object.keys(groupedEstimates[clientName]).map((projectName) => (
//             <div key={projectName} className="bg-white p-4 shadow mb-4 rounded">
//               <h3 className="text-lg font-semibold mb-2">Project: {projectName}</h3>
//               <div>
//                 {groupedEstimates[clientName][projectName].map((estimate) => (
//                   <div key={estimate.id} className="p-4 border-b">
//                     <p>
//                       <strong>Estimate ID:</strong> {estimate.id}
//                     </p>
//                     <p>
//                       <strong>Created Date:</strong> {new Date(estimate.timestamp?.seconds * 1000).toLocaleDateString()}
//                     </p>
//                     <p>
//                       <strong>Job Type:</strong> {estimate.jobType || "N/A"}
//                     </p>
//                     <div className="flex space-x-4 mt-2">
//                       <button
//                         onClick={() => handleEditEstimate(estimate.id)}
//                         className="px-4 py-2 bg-blue-500 text-white rounded"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleGeneratePDF(estimate.id)}
//                         className="px-4 py-2 bg-green-500 text-white rounded"
//                       >
//                         Generate PDF
//                       </button>
//                       <button
//                         onClick={() => handleMoveToFinalOrder(estimate)}
//                         className="px-4 py-2 bg-yellow-500 text-white rounded"
//                       >
//                         Move to Final Orders
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Estimates;
