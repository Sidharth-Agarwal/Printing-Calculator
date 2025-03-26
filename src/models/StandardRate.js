export class StandardRate {
    constructor(data = {}) {
        this.id = data.id || '';
        this.group = data.group || '';
        this.type = data.type || '';
        this.concatenate = data.concatenate || '';
        this.finalRate = data.finalRate || 0;
        this.description = data.description || '';
        this.effective = data.effective || new Date();
    }
}