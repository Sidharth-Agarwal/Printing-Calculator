import React, { useEffect, useState } from "react";

const AddPaperForm = ({ onSubmit, initialData, isSubmitting, onCancel }) => {
  const [formData, setFormData] = useState({
    paperName: "",
    company: "",
    gsm: "",
    pricePerSheet: "",
    length: "",
    breadth: "",
    freightPerKg: "",
    ratePerGram: "",
    area: "",
    oneSqcmInGram: "",
    gsmPerSheet: "",
    freightPerSheet: "",
    finalRate: "",
  });

  // Populate form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form when not editing
      setFormData({
        paperName: "",
        company: "",
        gsm: "",
        pricePerSheet: "",
        length: "",
        breadth: "",
        freightPerKg: "",
        ratePerGram: "",
        area: "",
        oneSqcmInGram: "",
        gsmPerSheet: "",
        freightPerSheet: "",
        finalRate: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // Update calculated fields
      const freightPerKg = parseFloat(updatedForm.freightPerKg || 0);
      const length = parseFloat(updatedForm.length || 0);
      const breadth = parseFloat(updatedForm.breadth || 0);
      const gsm = parseFloat(updatedForm.gsm || 0);
      const pricePerSheet = parseFloat(updatedForm.pricePerSheet || 0);

      const ratePerGram = freightPerKg / 1000;
      const area = length * breadth;
      const oneSqcmInGram = gsm / 10000;
      const gsmPerSheet = (area * oneSqcmInGram);
      const freightPerSheet = ratePerGram * gsmPerSheet;
      const finalRate = pricePerSheet + freightPerSheet;

      return {
        ...updatedForm,
        ratePerGram: ratePerGram.toFixed(4),
        area: area.toFixed(2),
        oneSqcmInGram: oneSqcmInGram.toFixed(6),
        gsmPerSheet: gsmPerSheet.toFixed(2),
        freightPerSheet: freightPerSheet.toFixed(2),
        finalRate: finalRate.toFixed(2),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        {/* User input fields - now in 4 columns instead of 3 */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Paper Name:</label>
            <input
              type="text"
              name="paperName"
              value={formData.paperName || ""}
              onChange={handleChange}
              placeholder="Enter paper name"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company:</label>
            <input
              type="text"
              name="company"
              value={formData.company || ""}
              onChange={handleChange}
              placeholder="Enter company"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">GSM:</label>
            <input
              type="number"
              name="gsm"
              value={formData.gsm || ""}
              onChange={handleChange}
              placeholder="Enter GSM"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price/Sheet (INR):</label>
            <input
              type="number"
              name="pricePerSheet"
              value={formData.pricePerSheet || ""}
              onChange={handleChange}
              placeholder="Enter price per sheet"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Length (CM):</label>
            <input
              type="number"
              name="length"
              value={formData.length || ""}
              onChange={handleChange}
              placeholder="Enter length"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Breadth (CM):</label>
            <input
              type="number"
              name="breadth"
              value={formData.breadth || ""}
              onChange={handleChange}
              placeholder="Enter breadth"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Freight/KG (INR):</label>
            <input
              type="number"
              name="freightPerKg"
              value={formData.freightPerKg || ""}
              onChange={handleChange}
              placeholder="Enter freight/KG"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Calculated Values section - now in a 2x3 grid layout */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rate/Gram (INR):</label>
            <input
              type="text"
              value={formData.ratePerGram || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Area (sqcm):</label>
            <input
              type="text"
              value={formData.area || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">1 Sqcm in Gram:</label>
            <input
              type="text"
              value={formData.oneSqcmInGram || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">GSM/Sheet:</label>
            <input
              type="text"
              value={formData.gsmPerSheet || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Freight/Sheet (INR):</label>
            <input
              type="text"
              value={formData.freightPerSheet || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Final Rate (INR):</label>
            <input
              type="text"
              value={formData.finalRate || ""}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Form buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            initialData ? 'Update Paper' : 'Add Paper'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddPaperForm;