export class JobTicket {
    constructor(data = {}) {
        this.id = data.id || '';
        this.jobTicketNumber = data.jobTicketNumber || '';
        this.orderId = data.orderId || '';
        this.orderNumber = data.orderNumber || '';
        this.clientId = data.clientId || '';
        this.status = data.status || '';
    
        // Core details
        this.clientName = data.clientName || '';
        this.projectName = data.projectName || '';
        this.jobType = data.jobType || '';
        this.quantity = data.quantity || 0;
    
        // Production details
        this.paperDetails = {
            paperName: data.paperDetails?.paperName || '',
            paperProvided: data.paperDetails?.paperProvided || '',
            gsm: data.paperDetails?.gsm || 0,
            dimensions: data.paperDetails?.dimensions || { length: 0, breadth: 0 }
        };
    
        this.dieDetails = {
            dieCode: data.dieDetails?.dieCode || '',
            dieSize: data.dieDetails?.dieSize || { length: 0, breadth: 0 }
        };
    
        // Process checklist with detailed instructions
        this.processes = {
            lpRequired: data.processes?.lpRequired || false,
            fsRequired: data.processes?.fsRequired || false,
            embRequired: data.processes?.embRequired || false,
            digiRequired: data.processes?.digiRequired || false,
            dieCuttingRequired: data.processes?.dieCuttingRequired || false,
            sandwichRequired: data.processes?.sandwichRequired || false,
            pastingRequired: data.processes?.pastingRequired || false
        };
    
        // Process details - specific instructions for production
        this.lpInstructions = data.lpInstructions || {};
        this.fsInstructions = data.fsInstructions || {};
        this.embInstructions = data.embInstructions || {};
        this.digiInstructions = data.digiInstructions || {};
        this.dieCuttingInstructions = data.dieCuttingInstructions || {};
        this.sandwichInstructions = data.sandwichInstructions || {};
        this.pastingInstructions = data.pastingInstructions || {};
    
        // Production scheduling
        this.productionDeadline = data.productionDeadline || new Date();
        this.clientDeadline = data.clientDeadline || new Date();
    
        // Assignment and responsibilities
        this.assignedTo = data.assignedTo || '';
        this.assignedBy = data.assignedBy || '';
        this.assignedAt = data.assignedAt || new Date();
    
        // Production stages
        this.stages = data.stages || [];
    
        // Notes and attachments
        this.notes = data.notes || '';
        this.productionNotes = data.productionNotes || '';
        this.attachments = data.attachments || [];
    
        // History
        this.history = data.history || [];
    
        // Metadata
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedBy = data.updatedBy || '';
        this.updatedAt = data.updatedAt || new Date();
        this.completedAt = data.completedAt || new Date();
    }
}