export const JOB_TYPE_OPTIONS = [
  "Card", 
  "Biz Card", 
  "Envelope", 
  "Seal", 
  "Magnet", 
  "Packaging", 
  "Notebook", 
  "Liner"
];

// Default die form data structure
export const DEFAULT_DIE_FORM_DATA = {
  jobType: "",
  type: "",
  dieCode: "",
  frags: "",
  productSizeL: "",
  productSizeB: "",
  dieSizeL: "",
  dieSizeB: "",
  dieSizeL_CM: "",
  dieSizeB_CM: "",
  plateSizeL: "",
  plateSizeB: "",
  clsdPrntSizeL_CM: "",
  clsdPrntSizeB_CM: "",
  imageUrl: "",
  isTemporary: false // New field for temporary dies
};

// Helper functions for die calculations
export const calculateCM = (inches) => {
  if (!inches || isNaN(inches)) return "";
  return (parseFloat(inches) * 2.54).toFixed(2);
};

// Function to calculate all derived fields
export const calculateDieValues = (dieData) => {
  return {
    ...dieData,
    dieSizeL_CM: dieData.dieSizeL_CM || calculateCM(dieData.dieSizeL),
    dieSizeB_CM: dieData.dieSizeB_CM || calculateCM(dieData.dieSizeB),
    plateSizeL: dieData.plateSizeL || dieData.productSizeL || "",
    plateSizeB: dieData.plateSizeB || dieData.productSizeB || "",
    clsdPrntSizeL_CM: dieData.clsdPrntSizeL_CM || calculateCM(dieData.productSizeL),
    clsdPrntSizeB_CM: dieData.clsdPrntSizeB_CM || calculateCM(dieData.productSizeB),
  };
};