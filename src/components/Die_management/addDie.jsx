import React, { useState } from "react";
// import { db, storage } from "../firebaseConfig"; // Firebase config
// import { collection, addDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddDieForm = ({ fetchDies }) => {
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = "";

    // Upload image to Firebase Storage if provided
    if (image) {
      const imageRef = ref(storage, `dieImages/${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    try {
      const diesCollection = collection(db, "dies");
      await addDoc(diesCollection, { ...formData, imageUrl, timestamp: new Date() });
      alert("Die added successfully!");

      // Clear form after submission
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
      fetchDies(); // Refresh the table data
    } catch (error) {
      console.error("Error adding die: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-die-form space-y-4 p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Add Die</h2>
      <p className="text-gray-600">Make sure you enter all the details correctly.</p>

      {/* Job Type */}
      <div>
        <label>Job Type:</label>
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        >
          <option value="">Select Job Type</option>
          {jobTypeOptions.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label>Type:</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Enter type"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Product Size L */}
      <div>
        <label>Product Size L (in):</label>
        <input
          type="number"
          name="productSizeL"
          value={formData.productSizeL}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Product Size B */}
      <div>
        <label>Product Size B (in):</label>
        <input
          type="number"
          name="productSizeB"
          value={formData.productSizeB}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Die Size L */}
      <div>
        <label>Die Size L (in):</label>
        <input
          type="number"
          name="dieSizeL"
          value={formData.dieSizeL}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Die Size B */}
      <div>
        <label>Die Size B (in):</label>
        <input
          type="number"
          name="dieSizeB"
          value={formData.dieSizeB}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Paper Size L */}
      <div>
        <label>Paper Size L (in):</label>
        <input
          type="number"
          name="paperSizeL"
          value={formData.paperSizeL}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Paper Size B */}
      <div>
        <label>Paper Size B (in):</label>
        <input
          type="number"
          name="paperSizeB"
          value={formData.paperSizeB}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Frags */}
      <div>
        <label>Frags:</label>
        <input
          type="number"
          name="frags"
          value={formData.frags}
          onChange={handleChange}
          placeholder="Enter number of frags"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Plate Size L */}
      <div>
        <label>Plate Size L (in):</label>
        <input
          type="number"
          name="plateSizeL"
          value={formData.plateSizeL}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Plate Size B */}
      <div>
        <label>Plate Size B (in):</label>
        <input
          type="number"
          name="plateSizeB"
          value={formData.plateSizeB}
          onChange={handleChange}
          placeholder="in Inch"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* CLSD Print Size L */}
      <div>
        <label>CLSD Print Size L (in):</label>
        <input
          type="number"
          name="clsdPrintSizeL"
          value={formData.clsdPrintSizeL}
          onChange={handleChange}
          placeholder="0.00"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* CLSD Print Size B */}
      <div>
        <label>CLSD Print Size B (in):</label>
        <input
          type="number"
          name="clsdPrintSizeB"
          value={formData.clsdPrintSizeB}
          onChange={handleChange}
          placeholder="0.00"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Die Code */}
      <div>
        <label>Die Code:</label>
        <input
          type="text"
          name="dieCode"
          value={formData.dieCode}
          onChange={handleChange}
          placeholder="Enter die code"
          required
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label>Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded w-full" />
      </div>

      {/* Submit Button */}
      <button type="submit" className="bg-gray-600 text-white p-2 rounded mt-4 w-full">
        Submit
      </button>
    </form>
  );
};

export default AddDieForm;