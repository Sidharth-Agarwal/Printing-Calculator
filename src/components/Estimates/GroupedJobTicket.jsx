import React, { useState, useEffect } from 'react';

const DieImage = ({ imageUrl }) => {
  const [imageStatus, setImageStatus] = useState('loading');

  useEffect(() => {
    if (!imageUrl) {
      setImageStatus('error');
      return;
    }

    const img = new Image();
    img.onload = () => setImageStatus('loaded');
    img.onerror = () => setImageStatus('error');
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  if (imageStatus === 'loading') {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (imageStatus === 'error') {
    return (
      <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-1 h-16 bg-white">
      <img 
        src={imageUrl} 
        alt="Die" 
        className="w-full h-full object-contain"
        onError={() => setImageStatus('error')}
      />
    </div>
  );
};

const LPSection = ({ lpDetails }) => {
  if (!lpDetails?.isLPUsed) return null;

  return (
    <div className="space-y-1">
      <p className="font-medium text-xs">Colors: {lpDetails.noOfColors}</p>
      <div className="flex gap-2">
        {lpDetails.colorDetails.map((color, idx) => (
          <div key={idx} className="bg-white text-xs space-y-1 p-2 rounded">
            <p><strong>Color {idx + 1}:</strong> {color.pantoneType}</p>
            <p><strong>Size:</strong> {color.plateDimensions?.length} x {color.plateDimensions?.breadth}</p>
            <p><strong>Plate:</strong> {color.plateType}</p>
            <p><strong>MR:</strong> {color.mrType}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const FSSection = ({ fsDetails }) => {
  if (!fsDetails?.isFSUsed) return null;

  return (
    <div className="space-y-1">
      <p className="font-medium text-xs">Type: {fsDetails.fsType}</p>
      <div className="flex gap-2">
        {fsDetails.foilDetails.map((foil, idx) => (
          <div key={idx} className="bg-white text-xs space-y-1 p-2 rounded">
            <p><strong>Foil {idx + 1}:</strong> {foil.foilType}</p>
            <p><strong>Size:</strong> {foil.blockDimension?.length} x {foil.blockDimension?.breadth}</p>
            <p><strong>Block:</strong> {foil.blockType}</p>
            <p><strong>MR:</strong> {foil.mrType}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const EMBSection = ({ embDetails }) => {
  if (!embDetails?.isEMBUsed) return null;

  return (
    <div className="bg-white text-xs space-y-1 p-2 rounded">
      <p><strong>Plate Size:</strong> {embDetails.plateDimensions?.length} x {embDetails.plateDimensions?.breadth}</p>
      <p><strong>Male Plate:</strong> {embDetails.plateTypeMale}</p>
      <p><strong>Female Plate:</strong> {embDetails.plateTypeFemale}</p>
      <p><strong>MR Type:</strong> {embDetails.embMR}</p>
    </div>
  );
};

const SandwichDetails = ({ sandwich }) => {
  if (!sandwich?.isSandwichComponentUsed) return null;

  return (
    <div className="bg-white p-2 rounded">
      <h3 className="font-bold text-xs mb-2">Sandwich Details</h3>
      
      {/* LP in Sandwich */}
      {sandwich.lpDetailsSandwich?.isLPUsed && (
        <div className="mb-2">
          <p className="font-medium text-xs mb-1">LP Details - Colors: {sandwich.lpDetailsSandwich.noOfColors}</p>
          <div className="border-l-2 border-blue-500 pl-2 flex gap-2">
            {sandwich.lpDetailsSandwich.colorDetails.map((color, idx) => (
              <div key={idx} className="text-xs space-y-1 mb-2 bg-gray-50 p-2 rounded">
                <p><strong>Color {idx + 1}:</strong> {color.pantoneType}</p>
                <p><strong>Size:</strong> {color.plateDimensions?.length} x {color.plateDimensions?.breadth}</p>
                <p><strong>Plate:</strong> {color.plateType}</p>
                <p><strong>MR:</strong> {color.mrType}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FS in Sandwich */}
      {sandwich.fsDetailsSandwich?.isFSUsed && (
        <div className="mb-2">
          <p className="font-medium text-xs mb-1">FS Details - Type: {sandwich.fsDetailsSandwich.fsType}</p>
          <div className="border-l-2 border-green-500 pl-2 flex gap-2">
            {sandwich.fsDetailsSandwich.foilDetails.map((foil, idx) => (
              <div key={idx} className="text-xs space-y-1 mb-2 bg-gray-50 p-2 rounded">
                <p><strong>Foil {idx + 1}:</strong> {foil.foilType}</p>
                <p><strong>Size:</strong> {foil.blockDimension?.length} x {foil.blockDimension?.breadth}</p>
                <p><strong>Block:</strong> {foil.blockType}</p>
                <p><strong>MR:</strong> {foil.mrType}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMB in Sandwich */}
      {sandwich.embDetailsSandwich?.isEMBUsed && (
        <div className="mb-2">
          <p className="font-medium text-xs mb-1">EMB Details</p>
          <div className="border-l-2 border-purple-500 pl-2">
            <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
              <p><strong>Plate Size:</strong> {sandwich.embDetailsSandwich.plateDimensions?.length} x {sandwich.embDetailsSandwich.plateDimensions?.breadth}</p>
              <p><strong>Male Plate:</strong> {sandwich.embDetailsSandwich.plateTypeMale}</p>
              <p><strong>Female Plate:</strong> {sandwich.embDetailsSandwich.plateTypeFemale}</p>
              <p><strong>MR Type:</strong> {sandwich.embDetailsSandwich.embMR}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EstimateDetails = ({ estimate, index }) => {
  const calculateTotalCost = (estimate) => {
    if (!estimate.calculations) return { perCard: 0, total: 0 };
    const relevantFields = [
      'paperAndCuttingCostPerCard', 'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 'digiCostPerCard'
    ];
    const costPerCard = relevantFields.reduce((acc, key) => {
      const value = estimate.calculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
    return {
      perCard: costPerCard,
      total: costPerCard * (estimate.jobDetails?.quantity || 0)
    };
  };

  const costs = calculateTotalCost(estimate);

  return (
    <div className="border rounded p-2 mb-2 bg-gray-50 print:break-inside-avoid">
      <h2 className="text-sm font-bold mb-2 bg-white p-1 rounded">
        Estimate #{index + 1} - Quantity: {estimate.jobDetails?.quantity} pcs
      </h2>

      <div className="space-y-3">
        {/* Paper and Die Details */}
        <div className="bg-white p-2 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-xs">
              <h3 className="font-bold mb-1">Paper and Die Details</h3>
              <p><strong>Paper:</strong> {estimate.jobDetails?.paperName}</p>
              <p><strong>Provided:</strong> {estimate.jobDetails?.paperProvided}</p>
              <p><strong>Die Code:</strong> {estimate.dieDetails?.dieCode}</p>
              <p><strong>Size:</strong> {estimate.dieDetails?.dieSize?.length} x {estimate.dieDetails?.dieSize?.breadth}</p>
            </div>
            <div>
              <DieImage imageUrl={estimate.dieDetails?.image} />
              <div className="mt-2 text-xs">
                <h4 className="font-bold mb-1">Cost Summary</h4>
                <p><strong>Per Card:</strong> ₹ {costs.perCard.toFixed(2)}</p>
                <p><strong>Total:</strong> ₹ {costs.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Process Details */}
        <div className="flex gap-2">
          {/* LP Details */}
          {estimate.lpDetails?.isLPUsed && (
            <div className="bg-white p-2 rounded">
              <h3 className="font-bold text-xs mb-1">LP Details</h3>
              <LPSection lpDetails={estimate.lpDetails} />
            </div>
          )}

          {/* FS Details */}
          {estimate.fsDetails?.isFSUsed && (
            <div className="bg-white p-2 rounded">
              <h3 className="font-bold text-xs mb-1">FS Details</h3>
              <FSSection fsDetails={estimate.fsDetails} />
            </div>
          )}

          {/* EMB Details */}
          {estimate.embDetails?.isEMBUsed && (
            <div className="bg-white p-2 rounded">
              <h3 className="font-bold text-xs mb-1">EMB Details</h3>
              <EMBSection embDetails={estimate.embDetails} />
            </div>
          )}

          {/* Sandwich Details */}
          {estimate.sandwich?.isSandwichComponentUsed && (
            <SandwichDetails sandwich={estimate.sandwich} />
          )}
        </div>
      </div>
    </div>
  );
};

const GroupedJobTicket = ({ estimates, groupKey }) => {
  const [clientName, projectName] = groupKey.split('-');

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-white p-4 mx-auto" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-2 mb-4">
        <h1 className="text-xl font-bold text-center mb-2">GROUP JOB TICKET</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Client:</strong> {clientName}</p>
            <p><strong>Project:</strong> {projectName}</p>
            <p><strong>Job Type:</strong> {estimates[0]?.jobDetails?.jobType}</p>
          </div>
          <div>
            <p><strong>Initial Date:</strong> {formatDate(estimates[0]?.date)}</p>
            <p><strong>Delivery Date:</strong> {
              formatDate(estimates.reduce((latest, est) => 
                !latest || new Date(est.deliveryDate) > new Date(latest) ? est.deliveryDate : latest, null
              ))
            }</p>
            <p><strong>Estimates:</strong> {estimates.length}</p>
          </div>
        </div>
      </div>

      {/* Estimates */}
      <div className="mb-4 space-y-2">
        {estimates.map((estimate, index) => (
          <EstimateDetails 
            key={estimate.id} 
            estimate={estimate} 
            index={index}
          />
        ))}
      </div>

      {/* Sign-off Section */}
      <div className="mt-6 print:mt-4">
        <div className="grid grid-cols-3 gap-8">
          {['Production Manager', 'Quality Control', 'Supervisor'].map((role) => (
            <div key={role} className="text-center">
              <div className="border-t border-black pt-2">
                <p className="text-sm font-medium">{role}</p>
                <div className="mt-4"></div>
                <p className="text-xs text-gray-500">Sign & Date</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>* All measurements are in inches unless otherwise specified</p>
          <p>* Please verify all specifications before beginning production</p>
          <p>* Report any discrepancies immediately to the production manager</p>
        </div>
      </div>

      {/* Print Info */}
      <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>Group Job Ticket - {clientName} - {projectName}</p>
      </div>
    </div>
  );
};

export default GroupedJobTicket;

// import React, { useState, useEffect } from 'react';

// const DieImage = ({ imageUrl }) => {
//   const [imageStatus, setImageStatus] = useState('loading');

//   useEffect(() => {
//     if (!imageUrl) {
//       setImageStatus('error');
//       return;
//     }

//     const img = new Image();
//     img.onload = () => setImageStatus('loaded');
//     img.onerror = () => setImageStatus('error');
//     img.src = imageUrl;

//     return () => {
//       img.onload = null;
//       img.onerror = null;
//     };
//   }, [imageUrl]);

//   if (imageStatus === 'loading') {
//     return (
//       <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
//         <div className="text-center text-gray-500">
//           <svg className="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//           </svg>
//         </div>
//       </div>
//     );
//   }

//   if (imageStatus === 'error') {
//     return (
//       <div className="border rounded p-1 h-16 flex items-center justify-center bg-gray-50">
//         <div className="text-center text-gray-500">
//           <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="border rounded p-1 h-16 bg-white">
//       <img 
//         src={imageUrl} 
//         alt="Die" 
//         className="w-full h-full object-contain"
//         onError={() => setImageStatus('error')}
//       />
//     </div>
//   );
// };

// const LPSection = ({ lpDetails }) => {
//   if (!lpDetails?.isLPUsed) return null;

//   return (
//     <div className="space-y-1">
//       <p className="font-medium text-xs">Colors: {lpDetails.noOfColors}</p>
//       <div className="flex gap-2 overflow-x-auto">
//         {lpDetails.colorDetails.map((color, idx) => (
//           <div key={idx} className="bg-white text-xs space-y-1 p-2 rounded min-w-[200px]">
//             <p><strong>Color {idx + 1}:</strong> {color.pantoneType}</p>
//             <p><strong>Size:</strong> {color.plateDimensions?.length} x {color.plateDimensions?.breadth}</p>
//             <p><strong>Plate:</strong> {color.plateType}</p>
//             <p><strong>MR:</strong> {color.mrType}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const FSSection = ({ fsDetails }) => {
//   if (!fsDetails?.isFSUsed) return null;

//   return (
//     <div className="space-y-1">
//       <p className="font-medium text-xs">Type: {fsDetails.fsType}</p>
//       <div className="flex gap-2 overflow-x-auto">
//         {fsDetails.foilDetails.map((foil, idx) => (
//           <div key={idx} className="bg-white text-xs space-y-1 p-2 rounded min-w-[200px]">
//             <p><strong>Foil {idx + 1}:</strong> {foil.foilType}</p>
//             <p><strong>Size:</strong> {foil.blockDimension?.length} x {foil.blockDimension?.breadth}</p>
//             <p><strong>Block:</strong> {foil.blockType}</p>
//             <p><strong>MR:</strong> {foil.mrType}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const EMBSection = ({ embDetails }) => {
//   if (!embDetails?.isEMBUsed) return null;

//   return (
//     <div className="bg-white text-xs space-y-1 p-2 rounded">
//       <p><strong>Plate Size:</strong> {embDetails.plateDimensions?.length} x {embDetails.plateDimensions?.breadth}</p>
//       <p><strong>Male Plate:</strong> {embDetails.plateTypeMale}</p>
//       <p><strong>Female Plate:</strong> {embDetails.plateTypeFemale}</p>
//       <p><strong>MR Type:</strong> {embDetails.embMR}</p>
//     </div>
//   );
// };

// const SandwichDetails = ({ sandwich }) => {
//   if (!sandwich?.isSandwichComponentUsed) return null;

//   return (
//     <div className="bg-white p-2 rounded">
//       <h3 className="font-bold text-xs mb-2">Sandwich Details</h3>
      
//       {/* LP in Sandwich */}
//       {sandwich.lpDetailsSandwich?.isLPUsed && (
//         <div className="mb-2">
//           <p className="font-medium text-xs mb-1">LP Details - Colors: {sandwich.lpDetailsSandwich.noOfColors}</p>
//           <div className="border-l-2 border-blue-500 pl-2 flex gap-2 overflow-x-auto">
//             {sandwich.lpDetailsSandwich.colorDetails.map((color, idx) => (
//               <div key={idx} className="text-xs space-y-1 mb-2 bg-gray-50 p-2 rounded min-w-[200px]">
//                 <p><strong>Color {idx + 1}:</strong> {color.pantoneType}</p>
//                 <p><strong>Size:</strong> {color.plateDimensions?.length} x {color.plateDimensions?.breadth}</p>
//                 <p><strong>Plate:</strong> {color.plateType}</p>
//                 <p><strong>MR:</strong> {color.mrType}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* FS in Sandwich */}
//       {sandwich.fsDetailsSandwich?.isFSUsed && (
//         <div className="mb-2">
//           <p className="font-medium text-xs mb-1">FS Details - Type: {sandwich.fsDetailsSandwich.fsType}</p>
//           <div className="border-l-2 border-green-500 pl-2 flex gap-2 overflow-x-auto">
//             {sandwich.fsDetailsSandwich.foilDetails.map((foil, idx) => (
//               <div key={idx} className="text-xs space-y-1 mb-2 bg-gray-50 p-2 rounded min-w-[200px]">
//                 <p><strong>Foil {idx + 1}:</strong> {foil.foilType}</p>
//                 <p><strong>Size:</strong> {foil.blockDimension?.length} x {foil.blockDimension?.breadth}</p>
//                 <p><strong>Block:</strong> {foil.blockType}</p>
//                 <p><strong>MR:</strong> {foil.mrType}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* EMB in Sandwich */}
//       {sandwich.embDetailsSandwich?.isEMBUsed && (
//         <div className="mb-2">
//           <p className="font-medium text-xs mb-1">EMB Details</p>
//           <div className="border-l-2 border-purple-500 pl-2">
//             <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
//               <p><strong>Plate Size:</strong> {sandwich.embDetailsSandwich.plateDimensions?.length} x {sandwich.embDetailsSandwich.plateDimensions?.breadth}</p>
//               <p><strong>Male Plate:</strong> {sandwich.embDetailsSandwich.plateTypeMale}</p>
//               <p><strong>Female Plate:</strong> {sandwich.embDetailsSandwich.plateTypeFemale}</p>
//               <p><strong>MR Type:</strong> {sandwich.embDetailsSandwich.embMR}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const EstimateDetails = ({ estimate, index }) => {
//   const calculateTotalCost = (estimate) => {
//     if (!estimate.calculations) return { perCard: 0, total: 0 };
//     const relevantFields = [
//       'paperAndCuttingCostPerCard', 'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
//       'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 'digiCostPerCard'
//     ];
//     const costPerCard = relevantFields.reduce((acc, key) => {
//       const value = estimate.calculations[key];
//       return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
//     }, 0);
//     return {
//       perCard: costPerCard,
//       total: costPerCard * (estimate.jobDetails?.quantity || 0)
//     };
//   };

//   const costs = calculateTotalCost(estimate);

//   return (
//     <div className="border rounded p-2 mb-2 bg-gray-50 print:break-inside-avoid">
//       <h2 className="text-sm font-bold mb-2 bg-white p-1 rounded">
//         Estimate #{index + 1} - Quantity: {estimate.jobDetails?.quantity} pcs
//       </h2>

//       <div className="space-y-3">
//         {/* Paper and Die Details */}
//         <div className="bg-white p-2 rounded">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1 text-xs">
//               <h3 className="font-bold mb-1">Paper and Die Details</h3>
//               <p><strong>Paper:</strong> {estimate.jobDetails?.paperName}</p>
//               <p><strong>Provided:</strong> {estimate.jobDetails?.paperProvided}</p>
//               <p><strong>Die Code:</strong> {estimate.dieDetails?.dieCode}</p>
//               <p><strong>Size:</strong> {estimate.dieDetails?.dieSize?.length} x {estimate.dieDetails?.dieSize?.breadth}</p>
//             </div>
//             <div>
//               <DieImage imageUrl={estimate.dieDetails?.image} />
//               <div className="mt-2 text-xs">
//                 <h4 className="font-bold mb-1">Cost Summary</h4>
//                 <p><strong>Per Card:</strong> ₹ {costs.perCard.toFixed(2)}</p>
//                 <p><strong>Total:</strong> ₹ {costs.total.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Process Details */}
//         <div className="flex gap-2 overflow-x-auto">
//           {/* LP Details */}
//           {estimate.lpDetails?.isLPUsed && (
//             <div className="bg-white p-2 rounded min-w-[250px]">
//               <h3 className="font-bold text-xs mb-1">LP Details</h3>
//               <LPSection lpDetails={estimate.lpDetails} />
//             </div>
//           )}

//           {/* FS Details */}
//           {estimate.fsDetails?.isFSUsed && (
//             <div className="bg-white p-2 rounded min-w-[250px]">
//               <h3 className="font-bold text-xs mb-1">FS Details</h3>
//               <FSSection fsDetails={estimate.fsDetails} />
//             </div>
//           )}

//           {/* EMB Details */}
//           {estimate.embDetails?.isEMBUsed && (
//             <div className="bg-white p-2 rounded min-w-[250px]">
//               <h3 className="font-bold text-xs mb-1">EMB Details</h3>
//               <EMBSection embDetails={estimate.embDetails} />
//             </div>
//           )}

//           {/* Sandwich Details */}
//           {estimate.sandwich?.isSandwichComponentUsed && (
//             <div className="bg-white p-2 rounded min-w-[250px]">
//               <h3 className="font-bold text-xs mb-1">Sandwich Details</h3>
//               <SandwichDetails sandwich={estimate.sandwich} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const GroupedJobTicket = ({ estimates, groupKey }) => {
//   const [clientName, projectName] = groupKey.split('-');

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     return new Date(dateString).toLocaleDateString('en-GB');
//   };

//   return (
//     <div className="bg-white p-4 mx-auto" style={{ maxWidth: '100%', margin: '0 auto' }}>
//       {/* Header */}
//       <div className="border-b-2 border-gray-800 pb-2 mb-4">
//         <h1 className="text-xl font-bold text-center mb-2">GROUP JOB TICKET</h1>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p><strong>Client:</strong> {clientName}</p>
//             <p><strong>Project:</strong> {projectName}</p>
//             <p><strong>Job Type:</strong> {estimates[0]?.jobDetails?.jobType}</p>
//           </div>
//           <div>
//             <p><strong>Initial Date:</strong> {formatDate(estimates[0]?.date)}</p>
//             <p><strong>Delivery Date:</strong> {
//               formatDate(estimates.reduce((latest, est) => 
//                 !latest || new Date(est.deliveryDate) > new Date(latest) ? est.deliveryDate : latest, null
//               ))
//             }</p>
//             <p><strong>Estimates:</strong> {estimates.length}</p>
//           </div>
//         </div>
//       </div>

//       {/* Estimates */}
//       <div className="mb-4 space-y-2"></div>
