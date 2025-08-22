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
  formatDate,
  onGenerateInvoice,
  onGenerateJobTicket,
  onGenerateDeliverySlip
}) => {
  // Calculate if all orders are selected
  const areAllOrdersSelected = client.orders.length > 0 && 
    client.orders.every(order => selectedOrders.includes(order.id));
  
  // Calculate if some but not all orders are selected
  const areSomeOrdersSelected = client.orders.some(order => selectedOrders.includes(order.id)) && 
    !areAllOrdersSelected;

  // Handle toggle all orders selection
  const handleToggleSelectAll = (e) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking checkbox
    onSelectAllOrders(client.id, !areAllOrdersSelected);
  };

  // Handle individual action buttons for single orders
  const handleSingleOrderInvoice = (order) => {
    if (onGenerateInvoice) {
      onGenerateInvoice([order]); // Pass as array for consistency
    }
  };

  const handleSingleOrderJobTicket = (order) => {
    if (onGenerateJobTicket) {
      onGenerateJobTicket([order]); // Pass as array for consistency
    }
  };

  const handleSingleOrderDeliverySlip = (order) => {
    if (onGenerateDeliverySlip) {
      onGenerateDeliverySlip([order]); // Pass as array for consistency
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Client Header */}
      <div 
        className={`px-4 py-3 ${isExpanded ? 'bg-gray-50' : ''} cursor-pointer transition-colors hover:bg-gray-50 flex justify-between items-center`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={areAllOrdersSelected}
              onChange={handleToggleSelectAll}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              onClick={(e) => e.stopPropagation()}
              ref={(input) => {
                if (input) input.indeterminate = areSomeOrdersSelected;
              }}
            />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-800">{client.name}</h2>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {client.totalOrders} Order{client.totalOrders !== 1 ? 's' : ''}
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {client.completedOrders} Completed
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {client.totalQuantity.toLocaleString()} Items
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {client.orders.map((order) => (
              <InvoiceCard
                key={order.id}
                order={order}
                isSelected={selectedOrders.includes(order.id)}
                onSelect={onSelectOrder}
                onClick={() => onOrderClick(order)}
                formatDate={formatDate}
                onGenerateInvoice={handleSingleOrderInvoice}
                onGenerateJobTicket={handleSingleOrderJobTicket}
                onGenerateDeliverySlip={handleSingleOrderDeliverySlip}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInvoiceGroup;