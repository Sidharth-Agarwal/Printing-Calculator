import React from 'react';

const SectionDetailsPanel = ({ data, sectionType }) => {
  // Helper function to convert object with numeric keys to array
  const objectToArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    
    if (typeof obj === 'object') {
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
    
    if (dimensions.lengthInInches && dimensions.breadthInInches) {
      return `${dimensions.lengthInInches}" × ${dimensions.breadthInInches}"`;
    }
    
    const length = dimensions.length || "";
    const breadth = dimensions.breadth || "";
    
    if (!length && !breadth) return "Not specified";
    return `${length} × ${breadth} cm`;
  };  

  // Compact table component
  const CompactTable = ({ headers, rows, title, subtitle }) => (
    <div className="space-y-2">
      <div className="bg-blue-50 p-2 rounded text-xs">
        <h4 className="font-semibold text-sm">{title}</h4>
        {subtitle && <p className="text-gray-600 text-xs">{subtitle}</p>}
      </div>
      
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded text-xs">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-1 px-2 text-xs text-gray-500">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic text-xs">No details available</p>
      )}
    </div>
  );

  // Compact key-value component
  const CompactKeyValue = ({ title, subtitle, pairs }) => (
    <div className="space-y-2">
      <div className="bg-purple-50 p-2 rounded text-xs">
        <h4 className="font-semibold text-sm">{title}</h4>
        {subtitle && <p className="text-gray-600 text-xs">{subtitle}</p>}
      </div>
      
      <div className="grid grid-cols-4 gap-1">
        {pairs.map((pair, index) => (
          <div key={index} className="bg-white border border-gray-200 p-1 rounded text-xs">
            <div className="font-medium text-gray-700">{pair.label}</div>
            <div className="text-gray-500">{pair.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Handle rendering LP details (Letterpress)
  const renderLPDetailsTable = () => {
    if (!data || !data.isLPUsed) return null;
    
    const colorDetails = objectToArray(data.colorDetails);
    
    const headers = ['Color #', 'Pantone', 'Plate Type', 'Plate Size', 'Dimensions', 'MR Type', 'DST Material'];
    const rows = colorDetails.map((color, index) => [
      index + 1,
      color.pantoneType || "Not specified",
      color.plateType || "Not specified",
      color.plateSizeType || "Auto",
      formatDimensions(color.plateDimensions),
      color.mrType || "Not specified",
      color.dstMaterial || "Not specified"
    ]);

    return (
      <CompactTable
        title="Letterpress Details (LP)"
        subtitle={`Number of Colors: ${data.noOfColors || 0}`}
        headers={headers}
        rows={rows}
      />
    );
  };

  // Handle rendering FS details (Foil Stamping)
  const renderFSDetailsTable = () => {
    if (!data || !data.isFSUsed) return null;
    
    const foilDetails = objectToArray(data.foilDetails);
    
    const headers = ['Foil #', 'Foil Type', 'Block Type', 'Block Size', 'Dimensions', 'MR Type'];
    const rows = foilDetails.map((foil, index) => [
      index + 1,
      foil.foilType || "Not specified",
      foil.blockType || "Not specified",
      foil.blockSizeType || "Auto",
      formatDimensions(foil.blockDimension),
      foil.mrType || "Not specified"
    ]);

    return (
      <CompactTable
        title="Foil Stamping Details (FS)"
        subtitle={`FS Type: ${data.fsType || "Not specified"} | Number of Foils: ${foilDetails.length}`}
        headers={headers}
        rows={rows}
      />
    );
  };

  // Handle rendering EMB details (Embossing)
  const renderEMBDetailsTable = () => {
    if (!data || !data.isEMBUsed) return null;
    
    const pairs = [
      { label: 'Plate Size Type', value: data.plateSizeType || "Auto" },
      { label: 'Plate Dimensions', value: formatDimensions(data.plateDimensions) },
      { label: 'MR Type', value: data.embMR || "Not specified" },
      { label: 'DST Material', value: data.dstMaterial || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Embossing Details (EMB)"
        pairs={pairs}
      />
    );
  };

  // Handle rendering Digital Printing details
  const renderDigiDetailsTable = () => {
    if (!data || !data.isDigiUsed) return null;
    
    const pairs = [
      { label: 'Die Size', value: data.digiDie || "Not specified" },
      { label: 'Dimensions', value: formatDimensions(data.digiDimensions) }
    ];

    return (
      <CompactKeyValue
        title="Digital Printing Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Screen Printing details
  const renderScreenPrintTable = () => {
    if (!data || !data.isScreenPrintUsed) return null;
    
    const pairs = [
      { label: 'Number of Colors', value: data.noOfColors || 1 },
      { label: 'MR Type', value: data.screenMR || "Not specified" },
      { label: 'MR Concatenated', value: data.screenMRConcatenated || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Screen Printing Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Pre Die Cutting details
  const renderPreDieCuttingTable = () => {
    if (!data || !data.isPreDieCuttingUsed) return null;
    
    const pairs = [
      { label: 'MR Type', value: data.predcMR || "Not specified" },
      { label: 'MR Concatenated', value: data.predcMRConcatenated || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Pre Die Cutting Details"
        pairs={pairs}
      />
    );
  };
  
  // Handle rendering Die Cutting details
  const renderDieCuttingTable = () => {
    if (!data || !data.isDieCuttingUsed) return null;
    
    const pairs = [
      { label: 'MR Type', value: data.dcMR || "Not specified" },
      { label: 'MR Concatenated', value: data.dcMRConcatenated || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Die Cutting Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Post Die Cutting details
  const renderPostDCTable = () => {
    if (!data || !data.isPostDCUsed) return null;
    
    const pairs = [
      { label: 'MR Type', value: data.pdcMR || "Not specified" },
      { label: 'MR Concatenated', value: data.pdcMRConcatenated || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Post Die Cutting Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Fold & Paste details
  const renderFoldAndPasteTable = () => {
    if (!data || !data.isFoldAndPasteUsed) return null;
    
    const pairs = [
      { label: 'DST Material', value: data.dstMaterial || "Not specified" },
      { label: 'DST Type', value: data.dstType || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Fold & Paste Details"
        pairs={pairs}
      />
    );
  };
  
  // Render DST Paste details
  const renderDstPasteTable = () => {
    if (!data || !data.isDstPasteUsed) return null;
    
    const pairs = [
      { label: 'DST Type', value: data.dstType || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="DST Paste Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Magnet details
  const renderMagnetTable = () => {
    if (!data || !data.isMagnetUsed) return null;
    
    const pairs = [
      { label: 'Magnet Material', value: data.magnetMaterial || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Magnet Details"
        pairs={pairs}
      />
    );
  };
  
  // Render QC details
  const renderQCTable = () => {
    if (!data || !data.isQCUsed) return null;
    
    const pairs = [
      { label: 'Quality Control Enabled', value: 'Yes' }
    ];

    return (
      <CompactKeyValue
        title="Quality Control Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Packing details
  const renderPackingTable = () => {
    if (!data || !data.isPackingUsed) return null;
    
    const pairs = [
      { label: 'Packing Enabled', value: 'Yes' }
    ];

    return (
      <CompactKeyValue
        title="Packing Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Misc details
  const renderMiscTable = () => {
    if (!data || !data.isMiscUsed) return null;
    
    const pairs = [
      { label: 'Misc Charge', value: `₹ ${data.miscCharge || "0"}` }
    ];

    return (
      <CompactKeyValue
        title="Miscellaneous Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Notebook details
  const renderNotebookTable = () => {
    if (!data || !data.isNotebookUsed) return null;
    
    const pairs = [
      { label: 'Orientation', value: data.orientation || "Not specified" },
      { label: 'Dimensions', value: `${data.length || "0"} × ${data.breadth || "0"}` },
      { label: 'Number of Pages', value: data.numberOfPages || "Not specified" },
      { label: 'Binding Type', value: data.bindingType || "Not specified" },
      { label: 'Paper Type', value: data.paperName || "Not specified" }
    ];

    return (
      <CompactKeyValue
        title="Notebook Details"
        pairs={pairs}
      />
    );
  };
  
  // Render Sandwich component details
  const renderSandwichTable = () => {
    if (!data || !data.isSandwichComponentUsed) return null;
    
    return (
      <div className="space-y-3">
        <div className="bg-purple-50 p-2 rounded text-xs">
          <h4 className="font-semibold text-sm">Duplex/Sandwich Details</h4>
        </div>
        
        {/* Paper Information */}
        {data.paperInfo && (
          <div className="mb-2">
            <div className="bg-green-50 p-1 rounded mb-1 border-l-2 border-green-400 pl-2">
              <h5 className="font-medium text-xs">Sandwich Paper Details</h5>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <div className="bg-white border border-gray-200 p-1 rounded text-xs">
                <div className="font-medium text-gray-700">Paper Name</div>
                <div className="text-gray-500">{data.paperInfo.paperName || "Not specified"}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sandwich LP Details */}
        {data.lpDetailsSandwich && data.lpDetailsSandwich.isLPUsed && (
          <div className="mb-2">
            <div className="bg-blue-50 p-1 rounded mb-1 border-l-2 border-blue-400 pl-2">
              <h5 className="font-medium text-xs">Sandwich LP Details</h5>
              <p className="text-gray-600 text-xs">Number of Colors: {data.lpDetailsSandwich.noOfColors || 0}</p>
            </div>
            
            {objectToArray(data.lpDetailsSandwich.colorDetails).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Color #</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Pantone</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Plate Type</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Dimensions</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">MR Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objectToArray(data.lpDetailsSandwich.colorDetails).map((color, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-1 px-2 text-xs font-medium text-gray-700">{index + 1}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">{color.pantoneType || "Not specified"}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">{color.plateType || "Not specified"}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">
                          {color.plateDimensions?.lengthInInches 
                            ? `${color.plateDimensions.lengthInInches}" × ${color.plateDimensions.breadthInInches}"` 
                            : formatDimensions(color.plateDimensions)}
                        </td>
                        <td className="py-1 px-2 text-xs text-gray-500">{color.mrType || "Not specified"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic text-xs">No color details available for Sandwich LP</p>
            )}
          </div>
        )}
        
        {/* Sandwich FS Details */}
        {data.fsDetailsSandwich && data.fsDetailsSandwich.isFSUsed && (
          <div className="mb-2">
            <div className="bg-yellow-50 p-1 rounded mb-1 border-l-2 border-yellow-400 pl-2">
              <h5 className="font-medium text-xs">Sandwich FS Details</h5>
              <p className="text-gray-600 text-xs">FS Type: {data.fsDetailsSandwich.fsType || "Not specified"} | Foils: {objectToArray(data.fsDetailsSandwich.foilDetails).length}</p>
            </div>
            
            {objectToArray(data.fsDetailsSandwich.foilDetails).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Foil #</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Foil Type</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Block Type</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">Dimensions</th>
                      <th className="py-1 px-2 border-b text-left text-xs font-medium text-gray-500">MR Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objectToArray(data.fsDetailsSandwich.foilDetails).map((foil, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-1 px-2 text-xs font-medium text-gray-700">{index + 1}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">{foil.foilType || "Not specified"}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">{foil.blockType || "Not specified"}</td>
                        <td className="py-1 px-2 text-xs text-gray-500">
                          {foil.blockDimension?.lengthInInches 
                            ? `${foil.blockDimension.lengthInInches}" × ${foil.blockDimension.breadthInInches}"` 
                            : formatDimensions(foil.blockDimension)}
                        </td>
                        <td className="py-1 px-2 text-xs text-gray-500">{foil.mrType || "Not specified"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic text-xs">No foil details available for Sandwich FS</p>
            )}
          </div>
        )}
        
        {/* Sandwich EMB Details */}
        {data.embDetailsSandwich && data.embDetailsSandwich.isEMBUsed && (
          <div className="mb-2">
            <div className="bg-purple-50 p-1 rounded mb-1 border-l-2 border-purple-400 pl-2">
              <h5 className="font-medium text-xs">Sandwich EMB Details</h5>
            </div>
            
            <div className="grid grid-cols-4 gap-1">
              <div className="bg-white border border-gray-200 p-1 rounded text-xs">
                <div className="font-medium text-gray-700">Plate Size Type</div>
                <div className="text-gray-500">{data.embDetailsSandwich.plateSizeType || "Auto"}</div>
              </div>
              <div className="bg-white border border-gray-200 p-1 rounded text-xs">
                <div className="font-medium text-gray-700">Plate Dimensions</div>
                <div className="text-gray-500">
                  {data.embDetailsSandwich.plateDimensions?.lengthInInches 
                    ? `${data.embDetailsSandwich.plateDimensions.lengthInInches}" × ${data.embDetailsSandwich.plateDimensions.breadthInInches}"` 
                    : formatDimensions(data.embDetailsSandwich.plateDimensions)}
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-1 rounded text-xs">
                <div className="font-medium text-gray-700">MR Type</div>
                <div className="text-gray-500">{data.embDetailsSandwich.embMR || "Not specified"}</div>
              </div>
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
      case 'preDieCutting':
        return renderPreDieCuttingTable();
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
        return <p className="text-gray-500 italic text-xs">No details available for this section</p>;
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
      case 'preDieCutting':
        return data.isPreDieCuttingUsed === true;
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
    <div className="mb-2">
      {renderSectionContent()}
    </div>
  );
};

export default SectionDetailsPanel;