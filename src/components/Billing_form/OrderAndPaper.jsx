// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const OrderAndPaper = ({ onNext }) => {
//   const [data, setData] = useState({
//     clientName: "",
//     date: "",
//     deliveryDate: "",
//     jobType: "",
//     quantity: "",
//     paperProvided: "",
//     paperName: "",
//     dieSelection: "",
//     dieNo: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   });

//   const [dieOptions, setDieOptions] = useState([]);

//   useEffect(() => {
//     const fetchDies = async () => {
//       const querySnapshot = await getDocs(collection(db, "dies"));
//       const dies = querySnapshot.docs.map((doc) => doc.data());
//       setDieOptions(dies);
//     };

//     fetchDies();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       dieSize: { ...prev.dieSize, [name]: value },
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
//       <div className="grid grid-cols-2 gap-4">
//         <input
//           type="text"
//           name="clientName"
//           placeholder="Client Name"
//           value={data.clientName}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <input
//           type="date"
//           name="date"
//           placeholder="Date"
//           value={data.date}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <input
//           type="date"
//           name="deliveryDate"
//           placeholder="Estimated Delivery Date"
//           value={data.deliveryDate}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <select
//           name="jobType"
//           value={data.jobType}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Job Type</option>
//           {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
//             <option key={index} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>
//         <input
//           type="number"
//           name="quantity"
//           placeholder="Quantity"
//           value={data.quantity}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <select
//           name="paperProvided"
//           value={data.paperProvided}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Paper Provided?</option>
//           <option value="Yes">Yes</option>
//           <option value="No">No</option>
//         </select>
//         <select
//           name="paperName"
//           value={data.paperName}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Paper Name</option>
//           {["Wild 450", "Wild 650"].map((paper, index) => (
//             <option key={index} value={paper}>
//               {paper}
//             </option>
//           ))}
//         </select>
//       </div>
//       <button
//         type="submit"
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
//       >
//         Next
//       </button>
//     </form>
//   );
// };

// export default OrderAndPaper;

// Original Order and Paper form
// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const OrderAndPaper = ({ onNext }) => {
//   const [data, setData] = useState({
//     clientName: "",
//     date: "",
//     deliveryDate: "",
//     jobType: "",
//     quantity: "",
//     paperProvided: "",
//     paperName: "",
//     dieSelection: "",
//     dieNo: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   });

//   const [dieOptions, setDieOptions] = useState([]);

//   useEffect(() => {
//     const fetchDies = async () => {
//       const querySnapshot = await getDocs(collection(db, "dies"));
//       const dies = querySnapshot.docs.map((doc) => doc.data());
//       setDieOptions(dies);
//     };

//     fetchDies();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       dieSize: { ...prev.dieSize, [name]: value },
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
//       <div className="grid grid-cols-2 gap-4">
//         <input
//           type="text"
//           name="clientName"
//           placeholder="Client Name"
//           value={data.clientName}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <input
//           type="date"
//           name="date"
//           placeholder="Date"
//           value={data.date}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <input
//           type="date"
//           name="deliveryDate"
//           placeholder="Estimated Delivery Date"
//           value={data.deliveryDate}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <select
//           name="jobType"
//           value={data.jobType}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Job Type</option>
//           {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
//             <option key={index} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>
//         <input
//           type="number"
//           name="quantity"
//           placeholder="Quantity"
//           value={data.quantity}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         />
//         <select
//           name="paperProvided"
//           value={data.paperProvided}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Paper Provided?</option>
//           <option value="Yes">Yes</option>
//           <option value="No">No</option>
//         </select>
//         <select
//           name="paperName"
//           value={data.paperName}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Paper Name</option>
//           {["Wild 450", "Wild 650"].map((paper, index) => (
//             <option key={index} value={paper}>
//               {paper}
//             </option>
//           ))}
//         </select>
//         <select
//           name="dieSelection"
//           value={data.dieSelection}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Die</option>
//           {dieOptions.map((die, index) => (
//             <option key={index} value={die.dieName}>
//               {die.dieName}
//             </option>
//           ))}
//         </select>
//         <select
//           name="dieNo"
//           value={data.dieNo}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//           required
//         >
//           <option value="">Select Die No.</option>
//           {dieOptions.map((die, index) => (
//             <option key={index} value={die.dieNo}>
//               {die.dieNo}
//             </option>
//           ))}
//         </select>
//         <div className="flex space-x-4">
//           <input
//             type="number"
//             name="length"
//             placeholder="Die Size (L)"
//             value={data.dieSize.length}
//             onChange={handleNestedChange}
//             className="border rounded-md p-2 w-full"
//           />
//           <input
//             type="number"
//             name="breadth"
//             placeholder="Die Size (B)"
//             value={data.dieSize.breadth}
//             onChange={handleNestedChange}
//             className="border rounded-md p-2 w-full"
//           />
//         </div>
//         <input
//           type="text"
//           name="image"
//           placeholder="Image URL"
//           value={data.image}
//           onChange={handleChange}
//           className="border rounded-md p-2"
//         />
//       </div>
//       <button
//         type="submit"
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
//       >
//         Next
//       </button>
//     </form>
//   );
// };

// export default OrderAndPaper;

// import React, { useState, useEffect } from "react";
// import DieSelectionPopup from "./DieSelectionPopup";
// import AddDieForm from "../Die_management/AddDieForm";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const OrderAndPaper = ({ onNext }) => {
//   const [data, setData] = useState({
//     clientName: "",
//     date: "",
//     deliveryDate: "",
//     jobType: "",
//     quantity: "",
//     paperProvided: "",
//     paperName: "",
//     dieSelection: "",
//     dieNo: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   });

//   const [showDiePopup, setShowDiePopup] = useState(false);
//   const [showAddDiePopup, setShowAddDiePopup] = useState(false);
//   const [selectedDie, setSelectedDie] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       dieSize: { ...prev.dieSize, [name]: value },
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   const handleDieSelect = (die) => {
//     setData((prev) => ({
//       ...prev,
//       dieSelection: die.dieName,
//       dieNo: die.dieNo,
//       dieSize: { length: die.dieSizeL, breadth: die.dieSizeB },
//       image: die.imageUrl,
//     }));
//     setShowDiePopup(false);
//   };

//   const handleAddDieSuccess = (newDie) => {
//     setSelectedDie(newDie);
//     setShowAddDiePopup(false);
//     setShowDiePopup(true); // Show die popup with the new die available
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="text"
//             name="clientName"
//             placeholder="Client Name"
//             value={data.clientName}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <input
//             type="date"
//             name="date"
//             placeholder="Date"
//             value={data.date}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <input
//             type="date"
//             name="deliveryDate"
//             placeholder="Estimated Delivery Date"
//             value={data.deliveryDate}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <select
//             name="jobType"
//             value={data.jobType}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Select Job Type</option>
//             {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
//               <option key={index} value={type}>
//                 {type}
//               </option>
//             ))}
//           </select>
//           <input
//             type="number"
//             name="quantity"
//             placeholder="Quantity"
//             value={data.quantity}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <select
//             name="paperProvided"
//             value={data.paperProvided}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Paper Provided?</option>
//             <option value="Yes">Yes</option>
//             <option value="No">No</option>
//           </select>
//           <select
//             name="paperName"
//             value={data.paperName}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Select Paper Name</option>
//             {["Wild 450", "Wild 650"].map((paper, index) => (
//               <option key={index} value={paper}>
//                 {paper}
//               </option>
//             ))}
//           </select>

//           {/* Die Selection */}
//           <div>
//             <label className="block mb-2 font-medium">Die Selection</label>
//             <button
//               type="button"
//               onClick={() => setShowDiePopup(true)}
//               className="border rounded-md p-2 bg-gray-100 w-full"
//             >
//               {data.dieSelection || "Select Die"}
//             </button>
//           </div>

//           <input
//             type="text"
//             name="dieNo"
//             placeholder="Die No."
//             value={data.dieNo}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             readOnly
//           />
//           <div className="flex space-x-4">
//             <input
//               type="number"
//               name="length"
//               placeholder="Die Size (L)"
//               value={data.dieSize.length}
//               onChange={handleNestedChange}
//               className="border rounded-md p-2 w-full"
//               readOnly
//             />
//             <input
//               type="number"
//               name="breadth"
//               placeholder="Die Size (B)"
//               value={data.dieSize.breadth}
//               onChange={handleNestedChange}
//               className="border rounded-md p-2 w-full"
//               readOnly
//             />
//           </div>
//           <div>
//             <img
//               src={data.image || "https://via.placeholder.com/150"}
//               alt="Die"
//               className="w-40 h-40 object-contain border"
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </form>

//       {/* Die Selection Popup */}
//       {showDiePopup && (
//         <DieSelectionPopup
//           onClose={() => setShowDiePopup(false)}
//           onSelect={handleDieSelect}
//           onAddNewDie={() => setShowAddDiePopup(true)}
//         />
//       )}

//       {/* Add Die Popup */}
//       {showAddDiePopup && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
//           <div className="bg-white p-6 rounded shadow w-1/2">
//             <AddDieForm
//               onAddDie={(newDie) => handleAddDieSuccess(newDie)}
//               editingDie={null}
//               setEditingDie={() => {}}
//             />
//             <button
//               type="button"
//               onClick={() => setShowAddDiePopup(false)}
//               className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderAndPaper;

// Latest update component

// import React, { useState } from "react";
// import DieSelectionPopup from "./DieSelectionPopup";
// import AddDieFormForPopup from "./AddDieFormForPopup";
// import { db, storage } from "../../firebaseConfig";

// const OrderAndPaper = ({ onNext }) => {
//   const [data, setData] = useState({
//     clientName: "",
//     date: "",
//     deliveryDate: "",
//     jobType: "",
//     quantity: "",
//     paperProvided: "",
//     paperName: "",
//     dieSelection: "",
//     dieNo: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   });

//   const [showDiePopup, setShowDiePopup] = useState(false);
//   const [showAddDiePopup, setShowAddDiePopup] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNestedChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       dieSize: { ...prev.dieSize, [name]: value },
//     }));
//   };

//   const handleDieSelect = (die) => {
//     setData((prev) => ({
//       ...prev,
//       dieSelection: die.dieName,
//       dieNo: die.dieNo,
//       dieSize: { length: die.dieSizeL, breadth: die.dieSizeB },
//       image: die.imageUrl,
//     }));
//     setShowDiePopup(false);
//   };

//   const handleAddDieSuccess = (newDie) => {
//     // Automatically update the form fields with the new die details
//     handleDieSelect(newDie);
//     setShowAddDiePopup(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
//         <div className="grid grid-cols-2 gap-4">
//           {/* Form Fields */}
//           <input
//             type="text"
//             name="clientName"
//             placeholder="Client Name"
//             value={data.clientName}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <input
//             type="date"
//             name="date"
//             value={data.date}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <input
//             type="date"
//             name="deliveryDate"
//             value={data.deliveryDate}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <select
//             name="jobType"
//             value={data.jobType}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Select Job Type</option>
//             {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
//               <option key={index} value={type}>
//                 {type}
//               </option>
//             ))}
//           </select>
//           <input
//             type="number"
//             name="quantity"
//             placeholder="Quantity"
//             value={data.quantity}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           />
//           <select
//             name="paperProvided"
//             value={data.paperProvided}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Paper Provided?</option>
//             <option value="Yes">Yes</option>
//             <option value="No">No</option>
//           </select>
//           <select
//             name="paperName"
//             value={data.paperName}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             required
//           >
//             <option value="">Select Paper Name</option>
//             {["Wild 450", "Wild 650"].map((paper, index) => (
//               <option key={index} value={paper}>
//                 {paper}
//               </option>
//             ))}
//           </select>

//           {/* Die Selection */}
//           <div>
//             <label className="block mb-2 font-medium">Die Selection</label>
//             <button
//               type="button"
//               onClick={() => setShowDiePopup(true)}
//               className="border rounded-md p-2 bg-gray-100 w-full"
//             >
//               {data.dieSelection || "Select Die"}
//             </button>
//           </div>
//           <input
//             type="text"
//             name="dieNo"
//             value={data.dieNo}
//             onChange={handleChange}
//             className="border rounded-md p-2"
//             readOnly
//           />
//           <div className="flex space-x-4">
//             <input
//               type="number"
//               name="length"
//               placeholder="Die Size (L)"
//               value={data.dieSize.length}
//               onChange={handleNestedChange}
//               className="border rounded-md p-2 w-full"
//               readOnly
//             />
//             <input
//               type="number"
//               name="breadth"
//               placeholder="Die Size (B)"
//               value={data.dieSize.breadth}
//               onChange={handleNestedChange}
//               className="border rounded-md p-2 w-full"
//               readOnly
//             />
//           </div>
//           <div>
//             <img
//               src={data.image || "https://via.placeholder.com/150"}
//               alt="Die"
//               className="w-40 h-40 object-contain border"
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </form>

//       {/* Die Selection Popup */}
//       {showDiePopup && (
//         <DieSelectionPopup
//           onClose={() => setShowDiePopup(false)}
//           onSelect={handleDieSelect}
//           onAddNewDie={() => setShowAddDiePopup(true)}
//         />
//       )}

//       {/* Add Die Popup */}
//       {showAddDiePopup && (
//         <AddDieFormForPopup
//           onAddDie={handleAddDieSuccess}
//           storage={storage}
//           onClose={() => setShowAddDiePopup(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default OrderAndPaper;

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DieSelectionPopup from "./DieSelectionPopup";
import AddDieFormForPopup from "./AddDieFormForPopup";
import { db, storage } from "../../firebaseConfig";

const OrderAndPaper = ({ onNext }) => {
  const [data, setData] = useState({
    clientName: "",
    date: null, // Use null to avoid errors with DatePicker
    deliveryDate: null,
    jobType: "",
    quantity: "",
    paperProvided: "",
    paperName: "",
    dieSelection: "",
    dieNo: "",
    dieSize: { length: "", breadth: "" },
    image: "",
  });

  const [showDiePopup, setShowDiePopup] = useState(false);
  const [showAddDiePopup, setShowAddDiePopup] = useState(false);

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

  const handleDieSelect = (die) => {
    setData((prev) => ({
      ...prev,
      dieSelection: die.dieName,
      dieNo: die.dieNo,
      dieSize: { length: die.dieSizeL, breadth: die.dieSizeB },
      image: die.imageUrl,
    }));
    setShowDiePopup(false);
  };

  const handleAddDieSuccess = (newDie) => {
    handleDieSelect(newDie);
    setShowAddDiePopup(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format the dates as MM/DD/YYYY before submitting
    const formattedData = {
      ...data,
      date: data.date ? data.date.toLocaleDateString("en-US") : "",
      deliveryDate: data.deliveryDate ? data.deliveryDate.toLocaleDateString("en-US") : "",
    };

    onNext(formattedData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientName" className="block font-medium mb-1">
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              name="clientName"
              placeholder="Enter the client name"
              value={data.clientName}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block font-medium mb-1">
              Date
            </label>
            <DatePicker
              id="date"
              selected={data.date}
              onChange={(date) => setData((prev) => ({ ...prev, date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="deliveryDate" className="block font-medium mb-1">
              Estimated Delivery Date
            </label>
            <DatePicker
              id="deliveryDate"
              selected={data.deliveryDate}
              onChange={(date) => setData((prev) => ({ ...prev, deliveryDate: date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="jobType" className="block font-medium mb-1">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={data.jobType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Select Job Type</option>
              {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block font-medium mb-1">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              placeholder="Enter the required quantity"
              value={data.quantity}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="paperProvided" className="block font-medium mb-1">
              Paper Provided
            </label>
            <select
              id="paperProvided"
              name="paperProvided"
              value={data.paperProvided}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Paper Provided?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label htmlFor="paperName" className="block font-medium mb-1">
              Paper Name
            </label>
            <select
              id="paperName"
              name="paperName"
              value={data.paperName}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Select Paper Name</option>
              {["Wild 450", "Wild 650"].map((paper, index) => (
                <option key={index} value={paper}>
                  {paper}
                </option>
              ))}
            </select>
          </div>

          {/* Die Selection */}
          <div>
            <label htmlFor="dieSelection" className="block font-medium mb-1">
              Die Selection
            </label>
            <button
              id="dieSelection"
              type="button"
              onClick={() => setShowDiePopup(true)}
              className="border rounded-md p-2 bg-gray-100 w-full"
            >
              {data.dieSelection || "Select Die"}
            </button>
          </div>

          <div>
            <label htmlFor="dieNo" className="block font-medium mb-1">
              Die Number
            </label>
            <input
              id="dieNo"
              type="text"
              name="dieNo"
              value={data.dieNo}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              readOnly
            />
          </div>

          <div className="flex space-x-4">
            <div className="w-full">
              <label htmlFor="length" className="block font-medium mb-1">
                Die Size (Length)
              </label>
              <input
                id="length"
                type="number"
                name="length"
                placeholder="Die Size (L)"
                value={data.dieSize.length}
                onChange={handleNestedChange}
                className="border rounded-md p-2 w-full"
                readOnly
              />
            </div>
            <div className="w-full">
              <label htmlFor="breadth" className="block font-medium mb-1">
                Die Size (Breadth)
              </label>
              <input
                id="breadth"
                type="number"
                name="breadth"
                placeholder="Die Size (B)"
                value={data.dieSize.breadth}
                onChange={handleNestedChange}
                className="border rounded-md p-2 w-full"
                readOnly
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block font-medium mb-1">
              Die Image
            </label>
            <img
              id="image"
              src={data.image || "https://via.placeholder.com/150"}
              alt="Die"
              className="w-40 h-40 object-contain border"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Next
          </button>
        </div>
      </form>

      {/* Die Selection Popup */}
      {showDiePopup && (
        <DieSelectionPopup
          onClose={() => setShowDiePopup(false)}
          onSelect={handleDieSelect}
          onAddNewDie={() => setShowAddDiePopup(true)}
        />
      )}

      {/* Add Die Popup */}
      {showAddDiePopup && (
        <AddDieFormForPopup
          onAddDie={handleAddDieSuccess}
          storage={storage}
          onClose={() => setShowAddDiePopup(false)}
        />
      )}
    </div>
  );
};

export default OrderAndPaper;