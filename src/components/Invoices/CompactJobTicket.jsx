import React from 'react';

const CompactJobTicket = ({ order }) => {
  // Basic validation
  if (!order || Object.keys(order).length === 0) {
    return <div className="text-center text-red-500 p-2">No order data</div>;
  }

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

  return (
    <div className="w-full p-4 bg-white">
      {/* Header */}
      <div className="mb-4 border-b-2 border-gray-800 pb-2">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">JOB TICKET</h1>
          <div className="text-right text-xs">
            <p className="font-bold">Job #: <span className="font-normal">{order.id?.substring(0, 8) || 'N/A'}</span></p>
            <p className="font-bold">Type: <span className="font-normal">{order.jobDetails?.jobType || 'N/A'}</span></p>
            <p className="font-bold">Qty: <span className="font-normal">{order.jobDetails?.quantity || 'N/A'}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 text-sm">
          <div>
            <p className="font-bold">Project: <span className="font-normal">{order.projectName || 'N/A'}</span></p>
            <p className="font-bold">Client: <span className="font-normal">{order.clientName || 'N/A'}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold">Order: <span className="font-normal">{formatDate(order.date)}</span></p>
            <p className="font-bold">Delivery: <span className="font-normal">{formatDate(order.deliveryDate)}</span></p>
          </div>
        </div>
      </div>

      {/* Compact Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        {/* Paper Details */}
        <div className="border rounded p-2">
          <h2 className="font-bold text-sm border-b pb-1 mb-1">Paper Details</h2>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <p className="font-medium">Paper: <span className="font-normal">{order.jobDetails?.paperName || 'N/A'}</span></p>
            <p className="font-medium">Provided: <span className="font-normal">{order.jobDetails?.paperProvided || 'N/A'}</span></p>
            <p className="font-medium">Die Code: <span className="font-normal">{order.dieDetails?.dieCode || 'N/A'}</span></p>
            <p className="font-medium">Die Size: <span className="font-normal">
              {order.dieDetails?.dieSize?.length || 'N/A'} x {order.dieDetails?.dieSize?.breadth || 'N/A'}
            </span></p>
          </div>
          
          {/* Die Image */}
          {order.dieDetails?.image && (
            <div className="mt-2 text-center">
              <img 
                src={order.dieDetails.image} 
                alt="Die" 
                className="max-h-24 mx-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Key Processing Information - Enhanced */}
        <div className="border rounded p-2">
          <h2 className="font-bold text-sm border-b pb-1 mb-1">Processing Details</h2>
          <div className="text-xs space-y-1">
            {/* LP Details */}
            {order.lpDetails?.isLPUsed && (
              <div>
                <p className="font-medium">LP: {order.lpDetails.noOfColors || '1'} color(s) - 
                  {order.lpDetails.colorDetails && order.lpDetails.colorDetails[0]?.plateType 
                    ? ` ${order.lpDetails.colorDetails[0].plateType}` 
                    : ''}
                </p>
                {order.lpDetails.colorDetails && order.lpDetails.colorDetails[0]?.pantoneType && (
                  <p className="text-gray-600 pl-2">Pantone: {order.lpDetails.colorDetails[0].pantoneType}</p>
                )}
                {order.lpDetails.colorDetails && order.lpDetails.colorDetails[0]?.mrType && (
                  <p className="text-gray-600 pl-2">MR Type: {order.lpDetails.colorDetails[0].mrType}</p>
                )}
              </div>
            )}
            
            {/* FS Details */}
            {order.fsDetails?.isFSUsed && (
              <div>
                <p className="font-medium">FS: {order.fsDetails.fsType || 'Standard'} - 
                  {order.fsDetails.foilDetails && order.fsDetails.foilDetails[0]?.foilType 
                    ? ` ${order.fsDetails.foilDetails[0].foilType}` 
                    : ''}
                </p>
                {order.fsDetails.foilDetails && order.fsDetails.foilDetails[0]?.blockType && (
                  <p className="text-gray-600 pl-2">Block: {order.fsDetails.foilDetails[0].blockType}</p>
                )}
                {order.fsDetails.foilDetails && order.fsDetails.foilDetails[0]?.mrType && (
                  <p className="text-gray-600 pl-2">MR Type: {order.fsDetails.foilDetails[0].mrType}</p>
                )}
              </div>
            )}
            
            {/* EMB Details */}
            {order.embDetails?.isEMBUsed && (
              <div>
                <p className="font-medium">EMB: 
                  {order.embDetails.plateTypeMale ? ` Male: ${order.embDetails.plateTypeMale}` : ''} /
                  {order.embDetails.plateTypeFemale ? ` Female: ${order.embDetails.plateTypeFemale}` : ''}
                </p>
                {order.embDetails.embMR && (
                  <p className="text-gray-600 pl-2">MR Type: {order.embDetails.embMR}</p>
                )}
              </div>
            )}
            
            {/* DIGI Details */}
            {order.digiDetails?.isDigiUsed && (
              <div>
                <p className="font-medium">DIGI: Die {order.digiDetails.digiDie || 'Standard'}</p>
                {order.digiDetails.digiDimensions && (
                  <p className="text-gray-600 pl-2">
                    Size: {order.digiDetails.digiDimensions.length || 'N/A'} x {order.digiDetails.digiDimensions.breadth || 'N/A'}
                  </p>
                )}
              </div>
            )}

            {/* Post-Production Services */}
            {order.dieCutting?.isDieCuttingUsed && (
              <div>
                <p className="font-medium">Die Cutting: {order.dieCutting.dcMR || 'Standard'}</p>
              </div>
            )}
            
            {order.postDC?.isPostDCUsed && (
              <div>
                <p className="font-medium">Post Die Cutting: {order.postDC.pdcMR || 'Standard'}</p>
              </div>
            )}
            
            {order.foldAndPaste?.isFoldAndPasteUsed && (
              <div>
                <p className="font-medium">Fold & Paste</p>
                {order.foldAndPaste.dstType && (
                  <p className="text-gray-600 pl-2">DST Type: {order.foldAndPaste.dstType}</p>
                )}
              </div>
            )}
            
            {order.qc?.isQCUsed && (
              <div>
                <p className="font-medium">Quality Control</p>
              </div>
            )}
            
            {order.packing?.isPackingUsed && (
              <div>
                <p className="font-medium">Packing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactJobTicket;