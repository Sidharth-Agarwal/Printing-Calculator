// // CostSummarySection.jsx
// import React from "react";
// import { MARKUP_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
// import { formatCurrency } from "../../../utils/formatters";
// import { FIELD_LABELS } from "../../../constants/fieldLabels";
// import SelectField from "../fields/SelectField";
// import NumberField from "../fields/NumberField";

// const CostSummarySection = ({ 
//   calculations, 
//   isCalculating, 
//   calculationError,
//   markupPercentage,
//   setMarkupPercentage 
// }) => {
//   if (isCalculating) {
//     return (
//       <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
//         <div className="flex items-center justify-center space-x-2 py-4">
//           <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <span className="text-gray-600">Calculating costs...</span>
//         </div>
//       </div>
//     );
//   }

//   if (calculationError) {
//     return (
//       <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
//         <p className="text-red-600 text-center">
//           {calculationError}
//         </p>
//       </div>
//     );
//   }

//   if (!calculations) {
//     return (
//       <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
//         <p className="text-gray-600 text-center">
//           Enter order details to see cost calculations
//         </p>
//       </div>
//     );
//   }

//   // Calculate totals with the current markup percentage
//   const calculateTotals = () => {
//     // Constants
//     const WASTAGE_PERCENTAGE = 5; // 5% wastage
//     const OVERHEAD_PERCENTAGE = 35; // 35% overhead
//     const MISC_CHARGE_PER_CARD = 5; // 5 rupees miscellaneous charge per card

//     // Define all cost fields that should be included
//     const relevantFields = [
//       'paperAndCuttingCostPerCard',
//       'lpCostPerCard',
//       'fsCostPerCard',
//       'embCostPerCard',
//       'lpCostPerCardSandwich',
//       'fsCostPerCardSandwich',
//       'embCostPerCardSandwich',
//       'digiCostPerCard',
//       'dieCuttingCostPerCard',
//       'pastingCostPerCard'
//     ];

//     // Calculate base cost per card
//     const baseCost = relevantFields.reduce((acc, key) => {
//       const value = calculations[key];
//       return acc + (value !== null && value !== undefined ? parseFloat(value) || 0 : 0);
//     }, 0);

//     // Add miscellaneous charge to base cost
//     const baseWithMisc = baseCost + MISC_CHARGE_PER_CARD;
    
//     // Calculate wastage cost
//     const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
//     // Calculate overhead cost
//     const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
//     // Calculate cost with wastage and overhead
//     const subtotal = baseWithMisc + wastageCost + overheadCost;
    
//     // Calculate markup cost
//     const markupCost = subtotal * (markupPercentage / 100);
    
//     // Calculate total cost per card
//     const totalCostPerCard = subtotal + markupCost;

//     return {
//       baseCost,
//       miscCharge: MISC_CHARGE_PER_CARD,
//       baseWithMisc,
//       wastageCost,
//       overheadCost,
//       subtotal,
//       markupCost,
//       totalCostPerCard
//     };
//   };

//   const totals = calculateTotals();

//   const handleMarkupTypeChange = (e) => {
//     const selectedType = e.target.value;
    
//     if (selectedType === "custom") {
//       // Just keep current value for custom
//       return;
//     }
    
//     // Set markup based on type
//     switch (selectedType) {
//       case "Standard":
//         setMarkupPercentage(15);
//         break;
//       case "Premium":
//         setMarkupPercentage(25);
//         break;
//       case "Economy":
//         setMarkupPercentage(10);
//         break;
//       default:
//         setMarkupPercentage(0);
//     }
//   };

//   return (
//     <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
//       <h2 className="text-lg font-semibold text-gray-700 mb-4">Cost Summary</h2>
      
//       {/* Markup Selection */}
//       <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
//         <h3 className="font-medium text-gray-700 mb-2">Markup Selection</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
//           <div>
//             <SelectField
//               id="markupType"
//               placeholder="Select Markup Type"
//               options={MARKUP_TYPE_OPTIONS}
//               onChange={handleMarkupTypeChange}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <NumberField
//               id="markupPercentage"
//               value={markupPercentage}
//               onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
//               placeholder="Custom markup percentage"
//               min="0"
//               max="100"
//               step="1"
//             />
//             <span className="text-lg font-bold">%</span>
//           </div>
//           <div className="text-sm text-gray-600">
//             Markup percentage to add to the final price
//           </div>
//         </div>
//       </div>
      
//       {/* Cost Breakdown */}
//       <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
//         <div className="space-y-2 mb-4">
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.BASE_COST}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.baseCost)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.MISC_CHARGE}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.miscCharge)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.BASE_WITH_MISC}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.baseWithMisc)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.WASTAGE}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.wastageCost)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.OVERHEADS}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.overheadCost)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="font-medium text-gray-700">{FIELD_LABELS.SUBTOTAL}:</span>
//             <span className="text-gray-900">{formatCurrency(totals.subtotal)}</span>
//           </div>
          
//           {/* Markup Line */}
//           <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
//             <span className="font-medium">{FIELD_LABELS.MARKUP} ({markupPercentage}%):</span>
//             <span className="font-medium">{formatCurrency(totals.markupCost)}</span>
//           </div>
          
//           {/* Total Per Card */}
//           <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
//             <span className="text-lg font-bold text-gray-700">{FIELD_LABELS.TOTAL_COST_PER_CARD}:</span>
//             <span className="text-lg font-bold text-gray-900">{formatCurrency(totals.totalCostPerCard)}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CostSummarySection;