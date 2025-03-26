export class Configuration {
    constructor(data = {}) {
        this.id = data.id || '';
        this.type = data.type || '';
        this.parameters = {
            wastagePercentage: data.parameters?.wastagePercentage || 5,
            overheadPercentage: data.parameters?.overheadPercentage || 35,
            defaultMarkupPercentage: data.parameters?.defaultMarkupPercentage || 15,
            miscChargePerCard: data.parameters?.miscChargePerCard || 5,
            // Additional parameters can be added here
        };
        this.effectiveFrom = data.effectiveFrom || new Date();
        this.effectiveTo = data.effectiveTo || null;
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedBy = data.updatedBy || '';
        this.updatedAt = data.updatedAt || new Date();
    }
}