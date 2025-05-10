import React from 'react';
import logo from '../../../assets/logo.png';

const InvoiceTemplate = ({ invoiceData, orders, clientInfo, totals }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get tax information
  const getTaxInfo = (order) => {
    const calculations = order.calculations || {};
    return {
      rate: calculations.gstRate || 18,
      amount: parseFloat(calculations.gstAmount) || 0
    };
  };

  // Prepare line items from orders
  const prepareLineItems = () => {
    return orders.map(order => {
      // Calculate cost per card from calculations
      const calculations = order.calculations || {};
      const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
      
      // Get quantity and name
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      const name = `${order.projectName || 'Project'}`;
      
      // Get job type, paper
      const jobType = order.jobDetails?.jobType || 'Card';
      
      // Get paper details with GSM
      const paperName = order.jobDetails?.paperName || '';
      const paperGsm = order.jobDetails?.paperGsm || '';
      const paperCompany = order.jobDetails?.paperCompany || '';
      
      // Format paper info including GSM if available
      const paperInfo = paperName + (paperGsm ? ` ${paperGsm}gsm` : '') + (paperCompany ? ` (${paperCompany})` : '');
      
      // Get HSN code from jobDetails if available
      const hsnCode = order.jobDetails?.hsnCode || '';
      
      // Get loyalty information
      const loyaltyDiscount = order.loyaltyInfo?.discount || calculations.loyaltyTierDiscount || 0;
      const loyaltyDiscountAmount = parseFloat(order.loyaltyInfo?.discountAmount || calculations.loyaltyDiscountAmount || 0);
      const loyaltyTierName = order.loyaltyInfo?.tierName || calculations.loyaltyTierName || '';
      const loyaltyTierColor = calculations.loyaltyTierColor || '#CCCCCC';
      
      // Original and discounted totals
      const originalTotal = costPerCard * quantity;
      const discountedTotal = parseFloat(calculations.discountedTotalCost) || (originalTotal - loyaltyDiscountAmount);
      
      // Tax information (GST)
      const taxInfo = getTaxInfo(order);
      const gstAmount = parseFloat(calculations.gstAmount) || 
                        (taxInfo.rate > 0 ? (discountedTotal * taxInfo.rate / 100) : 0);
      
      const finalTotal = discountedTotal + gstAmount;
      
      return {
        id: order.id,
        name,
        jobType,
        paperInfo,
        quantity,
        price: costPerCard,
        originalTotal: originalTotal,
        loyaltyDiscount: loyaltyDiscount,
        loyaltyDiscountAmount: loyaltyDiscountAmount,
        loyaltyTierName: loyaltyTierName,
        loyaltyTierColor: loyaltyTierColor,
        discountedTotal: discountedTotal,
        gstRate: taxInfo.rate,
        gstAmount: gstAmount,
        finalTotal: finalTotal,
        hsnCode: hsnCode || 'N/A'
      };
    });
  };
  
  const lineItems = prepareLineItems();

  // Collect HSN codes from orders
  const hsnSummary = lineItems.reduce((acc, item) => {
    if (!acc[item.hsnCode]) {
      acc[item.hsnCode] = {
        jobTypes: [item.jobType],
        count: 1
      };
    } else {
      if (!acc[item.hsnCode].jobTypes.includes(item.jobType)) {
        acc[item.hsnCode].jobTypes.push(item.jobType);
      }
      acc[item.hsnCode].count++;
    }
    return acc;
  }, {});

  return (
    <div className="bg-white p-4 print:p-0" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '85%' }}>
      {/* Header with Title and Logo */}
      <div className="flex justify-between mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900">INVOICE</h1>
          <div className="text-sm text-gray-500 mb-2">{invoiceData.invoiceNumber}</div>
          
          {/* Client Info - Positioned directly under invoice number */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Bill To:</h2>
            <div className="font-medium">{clientInfo.name || "Unknown Client"}</div>
            {/* Display address line 1 if available */}
            {clientInfo?.address?.line1 && (
              <div className="text-gray-600 text-sm">{clientInfo.address.line1}</div>
            )}
            {/* Display address line 2 if available */}
            {clientInfo?.address?.line2 && (
              <div className="text-gray-600 text-sm">{clientInfo.address.line2}</div>
            )}
            {/* Display city and state together with comma separator */}
            {(clientInfo?.address?.city || clientInfo?.address?.state) && (
              <div className="text-gray-600 text-sm">
                {clientInfo.address.city || ""}
                {clientInfo.address.city && clientInfo.address.state && ", "}
                {clientInfo.address.state || ""}
              </div>
            )}
            <div className="text-gray-600 text-sm">Client Code: {clientInfo?.clientCode || "N/A"}</div>
          </div>
          
          {/* Date Information */}
          <div className="mt-2 mb-2">
            <div className="text-sm">
              <div className="text-gray-600">Invoice Date: {formatDate(invoiceData.date)}</div>
              <div className="text-gray-600">Due Date: {formatDate(invoiceData.dueDate)}</div>
            </div>
          </div>
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
          <div className="font-bold text-lg text-gray-900">FAMOUS</div>
          <div className="text-gray-600 text-sm">91 Tetris Building, Subjail Tinali</div>
          <div className="text-gray-600 text-sm">Dimapur-797112, Nagaland, India</div>
          <div className="text-gray-600 text-sm">GSTIN: 13ALFPA2458Q2ZO</div>
          <div className="text-gray-600 text-sm">Phone: +919233152718</div>
          <div className="text-gray-600 text-sm">Email: info@famousletterpress.com</div>
          
          {/* Bank Details moved to right side, below company info */}
          <div className="my-2">
            <div className="text-sm">
              <div className="font-medium">Bank Details</div>
              <div className="text-gray-600">A/C No: 912020005432066</div>
              <div className="text-gray-600">IFSC Code: UTIB0000378</div>
              <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Line Items - Simplified Table */}
      <div className="mb-4 overflow-x-auto" style={{ width: '100%' }}>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-1 px-2 border border-gray-300 text-center">S.No</th>
              <th className="py-1 px-2 border border-gray-300 text-left">Item</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Job Type</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Paper</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Qty</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Unit Cost</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Total</th>
              <th className="py-1 px-2 border border-gray-300 text-center">Loyalty</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Discount</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Net Amount</th>
              <th className="py-1 px-2 border border-gray-300 text-center">GST %</th>
              <th className="py-1 px-2 border border-gray-300 text-right">GST Amt</th>
              <th className="py-1 px-2 border border-gray-300 text-right">Final Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.id || index} className="text-gray-700">
                <td className="py-1 px-2 border border-gray-300 text-center">{index + 1}</td>
                <td className="py-1 px-2 border border-gray-300">
                  <div className="font-medium">{item.name}</div>
                </td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.jobType}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.paperInfo}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.quantity}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.originalTotal.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">
                  {item.loyaltyDiscount > 0 && (
                    <div className="flex items-center justify-center">
                      <span>{item.loyaltyDiscount}%</span>
                    </div>
                  )}
                </td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono text-red-600">
                  {item.loyaltyDiscountAmount > 0 ? `-${item.loyaltyDiscountAmount.toFixed(2)}` : '-'}
                </td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.discountedTotal.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{item.gstRate}%</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="flex justify-end mb-3">
        <div className="w-64">
          <div className="flex justify-between py-1 text-sm border-t border-gray-200">
            <div className="text-gray-700">Subtotal:</div>
            <div className="text-gray-900 font-medium font-mono">
              {formatCurrency(lineItems.reduce((sum, item) => sum + item.originalTotal, 0))}
            </div>
          </div>
          
          {/* Total Loyalty Discount */}
          {lineItems.some(item => item.loyaltyDiscountAmount > 0) && (
            <div className="flex justify-between py-1 text-sm text-red-600">
              <div>Loyalty Discount:</div>
              <div className="font-mono">
                -{formatCurrency(lineItems.reduce((sum, item) => sum + item.loyaltyDiscountAmount, 0))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between py-1 text-sm">
            <div className="text-gray-700">GST Amount:</div>
            <div className="text-gray-900 font-mono">
              {formatCurrency(lineItems.reduce((sum, item) => sum + item.gstAmount, 0))}
            </div>
          </div>
          
          <div className="flex justify-between py-1 font-bold border-t border-gray-300">
            <div>Total:</div>
            <div className="font-mono">
              {formatCurrency(lineItems.reduce((sum, item) => sum + item.finalTotal, 0))}
            </div>
          </div>
        </div>
      </div>
      
      {/* HSN Summary */}
      <div className="mb-3">
        <div className="font-medium text-sm mb-1">HSN Summary:</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-1 px-4 border border-gray-300 text-left">HSN Code</th>
              <th className="py-1 px-4 border border-gray-300 text-left">Job Types</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(hsnSummary).map(([hsnCode, data], idx) => (
              <tr key={idx}>
                <td className="py-1 px-4 border border-gray-300 font-mono">{hsnCode}</td>
                <td className="py-1 px-4 border border-gray-300">{data.jobTypes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer - Declaration */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2">
          <div>
            <div className="font-medium mb-1 text-xs">Declaration</div>
            <div className="text-xs text-gray-600">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium mb-6">for FAMOUS</div>
            <div className="text-xs">Authorised Signatory</div>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500">
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;