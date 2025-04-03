import React, { useState, useEffect } from "react";
import { createClient, getClientById } from "../../utils/clientUtils";
import SearchableClientDropdown from "./SearchableClientDropdown";

/**
 * Client Info component
 * Allows searching for existing clients or creating new ones
 * Now uses the SearchableClientDropdown component for better UX
 */
const ClientInfo = ({ state, dispatch, validationErrors }) => {
  const { clientInfo } = state;
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstin: ""
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // Handle client selection from dropdown
  const handleClientSelect = (client) => {
    dispatch({
      type: "UPDATE_CLIENT_INFO",
      payload: {
        clientId: client.id,
        clientCode: client.clientCode,
        clientName: client.name,
        contactPerson: client.contactPerson || "",
        email: client.email || "",
        phone: client.phone || "",
        gstin: client.gstin || ""
      }
    });
  };

  // Clear selected client
  const clearClient = () => {
    dispatch({
      type: "UPDATE_CLIENT_INFO",
      payload: {
        clientId: "",
        clientCode: "",
        clientName: "",
        contactPerson: "",
        email: "",
        phone: "",
        gstin: ""
      }
    });
  };

  // Toggle new client form
  const toggleCreateForm = (initialName = "") => {
    setShowCreateForm(!showCreateForm);
    setCreateErrors({});
    
    // Initialize form with name if provided
    if (!showCreateForm && initialName) {
      setNewClient({
        ...newClient,
        name: initialName
      });
    }
  };

  // Handle new client form changes
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value
    });
    
    // Clear error for this field
    if (createErrors[name]) {
      setCreateErrors({
        ...createErrors,
        [name]: ""
      });
    }
  };

  // Validate new client form
  const validateNewClient = () => {
    const errors = {};
    
    if (!newClient.name.trim()) {
      errors.name = "Client name is required";
    }
    
    if (newClient.email && !newClient.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Invalid email format";
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create a new client
  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    if (!validateNewClient()) {
      return;
    }
    
    setIsCreating(true);
    try {
      const createdClient = await createClient(newClient, "current-user-id");
      
      // Select the newly created client
      handleClientSelect(createdClient);
      
      // Close the form
      setShowCreateForm(false);
      setNewClient({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        gstin: ""
      });
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Failed to create client: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Load client data if clientId is already set
  useEffect(() => {
    const loadClient = async () => {
      if (clientInfo.clientId && !clientInfo.clientName) {
        try {
          const client = await getClientById(clientInfo.clientId);
          if (client) {
            handleClientSelect(client);
          }
        } catch (error) {
          console.error("Error loading client:", error);
        }
      }
    };
    
    loadClient();
  }, [clientInfo.clientId, clientInfo.clientName]);

  return (
    <div className="space-y-4">
      {/* Client search/selection */}
      {!clientInfo.clientId ? (
        <div>
          <label className="block mb-1 text-sm font-medium">
            Search for Client <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <div className="flex-grow">
              <SearchableClientDropdown
                selectedClient={clientInfo}
                onChange={handleClientSelect}
                placeholder="Search by client name or code..."
                error={validationErrors.clientId}
                required={true}
                onCreateNew={(name) => toggleCreateForm(name)}
                className="rounded-l-md"
              />
            </div>
            <button
              type="button"
              onClick={() => toggleCreateForm()}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-md text-sm ml-0 border border-green-600"
            >
              New Client
            </button>
          </div>
          {validationErrors.clientId && (
            <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.clientId}</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{clientInfo.clientName}</h3>
              <div className="text-sm text-gray-600">{clientInfo.clientCode}</div>
            </div>
            <button
              type="button"
              onClick={clearClient}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Change Client
            </button>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Contact Person:</span> {clientInfo.contactPerson || "N/A"}
            </div>
            <div>
              <span className="font-medium">Email:</span> {clientInfo.email || "N/A"}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {clientInfo.phone || "N/A"}
            </div>
            <div>
              <span className="font-medium">GSTIN:</span> {clientInfo.gstin || "N/A"}
            </div>
          </div>
        </div>
      )}
      
      {/* Create new client form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Create New Client</h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newClient.name}
                onChange={handleCreateFormChange}
                className={`border rounded-md p-2 w-full text-sm ${
                  createErrors.name ? "border-red-500" : ""
                }`}
                required
              />
              {createErrors.name && (
                <p className="text-red-500 text-xs mt-1">{createErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={newClient.contactPerson}
                onChange={handleCreateFormChange}
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={newClient.email}
                onChange={handleCreateFormChange}
                className={`border rounded-md p-2 w-full text-sm ${
                  createErrors.email ? "border-red-500" : ""
                }`}
              />
              {createErrors.email && (
                <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={newClient.phone}
                onChange={handleCreateFormChange}
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                GSTIN
              </label>
              <input
                type="text"
                name="gstin"
                value={newClient.gstin}
                onChange={handleCreateFormChange}
                className="border rounded-md p-2 w-full text-sm"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400 transition-colors text-sm"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Client"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientInfo;