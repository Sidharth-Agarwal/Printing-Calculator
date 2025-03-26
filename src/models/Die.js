export class Die {
    constructor(data = {}) {
        this.id = data.id || '';
        this.jobType = data.jobType || '';
        this.type = data.type || '';
        this.dieCode = data.dieCode || '';
        this.frags = data.frags || 0;
        this.productSizeL = data.productSizeL || 0;
        this.productSizeB = data.productSizeB || 0;
        this.dieSizeL = data.dieSizeL || 0;
        this.dieSizeB = data.dieSizeB || 0;
        this.price = data.price || 0;
        this.imageUrl = data.imageUrl || '';
        this.inStock = data.inStock || false;
        this.location = data.location || '';
    }
}  