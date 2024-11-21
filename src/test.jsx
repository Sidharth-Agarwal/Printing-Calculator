import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

function OrderForm() {
  const [formData, setFormData] = useState({
    clientName: "",
    quantity: "",
    jobType: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior

    try {
      // Add data to Firestore
      const docRef = await addDoc(collection(db, "orders"), {
        ...formData,
        timestamp: new Date() // Add a timestamp field for sorting
      });
      console.log("Document written with ID: ", docRef.id);

      // Clear the form after successful submission
      setFormData({ clientName: "", quantity: "", jobType: "" });
      alert("Order submitted successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit the order. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit a New Order</h2>

      {/* Client Name Input */}
      <div>
        <label>Client Name:</label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Quantity Input */}
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>

      {/* Job Type Input */}
      <div>
        <label>Job Type:</label>
        <input
          type="text"
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submit Button */}
      <button type="submit">Submit Order</button>
    </form>
  );
}

export default OrderForm;