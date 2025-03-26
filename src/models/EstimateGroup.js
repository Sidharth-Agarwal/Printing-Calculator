export class EstimateGroup {
    constructor(data = {}) {
        this.id = data.id || '';
        this.groupCode = data.groupCode || '';
        this.clientId = data.clientId || '';
        this.clientName = data.clientName || '';
        this.projectName = data.projectName || '';
        this.description = data.description || '';
        
        // Member estimates
        this.estimates = data.estimates || [
            {
            estimateId: '',
            estimateNumber: '',
            jobType: '',
            amount: 0,
            status: ''
            }
        ];
        
        // Summary data
        this.estimateCount = data.estimateCount || 0;
        this.totalValue = data.totalValue || 0;
        this.status = data.status || '';
    }
}