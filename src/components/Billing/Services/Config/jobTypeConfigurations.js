export const jobTypeConfigurations = {
    "Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Biz Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Envelope": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC","FOLD & PASTE", "QC", "PACKING", "MISC"],
        defaultValues: { /* Envelope-specific defaults */ }
    },
    "Seal": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "MISC"],
        defaultValues: { /* Seal-specific defaults */ }
    },
    "Magnet": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "MISC"],
        defaultValues: { /* Magnet-specific defaults */ }
    },
    "Packaging": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "FOLD & PASTE", "DST PASTE", "DUPLEX", "QC", "PACKING", "MISC"],
        defaultValues: { /* Packaging-specific defaults */ }
    },
    "Notebook": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "QC", "PACKING", "MISC"],
        defaultValues: { /* Notebook-specific defaults */ }
    },
    "Custom": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["DC", "POST DC", "FOLD & PASTE", "DST PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultValues: { /* Custom defaults - likely all enabled */ }
    }
};