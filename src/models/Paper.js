export class Paper {
    constructor(data = {}) {
        this.id = data.id || '';
        this.paperName = data.paperName || '';
        this.company = data.company || '';
        this.gsm = data.gsm || 0;
        this.pricePerSheet = data.pricePerSheet || 0;
        this.length = data.length || 0;
        this.breadth = data.breadth || 0;
        this.freightPerKg = data.freightPerKg || 0;
        this.paperType = data.paperType || '';
        this.inStock = data.inStock || false;
        this.stockQuantity = data.stockQuantity || 0;
        this.ratePerGram = data.ratePerGram || 0;
        this.area = data.area || 0;
        this.oneSqcmInGram = data.oneSqcmInGram || 0;
        this.gsmPerSheet = data.gsmPerSheet || 0;
        this.freightPerSheet = data.freightPerSheet || 0;
        this.finalRate = data.finalRate || 0;
    }
}