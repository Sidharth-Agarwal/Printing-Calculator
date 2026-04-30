import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { LeadStatusSelector } from "../../Shared/LeadStatusBadge";
import { updateLeadStatus } from "../../../services";
import { createFollowUpTask } from "../../../services/taskService";

const COMM_TYPES = [
  { value: "call",    label: "📞 Call" },
  { value: "email",   label: "✉️ Email" },
  { value: "message", label: "💬 Message" }
];

const customStyles = `
  .react-datepicker { font-size: 0.8rem; width: 200px; }
  .react-datepicker__month-container { width: 200px; }
  .react-datepicker__day,
  .react-datepicker__day-name { width: 1.5rem; line-height: 1.5rem; margin: 0.1rem; }
  .react-datepicker__header { padding-top: 0.5rem; }
  .react-datepicker__current-month { font-size: 0.9rem; }
`;

/**
 * Modal for adding a discussion to a lead.
 * Now includes: communication type, follow-up date (creates a Task on save).
 */
const LeadDiscussionModal = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    discussionDate:    new Date(),
    communicationType: "call",
    discussionSummary: "",
    nextSteps:         ""
  });
  const [followUpDate,      setFollowUpDate]      = useState(null);
  const [newStatus,         setNewStatus]         = useState(lead?.status || "");
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [errors,            setErrors]            = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.discussionDate)    errs.discussionDate    = "Date is required";
    if (!formData.communicationType) errs.communicationType = "Type is required";
    if (!formData.discussionSummary.trim()) errs.discussionSummary = "Summary is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Update status if changed
      if (newStatus && newStatus !== lead.status) {
        await updateLeadStatus(lead.id, newStatus);
      }

      // Submit the discussion (pass communicationType along)
      await onSubmit(lead.id, { ...formData });

      // If a follow-up date was set, create a Task
      if (followUpDate) {
        await createFollowUpTask({
          leadId:     lead.id,
          leadName:   lead.name,
          followUpDate,
        });
      }
    } catch (err) {
      console.error("Error submitting discussion:", err);
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{customStyles}</style>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-base font-semibold">Record Discussion</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-xs text-gray-600">{lead.name}</span>
              <LeadStatusBadge status={lead.status} size="sm" />
              <QualificationBadge badgeId={lead.badgeId} size="sm" />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {/* Update Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Update Lead Status</label>
            <LeadStatusSelector value={newStatus} onChange={setNewStatus} className="w-full" />
            <p className="mt-1 text-xs text-gray-500">
              Current: <span className="font-medium">{lead.status}</span>
            </p>
          </div>

          {/* Communication Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {COMM_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, communicationType: t.value }))}
                  className={`flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                    formData.communicationType === t.value
                      ? "bg-cyan-500 border-cyan-500 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.communicationType && <p className="mt-1 text-xs text-red-500">{errors.communicationType}</p>}
          </div>

          {/* Discussion Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.discussionDate}
              onChange={d => setFormData(prev => ({ ...prev, discussionDate: d }))}
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className={`border rounded-md p-2 w-full text-sm ${errors.discussionDate ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.discussionDate && <p className="mt-1 text-xs text-red-500">{errors.discussionDate}</p>}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="discussionSummary"
              value={formData.discussionSummary}
              onChange={handleChange}
              rows={3}
              placeholder="What was discussed..."
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.discussionSummary ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.discussionSummary && <p className="mt-1 text-xs text-red-500">{errors.discussionSummary}</p>}
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Next Steps</label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              rows={2}
              placeholder="Actions to take..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Follow-up Date
              <span className="ml-1 text-gray-400 font-normal">(creates a task)</span>
            </label>
            <DatePicker
              selected={followUpDate}
              onChange={setFollowUpDate}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pick a follow-up date..."
              isClearable
              className="border border-gray-300 rounded-md p-2 w-full text-sm"
            />
            {followUpDate && (
              <p className="mt-1 text-xs text-cyan-600">
                ✓ A follow-up task will be created for {followUpDate.toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md text-xs">{errors.submit}</div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <CRMActionButton type="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </CRMActionButton>
            <CRMActionButton type="primary" size="sm" isLoading={isSubmitting} disabled={isSubmitting} submit>
              Save Discussion
            </CRMActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadDiscussionModal;