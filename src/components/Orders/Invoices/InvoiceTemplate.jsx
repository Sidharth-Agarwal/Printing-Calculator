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

  // FIXED: Prepare line items with corrected GST calculation
  const prepareLineItems = () => {
    return orders.map(order => {
      const calculations = order.calculations || {};
      
      // Basic item info
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      const name = `${order.projectName || 'Project'}`;
      const jobType = order.jobDetails?.jobType || 'Card';
      
      // Paper details
      const paperName = order.jobDetails?.paperName || '';
      const paperGsm = order.jobDetails?.paperGsm || '';
      const paperCompany = order.jobDetails?.paperCompany || '';
      const paperInfo = paperName + (paperGsm ? ` ${paperGsm}gsm` : '') + (paperCompany ? ` (${paperCompany})` : '');
      
      // HSN code
      const hsnCode = order.jobDetails?.hsnCode || 'N/A';
      
      // Original amounts from DB
      const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
      const originalTotal = parseFloat(calculations.totalCost || (costPerCard * quantity)) || 0;
      
      // Loyalty discount from DB
      const loyaltyDiscountAmount = parseFloat(calculations.loyaltyDiscountAmount || 0);
      const loyaltyDiscount = parseFloat(calculations.loyaltyTierDiscount || 0);
      const loyaltyTierName = calculations.loyaltyTierName || '';
      
      // GST rate from DB
      const gstRate = parseFloat(calculations.gstRate || order.jobDetails?.gstRate || 18);
      
      // Invoice level discount (applied proportionally)
      const afterLoyaltyDiscount = originalTotal - loyaltyDiscountAmount;
      const itemDiscountAmount = (afterLoyaltyDiscount * (invoiceData.discount / 100)) || 0;
      
      // FIXED: Calculate taxable amount AFTER all discounts
      const taxableAmount = originalTotal - loyaltyDiscountAmount - itemDiscountAmount;
      
      // FIXED: Calculate GST on the discounted/taxable amount
      const gstAmount = (taxableAmount * gstRate) / 100;
      
      // Final total with GST
      const finalTotal = taxableAmount + gstAmount;
      
      return {
        id: order.id,
        orderId: order.orderSerial || order.id?.slice(-6) || 'N/A',
        name,
        jobType,
        paperInfo,
        quantity,
        price: costPerCard,
        originalTotal: originalTotal,
        loyaltyDiscount: loyaltyDiscount,
        loyaltyDiscountAmount: loyaltyDiscountAmount,
        loyaltyTierName: loyaltyTierName,
        invoiceDiscountAmount: itemDiscountAmount,
        taxableAmount: taxableAmount, // Amount after all discounts (before GST)
        gstRate: gstRate,
        gstAmount: gstAmount, // GST calculated on discounted amount
        finalTotal: finalTotal
      };
    });
  };
  
  const lineItems = prepareLineItems();

  // FIXED: Recalculate totals with corrected GST
  const recalculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.originalTotal, 0);
    const totalLoyaltyDiscount = lineItems.reduce((sum, item) => sum + item.loyaltyDiscountAmount, 0);
    const totalInvoiceDiscount = lineItems.reduce((sum, item) => sum + item.invoiceDiscountAmount, 0);
    const totalTaxable = lineItems.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalGST = lineItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.finalTotal, 0);

    return {
      subtotal,
      loyaltyDiscount: totalLoyaltyDiscount,
      invoiceDiscount: totalInvoiceDiscount,
      taxableAmount: totalTaxable,
      gst: totalGST,
      total: grandTotal
    };
  };

  const calculatedTotals = recalculateTotals();

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
          
          {/* Client Info */}
          <div>
            <h2 className="text-xs font-semibold text-gray-700 mb-0.5">Bill To:</h2>
            <div className="font-medium">{clientInfo.name || "Unknown Client"}</div>
            {clientInfo?.address?.line1 && (
              <div className="text-gray-600 text-xs">{clientInfo.address.line1}</div>
            )}
            {clientInfo?.address?.line2 && (
              <div className="text-gray-600 text-xs">{clientInfo.address.line2}</div>
            )}
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
          
          {/* Bank Details */}
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
      
      {/* Line Items Table */}
      <div className="mb-3">
        <table className="w-full border-collapse text-xs" style={{ fontSize: "65%" }}>
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-0.5 px-1 border border-gray-300 text-center w-6">S.No</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-20">Order Serial</th>
              <th className="py-0.5 px-1 border border-gray-300 text-left w-18">Item</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-12">Type</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-18">Paper</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">Qty</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-14">Unit</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Total</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">Disc%</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Discount</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Taxable</th>
              <th className="py-0.5 px-1 border border-gray-300 text-center w-10">GST%</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">GST</th>
              <th className="py-0.5 px-1 border border-gray-300 text-right w-16">Final</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {
              const totalDiscount = item.loyaltyDiscountAmount + item.invoiceDiscountAmount;
              const discountPercent = item.originalTotal > 0 ? (totalDiscount / item.originalTotal * 100) : 0;
              
              return (
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
                    {totalDiscount > 0 && <span>{discountPercent.toFixed(1)}%</span>}
                  </td>
                  <td className="py-0.5 px-1 border border-gray-300 text-right font-mono text-red-600">
                    {totalDiscount > 0 ? `-${totalDiscount.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-0.5 px-1 border border-gray-300 text-right font-mono font-semibold">{item.taxableAmount.toFixed(2)}</td>
                  <td className="py-0.5 px-1 border border-gray-300 text-center">{item.gstRate}%</td>
                  <td className="py-0.5 px-1 border border-gray-300 text-right font-mono">{item.gstAmount.toFixed(2)}</td>
                  <td className="py-0.5 px-1 border border-gray-300 text-right font-mono font-bold">{item.finalTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary - Using recalculated totals */}
      <div className="flex justify-end mb-1">
        <div className="w-48">
          <div className="flex justify-between py-0.5 text-xs border-t border-gray-200">
            <div className="text-gray-700">Subtotal:</div>
            <div className="text-gray-900 font-medium font-mono">
              {formatCurrency(calculatedTotals.subtotal)}
            </div>
          </div>
          
          {calculatedTotals.loyaltyDiscount > 0 && (
            <div className="flex justify-between py-0.5 text-xs text-red-600">
              <div>Loyalty Discount:</div>
              <div className="font-mono">
                -{formatCurrency(calculatedTotals.loyaltyDiscount)}
              </div>
            </div>
          )}
          
          {calculatedTotals.invoiceDiscount > 0 && (
            <div className="flex justify-between py-0.5 text-xs text-red-600">
              <div>Invoice Discount ({invoiceData.discount}%):</div>
              <div className="font-mono">
                -{formatCurrency(calculatedTotals.invoiceDiscount)}
              </div>
            </div>
          )}
          
          <div className="flex justify-between py-0.5 text-xs border-t border-gray-300">
            <div className="text-gray-700 font-semibold">Taxable Amount:</div>
            <div className="text-gray-900 font-semibold font-mono">
              {formatCurrency(calculatedTotals.taxableAmount)}
            </div>
          </div>
          
          {invoiceData.showTax && (
            <div className="flex justify-between py-0.5 text-xs">
              <div className="text-gray-700">GST Amount:</div>
              <div className="text-gray-900 font-mono">
                {formatCurrency(calculatedTotals.gst)}
              </div>
            </div>
          )}
          
          <div className="flex justify-between py-0.5 font-bold border-t border-gray-300 bg-gray-50 px-1">
            <div>Total:</div>
            <div className="font-mono">
              {formatCurrency(calculatedTotals.total)}
            </div>
          </div>
        </div>
      </div>
      
      {/* HSN Summary */}
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
      
      {/* Notes Section */}
      {invoiceData.notes && (
        <div className="mb-1">
          <div className="font-medium text-xs mb-0.5">Notes:</div>
          <div className="text-xs text-gray-600 border border-gray-300 p-1 rounded">
            {invoiceData.notes}
          </div>
        </div>
      )}
      
      {/* Footer */}
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