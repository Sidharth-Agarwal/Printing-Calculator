import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

// Helper function to check if image URL is valid
const hasValidImage = (imageUrl) => {
  if (!imageUrl) return false;
  if (typeof imageUrl !== 'string') return false;
  const trimmedUrl = imageUrl.trim();
  if (trimmedUrl === '') return false;
  if (trimmedUrl === 'null') return false;
  if (trimmedUrl === 'undefined') return false;
  return true;
};

const JobTicket = ({ order }) => {
  const [assignedStaffName, setAssignedStaffName] = useState('');
  const [loadingStaffName, setLoadingStaffName] = useState(false);

  // Basic validation
  if (!order || Object.keys(order).length === 0) {
    return <div className="text-center text-red-500 p-2">No order data</div>;
  }

  // Fetch assigned staff name
  useEffect(() => {
    const fetchStaffName = async () => {
      if (!order.productionAssignments?.assigned) {
        setAssignedStaffName('Not Assigned');
        return;
      }

      setLoadingStaffName(true);
      
      try {
        const staffDoc = await getDoc(doc(db, "users", order.productionAssignments.assigned));
        
        if (staffDoc.exists()) {
          const staffData = staffDoc.data();
          const staffName = staffData.displayName || staffData.email || 'Unknown Staff';
          setAssignedStaffName(staffName);
        } else {
          setAssignedStaffName('Staff Not Found');
        }
      } catch (error) {
        console.error("Error fetching staff details:", error);
        setAssignedStaffName('Error Loading');
      } finally {
        setLoadingStaffName(false);
      }
    };

    fetchStaffName();
  }, [order.productionAssignments?.assigned]);

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format dimensions helper function
  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'N/A';
    if (typeof dimensions === 'string') return dimensions;
    
    // Handle different dimension formats
    const length = dimensions.length || dimensions.lengthInInches || '';
    const breadth = dimensions.breadth || dimensions.breadthInInches || '';
    
    if (!length && !breadth) return 'N/A';
    
    // Use inches format if available (indicated by presence of lengthInInches)
    const isInches = dimensions.lengthInInches !== undefined;
    return `${length}×${breadth}${isInches ? '"' : ''}`;
  };

  // Convert object with numeric keys to array
  const objectToArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    
    // If it's an object with numeric keys, convert to array
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      const isNumericKeys = keys.every(key => !isNaN(parseInt(key)));
      
      if (isNumericKeys) {
        return Object.values(obj);
      }
    }
    
    return [];
  };

  // Get total sheets required from calculations
  const getTotalSheets = () => {
    const totalSheets = order.calculations?.totalSheetsRequired;
    
    if (totalSheets !== undefined && totalSheets !== null) {
      return totalSheets;
    }
    
    return 'N/A';
  };

  // Render LP Details compact table
  const renderLPDetails = () => {
    if (!order.lpDetails?.isLPUsed) return null;
    
    const colorDetails = objectToArray(order.lpDetails.colorDetails);
    
    return (
      <div className="w-full">
        <div className="font-medium text-xs mb-0.5">LP: {order.lpDetails.noOfColors || 1} color(s)</div>
        {colorDetails.length > 0 && (
          <table className="w-full text-[9px] border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-1 py-0.5 text-left">#</th>
                <th className="border px-1 py-0.5 text-left">Type</th>
                <th className="border px-1 py-0.5 text-left">Pantone</th>
                <th className="border px-1 py-0.5 text-left">MR</th>
                <th className="border px-1 py-0.5 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {colorDetails.map((color, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border px-1 py-0.5">{idx+1}</td>
                  <td className="border px-1 py-0.5">{color.plateType || 'N/A'}</td>
                  <td className="border px-1 py-0.5">{color.pantoneType || 'N/A'}</td>
                  <td className="border px-1 py-0.5">{color.mrType || 'STD'}</td>
                  <td className="border px-1 py-0.5">{formatDimensions(color.plateDimensions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render FS Details compact table
  const renderFSDetails = () => {
    if (!order.fsDetails?.isFSUsed) return null;
    
    const foilDetails = objectToArray(order.fsDetails.foilDetails);
    
    return (
      <div className="w-full">
        <div className="font-medium text-xs mb-0.5">FS: {order.fsDetails.fsType || 'STD'}</div>
        {foilDetails.length > 0 && (
          <table className="w-full text-[9px] border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-1 py-0.5 text-left">#</th>
                <th className="border px-1 py-0.5 text-left">Foil</th>
                <th className="border px-1 py-0.5 text-left">Block</th>
                <th className="border px-1 py-0.5 text-left">MR</th>
                <th className="border px-1 py-0.5 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {foilDetails.map((foil, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border px-1 py-0.5">{idx+1}</td>
                  <td className="border px-1 py-0.5">{foil.foilType || 'N/A'}</td>
                  <td className="border px-1 py-0.5">{foil.blockType || 'N/A'}</td>
                  <td className="border px-1 py-0.5">{foil.mrType || 'STD'}</td>
                  <td className="border px-1 py-0.5">{formatDimensions(foil.blockDimension)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render EMB Details
  const renderEMBDetails = () => {
    if (!order.embDetails?.isEMBUsed) return null;
    
    return (
      <div className="text-xs">
        <div className="font-medium mb-0.5">EMB</div>
        <div className="grid grid-cols-2 gap-x-2 text-[9px]">
          <div>Male: {order.embDetails.plateTypeMale || 'N/A'}</div>
          <div>Female: {order.embDetails.plateTypeFemale || 'N/A'}</div>
          <div>MR: {order.embDetails.embMR || 'STD'}</div>
          <div>Size: {formatDimensions(order.embDetails.plateDimensions)}</div>
        </div>
      </div>
    );
  };

  // Get service details for other services
  const getServiceDetails = (service, serviceType) => {
    if (!service) return '';
    
    switch(serviceType) {
      case 'DIGI':
        return `${service.digiDie || 'Standard'} (${formatDimensions(service.digiDimensions)})`;
      case 'SCREEN':
        return `${service.noOfColors || 1} color(s), MR: ${service.screenMR || 'STD'}`;
      case 'NOTEBOOK':
        return `${service.orientation || 'STD'}, ${service.numberOfPages || '0'} pages, ${service.bindingType || 'N/A'}`;
      case 'PRE_DC':
        return `MR: ${service.predcMR || 'STD'}`;
      case 'DC':
        return `MR: ${service.dcMR || 'STD'}`;
      case 'POST_DC':
        return `MR: ${service.pdcMR || 'STD'}`;
      case 'FOLD_PASTE':
        return `${service.dstType || 'STD'}${service.dstMaterial ? ', Mat: ' + service.dstMaterial : ''}`;
      case 'DST_PASTE':
        return `Type: ${service.dstType || 'STD'}`;
      case 'MAGNET':
        return `Mat: ${service.magnetMaterial || 'STD'}`;
      case 'SANDWICH':
        return `Paper: ${service.paperInfo?.paperName || 'STD'}`;
      default:
        return '';
    }
  };

  return (
    <div className="w-[430px] p-3 bg-white border border-gray-300 text-xs">
      {/* Debug: Log order serial */}
      {console.log('JobTicket - Order Serial:', order.orderSerial)}
      
      {/* Header - UPDATED: Use orderSerial */}
      <div className="mb-2 border-b border-gray-800 pb-1">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">JOB TICKET</h1>
          <div className="text-right text-[10px]">
            <p className="font-bold">Order Serial: <span className="font-normal font-mono">{order.orderSerial || 'N/A'}</span></p>
            <p className="font-bold">Job #: <span className="font-normal">{order.id?.substring(0, 8) || 'N/A'}</span></p>
            <p className="font-bold">Type: <span className="font-normal">{order.jobDetails?.jobType || 'N/A'}</span></p>
            <p className="font-bold">Qty: <span className="font-normal">{order.jobDetails?.quantity || 'N/A'}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 text-[10px]">
          <div>
            <p className="font-bold">Project: <span className="font-normal">{order.projectName || 'N/A'}</span></p>
            <p className="font-bold">Client: <span className="font-normal">{order.clientName || 'N/A'}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold">Order: <span className="font-normal">{formatDate(order.date)}</span></p>
            <p className="font-bold">Delivery: <span className="font-normal">{formatDate(order.deliveryDate || order.date)}</span></p>
          </div>
        </div>
      </div>

      {/* Production Assignment Section */}
      {order.productionAssignments && (order.productionAssignments.assigned || order.productionAssignments.deadlineDate) && (
        <div className="mb-2 border rounded p-1.5">
          <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Production Assignment</h2>
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[10px]">
            <div>Assigned to: <span className="font-normal">
              {order.productionAssignments.assigned ? (
                loadingStaffName ? 'Loading...' : assignedStaffName
              ) : (
                'Not Assigned'
              )}
            </span></div>
            <div>Deadline: <span className={`font-normal ${
              order.productionAssignments.deadlineDate && 
              new Date(order.productionAssignments.deadlineDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
                ? 'text-red-600 font-medium' : ''
            }`}>
              {order.productionAssignments.deadlineDate ? 
                formatDate(order.productionAssignments.deadlineDate) : 'Not Set'}
            </span></div>
            {order.productionAssignments.assignedAt && (
              <div className="col-span-2">Assigned on: <span className="font-normal">
                {formatDate(order.productionAssignments.assignedAt)}
              </span></div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left Column */}
        <div className="space-y-2">
          {/* Paper Details - WITH Total Sheets */}
          <div className="border rounded p-1.5">
            <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Paper Details</h2>
            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[10px]">
              <div>Paper: <span className="font-normal">{order.jobDetails?.paperName || 'N/A'}</span></div>
              <div>GSM: <span className="font-normal">{order.jobDetails?.paperGsm || 'N/A'}</span></div>
              <div>Provided: <span className="font-normal">{order.jobDetails?.paperProvided || 'N/A'}</span></div>
              <div>Company: <span className="font-normal">{order.jobDetails?.paperCompany || 'N/A'}</span></div>
              <div>Die Code: <span className="font-normal">{order.dieDetails?.dieCode || 'N/A'}</span></div>
              <div>Die Size: <span className="font-normal">
                {order.dieDetails?.dieSize?.length || 'N/A'} × {order.dieDetails?.dieSize?.breadth || 'N/A'}
              </span></div>
              <div>Total Sheets: <span className="font-normal">{getTotalSheets()}</span></div>
            </div>
            
            {/* Die Image - Only show if there's a valid image URL */}
            {hasValidImage(order.dieDetails?.image) && (
              <div className="mt-1 text-center">
                <img 
                  src={order.dieDetails.image} 
                  alt="Die" 
                  className="max-h-16 mx-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* LP & FS Details */}
          <div className="border rounded p-1.5">
            <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Print Details</h2>
            <div className="space-y-2">
              {renderLPDetails()}
              {renderFSDetails()}
              {renderEMBDetails()}
              
              {/* DIGI Details */}
              {order.digiDetails?.isDigiUsed && (
                <div className="text-xs">
                  <span className="font-medium">DIGI: </span>
                  <span className="text-[10px]">{getServiceDetails(order.digiDetails, 'DIGI')}</span>
                </div>
              )}
              
              {/* Screen Print Details */}
              {order.screenPrint?.isScreenPrintUsed && (
                <div className="text-xs">
                  <span className="font-medium">Screen: </span>
                  <span className="text-[10px]">{getServiceDetails(order.screenPrint, 'SCREEN')}</span>
                </div>
              )}
              
              {/* Notebook Details */}
              {order.notebookDetails?.isNotebookUsed && (
                <div className="text-xs">
                  <span className="font-medium">Notebook: </span>
                  <span className="text-[10px]">{getServiceDetails(order.notebookDetails, 'NOTEBOOK')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-2">
          {/* Post-Production Services */}
          <div className="border rounded p-1.5">
            <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Post-Production</h2>
            <div className="grid grid-cols-1 gap-y-0.5 text-[10px]">
              {/* Pre Die Cutting */}
              {order.preDieCutting?.isPreDieCuttingUsed && (
                <div className="flex">
                  <span className="font-medium w-20">Pre DC:</span>
                  <span>{getServiceDetails(order.preDieCutting, 'PRE_DC')}</span>
                </div>
              )}
              
              {/* Die Cutting */}
              {order.dieCutting?.isDieCuttingUsed && (
                <div className="flex">
                  <span className="font-medium w-20">DC:</span>
                  <span>{getServiceDetails(order.dieCutting, 'DC')}</span>
                </div>
              )}
              
              {/* Post Die Cutting */}
              {order.postDC?.isPostDCUsed && (
                <div className="flex">
                  <span className="font-medium w-20">Post DC:</span>
                  <span>{getServiceDetails(order.postDC, 'POST_DC')}</span>
                </div>
              )}
              
              {/* Fold & Paste */}
              {order.foldAndPaste?.isFoldAndPasteUsed && (
                <div className="flex">
                  <span className="font-medium w-20">Fold & Paste:</span>
                  <span>{getServiceDetails(order.foldAndPaste, 'FOLD_PASTE')}</span>
                </div>
              )}
              
              {/* DST Paste */}
              {order.dstPaste?.isDstPasteUsed && (
                <div className="flex">
                  <span className="font-medium w-20">DST Paste:</span>
                  <span>{getServiceDetails(order.dstPaste, 'DST_PASTE')}</span>
                </div>
              )}
              
              {/* Magnet */}
              {order.magnet?.isMagnetUsed && (
                <div className="flex">
                  <span className="font-medium w-20">Magnet:</span>
                  <span>{getServiceDetails(order.magnet, 'MAGNET')}</span>
                </div>
              )}
              
              {/* QC */}
              {order.qc?.isQCUsed && (
                <div className="flex">
                  <span className="font-medium w-20">QC:</span>
                  <span>Required</span>
                </div>
              )}
              
              {/* Packing */}
              {order.packing?.isPackingUsed && (
                <div className="flex">
                  <span className="font-medium w-20">Packing:</span>
                  <span>Required</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Sandwich/Duplex Details */}
          {order.sandwich?.isSandwichComponentUsed && (
            <div className="border rounded p-1.5">
              <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Duplex/Sandwich</h2>
              <div className="space-y-1 text-[10px]">
                <div>Paper: {order.sandwich.paperInfo?.paperName || 'N/A'}</div>
                
                {/* Sandwich LP */}
                {order.sandwich.lpDetailsSandwich?.isLPUsed && (
                  <div className="mt-0.5">
                    <div className="font-medium">LP: {order.sandwich.lpDetailsSandwich.noOfColors || 1} color(s)</div>
                    {objectToArray(order.sandwich.lpDetailsSandwich.colorDetails).map((color, idx) => (
                      <div key={idx} className="text-[9px] pl-2 flex">
                        <span className="w-12">{idx+1}:</span>
                        <span>{color.plateType || 'N/A'}, {color.pantoneType || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Sandwich FS */}
                {order.sandwich.fsDetailsSandwich?.isFSUsed && (
                  <div className="mt-0.5">
                    <div className="font-medium">FS: {order.sandwich.fsDetailsSandwich.fsType || 'STD'}</div>
                    {objectToArray(order.sandwich.fsDetailsSandwich.foilDetails).map((foil, idx) => (
                      <div key={idx} className="text-[9px] pl-2 flex">
                        <span className="w-12">{idx+1}:</span>
                        <span>{foil.foilType || 'N/A'}, {foil.blockType || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Sandwich EMB */}
                {order.sandwich.embDetailsSandwich?.isEMBUsed && (
                  <div className="mt-0.5">
                    <div className="font-medium">EMB:</div>
                    <div className="pl-2 text-[9px]">
                      Male: {order.sandwich.embDetailsSandwich.plateTypeMale || 'N/A'}<br />
                      Female: {order.sandwich.embDetailsSandwich.plateTypeFemale || 'N/A'}<br />
                      MR: {order.sandwich.embDetailsSandwich.embMR || 'STD'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Notes Section */}
          <div className="border rounded p-1.5">
            <h2 className="font-bold text-xs border-b pb-0.5 mb-1">Production Notes</h2>
            <p className="text-[10px] whitespace-pre-line min-h-10">
              {order.notes || "No specific instructions provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTicket;