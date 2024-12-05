// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import GroupDropdown from "./GroupDropdown";

// const EstimatesPage = () => {
//   const [estimates, setEstimates] = useState([]);
//   const [loading, setLoading] = useState(true);

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

//   if (loading) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>Loading estimates...</p>
//       </div>
//     );
//   }

//   const groupedEstimates = estimates.reduce((acc, estimate) => {
//     const key = `${estimate.clientName}-${estimate.projectName}`;
//     if (!acc[key]) {
//       acc[key] = [];
//     }
//     acc[key].push(estimate);
//     return acc;
//   }, {});

//   return (
//     <div className="container mx-auto mt-8 space-y-6">
//       <h2 className="text-2xl font-bold mb-6">Estimates DB</h2>
//       {Object.keys(groupedEstimates).map((groupKey) => {
//         const [clientName, projectName] = groupKey.split("-");
//         return (
//           <GroupDropdown
//             key={groupKey}
//             clientName={clientName}
//             projectName={projectName}
//             estimates={groupedEstimates[groupKey]}
//           />
//         );
//       })}
//     </div>
//   );
// };

// export default EstimatesPage;

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import GroupDropdown from "./GroupDropdown";

const EstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold text-gray-700">Estimates DB</h2>
        <p className="text-gray-500">Loading estimates...</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold text-gray-700">Estimates DB</h2>
        <p className="text-gray-500">
          No estimates available. Please create an estimate using the billing form.
        </p>
      </div>
    );
  }

  const groupedEstimates = estimates.reduce((acc, estimate) => {
    const key = `${estimate.clientName}-${estimate.projectName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(estimate);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">Estimates DB</h2>
        <div className="space-y-6">
          {Object.keys(groupedEstimates).map((groupKey) => {
            const [clientName, projectName] = groupKey.split("-");
            return (
              <GroupDropdown
                key={groupKey}
                clientName={clientName}
                projectName={projectName}
                estimates={groupedEstimates[groupKey]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EstimatesPage;
