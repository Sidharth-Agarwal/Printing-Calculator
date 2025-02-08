import React, { useState, useEffect } from 'react';

// DieImage Component
const DieImage = ({ imageUrl }) => {
  const [imageStatus, setImageStatus] = useState('loading');

  useEffect(() => {
    if (!imageUrl) {
      setImageStatus('error');
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setImageStatus('loaded');
    };

    img.onerror = () => {
      console.error('Error loading image from URL:', imageUrl);
      setImageStatus('error');
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  if (imageStatus === 'loading') {
    return (
      <div className="border rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading image...</span>
        </div>
      </div>
    );
  }

  if (imageStatus === 'error') {
    return (
      <div className="border rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Die image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-2 h-32 bg-white">
      <div className="relative w-full h-full">
        <img 
          src={imageUrl} 
          alt="Die" 
          className="w-full h-full object-contain"
          onError={() => setImageStatus('error')}
        />
      </div>
    </div>
  );
};

const StyledJobTicket = ({ order }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header Section */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">JOB TICKET</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Order Date: <span className="font-normal">{formatDate(order.date)}</span></p>
            <p className="font-bold">Client Name: <span className="font-normal">{order.clientName}</span></p>
            <p className="font-bold">Project Name: <span className="font-normal">{order.projectName}</span></p>
          </div>
          <div>
            <p className="font-bold">Delivery Date: <span className="font-normal">{formatDate(order.deliveryDate)}</span></p>
            <p className="font-bold">Quantity: <span className="font-normal">{order.jobDetails?.quantity}</span></p>
            <p className="font-bold">Job Type: <span className="font-normal">{order.jobDetails?.jobType}</span></p>
          </div>
        </div>
      </div>

      {/* Paper and Die Details */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Paper and Die Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Paper: <span className="font-normal">{order.jobDetails?.paperName}</span></p>
                <p className="font-bold">Paper Provided: <span className="font-normal">{order.jobDetails?.paperProvided}</span></p>
              </div>
              <div>
                <p className="font-bold">Die Code: <span className="font-normal">{order.dieDetails?.dieCode}</span></p>
                <p className="font-bold">Die Size: <span className="font-normal">
                  {order.dieDetails?.dieSize?.length} x {order.dieDetails?.dieSize?.breadth}
                </span></p>
              </div>
            </div>
          </div>
          <div>
            <DieImage imageUrl={order.dieDetails?.image} />
          </div>
        </div>
      </div>

      {/* Letterpress Details */}
      {order.lpDetails?.isLPUsed && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Letterpress Details</h2>
          <p className="font-bold mb-2">Colors: <span className="font-normal">{order.lpDetails.noOfColors}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.lpDetails.colorDetails.map((color, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <p className="font-bold mb-2">Color {index + 1}:</p>
                <p className="text-sm">Pantone: <span className="font-normal">{color.pantoneType}</span></p>
                <p className="text-sm">Plate Size: <span className="font-normal">{color.plateDimensions.length} x {color.plateDimensions.breadth}</span></p>
                <p className="text-sm">Plate Type: <span className="font-normal">{color.plateType}</span></p>
                <p className="text-sm">MR Type: <span className="font-normal">{color.mrType}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foil Stamping Details */}
      {order.fsDetails?.isFSUsed && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Foil Stamping Details</h2>
          <p className="font-bold mb-2">Type: <span className="font-normal">{order.fsDetails.fsType}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.fsDetails.foilDetails.map((foil, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <p className="font-bold mb-2">Foil {index + 1}:</p>
                <p className="text-sm">Size: <span className="font-normal">{foil.blockDimension.length} x {foil.blockDimension.breadth}</span></p>
                <p className="text-sm">Foil Type: <span className="font-normal">{foil.foilType}</span></p>
                <p className="text-sm">Block Type: <span className="font-normal">{foil.blockType}</span></p>
                <p className="text-sm">MR Type: <span className="font-normal">{foil.mrType}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embossing Details */}
      {order.embDetails?.isEMBUsed && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Embossing Details</h2>
          <div className="border rounded-lg p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">Plate Size: <span className="font-normal">{order.embDetails.plateDimensions.length} x {order.embDetails.plateDimensions.breadth}</span></p>
                <p className="text-sm">Male Plate: <span className="font-normal">{order.embDetails.plateTypeMale}</span></p>
              </div>
              <div>
                <p className="text-sm">Female Plate: <span className="font-normal">{order.embDetails.plateTypeFemale}</span></p>
                <p className="text-sm">MR Type: <span className="font-normal">{order.embDetails.embMR}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sandwich Component Details */}
      {order.sandwich?.isSandwichComponentUsed && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Sandwich Details</h2>
          
          {/* LP in Sandwich */}
          {order.sandwich.lpDetailsSandwich?.isLPUsed && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-3 bg-gray-100 p-2">LP in Sandwich</h3>
              <p className="font-bold mb-2">Colors: <span className="font-normal">{order.sandwich.lpDetailsSandwich.noOfColors}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.sandwich.lpDetailsSandwich.colorDetails.map((color, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <p className="font-bold mb-2">Color {index + 1}:</p>
                    <p className="text-sm">Pantone: <span className="font-normal">{color.pantoneType}</span></p>
                    <p className="text-sm">Plate Type: <span className="font-normal">{color.plateType}</span></p>
                    <p className="text-sm">MR Type: <span className="font-normal">{color.mrType}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FS in Sandwich */}
          {order.sandwich.fsDetailsSandwich?.isFSUsed && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-3 bg-gray-100 p-2">FS in Sandwich</h3>
              <p className="font-bold mb-2">Type: <span className="font-normal">{order.sandwich.fsDetailsSandwich.fsType}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.sandwich.fsDetailsSandwich.foilDetails.map((foil, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <p className="font-bold mb-2">Foil {index + 1}:</p>
                    <p className="text-sm">Foil Type: <span className="font-normal">{foil.foilType}</span></p>
                    <p className="text-sm">Block Type: <span className="font-normal">{foil.blockType}</span></p>
                    <p className="text-sm">MR Type: <span className="font-normal">{foil.mrType}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMB in Sandwich */}
          {order.sandwich.embDetailsSandwich?.isEMBUsed && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-3 bg-gray-100 p-2">EMB in Sandwich</h3>
              <div className="border rounded-lg p-4 bg-white">
                <p className="text-sm">Male Plate: <span className="font-normal">{order.sandwich.embDetailsSandwich.plateTypeMale}</span></p>
                <p className="text-sm">Female Plate: <span className="font-normal">{order.sandwich.embDetailsSandwich.plateTypeFemale}</span></p>
                <p className="text-sm">MR Type: <span className="font-normal">{order.sandwich.embDetailsSandwich.embMR}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pasting Details */}
      {order.pasting?.isPastingUsed && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gray-200 p-2">Pasting Details</h2>
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-sm">Type: <span className="font-normal">{order.pasting.pastingType}</span></p>
          </div>
        </div>
      )}

      {/* Sign-off Section */}
      <div className="mt-12 print:mt-16">
        <div className="grid grid-cols-3 gap-8">
          {['Production Manager', 'Quality Control', 'Supervisor'].map((role) => (
            <div key={role} className="text-center">
              <div className="border-t border-black pt-4">
                <p className="text-sm font-medium">{role}</p>
                <div className="mt-8"></div> {/* Space for signature */}
                <p className="text-xs text-gray-500 mt-2">Sign & Date</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes - Optional */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>* All measurements are in inches unless otherwise specified</p>
          <p>* Please verify all specifications before beginning production</p>
          <p>* Report any discrepancies immediately to the production manager</p>
        </div>
      </div>

      {/* Print Info - Only visible when printing */}
      <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>Job Ticket ID: {order.id || 'N/A'}</p>
      </div>
    </div>
  );
};

export default StyledJobTicket;