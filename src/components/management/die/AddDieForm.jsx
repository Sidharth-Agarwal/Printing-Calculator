import React, { useEffect, useState } from "react";
import FormField from '../../common/FormField';
import { JOB_TYPE_OPTIONS } from '../../../constants/dropdownOptions';
import { DIE_FORM_FIELDS } from '../../../constants/formFields';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddDieForm = ({ onAddDie, onUpdateDie, editingDie, setEditingDie, storage }) => {
  const [formData, setFormData] = useState({
    jobType: "",
    type: "",
    dieCode: "",
    frags: "",
    productSizeL: "",
    productSizeB: "",
    dieSizeL: "",
    dieSizeB: "",
    price: "",
    imageUrl: "",
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingDie) {
      setFormData(editingDie);
      setImage(null); // Reset the selected image when editing
    } else {
      resetForm();
    }
  }, [editingDie]);

  const resetForm = () => {
    setFormData({
      jobType: "",
      type: "",
      dieCode: "",
      frags: "",
      productSizeL: "",
      productSizeB: "",
      dieSizeL: "",
      dieSizeB: "",
      price: "",
      imageUrl: "",
    });
    setImage(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      
      // Clear error when image is selected
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    // Reset the file input
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    DIE_FORM_FIELDS.forEach(field => {
      if (field.required !== false && !formData[field.name] && field.name !== 'image') {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Additional validations
    if (formData.productSizeL && formData.productSizeB) {
      if (parseFloat(formData.productSizeL) <= 0) {
        newErrors.productSizeL = "Product length must be greater than zero";
      }
      if (parseFloat(formData.productSizeB) <= 0) {
        newErrors.productSizeB = "Product breadth must be greater than zero";
      }
    }
    
    if (formData.dieSizeL && formData.dieSizeB) {
      if (parseFloat(formData.dieSizeL) <= 0) {
        newErrors.dieSizeL = "Die length must be greater than zero";
      }
      if (parseFloat(formData.dieSizeB) <= 0) {
        newErrors.dieSizeB = "Die breadth must be greater than zero";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let imageUrl = formData.imageUrl;

    try {
      if (image && storage) {
        const imageRef = ref(storage, `dieImages/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      if (editingDie) {
        await onUpdateDie(editingDie.id, { ...formData, imageUrl });
      } else {
        await onAddDie({ ...formData, imageUrl });
      }

      resetForm();
      setEditingDie(null);
      alert(editingDie ? "Die successfully updated!" : "Die successfully added!");
    } catch (error) {
      console.error("Error adding/updating die:", error);
      alert("Failed to submit die. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-medium mb-4">{editingDie ? "EDIT DIE" : "ADD NEW DIE"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {DIE_FORM_FIELDS.map((field, idx) => (
          <FormField 
            key={idx}
            label={field.label}
            name={field.name}
            error={errors[field.name]}
            required={field.required !== false}
          >
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="text-md mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                required={field.required !== false}
              >
                <option value="">Select {field.label}</option>
                {field.options === "JOB_TYPE_OPTIONS" 
                  ? JOB_TYPE_OPTIONS.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))
                  : field.options?.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))
                }
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="text-md mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                required={field.required !== false}
                readOnly={field.readOnly}
              />
            )}
          </FormField>
        ))}
        <FormField 
          label="Image" 
          name="image"
          error={errors.image}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="mt-1 block w-full text-sm" 
          />
          {(image || formData.imageUrl) && (
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <img
                src={image ? URL.createObjectURL(image) : formData.imageUrl}
                alt="Selected"
                className="w-16 h-16 object-cover border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-xs"
              >
                Remove Image
              </button>
            </div>
          )}
        </FormField>
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
          {editingDie ? "Save Changes" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default AddDieForm;