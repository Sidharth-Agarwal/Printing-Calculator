import React from 'react';
import logo from '../../../assets/logo.png';

const DeliverySlipTemplate = ({ deliveryData, orders, clientInfo }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white p-4 print:p-0" style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* Company Header */}
      <div className="flex justify-between mb-3">
        <div>
          <h1 className="text-base font-bold">Famous Letterpress</h1>
          <p className="text-xs">91-Tetris Building,</p>
          <p className="text-xs">Sub-Jail Junction</p>
          <p className="text-xs">Dimapur-797112,</p>
          <p className="text-xs">Nagaland, India</p>
          <p className="text-xs mt-1">Phone: +91-84160 99340</p>
          <p className="text-xs">Email: info@famousletterpress.com</p>
        </div>
        <div className="text-right">
          <img 
            src={logo} 
            alt="Famous Letterpress" 
            className="w-16 h-16 object-contain mb-2 ml-auto"
            onError={(e) => {
              console.error("Logo failed to load");
              e.target.style.display = 'none';
            }}
          />
          <p className="text-xs">Date: {formatDate(deliveryData.date)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-2">
        <p className="font-medium uppercase text-sm">CUSTOMER'S NAME: {clientInfo.name}</p>
        <div className="flex justify-between mt-1">
          <p className="text-xs">Contact No.: {clientInfo.address?.phone || clientInfo.address?.mobile || 'N/A'}</p>
          <p className="text-xs">Date of Delivery/Pickup: {formatDate(deliveryData.deliveryDate)}</p>
        </div>
      </div>

      {/* Orders Table */}
      <p className="text-sm font-medium mb-1">List of jobs done, deliverables according to quantity.</p>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <th className="border border-gray-400 px-2 py-1 text-left w-12 text-xs">Sl. No.</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs">Description</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-20 text-xs">Qnty</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id}>
              <td className="border border-gray-400 px-2 py-1 text-center text-xs">{index + 1}</td>
              <td className="border border-gray-400 px-2 py-1">
                <div className="text-xs">
                  <div className="font-medium">{order.projectName || "Untitled Project"}</div>
                  <div className="text-xs">{order.jobDetails?.jobType || "Card"}</div>
                  <div className="text-xs text-gray-600">{order.jobDetails?.paperName || ""}</div>
                </div>
              </td>
              <td className="border border-gray-400 px-2 py-1 text-center text-xs">{order.jobDetails?.quantity || "N/A"}</td>
            </tr>
          ))}
          {/* Add blank rows if less than 10 */}
          {orders.length < 10 && Array(10 - orders.length).fill().map((_, index) => (
            <tr key={`empty-${index}`}>
              <td className="border border-gray-400 px-2 py-2">&nbsp;</td>
              <td className="border border-gray-400 px-2 py-2">&nbsp;</td>
              <td className="border border-gray-400 px-2 py-2">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Disclaimer */}
      <div className="mb-4 text-xs space-y-1">
        <p>Before you take it home, just give everything a quick check and count to make sure it's all there. Once you're happy, a little signature would be lovely—just so we're all on the same page later!</p>
        <p>The above mentioned items have been checked and received by ________________________</p>
        <p>on this day ____________________</p>
        <p>Famous Letterpress will not be responsible for any loss or damage once the items are handed over to the concerned person picking up the package.</p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-8">
        <div>
          <p className="border-t border-gray-400 inline-block pt-1 text-xs">For Famous Signature</p>
        </div>
        <div>
          <p className="border-t border-gray-400 inline-block pt-1 text-xs">Receiver Signature</p>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlipTemplate;