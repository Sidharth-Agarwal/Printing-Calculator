// import React from 'react';

// const CostDisplaySection = ({ 
//   data, 
//   calculations, 
//   canViewDetailedCosts = true,
//   dataType = 'estimate'
// }) => {
//   if (!calculations) return null;
  
//   // Function to format number values consistently
//   const formatCurrency = (value) => {
//     if (value === null || value === undefined || value === "") return "₹0.00";
//     return `₹${parseFloat(value).toFixed(2)}`;
//   };

//   // Function to check if a section should be displayed
//   const shouldDisplaySection = (serviceKey, toggleField) => {
//     return data[serviceKey]?.[toggleField] === true;
//   };

//   // Compact cost item component
//   const CostItem = ({ label, value, isSubItem = false, isTotal = false, isHighlight = false }) => {
//     const formattedValue = parseFloat(value || 0).toFixed(2);
    
//     return (
//       <div className={`
//         flex justify-between items-center py-1 px-2 text-sm rounded
//         ${isTotal ? 'font-semibold bg-blue-50 border-l-2 border-blue-400' : 
//           isHighlight ? 'font-medium bg-green-50 border-l-2 border-green-400' :
//           isSubItem ? 'pl-4 text-gray-600 bg-gray-25' : 'bg-white'}
//       `}>
//         <span className="truncate pr-2">{label}</span>
//         <span className="font-mono whitespace-nowrap text-right">₹{formattedValue}</span>
//       </div>
//     );
//   };

//   // Meta item for non-currency values
//   const MetaItem = ({ label, value }) => {
//     return (
//       <div className="pl-4 text-xs text-gray-600">
//         {label} {value}
//       </div>
//     );
//   };

//   // Render paper and cutting section
//   const renderPaperAndCuttingSection = () => {
//     if (!calculations.paperAndCuttingCostPerCard) return null;
    
//     return (
//       <div className="mb-3">
//         <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Paper & Cutting</h4>
//         <div className="space-y-1">
//           {calculations.paperCostPerCard && (
//             <CostItem label="Paper Cost" value={calculations.paperCostPerCard} isSubItem />
//           )}
//           {calculations.gilCutCostPerCard && (
//             <CostItem label="Gil Cutting Labor" value={calculations.gilCutCostPerCard} isSubItem />
//           )}
//           {calculations.paperAndCuttingCostPerCard && (
//             <CostItem 
//               label="Total Paper & Cutting" 
//               value={calculations.paperAndCuttingCostPerCard}
//               isTotal
//             />
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Render production services section - ALL FIELDS COMPACT
//   const renderProductionServices = () => {
//     let hasAnyProductionService = false;
//     const services = [];

//     // LP Section
//     if (shouldDisplaySection('lpDetails', 'isLPUsed') && calculations.lpCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="lp" className="space-y-1 mb-2">
//           <CostItem label="Letter Press (LP)" value={calculations.lpCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.lpPlateCostPerCard && <CostItem label="Plate" value={calculations.lpPlateCostPerCard} isSubItem />}
//             {calculations.lpImpressionCostPerCard && <CostItem label="Impression" value={calculations.lpImpressionCostPerCard} isSubItem />}
//             {calculations.lpPositiveFilmCostPerCard && <CostItem label="Positive Film" value={calculations.lpPositiveFilmCostPerCard} isSubItem />}
//             {calculations.lpMRCostPerCard && <CostItem label="MR Cost" value={calculations.lpMRCostPerCard} isSubItem />}
//             {calculations.lpMkgCostPerCard && <CostItem label="Making Cost" value={calculations.lpMkgCostPerCard} isSubItem />}
//             {calculations.lpInkCostPerCard && <CostItem label="Ink" value={calculations.lpInkCostPerCard} isSubItem />}
//           </div>
//         </div>
//       );
//     }

//     // FS Section
//     if (shouldDisplaySection('fsDetails', 'isFSUsed') && calculations.fsCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="fs" className="space-y-1 mb-2">
//           <CostItem label="Foil Stamping (FS)" value={calculations.fsCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.fsBlockCostPerCard && <CostItem label="Block" value={calculations.fsBlockCostPerCard} isSubItem />}
//             {calculations.fsFoilCostPerCard && <CostItem label="Foil" value={calculations.fsFoilCostPerCard} isSubItem />}
//             {calculations.fsMRCostPerCard && <CostItem label="MR Cost" value={calculations.fsMRCostPerCard} isSubItem />}
//             {calculations.fsImpressionCostPerCard && <CostItem label="Impression" value={calculations.fsImpressionCostPerCard} isSubItem />}
//             {calculations.fsFreightCostPerCard && <CostItem label="Freight" value={calculations.fsFreightCostPerCard} isSubItem />}
//           </div>
//         </div>
//       );
//     }

//     // EMB Section
//     if (shouldDisplaySection('embDetails', 'isEMBUsed') && calculations.embCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="emb" className="space-y-1 mb-2">
//           <CostItem label="Embossing (EMB)" value={calculations.embCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.embPlateCostPerCard && <CostItem label="Plate" value={calculations.embPlateCostPerCard} isSubItem />}
//             {calculations.embImpressionCostPerCard && <CostItem label="Impression" value={calculations.embImpressionCostPerCard} isSubItem />}
//             {calculations.embMRCostPerCard && <CostItem label="MR Cost" value={calculations.embMRCostPerCard} isSubItem />}
//             {calculations.embMkgPlateCostPerCard && <CostItem label="Making Plate" value={calculations.embMkgPlateCostPerCard} isSubItem />}
//             {calculations.embPositiveFilmCostPerCard && <CostItem label="Positive Film" value={calculations.embPositiveFilmCostPerCard} isSubItem />}
//             {calculations.embDstMaterialCostPerCard && parseFloat(calculations.embDstMaterialCostPerCard) > 0 && (
//               <CostItem label="DST Material" value={calculations.embDstMaterialCostPerCard} isSubItem />
//             )}
//           </div>
//         </div>
//       );
//     }

//     // Screen Print Section
//     if (shouldDisplaySection('screenPrint', 'isScreenPrintUsed') && calculations.screenPrintCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="screen" className="space-y-1 mb-2">
//           <CostItem label="Screen Printing" value={calculations.screenPrintCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.screenPrintPerPieceCost && <CostItem label="Per Piece" value={calculations.screenPrintPerPieceCost} isSubItem />}
//             {calculations.screenPrintBaseCostPerCard && <CostItem label="Base Cost" value={calculations.screenPrintBaseCostPerCard} isSubItem />}
//             {calculations.screenPrintMRCostPerCard && <CostItem label="MR Cost" value={calculations.screenPrintMRCostPerCard} isSubItem />}
//           </div>
//           {calculations.noOfColors && (
//             <MetaItem label="Colors:" value={calculations.noOfColors} />
//           )}
//         </div>
//       );
//     }

//     // Digital Printing Section
//     if (shouldDisplaySection('digiDetails', 'isDigiUsed') && calculations.digiCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="digi" className="space-y-1 mb-2">
//           <CostItem label="Digital Printing" value={calculations.digiCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.digiPrintCostPerCard && <CostItem label="Print Cost" value={calculations.digiPrintCostPerCard} isSubItem />}
//             {calculations.digiPaperCostPerCard && <CostItem label="Paper Cost" value={calculations.digiPaperCostPerCard} isSubItem />}
//             {calculations.digiGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.digiGilCutCostPerCard} isSubItem />}
//           </div>
//           {calculations.totalFragsPerSheet && (
//             <MetaItem label="Fragments per sheet:" value={calculations.totalFragsPerSheet} />
//           )}
//           {calculations.totalSheets && (
//             <MetaItem label="Total sheets:" value={calculations.totalSheets} />
//           )}
//         </div>
//       );
//     }

//     // Notebook Section
//     if (shouldDisplaySection('notebookDetails', 'isNotebookUsed') && calculations.notebookCostPerCard) {
//       hasAnyProductionService = true;
//       services.push(
//         <div key="notebook" className="space-y-1">
//           <CostItem label="Notebook" value={calculations.notebookCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.notebookPagesCostPerCard && <CostItem label="Pages" value={calculations.notebookPagesCostPerCard} isSubItem />}
//             {calculations.notebookBindingCostPerCard && <CostItem label="Binding" value={calculations.notebookBindingCostPerCard} isSubItem />}
//             {calculations.notebookGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.notebookGilCutCostPerCard} isSubItem />}
//           </div>
//           {calculations.possibleNumberOfForma && (
//             <MetaItem label="Forma per notebook:" value={calculations.possibleNumberOfForma} />
//           )}
//           {calculations.totalPages && (
//             <MetaItem label="Total pages:" value={calculations.totalPages} />
//           )}
//           {calculations.totalFormaRequired && (
//             <MetaItem label="Total forma required:" value={calculations.totalFormaRequired} />
//           )}
//           {calculations.totalSheets && (
//             <MetaItem label="Total sheets:" value={calculations.totalSheets} />
//           )}
//         </div>
//       );
//     }
    
//     if (!hasAnyProductionService) return null;
    
//     return (
//       <div className="mb-3">
//         <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Production Services</h4>
//         <div className="space-y-2">
//           {services}
//         </div>
//       </div>
//     );
//   };

//   // Render post-production services section - ALL FIELDS COMPACT
//   const renderPostProductionServices = () => {
//     let hasAnyPostProductionService = false;
//     const services = [];

//     // Pre Die Cutting
//     if (shouldDisplaySection('preDieCutting', 'isPreDieCuttingUsed') && calculations.preDieCuttingCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="predc" className="space-y-1 mb-2">
//           <CostItem label="Pre Die Cutting" value={calculations.preDieCuttingCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.preDieCuttingMRCostPerCard && <CostItem label="MR Cost" value={calculations.preDieCuttingMRCostPerCard} isSubItem />}
//             {calculations.preDieCuttingImpressionCostPerCard && <CostItem label="Impression" value={calculations.preDieCuttingImpressionCostPerCard} isSubItem />}
//           </div>
//         </div>
//       );
//     }

//     // Die Cutting
//     if (shouldDisplaySection('dieCutting', 'isDieCuttingUsed') && calculations.dieCuttingCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="dc" className="space-y-1 mb-2">
//           <CostItem label="Die Cutting" value={calculations.dieCuttingCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.dieCuttingMRCostPerCard && <CostItem label="MR Cost" value={calculations.dieCuttingMRCostPerCard} isSubItem />}
//             {calculations.dieCuttingImpressionCostPerCard && <CostItem label="Impression" value={calculations.dieCuttingImpressionCostPerCard} isSubItem />}
//           </div>
//         </div>
//       );
//     }

//     // Post Die Cutting
//     if (shouldDisplaySection('postDC', 'isPostDCUsed') && calculations.postDCCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="postdc" className="space-y-1 mb-2">
//           <CostItem label="Post Die Cutting" value={calculations.postDCCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.postDCMRCostPerCard && <CostItem label="MR Cost" value={calculations.postDCMRCostPerCard} isSubItem />}
//             {calculations.postDCImpressionCostPerCard && <CostItem label="Impression" value={calculations.postDCImpressionCostPerCard} isSubItem />}
//           </div>
//         </div>
//       );
//     }

//     // Fold and Paste
//     if (shouldDisplaySection('foldAndPaste', 'isFoldAndPasteUsed') && calculations.foldAndPasteCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="foldpaste" className="space-y-1 mb-2">
//           <CostItem label="Fold and Paste" value={calculations.foldAndPasteCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.dstMaterialCostPerCard && <CostItem label="DST Material" value={calculations.dstMaterialCostPerCard} isSubItem />}
//             {calculations.foldAndPasteOperationCostPerCard && <CostItem label="Operation" value={calculations.foldAndPasteOperationCostPerCard} isSubItem />}
//           </div>
//           {calculations.fragsPerDie && (
//             <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
//           )}
//         </div>
//       );
//     }

//     // DST Paste
//     if (shouldDisplaySection('dstPaste', 'isDstPasteUsed') && calculations.dstPasteCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="dstpaste" className="space-y-1 mb-2">
//           <CostItem label="DST Paste" value={calculations.dstPasteCostPerCard} isTotal />
//           {calculations.dstType && (
//             <MetaItem label="DST Type:" value={calculations.dstType} />
//           )}
//           {calculations.fragsPerDie && (
//             <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
//           )}
//         </div>
//       );
//     }

//     // Magnet
//     if (shouldDisplaySection('magnet', 'isMagnetUsed') && calculations.magnetCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="magnet" className="space-y-1 mb-2">
//           <CostItem label="Magnet" value={calculations.magnetCostPerCard} isTotal />
//           {calculations.plateArea && (
//             <MetaItem label="Plate Area:" value={`${calculations.plateArea} cm²`} />
//           )}
//           {calculations.fragsPerDie && (
//             <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
//           )}
//         </div>
//       );
//     }

//     // QC
//     if (shouldDisplaySection('qc', 'isQCUsed') && calculations.qcCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <CostItem key="qc" label="Quality Check" value={calculations.qcCostPerCard} isTotal />
//       );
//     }

//     // Packing
//     if (shouldDisplaySection('packing', 'isPackingUsed') && calculations.packingCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="packing" className="space-y-1 mb-2">
//           <CostItem label="Packing" value={calculations.packingCostPerCard} isTotal />
//           {calculations.packingPercentage && (
//             <MetaItem label={`Packing: ${calculations.packingPercentage}% of COGS`} value="" />
//           )}
//         </div>
//       );
//     }

//     // Misc
//     if (shouldDisplaySection('misc', 'isMiscUsed') && calculations.miscCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="misc" className="space-y-1 mb-2">
//           <CostItem label="Miscellaneous" value={calculations.miscCostPerCard} isTotal />
//           {calculations.miscChargeSource === "user" && (
//             <MetaItem label="Custom charge" value="" />
//           )}
//           {calculations.miscChargeSource === "database" && (
//             <MetaItem label="Standard charge" value="" />
//           )}
//         </div>
//       );
//     }

//     // Sandwich/Duplex
//     if (shouldDisplaySection('sandwich', 'isSandwichComponentUsed') && calculations.sandwichCostPerCard) {
//       hasAnyPostProductionService = true;
//       services.push(
//         <div key="sandwich" className="space-y-1">
//           <CostItem label="Duplex/Sandwich" value={calculations.sandwichCostPerCard} isTotal />
//           <div className="grid grid-cols-3 gap-1">
//             {calculations.sandwichPaperCostPerCard && <CostItem label="Paper" value={calculations.sandwichPaperCostPerCard} isSubItem />}
//             {calculations.sandwichGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.sandwichGilCutCostPerCard} isSubItem />}
//             {calculations.lpCostPerCardSandwich && <CostItem label="LP" value={calculations.lpCostPerCardSandwich} isSubItem />}
//             {calculations.fsCostPerCardSandwich && <CostItem label="FS" value={calculations.fsCostPerCardSandwich} isSubItem />}
//             {calculations.embCostPerCardSandwich && <CostItem label="EMB" value={calculations.embCostPerCardSandwich} isSubItem />}
//           </div>
//         </div>
//       );
//     }
    
//     if (!hasAnyPostProductionService) return null;
    
//     return (
//       <div className="mb-3">
//         <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Post-Production</h4>
//         <div className="space-y-2">
//           {services}
//         </div>
//       </div>
//     );
//   };

//   // Render wastage and overhead section
//   const renderWastageAndOverhead = () => {
//     if (!calculations.baseCost) return null;
    
//     return (
//       <div className="mb-3">
//         <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Wastage & Overhead</h4>
//         <div className="space-y-1">
//           <CostItem label="Base Cost" value={calculations.baseCost} />
          
//           {calculations.wastagePercentage && (
//             <CostItem 
//               label={`Wastage (${calculations.wastagePercentage}%)`} 
//               value={calculations.wastageAmount || 0} 
//             />
//           )}
          
//           {calculations.overheadPercentage && (
//             <CostItem 
//               label={`Overhead (${calculations.overheadPercentage}%)`} 
//               value={calculations.overheadAmount || 0} 
//             />
//           )}
          
//           <CostItem 
//             label="COGS (Cost of Goods Sold)" 
//             value={calculations.COGS} 
//             isTotal
//           />
//         </div>
//       </div>
//     );
//   };

//   // Render loyalty discount section
//   const renderLoyaltyDiscount = () => {
//     if (!calculations.loyaltyDiscount || !calculations.loyaltyDiscountAmount) {
//       return null;
//     }
    
//     return (
//       <div className="mt-2 border-t border-blue-100 pt-2">
//         <div className="flex justify-between items-center text-blue-700 text-sm">
//           <span className="font-medium">
//             B2B Loyalty Discount ({calculations.loyaltyTierName || 'Member'}: {calculations.loyaltyDiscount}%):
//           </span>
//           <span className="font-medium">
//             -{formatCurrency(calculations.loyaltyDiscountAmount)}
//           </span>
//         </div>
        
//         {calculations.discountedTotalCost && (
//           <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
//             <span className="font-bold text-gray-700">Discounted Total:</span>
//             <span className="font-bold text-blue-700">
//               {formatCurrency(calculations.discountedTotalCost)}
//             </span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Compact cost summary for admin view
//   const renderCostSummary = () => {
//     if (!calculations) return null;
    
//     return (
//       <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded border border-gray-200">
//         <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
        
//         <div className="space-y-1">
//           <div className="flex justify-between text-sm">
//             <span>Subtotal per Item:</span>
//             <span className="font-mono">{formatCurrency(calculations.subtotalPerCard)}</span>
//           </div>
          
//           <div className="flex justify-between text-sm text-blue-600">
//             <span>Markup ({calculations.markupPercentage || 0}%):</span>
//             <span className="font-mono">{formatCurrency(calculations.markupAmount)}</span>
//           </div>
          
//           <div className="flex justify-between font-semibold border-t pt-1">
//             <span>Cost per Item:</span>
//             <span className="font-mono">{formatCurrency(calculations.totalCostPerCard)}</span>
//           </div>
          
//           <div className="flex justify-between font-semibold text-lg border-t pt-1 mt-1">
//             <span>Total ({data.jobDetails?.quantity || 0} pcs):</span>
//             <span className="font-mono text-blue-600">{formatCurrency(calculations.totalCost)}</span>
//           </div>
          
//           {renderLoyaltyDiscount()}
          
//           <div className="flex justify-between text-green-600">
//             <span>GST ({calculations.gstRate || 18}%):</span>
//             <span className="font-mono">{formatCurrency(calculations.gstAmount)}</span>
//           </div>
          
//           <div className="flex justify-between font-bold border-t pt-1 text-green-700">
//             <span>Total with GST:</span>
//             <span className="font-mono">{formatCurrency(calculations.totalWithGST)}</span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Compact B2B cost summary
//   const renderSimplifiedCostSummary = () => {
//     if (!calculations) return null;
    
//     const totalCostPerCard = parseFloat(calculations.totalCostPerCard || 0);
//     const quantity = parseInt(data.jobDetails?.quantity || 0);
//     const totalCost = parseFloat(calculations.totalCost || 0);
//     const gstRate = calculations.gstRate || 18;
//     const gstAmount = parseFloat(calculations.gstAmount || 0);
//     const totalWithGST = parseFloat(calculations.totalWithGST || totalCost + gstAmount);
    
//     const hasLoyaltyDiscount = calculations.loyaltyDiscount && calculations.loyaltyDiscountAmount;
//     const loyaltyDiscount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscount) : 0;
//     const loyaltyDiscountAmount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscountAmount) : 0;
//     const discountedTotal = hasLoyaltyDiscount ? parseFloat(calculations.discountedTotalCost) : totalCost;
    
//     return (
//       <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded border border-blue-200">
//         <h4 className="text-md font-semibold text-gray-800 mb-2">Cost Summary</h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           <div className="bg-white p-2 rounded">
//             <div className="text-xs text-gray-600">Cost per Item</div>
//             <div className="text-lg font-bold text-gray-800">{formatCurrency(totalCostPerCard)}</div>
//           </div>
          
//           <div className="bg-white p-2 rounded">
//             <div className="text-xs text-gray-600">Total ({quantity} pcs)</div>
//             <div className="text-lg font-bold text-blue-700">{formatCurrency(totalCost)}</div>
//           </div>
          
//           {hasLoyaltyDiscount && (
//             <>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <div className="text-xs text-green-700">Loyalty Discount ({loyaltyDiscount}%)</div>
//                 <div className="text-md font-bold text-green-700">-{formatCurrency(loyaltyDiscountAmount)}</div>
//               </div>
              
//               <div className="bg-white p-2 rounded">
//                 <div className="text-xs text-gray-600">Discounted Total</div>
//                 <div className="text-lg font-bold text-blue-700">{formatCurrency(discountedTotal)}</div>
//               </div>
//             </>
//           )}
          
//           <div className="bg-white p-2 rounded">
//             <div className="text-xs text-gray-600">GST ({gstRate}%)</div>
//             <div className="text-md font-semibold text-green-600">{formatCurrency(gstAmount)}</div>
//           </div>
          
//           <div className="bg-gradient-to-r from-green-100 to-green-50 p-2 rounded border border-green-200">
//             <div className="text-xs text-gray-700 font-medium">Total with GST</div>
//             <div className="text-lg font-bold text-green-700">{formatCurrency(totalWithGST)}</div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-2">
//       {/* For detailed costs view */}
//       {canViewDetailedCosts && (
//         <>
//           {renderPaperAndCuttingSection()}
//           {renderProductionServices()}
//           {renderPostProductionServices()}
//           {renderWastageAndOverhead()}
//           {renderCostSummary()}
//         </>
//       )}
      
//       {/* For simplified costs view (B2B) */}
//       {!canViewDetailedCosts && renderSimplifiedCostSummary()}
//     </div>
//   );
// };

// export default CostDisplaySection;

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calculator, Package, Settings, TrendingUp, FileText, DollarSign } from 'lucide-react';

const CostDisplaySection = ({ 
  data, 
  calculations, 
  canViewDetailedCosts = true,
  dataType = 'estimate'
}) => {
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    paperCutting: true,
    production: true,
    postProduction: true,
    wastageOverhead: true,
    summary: true
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Compact cost item component
  const CostItem = ({ label, value, isSubItem = false, isTotal = false, isHighlight = false }) => {
    const formattedValue = parseFloat(value || 0).toFixed(2);
    
    return (
      <div className={`
        flex justify-between items-center py-1 px-2 text-sm rounded
        ${isTotal ? 'font-semibold bg-blue-50 border-l-2 border-blue-400' : 
          isHighlight ? 'font-medium bg-green-50 border-l-2 border-green-400' :
          isSubItem ? 'pl-4 text-gray-600 bg-gray-25' : 'bg-white'}
      `}>
        <span className="truncate pr-2">{label}</span>
        <span className="font-mono whitespace-nowrap text-right">₹{formattedValue}</span>
      </div>
    );
  };

  // Section header component
  const SectionHeader = ({ title, icon: Icon, count, totalValue, isExpanded, onToggle }) => (
    <div 
      className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-600" />
        <h4 className="font-medium text-gray-700 text-sm">{title}</h4>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 && <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{count}</span>}
        {totalValue !== undefined && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
            ₹{parseFloat(totalValue || 0).toFixed(2)}
          </span>
        )}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
    </div>
  );

  // Collapsible section component
  const CollapsibleSection = ({ title, icon, count = 0, totalValue, isExpanded, onToggle, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <SectionHeader 
        title={title} 
        icon={icon}
        count={count}
        totalValue={totalValue}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="p-2 bg-white space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  // Get service counts
  const getServiceCounts = () => {
    if (!calculations) return {};
    
    const paperCount = (calculations.paperCostPerCard ? 1 : 0) + (calculations.gilCutCostPerCard ? 1 : 0);
    
    let productionCount = 0;
    if (data.lpDetails?.isLPUsed) productionCount++;
    if (data.fsDetails?.isFSUsed) productionCount++;
    if (data.embDetails?.isEMBUsed) productionCount++;
    if (data.screenPrintDetails?.isScreenPrintUsed || data.screenPrint?.isScreenPrintUsed) productionCount++;
    if (data.digiDetails?.isDigiUsed) productionCount++;
    if (data.jobDetails?.jobType === "Notebook" && data.notebookDetails?.isNotebookUsed) productionCount++;
    
    let postProductionCount = 0;
    if (data.preDieCutting?.isPreDieCuttingUsed) postProductionCount++;
    if (data.dieCutting?.isDieCuttingUsed) postProductionCount++;
    if (data.postDC?.isPostDCUsed) postProductionCount++;
    if (data.foldAndPaste?.isFoldAndPasteUsed) postProductionCount++;
    if (data.dstPaste?.isDstPasteUsed) postProductionCount++;
    if (data.magnet?.isMagnetUsed) postProductionCount++;
    if (data.qc?.isQCUsed) postProductionCount++;
    if (data.packing?.isPackingUsed) postProductionCount++;
    if (data.misc?.isMiscUsed) postProductionCount++;
    if (data.sandwich?.isSandwichComponentUsed) postProductionCount++;
    
    return { paperCount, productionCount, postProductionCount };
  };

  const serviceCounts = getServiceCounts();

  // Calculate total production cost
  const calculateProductionTotal = () => {
    if (!calculations) return 0;
    
    let total = 0;
    if (calculations.lpCostPerCard) total += parseFloat(calculations.lpCostPerCard);
    if (calculations.fsCostPerCard) total += parseFloat(calculations.fsCostPerCard);
    if (calculations.embCostPerCard) total += parseFloat(calculations.embCostPerCard);
    if (calculations.screenPrintCostPerCard) total += parseFloat(calculations.screenPrintCostPerCard);
    if (calculations.digiCostPerCard) total += parseFloat(calculations.digiCostPerCard);
    if (calculations.notebookCostPerCard) total += parseFloat(calculations.notebookCostPerCard);
    
    return total;
  };

  // Calculate total post-production cost
  const calculatePostProductionTotal = () => {
    if (!calculations) return 0;
    
    let total = 0;
    if (calculations.preDieCuttingCostPerCard) total += parseFloat(calculations.preDieCuttingCostPerCard);
    if (calculations.dieCuttingCostPerCard) total += parseFloat(calculations.dieCuttingCostPerCard);
    if (calculations.postDCCostPerCard) total += parseFloat(calculations.postDCCuttingCostPerCard);
    if (calculations.foldAndPasteCostPerCard) total += parseFloat(calculations.foldAndPasteCostPerCard);
    if (calculations.dstPasteCostPerCard) total += parseFloat(calculations.dstPasteCostPerCard);
    if (calculations.magnetCostPerCard) total += parseFloat(calculations.magnetCostPerCard);
    if (calculations.qcCostPerCard) total += parseFloat(calculations.qcCostPerCard);
    if (calculations.packingCostPerCard) total += parseFloat(calculations.packingCostPerCard);
    if (calculations.miscCostPerCard) total += parseFloat(calculations.miscCostPerCard);
    if (calculations.sandwichCostPerCard) total += parseFloat(calculations.sandwichCostPerCard);
    
    return total;
  };

  // Render Paper and Cutting section
  const renderPaperAndCuttingSection = () => {
    if (!calculations || serviceCounts.paperCount === 0) {
      return (
        <CollapsibleSection
          title="Paper & Cutting"
          icon={FileText}
          count={0}
          totalValue={0}
          isExpanded={expandedSections.paperCutting}
          onToggle={() => toggleSection('paperCutting')}
        >
          <div className="text-sm text-gray-500 italic py-2">No paper & cutting services</div>
        </CollapsibleSection>
      );
    }
    
    return (
      <CollapsibleSection
        title="Paper & Cutting"
        icon={FileText}
        count={serviceCounts.paperCount}
        totalValue={calculations.paperAndCuttingCostPerCard}
        isExpanded={expandedSections.paperCutting}
        onToggle={() => toggleSection('paperCutting')}
      >
        {calculations.paperCostPerCard && (
          <CostItem label="Paper Cost" value={calculations.paperCostPerCard} isSubItem />
        )}
        {calculations.gilCutCostPerCard && (
          <CostItem label="Gil Cutting Labor" value={calculations.gilCutCostPerCard} isSubItem />
        )}
        {calculations.paperAndCuttingCostPerCard && (
          <CostItem 
            label="Total Paper & Cutting" 
            value={calculations.paperAndCuttingCostPerCard}
            isTotal
          />
        )}
      </CollapsibleSection>
    );
  };

  // Render Production Services section
  const renderProductionServices = () => {
    if (!calculations || serviceCounts.productionCount === 0) {
      return (
        <CollapsibleSection
          title="Production Services"
          icon={Settings}
          count={0}
          totalValue={0}
          isExpanded={expandedSections.production}
          onToggle={() => toggleSection('production')}
        >
          <div className="text-sm text-gray-500 italic py-2">No production services</div>
        </CollapsibleSection>
      );
    }
    
    return (
      <CollapsibleSection
        title="Production Services"
        icon={Settings}
        count={serviceCounts.productionCount}
        totalValue={calculateProductionTotal()}
        isExpanded={expandedSections.production}
        onToggle={() => toggleSection('production')}
      >
        {/* LP Section */}
        {data.lpDetails?.isLPUsed && calculations.lpCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Letter Press (LP)" value={calculations.lpCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.lpPlateCostPerCard && <CostItem label="Plate" value={calculations.lpPlateCostPerCard} isSubItem />}
              {calculations.lpImpressionCostPerCard && <CostItem label="Impression" value={calculations.lpImpressionCostPerCard} isSubItem />}
              {calculations.lpPositiveFilmCostPerCard && <CostItem label="LP Positive Film" value={calculations.lpPositiveFilmCostPerCard} isSubItem />}
              {calculations.lpMRCostPerCard && <CostItem label="MR Cost" value={calculations.lpMRCostPerCard} isSubItem />}
              {calculations.lpMkgCostPerCard && <CostItem label="LP Making Cost" value={calculations.lpMkgCostPerCard} isSubItem />}
              {calculations.lpInkCostPerCard && <CostItem label="Ink" value={calculations.lpInkCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* FS Section */}
        {data.fsDetails?.isFSUsed && calculations.fsCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Foil Stamping (FS)" value={calculations.fsCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.fsBlockCostPerCard && <CostItem label="Block" value={calculations.fsBlockCostPerCard} isSubItem />}
              {calculations.fsFoilCostPerCard && <CostItem label="Foil" value={calculations.fsFoilCostPerCard} isSubItem />}
              {calculations.fsMRCostPerCard && <CostItem label="MR Cost" value={calculations.fsMRCostPerCard} isSubItem />}
              {calculations.fsImpressionCostPerCard && <CostItem label="Impression" value={calculations.fsImpressionCostPerCard} isSubItem />}
              {calculations.fsFreightCostPerCard && <CostItem label="FS Freight Cost" value={calculations.fsFreightCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* EMB Section */}
        {data.embDetails?.isEMBUsed && calculations.embCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Embossing (EMB)" value={calculations.embCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.embPlateCostPerCard && <CostItem label="Plate" value={calculations.embPlateCostPerCard} isSubItem />}
              {calculations.embImpressionCostPerCard && <CostItem label="Impression" value={calculations.embImpressionCostPerCard} isSubItem />}
              {calculations.embMRCostPerCard && <CostItem label="MR Cost" value={calculations.embMRCostPerCard} isSubItem />}
              {calculations.embMkgPlateCostPerCard && <CostItem label="EMB Making Plate" value={calculations.embMkgPlateCostPerCard} isSubItem />}
              {calculations.embPositiveFilmCostPerCard && <CostItem label="EMB Positive Film" value={calculations.embPositiveFilmCostPerCard} isSubItem />}
              {calculations.embDstMaterialCostPerCard && parseFloat(calculations.embDstMaterialCostPerCard) > 0 && (
                <CostItem label="EMB DST Material" value={calculations.embDstMaterialCostPerCard} isSubItem />
              )}
            </div>
          </div>
        )}
        
        {/* Screen Print Section */}
        {(data.screenPrintDetails?.isScreenPrintUsed || data.screenPrint?.isScreenPrintUsed) && calculations.screenPrintCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Screen Printing" value={calculations.screenPrintCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.screenPrintPerPieceCost && <CostItem label="Screen Print Per Piece" value={calculations.screenPrintPerPieceCost} isSubItem />}
              {calculations.screenPrintBaseCostPerCard && <CostItem label="Screen Print Base Cost" value={calculations.screenPrintBaseCostPerCard} isSubItem />}
              {calculations.screenPrintMRCostPerCard && <CostItem label="Screen Print MR Cost" value={calculations.screenPrintMRCostPerCard} isSubItem />}
            </div>
            {calculations.noOfColors && (
              <div className="text-xs text-gray-500 pl-2">Colors: {calculations.noOfColors}</div>
            )}
          </div>
        )}
        
        {/* Digital Printing Section */}
        {data.digiDetails?.isDigiUsed && calculations.digiCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Digital Printing" value={calculations.digiCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.digiPrintCostPerCard && <CostItem label="Print Cost" value={calculations.digiPrintCostPerCard} isSubItem />}
              {calculations.digiPaperCostPerCard && <CostItem label="Paper Cost" value={calculations.digiPaperCostPerCard} isSubItem />}
              {calculations.digiGilCutCostPerCard && <CostItem label="Digital Gil Cut Cost" value={calculations.digiGilCutCostPerCard} isSubItem />}
            </div>
            {calculations.totalFragsPerSheet && (
              <div className="text-xs text-gray-500 pl-2">Fragments per sheet: {calculations.totalFragsPerSheet}</div>
            )}
            {calculations.totalSheets && (
              <div className="text-xs text-gray-500 pl-2">Total sheets: {calculations.totalSheets}</div>
            )}
          </div>
        )}
        
        {/* Notebook Section */}
        {data.jobDetails?.jobType === "Notebook" && data.notebookDetails?.isNotebookUsed && calculations.notebookCostPerCard && (
          <div className="space-y-1">
            <CostItem label="Notebook" value={calculations.notebookCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.notebookPagesCostPerCard && <CostItem label="Pages" value={calculations.notebookPagesCostPerCard} isSubItem />}
              {calculations.notebookBindingCostPerCard && <CostItem label="Binding" value={calculations.notebookBindingCostPerCard} isSubItem />}
              {calculations.notebookGilCutCostPerCard && <CostItem label="Notebook GIL Cut Cost" value={calculations.notebookGilCutCostPerCard} isSubItem />}
            </div>
            {calculations.possibleNumberOfForma && (
              <div className="text-xs text-gray-500 pl-2">Forma per notebook: {calculations.possibleNumberOfForma}</div>
            )}
            {calculations.totalPages && (
              <div className="text-xs text-gray-500 pl-2">Total pages: {calculations.totalPages}</div>
            )}
            {calculations.totalFormaRequired && (
              <div className="text-xs text-gray-500 pl-2">Total forma required: {calculations.totalFormaRequired}</div>
            )}
            {calculations.totalSheets && (
              <div className="text-xs text-gray-500 pl-2">Total sheets: {calculations.totalSheets}</div>
            )}
          </div>
        )}
      </CollapsibleSection>
    );
  };

  // Render Post-Production Services section
  const renderPostProductionServices = () => {
    if (!calculations || serviceCounts.postProductionCount === 0) {
      return (
        <CollapsibleSection
          title="Post-Production"
          icon={Package}
          count={0}
          totalValue={0}
          isExpanded={expandedSections.postProduction}
          onToggle={() => toggleSection('postProduction')}
        >
          <div className="text-sm text-gray-500 italic py-2">No post-production services</div>
        </CollapsibleSection>
      );
    }
    
    return (
      <CollapsibleSection
        title="Post-Production"
        icon={Package}
        count={serviceCounts.postProductionCount}
        totalValue={calculatePostProductionTotal()}
        isExpanded={expandedSections.postProduction}
        onToggle={() => toggleSection('postProduction')}
      >
        {/* Pre Die Cutting Section */}
        {data.preDieCutting?.isPreDieCuttingUsed && calculations.preDieCuttingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Pre Die Cutting" value={calculations.preDieCuttingCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.preDieCuttingMRCostPerCard && <CostItem label="Pre Die Cutting MR Cost" value={calculations.preDieCuttingMRCostPerCard} isSubItem />}
              {calculations.preDieCuttingImpressionCostPerCard && <CostItem label="Pre Die Cutting Impression" value={calculations.preDieCuttingImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Die Cutting Section */}
        {data.dieCutting?.isDieCuttingUsed && calculations.dieCuttingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Die Cutting" value={calculations.dieCuttingCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.dieCuttingMRCostPerCard && <CostItem label="Die Cutting MR Cost" value={calculations.dieCuttingMRCostPerCard} isSubItem />}
              {calculations.dieCuttingImpressionCostPerCard && <CostItem label="Die Cutting Impression" value={calculations.dieCuttingImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Post Die Cutting Section */}
        {data.postDC?.isPostDCUsed && calculations.postDCCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Post Die Cutting" value={calculations.postDCCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.postDCMRCostPerCard && <CostItem label="Post DC MR Cost" value={calculations.postDCMRCostPerCard} isSubItem />}
              {calculations.postDCImpressionCostPerCard && <CostItem label="Post DC Impression" value={calculations.postDCImpressionCostPerCard} isSubItem />}
            </div>
          </div>
        )}
        
        {/* Fold and Paste Section */}
        {data.foldAndPaste?.isFoldAndPasteUsed && calculations.foldAndPasteCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Fold and Paste" value={calculations.foldAndPasteCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.dstMaterialCostPerCard && <CostItem label="DST Material Cost" value={calculations.dstMaterialCostPerCard} isSubItem />}
              {calculations.foldAndPasteOperationCostPerCard && <CostItem label="Fold & Paste Operation" value={calculations.foldAndPasteOperationCostPerCard} isSubItem />}
            </div>
            {calculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {calculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* DST Paste Section */}
        {data.dstPaste?.isDstPasteUsed && calculations.dstPasteCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="DST Paste" value={calculations.dstPasteCostPerCard} isTotal />
            {calculations.dstType && (
              <div className="text-xs text-gray-500 pl-2">DST Type: {calculations.dstType}</div>
            )}
            {calculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {calculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* Magnet Section */}
        {data.magnet?.isMagnetUsed && calculations.magnetCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Magnet" value={calculations.magnetCostPerCard} isTotal />
            {calculations.plateArea && (
              <div className="text-xs text-gray-500 pl-2">Plate Area: {calculations.plateArea} cm²</div>
            )}
            {calculations.fragsPerDie && (
              <div className="text-xs text-gray-500 pl-2">Fragments per die: {calculations.fragsPerDie}</div>
            )}
          </div>
        )}
        
        {/* QC Section */}
        {data.qc?.isQCUsed && calculations.qcCostPerCard && (
          <CostItem label="Quality Check" value={calculations.qcCostPerCard} isTotal />
        )}
        
        {/* Packing Section */}
        {data.packing?.isPackingUsed && calculations.packingCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Packing" value={calculations.packingCostPerCard} isTotal />
            {calculations.packingPercentage && (
              <div className="text-xs text-gray-500 pl-2">Packing: {calculations.packingPercentage}% of COGS</div>
            )}
          </div>
        )}
        
        {/* Misc Section */}
        {data.misc?.isMiscUsed && calculations.miscCostPerCard && (
          <div className="space-y-1 mb-2">
            <CostItem label="Miscellaneous" value={calculations.miscCostPerCard} isTotal />
            {calculations.miscChargeSource === "user" && (
              <div className="text-xs text-blue-600 pl-2">Custom charge</div>
            )}
            {calculations.miscChargeSource === "database" && (
              <div className="text-xs text-gray-600 pl-2">Standard charge</div>
            )}
          </div>
        )}
        
        {/* Sandwich/Duplex Section */}
        {data.sandwich?.isSandwichComponentUsed && calculations.sandwichCostPerCard && (
          <div className="space-y-1">
            <CostItem label="Duplex/Sandwich" value={calculations.sandwichCostPerCard} isTotal />
            <div className="grid grid-cols-1 gap-1">
              {calculations.sandwichPaperCostPerCard && <CostItem label="Sandwich Paper Cost" value={calculations.sandwichPaperCostPerCard} isSubItem />}
              {calculations.sandwichGilCutCostPerCard && <CostItem label="Sandwich Gil Cut Cost" value={calculations.sandwichGilCutCostPerCard} isSubItem />}
              {calculations.lpCostPerCardSandwich && <CostItem label="Sandwich LP Cost" value={calculations.lpCostPerCardSandwich} isSubItem />}
              {calculations.fsCostPerCardSandwich && <CostItem label="Sandwich FS Cost" value={calculations.fsCostPerCardSandwich} isSubItem />}
              {calculations.embCostPerCardSandwich && <CostItem label="Sandwich EMB Cost" value={calculations.embCostPerCardSandwich} isSubItem />}
            </div>
          </div>
        )}
      </CollapsibleSection>
    );
  };

  // Render Wastage and Overhead section
  const renderWastageAndOverhead = () => {
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Wastage & Overhead"
        icon={TrendingUp}
        count={3}
        isExpanded={expandedSections.wastageOverhead}
        onToggle={() => toggleSection('wastageOverhead')}
      >
        <CostItem label="Base Cost" value={calculations.baseCost} />
        {calculations.wastagePercentage && (
          <CostItem 
            label={`Wastage (${calculations.wastagePercentage}%)`} 
            value={calculations.wastageAmount || 0} 
          />
        )}
        {calculations.overheadPercentage && (
          <CostItem 
            label={`Overhead (${calculations.overheadPercentage}%)`} 
            value={calculations.overheadAmount || 0} 
          />
        )}
        <CostItem 
          label="COGS (Cost of Goods Sold)" 
          value={calculations.COGS}
          isTotal
        />
      </CollapsibleSection>
    );
  };

  // Render summary section
  const renderSummarySection = () => {
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Summary"
        icon={Calculator}
        isExpanded={expandedSections.summary}
        onToggle={() => toggleSection('summary')}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal per Item:</span>
            <span className="font-mono">₹{parseFloat(calculations.subtotalPerCard || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-blue-600">
            <span>Markup ({calculations.markupPercentage || 0}%):</span>
            <span className="font-mono">₹{parseFloat(calculations.markupAmount || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Cost per Item:</span>
            <span className="font-mono">₹{parseFloat(calculations.totalCostPerCard || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
            <span>Total ({data.jobDetails?.quantity || 0} pcs):</span>
            <span className="font-mono text-blue-600">₹{parseFloat(calculations.totalCost || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-green-600">
            <span>GST ({calculations.gstRate || 18}%):</span>
            <span className="font-mono">₹{parseFloat(calculations.gstAmount || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg border-t pt-2 bg-green-50 px-2 py-1 rounded">
            <span>Total with GST:</span>
            <span className="font-mono text-green-700">₹{parseFloat(calculations.totalWithGST || 0).toFixed(2)}</span>
          </div>
        </div>
      </CollapsibleSection>
    );
  };

  // If detailed costs cannot be viewed, show simplified summary
  if (!canViewDetailedCosts) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <DollarSign size={18} className="text-blue-600" />
          Cost Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-600">Cost per Item</div>
            <div className="text-xl font-bold text-gray-800">₹{parseFloat(calculations?.totalCostPerCard || 0).toFixed(2)}</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total ({data.jobDetails?.quantity || 0} pcs)</div>
            <div className="text-xl font-bold text-blue-700">₹{parseFloat(calculations?.totalCost || 0).toFixed(2)}</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-600">GST ({calculations?.gstRate || 18}%)</div>
            <div className="text-lg font-semibold text-green-600">₹{parseFloat(calculations?.gstAmount || 0).toFixed(2)}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm text-gray-700 font-medium">Total with GST</div>
            <div className="text-xl font-bold text-green-700">₹{parseFloat(calculations?.totalWithGST || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  }

  // If no calculations available
  if (!calculations) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
        <p className="text-red-600 text-sm">No cost calculations available.</p>
      </div>
    );
  }

  // Full detailed view with three columns layout
  return (
    <div className="space-y-3">
      {/* Three Column Layout for Service Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Paper and Cutting Section + Wastage & Overhead */}
        <div className="space-y-4">
          {renderPaperAndCuttingSection()}
          {renderWastageAndOverhead()}
        </div>
        
        {/* Column 2: Production Services Section */}
        <div>
          {renderProductionServices()}
        </div>
        
        {/* Column 3: Post-Production Services Section */}
        <div>
          {renderPostProductionServices()}
        </div>
      </div>

      {/* Summary Section - Full Width */}
      <div className="mt-4">
        {renderSummarySection()}
      </div>
    </div>
  );
};

export default CostDisplaySection;