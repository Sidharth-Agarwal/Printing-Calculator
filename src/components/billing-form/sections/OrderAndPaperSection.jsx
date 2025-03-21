// OrderAndPaperSection.jsx
import React, { useState, useEffect } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import useFirebase from "../../../hooks/useFirebase";
import { JOB_TYPE_OPTIONS, PAPER_PROVIDED_OPTIONS } from "../../../constants/dropdownOptions";
import { formatDimensions } from "../../../utils/formatters";

import FormField from "../../common/FormField";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";
import DieSelectionPopup from "../popups/DieSelectionPopup";
import AddDieFormForPopup from "../popups/AddDieFormForPopup";

const OrderAndPaperSection = () => {
  const { state } = useBillingForm();
  const { data, errors, updateField, updateNestedField, validate } = useFormState("orderAndPaper");
  const { items: papers, isLoading } = useFirebase("papers");
  
  const [showDiePopup, setShowDiePopup] = useState(false);
  const [showAddDiePopup, setShowAddDiePopup] = useState(false);

  // Validate required fields on blur
  const validateField = (name, rules = ["required"]) => {
    validate({ [name]: rules });
  };

  // Set first paper as default if none selected
  useEffect(() => {
    if (papers.length > 0 && !data.paperName) {
      updateField("paperName", papers[0].paperName);
    }
  }, [papers, data.paperName, updateField]);

  // Handle date changes
  const handleDateChange = (field, date) => {
    updateField(field, date);
  };

  // Handle die selection
  const handleDieSelect = (die) => {
    updateField("dieSelection", die.dieName || "");
    updateField("dieCode", die.dieCode || "");
    updateField("dieSize", { 
      length: die.dieSizeL || "", 
      breadth: die.dieSizeB || "" 
    });
    updateField("image", die.imageUrl || "");
    setShowDiePopup(false);
  };

  // Handle add die success
  const handleAddDieSuccess = (newDie) => {
    handleDieSelect(newDie);
    setShowAddDiePopup(false);
  };

  return (
    <div className="space-y-4">
      {/* Client and Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="Client Name" 
          name="clientName" 
          required={true}
          error={errors.clientName}
        >
          <input
            id="clientName"
            name="clientName"
            type="text"
            placeholder="Enter the client name"
            value={data.clientName || ""}
            onChange={(e) => updateField("clientName", e.target.value)}
            onBlur={() => validateField("clientName")}
            className="border rounded-md p-2 w-full text-xs"
            required
          />
        </FormField>

        <FormField 
          label="Project Name" 
          name="projectName" 
          required={true}
          error={errors.projectName}
        >
          <input
            id="projectName"
            name="projectName"
            type="text"
            placeholder="Enter the project name"
            value={data.projectName || ""}
            onChange={(e) => updateField("projectName", e.target.value)}
            onBlur={() => validateField("projectName")}
            className="border rounded-md p-2 w-full text-xs"
            required
          />
        </FormField>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="Date" 
          name="date" 
          required={true}
          error={errors.date}
        >
          <DateField
            id="date"
            selected={data.date}
            onChange={(date) => handleDateChange("date", date)}
            required
          />
        </FormField>

        <FormField 
          label="Estimated Delivery Date" 
          name="deliveryDate" 
          required={true}
          error={errors.deliveryDate}
        >
          <DateField
            id="deliveryDate"
            selected={data.deliveryDate}
            onChange={(date) => handleDateChange("deliveryDate", date)}
            required
          />
        </FormField>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField 
          label="Job Type" 
          name="jobType" 
          required={true}
          error={errors.jobType}
        >
          <SelectField
            id="jobType"
            name="jobType"
            value={data.jobType}
            onChange={(e) => updateField("jobType", e.target.value)}
            options={JOB_TYPE_OPTIONS}
            required
          />
        </FormField>

        <FormField 
          label="Quantity" 
          name="quantity" 
          required={true}
          error={errors.quantity}
        >
          <NumberField
            id="quantity"
            name="quantity"
            value={data.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            placeholder="Enter the required quantity"
            min="1"
            required
          />
        </FormField>

        <FormField 
          label="Paper Provided" 
          name="paperProvided" 
          required={true}
          error={errors.paperProvided}
        >
          <SelectField
            id="paperProvided"
            name="paperProvided"
            value={data.paperProvided}
            onChange={(e) => updateField("paperProvided", e.target.value)}
            options={PAPER_PROVIDED_OPTIONS}
            required
          />
        </FormField>
      </div>

      {/* Paper and Die Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField 
          label="Paper Name" 
          name="paperName" 
          required={true}
          error={errors.paperName}
        >
          <SelectField
            id="paperName"
            name="paperName"
            value={data.paperName}
            onChange={(e) => updateField("paperName", e.target.value)}
            options={papers.map(paper => paper.paperName)}
            placeholder={isLoading ? "Loading papers..." : "Select paper"}
            disabled={isLoading}
            required
          />
        </FormField>

        <FormField 
          label="Die Selection" 
          name="dieSelection" 
          error={errors.dieSelection}
        >
          <button
            id="dieSelection"
            type="button"
            onClick={() => setShowDiePopup(true)}
            className="border rounded-md p-2 bg-gray-100 w-full text-xs text-left"
          >
            {data.dieSelection || "Select Die"}
          </button>
        </FormField>

        <FormField 
          label="Die Code" 
          name="dieCode" 
          error={errors.dieCode}
        >
          <input
            id="dieCode"
            type="text"
            name="dieCode"
            value={data.dieCode || ""}
            readOnly
            className="border rounded-md p-2 w-full bg-gray-200 text-xs"
          />
        </FormField>
      </div>

      {/* Die Size and Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="Die Size (L × B)" 
          name="dieSize" 
          error={errors.dieSize}
        >
          <input
            id="dieSize"
            type="text"
            value={formatDimensions(data.dieSize, "in")}
            readOnly
            className="border rounded-md p-2 w-full bg-gray-200 text-xs"
          />
        </FormField>

        {data.image && (
          <div>
            <label htmlFor="image" className="block mb-1 text-sm font-medium text-gray-700">
              Die Image
            </label>
            <img
              id="image"
              src={data.image}
              alt="Die"
              className="w-20 h-20 object-contain border"
            />
          </div>
        )}
      </div>

      {/* Die Selection Popup */}
      {showDiePopup && (
        <DieSelectionPopup
          onClose={() => setShowDiePopup(false)}
          onSelectDie={handleDieSelect}
          onAddNewDie={() => {
            setShowDiePopup(false);
            setShowAddDiePopup(true);
          }}
        />
      )}

      {/* Add Die Popup */}
      {showAddDiePopup && (
        <AddDieFormForPopup
          onAddDie={handleAddDieSuccess}
          onClose={() => setShowAddDiePopup(false)}
        />
      )}
    </div>
  );
};

export default OrderAndPaperSection;