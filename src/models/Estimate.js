export class Estimate {
    constructor(data = {}) {
        this.id = data.id || '';
        this.estimateNumber = data.estimateNumber || '';
        this.clientId = data.clientId || '';
        this.groupId = data.groupId || '';
        this.status = data.status || '';
        this.version = data.version || 1;
    
        // Core client and project info
        this.clientName = data.clientName || '';
        this.projectName = data.projectName || '';
        this.date = data.date || new Date();
        this.deliveryDate = data.deliveryDate || new Date();
        this.productionDeadline = data.productionDeadline || new Date();
    
        // Job details
        this.jobDetails = {
            jobType: data.jobDetails?.jobType || '',
            quantity: data.jobDetails?.quantity || 0,
            paperProvided: data.jobDetails?.paperProvided || '',
            paperName: data.jobDetails?.paperName || '',
            paperRefId: data.jobDetails?.paperRefId || ''
        };
    
        // Die details
        this.dieDetails = {
            dieId: data.dieDetails?.dieId || '',
            dieSelection: data.dieDetails?.dieSelection || '',
            dieCode: data.dieDetails?.dieCode || '',
            dieSize: {
            length: data.dieDetails?.dieSize?.length || 0,
            breadth: data.dieDetails?.dieSize?.breadth || 0
            },
            image: data.dieDetails?.image || ''
        };
    
        // Process details
        this.lpDetails = {
            isLPUsed: data.lpDetails?.isLPUsed || false,
            noOfColors: data.lpDetails?.noOfColors || 0,
            colorDetails: data.lpDetails?.colorDetails || []
        };
    
        this.fsDetails = {
            isFSUsed: data.fsDetails?.isFSUsed || false,
            fsType: data.fsDetails?.fsType || '',
            foilDetails: data.fsDetails?.foilDetails || []
        };
    
        this.embDetails = {
            isEMBUsed: data.embDetails?.isEMBUsed || false,
            plateSizeType: data.embDetails?.plateSizeType || '',
            plateDimensions: data.embDetails?.plateDimensions || { length: 0, breadth: 0 },
            plateTypeMale: data.embDetails?.plateTypeMale || '',
            plateTypeFemale: data.embDetails?.plateTypeFemale || '',
            embMR: data.embDetails?.embMR || ''
        };
    
        this.digiDetails = {
            isDigiUsed: data.digiDetails?.isDigiUsed || false,
            digiDie: data.digiDetails?.digiDie || '',
            digiDimensions: data.digiDetails?.digiDimensions || { length: 0, breadth: 0 }
        };
    
        this.dieCutting = {
            isDieCuttingUsed: data.dieCutting?.isDieCuttingUsed || false,
            difficulty: data.dieCutting?.difficulty || '',
            postDieCut: data.dieCutting?.postDieCut || '',
            dcMR: data.dieCutting?.dcMR || ''
        };
    
        this.sandwich = {
            isSandwichComponentUsed: data.sandwich?.isSandwichComponentUsed || false,
            lpDetailsSandwich: data.sandwich?.lpDetailsSandwich || {},
            fsDetailsSandwich: data.sandwich?.fsDetailsSandwich || {},
            embDetailsSandwich: data.sandwich?.embDetailsSandwich || {}
        };
    
        this.pasting = {
            isPastingUsed: data.pasting?.isPastingUsed || false,
            pastingType: data.pasting?.pastingType || ''
        };
    
        // Calculation results
        this.calculations = data.calculations || {};
    
        // Estimate history
        this.history = data.history || [];
    
        // Additional fields for management
        this.assignedTo = data.assignedTo || '';
        this.tags = data.tags || [];
        this.notes = data.notes || '';
        this.clientNotes = data.clientNotes || '';
        this.internalNotes = data.internalNotes || '';
        this.attachments = data.attachments || [];
    
        // Unique identification and relations
        this.orderNumber = data.orderNumber || '';
        this.jobTicketNumber = data.jobTicketNumber || '';
        this.invoiceNumber = data.invoiceNumber || '';
        this.isPartOfGroup = data.isPartOfGroup || false;
        this.relatedEstimates = data.relatedEstimates || [];
    
        // Metadata
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedBy = data.updatedBy || '';
        this.updatedAt = data.updatedAt || new Date();
    
        // For duplicate checking
        this.hash = data.hash || '';
    }
}