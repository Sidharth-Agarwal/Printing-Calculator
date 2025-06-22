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
    if (value === null || value === undefined || value === "") return "₹ 0.00";
    return `₹ ${parseFloat(value).toFixed(2)}`;
  };

  // Function to check if a section should be displayed
  const shouldDisplaySection = (serviceKey, toggleField) => {
    return data[serviceKey]?.[toggleField] === true;
  };

  // Order of sections to ensure consistent display
  const productionSections = [
    { 
      key: 'LP', 
      label: 'Letter Press (LP)', 
      serviceKey: 'lpDetails', 
      toggleField: 'isLPUsed',
      bgColor: 'bg-blue-50',
      items: [
        { key: 'lpPlateCostPerCard', label: 'LP Plate Cost' },
        { key: 'lpPositiveFilmCostPerCard', label: 'LP Positive Film' },
        { key: 'lpMRCostPerCard', label: 'LP MR Cost' },
        { key: 'lpMkgCostPerCard', label: 'LP Making Cost' },
        { key: 'lpInkCostPerCard', label: 'LP Ink Cost' },
        { key: 'lpImpressionCostPerCard', label: 'LP Impression Cost' },
        // { key: 'lpDstMaterialCostPerCard', label: 'LP DST Material Cost' }
      ],
      totalKey: 'lpCostPerCard',
      totalLabel: 'Letter Press (LP)'
    },
    { 
      key: 'FS', 
      label: 'Foil Stamping (FS)', 
      serviceKey: 'fsDetails', 
      toggleField: 'isFSUsed',
      bgColor: 'bg-blue-50',
      items: [
        { key: 'fsBlockCostPerCard', label: 'FS Block Cost' },
        { key: 'fsFoilCostPerCard', label: 'FS Foil Cost' },
        { key: 'fsMRCostPerCard', label: 'FS MR Cost' },
        { key: 'fsImpressionCostPerCard', label: 'FS Impression Cost' },
        // { key: 'fsFreightCostPerCard', label: 'FS Freight Cost' }
      ],
      totalKey: 'fsCostPerCard',
      totalLabel: 'Foil Stamping (FS)'
    },
    { 
      key: 'EMB', 
      label: 'Embossing (EMB)', 
      serviceKey: 'embDetails', 
      toggleField: 'isEMBUsed',
      bgColor: 'bg-blue-50',
      items: [
        // { key: 'embPlateCostPerCard', label: 'EMB Plate Cost' },
        { key: 'embMRCostPerCard', label: 'EMB MR Cost' },
        { key: 'embMkgPlateCostPerCard', label: 'EMB Making Plate' },
        { key: 'embPositiveFilmCostPerCard', label: 'EMB Positive Film' },
        { key: 'embImpressionCostPerCard', label: 'EMB Impression Cost' },
        { key: 'embDstMaterialCostPerCard', label: 'EMB DST Material Cost' }
      ],
      totalKey: 'embCostPerCard',
      totalLabel: 'Embossing (EMB)'
    },
    { 
      key: 'SCREEN', 
      label: 'Screen Printing', 
      serviceKey: 'screenPrint', 
      toggleField: 'isScreenPrintUsed',
      bgColor: 'bg-blue-50',
      items: [
        { key: 'screenPrintPerPieceCost', label: 'Screen Print Per Piece' },
        { key: 'screenPrintBaseCostPerCard', label: 'Screen Print Base Cost' },
        { key: 'screenPrintMRCostPerCard', label: 'Screen Print MR Cost' }  // Add the new MR cost field
      ],
      metaItems: [
        { key: 'noOfColors', label: 'Number of Colors:' }
      ],
      totalKey: 'screenPrintCostPerCard',
      totalLabel: 'Screen Printing'
    },
    { 
      key: 'DIGI', 
      label: 'Digital Printing', 
      serviceKey: 'digiDetails', 
      toggleField: 'isDigiUsed',
      bgColor: 'bg-blue-50',
      items: [
        { key: 'digiPrintCostPerCard', label: 'Digital Print Cost' },
        { key: 'digiPaperCostPerCard', label: 'Digital Paper Cost' },
        { key: 'digiGilCutCostPerCard', label: 'Digital Gil Cut Cost' }
      ],
      metaItems: [
        { key: 'totalFragsPerSheet', label: 'Fragments per sheet:' },
        { key: 'totalSheets', label: 'Total sheets:' }
      ],
      totalKey: 'digiCostPerCard',
      totalLabel: 'Digital Printing'
    },
    { 
      key: 'NOTEBOOK', 
      label: 'Notebook', 
      serviceKey: 'notebookDetails', 
      toggleField: 'isNotebookUsed',
      bgColor: 'bg-blue-50',
      items: [
        { key: 'notebookPagesCostPerCard', label: 'Notebook Pages Cost' },
        { key: 'notebookBindingCostPerCard', label: 'Notebook Binding Cost' },
        { key: 'notebookGilCutCostPerCard', label: 'Notebook GIL Cut Cost' }
      ],
      metaItems: [
        { key: 'possibleNumberOfForma', label: 'Forma per notebook:' },
        { key: 'totalPages', label: 'Total pages:' },
        { key: 'totalFormaRequired', label: 'Total forma required:' },
        { key: 'totalSheets', label: 'Total sheets:' }
      ],
      totalKey: 'notebookCostPerCard',
      totalLabel: 'Notebook'
    }
  ];

  const postProductionSections = [
    { 
      key: 'PRE_DC', 
      label: 'Pre Die Cutting', 
      serviceKey: 'preDieCutting', 
      toggleField: 'isPreDieCuttingUsed',
      bgColor: 'bg-purple-50',
      items: [
        { key: 'preDieCuttingMRCostPerCard', label: 'Pre Die Cutting MR Cost' },
        { key: 'preDieCuttingImpressionCostPerCard', label: 'Pre Die Cutting Impression' }
      ],
      totalKey: 'preDieCuttingCostPerCard',
      totalLabel: 'Pre Die Cutting'
    },
    { 
      key: 'DC', 
      label: 'Die Cutting', 
      serviceKey: 'dieCutting', 
      toggleField: 'isDieCuttingUsed',
      bgColor: 'bg-purple-50',
      items: [
        { key: 'dieCuttingMRCostPerCard', label: 'Die Cutting MR Cost' },
        { key: 'dieCuttingImpressionCostPerCard', label: 'Die Cutting Impression' }
      ],
      totalKey: 'dieCuttingCostPerCard',
      totalLabel: 'Die Cutting'
    },
    { 
      key: 'POST_DC', 
      label: 'Post Die Cutting', 
      serviceKey: 'postDC', 
      toggleField: 'isPostDCUsed',
      bgColor: 'bg-purple-50',
      items: [
        { key: 'postDCMRCostPerCard', label: 'Post DC MR Cost' },
        { key: 'postDCImpressionCostPerCard', label: 'Post DC Impression' }
      ],
      totalKey: 'postDCCostPerCard',
      totalLabel: 'Post Die Cutting'
    },
    { 
      key: 'FOLD_PASTE', 
      label: 'Fold and Paste', 
      serviceKey: 'foldAndPaste', 
      toggleField: 'isFoldAndPasteUsed',
      bgColor: 'bg-purple-50',
      totalKey: 'foldAndPasteCostPerCard',
      totalLabel: 'Fold and Paste'
    },
    { 
      key: 'DST_PASTE', 
      label: 'DST Paste', 
      serviceKey: 'dstPaste', 
      toggleField: 'isDstPasteUsed',
      bgColor: 'bg-purple-50',
      totalKey: 'dstPasteCostPerCard',
      totalLabel: 'DST Paste'
    },
    { 
      key: 'QC', 
      label: 'Quality Check', 
      serviceKey: 'qc', 
      toggleField: 'isQCUsed',
      bgColor: 'bg-purple-50',
      totalKey: 'qcCostPerCard',
      totalLabel: 'Quality Check'
    },
    { 
      key: 'PACKING', 
      label: 'Packing', 
      serviceKey: 'packing', 
      toggleField: 'isPackingUsed',
      bgColor: 'bg-purple-50',
      totalKey: 'packingCostPerCard',
      totalLabel: 'Packing',
      meta: 'packingPercentage',
      metaLabel: 'Packing: {}% of COGS'
    },
    { 
      key: 'MISC', 
      label: 'Miscellaneous', 
      serviceKey: 'misc', 
      toggleField: 'isMiscUsed',
      bgColor: 'bg-purple-50',
      totalKey: 'miscCostPerCard',
      totalLabel: 'Miscellaneous'
    },
    { 
      key: 'SANDWICH', 
      label: 'Duplex/Sandwich', 
      serviceKey: 'sandwich', 
      toggleField: 'isSandwichComponentUsed',
      bgColor: 'bg-purple-50',
      items: [
        { key: 'sandwichPaperCostPerCard', label: 'Sandwich Paper Cost' },
        { key: 'lpCostPerCardSandwich', label: 'Sandwich LP Cost' },
        { key: 'fsCostPerCardSandwich', label: 'Sandwich FS Cost' },
        { key: 'embCostPerCardSandwich', label: 'Sandwich EMB Cost' }
      ],
      // Add a new metaItems array to display paper info
      metaItems: [
        { key: 'sandwichPaperName', label: 'Paper: ' }
      ],
      totalKey: 'sandwichCostPerCard',
      totalLabel: 'Duplex/Sandwich'
    }
  ];

  // Render a cost item row
  const CostItem = ({ label, value, isSubItem = false, isTotal = false }) => {
    return (
      <div className={`
        flex justify-between items-center py-1.5 px-2 rounded 
        ${isTotal ? 'font-bold bg-blue-50' : isSubItem ? 'pl-6 text-sm' : 'bg-white'}
      `}>
        <span>{label}</span>
        <span>{formatCurrency(value)}</span>
      </div>
    );
  };

  // Render a meta item (non-currency)
  const MetaItem = ({ label, value }) => {
    return (
      <div className="pl-6 text-sm text-gray-600">
        {label} {value}
      </div>
    );
  };

  // Render a section of costs
  const renderCostSection = (section) => {
    if (!shouldDisplaySection(section.serviceKey, section.toggleField)) {
      return null;
    }

    return (
      <div key={section.key} className="space-y-1 border-b pb-2 mb-2">
        <CostItem 
          label={section.totalLabel} 
          value={calculations[section.totalKey]} 
          isTotal 
        />
        
        {section.items?.map(item => (
          <CostItem 
            key={item.key} 
            label={item.label} 
            value={calculations[item.key]} 
            isSubItem 
          />
        ))}
        
        {section.metaItems?.map(item => (
          <MetaItem 
            key={item.key} 
            label={item.label} 
            value={calculations[item.key]} 
          />
        ))}
        
        {section.meta && calculations[section.meta] && (
          <MetaItem 
            label={section.metaLabel.replace('{}', calculations[section.meta])} 
            value="" 
          />
        )}
      </div>
    );
  };

  // Render paper and cutting section
  const renderPaperAndCuttingSection = () => {
    if (!calculations.paperAndCuttingCostPerCard) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">Paper and Cutting</h3>
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

  // Render production services section
  const renderProductionServices = () => {
    // Check if any production services are enabled
    const hasAnyProductionService = productionSections.some(section => 
      shouldDisplaySection(section.serviceKey, section.toggleField)
    );
    
    if (!hasAnyProductionService) {
      return null;
    }
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">Production Services</h3>
        <div className="space-y-3">
          {productionSections.map(section => renderCostSection(section))}
        </div>
      </div>
    );
  };

  // Render post-production services section
  const renderPostProductionServices = () => {
    // Check if any post-production services are enabled
    const hasAnyPostProductionService = postProductionSections.some(section => 
      shouldDisplaySection(section.serviceKey, section.toggleField)
    );
    
    if (!hasAnyPostProductionService) {
      return null;
    }
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">Post-Production Services</h3>
        <div className="space-y-3">
          {postProductionSections.map(section => renderCostSection(section))}
        </div>
      </div>
    );
  };

  // Render wastage and overhead section
  const renderWastageAndOverhead = () => {
    if (!calculations.baseCost) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">Wastage and Overhead</h3>
        <div className="space-y-1">
          <CostItem label="Base Cost" value={calculations.baseCost} />
          
          {calculations.wastagePercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Wastage ({calculations.wastagePercentage}%)</span>
              <span>{formatCurrency(calculations.wastageAmount)}</span>
            </div>
          )}
          
          {calculations.overheadPercentage && (
            <div className="flex justify-between items-center py-1.5 px-2">
              <span>Overhead ({calculations.overheadPercentage}%)</span>
              <span>{formatCurrency(calculations.overheadAmount)}</span>
            </div>
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

  // NEW: Render loyalty discount section
  const renderLoyaltyDiscount = () => {
    if (!calculations.loyaltyDiscount || !calculations.loyaltyDiscountAmount) {
      return null;
    }
    
    return (
      <div className="mt-2 border-t border-blue-100 pt-2">
        <div className="flex justify-between items-center text-blue-700">
          <span className="font-medium">
            B2B Loyalty Discount ({calculations.loyaltyTierName || 'Member'}: {calculations.loyaltyDiscount}%):
          </span>
          <span className="font-medium">
            -{formatCurrency(calculations.loyaltyDiscountAmount)}
          </span>
        </div>
        
        {calculations.discountedTotalCost && (
          <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
            <span className="text-lg font-bold text-gray-700">Discounted Total:</span>
            <span className="text-lg font-bold text-blue-700">
              {formatCurrency(calculations.discountedTotalCost)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render cost summary
  const renderCostSummary = () => {
    const calculations = data.calculations;
    if (!calculations) return null;
    
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-md border">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Cost Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Subtotal per Item:</span>
            <span className="text-gray-900">
              {formatCurrency(calculations.subtotalPerCard)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-blue-700 border-t border-gray-300 pt-2 mt-2">
            <span className="font-medium">
              Markup ({calculations.markupType?.replace('MARKUP ', '') || 'Standard'}: {calculations.markupPercentage || 0}%):
            </span>
            <span className="font-medium">
              {formatCurrency(calculations.markupAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
            <span className="text-lg font-bold text-gray-700">Total Cost per Item:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.totalCostPerCard)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
          <span className="text-lg font-bold text-gray-700">
            Total Cost ({data.jobDetails?.quantity || 0} pcs):
          </span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(calculations.totalCost)}
          </span>
        </div>
        
        {/* NEW: Loyalty Discount Section */}
        {renderLoyaltyDiscount()}
        
        {/* GST Section */}
        {calculations.gstRate && (
          <div className="flex justify-between items-center text-green-700 border-t border-gray-300 pt-2 mt-2">
            <span className="font-medium">
              GST ({calculations.gstRate || 18}%):
            </span>
            <span className="font-medium">
              {formatCurrency(calculations.gstAmount)}
            </span>
          </div>
        )}
        
        {/* Final Total with GST */}
        {calculations.totalWithGST && (
          <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3 mt-3">
            <span className="text-xl font-bold text-gray-700">
              Total with GST:
            </span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(calculations.totalWithGST)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Simplified B2B cost view
  const renderSimplifiedCostSummary = () => {
    const calculations = data.calculations;
    if (!calculations) return null;
    
    const totalCostPerCard = parseFloat(calculations.totalCostPerCard || 0);
    const quantity = parseInt(data.jobDetails?.quantity || 0);
    const totalCost = parseFloat(calculations.totalCost || 0);
    
    // Get GST info if available
    const gstRate = calculations.gstRate || 18;
    const gstAmount = parseFloat(calculations.gstAmount || 0);
    const totalWithGST = parseFloat(calculations.totalWithGST || totalCost + gstAmount);
    
    // Get markup info if available
    const markupPercentage = calculations.markupPercentage || 0;
    const markupType = calculations.markupType || 'Standard';
    
    // NEW: Get loyalty discount info
    const hasLoyaltyDiscount = calculations.loyaltyDiscount && calculations.loyaltyDiscountAmount;
    const loyaltyDiscount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscount) : 0;
    const loyaltyDiscountAmount = hasLoyaltyDiscount ? parseFloat(calculations.loyaltyDiscountAmount) : 0;
    const discountedTotal = hasLoyaltyDiscount ? parseFloat(calculations.discountedTotalCost) : totalCost;
    
    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Unit Cost:</span>
            <span className="font-bold">
              {formatCurrency(totalCostPerCard)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-blue-300 text-xl">
            <span className="font-bold text-gray-700">
              Total ({quantity} pcs):
            </span>
            <span className="font-bold text-blue-700">
              {formatCurrency(totalCost)}
            </span>
          </div>
          
          {/* NEW: B2B Loyalty Discount Section */}
          {hasLoyaltyDiscount && (
            <>
              <div className="flex justify-between items-center text-lg border-t border-blue-300 pt-3">
                <span className="font-medium text-green-700">
                  Your Loyalty Discount ({loyaltyDiscount}%):
                </span>
                <span className="font-bold text-green-700">
                  -{formatCurrency(loyaltyDiscountAmount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-lg border-t border-blue-300 pt-2">
                <span className="font-medium">Discounted Total:</span>
                <span className="font-bold text-blue-700">
                  {formatCurrency(discountedTotal)}
                </span>
              </div>
            </>
          )}
          
          {/* GST Section for B2B View */}
          <div className="flex justify-between items-center text-lg border-t border-blue-300 pt-3 mt-2">
            <span className="font-medium">GST ({gstRate}%):</span>
            <span className="font-bold">
              {formatCurrency(gstAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-xl">
            <span className="font-bold text-gray-800">
              Total with GST:
            </span>
            <span className="font-bold text-green-700">
              {formatCurrency(totalWithGST)}
            </span>
          </div>
        </div>
        
        {/* Hidden markup info - display read-only for transparency */}
        {markupType && markupType.includes('B2B') && (
          <div className="mt-4 pt-3 border-t border-blue-200 text-sm text-gray-600">
            <p>Using B2B pricing ({markupPercentage}% markup)</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
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