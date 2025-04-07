import React from 'react';

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Convert number to words
  const numberToWords = (num) => {
    if (isNaN(num)) return '';
    
    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const formatTeen = (n) => n < 10 ? single[n] : double[n - 10];
    
    const formatHundred = (n) => {
      if (n < 10) return single[n];
      else if (n < 20) return double[n - 10];
      else {
        const digit = n % 10;
        return tens[Math.floor(n / 10)] + (digit ? '-' + single[digit] : '');
      }
    };
    
    const clean = Math.abs(num);
    const trillion = Math.floor(clean / 1000000000000);
    const billion = Math.floor((clean % 1000000000000) / 1000000000);
    const million = Math.floor((clean % 1000000000) / 1000000);
    const thousand = Math.floor((clean % 1000000) / 1000);
    const hundred = Math.floor((clean % 1000) / 100);
    const tens_ones = clean % 100;
    const decimals = (clean % 1).toFixed(2).slice(2);
    
    let words = '';
    
    if (trillion) words += formatHundred(trillion) + ' Trillion ';
    if (billion) words += formatHundred(billion) + ' Billion ';
    if (million) words += formatHundred(million) + ' Million ';
    if (thousand) words += formatHundred(thousand) + ' Thousand ';
    if (hundred) words += single[hundred] + ' Hundred ';
    
    if (tens_ones) {
      if (words !== '') words += 'and ';
      words += formatHundred(tens_ones);
    }
    
    if (decimals !== '00') {
      words += ' and ' + decimals + '/100';
    }
    
    return words + ' Only';
  };
  
  // Get tax breakdown
  const getTaxBreakdown = () => {
    if (!invoiceData.showTax) return null;
    
    const taxRate = invoiceData.taxRate / 2; // Split into CGST and SGST
    const taxAmount = totals.tax / 2;
    
    return {
      rate: taxRate,
      amount: taxAmount
    };
  };

  // Prepare line items from orders
  const prepareLineItems = () => {
    return orders.map(order => {
      // Calculate cost per card
      const calculations = order.calculations || {};
      
      // List of possible cost fields
      const costFields = [
        'paperAndCuttingCostPerCard', 
        'lpCostPerCard', 
        'fsCostPerCard', 
        'embCostPerCard',
        'lpCostPerCardSandwich', 
        'fsCostPerCardSandwich', 
        'embCostPerCardSandwich', 
        'digiCostPerCard',
        'pastingCostPerCard'
      ];
      
      // Calculate cost per card by summing all applicable costs
      const costPerCard = costFields.reduce((total, field) => {
        const value = calculations[field];
        return total + (value !== null && value !== undefined ? parseFloat(value) || 0 : 0);
      }, 0);
      
      // Apply overheads and wastage
      const wastageRate = 0.05; // 5%
      const overheadRate = 0.35; // 35%
      
      const wastage = costPerCard * wastageRate;
      const overhead = costPerCard * overheadRate;
      const totalCostPerCard = costPerCard + wastage + overhead;
      
      // Get quantity and name
      const quantity = parseInt(order.jobDetails?.quantity) || 0;
      const name = `${order.jobDetails?.jobType || 'Card'} - ${order.projectName || 'Project'}`;
      
      // Get description of processing
      const processes = [];
      if (order.lpDetails?.isLPUsed) processes.push('Letterpress');
      if (order.fsDetails?.isFSUsed) processes.push('Foil Stamping');
      if (order.embDetails?.isEMBUsed) processes.push('Embossing');
      if (order.digiDetails?.isDigiUsed) processes.push('Digital Print');
      if (order.pasting?.isPastingUsed) processes.push('Pasting');
      
      const description = processes.length > 0 
        ? `${processes.join(', ')} - ${order.jobDetails?.paperName || 'Standard Paper'}`
        : order.jobDetails?.paperName || 'Standard Paper';
      
      return {
        id: order.id,
        name,
        description,
        quantity,
        price: totalCostPerCard,
        total: totalCostPerCard * quantity,
        hsn: '49100010' // Default HSN code for printed matter
      };
    });
  };
  
  const lineItems = prepareLineItems();
  const taxDetails = getTaxBreakdown();

  return (
    <div className="bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <div className="mt-1 text-gray-500">{invoiceData.invoiceNumber}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-gray-900">M/S FAMOUS</div>
            <div className="text-gray-500">AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
            <div className="text-gray-500">DIMAPUR NAGALAND</div>
            <div className="text-gray-500">GSTIN/UIN: 13ALFPA3458Q2Z0</div>
            <div className="text-gray-500">State Name: Nagaland, Code: 13</div>
          </div>
        </div>
        
        {/* Bill Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Bill To:</h2>
            <div className="font-medium text-gray-900">{clientInfo.name}</div>
            <div className="text-gray-500">State Name: Nagaland, Code: 13</div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-500">Invoice Date:</div>
              <div className="text-gray-900">{formatDate(invoiceData.date)}</div>
              
              <div className="text-gray-500">Due Date:</div>
              <div className="text-gray-900">{formatDate(invoiceData.dueDate)}</div>
              
              <div className="text-gray-500">Amount Due:</div>
              <div className="text-xl font-semibold text-blue-600">{formatCurrency(totals.total)}</div>
            </div>
          </div>
        </div>
        
        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700 text-sm">
                <th className="py-3 px-4 border-b border-gray-200">Item</th>
                <th className="py-3 px-4 border-b border-gray-200">HSN</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Qty</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Rate</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id} className="text-gray-700">
                  <td className="py-3 px-4 border-b border-gray-200">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">{item.hsn}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <div className="text-gray-700">Subtotal:</div>
              <div className="text-gray-900 font-medium">{formatCurrency(totals.subtotal)}</div>
            </div>
            
            {invoiceData.discount > 0 && (
              <div className="flex justify-between py-2 text-red-600">
                <div>Discount ({invoiceData.discount}%):</div>
                <div>-{formatCurrency(totals.discount)}</div>
              </div>
            )}
            
            {invoiceData.showTax && taxDetails && (
              <>
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <div className="text-gray-700">CGST ({taxDetails.rate}%):</div>
                  <div className="text-gray-900">{formatCurrency(taxDetails.amount)}</div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="text-gray-700">SGST ({taxDetails.rate}%):</div>
                  <div className="text-gray-900">{formatCurrency(taxDetails.amount)}</div>
                </div>
              </>
            )}
            
            <div className="flex justify-between py-2 border-t border-gray-200 text-lg font-bold">
              <div>Total:</div>
              <div>{formatCurrency(totals.total)}</div>
            </div>
          </div>
        </div>
        
        {/* Amount in Words */}
        <div className="mb-6 border-t border-b border-gray-200 py-4">
          <div className="text-sm text-gray-600">Amount in Words:</div>
          <div className="font-medium">Indian Rupees {numberToWords(totals.total)}</div>
        </div>
        
        {/* Notes */}
        {invoiceData.notes && (
          <div className="mb-6">
            <div className="font-medium text-gray-700 mb-2">Notes:</div>
            <div className="text-gray-600 text-sm whitespace-pre-line">{invoiceData.notes}</div>
          </div>
        )}
        
        {/* Additional Info */}
        {invoiceData.additionalInfo && (
          <div className="mb-6">
            <div className="font-medium text-gray-700 mb-2">Additional Information:</div>
            <div className="text-gray-600 text-sm whitespace-pre-line">{invoiceData.additionalInfo}</div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2">
            <div>
              <div className="font-medium mb-2">Declaration</div>
              <div className="text-sm text-gray-600">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium mb-16">for M/S FAMOUS</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;