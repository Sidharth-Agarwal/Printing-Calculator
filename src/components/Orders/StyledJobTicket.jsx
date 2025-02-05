import React from 'react';

const StyledJobTicket = ({ order }) => {
  const {
    clientName,
    projectName,
    date,
    deliveryDate,
    jobDetails,
    dieDetails,
    lpDetails,
    fsDetails,
    embDetails,
    digiDetails,
    dieCutting,
    sandwich,
    pasting,
    stage
  } = order;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getStageNumber = (currentStage) => {
    const stages = ['Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];
    return stages.indexOf(currentStage) + 1;
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-blue-600">JOB TICKET</h1>
            <p className="text-lg text-gray-600 mt-1">#{order.id}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Order Date: {formatDate(date)}
            </div>
            <div className="text-sm text-gray-500">
              Delivery Date: {formatDate(deliveryDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'].map((step, index) => (
            <div 
              key={step} 
              className={`flex-1 text-center ${
                getStageNumber(stage) > index ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <div className={`
                  w-8 h-8 mx-auto rounded-full flex items-center justify-center
                  ${getStageNumber(stage) > index ? 'bg-blue-600 text-white' : 'bg-gray-200'}
                `}>
                  {index + 1}
                </div>
                <div className="mt-1 text-xs font-medium">{step}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute w-full h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(getStageNumber(stage) / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          {/* Client Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Client Details</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Client Name:</span><br/>
                {clientName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Project Name:</span><br/>
                {projectName}
              </p>
            </div>
          </div>

          {/* Job Specifications */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Job Specifications</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Job Type:</span> {jobDetails?.jobType}</p>
              <p><span className="font-medium">Quantity:</span> {jobDetails?.quantity}</p>
              <p><span className="font-medium">Paper:</span> {jobDetails?.paperName}</p>
              <p><span className="font-medium">Paper Provided:</span> {jobDetails?.paperProvided}</p>
            </div>
          </div>

          {/* Die Details */}
          {dieDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-blue-600">Die Information</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Die Code:</span> {dieDetails.dieCode}</p>
                <p>
                  <span className="font-medium">Die Size:</span><br/>
                  {dieDetails.dieSize?.length}" × {dieDetails.dieSize?.breadth}"
                </p>
                {dieDetails.image && (
                  <img 
                    src={dieDetails.image} 
                    alt="Die" 
                    className="mt-2 w-full h-auto object-contain rounded border"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Process Details */}
        <div className="col-span-2 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 text-blue-600">Production Requirements</h2>
          
          <div className="space-y-6">
            {/* LP Details */}
            {lpDetails?.isLPUsed && (
              <div className="relative pl-6 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"/>
                <h3 className="font-semibold mb-2">Letter Press</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Colors:</span> {lpDetails.noOfColors}</p>
                  <div className="ml-4">
                    {lpDetails.colorDetails?.map((color, index) => (
                      <div key={index} className="mt-2 p-2 bg-white rounded shadow-sm">
                        <p className="font-medium text-blue-600">Color {index + 1}</p>
                        <p>Pantone: {color.pantoneType}</p>
                        <p>Plate: {color.plateType}</p>
                        <p>MR Type: {color.mrType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FS Details */}
            {fsDetails?.isFSUsed && (
              <div className="relative pl-6 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"/>
                <h3 className="font-semibold mb-2">Foil Stamping</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Type:</span> {fsDetails.fsType}</p>
                  <div className="ml-4">
                    {fsDetails.foilDetails?.map((foil, index) => (
                      <div key={index} className="mt-2 p-2 bg-white rounded shadow-sm">
                        <p className="font-medium text-blue-600">Foil {index + 1}</p>
                        <p>Type: {foil.foilType}</p>
                        <p>Block: {foil.blockType}</p>
                        <p>MR Type: {foil.mrType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EMB Details */}
            {embDetails?.isEMBUsed && (
              <div className="relative pl-6 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"/>
                <h3 className="font-semibold mb-2">Embossing</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded shadow-sm">
                    <p>Male Plate: {embDetails.plateTypeMale}</p>
                    <p>Female Plate: {embDetails.plateTypeFemale}</p>
                    <p>MR Type: {embDetails.embMR}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Details */}
            {digiDetails?.isDigiUsed && (
              <div className="relative pl-6 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"/>
                <h3 className="font-semibold mb-2">Digital Printing</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded shadow-sm">
                    <p>Die: {digiDetails.digiDie}</p>
                    <p>Size: {digiDetails.digiDimensions?.length}" × {digiDetails.digiDimensions?.breadth}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Requirements */}
          <div className="mt-8 space-y-4">
            {sandwich?.isSandwichComponentUsed && (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <p className="font-medium">Sandwich Component Required</p>
                <p className="text-gray-600">Special handling needed for sandwich construction</p>
              </div>
            )}

            {pasting?.isPastingUsed && (
              <div className="p-3 bg-green-50 border-l-4 border-green-400 text-sm">
                <p className="font-medium">Pasting Required</p>
                <p className="text-gray-600">Type: {pasting.pastingType}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quality Control */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Quality Control Checklist</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Pre-Production</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Artwork/Design Approval</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Material Verification</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Die Check</span>
              </label>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Production</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Color Matching</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Registration Check</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm">Final Quality Inspection</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-off Section */}
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-20 border-b-2 border-gray-300 mb-2"></div>
            <p className="text-sm font-medium">Production Manager</p>
          </div>
          <div className="text-center">
            <div className="h-20 border-b-2 border-gray-300 mb-2"></div>
            <p className="text-sm font-medium">Quality Control</p>
          </div>
          <div className="text-center">
            <div className="h-20 border-b-2 border-gray-300 mb-2"></div>
            <p className="text-sm font-medium">Client Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledJobTicket;