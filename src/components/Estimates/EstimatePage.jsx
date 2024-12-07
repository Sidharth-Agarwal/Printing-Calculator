// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import GroupDropdown from "./GroupDropdown";

// const EstimatesPage = () => {
//   const [estimatesData, setEstimatesData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredData, setFilteredData] = useState({});
//   const [noResults, setNoResults] = useState(false);
//   const [ordersData, setOrdersData] = useState({});

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         const groupedData = data.reduce((acc, estimate) => {
//           const { clientName, projectName } = estimate;
//           const groupKey = `${clientName}-${projectName}`;
//           if (!acc[groupKey]) acc[groupKey] = [];
//           acc[groupKey].push(estimate);
//           return acc;
//         }, {});

//         setEstimatesData(groupedData);
//         setFilteredData(groupedData);

//         const ordersState = Object.entries(groupedData).reduce((acc, [groupKey, estimates]) => {
//           const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
//           if (movedEstimate) {
//             acc[groupKey] = movedEstimate.id;
//           }
//           return acc;
//         }, {});
//         setOrdersData(ordersState);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   const handleSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
//       const [clientName, projectName] = groupKey.split("-");
//       const filteredEstimates = estimates.filter((estimate) => {
//         const jobType = estimate?.jobDetails?.jobType?.toLowerCase() || "";
//         const quantity = estimate?.jobDetails?.quantity?.toString() || "";
//         return (
//           clientName.toLowerCase().includes(query) ||
//           projectName.toLowerCase().includes(query) ||
//           jobType.includes(query) ||
//           quantity.includes(query)
//         );
//       });

//       if (filteredEstimates.length > 0) {
//         acc[groupKey] = filteredEstimates;
//       }

//       return acc;
//     }, {});

//     setFilteredData(filtered);
//     setNoResults(Object.keys(filtered).length === 0);
//   };

//   if (loading) return <p>Loading estimates...</p>;

//   return (
//     <div className="p-6 bg-gray-100 rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>

//       <div className="mt-6 mb-6">
//         <input
//           type="text"
//           placeholder="Search by client, project name, job type, or quantity..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
//         />
//         {noResults && <p className="text-gray-500 mt-2 text-sm">No such estimate found.</p>}
//       </div>

//       <div className="space-y-4">
//         {Object.entries(filteredData).map(([groupKey, estimates]) => {
//           const [clientName, projectName] = groupKey.split("-");
//           return (
//             <GroupDropdown
//               key={groupKey}
//               clientName={clientName}
//               projectName={projectName}
//               estimates={estimates}
//               ordersData={ordersData}
//               setOrdersData={setOrdersData}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default EstimatesPage;

// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import GroupDropdown from "./GroupDropdown";

// const EstimatesPage = () => {
//   const [estimatesData, setEstimatesData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredData, setFilteredData] = useState({});
//   const [noResults, setNoResults] = useState(false);
//   const [ordersData, setOrdersData] = useState({});

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         const groupedData = data.reduce((acc, estimate) => {
//           const { clientName, projectName } = estimate;
//           const groupKey = `${clientName}-${projectName}`;
//           if (!acc[groupKey]) acc[groupKey] = [];
//           acc[groupKey].push(estimate);
//           return acc;
//         }, {});

//         setEstimatesData(groupedData);
//         setFilteredData(groupedData);

//         const ordersState = Object.entries(groupedData).reduce((acc, [groupKey, estimates]) => {
//           const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
//           if (movedEstimate) {
//             acc[groupKey] = movedEstimate.id;
//           }
//           return acc;
//         }, {});
//         setOrdersData(ordersState);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   const handleSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
//       const [clientName, projectName] = groupKey.split("-");
//       const filteredEstimates = estimates.filter((estimate) => {
//         const jobType = estimate?.jobDetails?.jobType?.toLowerCase() || "";
//         const quantity = estimate?.jobDetails?.quantity?.toString() || "";
//         return (
//           clientName.toLowerCase().includes(query) ||
//           projectName.toLowerCase().includes(query) ||
//           jobType.includes(query) ||
//           quantity.includes(query)
//         );
//       });

//       if (filteredEstimates.length > 0) {
//         acc[groupKey] = filteredEstimates;
//       }

//       return acc;
//     }, {});

//     setFilteredData(filtered);
//     setNoResults(Object.keys(filtered).length === 0);
//   };

//   if (loading) return <p>Loading estimates...</p>;

//   return (
//     <div className="p-6 bg-gray-100 rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>

//       <div className="mt-6 mb-6">
//         <input
//           type="text"
//           placeholder="Search by client, project name, job type, or quantity..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
//         />
//         {noResults && <p className="text-gray-500 mt-2 text-sm">No such estimate found.</p>}
//       </div>

//       <div className="space-y-4">
//         {Object.entries(filteredData).map(([groupKey, estimates]) => {
//           const [clientName, projectName] = groupKey.split("-");
//           return (
//             <GroupDropdown
//               key={groupKey}
//               clientName={clientName}
//               projectName={projectName}
//               estimates={estimates}
//               ordersData={ordersData}
//               setOrdersData={setOrdersData}
//               setEstimatesData={setEstimatesData}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default EstimatesPage;

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import GroupDropdown from "./GroupDropdown";

const EstimatesPage = () => {
  const [estimatesData, setEstimatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [noResults, setNoResults] = useState(false);
  const [ordersData, setOrdersData] = useState({});

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const groupedData = data.reduce((acc, estimate) => {
          const { clientName, projectName } = estimate;
          const groupKey = `${clientName}-${projectName}`;
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(estimate);
          return acc;
        }, {});

        setEstimatesData(groupedData);
        setFilteredData(groupedData);

        const ordersState = Object.entries(groupedData).reduce((acc, [groupKey, estimates]) => {
          const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
          if (movedEstimate) {
            acc[groupKey] = movedEstimate.id;
          }
          return acc;
        }, {});
        setOrdersData(ordersState);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
      const [clientName, projectName] = groupKey.split("-");
      const filteredEstimates = estimates.filter((estimate) => {
        const jobType = estimate?.jobDetails?.jobType?.toLowerCase() || "";
        const quantity = estimate?.jobDetails?.quantity?.toString() || "";
        return (
          clientName.toLowerCase().includes(query) ||
          projectName.toLowerCase().includes(query) ||
          jobType.includes(query) ||
          quantity.includes(query)
        );
      });

      if (filteredEstimates.length > 0) {
        acc[groupKey] = filteredEstimates;
      }

      return acc;
    }, {});

    setFilteredData(filtered);
    setNoResults(Object.keys(filtered).length === 0);
  };

  if (loading) return <p>Loading estimates...</p>;

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>

      <div className="mt-6 mb-6">
        <input
          type="text"
          placeholder="Search by client, project name, job type, or quantity..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
        {noResults && <p className="text-gray-500 mt-2 text-sm">No such estimate found.</p>}
      </div>

      <div className="space-y-4">
        {Object.entries(filteredData).map(([groupKey, estimates]) => {
          const [clientName, projectName] = groupKey.split("-");
          return (
            <GroupDropdown
              key={groupKey}
              clientName={clientName}
              projectName={projectName}
              estimates={estimates}
              ordersData={ordersData}
              setOrdersData={setOrdersData}
              setEstimatesData={setEstimatesData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EstimatesPage;
