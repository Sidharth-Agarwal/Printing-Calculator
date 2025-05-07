import React from 'react';

const ClientReadOnly = ({ client }) => {
  if (!client) return null;

  // Determine client type badge
  const getClientType = () => {
    const clientType = (client.clientType || "DIRECT").toUpperCase();
    
    if (clientType === "B2B") {
      return "B2B";
    } else {
      return "Direct";
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center mb-2">
        <span className="font-bold text-gray-800">Client:</span>
        <span className="ml-2 text-lg">{client.name}</span>
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          getClientType() === "B2B" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
        }`}>
          {getClientType()}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1 text-sm">
        <div>
          <strong className="text-gray-700">Code:</strong> <span className="text-gray-800">{client.clientCode || "N/A"}</span>
        </div>
        <div>
          <strong className="text-gray-700">Contact:</strong> <span className="text-gray-800">{client.contactPerson || "N/A"}</span>
        </div>
        <div>
          <strong className="text-gray-700">Email:</strong> <span className="text-gray-800">{client.email || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ClientReadOnly;