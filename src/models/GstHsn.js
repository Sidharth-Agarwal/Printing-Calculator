export class GstHsn {
    constructor(data = {}) {
        this.id = data.id || '';
        this.hsnCode = data.hsnCode || '';
        this.description = data.description || '';
        this.gstRate = data.gstRate || 0;
        this.category = data.category || '';
        this.isActive = data.isActive || false;
        this.effectiveFrom = data.effectiveFrom || new Date();
        this.effectiveTo = data.effectiveTo || null;
    }
}