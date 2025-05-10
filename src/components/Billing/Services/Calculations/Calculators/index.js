// Basic calculators
export { calculatePaperAndCuttingCosts } from './paperCalculator';

// Production service calculators
export { calculateLPCosts } from './productionCalculator/lpCalculator';
export { calculateFSCosts } from './productionCalculator/fsCalculator';
export { calculateEMBCosts } from './productionCalculator/embCalculator';
export { calculateScreenPrintCosts } from './productionCalculator/screenCalculator';
export { calculateDigiDetailsCosts } from './productionCalculator/digiCalculator';
export { calculateNotebookCosts } from './productionCalculator/notebookCalculator';

// Post-production service calculators
export { calculatePreDieCuttingCosts } from './postProductionCalculator/preDCCalculator';
export { calculateDieCuttingCosts } from './postProductionCalculator/dieCuttingCalculator';
export { calculatePostDCCosts } from './postProductionCalculator/postDCCalculator';
export { calculateFoldAndPasteCosts } from './postProductionCalculator/foldPastCalculator';
export { calculateDstPasteCosts } from './postProductionCalculator/dstCalculator';
export { calculateQCCosts } from './postProductionCalculator/qcCalculator';
export { calculatePackingCosts } from './postProductionCalculator/packingCalculator';
export { calculateMiscCosts } from './postProductionCalculator/miscCalculator';
export { calculateSandwichCosts } from './postProductionCalculator/sandwichCalculator';
export { calculateMagnetCosts } from './postProductionCalculator/magnetCalculator';

// Final calculators
export { calculateWastage } from './finalCalculator/wastageCalculator';
export { calculateOverhead } from './finalCalculator/overheadCalculator';
export { calculateMarkup, getAvailableMarkupTypes } from './finalCalculator/markupCalculator';
export { calculateGST } from './finalCalculator/gstCalculator';

// Export the main calculation function that orchestrates all individual calculators
export { performCalculations } from '../calculationsService';