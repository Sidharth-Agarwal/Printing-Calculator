// Basic calculators
export { calculatePaperAndCuttingCosts } from './paperCalculator';

// Production service calculators
export { calculateLPCosts } from './productionCalculator/lpCalculator';
export { calculateFSCosts } from './productionCalculator/fsCalculator';
export { calculateEMBCosts } from './productionCalculator/embCalculator';
export { calculateScreenPrintCosts } from './productionCalculator/screenCalculator';
// export { calculateDigiDetailsCosts } from './productionCalculators/digiCalculator'; // To be implemented

// Post-production service calculators
export { calculateDieCuttingCosts } from './postProductionCalculator/dieCuttingCalculator';
export { calculatePostDCCosts } from './postProductionCalculator/postDCCalculator';
// export { calculateFoldAndPasteCosts } from './postProductionCalculators/foldAndPasteCalculator';
// export { calculateDstPasteCosts } from './postProductionCalculators/dstPasteCalculator';
export { calculateQCCosts } from './postProductionCalculator/qcCalculator';
export { calculatePackingCosts } from './postProductionCalculator/packingCalculator';
export { calculateMiscCosts } from './postProductionCalculator/miscCalculator';
// export { calculateSandwichCosts } from './postProductionCalculators/sandwichCalculator';

// Final calculators
export { calculateWastage } from './finalCalculator/wastageCalculator';
export { calculateOverhead } from './finalCalculator/overheadCalculator';
export { calculateMarkup, getAvailableMarkupTypes } from './finalCalculator/markupCalculator';

// Export the main calculation function that orchestrates all individual calculators
export { performCalculations } from '../calculationsService';