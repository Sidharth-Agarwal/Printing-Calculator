import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calculator, Package, Settings, TrendingUp, FileText, DollarSign, Percent, Receipt } from 'lucide-react';

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
    markupSelection: true,
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
  const CollapsibleSection = ({ title, icon, count = 0, totalValue, isExpanded, onToggle, children, className = "" }) => (
    <div className={`border border-gray-200 rounded-lg overflow-hidden h-fit ${className}`}>
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
    if (calculations.postDCCostPerCard) total += parseFloat(calculations.postDCCostPerCard);
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

  // Render Wastage and Overhead section
  const renderWastageAndOverhead = () => {
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Wastage & Overhead"
        icon={TrendingUp}
        count={3}
        totalValue={calculations.COGS}
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

  // Render Markup Display section
  const renderMarkupDisplay = () => {
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Markup Applied"
        icon={Percent}
        count={1}
        totalValue={calculations.markupAmount}
        isExpanded={expandedSections.markupSelection}
        onToggle={() => toggleSection('markupSelection')}
        className="bg-blue-50"
      >
        <div className="space-y-2">
          {calculations.markupType && (
            <div className="space-y-1">
              <div className="text-sm text-gray-700 font-medium">
                Type: {calculations.markupType.replace('MARKUP ', '')}
              </div>
              <div className="text-sm text-gray-600">
                Rate: {calculations.markupPercentage || 0}%
              </div>
              <CostItem 
                label={`Markup Amount`}
                value={calculations.markupAmount || 0}
                isTotal
              />
            </div>
          )}
          
          {!calculations.markupType && (
            <div className="text-sm text-gray-500 italic py-2">
              No markup applied
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Render Final Cost Summary section
  const renderCostSummary = () => {
    if (!calculations) return null;
    
    return (
      <CollapsibleSection
        title="Final Summary"
        icon={Receipt}
        count={1}
        totalValue={calculations.totalWithGST}
        isExpanded={expandedSections.summary}
        onToggle={() => toggleSection('summary')}
        className="bg-green-50"
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <CostItem 
              label="Subtotal per Item"
              value={calculations.subtotalPerCard || 0}
            />
            
            <CostItem 
              label={`Markup (${calculations.markupPercentage || 0}%)`}
              value={calculations.markupAmount || 0}
              isSubItem
            />
            
            <CostItem 
              label="Cost per Item"
              value={calculations.totalCostPerCard || 0}
              isTotal
            />
            
            <CostItem 
              label={`Total (${data.jobDetails?.quantity || 0} pcs)`}
              value={calculations.totalCost || 0}
              isHighlight
            />
            
            <CostItem 
              label={`GST (${calculations.gstRate || 18}%)`}
              value={calculations.gstAmount || 0}
            />
            
            <CostItem 
              label="Total with GST"
              value={calculations.totalWithGST || 0}
              isHighlight
            />
          </div>
        </div>
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
      {/* Three Column Layout for ALL sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Paper & Cutting + Wastage & Overhead */}
        <div className="space-y-4">
          {renderPaperAndCuttingSection()}
          {renderWastageAndOverhead()}
        </div>
        
        {/* Column 2: Production Services */}
        <div className="space-y-4">
          {renderProductionServices()}
        </div>
        
        {/* Column 3: Post-Production Services + Markup Display + Final Summary */}
        <div className="space-y-4">
          {renderPostProductionServices()}
          {renderMarkupDisplay()}
          {renderCostSummary()}
        </div>
      </div>
    </div>
  );
};

export default CostDisplaySection;