import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddDieForm = ({ onAddDie, onUpdateDie, editingDie, setEditingDie, storage }) => {
  const [formData, setFormData] = useState({
    jobType: "",
    type: "",
    productSizeL: "",
    productSizeB: "",
    dieSizeL: "",
    dieSizeB: "",
    paperSizeL: "",
    paperSizeB: "",
    frags: "",
    plateSizeL: "",
    plateSizeB: "",
    clsdPrintSizeL: "",
    clsdPrintSizeB: "",
    dieCode: "",
    imageUrl: "",
  });

  const [image, setImage] = useState(null);
  const jobTypeOptions = ["Card", "Biz Card", "Magnet", "Envelope"];

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
      productSizeL: "",
      productSizeB: "",
      dieSizeL: "",
      dieSizeB: "",
      paperSizeL: "",
      paperSizeB: "",
      frags: "",
      plateSizeL: "",
      plateSizeB: "",
      clsdPrintSizeL: "",
      clsdPrintSizeB: "",
      dieCode: "",
      imageUrl: "",
    });
    setImage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null); // Clear the selected image
    setFormData((prev) => ({ ...prev, imageUrl: "" })); // Remove the image URL from form data
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;

    try {
      if (image && storage) {
        const imageRef = ref(storage, `dieImages/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log("Image uploaded and URL obtained:", imageUrl);
      }

      if (editingDie) {
        await onUpdateDie(editingDie.id, { ...formData, imageUrl });
      } else {
        await onAddDie({ ...formData, imageUrl });
      }

      resetForm();
      setEditingDie(null);
      alert("Die successfully submitted!");
    } catch (error) {
      console.error("Error adding/updating die:", error);
      alert("Failed to submit die. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-6">{editingDie ? "Edit Die" : "Add Die"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Job Type", name: "jobType", type: "select", options: jobTypeOptions },
          { label: "Type", name: "type", type: "text", placeholder: "Enter the type of the die" },
          { label: "Product Size L (in)", name: "productSizeL", type: "number", placeholder: "Enter length of the product" },
          { label: "Product Size B (in)", name: "productSizeB", type: "number", placeholder: "Enter breadth of the product" },
          { label: "Die Size L (in)", name: "dieSizeL", type: "number", placeholder: "Enter length of the die" },
          { label: "Die Size B (in)", name: "dieSizeB", type: "number", placeholder: "Enter breadth of the die" },
          { label: "Paper Size L (in)", name: "paperSizeL", type: "number", placeholder: "Enter length of the paper" },
          { label: "Paper Size B (in)", name: "paperSizeB", type: "number", placeholder: "Enter breadth of the paper" },
          { label: "Frags", name: "frags", type: "number", placeholder: "Enter number of frags" },
          { label: "Plate Size L (in)", name: "plateSizeL", type: "number", placeholder: "Enter length of the plate" },
          { label: "Plate Size B (in)", name: "plateSizeB", type: "number", placeholder: "Enter breadth of the plate" },
          { label: "CLSD Print Size L (in)", name: "clsdPrintSizeL", type: "number", placeholder: "Enter length of CLSD print" },
          { label: "CLSD Print Size B (in)", name: "clsdPrintSizeB", type: "number", placeholder: "Enter breadth of CLSD print" },
          { label: "Die Code", name: "dieCode", type: "text", placeholder: "Enter die code" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-xl font-medium text-gray-700">{field.label}:</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
                required
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
              />
            )}
          </div>
        ))}
        <div>
          <label className="block text-xl font-medium text-gray-700">Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full" />
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
      <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        {editingDie ? "Save Changes" : "Submit"}
      </button>
    </form>
  );
};

export default AddDieForm;
