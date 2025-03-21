// // import React from "react";

// // /**
// //  * Reusable table component with common styling and features
// //  */
// // const Table = ({ 
// //   headers, 
// //   data, 
// //   onRowClick,
// //   renderActions,
// //   emptyMessage = "No data available",
// //   className = ""
// // }) => {
// //   return (
// //     <div className={`overflow-x-auto ${className}`}>
// //       <table className="w-full border-collapse text-sm">
// //         <thead className="bg-gray-100">
// //           <tr>
// //             {headers.map((header, idx) => (
// //               <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
// //                 {header}
// //               </th>
// //             ))}
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {data.length > 0 ? (
// //             data.map((row, rowIndex) => (
// //               <tr 
// //                 key={row.id || rowIndex} 
// //                 className="border-t hover:bg-gray-50 cursor-pointer"
// //                 onClick={() => onRowClick && onRowClick(row)}
// //               >
// //                 {Object.keys(row)
// //                   .filter(key => key !== 'id' && key !== 'actions')
// //                   .map((key, cellIndex) => (
// //                     <td key={cellIndex} className="px-4 py-2">
// //                       {/* Handle image display */}
// //                       {key === "imageUrl" && row[key] ? (
// //                         <img src={row[key]} alt="Item" className="w-12 h-12 object-cover" />
// //                       ) : (
// //                         // Format date if needed
// //                         key.toLowerCase().includes('date') && row[key] instanceof Date ? 
// //                           row[key].toLocaleDateString() : 
// //                           row[key]
// //                       )}
// //                     </td>
// //                   ))}
// //                 {/* Actions column */}
// //                 {renderActions && (
// //                   <td className="px-4 py-2">
// //                     {renderActions(row)}
// //                   </td>
// //                 )}
// //               </tr>
// //             ))
// //           ) : (
// //             <tr>
// //               <td 
// //                 colSpan={headers.length} 
// //                 className="px-4 py-4 text-center text-gray-500"
// //               >
// //                 {emptyMessage}
// //               </td>
// //             </tr>
// //           )}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // };

// // export default Table;

// import React from "react";

// /**
//  * Reusable table component with common styling and features
//  * With added support for Firestore timestamp objects
//  */
// const Table = ({ 
//   headers, 
//   data, 
//   onRowClick,
//   renderActions,
//   emptyMessage = "No data available",
//   className = ""
// }) => {
//   // Helper function to handle different types of values including Firestore timestamps
//   const formatCellValue = (key, value) => {
//     // Return placeholder for null/undefined values
//     if (value === null || value === undefined) {
//       return "-";
//     }
    
//     // Handle image URLs
//     if (key === "imageUrl" && value) {
//       return <img src={value} alt="Item" className="w-12 h-12 object-cover" />;
//     }
    
//     // Handle dates & timestamps
//     if (key.toLowerCase().includes('date') || key.toLowerCase() === 'timestamp') {
//       // Check if it's a JavaScript Date
//       if (value instanceof Date) {
//         return value.toLocaleDateString();
//       }
      
//       // Check if it's a Firestore timestamp (has seconds and nanoseconds)
//       if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
//         const date = new Date(value.seconds * 1000);
//         return date.toLocaleDateString();
//       }
//     }
    
//     // Handle other objects that need special rendering
//     if (typeof value === 'object' && value !== null) {
//       // If it has length and breadth, it's probably dimensions
//       if ('length' in value && 'breadth' in value) {
//         return `${value.length || '-'} x ${value.breadth || '-'}`;
//       }
      
//       // For other objects, convert to JSON string
//       try {
//         return JSON.stringify(value);
//       } catch (error) {
//         return '[Complex Object]';
//       }
//     }
    
//     // Default for all other values
//     return String(value);
//   };

//   return (
//     <div className={`overflow-x-auto ${className}`}>
//       <table className="w-full border-collapse text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             {headers.map((header, idx) => (
//               <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.length > 0 ? (
//             data.map((row, rowIndex) => (
//               <tr 
//                 key={row.id || rowIndex} 
//                 className="border-t hover:bg-gray-50 cursor-pointer"
//                 onClick={() => onRowClick && onRowClick(row)}
//               >
//                 {Object.keys(row)
//                   .filter(key => key !== 'id' && key !== 'actions')
//                   .map((key, cellIndex) => (
//                     <td key={cellIndex} className="px-4 py-2">
//                       {formatCellValue(key, row[key])}
//                     </td>
//                   ))}
//                 {/* Actions column */}
//                 {renderActions && (
//                   <td className="px-4 py-2">
//                     {renderActions(row)}
//                   </td>
//                 )}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td 
//                 colSpan={headers.length} 
//                 className="px-4 py-4 text-center text-gray-500"
//               >
//                 {emptyMessage}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Table;

import React from "react";

/**
 * Reusable table component with comprehensive header-to-field mapping for all management components
 */
const Table = ({ 
  headers, 
  data, 
  onRowClick,
  renderActions,
  emptyMessage = "No data available",
  className = ""
}) => {
  // This map contains the mapping from header text to field names for all table types
  const headerToFieldMap = {
    // Material Management
    "Material Type": "materialType",
    "Material Name": "materialName",
    "Rate": "rate",
    "Quantity": "quantity", 
    "Size (L)": "sizeL",
    "Size (B)": "sizeB",
    "Courier Cost": "courier",
    "Mark Up": "markUp",
    "Area": "area",
    "Landed Cost": "landedCost",
    "Cost/Unit": "costPerUnit",
    "Final Cost/Unit": "finalCostPerUnit",
    
    // Paper Management
    "Date": "timestamp",
    "Paper Name": "paperName",
    "Company": "company",
    "GSM": "gsm",
    "Price/Sheet": "pricePerSheet",
    "Length": "length",
    "Breadth": "breadth",
    "Freight/KG": "freightPerKg",
    "Rate/Gram": "ratePerGram",
    "1 Sqcm in Gram": "oneSqcmInGram",
    "GSM/Sheet": "gsmPerSheet",
    "Freight/Sheet": "freightPerSheet",
    "Final Rate": "finalRate",
    
    // Die Management
    "Job Type": "jobType",
    "Type": "type", 
    "Die Code": "dieCode",
    "Frags": "frags",
    "Product L": "productSizeL",
    "Product B": "productSizeB",
    "Die L": "dieSizeL",
    "Die B": "dieSizeB",
    "Price (INR)": "price",
    "Image": "imageUrl",
    
    // Standard Rate Management
    "Group": "group",
    "Concatenate": "concatenate",
    "Final Rate (INR)": "finalRate"
  };

  /**
   * Format cell value based on field type and data
   */
  const formatCellValue = (fieldName, value) => {
    // Handle null/undefined values
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    
    // Handle Firestore timestamps
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000).toLocaleDateString();
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    // Handle image URLs
    if (fieldName === "imageUrl") {
      return <img src={value} alt="Item" className="w-12 h-12 object-cover" />;
    }
    
    // Handle dimension objects
    if (typeof value === 'object' && value !== null) {
      if ('length' in value && 'breadth' in value) {
        return `${value.length || '-'} x ${value.breadth || '-'}`;
      }
      
      // For other objects, stringify them
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Object]';
      }
    }
    
    // Return string representation for primitives
    return String(value);
  };

  /**
   * Get field value from row based on header
   */
  const getFieldValue = (row, header) => {
    // Skip the Actions header
    if (header === "Actions") return null;
    
    // Get the field name from the mapping
    const fieldName = headerToFieldMap[header] || 
                     header.toLowerCase().replace(/\s+(\w)/g, (_, c) => c.toUpperCase()).replace(/\s+/g, '');
    
    // Try direct access with the mapped field name
    if (row[fieldName] !== undefined) {
      return formatCellValue(fieldName, row[fieldName]);
    }
    
    // Special case for Date that might be stored as timestamp
    if (header === "Date" && row.timestamp) {
      return formatCellValue("timestamp", row.timestamp);
    }
    
    // Special handling for product/die dimensions that might have different naming
    if (header === "Product L") return formatCellValue(fieldName, row.productSizeL || row.productL);
    if (header === "Product B") return formatCellValue(fieldName, row.productSizeB || row.productB);
    if (header === "Die L") return formatCellValue(fieldName, row.dieSizeL || row.dieL);
    if (header === "Die B") return formatCellValue(fieldName, row.dieSizeB || row.dieB);
    
    // Return placeholder for missing data
    return "-";
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {/* Map data cells based on headers */}
                {headers.map((header, idx) => {
                  // Skip Actions column as it's handled separately
                  if (header === "Actions") return null;
                  
                  return (
                    <td key={idx} className="px-4 py-2">
                      {getFieldValue(row, header)}
                    </td>
                  );
                })}
                
                {/* Render Actions column if provided */}
                {renderActions && (
                  <td className="px-4 py-2">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={headers.length} 
                className="px-4 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;