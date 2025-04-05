// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import SearchableClientDropdown from "./SearchableClientDropdown";
// import ClientSummaryCard from "./ClientSummaryCard";
// import AddClientForm from "../Client_management/AddClientForm"

// const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient, generateClientCode }) => {
//   const [clients, setClients] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showAddClientForm, setShowAddClientForm] = useState(false);

//   // Fetch clients from Firestore
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         setIsLoading(true);
//         const clientsCollection = collection(db, "clients");
//         const querySnapshot = await getDocs(clientsCollection);
//         const clientsData = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setClients(clientsData);
//       } catch (error) {
//         console.error("Error fetching clients:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchClients();
//   }, []);

//   // Handle client selection
//   const handleClientSelect = (client) => {
//     setSelectedClient(client);
//     if (client) {
//       onClientSelect({
//         clientId: client.id,
//         clientInfo: {
//           name: client.name,
//           clientCode: client.clientCode,
//           contactPerson: client.contactPerson,
//           email: client.email,
//           phone: client.phone,
//           address: client.address,
//           billingAddress: client.billingAddress,
//           category: client.category,
//           gstin: client.gstin
//         }
//       });
//     } else {
//       onClientSelect(null);
//     }
//   };

//   // Handle showing the add client form
//   const handleCreateNewClient = () => {
//     setShowAddClientForm(true);
//   };

//   // Handler for when a new client is successfully added
// //   const handleClientAdded = async (newClient) => {
// //     setShowAddClientForm(false);
// //     // Refresh the client list
// //     const clientsCollection = collection(db, "clients");
// //     const querySnapshot = await getDocs(clientsCollection);
// //     const clientsData = querySnapshot.docs.map(doc => ({
// //       id: doc.id,
// //       ...doc.data()
// //     }));
// //     setClients(clientsData);
    
// //     // Find the newly added client and select it
// //     const addedClient = clientsData.find(client => client.clientCode === newClient.clientCode);
// //     if (addedClient) {
// //       handleClientSelect(addedClient);
// //     }
// //   };
//   const handleClientAdded = async (newClient) => {
//     try {
//       setShowAddClientForm(false);
//       console.log("New client created:", newClient); // Debug log
      
//       // Wait a moment for Firestore to update
//       setTimeout(async () => {
//         // Refresh the client list
//         const clientsCollection = collection(db, "clients");
//         const querySnapshot = await getDocs(clientsCollection);
//         const clientsData = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setClients(clientsData);
        
//         // Find the newly added client
//         console.log("Looking for client with code:", newClient.clientCode);
//         const addedClient = clientsData.find(client => 
//           client.clientCode === newClient.clientCode
//         );
        
//         if (addedClient) {
//           console.log("Found new client:", addedClient);
//           handleClientSelect(addedClient);
//         } else {
//           console.error("Could not find the newly added client");
//         }
//       }, 500); // Small delay to ensure Firestore has updated
//     } catch (error) {
//       console.error("Error handling new client:", error);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      
//       {showAddClientForm ? (
//         <div>
//           <AddClientForm 
//             onSubmit={handleClientAdded}
//             selectedClient={null}
//             onUpdate={() => {}}
//             setSelectedClient={() => setShowAddClientForm(false)}
//             generateClientCode={generateClientCode}
//           />
//           <button
//             type="button"
//             onClick={() => setShowAddClientForm(false)}
//             className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//         </div>
//       ) : (
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Select Client <span className="text-red-500">*</span>
//             </label>
//             <SearchableClientDropdown 
//               clients={clients}
//               selectedClient={selectedClient}
//               onClientSelect={handleClientSelect}
//               onCreateNewClient={handleCreateNewClient}
//               isLoading={isLoading}
//             />
//           </div>
          
//           {selectedClient && (
//             <ClientSummaryCard client={selectedClient} />
//           )}
          
//           {!selectedClient && !isLoading && (
//             <div className="bg-gray-50 p-4 rounded-md text-center">
//               <p className="text-gray-600 mb-2">No client selected</p>
//               <button
//                 type="button"
//                 onClick={handleCreateNewClient}
//                 className="text-blue-500 hover:underline"
//               >
//                 + Create new client
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientSelection;

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import SearchableClientDropdown from "./SearchableClientDropdown";
import ClientSummaryCard from "./ClientSummaryCard";

const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsCollection = collection(db, "clients");
        const querySnapshot = await getDocs(clientsCollection);
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    if (client) {
      onClientSelect({
        clientId: client.id,
        clientInfo: {
          name: client.name,
          clientCode: client.clientCode,
          contactPerson: client.contactPerson,
          email: client.email,
          phone: client.phone,
          address: client.address,
          billingAddress: client.billingAddress,
          category: client.category,
          gstin: client.gstin
        }
      });
    } else {
      onClientSelect(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Client <span className="text-red-500">*</span>
        </label>
        <SearchableClientDropdown 
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
          isLoading={isLoading}
        />
      </div>
      
      {selectedClient && (
        <ClientSummaryCard client={selectedClient} />
      )}
      
      {!selectedClient && !isLoading && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-600">Please select a client to continue</p>
        </div>
      )}
    </div>
  );
};

export default ClientSelection;