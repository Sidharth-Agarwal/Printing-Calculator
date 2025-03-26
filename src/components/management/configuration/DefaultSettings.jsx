import React, { useState, useEffect } from "react";
import { NumberInput, TextInput, SelectInput } from "../../shared/FormFields";
import Button from "../../shared/Button";
import CollapsibleSection from "../../shared/CollapsibleSection";

const DefaultSettings = ({ configuration, onSave, saving }) => {
  const [formData, setFormData] = useState({
    parameters: {
      defaultMarkupPercentage: 15,
      miscChargePerCard: 5,
      defaultPaymentTerms: "30 days",
      defaultCurrency: "INR",
      defaultUnitSystem: "metric",
      defaultTaxRate: 18,
      defaultSLA: {
        quotation: 24, // hours
        production: 72, // hours
        delivery: 120 // hours
      }
    },
    effectiveFrom: new Date(),
    effectiveTo: null
  });
  
  // Currency options
  const currencyOptions = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" }
  ];
  
  // Unit system options
  const unitSystemOptions = [
    { value: "metric", label: "Metric (cm, mm)" },
    { value: "imperial", label: "Imperial (in, ft)" }
  ];
  
  // Payment term options
  const paymentTermOptions = [
    { value: "immediate", label: "Immediate Payment" },
    { value: "7 days", label: "7 Days" },
    { value: "15 days", label: "15 Days" },
    { value: "30 days", label: "30 Days" },
    { value: "45 days", label: "45 Days" },
    { value: "60 days", label: "60 Days" },
    { value: "custom", label: "Custom" }
  ];

  // Update form when configuration changes
  useEffect(() => {
    if (configuration) {
      setFormData({
        parameters: {
          ...formData.parameters,
          ...configuration.parameters
        },
        effectiveFrom: configuration.effectiveFrom || new Date(),
        effectiveTo: configuration.effectiveTo || null
      });
    }
  }, [configuration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [parent]: {
            ...prev.parameters[parent],
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-gray-600 mb-4">
        Configure default settings for estimates, orders, and system-wide preferences.
      </p>
      
      <CollapsibleSection title="Pricing Defaults" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <NumberInput
            label="Default Markup Percentage (%)"
            name="defaultMarkupPercentage"
            value={formData.parameters.defaultMarkupPercentage}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
            required
          />
          
          <NumberInput
            label="Miscellaneous Charge per Card (INR)"
            name="miscChargePerCard"
            value={formData.parameters.miscChargePerCard}
            onChange={handleChange}
            min={0}
            step={0.5}
            required
          />
          
          <NumberInput
            label="Default Tax Rate (%)"
            name="defaultTaxRate"
            value={formData.parameters.defaultTaxRate}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.1}
            required
          />
          
          <SelectInput
            label="Default Currency"
            name="defaultCurrency"
            value={formData.parameters.defaultCurrency}
            onChange={handleChange}
            options={currencyOptions}
            required
          />
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="System Preferences" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <SelectInput
            label="Default Unit System"
            name="defaultUnitSystem"
            value={formData.parameters.defaultUnitSystem}
            onChange={handleChange}
            options={unitSystemOptions}
            required
          />
          
          <SelectInput
            label="Default Payment Terms"
            name="defaultPaymentTerms"
            value={formData.parameters.defaultPaymentTerms}
            onChange={handleChange}
            options={paymentTermOptions}
            required
          />
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Service Level Agreements (SLA)" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <NumberInput
            label="Quotation SLA (hours)"
            name="defaultSLA.quotation"
            value={formData.parameters.defaultSLA?.quotation || 24}
            onChange={handleChange}
            min={1}
            required
          />
          
          <NumberInput
            label="Production SLA (hours)"
            name="defaultSLA.production"
            value={formData.parameters.defaultSLA?.production || 72}
            onChange={handleChange}
            min={1}
            required
          />
          
          <NumberInput
            label="Delivery SLA (hours)"
            name="defaultSLA.delivery"
            value={formData.parameters.defaultSLA?.delivery || 120}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
      </CollapsibleSection>
      
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Default Settings"}
        </Button>
      </div>
    </form>
  );
};

export default DefaultSettings;