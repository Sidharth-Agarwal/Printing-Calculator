export class Tracking {
    constructor(data = {}) {
        this.id = data.id || '';
        this.prefix = data.prefix || '';
        this.sequence = data.sequence || 0;
        this.year = data.year || new Date().getFullYear();
        this.month = data.month || new Date().getMonth() + 1;
        this.clientId = data.clientId || '';
        this.clientCode = data.clientCode || '';
        this.jobType = data.jobType || '';
    
        // References
        this.type = data.type || '';
        this.referenceId = data.referenceId || '';
    
        // Status tracking
        this.status = data.status || '';
    
        // Quick reference data
        this.data = {
            clientName: data.data?.clientName || '',
            projectName: data.data?.projectName || '',
            date: data.data?.date || new Date(),
            amount: data.data?.amount || 0,
            quantity: data.data?.quantity || 0
        };
    
        // Metadata
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
}