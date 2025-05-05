import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddDieForm = ({ onAddDie, onUpdateDie, editingDie, setEditingDie, storage, isSubmitting, onCancel }) => {
  const [formData, setFormData] = useState({
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
        } catch (error) {
          // If there's an error (like duplicate die code), set the error message
          if (error.message && error.message.includes('Die code')) {
            setError(error.message);
          } else {
            throw error; // Re-throw if it's another type of error
          }
        }
      } else {
        try {
          await onAddDie({ ...formData, imageUrl });
        } catch (error) {
          // If there's an error (like duplicate die code), set the error message
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
    <form onSubmit={handleSubmit} className="text-sm">
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Primary fields - 4 in a row */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Job Type:</label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          >
            <option value="">Select</option>
            {jobTypeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type:</label>
          <input
            type="text"
            name="type"
            value={formData.type || ""}
            onChange={handleChange}
            placeholder="Enter type"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Die Code:</label>
          <input
            type="text"
            name="dieCode"
            value={formData.dieCode || ""}
            onChange={handleChange}
            placeholder="Enter die code"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Frags:</label>
          <input
            type="number"
            name="frags"
            value={formData.frags || ""}
            onChange={handleChange}
            placeholder="Enter frags"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Dimensions - 4 in a row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Product Size L (in):</label>
          <input
            type="number"
            name="productSizeL"
            value={formData.productSizeL || ""}
            onChange={handleChange}
            placeholder="Length"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Product Size B (in):</label>
          <input
            type="number"
            name="productSizeB"
            value={formData.productSizeB || ""}
            onChange={handleChange}
            placeholder="Breadth"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Die Size L (in):</label>
          <input
            type="number"
            name="dieSizeL"
            value={formData.dieSizeL || ""}
            onChange={handleChange}
            placeholder="Length"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Die Size B (in):</label>
          <input
            type="number"
            name="dieSizeB"
            value={formData.dieSizeB || ""}
            onChange={handleChange}
            placeholder="Breadth"
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Calculated fields section - all 6 fields in 2 rows of 3 */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Calculated Fields</h3>
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">L (CM) for PAPER:</label>
            <input
              type="text"
              value={formData.dieSizeL_CM || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">B (CM) for PAPER:</label>
            <input
              type="text"
              value={formData.dieSizeB_CM || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PLATE Size (L Inch):</label>
            <input
              type="text"
              value={formData.plateSizeL || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PLATE Size (B Inch):</label>
            <input
              type="text"
              value={formData.plateSizeB || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CLSD PRNT Size (L CM):</label>
            <input
              type="text"
              value={formData.clsdPrntSizeL_CM || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CLSD PRNT Size (B CM):</label>
            <input
              type="text"
              value={formData.clsdPrntSizeB_CM || ""}
              readOnly
              className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Image upload - more compact */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Image:</label>
        <div className="flex items-center">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="w-full text-xs border border-gray-300 p-1.5 rounded" 
            disabled={isSubmitting}
          />
          {(image || formData.imageUrl) && (
            <div className="flex items-center ml-2">
              <img
                src={image ? URL.createObjectURL(image) : formData.imageUrl}
                alt="Selected"
                className="w-10 h-10 object-cover border rounded"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            editingDie ? 'Update Die' : 'Add Die'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDieForm;