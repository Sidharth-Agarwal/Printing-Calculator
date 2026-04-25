import React from "react";
import { PAYMENT_STATUSES, getPendingBalance } from "../../../services/jobTicketService";

/**
 * Displays / edits payment fields for a job ticket.
 * In readOnly mode shows a summary. In edit mode shows inputs.
 */
const PaymentTracker = ({ formData, onChange, readOnly = false }) => {
  const pending = getPendingBalance(formData);

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400";

  if (readOnly) {
    const rows = [
      { label: "Final Billed",     value: formData.finalBilled    || 0, color: "text-gray-800" },
      { label: "Advance Paid",     value: formData.advancePaid    || 0, color: "text-green-700" },
      { label: "Courier Charges",  value: formData.courierCharges || 0, color: "text-gray-800" },
      { label: "Pending Balance",  value: pending,                       color: pending > 0 ? "text-red-600" : "text-green-600" }
    ];
    return (
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className={`font-medium ${r.color}`}>₹{parseFloat(r.value).toLocaleString("en-IN")}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-gray-500">Payment Status</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            formData.paymentStatus === "paid"    ? "bg-green-100 text-green-700" :
            formData.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {PAYMENT_STATUSES.find(s => s.value === formData.paymentStatus)?.label || "Pending"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { name: "finalBilled",    label: "Final Billed (₹)" },
        { name: "advancePaid",    label: "Advance Paid (₹)" },
        { name: "courierCharges", label: "Courier Charges (₹)" }
      ].map(f => (
        <div key={f.name}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
          <input type="number" min="0" value={formData[f.name] || ""}
            onChange={e => onChange(f.name, parseFloat(e.target.value) || 0)}
            className={inputCls} placeholder="0" />
        </div>
      ))}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Pending Balance (₹)</label>
        <div className={`px-3 py-2 rounded-md text-sm font-medium border ${pending > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          ₹{pending.toLocaleString("en-IN")}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
        <select value={formData.paymentStatus || "pending"} onChange={e => onChange("paymentStatus", e.target.value)} className={inputCls}>
          {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
};

export default PaymentTracker;