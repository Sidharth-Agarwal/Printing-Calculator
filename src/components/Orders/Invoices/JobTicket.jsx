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
    const totalSheetsRequired = order.calculations?.totalSheetsRequired;
    const totalSheets = order.calculations?.totalSheets;
    
    // If totalSheetsRequired exists and is not 0, return it
    if (totalSheetsRequired !== undefined && totalSheetsRequired !== null && totalSheetsRequired !== 0) {
      return totalSheetsRequired;
    }
    
    // Otherwise, fall back to totalSheets
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
        <div className="font-medium text-xs mb-1">LP: {order.lpDetails.noOfColors || 1} color(s)</div>
        {colorDetails.length > 0 && (
          <table className="w-full text-[9px] border-collapse mb-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-1 py-0.5 text-left">#</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Type</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Pantone</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">MR</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {colorDetails.map((color, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-1 py-0.5">{idx+1}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{color.plateType || 'N/A'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{color.pantoneType || 'N/A'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{color.mrType || 'STD'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{formatDimensions(color.plateDimensions)}</td>
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
        <div className="font-medium text-xs mb-1">FS: {order.fsDetails.fsType || 'STD'}</div>
        {foilDetails.length > 0 && (
          <table className="w-full text-[9px] border-collapse mb-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-1 py-0.5 text-left">#</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Foil</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Block</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">MR</th>
                <th className="border border-gray-300 px-1 py-0.5 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {foilDetails.map((foil, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-1 py-0.5">{idx+1}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{foil.foilType || 'N/A'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{foil.blockType || 'N/A'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{foil.mrType || 'STD'}</td>
                  <td className="border border-gray-300 px-1 py-0.5">{formatDimensions(foil.blockDimension)}</td>
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
      <div className="text-xs mb-2">
        <div className="font-medium mb-1">EMB</div>
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
    <div className="w-[430px] p-3 bg-white text-xs leading-relaxed">
      {/* Debug: Log order serial */}
      {console.log('JobTicket - Order Serial:', order.orderSerial)}
      
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-gray-300">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-lg font-bold leading-tight">JOB TICKET</h1>
          <div className="text-right text-[10px] leading-tight">
            <p className="mb-0.5"><span className="font-bold">Job #:</span> {order.id?.substring(0, 8) || 'N/A'}</p>
            <p className="mb-0.5"><span className="font-bold">Type:</span> {order.jobDetails?.jobType || 'N/A'}</p>
            <p className="mb-0.5"><span className="font-bold">Qty:</span> {order.jobDetails?.quantity || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 text-[10px] leading-tight">
          <div>
            <p className="mb-0.5"><span className="font-bold">Project:</span> {order.projectName || 'N/A'}</p>
            <p className="mb-0.5"><span className="font-bold">Client:</span> {order.clientName || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="mb-0.5"><span className="font-bold">Order:</span> {formatDate(order.date)}</p>
            <p className="mb-0.5"><span className="font-bold">Delivery:</span> {formatDate(order.deliveryDate || order.date)}</p>
          </div>
        </div>
      </div>

      {/* Production Assignment Section */}
      {order.productionAssignments && (order.productionAssignments.assigned || order.productionAssignments.deadlineDate) && (
        <div className="mb-3 rounded p-2 bg-gray-50 border border-gray-200">
          <h2 className="font-bold text-xs mb-1.5">Production Assignment</h2>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div><span className="font-medium">Assigned to:</span> {order.productionAssignments.assigned ? (
                loadingStaffName ? 'Loading...' : assignedStaffName
              ) : (
                'Not Assigned'
              )}
            </div>
            <div><span className="font-medium">Deadline:</span> <span className={`${
              order.productionAssignments.deadlineDate && 
              new Date(order.productionAssignments.deadlineDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
                ? 'text-red-600 font-medium' : ''
            }`}>
              {order.productionAssignments.deadlineDate ? 
                formatDate(order.productionAssignments.deadlineDate) : 'Not Set'}
            </span></div>
            {order.productionAssignments.assignedAt && (
              <div className="col-span-2"><span className="font-medium">Assigned on:</span> {formatDate(order.productionAssignments.assignedAt)}</div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Paper Details */}
          <div className="rounded p-2 bg-gray-50 border border-gray-200">
            <h2 className="font-bold text-xs mb-2">Paper Details</h2>
            
            {/* Paper info */}
            <div className="space-y-1 text-[10px] mb-2">
              <div className="flex justify-between">
                <span className="font-medium">Paper:</span>
                <span className="text-right flex-1 ml-2 truncate">{order.jobDetails?.paperName || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div><span className="font-medium">GSM:</span> {order.jobDetails?.paperGsm || 'N/A'}</div>
                <div><span className="font-medium">Provided:</span> {order.jobDetails?.paperProvided || 'N/A'}</div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company:</span>
                <span className="text-right flex-1 ml-2 truncate">{order.jobDetails?.paperCompany || 'N/A'}</span>
              </div>
            </div>
            
            {/* Die Details */}
            <div className="border-t border-gray-300 pt-2 space-y-1 text-[10px]">
              <div className="grid grid-cols-2 gap-x-2">
                <div><span className="font-medium">Die Code:</span> {order.dieDetails?.dieCode || 'N/A'}</div>
                <div><span className="font-medium">Sheets:</span> {getTotalSheets()}</div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Die Size:</span>
                <span>
                  {order.dieDetails?.dieSize?.length || 'N/A'} × {order.dieDetails?.dieSize?.breadth || 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Die Image - Properly separated */}
            {hasValidImage(order.dieDetails?.image) && (
              <div className="mt-3 pt-2 border-t border-gray-300">
                <img 
                  src={order.dieDetails.image} 
                  alt="Die" 
                  className="w-full h-auto max-h-24 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Post-Production Services */}
          <div className="rounded p-2 bg-gray-50 border border-gray-200">
            <h2 className="font-bold text-xs mb-2">Post-Production</h2>
            <div className="space-y-1 text-[10px]">
              {/* Pre Die Cutting */}
              {order.preDieCutting?.isPreDieCuttingUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">Pre DC:</span>
                  <span className="truncate">{getServiceDetails(order.preDieCutting, 'PRE_DC')}</span>
                </div>
              )}
              
              {/* Die Cutting */}
              {order.dieCutting?.isDieCuttingUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">DC:</span>
                  <span className="truncate">{getServiceDetails(order.dieCutting, 'DC')}</span>
                </div>
              )}
              
              {/* Post Die Cutting */}
              {order.postDC?.isPostDCUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">Post DC:</span>
                  <span className="truncate">{getServiceDetails(order.postDC, 'POST_DC')}</span>
                </div>
              )}
              
              {/* Fold & Paste */}
              {order.foldAndPaste?.isFoldAndPasteUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">Fold & Paste:</span>
                  <span className="truncate">{getServiceDetails(order.foldAndPaste, 'FOLD_PASTE')}</span>
                </div>
              )}
              
              {/* DST Paste */}
              {order.dstPaste?.isDstPasteUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">DST Paste:</span>
                  <span className="truncate">{getServiceDetails(order.dstPaste, 'DST_PASTE')}</span>
                </div>
              )}
              
              {/* Magnet */}
              {order.magnet?.isMagnetUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">Magnet:</span>
                  <span className="truncate">{getServiceDetails(order.magnet, 'MAGNET')}</span>
                </div>
              )}
              
              {/* QC */}
              {order.qc?.isQCUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">QC:</span>
                  <span>Required</span>
                </div>
              )}
              
              {/* Packing */}
              {order.packing?.isPackingUsed && (
                <div className="flex">
                  <span className="font-medium w-24 flex-shrink-0">Packing:</span>
                  <span>Required</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Production Notes */}
          <div className="rounded p-2 bg-gray-50 border border-gray-200">
            <h2 className="font-bold text-xs mb-2">Production Notes</h2>
            <p className="text-[10px] whitespace-pre-line break-words leading-relaxed">
              {order.notes || "No specific instructions provided."}
            </p>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-3">
          {/* Print Details */}
          <div className="rounded p-2 bg-gray-50 border border-gray-200">
            <h2 className="font-bold text-xs mb-2">Print Details</h2>
            <div className="space-y-2">
              {renderLPDetails()}
              {renderFSDetails()}
              {renderEMBDetails()}
              
              {/* DIGI Details */}
              {order.digiDetails?.isDigiUsed && (
                <div className="text-xs mb-2">
                  <span className="font-medium">DIGI: </span>
                  <span className="text-[10px]">{getServiceDetails(order.digiDetails, 'DIGI')}</span>
                </div>
              )}
              
              {/* Screen Print Details */}
              {order.screenPrint?.isScreenPrintUsed && (
                <div className="text-xs mb-2">
                  <span className="font-medium">Screen: </span>
                  <span className="text-[10px]">{getServiceDetails(order.screenPrint, 'SCREEN')}</span>
                </div>
              )}
              
              {/* Notebook Details */}
              {order.notebookDetails?.isNotebookUsed && (
                <div className="text-xs mb-2">
                  <span className="font-medium">Notebook: </span>
                  <span className="text-[10px]">{getServiceDetails(order.notebookDetails, 'NOTEBOOK')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Sandwich/Duplex Details */}
          {order.sandwich?.isSandwichComponentUsed && (
            <div className="rounded p-2 bg-gray-50 border border-gray-200">
              <h2 className="font-bold text-xs mb-2">Duplex/Sandwich</h2>
              <div className="space-y-2 text-[10px]">
                <div className="truncate"><span className="font-medium">Paper:</span> {order.sandwich.paperInfo?.paperName || 'N/A'}</div>
                
                {/* Sandwich LP */}
                {order.sandwich.lpDetailsSandwich?.isLPUsed && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">LP: {order.sandwich.lpDetailsSandwich.noOfColors || 1} color(s)</div>
                    {objectToArray(order.sandwich.lpDetailsSandwich.colorDetails).map((color, idx) => (
                      <div key={idx} className="text-[9px] pl-2 flex mb-0.5">
                        <span className="w-10 flex-shrink-0">{idx+1}:</span>
                        <span className="truncate">{color.plateType || 'N/A'}, {color.pantoneType || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Sandwich FS */}
                {order.sandwich.fsDetailsSandwich?.isFSUsed && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">FS: {order.sandwich.fsDetailsSandwich.fsType || 'STD'}</div>
                    {objectToArray(order.sandwich.fsDetailsSandwich.foilDetails).map((foil, idx) => (
                      <div key={idx} className="text-[9px] pl-2 flex mb-0.5">
                        <span className="w-10 flex-shrink-0">{idx+1}:</span>
                        <span className="truncate">{foil.foilType || 'N/A'}, {foil.blockType || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Sandwich EMB */}
                {order.sandwich.embDetailsSandwich?.isEMBUsed && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">EMB:</div>
                    <div className="pl-2 text-[9px] space-y-0.5">
                      <div>Male: {order.sandwich.embDetailsSandwich.plateTypeMale || 'N/A'}</div>
                      <div>Female: {order.sandwich.embDetailsSandwich.plateTypeFemale || 'N/A'}</div>
                      <div>MR: {order.sandwich.embDetailsSandwich.embMR || 'STD'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTicket;