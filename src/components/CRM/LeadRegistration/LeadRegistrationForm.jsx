import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LEAD_FIELDS } from "../../../constants/leadFields";
import LeadSourceSelector from "../../Shared/LeadSourceSelector";
import { LeadStatusSelector } from "../../Shared/LeadStatusBadge";
import { QualificationBadgeSelector } from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useCRM } from "../../../context/CRMContext";

const LeadRegistrationForm = ({ lead = null, onSubmit, onCancel, isSubmitting = false }) => {
  const { qualificationBadges } = useCRM();

  const getDefault = () => ({
    name: "", company: "", email: "", phone: "",
    source: "", status: "newLead", badgeId: "",
    jobType: "", budget: "", urgency: "", notes: "",
    weddingDate: null,
    birthdayDate: null,
    address: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" }
  });

  const [formData, setFormData] = useState(getDefault());
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (lead) {
      // Convert Firestore timestamps / strings to Date for datepicker
      const toDate = (v) => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (v?.toDate) return v.toDate();
        if (v?.seconds) return new Date(v.seconds * 1000);
        return new Date(v);
      };
      setFormData({
        name:        lead.name        || "",
        company:     lead.company     || "",
        email:       lead.email       || "",
        phone:       lead.phone       || "",
        source:      lead.source      || "",
        status:      lead.status      || "newLead",
        badgeId:     lead.badgeId     || "",
        jobType:     lead.jobType     || "",
        budget:      lead.budget      || "",
        urgency:     lead.urgency     || "",
        notes:       lead.notes       || "",
        weddingDate: toDate(lead.weddingDate),
        birthdayDate:toDate(lead.birthdayDate),
        address:     lead.address || getDefault().address
      });
    } else {
      setFormData(getDefault());
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim())   errs.name   = "Name is required";
    if (!formData.phone?.trim())  errs.phone  = "Phone is required";
    if (!formData.source)         errs.source = "Source is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const Field = ({ label, required, error, children }) => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none text-sm ${err ? "border-red-500" : "border-gray-300"} ${isSubmitting ? "bg-gray-100" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="bg-white">

      {/* ── Basic Information ── */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <Field label="Lead Name" required error={errors.name}>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Enter lead name" disabled={isSubmitting} className={inputCls(errors.name)} />
          </Field>

          <Field label="Company Name" error={errors.company}>
            <input type="text" name="company" value={formData.company} onChange={handleChange}
              placeholder="Company (if applicable)" disabled={isSubmitting} className={inputCls()} />
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email address" disabled={isSubmitting} className={inputCls(errors.email)} />
          </Field>

          <Field label="Phone" required error={errors.phone}>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Phone number" disabled={isSubmitting} className={inputCls(errors.phone)} />
          </Field>

          <Field label="Lead Source" required error={errors.source}>
            <LeadSourceSelector value={formData.source}
              onChange={v => setFormData(prev => ({ ...prev, source: v }))}
              required disabled={isSubmitting} />
          </Field>

          <Field label="Lead Status" required error={errors.status}>
            <LeadStatusSelector value={formData.status}
              onChange={v => setFormData(prev => ({ ...prev, status: v }))}
              required disabled={isSubmitting} />
          </Field>

          <Field label="Qualification Badge">
            <QualificationBadgeSelector value={formData.badgeId}
              onChange={v => setFormData(prev => ({ ...prev, badgeId: v }))}
              disabled={isSubmitting} />
          </Field>

          <Field label="Job Type">
            <select name="jobType" value={formData.jobType} onChange={handleChange}
              disabled={isSubmitting} className={inputCls()}>
              <option value="">Select Job Type</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "jobType")?.options?.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Budget Range">
            <select name="budget" value={formData.budget} onChange={handleChange}
              disabled={isSubmitting} className={inputCls()}>
              <option value="">Select Budget</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "budget")?.options?.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Urgency">
            <select name="urgency" value={formData.urgency} onChange={handleChange}
              disabled={isSubmitting} className={inputCls()}>
              <option value="">Select Urgency</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "urgency")?.options?.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Important Dates (NEW) ── */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Important Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <Field label="Wedding Date">
            <DatePicker
              selected={formData.weddingDate}
              onChange={d => setFormData(prev => ({ ...prev, weddingDate: d }))}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pick wedding date"
              isClearable
              disabled={isSubmitting}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
            />
          </Field>

          <Field label="Birthday">
            <DatePicker
              selected={formData.birthdayDate}
              onChange={d => setFormData(prev => ({ ...prev, birthdayDate: d }))}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pick birthday"
              isClearable
              disabled={isSubmitting}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
            />
          </Field>
        </div>
      </div>

      {/* ── Contact / Address ── */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: "address.line1",      label: "Address Line 1", placeholder: "Street address" },
            { name: "address.line2",      label: "Address Line 2", placeholder: "Apt, suite, etc." },
            { name: "address.city",       label: "City",           placeholder: "City" },
            { name: "address.state",      label: "State",          placeholder: "State" },
            { name: "address.postalCode", label: "Postal Code",    placeholder: "Postal code" },
            { name: "address.country",    label: "Country",        placeholder: "Country" }
          ].map(f => (
            <Field key={f.name} label={f.label}>
              <input type="text" name={f.name}
                value={f.name.includes(".") ? formData.address?.[f.name.split(".")[1]] : formData[f.name]}
                onChange={handleChange} placeholder={f.placeholder}
                disabled={isSubmitting} className={inputCls()} />
            </Field>
          ))}
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Additional Notes</h3>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
          placeholder="Any additional notes" disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm" />
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
        <CRMActionButton type="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</CRMActionButton>
        <CRMActionButton type="primary" isLoading={isSubmitting} disabled={isSubmitting} submit>
          {lead ? "Update Lead" : "Create Lead"}
        </CRMActionButton>
      </div>
    </form>
  );
};

export default LeadRegistrationForm;