export const jobTypeConfigurations = {
    "Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "DUPLEX"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Biz Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING", "DUPLEX"],
        defaultValues: { /* Card-specific defaults */ }
    },
    "Envelope": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC","FOLD & PASTE", "QC", "PACKING"],
        defaultValues: { /* Envelope-specific defaults */ }
    },
    "Seal": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING"],
        defaultValues: { /* Seal-specific defaults */ }
    },
    "Magnet": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "DST PASTE", "QC", "PACKING"],
        defaultValues: { /* Magnet-specific defaults */ }
    },
    "Packaging": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "FOLD & PASTE", "DST PASTE", "DUPLEX", "QC", "PACKING"],
        defaultValues: { /* Packaging-specific defaults */ }
    },
    "Notebook": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "QC", "PACKING"],
        defaultValues: { /* Notebook-specific defaults */ }
    },
    "Custom": {
        productionServices: ["LP", "FS", "EMB", "DIGI"],
        postProductionServices: ["DC", "POST DC", "FOLD & PASTE", "DST PASTE", "QC", "PACKING", "DUPLEX"],
        defaultValues: { /* Custom defaults - likely all enabled */ }
    }
};