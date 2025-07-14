import React from 'react';

const CostDisplaySection = ({ 
  data, 
  calculations, 
  canViewDetailedCosts = true,
  dataType = 'estimate'
}) => {
  if (!calculations) return null;
  
  // Function to format number values consistently
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "₹0.00";
    return `₹${parseFloat(value).toFixed(2)}`;
  };

  // Function to check if a section should be displayed
  const shouldDisplaySection = (serviceKey, toggleField) => {
    return data[serviceKey]?.[toggleField] === true;
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

  // Meta item for non-currency values
  const MetaItem = ({ label, value }) => {
    return (
      <div className="pl-4 text-xs text-gray-600">
        {label} {value}
      </div>
    );
  };

  // Render paper and cutting section
  const renderPaperAndCuttingSection = () => {
    if (!calculations.paperAndCuttingCostPerCard) return null;
    
    return (
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Paper & Cutting</h4>
        <div className="space-y-1">
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
        </div>
      </div>
    );
  };

  // Render production services section - ALL FIELDS COMPACT
  const renderProductionServices = () => {
    let hasAnyProductionService = false;
    const services = [];

    // LP Section
    if (shouldDisplaySection('lpDetails', 'isLPUsed') && calculations.lpCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="lp" className="space-y-1 mb-2">
          <CostItem label="Letter Press (LP)" value={calculations.lpCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.lpPlateCostPerCard && <CostItem label="Plate" value={calculations.lpPlateCostPerCard} isSubItem />}
            {calculations.lpImpressionCostPerCard && <CostItem label="Impression" value={calculations.lpImpressionCostPerCard} isSubItem />}
            {calculations.lpPositiveFilmCostPerCard && <CostItem label="Positive Film" value={calculations.lpPositiveFilmCostPerCard} isSubItem />}
            {calculations.lpMRCostPerCard && <CostItem label="MR Cost" value={calculations.lpMRCostPerCard} isSubItem />}
            {calculations.lpMkgCostPerCard && <CostItem label="Making Cost" value={calculations.lpMkgCostPerCard} isSubItem />}
            {calculations.lpInkCostPerCard && <CostItem label="Ink" value={calculations.lpInkCostPerCard} isSubItem />}
          </div>
        </div>
      );
    }

    // FS Section
    if (shouldDisplaySection('fsDetails', 'isFSUsed') && calculations.fsCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="fs" className="space-y-1 mb-2">
          <CostItem label="Foil Stamping (FS)" value={calculations.fsCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.fsBlockCostPerCard && <CostItem label="Block" value={calculations.fsBlockCostPerCard} isSubItem />}
            {calculations.fsFoilCostPerCard && <CostItem label="Foil" value={calculations.fsFoilCostPerCard} isSubItem />}
            {calculations.fsMRCostPerCard && <CostItem label="MR Cost" value={calculations.fsMRCostPerCard} isSubItem />}
            {calculations.fsImpressionCostPerCard && <CostItem label="Impression" value={calculations.fsImpressionCostPerCard} isSubItem />}
            {calculations.fsFreightCostPerCard && <CostItem label="Freight" value={calculations.fsFreightCostPerCard} isSubItem />}
          </div>
        </div>
      );
    }

    // EMB Section
    if (shouldDisplaySection('embDetails', 'isEMBUsed') && calculations.embCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="emb" className="space-y-1 mb-2">
          <CostItem label="Embossing (EMB)" value={calculations.embCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.embPlateCostPerCard && <CostItem label="Plate" value={calculations.embPlateCostPerCard} isSubItem />}
            {calculations.embImpressionCostPerCard && <CostItem label="Impression" value={calculations.embImpressionCostPerCard} isSubItem />}
            {calculations.embMRCostPerCard && <CostItem label="MR Cost" value={calculations.embMRCostPerCard} isSubItem />}
            {calculations.embMkgPlateCostPerCard && <CostItem label="Making Plate" value={calculations.embMkgPlateCostPerCard} isSubItem />}
            {calculations.embPositiveFilmCostPerCard && <CostItem label="Positive Film" value={calculations.embPositiveFilmCostPerCard} isSubItem />}
            {calculations.embDstMaterialCostPerCard && parseFloat(calculations.embDstMaterialCostPerCard) > 0 && (
              <CostItem label="DST Material" value={calculations.embDstMaterialCostPerCard} isSubItem />
            )}
          </div>
        </div>
      );
    }

    // Screen Print Section
    if (shouldDisplaySection('screenPrint', 'isScreenPrintUsed') && calculations.screenPrintCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="screen" className="space-y-1 mb-2">
          <CostItem label="Screen Printing" value={calculations.screenPrintCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.screenPrintPerPieceCost && <CostItem label="Per Piece" value={calculations.screenPrintPerPieceCost} isSubItem />}
            {calculations.screenPrintBaseCostPerCard && <CostItem label="Base Cost" value={calculations.screenPrintBaseCostPerCard} isSubItem />}
            {calculations.screenPrintMRCostPerCard && <CostItem label="MR Cost" value={calculations.screenPrintMRCostPerCard} isSubItem />}
          </div>
          {calculations.noOfColors && (
            <MetaItem label="Colors:" value={calculations.noOfColors} />
          )}
        </div>
      );
    }

    // Digital Printing Section
    if (shouldDisplaySection('digiDetails', 'isDigiUsed') && calculations.digiCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="digi" className="space-y-1 mb-2">
          <CostItem label="Digital Printing" value={calculations.digiCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.digiPrintCostPerCard && <CostItem label="Print Cost" value={calculations.digiPrintCostPerCard} isSubItem />}
            {calculations.digiPaperCostPerCard && <CostItem label="Paper Cost" value={calculations.digiPaperCostPerCard} isSubItem />}
            {calculations.digiGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.digiGilCutCostPerCard} isSubItem />}
          </div>
          {calculations.totalFragsPerSheet && (
            <MetaItem label="Fragments per sheet:" value={calculations.totalFragsPerSheet} />
          )}
          {calculations.totalSheets && (
            <MetaItem label="Total sheets:" value={calculations.totalSheets} />
          )}
        </div>
      );
    }

    // Notebook Section
    if (shouldDisplaySection('notebookDetails', 'isNotebookUsed') && calculations.notebookCostPerCard) {
      hasAnyProductionService = true;
      services.push(
        <div key="notebook" className="space-y-1">
          <CostItem label="Notebook" value={calculations.notebookCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.notebookPagesCostPerCard && <CostItem label="Pages" value={calculations.notebookPagesCostPerCard} isSubItem />}
            {calculations.notebookBindingCostPerCard && <CostItem label="Binding" value={calculations.notebookBindingCostPerCard} isSubItem />}
            {calculations.notebookGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.notebookGilCutCostPerCard} isSubItem />}
          </div>
          {calculations.possibleNumberOfForma && (
            <MetaItem label="Forma per notebook:" value={calculations.possibleNumberOfForma} />
          )}
          {calculations.totalPages && (
            <MetaItem label="Total pages:" value={calculations.totalPages} />
          )}
          {calculations.totalFormaRequired && (
            <MetaItem label="Total forma required:" value={calculations.totalFormaRequired} />
          )}
          {calculations.totalSheets && (
            <MetaItem label="Total sheets:" value={calculations.totalSheets} />
          )}
        </div>
      );
    }
    
    if (!hasAnyProductionService) return null;
    
    return (
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Production Services</h4>
        <div className="space-y-2">
          {services}
        </div>
      </div>
    );
  };

  // Render post-production services section - ALL FIELDS COMPACT
  const renderPostProductionServices = () => {
    let hasAnyPostProductionService = false;
    const services = [];

    // Pre Die Cutting
    if (shouldDisplaySection('preDieCutting', 'isPreDieCuttingUsed') && calculations.preDieCuttingCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="predc" className="space-y-1 mb-2">
          <CostItem label="Pre Die Cutting" value={calculations.preDieCuttingCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.preDieCuttingMRCostPerCard && <CostItem label="MR Cost" value={calculations.preDieCuttingMRCostPerCard} isSubItem />}
            {calculations.preDieCuttingImpressionCostPerCard && <CostItem label="Impression" value={calculations.preDieCuttingImpressionCostPerCard} isSubItem />}
          </div>
        </div>
      );
    }

    // Die Cutting
    if (shouldDisplaySection('dieCutting', 'isDieCuttingUsed') && calculations.dieCuttingCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="dc" className="space-y-1 mb-2">
          <CostItem label="Die Cutting" value={calculations.dieCuttingCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.dieCuttingMRCostPerCard && <CostItem label="MR Cost" value={calculations.dieCuttingMRCostPerCard} isSubItem />}
            {calculations.dieCuttingImpressionCostPerCard && <CostItem label="Impression" value={calculations.dieCuttingImpressionCostPerCard} isSubItem />}
          </div>
        </div>
      );
    }

    // Post Die Cutting
    if (shouldDisplaySection('postDC', 'isPostDCUsed') && calculations.postDCCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="postdc" className="space-y-1 mb-2">
          <CostItem label="Post Die Cutting" value={calculations.postDCCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.postDCMRCostPerCard && <CostItem label="MR Cost" value={calculations.postDCMRCostPerCard} isSubItem />}
            {calculations.postDCImpressionCostPerCard && <CostItem label="Impression" value={calculations.postDCImpressionCostPerCard} isSubItem />}
          </div>
        </div>
      );
    }

    // Fold and Paste
    if (shouldDisplaySection('foldAndPaste', 'isFoldAndPasteUsed') && calculations.foldAndPasteCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="foldpaste" className="space-y-1 mb-2">
          <CostItem label="Fold and Paste" value={calculations.foldAndPasteCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.dstMaterialCostPerCard && <CostItem label="DST Material" value={calculations.dstMaterialCostPerCard} isSubItem />}
            {calculations.foldAndPasteOperationCostPerCard && <CostItem label="Operation" value={calculations.foldAndPasteOperationCostPerCard} isSubItem />}
          </div>
          {calculations.fragsPerDie && (
            <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
          )}
        </div>
      );
    }

    // DST Paste
    if (shouldDisplaySection('dstPaste', 'isDstPasteUsed') && calculations.dstPasteCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="dstpaste" className="space-y-1 mb-2">
          <CostItem label="DST Paste" value={calculations.dstPasteCostPerCard} isTotal />
          {calculations.dstType && (
            <MetaItem label="DST Type:" value={calculations.dstType} />
          )}
          {calculations.fragsPerDie && (
            <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
          )}
        </div>
      );
    }

    // Magnet
    if (shouldDisplaySection('magnet', 'isMagnetUsed') && calculations.magnetCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="magnet" className="space-y-1 mb-2">
          <CostItem label="Magnet" value={calculations.magnetCostPerCard} isTotal />
          {calculations.plateArea && (
            <MetaItem label="Plate Area:" value={`${calculations.plateArea} cm²`} />
          )}
          {calculations.fragsPerDie && (
            <MetaItem label="Fragments per die:" value={calculations.fragsPerDie} />
          )}
        </div>
      );
    }

    // QC
    if (shouldDisplaySection('qc', 'isQCUsed') && calculations.qcCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <CostItem key="qc" label="Quality Check" value={calculations.qcCostPerCard} isTotal />
      );
    }

    // Packing
    if (shouldDisplaySection('packing', 'isPackingUsed') && calculations.packingCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="packing" className="space-y-1 mb-2">
          <CostItem label="Packing" value={calculations.packingCostPerCard} isTotal />
          {calculations.packingPercentage && (
            <MetaItem label={`Packing: ${calculations.packingPercentage}% of COGS`} value="" />
          )}
        </div>
      );
    }

    // Misc
    if (shouldDisplaySection('misc', 'isMiscUsed') && calculations.miscCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="misc" className="space-y-1 mb-2">
          <CostItem label="Miscellaneous" value={calculations.miscCostPerCard} isTotal />
          {calculations.miscChargeSource === "user" && (
            <MetaItem label="Custom charge" value="" />
          )}
          {calculations.miscChargeSource === "database" && (
            <MetaItem label="Standard charge" value="" />
          )}
        </div>
      );
    }

    // Sandwich/Duplex
    if (shouldDisplaySection('sandwich', 'isSandwichComponentUsed') && calculations.sandwichCostPerCard) {
      hasAnyPostProductionService = true;
      services.push(
        <div key="sandwich" className="space-y-1">
          <CostItem label="Duplex/Sandwich" value={calculations.sandwichCostPerCard} isTotal />
          <div className="grid grid-cols-3 gap-1">
            {calculations.sandwichPaperCostPerCard && <CostItem label="Paper" value={calculations.sandwichPaperCostPerCard} isSubItem />}
            {calculations.sandwichGilCutCostPerCard && <CostItem label="Gil Cut" value={calculations.sandwichGilCutCostPerCard} isSubItem />}
            {calculations.lpCostPerCardSandwich && <CostItem label="LP" value={calculations.lpCostPerCardSandwich} isSubItem />}
            {calculations.fsCostPerCardSandwich && <CostItem label="FS" value={calculations.fsCostPerCardSandwich} isSubItem />}
            {calculations.embCostPerCardSandwich && <CostItem label="EMB" value={calculations.embCostPerCardSandwich} isSubItem />}
          </div>
        </div>
      );
    }
    
    if (!hasAnyPostProductionService) return null;
    
    return (
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Post-Production</h4>
        <div className="space-y-2">
          {services}
        </div>
      </div>
    );
  };

  // Render wastage and overhead section
  const renderWastageAndOverhead = () => {
    if (!calculations.baseCost) return null;
    
    return (
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1 text-sm border-b pb-1">Wastage & Overhead</h4>
        <div className="space-y-1">
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
        </div>
      </div>
    );
  };

  // Render loyalty discount section
  const renderLoyaltyDiscount = () => {
    if (!calculations.loyaltyDiscount || !calculations.loyaltyDiscountAmount) {
      return null;
    }
    
    return (
      <div className="mt-2 border-t border-blue-100 pt-2">
        <div className="flex justify-between items-center text-blue-700 text-sm">
          <span className="font-medium">
            B2B Loyalty Discount ({calculations.loyaltyTierName || 'Member'}: {calculations.loyaltyDiscount}%):
          </span>
          <span className="font-medium">
            -{formatCurrency(calculations.loyaltyDiscountAmount)}
          </span>
        </div>
        
        {calculations.discountedTotalCost && (
          <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
            <span className="font-bold text-gray-700">Discounted Total:</span>
            <span className="font-bold text-blue-700">
              {formatCurrency(calculations.discountedTotalCost)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Compact cost summary for admin view
  const renderCostSummary = () => {
    if (!calculations) return null;
    
    return (
      <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal per Item:</span>
            <span className="font-mono">{formatCurrency(calculations.subtotalPerCard)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-blue-600">
            <span>Markup ({calculations.markupPercentage || 0}%):</span>
            <span className="font-mono">{formatCurrency(calculations.markupAmount)}</span>
          </div>
          
          <div className="flex justify-between font-semibold border-t pt-1">
            <span>Cost per Item:</span>
            <span className="font-mono">{formatCurrency(calculations.totalCostPerCard)}</span>
          </div>
          
          <div className="flex justify-between font-semibold text-lg border-t pt-1 mt-1">
            <span>Total ({data.jobDetails?.quantity || 0} pcs):</span>
            <span className="font-mono text-blue-600">{formatCurrency(calculations.totalCost)}</span>
          </div>
          
          {renderLoyaltyDiscount()}
          
          <div className="flex justify-between text-green-600">
            <span>GST ({calculations.gstRate || 18}%):</span>
            <span className="font-mono">{formatCurrency(calculations.gstAmount)}</span>
          </div>
          
          <div className="flex justify-between font-bold border-t pt-1 text-green-700">
            <span>Total with GST:</span>
            <span className="font-mono">{formatCurrency(calculations.totalWithGST)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Compact B2B cost summary
  const renderSimplifiedCostSummary = () => {
    if (!calculations) return null;
    
    const totalCostPerCard = parseFloat(calculations.totalCostPerCard || 0);
    const quantity = parseInt(data.jobDetails?.quantity || 0);
    const totalCost = parseFloat(calculations.totalCost || 0);
    const gstRate = calculations.gstRate || 18;
    const gstAmount = parseFloat(calculations.gstAmount || 0);
    const totalWithGST = parseFloat(calculations.totalWithGST || totalCost + gstAmount);
    
    const hasLoyaltyDiscount = calculations.loyaltyDiscount && calculations.loyaltyDiscountAmount;
    const loyaltyDiscount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscount) : 0;
    const loyaltyDiscountAmount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscountAmount) : 0;
    const discountedTotal = hasLoyaltyDiscount ? parseFloat(calculations.discountedTotalCost) : totalCost;
    
    return (
      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded border border-blue-200">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Cost Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-600">Cost per Item</div>
            <div className="text-lg font-bold text-gray-800">{formatCurrency(totalCostPerCard)}</div>
          </div>
          
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-600">Total ({quantity} pcs)</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(totalCost)}</div>
          </div>
          
          {hasLoyaltyDiscount && (
            <>
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="text-xs text-green-700">Loyalty Discount ({loyaltyDiscount}%)</div>
                <div className="text-md font-bold text-green-700">-{formatCurrency(loyaltyDiscountAmount)}</div>
              </div>
              
              <div className="bg-white p-2 rounded">
                <div className="text-xs text-gray-600">Discounted Total</div>
                <div className="text-lg font-bold text-blue-700">{formatCurrency(discountedTotal)}</div>
              </div>
            </>
          )}
          
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-600">GST ({gstRate}%)</div>
            <div className="text-md font-semibold text-green-600">{formatCurrency(gstAmount)}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-green-50 p-2 rounded border border-green-200">
            <div className="text-xs text-gray-700 font-medium">Total with GST</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(totalWithGST)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* For detailed costs view */}
      {canViewDetailedCosts && (
        <>
          {renderPaperAndCuttingSection()}
          {renderProductionServices()}
          {renderPostProductionServices()}
          {renderWastageAndOverhead()}
          {renderCostSummary()}
        </>
      )}
      
      {/* For simplified costs view (B2B) */}
      {!canViewDetailedCosts && renderSimplifiedCostSummary()}
    </div>
  );
};

export default CostDisplaySection;