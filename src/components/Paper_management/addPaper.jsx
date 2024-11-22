import React, { useState } from "react";
// import { db } from "../firebaseConfig"; // Import Firebase configuration
// import { collection, addDoc } from "firebase/firestore";

const AddPaperForm = ({ fetchPapers }) => {
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const papersCollection = collection(db, "papers");
      await addDoc(papersCollection, { ...formData, timestamp: new Date() });
      alert("Paper added successfully!");

      // Clear form after submission
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
      fetchPapers(); // Refresh the table data
    } catch (error) {
      console.error("Error adding paper: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-paper-form">
      <h2>Add Paper</h2>
      <p>Make sure you enter all the details correctly.</p>

      {/* Paper Name */}
      <div>
        <label>Paper Name:</label>
        <input
          type="text"
          name="paperName"
          value={formData.paperName}
          onChange={handleChange}
          placeholder="Enter Paper Name"
          required
        />
      </div>

      {/* Company */}
      <div>
        <label>Company:</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter Company"
          required
        />
      </div>

      {/* GSM */}
      <div>
        <label>GSM:</label>
        <input
          type="number"
          name="gsm"
          value={formData.gsm}
          onChange={handleChange}
          placeholder="GSM"
          required
        />
      </div>

      {/* Price Per Sheet */}
      <div>
        <label>Price/Sheet (INR):</label>
        <input
          type="number"
          name="pricePerSheet"
          value={formData.pricePerSheet}
          onChange={handleChange}
          placeholder="in INR"
          required
        />
      </div>

      {/* Length */}
      <div>
        <label>Length (CM):</label>
        <input
          type="number"
          name="length"
          value={formData.length}
          onChange={handleChange}
          placeholder="in CM"
          required
        />
      </div>

      {/* Breadth */}
      <div>
        <label>Breadth (CM):</label>
        <input
          type="number"
          name="breadth"
          value={formData.breadth}
          onChange={handleChange}
          placeholder="in CM"
          required
        />
      </div>

      {/* Freight per KG */}
      <div>
        <label>Freight/KG (INR):</label>
        <input
          type="number"
          name="freightPerKg"
          value={formData.freightPerKg}
          onChange={handleChange}
          placeholder="in INR"
          required
        />
      </div>

      {/* Rate per Gram */}
      <div>
        <label>Rate/Gram (INR):</label>
        <input
          type="number"
          name="ratePerGram"
          value={formData.ratePerGram}
          onChange={handleChange}
          placeholder="in INR"
          required
        />
      </div>

      {/* Area */}
      <div>
        <label>Area (sqcm):</label>
        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      {/* 1 sqcm in Gram */}
      <div>
        <label>1 Sqcm in Gram:</label>
        <input
          type="number"
          name="oneSqcmInGram"
          value={formData.oneSqcmInGram}
          onChange={handleChange}
          placeholder="in gram"
          required
        />
      </div>

      {/* GSM per Sheet */}
      <div>
        <label>GSM/Sheet:</label>
        <input
          type="number"
          name="gsmPerSheet"
          value={formData.gsmPerSheet}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      {/* Freight per Sheet */}
      <div>
        <label>Freight/Sheet (INR):</label>
        <input
          type="number"
          name="freightPerSheet"
          value={formData.freightPerSheet}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      {/* Final Rate */}
      <div>
        <label>Final Rate (INR):</label>
        <input
          type="number"
          name="finalRate"
          value={formData.finalRate}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      {/* Submit Button */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddPaperForm;
