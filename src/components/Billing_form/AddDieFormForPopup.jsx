import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";

const AddDieFormForPopup = ({ onAddDie, onClose }) => {
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
    price: "",
    imageUrl: "",
  });

  const [image, setImage] = useState(null);

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
      price: "",
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
    setImage(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    // Reset the file input
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const dieRef = await addDoc(collection(db, "dies"), newDie);

      console.log("New die added with ID:", dieRef.id);

      onAddDie({ id: dieRef.id, ...newDie });

      resetForm();
      alert("Die successfully added!");
      onClose();
    } catch (error) {
      console.error("Error adding die:", error);
      alert("Failed to add die. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] max-w-6xl"
      >
        <h2 className="text-2xl font-bold mb-6">Add New Die</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Job Type", name: "jobType", type: "select", options: ["Card", "Biz Card", "Magnet", "Envelope"] },
            { label: "Type", name: "type", type: "text", placeholder: "Enter the type of the die" },
            { label: "Product Size L (in)", name: "productSizeL", type: "number", placeholder: "Enter product length" },
            { label: "Product Size B (in)", name: "productSizeB", type: "number", placeholder: "Enter product breadth" },
            { label: "Die Size L (in)", name: "dieSizeL", type: "number", placeholder: "Enter die length" },
            { label: "Die Size B (in)", name: "dieSizeB", type: "number", placeholder: "Enter die breadth" },
            { label: "Paper Size L (in)", name: "paperSizeL", type: "number", placeholder: "Enter paper length" },
            { label: "Paper Size B (in)", name: "paperSizeB", type: "number", placeholder: "Enter paper breadth" },
            { label: "Frags", name: "frags", type: "number", placeholder: "Enter number of frags" },
            { label: "Plate Size L (in)", name: "plateSizeL", type: "number", placeholder: "Enter plate length" },
            { label: "Plate Size B (in)", name: "plateSizeB", type: "number", placeholder: "Enter plate breadth" },
            { label: "CLSD Print Size L (in)", name: "clsdPrintSizeL", type: "number", placeholder: "Enter CLSD print length" },
            { label: "CLSD Print Size B (in)", name: "clsdPrintSizeB", type: "number", placeholder: "Enter CLSD print breadth" },
            { label: "Die Code", name: "dieCode", type: "text", placeholder: "Enter die code" },
            { label: "Price (INR)", name: "price", type: "number", placeholder: "Enter price of the die" },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium mb-1">{field.label}:</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="text-sm p-2 w-full border rounded-md shadow-sm"
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
                  className="text-sm p-2 w-full border rounded-md shadow-sm"
                  required
                />
              )}
            </div>
          ))}
          <div className="col-span-4">
            <label className="block text-sm font-medium mb-1">Image:</label>
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
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDieFormForPopup;
