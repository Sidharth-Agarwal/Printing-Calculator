export const jobTypeConfigurations = {
    "Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Liner": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Liner-specific defaults (same as Card) */ }
    },
    "Biz Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Envelope": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "QC", "PACKING", "MISC"],
        defaultValues: { /* Envelope-specific defaults */ }
    },
    "Seal": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "QC", "PACKING", "MISC"],
        defaultValues: { /* Seal-specific defaults */ }
    },
    "Magnet": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "MAGNET", "QC", "PACKING", "MISC"], // Added MAGNET service
        defaultValues: { /* Magnet-specific defaults */ }
    },
    "Packaging": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "DUPLEX", "QC", "PACKING", "MISC"],
        defaultValues: { /* Packaging-specific defaults */ }
    },
    "Notebook": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN", "NOTEBOOK"],
        postProductionServices: ["DC", "POST DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MAGNET", "MISC"],
        defaultValues: { /* Notebook-specific defaults */ }
    },
    "Custom": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "POST DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MAGNET", "MISC"],
        defaultValues: { /* Custom defaults - likely all enabled */ }
    }
};