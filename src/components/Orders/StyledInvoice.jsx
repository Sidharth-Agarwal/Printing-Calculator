import React from 'react';

const StyledInvoice = ({ order }) => {
  const {
    clientName,
    projectName,
    date,
    jobDetails,
    calculations = {},
    id
  } = order;

  const calculateSubtotal = () => {
    if (!calculations || !jobDetails?.quantity) return 0;
    
    const costFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard'
    ];

    const totalPerCard = costFields.reduce((acc, field) => {
      const value = calculations[field];
      return acc + (value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0);
    }, 0);

    return totalPerCard * jobDetails.quantity;
  };

  const subtotal = calculateSubtotal();
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate due date (30 days from invoice date)
  const dueDate = date ? new Date(new Date(date).setDate(new Date(date).getDate() + 30)) : null;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">FAMOUS LETTER PRESS</h1>
          <div className="mt-4 text-sm text-gray-600">
            <p>123 Business District</p>
            <p>City, State - 400001</p>
            <p>+91 98765 43210</p>
            <p>info@famousletterpress.com</p>
            <p>GST: 27AABCS1234L1Z5</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-700">INVOICE</div>
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium">Invoice No: #{id}</p>
            <p>Date: {formatDate(date)}</p>
            <p>Due Date: {formatDate(dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <div className="text-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Bill To:</h2>
          <p className="text-lg font-medium">{clientName}</p>
          <p className="text-gray-600 mt-1">Project: {projectName}</p>
        </div>
      </div>

      {/* Order Details Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700">Quantity</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700">Rate</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200">
            {calculations.paperAndCuttingCostPerCard > 0 && (
              <tr>
                <td className="py-4 px-4">Paper and Cutting</td>
                <td className="py-4 px-4 text-right">{jobDetails?.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.paperAndCuttingCostPerCard)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.paperAndCuttingCostPerCard * jobDetails?.quantity)}</td>
              </tr>
            )}
            {calculations.lpCostPerCard > 0 && (
              <tr>
                <td className="py-4 px-4">Letter Press</td>
                <td className="py-4 px-4 text-right">{jobDetails?.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.lpCostPerCard)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.lpCostPerCard * jobDetails?.quantity)}</td>
              </tr>
            )}
            {calculations.fsCostPerCard > 0 && (
              <tr>
                <td className="py-4 px-4">Foil Stamping</td>
                <td className="py-4 px-4 text-right">{jobDetails?.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.fsCostPerCard)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.fsCostPerCard * jobDetails?.quantity)}</td>
              </tr>
            )}
            {calculations.embCostPerCard > 0 && (
              <tr>
                <td className="py-4 px-4">Embossing</td>
                <td className="py-4 px-4 text-right">{jobDetails?.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.embCostPerCard)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.embCostPerCard * jobDetails?.quantity)}</td>
              </tr>
            )}
            {calculations.digiCostPerCard > 0 && (
              <tr>
                <td className="py-4 px-4">Digital Printing</td>
                <td className="py-4 px-4 text-right">{jobDetails?.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.digiCostPerCard)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(calculations.digiCostPerCard * jobDetails?.quantity)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">GST (18%):</span>
              <span>{formatCurrency(gst)}</span>
            </div>
            <div className="h-px bg-gray-300 my-2"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms and Notes */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Terms</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Due Date: {formatDate(dueDate)}</p>
            <p>• Net 30 days</p>
            <p>• Late payments subject to 1.5% monthly interest</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bank Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Bank: HDFC Bank</p>
            <p>A/C No: XXXX XXXX XXXX 1234</p>
            <p>IFSC: HDFC0001234</p>
            <p>Branch: Business District Branch</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 mt-12 pt-8 border-t">
        <p>Thank you for your business!</p>
        <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  );
};

export default StyledInvoice;