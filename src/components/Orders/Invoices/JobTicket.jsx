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
    
    const length = dimensions.length || dimensions.lengthInInches || '';
    const breadth = dimensions.breadth || dimensions.breadthInInches || '';
    
    if (!length && !breadth) return 'N/A';
    
    const isInches = dimensions.lengthInInches !== undefined;
    return `${length}×${breadth}${isInches ? '"' : ''}`;
  };

  // Convert object with numeric keys to array
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

  // Get total sheets required from calculations
  const getTotalSheets = () => {
    const totalSheetsRequired = order.calculations?.totalSheetsRequired;
    const totalSheets = order.calculations?.totalSheets;
    
    if (totalSheetsRequired !== undefined && totalSheetsRequired !== null && totalSheetsRequired !== 0) {
      return totalSheetsRequired;
    }
    
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
      <div className="w-full mb-2">
        <div className="font-semibold text-[10px] mb-1">LP: {order.lpDetails.noOfColors || 1} color(s)</div>
        {colorDetails.length > 0 && (
          <table className="w-full text-[8px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">#</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Type</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Pantone</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">MR</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              {colorDetails.map((color, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-center">{idx+1}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{color.plateType || 'N/A'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{color.pantoneType || 'N/A'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{color.mrType || 'STD'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px', fontSize: '7px' }}>{formatDimensions(color.plateDimensions)}</td>
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
      <div className="w-full mb-2">
        <div className="font-semibold text-[10px] mb-1">FS: {order.fsDetails.fsType || 'STD'}</div>
        {foilDetails.length > 0 && (
          <table className="w-full text-[8px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">#</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Foil</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Block</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">MR</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-left font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              {foilDetails.map((foil, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }} className="text-center">{idx+1}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{foil.foilType || 'N/A'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{foil.blockType || 'N/A'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px' }}>{foil.mrType || 'STD'}</td>
                  <td style={{ border: '1px solid #9CA3AF', padding: '4px 6px', fontSize: '7px' }}>{formatDimensions(foil.blockDimension)}</td>
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
      <div className="text-[10px] mb-2">
        <div className="font-semibold mb-1">EMB</div>
        <div className="space-y-0.5 text-[9px] pl-2">
          <div><span className="font-medium">Male:</span> {order.embDetails.plateTypeMale || 'N/A'}</div>
          <div><span className="font-medium">Female:</span> {order.embDetails.plateTypeFemale || 'N/A'}</div>
          <div><span className="font-medium">MR:</span> {order.embDetails.embMR || 'STD'}</div>
          <div><span className="font-medium">Size:</span> {formatDimensions(order.embDetails.plateDimensions)}</div>
        </div>
      </div>
    );
  };

  // Get service details for other services (DIGI, Screen, etc.)
  const renderDigiDetails = () => {
    if (!order.digiDetails?.isDigiUsed) return null;
    
    const digiDie = order.digiDetails.digiDie || 'N/A';
    const dimensions = formatDimensions(order.digiDetails.digiDimensions);
    
    return (
      <div className="text-[10px] mb-2">
        <div className="font-semibold mb-1">DIGI: {dimensions}</div>
        <div className="text-[9px] pl-2">
          <div><span className="font-medium">Die:</span> {digiDie}</div>
        </div>
      </div>
    );
  };

  const renderScreenDetails = () => {
    if (!order.screenPrint?.isScreenPrintUsed) return null;
    
    return (
      <div className="text-[10px] mb-2">
        <div className="font-semibold mb-1">Screen: {order.screenPrint.noOfColors || 1} color(s)</div>
        <div className="text-[9px] pl-2">
          <div><span className="font-medium">MR:</span> {order.screenPrint.screenMR || 'STD'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[430px] p-2.5 bg-white leading-tight">
      {/* Header */}
      <div className="mb-2 pb-1.5 border-b-2 border-gray-800">
        <div className="flex justify-between items-start mb-1.5">
          <h1 className="text-lg font-bold">JOB TICKET</h1>
          <div className="text-right text-[9px] space-y-0.5">
            <div><span className="font-bold">Type:</span> {order.jobDetails?.jobType || 'N/A'}</div>
            <div><span className="font-bold">Qty:</span> {order.jobDetails?.quantity || 'N/A'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 text-[9px]">
          <div className="space-y-0.5">
            <div><span className="font-bold">Project:</span> {order.projectName || 'N/A'}</div>
            <div><span className="font-bold">Client:</span> {order.clientName || 'N/A'}</div>
          </div>
          <div className="text-right space-y-0.5">
            <div><span className="font-bold">Order:</span> {formatDate(order.date)}</div>
            <div><span className="font-bold">Delivery:</span> {formatDate(order.deliveryDate || order.date)}</div>
          </div>
        </div>
      </div>

      {/* Production Assignment Section */}
      {order.productionAssignments && (order.productionAssignments.assigned || order.productionAssignments.deadlineDate) && (
        <div className="mb-2 rounded p-1.5 bg-gray-100 border border-gray-300">
          <h2 className="font-bold text-[10px] mb-1">Production Assignment</h2>
          <div className="space-y-0.5 text-[9px]">
            <div><span className="font-medium">Assigned to:</span> {order.productionAssignments.assigned ? (
                loadingStaffName ? 'Loading...' : assignedStaffName
              ) : (
                'Not Assigned'
              )}
            </div>
            <div><span className="font-medium">Deadline:</span> <span className={`${
              order.productionAssignments.deadlineDate && 
              new Date(order.productionAssignments.deadlineDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
                ? 'text-red-600 font-bold' : ''
            }`}>
              {order.productionAssignments.deadlineDate ? 
                formatDate(order.productionAssignments.deadlineDate) : 'Not Set'}
            </span></div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          {/* Paper Details */}
          <div className="rounded p-2 bg-gray-50 border border-gray-300">
            <h2 className="font-bold text-[10px] mb-1.5">Paper Details</h2>
            
            <div className="space-y-1 text-[9px]">
              <div><span className="font-medium">Paper:</span> {order.jobDetails?.paperName || 'N/A'}</div>
              <div className="grid grid-cols-2 gap-x-2">
                <div><span className="font-medium">GSM:</span> {order.jobDetails?.paperGsm || 'N/A'}</div>
                <div><span className="font-medium">Provided:</span> {order.jobDetails?.paperProvided || 'N/A'}</div>
              </div>
              <div><span className="font-medium">Company:</span> {order.jobDetails?.paperCompany || 'N/A'}</div>
            </div>
            
            <div className="border-t border-gray-300 mt-1.5 pt-1.5 space-y-1 text-[9px]">
              <div className="grid grid-cols-2 gap-x-2">
                <div><span className="font-medium">Die Code:</span> {order.dieDetails?.dieCode || 'N/A'}</div>
                <div><span className="font-medium">Sheets:</span> {getTotalSheets()}</div>
              </div>
              <div><span className="font-medium">Die Size:</span> {order.dieDetails?.dieSize?.length || 'N/A'} × {order.dieDetails?.dieSize?.breadth || 'N/A'}</div>
            </div>
            
            {hasValidImage(order.dieDetails?.image) && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <img 
                  src={order.dieDetails.image} 
                  alt="Die" 
                  className="w-full h-auto max-h-24 object-contain rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Post-Production Services */}
          <div className="rounded p-2 bg-gray-50 border border-gray-300">
            <h2 className="font-bold text-[10px] mb-1.5">Post-Production</h2>
            <div className="space-y-1 text-[9px]">
              {order.dieCutting?.isDieCuttingUsed && (
                <div><span className="font-medium">DC:</span> MR: {order.dieCutting.dcMR || 'SIMPLE'}</div>
              )}
              {order.foldAndPaste?.isFoldAndPasteUsed && (
                <div><span className="font-medium">Fold & Paste:</span> {order.foldAndPaste.dstType || 'PASTE'}, Mat: {order.foldAndPaste.dstMaterial || 'none'}</div>
              )}
              {order.qc?.isQCUsed && (
                <div><span className="font-medium">QC:</span> Required</div>
              )}
              {order.packing?.isPackingUsed && (
                <div><span className="font-medium">Packing:</span> Required</div>
              )}
            </div>
          </div>
          
          {/* Production Notes */}
          <div className="rounded p-2 bg-gray-50 border border-gray-300">
            <h2 className="font-bold text-[10px] mb-1.5">Production Notes</h2>
            <p className="text-[9px] leading-snug">
              {order.notes || "No specific instructions provided."}
            </p>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-2">
          {/* Print Details */}
          <div className="rounded p-2 bg-gray-50 border border-gray-300">
            <h2 className="font-bold text-[10px] mb-1.5">Print Details</h2>
            <div>
              {renderLPDetails()}
              {renderFSDetails()}
              {renderEMBDetails()}
              {renderDigiDetails()}
              {renderScreenDetails()}
              
              {/* If no print services, show message */}
              {!order.lpDetails?.isLPUsed && 
               !order.fsDetails?.isFSUsed && 
               !order.embDetails?.isEMBUsed && 
               !order.digiDetails?.isDigiUsed && 
               !order.screenPrint?.isScreenPrintUsed && (
                <div className="text-[9px] text-gray-500 italic">No print services</div>
              )}
            </div>
          </div>
          
          {/* Sandwich/Duplex Details */}
          {order.sandwich?.isSandwichComponentUsed && (
            <div className="rounded p-2 bg-gray-50 border border-gray-300">
              <h2 className="font-bold text-[10px] mb-1.5">Duplex/Sandwich</h2>
              <div className="space-y-1 text-[9px]">
                <div><span className="font-medium">Paper:</span> {order.sandwich.paperInfo?.paperName || 'N/A'}</div>
                
                {order.sandwich.lpDetailsSandwich?.isLPUsed && (
                  <div className="mt-1.5">
                    <div className="font-medium text-[10px] mb-0.5">LP: {order.sandwich.lpDetailsSandwich.noOfColors || 1} color(s)</div>
                    <div className="pl-2 space-y-0.5 text-[8px]">
                      {objectToArray(order.sandwich.lpDetailsSandwich.colorDetails).map((color, idx) => (
                        <div key={idx}>
                          {idx+1}. {color.plateType || 'N/A'}, {color.pantoneType || 'N/A'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {order.sandwich.fsDetailsSandwich?.isFSUsed && (
                  <div className="mt-1.5">
                    <div className="font-medium text-[10px] mb-0.5">FS: {order.sandwich.fsDetailsSandwich.fsType || 'STD'}</div>
                    <div className="pl-2 space-y-0.5 text-[8px]">
                      {objectToArray(order.sandwich.fsDetailsSandwich.foilDetails).map((foil, idx) => (
                        <div key={idx}>
                          {idx+1}. {foil.foilType || 'N/A'}, {foil.blockType || 'N/A'}
                        </div>
                      ))}
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