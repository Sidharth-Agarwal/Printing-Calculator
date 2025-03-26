export class Material {
    constructor(data = {}) {
        this.id = data.id || '';
        this.materialType = data.materialType || '';
        this.materialName = data.materialName || '';
        this.rate = data.rate || 0;
        this.quantity = data.quantity || 0;
        this.sizeL = data.sizeL || 0;
        this.sizeB = data.sizeB || 0;
        this.courier = data.courier || 0;
        this.markUp = data.markUp || 0;
        this.supplier = data.supplier || '';
        this.inStock = data.inStock || false;
        this.stockQuantity = data.stockQuantity || 0;
        this.reorderLevel = data.reorderLevel || 0;
        this.area = data.area || 0;
        this.landedCost = data.landedCost || 0;
        this.costPerUnit = data.costPerUnit || 0;
        this.finalCostPerUnit = data.finalCostPerUnit || 0;
    }
}  