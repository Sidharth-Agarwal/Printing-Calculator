import React from 'react';

const SectionDetailsPanel = ({ data, sectionType }) => {
  // Helper function to convert object with numeric keys to array
  const objectToArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    
    // If it's an object with numeric keys, convert to array
    if (typeof obj === 'object') {
      // Check if it has numeric keys (0, 1, 2, etc.)
      const keys = Object.keys(obj);
      const isNumericKeys = keys.every(key => !isNaN(parseInt(key)));
      
      if (isNumericKeys) {
        return Object.values(obj);
      }
    }
    
    return [];
  };
  
  // Helper function for formatting dimensions
  const formatDimensions = (dimensions) => {
    if (!dimensions) return "Not specified";
    if (typeof dimensions === "string") return dimensions;
    
    // Prioritize inches format if available
    if (dimensions.lengthInInches && dimensions.breadthInInches) {
      return `${dimensions.lengthInInches}" × ${dimensions.breadthInInches}"`;
    }
    
    // Fall back to standard cm format
    const length = dimensions.length || "";
    const breadth = dimensions.breadth || "";
    
    if (!length && !breadth) return "Not specified";
    return `${length} × ${breadth} cm`;
  };  

  // Handle rendering LP details (Letterpress)
  const renderLPDetailsTable = () => {
    if (!data || !data.isLPUsed) return null;
    
    // Convert colorDetails to array if it's an object
    const colorDetails = objectToArray(data.colorDetails);
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-2 rounded-md">
          <h3 className="font-semibold">Letterpress Details (LP)</h3>
          <p className="text-sm text-gray-600">Number of Colors: {data.noOfColors || 0}</p>
        </div>
        
        {colorDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color #</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pantone</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Type</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Size</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {colorDetails.map((color, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">{index + 1}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{color.pantoneType || "Not specified"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{color.plateType || "Not specified"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{color.plateSizeType || "Auto"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{formatDimensions(color.plateDimensions)}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{color.mrType || "Not specified"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No color details available</p>
        )}
      </div>
    );
  };

  // Handle rendering FS details (Foil Stamping)
  const renderFSDetailsTable = () => {
    if (!data || !data.isFSUsed) return null;
    
    // Convert foilDetails to array if it's an object
    const foilDetails = objectToArray(data.foilDetails);
    
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-2 rounded-md">
          <h3 className="font-semibold">Foil Stamping Details (FS)</h3>
          <p className="text-sm text-gray-600">FS Type: {data.fsType || "Not specified"}</p>
          <p className="text-sm text-gray-600">Number of Foils: {foilDetails.length}</p>
        </div>
        
        {foilDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foil #</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foil Type</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Type</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Size</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {foilDetails.map((foil, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">{index + 1}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{foil.foilType || "Not specified"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{foil.blockType || "Not specified"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{foil.blockSizeType || "Auto"}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{formatDimensions(foil.blockDimension)}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{foil.mrType || "Not specified"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No foil details available</p>
        )}
      </div>
    );
  };

  // Handle rendering EMB details (Embossing)
  const renderEMBDetailsTable = () => {
    if (!data || !data.isEMBUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 p-2 rounded-md">
          <h3 className="font-semibold">Embossing Details (EMB)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Plate Size Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.plateSizeType || "Auto"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Plate Dimensions</td>
                <td className="py-2 px-3 text-sm text-gray-500">{formatDimensions(data.plateDimensions)}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Male Plate Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.plateTypeMale || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Female Plate Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.plateTypeFemale || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.embMR || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Handle rendering Digital Printing details
  const renderDigiDetailsTable = () => {
    if (!data || !data.isDigiUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 p-2 rounded-md">
          <h3 className="font-semibold">Digital Printing Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Die Size</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.digiDie || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Dimensions</td>
                <td className="py-2 px-3 text-sm text-gray-500">{formatDimensions(data.digiDimensions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Screen Printing details
  const renderScreenPrintTable = () => {
    if (!data || !data.isScreenPrintUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 p-2 rounded-md">
          <h3 className="font-semibold">Screen Printing Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Screen Printing Enabled</td>
                <td className="py-2 px-3 text-sm text-gray-500">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Handle rendering Die Cutting details
  const renderDieCuttingTable = () => {
    if (!data || !data.isDieCuttingUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-orange-50 p-2 rounded-md">
          <h3 className="font-semibold">Die Cutting Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.dcMR || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Concatenated</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.dcMRConcatenated || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Post Die Cutting details
  const renderPostDCTable = () => {
    if (!data || !data.isPostDCUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-red-50 p-2 rounded-md">
          <h3 className="font-semibold">Post Die Cutting Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.pdcMR || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Concatenated</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.pdcMRConcatenated || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Fold & Paste details
  const renderFoldAndPasteTable = () => {
    if (!data || !data.isFoldAndPasteUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-teal-50 p-2 rounded-md">
          <h3 className="font-semibold">Fold & Paste Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">DST Material</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.dstMaterial || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">DST Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.dstType || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render DST Paste details
  const renderDstPasteTable = () => {
    if (!data || !data.isDstPasteUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-pink-50 p-2 rounded-md">
          <h3 className="font-semibold">DST Paste Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">DST Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.dstType || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Magnet details
  const renderMagnetTable = () => {
    if (!data || !data.isMagnetUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-2 rounded-md">
          <h3 className="font-semibold">Magnet Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Magnet Material</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.magnetMaterial || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render QC details
  const renderQCTable = () => {
    if (!data || !data.isQCUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-2 rounded-md">
          <h3 className="font-semibold">Quality Control Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Quality Control Enabled</td>
                <td className="py-2 px-3 text-sm text-gray-500">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Packing details
  const renderPackingTable = () => {
    if (!data || !data.isPackingUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-2 rounded-md">
          <h3 className="font-semibold">Packing Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Packing Enabled</td>
                <td className="py-2 px-3 text-sm text-gray-500">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Misc details
  const renderMiscTable = () => {
    if (!data || !data.isMiscUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-2 rounded-md">
          <h3 className="font-semibold">Miscellaneous Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Misc Charge</td>
                <td className="py-2 px-3 text-sm text-gray-500">₹ {data.miscCharge || "0"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Notebook details
  const renderNotebookTable = () => {
    if (!data || !data.isNotebookUsed) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 p-2 rounded-md">
          <h3 className="font-semibold">Notebook Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Orientation</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.orientation || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Dimensions</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.length || "0"} × {data.breadth || "0"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Number of Pages</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.numberOfPages || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Binding Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.bindingType || "Not specified"}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">Paper Type</td>
                <td className="py-2 px-3 text-sm text-gray-500">{data.paperName || "Not specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render Sandwich component details
  const renderSandwichTable = () => {
    if (!data || !data.isSandwichComponentUsed) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-2 rounded-md">
          <h3 className="font-semibold">Duplex/Sandwich Details</h3>
        </div>
        
        {/* Paper Information */}
        {data.paperInfo && (
          <div className="mb-4">
            <div className="bg-green-50 p-2 rounded-md mb-2 border-l-4 border-green-400 pl-3">
              <h4 className="font-medium">Sandwich Paper Details</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">Paper Name</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{data.paperInfo.paperName || "Not specified"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Sandwich LP Details */}
        {data.lpDetailsSandwich && data.lpDetailsSandwich.isLPUsed && (
          <div className="mb-4">
            <div className="bg-blue-50 p-2 rounded-md mb-2 border-l-4 border-blue-400 pl-3">
              <h4 className="font-medium">Sandwich LP Details</h4>
              <p className="text-sm text-gray-600">Number of Colors: {data.lpDetailsSandwich.noOfColors || 0}</p>
            </div>
            
            {objectToArray(data.lpDetailsSandwich.colorDetails).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-md">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color #</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pantone</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Type</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Size</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objectToArray(data.lpDetailsSandwich.colorDetails).map((color, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm font-medium text-gray-700">{index + 1}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{color.pantoneType || "Not specified"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{color.plateType || "Not specified"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{color.plateSizeType || "Auto"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">
                          {/* Display the dimensions in both inches and cm if available */}
                          {color.plateDimensions?.lengthInInches 
                            ? `${color.plateDimensions.lengthInInches}" × ${color.plateDimensions.breadthInInches}"` 
                            : formatDimensions(color.plateDimensions)}
                          {color.plateDimensions?.length && color.plateDimensions?.lengthInInches
                            ? ` (${color.plateDimensions.length} × ${color.plateDimensions.breadth} cm)`
                            : ""}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-500">{color.mrType || "Not specified"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No color details available for Sandwich LP</p>
            )}
          </div>
        )}
        
        {/* Sandwich FS Details */}
        {data.fsDetailsSandwich && data.fsDetailsSandwich.isFSUsed && (
          <div className="mb-4">
            <div className="bg-yellow-50 p-2 rounded-md mb-2 border-l-4 border-yellow-400 pl-3">
              <h4 className="font-medium">Sandwich FS Details</h4>
              <p className="text-sm text-gray-600">FS Type: {data.fsDetailsSandwich.fsType || "Not specified"}</p>
              <p className="text-sm text-gray-600">Number of Foils: {objectToArray(data.fsDetailsSandwich.foilDetails).length}</p>
            </div>
            
            {objectToArray(data.fsDetailsSandwich.foilDetails).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-md">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foil #</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foil Type</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Type</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Size</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objectToArray(data.fsDetailsSandwich.foilDetails).map((foil, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm font-medium text-gray-700">{index + 1}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{foil.foilType || "Not specified"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{foil.blockType || "Not specified"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{foil.blockSizeType || "Auto"}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">
                          {/* Display the dimensions in both inches and cm if available */}
                          {foil.blockDimension?.lengthInInches 
                            ? `${foil.blockDimension.lengthInInches}" × ${foil.blockDimension.breadthInInches}"` 
                            : formatDimensions(foil.blockDimension)}
                          {foil.blockDimension?.length && foil.blockDimension?.lengthInInches
                            ? ` (${foil.blockDimension.length} × ${foil.blockDimension.breadth} cm)`
                            : ""}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-500">{foil.mrType || "Not specified"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No foil details available for Sandwich FS</p>
            )}
          </div>
        )}
        
        {/* Sandwich EMB Details */}
        {data.embDetailsSandwich && data.embDetailsSandwich.isEMBUsed && (
          <div className="mb-4">
            <div className="bg-purple-50 p-2 rounded-md mb-2 border-l-4 border-purple-400 pl-3">
              <h4 className="font-medium">Sandwich EMB Details</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">Plate Size Type</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{data.embDetailsSandwich.plateSizeType || "Auto"}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">Plate Dimensions</td>
                    <td className="py-2 px-3 text-sm text-gray-500">
                      {/* Display the dimensions in both inches and cm if available */}
                      {data.embDetailsSandwich.plateDimensions?.lengthInInches 
                        ? `${data.embDetailsSandwich.plateDimensions.lengthInInches}" × ${data.embDetailsSandwich.plateDimensions.breadthInInches}"` 
                        : formatDimensions(data.embDetailsSandwich.plateDimensions)}
                      {data.embDetailsSandwich.plateDimensions?.length && data.embDetailsSandwich.plateDimensions?.lengthInInches
                        ? ` (${data.embDetailsSandwich.plateDimensions.length} × ${data.embDetailsSandwich.plateDimensions.breadth} cm)`
                        : ""}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">Male Plate Type</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{data.embDetailsSandwich.plateTypeMale || "Not specified"}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">Female Plate Type</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{data.embDetailsSandwich.plateTypeFemale || "Not specified"}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-700">MR Type</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{data.embDetailsSandwich.embMR || "Not specified"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };  

  // Choose the correct rendering method based on section type
  const renderSectionContent = () => {
    switch(sectionType) {
      case 'lpDetails':
        return renderLPDetailsTable();
      case 'fsDetails':
        return renderFSDetailsTable();
      case 'embDetails':
        return renderEMBDetailsTable();
      case 'digiDetails':
        return renderDigiDetailsTable();
      case 'screenPrint':
        return renderScreenPrintTable();
      case 'dieCutting':
        return renderDieCuttingTable();
      case 'postDC':
        return renderPostDCTable();
      case 'foldAndPaste':
        return renderFoldAndPasteTable();
      case 'dstPaste':
        return renderDstPasteTable();
      case 'magnet':
        return renderMagnetTable();
      case 'qc':
        return renderQCTable();
      case 'packing':
        return renderPackingTable();
      case 'misc':
        return renderMiscTable();
      case 'notebookDetails':
        return renderNotebookTable();
      case 'sandwich':
        return renderSandwichTable();
      default:
        return <p className="text-gray-500 italic">No details available for this section</p>;
    }
  };

  // Check if this section is used/enabled
  const isSectionUsed = () => {
    if (!data) return false;
    
    // Check the appropriate usage field based on section type
    switch(sectionType) {
      case 'lpDetails':
        return data.isLPUsed === true;
      case 'fsDetails':
        return data.isFSUsed === true;
      case 'embDetails':
        return data.isEMBUsed === true;
      case 'digiDetails':
        return data.isDigiUsed === true;
      case 'screenPrint':
        return data.isScreenPrintUsed === true;
      case 'dieCutting':
        return data.isDieCuttingUsed === true;
      case 'postDC':
        return data.isPostDCUsed === true;
      case 'foldAndPaste':
        return data.isFoldAndPasteUsed === true;
      case 'dstPaste':
        return data.isDstPasteUsed === true;
      case 'magnet':
        return data.isMagnetUsed === true;
      case 'qc':
        return data.isQCUsed === true;
      case 'packing':
        return data.isPackingUsed === true;
      case 'misc':
        return data.isMiscUsed === true;
      case 'notebookDetails':
        return data.isNotebookUsed === true;
      case 'sandwich':
        return data.isSandwichComponentUsed === true;
      default:
        return false;
    }
  };

  // If section is not used, don't render anything
  if (!isSectionUsed()) {
    return null;
  }

  return (
    <div className="mb-4">
      {renderSectionContent()}
    </div>
  );
};

export default SectionDetailsPanel;