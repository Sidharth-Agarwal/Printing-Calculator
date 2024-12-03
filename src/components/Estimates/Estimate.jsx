// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const EstimatesPage = () => {
//   const [estimates, setEstimates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setEstimates(data);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   const toggleDropdown = (id) => {
//     setOpenDropdown((prev) => (prev === id ? null : id));
//   };

//   if (loading) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>Loading estimates...</p>
//       </div>
//     );
//   }

//   if (estimates.length === 0) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>No estimates available. Please create an estimate using the billing form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto mt-8">
//       <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>
//       <div className="space-y-6">
//         {estimates.map((estimate) => (
//           <div
//             key={estimate.id}
//             className="border border-gray-300 rounded-lg p-4 shadow-md"
//           >
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold">
//                 Estimate for {estimate.clientName} - {estimate.projectName}
//               </h3>
//               <button
//                 onClick={() => toggleDropdown(estimate.id)}
//                 className="text-blue-500 underline"
//               >
//                 {openDropdown === estimate.id ? "Hide Details" : "Show Details"}
//               </button>
//             </div>
//             {openDropdown === estimate.id && (
//               <div className="mt-4 space-y-4">
//                 {/* Order and Paper */}
//                 <div>
//                   <h4 className="text-lg font-bold">Order and Paper</h4>
//                   <p>
//                     <strong>Job Type:</strong> {estimate.jobType}
//                   </p>
//                   <p>
//                     <strong>Quantity:</strong> {estimate.quantity}
//                   </p>
//                   <p>
//                     <strong>Delivery Date:</strong> {estimate.deliveryDate}
//                   </p>
//                   <p>
//                     <strong>Paper Name:</strong> {estimate.paperName}
//                   </p>
//                   <p>
//                     <strong>Paper Provided:</strong> {estimate.paperProvided}
//                   </p>
//                   <p>
//                     <strong>Die Code:</strong> {estimate.dieCode}
//                   </p>
//                   <p>
//                     <strong>Die Size:</strong> {estimate.dieSize?.length} x{" "}
//                     {estimate.dieSize?.breadth}
//                   </p>
//                 </div>

//                 {/* LP Details */}
//                 {estimate.isLPUsed && (
//                   <div>
//                     <h4 className="text-lg font-bold">LP Details</h4>
//                     <p>
//                       <strong>No. of Colors:</strong> {estimate.noOfColors}
//                     </p>
//                     <p>
//                       <strong>Plate Size:</strong> {estimate.plateSizeType}
//                     </p>
//                     {estimate.plateSizeType === "Manual" && (
//                       <p>
//                         <strong>Plate Dimensions:</strong>{" "}
//                         {estimate.plateDimensions?.length} x{" "}
//                         {estimate.plateDimensions?.breadth}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* FS Details */}
//                 {estimate.isFSUsed && (
//                   <div>
//                     <h4 className="text-lg font-bold">FS Details</h4>
//                     <p>
//                       <strong>FS Type:</strong> {estimate.fsType}
//                     </p>
//                     <p>
//                       <strong>Block Size:</strong> {estimate.blockSizeType}
//                     </p>
//                     {estimate.blockSizeType === "Manual" && (
//                       <p>
//                         <strong>Block Dimensions:</strong>{" "}
//                         {estimate.blockDimensions?.length} x{" "}
//                         {estimate.blockDimensions?.breadth}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* EMB Details */}
//                 {estimate.isEMBUsed && (
//                   <div>
//                     <h4 className="text-lg font-bold">EMB Details</h4>
//                     <p>
//                       <strong>Plate Size:</strong> {estimate.EMBplateSizeType}
//                     </p>
//                     {estimate.EMBplateSizeType === "Manual" && (
//                       <p>
//                         <strong>Plate Dimensions:</strong>{" "}
//                         {estimate.EMBplateDimensions?.length} x{" "}
//                         {estimate.EMBplateDimensions?.breadth}
//                       </p>
//                     )}
//                     <p>
//                       <strong>Plate Type Male:</strong>{" "}
//                       {estimate.EMBplateTypeMale}
//                     </p>
//                     <p>
//                       <strong>Plate Type Female:</strong>{" "}
//                       {estimate.EMBplateTypeFemale}
//                     </p>
//                   </div>
//                 )}

//                 {/* Digi Details */}
//                 {estimate.isDigiUsed && (
//                   <div>
//                     <h4 className="text-lg font-bold">Digi Details</h4>
//                     <p>
//                       <strong>Digi Die:</strong> {estimate.digiDie}
//                     </p>
//                   </div>
//                 )}

//                 {/* Die Cutting */}
//                 {estimate.isDieCuttingUsed && (
//                   <div>
//                     <h4 className="text-lg font-bold">Die Cutting</h4>
//                     <p>
//                       <strong>Difficulty:</strong> {estimate.difficulty}
//                     </p>
//                     <p>
//                       <strong>DC MR:</strong> {estimate.dcMR}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EstimatesPage;

// Latest updated code
// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const EstimatesPage = () => {
//   const [estimates, setEstimates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setEstimates(data);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   const toggleDropdown = (id) => {
//     setOpenDropdown((prev) => (prev === id ? null : id));
//   };

//   if (loading) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>Loading estimates...</p>
//       </div>
//     );
//   }

//   if (estimates.length === 0) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>No estimates available. Please create an estimate using the billing form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto mt-8">
//       <h2 className="text-2xl font-bold mb-6">Estimates DB</h2>
//       <div className="space-y-6">
//         {estimates.map((estimate) => (
//           <div
//             key={estimate.id}
//             onClick={() => toggleDropdown(estimate.id)}
//             className={`border border-gray-300 rounded-lg p-4 shadow-md cursor-pointer transition-all ${
//               openDropdown === estimate.id ? "bg-blue-50" : "bg-white"
//             }`}
//           >
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-lg">
//                 Estimate for {estimate.clientName} - {estimate.projectName}
//               </h3>
//             </div>

//             {openDropdown === estimate.id && (
//               <div className="mt-4">
//                 {/* Grid Section */}
//                 <div className="grid grid-cols-2 gap-4">
//                   {/* Order and Paper Section */}
//                   <div>
//                     <h4 className="text-lg font-bold mb-2">Order and Paper</h4>
//                     <p>
//                       <strong>Job Type:</strong> {estimate.jobType}
//                     </p>
//                     <p>
//                       <strong>Quantity:</strong> {estimate.quantity}
//                     </p>
//                     <p>
//                       <strong>Delivery Date:</strong> {estimate.deliveryDate}
//                     </p>
//                     <p>
//                       <strong>Paper Name:</strong> {estimate.paperName}
//                     </p>
//                     <p>
//                       <strong>Paper Provided:</strong> {estimate.paperProvided}
//                     </p>
//                     <p>
//                       <strong>Die Code:</strong> {estimate.dieCode}
//                     </p>
//                     <p>
//                       <strong>Die Size:</strong> {estimate.dieSize?.length} x{" "}
//                       {estimate.dieSize?.breadth}
//                     </p>
//                   </div>

//                   {/* LP Details */}
//                   {estimate.isLPUsed && (
//                     <div>
//                       <h4 className="text-lg font-bold mb-2">LP Details</h4>
//                       <p>
//                         <strong>No. of Colors:</strong> {estimate.noOfColors}
//                       </p>
//                       <p>
//                         <strong>Plate Size:</strong> {estimate.plateSizeType}
//                       </p>
//                       {estimate.plateSizeType === "Manual" && (
//                         <p>
//                           <strong>Plate Dimensions:</strong>{" "}
//                           {estimate.plateDimensions?.length} x{" "}
//                           {estimate.plateDimensions?.breadth}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {/* FS Details */}
//                   {estimate.isFSUsed && (
//                     <div>
//                       <h4 className="text-lg font-bold mb-2">FS Details</h4>
//                       <p>
//                         <strong>FS Type:</strong> {estimate.fsType}
//                       </p>
//                       <p>
//                         <strong>Block Size:</strong> {estimate.blockSizeType}
//                       </p>
//                       {estimate.blockSizeType === "Manual" && (
//                         <p>
//                           <strong>Block Dimensions:</strong>{" "}
//                           {estimate.blockDimensions?.length} x{" "}
//                           {estimate.blockDimensions?.breadth}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {/* EMB Details */}
//                   {estimate.isEMBUsed && (
//                     <div>
//                       <h4 className="text-lg font-bold mb-2">EMB Details</h4>
//                       <p>
//                         <strong>Plate Size:</strong> {estimate.EMBplateSizeType}
//                       </p>
//                       {estimate.EMBplateSizeType === "Manual" && (
//                         <p>
//                           <strong>Plate Dimensions:</strong>{" "}
//                           {estimate.EMBplateDimensions?.length} x{" "}
//                           {estimate.EMBplateDimensions?.breadth}
//                         </p>
//                       )}
//                       <p>
//                         <strong>Plate Type Male:</strong>{" "}
//                         {estimate.EMBplateTypeMale}
//                       </p>
//                       <p>
//                         <strong>Plate Type Female:</strong>{" "}
//                         {estimate.EMBplateTypeFemale}
//                       </p>
//                     </div>
//                   )}

//                   {/* Digi Details */}
//                   {estimate.isDigiUsed && (
//                     <div>
//                       <h4 className="text-lg font-bold mb-2">Digi Details</h4>
//                       <p>
//                         <strong>Digi Die:</strong> {estimate.digiDie}
//                       </p>
//                     </div>
//                   )}

//                   {/* Die Cutting */}
//                   {estimate.isDieCuttingUsed && (
//                     <div>
//                       <h4 className="text-lg font-bold mb-2">Die Cutting</h4>
//                       <p>
//                         <strong>Difficulty:</strong> {estimate.difficulty}
//                       </p>
//                       <p>
//                         <strong>DC MR:</strong> {estimate.dcMR}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EstimatesPage;

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const EstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEstimates(data);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>Loading estimates...</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>No estimates available. Please create an estimate using the billing form.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Estimates DB</h2>
      <div className="space-y-6">
        {estimates.map((estimate) => (
          <div
            key={estimate.id}
            onClick={() => toggleDropdown(estimate.id)}
            className={`border border-gray-300 rounded-lg p-4 shadow-md cursor-pointer transition-all ${
              openDropdown === estimate.id ? "bg-blue-50" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                Estimate for {estimate.clientName} - {estimate.projectName}
              </h3>
            </div>

            {openDropdown === estimate.id && (
              <div className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order and Paper Section */}
                  <div>
                    <h4 className="text-lg font-bold mb-2">Order and Paper</h4>
                    <p>
                      <strong>Job Type:</strong> {estimate.jobType}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {estimate.quantity}
                    </p>
                    <p>
                      <strong>Delivery Date:</strong> {estimate.deliveryDate}
                    </p>
                    <p>
                      <strong>Paper Name:</strong> {estimate.paperName}
                    </p>
                    <p>
                      <strong>Paper Provided:</strong> {estimate.paperProvided}
                    </p>
                    <p>
                      <strong>Die Code:</strong> {estimate.dieCode}
                    </p>
                    <p>
                      <strong>Die Size:</strong> {estimate.dieSize?.length} x{" "}
                      {estimate.dieSize?.breadth}
                    </p>
                  </div>

                  {/* Die Image */}
                  <div>
                    <h4 className="text-lg font-bold mb-2">Die Image</h4>
                    <img
                      src={estimate.image || "https://via.placeholder.com/200"}
                      alt="Die"
                      className="w-48 h-48 object-contain rounded-md border"
                      style={{ width: "200px", height: "200px" }}
                    />
                  </div>

                  {/* LP Details */}
                  {estimate.isLPUsed && (
                    <div>
                      <h4 className="text-lg font-bold mb-2">LP Details</h4>
                      <p>
                        <strong>No. of Colors:</strong> {estimate.noOfColors}
                      </p>
                      <p>
                        <strong>Plate Size:</strong> {estimate.plateSizeType}
                      </p>
                      {estimate.plateSizeType === "Manual" && (
                        <p>
                          <strong>Plate Dimensions:</strong>{" "}
                          {estimate.plateDimensions?.length} x{" "}
                          {estimate.plateDimensions?.breadth}
                        </p>
                      )}
                    </div>
                  )}

                  {/* FS Details */}
                  {estimate.isFSUsed && (
                    <div>
                      <h4 className="text-lg font-bold mb-2">FS Details</h4>
                      <p>
                        <strong>FS Type:</strong> {estimate.fsType}
                      </p>
                      <p>
                        <strong>Block Size:</strong> {estimate.blockSizeType}
                      </p>
                      {estimate.blockSizeType === "Manual" && (
                        <p>
                          <strong>Block Dimensions:</strong>{" "}
                          {estimate.blockDimensions?.length} x{" "}
                          {estimate.blockDimensions?.breadth}
                        </p>
                      )}
                    </div>
                  )}

                  {/* EMB Details */}
                  {estimate.isEMBUsed && (
                    <div>
                      <h4 className="text-lg font-bold mb-2">EMB Details</h4>
                      <p>
                        <strong>Plate Size:</strong> {estimate.EMBplateSizeType}
                      </p>
                      {estimate.EMBplateSizeType === "Manual" && (
                        <p>
                          <strong>Plate Dimensions:</strong>{" "}
                          {estimate.EMBplateDimensions?.length} x{" "}
                          {estimate.EMBplateDimensions?.breadth}
                        </p>
                      )}
                      <p>
                        <strong>Plate Type Male:</strong>{" "}
                        {estimate.EMBplateTypeMale}
                      </p>
                      <p>
                        <strong>Plate Type Female:</strong>{" "}
                        {estimate.EMBplateTypeFemale}
                      </p>
                    </div>
                  )}

                  {/* Digi Details */}
                  {estimate.isDigiUsed && (
                    <div>
                      <h4 className="text-lg font-bold mb-2">Digi Details</h4>
                      <p>
                        <strong>Digi Die:</strong> {estimate.digiDie}
                      </p>
                    </div>
                  )}

                  {/* Die Cutting */}
                  {estimate.isDieCuttingUsed && (
                    <div>
                      <h4 className="text-lg font-bold mb-2">Die Cutting</h4>
                      <p>
                        <strong>Difficulty:</strong> {estimate.difficulty}
                      </p>
                      <p>
                        <strong>DC MR:</strong> {estimate.dcMR}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstimatesPage;
