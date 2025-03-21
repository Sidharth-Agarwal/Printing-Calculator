// AddDieFormForPopup.jsx
import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDie } from "../../../services/firebase/dies";
import { storage } from "../../../firebaseConfig";
import { DIE_FORM_FIELDS } from "../../../constants/formFields";

import FormField from "../../common/FormField";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";

const AddDieFormForPopup = ({ onAddDie, onClose }) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
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
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Validate numeric fields
    ['productSizeL', 'productSizeB', 'dieSizeL', 'dieSizeB', 'price', 'frags'].forEach(field => {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        newErrors[field] = `${field} must be a number`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if provided
      if (image && storage) {
        const imageRef = ref(storage, `dieImages/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Add the new die to Firestore
      const newDie = { ...formData, imageUrl };
      const addedDie = await addDie(newDie);

      onAddDie(addedDie);
      alert("Die successfully added!");
      onClose();
    } catch (error) {
      console.error("Error adding die:", error);
      alert("Failed to add die. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] max-w-6xl"
      >
        <h2 className="text-lg font-semibold mb-5">ADD NEW DIE</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          {DIE_FORM_FIELDS.map((field) => (
            <FormField 
              key={field.name}
              label={field.label}
              name={field.name}
              error={errors[field.name]}
            >
              {field.type === "select" ? (
                <SelectField
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  options={field.options || []}
                  placeholder={`Select ${field.label}`}
                  required={field.required}
                />
              ) : (
                field.type === "number" ? (
                  <NumberField
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                    className="text-xs p-2 w-full border rounded-md shadow-sm"
                    required={field.required}
                  />
                )
              )}
            </FormField>
          ))}
          <div className="col-span-4">
            <label className="block text-sm font-medium mb-1">Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="mt-1 block w-full" 
            />
            {image || formData.imageUrl ? (
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={image ? URL.createObjectURL(image) : formData.imageUrl}
                  alt="Selected"
                  className="w-16 h-16 object-cover border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Remove Image
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`text-sm px-3 py-2 bg-blue-500 text-white rounded ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDieFormForPopup;