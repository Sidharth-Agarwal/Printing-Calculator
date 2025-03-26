import React, { useState, useEffect } from "react";
import { NumberInput, TextInput, SelectInput } from "../../shared/FormFields";
import Button from "../../shared/Button";
import CollapsibleSection from "../../shared/CollapsibleSection";

const OverheadConfig = ({ configuration, onSave, saving }) => {
  const [formData, setFormData] = useState({
    parameters: {
      overheadPercentage: 35,
      laborRates: {
        operator: 250,   // per hour
        helper: 150,     // per hour
        designer: 500,   // per hour
        manager: 600     // per hour
      },
      machineRates: {
        letterpress: 1500,  // per hour
        foilStamping: 2000, // per hour
        embossing: 1800,    // per hour
        diecutting: 1200,   // per hour
        digital: 1000       // per hour
      },
      utilityRates: {
        electricity: 10,     // per unit
        water: 500,          // per month
        rent: 50000,         // per month
        internet: 2000       // per month
      },
      transportRates: {
        localDelivery: 300,  // base rate
        outstation: 1500,    // base rate
        expressDelivery: 800 // additional charge
      }
    },
    effectiveFrom: new Date(),
    effectiveTo: null
  });

  // Machine types
  const machineTypes = [
    { value: "letterpress", label: "Letterpress Machine" },
    { value: "foilStamping", label: "Foil Stamping Machine" },
    { value: "embossing", label: "Embossing Machine" },
    { value: "diecutting", label: "Die Cutting Machine" },
    { value: "digital", label: "Digital Printer" }
  ];

  // Labor roles
  const laborRoles = [
    { value: "operator", label: "Machine Operator" },
    { value: "helper", label: "Helper/Assistant" },
    { value: "designer", label: "Designer" },
    { value: "manager", label: "Production Manager" }
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
        Configure overhead costs including labor rates, machine running costs, and utility expenses. These values will be used in cost calculations for estimates.
      </p>
      
      <CollapsibleSection title="General Overhead" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <NumberInput
            label="Overall Overhead Percentage (%)"
            name="overheadPercentage"
            value={formData.parameters.overheadPercentage}
            onChange={handleChange}
            min={0}
            max={100}
            step={0.5}
            required
          />
        </div>
        <p className="text-xs text-gray-500 italic p-4 pt-0">
          This is the general overhead percentage applied to all jobs. Specific overhead costs are calculated separately.
        </p>
      </CollapsibleSection>
      
      <CollapsibleSection title="Labor Rates (per hour)" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {laborRoles.map((role) => (
            <NumberInput
              key={role.value}
              label={`${role.label} Rate (INR/hour)`}
              name={`laborRates.${role.value}`}
              value={formData.parameters.laborRates[role.value]}
              onChange={handleChange}
              min={0}
              step={10}
              required
            />
          ))}
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Machine Running Costs (per hour)" initiallyExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {machineTypes.map((machine) => (
            <NumberInput
              key={machine.value}
              label={`${machine.label} Rate (INR/hour)`}
              name={`machineRates.${machine.value}`}
              value={formData.parameters.machineRates[machine.value]}
              onChange={handleChange}
              min={0}
              step={50}
              required
            />
          ))}
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Utility Expenses" initiallyExpanded={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <NumberInput
            label="Electricity Rate (INR/unit)"
            name="utilityRates.electricity"
            value={formData.parameters.utilityRates.electricity}
            onChange={handleChange}
            min={0}
            step={0.5}
            required
          />
          
          <NumberInput
            label="Water (INR/month)"
            name="utilityRates.water"
            value={formData.parameters.utilityRates.water}
            onChange={handleChange}
            min={0}
            step={100}
            required
          />
          
          <NumberInput
            label="Rent (INR/month)"
            name="utilityRates.rent"
            value={formData.parameters.utilityRates.rent}
            onChange={handleChange}
            min={0}
            step={1000}
            required
          />
          
          <NumberInput
            label="Internet (INR/month)"
            name="utilityRates.internet"
            value={formData.parameters.utilityRates.internet}
            onChange={handleChange}
            min={0}
            step={100}
            required
          />
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Transport & Delivery Costs" initiallyExpanded={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <NumberInput
            label="Local Delivery Base Rate (INR)"
            name="transportRates.localDelivery"
            value={formData.parameters.transportRates.localDelivery}
            onChange={handleChange}
            min={0}
            step={50}
            required
          />
          
          <NumberInput
            label="Outstation Delivery Base Rate (INR)"
            name="transportRates.outstation"
            value={formData.parameters.transportRates.outstation}
            onChange={handleChange}
            min={0}
            step={100}
            required
          />
          
          <NumberInput
            label="Express Delivery Additional Charge (INR)"
            name="transportRates.expressDelivery"
            value={formData.parameters.transportRates.expressDelivery}
            onChange={handleChange}
            min={0}
            step={100}
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
          {saving ? "Saving..." : "Save Overhead Configuration"}
        </Button>
      </div>
    </form>
  );
};

export default OverheadConfig;