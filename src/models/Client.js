export class Client {
    constructor(data = {}) {
        this.id = data.id || '';
        this.clientCode = data.clientCode || '';
        this.name = data.name || '';
        this.contactPerson = data.contactPerson || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.address = {
            line1: data.address?.line1 || '',
            line2: data.address?.line2 || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            postalCode: data.address?.postalCode || '',
            country: data.address?.country || ''
        };
        this.gstin = data.gstin || '';
        this.billingAddress = data.billingAddress || {};
        this.category = data.category || '';
        this.tags = data.tags || [];
        this.defaultMarkup = data.defaultMarkup || 0;
        this.paymentTerms = data.paymentTerms || '';
        this.creditLimit = data.creditLimit || 0;
        this.activeEstimates = data.activeEstimates || 0;
        this.activeOrders = data.activeOrders || 0;
        this.totalOrders = data.totalOrders || 0;
        this.lastOrderDate = data.lastOrderDate || new Date();
        this.totalSpend = data.totalSpend || 0;
        this.averageOrderValue = data.averageOrderValue || 0;
        this.recentOrders = data.recentOrders || [];
        this.notes = data.notes || '';
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedBy = data.updatedBy || '';
        this.updatedAt = data.updatedAt || new Date();
    }
}  