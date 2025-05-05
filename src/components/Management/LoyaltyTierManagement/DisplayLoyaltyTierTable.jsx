import React from "react";

const DisplayLoyaltyTierTable = ({ tiers, onDelete, onEdit }) => {
  // Sort tiers by order threshold
  const sortedTiers = [...tiers].sort((a, b) => a.orderThreshold - b.orderThreshold);

  // Check if edit functionality is enabled
  const hasEditAccess = typeof onEdit === "function" && typeof onDelete === "function";

  // Function to render color cell
  const renderColorCell = (color) => (
    <div className="flex items-center">
      <div
        className="w-5 h-5 mr-2 rounded"
        style={{ backgroundColor: color || "#CCCCCC" }}
      ></div>
      <span className="text-xs">{color || "-"}</span>
    </div>
  );

  // Function to render tier info
  const renderTierInfo = (tier) => (
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
  );

  // Function to render order threshold with appropriate suffix
  const renderOrderThreshold = (threshold) => {
    const suffix = threshold === 1 
      ? "st Order" 
      : threshold === 2 
        ? "nd Order" 
        : threshold === 3 
          ? "rd Order" 
          : "th Order";
    return `${threshold}${suffix}`;
  };

  // Function to render discount as percentage
  const renderDiscount = (discount) => (
    <span className="font-medium text-green-600">{discount}% Off</span>
  );

  // Function to render benefits list
  const renderBenefits = (benefits) => (
    <ul className="list-disc pl-4">
      {benefits && benefits.length > 0 ? (
        benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))
      ) : (
        <li>No additional benefits</li>
      )}
    </ul>
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="pb-4">
        <h2 className="text-lg font-medium">Loyalty Tiers</h2>
      </div>

      {sortedTiers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No loyalty tiers defined. Add your first tier to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tier
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Order Threshold
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Color
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Benefits
                </th>
                {hasEditAccess && (
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTiers.map((tier, index) => (
                <tr key={tier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderTierInfo(tier)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderOrderThreshold(tier.orderThreshold)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderDiscount(tier.discount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderColorCell(tier.color)}
                  </td>
                  <td className="px-4 py-3">
                    {tier.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {renderBenefits(tier.benefits)}
                  </td>
                  {hasEditAccess && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(tier)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(tier.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
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