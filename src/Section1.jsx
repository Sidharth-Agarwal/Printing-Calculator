import React, { useState } from "react";

const OrderAndPaper = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    date: "",
    estimatedDeliveryDate: "",
    jobType: "",
    quantity: "",
    paperProvided: "",
    paperName: "",
  });

  const jobTypeOptions = [
    "Card",
    "Biz Card",
    "Vellum Jacket",
    "Envelope",
    "Liner",
    "Timeless Folder",
    "Tag",
    "Magnet",
    "Shapes",
    "Seal",
    "Belly Band",
    "enveloper",
  ];

  const paperNameOptions = ["Wild 450", "Wild 650"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted: ", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Section 1: Order and Paper</h2>

      {/* Client Name */}
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

      {/* Date */}
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      {/* Estimated Delivery Date */}
      <div>
        <label>Estimated Delivery Date:</label>
        <input
          type="date"
          name="estimatedDeliveryDate"
          value={formData.estimatedDeliveryDate}
          onChange={handleChange}
          required
        />
      </div>

      {/* Job Type */}
      <div>
        <label>Job Type:</label>
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          required
        >
          <option value="">Select Job Type</option>
          {jobTypeOptions.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
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

      {/* Paper Provided */}
      <div>
        <label>Paper Provided:</label>
        <div>
          <label>
            <input
              type="radio"
              name="paperProvided"
              value="Yes"
              checked={formData.paperProvided === "Yes"}
              onChange={handleChange}
              required
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="paperProvided"
              value="No"
              checked={formData.paperProvided === "No"}
              onChange={handleChange}
              required
            />
            No
          </label>
        </div>
      </div>

      {/* Paper Name */}
      <div>
        <label>Paper Name:</label>
        <select
          name="paperName"
          value={formData.paperName}
          onChange={handleChange}
          required={formData.paperProvided === "Yes"}
          disabled={formData.paperProvided !== "Yes"}
        >
          <option value="">Select Paper Name</option>
          {paperNameOptions.map((paper, index) => (
            <option key={index} value={paper}>
              {paper}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default OrderAndPaper;
