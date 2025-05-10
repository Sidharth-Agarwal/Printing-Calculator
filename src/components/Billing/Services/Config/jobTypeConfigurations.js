export const jobTypeConfigurations = {
    "Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["QC", "PACKING"]
        },
        defaultValues: { /* Card-specific defaults */ }
    },
    "Liner": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["QC", "PACKING"]
        },
        defaultValues: { /* Liner-specific defaults (same as Card) */ }
    },
    "Biz Card": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["DC", "PRE DC", "QC", "PACKING"]
        },
        defaultValues: { /* Card-specific defaults */ }
    },
    "Envelope": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "QC", "PACKING", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["FOLD & PASTE", "DC", "QC", "PACKING"]
        },
        defaultValues: { /* Envelope-specific defaults */ }
    },
    "Seal": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "QC", "PACKING", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["FOLD & PASTE", "DC", "QC", "PACKING"]
        },
        defaultValues: { /* Seal-specific defaults */ }
    },
    "Magnet": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "MAGNET", "QC", "PACKING", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["FOLD & PASTE", "DC", "QC", "PACKING", "MAGNET"]
        },
        defaultValues: { /* Magnet-specific defaults */ }
    },
    "Packaging": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "FOLD & PASTE", "DUPLEX", "QC", "PACKING", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["FOLD & PASTE", "DC", "QC", "PACKING"]
        },
        defaultValues: { /* Packaging-specific defaults */ }
    },
    "Notebook": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN", "NOTEBOOK"],
        postProductionServices: ["PRE DC", "DC", "POST DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MAGNET", "MISC"],
        defaultActiveServices: {
            production: ["NOTEBOOK"],
            postProduction: ["QC", "PACKING"]
        },
        defaultValues: { /* Notebook-specific defaults */ }
    },
    "Custom": {
        productionServices: ["LP", "FS", "EMB", "DIGI", "SCREEN"],
        postProductionServices: ["PRE DC", "DC", "POST DC", "FOLD & PASTE", "QC", "PACKING", "DUPLEX", "MAGNET", "MISC"],
        defaultActiveServices: {
            production: [],
            postProduction: ["QC", "PACKING"]
        },
        defaultValues: { /* Custom defaults - likely all enabled */ }
    }
};