import React, { useState } from "react";
import { DORMANT_REASONS } from "../../../constants/leadFields";
import CRMActionButton from "../../Shared/CRMActionButton";

/**
 * Modal to mark a lead as dormant with a reason + optional comment.
 * @param {Object} props
 * @param {Object}   props.lead       - Lead being marked dormant
 * @param {function} props.onConfirm  - (leadId, { reason, comment }) => void
 * @param {function} props.onCancel
 */
const DormantModal = ({ lead, onConfirm, onCancel }) => {
  const [reason,    setReason]    = useState("");
  const [comment,   setComment]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState("");

  const handleConfirm = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(lead.id, { reason, comment });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Mark as Dormant</h3>
            <p className="text-sm text-gray-500 mt-0.5">{lead.name}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
          This lead will be marked dormant and filtered out of the active pipeline. You can bring it back at any time.
        </div>

        {/* Reason */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {DORMANT_REASONS.map(r => (
              <label
                key={r.value}
                className={`flex-1 flex items-center justify-center p-2 rounded-md border cursor-pointer text-sm font-medium transition-colors ${
                  reason === r.value
                    ? "border-gray-700 bg-gray-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => { setReason(r.value); setError(""); }}
                  className="sr-only"
                />
                {r.label}
              </label>
            ))}
          </div>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Comment */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Any additional context..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <CRMActionButton type="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </CRMActionButton>
          <CRMActionButton type="primary" onClick={handleConfirm} isLoading={isLoading}>
            Mark Dormant
          </CRMActionButton>
        </div>
      </div>
    </div>
  );
};

export default DormantModal;