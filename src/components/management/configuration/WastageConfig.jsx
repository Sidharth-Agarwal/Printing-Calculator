import React, { useState, useEffect } from "react";
import { NumberInput, SelectInput } from "../../shared/FormFields";
import Button from "../../shared/Button";
import CollapsibleSection from "../../shared/CollapsibleSection";

const WastageConfig = ({ configuration, onSave, saving }) => {
  const [formData, setFormData] = useState({
    parameters: {
      wastagePercentage: 5,
      paperWastage: {
        default: 10,
        specialPaper: 15,
        textured: 12,
        metallic: 20
      },
      setupWastage: {
        letterpress: 15,
        foilStamping: 20,
        embossing: 12,
        diecutting: 8
      },
      jobTypeWastage: {
        card: 8,
        envelope: 12,
        bizCard: 5,
        folder: 15,
        box: 20
      },
      quantityBasedWastage: {
        small: 15, // < 500 units
        medium: 10, // 500-2000 units
        large: 5    // > 2000 units
      }
    },
    effectiveFrom: new Date(),
    effectiveTo: null
  });

  // Paper type options for selecting specific wastage
  const paperTypeOptions = [
    { value: "default", label: "Standard Paper" },
    { value: "specialPaper", label: "Special Paper" },
    { value: "textured", label: "Textured Paper" },
    { value: "metallic", label: "Metallic Paper" }
  ];

  // Process type options
  const processTypeOptions = [
    { value: "letterpress", label: "Letterpress" },
    { value: "foilStamping", label: "Foil Stamping" },
    { value: "embossing", label: "Embossing" },
    { value: "diecutting", label: "Die Cutting" }
  ];

  // Job type options
  const jobTypeOptions = [
    { value: "card", label: "Card" },
    { value: "envelope", label: "Envelope" },
    { value: "bizCard", label: "Business Card" },
    { value: "folder", label: "Folder" },
    { value: "box", label: "Box" }
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
            [child]: parseFloat(value)
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [name]: parseFloat(value)
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
        Configure wastage percentages for different materials, processes, and job types. These values will be used in cost calculations for estimates.
      </p>
      
      <CollapsibleSection title="General Wastage" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <NumberInput
            label="Default Wastage Percentage (%)"
            name="wastagePercentage"
            value={formData.parameters.wastagePercentage}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
            required
          />
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Paper Wastage by Type" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {paperTypeOptions.map((option) => (
            <NumberInput
              key={option.value}
              label={`${option.label} Wastage (%)`}
              name={`paperWastage.${option.value}`}
              value={formData.parameters.paperWastage[option.value]}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.5}
              required
            />
          ))}
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Setup Wastage by Process" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {processTypeOptions.map((option) => (
            <NumberInput
              key={option.value}
              label={`${option.label} Setup Wastage (%)`}
              name={`setupWastage.${option.value}`}
              value={formData.parameters.setupWastage[option.value]}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.5}
              required
            />
          ))}
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Wastage by Job Type" initiallyExpanded={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {jobTypeOptions.map((option) => (
            <NumberInput
              key={option.value}
              label={`${option.label} Wastage (%)`}
              name={`jobTypeWastage.${option.value}`}
              value={formData.parameters.jobTypeWastage[option.value]}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.5}
              required
            />
          ))}
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Quantity-Based Wastage" initiallyExpanded={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <NumberInput
            label="Small Batch Wastage (<500 units) (%)"
            name="quantityBasedWastage.small"
            value={formData.parameters.quantityBasedWastage.small}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
            required
          />
          
          <NumberInput
            label="Medium Batch Wastage (500-2000 units) (%)"
            name="quantityBasedWastage.medium"
            value={formData.parameters.quantityBasedWastage.medium}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
            required
          />
          
          <NumberInput
            label="Large Batch Wastage (>2000 units) (%)"
            name="quantityBasedWastage.large"
            value={formData.parameters.quantityBasedWastage.large}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
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
          {saving ? "Saving..." : "Save Wastage Configuration"}
        </Button>
      </div>
    </form>
  );
};

export default WastageConfig;