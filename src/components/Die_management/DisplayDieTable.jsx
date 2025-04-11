import React from "react";

const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Available Dies</h2>
      <div className="overflow-x-auto">
        <table className="text-sm w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Job Type",
                "Type",
                "Die Code",
                "Frags",
                "Product L",
                "Product B",
                "Die L",
                "Die B",
                // "Paper L",
                // "Paper B",
                // "Plate L",
                // "Plate B",
                // "CLSD L",
                // "CLSD B",
                "Price (INR)",
                "Image",
                "Actions",
              ].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dies.map((die) => (
              <tr key={die.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{die.jobType}</td>
                <td className="px-4 py-2">{die.type}</td>
                <td className="px-4 py-2">{die.dieCode}</td>
                <td className="px-4 py-2">{die.frags}</td>
                <td className="px-4 py-2">{die.productSizeL}</td>
                <td className="px-4 py-2">{die.productSizeB}</td>
                <td className="px-4 py-2">{die.dieSizeL}</td>
                <td className="px-4 py-2">{die.dieSizeB}</td>
                {/* <td className="px-4 py-2">{die.paperSizeL}</td>
                <td className="px-4 py-2">{die.paperSizeB}</td> */}
                {/* <td className="px-4 py-2">{die.plateSizeL}</td>
                <td className="px-4 py-2">{die.plateSizeB}</td>
                <td className="px-4 py-2">{die.clsdPrintSizeL}</td>
                <td className="px-4 py-2">{die.clsdPrintSizeB}</td> */}
                <td className="px-4 py-2">{die.price}</td> {/* Add price to table row */}
                <td className="px-4 py-2">
                  {die.imageUrl ? (
                    <img src={die.imageUrl} alt="Die" className="w-12 h-12 object-cover" />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onEditDie(die)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteDie(die.id)}
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

export default DisplayDieTable;
