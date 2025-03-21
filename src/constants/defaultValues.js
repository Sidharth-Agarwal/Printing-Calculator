/**
 * Default values for form initialization
 */

export const initialFormState = {
    orderAndPaper: {
        clientName: "",
        projectName: "",
        date: new Date(),
        deliveryDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Default delivery date is 7 days from now
        return date;
        })(),
        jobType: "Card",
        quantity: "",
        paperProvided: "Yes",
        paperName: "",
        dieSelection: "",
        dieCode: "",
        dieSize: { length: "", breadth: "" },
        image: "",
    },
    lpDetails: {
        isLPUsed: false,
        noOfColors: 0,
        colorDetails: [],
    },
    fsDetails: {
        isFSUsed: false,
        fsType: "",
        foilDetails: [],
    },
    embDetails: {
        isEMBUsed: false,
        plateSizeType: "",
        plateDimensions: { length: "", breadth: "" },
        plateTypeMale: "",
        plateTypeFemale: "",
        embMR: "",
    },
    digiDetails: {
        isDigiUsed: false,
        digiDie: "",
        digiDimensions: { length: "", breadth: "" },
    },
    dieCutting: {
        isDieCuttingUsed: false,
        difficulty: "",
        pdc: "",
        dcMR: "",
    },
    sandwich: {
        isSandwichComponentUsed: false,
        lpDetailsSandwich: {
        isLPUsed: false,
        noOfColors: 0,
        colorDetails: [],
        },
        fsDetailsSandwich: {
        isFSUsed: false,
        fsType: "",
        foilDetails: [],
        },
        embDetailsSandwich: {
        isEMBUsed: false,
        plateSizeType: "",
        plateDimensions: { length: "", breadth: "" },
        plateTypeMale: "",
        plateTypeFemale: "",
        embMR: "",
        },
    },
    pasting: {
        isPastingUsed: false,
        pastingType: "",
    },
    calculations: null,
    isCalculating: false,
    calculationError: null
};

// Default form field values
export const DEFAULT_LP_COLOR = {
    plateSizeType: "Auto",
    plateDimensions: { length: "", breadth: "" },
    pantoneType: "",
    plateType: "Polymer Plate",
    mrType: "Simple"
};

export const DEFAULT_FS_FOIL = {
    blockSizeType: "Auto", 
    blockDimension: { length: "", breadth: "" },
    foilType: "Gold MTS 220",
    blockType: "Magnesium Block 3MM",
    mrType: "Simple"
};