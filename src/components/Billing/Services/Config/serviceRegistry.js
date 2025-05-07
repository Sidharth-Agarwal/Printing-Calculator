import LPDetails from '../../Sections/Production/LPDetails';
import FSDetails from '../../Sections/Production/FSDetails';
import EMBDetails from '../../Sections/Production/EMBDetails';
import DigiDetails from '../../Sections/Production/DigiDetails';
import ScreenPrint from '../../Sections/Production/ScreenPrint';
import NotebookDetails from '../../Sections/Production/NotebookDetails';
import DieCutting from '../../Sections/Post Production/DieCutting';
import PostDC from '../../Sections/Post Production/PostDC';
import FoldAndPaste from '../../Sections/Post Production/FoldAndPaste';
import Magnet from '../../Sections/Post Production/Magnet';
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
    title: "Letter Press (LP)",
    component: LPDetails,
    stateKey: "lpDetails",
    toggleField: "isLPUsed",
    group: "production"
  },
  "FS": {
    id: "fs",
    title: "Foil Stamping (FS)",
    component: FSDetails,
    stateKey: "fsDetails",
    toggleField: "isFSUsed",
    group: "production"
  },
  "EMB": {
    id: "emb",
    title: "Embossing (EMB)",
    component: EMBDetails,
    stateKey: "embDetails",
    toggleField: "isEMBUsed",
    group: "production"
  },
  "DIGI": {
    id: "digi",
    title: "Digital Printing",
    component: DigiDetails,
    stateKey: "digiDetails",
    toggleField: "isDigiUsed",
    group: "production"
  },
  "SCREEN": {
    id: "screenPrint",
    title: "Screen Printing",
    component: ScreenPrint,
    stateKey: "screenPrint",
    toggleField: "isScreenPrintUsed",
    group: "production"
  },
  "NOTEBOOK": {  // Add the new Notebook service
    id: "notebook",
    title: "Notebook Details",
    component: NotebookDetails,
    stateKey: "notebookDetails",
    toggleField: "isNotebookUsed",
    group: "production"
  },

  // Post-Production Services
  "DC": {
    id: "dieCutting",
    title: "Die Cutting",
    component: DieCutting,
    stateKey: "dieCutting",
    toggleField: "isDieCuttingUsed",
    group: "postProduction"
  },
  "POST DC": {
    id: "postDC",
    title: "Post Die Cutting",
    component: PostDC,
    stateKey: "postDC",
    toggleField: "isPostDCUsed",
    group: "postProduction"
  },
  "FOLD & PASTE": {
    id: "foldAndPaste",
    title: "Fold & Paste",
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
  "MAGNET": {
    id: "magnet",
    title: "MAGNET",
    component: Magnet,
    stateKey: "magnet",
    toggleField: "isMagnetUsed",
    group: "postProduction"
  },
  "QC": {
    id: "qc",
    title: "Quality Check",
    component: QC,
    stateKey: "qc",
    toggleField: "isQCUsed",
    group: "postProduction"
  },
  "PACKING": {
    id: "packing",
    title: "Packing",
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
    title: "Miscellaneous",
    component: Misc,
    stateKey: "misc",
    toggleField: "isMiscUsed",
    group: "postProduction"
  }
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