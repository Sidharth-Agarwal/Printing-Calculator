import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { JOB_TYPES, ORDER_STATUSES, PAYMENT_STATUSES } from "../../../services/jobTicketService";
import PaymentTracker from "./PaymentTracker";
import CRMActionButton from "../../Shared/CRMActionButton";

const DEFAULT = {
  jobType: "", orderStatus: "design", deadline: null,
  finalBilled: 0, advancePaid: 0, courierCharges: 0,
  paymentStatus: "pending", notes: ""
};

const JobTicketForm = ({ ticket = null, onSubmit, onCancel, isSubmitting = false }) => {
  const [form,   setForm]   = useState(DEFAULT);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ticket) {
      const toDate = (v) => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (v?.toDate) return v.toDate();
        if (v?.seconds) return new Date(v.seconds * 1000);
        return new Date(v);
      };
      setForm({ ...DEFAULT, ...ticket, deadline: toDate(ticket.deadline) });
    } else {
      setForm(DEFAULT);
    }
  }, [ticket]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.jobType) e.jobType = "Job type is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev) => { ev.preventDefault(); if (validate()) onSubmit(form); };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Row 1 — job type + status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
          <select value={form.jobType} onChange={e => set("jobType", e.target.value)}
            className={`${inputCls} ${errors.jobType ? "border-red-500" : ""}`}>
            <option value="">Select job type</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.jobType && <p className="mt-1 text-xs text-red-500">{errors.jobType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
          <select value={form.orderStatus} onChange={e => set("orderStatus", e.target.value)} className={inputCls}>
            {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2 — deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <DatePicker selected={form.deadline} onChange={d => set("deadline", d)}
          dateFormat="dd/MM/yyyy" placeholderText="Pick a deadline" isClearable
          className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm" />
      </div>

      {/* Row 3 — payment fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
        <PaymentTracker formData={form} onChange={set} />
      </div>

      {/* Row 4 — notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
          placeholder="Any notes for this order..." className={inputCls} />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <CRMActionButton type="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</CRMActionButton>
        <CRMActionButton type="primary" submit isLoading={isSubmitting} disabled={isSubmitting}>
          {ticket ? "Update Ticket" : "Create Ticket"}
        </CRMActionButton>
      </div>
    </form>
  );
};

export default JobTicketForm;