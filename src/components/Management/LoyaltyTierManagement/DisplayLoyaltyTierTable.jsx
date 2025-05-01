import React from "react";

const DisplayLoyaltyTierTable = ({ tiers, onDelete, onEdit }) => {
  // Sort tiers by order threshold
  const sortedTiers = [...tiers].sort((a, b) => a.orderThreshold - b.orderThreshold);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Loyalty Tiers</h2>
      
      {sortedTiers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No loyalty tiers defined. Add your first tier to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Tier</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Order Threshold</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Discount</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Color</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Description</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Benefits</th>
                <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTiers.map((tier) => (
                <tr key={tier.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 mr-2 rounded-full"
                        style={{ backgroundColor: tier.color || "#CCCCCC" }}
                      ></div>
                      <div>
                        <div className="font-medium">{tier.name}</div>
                        <div className="text-xs text-gray-500">{tier.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {tier.orderThreshold}{tier.orderThreshold === 1 
                      ? "st Order" 
                      : tier.orderThreshold === 2 
                        ? "nd Order" 
                        : tier.orderThreshold === 3 
                          ? "rd Order" 
                          : "th Order"}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600">{tier.discount}% Off</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-4 mr-2 rounded"
                        style={{ backgroundColor: tier.color || "#CCCCCC" }}
                      ></div>
                      <span className="text-xs">{tier.color || "#CCCCCC"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{tier.description || "-"}</td>
                  <td className="px-4 py-3">
                    <ul className="list-disc pl-4 text-xs">
                      {tier.benefits && tier.benefits.length > 0 ? (
                        tier.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))
                      ) : (
                        <li>No benefits defined</li>
                      )}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(tier)}
                        className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(tier.id)}
                        className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayLoyaltyTierTable;