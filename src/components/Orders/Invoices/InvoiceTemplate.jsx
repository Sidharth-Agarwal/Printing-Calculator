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

  // Prepare line items from orders with FIXED GST calculation
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
      const afterLoyaltyDiscount = originalTotal - loyaltyDiscountAmount;
      
      // Apply additional invoice discount proportionally to this item
      const itemDiscountAmount = (afterLoyaltyDiscount * (invoiceData.discount / 100)) || 0;
      const discountedTotal = afterLoyaltyDiscount - itemDiscountAmount;
      
      // FIXED: Calculate GST on the final discounted amount (after all discounts)
      const gstRate = 18; // Standard GST rate
      const gstAmount = invoiceData.showTax ? (discountedTotal * gstRate / 100) : 0;
      
      const finalTotal = discountedTotal + gstAmount;
      
      return {
        id: order.id,
        orderId: order.orderSerial || 'N/A', // Add order serial number
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
        invoiceDiscountAmount: itemDiscountAmount,
        discountedTotal: discountedTotal,
        gstRate: gstRate,
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
    <div className="bg-white p-2 print:p-0" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '65%' }}>
      {/* Header with Title and Logo */}
      <div className="flex justify-between mb-1">
        <div className="w-1/2">
          <h1 className="text-xl font-bold text-gray-900">INVOICE</h1>
          <div className="text-xs text-gray-600 mb-1">{invoiceData.invoiceNumber}</div>
          
          {/* Client Info - Positioned directly under invoice number */}
          <div>
            <h2 className="text-xs font-semibold text-gray-700 mb-0.5">Bill To:</h2>
            <div className="font-medium">{clientInfo.name || "Unknown Client"}</div>
            {/* Display address line 1 if available */}
            {clientInfo?.address?.line1 && (
              <div className="text-gray-600 text-xs">{clientInfo.address.line1}</div>
            )}
            {/* Display address line 2 if available */}
            {clientInfo?.address?.line2 && (
              <div className="text-gray-600 text-xs">{clientInfo.address.line2}</div>
            )}
            {/* Display city and state together with comma separator */}
            {(clientInfo?.address?.city || clientInfo?.address?.state) && (
              <div className="text-gray-600 text-xs">
                {clientInfo.address.city || ""}
                {clientInfo.address.city && clientInfo.address.state && ", "}
                {clientInfo.address.state || ""}
              </div>
            )}
            <div className="text-gray-600 text-xs">Client Code: {clientInfo?.clientCode || "N/A"}</div>
          </div>
          
          {/* Date Information */}
          <div className="mt-0.5 mb-0.5">
            <div className="text-xs">
              <div className="text-gray-600">Invoice Date: {formatDate(invoiceData.date)}</div>
              <div className="text-gray-600">Due Date: {formatDate(invoiceData.dueDate)}</div>
            </div>
          </div>
        </div>
        <div className="text-right w-1/2">
          <img 
            src={logo} 
            alt="Famous Letterpress" 
            className="w-12 h-12 object-contain mb-1 ml-auto"
            onError={(e) => {
              console.error("Logo failed to load");
              e.target.style.display = 'none';
            }}
          />
          <div className="font-bold text-base text-gray-900">FAMOUS</div>
          <div className="text-gray-600 text-xs">91 Tetris Building, Subjail Tinali</div>
          <div className="text-gray-600 text-xs">Dimapur-797112, Nagaland, India</div>
          <div className="text-gray-600 text-xs">GSTIN: 13ALFPA2458Q2ZO</div>
          <div className="text-gray-600 text-xs">Phone: +919233152718</div>
          <div className="text-gray-600 text-xs">Email: info@famousletterpress.com</div>
          
          {/* Bank Details moved to right side, below company info */}
          <div className="my-0.5">
            <div className="text-xs">
              <div className="font-medium">Bank Details</div>
              <div className="text-gray-600">A/C No: 912020005432066</div>
              <div className="text-gray-600">IFSC Code: UTIB0000378</div>
              <div className="text-gray-600">Axis Bank, Circular Road, Dimapur</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Line Items - Updated table with Order ID column and adjusted widths */}
      <div className="mb-3">
        <table className="w-full border-collapse text-xs" style={{ fontSize: "65%" }}>
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-0.5 px-1 border border-gray-300 text-center w-6">S.No</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-20">Order Serial</th>
              <th className="py-0.5 px-1 border border-gray-300 text-left w-18">Item</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-12">Job Type</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-18">Paper</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">Qty</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-14">Unit</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Total</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">Disc%</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Discount</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Net Amt</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">GST%</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">GST</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Final</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.id || index} className="text-gray-700">
                <td className="py-0.5 px-1 border border-gray-300 text-center">{index + 1}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-center font-mono text-[8px] whitespace-nowrap">{item.orderId}</td>
                <td className="py-0.5 px-1 border border-gray-300 truncate">
                  <div className="font-medium truncate">{item.name}</div>
                </td>
                <td className="py-0.5 px-1 border border-gray-300 text-center truncate">{item.jobType}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-center truncate">{item.paperInfo}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-center">{item.quantity}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono">{item.price.toFixed(2)}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono">{item.originalTotal.toFixed(2)}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-center">
                  {(item.loyaltyDiscount > 0 || invoiceData.discount > 0) && 
                    <span>{((item.loyaltyDiscountAmount + item.invoiceDiscountAmount) / item.originalTotal * 100).toFixed(1)}%</span>
                  }
                </td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono text-red-600">
                  {(item.loyaltyDiscountAmount + item.invoiceDiscountAmount) > 0 ? 
                    `-${(item.loyaltyDiscountAmount + item.invoiceDiscountAmount).toFixed(2)}` : '-'}
                </td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono">{item.discountedTotal.toFixed(2)}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-center">{item.gstRate}%</td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
                <td className="py-0.5 px-1 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="flex justify-end mb-1">
        <div className="w-48">
          <div className="flex justify-between py-0.5 text-xs border-t border-gray-200">
            <div className="text-gray-700">Subtotal:</div>
            <div className="text-gray-900 font-medium font-mono">
              {formatCurrency(totals.subtotal)}
            </div>
          </div>
          
          {/* Total Loyalty Discount */}
          {totals.loyaltyDiscount > 0 && (
            <div className="flex justify-between py-0.5 text-xs text-red-600">
              <div>Loyalty Discount:</div>
              <div className="font-mono">
                -{formatCurrency(totals.loyaltyDiscount)}
              </div>
            </div>
          )}
          
          {/* Additional Invoice Discount */}
          {invoiceData.discount > 0 && (
            <div className="flex justify-between py-0.5 text-xs text-red-600">
              <div>Invoice Discount ({invoiceData.discount}%):</div>
              <div className="font-mono">
                -{formatCurrency(totals.discount)}
              </div>
            </div>
          )}
          
          <div className="flex justify-between py-0.5 text-xs border-t border-gray-300">
            <div className="text-gray-700">Taxable Amount:</div>
            <div className="text-gray-900 font-mono">
              {formatCurrency(totals.taxableAmount)}
            </div>
          </div>
          
          <div className="flex justify-between py-0.5 text-xs">
            <div className="text-gray-700">GST Amount (18%):</div>
            <div className="text-gray-900 font-mono">
              {formatCurrency(totals.tax)}
            </div>
          </div>
          
          <div className="flex justify-between py-0.5 font-bold border-t border-gray-300">
            <div>Total:</div>
            <div className="font-mono">
              {formatCurrency(totals.total)}
            </div>
          </div>
        </div>
      </div>
      
      {/* HSN Summary - More compact */}
      <div className="mb-1">
        <div className="font-medium text-xs mb-0.5">HSN Summary:</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-0.5 px-1 border border-gray-300 text-left">HSN Code</th>
              <th className="py-0.5 px-1 border border-gray-300 text-left">Job Types</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(hsnSummary).map(([hsnCode, data], idx) => (
              <tr key={idx}>
                <td className="py-0.5 px-1 border border-gray-300 font-mono">{hsnCode}</td>
                <td className="py-0.5 px-1 border border-gray-300">{data.jobTypes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Notes Section - Added if there are notes */}
      {invoiceData.notes && (
        <div className="mb-1">
          <div className="font-medium text-xs mb-0.5">Notes:</div>
          <div className="text-xs text-gray-600 border border-gray-300 p-1 rounded">
            {invoiceData.notes}
          </div>
        </div>
      )}
      
      {/* Footer - Declaration */}
      <div className="mt-1 pt-0.5 border-t border-gray-200">
        <div className="grid grid-cols-2">
          <div>
            <div className="font-medium mb-0.5 text-xs">Declaration</div>
            <div className="text-xs text-gray-600">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium mb-2">for FAMOUS</div>
            <div className="text-xs">Authorised Signatory</div>
          </div>
        </div>
        <div className="mt-0.5 text-center text-xs text-gray-500">
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;