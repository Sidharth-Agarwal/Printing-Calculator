import React, { useState, useEffect } from "react";
import CRMActionButton from "../../Shared/CRMActionButton";
import Modal from "../../Shared/Modal";

/**
 * Form for creating and editing qualification badges in a modal
 * @param {Object} props - Component props
 * @param {Object} props.badge - Badge to edit (null for new badge)
 * @param {function} props.onSubmit - Submit handler
 * @param {function} props.onCancel - Cancel handler
 * @param {boolean} props.isSubmitting - Form submission state
 * @param {boolean} props.isOpen - Controls if the modal is open
 */
const BadgeForm = ({ 
  badge = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  isOpen = false
}) => {
  // Default form values
  const defaultFormData = {
    name: "",
    color: "#6366F1", // Default indigo color
    description: "",
    priority: 1
  };
  
  // Form state
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  
  // Color presets
  const colorPresets = [
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Green
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#000000", // Black
    "#71717A"  // Gray
  ];
  
  // Set form data when badge changes
  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name || "",
        color: badge.color || "#6366F1",
        description: badge.description || "",
        priority: badge.priority || 1
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [badge]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
    
    // Clear error for color if exists
    if (errors.color) {
      setErrors(prev => ({
        ...prev,
        color: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Badge name is required";
    }
    
    if (!formData.color.trim()) {
      newErrors.color = "Badge color is required";
    } else if (!/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = "Please enter a valid hex color code (e.g., #FF0000)";
    }
    
    if (formData.priority < 1) {
      newErrors.priority = "Priority must be at least 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={badge ? "Edit Badge" : "Add New Badge"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Badge Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Hot Lead, VIP Client, High Value"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Badge Color <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center mt-1">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="h-8 w-8 p-0 border-0 rounded"
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="#RRGGBB"
              className={`ml-2 flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.color ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select a color or enter a hex code
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {colorPresets.map((color) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full cursor-pointer shadow-sm hover:shadow transition-shadow"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              ></div>
            ))}
          </div>
          {errors.color && (
            <p className="mt-1 text-xs text-red-500">{errors.color}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Describe when this badge should be used"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <input
            type="number"
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            min="1"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers appear first in lists
          </p>
          {errors.priority && (
            <p className="mt-1 text-xs text-red-500">{errors.priority}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <CRMActionButton 
            type="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </CRMActionButton>
          <CRMActionButton 
            type="primary" 
            isLoading={isSubmitting}
            disabled={isSubmitting}
            submit={true}
          >
            {badge ? "Update Badge" : "Create Badge"}
          </CRMActionButton>
        </div>
      </form>
    </Modal>
  );
};

export default BadgeForm;