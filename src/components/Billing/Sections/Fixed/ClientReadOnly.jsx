import React from 'react';

// A simple component to display client info in read-only mode for edit scenarios
const ClientReadOnly = ({ client }) => {
  if (!client) return null;

  // Determine client type badge
  const getClientTypeBadge = () => {
    const clientType = (client.clientType || "DIRECT").toUpperCase();
    
    if (clientType === "B2B") {
      return <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">B2B</span>;
    } else {
      return <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Direct</span>;
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded border border-blue-200">
      <div className="flex items-center mb-2">
        <span className="font-bold">Client:</span>
        <span className="ml-2 text-lg">{client.name}</span>
        {getClientTypeBadge()}
      </div>
      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
        <div>
          <strong>Code:</strong> {client.clientCode || "N/A"}
        </div>
        <div>
          <strong>Contact:</strong> {client.contactPerson || "N/A"}
        </div>
        <div>
          <strong>Email:</strong> {client.email || "N/A"}
        </div>
        <div>
          <strong>Phone:</strong> {client.phone || "N/A"}
        </div>
      </div>
    </div>
  );
};

export default ClientReadOnly;