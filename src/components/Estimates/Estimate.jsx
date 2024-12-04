// import React, { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// const SectionWrapper = ({ title, children }) => (
//   <div className="border rounded-md p-4 bg-white shadow-md">
//     <h4 className="text-lg font-semibold mb-3">{title}</h4>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
//   </div>
// );

// const EstimatesPage = () => {
//   const [estimates, setEstimates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   useEffect(() => {
//     const fetchEstimates = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "estimates"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setEstimates(data);
//       } catch (error) {
//         console.error("Error fetching estimates:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstimates();
//   }, []);

//   const toggleDropdown = (id) => {
//     setOpenDropdown((prev) => (prev === id ? null : id));
//   };

//   if (loading) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>Loading estimates...</p>
//       </div>
//     );
//   }

//   if (estimates.length === 0) {
//     return (
//       <div className="text-center mt-8">
//         <h2 className="text-xl font-bold">Estimates DB</h2>
//         <p>No estimates available. Please create an estimate using the billing form.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto mt-8 space-y-6">
//       <h2 className="text-2xl font-bold mb-6">Estimates DB</h2>
//       {estimates.map((estimate) => (
//         <div
//           key={estimate.id}
//           onClick={() => toggleDropdown(estimate.id)}
//           className={`border rounded-lg p-4 shadow-md cursor-pointer transition-all ${
//             openDropdown === estimate.id ? "bg-blue-50" : "bg-white"
//           }`}
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-lg">
//               Estimate for {estimate.clientName} - {estimate.projectName}
//             </h3>
//           </div>

//           {openDropdown === estimate.id && (
//             <div className="mt-4 space-y-6">
//               <SectionWrapper title="Order and Paper">
//                 <p>
//                   <strong>Job Type:</strong> {estimate.jobDetails?.jobType}
//                 </p>
//                 <p>
//                   <strong>Quantity:</strong> {estimate.jobDetails?.quantity}
//                 </p>
//                 <p>
//                   <strong>Delivery Date:</strong> {estimate.deliveryDate}
//                 </p>
//                 <p>
//                   <strong>Paper Name:</strong> {estimate.jobDetails?.paperName}
//                 </p>
//                 <p>
//                   <strong>Paper Provided:</strong> {estimate.jobDetails?.paperProvided}
//                 </p>
//                 <p>
//                   <strong>Die Code:</strong> {estimate.dieDetails?.dieCode}
//                 </p>
//                 <p>
//                   <strong>Die Size:</strong> {estimate.dieDetails?.dieSize?.length} x{" "}
//                   {estimate.dieDetails?.dieSize?.breadth}
//                 </p>
//                 <div>
//                   <strong>Die Image:</strong>
//                   <img
//                     src={estimate.dieDetails?.image || "https://via.placeholder.com/200"}
//                     alt="Die"
//                     className="w-48 h-48 object-contain rounded-md border mt-2"
//                   />
//                 </div>
//               </SectionWrapper>

//               {estimate.lpDetails?.isLPUsed && (
//                 <SectionWrapper title="LP Details">
//                   <p>
//                     <strong>No. of Colors:</strong> {estimate.lpDetails?.noOfColors}
//                   </p>
//                   {estimate.lpDetails?.colorDetails?.map((color, index) => (
//                     <div key={index}>
//                       <p>
//                         <strong>Color {index + 1} Ink Type:</strong> {color.inkType}
//                       </p>
//                       <p>
//                         <strong>Plate Type:</strong> {color.plateType}
//                       </p>
//                       <p>
//                         <strong>MR Type:</strong> {color.mrType}
//                       </p>
//                     </div>
//                   ))}
//                 </SectionWrapper>
//               )}

//               {estimate.fsDetails?.isFSUsed && (
//                 <SectionWrapper title="FS Details">
//                   <p>
//                     <strong>FS Type:</strong> {estimate.fsDetails?.fsType}
//                   </p>
//                   {estimate.fsDetails?.foilDetails?.map((foil, index) => (
//                     <div key={index}>
//                       <p>
//                         <strong>Foil {index + 1} Type:</strong> {foil.foilType}
//                       </p>
//                       <p>
//                         <strong>Block Type:</strong> {foil.blockType}
//                       </p>
//                       <p>
//                         <strong>MR Type:</strong> {foil.mrType}
//                       </p>
//                     </div>
//                   ))}
//                 </SectionWrapper>
//               )}

//               {estimate.embDetails?.isEMBUsed && (
//                 <SectionWrapper title="EMB Details">
//                   <p>
//                     <strong>Plate Size Type:</strong> {estimate.embDetails?.plateSizeType}
//                   </p>
//                   {estimate.embDetails?.plateSizeType === "Manual" && (
//                     <p>
//                       <strong>Plate Dimensions:</strong>{" "}
//                       {estimate.embDetails?.plateDimensions?.length} x{" "}
//                       {estimate.embDetails?.plateDimensions?.breadth}
//                     </p>
//                   )}
//                   <p>
//                     <strong>Plate Type Male:</strong> {estimate.embDetails?.plateTypeMale}
//                   </p>
//                   <p>
//                     <strong>Plate Type Female:</strong> {estimate.embDetails?.plateTypeFemale}
//                   </p>
//                   <p>
//                     <strong>MR Type:</strong> {estimate.embDetails?.embMR}
//                   </p>
//                 </SectionWrapper>
//               )}

//               {estimate.digiDetails?.isDigiUsed && (
//                 <SectionWrapper title="Digi Details">
//                   <p>
//                     <strong>Digi Die:</strong> {estimate.digiDetails?.digiDie}
//                   </p>
//                 </SectionWrapper>
//               )}

//               {estimate.dieCuttingDetails?.isDieCuttingUsed && (
//                 <SectionWrapper title="Die Cutting">
//                   <p>
//                     <strong>Difficulty:</strong> {estimate.dieCuttingDetails?.difficulty}
//                   </p>
//                   <p>
//                     <strong>PDC:</strong> {estimate.dieCuttingDetails?.pdc}
//                   </p>
//                   {estimate.dieCuttingDetails?.pdc === "Yes" && (
//                     <p>
//                       <strong>DC MR:</strong> {estimate.dieCuttingDetails?.dcMR}
//                     </p>
//                   )}
//                 </SectionWrapper>
//               )}

//               {estimate.sandwichDetails?.isSandwichComponentUsed && (
//                 <SectionWrapper title="Sandwich">
//                   <p>
//                     <strong>Is Sandwich Component Used:</strong>{" "}
//                     {estimate.sandwichDetails?.isSandwichComponentUsed ? "Yes" : "No"}
//                   </p>
//                 </SectionWrapper>
//               )}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EstimatesPage;

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const EstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedEstimates, setGroupedEstimates] = useState({});
  const [editingEstimate, setEditingEstimate] = useState(null); // Holds the estimate being edited

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group estimates by clientName, projectName, and jobType
        const grouped = data.reduce((acc, estimate) => {
          const { clientName, projectName, jobDetails } = estimate;
          const { jobType } = jobDetails;

          if (!acc[clientName]) acc[clientName] = {};
          if (!acc[clientName][projectName]) acc[clientName][projectName] = {};
          if (!acc[clientName][projectName][jobType]) {
            acc[clientName][projectName][jobType] = [];
          }

          acc[clientName][projectName][jobType].push(estimate);
          return acc;
        }, {});

        setEstimates(data);
        setGroupedEstimates(grouped);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const handleEditEstimate = (estimate) => {
    setEditingEstimate(estimate); // Open editing form with the estimate data
  };

  const handleSaveEditedEstimate = async (editedEstimate) => {
    try {
      const version = (editedEstimate.version || 0) + 1; // Increment version
      const newEstimate = { ...editedEstimate, version }; // Add version to estimate

      // Save the new estimate in Firebase
      await addDoc(collection(db, "estimates"), newEstimate);

      // Update local state with the new estimate
      setEstimates((prev) => [...prev, newEstimate]);

      alert("Estimate updated successfully!");
      setEditingEstimate(null); // Close editing form
    } catch (error) {
      console.error("Error saving edited estimate:", error);
      alert("Failed to update estimate.");
    }
  };

  const renderEstimate = (estimate) => (
    <div
      key={estimate.id}
      className="border rounded-md p-4 bg-white shadow-md flex justify-between items-center"
    >
      <div>
        <p>
          <strong>Version:</strong> {estimate.version || 1}
        </p>
        <p>
          <strong>Quantity:</strong> {estimate.jobDetails?.quantity}
        </p>
        <p>
          <strong>Delivery Date:</strong> {estimate.deliveryDate}
        </p>
      </div>
      <button
        onClick={() => handleEditEstimate(estimate)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Edit
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>Loading estimates...</p>
      </div>
    );
  }

  if (Object.keys(groupedEstimates).length === 0) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>No estimates available. Please create an estimate using the billing form.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Estimates DB</h2>
      {editingEstimate && (
        <EditEstimateForm
          estimate={editingEstimate}
          onSave={handleSaveEditedEstimate}
          onCancel={() => setEditingEstimate(null)}
        />
      )}
      {Object.entries(groupedEstimates).map(([clientName, projects]) => (
        <div key={clientName} className="mb-6">
          <h3 className="text-xl font-bold mb-4">{clientName}</h3>
          {Object.entries(projects).map(([projectName, jobTypes]) => (
            <div key={projectName} className="mb-4">
              <h4 className="text-lg font-semibold mb-3">{projectName}</h4>
              {Object.entries(jobTypes).map(([jobType, estimates]) => (
                <div key={jobType} className="mb-4">
                  <h5 className="text-md font-semibold mb-2">Job Type: {jobType}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estimates.map(renderEstimate)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const EditEstimateForm = ({ estimate, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...estimate });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] max-w-4xl"
      >
        <h2 className="text-2xl font-bold mb-6">Edit Estimate</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.jobDetails?.quantity || ""}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate || ""}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstimatesPage;
