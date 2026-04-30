import React from "react";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";

const ClientCard = ({ client, onClick }) => {
  const initials = (client.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const formatDate = (v) => {
    if (!v) return null;
    const d = v?.toDate ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div onClick={() => onClick?.(client)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow flex items-start gap-4">

      {/* Avatar */}
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-sm">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-gray-900 text-sm truncate">{client.name}</h3>

          {client.isRepeat && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Repeat</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            client.clientType === "B2B" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
          }`}>
            {client.clientType || "Direct"}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-0.5">{client.clientCode}</p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {client.phone && <span className="text-xs text-gray-600">{client.phone}</span>}
          {client.leadSource && <LeadSourceDisplay sourceId={client.leadSource} className="text-xs" />}
        </div>

        {client.lastDiscussionDate && (
          <p className="text-xs text-gray-400 mt-1">Last contact: {formatDate(client.lastDiscussionDate)}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-gray-500">{client.totalOrders || 0} orders</p>
        {client.totalSpend > 0 && (
          <p className="text-xs font-medium text-gray-700">₹{(client.totalSpend || 0).toLocaleString("en-IN")}</p>
        )}
      </div>
    </div>
  );
};

export default ClientCard;