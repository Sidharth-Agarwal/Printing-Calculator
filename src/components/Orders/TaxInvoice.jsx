import React from 'react';

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

const convertTwoDigits = (n) => {
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
};

const convertThreeDigits = (n) => {
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  if (hundreds === 0) return convertTwoDigits(remainder);
  return ones[hundreds] + ' Hundred' + (remainder ? ' ' + convertTwoDigits(remainder) : '');
};

const numberToWords = (num) => {
  if (num === 0) return 'Zero';

  // Convert number to string and split into whole and decimal parts
  const [whole, decimal] = num.toFixed(2).split('.');
  
  let n = parseInt(whole);
  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;
  
  let words = '';
  if (billions) words += convertThreeDigits(billions) + ' Billion ';
  if (millions) words += convertThreeDigits(millions) + ' Million ';
  if (thousands) words += convertThreeDigits(thousands) + ' Thousand ';
  if (remainder) words += convertThreeDigits(remainder);

  // Add decimal part
  words = words.trim();
  if (decimal !== '00') {
    words += ' and ' + decimal + '/100';
  }

  return words + ' Only';
};

const TaxInvoice = ({ order }) => {
  // Calculate GST amount
  const calculateGST = (amount) => {
    return amount * 0.06; // 6% GST
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format number with 2 decimal places
  const formatNumber = (num) => {
    return Number(num || 0).toFixed(2);
  };

  // Calculate amounts
  const baseAmount = order.jobDetails?.quantity * order.calculations?.perCard || 0;
  const cgst = calculateGST(baseAmount);
  const sgst = calculateGST(baseAmount);
  const totalAmount = baseAmount + cgst + sgst;

  // Generate invoice number
  const getInvoiceNumber = () => {
    const date = new Date(order.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const orderNum = String(order.orderNumber || '001').padStart(3, '0');
    return `KUC${month}${year}/${orderNum}/eQ`;
  };

  return (
    <div className="w-[210mm] mx-auto bg-white p-4">
      <div className="text-center font-bold text-xl mb-2">Tax Invoice</div>
      
      <div className="border border-black">
        {/* Company Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-2">
            <div className="font-bold">M/S FAMOUS</div>
            <div>AT TETRIS BUILDING, INDUSTRIAL ESTATE COLONY</div>
            <div>DIMAPUR NAGALAND</div>
            <div>GSTIN/UIN: 13ALFPA3458Q2Z0</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-1">Invoice No.</td>
                  <td className="p-1">: {getInvoiceNumber()}</td>
                </tr>
                <tr>
                  <td className="p-1">Dated</td>
                  <td className="p-1">: {formatDate(order.date)}</td>
                </tr>
                <tr>
                  <td className="p-1">Mode/Terms of Payment</td>
                  <td className="p-1">:</td>
                </tr>
                <tr>
                  <td className="p-1">Supplier's Ref.</td>
                  <td className="p-1">:</td>
                </tr>
                <tr>
                  <td className="p-1">Other Reference(s)</td>
                  <td className="p-1">:</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-black p-2">
            <div className="mb-1">Buyer</div>
            <div className="mb-2">{order.clientName}</div>
            <div>State Name: Nagaland, Code: 13</div>
          </div>
          <div className="border-b border-black">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-1">Buyer's Order No.</td>
                  <td className="p-1">:</td>
                </tr>
                <tr>
                  <td className="p-1">Dated</td>
                  <td className="p-1">:</td>
                </tr>
                <tr>
                  <td className="p-1">Terms of Delivery</td>
                  <td className="p-1">:</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-b border-black">
          <thead>
            <tr className="text-sm">
              <th className="border-r border-b border-black p-1 w-8">SI No.</th>
              <th className="border-r border-b border-black p-1">Description of Goods</th>
              <th className="border-r border-b border-black p-1 w-24">HSN/SAC</th>
              <th className="border-r border-b border-black p-1 w-20">Quantity</th>
              <th className="border-r border-b border-black p-1 w-16">Rate</th>
              <th className="border-r border-b border-black p-1 w-12">per</th>
              <th className="border-r border-b border-black p-1 w-16">Disc. %</th>
              <th className="border-b border-black p-1 w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border-r border-black p-1 text-center">1</td>
              <td className="border-r border-black p-1">{order.jobDetails?.jobType || 'Card'}</td>
              <td className="border-r border-black p-1 text-center">49100010</td>
              <td className="border-r border-black p-1 text-right">
                {formatNumber(order.jobDetails?.quantity)} pcs
              </td>
              <td className="border-r border-black p-1 text-right">
                {formatNumber(order.calculations?.perCard)}
              </td>
              <td className="border-r border-black p-1 text-center">pcs</td>
              <td className="border-r border-black p-1"></td>
              <td className="p-1 text-right">{formatNumber(baseAmount)}</td>
            </tr>
            <tr>
              <td colSpan="7" className="border-r border-black p-1 text-right">
                Output CGST
              </td>
              <td className="p-1 text-right">{formatNumber(cgst)}</td>
            </tr>
            <tr>
              <td colSpan="7" className="border-r border-black p-1 text-right">
                Output SGST
              </td>
              <td className="p-1 text-right">{formatNumber(sgst)}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border-b border-black p-2">
          <div className="text-sm">Amount Chargeable (in words)</div>
          <div className="font-bold text-sm">INR {numberToWords(totalAmount)}</div>
        </div>

        {/* Tax Details */}
        <table className="w-full border-b border-black text-sm">
          <thead>
            <tr>
              <th className="border-r border-b border-black p-1" rowSpan="2">HSN/SAC</th>
              <th className="border-r border-b border-black p-1" rowSpan="2">Taxable Value</th>
              <th className="border-r border-black p-1" colSpan="2">Central Tax</th>
              <th className="border-r border-black p-1" colSpan="2">State Tax</th>
              <th rowSpan="2" className="border-b border-black p-1">Total Tax Amount</th>
            </tr>
            <tr>
              <th className="border-r border-b border-black p-1">Rate</th>
              <th className="border-r border-b border-black p-1">Amount</th>
              <th className="border-r border-b border-black p-1">Rate</th>
              <th className="border-r border-b border-black p-1">Amount</th>
            </tr>
          </thead>
          <tbody className="text-right">
            <tr>
              <td className="border-r border-black p-1">49100010</td>
              <td className="border-r border-black p-1">{formatNumber(baseAmount)}</td>
              <td className="border-r border-black p-1">6%</td>
              <td className="border-r border-black p-1">{formatNumber(cgst)}</td>
              <td className="border-r border-black p-1">6%</td>
              <td className="border-r border-black p-1">{formatNumber(sgst)}</td>
              <td className="p-1">{formatNumber(cgst + sgst)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in Words */}
        <div className="border-b border-black p-2 text-sm">
          <div>Tax Amount (in words) :</div>
          <div>INR {numberToWords(cgst + sgst)}</div>
        </div>

        {/* Declaration and Signature */}
        <div className="grid grid-cols-2">
          <div className="border-r border-black p-2">
            <div className="text-sm font-bold mb-1">Declaration</div>
            <div className="text-sm">
              We declare that this invoice shows the actual price of the
              goods described and that all particulars are true and correct.
            </div>
          </div>
          <div className="p-2">
            <div className="text-right">
              <div className="font-bold mb-16">for M/S FAMOUS</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm mt-2">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
};

export default TaxInvoice;