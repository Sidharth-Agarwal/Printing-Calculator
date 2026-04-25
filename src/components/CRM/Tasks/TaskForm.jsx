import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TASK_TYPES } from "../../../services/taskService";
import CRMActionButton from "../../Shared/CRMActionButton";

const DEFAULT = {
  title: "", type: "custom", dueDate: null, notes: ""
};

const TaskForm = ({ task = null, onSubmit, onCancel, isSubmitting = false }) => {
  const [form,   setForm]   = useState(DEFAULT);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      const toDate = (v) => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (v?.toDate) return v.toDate();
        if (v?.seconds) return new Date(v.seconds * 1000);
        return new Date(v);
      };
      setForm({ ...DEFAULT, ...task, dueDate: toDate(task.dueDate) });
    } else {
      setForm(DEFAULT);
    }
  }, [task]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title   = "Title is required";
    if (!form.dueDate)       e.dueDate = "Due date is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev) => { ev.preventDefault(); if (validate()) onSubmit(form); };

  const inputCls = (err) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 ${err ? "border-red-500" : "border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="What needs to be done?" className={inputCls(errors.title)} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Type + Due date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls()}>
            {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <DatePicker selected={form.dueDate} onChange={d => set("dueDate", d)}
            dateFormat="dd/MM/yyyy" placeholderText="Pick a date" isClearable
            className={`border rounded-md px-3 py-2 w-full text-sm focus:outline-none ${errors.dueDate ? "border-red-500" : "border-gray-300"}`} />
          {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
          placeholder="Any additional context..." className={inputCls()} />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <CRMActionButton type="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</CRMActionButton>
        <CRMActionButton type="primary" submit isLoading={isSubmitting} disabled={isSubmitting}>
          {task ? "Update Task" : "Create Task"}
        </CRMActionButton>
      </div>
    </form>
  );
};

export default TaskForm;