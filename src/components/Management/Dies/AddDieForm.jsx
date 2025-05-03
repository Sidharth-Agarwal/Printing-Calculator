import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddDieForm = ({ onAddDie, onUpdateDie, editingDie, setEditingDie, storage, isSubmitting }) => {
  const [formData, setFormData] = useState({
    jobType: "",
    type: "",
    dieCode: "",
    frags: "",
    productSizeL: "",
    productSizeB: "",
    dieSizeL: "",
    dieSizeB: "",
    // New calculated fields
    dieSizeL_CM: "",  // L (CM) for PAPER
    dieSizeB_CM: "",  // B (CM) for PAPER
    plateSizeL: "",   // PLATE Size (L Inch)
    plateSizeB: "",   // PLATE Size (B Inch)
    clsdPrntSizeL_CM: "", // CLSD PRNT Size (L CM)
    clsdPrntSizeB_CM: "", // CLSD PRNT Size (B CM)
    imageUrl: "",
  });

  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const jobTypeOptions = ["Card", "Biz Card", "Envelope", "Seal", "Magnet", "Packaging", "Notebook", "Liner"];

  useEffect(() => {
    if (editingDie) {
      // Calculate fields if they don't exist in the editing die data
      const updatedDie = {
        ...editingDie,
        dieSizeL_CM: editingDie.dieSizeL_CM || calculateCM(editingDie.dieSizeL),
        dieSizeB_CM: editingDie.dieSizeB_CM || calculateCM(editingDie.dieSizeB),
        plateSizeL: editingDie.plateSizeL || editingDie.productSizeL || "",
        plateSizeB: editingDie.plateSizeB || editingDie.productSizeB || "",
        clsdPrntSizeL_CM: editingDie.clsdPrntSizeL_CM || calculateCM(editingDie.productSizeL),
        clsdPrntSizeB_CM: editingDie.clsdPrntSizeB_CM || calculateCM(editingDie.productSizeB),
      };
      setFormData(updatedDie);
      setImage(null); // Reset the selected image when editing
    } else {
      resetForm();
    }
  }, [editingDie]);

  // Calculate CM from inches
  const calculateCM = (inches) => {
    if (!inches || isNaN(inches)) return "";
    return (parseFloat(inches) * 2.54).toFixed(2);
  };

  // Update calculated fields whenever input fields change
  useEffect(() => {
    // Calculate L (CM) for PAPER and B (CM) for PAPER
    const dieSizeL_CM = calculateCM(formData.dieSizeL);
    const dieSizeB_CM = calculateCM(formData.dieSizeB);
    
    // PLATE Size is the same as Product Size
    const plateSizeL = formData.productSizeL;
    const plateSizeB = formData.productSizeB;
    
    // Calculate CLSD PRNT Size in CM
    const clsdPrntSizeL_CM = calculateCM(formData.productSizeL);
    const clsdPrntSizeB_CM = calculateCM(formData.productSizeB);
    
    setFormData(prev => ({
      ...prev,
      dieSizeL_CM,
      dieSizeB_CM,
      plateSizeL,
      plateSizeB,
      clsdPrntSizeL_CM,
      clsdPrntSizeB_CM,
    }));
  }, [formData.dieSizeL, formData.dieSizeB, formData.productSizeL, formData.productSizeB]);

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
      dieSizeL_CM: "",
      dieSizeB_CM: "",
      plateSizeL: "",
      plateSizeB: "",
      clsdPrntSizeL_CM: "",
      clsdPrntSizeB_CM: "",
      imageUrl: "",
    });
    setImage(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear the error when the die code is changed
    if (name === 'dieCode' && error) {
      setError(null);
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
    setError(null);

    let imageUrl = formData.imageUrl;

    try {
      if (image && storage) {
        const imageRef = ref(storage, `dieImages/${formData.dieCode}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Try to update or add the die
      if (editingDie) {
        try {
          await onUpdateDie(editingDie.id, { ...formData, imageUrl });
          resetForm();
          setEditingDie(null);
        } catch (error) {
          // If there's an error (like duplicate die code), set the error message
          // but keep the form data so the user can edit it
          if (error.message && error.message.includes('Die code')) {
            setError(error.message);
          } else {
            throw error; // Re-throw if it's another type of error
          }
        }
      } else {
        try {
          await onAddDie({ ...formData, imageUrl });
          resetForm();
        } catch (error) {
          // If there's an error (like duplicate die code), set the error message
          // but keep the form data so the user can edit it
          if (error.message && error.message.includes('Die code')) {
            setError(error.message);
          } else {
            throw error; // Re-throw if it's another type of error
          }
        }
      }
    } catch (error) {
      console.error("Error adding/updating die:", error);
      setError("Failed to submit die. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-medium mb-4">{editingDie ? "Edit Die" : "Add New Die"}</h2>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
        {/* Original input fields */}
        {[
          { label: "Job Type", name: "jobType", type: "select", options: jobTypeOptions },
          { label: "Type", name: "type", type: "text", placeholder: "Enter the type of the die" },
          { label: "Die Code", name: "dieCode", type: "text", placeholder: "Enter die code" },
          { label: "Frags", name: "frags", type: "number", placeholder: "Enter number of frags" },
          { label: "Product Size L (in)", name: "productSizeL", type: "number", placeholder: "Enter length of the product" },
          { label: "Product Size B (in)", name: "productSizeB", type: "number", placeholder: "Enter breadth of the product" },
          { label: "Die Size L (in)", name: "dieSizeL", type: "number", placeholder: "Enter length of the die" },
          { label: "Die Size B (in)", name: "dieSizeB", type: "number", placeholder: "Enter breadth of the die" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700">{field.label}:</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
                required
                disabled={isSubmitting}
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
                required
                disabled={isSubmitting}
              />
            )}
          </div>
        ))}
        
        {/* Calculated fields (read-only) */}
        {[
          { label: "L (CM) for PAPER", name: "dieSizeL_CM", type: "text", placeholder: "Auto-calculated" },
          { label: "B (CM) for PAPER", name: "dieSizeB_CM", type: "text", placeholder: "Auto-calculated" },
          { label: "PLATE Size (L Inch)", name: "plateSizeL", type: "text", placeholder: "Auto-calculated" },
          { label: "PLATE Size (B Inch)", name: "plateSizeB", type: "text", placeholder: "Auto-calculated" },
          { label: "CLSD PRNT Size (L CM)", name: "clsdPrntSizeL_CM", type: "text", placeholder: "Auto-calculated" },
          { label: "CLSD PRNT Size (B CM)", name: "clsdPrntSizeB_CM", type: "text", placeholder: "Auto-calculated" },
        ].map((field, idx) => (
          <div key={`calc-${idx}`}>
            <label className="block text-sm font-medium text-gray-700">{field.label}:</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              readOnly
              placeholder={field.placeholder}
              className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm bg-gray-100"
              disabled={true}
            />
          </div>
        ))}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="mt-1 block w-full" 
            disabled={isSubmitting}
          />
          {image || formData.imageUrl ? (
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <img
                src={image ? URL.createObjectURL(image) : formData.imageUrl}
                alt="Selected"
                className="w-16 h-16 object-cover border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                disabled={isSubmitting}
              >
                Remove Image
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <button 
        type="submit" 
        className="mt-6 px-3 py-2 bg-blue-500 text-white rounded text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          editingDie ? "Save Changes" : "Add New Die"
        )}
      </button>
    </form>
  );
};

export default AddDieForm;