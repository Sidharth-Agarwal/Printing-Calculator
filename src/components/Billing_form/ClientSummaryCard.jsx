import React from "react";

const ClientSummaryCard = ({ client }) => {
  if (!client) return null;

  return (
    <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-blue-800">{client.name}</h3>
          <div className="text-xs text-gray-600">Client Code: {client.clientCode}</div>
        </div>
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
          {client.category || "Regular"}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mt-3">
        <div>
          <div className="text-xs text-gray-500">Contact Person</div>
          <div>{client.contactPerson || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Email</div>
          <div>{client.email || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Phone</div>
          <div>{client.phone || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default ClientSummaryCard;