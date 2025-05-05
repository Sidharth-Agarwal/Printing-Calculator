import React from 'react';
import InvoiceCard from './InvoiceCard';

const ClientInvoiceGroup = ({ 
  client, 
  isExpanded, 
  onToggle, 
  selectedOrders, 
  onSelectOrder, 
  onSelectAllOrders,
  onOrderClick,
  onUpdateStage,
  stages
}) => {
  // Calculate if all orders are selected
  const areAllOrdersSelected = client.orders.length > 0 && 
    client.orders.every(order => selectedOrders.includes(order.id));
  
  // Calculate if some but not all orders are selected
  const areSomeOrdersSelected = client.orders.some(order => selectedOrders.includes(order.id)) && 
    !areAllOrdersSelected;

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle toggle all orders selection
  const handleToggleSelectAll = (e) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking checkbox
    onSelectAllOrders(client.id, !areAllOrdersSelected);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Client Header - More compact */}
      <div 
        className={`p-3 ${isExpanded ? 'bg-blue-50' : 'bg-gray-50'} cursor-pointer border-b border-gray-200 transition-colors duration-150`}
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={areAllOrdersSelected}
                onChange={handleToggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                indeterminate={areSomeOrdersSelected ? "true" : undefined}
              />
            </div>
            <div>
              <h2 className="text-base font-semibold">{client.name}</h2>
              <p className="text-xs text-gray-500">
                {client.totalOrders} Order{client.totalOrders !== 1 ? 's' : ''} • 
                {client.completedOrders} Completed • 
                {client.totalQuantity.toLocaleString()} Total Quantity
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1">
              {/* Display first 3 orders as avatar circles - smaller for compact design */}
              {client.orders.slice(0, 3).map((order) => (
                <div 
                  key={order.id} 
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                    order.stage === 'Delivery' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                  title={order.projectName || `Order ${order.id}`}
                >
                  {(order.projectName || 'O')[0]}
                </div>
              ))}
              {client.orders.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-800">
                  +{client.orders.length - 3}
                </div>
              )}
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Expanded Content - More compact grid with smaller gaps */}
      {isExpanded && (
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {client.orders.map((order) => (
              <InvoiceCard
                key={order.id}
                order={order}
                isSelected={selectedOrders.includes(order.id)}
                onSelect={onSelectOrder}
                onClick={() => onOrderClick(order)}
                onUpdateStage={onUpdateStage}
                stages={stages}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInvoiceGroup;