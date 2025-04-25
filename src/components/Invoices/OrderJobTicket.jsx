import React from 'react';

const OrderJobTicket = ({ order }) => {
  // Validate order data
  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="text-center text-red-500 p-6">
        No order data available
      </div>
    );
  }

  // Utility function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Extract detailed service information
  const extractServiceDetails = () => {
    const productionServices = [];
    const postProductionServices = [];

    // Production Services Renderer
    const productionServiceChecks = [
      { 
        key: 'lpDetails', 
        name: 'Letter Press',
        usageKey: 'isLPUsed',
        detailRenderer: (details) => {
          const colorDetails = Array.isArray(details.colorDetails) 
            ? details.colorDetails 
            : Object.values(details.colorDetails || {});
          
          return (
            <div className="space-y-1">
              <p className="text-sm font-medium">Colors: {details.noOfColors || colorDetails.length}</p>
              {colorDetails.length > 0 && colorDetails.map((color, index) => (
                <p key={index} className="text-xs">
                  Color {index + 1}: {color.pantoneType || 'N/A'} - {color.plateType || 'N/A'}
                </p>
              ))}
              <p className="text-xs">MR Type: {colorDetails[0]?.mrType || 'N/A'}</p>
            </div>
          );
        }
      },
      { 
        key: 'fsDetails', 
        name: 'Foil Stamping',
        usageKey: 'isFSUsed',
        detailRenderer: (details) => {
          const foilDetails = Array.isArray(details.foilDetails) 
            ? details.foilDetails 
            : Object.values(details.foilDetails || {});
          
          return (
            <div className="space-y-1">
              <p className="text-sm font-medium">Type: {details.fsType || 'N/A'}</p>
              {foilDetails.length > 0 && foilDetails.map((foil, index) => (
                <p key={index} className="text-xs">
                  Foil {index + 1}: {foil.foilType || 'N/A'} - {foil.blockType || 'N/A'}
                </p>
              ))}
              <p className="text-xs">MR Type: {foilDetails[0]?.mrType || 'N/A'}</p>
            </div>
          );
        }
      },
      { 
        key: 'embDetails', 
        name: 'Embossing',
        usageKey: 'isEMBUsed',
        detailRenderer: (details) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">Plate Details</p>
            <p className="text-xs">Male Plate: {details.plateTypeMale || 'N/A'}</p>
            <p className="text-xs">Female Plate: {details.plateTypeFemale || 'N/A'}</p>
            <p className="text-xs">Plate Size: {details.plateDimensions.length || 'N/A'} x {details.plateDimensions.breadth || 'N/A'}</p>
            <p className="text-xs">MR Type: {details.embMR || 'N/A'}</p>
          </div>
        )
      },
      { 
        key: 'digiDetails', 
        name: 'Digital Printing',
        usageKey: 'isDigiUsed',
        detailRenderer: (details) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">Printing Details</p>
            <p className="text-xs">Die: {details.digiDie || 'N/A'}</p>
            <p className="text-xs">Dimensions: {details.digiDimensions.length || 'N/A'} x {details.digiDimensions.breadth || 'N/A'}</p>
          </div>
        )
      },
      { 
        key: 'screenPrint', 
        name: 'Screen Printing',
        usageKey: 'isScreenPrintUsed',
        detailRenderer: () => (
          <p className="text-xs">Status: Used</p>
        )
      }
    ];

    // Post-Production Services Renderer
    const postProductionServiceChecks = [
      { 
        key: 'dieCutting', 
        name: 'Die Cutting',
        usageKey: 'isDieCuttingUsed',
        detailRenderer: (details) => (
          <div className="space-y-1">
            <p className="text-xs">MR Type: {details.dcMR || 'N/A'}</p>
            <p className="text-xs">MR Concatenated: {details.dcMRConcatenated || 'N/A'}</p>
          </div>
        )
      },
      { 
        key: 'postDC', 
        name: 'Post Die Cutting',
        usageKey: 'isPostDCUsed',
        detailRenderer: (details) => (
          <div className="space-y-1">
            <p className="text-xs">MR Type: {details.pdcMR || 'N/A'}</p>
            <p className="text-xs">MR Concatenated: {details.pdcMRConcatenated || 'N/A'}</p>
          </div>
        )
      },
      { 
        key: 'foldAndPaste', 
        name: 'Fold & Paste',
        usageKey: 'isFoldAndPasteUsed',
        detailRenderer: () => (
          <p className="text-xs">Status: Used</p>
        )
      },
      { 
        key: 'qc', 
        name: 'Quality Check',
        usageKey: 'isQCUsed',
        detailRenderer: () => (
          <p className="text-xs">Status: Used</p>
        )
      },
      { 
        key: 'packing', 
        name: 'Packing',
        usageKey: 'isPackingUsed',
        detailRenderer: () => (
          <p className="text-xs">Status: Used</p>
        )
      },
      { 
        key: 'misc', 
        name: 'Miscellaneous',
        usageKey: 'isMiscUsed',
        detailRenderer: () => (
          <p className="text-xs">Status: Used</p>
        )
      }
    ];

    // Populate Production Services
    productionServiceChecks.forEach(service => {
      if (order[service.key]?.[service.usageKey]) {
        productionServices.push({
          name: service.name,
          details: service.detailRenderer(order[service.key])
        });
      }
    });

    // Populate Post-Production Services
    postProductionServiceChecks.forEach(service => {
      if (order[service.key]?.[service.usageKey]) {
        postProductionServices.push({
          name: service.name,
          details: service.detailRenderer(order[service.key])
        });
      }
    });

    return { productionServices, postProductionServices };
  };

  const { productionServices, postProductionServices } = extractServiceDetails();

  return (
    <div className="w-full min-h-screen p-8 bg-white">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b-2 border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">PRODUCTION JOB TICKET</h1>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">Job Type: <span className="font-normal">{order.jobDetails?.jobType || 'N/A'}</span></p>
            <p className="font-bold text-sm">Quantity: <span className="font-normal">{order.jobDetails?.quantity || 'N/A'} pcs</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Project Name: <span className="font-normal">{order.projectName || 'N/A'}</span></p>
            <p className="font-bold">Client: <span className="font-normal">{order.clientName || 'N/A'}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold">Order Date: <span className="font-normal">{formatDate(order.date)}</span></p>
            <p className="font-bold">Delivery Date: <span className="font-normal">{formatDate(order.deliveryDate)}</span></p>
          </div>
        </div>
      </div>

      {/* Job Specifications Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Paper Details */}
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3 border-b pb-2">Paper Details</h2>
          <div className="space-y-2">
            <p className="font-bold">Paper Name: <span className="font-normal">{order.jobDetails?.paperName || 'N/A'}</span></p>
            <p className="font-bold">Paper Provided: <span className="font-normal">{order.jobDetails?.paperProvided || 'N/A'}</span></p>
            <p className="font-bold">Die Code: <span className="font-normal">{order.dieDetails?.dieCode || 'N/A'}</span></p>
            <p className="font-bold">Die Size: <span className="font-normal">
              {order.dieDetails?.dieSize?.length || 'N/A'} x {order.dieDetails?.dieSize?.breadth || 'N/A'}
            </span></p>
          </div>
        </div>

        {/* Services Details */}
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3 border-b pb-2">Services</h2>
          <div className="space-y-4">
            {/* Production Services */}
            {productionServices.length > 0 && (
              <div>
                <h3 className="font-semibold text-md mb-2 border-b pb-1">Production Services</h3>
                {productionServices.map((service, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <p className="font-medium text-sm mb-1">{service.name}</p>
                    {service.details}
                  </div>
                ))}
              </div>
            )}

            {/* Post-Production Services */}
            {postProductionServices.length > 0 && (
              <div>
                <h3 className="font-semibold text-md mb-2 border-b pb-1">Post-Production Services</h3>
                {postProductionServices.map((service, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <p className="font-medium text-sm mb-1">{service.name}</p>
                    {service.details}
                  </div>
                ))}
              </div>
            )}

            {productionServices.length === 0 && postProductionServices.length === 0 && (
              <p className="text-gray-500 text-xs">No services selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-3 gap-4 border-t pt-6 mt-6">
        {['Received By', 'Approved By', 'Dispatched By'].map((role, index) => (
          <div key={index} className="text-center">
            <div className="border-b h-20 mb-2"></div>
            <p className="font-medium">{role}</p>
            <p className="text-xs text-gray-500">Signature & Date</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>Job Ticket ID: {order.id || 'N/A'}</p>
      </div>
    </div>
  );
};

export default OrderJobTicket;