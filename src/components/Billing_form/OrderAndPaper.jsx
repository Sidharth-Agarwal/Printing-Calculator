import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const OrderAndPaper = ({ onNext }) => {
  const [data, setData] = useState({
    clientName: "",
    date: "",
    deliveryDate: "",
    jobType: "",
    quantity: "",
    paperProvided: "",
    paperName: "",
    dieSelection: "",
    dieNo: "",
    dieSize: { length: "", breadth: "" },
    image: "",
  });

  const [dieOptions, setDieOptions] = useState([]);

  useEffect(() => {
    const fetchDies = async () => {
      const querySnapshot = await getDocs(collection(db, "dies"));
      const dies = querySnapshot.docs.map((doc) => doc.data());
      setDieOptions(dies);
    };

    fetchDies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      dieSize: { ...prev.dieSize, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="clientName"
          placeholder="Client Name"
          value={data.clientName}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />
        <input
          type="date"
          name="date"
          placeholder="Date"
          value={data.date}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />
        <input
          type="date"
          name="deliveryDate"
          placeholder="Estimated Delivery Date"
          value={data.deliveryDate}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />
        <select
          name="jobType"
          value={data.jobType}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        >
          <option value="">Select Job Type</option>
          {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={data.quantity}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />
        <select
          name="paperProvided"
          value={data.paperProvided}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        >
          <option value="">Paper Provided?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <select
          name="paperName"
          value={data.paperName}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        >
          <option value="">Select Paper Name</option>
          {["Wild 450", "Wild 650"].map((paper, index) => (
            <option key={index} value={paper}>
              {paper}
            </option>
          ))}
        </select>
        <select
          name="dieSelection"
          value={data.dieSelection}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        >
          <option value="">Select Die</option>
          {dieOptions.map((die, index) => (
            <option key={index} value={die.dieName}>
              {die.dieName}
            </option>
          ))}
        </select>
        <select
          name="dieNo"
          value={data.dieNo}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        >
          <option value="">Select Die No.</option>
          {dieOptions.map((die, index) => (
            <option key={index} value={die.dieNo}>
              {die.dieNo}
            </option>
          ))}
        </select>
        <div className="flex space-x-4">
          <input
            type="number"
            name="length"
            placeholder="Die Size (L)"
            value={data.dieSize.length}
            onChange={handleNestedChange}
            className="border rounded-md p-2 w-full"
          />
          <input
            type="number"
            name="breadth"
            placeholder="Die Size (B)"
            value={data.dieSize.breadth}
            onChange={handleNestedChange}
            className="border rounded-md p-2 w-full"
          />
        </div>
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={data.image}
          onChange={handleChange}
          className="border rounded-md p-2"
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Next
      </button>
    </form>
  );
};

export default OrderAndPaper;