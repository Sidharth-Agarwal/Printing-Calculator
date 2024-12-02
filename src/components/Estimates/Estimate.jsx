import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const EstimatesDB = () => {
  const [estimates, setEstimates] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    const estimatesCollection = collection(db, "billing");
    const unsubscribe = onSnapshot(estimatesCollection, (snapshot) => {
      const estimatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEstimates(estimatesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded shadow min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Estimates Database</h1>
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Client Name",
                "Date",
                "Delivery Date",
                "Job Type",
                "Quantity",
                "Paper Provided",
                "Paper Name",
                "Die Selection",
                "Die Number",
                "Die Size",
                "LP Usage",
                "No. of Colors",
                "Plate Size",
                "Plate Type",
                "LP Ink Types",
                "LP MR",
                "FS Usage",
                "FS Type",
                "Block Size",
                "Block Type",
                "Foil Types",
                "FS MR",
                "EMB Usage",
                "EMB Plate Size",
                "EMB Male Plate Type",
                "EMB Female Plate Type",
                "EMB MR",
                "Digi Usage",
                "Digi Die",
                "DC Difficulty",
                "PDC",
                "DC MR",
                "Final Notes",
              ].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => (
              <tr key={estimate.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{estimate.clientName || ""}</td>
                <td className="px-4 py-2">{estimate.date || ""}</td>
                <td className="px-4 py-2">{estimate.deliveryDate || ""}</td>
                <td className="px-4 py-2">{estimate.jobType || ""}</td>
                <td className="px-4 py-2">{estimate.quantity || ""}</td>
                <td className="px-4 py-2">{estimate.paperProvided || ""}</td>
                <td className="px-4 py-2">{estimate.paperName || ""}</td>
                <td className="px-4 py-2">{estimate.dieSelection || ""}</td>
                <td className="px-4 py-2">{estimate.dieNumber || ""}</td>
                <td className="px-4 py-2">{estimate.dieSize || ""}</td>
                <td className="px-4 py-2">{estimate.lpUsage || ""}</td>
                <td className="px-4 py-2">{estimate.numOfColors || ""}</td>
                <td className="px-4 py-2">{estimate.plateSize || ""}</td>
                <td className="px-4 py-2">{estimate.plateType || ""}</td>
                <td className="px-4 py-2">{estimate.lpInkTypes || ""}</td>
                <td className="px-4 py-2">{estimate.lpMR || ""}</td>
                <td className="px-4 py-2">{estimate.fsUsage || ""}</td>
                <td className="px-4 py-2">{estimate.fsType || ""}</td>
                <td className="px-4 py-2">{estimate.blockSize || ""}</td>
                <td className="px-4 py-2">{estimate.blockType || ""}</td>
                <td className="px-4 py-2">{estimate.foilTypes || ""}</td>
                <td className="px-4 py-2">{estimate.fsMR || ""}</td>
                <td className="px-4 py-2">{estimate.embUsage || ""}</td>
                <td className="px-4 py-2">{estimate.embPlateSize || ""}</td>
                <td className="px-4 py-2">{estimate.embMalePlateType || ""}</td>
                <td className="px-4 py-2">{estimate.embFemalePlateType || ""}</td>
                <td className="px-4 py-2">{estimate.embMR || ""}</td>
                <td className="px-4 py-2">{estimate.digiUsage || ""}</td>
                <td className="px-4 py-2">{estimate.digiDie || ""}</td>
                <td className="px-4 py-2">{estimate.dcDifficulty || ""}</td>
                <td className="px-4 py-2">{estimate.pdc || ""}</td>
                <td className="px-4 py-2">{estimate.dcMR || ""}</td>
                <td className="px-4 py-2">{estimate.finalNotes || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimatesDB