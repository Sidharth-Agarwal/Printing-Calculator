import React, { useState, useEffect } from "react";
import { TextInput, NumberInput, SelectInput } from "../../shared/FormFields";
import Button from "../../shared/Button";

const AddRateForm = ({ onSubmit, selectedRate, onUpdate, setSelectedRate, existingGroups = [] }) => {
  const initialFormState = {
    group: "",
    type: "",
    concatenate: "",
    finalRate: "",
    description: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isNewGroup, setIsNewGroup] = useState(false);

  // Populate form when selectedRate changes
  useEffect(() => {
    if (selectedRate) {
      setFormData(selectedRate);
      setIsNewGroup(false);
    } else {
      setFormData(initialFormState);
    }
  }, [selectedRate]);

  // Generate concatenate when group or type changes
  useEffect(() => {
    if (formData.group && formData.type) {
      const concatenate = `${formData.group} ${formData.type}`.trim();
      setFormData(prev => ({
        ...prev,
        concatenate
      }));
    }
  }, [formData.group, formData.type]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.group.trim()) newErrors.group = "Group is required";
    if (!formData.type.trim()) newErrors.type = "Type is required";
    if (!formData.finalRate) newErrors.finalRate = "Rate is required";
    
    // Check for duplicate concatenate
    if (!selectedRate && formData.concatenate) {
      const existingRate = existingGroups.some(
        group => `${group} ${formData.type}`.trim().toLowerCase() === formData.concatenate.toLowerCase()
      );
      if (existingRate) {
        newErrors.type = "This type already exists in the selected group";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleNewGroup = () => {
    setIsNewGroup(!isNewGroup);
    if (!isNewGroup) {
      setFormData(prev => ({ ...prev, group: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const rateData = {
      ...formData,
      finalRate: parseFloat(formData.finalRate)
    };

    if (selectedRate) {
      onUpdate(selectedRate.id, rateData);
    } else {
      onSubmit(rateData);
      setFormData(initialFormState);
    }
  };

  const handleCancel = () => {
    setSelectedRate(null);
    setFormData(initialFormState);
    setErrors({});
    setIsNewGroup(false);
  };

  // Prepare group options for select input
  const groupOptions = existingGroups.map(group => ({ value: group, label: group }));

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Group Selection/Creation */}
        <div className="md:col-span-4">
          <div className="flex items-center mb-4">
            <h3 className="text-md font-medium text-gray-700 mr-4">Rate Group</h3>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={toggleNewGroup}
            >
              {isNewGroup ? "Select Existing Group" : "Create New Group"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isNewGroup || existingGroups.length === 0 ? (
              <TextInput
                label="New Group Name"
                name="group"
                value={formData.group}
                onChange={handleChange}
                placeholder="Enter new group name"
                error={errors.group}
                required
              />
            ) : (
              <SelectInput
                label="Group"
                name="group"
                value={formData.group}
                onChange={handleChange}
                options={groupOptions}
                placeholder="Select a group"
                error={errors.group}
                required
              />
            )}
            
            <TextInput
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Enter type"
              error={errors.type}
              required
            />
            
            <TextInput
              label="Concatenate"
              name="concatenate"
              value={formData.concatenate}
              readOnly
              className="bg-gray-50"
            />
            
            <NumberInput
              label="Final Rate (INR)"
              name="finalRate"
              value={formData.finalRate}
              onChange={handleChange}
              placeholder="Enter rate"
              error={errors.finalRate}
              min={0}
              step={0.01}
              required
            />
          </div>
        </div>
        
        {/* Description */}
        <div className="md:col-span-4">
          <TextInput
            label="Description (Optional)"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Enter description or details about this rate"
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        {selectedRate && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
        >
          {selectedRate ? "Save Changes" : "Add Rate"}
        </Button>
      </div>
    </form>
  );
};

export default AddRateForm;