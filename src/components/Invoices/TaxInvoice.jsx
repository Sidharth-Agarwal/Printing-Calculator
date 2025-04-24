import React from 'react';

const TaxInvoice = ({ order }) => {
  // Helper function to format numbers with 2 decimal places
  const formatNumber = (num) => {
    return Number(num || 0).toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate costs
  const calculateCosts = () => {
    // Get calculations from order
    const calculations = order.calculations || {};
    const costPerCard = parseFloat(calculations.totalCostPerCard || 0);
    const quantity = parseInt(order.jobDetails?.quantity) || 0;
    
    // Calculate base amount
    const baseAmount = costPerCard * quantity;
    
    // Get GST information from calculations
    const gstRate = calculations.gstRate || 18;
    const gstAmount = parseFloat(calculations.gstAmount || (baseAmount * gstRate / 100)) || 0;
    
    // Calculate final total
    const totalAmount = baseAmount + gstAmount;

    // Get job type, paper and die code
    const jobType = order.jobDetails?.jobType || 'Card';
    const paperName = order.jobDetails?.paperName || 'Standard Paper';
    const dieCode = order.dieDetails?.dieCode || '';

    return {
      lineItems: [
        {
          description: order.projectName || 'Project',
          jobType: jobType,
          paperName: paperName,
          dieCode: dieCode,
          quantity: quantity,
          rate: costPerCard,
          amount: baseAmount
        }
      ],
      baseAmount: formatNumber(baseAmount),
      gstRate: gstRate,
      gstAmount: formatNumber(gstAmount),
      totalAmount: formatNumber(totalAmount),
      totalQuantity: quantity
    };
  };

  const costs = calculateCosts();

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    const [whole, decimal] = num.toString().split('.');
    let words = '';

    // Handle whole number part
    const wholeNum = parseInt(whole);
    if (wholeNum >= 1000) {
      words += ones[Math.floor(wholeNum / 1000)] + ' Thousand ';
      num %= 1000;
    }
    if (wholeNum >= 100) {
      words += ones[Math.floor(wholeNum / 100)] + ' Hundred ';
      num %= 100;
    }
    if (wholeNum >= 20) {
      words += tens[Math.floor(wholeNum / 10)] + ' ';
      num %= 10;
    }
    if (wholeNum >= 10 && wholeNum < 20) {
      words += teens[wholeNum - 10] + ' ';
    } else {
      words += ones[wholeNum % 10] + ' ';
    }

    // Handle decimal part
    if (decimal) {
      words += 'and ' + decimal + '/100';
    }

    return words.trim() + ' Only';
  };

  return (
    <div className="w-full bg-white p-8">
      <div className="text-center font-bold text-xl mb-4">TAX INVOICE</div>
      
      <div className="border border-black">
        {/* Company Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-4">
            <div className="font-bold">M/S FAMOUS</div>
            <div>AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
            <div>DIMAPUR NAGALAND</div>
            <div>GSTIN/UIN: 13ALFPA3458Q2Z0</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1">Invoice No. : {order.id || 'INV/2024/'}</td>
                </tr>
                <tr>
                  <td className="py-1">Dated : {formatDate(order.date)}</td>
                </tr>
                <tr>
                  <td className="py-1">Mode/Terms of Payment : </td>
                </tr>
                <tr>
                  <td className="py-1">Supplier's Ref. : </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-4">
            <div className="mb-2">Buyer</div>
            <div className="font-bold mb-2">{order.clientName}</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1">Buyer's Order No. :</td>
                </tr>
                <tr>
                  <td className="py-1">Dated :</td>
                </tr>
                <tr>
                  <td className="py-1">Terms of Delivery :</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-b border-black">
          <thead className="text-sm">
            <tr>
              <th className="border-r border-b border-black p-2 w-10">S.No.</th>
              <th className="border-r border-b border-black p-2">Description</th>
              <th className="border-r border-b border-black p-2">Job Type</th>
              <th className="border-r border-b border-black p-2">Paper Used</th>
              <th className="border-r border-b border-black p-2">Die Code</th>
              <th className="border-r border-b border-black p-2 w-16">HSN/SAC</th>
              <th className="border-r border-b border-black p-2 w-20">Quantity</th>
              <th className="border-r border-b border-black p-2 w-20">Unit Cost</th>
              <th className="border-r border-b border-black p-2 w-20">Total</th>
              <th className="border-r border-b border-black p-2 w-16">GST Rate</th>
              <th className="border-r border-b border-black p-2 w-20">GST Amount</th>
              <th className="border-b border-black p-2 w-24">Final Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {costs.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="border-r border-black p-2 text-center">{index + 1}</td>
                <td className="border-r border-black p-2">{item.description}</td>
                <td className="border-r border-black p-2">{item.jobType}</td>
                <td className="border-r border-black p-2">{item.paperName}</td>
                <td className="border-r border-black p-2">{item.dieCode}</td>
                <td className="border-r border-black p-2 text-center">49100010</td>
                <td className="border-r border-black p-2 text-right">{item.quantity}</td>
                <td className="border-r border-black p-2 text-right">{formatNumber(item.rate)}</td>
                <td className="border-r border-black p-2 text-right">{formatNumber(item.amount)}</td>
                <td className="border-r border-black p-2 text-right">{costs.gstRate}%</td>
                <td className="border-r border-black p-2 text-right">{costs.gstAmount}</td>
                <td className="p-2 text-right">{costs.totalAmount}</td>
              </tr>
            ))}
            <tr>
              <td className="border-r border-black p-2 text-left" colSpan="6">Total</td>
              <td className="border-r border-black p-2 text-right">{costs.totalQuantity}</td>
              <td colSpan="2" className="border-r border-black p-2 text-right">{costs.baseAmount}</td>
              <td colSpan="2" className="border-r border-black p-2 text-right">{costs.gstAmount}</td>
              <td className="p-2 text-right font-bold">{costs.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border-b border-black p-4">
          <div className="text-sm">Amount Chargeable (in words)</div>
          <div className="font-bold">INR {numberToWords(parseFloat(costs.totalAmount))}</div>
        </div>

        {/* Tax Details */}
        <table className="w-full border-b border-black text-sm">
          <thead>
            <tr>
              <th className="border-r border-b border-black p-2" rowSpan="2">HSN/SAC</th>
              <th className="border-r border-b border-black p-2" rowSpan="2">Taxable Value</th>
              <th className="border-r border-black p-2" colSpan="2">GST</th>
              <th className="border-b border-black p-2" rowSpan="2">Total Tax Amount</th>
            </tr>
            <tr>
              <th className="border-r border-b border-black p-2">Rate</th>
              <th className="border-r border-b border-black p-2">Amount</th>
            </tr>
          </thead>
          <tbody className="text-right">
            <tr>
              <td className="border-r border-black p-2">49100010</td>
              <td className="border-r border-black p-2">{costs.baseAmount}</td>
              <td className="border-r border-black p-2">{costs.gstRate}%</td>
              <td className="border-r border-black p-2">{costs.gstAmount}</td>
              <td className="p-2">{costs.gstAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in Words */}
        <div className="border-b border-black p-4">
          <div>Tax Amount (in words):</div>
          <div>INR {numberToWords(parseFloat(costs.gstAmount))}</div>
        </div>

        {/* Declaration and Signature */}
        <div className="grid grid-cols-2">
          <div className="border-r border-black p-4">
            <div className="font-bold mb-2">Declaration</div>
            <div className="text-sm">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="p-4">
            <div className="text-right">
              <div className="font-bold mb-16">for M/S FAMOUS</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm mt-4">This is a Computer Generated Invoice</div>
    </div>
  );
};

export default TaxInvoice;