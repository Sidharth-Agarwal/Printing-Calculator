import React, { useState } from 'react';

const EscrowApprovalModal = ({ estimate, isOpen, onClose, onApprove, onReject, isProcessing }) => {
  const [notes, setNotes] = useState('');
  const [approvalType, setApprovalType] = useState('approve'); // 'approve' or 'reject'

  if (!isOpen || !estimate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (approvalType === 'approve') {
      await onApprove(estimate, notes);
    } else {
      await onReject(estimate, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {approvalType === 'approve' ? 'Approve Estimate' : 'Reject Estimate'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-700 mb-2">Estimate Details</h3>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Project:</p>
                    <p className="text-sm font-medium">{estimate.projectName || 'Unnamed Project'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Client:</p>
                    <p className="text-sm font-medium">{estimate.clientName || estimate.clientInfo?.name || 'Unknown Client'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type:</p>
                    <p className="text-sm">{estimate.jobDetails?.jobType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity:</p>
                    <p className="text-sm">{estimate.jobDetails?.quantity || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <input
                    id="approve"
                    type="radio"
                    name="approvalType"
                    checked={approvalType === 'approve'}
                    onChange={() => setApprovalType('approve')}
                    disabled={isProcessing}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="approve" className="ml-2 block text-sm font-medium text-gray-700">
                    Approve and Move to Orders
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="reject"
                    type="radio"
                    name="approvalType"
                    checked={approvalType === 'reject'}
                    onChange={() => setApprovalType('reject')}
                    disabled={isProcessing}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <label htmlFor="reject" className="ml-2 block text-sm font-medium text-gray-700">
                    Reject Estimate
                  </label>
                </div>
              </div>

              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {approvalType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
                required={approvalType === 'reject'}
                placeholder={approvalType === 'approve' 
                  ? "Add any notes for the production team..."
                  : "Please provide a reason for rejection..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* B2B Loyalty Information */}
            {estimate.clientInfo?.clientType === "B2B" && (
              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-700 mb-2">B2B Loyalty Information</h3>
                <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                  <p className="text-sm text-purple-700">
                    This is a B2B client. Upon approval, the loyalty discount will be calculated and applied automatically.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (approvalType === 'reject' && !notes.trim())}
              className={`px-4 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                approvalType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-500 hover:bg-red-700 focus:ring-red-500'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : approvalType === 'approve' ? (
                'Approve Estimate'
              ) : (
                'Reject Estimate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscrowApprovalModal;