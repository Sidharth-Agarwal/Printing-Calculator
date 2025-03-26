export class Order {
    constructor(data = {}) {
        this.id = data.id || '';
        this.orderNumber = data.orderNumber || '';
        this.estimateId = data.estimateId || '';
        this.estimateNumber = data.estimateNumber || '';
        this.clientId = data.clientId || '';
        this.status = data.status || '';
    
        // Core client and project info (copied from estimate)
        this.clientName = data.clientName || '';
        this.projectName = data.projectName || '';
        this.date = data.date || new Date();
        this.deliveryDate = data.deliveryDate || new Date();
        this.productionDeadline = data.productionDeadline || new Date();
        this.actualDeliveryDate = data.actualDeliveryDate || new Date();
    
        // Job details (copied from estimate)
        this.jobDetails = data.jobDetails || {};
        this.dieDetails = data.dieDetails || {};
        this.lpDetails = data.lpDetails || {};
        this.fsDetails = data.fsDetails || {};
        this.embDetails = data.embDetails || {};
        this.digiDetails = data.digiDetails || {};
        this.dieCutting = data.dieCutting || {};
        this.sandwich = data.sandwich || {};
        this.pasting = data.pasting || {};
        this.calculations = data.calculations || {};
    
        // Production specific fields
        this.productionStatus = data.productionStatus || {};
        this.assignments = data.assignments || {};
        this.stageCompletionDates = data.stageCompletionDates || {};
        this.productionNotes = data.productionNotes || '';
    
        // Quality control
        this.qualityCheck = data.qualityCheck || {};
    
        // Delivery details
        this.delivery = data.delivery || {};
    
        // Order history
        this.history = data.history || [];
    
        // Order relationships
        this.orderSequence = data.orderSequence || 0;
        this.previousOrders = data.previousOrders || [];
        this.isReorder = data.isReorder || false;
        this.reorderSource = data.reorderSource || '';
    
        // Document relationships
        this.jobTicketId = data.jobTicketId || '';
        this.jobTicketNumber = data.jobTicketNumber || '';
        this.invoiceId = data.invoiceId || '';
        this.invoiceNumber = data.invoiceNumber || '';
    
        // Attachments and notes
        this.attachments = data.attachments || [];
        this.notes = data.notes || '';
        this.clientNotes = data.clientNotes || '';
        this.internalNotes = data.internalNotes || '';
    }
}