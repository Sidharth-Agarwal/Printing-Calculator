import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextInput, SelectInput, NumberInput } from "../../shared/FormFields";
import Button from "../../shared/Button";

const AddDieForm = ({ onAddDie, onUpdateDie, editingDie, setEditingDie, storage }) => {
  const initialFormState = {
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
    inStock: true,
    location: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  
  // Job type options
  const jobTypeOptions = [
    { value: "Card", label: "Card" },
    { value: "Biz Card", label: "Business Card" },
    { value: "Magnet", label: "Magnet" },
    { value: "Envelope", label: "Envelope" },
    { value: "Tag", label: "Tag" },
    { value: "Folder", label: "Folder" },
    { value: "Box", label: "Box" }
  ];

  // Populate form when editingDie changes
  useEffect(() => {
    if (editingDie) {
      setFormData(editingDie);
      setImage(null); // Reset the selected image when editing
    } else {
      setFormData(initialFormState);
      setImage(null);
    }
  }, [editingDie]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobType.trim()) newErrors.jobType = "Job type is required";
    if (!formData.dieCode.trim()) newErrors.dieCode = "Die code is required";
    if (!formData.frags) newErrors.frags = "Number of frags is required";
    if (!formData.productSizeL) newErrors.productSizeL = "Product length is required";
    if (!formData.productSizeB) newErrors.productSizeB = "Product breadth is required";
    if (!formData.dieSizeL) newErrors.dieSizeL = "Die length is required";
    if (!formData.dieSizeB) newErrors.dieSizeB = "Die breadth is required";
    if (!formData.price) newErrors.price = "Price is required";
    
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

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null); // Clear the selected image
    setFormData((prev) => ({ ...prev, imageUrl: "" })); // Remove the image URL from form data

    // Reset the input file field
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = null; // Reset the file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let imageUrl = formData.imageUrl;
    setUploading(true);

    try {
      // Upload image if a new one is selected
      if (image && storage) {
        const imageRef = ref(storage, `dieImages/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const dieData = {
        ...formData,
        imageUrl,
        frags: Number(formData.frags),
        productSizeL: Number(formData.productSizeL),
        productSizeB: Number(formData.productSizeB),
        dieSizeL: Number(formData.dieSizeL),
        dieSizeB: Number(formData.dieSizeB),
        price: Number(formData.price)
      };

      if (editingDie) {
        await onUpdateDie(editingDie.id, dieData);
      } else {
        await onAddDie(dieData);
        setFormData(initialFormState);
        setImage(null);
      }
      
      setUploading(false);
    } catch (error) {
      console.error("Error adding/updating die:", error);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditingDie(null);
    setFormData(initialFormState);
    setImage(null);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Die Details Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Die Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput
              label="Job Type"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              options={jobTypeOptions}
              placeholder="Select job type"
              error={errors.jobType}
              required
            />
            
            <TextInput
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Enter die type"
              error={errors.type}
            />
            
            <TextInput
              label="Die Code"
              name="dieCode"
              value={formData.dieCode}
              onChange={handleChange}
              placeholder="Enter die code"
              error={errors.dieCode}
              required
            />
          </div>
        </div>
        
        {/* Specifications Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberInput
              label="Frags"
              name="frags"
              value={formData.frags}
              onChange={handleChange}
              placeholder="Enter number of frags"
              error={errors.frags}
              required
              min={0}
            />
            
            <NumberInput
              label="Product Size L (in)"
              name="productSizeL"
              value={formData.productSizeL}
              onChange={handleChange}
              placeholder="Enter product length"
              error={errors.productSizeL}
              required
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Product Size B (in)"
              name="productSizeB"
              value={formData.productSizeB}
              onChange={handleChange}
              placeholder="Enter product breadth"
              error={errors.productSizeB}
              required
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Die Size L (in)"
              name="dieSizeL"
              value={formData.dieSizeL}
              onChange={handleChange}
              placeholder="Enter die length"
              error={errors.dieSizeL}
              required
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Die Size B (in)"
              name="dieSizeB"
              value={formData.dieSizeB}
              onChange={handleChange}
              placeholder="Enter die breadth"
              error={errors.dieSizeB}
              required
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Price (INR)"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter die price"
              error={errors.price}
              required
              min={0}
              step={0.01}
            />
            
            <TextInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter die location"
            />
          </div>
        </div>
        
        {/* Image Upload Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Die Image</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">Upload an image of the die (optional)</p>
            </div>
            
            {/* Image Preview */}
            {(image || formData.imageUrl) && (
              <div className="flex items-center space-x-4">
                <div className="border rounded-md overflow-hidden w-24 h-24">
                  <img
                    src={image ? URL.createObjectURL(image) : formData.imageUrl}
                    alt="Die Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        {editingDie && (
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
          disabled={uploading}
        >
          {uploading ? "Uploading..." : editingDie ? "Save Changes" : "Add Die"}
        </Button>
      </div>
    </form>
  );
};

export default AddDieForm;