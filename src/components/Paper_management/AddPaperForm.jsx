import React, { useEffect, useState } from "react";

const AddPaperForm = ({ onAddPaper, onUpdatePaper, editingPaper, setEditingPaper }) => {
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

  // Populate form when editingPaper changes
  useEffect(() => {
    if (editingPaper) {
      setFormData(editingPaper);
    } else {
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
  }, [editingPaper]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingPaper) {
      onUpdatePaper(editingPaper.id, formData); // Update paper
    } else {
      onAddPaper(formData); // Add new paper
    }

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

    setEditingPaper(null); // Clear editing state
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-6">{editingPaper ? "Edit Paper" : "Add Paper"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Paper Name", placeholder: "Enter the name of the paper", name: "paperName", type: "text" },
          { label: "Company", placeholder: "Enter the name of the company", name: "company", type: "text" },
          { label: "GSM", placeholder: "Enter the GSM information", name: "gsm", type: "number" },
          { label: "Price/Sheet (INR)", placeholder: "Enter the Price/Sheet", name: "pricePerSheet", type: "number" },
          { label: "Length (CM)", placeholder: "Enter the length of the paper", name: "length", type: "number" },
          { label: "Breadth (CM)", placeholder: "Enter the breadth of the paper", name: "breadth", type: "number" },
          { label: "Freight/KG (INR)", placeholder: "Enter the freight/KG of the paper", name: "freightPerKg", type: "number" },
          { label: "Rate/Gram (INR)", placeholder: "Enter the Rate/gram of the paper", name: "ratePerGram", type: "number" },
          { label: "Area (sqcm)", placeholder: "Enter the total area of the paper", name: "area", type: "number" },
          { label: "1 Sqcm in Gram", placeholder: "Enter the gram per square cm", name: "oneSqcmInGram", type: "number" },
          { label: "GSM/Sheet", placeholder: "Enter the GSM/sheet of the paper", name: "gsmPerSheet", type: "number" },
          { label: "Freight/Sheet (INR)", placeholder: "Enter the freight/sheet of the paper", name: "freightPerSheet", type: "number" },
          { label: "Final Rate (INR)", placeholder: "Enter the final rate of the paper", name: "finalRate", type: "number" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-xl font-medium text-gray-700">{field.label}:</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
              required
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        {editingPaper ? "Save Changes" : "Submit"}
      </button>
    </form>
  );
};

export default AddPaperForm;
