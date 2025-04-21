import LPDetails from '../../Sections/Production/LPDetails';
import FSDetails from '../../Sections/Production/FSDetails';
import EMBDetails from '../../Sections/Production/EMBDetails';
import DigiDetails from '../../Sections/Production/DigiDetails';
import ScreenPrint from '../../Sections/Production/ScreenPrint';
import DieCutting from '../../Sections/Post Production/DieCutting';
import PostDC from '../../Sections/Post Production/PostDC';
import FoldAndPaste from '../../Sections/Post Production/FoldAndPaste';
import DstPaste from '../../Sections/Post Production/DstPaste';
import QC from '../../Sections/Post Production/QC';
import Packing from '../../Sections/Post Production/Packing';
import Sandwich from '../../Sections/Post Production/Sandwich';
import Misc from '../../Sections/Post Production/Misc';

// Define service registry
export const serviceRegistry = {
  // Production Services
  "LP": {
    id: "lp",
    title: "LETTER PRESS (LP)",
    component: LPDetails,
    stateKey: "lpDetails",
    toggleField: "isLPUsed",
    group: "production"
  },
  "FS": {
    id: "fs",
    title: "FOIL STAMPING (FS)",
    component: FSDetails,
    stateKey: "fsDetails",
    toggleField: "isFSUsed",
    group: "production"
  },
  "EMB": {
    id: "emb",
    title: "EMBOSSING (EMB)",
    component: EMBDetails,
    stateKey: "embDetails",
    toggleField: "isEMBUsed",
    group: "production"
  },
  "SCN": {
    id: "scn",
    title: "SCANNING (SCN)",
    component: null, // This would need to be created
    stateKey: "scanDetails",
    toggleField: "isScanUsed",
    group: "production"
  },
  "DIGI": {
    id: "digi",
    title: "DIGITAL PRINTING",
    component: DigiDetails,
    stateKey: "digiDetails",
    toggleField: "isDigiUsed",
    group: "production"
  },
  "SCREEN": {
    id: "screenPrint",
    title: "SCREEN PRINTING",
    component: ScreenPrint,
    stateKey: "screenPrint",
    toggleField: "isScreenPrintUsed",
    group: "production"
  },

  // Post-Production Services
  "DC": {
    id: "dieCutting",
    title: "DIE CUTTING",
    component: DieCutting,
    stateKey: "dieCutting",
    toggleField: "isDieCuttingUsed",
    group: "postProduction"
  },
  "POST DC": {
    id: "postDC",
    title: "POST DIE CUTTING",
    component: PostDC,
    stateKey: "postDC",
    toggleField: "isPostDCUsed",
    group: "postProduction"
  },
  "FOLD & PASTE": {
    id: "foldAndPaste",
    title: "FOLD & PASTE",
    component: FoldAndPaste,
    stateKey: "foldAndPaste",
    toggleField: "isFoldAndPasteUsed",
    group: "postProduction"
  },
  "DST PASTE": {
    id: "dstPaste",
    title: "DST PASTE",
    component: DstPaste,
    stateKey: "dstPaste",
    toggleField: "isDstPasteUsed",
    group: "postProduction"
  },
  "QC": {
    id: "qc",
    title: "QUALITY CHECK",
    component: QC,
    stateKey: "qc",
    toggleField: "isQCUsed",
    group: "postProduction"
  },
  "PACKING": {
    id: "packing",
    title: "PACKING",
    component: Packing,
    stateKey: "packing",
    toggleField: "isPackingUsed",
    group: "postProduction"
  },
  "DUPLEX": {
    id: "sandwich",
    title: "DUPLEX",
    component: Sandwich,
    stateKey: "sandwich",
    toggleField: "isSandwichComponentUsed",
    group: "postProduction"
  },
  "MISC": {
    id: "misc",
    title: "MISCELLANEOUS",
    component: Misc,
    stateKey: "misc",
    toggleField: "isMiscUsed",
    group: "postProduction"
  },
  
  // Note: DUPLEX uses the Sandwich component, so we don't need a separate SANDWICH entry
};

// Helper functions to get services by group
export const getProductionServices = () => {
  return Object.entries(serviceRegistry)
    .filter(([_, service]) => service.group === "production")
    .map(([key, _]) => key);
};

export const getPostProductionServices = () => {
  return Object.entries(serviceRegistry)
    .filter(([_, service]) => service.group === "postProduction")
    .map(([key, _]) => key);
};

export const getSpecialServices = () => {
  return Object.entries(serviceRegistry)
    .filter(([_, service]) => service.group === "special")
    .map(([key, _]) => key);
};