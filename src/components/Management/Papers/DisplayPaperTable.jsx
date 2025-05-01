import React from "react";

const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
  // Sort papers alphabetically by paper name
  const sortedPapers = [...papers].sort((a, b) => 
    (a.paperName || '').localeCompare(b.paperName || '')
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Available Papers</h2>
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
                <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPapers.map((paper) => (
              <tr key={paper.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {paper.timestamp?.seconds 
                    ? new Date(paper.timestamp.seconds * 1000).toLocaleDateString() 
                    : "-"}
                </td>
                <td className="px-4 py-2">{paper.paperName || "-"}</td>
                <td className="px-4 py-2">{paper.company || "-"}</td>
                <td className="px-4 py-2">{paper.gsm || "-"}</td>
                <td className="px-4 py-2">{paper.pricePerSheet || "-"}</td>
                <td className="px-4 py-2">{paper.length || "-"}</td>
                <td className="px-4 py-2">{paper.breadth || "-"}</td>
                <td className="px-4 py-2">{paper.freightPerKg || "-"}</td>
                <td className="px-4 py-2">{paper.ratePerGram || "-"}</td>
                <td className="px-4 py-2">{paper.area || "-"}</td>
                <td className="px-4 py-2">{paper.oneSqcmInGram || "-"}</td>
                <td className="px-4 py-2">{paper.gsmPerSheet || "-"}</td>
                <td className="px-4 py-2">{paper.freightPerSheet || "-"}</td>
                <td className="px-4 py-2">{paper.finalRate || "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditPaper(paper)}
                      className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeletePaper(paper.id)}
                      className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
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