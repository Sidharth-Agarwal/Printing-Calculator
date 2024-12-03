// import React from "react";

// const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-2xl font-bold mb-6">Papers Available</h2>
//       <div className="overflow-x-auto">
//         <table className="text-sm w-full text-left border-collapse">
//           <thead className="bg-gray-100">
//             <tr>
//               {[
//                 "Date",
//                 "Paper Name",
//                 "Company",
//                 "GSM",
//                 "Price",
//                 "Price/Sheet",
//                 "Length",
//                 "Breadth",
//                 "Freight/KG",
//                 "Rate/Gram",
//                 "Area",
//                 "1 Sqcm in Gram",
//                 "GSM/Sheet",
//                 "Freight/Sheet",
//                 "Final Rate",
//                 "Actions",
//               ].map((header, idx) => (
//                 <th key={idx} className="px-4 py-2 border">
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {papers.map((paper) => (
//               <tr key={paper.id} className="border-t hover:bg-gray-50">
//                 <td className="px-4 py-2">
//                   {new Date(paper.timestamp?.seconds * 1000).toLocaleDateString()}
//                 </td>
//                 <td className="px-4 py-2">{paper.paperName}</td>
//                 <td className="px-4 py-2">{paper.company}</td>
//                 <td className="px-4 py-2">{paper.gsm}</td>
//                 <td className="px-4 py-2">{paper.price}</td> {/* Add price here */}
//                 <td className="px-4 py-2">{paper.pricePerSheet}</td>
//                 <td className="px-4 py-2">{paper.length}</td>
//                 <td className="px-4 py-2">{paper.breadth}</td>
//                 <td className="px-4 py-2">{paper.freightPerKg}</td>
//                 <td className="px-4 py-2">{paper.ratePerGram}</td>
//                 <td className="px-4 py-2">{paper.area}</td>
//                 <td className="px-4 py-2">{paper.oneSqcmInGram}</td>
//                 <td className="px-4 py-2">{paper.gsmPerSheet}</td>
//                 <td className="px-4 py-2">{paper.freightPerSheet}</td>
//                 <td className="px-4 py-2">{paper.finalRate}</td>
//                 <td className="px-4 py-2">
//                   <button
//                     onClick={() => onEditPaper(paper)}
//                     className="text-blue-600 hover:underline mr-2"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => onDeletePaper(paper.id)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DisplayPaperTable;

import React from "react";

const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Papers Available</h2>
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Date",
                "Paper Name",
                "Company",
                "GSM",
                "Price/Sheet",
                "Length",
                "Breadth",
                "Freight/KG",
                "Rate/Gram",
                "Area",
                "1 Sqcm in Gram",
                "GSM/Sheet",
                "Freight/Sheet",
                "Final Rate",
                "Actions",
              ].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {new Date(paper.timestamp?.seconds * 1000).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{paper.paperName}</td>
                <td className="px-4 py-2">{paper.company}</td>
                <td className="px-4 py-2">{paper.gsm}</td>
                <td className="px-4 py-2">{paper.pricePerSheet}</td>
                <td className="px-4 py-2">{paper.length}</td>
                <td className="px-4 py-2">{paper.breadth}</td>
                <td className="px-4 py-2">{paper.freightPerKg}</td>
                <td className="px-4 py-2">{paper.ratePerGram}</td>
                <td className="px-4 py-2">{paper.area}</td>
                <td className="px-4 py-2">{paper.oneSqcmInGram}</td>
                <td className="px-4 py-2">{paper.gsmPerSheet}</td>
                <td className="px-4 py-2">{paper.freightPerSheet}</td>
                <td className="px-4 py-2">{paper.finalRate}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onEditPaper(paper)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePaper(paper.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayPaperTable;
